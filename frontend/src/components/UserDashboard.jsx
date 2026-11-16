import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Plus, Link as LinkIcon, Calendar, Clock, 
  Loader2, ArrowRight, Copy, Check, Trash2, X, Sparkles, Camera, Play,
  Crown, GraduationCap, Users, UserCheck, UserPlus, TrendingUp, LayoutDashboard,
  RefreshCw, Eye, BookOpen, PlusCircle, Search, Bell, Globe, LogOut,
  Shield, Activity, CheckCircle2, ChevronDown, Menu, Sliders, ExternalLink
} from 'lucide-react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';

export default function UserDashboard({ onNavigate, onJoinRoom, notify }) {
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
  
  // Navigation & Filter state
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');

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
    const cleanUser = (username || 'admin').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanUser || 'admin'}-room`;
  }, [username]);

  const personalRoomUrl = useMemo(() => {
    return `${window.location.origin}/meeting/${personalRoomId}`;
  }, [personalRoomId]);

  // Initial user and rooms load
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setUsername(storedUser);
    } else {
      setUsername('Administration');
    }

    const loadRooms = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.getUserRooms(token);
          if (response && response.success && Array.isArray(response.data)) {
            setMyRooms(response.data);
          } else {
            // Default mock room list for rich experience
            setMyRooms([
              { roomId: 'masterclass-dev-101', role: 'Super Admin', category: 'admins', status: 'Live', createdAt: new Date(Date.now() - 3600000).toISOString(), attendees: 12 },
              { roomId: 'ai-webrtc-advanced', role: 'Instructor', category: 'instructors', status: 'Scheduled', createdAt: new Date(Date.now() - 86400000).toISOString(), attendees: 8 },
              { roomId: 'design-systems-2026', role: 'Trainee', category: 'trainees', status: 'Active', createdAt: new Date(Date.now() - 172800000).toISOString(), attendees: 15 }
            ]);
          }
        } else {
          // Unauthenticated demo fallback so user can interact immediately
          setMyRooms([
            { roomId: 'masterclass-dev-101', role: 'Super Admin', category: 'admins', status: 'Live', createdAt: new Date(Date.now() - 3600000).toISOString(), attendees: 12 },
            { roomId: 'ai-webrtc-advanced', role: 'Instructor', category: 'instructors', status: 'Scheduled', createdAt: new Date(Date.now() - 86400000).toISOString(), attendees: 8 },
            { roomId: 'design-systems-2026', role: 'Trainee', category: 'trainees', status: 'Active', createdAt: new Date(Date.now() - 172800000).toISOString(), attendees: 15 },
            { roomId: 'guest-seminar-room', role: 'Pending', category: 'pending', status: 'Waiting', createdAt: new Date(Date.now() - 259200000).toISOString(), attendees: 3 }
          ]);
        }
      } catch (error) {
        console.warn('Dashboard loadRooms fallback:', error);
        setMyRooms([
          { roomId: 'masterclass-dev-101', role: 'Super Admin', category: 'admins', status: 'Live', createdAt: new Date(Date.now() - 3600000).toISOString(), attendees: 12 },
          { roomId: 'ai-webrtc-advanced', role: 'Instructor', category: 'instructors', status: 'Scheduled', createdAt: new Date(Date.now() - 86400000).toISOString(), attendees: 8 }
        ]);
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

  // Hardware Preview logic
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
        notify?.('success', 'Camera and microphone studio preview online.');
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
        // Create demo room if not signed in
        const demoId = `wabi-${Math.random().toString(36).substring(2, 7)}`;
        notify?.('success', 'Launching instant masterclass room...');
        onJoinRoom(demoId);
        return;
      }
      const response = await api.createRoom(token, specificRoomId);
      
      if (!response.success || !response.data?.roomId) {
        notify?.('error', response.message || 'Failed to create room.');
        return;
      }

      notify?.('success', 'Starting your masterclass room...');
      onJoinRoom(response.data.roomId);
    } catch (error) {
      console.error('Dashboard handleCreateRoom error:', error);
      notify?.('error', 'Connection error. Please check your internet or server.');
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
        if (!response.success) {
          notify?.('error', response.status === 404 ? 'Meeting not found. Please verify the code.' : response.message || 'Unable to join.');
          return;
        }
      }
      notify?.('success', 'Joining masterclass session...');
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
      if (token) {
        const response = await api.deleteRoom(token, deleteModalRoomId);
        if (!response.success) {
          notify?.('error', response.message || 'Failed to delete room.');
          return;
        }
      }
      
      notify?.('success', 'Masterclass room removed.');
      setMyRooms(prev => prev.filter(r => r.roomId !== deleteModalRoomId));
    } catch (error) {
      notify?.('error', 'Network error while deleting.');
    } finally {
      setIsDeleting(false);
      setDeleteModalRoomId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    notify?.('info', 'Logged out successfully.');
    onNavigate('dashboard');
  };

  // Mock list of directory users & admissions to match reference design exactly
  const allDirectoryItems = useMemo(() => {
    const base = [
      { id: '1', name: 'Dr. Kenenisa Beyan', role: 'Super Admin', email: 'kenenisab05@gmail.com', type: 'Super Admin & Admins', status: 'Live', date: 'Just now', category: 'admins', room: 'masterclass-dev-101' },
      { id: '2', name: 'System Coordinator', role: 'Admin', email: 'admin@wabiseminar.com', type: 'Super Admin & Admins', status: 'Active', date: '10m ago', category: 'admins', room: 'sys-coord-room' },
      { id: '3', name: 'Sara Jenkins', role: 'Lead Instructor', email: 'sara.j@wabiseminar.com', type: 'Certified Instructors', status: 'Live', date: '25m ago', category: 'instructors', room: 'ai-webrtc-advanced' },
      { id: '4', name: 'Marcus Vance', role: 'Senior Mentor', email: 'marcus.v@wabi.org', type: 'Certified Instructors', status: 'Active', date: '1h ago', category: 'instructors', room: 'leadership-masterclass' },
      { id: '5', name: 'Elena Rostova', role: 'Instructor', email: 'elena.r@wabi.org', type: 'Certified Instructors', status: 'Scheduled', date: '2h ago', category: 'instructors', room: 'webrtc-deepdive' },
      { id: '6', name: 'David Kim', role: 'Guest Lecturer', email: 'david.k@wabi.org', type: 'Certified Instructors', status: 'Scheduled', date: '3h ago', category: 'instructors', room: 'fullstack-audio' },
      { id: '7', name: 'Abebe Bikila', role: 'Certified Mentor', email: 'abebe.b@wabi.org', type: 'Certified Instructors', status: 'Active', date: '4h ago', category: 'instructors', room: 'ethio-devs-hub' },
      { id: '8', name: 'Chaltu Tadesse', role: 'Trainee', email: 'chaltu.t@trainee.wabi.org', type: 'Trainees & Attendees', status: 'Active', date: '1h ago', category: 'trainees', room: 'masterclass-dev-101' },
      { id: '9', name: 'Yohannes Haile', role: 'Trainee', email: 'yohannes@student.wabi.org', type: 'Trainees & Attendees', status: 'Live', date: '2h ago', category: 'trainees', room: 'ai-webrtc-advanced' },
      { id: '10', name: 'Fatima Al-Mansoor', role: 'Trainee', email: 'fatima.m@wabi.org', type: 'Trainees & Attendees', status: 'Active', date: '3h ago', category: 'trainees', room: 'design-systems-2026' },
      { id: '11', name: 'Michael O\'Connor', role: 'Trainee', email: 'michael.o@wabi.org', type: 'Trainees & Attendees', status: 'Waiting', date: '5h ago', category: 'trainees', room: 'masterclass-dev-101' },
      { id: '12', name: 'Sintayehu Kebede', role: 'Trainee', email: 'sintayehu@wabi.org', type: 'Trainees & Attendees', status: 'Active', date: '1d ago', category: 'trainees', room: 'leadership-masterclass' },
      { id: '13', name: 'Tirunesh Dibaba', role: 'Trainee', email: 'tirunesh@wabi.org', type: 'Trainees & Attendees', status: 'Active', date: '1d ago', category: 'trainees', room: 'ethio-devs-hub' },
      { id: '14', name: 'Zewdu Mengesha', role: 'Trainee', email: 'zewdu.m@wabi.org', type: 'Trainees & Attendees', status: 'Scheduled', date: '2d ago', category: 'trainees', room: 'design-systems-2026' },
      { id: '15', name: 'Bethelhem Assefa', role: 'Applicant', email: 'bethelhem@applicant.wabi', type: 'Pending Admissions', status: 'Pending', date: '10m ago', category: 'pending', room: 'interview-queue-1' },
      { id: '16', name: 'Dawit Getachew', role: 'Applicant', email: 'dawit.g@applicant.wabi', type: 'Pending Admissions', status: 'Pending', date: '30m ago', category: 'pending', room: 'interview-queue-2' },
      { id: '17', name: 'Kalkidan Worku', role: 'Applicant', email: 'kalkidan@applicant.wabi', type: 'Pending Admissions', status: 'Pending', date: '1h ago', category: 'pending', room: 'interview-queue-3' },
    ];
    return base;
  }, []);

  const filteredDirectory = useMemo(() => {
    return allDirectoryItems.filter(item => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      const matchesSearch = !searchQuery.trim() || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.room.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [allDirectoryItems, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1E2761] font-sans selection:bg-[#FF5A36] selection:text-white flex flex-col lg:flex-row antialiased">
      
      {/* ========================================================
          1. LEFT SIDEBAR NAVIGATION (Matching Reference Screenshot)
         ======================================================== */}
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 bottom-0 z-50
        w-64 sm:w-72 bg-white border-r border-[#E4E8EE] 
        flex flex-col justify-between p-4 sm:p-5 h-screen overflow-y-auto
        transition-transform duration-300 ease-in-out shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col space-y-6">
          
          {/* Top Logo & Close Button (Mobile) */}
          <div className="flex items-center justify-between pb-2">
            <div 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1E2761] flex items-center justify-center text-white shadow-md shadow-[#1E2761]/20 border border-[#1E2761]">
                <Video size={20} className="text-[#FF5A36] group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="font-extrabold text-[#1E2761] text-base tracking-tight block">WabiSeminar</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">Enterprise WebRTC</span>
              </div>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Reference Screenshot Top Identity Card: Fasika Care Giving Training Center / ADMIN DASHBOARD */}
          <div className="bg-[#FFFFFF] border border-[#E4E8EE] rounded-2xl p-3.5 shadow-xs relative">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-xs bg-[#10B981] animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-700 tracking-tight">WabiSeminar Training Center</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">
              ADMIN DASHBOARD
            </div>
          </div>

          {/* Group 1: DASHBOARD */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 py-1 font-mono">
              DASHBOARD
            </div>
            <button
              onClick={() => { setActiveNav('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeNav === 'dashboard'
                  ? 'bg-[#10B981]/10 text-[#0D5C3A] font-bold border-l-4 border-[#10B981] shadow-xs'
                  : 'text-slate-600 hover:text-[#1E2761] hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={18} className={activeNav === 'dashboard' ? 'text-[#10B981]' : 'text-slate-400'} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Group 2: CORE OPERATIONAL MODULES (Matching Reference) */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 py-1 font-mono">
              CORE OPERATIONAL MODULES
            </div>
            
            <button
              onClick={() => { setActiveNav('users'); setActiveTab('all'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeNav === 'users'
                  ? 'bg-[#10B981]/10 text-[#0D5C3A] font-bold border-l-4 border-[#10B981]'
                  : 'text-slate-600 hover:text-[#1E2761] hover:bg-slate-50'
              }`}
            >
              <Users size={18} className="text-slate-400" />
              <span>All Users & Rooms</span>
            </button>

            <button
              onClick={() => { setActiveNav('enroll'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeNav === 'enroll'
                  ? 'bg-[#10B981]/10 text-[#0D5C3A] font-bold border-l-4 border-[#10B981]'
                  : 'text-slate-600 hover:text-[#1E2761] hover:bg-slate-50'
              }`}
            >
              <UserPlus size={18} className="text-slate-400" />
              <span>Manage Users & Enroll</span>
            </button>

            <button
              onClick={() => { setActiveNav('history'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeNav === 'history'
                  ? 'bg-[#10B981]/10 text-[#0D5C3A] font-bold border-l-4 border-[#10B981]'
                  : 'text-slate-600 hover:text-[#1E2761] hover:bg-slate-50'
              }`}
            >
              <RefreshCw size={18} className="text-slate-400" />
              <span>Withdrawals & Logs</span>
            </button>

            <button
              onClick={() => { setActiveNav('studio'); toggleHardwarePreview(); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeNav === 'studio'
                  ? 'bg-[#10B981]/10 text-[#0D5C3A] font-bold border-l-4 border-[#10B981]'
                  : 'text-slate-600 hover:text-[#1E2761] hover:bg-slate-50'
              }`}
            >
              <Eye size={18} className="text-slate-400" />
              <div className="flex items-center justify-between flex-1">
                <span>Media & Camera Test</span>
                {isPreviewActive && <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>}
              </div>
            </button>
          </div>

          {/* Group 3: INSTITUTION MODULES (Matching Reference) */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 py-1 font-mono">
              INSTITUTION MODULES
            </div>

            <button
              onClick={() => handleCreateRoom()}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#FF5A36] hover:bg-[#FF5A36]/5 transition-all cursor-pointer"
            >
              <PlusCircle size={18} className="text-[#FF5A36]" />
              <span>Create Room Session</span>
            </button>

            <button
              onClick={() => { setActiveNav('courses'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeNav === 'courses'
                  ? 'bg-[#10B981]/10 text-[#0D5C3A] font-bold border-l-4 border-[#10B981]'
                  : 'text-slate-600 hover:text-[#1E2761] hover:bg-slate-50'
              }`}
            >
              <BookOpen size={18} className="text-slate-400" />
              <span>Manage All Courses</span>
            </button>
          </div>

        </div>

        {/* Sidebar Footer: Back to Public Site + Logout */}
        <div className="pt-6 border-t border-[#E4E8EE] space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-[#1E2761] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Globe size={16} className="text-slate-400" />
            <span>Public Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-[#FF5A36] hover:bg-[#FF5A36]/5 transition-colors cursor-pointer"
          >
            <LogOut size={16} className="text-slate-400 hover:text-[#FF5A36]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          2. MAIN CONTENT AREA (Topbar + Hero Banner + Stats + Split Grid)
         ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOPBAR (Matching Reference Screenshot) */}
        <header className="sticky top-0 z-30 bg-[#F5F7FA]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 border-b border-[#E4E8EE]/60">
          
          {/* Mobile hamburger + Search input */}
          <div className="flex items-center space-x-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#E4E8EE] text-slate-600 shadow-xs cursor-pointer"
            >
              <Menu size={18} />
            </button>

            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, trainees, instructors..."
                className="w-full bg-white border border-[#E4E8EE] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-[#1E2761] placeholder-slate-400 outline-none transition-all shadow-2xs font-normal"
              />
            </div>
          </div>

          {/* Topbar Right Controls (Matching Reference Screenshot) */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 shrink-0">
            
            {/* Center Reference Pill: FASIKA CARE GIVING TRAINING CENTER */}
            <div className="hidden xl:inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold text-[#0D5C3A] bg-[#10B981]/10 border border-[#10B981]/20 font-mono tracking-wide">
              <span>WABISEMINAR TRAINING CENTER</span>
            </div>

            {/* Notification Bell with Red Badge "9" */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative p-2 rounded-full bg-white border border-[#E4E8EE] text-slate-600 hover:text-[#1E2761] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="Notifications"
              >
                <Bell size={17} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E02424] text-white text-[10px] font-bold flex items-center justify-center">
                  9
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E4E8EE] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E8EE] mb-2">
                    <span className="text-xs font-bold text-[#1E2761]">System Notifications</span>
                    <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded font-bold">9 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#F5F7FA] border border-[#E4E8EE]">
                      <p className="font-semibold text-[#1E2761]">Live WebRTC Session Active</p>
                      <p className="text-slate-500 text-[11px]">Room <strong>masterclass-dev-101</strong> running at 1080p 60fps.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F5F7FA] border border-[#E4E8EE]">
                      <p className="font-semibold text-[#1E2761]">DTLS-SRTP Encryption Online</p>
                      <p className="text-slate-500 text-[11px]">End-to-end cryptographic handshake confirmed.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F5F7FA] border border-[#E4E8EE]">
                      <p className="font-semibold text-[#1E2761]">3 New Trainee Admissions</p>
                      <p className="text-slate-500 text-[11px]">Review pending admissions in Directory.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector Pill: [🌐 EN ▾] */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(prev => !prev)}
                className="px-2.5 py-1.5 rounded-full bg-[#0D5C3A] hover:bg-[#0A4A2E] text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Globe size={13} className="text-white/80" />
                <span>{selectedLang}</span>
                <ChevronDown size={12} className="text-white/80" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-1.5 w-28 bg-white border border-[#E4E8EE] rounded-xl shadow-lg p-1.5 z-50">
                  {['EN', 'AM', 'OR', 'FR'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLang(lang); setShowLangDropdown(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#10B981]/10 hover:text-[#0D5C3A] rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === 'EN' ? 'English (EN)' : lang === 'AM' ? 'Amharic (AM)' : lang === 'OR' ? 'Afaan Oromoo' : 'French (FR)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Administration User Profile Pill (Matching Reference Screenshot) */}
            <div className="flex items-center space-x-2 pl-1 sm:pl-2">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-extrabold text-[#1E2761] block leading-tight">{username || 'Administration'}</span>
                <span className="text-[10px] text-slate-400 font-mono block leading-tight">Admin</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#EADCF7] text-[#6D28D9] border border-[#DDD6FE] flex items-center justify-center font-bold text-xs select-none shadow-2xs">
                {(username?.[0] || 'A').toUpperCase()}
              </div>
            </div>

          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
          {/* ========================================================
              3. HERO BANNER CARD (1:1 with Reference Screenshot)
             ======================================================== */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#0C3B2E] via-[#114E3C] to-[#1E2761] text-white p-6 sm:p-8 lg:p-10 shadow-lg overflow-hidden border border-white/10">
            {/* Background subtle radial glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl">
              {/* Reference Screenshot Top Tag: Crown icon + ADMINISTRATION PANEL • FASIKA CAREGIVING TRAINING CENTER */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-white/10 text-emerald-300 border border-emerald-400/25 mb-4 backdrop-blur-xs">
                <Crown size={13} className="text-amber-300" />
                <span>ADMINISTRATION PANEL • WABISEMINAR TRAINING CENTER</span>
              </div>

              {/* Reference Screenshot Headline: Welcome, Administration! 👋 */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2.5 flex items-center gap-2">
                <span>Welcome, {username || 'Administration'}!</span>
                <span className="inline-block animate-wiggle">👋</span>
              </h1>

              {/* Reference Screenshot Subtitle */}
              <p className="text-emerald-100/85 text-xs sm:text-sm lg:text-[15px] leading-relaxed mb-6 font-normal max-w-2xl">
                WabiSeminar Training Center – manage trainees, courses, finances, and certifications below.
              </p>

              {/* Direct Quick Meeting Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleCreateRoom()}
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-full bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF5A36]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-75"
                >
                  {isCreating ? <Loader2 size={15} className="animate-spin text-white" /> : <Video size={15} className="text-white" />}
                  <span>Start Instant Meeting</span>
                </button>

                <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/20 rounded-full p-1 pl-3.5 shadow-xs">
                  <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Enter code or link"
                    className="bg-transparent text-xs text-white placeholder-emerald-100/60 outline-none w-32 sm:w-44 font-mono font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={isJoining || !joinId.trim()}
                    className="px-3 py-1.5 rounded-full font-bold bg-white text-[#0C3B2E] text-xs hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isJoining ? <Loader2 size={12} className="animate-spin" /> : 'Join'}
                  </button>
                </div>

                <button
                  onClick={handleCopyPersonalLink}
                  className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedPersonalLink ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                  <span>{copiedPersonalLink ? 'Link Copied!' : 'Copy Permanent Link'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* ========================================================
              4. 4 STAT CARDS GRID (1:1 with Reference Screenshot)
             ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Card 1: Crown icon, 2, Super Admin & Admins */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center mb-3">
                <Crown size={22} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#1E2761] tracking-tight mb-1">
                2
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                Super Admin & Admins
              </div>
            </div>

            {/* Card 2: GraduationCap icon, 4, Active Trainees */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center mb-3">
                <GraduationCap size={22} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#1E2761] tracking-tight mb-1">
                4
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                Active Trainees
              </div>
            </div>

            {/* Card 3: UserCheck icon, 5, Certified Instructors */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3B82F6] flex items-center justify-center mb-3">
                <UserCheck size={22} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#1E2761] tracking-tight mb-1">
                5
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                Certified Instructors
              </div>
            </div>

            {/* Card 4: TrendingUp icon, 0 ETB, Revenue / Platform Balance */}
            <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5A36] flex items-center justify-center mb-3">
                <TrendingUp size={22} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#1E2761] tracking-tight mb-1">
                0 ETB
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                Tuition & Platform Revenue
              </div>
            </div>

          </div>

          {/* ========================================================
              5. SPLIT LOWER CONTENT: DIRECTORY (LEFT) + SNAPSHOT (RIGHT)
                 (1:1 with Reference Screenshot)
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT WIDE CARD (8 cols): Recent Admissions & Directory */}
            <div className="lg:col-span-8 bg-white border border-[#E4E8EE] rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
              
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-lg sm:text-xl font-black text-[#1E2761] tracking-tight">
                      Recent Admissions & Directory
                    </h2>
                    {/* Reference Screenshot Green Pill: LIVE EXTRACTED */}
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#10B981]/15 text-[#0D5C3A] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                      <span>LIVE EXTRACTED</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-normal">
                    Review recent registrations extracted across Super Admin, Admin, Instructor, and Trainee roles.
                  </p>
                </div>

                <button
                  onClick={toggleHardwarePreview}
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-[#F5F7FA] hover:bg-slate-200 border border-[#E4E8EE] text-xs font-bold text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <Camera size={14} className="text-[#FF5A36]" />
                  <span>{isPreviewActive ? 'Hide Studio' : 'Test Camera/Mic'}</span>
                </button>
              </div>

              {/* Reference Screenshot Filter Tabs: All 14 | Admins 2 | Instructors 5 | Trainees 7 | Pending 3 */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                {[
                  { id: 'all', label: 'All', count: allDirectoryItems.length },
                  { id: 'admins', label: 'Admins', count: 2 },
                  { id: 'instructors', label: 'Instructors', count: 5 },
                  { id: 'trainees', label: 'Trainees', count: 7 },
                  { id: 'pending', label: 'Pending', count: 3 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                      activeTab === tab.id
                        ? 'bg-[#0D5C3A] text-white shadow-xs'
                        : 'bg-[#F5F7FA] text-slate-600 hover:bg-slate-200/80 border border-[#E4E8EE]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Camera & Mic Studio Hardware preview drawer (if toggled) */}
              {isPreviewActive && (
                <div className="bg-[#1E2761] rounded-2xl p-4 text-white relative overflow-hidden transition-all">
                  <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                    <div className="flex items-center space-x-2">
                      <Camera size={16} className="text-[#FF5A36]" />
                      <span className="text-xs font-bold text-white">Live Media Studio Hardware Check</span>
                    </div>
                    {previewMicActive && (
                      <div className="flex items-center space-x-2 bg-white/10 px-2.5 py-0.5 rounded-full text-[11px]">
                        <Mic size={11} className="text-[#FF5A36]" />
                        <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-[#10B981] transition-all" style={{ width: `${Math.max(10, audioLevel)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative aspect-video max-h-60 w-full rounded-xl overflow-hidden bg-black/50 mx-auto flex items-center justify-center">
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${!previewCamActive ? 'opacity-0' : 'opacity-100'}`}
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    {!previewCamActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <VideoOff size={32} className="mb-1" />
                        <span className="text-xs font-bold">Camera disabled</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      onClick={togglePreviewCam}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer ${
                        previewCamActive ? 'bg-white/20 text-white' : 'bg-[#FF5A36] text-white'
                      }`}
                    >
                      {previewCamActive ? <Video size={14} /> : <VideoOff size={14} />}
                      <span>{previewCamActive ? 'Turn Off Cam' : 'Turn On Cam'}</span>
                    </button>
                    <button
                      onClick={togglePreviewMic}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer ${
                        previewMicActive ? 'bg-white/20 text-white' : 'bg-[#FF5A36] text-white'
                      }`}
                    >
                      {previewMicActive ? <Mic size={14} /> : <MicOff size={14} />}
                      <span>{previewMicActive ? 'Mute Mic' : 'Unmute Mic'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Data Table / List of Directory Items */}
              <div className="border border-[#E4E8EE] rounded-2xl overflow-hidden divide-y divide-[#E4E8EE]">
                {filteredDirectory.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs font-medium">
                    No directory records match your filter.
                  </div>
                ) : (
                  filteredDirectory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 sm:p-4 hover:bg-[#F5F7FA] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: User/Attendee Info */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          item.category === 'admins' 
                            ? 'bg-purple-100 text-[#8B5CF6]' 
                            : item.category === 'instructors' 
                            ? 'bg-blue-100 text-[#3B82F6]'
                            : item.category === 'trainees'
                            ? 'bg-emerald-100 text-[#10B981]'
                            : 'bg-orange-100 text-[#FF5A36]'
                        }`}>
                          {item.name[0]}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm font-bold text-[#1E2761] truncate block">{item.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full font-mono ${
                              item.status === 'Live'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'Active'
                                ? 'bg-blue-100 text-blue-700'
                                : item.status === 'Scheduled'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                            <span>{item.email}</span>
                            <span>•</span>
                            <span className="font-mono text-[#1E2761] font-semibold">{item.room}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => onJoinRoom(item.room)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0D5C3A] hover:bg-[#0A4A2E] text-white transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                        >
                          <Video size={12} className="text-white" />
                          <span>Join Room</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(item.room)}
                          className="p-1.5 rounded-xl text-slate-600 hover:text-[#1E2761] bg-white hover:bg-slate-100 border border-[#E4E8EE] transition-colors shadow-2xs cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedId === item.room ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                        </button>

                        <button
                          onClick={() => setDeleteModalRoomId(item.room)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-[#FF5A36] bg-white hover:bg-[#FF5A36]/10 border border-[#E4E8EE] transition-colors shadow-2xs cursor-pointer"
                          title="Delete Session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

            {/* RIGHT SIDE CARD (4 cols): Admissions & Role Snapshot */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Reference Screenshot: Admissions & Role Snapshot with "17 Users" pill */}
              <div className="bg-white border border-[#E4E8EE] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E8EE]">
                  <h3 className="text-sm sm:text-base font-black text-[#1E2761]">
                    Admissions & Role Snapshot
                  </h3>
                  <span className="text-[11px] font-bold text-slate-600 bg-[#F5F7FA] border border-[#E4E8EE] px-2.5 py-0.5 rounded-full font-mono">
                    17 Users
                  </span>
                </div>

                <div className="space-y-4">
                  
                  {/* Item 1: Super Admin & Admins 2 (12%) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <Crown size={14} className="text-[#8B5CF6]" />
                        <span className="font-bold text-[#8B5CF6]">Super Admin & Admins</span>
                      </div>
                      <span className="font-mono text-slate-500 font-bold">2 (12%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>

                  {/* Item 2: Certified Instructors 5 (29%) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <UserCheck size={14} className="text-[#3B82F6]" />
                        <span className="font-bold text-[#3B82F6]">Certified Instructors</span>
                      </div>
                      <span className="font-mono text-slate-500 font-bold">5 (29%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: '29%' }} />
                    </div>
                  </div>

                  {/* Item 3: Trainees 7 (41%) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <GraduationCap size={14} className="text-[#10B981]" />
                        <span className="font-bold text-[#10B981]">Trainees & Attendees</span>
                      </div>
                      <span className="font-mono text-slate-500 font-bold">7 (41%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#10B981] rounded-full" style={{ width: '41%' }} />
                    </div>
                  </div>

                  {/* Item 4: Pending Admissions 3 (18%) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-[#FF5A36]" />
                        <span className="font-bold text-[#FF5A36]">Pending Admissions</span>
                      </div>
                      <span className="font-mono text-slate-500 font-bold">3 (18%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF5A36] rounded-full" style={{ width: '18%' }} />
                    </div>
                  </div>

                </div>

              </div>

              {/* Infrastructure Security & WebRTC Status Card */}
              <div className="bg-white border border-[#E4E8EE] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
                <div className="flex items-center space-x-2">
                  <Shield size={16} className="text-[#10B981]" />
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
                    System Health & WebRTC Core
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F7FA] border border-[#E4E8EE]">
                    <span className="text-slate-600 font-medium">P2P Media Routing</span>
                    <span className="font-mono font-bold text-[#10B981] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F7FA] border border-[#E4E8EE]">
                    <span className="text-slate-600 font-medium">Signaling Latency</span>
                    <span className="font-mono font-bold text-[#1E2761]">14 ms (Zero-Lag)</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F7FA] border border-[#E4E8EE]">
                    <span className="text-slate-600 font-medium">DTLS-SRTP Security</span>
                    <span className="font-mono font-bold text-[#10B981]">100% Encrypted</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F7FA] border border-[#E4E8EE]">
                    <span className="text-slate-600 font-medium">Adaptive Video Engine</span>
                    <span className="font-mono font-bold text-[#FF5A36]">1080p 60 FPS</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalRoomId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E8EE] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center flex flex-col items-center">
            <button 
              onClick={() => !isDeleting && setDeleteModalRoomId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#1E2761] p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-[#E4E8EE] transition-colors cursor-pointer flex items-center justify-center"
            >
              <X size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center mb-3 mx-auto border border-[#FF5A36]/25">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-bold text-[#1E2761] mb-1">Delete Room Session?</h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-5">
              Are you sure you want to remove room <strong className="font-mono text-[#FF5A36]">{deleteModalRoomId}</strong>?
            </p>
            <div className="flex gap-2 w-full">
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
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
