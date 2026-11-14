import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, UserPlus, Link as LinkIcon, Monitor, 
  ArrowRight, Zap, MessageSquare, Shield
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
      staggerChildren: 0.15
    }
  }
};

export default function HowItWorks({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="min-h-screen bg-white text-[#1E2761] font-sans overflow-hidden relative">
      <main className="pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 relative z-10 w-full">
        
        {/* 1. Hero Section */}
        <section className="text-center mb-16 sm:mb-24 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1E2761]/10 text-[#1E2761] border border-[#1E2761]/20 mb-4">
              Simple 4-Step Process
            </span>
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.08] text-[#1E2761]">
              How <span className="text-[#FF5A36]">WabiSeminar</span> Works
            </motion.h1>
            <motion.p variants={fadeIn} className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal mb-8">
              From creating your account to conducting full HD interactive masterclasses, everything is designed to be frictionless.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Step by Step Grid */}
        <section className="mb-20 sm:mb-32 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
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
                {/* Continuous Rotating Border Beam with Card's Specific Container Color (90° Rectangle Border Radius) */}
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

        {/* 3. Deep Dive Architecture - Full-Bleed 100% Horizontal Canvas #F5F7FA (Zero Horizontal Side Borders) */}
        <section className="w-full bg-[#F5F7FA] py-16 sm:py-24 border-0 shadow-none">
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
              <div className="bg-white p-6 rounded-none border border-[#E4E8EE] shadow-sm text-center">
                <div className="w-12 h-12 rounded-none bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center mx-auto mb-4">
                  <Zap size={24} />
                </div>
                <h4 className="font-bold text-[#1E2761] mb-2">Direct P2P Routing</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Video feeds stream directly between peers for maximum clarity.</p>
              </div>

              <div className="bg-white p-6 rounded-none border border-[#E4E8EE] shadow-sm text-center">
                <div className="w-12 h-12 rounded-none bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={24} />
                </div>
                <h4 className="font-bold text-[#1E2761] mb-2">Socket.IO Signaling</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Instant handshake and state synchronization with zero delay.</p>
              </div>

              <div className="bg-white p-6 rounded-none border border-[#E4E8EE] shadow-sm text-center">
                <div className="w-12 h-12 rounded-none bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} />
                </div>
                <h4 className="font-bold text-[#1E2761] mb-2">DTLS-SRTP Security</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Every packet is cryptographically encrypted at the transport level.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Bottom CTA - Full-Bleed Edge-to-Edge (Zero Horizontal Borders) */}
        <section className="w-full bg-white py-16 sm:py-24 border-0 shadow-none text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
              Ready to experience effortless seminars?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
              No credit card required. Launch your free room in seconds.
            </p>
            <button 
              onClick={() => onNavigate(localStorage.getItem('token') ? 'user-dashboard' : 'dashboard')}
              className="bg-[#FF5A36] hover:bg-[#E04826] text-white px-9 py-4 rounded-full font-bold text-base shadow-lg shadow-[#FF5A36]/25 hover:shadow-xl hover:shadow-[#FF5A36]/35 inline-flex items-center space-x-2 transition-all cursor-pointer group"
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
