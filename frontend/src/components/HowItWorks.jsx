import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, UserPlus, Link as LinkIcon, Monitor, PlayCircle, 
  ChevronRight, Sparkles, HelpCircle, ArrowRight, Zap,
  MessageSquare, Shield, Layers
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
      staggerChildren: 0.2
    }
  }
};
export default function HowItWorks({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      number: "01",
      icon: <UserPlus size={28} />,
      title: "Create Account",
      desc: "Sign up in seconds. No complex configurations or heavy downloads required.",
      colorClass: "border-indigo-500/50 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]",
      cardHoverClass: "group-hover:border-indigo-500/30",
      textGradientClass: "group-hover:to-indigo-400",
      lineColor: "bg-indigo-500"
    },
    {
      number: "02",
      icon: <Video size={28} />,
      title: "Start Instant Room",
      desc: "Click to generate a secure, encrypted meeting room instantly from your dashboard.",
      colorClass: "border-purple-500/50 text-purple-400 group-hover:bg-purple-500/20 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]",
      cardHoverClass: "group-hover:border-purple-500/30",
      textGradientClass: "group-hover:to-purple-400",
      lineColor: "bg-purple-500"
    },
    {
      number: "03",
      icon: <LinkIcon size={28} />,
      title: "Invite Participants",
      desc: "Share your unique meeting link. Guests can join directly from their browser.",
      colorClass: "border-blue-500/50 text-blue-400 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]",
      cardHoverClass: "group-hover:border-blue-500/30",
      textGradientClass: "group-hover:to-blue-400",
      lineColor: "bg-blue-500"
    },
    {
      number: "04",
      icon: <Monitor size={28} />,
      title: "Collaborate Live",
      desc: "Chat, share screens, and present in crystal clear 1080p HD video quality.",
      colorClass: "border-emerald-500/50 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]",
      cardHoverClass: "group-hover:border-emerald-500/30",
      textGradientClass: "group-hover:to-emerald-400",
      lineColor: "bg-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050816] light:bg-[#FAFAFA] text-white light:text-slate-900 font-sans overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="fixed bg-blue-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-20%] right-[-10%] pointer-events-none"></div>
      <div className="fixed bg-indigo-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-10%] left-[-10%] pointer-events-none"></div>

      {/* Navbar handled globally in App.jsx */}

      <main className="pt-32 lg:pt-40 pb-20 relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-16">
        
        {/* 1. Hero Section */}
        <section className="text-center mb-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] text-white light:text-slate-900">
              How <span className="text-indigo-500">WabiSeminar</span> Works
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-[#94A3B8] light:text-slate-600 leading-relaxed max-w-2xl font-light mb-10">
              Get from sign-up to your first masterclass in less than a minute. Our friction-free workflow is designed for immediate collaboration.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. 4-Step Process Section */}
        <section className="mb-40 relative">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="relative"
          >
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-24 left-10 right-10 h-1 bg-white/5 light:bg-slate-100 rounded-full overflow-hidden z-0">
               <motion.div 
                 animate={{ x: ["-100%", "400%"] }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                 className="h-full w-1/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
               />
            </div>

            {/* Connecting Line (Mobile) */}
            <div className="lg:hidden absolute top-10 bottom-10 left-8 w-1 bg-white/5 light:bg-slate-100 rounded-full overflow-hidden z-0">
               <motion.div 
                 animate={{ y: ["-100%", "400%"] }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                 className="w-full h-1/4 bg-gradient-to-b from-transparent via-indigo-500 to-transparent"
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-6 relative z-10">
              {steps.map((step, i) => (
                <motion.div key={i} variants={fadeIn} whileHover={{ scale: 1.05, y: -10 }} className="relative flex flex-col items-start lg:items-center text-left lg:text-center group pl-20 lg:pl-0 transition-transform duration-300 cursor-default">
                  {/* Step Number Badge */}
                  <div className="absolute left-2 lg:left-1/2 lg:-translate-x-1/2 top-4 lg:-top-6 text-[80px] lg:text-[100px] font-black text-white light:text-slate-900/[0.08] light:text-slate-200 light:text-slate-700 pointer-events-none group-hover:text-white light:text-slate-900/[0.15] light:group-hover:text-slate-300 light:text-slate-600 transition-colors duration-500 z-0">
                    {step.number}
                  </div>

                  {/* Icon Node */}
                  <div className={`w-16 h-16 rounded-full bg-[#0A0F24] light:bg-white border-2 flex items-center justify-center transition-all duration-300 relative z-10 mb-6 lg:mt-16 ${step.colorClass} light:shadow-sm`}>
                    {step.icon}
                  </div>

                  {/* Animated Arrow (Desktop only, between cards) */}
                  {i < steps.length - 1 && (
                    <motion.div 
                      animate={{ x: [0, 10, 0] }} 
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="hidden lg:block absolute top-[5.5rem] right-[-24px] text-white/20 group-hover:text-indigo-400 z-20"
                    >
                      <ChevronRight size={32} />
                    </motion.div>
                  )}

                  {/* Content Card */}
                  <div className={`bg-[#0A0F24]/60 light:bg-white backdrop-blur-md border border-white/5 p-6 rounded-full transition-colors w-full z-10 shadow-lg group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${step.cardHoverClass}`}>
                    <h3 className={`text-xl font-bold mb-3 text-white light:text-slate-900 group-hover:text-indigo-500 transition-all ${step.textGradientClass}`}>{step.title}</h3>
                    <p className="text-[#94A3B8] light:text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 3. Interactive Workflow Visualization */}
        <section className="mb-40">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-extrabold mb-6 text-white light:text-slate-900">Frictionless Workflow</motion.h2>
            <motion.p variants={fadeIn} className="text-[#94A3B8] light:text-slate-600 text-lg max-w-2xl mx-auto">Visualize how your data moves securely in real-time, empowering instant collaboration across the globe.</motion.p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[600px] w-full max-w-5xl mx-auto bg-[#0A0F24]/60 light:bg-white backdrop-blur-xl light:backdrop-blur-none rounded-[3rem] border border-white/10 light:border-slate-200 shadow-[0_30px_60px_-15px_rgba(99,102,241,0.2)] light:shadow-xl overflow-hidden flex flex-col items-center justify-center"
          >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 w-full h-full p-8 relative z-10 gap-8">
                {/* Host Column */}
                <div className="flex flex-col items-center justify-center space-y-6 relative">
                   <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="bg-[#160B2A]/90 light:bg-slate-50 backdrop-blur-md light:backdrop-blur-none border border-indigo-500/30 light:border-indigo-200 p-5 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.2)] light:shadow-md w-full max-w-[240px]">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 light:bg-indigo-100 flex items-center justify-center text-indigo-400 light:text-indigo-600"><Monitor size={20}/></div>
                        <span className="font-bold text-white light:text-slate-900">Host Client</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-800 light:bg-slate-200 rounded-full overflow-hidden">
                           <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-full w-1/2 bg-indigo-500"></motion.div>
                        </div>
                        <div className="text-xs text-indigo-300 light:text-indigo-600 font-mono">1080p Video Stream</div>
                      </div>
                   </motion.div>
                </div>

                {/* Center Core */}
                <div className="flex flex-col items-center justify-center relative">
                   {/* Connections */}
                   <div className="absolute hidden md:block w-full h-0.5 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-emerald-500/50 top-1/2 -translate-y-1/2 -z-10"></div>
                   
                   <motion.div 
                     whileHover={{ scale: 1.05 }}
                     className="relative z-20 w-48 h-48 rounded-full bg-[#050816] light:bg-white flex flex-col items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.4)] light:shadow-xl border border-purple-500/50 light:border-purple-200 group"
                   >
                      <Layers size={48} className="text-purple-400 light:text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-white light:text-slate-900 text-lg">WabiCore</span>
                      <span className="text-xs text-purple-400 light:text-purple-600 mt-1 flex items-center gap-1"><Shield size={12}/> E2E Encrypted</span>
                      
                      {/* Expanding pulses */}
                      <motion.div animate={{ scale: [1, 1.3, 1.6], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 border border-purple-400 light:border-purple-300 rounded-full pointer-events-none"></motion.div>
                   </motion.div>
                </div>

                {/* Participants Column */}
                <div className="flex flex-col items-center justify-center space-y-6 relative">
                   <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="bg-[#160B2A]/90 light:bg-slate-50 backdrop-blur-md light:backdrop-blur-none border border-emerald-500/30 light:border-emerald-200 p-5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)] light:shadow-md w-full max-w-[240px]">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 light:bg-emerald-100 flex items-center justify-center text-emerald-400 light:text-emerald-600"><UserPlus size={20}/></div>
                        <span className="font-bold text-white light:text-slate-900">Participants</span>
                      </div>
                      <div className="flex -space-x-3 mb-3">
                         {[1,2,3,4].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full bg-[#0A0F24] light:bg-white border-2 border-[#160B2A] light:border-white flex items-center justify-center text-xs text-white light:text-slate-900">P{i}</div>
                         ))}
                         <div className="w-8 h-8 rounded-full bg-emerald-500/20 light:bg-emerald-100 border-2 border-[#160B2A] light:border-white flex items-center justify-center text-xs text-emerald-400 light:text-emerald-600 font-bold">+9</div>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800 light:bg-slate-200 rounded-full overflow-hidden">
                         <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 2 }} className="h-full w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></motion.div>
                      </div>
                   </motion.div>
                </div>
             </div>
          </motion.div>
        </section>

        {/* 4. Demo Preview Section */}
        <section className="mb-40">
          <div className="bg-gradient-to-br from-[#160B2A] light:from-slate-100 to-[#0A0F24] light:to-white light:from-[#FAFAFA] light:to-white border border-purple-500/20 light:border-slate-200 rounded-[3rem] p-10 md:p-16 overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(99,102,241,0.2)] light:shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-white light:text-slate-900">See it in action.</h2>
                <p className="text-[#94A3B8] light:text-slate-600 text-lg mb-8 leading-relaxed">
                  Experience the frictionless workflow firsthand. Our platform is designed to get out of your way so you can focus entirely on delivering an incredible masterclass.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center space-x-3 text-white light:text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 light:bg-yellow-100 flex items-center justify-center"><Zap size={16} className="text-yellow-400 light:text-yellow-600"/></div>
                    <span className="font-medium">One-click room generation</span>
                  </li>
                  <li className="flex items-center space-x-3 text-white light:text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 light:bg-indigo-100 flex items-center justify-center"><LinkIcon size={16} className="text-indigo-400 light:text-indigo-600"/></div>
                    <span className="font-medium">Shareable URL links</span>
                  </li>
                  <li className="flex items-center space-x-3 text-white light:text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 light:bg-emerald-100 flex items-center justify-center"><Video size={16} className="text-emerald-400 light:text-emerald-600"/></div>
                    <span className="font-medium">Instant camera and mic detection</span>
                  </li>
                </ul>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('dashboard')}
                  className="bg-white text-indigo-900 px-8 py-3.5 rounded-full font-bold flex items-center space-x-3 shadow-lg group hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                >
                  <PlayCircle size={20} className="text-indigo-600 group-hover:scale-110 transition-transform"/>
                  <span>Try it yourself</span>
                </motion.button>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
                {/* Abstract UI representation */}
                <div className="aspect-square max-w-md mx-auto relative group">
                  <div className="absolute inset-0 bg-indigo-500/20 light:bg-indigo-100 rounded-full blur-[80px] group-hover:bg-indigo-500/30 light:group-hover:bg-indigo-200 transition-colors duration-500"></div>
                  
                  {/* Center Hub */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#0A0F24] light:bg-white border border-indigo-500/50 light:border-indigo-200 rounded-[2rem] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] light:shadow-xl z-20 group-hover:scale-110 transition-transform duration-500">
                    <Video size={32} className="text-indigo-400 light:text-indigo-600 mb-2" />
                    <span className="text-xs font-bold text-white light:text-slate-900">Room Active</span>
                  </div>

                  {/* Orbiting Elements */}
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute inset-4 rounded-full border border-white/5 light:border-slate-200 z-10">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#160B2A] light:bg-white border border-emerald-500/30 light:border-emerald-200 rounded-full flex items-center justify-center shadow-lg" style={{ transform: "rotate(-0deg)" }}>
                       <Monitor size={18} className="text-emerald-400 light:text-emerald-600"/>
                    </div>
                  </motion.div>

                  <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="absolute inset-16 rounded-full border border-white/10 light:border-slate-200 z-10">
                     <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-12 h-12 bg-[#160B2A] light:bg-white border border-purple-500/30 light:border-purple-200 rounded-full flex items-center justify-center shadow-lg" style={{ transform: "rotate(0deg)" }}>
                       <MessageSquare size={18} className="text-purple-400 light:text-purple-600"/>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5. FAQ Preview CTA */}
        <section className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0A0F24]/80 light:bg-white backdrop-blur-xl light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-[3rem] p-12 md:p-16 text-center shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] light:shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 light:from-indigo-100 to-transparent pointer-events-none group-hover:from-indigo-500/10 light:group-hover:from-indigo-200 transition-colors duration-500"></div>
            <HelpCircle size={48} className="text-indigo-400 light:text-indigo-600 mx-auto mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white light:text-slate-900">Still have questions?</h2>
            <p className="text-[#94A3B8] light:text-slate-600 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Check out our detailed documentation or reach out to our support team. We're here to help you host the perfect masterclass.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('dashboard')} 
                className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 px-8 py-4 rounded-full font-bold text-white light:text-slate-900 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.6)] flex items-center justify-center space-x-2 transition-colors hover:shadow-[0_15px_25px_-10px_rgba(99,102,241,0.8)] group"
              >
                <span>Start Now</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('faq')}
                className="w-full sm:w-auto bg-white/5 light:bg-slate-50 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-100 border border-white/10 light:border-slate-200 px-8 py-4 rounded-full font-bold text-white light:text-slate-900 transition-colors hover:border-white/20 light:hover:border-slate-300"
              >
                View Documentation
              </motion.button>
            </div>
          </motion.div>
        </section>

      </main>
    </div>
  );
}
