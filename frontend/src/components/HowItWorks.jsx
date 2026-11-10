import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, UserPlus, Link as LinkIcon, Monitor, 
  ChevronRight, ArrowRight, Zap, MessageSquare, Shield
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
      color: "text-[#0DA9CF] bg-[#0DA9CF]/10 border-[#0DA9CF]/20",
      accent: "bg-[#0DA9CF]"
    },
    {
      number: "02",
      icon: <Video size={26} />,
      title: "Generate Room",
      desc: "Launch an instant encrypted video room with 1 click directly from your dashboard.",
      color: "text-[#F67E31] bg-[#F67E31]/10 border-[#F67E31]/20",
      accent: "bg-[#F67E31]"
    },
    {
      number: "03",
      icon: <LinkIcon size={26} />,
      title: "Invite Audience",
      desc: "Copy your unique invite link and share it anywhere. Attendees join directly from browser.",
      color: "text-[#04B84C] bg-[#04B84C]/10 border-[#04B84C]/20",
      accent: "bg-[#04B84C]"
    },
    {
      number: "04",
      icon: <Monitor size={26} />,
      title: "Present and Engage",
      desc: "Share your screen, chat with students in real time, and record key insights smoothly.",
      color: "text-[#0DA9CF] bg-[#0DA9CF]/10 border-[#0DA9CF]/20",
      accent: "bg-[#0DA9CF]"
    }
  ];

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
              Simple 4-Step Process
            </span>
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.08] text-slate-900">
              How <span className="text-[#0DA9CF]">WabiSeminar</span> Works
            </motion.h1>
            <motion.p variants={fadeIn} className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal mb-8">
              From creating your account to conducting full HD interactive masterclasses, everything is designed to be frictionless.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Step by Step Grid */}
        <section className="mb-20 sm:mb-32">
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
                className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-slate-200 group-hover:text-slate-400 transition-colors font-mono">
                      {step.number}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${step.color}`}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">{step.desc}</p>
                </div>
                <div className={`h-1.5 w-12 rounded-full ${step.accent}`}></div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 3. Deep Dive Architecture */}
        <section className="mb-20 sm:mb-32">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 md:p-16">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                Cutting-Edge WebRTC Infrastructure
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                We combine peer-to-peer WebRTC media streaming with WebSocket signaling to ensure minimal latency and top tier security.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#0DA9CF]/10 text-[#0DA9CF] flex items-center justify-center mx-auto mb-4">
                  <Zap size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Direct P2P Routing</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Video feeds stream directly between peers for maximum clarity.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F67E31]/10 text-[#F67E31] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Socket.IO Signaling</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Instant handshake and state synchronization with zero delay.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#04B84C]/10 text-[#04B84C] flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">DTLS-SRTP Security</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Every packet is cryptographically encrypted at the transport level.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Bottom CTA */}
        <section className="text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-16 shadow-md max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Ready to experience effortless seminars?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
              No credit card required. Launch your free room in seconds.
            </p>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="bg-[#0DA9CF] hover:bg-[#0C8DB0] text-white px-9 py-4 rounded-full font-bold text-base shadow-lg shadow-[#0DA9CF]/25 hover:shadow-xl hover:shadow-[#0DA9CF]/35 inline-flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
