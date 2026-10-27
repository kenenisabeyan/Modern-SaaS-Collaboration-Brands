import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Video, ChevronRight, HelpCircle, ArrowRight, Shield, Zap, Sparkles, Loader2
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

export default function Pricing({ onNavigate }) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [isLoading, setIsLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

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

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      cta: "Get Started Free",
      colorClass: "indigo",
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
      colorClass: "purple",
      recommended: true
    },
    {
      name: "Enterprise",
      desc: "Advanced security and control for large orgs.",
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
      colorClass: "blue",
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#050816] light:bg-[#FAFAFA] text-white light:text-slate-900 font-sans overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="fixed bg-indigo-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-20%] left-[-10%] pointer-events-none"></div>
      <div className="fixed bg-purple-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-10%] right-[-10%] pointer-events-none"></div>

      {/* Navbar handled globally in App.jsx */}

      <main className="pt-32 lg:pt-40 pb-20 relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-16">
        
        {/* 1. Hero Section & Toggle */}
        <section className="text-center mb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] text-white light:text-slate-900">
              Invest in your <span className="text-indigo-500">masterclasses</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-[#94A3B8] light:text-slate-600 leading-relaxed max-w-2xl font-light mb-12">
              Start for free, then upgrade as your audience grows. No hidden fees. Cancel anytime.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div variants={fadeIn} className="flex items-center space-x-4 bg-[#0A0F24]/80 light:bg-white p-2 rounded-full border border-white/10 light:border-slate-200 backdrop-blur-md light:backdrop-blur-none shadow-xl light:shadow-md">
               <span className={`text-sm font-bold pl-4 transition-colors ${!isAnnual ? 'text-white light:text-slate-900' : 'text-[#94A3B8] light:text-slate-500'}`}>Monthly</span>
               <button 
                 onClick={() => setIsAnnual(!isAnnual)}
                 className="w-16 h-8 bg-indigo-500/20 light:bg-indigo-100 border border-indigo-500/30 light:border-indigo-200 rounded-full relative transition-colors focus:outline-none flex items-center px-1 cursor-pointer"
               >
                  <motion.div 
                    animate={{ x: isAnnual ? 32 : 0 }} 
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-6 h-6 bg-indigo-400 light:bg-indigo-500 rounded-full shadow-md"
                  />
               </button>
               <span className={`text-sm font-bold pr-4 flex items-center space-x-2 transition-colors ${isAnnual ? 'text-white light:text-slate-900' : 'text-[#94A3B8] light:text-slate-500'}`}>
                  <span>Annually</span>
                  <span className="text-[10px] bg-emerald-500/20 light:bg-emerald-100 text-emerald-400 light:text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/30 light:border-emerald-200">Save 20%</span>
               </span>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. Pricing Cards */}
        <section className="mb-40">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
             {plans.map((plan, index) => (
                <motion.div 
                   key={plan.name}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: index * 0.1, duration: 0.5 }}
                   className={`relative rounded-[2rem] p-8 md:p-10 transition-all duration-300 group ${
                     plan.recommended 
                     ? 'bg-gradient-to-b from-[#160B2A] light:from-slate-100 to-[#0A0F24] light:to-white light:from-slate-50 light:to-white border-2 border-purple-500 light:border-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.3)] light:shadow-xl scale-100 md:scale-105 z-10 hover:shadow-[0_0_80px_rgba(168,85,247,0.5)]' 
                     : 'bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 light:shadow-md hover:border-white/30 light:hover:border-slate-300 z-0 hover:-translate-y-2'
                   }`}
                >
                   {/* Animated border for recommended */}
                   {plan.recommended && (
                      <div className="absolute inset-[-2px] rounded-[2rem] border-2 border-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 bg-[length:200%_100%] animate-[gradient_4s_linear_infinite] opacity-50 z-[-1] pointer-events-none mix-blend-screen mask-border"></div>
                   )}

                   {plan.recommended && (
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white light:text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                        Most Popular
                     </div>
                   )}
                   
                   <div className="mb-8">
                     <h3 className="text-2xl font-bold text-white light:text-slate-900 mb-2">{plan.name}</h3>
                     <p className="text-[#94A3B8] light:text-slate-600 text-sm h-10">{plan.desc}</p>
                   </div>
                   
                   <div className="mb-8">
                      <div className="flex items-baseline text-white light:text-slate-900">
                         <span className="text-5xl font-extrabold tracking-tight">${isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                         <span className="text-[#94A3B8] light:text-slate-500 ml-2 font-medium">/mo</span>
                      </div>
                      {isAnnual && plan.annualPrice !== "0" && (
                         <div className="text-sm text-emerald-400 light:text-emerald-600 font-medium mt-2">Billed annually</div>
                      )}
                      {(!isAnnual || plan.annualPrice === "0") && (
                         <div className="text-sm text-transparent font-medium mt-2">&nbsp;</div>
                      )}
                   </div>

                   <motion.button 
                     whileHover={{ scale: plan.name === currentPlan ? 1 : 1.05 }}
                     whileTap={{ scale: plan.name === currentPlan ? 1 : 0.95 }}
                     disabled={isLoading && actionPlan === plan.name}
                     className={`w-full py-4 rounded-full font-bold mb-10 flex items-center justify-center transition-all ${
                        plan.name === currentPlan 
                        ? 'bg-emerald-500/20 light:bg-emerald-100 text-emerald-400 light:text-emerald-600 border border-emerald-500/30 light:border-emerald-200 cursor-default'
                        : plan.recommended 
                        ? 'bg-purple-500 hover:bg-purple-600 text-white light:text-slate-900 shadow-[0_10px_20px_-10px_rgba(168,85,247,0.6)] light:shadow-[0_10px_20px_-10px_rgba(168,85,247,0.3)]' 
                        : 'bg-white/5 light:bg-slate-50 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-100 border border-white/10 light:border-slate-200 text-white light:text-slate-900'
                     }`}
                     onClick={() => handleSelectPlan(plan.name)}
                   >
                     {isLoading && actionPlan === plan.name ? (
                       <Loader2 size={20} className="animate-spin" />
                     ) : plan.name === currentPlan ? (
                       'Current Plan'
                     ) : (
                       plan.cta
                     )}
                   </motion.button>

                    <div className="space-y-4">
                      {plan.features.map((feature, i) => (
                         <div key={i} className={`flex items-start space-x-3 ${feature.included ? 'text-white light:text-slate-900' : 'text-slate-600 light:text-slate-400'}`}>
                            {feature.included ? (
                               <Check size={20} className={`text-${plan.colorClass}-400 light:text-${plan.colorClass}-600 shrink-0`} />
                            ) : (
                               <X size={20} className="shrink-0" />
                            )}
                            <span className="text-sm font-medium">{feature.name}</span>
                         </div>
                      ))}
                   </div>
                </motion.div>
             ))}
           </div>
        </section>

        {/* 3. Feature Comparison Table */}
        <section className="mb-40">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold mb-4 text-white light:text-slate-900">Compare Features</h2>
              <p className="text-[#94A3B8] light:text-slate-600 text-lg">Detailed breakdown of what's included.</p>
           </div>
           <div className="max-w-5xl mx-auto bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none rounded-[2rem] border border-white/10 light:border-slate-200 overflow-hidden shadow-2xl light:shadow-md">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                       <tr className="border-b border-white/10 light:border-slate-200">
                          <th className="py-6 px-6 font-semibold text-[#94A3B8] light:text-slate-500 text-sm uppercase tracking-wider w-1/3">Feature</th>
                          <th className="py-6 px-6 font-bold text-white light:text-slate-900 text-center w-[22%]">Free</th>
                          <th className="py-6 px-6 font-bold text-purple-400 light:text-purple-600 text-center w-[22%] bg-purple-500/5 light:bg-purple-50">Pro</th>
                          <th className="py-6 px-6 font-bold text-white light:text-slate-900 text-center w-[22%]">Enterprise</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 light:divide-slate-200">
                       {[
                         { name: "Max Participants", free: "10", pro: "100", ent: "1,000" },
                         { name: "Time Limit", free: "40 mins", pro: "Unlimited", ent: "Unlimited" },
                         { name: "Video Quality", free: "720p HD", pro: "1080p Ultra HD", ent: "4K Support" },
                         { name: "Screen Sharing", free: true, pro: true, ent: true },
                         { name: "Breakout Rooms", free: false, pro: true, ent: true },
                         { name: "Cloud Recording", free: false, pro: "10GB", ent: "Unlimited" },
                         { name: "Custom Branding", free: false, pro: true, ent: true },
                         { name: "Analytics Dashboard", free: false, pro: true, ent: true },
                         { name: "Priority Support", free: false, pro: false, ent: true },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] light:hover:bg-slate-50 transition-colors">
                             <td className="py-5 px-6 text-sm text-[#94A3B8] light:text-slate-600 font-medium">{row.name}</td>
                             <td className="py-5 px-6 text-center text-sm font-medium text-white light:text-slate-900">
                                {typeof row.free === 'boolean' ? (row.free ? <Check size={18} className="mx-auto text-indigo-400 light:text-indigo-600"/> : <X size={18} className="mx-auto text-slate-700 light:text-slate-300 light:text-slate-600"/>) : row.free}
                             </td>
                             <td className="py-5 px-6 text-center text-sm font-bold text-white light:text-slate-900 bg-purple-500/5 light:bg-purple-50">
                                {typeof row.pro === 'boolean' ? (row.pro ? <Check size={18} className="mx-auto text-purple-400 light:text-purple-600"/> : <X size={18} className="mx-auto text-slate-700 light:text-slate-300 light:text-slate-600"/>) : row.pro}
                             </td>
                             <td className="py-5 px-6 text-center text-sm font-medium text-white light:text-slate-900">
                                {typeof row.ent === 'boolean' ? (row.ent ? <Check size={18} className="mx-auto text-blue-400 light:text-blue-600"/> : <X size={18} className="mx-auto text-slate-700 light:text-slate-300 light:text-slate-600"/>) : row.ent}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>

         {/* 4. Trust Badges */}
        <section className="mb-40 text-center">
           <p className="text-slate-400 light:text-slate-500 text-sm font-bold tracking-[0.2em] uppercase mb-8">Trusted by educators at</p>
           <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-60 light:opacity-80">
              <div className="text-xl font-bold flex items-center gap-2 text-white light:text-slate-800"><div className="w-6 h-6 rounded bg-indigo-500"></div> Harvard</div>
              <div className="text-xl font-bold flex items-center gap-2 text-white light:text-slate-800"><div className="w-6 h-6 rounded-full bg-indigo-500"></div> Stanford</div>
              <div className="text-xl font-bold flex items-center gap-2 text-white light:text-slate-800"><div className="w-6 h-6 rounded-tr-xl rounded-bl-xl bg-gradient-to-br from-rose-500 to-orange-500"></div> MIT</div>
              <div className="text-xl font-bold flex items-center gap-2 text-white light:text-slate-800 hidden sm:flex"><div className="w-6 h-6 rotate-45 bg-gradient-to-br from-blue-500 to-cyan-500"></div> Oxford</div>
           </div>
        </section>

         {/* 5. FAQ Pricing Section */}
        <section className="mb-20 max-w-4xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold mb-4 text-white light:text-slate-900">Frequently Asked Questions</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                 { q: "Can I change plans anytime?", a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time right from your dashboard." },
                 { q: "What happens when I hit my participant limit?", a: "We won't drop your call. You'll receive a notification and new participants will be placed in a waiting room until you upgrade." },
                 { q: "Is there a discount for non-profits?", a: "Absolutely! We offer a 50% discount on Pro and Enterprise plans for registered non-profits and educational institutions." },
                 { q: "How does the free trial work?", a: "Our Pro plan comes with a 14-day free trial. No credit card required to start. You can cancel before the trial ends and you won't be charged." }
              ].map((faq, i) => (
                 <div key={i} className="bg-[#0A0F24]/40 light:bg-white border border-white/5 light:border-slate-200 p-6 rounded-full hover:border-white/10 light:hover:border-slate-300 light:shadow-sm transition-colors">
                    <h4 className="text-lg font-bold text-white light:text-slate-900 mb-3 flex items-start gap-3">
                       <HelpCircle size={20} className="text-purple-400 light:text-purple-600 shrink-0 mt-0.5" />
                       {faq.q}
                    </h4>
                    <p className="text-[#94A3B8] light:text-slate-600 text-sm leading-relaxed pl-8">{faq.a}</p>
                 </div>
              ))}
           </div>
        </section>

      </main>
      
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
