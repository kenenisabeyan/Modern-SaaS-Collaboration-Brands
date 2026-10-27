import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../socket.js';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Send, User, Users, X, Copy, Check, MonitorUp, ShieldBan, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

function RemoteVideoPlayer({ stream, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !stream) return undefined;

    el.srcObject = stream;
    el.play?.().catch(() => {});

    return () => {
      if (el.srcObject === stream) el.srcObject = null;
    };
  }, [stream]);

  return <video ref={ref} autoPlay playsInline className={className} />;
}

function addStreamTracksToPeer(pc, stream) {
  stream.getTracks().forEach((track) => {
    const alreadyAdded = pc.getSenders().some((sender) => sender.track?.id === track.id);
    if (!alreadyAdded) {
      pc.addTrack(track, stream);
    }
  });
}

function normalizeParticipants(list, selfSocketId) {
  if (!Array.isArray(list)) return [];

  return list
    .filter((participant) => participant.socketId && participant.socketId !== selfSocketId)
    .map((participant) => ({
      socketId: participant.socketId,
      username: participant.username || 'User',
      audioEnabled: participant.audioEnabled !== false,
      videoEnabled: participant.videoEnabled !== false,
      handRaised: participant.handRaised === true,
      isHost: Boolean(participant.isHost),
    }));
}

export default function MeetingRoom({ onLeave, roomId, notify }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [messages, setMessages] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [mediaError, setMediaError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isJoining, setIsJoining] = useState(true);

  const [isWaiting, setIsWaiting] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [waitingUsers, setWaitingUsers] = useState([]);
  const [joinDenied, setJoinDenied] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);

  const localVideoRef = useRef(null);
  const screenTrackRef = useRef(null);
  const peerConnections = useRef({});
  const pendingCandidates = useRef({});
  const messagesEndRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const acquireMediaRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!roomId) return undefined;

    const socket = getSocket();
    let cancelled = false;

    const closePeer = (socketId) => {
      const state = peerConnections.current[socketId];
      if (state?.pc) {
        try {
          state.pc.close();
        } catch {
          // noop
        }
      }

      delete peerConnections.current[socketId];
      delete pendingCandidates.current[socketId];
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    const closeAllPeers = () => {
      Object.keys(peerConnections.current).forEach(closePeer);
      peerConnections.current = {};
      pendingCandidates.current = {};
    };

    const stopLocalMedia = () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setLocalStream(null);
    };

    const addLocalTracksToAllPeers = (stream) => {
      Object.values(peerConnections.current).forEach(({ pc }) => addStreamTracksToPeer(pc, stream));
    };

    const flushPendingCandidates = async (socketId) => {
      const state = peerConnections.current[socketId];
      const queued = pendingCandidates.current[socketId] || [];
      if (!state?.pc?.remoteDescription || queued.length === 0) return;

      pendingCandidates.current[socketId] = [];
      for (const candidate of queued) {
        try {
          await state.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          if (!state.ignoreOffer) console.warn('Failed to add queued ICE candidate:', err);
        }
      }
    };

    const createPeerConnection = (targetSocketId) => {
      if (!targetSocketId || targetSocketId === socket.id) return null;
      if (peerConnections.current[targetSocketId]) return peerConnections.current[targetSocketId];

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const state = {
        pc,
        makingOffer: false,
        ignoreOffer: false,
        polite: String(socket.id || '') > String(targetSocketId),
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            targetSocketId,
            candidate: event.candidate,
            roomId,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        try {
          state.makingOffer = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', {
            targetSocketId,
            offer: pc.localDescription,
            roomId,
          });
        } catch (err) {
          console.warn('WebRTC negotiation failed:', err);
        } finally {
          state.makingOffer = false;
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!remoteStream) return;

        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: remoteStream,
        }));
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          closePeer(targetSocketId);
        }
      };

      const stream = mediaStreamRef.current;
      if (stream) addStreamTracksToPeer(pc, stream);

      peerConnections.current[targetSocketId] = state;
      return state;
    };

    const acquireLocalMedia = async () => {
      if (mediaStreamRef.current) return mediaStreamRef.current;

      try {
        setIsInitializing(true);
        setMediaError('');

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        const audioDevices = devices.filter((device) => device.kind === 'audioinput');

        const constraintSets = [
          {
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          },
          {
            video: {
              ...(videoDevices[0]?.deviceId ? { deviceId: { exact: videoDevices[0].deviceId } } : {}),
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            audio: {
              ...(audioDevices[0]?.deviceId ? { deviceId: { exact: audioDevices[0].deviceId } } : {}),
              echoCancellation: true,
              noiseSuppression: true,
            },
          },
          { video: true, audio: true },
          { video: true, audio: false },
        ];

        let stream = null;
        let lastMediaErr = null;
        for (const constraints of constraintSets) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (err) {
            lastMediaErr = err;
            console.warn('getUserMedia attempt failed:', err?.name || err);
          }
        }

        if (!stream && lastMediaErr) throw lastMediaErr;
        if (!stream) throw new Error('getUserMedia failed');

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return null;
        }

        mediaStreamRef.current = stream;
        setLocalStream(stream);
        setIsVideoOff(stream.getVideoTracks().length === 0 || !stream.getVideoTracks()[0].enabled);
        setIsMuted(stream.getAudioTracks().length === 0 || !stream.getAudioTracks()[0].enabled);
        addLocalTracksToAllPeers(stream);
        return stream;
      } catch (err) {
        console.error('Error accessing media devices:', err);
        let errorMessage = 'Failed to access camera/microphone.';
        if (err?.name === 'NotAllowedError') {
          errorMessage = 'Camera/microphone permission denied. Please allow access in your browser settings and retry.';
        } else if (err?.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. You can still stay in the meeting.';
        } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
          errorMessage = 'Camera is already in use. Close other apps or tabs using it, then retry.';
        } else if (err?.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints cannot be satisfied. Try again with default settings.';
        }

        if (!cancelled) {
          setMediaError(errorMessage);
          setLocalStream(null);
          notify?.('error', errorMessage);
        }

        return null;
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };
    acquireMediaRef.current = acquireLocalMedia;

    const syncParticipants = (list) => {
      const mapped = normalizeParticipants(list, socket.id);
      setParticipants(mapped);

      const liveSocketIds = new Set(mapped.map((participant) => participant.socketId));
      mapped.forEach((participant) => createPeerConnection(participant.socketId));

      Object.keys(peerConnections.current).forEach((socketId) => {
        if (!liveSocketIds.has(socketId)) closePeer(socketId);
      });
    };

    const requestJoin = () => {
      setIsJoining(true);
      socket.emit('join-room', {
        roomId,
        username: localStorage.getItem('username') || 'Guest',
        token: localStorage.getItem('token'),
      });
    };

    const handleOffer = async (data) => {
      const state = createPeerConnection(data.socketId);
      if (!state) return;

      const { pc } = state;
      const offerCollision = state.makingOffer || pc.signalingState !== 'stable';
      state.ignoreOffer = !state.polite && offerCollision;

      if (state.ignoreOffer) return;

      try {
        if (offerCollision) {
          await pc.setLocalDescription({ type: 'rollback' });
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        if (mediaStreamRef.current) addStreamTracksToPeer(pc, mediaStreamRef.current);
        await flushPendingCandidates(data.socketId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', {
          targetSocketId: data.socketId,
          answer: pc.localDescription,
          roomId,
        });
      } catch (err) {
        console.warn('Failed to handle WebRTC offer:', err);
      }
    };

    const handleAnswer = async (data) => {
      const state = peerConnections.current[data.socketId];
      if (!state?.pc) return;

      try {
        if (state.pc.signalingState === 'have-local-offer') {
          await state.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          await flushPendingCandidates(data.socketId);
        }
      } catch (err) {
        console.warn('Failed to handle WebRTC answer:', err);
      }
    };

    const handleIceCandidate = async (data) => {
      const state = createPeerConnection(data.socketId);
      if (!state?.pc || !data.candidate) return;

      if (!state.pc.remoteDescription) {
        pendingCandidates.current[data.socketId] = pendingCandidates.current[data.socketId] || [];
        pendingCandidates.current[data.socketId].push(data.candidate);
        return;
      }

      try {
        await state.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        if (!state.ignoreOffer) console.warn('Failed to add ICE candidate:', err);
      }
    };

    const onRoomJoined = (data) => {
      setIsJoining(false);
      setIsWaiting(false);
      setJoinDenied(false);
      setRoomNotFound(false);
      setIsHost(Boolean(data.isHost));
      syncParticipants(data.participants || []);
      acquireLocalMedia();
    };

    const onWaitingForHost = () => {
      setIsJoining(false);
      setIsWaiting(true);
      setIsHost(false);
      setIsInitializing(false);
    };

    const onJoinDenied = () => {
      setIsJoining(false);
      setIsWaiting(false);
      setJoinDenied(true);
      stopLocalMedia();
      closeAllPeers();
      notify?.('error', 'The host declined your request to join.');
    };

    const onRoomNotFound = () => {
      setIsJoining(false);
      setIsWaiting(false);
      setRoomNotFound(true);
      stopLocalMedia();
      closeAllPeers();
      notify?.('error', 'This meeting link is invalid or has ended.');
    };

    const onUserWaiting = (data) => {
      if (!data?.socketId) return;
      setWaitingUsers((prev) => {
        if (prev.some((user) => user.socketId === data.socketId)) return prev;
        return [...prev, data];
      });
      notify?.('success', `${data.username || 'A participant'} wants to join.`);
    };

    const onWaitingUsersList = (list) => {
      setWaitingUsers(Array.isArray(list) ? list : []);
    };

    const onUserJoined = (data) => {
      if (!data?.socketId || data.socketId === socket.id) return;

      setParticipants((prev) => {
        if (prev.some((participant) => participant.socketId === data.socketId)) return prev;
        return [
          ...prev,
          {
            socketId: data.socketId,
            username: data.username || 'User',
            audioEnabled: data.audioEnabled !== false,
            videoEnabled: data.videoEnabled !== false,
            isHost: Boolean(data.isHost),
          },
        ];
      });
      createPeerConnection(data.socketId);
    };

    const onUserLeft = (data) => {
      setParticipants((prev) => prev.filter((participant) => participant.socketId !== data.socketId));
      closePeer(data.socketId);
    };

    const onParticipantsList = (list) => {
      syncParticipants(list);
    };

    const onUserAudioToggled = ({ socketId, enabled }) => {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.socketId === socketId ? { ...participant, audioEnabled: enabled } : participant
        )
      );
    };

    const onUserVideoToggled = ({ socketId, enabled }) => {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.socketId === socketId ? { ...participant, videoEnabled: enabled } : participant
        )
      );
    };

    const onUserHandToggled = ({ socketId, handRaised }) => {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.socketId === socketId ? { ...participant, handRaised } : participant
        )
      );
      if (handRaised) {
        const p = participants.find((p) => p.socketId === socketId);
        if (p) {
          notify?.('info', `${p.username} raised their hand.`);
        }
      }
    };

    const onChatMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          isOwn: data.socketId === socket.id,
        },
      ]);
    };

    const onRoomError = (data) => {
      const message = data?.message || 'Meeting connection failed.';
      setIsJoining(false);
      setMediaError(message);
      notify?.('error', message);
    };

    const onForceMute = () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((track) => track.enabled = false);
        setIsMuted(true);
        getSocket().emit('toggle-audio', { roomId, enabled: false });
        notify?.('error', 'You have been muted by the host.');
      }
    };

    socket.on('connect', requestJoin);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('participants-list', onParticipantsList);
    socket.on('chat-message', onChatMessage);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('user-audio-toggled', onUserAudioToggled);
    socket.on('user-video-toggled', onUserVideoToggled);
    socket.on('user-hand-toggled', onUserHandToggled);
    socket.on('room-joined', onRoomJoined);
    socket.on('waiting-for-host', onWaitingForHost);
    socket.on('join-denied', onJoinDenied);
    socket.on('room-not-found', onRoomNotFound);
    socket.on('user-waiting', onUserWaiting);
    socket.on('waiting-users-list', onWaitingUsersList);
    socket.on('room-error', onRoomError);
    socket.on('admission-error', onRoomError);

    requestJoin();

    return () => {
      cancelled = true;
      socket.emit('leave-room', { roomId });

      socket.off('connect', requestJoin);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('participants-list', onParticipantsList);
      socket.off('chat-message', onChatMessage);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('user-audio-toggled', onUserAudioToggled);
      socket.off('user-video-toggled', onUserVideoToggled);
      socket.off('user-hand-toggled', onUserHandToggled);
      socket.off('room-joined', onRoomJoined);
      socket.off('waiting-for-host', onWaitingForHost);
      socket.off('join-denied', onJoinDenied);
      socket.off('room-not-found', onRoomNotFound);
      socket.off('user-waiting', onUserWaiting);
      socket.off('waiting-users-list', onWaitingUsersList);
      socket.off('room-error', onRoomError);
      socket.off('admission-error', onRoomError);

      stopLocalMedia();
      closeAllPeers();
      setParticipants([]);
      setWaitingUsers([]);
      setRemoteStreams({});
      setMessages([]);
      acquireMediaRef.current = null;
    };
  }, [roomId, notify]);

  useEffect(() => {
    if (isInitializing || mediaError || !localStream) return;
    const el = localVideoRef.current;
    if (!el) return;

    if (el.srcObject !== localStream) el.srcObject = localStream;
    el.play?.().catch(() => {});
  }, [localStream, isInitializing, mediaError, isVideoOff]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleMute = () => {
    const stream = localStream ?? mediaStreamRef.current;
    if (!stream) return;

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const nextMuted = !isMuted;
    audioTracks.forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
    getSocket().emit('toggle-audio', { roomId, enabled: !nextMuted });
  };

  const toggleVideo = async () => {
    const stream = localStream ?? mediaStreamRef.current;

    if (!stream || stream.getVideoTracks().length === 0) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        const videoTrack = newStream.getVideoTracks()[0];

        if (stream) {
          stream.addTrack(videoTrack);
          Object.values(peerConnections.current).forEach(({ pc }) => {
            const alreadyAdded = pc.getSenders().some((sender) => sender.track?.id === videoTrack.id);
            if (!alreadyAdded) pc.addTrack(videoTrack, stream);
          });
        } else {
          mediaStreamRef.current = newStream;
          setLocalStream(newStream);
          Object.values(peerConnections.current).forEach(({ pc }) => addStreamTracksToPeer(pc, newStream));
        }

        setMediaError('');
        setIsVideoOff(false);
        getSocket().emit('toggle-video', { roomId, enabled: true });
      } catch (err) {
        console.error('Failed to get video track:', err);
        notify?.('error', 'Could not turn camera on. Check browser permissions.');
      }
      return;
    }

    const videoTracks = stream.getVideoTracks();
    const nextVideoOff = !isVideoOff;
    videoTracks.forEach((track) => {
      track.enabled = !nextVideoOff;
    });
    setIsVideoOff(nextVideoOff);
    getSocket().emit('toggle-video', { roomId, enabled: !nextVideoOff });
  };

  const toggleHand = () => {
    const nextHandRaised = !isHandRaised;
    setIsHandRaised(nextHandRaised);
    getSocket().emit('toggle-hand', { roomId, handRaised: nextHandRaised });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      setIsScreenSharing(false);
      
      const videoTrack = mediaStreamRef.current?.getVideoTracks()[0];
      if (videoTrack) {
        Object.values(peerConnections.current).forEach(({ pc }) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });
      }
      if (localVideoRef.current && mediaStreamRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;
        setIsScreenSharing(true);
        
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          const videoTrack = mediaStreamRef.current?.getVideoTracks()[0];
          if (videoTrack) {
            Object.values(peerConnections.current).forEach(({ pc }) => {
              const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
              if (sender) sender.replaceTrack(videoTrack);
            });
          }
          if (localVideoRef.current && mediaStreamRef.current) {
            localVideoRef.current.srcObject = mediaStreamRef.current;
          }
        };
        
        Object.values(peerConnections.current).forEach(({ pc }) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        
        if (localVideoRef.current) {
          const tempStream = new MediaStream([screenTrack]);
          localVideoRef.current.srcObject = tempStream;
        }
      } catch (err) {
        console.error('Failed to share screen:', err);
      }
    }
  };

  const handleMuteAll = () => {
    getSocket().emit('mute-all-users', { roomId });
    notify?.('success', 'Muted all guests.');
  };

  const handleKickUser = (socketId) => {
    getSocket().emit('kick-user', { roomId, targetSocketId: socketId });
    notify?.('success', 'Participant removed.');
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        setCopied(true);
        notify?.('success', 'Meeting link copied.');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        notify?.('success', 'Meeting link copied.');
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleRetryCamera = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setLocalStream(null);
    setMediaError('');
    acquireMediaRef.current?.();
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    getSocket().emit('chat-message', {
      message: message.trim(),
      username: localStorage.getItem('username') || 'Guest',
      roomId,
      timestamp: new Date().toISOString(),
    });
    setMessage('');
  };

  const handleAdmit = (socketId) => {
    getSocket().emit('admit-user', { roomId, targetSocketId: socketId });
    setWaitingUsers((prev) => prev.filter((user) => user.socketId !== socketId));
  };

  const handleDeny = (socketId) => {
    getSocket().emit('deny-user', { roomId, targetSocketId: socketId });
    setWaitingUsers((prev) => prev.filter((user) => user.socketId !== socketId));
  };

  if (joinDenied) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 relative overflow-hidden font-sans">
        <div className="absolute bg-rose-600/10 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-6 z-10 max-w-md w-full mx-4 p-10 bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <X size={40} className="text-rose-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white light:text-slate-900 mb-2 tracking-tight">Entry Denied</h2>
            <p className="text-[#94A3B8] light:text-slate-500">The host declined your request to join.</p>
          </div>
          <button type="button" onClick={onLeave} className="w-full py-4 px-6 rounded-full font-semibold text-white light:text-slate-900 bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 transition-all hover:-translate-y-0.5">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (roomNotFound) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 relative overflow-hidden font-sans">
        <div className="absolute bg-rose-600/10 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-6 z-10 max-w-md w-full mx-4 p-10 bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <X size={40} className="text-rose-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white light:text-slate-900 mb-2 tracking-tight">Room Not Found</h2>
            <p className="text-[#94A3B8] light:text-slate-500">This meeting link is invalid or the meeting has ended.</p>
          </div>
          <button type="button" onClick={onLeave} className="w-full py-4 px-6 rounded-full font-semibold text-white light:text-slate-900 bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 transition-all hover:-translate-y-0.5">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 relative overflow-hidden font-sans">
        <div className="absolute bg-indigo-600/15 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-6 z-10 max-w-md w-full mx-4 p-10 bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
            <Users size={32} className="text-indigo-400 light:text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white light:text-slate-900 mb-2 tracking-tight">Waiting for Host</h2>
            <p className="text-[#94A3B8] light:text-slate-500">Please wait, the meeting host will let you in soon.</p>
          </div>
          <button type="button" onClick={onLeave} className="text-rose-400 hover:text-rose-300 mt-2 block mx-auto text-sm font-medium transition-colors hover:underline">
            Cancel & Return
          </button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 relative overflow-hidden font-sans">
        <div className="absolute bg-blue-600/15 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-6 z-10 max-w-md w-full mx-4 p-10 bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-l-2 border-indigo-500 rounded-full animate-[spin_1s_linear_infinite_reverse]"></div>
            <Video size={32} className="text-blue-400 light:text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white light:text-slate-900 mb-2 tracking-tight">Opening Meeting</h2>
            <p className="text-[#94A3B8] light:text-slate-500">Checking the room and connecting securely.</p>
          </div>
        </div>
      </div>
    );
  }

  const allParticipantsCount = participants.length + 1;
  const getGridClass = () => {
    if (allParticipantsCount === 1) return 'flex items-center justify-center';
    if (allParticipantsCount === 2) return 'grid grid-cols-1 md:grid-cols-2';
    if (allParticipantsCount <= 4) return 'grid grid-cols-1 md:grid-cols-2';
    if (allParticipantsCount <= 6) return 'grid grid-cols-1 md:grid-cols-3';
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 font-sans relative">
      {/* Background Blobs for main room */}
      <div className="absolute bg-purple-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-20%] left-[-10%] pointer-events-none"></div>
      <div className="absolute bg-blue-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-10%] right-[-10%] pointer-events-none"></div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${isChatOpen ? 'pr-0 md:pr-80' : 'pr-0'}`}>
        
        {/* Top Bar - Premium Glassmorphism */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-[#050816] light:from-slate-50 to-transparent">
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            {/* Left: Time */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <span className="text-sm sm:text-base font-semibold tracking-wide text-white light:text-slate-900 drop-shadow-md">{currentTime}</span>
            </div>

            {/* Right: Participant Count & Host Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isHost && participants.length > 0 && (
                <button
                  type="button"
                  onClick={handleMuteAll}
                  className="hidden sm:flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-full shadow-[0_4px_20px_rgba(244,63,94,0.15)] transition-all font-semibold text-sm"
                >
                  <MicOff size={16} />
                  <span>Mute All</span>
                </button>
              )}
              <div className="flex items-center space-x-2 bg-[#0A0F24]/80 light:bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 light:border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                <Users size={16} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white light:text-slate-900">{allParticipantsCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pt-20 sm:pt-24 md:pt-28 pb-32 sm:pb-28 md:pb-24 overflow-y-auto w-full h-full flex items-center justify-center">
          <div className={`${getGridClass()} gap-3 sm:gap-4 md:gap-6 w-full h-full max-w-7xl mx-auto`}>
            {/* Local Video */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
              className={`bg-[#0A0F24]/40 light:bg-white/60 backdrop-blur-md rounded-full md:rounded-3xl relative overflow-hidden flex items-center justify-center min-h-[160px] sm:min-h-[200px] md:min-h-[220px] border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] group ${allParticipantsCount === 1 ? 'max-w-4xl w-full aspect-video shadow-[0_0_50px_rgba(99,102,241,0.2)]' : ''}`}
            >
              {isInitializing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A0F24]/80 light:bg-white/90 backdrop-blur-sm">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400" />
                    <span className="text-indigo-300 text-sm font-medium">Initializing camera...</span>
                  </div>
                </div>
              )}

              {!isInitializing && mediaError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4 p-6 bg-[#0A0F24]/80 light:bg-white/90 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                    <VideoOff size={32} className="text-rose-400" />
                  </div>
                  <span className="text-rose-300 text-sm text-center font-medium max-w-[200px]">{mediaError}</span>
                  <button type="button" onClick={handleRetryCamera} className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 border border-indigo-500/50 rounded-full text-sm font-semibold transition-all">
                    Retry
                  </button>
                </div>
              )}

              {localStream && !mediaError && !isInitializing && (
                <>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full min-h-[200px] object-cover ${isVideoOff ? 'opacity-0 absolute inset-0 pointer-events-none' : ''}`}
                    style={{ transform: 'scaleX(-1)' }}
                    onError={() => setMediaError('Camera failed to load. Please check permissions.')}
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F24]/80 light:bg-white/90 backdrop-blur-md">
                      <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                        <User size={40} className="text-indigo-400" />
                      </div>
                    </div>
                  )}
                </>
              )}

              {isHandRaised && (
                <div className="absolute top-4 left-4 bg-yellow-500/90 text-white light:text-slate-900 p-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                  <Hand size={20} className="fill-current" />
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-[#050816]/90 light:bg-slate-50/90 backdrop-blur-xl text-white light:text-slate-900 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full flex items-center space-x-2 border border-white/10 light:border-slate-200 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                {isMuted && <MicOff size={14} className="text-rose-400" />}
                <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">You{isHost ? ' (Host)' : ''}</span>
              </div>
            </motion.div>

            {/* Remote Videos */}
            <AnimatePresence>
              {participants.map((participant) => {
                const remoteStream = remoteStreams[participant.socketId];
                return (
                  <motion.div
                    key={participant.socketId}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
                    className="bg-[#0A0F24]/40 light:bg-white/60 backdrop-blur-md rounded-full md:rounded-3xl relative overflow-hidden flex items-center justify-center group border border-white/10 light:border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.3)] aspect-video min-h-[160px] sm:min-h-[200px] md:min-h-[220px]"
                  >
                  {remoteStream && participant.videoEnabled !== false ? (
                    <RemoteVideoPlayer stream={remoteStream} className="w-full h-full min-h-[160px] sm:min-h-[200px] object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F24]/80 light:bg-white/90 backdrop-blur-md">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <span className="text-3xl md:text-4xl text-purple-400 font-bold">
                          {participant.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {participant.handRaised && (
                    <div className="absolute top-4 left-4 bg-yellow-500/90 text-white light:text-slate-900 p-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                      <Hand size={20} className="fill-current" />
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 bg-[#050816]/90 light:bg-slate-50/90 backdrop-blur-xl text-white light:text-slate-900 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full flex items-center space-x-2 border border-white/10 light:border-slate-200 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                    {participant.audioEnabled === false && <MicOff size={14} className="text-rose-400" />}
                    <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">{participant.username || 'User'}{participant.isHost ? ' (Host)' : ''}</span>
                  </div>
                  {isHost && !participant.isHost && (
                    <button
                      type="button"
                      onClick={() => handleKickUser(participant.socketId)}
                      className="absolute top-4 right-4 bg-rose-500/80 hover:bg-rose-500 text-white light:text-slate-900 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-rose-400/30 shadow-[0_4px_15px_rgba(244,63,94,0.4)]"
                      title="Remove participant"
                    >
                      <ShieldBan size={16} />
                    </button>
                  )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Waiting Room Panel (Host Only) */}
        {isHost && waitingUsers.length > 0 && (
          <div className="absolute top-20 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-[calc(100vw-2rem)] bg-[#0A0F24] light:bg-white shadow-none/95 light:shadow-xl backdrop-blur-2xl border border-indigo-500/30 light:border-indigo-200 rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.2)] p-5">
            <h3 className="text-white light:text-slate-900 font-bold mb-4 flex items-center text-sm sm:text-base tracking-wide">
              <span className="bg-indigo-500 text-xs px-2.5 py-1 rounded-full mr-3 shadow-[0_0_10px_rgba(99,102,241,0.4)]">{waitingUsers.length}</span>
              Waiting to join
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {waitingUsers.map((user) => (
                <div key={user.socketId} className="flex items-center justify-between bg-[#160B2A]/50 light:bg-slate-100 border border-white/5 light:border-slate-100 p-3 rounded-full hover:border-white/10 light:border-slate-200 transition-colors">
                  <span className="text-sm font-semibold text-slate-200 light:text-slate-700 truncate pr-2">{user.username}</span>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => handleDeny(user.socketId)} className="p-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20" title="Reject">
                      <X size={16} />
                    </button>
                    <button type="button" onClick={() => handleAdmit(user.socketId)} className="p-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20" title="Admit">
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Control Bar - Premium Glassmorphism */}
        <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#0A0F24]/80 light:bg-white/90 backdrop-blur-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-[2rem] flex items-center space-x-3 sm:space-x-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(124,58,237,0.15)] border border-white/10 light:border-slate-200">
            {/* Meeting Code & Copy Link (Host Only) */}
            {isHost && (
              <div className="flex items-center space-x-3 sm:space-x-4 pr-3 sm:pr-4 border-r border-white/10 light:border-slate-200">
                <div className="hidden sm:block">
                  <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">Meeting Code</p>
                  <p className="text-xs font-mono font-bold text-white light:text-slate-900">{roomId}</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleCopyLink} 
                  className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-semibold transition-all hover:scale-105 flex items-center space-x-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span className="hidden sm:inline">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Microphone */}
            <button 
              type="button" 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${
                isMuted 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-500/30' 
                  : 'bg-white/5 light:bg-slate-100 text-white light:text-slate-900 border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 hover:border-white/20'
              }`} 
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Camera */}
            <button 
              type="button" 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${
                isVideoOff 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-500/30' 
                  : 'bg-white/5 light:bg-slate-100 text-white light:text-slate-900 border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 hover:border-white/20'
              }`} 
              onClick={toggleVideo}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            {/* Screen Share */}
            <button 
              type="button" 
              className={`hidden sm:flex w-12 h-12 sm:w-14 sm:h-14 rounded-full items-center justify-center transition-all duration-300 border ${
                isScreenSharing 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:bg-indigo-500/30' 
                  : 'bg-white/5 light:bg-slate-100 text-white light:text-slate-900 border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 hover:border-white/20'
              }`} 
              onClick={toggleScreenShare}
              title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            >
              <MonitorUp size={20} />
            </button>

            {/* Raised Hand */}
            <button 
              type="button" 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${
                isHandRaised 
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:bg-yellow-500/30' 
                  : 'bg-white/5 light:bg-slate-100 text-white light:text-slate-900 border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 hover:border-white/20'
              }`} 
              onClick={toggleHand}
              title={isHandRaised ? 'Lower hand' : 'Raise hand'}
            >
              <Hand size={20} className={isHandRaised ? 'fill-current' : ''} />
            </button>

            {/* Leave Call */}
            <button 
              type="button" 
              className="px-6 h-12 sm:h-14 rounded-full flex items-center justify-center bg-purple-500 text-white light:text-slate-900 hover:from-rose-500 hover:to-rose-400 transition-all duration-300 shadow-[0_0_20px_rgba(225,29,72,0.4)] ml-2 hover:scale-105" 
              onClick={onLeave}
              title="Leave call"
            >
              <PhoneOff size={20} />
            </button>

            {/* Chat Toggle */}
            <button 
              type="button" 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 border relative ml-2 ${
                isChatOpen 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                  : 'bg-white/5 light:bg-slate-100 text-white light:text-slate-900 border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 hover:border-white/20'
              }`} 
              onClick={() => setIsChatOpen(!isChatOpen)}
              title="Toggle chat"
            >
              <MessageSquare size={20} />
              {messages.length > 0 && !isChatOpen && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-indigo-500 rounded-full text-[10px] sm:text-[11px] font-bold flex items-center justify-center border-2 border-[#0A0F24] shadow-lg">
                  {messages.length > 9 ? '9+' : messages.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar - Premium Glassmorphism */}
      <div
        className={`
        fixed md:absolute right-0 top-0 bottom-0 w-full md:w-[350px] bg-[#0A0F24]/90 light:bg-white/90 backdrop-blur-3xl md:border-l border-white/10 light:border-slate-200 flex flex-col z-40 transition-transform duration-500 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        {/* Chat Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 light:border-slate-200 bg-transparent">
          <span className="text-lg font-bold text-white light:text-slate-900 tracking-wide">Meeting Chat</span>
          <button 
            type="button" 
            className="text-slate-400 light:text-slate-500 hover:text-white light:text-slate-900 transition-colors p-2 rounded-full hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 border border-transparent hover:border-white/10 light:border-slate-200" 
            onClick={() => setIsChatOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Info Banner */}
        <div className="bg-indigo-500/10 p-4 text-[13px] text-indigo-200 border-b border-indigo-500/20 leading-relaxed font-medium">
          Messages can only be seen by people in the call and are deleted when the call ends.
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <MessageSquare size={48} className="text-indigo-400" />
              <p className="text-slate-300 light:text-slate-600 text-sm font-medium">No messages yet.<br/>Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={`${msg.timestamp}-${index}`} className={`flex flex-col space-y-1.5 w-full ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline space-x-2 px-1">
                  <span className="text-sm font-bold text-white light:text-slate-900">{msg.username}</span>
                  <span className="text-[11px] font-semibold text-slate-400 light:text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`text-[14px] p-3.5 shadow-md max-w-[85%] break-words leading-relaxed ${
                  msg.isOwn 
                    ? 'bg-indigo-500 text-white light:text-slate-900 rounded-full rounded-tr-sm shadow-[0_5px_15px_rgba(99,102,241,0.2)]' 
                    : 'bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 text-slate-200 light:text-slate-700 rounded-full rounded-tl-sm backdrop-blur-md'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-5 border-t border-white/10 light:border-slate-200 bg-transparent">
          <div className="relative flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-[#050816] light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-full pl-5 pr-14 py-4 text-sm text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) handleSendMessage();
              }}
            />
            <button 
              type="button" 
              className={`absolute right-2 p-2.5 rounded-full transition-all ${
                message.length > 0 
                  ? 'bg-indigo-500 text-white light:text-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-indigo-400 hover:scale-105' 
                  : 'text-slate-600 cursor-not-allowed bg-transparent'
              }`} 
              onClick={handleSendMessage} 
              disabled={message.length === 0}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


