import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Monitor, Shield, Zap, Globe, MessageSquare, Layers,
  ChevronRight, Smartphone, Activity, CheckCircle, Layout
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

export default function Features({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-hidden relative">
      <main className="pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* 1. Hero Section */}
        <section className="text-center mb-16 sm:mb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0DA9CF]/10 text-[#0DA9CF] border border-[#0DA9CF]/20 mb-4">
              Platform Features
            </span>
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.08] text-slate-900">
              Built for <span className="text-[#0DA9CF]">flawless</span> masterclasses.
            </motion.h1>
            <motion.p variants={fadeIn} className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal mb-8">
              Everything you need to host professional, engaging, and secure meetings without the complexity of legacy platforms. Zero downloads. Zero limits. Instant connection.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Main Feature Grid */}
        <section className="mb-20 sm:mb-32">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: <Zap size={24}/>, title: "Instant Meeting Rooms", desc: "Generate secure meeting links in one click. No scheduling or setup required.", color: "text-[#0DA9CF] bg-[#0DA9CF]/10 border-[#0DA9CF]/20", hover: "hover:border-[#0DA9CF]/50 hover:shadow-lg" },
              { icon: <Video size={24}/>, title: "HD Video Calls", desc: "Crystal clear 1080p video architecture optimized for low bandwidth.", color: "text-[#04B84C] bg-[#04B84C]/10 border-[#04B84C]/20", hover: "hover:border-[#04B84C]/50 hover:shadow-lg" },
              { icon: <Monitor size={24}/>, title: "Screen Sharing", desc: "Share your entire screen or specific windows with zero latency.", color: "text-[#F67E31] bg-[#F67E31]/10 border-[#F67E31]/20", hover: "hover:border-[#F67E31]/50 hover:shadow-lg" },
              { icon: <Layers size={24}/>, title: "Live Collaboration", desc: "Interactive tools for real-time whiteboarding and document sharing.", color: "text-[#0DA9CF] bg-[#0DA9CF]/10 border-[#0DA9CF]/20", hover: "hover:border-[#0DA9CF]/50 hover:shadow-lg" },
              { icon: <Shield size={24}/>, title: "Secure Encrypted", desc: "End-to-end encryption ensures your masterclasses remain private and secure.", color: "text-[#04B84C] bg-[#04B84C]/10 border-[#04B84C]/20", hover: "hover:border-[#04B84C]/50 hover:shadow-lg" },
              { icon: <Smartphone size={24}/>, title: "Responsive Access", desc: "Flawless experience across desktops, tablets, and smartphones.", color: "text-[#F67E31] bg-[#F67E31]/10 border-[#F67E31]/20", hover: "hover:border-[#F67E31]/50 hover:shadow-lg" },
              { icon: <Globe size={24}/>, title: "Zero Downloads", desc: "Browser-based access means your attendees join instantly without friction.", color: "text-[#0DA9CF] bg-[#0DA9CF]/10 border-[#0DA9CF]/20", hover: "hover:border-[#0DA9CF]/50 hover:shadow-lg" },
              { icon: <MessageSquare size={24}/>, title: "Real-time Chat", desc: "Synchronized chat and audio for seamless audience interaction.", color: "text-[#F67E31] bg-[#F67E31]/10 border-[#F67E31]/20", hover: "hover:border-[#F67E31]/50 hover:shadow-lg" }
            ].map((f, i) => (
              <motion.div key={i} variants={fadeIn} whileHover={{ y: -4 }} className={`bg-white border border-slate-200 p-7 rounded-3xl transition-all duration-300 group shadow-sm ${f.hover}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border group-hover:scale-105 transition-transform ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 3. Interactive Collaboration Section */}
        <section className="mb-20 sm:mb-32">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 md:p-16 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                <span className="inline-block px-3.5 py-1 rounded-full border border-[#F67E31]/30 bg-[#F67E31]/10 text-[#F67E31] text-xs font-bold mb-4">
                  Interactive Engagement
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-slate-900">
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
                      <div className="w-5 h-5 rounded-full bg-[#04B84C]/15 flex items-center justify-center text-[#04B84C] text-xs font-bold shrink-0">✓</div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-center space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-mono">Live Masterclass Room</span>
                </div>
                <div className="h-44 sm:h-52 bg-slate-900 rounded-2xl flex items-center justify-center text-white relative overflow-hidden">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-[#0DA9CF]/20 border border-[#0DA9CF]/40 text-[#0DA9CF] flex items-center justify-center mx-auto mb-2">
                      <Video size={22} />
                    </div>
                    <p className="text-sm font-bold text-white">Interactive Video Stream</p>
                    <p className="text-xs text-slate-400">60 FPS 1080p WebRTC Session</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#04B84C] animate-pulse"></span>
                    <span className="text-xs font-semibold text-slate-600">Connected Encrypted</span>
                  </div>
                  <span className="text-xs font-bold text-[#0DA9CF]">Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Three Core Architectural Pillars */}
        <section className="mb-20 sm:mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-[#0DA9CF]/50 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#0DA9CF]/10 text-[#0DA9CF] flex items-center justify-center mb-6">
                <Layout size={26} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Adaptive Streaming</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our smart WebRTC engine dynamically adjusts video quality based on each participant's network connection, preventing lag and disconnects.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-[#04B84C]/50 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#04B84C]/10 text-[#04B84C] flex items-center justify-center mb-6">
                <Shield size={26} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Privacy by Design</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every stream is encrypted end-to-end. Hosts have complete control over who enters the room with mandatory admission approvals.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-[#F67E31]/50 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#F67E31]/10 text-[#F67E31] flex items-center justify-center mb-6">
                <Activity size={26} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Zero Lag Sync</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sub-50ms peer-to-peer audio and screen sharing ensures questions, presentations, and code walk-throughs remain perfectly synchronized.
              </p>
            </div>

          </div>
        </section>

        {/* 5. CTA Section */}
        <section className="text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-16 shadow-md max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Ready to host your next masterclass?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
              Join thousands of educators and creators who have upgraded their meeting experience with WabiSeminar.
            </p>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="bg-[#0DA9CF] hover:bg-[#0C8DB0] text-white px-9 py-4 rounded-full font-bold text-base shadow-lg shadow-[#0DA9CF]/25 hover:shadow-xl hover:shadow-[#0DA9CF]/35 inline-flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>Host a Free Room</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
