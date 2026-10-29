import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Shield, DollarSign, Users, Wrench, Search, 
  ChevronDown, MessageCircle, Mail, HelpCircle, ArrowRight
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

const faqData = [
  {
    category: "Meetings",
    icon: <Video size={20} className="text-indigo-400" />,
    colorClass: "indigo",
    questions: [
      { q: "How do I create an instant meeting room?", a: "Simply log into your dashboard and click 'Create Instant Room'. A unique, secure link will be generated instantly that you can share with your participants." },
      { q: "Is there a limit on how many people can join?", a: "Our free plan supports up to 10 participants. For larger masterclasses, our Pro and Enterprise plans support 100 to 1,000+ simultaneous participants." },
      { q: "Can participants join without an account?", a: "Yes! Your guests simply click the link you share and they can join the session directly from their browser without downloading any software or creating an account." }
    ]
  },
  {
    category: "Security",
    icon: <Shield size={20} className="text-emerald-400" />,
    colorClass: "emerald",
    questions: [
      { q: "Is my meeting data encrypted?", a: "Yes, all audio, video, and text chat streams are protected by industry-standard AES-256 end-to-end encryption." },
      { q: "How can I prevent uninvited guests?", a: "Hosts have access to a robust waiting room feature. You can screen participants before admitting them or lock the room once everyone has arrived." },
      { q: "Are meeting recordings secure?", a: "Cloud recordings are stored in encrypted vaults. Only the host can access, download, or share the recording links." }
    ]
  },
  {
    category: "Pricing",
    icon: <DollarSign size={20} className="text-purple-400" />,
    colorClass: "purple",
    questions: [
      { q: "Is the platform really free?", a: "Yes! Our core platform is 100% free forever for up to 10 participants. You only pay if you need advanced features or larger room capacities." },
      { q: "Can I cancel my paid subscription at any time?", a: "Absolutely. We don't believe in lock-in contracts. You can downgrade or cancel your subscription directly from your billing dashboard." },
      { q: "Do you offer annual discounts?", a: "Yes, you save 20% on all premium plans when you choose annual billing instead of monthly." }
    ]
  },
  {
    category: "Collaboration",
    icon: <Users size={20} className="text-pink-400" />,
    colorClass: "pink",
    questions: [
      { q: "Can I share my screen?", a: "Yes, you can share your entire desktop, specific application windows, or single browser tabs with zero latency." },
      { q: "Is there a whiteboard feature?", a: "We are actively developing a collaborative whiteboard feature that will be rolled out to all users in the next major update." },
      { q: "Can I share files in the chat?", a: "Currently, you can share links to files in the real-time chat. Direct file uploading is available on Pro and Enterprise tiers." }
    ]
  },
  {
    category: "Technical Support",
    icon: <Wrench size={20} className="text-blue-400" />,
    colorClass: "blue",
    questions: [
      { q: "What browsers are supported?", a: "WabiSeminar works flawlessly on all modern browsers including Chrome, Edge, Safari, and Firefox. No plugins required." },
      { q: "Why is my camera not working?", a: "Ensure that your browser has permission to access your camera and microphone. You can reset these permissions by clicking the lock icon next to the URL bar." },
      { q: "How do I report a bug?", a: "You can reach out directly to our technical team via the Contact Support button below, and we'll investigate the issue immediately." }
    ]
  }
];

const AccordionItem = ({ q, a, isOpen, onClick }) => {
  return (
    <div className="border border-white/5 light:border-slate-200 rounded-2xl sm:rounded-3xl mb-3 sm:mb-4 bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none overflow-hidden transition-all duration-300 hover:border-indigo-500/30 light:hover:border-indigo-300 hover:bg-[#0A0F24]/80 light:bg-white/90 light:hover:bg-slate-50 hover:shadow-[0_10px_30px_-15px_rgba(99,102,241,0.2)] light:shadow-sm">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none group"
      >
        <h4 className="text-base sm:text-lg font-semibold text-white light:text-slate-900 pr-4 sm:pr-8 group-hover:text-indigo-300 light:group-hover:text-indigo-600 transition-colors leading-snug">{q}</h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-indigo-500/20 light:bg-indigo-100 text-indigo-400 light:text-indigo-600 border border-indigo-500/30 light:border-indigo-200' : 'bg-white/5 light:bg-slate-100 text-[#94A3B8] light:text-slate-500 border border-white/5 light:border-slate-200'}`}
        >
          <ChevronDown size={16} className="sm:w-[18px] sm:h-[18px]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 sm:p-6 pt-0 text-sm sm:text-base text-[#94A3B8] light:text-slate-600 leading-relaxed border-t border-white/5 light:border-slate-100 mt-2">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter logic
  const filteredData = faqData.map(category => {
    const filteredQuestions = category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, questions: filteredQuestions };
  }).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-[#050816] light:bg-[#FAFAFA] text-white light:text-slate-900 font-sans overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="fixed bg-blue-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-10%] right-[-10%] pointer-events-none"></div>
      <div className="fixed bg-purple-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-20%] left-[-10%] pointer-events-none"></div>

      {/* Navbar handled globally in App.jsx */}

      <main className="pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 relative z-10 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Hero Section */}
        <section className="text-center mb-10 sm:mb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >

            <motion.h1 variants={fadeIn} className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.1] text-white light:text-slate-900 break-words">
              How can we <span className="text-indigo-500">help you?</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-base sm:text-lg md:text-xl text-[#94A3B8] light:text-slate-600 leading-relaxed max-w-2xl font-light mb-8 sm:mb-12">
              Browse our most frequently asked questions or search for a specific topic to get the answers you need immediately.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Search Bar */}
        <section className="mb-14 sm:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl mx-auto group"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl group-hover:opacity-100 transition-opacity opacity-50 z-0"></div>
             <div className="relative z-10 flex items-center bg-[#0A0F24]/80 light:bg-white backdrop-blur-xl border border-white/10 light:border-slate-200 rounded-full p-1.5 sm:p-2 shadow-2xl light:shadow-md focus-within:border-indigo-500/50 light:focus-within:border-indigo-300 transition-colors">
                <div className="pl-3 sm:pl-4 pr-2 text-[#94A3B8] light:text-slate-400">
                   <Search size={20} className="sm:w-6 sm:h-6" />
                </div>
                <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search for answers..." 
                   className="w-full bg-transparent border-none outline-none text-white light:text-slate-900 text-base sm:text-lg py-2 sm:py-3 placeholder:text-slate-600 light:placeholder:text-slate-400"
                />
                {searchQuery && (
                   <button 
                     onClick={() => setSearchQuery('')}
                     className="pr-3 sm:pr-4 text-xs sm:text-sm text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 transition-colors font-semibold"
                   >
                      Clear
                   </button>
                )}
             </div>
          </motion.div>
        </section>

        {/* 3. Accordion Categories */}
        <section className="mb-20 sm:mb-32">
           {filteredData.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="text-center py-14 sm:py-20 bg-[#0A0F24]/40 light:bg-white rounded-2xl sm:rounded-[2rem] border border-white/5 light:border-slate-200 light:shadow-md px-4"
              >
                 <Search size={40} className="mx-auto text-slate-600 light:text-slate-400 mb-4 sm:mb-6 sm:w-12 sm:h-12" />
                 <h3 className="text-xl sm:text-2xl font-bold text-white light:text-slate-900 mb-2">No results found</h3>
                 <p className="text-sm sm:text-base text-[#94A3B8] light:text-slate-500">We couldn't find any questions matching "{searchQuery}".</p>
              </motion.div>
           ) : (
              <div className="space-y-10 sm:space-y-16">
                 {filteredData.map((category, catIdx) => (
                    <motion.div 
                      key={category.category}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                    >
                       <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 pl-1 sm:pl-2">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-${category.colorClass}-500/10 light:bg-${category.colorClass}-100 flex items-center justify-center border border-${category.colorClass}-500/20 light:border-${category.colorClass}-200 shadow-[0_0_15px_rgba(var(--${category.colorClass}-rgb),0.1)] light:shadow-none shrink-0`}>
                             {category.icon}
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900">{category.category}</h2>
                       </div>
                       
                       <div className="space-y-3 sm:space-y-4">
                          {category.questions.map((item, qIdx) => (
                              <AccordionItem 
                                key={qIdx} 
                                q={item.q} 
                                a={item.a} 
                                isOpen={!!openItems[`${catIdx}-${qIdx}`]}
                                onClick={() => toggleItem(catIdx, qIdx)}
                              />
                          ))}
                       </div>
                    </motion.div>
                 ))}
              </div>
           )}
        </section>

         {/* 4. Contact Support CTA */}
        <section className="mb-16 sm:mb-20">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="bg-gradient-to-br from-[#160B2A] light:from-slate-100 to-[#0A0F24] light:to-white border border-purple-500/20 light:border-slate-200 rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 md:p-16 text-center shadow-[0_30px_60px_-15px_rgba(168,85,247,0.2)] light:shadow-xl relative overflow-hidden group"
           >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 group-hover:opacity-10 transition-opacity"></div>
              
              <div className="relative z-10">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500/20 light:bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-indigo-500/30 light:border-indigo-200 shadow-[0_0_30px_rgba(99,102,241,0.3)] light:shadow-md">
                    <MessageCircle size={30} className="text-indigo-400 light:text-indigo-600 sm:w-9 sm:h-9" />
                 </div>
                 <h2 className="text-2xl sm:text-4xl font-extrabold text-white light:text-slate-900 mb-4 sm:mb-6">Still need help?</h2>
                 <p className="text-[#94A3B8] light:text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                    Our technical support team is available 24/7. Drop us a message and we'll get back to you within a few hours.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = 'mailto:support@wabiseminar.com'}
                      className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white light:text-slate-900 font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-full shadow-[0_10px_20px_-10px_rgba(99,102,241,0.6)] flex items-center justify-center space-x-2.5 sm:space-x-3 transition-colors hover:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.8)] text-sm sm:text-base"
                    >
                       <Mail size={18} className="sm:w-5 sm:h-5" />
                       <span>Contact Support</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigate('dashboard')}
                      className="w-full sm:w-auto bg-white/5 light:bg-slate-50 hover:bg-white/10 light:hover:bg-slate-200 text-white light:text-slate-900 font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-full border border-white/10 light:border-slate-200 flex items-center justify-center space-x-2.5 sm:space-x-3 transition-colors hover:border-white/20 light:hover:border-slate-300 group text-sm sm:text-base"
                    >
                       <span>Return to Dashboard</span>
                       <ArrowRight size={18} className="text-[#94A3B8] light:text-slate-500 group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5" />
                    </motion.button>
                 </div>
              </div>
           </motion.div>
        </section>

      </main>
    </div>
  );
}
