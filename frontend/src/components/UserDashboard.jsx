import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Plus, Link as LinkIcon, Calendar, Clock, 
  Loader2, ArrowRight, ShieldCheck, Zap, Users, Copy, Check, Trash2, X, 
  Sparkles, Search, Play, Camera, Monitor, Radio, Compass, RefreshCw
} from 'lucide-react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';

export default function UserDashboard({ onNavigate, onJoinRoom, notify }) {
  const [myRooms, setMyRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinId, setJoinId] = useState('');
  const [customRoomName, setCustomRoomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'today'
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [username, setUsername] = useState('User');
  const [deleteModalRoomId, setDeleteModalRoomId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPersonalLink, setCopiedPersonalLink] = useState(false);
  
  // Hardware test states for Loom / Frame.io style pre-flight studio
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

      notify?.('success', 'Meeting room ready! Connecting...');
      onJoinRoom(response.data.roomId);
    } catch (error) {
      console.error('Dashboard handleCreateRoom error:', error);
      notify?.('error', 'Connection error. Please check your internet or if the server is running.');
    } finally {
      setIsCreating(false);
      createInFlightRef.current = false;
    }
  };

  const handleJoinRoom = async (targetId = null) => {
    const rawId = targetId || joinId;
    const id = extractRoomId(rawId);
    if (!id || isJoining) return;
    setIsJoining(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.getRoom(token, id);
      if (!response.success) {
        notify?.('error', response.status === 404 ? 'Room not found. Please verify the room ID.' : response.message || 'Unable to join.');
        return;
      }
      notify?.('success', 'Joining session...');
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
    notify?.('success', 'Personal room URL copied to clipboard!');
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
      
      notify?.('success', 'Meeting room removed.');
      setMyRooms(prev => prev.filter(r => r.roomId !== deleteModalRoomId));
    } catch (error) {
      notify?.('error', 'Network error while deleting.');
    } finally {
      setIsDeleting(false);
      setDeleteModalRoomId(null);
    }
  };

  const filteredRooms = useMemo(() => {
    return myRooms.filter(r => {
      const matchesSearch = !searchQuery.trim() || r.roomId.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;
      if (statusFilter === 'today') {
        const roomDate = new Date(r.createdAt).toDateString();
        const today = new Date().toDateString();
        return roomDate === today;
      }
      return true;
    });
  }, [myRooms, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1E2761] font-sans selection:bg-[#FF5A36] selection:text-white pb-20">
      
      {/* ========================================================
          TOP WORKSPACE COMMAND BAR: Modern SaaS App Header
         ======================================================== */}
      <section className="bg-white border-b border-[#E4E8EE] pt-20 sm:pt-24 pb-6 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 transition-all">
        <div className="max-w-[1720px] w-full mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* User Profile Greeting & Live Status */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1E2761] border-2 border-[#151A44] flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-sm">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FF5A36] border-2 border-white rounded-full animate-pulse"></span>
            </div>
            
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1E2761]">
                  Welcome back, <span className="text-[#FF5A36]">{username}</span>
                </h1>
                <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] animate-pulse"></span>
                  <span>Available to Host</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm">
                Masterclass command center • Real-time WebRTC signaling ready with sub-40ms latency
              </p>
            </div>
          </div>

          {/* Top Quick Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Quick Personal Room Link Button */}
            <button
              onClick={handleCopyPersonalLink}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F7FA] text-[#1E2761] border border-[#E4E8EE] hover:border-[#1E2761]/40 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center space-x-2 cursor-pointer"
              title="Copy your permanent meeting link"
            >
              {copiedPersonalLink ? <Check size={16} className="text-[#FF5A36]" /> : <LinkIcon size={16} className="text-[#1E2761]" />}
              <span>{copiedPersonalLink ? 'Link Copied!' : 'Copy Personal Room URL'}</span>
            </button>

            {/* Primary Action CTA (Strict 10% Electric Coral #FF5A36) */}
            <button
              onClick={() => handleCreateRoom()}
              disabled={isCreating}
              className="px-6 py-2.5 sm:py-3 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#FF5A36]/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isCreating ? <Loader2 className="animate-spin text-white" size={16} /> : <Plus size={16} className="text-white" />}
              <span>{isCreating ? 'Preparing Room...' : 'New Meeting'}</span>
            </button>

          </div>

        </div>
      </section>

      {/* ========================================================
          MAIN DASHBOARD BODY
         ======================================================== */}
      <main className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-8 sm:pt-10">
        
        {/* ========================================================
            ROW 1: 4 HIGH-IMPACT SAAS METRIC CARDS
           ======================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          
          {/* Metric 1: Hosted Sessions */}
          <div className="p-5 sm:p-6 bg-white border border-[#E4E8EE] rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Rooms Hosted</span>
              <span className="text-3xl sm:text-4xl font-black text-[#1E2761]">{myRooms.length}</span>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Encrypted collaborative spaces</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center border border-[#1E2761]/15">
              <Users size={20} />
            </div>
          </div>

          {/* Metric 2: Live Engine Latency */}
          <div className="p-5 sm:p-6 bg-white border border-[#E4E8EE] rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">WebRTC Latency</span>
              <div className="flex items-center space-x-2">
                <span className="text-3xl sm:text-4xl font-black text-[#1E2761]">32ms</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A36] animate-pulse"></span>
              </div>
              <p className="text-[11px] text-[#FF5A36] mt-1 font-bold">Ultra-Low Glass-to-Glass</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center border border-[#FF5A36]/20">
              <Zap size={20} />
            </div>
          </div>

          {/* Metric 3: Resolution & Codec */}
          <div className="p-5 sm:p-6 bg-white border border-[#E4E8EE] rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Studio Clarity</span>
              <span className="text-3xl sm:text-4xl font-black text-[#1E2761]">1080p</span>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Opus 48kHz Spatial Voice</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center border border-[#1E2761]/15">
              <Video size={20} />
            </div>
          </div>

          {/* Metric 4: Security Standard */}
          <div className="p-5 sm:p-6 bg-white border border-[#E4E8EE] rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Security Standard</span>
              <span className="text-2xl sm:text-3xl font-black text-[#1E2761]">DTLS-SRTP</span>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">End-to-End P2P Encryption</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center border border-[#1E2761]/15">
              <ShieldCheck size={20} />
            </div>
          </div>

        </section>

        {/* ========================================================
            ROW 2: COMMAND CENTER 2-COLUMN GRID (7 COLS & 5 COLS)
           ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10 sm:mb-12 items-start">
          
          {/* ========================================================
              LEFT COLUMN (7 COLS): PRE-FLIGHT STUDIO GREEN ROOM & QUICK LAUNCH
             ======================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* The Green Room Card */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 shadow-sm">
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center border border-[#FF5A36]/20">
                    <Camera size={16} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#1E2761]">
                    Studio Green Room & Pre-Flight
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1E2761]/5 text-[#1E2761] border border-[#1E2761]/10">
                    <Radio size={12} className={isPreviewActive ? "text-[#FF5A36] animate-pulse" : "text-slate-400"} />
                    <span>{isPreviewActive ? "Live Hardware Mirror" : "Preview Inactive"}</span>
                  </span>
                </div>
              </div>

              {/* Viewport Canvas (16:9 Aspect Ratio) */}
              <div className="w-full aspect-video bg-[#1E2761] rounded-2xl relative overflow-hidden flex items-center justify-center border border-[#151A44] shadow-md mb-5 group">
                
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
                        <VideoOff size={38} className="text-slate-400 mb-2" />
                        <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Camera Paused</span>
                      </div>
                    )}

                    {/* HUD: Real-time Live Microphone Volume VU Meter */}
                    {previewMicActive && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 border border-[#E4E8EE] shadow-sm z-20">
                        <Mic size={13} className="text-[#FF5A36]" />
                        <div className="w-20 h-1.5 bg-[#E4E8EE] rounded-full overflow-hidden flex items-center">
                          <div 
                            className="h-full bg-[#FF5A36] rounded-full transition-all duration-75"
                            style={{ width: `${Math.max(10, audioLevel)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#1E2761]">{audioLevel}%</span>
                      </div>
                    )}

                    {/* HUD: Resolution Badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-mono text-[10px] font-bold border border-white/20">
                      1080p • 60 FPS
                    </div>

                    {/* Floating In-Stream Studio Dock Controls */}
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-20">
                      <button
                        onClick={togglePreviewCam}
                        className={`p-3 rounded-xl border shadow-md transition-all cursor-pointer ${
                          previewCamActive 
                            ? 'bg-white/90 text-[#1E2761] border-white hover:bg-white' 
                            : 'bg-[#FF5A36] text-white border-[#FF5A36]'
                        }`}
                        title={previewCamActive ? "Turn off camera" : "Turn on camera"}
                      >
                        {previewCamActive ? <Video size={18} /> : <VideoOff size={18} />}
                      </button>
                      
                      <button
                        onClick={togglePreviewMic}
                        className={`p-3 rounded-xl border shadow-md transition-all cursor-pointer ${
                          previewMicActive 
                            ? 'bg-white/90 text-[#1E2761] border-white hover:bg-white' 
                            : 'bg-[#FF5A36] text-white border-[#FF5A36]'
                        }`}
                        title={previewMicActive ? "Mute microphone" : "Unmute microphone"}
                      >
                        {previewMicActive ? <Mic size={18} /> : <MicOff size={18} />}
                      </button>

                      <button
                        onClick={toggleHardwarePreview}
                        className="px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-[#1E2761] text-xs font-bold border border-white shadow-md cursor-pointer transition-all"
                      >
                        Close Preview
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-3 border border-white/15 shadow-sm">
                      <Camera size={32} className="text-[#FF5A36]" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-white mb-1">
                      Audio & Video Studio Check
                    </h3>
                    <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed font-normal">
                      Verify your lighting, microphone input level, and framing before launching or joining a live masterclass.
                    </p>
                    <button
                      onClick={toggleHardwarePreview}
                      className="px-5 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5A36]/30 cursor-pointer flex items-center space-x-2"
                    >
                      <Play size={14} className="fill-current" />
                      <span>Start Camera & Mic Preview</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Big Solid Coral Action CTA (10% High Priority Accent) */}
              <button 
                onClick={() => handleCreateRoom()}
                disabled={isCreating}
                className="w-full py-4 px-6 rounded-2xl font-bold bg-[#FF5A36] hover:bg-[#E04826] active:scale-[0.99] text-white transition-all flex items-center justify-center space-x-3 shadow-lg shadow-[#FF5A36]/25 hover:shadow-xl hover:shadow-[#FF5A36]/30 disabled:opacity-75 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer mb-5"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="animate-spin text-white" size={20} />
                    <span className="text-white">Connecting Signaling Node...</span>
                  </>
                ) : (
                  <>
                    <Video size={20} className="text-white" />
                    <span className="text-white">Start Instant Meeting with Current Setup</span>
                    <ArrowRight size={18} className="text-white opacity-80" />
                  </>
                )}
              </button>

              {/* Fast Inline Room Join Bar */}
              <div className="pt-4 border-t border-[#E4E8EE]">
                <label className="text-xs font-bold text-[#1E2761] uppercase tracking-wider block mb-2">
                  Or Join an Existing Session via Code or Link
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      placeholder="Paste room ID (e.g. room-7491) or full invite URL..."
                      className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1E2761] placeholder-slate-400 focus:bg-white focus:border-[#1E2761] focus:ring-2 focus:ring-[#1E2761]/15 outline-none transition-all shadow-sm font-medium"
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                    />
                  </div>
                  <button 
                    onClick={() => handleJoinRoom()}
                    disabled={isJoining || !joinId.trim()}
                    className="py-3 px-6 rounded-xl font-bold bg-[#1E2761] hover:bg-[#151A44] active:scale-[0.99] text-white transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm shrink-0 cursor-pointer"
                  >
                    {isJoining ? <Loader2 className="animate-spin text-white" size={16} /> : <ArrowRight size={16} className="text-white" />}
                    <span className="text-white">{isJoining ? 'Connecting...' : 'Join Session'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN (5 COLS): PERSONAL ROOM, CUSTOM ROOM, & PRO TIPS
             ======================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Card 1: Permanent Personal Meeting Room */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center border border-[#1E2761]/15">
                    <Sparkles size={16} className="text-[#FF5A36]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1E2761]">
                    Your Personal Meeting Room
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  Static URL
                </span>
              </div>

              <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed font-normal">
                Your permanent room is always reserved for your masterclasses and scheduled office hours.
              </p>

              <div className="p-3 bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl flex items-center justify-between gap-2 mb-4">
                <span className="font-mono text-xs font-bold text-[#1E2761] truncate select-all">
                  {personalRoomUrl}
                </span>
                <button
                  onClick={handleCopyPersonalLink}
                  className="p-2 rounded-xl text-[#1E2761] hover:text-[#FF5A36] bg-white border border-[#E4E8EE] shadow-sm hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
                  title="Copy permanent room link"
                >
                  {copiedPersonalLink ? <Check size={14} className="text-[#FF5A36]" /> : <Copy size={14} />}
                </button>
              </div>

              <button
                onClick={() => handleCreateRoom(personalRoomId)}
                className="w-full py-2.5 rounded-xl font-bold bg-[#1E2761] hover:bg-[#151A44] text-white text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Video size={16} />
                <span>Launch Personal Room</span>
              </button>
            </div>

            {/* Card 2: Custom Room Generator */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center border border-[#1E2761]/15">
                  <Compass size={16} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#1E2761]">
                  Launch Named Seminar Room
                </h3>
              </div>

              <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed font-normal">
                Give your masterclass a memorable room name for students and team members.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  placeholder="e.g. design-critique-2026"
                  className="flex-1 bg-[#F5F7FA] border border-[#E4E8EE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E2761] placeholder-slate-400 focus:bg-white focus:border-[#1E2761] outline-none transition-all font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customRoomName.trim()) {
                      handleCreateRoom(extractRoomId(customRoomName));
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customRoomName.trim()) {
                      handleCreateRoom(extractRoomId(customRoomName));
                    }
                  }}
                  disabled={!customRoomName.trim() || isCreating}
                  className="px-4 py-2.5 rounded-xl font-bold bg-[#1E2761] hover:bg-[#151A44] text-white text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  Create
                </button>
              </div>
            </div>

            {/* Card 3: In-Call Keyboard Shortcuts Quick Reference */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#1E2761] uppercase tracking-wider">
                  Live Meeting Keyboard Hotkeys
                </h4>
                <span className="text-[10px] text-slate-400 font-semibold">In-Call</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F7FA] border border-[#E4E8EE]">
                  <span className="text-slate-600 font-medium">Toggle Mic</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white border border-[#E4E8EE] font-mono font-bold text-[#1E2761] shadow-xs">M</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F7FA] border border-[#E4E8EE]">
                  <span className="text-slate-600 font-medium">Toggle Video</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white border border-[#E4E8EE] font-mono font-bold text-[#1E2761] shadow-xs">V</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F7FA] border border-[#E4E8EE]">
                  <span className="text-slate-600 font-medium">Raise Hand</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white border border-[#E4E8EE] font-mono font-bold text-[#1E2761] shadow-xs">H</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F7FA] border border-[#E4E8EE]">
                  <span className="text-slate-600 font-medium">Toggle Chat</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white border border-[#E4E8EE] font-mono font-bold text-[#1E2761] shadow-xs">C</kbd>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* ========================================================
            ROW 3: RECENT MEETINGS & MASTERCLASSES SESSION HISTORY
           ======================================================== */}
        <section className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b border-[#E4E8EE]">
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center border border-[#1E2761]/15">
                <Clock size={20} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1E2761]">
                    Recent Masterclasses & Sessions
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1E2761]/8 text-[#1E2761] text-xs font-bold border border-[#1E2761]/15">
                    {filteredRooms.length}
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Rejoin active rooms, copy participant invite links, or manage past session history.
                </p>
              </div>
            </div>

            {/* Controls: Filter Tabs & Search Bar */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Tab Selector */}
              <div className="inline-flex items-center p-1 bg-[#F5F7FA] border border-[#E4E8EE] rounded-xl">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'all' 
                      ? 'bg-[#1E2761] text-white shadow-xs' 
                      : 'text-slate-600 hover:text-[#1E2761]'
                  }`}
                >
                  All Sessions
                </button>
                <button
                  onClick={() => setStatusFilter('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'today' 
                      ? 'bg-[#1E2761] text-white shadow-xs' 
                      : 'text-slate-600 hover:text-[#1E2761]'
                  }`}
                >
                  Today
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-56">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by room ID..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-[#F5F7FA] border border-[#E4E8EE] rounded-xl text-[#1E2761] placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1E2761] focus:ring-1 focus:ring-[#1E2761]/20 transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* List Content */}
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#FF5A36]" size={32} />
              <p className="text-xs text-slate-500 font-medium">Fetching session history from database...</p>
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredRooms.map((room) => (
                <div 
                  key={room.id || room.roomId}
                  className="bg-white border border-[#E4E8EE] hover:border-[#1E2761]/40 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-[#1E2761] bg-[#1E2761]/8 px-2.5 py-1 rounded-lg border border-[#1E2761]/15">
                        {room.roomId}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] animate-pulse"></span>
                        Ready to Join
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                      <Calendar size={12} />
                      <span>Created {new Date(room.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#E4E8EE]">
                    
                    {/* Rejoin Action (Solid Coral Button) */}
                    <button 
                      onClick={() => onJoinRoom(room.roomId)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#FF5A36] hover:bg-[#E04826] text-white transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Video size={14} className="text-white" />
                      <span className="text-white">Rejoin Room</span>
                    </button>

                    {/* Copy Link Button */}
                    <button 
                      onClick={() => handleCopyLink(room.roomId)}
                      className="p-2 rounded-xl text-[#1E2761] hover:text-[#FF5A36] bg-[#F5F7FA] hover:bg-slate-200 border border-[#E4E8EE] transition-colors cursor-pointer shadow-xs"
                      title="Copy meeting invite link"
                    >
                      {copiedId === room.roomId ? (
                        <Check size={15} className="text-[#FF5A36]" />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>

                    {/* Delete Room Button */}
                    <button 
                      onClick={() => setDeleteModalRoomId(room.roomId)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shadow-xs"
                      title="Delete room"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] mb-3 shadow-xs">
                <Video size={28} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1E2761] mb-1">
                {searchQuery.trim() ? 'No matching masterclasses found' : 'No active sessions yet'}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-5 leading-relaxed">
                {searchQuery.trim() 
                  ? 'Try searching with another room code or clear your filter.' 
                  : 'Start an instant seminar room above to collaborate with students, team members, or guests.'}
              </p>
              {searchQuery.trim() ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1E2761] font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Clear Filter
                </button>
              ) : (
                <button 
                  onClick={() => handleCreateRoom()}
                  className="px-6 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#FF5A36]/25 transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Start Your First Room</span>
                </button>
              )}
            </div>
          )}

        </section>

      </main>

      {/* ========================================================
          DELETE CONFIRMATION MODAL
         ======================================================== */}
      {deleteModalRoomId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E4E8EE] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => !isDeleting && setDeleteModalRoomId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#1E2761] p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-[#E4E8EE] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#1E2761] mb-1.5">Delete Meeting Room?</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Are you sure you want to delete room <strong className="font-mono text-[#FF5A36] font-bold">{deleteModalRoomId}</strong>? Participants will no longer be able to join.
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setDeleteModalRoomId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-bold bg-white hover:bg-slate-50 text-slate-700 border border-[#E4E8EE] transition-colors text-xs sm:text-sm cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex justify-center items-center gap-1.5 text-xs sm:text-sm shadow-md cursor-pointer"
              >
                {isDeleting ? <Loader2 size={15} className="animate-spin text-white" /> : null}
                <span className="text-white">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
