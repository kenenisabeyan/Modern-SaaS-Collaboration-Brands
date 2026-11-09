import { useRef, useState, useEffect } from 'react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';
import HeroAnimation from './HeroAnimation.jsx';
import { 
  Video, Users, Loader2, Sparkles, Zap, Shield, Clock, Monitor, 
  ChevronRight, Link, CheckCircle, Star, MessageSquare, GraduationCap, 
  BookOpen, Heart, ArrowRight, X, Rocket, Award, Lightbulb, Compass
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ onNavigate, onJoinRoom, notify }) {
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [actionError, setActionError] = useState('');
  const [platformStats, setPlatformStats] = useState({ users: 1240, meetings: 486, minutes: 28500 });
  const createInFlightRef = useRef(false);

  useEffect(() => {
    api.getStats().then(res => {
      if (res && res.success && res.data) {
        setPlatformStats({
          users: res.data.users || 1240,
          meetings: res.data.meetings || 486,
          minutes: res.data.minutes || 28500
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

      notify?.('success', 'Meeting created. Opening your room...');
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
    } else {
      setShowInfoModal(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-[#ec232b] selection:text-white">
      
      <main className="flex-1 flex flex-col pt-24 sm:pt-28 md:pt-32 relative z-10">
        
        {/* ========================================================
            HERO SECTION (EXACT 1-TO-1 MATCH OF SCREENSHOT 1)
           ======================================================== */}
        <section className="min-h-[calc(100vh-140px)] flex items-center px-6 sm:px-10 lg:px-16 xl:px-24 bg-white relative">
          <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-8 lg:py-0">
            
            {/* Left Column: Heading and Pill Button */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-5 flex flex-col justify-center items-start space-y-7 sm:space-y-9"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[88px] font-extrabold tracking-tight leading-[1.04] select-none text-left">
                <span className="text-[#ec232b] block">Amplifying</span>
                <span className="text-[#2c2c2e] block">Startups</span>
              </h1>

              {/* Exact Pill Button from Screenshot 1 */}
              <div>
                <button 
                  onClick={() => scrollToSection('launchpad')}
                  className="bg-[#ec232b] hover:bg-[#d61b23] text-white font-medium text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-[0_4px_16px_rgba(236,35,43,0.32)] hover:shadow-[0_6px_22px_rgba(236,35,43,0.45)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  Learn how we do it
                </button>
              </div>
            </motion.div>

            {/* Right Column: 3D Animated Turbine Platform Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-7 flex items-center justify-center relative w-full"
            >
              <div className="w-full max-w-[680px] lg:max-w-[800px] aspect-square flex items-center justify-center">
                <HeroAnimation />
              </div>
            </motion.div>

          </div>
        </section>


        {/* ========================================================
            COLLABORATION & MEETING LAUNCHPAD SECTION
           ======================================================== */}
        <section id="launchpad" className="py-20 sm:py-28 bg-white border-t border-slate-100 px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto">
            
            {/* Error Banner */}
            {actionError && (
              <div className="mb-8 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm flex items-center shadow-sm">
                <Shield className="mr-3 text-rose-500 shrink-0" size={18} />
                <span>{actionError}</span>
              </div>
            )}

            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0DA9CF]/10 text-[#0DA9CF] border border-[#0DA9CF]/20 mb-4">
                Virtual Collaboration Hub
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Seamless Video Collaboration for Teams
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Connect startup founders, mentors, and global innovators. Host encrypted real-time meetings or jump into live masterclasses instantly.
              </p>
            </div>

            {/* Meeting Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto mb-20">
              
              {/* Host Session Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(13,169,207,0.12)] hover:border-[#0DA9CF]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#0DA9CF]/10 border border-[#0DA9CF]/20 flex items-center justify-center text-[#0DA9CF] mb-6">
                    <Video size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Host a Session</h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                    Generate a secure, end-to-end encrypted room instantly and invite your team or students with a single link.
                  </p>
                </div>

                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full bg-[#0DA9CF] hover:bg-[#0C8DB0] text-white py-4 px-6 rounded-full font-bold text-base transition-all flex items-center justify-center shadow-lg shadow-[#0DA9CF]/25 hover:shadow-xl hover:shadow-[#0DA9CF]/35 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-3 animate-spin" size={20} />
                      <span>Creating Room...</span>
                    </>
                  ) : (
                    <>
                      <Video className="mr-3" size={20} />
                      <span>Create Instant Room</span>
                    </>
                  )}
                </button>
              </div>

              {/* Join Session Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(246,126,49,0.12)] hover:border-[#F67E31]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#F67E31]/10 border border-[#F67E31]/20 flex items-center justify-center text-[#F67E31] mb-6">
                    <Users size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Join a Session</h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                    Enter a room ID or paste an invite link to jump directly into a live masterclass or startup consultation.
                  </p>
                  
                  <div className="relative mb-6">
                    <input 
                      type="text" 
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      placeholder="e.g. abc-defg-hij" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F67E31]/30 focus:border-[#F67E31] text-sm sm:text-base transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!joinId.trim() || isJoining}
                  className="w-full bg-[#F67E31] hover:bg-[#CC6A2F] text-white py-4 px-6 rounded-full font-bold text-base transition-all flex items-center justify-center shadow-lg shadow-[#F67E31]/25 hover:shadow-xl hover:shadow-[#F67E31]/35 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-3 animate-spin" size={20} />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <Link className="mr-3" size={20} />
                      <span>Join Room</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm hover:border-[#0DA9CF]/40 transition-all">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#0DA9CF] mb-1">
                  {platformStats.users.toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Innovators Connected</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm hover:border-[#F67E31]/40 transition-all">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#F67E31] mb-1">
                  {platformStats.meetings.toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sessions Hosted</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm hover:border-[#04B84C]/40 transition-all">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#04B84C] mb-1">
                  {platformStats.minutes.toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collaboration Minutes</div>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================
            CORE INNOVATION PILLARS (ICEADDIS ECOSYSTEM)
           ======================================================== */}
        <section id="programs" className="py-20 sm:py-28 bg-white border-t border-slate-100 px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ec232b]/10 text-[#ec232b] border border-[#ec232b]/20 mb-4">
                What We Do
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Empowering the Next Generation of Founders
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                As Ethiopia’s premier innovation hub and tech incubator, we bridge local talent with international opportunities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-[#0DA9CF]/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#0DA9CF]/10 border border-[#0DA9CF]/20 flex items-center justify-center text-[#0DA9CF] mb-6">
                    <Rocket size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Incubation</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Hands-on support for early-stage tech founders, turning validated prototypes into sustainable, market-ready businesses.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate('pricing')}
                  className="inline-flex items-center text-sm font-semibold text-[#0DA9CF] hover:underline cursor-pointer"
                >
                  Explore programs <ChevronRight size={16} className="ml-1" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-[#F67E31]/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#F67E31]/10 border border-[#F67E31]/20 flex items-center justify-center text-[#F67E31] mb-6">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">ice180 Acceleration</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    High-velocity 180-day growth program preparing growth-stage startups for venture capital, scaling, and market expansion.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate('pricing')}
                  className="inline-flex items-center text-sm font-semibold text-[#F67E31] hover:underline cursor-pointer"
                >
                  View criteria <ChevronRight size={16} className="ml-1" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-[#04B84C]/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#04B84C]/10 border border-[#04B84C]/20 flex items-center justify-center text-[#04B84C] mb-6">
                    <Video size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Masterclasses</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Interactive virtual classrooms where industry leaders train developers, founders, and innovators in cutting-edge skills.
                  </p>
                </div>
                <button 
                  onClick={() => scrollToSection('launchpad')}
                  className="inline-flex items-center text-sm font-semibold text-[#04B84C] hover:underline cursor-pointer"
                >
                  Host or join <ChevronRight size={16} className="ml-1" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-[#ec232b]/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#ec232b]/10 border border-[#ec232b]/20 flex items-center justify-center text-[#ec232b] mb-6">
                    <Lightbulb size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Ecosystem Policy</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Advocating for progressive startup policies, cross-border investments, and fostering healthy local entrepreneurship.
                  </p>
                </div>
                <button 
                  onClick={() => setShowInfoModal(true)}
                  className="inline-flex items-center text-sm font-semibold text-[#ec232b] hover:underline cursor-pointer"
                >
                  Read impact <ChevronRight size={16} className="ml-1" />
                </button>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================
            FEATURES SECTION
           ======================================================== */}
        <section id="features" className="py-20 sm:py-28 bg-white border-t border-slate-100 px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0DA9CF]/10 text-[#0DA9CF] border border-[#0DA9CF]/20 mb-4">
                Built For Performance
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Everything You Need for Seamless Collaboration
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Crystal-clear audio, low-latency video, and interactive tools built right into your browser with zero installations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 hover:border-[#0DA9CF]/40 shadow-sm hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-[#0DA9CF]/10 border border-[#0DA9CF]/20 text-[#0DA9CF] rounded-2xl flex items-center justify-center mb-6"> 
                  <Video size={28} /> 
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Ultra HD Video</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Adaptive bitrate streaming ensures sharp video and crisp audio regardless of local connection speeds.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 hover:border-[#04B84C]/40 shadow-sm hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-[#04B84C]/10 border border-[#04B84C]/20 text-[#04B84C] rounded-2xl flex items-center justify-center mb-6"> 
                  <MessageSquare size={28} /> 
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Real-time Interaction</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Keep students and collaborators engaged with integrated chat, interactive Q&A, and live reactions.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 hover:border-[#F67E31]/40 shadow-sm hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-[#F67E31]/10 border border-[#F67E31]/20 text-[#F67E31] rounded-2xl flex items-center justify-center mb-6"> 
                  <Monitor size={28} /> 
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Smooth Screen Sharing</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Present slides, live code, or design prototypes with high framerate screen sharing at 60 FPS.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================
            ROLES SECTION
           ======================================================== */}
        <section className="py-20 sm:py-28 bg-white border-t border-slate-100 px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto text-center">
            
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-14 tracking-tight text-slate-900">
              One Unified Ecosystem for <span className="text-[#F67E31]">Every Role</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-200 hover:border-[#0DA9CF]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#0DA9CF]/10 border border-[#0DA9CF]/20 flex items-center justify-center text-[#0DA9CF] mb-6">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Learners</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Gain industry skills through live workshops, interact with mentors, and earn verified certifications.
                </p>
              </div>

              <div className="bg-white border border-slate-200 hover:border-[#F67E31]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#F67E31]/10 border border-[#F67E31]/20 flex items-center justify-center text-[#F67E31] mb-6">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Instructors</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Teach cohorts worldwide with friction-free rooms, interactive attendance, and session control.
                </p>
              </div>

              <div className="bg-white border border-slate-200 hover:border-[#04B84C]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#04B84C]/10 border border-[#04B84C]/20 flex items-center justify-center text-[#04B84C] mb-6">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Founders</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Pitch to angel syndicates, hold team standups, and collaborate with product builders globally.
                </p>
              </div>

              <div className="bg-white border border-slate-200 hover:border-[#0DA9CF]/40 p-8 rounded-3xl flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#0DA9CF]/10 border border-[#0DA9CF]/20 flex items-center justify-center text-[#0DA9CF] mb-6">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Sponsors</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Sponsor innovative founders and track educational impact through verifiable community metrics.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================
            TESTIMONIALS SECTION
           ======================================================== */}
        <section className="py-20 sm:py-28 bg-white border-t border-slate-100 px-4 sm:px-8 lg:px-16">
          <div className="max-w-[1300px] mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0DA9CF]/10 text-[#0DA9CF] border border-[#0DA9CF]/20 mb-4">
                Community Stories
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Trusted by Leaders & Innovators
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                See what startups and educators say about collaborating through our platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-[#F67E31]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-5">
                    <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    "Hosting mentorship sessions and cohort check-ins has never been easier. Zero downloads for participants and rock-solid audio quality."
                  </p>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#F67E31] flex items-center justify-center font-bold text-white text-base">K</div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm">Kenenisa Beyan</h4>
                    <p className="text-slate-500 text-xs">Innovation Fellow</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-[#04B84C]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-5">
                    <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    "The screen sharing clarity and responsive room layout made conducting remote design reviews a breeze. Highly recommended!"
                  </p>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#04B84C] flex items-center justify-center font-bold text-white text-base">Y</div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm">Yerosan Girma</h4>
                    <p className="text-slate-500 text-xs">Startup Founder</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-[#0DA9CF]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-5">
                    <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    "We migrated our startup team meetings over to this hub. Instant rooms, privacy by design, and beautiful, modern UI."
                  </p>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#0DA9CF] flex items-center justify-center font-bold text-white text-base">D</div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm">Dagin A.</h4>
                    <p className="text-slate-500 text-xs">Software Engineer</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>


      {/* ========================================================
          "LEARN HOW WE DO IT" INFORMATION MODAL
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

            <div className="w-14 h-14 rounded-2xl bg-[#ec232b]/10 text-[#ec232b] flex items-center justify-center mb-6">
              <Rocket size={28} />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Amplifying Startups</h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              At iceaddis, we identify bold ideas and provide founders with the mentorship, technology, and global network needed to build enduring companies.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle size={20} className="text-[#04B84C] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Seed Incubation</h4>
                  <p className="text-xs text-slate-500">From concept validation to initial market traction.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle size={20} className="text-[#0DA9CF] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">ice180 Acceleration</h4>
                  <p className="text-xs text-slate-500">Intensive preparation for institutional venture investment.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle size={20} className="text-[#F67E31] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Virtual Collaboration</h4>
                  <p className="text-xs text-slate-500">Encrypted real-time video rooms for mentoring and masterclasses.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowInfoModal(false);
                scrollToSection('launchpad');
              }}
              className="w-full bg-[#ec232b] hover:bg-[#d61b23] text-white py-3.5 rounded-full font-bold text-base transition-all shadow-md cursor-pointer"
            >
              Start Collaborating Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
