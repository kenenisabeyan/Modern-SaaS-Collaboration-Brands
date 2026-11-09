import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronRight, Loader2, Sparkles, Shield, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-hidden relative">
      <main className="pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* 1. Hero Section & Toggle */}
        <section className="text-center mb-16 sm:mb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0DA9CF]/10 text-[#0DA9CF] border border-[#0DA9CF]/20 mb-4">
              Transparent Pricing
            </span>
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.08] text-slate-900">
              Invest in your <span className="text-[#0DA9CF]">masterclasses</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal mb-8 sm:mb-10">
              Start for free, then upgrade as your audience grows. No hidden fees. Cancel anytime.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div variants={fadeIn} className="flex items-center space-x-3 bg-slate-50 p-2 rounded-full border border-slate-200 shadow-sm">
               <span className={`text-xs sm:text-sm font-bold pl-3 transition-colors ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
               <button 
                 onClick={() => setIsAnnual(!isAnnual)}
                 className="w-14 h-7 bg-slate-200 border border-slate-300 rounded-full relative transition-colors focus:outline-none flex items-center px-1 cursor-pointer"
               >
                  <motion.div 
                    animate={{ x: isAnnual ? 28 : 0 }} 
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`w-5 h-5 rounded-full shadow-md ${isAnnual ? 'bg-[#04B84C]' : 'bg-[#0DA9CF]'}`}
                  />
               </button>
               <span className={`text-xs sm:text-sm font-bold pr-3 flex items-center space-x-2 transition-colors ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                  <span>Annually</span>
                  <span className="text-[10px] bg-[#04B84C]/15 text-[#04B84C] px-2 py-0.5 rounded-full font-bold">Save 20%</span>
               </span>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. Pricing Cards */}
        <section className="mb-20 sm:mb-32">
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
                     ? 'border-2 border-[#F67E31] shadow-xl md:scale-105 z-10' 
                     : 'border-slate-200 shadow-sm hover:border-[#0DA9CF]/40 z-0'
                   }`}
                >
                   {plan.recommended && (
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F67E31] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                        Most Popular
                     </div>
                   )}
                   
                   <div className="mb-6">
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                     <p className="text-slate-600 text-sm min-h-[2.5rem]">{plan.desc}</p>
                   </div>
                   
                   <div className="mb-6">
                      <div className="flex items-baseline text-slate-900">
                         <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">${isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                         <span className="text-slate-500 ml-2 font-medium">/mo</span>
                      </div>
                      {isAnnual && plan.annualPrice !== "0" && (
                         <div className="text-xs sm:text-sm text-[#04B84C] font-semibold mt-1">Billed annually</div>
                      )}
                      {(!isAnnual || plan.annualPrice === "0") && (
                         <div className="text-xs sm:text-sm text-transparent font-medium mt-1">&nbsp;</div>
                      )}
                   </div>

                   <button 
                     disabled={isLoading && actionPlan === plan.name}
                     className={`w-full py-3.5 rounded-full font-bold mb-8 flex items-center justify-center transition-all text-sm sm:text-base cursor-pointer ${
                        plan.name === currentPlan 
                        ? 'bg-[#04B84C]/15 text-[#04B84C] border border-[#04B84C]/30 cursor-default'
                        : plan.recommended 
                        ? 'bg-[#F67E31] hover:bg-[#CC6A2F] text-white shadow-lg shadow-[#F67E31]/25 hover:shadow-xl' 
                        : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0DA9CF] text-slate-900 shadow-sm'
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
                               <Check size={18} className={`shrink-0 mt-0.5 ${plan.name === 'Pro' ? 'text-[#F67E31]' : plan.name === 'Enterprise' ? 'text-[#04B84C]' : 'text-[#0DA9CF]'}`} />
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

        {/* 3. Bottom CTA */}
        <section className="text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-16 shadow-md max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Need custom volume or on-premise deployment?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
              Contact our solutions team for custom dedicated signaling nodes and enterprise SSO integration.
            </p>
            <button 
              onClick={() => onNavigate('faq')}
              className="bg-[#0DA9CF] hover:bg-[#0C8DB0] text-white px-9 py-4 rounded-full font-bold text-base shadow-lg shadow-[#0DA9CF]/25 hover:shadow-xl inline-flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>Talk to Solutions Team</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
