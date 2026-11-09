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
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-[#0DA9CF] selection:text-white">
      
      <main className="flex-1 flex flex-col pt-16 sm:pt-20 relative z-10">
        
        {/* ========================================================
            HERO SECTION: 2 COLUMNS (TIGHT, COMPACT SPACING)
           ======================================================== */}
        <section className="pt-3 sm:pt-6 pb-10 sm:pb-14 px-4 sm:px-8 lg:px-12 xl:px-16 bg-white relative">
          <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Heading and Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-6 flex flex-col justify-center items-start space-y-5 sm:space-y-6 pt-2 sm:pt-4"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[76px] font-extrabold tracking-tight leading-[1.05] select-none text-left">
                <span className="text-[#0DA9CF] block">Host Engaging</span>
                <span className="text-[#1E293B] block">Masterclasses</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-[500px] leading-relaxed font-normal">
                Create a free, encrypted meeting room instantly or join an existing session in seconds. Built for innovative educators, creators, and teams who value simplicity and connection.
              </p>

              {/* Feature check marks */}
              <div className="flex flex-wrap items-center gap-5 pt-1 text-xs sm:text-sm text-slate-500 font-medium">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle size={15} className="text-[#04B84C]" />
                  <span>Zero Downloads</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle size={15} className="text-[#0DA9CF]" />
                  <span>Ultra HD Video</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle size={15} className="text-[#F67E31]" />
                  <span>End-to-End Secure</span>
                </div>
              </div>
            </motion.div>


            {/* Right Column: Instant Collaboration Card with Integrated 3D Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-6 flex flex-col items-center justify-center w-full max-w-[530px] mx-auto lg:ml-auto"
            >
              
              {/* Instant Collaboration Card (Compact & Tight) */}
              <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_45px_rgba(13,169,207,0.1)] transition-all relative">
                
                {/* Header with Integrated Compact 3D Turbine Graphic */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#0DA9CF]/10 text-[#0DA9CF] border border-[#0DA9CF]/20 mb-1.5">
                      Instant Collaboration
                    </span>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      Start or Join a Session Now
                    </h2>
                  </div>

                  {/* Compact 3D Turbine Animation */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 aspect-square shrink-0 select-none pointer-events-none -my-2">
                    <HeroAnimation className="w-full h-full" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
                  Seamless real-time meetings with screen sharing, participant controls, and interactive chat.
                </p>

                {/* Error Banner */}
                {actionError && (
                  <div className="mb-3.5 p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center">
                    <Shield className="mr-2 text-rose-500 shrink-0" size={15} />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* 2 Sub-cards: Host a Session & Join a Session */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  
                  {/* Host a Session */}
                  <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between hover:border-[#0DA9CF]/40 transition-colors">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-[#0DA9CF]/10 text-[#0DA9CF] flex items-center justify-center mb-2">
                        <Video size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">Host a Session</h3>
                      <p className="text-[11px] text-slate-500 leading-snug mb-3">
                        Generate a secure, end-to-end encrypted room instantly and invite your attendees with a single link.
                      </p>
                    </div>

                    <button
                      onClick={handleCreateRoom}
                      disabled={isCreating}
                      className="w-full bg-[#0DA9CF] hover:bg-[#0C8DB0] text-white py-2.5 px-3 rounded-full font-bold text-xs transition-all flex items-center justify-center shadow-md shadow-[#0DA9CF]/20 hover:shadow-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-1.5 animate-spin" size={13} />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Video className="mr-1.5" size={13} />
                          <span>Create Instant Room</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Join a Session */}
                  <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between hover:border-[#F67E31]/40 transition-colors">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-[#F67E31]/10 text-[#F67E31] flex items-center justify-center mb-2">
                        <Users size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">Join a Session</h3>
                      <p className="text-[11px] text-slate-500 leading-snug mb-2.5">
                        Enter a room ID or paste an invite link to jump directly into an existing masterclass or webinar.
                      </p>
                      <input 
                        type="text" 
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        placeholder="e.g. abc-defg-hij" 
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#F67E31]/40 focus:border-[#F67E31] text-xs mb-3 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                      />
                    </div>

                    <button
                      onClick={handleJoinRoom}
                      disabled={!joinId.trim() || isJoining}
                      className="w-full bg-[#F67E31] hover:bg-[#CC6A2F] text-white py-2.5 px-3 rounded-full font-bold text-xs transition-all flex items-center justify-center shadow-md shadow-[#F67E31]/20 hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="mr-1.5 animate-spin" size={13} />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <Link className="mr-1.5" size={13} />
                          <span>Join Room</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

                {/* Stats Strip: 36 Happy Users, 5 Meetings Hosted, 225 Minutes Connected */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="text-base sm:text-lg font-black text-[#0DA9CF]">
                      {platformStats.users.toLocaleString()}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight">Happy Users</div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="text-base sm:text-lg font-black text-[#F67E31]">
                      {platformStats.meetings.toLocaleString()}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight">Meetings Hosted</div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="text-base sm:text-lg font-black text-[#04B84C]">
                      {platformStats.minutes.toLocaleString()}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight">Minutes Connected</div>
                  </div>
                </div>

              </div>

            </motion.div>

          </div>
        </section>


        {/* ========================================================
            FEATURES SECTION
           ======================================================== */}
        <section id="features" className="py-16 sm:py-24 bg-white border-t border-slate-100 px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0DA9CF]/10 text-[#0DA9CF] border border-[#0DA9CF]/20 mb-4">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Everything You Need for Perfect Seminars
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                WabiSeminar brings together the best tools for video collaboration in one beautiful, frictionless package.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 hover:border-[#0DA9CF]/40 shadow-sm hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-[#0DA9CF]/10 border border-[#0DA9CF]/20 text-[#0DA9CF] rounded-2xl flex items-center justify-center mb-6"> 
                  <Video size={28} /> 
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Ultra HD Video</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Experience crystal-clear video and audio quality powered by advanced WebRTC architecture, ensuring you always look your best.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 hover:border-[#04B84C]/40 shadow-sm hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-[#04B84C]/10 border border-[#04B84C]/20 text-[#04B84C] rounded-2xl flex items-center justify-center mb-6"> 
                  <MessageSquare size={28} /> 
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Real-time Chat</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Keep your audience engaged with lightning-fast built-in chat. Share links, answer questions, and foster community instantly.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 hover:border-[#F67E31]/40 shadow-sm hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-[#F67E31]/10 border border-[#F67E31]/20 text-[#F67E31] rounded-2xl flex items-center justify-center mb-6"> 
                  <Monitor size={28} /> 
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Screen Sharing</h3>
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
        <section className="py-16 sm:py-24 bg-white border-t border-slate-100 px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto text-center">
            
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-12 tracking-tight text-slate-900">
              One Platform <span className="text-[#F67E31]">Every Role Connected</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-200 hover:border-[#0DA9CF]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#0DA9CF]/10 border border-[#0DA9CF]/20 flex items-center justify-center text-[#0DA9CF] mb-6">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Learners</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Learn step-by-step, track your progress, and build skills for your future.
                </p>
              </div>

              <div className="bg-white border border-slate-200 hover:border-[#F67E31]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#F67E31]/10 border border-[#F67E31]/20 flex items-center justify-center text-[#F67E31] mb-6">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Instructors</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Create impactful courses and guide learners with structured teaching tools.
                </p>
              </div>

              <div className="bg-white border border-slate-200 hover:border-[#04B84C]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#04B84C]/10 border border-[#04B84C]/20 flex items-center justify-center text-[#04B84C] mb-6">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Parents</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Stay involved with real-time insights into learning progress and performance.
                </p>
              </div>

              <div className="bg-white border border-slate-200 hover:border-[#0DA9CF]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#0DA9CF]/10 border border-[#0DA9CF]/20 flex items-center justify-center text-[#0DA9CF] mb-6">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Sponsors</h3>
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
        <section className="py-16 sm:py-24 bg-white border-t border-slate-100 px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0DA9CF]/10 text-[#0DA9CF] border border-[#0DA9CF]/20 mb-4">
                Loved by educators
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                What Our Community Says
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                See why thousands of professionals choose WabiSeminar over legacy conferencing platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-[#F67E31]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-5">
                    <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    "WabiSeminar completely changed how I host my design masterclasses. The UI is gorgeous, and my students love that they don't have to download any software."
                  </p>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#F67E31] flex items-center justify-center font-bold text-white text-base">K</div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm">Kenenisa Beyan</h4>
                    <p className="text-slate-500 text-xs">Lead Designer, StudioX</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-[#04B84C]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-5">
                    <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    "The waiting room feature is perfect for managing my 1-on-1 coaching sessions. The video quality has been incredibly stable even on lower bandwidths."
                  </p>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#04B84C] flex items-center justify-center font-bold text-white text-base">Y</div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm">Yerosan Girma</h4>
                    <p className="text-slate-500 text-xs">Executive Coach</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-[#0DA9CF]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-5">
                    <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    "We moved our entire remote engineering team over to WabiSeminar for our daily standups. It's fast, free, and secure. What more could you ask for?"
                  </p>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#0DA9CF] flex items-center justify-center font-bold text-white text-base">D</div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm">Dagin A.</h4>
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
