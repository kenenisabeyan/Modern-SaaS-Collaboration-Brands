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
    icon: <Video size={20} className="text-[#0DA9CF]" />,
    questions: [
      { q: "How do I create an instant meeting room?", a: "Simply log into your dashboard and click 'Create Instant Room'. A unique, secure link will be generated instantly that you can share with your participants." },
      { q: "Is there a limit on how many people can join?", a: "Our free plan supports up to 10 participants. For larger masterclasses, our Pro and Enterprise plans support 100 to 1,000+ simultaneous participants." },
      { q: "Can participants join without an account?", a: "Yes! Your guests simply click the link you share and they can join the session directly from their browser without downloading any software or creating an account." }
    ]
  },
  {
    category: "Security",
    icon: <Shield size={20} className="text-[#04B84C]" />,
    questions: [
      { q: "Is my meeting data encrypted?", a: "Yes, all audio, video, and text chat streams are protected by industry-standard AES-256 end-to-end encryption." },
      { q: "How can I prevent uninvited guests?", a: "Hosts have access to a robust waiting room feature. You can screen participants before admitting them or lock the room once everyone has arrived." },
      { q: "Are meeting recordings secure?", a: "Cloud recordings are stored in encrypted vaults. Only the host can access, download, or share the recording links." }
    ]
  },
  {
    category: "Pricing",
    icon: <DollarSign size={20} className="text-[#F67E31]" />,
    questions: [
      { q: "Is the platform really free?", a: "Yes! Our core platform is 100% free forever for up to 10 participants. You only pay if you need advanced features or larger room capacities." },
      { q: "Can I cancel my paid subscription at any time?", a: "Absolutely. We don't believe in lock-in contracts. You can downgrade or cancel your subscription directly from your billing dashboard." },
      { q: "Do you offer annual discounts?", a: "Yes, you save 20% on all premium plans when you choose annual billing instead of monthly." }
    ]
  },
  {
    category: "Collaboration",
    icon: <Users size={20} className="text-[#0DA9CF]" />,
    questions: [
      { q: "Can I share my screen?", a: "Yes, you can share your entire desktop, specific application windows, or single browser tabs with zero latency." },
      { q: "Is there a whiteboard feature?", a: "We are actively developing a collaborative whiteboard feature that will be rolled out to all users in the next major update." },
      { q: "Can I share files in the chat?", a: "Currently, you can share links to files in the real-time chat. Direct file uploading is available on Pro and Enterprise tiers." }
    ]
  },
  {
    category: "Technical Support",
    icon: <Wrench size={20} className="text-[#F67E31]" />,
    questions: [
      { q: "What browsers are supported?", a: "WabiSeminar works flawlessly on all modern browsers including Chrome, Edge, Safari, and Firefox. No plugins required." },
      { q: "Why is my camera not working?", a: "Ensure that your browser has permission to access your camera and microphone. You can reset these permissions by clicking the lock icon next to the URL bar." },
      { q: "How do I report a bug?", a: "You can reach out directly to our technical team via the Contact Support button below, and we'll investigate the issue immediately." }
    ]
  }
];

const AccordionItem = ({ q, a, isOpen, onClick }) => {
  return (
    <div className="border border-slate-200 rounded-2xl sm:rounded-3xl mb-3 sm:mb-4 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:border-[#0DA9CF]/40">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none group cursor-pointer"
      >
        <h4 className="text-base sm:text-lg font-bold text-slate-900 pr-4 group-hover:text-[#0DA9CF] transition-colors leading-snug">{q}</h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[#0DA9CF]/15 text-[#0DA9CF] border border-[#0DA9CF]/30' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
        >
          <ChevronDown size={18} />
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
            <div className="p-5 sm:p-6 pt-0 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredData = faqData.map(category => {
    const filteredQuestions = category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, questions: filteredQuestions };
  }).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-hidden relative">
      <main className="pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 relative z-10 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Hero Section */}
        <section className="text-center mb-10 sm:mb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0DA9CF]/10 text-[#0DA9CF] border border-[#0DA9CF]/20 mb-4">
              Help Center & FAQ
            </span>
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.08] text-slate-900">
              How can we <span className="text-[#0DA9CF]">help you?</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal mb-8">
              Browse our most frequently asked questions or search for a specific topic to get answers immediately.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Search Bar */}
        <section className="mb-14 sm:mb-20">
          <div className="relative max-w-2xl mx-auto">
             <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-2 shadow-sm focus-within:border-[#0DA9CF] focus-within:bg-white transition-all">
                <div className="pl-4 pr-2 text-slate-400">
                   <Search size={20} />
                </div>
                <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search questions (e.g. encryption, limits, pricing)..." 
                   className="w-full bg-transparent border-none text-slate-900 text-sm sm:text-base focus:outline-none placeholder-slate-400 py-1.5"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="mr-2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-2.5 py-1 rounded-full bg-slate-200"
                  >
                    Clear
                  </button>
                )}
             </div>
          </div>
        </section>

        {/* 3. FAQ Content by Category */}
        <section className="space-y-12 sm:space-y-16 mb-20 sm:mb-32">
          {filteredData.length > 0 ? (
            filteredData.map((category, catIndex) => (
              <div key={catIndex}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {category.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{category.category}</h3>
                </div>

                <div className="space-y-3">
                  {category.questions.map((item, qIndex) => (
                    <AccordionItem 
                      key={qIndex}
                      q={item.q}
                      a={item.a}
                      isOpen={Boolean(openItems[`${catIndex}-${qIndex}`])}
                      onClick={() => toggleItem(catIndex, qIndex)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-3xl">
              <p className="text-slate-600 text-lg mb-4">No results found for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="text-sm font-bold text-[#0DA9CF] hover:underline"
              >
                Clear search and view all questions
              </button>
            </div>
          )}
        </section>

        {/* 4. Support Contact CTA */}
        <section className="text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-14 shadow-md max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Still have questions?</h3>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mb-6">
              Can't find the answer you're looking for? Our friendly engineering team is here to help.
            </p>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="bg-[#0DA9CF] hover:bg-[#0C8DB0] text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-md shadow-[#0DA9CF]/25 inline-flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>Back to Home</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
