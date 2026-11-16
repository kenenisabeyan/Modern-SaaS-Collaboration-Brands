import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollSection, scrollStagger, scrollItem, viewportConfig } from '../utils/animations.js';
import { 
  Video, VideoOff, Mic, MicOff, Plus, Link as LinkIcon, Calendar, Clock, 
  Loader2, ArrowRight, Copy, Check, Trash2, X, Sparkles, Camera, Play, Search,
  Volume2, ShieldCheck, Zap, Activity, Radio
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
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showCustomRoomModal, setShowCustomRoomModal] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');
  
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

  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail || '');
    };
    window.addEventListener('covideo-search', handleSearch);
    return () => {
      window.removeEventListener('covideo-search', handleSearch);
    };
  }, []);

  const displayedRooms = useMemo(() => {
    let list = myRooms;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(room => 
        (room.roomId && room.roomId.toLowerCase().includes(q)) ||
        (room.title && room.title.toLowerCase().includes(q))
      );
    }
    if (timeFilter === 'today') {
      const today = new Date().toDateString();
      list = list.filter(room => new Date(room.createdAt).toDateString() === today);
    } else if (timeFilter === 'month') {
      const now = new Date();
      list = list.filter(room => {
        const d = new Date(room.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    return list;
  }, [myRooms, searchQuery, timeFilter]);

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

  const playSpeakerTest = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        notify?.('info', 'Speaker output active.');
        return;
      }
      const ctx = new AudioCtx();
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });
      notify?.('success', 'Speaker output verified: Audio chime played.');
    } catch (e) {
      console.warn('Audio test error:', e);
    }
  };

  const handleCreateCustomRoom = (e) => {
    e.preventDefault();
    const clean = customRoomName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (!clean) {
      notify?.('error', 'Please enter a valid room name or code.');
      return;
    }
    setShowCustomRoomModal(false);
    setCustomRoomName('');
    handleCreateRoom(clean);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1E2761] font-sans selection:bg-[#FF5A36] selection:text-white pt-20 sm:pt-24 pb-20 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <div className="max-w-[1440px] w-full mx-auto">
        
        {/* ========================================================
            HERO LAUNCHPAD: Simple, Clear, Friction-Free 2-Column Layout
            Inspired by Google Meet & Whereby simplicity (Zero Borders)
           ======================================================== */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={scrollSection}
          className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm mb-10 transition-all border-0"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Side: The 2 Core Actions (Start or Join) */}
            <div className="lg:col-span-7 flex flex-col justify-center items-start text-left">
              
              {/* User Greeting & Status */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FF5A36]/10 text-[#FF5A36] mb-4 border-0">
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
                  className="px-7 py-4 rounded-2xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-sm sm:text-base shadow-md shadow-[#FF5A36]/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shrink-0 border-0"
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
                <div className="flex-1 flex items-center bg-[#F5F7FA] focus-within:bg-white rounded-2xl p-1.5 transition-all shadow-xs border-0">
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
                    className="px-4 py-2.5 rounded-xl font-bold bg-[#1E2761] hover:bg-[#151A44] text-white text-xs sm:text-sm transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 border-0"
                  >
                    {isJoining ? <Loader2 size={14} className="animate-spin text-white" /> : 'Join'}
                  </button>
                </div>

              </div>

              {/* Personal Room Link Pill & Custom Name Action */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center space-x-2 text-xs text-slate-500 bg-[#F5F7FA] rounded-xl px-3 py-1.5 border-0 shadow-2xs">
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

                <button
                  onClick={() => setShowCustomRoomModal(true)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1E2761] hover:text-[#FF5A36] bg-[#F5F7FA] hover:bg-slate-200/60 rounded-xl px-3 py-1.5 transition-colors cursor-pointer border-0 shadow-2xs"
                  title="Create a custom room name"
                >
                  <Plus size={13} className="text-[#FF5A36]" />
                  <span>Custom Room Name</span>
                </button>
              </div>

            </div>

            {/* Right Side: Clean, Compact Camera & Mic Studio Preview */}
            <div className="lg:col-span-5">
              <div className="w-full aspect-video bg-[#1E2761] rounded-2xl relative overflow-hidden flex items-center justify-center shadow-md group border-0">
                
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

                    {/* Microphone Meter with Studio Equalizer Bars */}
                    {previewMicActive && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl flex items-center space-x-2 shadow-sm z-20 border-0">
                        <Mic size={12} className="text-[#FF5A36]" />
                        <div className="flex items-end space-x-0.5 h-3">
                          {[20, 45, 75, 95, 60, 30].map((h, i) => {
                            const isBarActive = audioLevel > h * 0.4;
                            return (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-75 ${
                                  isBarActive ? (i > 3 ? 'bg-[#FF5A36]' : 'bg-emerald-500') : 'bg-slate-200'
                                }`}
                                style={{ height: `${Math.max(25, isBarActive ? h : 20)}%` }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-20">
                      <button
                        onClick={togglePreviewCam}
                        className={`p-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center border-0 ${
                          previewCamActive 
                            ? 'bg-white/90 text-[#1E2761] hover:bg-white' 
                            : 'bg-[#FF5A36] text-white'
                        }`}
                        title={previewCamActive ? "Turn off camera" : "Turn on camera"}
                      >
                        {previewCamActive ? <Video size={16} /> : <VideoOff size={16} />}
                      </button>
                      
                      <button
                        onClick={togglePreviewMic}
                        className={`p-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center border-0 ${
                          previewMicActive 
                            ? 'bg-white/90 text-[#1E2761] hover:bg-white' 
                            : 'bg-[#FF5A36] text-white'
                        }`}
                        title={previewMicActive ? "Mute mic" : "Unmute mic"}
                      >
                        {previewMicActive ? <Mic size={16} /> : <MicOff size={16} />}
                      </button>

                      <button
                        onClick={playSpeakerTest}
                        className="p-2 rounded-xl bg-white/90 hover:bg-white text-[#1E2761] shadow-sm transition-all cursor-pointer flex items-center justify-center border-0"
                        title="Test speaker output sound"
                      >
                        <Volume2 size={16} />
                      </button>

                      <button
                        onClick={toggleHardwarePreview}
                        className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#1E2761] text-xs font-bold shadow-sm cursor-pointer flex items-center justify-center border-0"
                      >
                        Turn Off
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-2.5 mx-auto">
                      <Camera size={24} className="text-[#FF5A36]" />
                    </div>
                    <p className="text-xs text-slate-300 max-w-xs mb-3 font-normal">
                      Check your camera and microphone before going live.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleHardwarePreview}
                        className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border-0"
                      >
                        <Play size={12} className="fill-current" />
                        <span>Preview Camera</span>
                      </button>
                      <button
                        onClick={playSpeakerTest}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border-0"
                        title="Play speaker test sound"
                      >
                        <Volume2 size={13} />
                        <span>Test Audio</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </motion.section>

        {/* ========================================================
            ADVANCED METRICS STRIP: Live System & Account Health (Zero Borders)
           ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          
          <div className="bg-white rounded-3xl p-5 shadow-xs flex items-center space-x-3.5 border-0">
            <div className="w-11 h-11 rounded-2xl bg-[#1E2761]/8 text-[#1E2761] flex items-center justify-center shrink-0">
              <Video size={20} className="text-[#FF5A36]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">Meetings Hosted</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#1E2761]">{myRooms.length} Sessions</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs flex items-center space-x-3.5 border-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">Encryption Layer</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#1E2761]">DTLS-SRTP 256</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs flex items-center space-x-3.5 border-0">
            <div className="w-11 h-11 rounded-2xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center shrink-0">
              <Zap size={20} className="text-[#FF5A36]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">WebRTC Mesh</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#1E2761]">&lt; 50ms Peer Sync</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs flex items-center space-x-3.5 border-0">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <Activity size={20} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">Platform Status</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold text-emerald-600">All Nodes Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================
            RECENT MEETINGS SECTION: Clean, Scannable History (Zero Borders)
           ======================================================== */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={scrollSection}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-0"
        >
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 gap-3">
            <div className="flex items-center space-x-2.5">
              <Clock size={18} className="text-[#1E2761]" />
              <h2 className="text-lg sm:text-xl font-black text-[#1E2761]">
                Your Recent Meetings
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#1E2761]/8 text-[#1E2761] text-xs font-bold">
                {displayedRooms.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Filter Chips */}
              <div className="flex items-center space-x-1.5 bg-[#F5F7FA] p-1 rounded-2xl border-0 shadow-2xs">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${
                    timeFilter === 'all' ? 'bg-[#1E2761] text-white shadow-xs' : 'text-slate-600 hover:text-[#1E2761]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${
                    timeFilter === 'today' ? 'bg-[#1E2761] text-white shadow-xs' : 'text-slate-600 hover:text-[#1E2761]'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${
                    timeFilter === 'month' ? 'bg-[#1E2761] text-white shadow-xs' : 'text-slate-600 hover:text-[#1E2761]'
                  }`}
                >
                  This Month
                </button>
              </div>

              {searchQuery && (
                <div className="flex items-center space-x-2 bg-[#1E2761]/5 px-3 py-1 rounded-full text-xs font-semibold text-[#1E2761] border-0">
                  <span>Filtering: "{searchQuery}"</span>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      window.dispatchEvent(new CustomEvent('covideo-search', { detail: '' }));
                    }} 
                    className="text-slate-400 hover:text-[#FF5A36] cursor-pointer"
                    title="Clear filter"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#FF5A36]" size={28} />
              <p className="text-xs text-slate-500 font-medium">Loading meetings...</p>
            </div>
          ) : displayedRooms.length > 0 ? (
            <motion.div variants={scrollStagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedRooms.map((room) => (
                <motion.div 
                  key={room.id || room.roomId}
                  variants={scrollItem}
                  className="bg-[#F5F7FA] hover:bg-slate-100/80 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 group border-0 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#1E2761] bg-white px-2.5 py-1 rounded-lg border-0 shadow-2xs">
                      {room.roomId}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(room.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={() => onJoinRoom(room.roomId)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#FF5A36] hover:bg-[#E04826] text-white transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer border-0"
                    >
                      <Video size={13} className="text-white" />
                      <span className="text-white">Rejoin</span>
                    </button>

                    <button 
                      onClick={() => handleCopyLink(room.roomId)}
                      className="p-2 rounded-xl text-[#1E2761] hover:text-[#FF5A36] bg-white hover:bg-slate-100 transition-colors cursor-pointer shadow-xs flex items-center justify-center border-0"
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
                      className="p-2 rounded-xl text-slate-400 hover:text-[#FF5A36] bg-white hover:bg-[#FF5A36]/10 transition-colors cursor-pointer shadow-xs flex items-center justify-center border-0"
                      title="Delete room"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </motion.div>
              ))}
            </motion.div>
          ) : searchQuery ? (
            <div className="py-12 bg-[#F5F7FA] rounded-2xl text-center p-6 flex flex-col items-center border-0">
              <Search className="text-slate-400 mb-2" size={28} />
              <h3 className="text-sm font-bold text-[#1E2761]">No meetings found matching "{searchQuery}"</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Check the room ID or search another term.
              </p>
            </div>
          ) : (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F7FA] flex items-center justify-center text-[#1E2761] mb-2.5 mx-auto border-0">
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

        </motion.section>

      </div>

      {/* Delete Confirmation Modal (Zero Borders) */}
      {deleteModalRoomId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center flex flex-col items-center border-0">
            <button 
              onClick={() => !isDeleting && setDeleteModalRoomId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#1E2761] p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0"
            >
              <X size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center mb-3 mx-auto border-0">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-bold text-[#1E2761] mb-1">Delete Meeting?</h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-5">
              Are you sure you want to delete room <strong className="font-mono text-[#FF5A36]">{deleteModalRoomId}</strong>?
            </p>
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => setDeleteModalRoomId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-bold bg-[#F5F7FA] hover:bg-slate-200/70 text-slate-700 transition-colors text-xs cursor-pointer shadow-xs border-0"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-bold bg-[#FF5A36] hover:bg-[#E04826] text-white transition-colors flex justify-center items-center gap-1.5 text-xs shadow-xs cursor-pointer border-0"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin text-white" /> : null}
                <span className="text-white">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Room Creator Modal (Zero Borders) */}
      {showCustomRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border-0">
            <button 
              onClick={() => setShowCustomRoomModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#1E2761] p-2 rounded-full hover:bg-[#F5F7FA] transition-colors cursor-pointer border-0"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center mb-4 border-0">
              <Sparkles size={24} />
            </div>

            <h3 className="text-xl font-bold text-[#1E2761] mb-1.5">Create Named Room</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Create a personalized, easy-to-remember room link for your attendees or team members.
            </p>

            <form onSubmit={handleCreateCustomRoom} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Room Name or Code
                </label>
                <div className="flex items-center bg-[#F5F7FA] rounded-2xl px-3.5 py-2.5 border-0">
                  <span className="text-xs font-mono text-slate-400 mr-1.5">/meeting/</span>
                  <input
                    type="text"
                    value={customRoomName}
                    onChange={(e) => setCustomRoomName(e.target.value)}
                    placeholder="e.g. design-crit-q1"
                    className="w-full bg-transparent text-sm font-semibold text-[#1E2761] outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomRoomModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customRoomName.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF5A36] hover:bg-[#E04826] text-white shadow-md shadow-[#FF5A36]/20 disabled:opacity-50 transition-all cursor-pointer border-0"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
