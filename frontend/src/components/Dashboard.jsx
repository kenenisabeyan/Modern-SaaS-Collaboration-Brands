import { useRef, useState, useEffect } from 'react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';
import HeroAnimation from './HeroAnimation.jsx';
import { 
  Video, Users, Loader2, Sparkles, Zap, Shield, Clock, Monitor, 
  ChevronRight, Link, CheckCircle, Star, MessageSquare, GraduationCap, 
  BookOpen, Heart, ArrowRight, X
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ onNavigate, onJoinRoom, notify }) {
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [actionError, setActionError] = useState('');
  const [platformStats, setPlatformStats] = useState({ users: 36, meetings: 5, minutes: 225 });
  const createInFlightRef = useRef(false);

  useEffect(() => {
    api.getStats().then(res => {
      if (res && res.success && res.data) {
        setPlatformStats({
          users: res.data.users || 36,
          meetings: res.data.meetings || 5,
          minutes: res.data.minutes || 225
        });
      }
    }).catch(console.error);

    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const showError = (message) => {
    setActionError(message);
    notify?.('error', message);
  };

  const extractRoomId = (value) => {
    const raw = value.trim();
    if (!raw) return '';

    try {
      const url = raw.startsWith('http') ? new URL(raw) : null;
      if (url) {
        return roomIdFromPathname(url.pathname) || '';
      }
    } catch {
      // Fall back to plain text parsing below
    }

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
    setActionError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onNavigate('auth');
        return;
      }

      const response = await api.createRoom(token);
      
      if (response.status === 401) {
        showError('Your session expired. Please log in again.');
        localStorage.clear();
        onNavigate('auth');
        return;
      }
      
      if (!response.success || !response.data?.roomId) {
        showError(response.message || 'Failed to create room on server.');
        return;
      }

      notify?.('success', 'Meeting created. Opening the room...');
      onJoinRoom(response.data.roomId);
    } catch (error) {
      console.error('Error creating room:', error);
      showError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
      createInFlightRef.current = false;
    }
  };

  const handleJoinRoom = async () => {
    setActionError('');
    const id = extractRoomId(joinId);
    if (!id || isJoining) return;

    setIsJoining(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onNavigate('auth');
        return;
      }

      const response = await api.getRoom(token, id);
      if (!response.success) {
        showError(response.status === 404 ? 'Room not found. Please check the meeting link or ID.' : response.message || 'Unable to join this room.');
        return;
      }

      notify?.('success', 'Meeting found. Connecting to the room...');
      onJoinRoom(id);
    } catch (error) {
      console.error('Error joining room:', error);
      showError('Network error. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#1E2761] font-sans overflow-x-hidden selection:bg-[#FF5A36] selection:text-white">
      
      <main className="flex-1 flex flex-col pt-16 relative z-10">
        
        {/* ========================================================
            HERO SECTION: 60-30-10 DESIGN ARCHITECTURE
            - 60% Canvas: Soft Slate Gray / Off-White (#F5F7FA)
            - 30% Structure: Deep Midnight Blue (#1E2761)
            - 10% Action: Electric Coral / Orange-Red (#FF5A36)
           ======================================================== */}
        <section className="pt-6 sm:pt-10 pb-14 sm:pb-18 px-4 sm:px-8 max-w-[1360px] mx-auto w-full text-center relative overflow-hidden">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[350px] bg-gradient-to-r from-[#1E2761]/10 via-[#1E2761]/5 to-[#FF5A36]/15 blur-[95px] rounded-full pointer-events-none -z-10" />

          {/* Compact 3D Turbine Brand Emblem */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 select-none pointer-events-none">
            <HeroAnimation className="w-full h-full" />
          </div>

          {/* Centered High-Impact Typography */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-black text-[#1E2761] tracking-tight leading-[1.08] select-none">
              WabiSeminar.
            </h1>
            <div className="text-3xl sm:text-5xl md:text-6xl lg:text-[66px] font-extrabold tracking-tight leading-[1.1] select-none bg-gradient-to-r from-[#1E2761] via-[#1E2761] to-[#FF5A36] bg-clip-text text-transparent mt-1.5">
              Engineering Real-Time Collaboration
            </div>
          </motion.div>

          {/* Subtitle Description */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Create a free, encrypted meeting room instantly or join an existing session in seconds. Built for innovative educators, creators, and teams who value simplicity and connection.
          </motion.p>

          {/* 3 Signature Action Buttons (60-30-10 Hierarchy) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 select-none"
          >
            {/* Button 1: 10% High-Priority Action CTA in Electric Coral (#FF5A36) */}
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-lg shadow-md hover:shadow-lg hover:shadow-[#FF5A36]/25 uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin" size={15} />
                  <span>CREATING...</span>
                </>
              ) : (
                <>
                  <Video size={15} />
                  <span>HOST A SESSION ▾</span>
                </>
              )}
            </button>

            {/* Button 2: 30% Structural Outline in Thin Border (#E4E8EE) */}
            <button
              onClick={() => scrollToSection('features')}
              className="border border-[#E4E8EE] bg-white text-[#1E2761] hover:bg-[#E4E8EE]/40 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-lg shadow-sm uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>SYSTEM TOUR ▸</span>
            </button>

            {/* Button 3: 30% Structural Deep Midnight Blue (#1E2761) */}
            <button
              onClick={() => {
                const input = document.getElementById('room-join-input');
                input?.focus();
                input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="bg-[#1E2761] hover:bg-[#151A44] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-lg shadow-md hover:shadow-lg hover:shadow-[#1E2761]/20 uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>JOIN ROOM →</span>
            </button>
          </motion.div>

          {/* Interactive Instant Room Join Bar (Directly below buttons) */}
          <div className="max-w-md mx-auto mt-6 w-full">
            <div className="flex items-center bg-white border border-[#E4E8EE] rounded-xl p-1.5 shadow-sm focus-within:border-[#1E2761] focus-within:ring-2 focus-within:ring-[#1E2761]/15 transition-all">
              <input 
                id="room-join-input"
                type="text" 
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="Enter Room ID (e.g. abc-defg-hij)" 
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-transparent outline-none text-[#1E2761] placeholder-slate-400"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <button
                onClick={handleJoinRoom}
                disabled={!joinId.trim() || isJoining}
                className="bg-[#1E2761] hover:bg-[#151A44] disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                {isJoining ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Joining</span>
                  </>
                ) : (
                  <>
                    <Link size={13} />
                    <span>Join</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {actionError && (
              <div className="mt-2.5 p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center justify-center">
                <Shield className="mr-1.5 text-rose-500 shrink-0" size={14} />
                <span>{actionError}</span>
              </div>
            )}
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-6 text-xs font-semibold text-slate-600">
            <div className="flex items-center space-x-1.5">
              <CheckCircle size={15} className="text-[#FF5A36]" />
              <span>Zero Downloads</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle size={15} className="text-[#1E2761]" />
              <span>Ultra HD Video</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle size={15} className="text-[#FF5A36]" />
              <span>End-to-End Secure</span>
            </div>
          </div>

          {/* 3 Glass Stat Cards (60-30-10 Design Hierarchy) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mt-12 max-w-4xl mx-auto w-full">
            
            {/* Card 1: 36 Happy Users (Deep Midnight Blue Header) */}
            <div className="bg-white border border-[#E4E8EE] rounded-2xl shadow-sm hover:shadow-md hover:border-[#1E2761]/30 transition-all overflow-hidden flex flex-col">
              <div className="h-16 sm:h-20 bg-gradient-to-b from-[#1E2761]/12 via-[#1E2761]/5 to-transparent flex items-center justify-center border-b border-[#E4E8EE]">
                <Users className="text-[#1E2761] w-6 h-6" />
              </div>
              <div className="p-6 pt-4 text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1E2761] tracking-tight">
                  {platformStats.users.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-[#1E2761] uppercase tracking-widest mt-2">
                  HAPPY USERS
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Educators & Active Students
                </div>
              </div>
            </div>

            {/* Card 2: 5 Meetings Hosted (Electric Coral Header) */}
            <div className="bg-white border border-[#E4E8EE] rounded-2xl shadow-sm hover:shadow-md hover:border-[#FF5A36]/40 transition-all overflow-hidden flex flex-col">
              <div className="h-16 sm:h-20 bg-gradient-to-b from-[#FF5A36]/15 via-[#FF5A36]/5 to-transparent flex items-center justify-center border-b border-[#E4E8EE]">
                <Video className="text-[#FF5A36] w-6 h-6" />
              </div>
              <div className="p-6 pt-4 text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-[#FF5A36] tracking-tight">
                  {platformStats.meetings.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-[#1E2761] uppercase tracking-widest mt-2">
                  MEETINGS HOSTED
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Live Collaborative Sessions
                </div>
              </div>
            </div>

            {/* Card 3: 225 Minutes Connected (Deep Midnight Blue Header) */}
            <div className="bg-white border border-[#E4E8EE] rounded-2xl shadow-sm hover:shadow-md hover:border-[#1E2761]/30 transition-all overflow-hidden flex flex-col">
              <div className="h-16 sm:h-20 bg-gradient-to-b from-[#1E2761]/12 via-[#1E2761]/5 to-transparent flex items-center justify-center border-b border-[#E4E8EE]">
                <Zap className="text-[#1E2761] w-6 h-6" />
              </div>
              <div className="p-6 pt-4 text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1E2761] tracking-tight">
                  {platformStats.minutes.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-[#1E2761] uppercase tracking-widest mt-2">
                  MINUTES CONNECTED
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  High Definition WebRTC
                </div>
              </div>
            </div>

          </div>

        </section>


        {/* ========================================================
            FEATURES SECTION
           ======================================================== */}
        <section id="features" className="py-16 sm:py-24 bg-white border-t border-[#E4E8EE] px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1E2761]/8 text-[#1E2761] border border-[#1E2761]/15 mb-4">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1E2761] mb-4">
                Everything You Need for Perfect Seminars
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                WabiSeminar brings together the best tools for video collaboration in one beautiful, frictionless package.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-[#F5F7FA] border border-[#E4E8EE] rounded-3xl p-8 sm:p-10 hover:border-[#1E2761]/30 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-[#1E2761]/10 border border-[#1E2761]/20 text-[#1E2761] rounded-2xl flex items-center justify-center mb-6"> 
                  <Video size={28} /> 
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#1E2761]">Ultra HD Video</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Experience crystal-clear video and audio quality powered by advanced WebRTC architecture, ensuring you always look your best.
                </p>
              </div>

              <div className="bg-[#F5F7FA] border border-[#E4E8EE] rounded-3xl p-8 sm:p-10 hover:border-[#FF5A36]/40 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-[#FF5A36]/10 border border-[#FF5A36]/20 text-[#FF5A36] rounded-2xl flex items-center justify-center mb-6"> 
                  <MessageSquare size={28} /> 
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#1E2761]">Real-time Chat</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Keep your audience engaged with lightning-fast built-in chat. Share links, answer questions, and foster community instantly.
                </p>
              </div>

              <div className="bg-[#F5F7FA] border border-[#E4E8EE] rounded-3xl p-8 sm:p-10 hover:border-[#1E2761]/30 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-[#1E2761]/10 border border-[#1E2761]/20 text-[#1E2761] rounded-2xl flex items-center justify-center mb-6"> 
                  <Monitor size={28} /> 
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#1E2761]">Screen Sharing</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Present your masterclass seamlessly. Share your entire screen, specific windows, or browser tabs with zero lag.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================
            ROLES SECTION
           ======================================================== */}
        <section className="py-16 sm:py-24 bg-[#F5F7FA] border-t border-[#E4E8EE] px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto text-center">
            
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-12 tracking-tight text-[#1E2761]">
              One Platform <span className="text-[#FF5A36]">Every Role Connected</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-[#E4E8EE] hover:border-[#1E2761]/30 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#1E2761]/10 border border-[#1E2761]/20 flex items-center justify-center text-[#1E2761] mb-6">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#1E2761] mb-2">Learners</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Learn step-by-step, track your progress, and build skills for your future.
                </p>
              </div>

              <div className="bg-white border border-[#E4E8EE] hover:border-[#FF5A36]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#FF5A36]/10 border border-[#FF5A36]/20 flex items-center justify-center text-[#FF5A36] mb-6">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#1E2761] mb-2">Instructors</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Create impactful courses and guide learners with structured teaching tools.
                </p>
              </div>

              <div className="bg-white border border-[#E4E8EE] hover:border-[#1E2761]/30 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#1E2761]/10 border border-[#1E2761]/20 flex items-center justify-center text-[#1E2761] mb-6">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#1E2761] mb-2">Parents</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Stay involved with real-time insights into learning progress and performance.
                </p>
              </div>

              <div className="bg-white border border-[#E4E8EE] hover:border-[#FF5A36]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#FF5A36]/10 border border-[#FF5A36]/20 flex items-center justify-center text-[#FF5A36] mb-6">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#1E2761] mb-2">Sponsors</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Support learners in need and track the real impact of your contribution.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================
            TESTIMONIALS SECTION
           ======================================================== */}
        <section className="py-16 sm:py-24 bg-white border-t border-[#E4E8EE] px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1E2761]/8 text-[#1E2761] border border-[#1E2761]/15 mb-4">
                Loved by educators
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1E2761] mb-4">
                What Our Community Says
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                See why thousands of professionals choose WabiSeminar over legacy conferencing platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-[#F5F7FA] border border-[#E4E8EE] p-8 rounded-3xl shadow-sm hover:border-[#FF5A36]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-[#FF5A36] mb-5">
                    <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    "WabiSeminar completely changed how I host my design masterclasses. The UI is gorgeous, and my students love that they don't have to download any software."
                  </p>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#FF5A36] flex items-center justify-center font-bold text-white text-base">K</div>
                  <div>
                    <h4 className="text-[#1E2761] font-bold text-sm">Kenenisa Beyan</h4>
                    <p className="text-slate-500 text-xs">Lead Designer, StudioX</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F7FA] border border-[#E4E8EE] p-8 rounded-3xl shadow-sm hover:border-[#1E2761]/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-[#FF5A36] mb-5">
                    <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    "The waiting room feature is perfect for managing my 1-on-1 coaching sessions. The video quality has been incredibly stable even on lower bandwidths."
                  </p>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#1E2761] flex items-center justify-center font-bold text-white text-base">Y</div>
                  <div>
                    <h4 className="text-[#1E2761] font-bold text-sm">Yerosan Girma</h4>
                    <p className="text-slate-500 text-xs">Executive Coach</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F7FA] border border-[#E4E8EE] p-8 rounded-3xl shadow-sm hover:border-[#1E2761]/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-[#FF5A36] mb-5">
                    <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    "We moved our entire remote engineering team over to WabiSeminar for our daily standups. It's fast, free, and secure. What more could you ask for?"
                  </p>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#1E2761] flex items-center justify-center font-bold text-white text-base">D</div>
                  <div>
                    <h4 className="text-[#1E2761] font-bold text-sm">Dagin A.</h4>
                    <p className="text-slate-500 text-xs">CTO, TechFlow</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>


      {/* ========================================================
          "ABOUT WABISEMINAR" INFORMATION MODAL
         ======================================================== */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200">
            <button 
              onClick={() => setShowInfoModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#0DA9CF]/10 text-[#0DA9CF] flex items-center justify-center mb-6">
              <Video size={28} />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">About WabiSeminar</h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              WabiSeminar is a completely free, high-quality video collaboration platform designed for seamless masterclasses, webinars, and team meetings.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle size={20} className="text-[#04B84C] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Instant Access</h4>
                  <p className="text-xs text-slate-500">No software downloads or installations needed.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle size={20} className="text-[#0DA9CF] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">End-to-End Encrypted</h4>
                  <p className="text-xs text-slate-500">Secure WebRTC streaming keeps your conversations private.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle size={20} className="text-[#F67E31] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Interactive Classroom Tools</h4>
                  <p className="text-xs text-slate-500">Real-time chat, smooth screen sharing, and waiting room management.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowInfoModal(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-[#0DA9CF] hover:bg-[#0C8DB0] text-white py-3.5 rounded-full font-bold text-base transition-all shadow-md cursor-pointer"
            >
              Start Collaborating Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
