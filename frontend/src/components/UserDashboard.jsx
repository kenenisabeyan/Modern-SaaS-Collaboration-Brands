import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Plus, Link as LinkIcon, Calendar, Clock, 
  Loader2, ArrowRight, Copy, Check, Trash2, X, Sparkles, Camera, Play
} from 'lucide-react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';

export default function UserDashboard({ onNavigate, onJoinRoom, notify }) {
  const [myRooms, setMyRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [username, setUsername] = useState('User');
  const [deleteModalRoomId, setDeleteModalRoomId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPersonalLink, setCopiedPersonalLink] = useState(false);
  
  // Camera & Mic Quick Preview
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewStream, setPreviewStream] = useState(null);
  const [previewMicActive, setPreviewMicActive] = useState(true);
  const [previewCamActive, setPreviewCamActive] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const videoPreviewRef = useRef(null);
  const createInFlightRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const personalRoomId = useMemo(() => {
    const cleanUser = (username || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanUser || 'user'}-room`;
  }, [username]);

  const personalRoomUrl = useMemo(() => {
    return `${window.location.origin}/meeting/${personalRoomId}`;
  }, [personalRoomId]);

  useEffect(() => {
    setUsername(localStorage.getItem('username') || 'User');
    const loadRooms = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.getUserRooms(token);
          if (response.success && response.data) {
            setMyRooms(response.data);
          } else {
            notify?.('error', response.message || 'Failed to load your meetings history.');
          }
        }
      } catch (error) {
        console.error('Dashboard loadRooms error:', error);
        notify?.('error', 'Connection error. The backend server might be down.');
      } finally {
        setIsLoading(false);
      }
    };
    loadRooms();
    window.scrollTo(0, 0);

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleHardwarePreview = async () => {
    if (isPreviewActive) {
      if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
        setPreviewStream(null);
      }
      setIsPreviewActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setPreviewStream(stream);
        setIsPreviewActive(true);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera preview not permitted or unavailable:', err);
        notify?.('info', 'Camera or microphone preview not accessible.');
      }
    }
  };

  useEffect(() => {
    if (videoPreviewRef.current && previewStream) {
      videoPreviewRef.current.srcObject = previewStream;
    }
  }, [previewStream, isPreviewActive]);

  useEffect(() => {
    if (previewStream && isPreviewActive && previewMicActive) {
      const audioTracks = previewStream.getAudioTracks();
      if (audioTracks.length > 0) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;
            const source = audioCtx.createMediaStreamSource(previewStream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateLevel = () => {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();
          }
        } catch (e) {
          console.warn('Audio metering unavailable:', e);
        }
      }
    } else {
      setAudioLevel(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [previewStream, isPreviewActive, previewMicActive]);

  const togglePreviewCam = () => {
    if (previewStream) {
      const videoTrack = previewStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setPreviewCamActive(videoTrack.enabled);
      }
    }
  };

  const togglePreviewMic = () => {
    if (previewStream) {
      const audioTrack = previewStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setPreviewMicActive(audioTrack.enabled);
      }
    }
  };

  const extractRoomId = (value) => {
    const raw = value.trim();
    if (!raw) return '';
    try {
      const url = raw.startsWith('http') ? new URL(raw) : null;
      if (url) return roomIdFromPathname(url.pathname) || '';
    } catch { /* empty */ }
    if (raw.includes('/')) {
      const path = raw.startsWith('/') ? raw : `/${raw}`;
      const fromPath = roomIdFromPathname(path);
      if (fromPath) return fromPath;
    }
    return raw.split('?')[0].replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  };

  const handleCreateRoom = async (specificRoomId = null) => {
    if (createInFlightRef.current) return;
    createInFlightRef.current = true;
    setIsCreating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.createRoom(token, specificRoomId);
      
      if (!response.success || !response.data?.roomId) {
        notify?.('error', response.message || 'Failed to create room.');
        return;
      }

      notify?.('success', 'Starting your meeting...');
      onJoinRoom(response.data.roomId);
    } catch (error) {
      console.error('Dashboard handleCreateRoom error:', error);
      notify?.('error', 'Connection error. Please check your internet or if the server is running.');
    } finally {
      setIsCreating(false);
      createInFlightRef.current = false;
    }
  };

  const handleJoinRoom = async () => {
    const id = extractRoomId(joinId);
    if (!id || isJoining) return;
    setIsJoining(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.getRoom(token, id);
      if (!response.success) {
        notify?.('error', response.status === 404 ? 'Meeting not found. Please verify the code.' : response.message || 'Unable to join.');
        return;
      }
      notify?.('success', 'Joining meeting...');
      onJoinRoom(id);
    } catch (error) {
      notify?.('error', 'Connection error. Unable to reach the server.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyLink = (roomId) => {
    const link = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(roomId);
    notify?.('success', 'Invite link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyPersonalLink = () => {
    navigator.clipboard.writeText(personalRoomUrl);
    setCopiedPersonalLink(true);
    notify?.('success', 'Personal room URL copied!');
    setTimeout(() => setCopiedPersonalLink(false), 2500);
  };

  const handleDeleteRoom = async () => {
    if (!deleteModalRoomId || isDeleting) return;
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.deleteRoom(token, deleteModalRoomId);
      
      if (!response.success) {
        notify?.('error', response.message || 'Failed to delete room.');
        return;
      }
      
      notify?.('success', 'Meeting room deleted.');
      setMyRooms(prev => prev.filter(r => r.roomId !== deleteModalRoomId));
    } catch (error) {
      notify?.('error', 'Network error while deleting.');
    } finally {
      setIsDeleting(false);
      setDeleteModalRoomId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1E2761] font-sans selection:bg-[#FF5A36] selection:text-white pt-20 sm:pt-24 pb-20 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <div className="max-w-[1440px] w-full mx-auto">
        
        {/* ========================================================
            HERO LAUNCHPAD: Simple, Clear, Friction-Free 2-Column Layout
            Inspired by Google Meet & Whereby simplicity
           ======================================================== */}
        <section className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm mb-10 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Side: The 2 Core Actions (Start or Join) */}
            <div className="lg:col-span-7 flex flex-col justify-center items-start text-left">
              
              {/* User Greeting & Status */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
                <span>Welcome back, {username}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E2761] leading-[1.15] mb-3">
                Ready to meet?
              </h1>
              
              <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-lg leading-relaxed font-normal">
                Host an instant masterclass with crystal-clear video and real-time chat, or join an ongoing session with an invite code.
              </p>

              {/* The Two Essential Action Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xl mb-6">
                
                {/* Action 1: Big Solid Electric Coral "New Meeting" Button */}
                <button
                  onClick={() => handleCreateRoom()}
                  disabled={isCreating}
                  className="px-7 py-4 rounded-2xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-sm sm:text-base shadow-md shadow-[#FF5A36]/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shrink-0"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin text-white" size={18} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Video size={19} className="text-white" />
                      <span>Start Instant Meeting</span>
                    </>
                  )}
                </button>

                {/* Action 2: Clean Inline Join Input & Button */}
                <div className="flex-1 flex items-center bg-[#F5F7FA] border border-[#E4E8EE] focus-within:border-[#1E2761] focus-within:bg-white rounded-2xl p-1.5 transition-all shadow-xs">
                  <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Enter code or link"
                    className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#1E2761] placeholder-slate-400 outline-none font-medium min-w-0"
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={isJoining || !joinId.trim()}
                    className="px-4 py-2.5 rounded-xl font-bold bg-[#1E2761] hover:bg-[#151A44] text-white text-xs sm:text-sm transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    {isJoining ? <Loader2 size={14} className="animate-spin text-white" /> : 'Join'}
                  </button>
                </div>

              </div>

              {/* Personal Room Link Pill */}
              <div className="inline-flex items-center space-x-2 text-xs text-slate-500 bg-[#F5F7FA] border border-[#E4E8EE] rounded-xl px-3 py-1.5">
                <span className="font-semibold text-slate-400">Your permanent link:</span>
                <span className="font-mono font-bold text-[#1E2761]">{personalRoomId}</span>
                <button
                  onClick={handleCopyPersonalLink}
                  className="text-[#FF5A36] hover:underline font-bold flex items-center space-x-1 cursor-pointer ml-1"
                >
                  {copiedPersonalLink ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedPersonalLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

            </div>

            {/* Right Side: Clean, Compact Camera & Mic Studio Preview */}
            <div className="lg:col-span-5">
              <div className="w-full aspect-video bg-[#1E2761] rounded-2xl relative overflow-hidden flex items-center justify-center border border-[#151A44] shadow-md group">
                
                {isPreviewActive && previewStream ? (
                  <>
                    <video 
                      ref={videoPreviewRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover transition-opacity duration-300 ${!previewCamActive ? 'opacity-0' : 'opacity-100'}`}
                      style={{ transform: 'scaleX(-1)' }}
                    />

                    {!previewCamActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E2761] text-white">
                        <VideoOff size={32} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-300 font-bold">Camera Paused</span>
                      </div>
                    )}

                    {/* Microphone Meter */}
                    {previewMicActive && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-[#E4E8EE] shadow-sm z-20">
                        <Mic size={12} className="text-[#FF5A36]" />
                        <div className="w-16 h-1.5 bg-[#E4E8EE] rounded-full overflow-hidden flex items-center">
                          <div 
                            className="h-full bg-[#FF5A36] rounded-full transition-all duration-75"
                            style={{ width: `${Math.max(10, audioLevel)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-20">
                      <button
                        onClick={togglePreviewCam}
                        className={`p-2 rounded-xl border shadow-sm transition-all cursor-pointer flex items-center justify-center ${
                          previewCamActive 
                            ? 'bg-white/90 text-[#1E2761] border-white hover:bg-white' 
                            : 'bg-[#FF5A36] text-white border-[#FF5A36]'
                        }`}
                        title={previewCamActive ? "Turn off camera" : "Turn on camera"}
                      >
                        {previewCamActive ? <Video size={16} /> : <VideoOff size={16} />}
                      </button>
                      
                      <button
                        onClick={togglePreviewMic}
                        className={`p-2 rounded-xl border shadow-sm transition-all cursor-pointer flex items-center justify-center ${
                          previewMicActive 
                            ? 'bg-white/90 text-[#1E2761] border-white hover:bg-white' 
                            : 'bg-[#FF5A36] text-white border-[#FF5A36]'
                        }`}
                        title={previewMicActive ? "Mute mic" : "Unmute mic"}
                      >
                        {previewMicActive ? <Mic size={16} /> : <MicOff size={16} />}
                      </button>

                      <button
                        onClick={toggleHardwarePreview}
                        className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#1E2761] text-xs font-bold border border-white shadow-sm cursor-pointer flex items-center justify-center"
                      >
                        Turn Off
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-2.5 border border-white/15">
                      <Camera size={24} className="text-[#FF5A36]" />
                    </div>
                    <p className="text-xs text-slate-300 max-w-xs mb-3 font-normal">
                      Check your camera and microphone before going live.
                    </p>
                    <button
                      onClick={toggleHardwarePreview}
                      className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer flex items-center space-x-1.5"
                    >
                      <Play size={12} className="fill-current" />
                      <span>Preview Camera</span>
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            RECENT MEETINGS SECTION: Clean, Scannable History
           ======================================================== */}
        <section className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 shadow-sm">
          
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#E4E8EE]">
            <div className="flex items-center space-x-2.5">
              <Clock size={18} className="text-[#1E2761]" />
              <h2 className="text-lg sm:text-xl font-black text-[#1E2761]">
                Your Recent Meetings
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#1E2761]/8 text-[#1E2761] text-xs font-bold">
                {myRooms.length}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#FF5A36]" size={28} />
              <p className="text-xs text-slate-500 font-medium">Loading meetings...</p>
            </div>
          ) : myRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((room) => (
                <div 
                  key={room.id || room.roomId}
                  className="bg-[#F5F7FA] border border-[#E4E8EE] hover:border-[#1E2761]/30 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#1E2761] bg-white px-2.5 py-1 rounded-lg border border-[#E4E8EE]">
                      {room.roomId}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(room.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={() => onJoinRoom(room.roomId)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#FF5A36] hover:bg-[#E04826] text-white transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <Video size={13} className="text-white" />
                      <span className="text-white">Rejoin</span>
                    </button>

                    <button 
                      onClick={() => handleCopyLink(room.roomId)}
                      className="p-2 rounded-xl text-[#1E2761] hover:text-[#FF5A36] bg-white hover:bg-slate-100 border border-[#E4E8EE] transition-colors cursor-pointer shadow-xs flex items-center justify-center"
                      title="Copy invite link"
                    >
                      {copiedId === room.roomId ? (
                        <Check size={14} className="text-[#FF5A36]" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>

                    <button 
                      onClick={() => setDeleteModalRoomId(room.roomId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#FF5A36] bg-white hover:bg-[#FF5A36]/10 border border-[#E4E8EE] hover:border-[#FF5A36]/30 transition-colors cursor-pointer shadow-xs flex items-center justify-center"
                      title="Delete room"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] mb-2.5 mx-auto">
                <Video size={22} className="text-slate-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#1E2761] mb-1">
                No meetings hosted yet
              </h3>
              <p className="text-slate-500 text-xs max-w-xs mb-4">
                Click "Start Instant Meeting" above to create your first session.
              </p>
            </div>
          )}

        </section>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalRoomId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E8EE] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => !isDeleting && setDeleteModalRoomId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#1E2761] p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-[#E4E8EE] transition-colors cursor-pointer flex items-center justify-center"
            >
              <X size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center mb-3 border border-[#FF5A36]/25">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-bold text-[#1E2761] mb-1">Delete Meeting?</h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-5">
              Are you sure you want to delete room <strong className="font-mono text-[#FF5A36]">{deleteModalRoomId}</strong>?
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setDeleteModalRoomId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-bold bg-white hover:bg-slate-50 text-slate-700 border border-[#E4E8EE] transition-colors text-xs cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-bold bg-[#FF5A36] hover:bg-[#E04826] text-white transition-colors flex justify-center items-center gap-1.5 text-xs shadow-xs cursor-pointer"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin text-white" /> : null}
                <span className="text-white">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
