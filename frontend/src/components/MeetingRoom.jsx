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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === 'm') {
        toggleMute();
      } else if (key === 'v') {
        toggleVideo();
      } else if (key === 'h') {
        toggleHand();
      } else if (key === 'c') {
        setIsChatOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted, isVideoOff, isHandRaised, localStream]);

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
      <div className="flex-1 flex items-center justify-center h-screen bg-[#F5F7FA] text-[#1E2761] relative overflow-hidden font-sans p-4">
        <div className="absolute bg-[#FF5A36]/5 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-5 sm:space-y-6 z-10 max-w-md w-full mx-auto p-6 sm:p-10 bg-white border border-[#E4E8EE] rounded-3xl shadow-xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF5A36]/10 text-[#FF5A36] rounded-full flex items-center justify-center mx-auto border border-[#FF5A36]/20 shadow-sm">
            <X size={32} className="text-[#FF5A36] sm:w-10 sm:h-10" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2761] mb-2 tracking-tight">Entry Denied</h2>
            <p className="text-sm sm:text-base text-slate-500">The host declined your request to join.</p>
          </div>
          <button type="button" onClick={onLeave} className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl font-bold text-sm sm:text-base text-white bg-[#1E2761] hover:bg-[#151A44] transition-all shadow-md cursor-pointer">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (roomNotFound) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#F5F7FA] text-[#1E2761] relative overflow-hidden font-sans p-4">
        <div className="absolute bg-[#FF5A36]/5 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-5 sm:space-y-6 z-10 max-w-md w-full mx-auto p-6 sm:p-10 bg-white border border-[#E4E8EE] rounded-3xl shadow-xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF5A36]/10 text-[#FF5A36] rounded-full flex items-center justify-center mx-auto border border-[#FF5A36]/20 shadow-sm">
            <X size={32} className="text-[#FF5A36] sm:w-10 sm:h-10" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2761] mb-2 tracking-tight">Room Not Found</h2>
            <p className="text-sm sm:text-base text-slate-500">This meeting link is invalid or the meeting has ended.</p>
          </div>
          <button type="button" onClick={onLeave} className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl font-bold text-sm sm:text-base text-white bg-[#1E2761] hover:bg-[#151A44] transition-all shadow-md cursor-pointer">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#F5F7FA] text-[#1E2761] relative overflow-hidden font-sans p-4">
        <div className="absolute bg-[#FF5A36]/5 blur-[140px] w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-5 sm:space-y-6 z-10 max-w-md w-full mx-auto p-6 sm:p-10 bg-white border border-[#E4E8EE] rounded-3xl shadow-xl">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-t-2 border-[#1E2761] rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-2 border-[#FF5A36] rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
            <Users size={28} className="text-[#FF5A36] sm:w-8 sm:h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2761] mb-2 tracking-tight">Waiting for Host</h2>
            <p className="text-sm sm:text-base text-slate-500">Please wait, the host will admit you shortly.</p>
          </div>
          <button type="button" onClick={onLeave} className="text-[#FF5A36] hover:underline mt-2 block mx-auto text-xs sm:text-sm font-bold transition-colors cursor-pointer">
            Cancel & Return
          </button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#F5F7FA] text-[#1E2761] relative overflow-hidden font-sans p-4">
        <div className="absolute bg-[#FF5A36]/5 blur-[140px] w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-5 sm:space-y-6 z-10 max-w-md w-full mx-auto p-6 sm:p-10 bg-white border border-[#E4E8EE] rounded-3xl shadow-xl">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-t-2 border-[#1E2761] rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-l-2 border-[#FF5A36] rounded-full animate-[spin_1s_linear_infinite_reverse]"></div>
            <Video size={28} className="text-[#FF5A36] sm:w-8 sm:h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2761] mb-2 tracking-tight">Connecting to Room</h2>
            <p className="text-sm sm:text-base text-slate-500">Establishing peer-to-peer encrypted WebRTC stream...</p>
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
    <div className="flex-1 flex h-screen overflow-hidden bg-[#F5F7FA] text-[#1E2761] font-sans relative selection:bg-[#FF5A36] selection:text-white">
      {/* Subtle Brand Ambiance */}
      <div className="absolute bg-[#FF5A36]/5 blur-[180px] w-[800px] h-[800px] rounded-full top-[-10%] left-[-10%] pointer-events-none"></div>
      <div className="absolute bg-[#1E2761]/5 blur-[180px] w-[700px] h-[700px] rounded-full bottom-[-10%] right-[-10%] pointer-events-none"></div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${isChatOpen ? 'pr-0 md:pr-96' : 'pr-0'}`}>
        
        {/* ========================================================
            TOP BAR: Floating Brand HUD
           ======================================================== */}
        <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-5 flex items-center justify-between">
          
          {/* Top-Left: Brand Badge & Meeting Code (mobile fallback) */}
          <div className="pointer-events-auto flex items-center space-x-2.5 bg-white/95 backdrop-blur-xl border border-[#E4E8EE] px-4 py-2 rounded-full text-[#1E2761] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF5A36] shrink-0"></span>
            <span className="font-extrabold text-xs tracking-wider uppercase text-[#1E2761]">WABISEMINAR</span>
            <span className="w-1 h-1 rounded-full bg-[#E4E8EE]"></span>
            <span className="font-mono text-xs text-slate-500 font-bold">{roomId}</span>
            <button 
              type="button" 
              onClick={handleCopyLink} 
              className="text-[#FF5A36] hover:text-[#E04826] transition-colors cursor-pointer p-0.5 ml-0.5 flex items-center justify-center"
              title="Copy meeting link"
            >
              {copied ? <Check size={14} className="text-[#FF5A36]" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Top-Right: Host Controls & Security Badge */}
          <div className="pointer-events-auto flex items-center space-x-2 sm:space-x-3">
            {isHost && participants.length > 0 && (
              <button
                type="button"
                onClick={handleMuteAll}
                className="flex items-center space-x-1.5 bg-[#FF5A36]/10 hover:bg-[#FF5A36]/20 text-[#FF5A36] border border-[#FF5A36]/25 px-3.5 py-1.5 rounded-full transition-all font-bold text-xs cursor-pointer shadow-xs"
              >
                <MicOff size={13} />
                <span>Mute All</span>
              </button>
            )}

            <div className="hidden sm:flex items-center space-x-1.5 bg-white/95 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-[#E4E8EE] text-xs font-bold text-[#1E2761] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
              <span>Encrypted P2P</span>
            </div>

            <div className="flex sm:hidden items-center space-x-1.5 bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-full border border-[#E4E8EE] text-xs font-bold text-[#1E2761] shadow-sm">
              <Users size={13} className="text-[#FF5A36]" />
              <span>{allParticipantsCount}</span>
            </div>
          </div>

        </header>

        {/* ========================================================
            VIDEO STAGE: Full Viewport Cinema Grid
           ======================================================== */}
        <main className="flex-1 p-2 sm:p-4 md:p-5 pt-16 sm:pt-20 pb-24 sm:pb-28 overflow-hidden w-full h-full flex items-center justify-center">
          <div className={`${getGridClass()} gap-3 sm:gap-4 w-full h-full max-w-[1780px] mx-auto`}>
            
            {/* Local Video Tile */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`bg-[#1E2761] rounded-2xl sm:rounded-3xl relative overflow-hidden flex items-center justify-center border border-[#151A44] shadow-md group w-full h-full ${
                allParticipantsCount === 1 
                  ? 'max-w-[1720px] max-h-[calc(100vh-130px)] aspect-video mx-auto' 
                  : 'aspect-video'
              }`}
            >
              {isInitializing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1E2761]/95 backdrop-blur-md">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#FF5A36]" />
                    <span className="text-[#FF5A36] text-xs font-bold uppercase tracking-wider">Starting camera...</span>
                  </div>
                </div>
              )}

              {!isInitializing && mediaError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-3 p-6 bg-[#1E2761]/95 backdrop-blur-md text-center">
                  <div className="w-14 h-14 rounded-full bg-[#FF5A36]/15 flex items-center justify-center border border-[#FF5A36]/30">
                    <VideoOff size={26} className="text-[#FF5A36]" />
                  </div>
                  <span className="text-white text-xs font-medium max-w-xs">{mediaError}</span>
                  <button type="button" onClick={handleRetryCamera} className="px-5 py-2 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-full text-xs font-bold transition-all shadow-md cursor-pointer">
                    Retry Camera
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
                    className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0 absolute inset-0 pointer-events-none' : ''}`}
                    style={{ transform: 'scaleX(-1)' }}
                    onError={() => setMediaError('Camera stream interrupted.')}
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E2761]">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FF5A36] text-white flex items-center justify-center border-4 border-[#151A44]/60 shadow-xl">
                        <span className="text-3xl sm:text-4xl font-extrabold text-white">
                          {(localStorage.getItem('username') || 'You')[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="mt-3 text-slate-300 text-xs font-semibold tracking-wide">Camera is off</span>
                    </div>
                  )}
                </>
              )}

              {/* Hand Raised Banner */}
              {isHandRaised && (
                <div className="absolute top-4 left-4 bg-[#FF5A36] text-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 text-xs font-bold animate-bounce z-20">
                  <Hand size={14} className="fill-current" />
                  <span>Hand Raised</span>
                </div>
              )}

              {/* Name Pill in Bottom-Left */}
              <div className="absolute bottom-4 left-4 bg-[#1E2761]/85 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full flex items-center space-x-2 border border-white/15 shadow-md z-10">
                {isMuted && <MicOff size={13} className="text-[#FF5A36]" />}
                <span>You{isHost ? ' (Host)' : ''}</span>
              </div>
            </motion.div>

            {/* Remote Participants Video Tiles */}
            <AnimatePresence>
              {participants.map((participant) => {
                const remoteStream = remoteStreams[participant.socketId];
                return (
                  <motion.div
                    key={participant.socketId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="bg-[#1E2761] rounded-2xl sm:rounded-3xl relative overflow-hidden flex items-center justify-center group border border-[#151A44] shadow-md aspect-video w-full h-full"
                  >
                    {remoteStream && participant.videoEnabled !== false ? (
                      <RemoteVideoPlayer stream={remoteStream} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E2761]">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FF5A36] text-white flex items-center justify-center border-4 border-[#151A44]/60 shadow-xl">
                          <span className="text-3xl sm:text-4xl text-white font-extrabold">
                            {participant.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="mt-3 text-slate-300 text-xs font-semibold tracking-wide">{participant.username || 'Participant'}</span>
                      </div>
                    )}
                    
                    {participant.handRaised && (
                      <div className="absolute top-4 left-4 bg-[#FF5A36] text-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 text-xs font-bold animate-bounce z-20">
                        <Hand size={14} className="fill-current" />
                        <span>Hand Raised</span>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 bg-[#1E2761]/85 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full flex items-center space-x-2 border border-white/15 shadow-md z-10">
                      {participant.audioEnabled === false && <MicOff size={13} className="text-[#FF5A36]" />}
                      <span>{participant.username || 'User'}{participant.isHost ? ' (Host)' : ''}</span>
                    </div>

                    {isHost && !participant.isHost && (
                      <button
                        type="button"
                        onClick={() => handleKickUser(participant.socketId)}
                        className="absolute top-4 right-4 bg-[#FF5A36] hover:bg-[#E04826] text-white p-2 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-[#FF5A36] shadow-sm cursor-pointer flex items-center justify-center"
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
        </main>

        {/* ========================================================
            WAITING ROOM PANEL (Host Only)
           ======================================================== */}
        {isHost && waitingUsers.length > 0 && (
          <div className="absolute top-16 sm:top-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-80 bg-white shadow-xl backdrop-blur-2xl border border-[#E4E8EE] rounded-3xl p-5 text-[#1E2761]">
            <h3 className="text-[#1E2761] font-bold mb-3 flex items-center text-sm tracking-wide">
              <span className="bg-[#FF5A36] text-white text-xs px-2 py-0.5 rounded-full mr-2 font-bold">{waitingUsers.length}</span>
              Waiting to Join
            </h3>
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {waitingUsers.map((user) => (
                <div key={user.socketId} className="flex items-center justify-between bg-[#F5F7FA] border border-[#E4E8EE] p-3 rounded-2xl">
                  <span className="text-xs sm:text-sm font-bold text-[#1E2761] truncate pr-2">{user.username}</span>
                  <div className="flex space-x-1.5">
                    <button type="button" onClick={() => handleDeny(user.socketId)} className="p-2 text-[#FF5A36] bg-[#FF5A36]/10 hover:bg-[#FF5A36]/20 border border-[#FF5A36]/25 rounded-xl transition-colors cursor-pointer flex items-center justify-center" title="Decline">
                      <X size={15} />
                    </button>
                    <button type="button" onClick={() => handleAdmit(user.socketId)} className="p-2 text-white bg-[#1E2761] hover:bg-[#151A44] rounded-xl transition-colors cursor-pointer flex items-center justify-center" title="Admit">
                      <Check size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            BOTTOM FLOATING CONTROLS DOCK (Strict 60-30-10 Brand Identity)
           ======================================================== */}
        
        {/* Bottom-Left: Meeting Info Pill */}
        <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-30 hidden lg:flex items-center space-x-2.5 bg-white/95 backdrop-blur-xl border border-[#E4E8EE] px-4 py-2.5 rounded-full text-[#1E2761] shadow-md">
          <span className="text-xs sm:text-sm font-extrabold tracking-wide text-[#1E2761]">{currentTime}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="font-mono text-xs font-bold text-slate-600">{roomId}</span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg text-[#FF5A36] hover:bg-[#FF5A36]/10 transition-colors cursor-pointer flex items-center justify-center"
            title="Copy invite link"
          >
            {copied ? <Check size={14} className="text-[#FF5A36]" /> : <Copy size={14} />}
          </button>
        </div>

        {/* Center: Media Control Dock */}
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-1rem)]">
          <div className="bg-[#1E2761] text-white px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-full flex items-center space-x-2.5 sm:space-x-3.5 shadow-xl shadow-[#1E2761]/25 border border-[#151A44]">
            
            {/* Microphone Toggle */}
            <button 
              type="button" 
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isMuted 
                  ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/30 hover:bg-[#E04826]' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`} 
              onClick={toggleMute}
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
            </button>

            {/* Video Camera Toggle */}
            <button 
              type="button" 
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isVideoOff 
                  ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/30 hover:bg-[#E04826]' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`} 
              onClick={toggleVideo}
              title={isVideoOff ? 'Turn on camera (V)' : 'Turn off camera (V)'}
            >
              {isVideoOff ? <VideoOff size={19} /> : <Video size={19} />}
            </button>

            {/* Screen Share */}
            <button 
              type="button" 
              className={`hidden sm:flex w-11 h-11 sm:w-12 sm:h-12 rounded-full items-center justify-center transition-all cursor-pointer ${
                isScreenSharing 
                  ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/30' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`} 
              onClick={toggleScreenShare}
              title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            >
              <MonitorUp size={19} />
            </button>

            {/* Raise Hand */}
            <button 
              type="button" 
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isHandRaised 
                  ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/30' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`} 
              onClick={toggleHand}
              title={isHandRaised ? 'Lower hand (H)' : 'Raise hand (H)'}
            >
              <Hand size={19} className={isHandRaised ? 'fill-current' : ''} />
            </button>

            {/* End Call / Leave - Solid Electric Coral #FF5A36 */}
            <button 
              type="button" 
              className="px-5 sm:px-6 h-11 sm:h-12 rounded-full bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold transition-all flex items-center justify-center space-x-2 shadow-md shadow-[#FF5A36]/30 hover:scale-105 active:scale-95 cursor-pointer" 
              onClick={onLeave}
              title="Leave call"
            >
              <PhoneOff size={19} />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Leave</span>
            </button>

            {/* Mobile Chat Trigger */}
            <button 
              type="button" 
              className={`sm:hidden w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                isChatOpen ? 'bg-[#FF5A36] text-white' : 'bg-white/10 text-white'
              }`} 
              onClick={() => setIsChatOpen(!isChatOpen)}
              title="Toggle chat"
            >
              <MessageSquare size={18} />
              {messages.length > 0 && !isChatOpen && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5A36] text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-[#1E2761]">
                  {messages.length > 9 ? '9+' : messages.length}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Bottom-Right: Quick Tray (Chat & Participants) */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-30 hidden sm:flex items-center space-x-2 bg-white/95 backdrop-blur-xl border border-[#E4E8EE] px-3 py-2 rounded-full text-[#1E2761] shadow-md">
          
          {/* Chat Toggle with Notification Dot */}
          <button 
            type="button" 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2.5 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
              isChatOpen ? 'bg-[#FF5A36] text-white' : 'hover:bg-[#F5F7FA] text-[#1E2761]'
            }`}
            title="Meeting Chat (C)"
          >
            <MessageSquare size={17} />
            {messages.length > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5A36] text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-white">
                {messages.length > 9 ? '9+' : messages.length}
              </span>
            )}
          </button>

          {/* Participant Count */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-[#1E2761] bg-[#F5F7FA] rounded-full border border-[#E4E8EE]">
            <Users size={14} className="text-[#FF5A36]" />
            <span>{allParticipantsCount}</span>
          </div>

        </div>

      </div>

      {/* ========================================================
          CHAT SIDEBAR: Pure White Surface with Brand Accents
         ======================================================== */}
      <div
        className={`
        fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white border-l border-[#E4E8EE] flex flex-col z-40 transition-transform duration-300 shadow-2xl text-[#1E2761]
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        {/* Chat Header */}
        <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-[#E4E8EE] bg-transparent">
          <div className="flex items-center space-x-2">
            <MessageSquare size={18} className="text-[#FF5A36]" />
            <span className="text-base font-bold text-[#1E2761] tracking-wide">In-Call Chat</span>
          </div>
          <button 
            type="button" 
            className="text-slate-400 hover:text-[#1E2761] transition-colors p-2 rounded-xl hover:bg-[#F5F7FA] cursor-pointer flex items-center justify-center" 
            onClick={() => setIsChatOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Security Notice */}
        <div className="bg-[#FF5A36]/10 px-6 py-3 text-xs text-[#FF5A36] border-b border-[#FF5A36]/20 font-semibold flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] shrink-0"></span>
          <span>Messages are encrypted and deleted when the meeting ends.</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F7FA] flex items-center justify-center text-[#FF5A36] border border-[#E4E8EE] mx-auto">
                <MessageSquare size={24} />
              </div>
              <p className="text-slate-500 text-xs font-medium">No messages yet.<br/>Say hello to the room!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={`${msg.timestamp}-${index}`} className={`flex flex-col space-y-1 w-full ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline space-x-2 px-1">
                  <span className="text-xs font-bold text-[#1E2761]">{msg.username}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`text-xs sm:text-sm p-3.5 shadow-sm max-w-[85%] break-words leading-relaxed ${
                  msg.isOwn 
                    ? 'bg-[#1E2761] text-white rounded-2xl rounded-tr-sm font-medium' 
                    : 'bg-[#F5F7FA] border border-[#E4E8EE] text-[#1E2761] rounded-2xl rounded-tl-sm'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-[#E4E8EE] bg-transparent">
          <div className="relative flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send message to room..."
              className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-[#1E2761] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1E2761] focus:ring-1 focus:ring-[#1E2761]/20 transition-all font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) handleSendMessage();
              }}
            />
            <button 
              type="button" 
              className={`absolute right-1.5 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                message.length > 0 
                  ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/30 hover:bg-[#E04826]' 
                  : 'text-slate-400 cursor-not-allowed bg-transparent'
              }`} 
              onClick={handleSendMessage} 
              disabled={message.length === 0}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


