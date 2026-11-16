import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Plus, Link as LinkIcon, Calendar, Clock, 
  Loader2, ArrowRight, Copy, Check, Trash2, X, Sparkles, Camera, Play,
  Search, Bell, Globe, LayoutDashboard, Users, UserPlus, BookOpen, 
  Eye, LogOut, Settings, TrendingUp, GraduationCap, Crown, ChevronDown,
  CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Menu, Sliders, Shield, Award
} from 'lucide-react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';

// Initial Directory Data matching the reference admin dashboard
const INITIAL_DIRECTORY_DATA = [
  {
    id: 'u1',
    name: 'Administration',
    email: 'admin@fasikacaregiving.com',
    role: 'Super Admin',
    category: 'admin',
    course: 'Executive & Systems Administration',
    status: 'Active',
    avatarBg: 'bg-purple-100 text-purple-700',
    joinedDate: 'Jan 2026',
    initial: 'A'
  },
  {
    id: 'u2',
    name: 'Kenenisa Beyan',
    email: 'kenenisab05@gmail.com',
    role: 'Admin',
    category: 'admin',
    course: 'Platform Technical Director',
    status: 'Active',
    avatarBg: 'bg-indigo-100 text-indigo-700',
    joinedDate: 'Feb 2026',
    initial: 'K'
  },
  {
    id: 'u3',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@fasikacaregiving.com',
    role: 'Certified Instructor',
    category: 'instructor',
    course: 'Advanced Geriatric & Palliative Care',
    status: 'Verified',
    avatarBg: 'bg-blue-100 text-blue-700',
    joinedDate: 'Mar 2026',
    initial: 'M'
  },
  {
    id: 'u4',
    name: 'Sister Aster Mengistu',
    email: 'aster.m@caregiving.org',
    role: 'Certified Instructor',
    category: 'instructor',
    course: 'Clinical Home Health & Vital Signs',
    status: 'Verified',
    avatarBg: 'bg-teal-100 text-teal-700',
    joinedDate: 'Mar 2026',
    initial: 'A'
  },
  {
    id: 'u5',
    name: 'Elena Rostova, RN',
    email: 'elena.r@globalhealth.edu',
    role: 'Certified Instructor',
    category: 'instructor',
    course: 'Emergency First Aid, CPR & AED',
    status: 'In Session',
    avatarBg: 'bg-emerald-100 text-emerald-700',
    joinedDate: 'Apr 2026',
    initial: 'E'
  },
  {
    id: 'u6',
    name: 'Tewodros Kassahun',
    email: 'tewodros.k@fasikacare.org',
    role: 'Certified Instructor',
    category: 'instructor',
    course: 'Elderly Physical Therapy & Mobility',
    status: 'Verified',
    avatarBg: 'bg-cyan-100 text-cyan-700',
    joinedDate: 'Apr 2026',
    initial: 'T'
  },
  {
    id: 'u7',
    name: 'Sarah Jenkins',
    email: 's.jenkins@caregivingtraining.com',
    role: 'Certified Instructor',
    category: 'instructor',
    course: 'Medication Administration Protocol',
    status: 'Verified',
    avatarBg: 'bg-sky-100 text-sky-700',
    joinedDate: 'May 2026',
    initial: 'S'
  },
  {
    id: 'u8',
    name: 'Bethlehem Desta',
    email: 'bethlehem.d@gmail.com',
    role: 'Trainee',
    category: 'trainee',
    course: 'Full Caregiving Certification',
    status: 'Active',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    joinedDate: 'May 2026',
    initial: 'B'
  },
  {
    id: 'u9',
    name: 'Yohannes Haile',
    email: 'yohannes.h@outlook.com',
    role: 'Trainee',
    category: 'trainee',
    course: 'Assisted Living & Nutrition Care',
    status: 'Active',
    avatarBg: 'bg-green-100 text-green-800',
    joinedDate: 'Jun 2026',
    initial: 'Y'
  },
  {
    id: 'u10',
    name: 'Marta Wolde',
    email: 'marta.w@caregiving.et',
    role: 'Trainee',
    category: 'trainee',
    course: 'Dementia & Alzheimer Specialist',
    status: 'Active',
    avatarBg: 'bg-lime-100 text-lime-800',
    joinedDate: 'Jun 2026',
    initial: 'M'
  },
  {
    id: 'u11',
    name: 'Samuel Tadesse',
    email: 'samuel.t@yahoo.com',
    role: 'Trainee',
    category: 'trainee',
    course: 'Home Health Aide Professional Diploma',
    status: 'Active',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    joinedDate: 'Jul 2026',
    initial: 'S'
  },
  {
    id: 'u12',
    name: 'Hiwot Alemu',
    email: 'hiwot.alemu@gmail.com',
    role: 'Trainee',
    category: 'trainee',
    course: 'Full Caregiving Certification',
    status: 'Enrolled',
    avatarBg: 'bg-teal-100 text-teal-800',
    joinedDate: 'Jul 2026',
    initial: 'H'
  },
  {
    id: 'u13',
    name: 'Dawit Bekele',
    email: 'dawit.b@caregiving.org',
    role: 'Trainee',
    category: 'trainee',
    course: 'Elderly Nutritional & Diet Care',
    status: 'Enrolled',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    joinedDate: 'Aug 2026',
    initial: 'D'
  },
  {
    id: 'u14',
    name: 'Selamawit Kebede',
    email: 'selam.k@fasikacare.et',
    role: 'Trainee',
    category: 'trainee',
    course: 'Pediatric Care & Infant Support',
    status: 'Enrolled',
    avatarBg: 'bg-green-100 text-green-800',
    joinedDate: 'Aug 2026',
    initial: 'S'
  },
  {
    id: 'u15',
    name: 'Abel Gizaw',
    email: 'abel.g@gmail.com',
    role: 'Trainee',
    category: 'pending',
    course: 'Caregiving Foundations & Ethics',
    status: 'Pending Approval',
    avatarBg: 'bg-amber-100 text-amber-800',
    joinedDate: 'Aug 2026',
    initial: 'A'
  },
  {
    id: 'u16',
    name: 'Rahel Berhanu',
    email: 'rahel.b@outlook.com',
    role: 'Trainee',
    category: 'pending',
    course: 'Clinical First Aid & Resuscitation',
    status: 'Documents Under Review',
    avatarBg: 'bg-amber-100 text-amber-800',
    joinedDate: 'Sep 2026',
    initial: 'R'
  },
  {
    id: 'u17',
    name: 'Daniel Worku',
    email: 'daniel.w@yahoo.com',
    role: 'Certified Instructor',
    category: 'pending',
    course: 'Emergency Medical Response',
    status: 'Pending Approval',
    avatarBg: 'bg-amber-100 text-amber-800',
    joinedDate: 'Sep 2026',
    initial: 'D'
  }
];

const NOTIFICATIONS = [
  { id: 1, title: 'New Trainee Enrolled', desc: 'Bethlehem Desta registered for Caregiving Certification.', time: '5m ago', unread: true },
  { id: 2, title: 'Course Session Scheduled', desc: 'Dr. Marcus Vance published Advanced Geriatric Care.', time: '18m ago', unread: true },
  { id: 3, title: 'Media Consent Approved', desc: 'Samuel Tadesse approved session recording consent.', time: '42m ago', unread: true },
  { id: 4, title: 'WebRTC Signaling Optimal', desc: 'Server ping 18ms with 100% cryptographic E2EE.', time: '1h ago', unread: true },
  { id: 5, title: 'Withdrawal Processed', desc: 'Tuition disbursement batch #2026-08 verified.', time: '2h ago', unread: true },
  { id: 6, title: 'Admission Documents Uploaded', desc: 'Rahel Berhanu uploaded secondary certification.', time: '3h ago', unread: true },
  { id: 7, title: 'Live Masterclass Active', desc: 'Elena Rostova launched Clinical First Aid room.', time: '5h ago', unread: true },
  { id: 8, title: 'Security Audit Passed', desc: 'DTLS-SRTP end-to-end audit passed without alerts.', time: '6h ago', unread: true },
  { id: 9, title: 'Platform Update 2.8', desc: 'Adaptive bitrate WebRTC engine successfully deployed.', time: '1d ago', unread: true }
];

export default function UserDashboard({ onNavigate, onJoinRoom, notify }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real Backend Meeting Rooms state
  const [myRooms, setMyRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [username, setUsername] = useState('Administration');
  const [deleteModalRoomId, setDeleteModalRoomId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPersonalLink, setCopiedPersonalLink] = useState(false);

  // Dropdowns & Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [directoryUsers, setDirectoryUsers] = useState(INITIAL_DIRECTORY_DATA);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Trainee');
  const [newUserCourse, setNewUserCourse] = useState('Full Caregiving Certification');

  // Camera & Mic Studio Preview State
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

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser && savedUser.trim()) {
      setUsername(savedUser);
    }

    const loadRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.getUserRooms(token);
          if (response.success && response.data) {
            setMyRooms(response.data);
          }
        }
      } catch (error) {
        console.warn('Dashboard loadRooms error:', error);
      } finally {
        setIsLoadingRooms(false);
      }
    };
    loadRooms();

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
        // Fallback demo room generator if server is in demo mode
        const demoId = specificRoomId || `room-${Math.random().toString(36).substring(2, 8)}`;
        notify?.('success', 'Launching instant masterclass room...');
        onJoinRoom(demoId);
        return;
      }

      notify?.('success', 'Starting your masterclass room...');
      onJoinRoom(response.data.roomId);
    } catch (error) {
      console.warn('Create room fallback:', error);
      const demoId = `room-${Math.random().toString(36).substring(2, 8)}`;
      notify?.('success', 'Starting instant masterclass room...');
      onJoinRoom(demoId);
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
      if (!response.success && response.status === 404) {
        notify?.('info', `Connecting directly to room: ${id}`);
        onJoinRoom(id);
        return;
      }
      notify?.('success', 'Joining session...');
      onJoinRoom(id);
    } catch (error) {
      notify?.('info', `Connecting to room: ${id}`);
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
    notify?.('success', 'Personal room URL copied!');
    setTimeout(() => setCopiedPersonalLink(false), 2500);
  };

  const handleDeleteRoom = async () => {
    if (!deleteModalRoomId || isDeleting) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.deleteRoom(token, deleteModalRoomId);
      if (response.success) {
        notify?.('success', 'Room deleted.');
        setMyRooms(prev => prev.filter(r => r.roomId !== deleteModalRoomId));
      } else {
        setMyRooms(prev => prev.filter(r => r.roomId !== deleteModalRoomId));
        notify?.('success', 'Room removed.');
      }
    } catch (error) {
      setMyRooms(prev => prev.filter(r => r.roomId !== deleteModalRoomId));
      notify?.('success', 'Room removed.');
    } finally {
      setIsDeleting(false);
      setDeleteModalRoomId(null);
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    let category = 'trainee';
    if (newUserRole.includes('Admin')) category = 'admin';
    else if (newUserRole.includes('Instructor')) category = 'instructor';

    const newUser = {
      id: `u-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      category,
      course: newUserCourse,
      status: 'Active',
      avatarBg: category === 'admin' ? 'bg-purple-100 text-purple-700' : category === 'instructor' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800',
      joinedDate: 'Just now',
      initial: newUserName.trim().charAt(0).toUpperCase()
    };

    setDirectoryUsers([newUser, ...directoryUsers]);
    setShowNewUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    notify?.('success', `Added ${newUser.name} to admissions directory!`);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return directoryUsers.filter(u => {
      const matchesTab = activeTab === 'all' 
        ? u.category !== 'pending' 
        : activeTab === 'admins' 
          ? u.category === 'admin' 
          : activeTab === 'instructors' 
            ? u.category === 'instructor' 
            : activeTab === 'trainees' 
              ? u.category === 'trainee' 
              : u.category === 'pending';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        u.course.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [directoryUsers, activeTab, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    const admins = directoryUsers.filter(u => u.category === 'admin').length;
    const instructors = directoryUsers.filter(u => u.category === 'instructor').length;
    const trainees = directoryUsers.filter(u => u.category === 'trainee').length;
    const pending = directoryUsers.filter(u => u.category === 'pending').length;
    return {
      all: admins + instructors + trainees,
      admins,
      instructors,
      trainees,
      pending,
      total: directoryUsers.length
    };
  }, [directoryUsers]);

  const handleLogout = () => {
    localStorage.clear();
    notify?.('success', 'Logged out successfully.');
    onNavigate('auth');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2761] font-sans flex antialiased selection:bg-[#136C38] selection:text-white relative">
      
      {/* ========================================================
          1. LEFT SIDEBAR NAVIGATION (Matching exact design)
         ======================================================== */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full overflow-y-auto">
          
          {/* Logo & Brand Header */}
          <div className="p-5 border-b border-[#E2E8F0] flex flex-col items-start">
            <div className="flex items-center space-x-3 mb-3">
              {/* Circular Emblem Icon with Gold/Green ring */}
              <div className="w-11 h-11 rounded-full bg-[#0A3D24] border-2 border-emerald-500/80 shadow-md flex items-center justify-center text-emerald-400 p-1 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900 to-[#0A3D24]" />
                <GraduationCap size={22} className="relative z-10 text-emerald-300" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase font-mono">
                    ADMIN DASHBOARD
                  </span>
                </div>
                <h2 className="text-sm font-black text-slate-800 leading-tight">
                  Fasika Care Giving
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  Training Center
                </span>
              </div>
            </div>

            {/* Quick Switch / Active Tag */}
            <div className="w-full bg-[#F4F8F5] border border-emerald-200/60 rounded-xl px-3 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-xs font-bold text-emerald-900">Virtual Suite Active</span>
              </div>
              <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                v2.8
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-6">
            
            {/* Section 1: Dashboard */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                DASHBOARD
              </p>
              <button
                onClick={() => { setActiveNav('dashboard'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all text-left relative ${
                  activeNav === 'dashboard'
                    ? 'bg-[#EAF6EE] text-[#136C38]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {activeNav === 'dashboard' && (
                  <span className="absolute left-0 inset-y-1 w-1.5 bg-[#136C38] rounded-r-full" />
                )}
                <LayoutDashboard size={18} className={activeNav === 'dashboard' ? 'text-[#136C38]' : 'text-slate-500'} />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Section 2: Core Operational Modules */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                CORE OPERATIONAL MODULES
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveNav('users'); setActiveTab('all'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left relative ${
                    activeNav === 'users'
                      ? 'bg-[#EAF6EE] text-[#136C38] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {activeNav === 'users' && (
                    <span className="absolute left-0 inset-y-1 w-1.5 bg-[#136C38] rounded-r-full" />
                  )}
                  <div className="flex items-center space-x-3">
                    <Users size={18} className={activeNav === 'users' ? 'text-[#136C38]' : 'text-slate-500'} />
                    <span>All Users</span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {counts.total}
                  </span>
                </button>

                <button
                  onClick={() => { setShowNewUserModal(true); setSidebarOpen(false); }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-left"
                >
                  <UserPlus size={18} className="text-slate-500" />
                  <span>Manage Users & Enroll</span>
                </button>

                <button
                  onClick={() => { setActiveNav('rooms'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left relative ${
                    activeNav === 'rooms'
                      ? 'bg-[#EAF6EE] text-[#136C38] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {activeNav === 'rooms' && (
                    <span className="absolute left-0 inset-y-1 w-1.5 bg-[#136C38] rounded-r-full" />
                  )}
                  <div className="flex items-center space-x-3">
                    <Video size={18} className={activeNav === 'rooms' ? 'text-[#136C38]' : 'text-slate-500'} />
                    <span>Withdrawals & Masterclasses</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </button>

                <button
                  onClick={() => { setActiveNav('media'); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left relative ${
                    activeNav === 'media'
                      ? 'bg-[#EAF6EE] text-[#136C38] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {activeNav === 'media' && (
                    <span className="absolute left-0 inset-y-1 w-1.5 bg-[#136C38] rounded-r-full" />
                  )}
                  <Eye size={18} className={activeNav === 'media' ? 'text-[#136C38]' : 'text-slate-500'} />
                  <span>Media Consent</span>
                </button>
              </div>
            </div>

            {/* Section 3: Institution Modules */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                INSTITUTION MODULES
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => handleCreateRoom()}
                  disabled={isCreating}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-emerald-700 hover:bg-emerald-50 transition-all text-left"
                >
                  <Plus size={18} className="text-emerald-600" />
                  <span>Create Course & Room</span>
                </button>

                <button
                  onClick={() => { setActiveNav('courses'); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left relative ${
                    activeNav === 'courses'
                      ? 'bg-[#EAF6EE] text-[#136C38] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {activeNav === 'courses' && (
                    <span className="absolute left-0 inset-y-1 w-1.5 bg-[#136C38] rounded-r-full" />
                  )}
                  <BookOpen size={18} className={activeNav === 'courses' ? 'text-[#136C38]' : 'text-slate-500'} />
                  <span>Manage All Courses</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('studio-hardware-preview');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else toggleHardwarePreview();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-left"
                >
                  <Camera size={18} className="text-slate-500" />
                  <span>Hardware Preview</span>
                </button>
              </div>
            </div>

            {/* Section 4: Public Site & Settings */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                SYSTEM
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-left"
                >
                  <Globe size={18} className="text-slate-500" />
                  <span>Public Website</span>
                </button>

                <button
                  onClick={() => onNavigate('settings')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-left"
                >
                  <Settings size={18} className="text-slate-500" />
                  <span>Settings & Audio</span>
                </button>
              </div>
            </div>

          </nav>

          {/* Bottom Sidebar Logout Button */}
          <div className="p-4 border-t border-[#E2E8F0]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-sm text-rose-600 hover:bg-rose-50 transition-all text-left"
            >
              <LogOut size={18} className="text-rose-600" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </aside>

      {/* ========================================================
          2. MAIN CONTENT AREA (Offset by sidebar width on desktop)
         ======================================================== */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        
        {/* TOP NAVBAR (Matching the search, badge, notification, language, profile chip) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Mobile Sidebar Hamburger + Search Bar */}
          <div className="flex items-center space-x-3 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Search courses, trainees, instructors... */}
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, trainees, instructors..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-600 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right Topbar Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Center / Right Badge: FASIKA CARE GIVING TRAINING CENTER */}
            <div className="hidden xl:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF7EE] text-[#136C38] border border-emerald-200/70 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Fasika Care Giving Training Center</span>
            </div>

            {/* Notification Bell with Badge '9' */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-full border border-[#E2E8F0] bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 relative transition-all"
                title="Notifications"
              >
                <Bell size={17} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                  9
                </span>
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-4 z-50 text-left"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-800">Notifications</span>
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                          9 New
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-2">
                      {NOTIFICATIONS.map((n) => (
                        <div key={n.id} className="py-2.5 px-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-center">
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-bold text-emerald-700 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Selector: 🌐 EN ▾ */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="bg-[#136C38] hover:bg-[#0F5A2E] text-white px-3 py-1.5 rounded-full font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
              >
                <Globe size={14} />
                <span>{selectedLang}</span>
                <ChevronDown size={13} />
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-36 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-1.5 z-50 text-left"
                  >
                    {[
                      { code: 'EN', label: 'English' },
                      { code: 'AM', label: 'አማርኛ' },
                      { code: 'OR', label: 'Afaan Oromoo' },
                      { code: 'FR', label: 'Français' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setShowLangMenu(false);
                          notify?.('info', `Language set to ${lang.label}`);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                          selectedLang === lang.code ? 'bg-[#EAF6EE] text-[#136C38]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lang.label}</span>
                        {selectedLang === lang.code && <Check size={12} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Administration / Admin User Chip */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-full transition-all text-left shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                    {username}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Admin
                  </span>
                </div>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-2 z-50 text-left"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-800">{username}</p>
                      <p className="text-[10px] text-slate-400 font-mono">admin@fasikacaregiving.com</p>
                    </div>

                    <button
                      onClick={() => { setShowProfileMenu(false); onNavigate('settings'); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Settings size={14} />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => { setShowProfileMenu(false); onNavigate('dashboard'); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Globe size={14} />
                      <span>View Public Site</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* ========================================================
            3. MAIN DASHBOARD BODY (Matching layout from image)
           ======================================================== */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] w-full mx-auto">
          
          {/* ------------------------------------------------------
              HERO WELCOME BANNER (Deep Forest Green Gradient)
             ------------------------------------------------------ */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F5A37] via-[#0C472B] to-[#083620] p-6 sm:p-10 text-white shadow-lg border border-emerald-900/40">
            {/* Subtle glow elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                
                {/* Crown Pill Badge */}
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-yellow-300 border border-white/15 backdrop-blur-md">
                  <span>👑</span>
                  <span className="tracking-wide uppercase text-[11px]">
                    ADMINISTRATION PANEL • FASIKA CAREGIVING TRAINING CENTER
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Welcome, {username}! 👋
                </h1>

                {/* Subtitle description */}
                <p className="text-emerald-100 text-xs sm:text-sm font-normal leading-relaxed max-w-xl">
                  Fasika Caregiving Training Center — manage trainees, courses, finances, and certifications below.
                </p>
              </div>

              {/* Instant Action Quick Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <button
                  onClick={() => handleCreateRoom()}
                  disabled={isCreating}
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-[#0F5A37] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-75"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-[#0F5A37]" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Video size={16} className="text-[#0F5A37]" />
                      <span>Host Instant Room</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowNewUserModal(true)}
                  className="px-5 py-3 rounded-2xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm border border-emerald-400/30 transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
                >
                  <UserPlus size={16} />
                  <span>Enroll Trainee</span>
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------
              4 KEY METRIC CARDS (Exact match to the 4 cards)
             ------------------------------------------------------ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Card 1: 👑 Super Admin & Admins */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Crown size={22} />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                {counts.admins}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Super Admin & Admins
              </p>
            </div>

            {/* Card 2: 🎓 Active Trainees */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <GraduationCap size={22} />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                4
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Active Trainees
              </p>
            </div>

            {/* Card 3: 👤 Certified Instructors / Sessions */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Users size={22} />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                {counts.instructors}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Certified Instructors
              </p>
            </div>

            {/* Card 4: 📈 0 ETB (Tuition / Metrics) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A36] flex items-center justify-center mb-3">
                <TrendingUp size={22} />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                0 ETB
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Total Tuition & Revenue
              </p>
            </div>

          </div>

          {/* ------------------------------------------------------
              LOWER TWO-COLUMN SECTION (Directory vs Role Snapshot)
             ------------------------------------------------------ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* LEFT COLUMN: Recent Admissions & Directory (65% width) */}
            <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5">
              
              {/* Header with Title + LIVE EXTRACTED Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Recent Admissions & Directory
                    </h2>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>LIVE EXTRACTED</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Review recent registrations extracted across Super Admin, Admin, Instructor, and Trainee roles.
                  </p>
                </div>

                <button
                  onClick={() => setShowNewUserModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#136C38] hover:bg-[#0F5A2E] text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>Add New</span>
                </button>
              </div>

              {/* Filter Tabs Pill Bar: All 14, Admins 2, Instructors 5, Trainees 7, Pending 3 */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All', count: counts.all },
                  { id: 'admins', label: 'Admins', count: counts.admins },
                  { id: 'instructors', label: 'Instructors', count: counts.instructors },
                  { id: 'trainees', label: 'Trainees', count: counts.trainees },
                  { id: 'pending', label: 'Pending', count: counts.pending }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === tab.id
                        ? 'bg-[#136C38] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Directory User Table / List */}
              <div className="divide-y divide-slate-100 overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">No admissions found for this filter.</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                    >
                      {/* User Info */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full ${user.avatarBg} font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200`}>
                          {user.initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {user.name}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              user.category === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : user.category === 'instructor'
                                  ? 'bg-blue-100 text-blue-700'
                                  : user.category === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {user.course} • <span className="font-mono text-slate-400">{user.email}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          user.status === 'Active' || user.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : user.status === 'In Session'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {user.status}
                        </span>

                        <button
                          onClick={() => handleCreateRoom()}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-all cursor-pointer"
                          title="Connect in Room"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* --------------------------------------------------
                  INTEGRATED ACTIVE WEBRTC ROOMS SECTION
                 -------------------------------------------------- */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Video size={16} className="text-[#136C38]" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live WebRTC Room Hub & Instant Connector
                    </h3>
                  </div>

                  {/* Permanent Personal Link Copy */}
                  <div className="inline-flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                    <span className="font-semibold text-slate-400">Personal:</span>
                    <span className="font-mono font-bold text-[#136C38]">{personalRoomId}</span>
                    <button
                      onClick={handleCopyPersonalLink}
                      className="text-[#136C38] hover:underline font-bold flex items-center space-x-0.5 cursor-pointer ml-1"
                    >
                      {copiedPersonalLink ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedPersonalLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Join Bar */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 flex items-center bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#136C38] focus-within:bg-white rounded-xl p-1 transition-all">
                    <input
                      type="text"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      placeholder="Enter room code or link to join masterclass"
                      className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none font-medium min-w-0"
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={isJoining || !joinId.trim()}
                      className="px-3.5 py-1.5 rounded-lg font-bold bg-[#136C38] hover:bg-[#0F5A2E] text-white text-xs transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    >
                      {isJoining ? <Loader2 size={12} className="animate-spin text-white" /> : 'Join Room'}
                    </button>
                  </div>

                  <button
                    onClick={() => handleCreateRoom()}
                    disabled={isCreating}
                    className="px-4 py-2 rounded-xl bg-[#0F5A37] hover:bg-[#0A3D24] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <Plus size={14} />
                    <span>Instant Room</span>
                  </button>
                </div>

                {/* User's Created Meeting Rooms List */}
                {myRooms.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Your Hosted Rooms ({myRooms.length})
                    </p>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                      {myRooms.slice(0, 4).map((room) => (
                        <div key={room.roomId} className="p-3 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-slate-800 font-mono">
                              {room.roomId}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              Created: {new Date(room.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => onJoinRoom(room.roomId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer"
                            >
                              Launch
                            </button>
                            <button
                              onClick={() => handleCopyLink(room.roomId)}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Copy Invite Link"
                            >
                              {copiedId === room.roomId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => setDeleteModalRoomId(room.roomId)}
                              className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Room"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Admissions & Role Snapshot (35% width) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Card 1: Admissions & Role Snapshot with Progress Bars */}
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Admissions & Role Snapshot
                  </h3>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    {counts.total} Users
                  </span>
                </div>

                <div className="space-y-4">
                  
                  {/* Item 1: Super Admin & Admins (12%) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-700 flex items-center space-x-1">
                        <span>👑</span>
                        <span>Super Admin & Admins</span>
                      </span>
                      <span className="font-bold text-slate-700">2 (12%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>

                  {/* Item 2: Certified Instructors (29%) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-700 flex items-center space-x-1">
                        <span>👤</span>
                        <span>Certified Instructors</span>
                      </span>
                      <span className="font-bold text-slate-700">5 (29%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '29%' }} />
                    </div>
                  </div>

                  {/* Item 3: Trainees (41%) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-800 flex items-center space-x-1">
                        <span>🎓</span>
                        <span>Trainees</span>
                      </span>
                      <span className="font-bold text-slate-700">7 (41%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '41%' }} />
                    </div>
                  </div>

                  {/* Item 4: Pending Approvals (18%) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-700 flex items-center space-x-1">
                        <span>⏳</span>
                        <span>Pending Admissions</span>
                      </span>
                      <span className="font-bold text-slate-700">3 (18%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* Card 2: Hardware Studio Preview Tester */}
              <div id="studio-hardware-preview" className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera size={16} className="text-[#136C38]" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Hardware Studio Tester
                    </h3>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${isPreviewActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                </div>

                <div className="w-full aspect-video bg-[#0A3D24] rounded-2xl relative overflow-hidden flex items-center justify-center border border-emerald-900 shadow-inner group">
                  {isPreviewActive && previewStream ? (
                    <>
                      <video 
                        ref={videoPreviewRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover ${!previewCamActive ? 'opacity-0' : 'opacity-100'}`}
                        style={{ transform: 'scaleX(-1)' }}
                      />

                      {!previewCamActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A3D24] text-white">
                          <VideoOff size={28} className="text-slate-400 mb-1" />
                          <span className="text-xs text-slate-300 font-bold">Camera Paused</span>
                        </div>
                      )}

                      {/* Microphone VU Meter */}
                      {previewMicActive && (
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center space-x-1.5 z-20">
                          <Mic size={11} className="text-emerald-400" />
                          <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-400 rounded-full transition-all duration-75"
                              style={{ width: `${Math.max(10, audioLevel)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Control Pills */}
                      <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-20">
                        <button
                          onClick={togglePreviewCam}
                          className={`p-1.5 rounded-lg border text-xs ${
                            previewCamActive ? 'bg-white text-slate-800 border-white' : 'bg-rose-600 text-white border-rose-600'
                          }`}
                        >
                          {previewCamActive ? <Video size={13} /> : <VideoOff size={13} />}
                        </button>
                        <button
                          onClick={togglePreviewMic}
                          className={`p-1.5 rounded-lg border text-xs ${
                            previewMicActive ? 'bg-white text-slate-800 border-white' : 'bg-rose-600 text-white border-rose-600'
                          }`}
                        >
                          {previewMicActive ? <Mic size={13} /> : <MicOff size={13} />}
                        </button>
                        <button
                          onClick={toggleHardwarePreview}
                          className="px-2 py-1 rounded-lg bg-white/90 text-[#0F5A37] text-[10px] font-bold"
                        >
                          Turn Off
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center text-white">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 mb-2 border border-white/10">
                        <Camera size={20} />
                      </div>
                      <p className="text-[11px] text-emerald-100 mb-2 font-normal">
                        Test camera & mic before training masterclass
                      </p>
                      <button
                        onClick={toggleHardwarePreview}
                        className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer flex items-center space-x-1"
                      >
                        <Play size={10} className="fill-current" />
                        <span>Test Camera</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* ========================================================
          MODAL: ADD NEW USER / ENROLL TRAINEE
         ======================================================== */}
      <AnimatePresence>
        {showNewUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 text-left relative"
            >
              <button
                onClick={() => setShowNewUserModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>

              <div className="flex items-center space-x-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#136C38] flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">
                    Enroll New Trainee / User
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add new candidate to Fasika Caregiving Center directory.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Bethlehem Desta"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#136C38] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. trainee@fasikacaregiving.com"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#136C38] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#136C38] focus:bg-white"
                  >
                    <option value="Trainee">Trainee</option>
                    <option value="Certified Instructor">Certified Instructor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course / Specialization</label>
                  <input
                    type="text"
                    required
                    value={newUserCourse}
                    onChange={(e) => setNewUserCourse(e.target.value)}
                    placeholder="e.g. Full Caregiving Certification"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#136C38] focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewUserModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#136C38] hover:bg-[#0F5A2E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Enroll Candidate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          MODAL: DELETE ROOM CONFIRMATION
         ======================================================== */}
      <AnimatePresence>
        {deleteModalRoomId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-sm w-full p-6 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Delete Meeting Room?</h3>
              <p className="text-xs text-slate-500 mb-6">
                Are you sure you want to delete room <span className="font-mono font-bold text-slate-800">{deleteModalRoomId}</span>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalRoomId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRoom}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
