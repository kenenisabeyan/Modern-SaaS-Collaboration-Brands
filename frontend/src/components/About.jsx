import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Shield, Zap, Globe, Users, Target, 
  Cpu, Award, Sparkles, Heart, Lock, ArrowRight, 
  CheckCircle, Clock, Layers, MessageSquare, Monitor
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function About({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const corePrinciples = [
    {
      number: "01",
      icon: <Zap size={26} />,
      title: "Radical Simplicity",
      desc: "Video meetings should begin in seconds, not after downloading 200MB desktop clients or navigating multi-step signups.",
      color: "text-[#FF5A36] bg-[#FF5A36]/10 border-[#FF5A36]/20",
      accent: "bg-[#FF5A36]",
      beamColor: "#FF5A36",
      beamGlow: "rgba(255, 90, 54, 0.7)",
      beamFade: "rgba(255, 90, 54, 0.2)",
      shadowColor: "hover:shadow-[#FF5A36]/15",
      hoverTextColor: "group-hover:text-[#FF5A36]"
    },
    {
      number: "02",
      icon: <Cpu size={26} />,
      title: "Deterministic WebRTC",
      desc: "Engineered with modern browser-native WebRTC mesh architecture delivering crisp 1080p video with sub-50ms audio latency.",
      color: "text-[#1E2761] bg-[#1E2761]/10 border-[#1E2761]/20",
      accent: "bg-[#1E2761]",
      beamColor: "#1E2761",
      beamGlow: "rgba(30, 39, 97, 0.7)",
      beamFade: "rgba(30, 39, 97, 0.2)",
      shadowColor: "hover:shadow-[#1E2761]/15",
      hoverTextColor: "group-hover:text-[#1E2761]"
    },
    {
      number: "03",
      icon: <Shield size={26} />,
      title: "Privacy by Design",
      desc: "End-to-end DTLS-SRTP cryptographic encryption on every media stream. Zero call recording without explicit host consent.",
      color: "text-[#FF5A36] bg-[#FF5A36]/10 border-[#FF5A36]/20",
      accent: "bg-[#FF5A36]",
      beamColor: "#FF5A36",
      beamGlow: "rgba(255, 90, 54, 0.7)",
      beamFade: "rgba(255, 90, 54, 0.2)",
      shadowColor: "hover:shadow-[#FF5A36]/15",
      hoverTextColor: "group-hover:text-[#FF5A36]"
    },
    {
      number: "04",
      icon: <Globe size={26} />,
      title: "Universal Access",
      desc: "Built to run seamlessly across desktops, tablets, and smartphones worldwide, optimizing bandwidth even on fragile mobile networks.",
      color: "text-[#1E2761] bg-[#1E2761]/10 border-[#1E2761]/20",
      accent: "bg-[#1E2761]",
      beamColor: "#1E2761",
      beamGlow: "rgba(30, 39, 97, 0.7)",
      beamFade: "rgba(30, 39, 97, 0.2)",
      shadowColor: "hover:shadow-[#1E2761]/15",
      hoverTextColor: "group-hover:text-[#1E2761]"
    }
  ];

  const pillars = [
    {
      title: "Educators & Masterclass Creators",
      role: "Interactive Teaching",
      desc: "Conduct high-impact cohort workshops with synchronized hand-raising, waiting room gatekeepers, and live chat moderation.",
      metric: "100+ Cohorts"
    },
    {
      title: "Remote Product & Engineering Teams",
      role: "Frictionless Syncs",
      desc: "Hop into instant pairing rooms, share 60fps code walk-throughs, and run daily standups without scheduling overhead.",
      metric: "< 45ms Latency"
    },
    {
      title: "Global Organizations & Communities",
      role: "Scalable Townhalls",
      desc: "Host company-wide all-hands or public webinars with reliable global STUN/TURN fallback and zero attendee sign-in friction.",
      metric: "99.99% Uptime"
    }
  ];

  const techMilestones = [
    { value: "0 sec", label: "Installation Overhead", sub: "100% browser-native WebRTC" },
    { value: "1080p", label: "Ultra HD Media Engine", sub: "Adaptive 60fps video & screen share" },
    { value: "256-bit", label: "Cryptographic Encryption", sub: "DTLS-SRTP transport security" },
    { value: "0", label: "Data Harvesting / Ads", sub: "Your conversations remain private" }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1E2761] font-sans overflow-hidden relative">
      <main className="pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 relative z-10 w-full">
        
        {/* ========================================================
            1. HERO SECTION: THE MISSION & NORTH STAR
           ======================================================== */}
        <section className="text-center mb-16 sm:mb-24 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1E2761]/5 border border-[#1E2761]/10 text-xs font-bold text-[#1E2761] mb-6">
              <Sparkles size={14} className="text-[#FF5A36]" />
              <span>THE WABISEMINAR STORY & VISION</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.08] text-[#1E2761]">
              Built for <span className="text-[#FF5A36]">connection.</span><br />
              Engineered for <span className="text-[#1E2761]">clarity.</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal mb-8">
              We founded WabiSeminar on a straightforward belief: video meetings should be as instantaneous, frictionless, and respectful as real-life conversations.
            </motion.p>
          </motion.div>
        </section>


        {/* ========================================================
            2. THE ORIGIN STORY: WHY WE BUILT WABISEMINAR
           ======================================================== */}
        <section className="mb-20 sm:mb-32 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="bg-[#F5F7FA] border border-[#E4E8EE] rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              <div className="lg:col-span-6 space-y-5 text-left">
                <span className="text-xs font-extrabold tracking-wider uppercase text-[#FF5A36]">Our Genesis</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E2761] tracking-tight leading-tight">
                  Tired of bloated software and arbitrary limits.
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  For years, video conferencing has been dominated by legacy software that demands invasive downloads, forces arbitrary 40-minute cutoffs, and complicates simple meetings with account gates and bloated menus.
                </p>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  We set out to engineer a platform that strips away the artificial friction. WabiSeminar leverages cutting-edge browser WebRTC technology to deliver instant encrypted rooms, crisp screen sharing, and interactive moderation tools directly in your browser tab.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#1E2761]">
                    <CheckCircle size={18} className="text-[#FF5A36]" />
                    <span>No client installation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#1E2761]">
                    <CheckCircle size={18} className="text-[#FF5A36]" />
                    <span>No sudden kickouts</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#1E2761]">
                    <CheckCircle size={18} className="text-[#FF5A36]" />
                    <span>End-to-end encrypted</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="bg-white p-6 rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center mb-4">
                      <Clock size={20} />
                    </div>
                    <h3 className="font-bold text-[#1E2761] mb-1.5">No 40-Min Cutoffs</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      Hold comprehensive masterclasses and team discussions without timers rushing you.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center mb-4">
                      <Monitor size={20} />
                    </div>
                    <h3 className="font-bold text-[#1E2761] mb-1.5">Zero Downloads</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      Attendees click the invite link and join immediately without installing dependencies.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center mb-4">
                      <Lock size={20} />
                    </div>
                    <h3 className="font-bold text-[#1E2761] mb-1.5">Private by Default</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      Encrypted transport ensures conversations and data are never sold or mined for advertising.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center mb-4">
                      <Users size={20} />
                    </div>
                    <h3 className="font-bold text-[#1E2761] mb-1.5">Waiting Room Gate</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      Hosts screen and admit attendees safely, eliminating disruptions and unauthorized visitors.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ========================================================
            3. CORE ARCHITECTURAL PRINCIPLES (BEAM CARDS)
           ======================================================== */}
        <section className="mb-20 sm:mb-32 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
              Our Core <span className="text-[#FF5A36]">Pillars</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal">
              Every feature we build and every line of code we write is guided by four foundational commitments.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          >
            {corePrinciples.map((item, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className={`relative p-[2px] overflow-hidden rounded-none shadow-sm hover:shadow-xl ${item.shadowColor} transition-all flex flex-col justify-between bg-[#E4E8EE] group`}
              >
                {/* Continuous Rotating Border Beam */}
                <div 
                  className="absolute inset-[-250%] animate-spin-beam pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, #E4E8EE 0deg, #E4E8EE 220deg, ${item.beamFade} 260deg, ${item.beamGlow} 310deg, ${item.beamColor} 360deg)`,
                    animationDelay: `${-(idx * 0.88)}s`
                  }}
                />

                {/* Inner Card Content Surface */}
                <div className="relative w-full h-full bg-white group-hover:bg-[#FFFFFF] p-8 rounded-none flex flex-col justify-between transition-colors duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-black text-slate-200 group-hover:text-slate-400 transition-colors font-mono">
                        {item.number}
                      </span>
                      <div className={`w-12 h-12 rounded-none flex items-center justify-center border ${item.color}`}>
                        {item.icon}
                      </div>
                    </div>
                    <h3 className={`text-xl font-bold text-[#1E2761] ${item.hoverTextColor} transition-colors mb-3`}>{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">{item.desc}</p>
                  </div>
                  <div className={`h-1.5 w-12 rounded-none ${item.accent}`}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>


        {/* ========================================================
            4. TECHNICAL ARCHITECTURE: UNDER THE HOOD
           ======================================================== */}
        <section className="w-full bg-[#1E2761] text-white py-16 sm:py-24 mb-20 sm:mb-32 border-0 shadow-none">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
            
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-xs font-extrabold tracking-wider uppercase text-[#FF5A36]">Engineered for Performance</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
                Under the Hood of WabiSeminar
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                By combining WebRTC peer connections with ultra-responsive WebSocket signaling, we deliver high performance with zero middleman servers re-encoding your raw video.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5A36]/20 border border-[#FF5A36]/40 text-[#FF5A36] flex items-center justify-center mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">P2P Media Routing</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Audio and video streams travel directly between peer browsers whenever possible, eliminating central server bottlenecks and guaranteeing minimal round-trip latency.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 text-white flex items-center justify-center mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Cryptographic DTLS-SRTP</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  All media tracks are encrypted via standard Datagram Transport Layer Security (DTLS) and Secure Real-time Transport Protocol (SRTP) from end to end.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5A36]/20 border border-[#FF5A36]/40 text-[#FF5A36] flex items-center justify-center mb-6">
                  <Cpu size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Dynamic Bitrate Scaling</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Our WebRTC pipeline continuously monitors packet loss and jitter, automatically adjusting resolution and framerate to maintain clear audio during bandwidth dips.
                </p>
              </div>

            </div>

            {/* Performance Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-white/10 mt-12 text-center">
              {techMilestones.map((m, i) => (
                <div key={i} className="p-4">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FF5A36] mb-1 font-mono">
                    {m.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                    {m.label}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ========================================================
            5. WHO WABISEMINAR EMPOWERS
           ======================================================== */}
        <section className="mb-20 sm:mb-32 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
              Built for <span className="text-[#FF5A36]">Everyone</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal">
              Whether you are teaching twenty students or hosting an international executive sync, WabiSeminar adapts to your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white border border-[#E4E8EE] rounded-3xl p-8 sm:p-10 shadow-sm hover:border-[#1E2761]/40 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#FF5A36] uppercase tracking-wider mb-2 block">{item.role}</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1E2761] mb-4">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">{item.desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Target Benchmark</span>
                  <span className="text-xs font-bold text-[#1E2761] bg-[#F5F7FA] px-2.5 py-1 rounded-md">{item.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ========================================================
            6. BOTTOM CTA - FULL BLEED EDGE-TO-EDGE
           ======================================================== */}
        <section className="w-full bg-[#F5F7FA] py-16 sm:py-24 border-0 shadow-none text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
              Experience video collaboration without boundaries.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
              No credit card required. Launch your encrypted meeting room in under 5 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => onNavigate(localStorage.getItem('token') ? 'user-dashboard' : 'dashboard')}
                className="bg-[#FF5A36] hover:bg-[#E04826] text-white px-9 py-4 rounded-full font-bold text-base shadow-lg shadow-[#FF5A36]/25 hover:shadow-xl hover:shadow-[#FF5A36]/35 inline-flex items-center space-x-2 transition-all cursor-pointer group"
              >
                <span>Launch Instant Room</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('features')}
                className="bg-white hover:bg-slate-50 text-[#1E2761] border border-[#E4E8EE] px-8 py-4 rounded-full font-bold text-base transition-all cursor-pointer shadow-sm"
              >
                Explore All Features
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
