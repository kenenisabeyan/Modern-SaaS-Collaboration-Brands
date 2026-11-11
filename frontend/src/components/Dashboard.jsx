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
  const [showJoinInline, setShowJoinInline] = useState(false);
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
    <div className="flex flex-col min-h-screen bg-white text-[#1E2761] font-sans overflow-x-hidden selection:bg-[#FF5A36] selection:text-white">
      
      <main className="flex-1 flex flex-col pt-16 sm:pt-20 relative z-10">
        
        {/* ========================================================
            HERO SECTION: 2-COLUMN ICEADDIS + KENENISA-OS ARCHITECTURE
            - 60% Canvas: Pure White (#FFFFFF)
            - 30% Structural Weight: Deep Midnight Blue (#1E2761)
            - 10% Action Weight: Electric Coral (#FF5A36)
           ======================================================== */}
        <section className="pt-4 sm:pt-6 md:pt-8 pb-10 sm:pb-14 px-4 sm:px-8 lg:px-12 xl:px-16 bg-white relative">
          <div className="max-w-[1440px] w-full mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              
              {/* Left Column: Heading, Subtitle, 2 Essential Buttons & Trust Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="lg:col-span-6 flex flex-col justify-center items-start text-left"
              >
                {/* Instant Collaboration Tag */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20 mb-4 sm:mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
                  <span>Instant Collaboration</span>
                </div>

                {/* Main Headline (Strict 60-30-10: Deep Midnight Blue #1E2761 + Electric Coral #FF5A36) */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[68px] font-black tracking-tight leading-[1.08] text-[#1E2761] mb-4 sm:mb-5 select-none">
                  <span className="text-[#1E2761] block">Host Engaging</span>
                  <span className="text-[#FF5A36] block">Masterclasses</span>
                </h1>

                {/* Subtitle Description */}
                <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-[540px] mb-6 sm:mb-8 font-normal">
                  Create a free, encrypted meeting room instantly or join an existing session in seconds. Built for innovative educators, creators, and teams who value simplicity and connection.
                </p>

                {/* Error Banner */}
                {actionError && (
                  <div className="w-full max-w-[500px] mb-4 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center">
                    <Shield className="mr-2 text-rose-500 shrink-0" size={16} />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* ONLY TWO ESSENTIAL ACTION BUTTONS (Strict 60-30-10 Palette) */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  
                  {/* Button 1: Solid Electric Coral (#FF5A36) - Host a Session / Create Instant Room */}
                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#FF5A36]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Creating Room...</span>
                      </>
                    ) : (
                      <>
                        <Video size={18} />
                        <span>Create Instant Room</span>
                        <ChevronRight size={16} className="opacity-75" />
                      </>
                    )}
                  </button>

                  {/* Button 2: Pure White with Midnight Blue (#1E2761) & Border - Join a Session */}
                  <button
                    onClick={() => setShowJoinInline(prev => !prev)}
                    className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl bg-white hover:bg-[#F5F7FA] text-[#1E2761] hover:text-[#151A44] border-2 border-[#E4E8EE] hover:border-[#1E2761]/40 font-bold text-sm sm:text-base shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Users size={18} className="text-[#1E2761]" />
                    <span>Join a Session ▸</span>
                  </button>

                </div>

                {/* Smooth Expandable Join Input (Friction-Free Room ID entry) */}
                <div className="w-full max-w-[500px] mt-4">
                  {(showJoinInline || joinId) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -5 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -5 }}
                      transition={{ duration: 0.25 }}
                      className="p-3 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE]"
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          id="room-join-input"
                          type="text" 
                          value={joinId}
                          onChange={(e) => setJoinId(e.target.value)}
                          placeholder="e.g. abc-defg-hij" 
                          autoFocus
                          className="flex-1 px-4 py-2.5 bg-white border border-[#E4E8EE] rounded-xl text-[#1E2761] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E2761]/20 focus:border-[#1E2761] text-xs sm:text-sm font-medium transition-all"
                          onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                        />
                        <button
                          onClick={handleJoinRoom}
                          disabled={!joinId.trim() || isJoining}
                          className="px-5 py-2.5 bg-[#1E2761] hover:bg-[#151A44] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#1E2761]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
                        >
                          {isJoining ? <Loader2 size={15} className="animate-spin" /> : <span>Join Room</span>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Feature check marks */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-5 sm:pt-7 text-xs sm:text-sm text-slate-600 font-semibold select-none">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle size={16} className="text-[#FF5A36]" />
                    <span>Zero Downloads</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle size={16} className="text-[#1E2761]" />
                    <span>Ultra HD Video</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle size={16} className="text-[#FF5A36]" />
                    <span>End-to-End Secure</span>
                  </div>
                </div>

              </motion.div>


              {/* Right Column: Sleek 3D Turbine Animation */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="lg:col-span-6 flex items-center justify-center relative w-full"
              >
                <div className="w-full max-w-[340px] sm:max-w-[390px] lg:max-w-[440px] aspect-square flex items-center justify-center">
                  <HeroAnimation className="w-full h-full" />
                </div>
              </motion.div>

            </div>


            {/* ========================================================
                3 METRIC / STAT CARDS (STRICT 60-30-10 BRAND PALETTE)
                - 60% Canvas: Pure White (#FFFFFF) & Soft Off-White (#F5F7FA)
                - 30% Structural Weight: Deep Midnight Blue (#1E2761)
                - 10% Action Weight: Electric Coral (#FF5A36)
               ======================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 sm:pt-14">
              
              {/* Card 1: 36 Happy Users (Deep Midnight Blue Structural Card) */}
              <div className="relative overflow-hidden bg-white border-2 border-[#E4E8EE] hover:border-[#1E2761] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#1E2761]/[0.06] via-[#1E2761]/[0.02] to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl sm:text-6xl font-black text-[#1E2761] tracking-tight mb-2 transition-transform duration-300 group-hover:scale-105">
                    {platformStats.users}+
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1E2761] mb-1">
                    HAPPY USERS
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Innovative Educators & Active Learners
                  </div>
                </div>
              </div>

              {/* Card 2: 5 Meetings Hosted (Electric Coral #FF5A36 Accent Hero Card) */}
              <div className="relative overflow-hidden bg-white border-2 border-[#FF5A36]/30 hover:border-[#FF5A36] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-[0_4px_20px_rgba(255,90,54,0.08)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#FF5A36]/10 via-[#FF5A36]/[0.03] to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl sm:text-6xl font-black text-[#FF5A36] tracking-tight mb-2 transition-transform duration-300 group-hover:scale-105">
                    {platformStats.meetings}+
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1E2761] mb-1">
                    MEETINGS HOSTED
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Interactive Live Masterclasses & Webinars
                  </div>
                </div>
              </div>

              {/* Card 3: 225 Minutes Connected (Deep Midnight Blue Structural Card) */}
              <div className="relative overflow-hidden bg-white border-2 border-[#E4E8EE] hover:border-[#1E2761] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#1E2761]/[0.06] via-[#1E2761]/[0.02] to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl sm:text-6xl font-black text-[#1E2761] tracking-tight mb-2 transition-transform duration-300 group-hover:scale-105">
                    {platformStats.minutes}+
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1E2761] mb-1">
                    MINUTES CONNECTED
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Deterministic Ultra HD & End-to-End Secure
                  </div>
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-[#E4E8EE]">
            <button 
              onClick={() => setShowInfoModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#1E2761] p-2 rounded-full hover:bg-[#F5F7FA] transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20 flex items-center justify-center mb-6">
              <Video size={28} />
            </div>

            <h3 className="text-2xl font-extrabold text-[#1E2761] mb-3">About WabiSeminar</h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              WabiSeminar is a completely free, high-quality video collaboration platform designed for seamless masterclasses, webinars, and team meetings.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle size={20} className="text-[#FF5A36] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#1E2761]">Instant Access</h4>
                  <p className="text-xs text-slate-500">No software downloads or installations needed.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle size={20} className="text-[#1E2761] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#1E2761]">End-to-End Encrypted</h4>
                  <p className="text-xs text-slate-500">Secure WebRTC streaming keeps your conversations private.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle size={20} className="text-[#FF5A36] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#1E2761]">Interactive Classroom Tools</h4>
                  <p className="text-xs text-slate-500">Real-time chat, smooth screen sharing, and waiting room management.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowInfoModal(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white py-3.5 rounded-full font-bold text-base transition-all shadow-md shadow-[#FF5A36]/25 cursor-pointer"
            >
              Start Collaborating Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
