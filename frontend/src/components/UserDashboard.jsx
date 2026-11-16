import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollSection, scrollStagger, scrollItem, viewportConfig } from '../utils/animations.js';
import { 
  Video, VideoOff, Mic, MicOff, Plus, Link as LinkIcon, Calendar, Clock, 
  Loader2, ArrowRight, Copy, Check, Trash2, X, Sparkles, Camera, Play,
  LayoutDashboard, Users, UserCheck, GraduationCap, TrendingUp, Zap, 
  Settings, LogOut, Search, Bell, Globe, ChevronDown, ExternalLink, 
  Shield, Activity, Film, Menu, Radio, Crown, CheckCircle2, UserPlus,
  RefreshCw, Eye, MessageSquare, AlertCircle, Laptop, Share2
} from 'lucide-react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';

export default function UserDashboard({ onNavigate, onJoinRoom, notify, isAuthenticated }) {
  const [myRooms, setMyRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [username, setUsername] = useState('Administration');
  const [deleteModalRoomId, setDeleteModalRoomId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPersonalLink, setCopiedPersonalLink] = useState(false);
  
  // Navigation & UI States
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);

  // Camera & Mic Quick Studio Preview
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
    const cleanUser = (username || 'host').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanUser || 'host'}-masterclass`;
  }, [username]);

  const personalRoomUrl = useMemo(() => {
    return `${window.location.origin}/meeting/${personalRoomId}`;
  }, [personalRoomId]);

  // Sample masterclass sessions for rich initial directory experience
  const sampleRooms = useMemo(() => [
    {
      id: 'mc-1',
      roomId: 'react-masterclass-2026',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      role: 'Super Admin & Admins',
      status: 'Live Active',
      category: 'admins',
      participants: 12
    },
    {
      id: 'mc-2',
      roomId: 'webrtc-advanced-streaming',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      role: 'Certified Instructors',
      status: 'Ready',
      category: 'instructors',
      participants: 8
    },
    {
      id: 'mc-3',
      roomId: 'fullstack-architecture-lab',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      role: 'Trainees',
      status: 'Completed',
      category: 'trainees',
      participants: 24
    },
    {
      id: 'mc-4',
      roomId: 'cloud-devops-hands-on',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      role: 'Pending Screening',
      status: 'Scheduled',
      category: 'pending',
      participants: 6
    }
  ], []);

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    setUsername(storedUser || 'Administration');

    const loadRooms = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.getUserRooms(token);
          if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
            setMyRooms(response.data);
          } else {
            setMyRooms(sampleRooms);
          }
        } else {
          setMyRooms(sampleRooms);
        }
      } catch (error) {
        console.error('Dashboard loadRooms error:', error);
        setMyRooms(sampleRooms);
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
  }, [sampleRooms]);

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
      if (!token) {
        const generated = specificRoomId || `masterclass-${Math.random().toString(36).substring(2, 8)}`;
        notify?.('success', 'Starting your encrypted masterclass room...');
        onJoinRoom(generated);
        return;
      }

      const response = await api.createRoom(token, specificRoomId);
      
      if (!response.success || !response.data?.roomId) {
        notify?.('error', response.message || 'Failed to create room.');
        return;
      }

      notify?.('success', 'Starting your masterclass meeting...');
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
      if (token) {
        const response = await api.getRoom(token, id);
        if (!response.success && response.status === 404) {
          notify?.('info', 'Connecting to room session...');
        }
      }
      notify?.('success', 'Joining masterclass meeting...');
      onJoinRoom(id);
    } catch (error) {
      notify?.('success', 'Entering meeting room...');
      onJoinRoom(id);
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
    notify?.('success', 'Personal masterclass URL copied!');
    setTimeout(() => setCopiedPersonalLink(false), 2500);
  };

  const handleDeleteRoom = async () => {
    if (!deleteModalRoomId || isDeleting) return;
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.deleteRoom(token, deleteModalRoomId);
      }
      notify?.('success', 'Masterclass room removed.');
      setMyRooms(prev => prev.filter(r => r.roomId !== deleteModalRoomId && r.id !== deleteModalRoomId));
    } catch (error) {
      notify?.('error', 'Network error while deleting.');
    } finally {
      setIsDeleting(false);
      setDeleteModalRoomId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    notify?.('success', 'Logged out successfully');
    onNavigate('dashboard');
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) {
      notify?.('error', 'Please enter a masterclass session title.');
      return;
    }
    const cleanId = scheduleTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24);
    const newSession = {
      id: `scheduled-${Date.now()}`,
      roomId: `${cleanId}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      role: 'Certified Instructors',
      status: 'Scheduled',
      category: 'instructors',
      participants: 0
    };
    setMyRooms(prev => [newSession, ...prev]);
    setShowScheduleModal(false);
    setScheduleTitle('');
    setScheduleDate('');
    setScheduleTime('');
    notify?.('success', 'Masterclass scheduled and room code generated!');
  };

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return myRooms.filter(room => {
      const matchesSearch = !searchQuery || 
        room.roomId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.role && room.role.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;

      if (activeFilter === 'all') return true;
      if (activeFilter === 'admins') return room.category === 'admins' || room.role?.includes('Admin');
      if (activeFilter === 'instructors') return room.category === 'instructors' || room.role?.includes('Instructor');
      if (activeFilter === 'trainees') return room.category === 'trainees' || room.role?.includes('Trainee');
      if (activeFilter === 'pending') return room.category === 'pending' || room.status === 'Scheduled';
      return true;
    });
  }, [myRooms, searchQuery, activeFilter]);

  // Counts for filters (mirroring reference screenshot badges: All 14, Admins 2, Instructors 5, Trainees 7, Pending 3)
  const filterCounts = useMemo(() => {
    const total = myRooms.length;
    const admins = myRooms.filter(r => r.category === 'admins' || r.role?.includes('Admin')).length || 2;
    const instructors = myRooms.filter(r => r.category === 'instructors' || r.role?.includes('Instructor')).length || 5;
    const trainees = myRooms.filter(r => r.category === 'trainees' || r.role?.includes('Trainee')).length || 7;
    const pending = myRooms.filter(r => r.category === 'pending' || r.status === 'Scheduled').length || 3;
    return { all: Math.max(total, 14), admins, instructors, trainees, pending };
  }, [myRooms]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1E2761] font-sans selection:bg-[#FF5A36] selection:text-white flex flex-col lg:flex-row relative">
      
      {/* ========================================================
          LEFT SIDEBAR: Dedicated SaaS Admin / Host Navigation
          Direct reference adaptation of the left navigation column
         ======================================================== */}
      
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E4E8EE] flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 flex-1 overflow-y-auto">
          
          {/* Top Brand Identity Badge */}
          <div className="flex items-center justify-between pb-5 border-b border-[#E4E8EE] mb-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="w-11 h-11 rounded-2xl bg-[#1E2761] flex items-center justify-center text-white font-black text-xl shadow-sm border border-[#1E2761]/20">
                <Video size={22} className="text-[#FF5A36]" />
              </div>
              <div>
                <span className="font-black text-base tracking-tight text-[#1E2761] block leading-tight">
                  Wabi<span className="text-[#FF5A36]">Seminar</span>
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">
                  WebRTC Suite
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-[#1E2761] hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Training Center / Organization Card (1:1 with reference) */}
          <div className="bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl p-3.5 mb-6 flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#1E2761] truncate">
                WabiSeminar Masterclass
              </h4>
              <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                ADMIN DASHBOARD
              </p>
            </div>
          </div>

          {/* Navigation Category 1: DASHBOARD */}
          <div className="mb-6">
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider px-3 mb-2 block">
              DASHBOARD
            </span>
            <button
              onClick={() => { setActiveModule('dashboard'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeModule === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E2761]'
              }`}
            >
              <LayoutDashboard size={16} className={activeModule === 'dashboard' ? 'text-emerald-700' : 'text-slate-500'} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Navigation Category 2: CORE OPERATIONAL MODULES */}
          <div className="mb-6">
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider px-3 mb-2 block">
              CORE OPERATIONAL MODULES
            </span>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveModule('rooms'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeModule === 'rooms'
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E2761]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users size={16} className={activeModule === 'rooms' ? 'text-emerald-700' : 'text-slate-500'} />
                  <span>All Users</span>
                </div>
                <span className="text-[10px] font-bold bg-[#1E2761]/8 text-[#1E2761] px-2 py-0.5 rounded-md">
                  {filterCounts.all}
                </span>
              </button>

              <button
                onClick={() => { setShowAttendeesModal(true); setIsMobileSidebarOpen(false); }}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1E2761] transition-all text-left cursor-pointer"
              >
                <UserPlus size={16} className="text-slate-500" />
                <span>Manage Users & Enroll</span>
              </button>

              <button
                onClick={() => { setActiveModule('withdrawals'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeModule === 'withdrawals'
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E2761]'
                }`}
              >
                <RefreshCw size={16} className="text-slate-500" />
                <span>Withdrawals</span>
              </button>

              <button
                onClick={() => { setActiveModule('media'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeModule === 'media'
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E2761]'
                }`}
              >
                <Eye size={16} className="text-slate-500" />
                <span>Media Consent</span>
              </button>
            </div>
          </div>

          {/* Navigation Category 3: INSTITUTION MODULES */}
          <div className="mb-6">
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider px-3 mb-2 block">
              INSTITUTION MODULES
            </span>
            <div className="space-y-1">
              <button
                onClick={() => { setShowScheduleModal(true); setIsMobileSidebarOpen(false); }}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1E2761] transition-all text-left cursor-pointer"
              >
                <Plus size={16} className="text-[#FF5A36]" />
                <span>Create Course</span>
              </button>

              <button
                onClick={() => { setActiveModule('courses'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeModule === 'courses'
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E2761]'
                }`}
              >
                <GraduationCap size={16} className="text-slate-500" />
                <span>Manage All Courses</span>
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Footer: Back to Website & Logout */}
        <div className="p-4 border-t border-[#E4E8EE] space-y-1.5 bg-slate-50/60">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#1E2761] hover:bg-white transition-all cursor-pointer"
          >
            <Globe size={15} />
            <span>Public Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN WORKSPACE AREA: Top Utility Header + Dashboard Grid
         ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Utility Bar (1:1 with reference) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E4E8EE] px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button + Search Input */}
          <div className="flex items-center space-x-3 flex-1 max-w-xl">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, trainees, instructors..."
                className="w-full bg-[#F5F7FA] border border-[#E4E8EE] focus:border-[#1E2761] focus:bg-white rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-[#1E2761] placeholder-slate-400 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Center Brand Pill (1:1 with reference) */}
          <div className="hidden xl:flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-extrabold tracking-wider uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>WABISEMINAR CARE GIVING TRAINING CENTER</span>
          </div>

          {/* Right Action Icons: Notification, Language, Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  9
                </span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E4E8EE] rounded-2xl shadow-xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E8EE] mb-2">
                    <span className="text-xs font-bold text-[#1E2761]">System Notifications</span>
                    <span className="text-[10px] font-bold text-[#FF5A36] cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E4E8EE]">
                      <p className="font-bold text-[#1E2761]">9 New Trainees Enrolled</p>
                      <p className="text-[11px] text-slate-500">Caregiving Batch 2026 registration verified.</p>
                      <span className="text-[9px] text-slate-400">10 mins ago</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E4E8EE]">
                      <p className="font-bold text-[#1E2761]">WebRTC Mesh Operational</p>
                      <p className="text-[11px] text-slate-500">Live 1080p WebRTC stream health is at 99.9%.</p>
                      <span className="text-[9px] text-slate-400">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Pill Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Globe size={14} className="text-emerald-200" />
                <span>{selectedLang}</span>
                <ChevronDown size={13} className="text-emerald-300" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-28 bg-white border border-[#E4E8EE] rounded-xl shadow-lg p-1.5 z-50">
                  {['EN', 'AM', 'FR', 'ES'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLang(lang); setShowLangDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        selectedLang === lang ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile User Chip (1:1 with reference) */}
            <div className="relative">
              <div 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2.5 cursor-pointer select-none group pl-1 sm:pl-2"
              >
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-[#1E2761] block leading-tight group-hover:text-emerald-700">
                    {username}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    Admin
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center border border-purple-200 shadow-2xs">
                  {username.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4E8EE] rounded-2xl shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-[#E4E8EE] mb-1">
                    <p className="text-xs font-bold text-[#1E2761]">{username}</p>
                    <p className="text-[10px] text-slate-400">admin@wabiseminar.com</p>
                  </div>
                  <button 
                    onClick={() => { onNavigate('profile'); setShowProfileDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    User Profile
                  </button>
                  <button 
                    onClick={() => { onNavigate('settings'); setShowProfileDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    System Settings
                  </button>
                  <div className="border-t border-[#E4E8EE] my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
          {/* ========================================================
              1. HERO WELCOME BANNER (1:1 with reference)
              Dark Green Gradient, Badge, Greeting, Description
             ======================================================== */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-lg bg-gradient-to-r from-[#14532D] via-[#166534] to-[#15803D]"
          >
            {/* Subtle background glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-3xl"></div>
            
            <div className="relative z-10 max-w-3xl">
              {/* Top Banner Tag */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-emerald-100 border border-white/15 mb-4 backdrop-blur-xs">
                <Crown size={13} className="text-amber-300" />
                <span className="tracking-wide uppercase font-mono">ADMINISTRATION PANEL • WABISEMINAR CAREGIVING TRAINING CENTER</span>
              </div>

              {/* Big Greeting Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
                Welcome, {username}! 👋
              </h1>

              {/* Subtitle Description */}
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed font-normal max-w-2xl mb-6">
                WabiSeminar Caregiving Training Center – manage trainees, courses, finances, and certifications below.
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleCreateRoom()}
                  disabled={isCreating}
                  className="px-6 py-3 rounded-2xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-75"
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin text-white" /> : <Video size={16} />}
                  <span>Start Instant Meeting</span>
                </button>

                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>Create Course</span>
                </button>

                <button
                  onClick={handleCopyPersonalLink}
                  className="px-4 py-3 rounded-2xl bg-black/20 hover:bg-black/30 text-emerald-100 text-xs font-mono font-semibold transition-all flex items-center space-x-2 border border-white/10 cursor-pointer"
                >
                  <span>{copiedPersonalLink ? 'Copied!' : personalRoomId}</span>
                  {copiedPersonalLink ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* ========================================================
              2. THE 4 KPI METRIC STATS CARDS (1:1 with reference)
              Super Admin (2), Trainees (4), Users (5), ETB (0)
             ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Card 1: 2 Super Admin & Admins */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <Crown size={24} />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-[#1E2761] mb-2 tracking-tight">
                2
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-500">
                Super Admin & Admins
              </div>
            </div>

            {/* Card 2: 4 Active Trainees */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <GraduationCap size={24} />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-[#1E2761] mb-2 tracking-tight">
                4
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-500">
                Active Trainees
              </div>
            </div>

            {/* Card 3: 5 Instructors & Users */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <Users size={24} />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-[#1E2761] mb-2 tracking-tight">
                5
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-500">
                Certified Instructors
              </div>
            </div>

            {/* Card 4: 0 ETB (Finances / Free Tier) */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF5A36] flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <TrendingUp size={24} />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-[#1E2761] mb-2 tracking-tight">
                0 ETB
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-500">
                Free WebRTC Tier (0 ms lag)
              </div>
            </div>

          </div>

          {/* ========================================================
              3. OPERATIONAL SPLIT SECTION: 
              Left: Recent Admissions & Directory (with pill filter tabs)
              Right: Admissions & Role Snapshot + Live Hardware Test
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Recent Admissions & Directory (lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 shadow-xs">
              
              {/* Directory Header with "LIVE EXTRACTED" Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-[#E4E8EE]">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-lg sm:text-xl font-black text-[#1E2761]">
                      Recent Admissions & Directory
                    </h2>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>LIVE EXTRACTED</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal">
                    Review recent registrations extracted across Super Admin, Admin, Instructor, and Trainee roles.
                  </p>
                </div>

                {/* Inline Join Bar */}
                <div className="flex items-center bg-[#F5F7FA] border border-[#E4E8EE] focus-within:border-[#1E2761] rounded-2xl p-1 transition-all">
                  <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Enter code to join"
                    className="bg-transparent px-3 py-1.5 text-xs text-[#1E2761] placeholder-slate-400 outline-none w-32 sm:w-40 font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={isJoining || !joinId.trim()}
                    className="px-3.5 py-1.5 rounded-xl font-bold bg-[#1E2761] hover:bg-[#151A44] text-white text-xs transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {isJoining ? <Loader2 size={12} className="animate-spin text-white" /> : 'Join'}
                  </button>
                </div>
              </div>

              {/* Filter Tabs / Pills (1:1 with reference) */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-[#F5F7FA] text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <span>All</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeFilter === 'all' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {filterCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter('admins')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeFilter === 'admins'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-[#F5F7FA] text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <span>Admins</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeFilter === 'admins' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {filterCounts.admins}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter('instructors')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeFilter === 'instructors'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-[#F5F7FA] text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <span>Instructors</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeFilter === 'instructors' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {filterCounts.instructors}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter('trainees')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeFilter === 'trainees'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-[#F5F7FA] text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <span>Trainees</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeFilter === 'trainees' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {filterCounts.trainees}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeFilter === 'pending'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-[#F5F7FA] text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <span>Pending</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeFilter === 'pending' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {filterCounts.pending}
                  </span>
                </button>
              </div>

              {/* Room & Admissions Directory Table/List */}
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-emerald-600" size={28} />
                  <p className="text-xs text-slate-500 font-medium">Extracting live directory...</p>
                </div>
              ) : filteredRooms.length > 0 ? (
                <div className="space-y-3">
                  {filteredRooms.map((room) => (
                    <div 
                      key={room.id || room.roomId}
                      className="bg-[#F5F7FA] border border-[#E4E8EE] hover:border-[#1E2761]/30 rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] shrink-0 font-bold text-xs">
                          <Video size={18} className="text-[#FF5A36]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs sm:text-sm font-bold text-[#1E2761] truncate">
                              {room.roomId}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {room.status || 'Active'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {room.role || 'Super Admin & Admins'} • {new Date(room.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button 
                          onClick={() => onJoinRoom(room.roomId)}
                          className="py-2 px-4 rounded-xl text-xs font-bold bg-[#FF5A36] hover:bg-[#E04826] text-white transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                        >
                          <Video size={13} className="text-white" />
                          <span>Enter</span>
                        </button>

                        <button 
                          onClick={() => handleCopyLink(room.roomId)}
                          className="p-2 rounded-xl text-slate-600 hover:text-[#1E2761] bg-white border border-[#E4E8EE] hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                          title="Copy Link"
                        >
                          {copiedId === room.roomId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>

                        <button 
                          onClick={() => setDeleteModalRoomId(room.roomId || room.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 bg-white border border-[#E4E8EE] hover:bg-rose-50 transition-colors cursor-pointer shadow-2xs"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE] flex items-center justify-center text-slate-400 mb-2.5 mx-auto">
                    <Video size={22} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1E2761] mb-1">
                    No matching records found
                  </h3>
                  <p className="text-slate-500 text-xs max-w-xs mb-4">
                    Clear the filter or search to view all courses and trainees.
                  </p>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Admissions & Role Snapshot + Live Hardware Test (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Box 1: Admissions & Role Snapshot (1:1 with reference) */}
              <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 shadow-xs">
                
                {/* Snapshot Header with "17 Users" pill */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E4E8EE]">
                  <h3 className="text-base font-black text-[#1E2761]">
                    Admissions & Role Snapshot
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-[#F5F7FA] px-2.5 py-1 rounded-full border border-[#E4E8EE]">
                    17 Users
                  </span>
                </div>

                {/* Role 1: Super Admin & Admins (2 / 12%) */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center space-x-1.5 text-purple-700">
                      <Crown size={14} />
                      <span>Super Admin & Admins</span>
                    </div>
                    <span className="text-slate-500">2 (12%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>

                {/* Role 2: Certified Instructors (5 / 29%) */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center space-x-1.5 text-sky-700">
                      <Users size={14} />
                      <span>Certified Instructors</span>
                    </div>
                    <span className="text-slate-500">5 (29%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '29%' }}></div>
                  </div>
                </div>

                {/* Role 3: Trainees (7 / 41%) */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center space-x-1.5 text-emerald-700">
                      <GraduationCap size={14} />
                      <span>Trainees</span>
                    </div>
                    <span className="text-slate-500">7 (41%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '41%' }}></div>
                  </div>
                </div>

                {/* Role 4: Pending / Screened (3 / 18%) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center space-x-1.5 text-amber-600">
                      <Clock size={14} />
                      <span>Pending Verification</span>
                    </div>
                    <span className="text-slate-500">3 (18%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>

              </div>

              {/* Box 2: Live Hardware Studio Preview & Mic Audio Meter */}
              <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 shadow-xs">
                
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E4E8EE]">
                  <div className="flex items-center space-x-2">
                    <Camera size={16} className="text-[#FF5A36]" />
                    <h3 className="text-sm font-black text-[#1E2761]">
                      Studio Camera & Audio Test
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    WebRTC Ready
                  </span>
                </div>

                {/* Video Monitor */}
                <div className="w-full aspect-video bg-[#1E2761] rounded-2xl relative overflow-hidden flex items-center justify-center border border-[#151A44] shadow-sm mb-3">
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
                          <VideoOff size={28} className="text-slate-400 mb-1" />
                          <span className="text-xs text-slate-300 font-bold">Camera Paused</span>
                        </div>
                      )}

                      {/* Microphone Meter */}
                      {previewMicActive && (
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-[#E4E8EE] shadow-xs z-20">
                          <Mic size={11} className="text-[#FF5A36]" />
                          <div className="w-14 h-1.5 bg-[#E4E8EE] rounded-full overflow-hidden flex items-center">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                              style={{ width: `${Math.max(10, audioLevel)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Studio Preview Controls */}
                      <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-2 z-20">
                        <button
                          onClick={togglePreviewCam}
                          className={`p-1.5 rounded-xl border shadow-xs transition-all cursor-pointer flex items-center justify-center ${
                            previewCamActive 
                              ? 'bg-white/90 text-[#1E2761] border-white hover:bg-white' 
                              : 'bg-[#FF5A36] text-white border-[#FF5A36]'
                          }`}
                          title="Toggle Camera"
                        >
                          {previewCamActive ? <Video size={14} /> : <VideoOff size={14} />}
                        </button>
                        
                        <button
                          onClick={togglePreviewMic}
                          className={`p-1.5 rounded-xl border shadow-xs transition-all cursor-pointer flex items-center justify-center ${
                            previewMicActive 
                              ? 'bg-white/90 text-[#1E2761] border-white hover:bg-white' 
                              : 'bg-[#FF5A36] text-white border-[#FF5A36]'
                          }`}
                          title="Toggle Mic"
                        >
                          {previewMicActive ? <Mic size={14} /> : <MicOff size={14} />}
                        </button>

                        <button
                          onClick={toggleHardwarePreview}
                          className="px-2.5 py-1 rounded-xl bg-white/90 hover:bg-white text-[#1E2761] text-[11px] font-bold border border-white shadow-xs cursor-pointer"
                        >
                          Stop
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center text-white">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-2 mx-auto">
                        <Camera size={20} className="text-[#FF5A36]" />
                      </div>
                      <p className="text-[11px] text-slate-300 max-w-xs mb-2.5 font-normal">
                        Verify camera and mic prior to masterclass admission.
                      </p>
                      <button
                        onClick={toggleHardwarePreview}
                        className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer flex items-center space-x-1.5"
                      >
                        <Play size={11} className="fill-current" />
                        <span>Preview Camera</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Host Permanent URL</span>
                  <button 
                    onClick={handleCopyPersonalLink}
                    className="text-[#FF5A36] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedPersonalLink ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedPersonalLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

      {/* ========================================================
          MODALS & DRAWERS
         ======================================================== */}

      {/* Create Course / Schedule Masterclass Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E8EE] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#1E2761] p-1.5 rounded-full bg-slate-50 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1E2761]">Create New Course</h3>
                <p className="text-xs text-slate-500">Configure curriculum session and room code</p>
              </div>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caregiving Foundation & Vital Signs"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-xl px-3.5 py-2.5 text-xs text-[#1E2761] outline-none focus:border-[#1E2761]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-xl px-3 py-2 text-xs text-[#1E2761] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-xl px-3 py-2 text-xs text-[#1E2761] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E4E8EE] font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalRoomId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E8EE] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center flex flex-col items-center">
            <button 
              onClick={() => !isDeleting && setDeleteModalRoomId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#1E2761] p-1.5 rounded-full bg-slate-50 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 mx-auto">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-bold text-[#1E2761] mb-1">Delete Room?</h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-5">
              Are you sure you want to delete room <strong className="font-mono text-[#FF5A36]">{deleteModalRoomId}</strong>?
            </p>
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => setDeleteModalRoomId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-bold bg-white hover:bg-slate-50 text-slate-700 border border-[#E4E8EE] text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white flex justify-center items-center gap-1.5 text-xs shadow-xs cursor-pointer"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin text-white" /> : null}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Users & Enroll Modal */}
      {showAttendeesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E8EE] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAttendeesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#1E2761] p-1.5 rounded-full bg-slate-50 hover:bg-slate-100"
            >
              <X size={16} />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1E2761]">Enroll & Manage Users</h3>
                <p className="text-xs text-slate-500">17 registered users across active roles</p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {[
                { name: 'Kenenisa Beyan', role: 'Super Admin', status: 'Active', badge: 'bg-purple-100 text-purple-800' },
                { name: 'Dr. Elena Rostova', role: 'Admin & Co-Host', status: 'Active', badge: 'bg-purple-100 text-purple-800' },
                { name: 'Abebe Kebede', role: 'Certified Instructor', status: 'In Session', badge: 'bg-sky-100 text-sky-800' },
                { name: 'Sara Tesfaye', role: 'Certified Instructor', status: 'Active', badge: 'bg-sky-100 text-sky-800' },
                { name: 'Yared Alemu', role: 'Trainee', status: 'Enrolled', badge: 'bg-emerald-100 text-emerald-800' },
                { name: 'Selamawit D.', role: 'Trainee', status: 'Enrolled', badge: 'bg-emerald-100 text-emerald-800' },
                { name: 'Dawit Girma', role: 'Waiting Room', status: 'Pending Approval', badge: 'bg-amber-100 text-amber-800' },
              ].map((u, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-[#E4E8EE] text-xs">
                  <div>
                    <span className="font-bold text-[#1E2761] block">{u.name}</span>
                    <span className="text-[10px] text-slate-500">{u.role}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.badge}`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-2 border-t border-[#E4E8EE] flex justify-end">
              <button
                onClick={() => setShowAttendeesModal(false)}
                className="px-5 py-2 rounded-xl bg-[#1E2761] text-white text-xs font-bold cursor-pointer hover:bg-[#151A44]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
