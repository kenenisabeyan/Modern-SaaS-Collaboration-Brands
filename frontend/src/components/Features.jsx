import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Monitor, Shield, Zap, Globe, MessageSquare, Layers,
  ArrowRight, Smartphone, Activity, CheckCircle, Layout,
  UserPlus, Link as LinkIcon
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
      staggerChildren: 0.1
    }
  }
};

export default function Features({ onNavigate, initialSection }) {
  useEffect(() => {
    if (initialSection) {
      setTimeout(() => {
        const el = document.getElementById(initialSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [initialSection]);

  const steps = [
    {
      number: "01",
      icon: <UserPlus size={26} />,
      title: "Create Free Account",
      desc: "Sign up in 5 seconds with zero software installations or bulky dependencies required.",
      color: "text-[#1E2761] bg-[#1E2761]/10 border-[#1E2761]/20",
      accent: "bg-[#1E2761]",
      beamColor: "#1E2761",
      beamGlow: "rgba(30, 39, 97, 0.7)",
      beamFade: "rgba(30, 39, 97, 0.2)",
      shadowColor: "hover:shadow-[#1E2761]/15",
      hoverTextColor: "group-hover:text-[#1E2761]"
    },
    {
      number: "02",
      icon: <Video size={26} />,
      title: "Generate Room",
      desc: "Launch an instant encrypted video room with 1 click directly from your dashboard.",
      color: "text-[#FF5A36] bg-[#FF5A36]/10 border-[#FF5A36]/20",
      accent: "bg-[#FF5A36]",
      beamColor: "#FF5A36",
      beamGlow: "rgba(255, 90, 54, 0.7)",
      beamFade: "rgba(255, 90, 54, 0.2)",
      shadowColor: "hover:shadow-[#FF5A36]/15",
      hoverTextColor: "group-hover:text-[#FF5A36]"
    },
    {
      number: "03",
      icon: <LinkIcon size={26} />,
      title: "Invite Audience",
      desc: "Copy your unique invite link and share it anywhere. Attendees join directly from browser.",
      color: "text-[#1E2761] bg-[#1E2761]/10 border-[#1E2761]/20",
      accent: "bg-[#1E2761]",
      beamColor: "#1E2761",
      beamGlow: "rgba(30, 39, 97, 0.7)",
      beamFade: "rgba(30, 39, 97, 0.2)",
      shadowColor: "hover:shadow-[#1E2761]/15",
      hoverTextColor: "group-hover:text-[#1E2761]"
    },
    {
      number: "04",
      icon: <Monitor size={26} />,
      title: "Present and Engage",
      desc: "Share your screen, chat with students in real time, and record key insights smoothly.",
      color: "text-[#FF5A36] bg-[#FF5A36]/10 border-[#FF5A36]/20",
      accent: "bg-[#FF5A36]",
      beamColor: "#FF5A36",
      beamGlow: "rgba(255, 90, 54, 0.7)",
      beamFade: "rgba(255, 90, 54, 0.2)",
      shadowColor: "hover:shadow-[#FF5A36]/15",
      hoverTextColor: "group-hover:text-[#FF5A36]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1E2761] font-sans overflow-hidden relative">
      <main className="pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 relative z-10 w-full">
        
        {/* 1. Hero Section */}
        <section className="text-center mb-16 sm:mb-24 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.h1 variants={fadeIn} className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight text-[#1E2761]">
              Built for flawless <span className="text-[#FF5A36]">meetings & masterclasses</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-12 font-normal leading-relaxed">
              Everything you need to host professional, engaging, and secure meetings without the complexity of legacy platforms. Zero downloads. Zero limits. Instant connection.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Integrated "How It Works" 4-Step Process */}
        <section id="how-it-works" className="mb-20 sm:mb-32 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
              How <span className="text-[#FF5A36]">WabiSeminar</span> Works
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal">
              From creating your account to conducting full HD interactive sessions, everything is designed to be frictionless.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          >
            {steps.map((step, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className={`relative p-[2px] overflow-hidden rounded-none shadow-sm hover:shadow-xl ${step.shadowColor} transition-all flex flex-col justify-between bg-[#E4E8EE] group`}
              >
                {/* Rotating Border Beam */}
                <div 
                  className="absolute inset-[-250%] animate-spin-beam pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, #E4E8EE 0deg, #E4E8EE 220deg, ${step.beamFade} 260deg, ${step.beamGlow} 310deg, ${step.beamColor} 360deg)`,
                    animationDelay: `${-(idx * 0.88)}s`
                  }}
                />

                {/* Inner Card Content Surface */}
                <div className="relative w-full h-full bg-white group-hover:bg-[#FFFFFF] p-8 rounded-none flex flex-col justify-between transition-colors duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-black text-slate-200 group-hover:text-slate-400 transition-colors font-mono">
                        {step.number}
                      </span>
                      <div className={`w-12 h-12 rounded-none flex items-center justify-center border ${step.color}`}>
                        {step.icon}
                      </div>
                    </div>
                    <h3 className={`text-xl font-bold text-[#1E2761] ${step.hoverTextColor} transition-colors mb-3`}>{step.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">{step.desc}</p>
                  </div>
                  <div className={`h-1.5 w-12 rounded-none ${step.accent}`}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 3. Main Feature Grid */}
        <section id="features-list" className="mb-20 sm:mb-32 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
              Platform <span className="text-[#FF5A36]">Capabilities</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal">
              Engineered with next-generation WebRTC audio, video, and collaboration tools.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { 
                icon: <Zap size={24}/>, 
                title: "Instant Meeting Rooms", 
                desc: "Generate secure meeting links in one click. No scheduling or setup required.", 
                color: "text-[#FF5A36] bg-[#FF5A36]/10 border-[#FF5A36]/20",
                beamColor: "#FF5A36",
                beamGlow: "rgba(255, 90, 54, 0.7)",
                beamFade: "rgba(255, 90, 54, 0.2)",
                shadowColor: "hover:shadow-[#FF5A36]/15",
                hoverTextColor: "group-hover:text-[#FF5A36]"
              },
              { 
                icon: <Video size={24}/>, 
                title: "HD Video Calls", 
                desc: "Crystal clear 1080p video architecture optimized for low bandwidth.", 
                color: "text-[#1E2761] bg-[#1E2761]/10 border-[#1E2761]/20",
                beamColor: "#1E2761",
                beamGlow: "rgba(30, 39, 97, 0.7)",
                beamFade: "rgba(30, 39, 97, 0.2)",
                shadowColor: "hover:shadow-[#1E2761]/15",
                hoverTextColor: "group-hover:text-[#1E2761]"
              },
              { 
                icon: <Monitor size={24}/>, 
                title: "Screen Sharing", 
                desc: "Share your entire screen or specific windows with zero latency.", 
                color: "text-[#FF5A36] bg-[#FF5A36]/10 border-[#FF5A36]/20",
                beamColor: "#FF5A36",
                beamGlow: "rgba(255, 90, 54, 0.7)",
                beamFade: "rgba(255, 90, 54, 0.2)",
                shadowColor: "hover:shadow-[#FF5A36]/15",
                hoverTextColor: "group-hover:text-[#FF5A36]"
              },
              { 
                icon: <Layers size={24}/>, 
                title: "Live Collaboration", 
                desc: "Interactive tools for real-time whiteboarding and document sharing.", 
                color: "text-[#1E2761] bg-[#1E2761]/10 border-[#1E2761]/20",
                beamColor: "#1E2761",
                beamGlow: "rgba(30, 39, 97, 0.7)",
                beamFade: "rgba(30, 39, 97, 0.2)",
                shadowColor: "hover:shadow-[#1E2761]/15",
                hoverTextColor: "group-hover:text-[#1E2761]"
              },
              { 
                icon: <Shield size={24}/>, 
                title: "Secure Encrypted", 
                desc: "End-to-end encryption ensures your masterclasses remain private and secure.", 
                color: "text-[#1E2761] bg-[#1E2761]/10 border-[#1E2761]/20",
                beamColor: "#1E2761",
                beamGlow: "rgba(30, 39, 97, 0.7)",
                beamFade: "rgba(30, 39, 97, 0.2)",
                shadowColor: "hover:shadow-[#1E2761]/15",
                hoverTextColor: "group-hover:text-[#1E2761]"
              },
              { 
                icon: <Smartphone size={24}/>, 
                title: "Responsive Access", 
                desc: "Flawless experience across desktops, tablets, and smartphones.", 
                color: "text-[#FF5A36] bg-[#FF5A36]/10 border-[#FF5A36]/20",
                beamColor: "#FF5A36",
                beamGlow: "rgba(255, 90, 54, 0.7)",
                beamFade: "rgba(255, 90, 54, 0.2)",
                shadowColor: "hover:shadow-[#FF5A36]/15",
                hoverTextColor: "group-hover:text-[#FF5A36]"
              },
              { 
                icon: <Globe size={24}/>, 
                title: "Zero Downloads", 
                desc: "Browser-based access means your attendees join instantly without friction.", 
                color: "text-[#1E2761] bg-[#1E2761]/10 border-[#1E2761]/20",
                beamColor: "#1E2761",
                beamGlow: "rgba(30, 39, 97, 0.7)",
                beamFade: "rgba(30, 39, 97, 0.2)",
                shadowColor: "hover:shadow-[#1E2761]/15",
                hoverTextColor: "group-hover:text-[#1E2761]"
              },
              { 
                icon: <MessageSquare size={24}/>, 
                title: "Real-time Chat", 
                desc: "Synchronized chat and audio for seamless audience interaction.", 
                color: "text-[#FF5A36] bg-[#FF5A36]/10 border-[#FF5A36]/20",
                beamColor: "#FF5A36",
                beamGlow: "rgba(255, 90, 54, 0.7)",
                beamFade: "rgba(255, 90, 54, 0.2)",
                shadowColor: "hover:shadow-[#FF5A36]/15",
                hoverTextColor: "group-hover:text-[#FF5A36]"
              }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                variants={fadeIn}
                whileHover={{ y: -4 }} 
                className={`relative p-[2px] overflow-hidden rounded-none shadow-sm hover:shadow-xl ${f.shadowColor} transition-all group flex flex-col bg-[#E4E8EE]`}
              >
                {/* Continuous Rotating Border Beam Matching Container Color */}
                <div 
                  className="absolute inset-[-250%] animate-spin-beam pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, #E4E8EE 0deg, #E4E8EE 220deg, ${f.beamFade} 260deg, ${f.beamGlow} 310deg, ${f.beamColor} 360deg)`,
                    animationDelay: `${-(i * 0.44)}s`
                  }}
                />

                {/* Inner Card Content Surface */}
                <div className="relative w-full h-full bg-white group-hover:bg-[#FFFFFF] p-7 rounded-none flex flex-col items-center text-center transition-colors duration-300">
                  <div className={`w-12 h-12 rounded-none flex items-center justify-center mb-5 mx-auto border group-hover:scale-105 transition-transform ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className={`text-lg font-bold mb-2 text-[#1E2761] ${f.hoverTextColor} transition-colors`}>{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 4. Deep Dive WebRTC Architecture */}
        <section id="architecture" className="w-full bg-white py-16 sm:py-24 mb-20 sm:mb-32 border-0 shadow-none">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E2761] mb-4">
                Cutting-Edge WebRTC Infrastructure
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                We combine peer-to-peer WebRTC media streaming with WebSocket signaling to ensure minimal latency and top tier security.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#F5F7FA] p-6 rounded-none border border-[#E4E8EE] shadow-sm text-center">
                <div className="w-12 h-12 rounded-none bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center mx-auto mb-4">
                  <Zap size={24} />
                </div>
                <h4 className="font-bold text-[#1E2761] mb-2">Direct P2P Routing</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Video feeds stream directly between peers for maximum clarity.</p>
              </div>

              <div className="bg-[#F5F7FA] p-6 rounded-none border border-[#E4E8EE] shadow-sm text-center">
                <div className="w-12 h-12 rounded-none bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={24} />
                </div>
                <h4 className="font-bold text-[#1E2761] mb-2">Socket.IO Signaling</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Instant handshake and state synchronization with zero delay.</p>
              </div>

              <div className="bg-[#F5F7FA] p-6 rounded-none border border-[#E4E8EE] shadow-sm text-center">
                <div className="w-12 h-12 rounded-none bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} />
                </div>
                <h4 className="font-bold text-[#1E2761] mb-2">DTLS-SRTP Security</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Every packet is cryptographically encrypted at the transport level.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Interactive Collaboration Section */}
        <section className="w-full bg-[#F5F7FA] py-16 sm:py-24 mb-20 sm:mb-32 border-0 shadow-none">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-[#1E2761]">
                  Designed for lively masterclasses.
                </h2>
                <p className="text-slate-600 text-base sm:text-lg mb-6 leading-relaxed">
                  Engage your audience with tools built for interaction. Whether you're presenting a slide deck, reviewing code, or hosting a Q&A, WabiSeminar makes collaboration feel natural.
                </p>
                <ul className="space-y-3.5">
                  {[
                    "Host controls to mute participants or manage video feeds.",
                    "Waiting room functionality to screen and admit attendees safely.",
                    "Real-time synchronized chat without interrupting speaker flow."
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm sm:text-base text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-[#FF5A36]/15 flex items-center justify-center text-[#FF5A36] text-xs font-bold shrink-0">✓</div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 flex flex-col justify-center space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E2761]/40"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E2761]/20"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A36]"></span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-mono">Live Masterclass Room</span>
                </div>
                <div className="h-44 sm:h-52 bg-[#1E2761] rounded-2xl flex items-center justify-center text-white relative overflow-hidden">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF5A36]/20 border border-[#FF5A36]/40 text-[#FF5A36] flex items-center justify-center mx-auto mb-2">
                      <Video size={22} />
                    </div>
                    <p className="text-sm font-bold text-white">Interactive Video Stream</p>
                    <p className="text-xs text-slate-300">60 FPS 1080p WebRTC Session</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
                    <span className="text-xs font-semibold text-slate-600">Connected Encrypted</span>
                  </div>
                  <span className="text-xs font-bold text-[#FF5A36]">Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Three Core Architectural Pillars */}
        <section className="mb-20 sm:mb-32 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E4E8EE] p-8 rounded-3xl shadow-sm hover:border-[#1E2761]/40 hover:shadow-lg transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1E2761]/10 text-[#1E2761] border border-[#1E2761]/20 flex items-center justify-center mb-6 mx-auto">
                <Layout size={26} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1E2761]">Adaptive Streaming</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our smart WebRTC engine dynamically adjusts video quality based on each participant's network connection, preventing lag and disconnects.
              </p>
            </div>

            <div className="bg-white border border-[#E4E8EE] p-8 rounded-3xl shadow-sm hover:border-[#FF5A36]/40 hover:shadow-lg transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20 flex items-center justify-center mb-6 mx-auto">
                <Shield size={26} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1E2761]">Privacy by Design</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every stream is encrypted end-to-end. Hosts have complete control over who enters the room with mandatory admission approvals.
              </p>
            </div>

            <div className="bg-white border border-[#E4E8EE] p-8 rounded-3xl shadow-sm hover:border-[#1E2761]/40 hover:shadow-lg transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1E2761]/10 text-[#1E2761] border border-[#1E2761]/20 flex items-center justify-center mb-6 mx-auto">
                <Activity size={26} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1E2761]">Zero Lag Sync</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sub-50ms peer-to-peer audio and screen sharing ensures questions, presentations, and code walk-throughs remain perfectly synchronized.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Integrated "About WabiSeminar" Mission Section */}
        <section id="about" className="w-full bg-[#FFFFFF] text-[#1E2761] py-16 sm:py-24 mb-20 sm:mb-32 border-0 shadow-none">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-6 tracking-tight">
                About <span className="text-[#FF5A36]">WabiSeminar</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-10 font-normal">
                WabiSeminar was created to eliminate the clutter, bloat, and paywalls of legacy video conferencing platforms. We believe high-definition, interactive masterclasses and meetings should be accessible directly in any browser with zero downloads, zero setup, and bank-grade privacy.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="bg-[#F5F7FA] border border-[#E4E8EE] p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#FF5A36] mb-2 font-mono">0 sec</p>
                  <p className="text-base font-bold text-[#1E2761]">Zero Installation</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">Runs 100% in modern browsers with zero plugins or downloads.</p>
                </div>
                <div className="bg-[#F5F7FA] border border-[#E4E8EE] p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#1E2761] mb-2 font-mono">1080p</p>
                  <p className="text-base font-bold text-[#1E2761]">Ultra HD Clarity</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">Adaptive WebRTC streaming optimized for low-bandwidth networks.</p>
                </div>
                <div className="bg-[#F5F7FA] border border-[#E4E8EE] p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#FF5A36] mb-2 font-mono">100%</p>
                  <p className="text-base font-bold text-[#1E2761]">Private & Encrypted</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">End-to-end cryptographic encryption for video, audio, and chat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. CTA Section */}
        <section className="w-full bg-[#F5F7FA] py-16 sm:py-24 border-0 shadow-none text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
              Ready to host your next masterclass?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
              Join thousands of educators and creators who have upgraded their meeting experience with WabiSeminar.
            </p>
            <button 
              onClick={() => onNavigate(localStorage.getItem('token') ? 'user-dashboard' : 'dashboard')}
              className="bg-[#FF5A36] hover:bg-[#E04826] text-white px-9 py-4 rounded-full font-bold text-base shadow-lg shadow-[#FF5A36]/25 hover:shadow-xl hover:shadow-[#FF5A36]/35 inline-flex items-center space-x-2 transition-all cursor-pointer group"
            >
              <span>Host a Free Room</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
