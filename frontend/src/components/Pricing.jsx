import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, ArrowRight, ChevronDown, Loader2, Sparkles, Shield, 
  Zap, Video, DollarSign, Users, Wrench, Search, MessageSquare, Mail
} from 'lucide-react';
import api from '../services/api.js';

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
    category: "Pricing & Billing",
    icon: <DollarSign size={20} className="text-[#FF5A36]" />,
    questions: [
      { q: "Is the platform really free?", a: "Yes! Our core platform is 100% free forever for up to 10 participants. You only pay if you need advanced features or larger room capacities." },
      { q: "Can I cancel my paid subscription at any time?", a: "Absolutely. We don't believe in lock-in contracts. You can downgrade or cancel your subscription directly from your billing dashboard." },
      { q: "Do you offer annual discounts?", a: "Yes, you save 20% on all premium plans when you choose annual billing instead of monthly." }
    ]
  },
  {
    category: "Meetings & Limits",
    icon: <Video size={20} className="text-[#1E2761]" />,
    questions: [
      { q: "How do I create an instant meeting room?", a: "Simply log into your dashboard and click 'Create Instant Room'. A unique, secure link will be generated instantly that you can share with your participants." },
      { q: "Is there a limit on how many people can join?", a: "Our free plan supports up to 10 participants. For larger masterclasses, our Pro and Enterprise plans support 100 to 1,000+ simultaneous participants." },
      { q: "Can participants join without an account?", a: "Yes! Your guests simply click the link you share and they can join the session directly from their browser without downloading any software or creating an account." }
    ]
  },
  {
    category: "Security & Privacy",
    icon: <Shield size={20} className="text-[#FF5A36]" />,
    questions: [
      { q: "Is my meeting data encrypted?", a: "Yes, all audio, video, and text chat streams are protected by industry-standard AES-256 end-to-end encryption." },
      { q: "How can I prevent uninvited guests?", a: "Hosts have access to a robust waiting room feature. You can screen participants before admitting them or lock the room once everyone has arrived." },
      { q: "Are meeting recordings secure?", a: "Cloud recordings are stored in encrypted vaults. Only the host can access, download, or share the recording links." }
    ]
  },
  {
    category: "Collaboration Tools",
    icon: <Users size={20} className="text-[#1E2761]" />,
    questions: [
      { q: "Can I share my screen?", a: "Yes, you can share your entire desktop, specific application windows, or single browser tabs with zero latency." },
      { q: "Is there a whiteboard feature?", a: "We are actively developing a collaborative whiteboard feature that will be rolled out to all users in the next major update." },
      { q: "Can I share files in the chat?", a: "Currently, you can share links to files in the real-time chat. Direct file uploading is available on Pro and Enterprise tiers." }
    ]
  },
  {
    category: "Technical Support",
    icon: <Wrench size={20} className="text-[#FF5A36]" />,
    questions: [
      { q: "What browsers are supported?", a: "WabiSeminar works flawlessly on all modern browsers including Chrome, Edge, Safari, and Firefox. No plugins required." },
      { q: "Why is my camera not working?", a: "Ensure that your browser has permission to access your camera and microphone. You can reset these permissions by clicking the lock icon next to the URL bar." },
      { q: "How do I contact support or report an issue?", a: "Reach out directly to our solutions and support team via the Contact section below, and we'll assist you promptly." }
    ]
  }
];

export default function Pricing({ onNavigate, initialSection }) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [isLoading, setIsLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);
  
  // FAQ state
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqItems, setOpenFaqItems] = useState({ '0-0': true });

  useEffect(() => {
    if (initialSection) {
      setTimeout(() => {
        const el = document.getElementById(initialSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }

    const fetchPlan = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await api.getMe(token);
        if (res.success && res.data) {
          setCurrentPlan(res.data.plan || 'Free');
        }
      }
    };
    fetchPlan();
  }, [initialSection]);

  const toggleFaqItem = (catIdx, qIdx) => {
    const key = `${catIdx}-${qIdx}`;
    setOpenFaqItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectPlan = async (planName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      onNavigate('auth');
      return;
    }

    if (planName === currentPlan) return;

    setActionPlan(planName);
    setIsLoading(true);
    try {
      const res = await api.upgradePlan(token, planName);
      if (res.success) {
        setCurrentPlan(res.data.plan);
        alert(`Successfully switched to ${planName} plan!`);
      } else {
        alert(res.message || 'Failed to update plan.');
      }
    } catch (error) {
      alert('An error occurred while updating the plan.');
    } finally {
      setIsLoading(false);
      setActionPlan('');
    }
  };

  const plans = [
    {
      name: "Free",
      desc: "Perfect for getting started with masterclasses.",
      monthlyPrice: "0",
      annualPrice: "0",
      features: [
        { name: "Up to 10 participants", included: true },
        { name: "40 minute time limit", included: true },
        { name: "720p Video Quality", included: true },
        { name: "Screen Sharing", included: true },
        { name: "Custom Branding", included: false },
        { name: "Cloud Recording", included: false },
      ],
      cta: "Current Plan",
      recommended: false
    },
    {
      name: "Pro",
      desc: "Ideal for professional educators and teams.",
      monthlyPrice: "29",
      annualPrice: "24",
      features: [
        { name: "Up to 100 participants", included: true },
        { name: "Unlimited meeting time", included: true },
        { name: "1080p Ultra HD Video", included: true },
        { name: "Screen Sharing", included: true },
        { name: "Custom Branding", included: true },
        { name: "10GB Cloud Recording", included: true },
      ],
      cta: "Start Pro Trial",
      recommended: true
    },
    {
      name: "Enterprise",
      desc: "Advanced security and control for large organizations.",
      monthlyPrice: "99",
      annualPrice: "89",
      features: [
        { name: "Up to 1000 participants", included: true },
        { name: "Unlimited meeting time", included: true },
        { name: "4K Video Support", included: true },
        { name: "Screen Sharing", included: true },
        { name: "Advanced Custom Branding", included: true },
        { name: "Unlimited Cloud Recording", included: true },
      ],
      cta: "Contact Sales",
      recommended: false
    }
  ];

  const filteredCategories = faqData.map((cat, catIdx) => {
    const isCategoryMatch = activeCategory === 'All' || cat.category.toLowerCase().includes(activeCategory.toLowerCase());
    if (!isCategoryMatch && activeCategory !== 'All') return null;

    const filteredQ = cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredQ.length === 0 && searchQuery) return null;

    return {
      ...cat,
      originalCatIdx: catIdx,
      questions: searchQuery ? filteredQ : cat.questions
    };
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-[#1E2761] font-sans overflow-hidden relative">
      <main className="pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 relative z-10 w-full">
        
        {/* 1. Hero Section & Toggle */}
        <section className="text-center mb-16 sm:mb-20 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.08] text-[#1E2761]">
              Invest in your <span className="text-[#FF5A36]">masterclasses</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal mb-8 sm:mb-10">
              Start for free, then upgrade as your audience grows. No hidden fees. Cancel anytime.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div variants={fadeIn} className="flex items-center space-x-3 bg-[#F5F7FA] p-2 rounded-full border border-[#E4E8EE] shadow-sm">
               <span className={`text-xs sm:text-sm font-bold pl-3 transition-colors ${!isAnnual ? 'text-[#1E2761]' : 'text-slate-500'}`}>Monthly</span>
               <button 
                 onClick={() => setIsAnnual(!isAnnual)}
                 className="w-14 h-7 bg-slate-200 border border-slate-300 rounded-full relative transition-colors focus:outline-none flex items-center px-1 cursor-pointer"
               >
                  <motion.div 
                    animate={{ x: isAnnual ? 28 : 0 }} 
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`w-5 h-5 rounded-full shadow-md ${isAnnual ? 'bg-[#FF5A36]' : 'bg-[#1E2761]'}`}
                  />
               </button>
               <span className={`text-xs sm:text-sm font-bold pr-3 transition-colors flex items-center gap-1.5 ${isAnnual ? 'text-[#1E2761]' : 'text-slate-500'}`}>
                 <span>Annual</span>
                 <span className="text-[10px] bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20 px-2 py-0.5 rounded-full font-extrabold">Save 20%</span>
               </span>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. Three Pricing Plan Cards (Rounded-3xl) */}
        <section className="mb-20 sm:mb-28 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
          >
            {plans.map((p, idx) => {
              const isCurrent = currentPlan.toLowerCase() === p.name.toLowerCase();
              return (
                <motion.div
                  key={idx}
                  variants={fadeIn}
                  whileHover={{ y: -6 }}
                  className={`rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all relative ${
                    p.recommended 
                      ? 'bg-white border-2 border-[#FF5A36] shadow-2xl shadow-[#FF5A36]/10' 
                      : 'bg-white border border-[#E4E8EE] shadow-md hover:border-slate-300'
                  }`}
                >
                  {p.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF5A36] text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-black text-[#1E2761] mb-2">{p.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 min-h-[40px] leading-relaxed">{p.desc}</p>
                    
                    <div className="mb-8 flex items-baseline">
                      <span className="text-4xl sm:text-5xl font-black text-[#1E2761]">
                        ${isAnnual ? p.annualPrice : p.monthlyPrice}
                      </span>
                      <span className="text-slate-500 text-sm ml-2 font-medium">/mo</span>
                      {isAnnual && p.annualPrice !== '0' && (
                        <span className="text-xs text-[#FF5A36] font-semibold ml-2">Billed annually</span>
                      )}
                    </div>

                    <button
                      disabled={isLoading && actionPlan === p.name}
                      onClick={() => handleSelectPlan(p.name)}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all mb-8 flex items-center justify-center space-x-2 cursor-pointer ${
                        p.recommended
                          ? 'bg-[#FF5A36] hover:bg-[#E04826] text-white shadow-lg shadow-[#FF5A36]/25'
                          : isCurrent
                          ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-default'
                          : 'bg-[#1E2761] hover:bg-[#151A44] text-white shadow-md'
                      }`}
                    >
                      {isLoading && actionPlan === p.name ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <span>{isCurrent ? 'Current Plan' : p.cta}</span>
                      )}
                    </button>

                    <div className="space-y-4">
                      {p.features.map((f, i) => (
                        <div key={i} className="flex items-center space-x-3 text-sm">
                          {f.included ? (
                            <div className="w-5 h-5 rounded-full bg-[#1E2761]/10 text-[#1E2761] flex items-center justify-center shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                              <X size={12} strokeWidth={2.5} />
                            </div>
                          )}
                          <span className={f.included ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}>
                            {f.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* 3. Feature Comparison Matrix */}
        <section className="mb-20 sm:mb-28 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-6">
            <button
              onClick={() => setShowMatrix(prev => !prev)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#F5F7FA] text-[#1E2761] border border-[#E4E8EE] font-bold text-sm shadow-sm transition-all cursor-pointer hover:border-[#1E2761]/40"
            >
              <span>{showMatrix ? 'Hide Full Feature Matrix' : 'Compare All Plan Features'}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${showMatrix ? 'rotate-180 text-[#FF5A36]' : ''}`} />
            </button>
          </div>

          {showMatrix && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-[#E4E8EE] rounded-none overflow-hidden shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#E4E8EE] bg-[#F5F7FA]">
                      <th className="py-4 px-6 font-extrabold text-[#1E2761]">Feature</th>
                      <th className="py-4 px-6 font-extrabold text-[#1E2761] text-center">Free</th>
                      <th className="py-4 px-6 font-extrabold text-[#FF5A36] text-center">Pro</th>
                      <th className="py-4 px-6 font-extrabold text-[#1E2761] text-center">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E8EE]">
                    {[
                      { name: 'Max Participants', free: '10', pro: '100', ent: '1,000+' },
                      { name: 'Session Duration', free: '40 Minutes', pro: 'Unlimited', ent: 'Unlimited' },
                      { name: 'Video Clarity', free: '720p HD', pro: '1080p Ultra HD', ent: '4K Ultra HD' },
                      { name: 'Low-latency Screen Share', free: true, pro: true, ent: true },
                      { name: 'Waiting Room Gatekeeper', free: true, pro: true, ent: true },
                      { name: 'Encrypted Chat & Hand Raise', free: true, pro: true, ent: true },
                      { name: 'Cloud Session Recording', free: false, pro: '10 GB Vault', ent: 'Unlimited Vault' },
                      { name: 'Custom Workspace Theme', free: false, pro: true, ent: true },
                      { name: 'Dedicated Signaling Node', free: false, pro: false, ent: true },
                      { name: 'Enterprise SLA Support', free: false, pro: false, ent: true },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-[#F5F7FA]/60 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-[#1E2761]">{row.name}</td>
                        <td className="py-3.5 px-6 text-center text-slate-600">
                          {typeof row.free === 'boolean' ? (
                            row.free ? <Check size={16} className="mx-auto text-[#1E2761]" /> : <X size={16} className="mx-auto text-slate-300" />
                          ) : (
                            <span className="font-medium">{row.free}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center text-[#1E2761] font-semibold bg-[#FF5A36]/[0.02]">
                          {typeof row.pro === 'boolean' ? (
                            row.pro ? <Check size={16} className="mx-auto text-[#FF5A36]" /> : <X size={16} className="mx-auto text-slate-300" />
                          ) : (
                            <span className="text-[#FF5A36] font-bold">{row.pro}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center text-slate-600">
                          {typeof row.ent === 'boolean' ? (
                            row.ent ? <Check size={16} className="mx-auto text-[#1E2761]" /> : <X size={16} className="mx-auto text-slate-300" />
                          ) : (
                            <span className="font-medium text-[#1E2761]">{row.ent}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </section>

        {/* 4. Integrated FAQ Section */}
        <section id="faq" className="w-full bg-[#F5F7FA] py-16 sm:py-24 mb-20 sm:mb-28 border-0 shadow-none">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-8 lg:px-12">
            
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
                Frequently Asked <span className="text-[#FF5A36]">Questions</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal">
                Everything you need to know about our plans, security, video quality, and platform features.
              </p>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Pricing', 'Meetings', 'Security', 'Collaboration', 'Support'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#1E2761] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-[#E4E8EE] hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E8EE] rounded-full text-xs sm:text-sm text-[#1E2761] placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A36]"
                />
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredCategories.map((cat) => (
                <div key={cat.category} className="mb-6">
                  <div className="flex items-center space-x-2 mb-3 px-1">
                    {cat.icon}
                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1E2761]">
                      {cat.category}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {cat.questions.map((item, qIdx) => {
                      const isOpen = openFaqItems[`${cat.originalCatIdx}-${qIdx}`];
                      return (
                        <div 
                          key={qIdx}
                          className="border border-[#E4E8EE] rounded-2xl bg-white shadow-xs overflow-hidden transition-all hover:border-[#1E2761]/30"
                        >
                          <button
                            onClick={() => toggleFaqItem(cat.originalCatIdx, qIdx)}
                            className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none group cursor-pointer"
                          >
                            <span className="text-sm sm:text-base font-bold text-[#1E2761] pr-4 group-hover:text-[#FF5A36] transition-colors">
                              {item.q}
                            </span>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.25 }}
                              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                                isOpen 
                                  ? 'bg-[#FF5A36]/10 text-[#FF5A36]' 
                                  : 'bg-[#F5F7FA] text-slate-500'
                              }`}
                            >
                              <ChevronDown size={16} />
                            </motion.div>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                                  {item.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 5. Enterprise & Custom Solutions CTA */}
        <section id="contact-solutions" className="w-full bg-white py-16 sm:py-24 border-0 shadow-none text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
              Need custom volume or on-premise deployment?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
              Contact our solutions team for custom dedicated signaling nodes, enterprise SSO integration, and 99.99% uptime SLAs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => {
                  window.location.href = "mailto:solutions@wabiseminar.com?subject=Enterprise Inquiry";
                }}
                className="bg-[#1E2761] hover:bg-[#151A44] text-white px-9 py-4 rounded-full font-bold text-base shadow-lg shadow-[#1E2761]/25 hover:shadow-xl inline-flex items-center space-x-2 transition-all cursor-pointer group"
              >
                <Mail size={18} />
                <span>Talk to Solutions Team</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="bg-[#F5F7FA] hover:bg-[#E4E8EE] text-[#1E2761] border border-[#E4E8EE] px-8 py-4 rounded-full font-bold text-base transition-all cursor-pointer"
              >
                Host Free Meeting
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
