import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Plus, Link as LinkIcon, Calendar, Clock, 
  Loader2, ArrowRight, ShieldCheck, Zap, Users, Copy, Check, Trash2, X, 
  Sparkles, Search, Play, Camera, Sliders
} from 'lucide-react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';

export default function UserDashboard({ onNavigate, onJoinRoom, notify }) {
  const [myRooms, setMyRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinId, setJoinId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [username, setUsername] = useState('User');
  const [deleteModalRoomId, setDeleteModalRoomId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'preview'
  
  // Hardware test states for Loom / Frame.io style video preview
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

  const handleCreateRoom = async () => {
    if (createInFlightRef.current) return;
    createInFlightRef.current = true;
    setIsCreating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.createRoom(token);
      
      if (!response.success || !response.data?.roomId) {
        notify?.('error', response.message || 'Failed to create room.');
        return;
      }

      notify?.('success', 'Meeting created successfully!');
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
        notify?.('error', response.status === 404 ? 'Room not found. Please check the code.' : response.message || 'Unable to join.');
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

  const filteredRooms = myRooms.filter(r => 
    !searchQuery.trim() || r.roomId.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <main className="flex-1 pt-20 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto text-[#1E2761] font-sans selection:bg-[#FF5A36] selection:text-white">
      
      {/* Friendly Welcome Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E2761]/8 border border-[#1E2761]/15 text-[#1E2761] text-xs font-semibold mb-3">
              <Sparkles size={13} className="text-[#FF5A36]" />
              <span>Real-time Video & Collaboration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1E2761] mb-2">
              Welcome back, <span className="text-[#FF5A36]">{username}</span> 👋
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
              Start an instant collaborative meeting, join with an invite code, or manage your recent rooms.
            </p>
          </div>

          {/* Quick Sub-navigation tabs */}
          <div className="inline-flex items-center p-1.5 bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl shadow-sm self-start sm:self-center">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-[#1E2761] text-white shadow-sm' 
                  : 'text-slate-600 hover:text-[#1E2761]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview' 
                  ? 'bg-[#FF5A36] text-white shadow-sm shadow-[#FF5A36]/25' 
                  : 'text-slate-600 hover:text-[#FF5A36]'
              }`}
            >
              <Camera size={14} />
              <span>Camera Setup</span>
            </button>
          </div>
        </div>

        {/* Quick Indicators Bar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#1E2761] text-xs font-semibold border border-[#E4E8EE] shadow-sm">
            <Zap size={13} className="text-[#FF5A36]" />
            <span>Sub-50ms Latency</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#1E2761] text-xs font-semibold border border-[#E4E8EE] shadow-sm">
            <ShieldCheck size={13} className="text-[#1E2761]" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#1E2761] text-xs font-semibold border border-[#E4E8EE] shadow-sm">
            <Users size={13} className="text-[#1E2761]" />
            <span>{myRooms.length} {myRooms.length === 1 ? 'Meeting' : 'Meetings'} Created</span>
          </div>
        </div>
      </div>

      {/* Loom / Frame.io Style Video Preview & Hardware Check (When Preview tab is active or toggle clicked) */}
      <AnimatePresence>
        {activeTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-8 p-6 sm:p-8 bg-white border border-[#E4E8EE] rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              {/* Video Preview Canvas */}
              <div className="w-full md:w-1/2 aspect-video bg-[#1E2761] rounded-2xl relative overflow-hidden flex items-center justify-center border border-[#151A44] shadow-md">
                {isPreviewActive && previewStream ? (
                  <>
                    <video 
                      ref={videoPreviewRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover ${!previewCamActive ? 'opacity-0' : ''}`}
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    {!previewCamActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E2761] text-white">
                        <VideoOff size={36} className="text-slate-400 mb-2" />
                        <span className="text-xs text-slate-300 font-medium">Camera is disabled</span>
                      </div>
                    )}

                    {/* Real-time Mic Input Visualizer Meter */}
                    {previewMicActive && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 border border-[#E4E8EE] shadow-sm z-20">
                        <Mic size={13} className="text-[#FF5A36]" />
                        <div className="w-16 h-1.5 bg-[#E4E8EE] rounded-full overflow-hidden flex items-center">
                          <div 
                            className="h-full bg-[#FF5A36] rounded-full transition-all duration-75"
                            style={{ width: `${Math.max(8, audioLevel)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                    <Camera size={40} className="text-[#FF5A36] mb-3 opacity-90 animate-pulse" />
                    <h4 className="font-bold text-sm sm:text-base text-white mb-1">Video & Audio Mirror Check</h4>
                    <p className="text-xs text-slate-300 max-w-xs mb-4">
                      Test your camera resolution and microphone input before going live in a masterclass.
                    </p>
                    <button
                      onClick={toggleHardwarePreview}
                      className="px-5 py-2.5 rounded-full bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5A36]/30 cursor-pointer flex items-center gap-2"
                    >
                      <Play size={14} className="fill-current" />
                      <span>Start Camera Preview</span>
                    </button>
                  </div>
                )}

                {/* Floating Preview Controls */}
                {isPreviewActive && (
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                    <button
                      onClick={togglePreviewCam}
                      className={`p-2.5 rounded-full border shadow-md transition-all cursor-pointer ${
                        previewCamActive 
                          ? 'bg-white/90 text-[#1E2761] border-white/80 hover:bg-white' 
                          : 'bg-rose-600 text-white border-rose-500'
                      }`}
                      title={previewCamActive ? "Turn off camera" : "Turn on camera"}
                    >
                      {previewCamActive ? <Video size={16} /> : <VideoOff size={16} />}
                    </button>
                    <button
                      onClick={togglePreviewMic}
                      className={`p-2.5 rounded-full border shadow-md transition-all cursor-pointer ${
                        previewMicActive 
                          ? 'bg-white/90 text-[#1E2761] border-white/80 hover:bg-white' 
                          : 'bg-rose-600 text-white border-rose-500'
                      }`}
                      title={previewMicActive ? "Mute mic" : "Unmute mic"}
                    >
                      {previewMicActive ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                    <button
                      onClick={toggleHardwarePreview}
                      className="px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-bold border border-white/80 shadow-md cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                )}
              </div>

              {/* Status and Recommendation */}
              <div className="w-full md:w-1/2 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E2761]/8 text-[#1E2761] text-xs font-bold uppercase tracking-wider">
                  <span>Hardware Readiness</span>
                </div>
                <h3 className="text-xl font-bold text-[#1E2761]">
                  Loom-Grade Audio & Video Studio
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your browser connects directly through WebRTC with sub-50ms glass-to-glass latency. All sessions support 1080p Ultra HD streaming, screen share capture, and end-to-end security.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Video Quality</span>
                    <span className="text-sm font-extrabold text-[#1E2761]">1080p 60fps Ready</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Audio Engine</span>
                    <span className="text-sm font-extrabold text-[#FF5A36]">Opus Spatial Clean</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2-Column Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-12 sm:mb-16">
        
        {/* Card 1: Start Meeting (10% High Priority Action: Electric Coral #FF5A36) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E4E8EE] hover:border-[#FF5A36]/40 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A36]/10 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60"></div>
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FF5A36]/10 text-[#FF5A36] rounded-2xl flex items-center justify-center mb-5 border border-[#FF5A36]/20 shadow-sm">
              <Video size={26} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E2761] mb-2">Host a Meeting</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Create an instant seminar room with live video, collaborative drawing canvas, and real-time chat.
            </p>
          </div>
          <button 
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full py-3.5 sm:py-4 px-6 rounded-xl font-bold bg-[#FF5A36] hover:bg-[#E04826] active:scale-[0.99] text-white transition-all flex items-center justify-center gap-2 shadow-md shadow-[#FF5A36]/20 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
          >
            {isCreating ? <Loader2 className="animate-spin text-white" size={17} /> : <Plus size={17} className="text-white" />}
            <span className="text-white">{isCreating ? 'Creating Room...' : 'Start Instant Meeting'}</span>
          </button>
        </motion.div>

        {/* Card 2: Join Meeting (30% Structural: Deep Midnight Blue #1E2761) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white border border-[#E4E8EE] hover:border-[#1E2761]/30 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E2761]/8 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60"></div>
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1E2761]/10 text-[#1E2761] rounded-2xl flex items-center justify-center mb-5 border border-[#1E2761]/20 shadow-sm">
              <LinkIcon size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E2761] mb-2">Join a Meeting</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Enter an invite code or paste the full meeting link to jump straight into an active session.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="Enter room code or link..."
                className="w-full bg-white border border-[#E4E8EE] rounded-xl px-4 py-3.5 text-sm text-[#1E2761] placeholder-slate-400 focus:bg-white focus:border-[#1E2761] focus:ring-2 focus:ring-[#1E2761]/15 outline-none transition-all shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
            </div>
            <button 
              onClick={handleJoinRoom}
              disabled={isJoining || !joinId.trim()}
              className="py-3.5 px-6 rounded-xl font-bold bg-[#1E2761] hover:bg-[#151A44] active:scale-[0.99] text-white transition-all flex items-center justify-center gap-2 shadow-md shadow-[#1E2761]/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm uppercase tracking-wider shrink-0 cursor-pointer"
            >
              {isJoining ? <Loader2 className="animate-spin text-white" size={17} /> : <ArrowRight size={17} className="text-white" />}
              <span className="text-white">{isJoining ? 'Joining...' : 'Join'}</span>
            </button>
          </div>
        </motion.div>

      </div>

      {/* Recent Meetings Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Clock size={20} className="text-[#1E2761]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E2761]">Recent Meetings</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-[#1E2761] text-xs font-semibold border border-[#E4E8EE] shadow-sm">
              {myRooms.length}
            </span>
          </div>

          {/* Search box if rooms exist */}
          {myRooms.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meetings..."
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E4E8EE] rounded-xl text-[#1E2761] placeholder-slate-400 focus:outline-none focus:border-[#1E2761] focus:ring-1 focus:ring-[#1E2761]/20 transition-all shadow-sm"
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white border border-[#E4E8EE] rounded-3xl p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#FF5A36]" size={30} />
            <p className="text-xs text-slate-500 font-medium">Loading your meetings...</p>
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <div 
                key={room.id}
                className="bg-white border border-[#E4E8EE] rounded-2xl p-5 hover:border-[#1E2761]/40 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-sm font-bold text-[#1E2761] bg-[#1E2761]/8 px-2.5 py-1 rounded-lg border border-[#1E2761]/15">
                      {room.roomId}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] animate-pulse"></span>
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar size={13} />
                    <span>Created {new Date(room.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#E4E8EE]">
                  <button 
                    onClick={() => onJoinRoom(room.roomId)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#FF5A36] hover:bg-[#E04826] text-white transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Video size={14} className="text-white" />
                    <span className="text-white">Rejoin</span>
                  </button>

                  <button 
                    onClick={() => handleCopyLink(room.roomId)}
                    className="p-2 rounded-xl text-[#1E2761] hover:text-[#FF5A36] bg-white hover:bg-slate-50 border border-[#E4E8EE] transition-colors cursor-pointer shadow-sm"
                    title="Copy invite link"
                  >
                    {copiedId === room.roomId ? (
                      <Check size={15} className="text-[#FF5A36]" />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>

                  <button 
                    onClick={() => setDeleteModalRoomId(room.roomId)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                    title="Delete meeting"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E4E8EE] rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] mb-3 shadow-sm">
              <Video size={28} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E2761] mb-1">
              {searchQuery.trim() ? 'No matching meetings found' : 'No meetings yet'}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-5 leading-relaxed">
              {searchQuery.trim() 
                ? 'Try searching with another room code or clear the search query.' 
                : 'You haven\'t created any sessions yet. Click "Start Instant Meeting" above to host your first room.'}
            </p>
            {searchQuery.trim() ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1E2761] font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <button 
                onClick={handleCreateRoom}
                className="px-5 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-[#FF5A36]/25 transition-colors cursor-pointer"
              >
                Start First Meeting
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
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
            <h3 className="text-lg font-bold text-[#1E2761] mb-1.5">Delete Meeting?</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Are you sure you want to delete room <strong className="font-mono text-[#FF5A36] font-bold">{deleteModalRoomId}</strong>? Participants will no longer be able to join.
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setDeleteModalRoomId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-[#E4E8EE] transition-colors text-xs sm:text-sm cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex justify-center items-center gap-1.5 text-xs sm:text-sm shadow-md cursor-pointer"
              >
                {isDeleting ? <Loader2 size={15} className="animate-spin text-white" /> : null}
                <span className="text-white">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}