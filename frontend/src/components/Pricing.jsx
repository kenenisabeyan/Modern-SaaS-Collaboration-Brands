import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, ChevronDown, Loader2, Sparkles, Shield, Zap } from 'lucide-react';
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
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [isLoading, setIsLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

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
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1E2761]/10 text-[#1E2761] border border-[#1E2761]/20 mb-4">
              Transparent Pricing
            </span>
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
               <span className={`text-xs sm:text-sm font-bold pr-3 flex items-center space-x-2 transition-colors ${isAnnual ? 'text-[#1E2761]' : 'text-slate-500'}`}>
                  <span>Annually</span>
                  <span className="text-[10px] bg-[#FF5A36]/15 text-[#FF5A36] px-2 py-0.5 rounded-full font-bold">Save 20%</span>
               </span>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. Pricing Cards */}
        <section className="mb-20 sm:mb-32 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center max-w-6xl mx-auto">
             {plans.map((plan, index) => (
                <motion.div 
                   key={plan.name}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: index * 0.1, duration: 0.5 }}
                   className={`relative rounded-3xl p-8 sm:p-10 transition-all duration-300 bg-white border ${
                     plan.recommended 
                     ? 'border-2 border-[#FF5A36] shadow-xl md:scale-105 z-10' 
                     : 'border-[#E4E8EE] shadow-sm hover:border-[#1E2761]/40 z-0'
                   }`}
                >
                   {plan.recommended && (
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF5A36] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                        Most Popular
                     </div>
                   )}
                   
                   <div className="mb-6">
                     <h3 className="text-2xl font-bold text-[#1E2761] mb-2">{plan.name}</h3>
                     <p className="text-slate-600 text-sm min-h-[2.5rem]">{plan.desc}</p>
                   </div>
                   
                   <div className="mb-6">
                      <div className="flex items-baseline text-[#1E2761]">
                         <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">${isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                         <span className="text-slate-500 ml-2 font-medium">/mo</span>
                      </div>
                      {isAnnual && plan.annualPrice !== "0" && (
                         <div className="text-xs sm:text-sm text-[#FF5A36] font-semibold mt-1">Billed annually</div>
                      )}
                      {(!isAnnual || plan.annualPrice === "0") && (
                         <div className="text-xs sm:text-sm text-transparent font-medium mt-1">&nbsp;</div>
                      )}
                   </div>

                   <button 
                     disabled={isLoading && actionPlan === plan.name}
                     className={`w-full py-3.5 rounded-full font-bold mb-8 flex items-center justify-center transition-all text-sm sm:text-base cursor-pointer ${
                        plan.name === currentPlan 
                        ? 'bg-[#1E2761]/15 text-[#1E2761] border border-[#1E2761]/30 cursor-default'
                        : plan.recommended 
                        ? 'bg-[#FF5A36] hover:bg-[#E04826] text-white shadow-lg shadow-[#FF5A36]/25 hover:shadow-xl' 
                        : 'bg-white hover:bg-[#F5F7FA] border border-[#E4E8EE] hover:border-[#1E2761] text-[#1E2761] shadow-sm'
                     }`}
                     onClick={() => handleSelectPlan(plan.name)}
                   >
                     {isLoading && actionPlan === plan.name ? (
                       <Loader2 size={18} className="animate-spin" />
                     ) : plan.name === currentPlan ? (
                       'Current Plan'
                     ) : (
                       plan.cta
                     )}
                   </button>

                    <div className="space-y-3.5">
                      {plan.features.map((feature, i) => (
                         <div key={i} className={`flex items-start space-x-3 text-sm ${feature.included ? 'text-slate-800' : 'text-slate-400'}`}>
                            {feature.included ? (
                               <Check size={18} className={`shrink-0 mt-0.5 ${plan.name === 'Pro' ? 'text-[#FF5A36]' : 'text-[#1E2761]'}`} />
                            ) : (
                               <X size={18} className="shrink-0 mt-0.5 text-slate-300" />
                            )}
                            <span>{feature.name}</span>
                         </div>
                      ))}
                    </div>
                </motion.div>
             ))}
           </div>
        </section>

        {/* Feature Comparison Matrix Toggle */}
        <section className="mb-20 sm:mb-28 max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">
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

        {/* 3. Bottom CTA - Full-Bleed Edge-to-Edge (Zero Horizontal Borders) */}
        <section className="w-full bg-white py-16 sm:py-24 border-0 shadow-none text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E2761] mb-4 tracking-tight">
              Need custom volume or on-premise deployment?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
              Contact our solutions team for custom dedicated signaling nodes and enterprise SSO integration.
            </p>
            <button 
              onClick={() => onNavigate('faq')}
              className="bg-[#1E2761] hover:bg-[#151A44] text-white px-9 py-4 rounded-full font-bold text-base shadow-lg shadow-[#1E2761]/25 hover:shadow-xl inline-flex items-center space-x-2 transition-all cursor-pointer group"
            >
              <span>Talk to Solutions Team</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
