import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, X, Plus, Minus, Users, LogIn, LogOut, 
  User, Settings, ChevronRight, Sparkles, Shield, ArrowRight 
} from 'lucide-react';

export default function Header({ currentView, onNavigate, isAuthenticated, handleAuthAction }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({ masterclasses: true });
  
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNavClick = (id) => {
    setIsDrawerOpen(false);
    onNavigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menuItems = [
    {
      id: 'about',
      label: 'About',
      hasSubmenu: false,
      view: 'features'
    },
    {
      id: 'masterclasses',
      label: 'Masterclasses',
      hasSubmenu: true,
      subItems: [
        { label: 'Host a Session', view: 'dashboard' },
        { label: 'Join Existing Room', view: 'dashboard' },
        { label: 'My Sessions & History', view: 'user-dashboard' }
      ]
    },
    {
      id: 'startups',
      label: 'Startups & Innovation',
      hasSubmenu: false,
      view: 'features'
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      hasSubmenu: false,
      view: 'how-it-works'
    },
    {
      id: 'features',
      label: 'Features',
      hasSubmenu: false,
      view: 'features'
    },
    {
      id: 'how-it-works',
      label: 'How It Works',
      hasSubmenu: false,
      view: 'how-it-works'
    },
    {
      id: 'pricing',
      label: 'Pricing',
      hasSubmenu: false,
      view: 'pricing'
    },
    {
      id: 'faq',
      label: 'FAQ',
      hasSubmenu: false,
      view: 'faq'
    },
    {
      id: 'contact',
      label: 'Contact Us',
      hasSubmenu: false,
      view: 'faq'
    }
  ];

  return (
    <>
      {/* Top Sticky Header (Sleek, Clean, Tight Spacing like iceaddis & kenenisa-os) */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white ${
          isScrolled 
            ? 'h-16 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border-b border-slate-100' 
            : 'h-16 sm:h-20'
        }`}
      >
        <div className="max-w-[1440px] h-full mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          
          {/* Logo on Left - Avatar + KENENISA OS / WabiSeminar with Green Active Dot */}
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            {/* Circular Avatar / Badge with Active Green Dot */}
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Video className="text-[#0DA9CF] w-5 h-5" />
              </div>
              {/* Online Green Status Dot (#04B84C) */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#04B84C] border-2 border-white"></span>
            </div>

            <div className="flex items-baseline space-x-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0DA9CF]">
                KENENISA OS
              </span>
              <span className="hidden sm:inline-block font-bold text-sm tracking-tight text-slate-800">
                | WabiSeminar
              </span>
            </div>
          </div>

          {/* Quick Action Buttons and Hamburger Menu on Right */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Quick Action Button */}
            {isAuthenticated ? (
              <button 
                onClick={() => handleNavClick('user-dashboard')}
                className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-4 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-[#0DA9CF] text-white flex items-center justify-center text-[10px] font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-white bg-[#F67E31] hover:bg-[#CC6A2F] px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-[#F67E31]/25 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
            )}

            {/* Hamburger Button (Square border with 3 dark bars, matching Image 5 & Image 1) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer group focus:outline-none"
              aria-label="Toggle navigation menu"
              title="Open Navigation Menu"
            >
              <div className="w-5 h-3.5 flex flex-col justify-between items-center">
                <span className="w-5 h-[2px] bg-slate-800 rounded-full transition-all duration-200 group-hover:bg-[#0DA9CF]"></span>
                <span className="w-5 h-[2px] bg-slate-800 rounded-full transition-all duration-200 group-hover:bg-[#F67E31]"></span>
                <span className="w-5 h-[2px] bg-slate-800 rounded-full transition-all duration-200 group-hover:bg-[#04B84C]"></span>
              </div>
            </button>

          </div>
        </div>
      </header>

      {/* Slide-out Right Drawer Menu (Exact match to iceaddis.com Image 2) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            
            {/* Dark Dimmed Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Slide-over Right Panel (Dark full-height drawer) */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="absolute inset-y-0 right-0 max-w-full w-full sm:w-[380px] md:w-[420px] bg-[#18181B] text-white shadow-2xl flex flex-col justify-between overflow-y-auto z-10"
            >
              {/* Drawer Header */}
              <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0DA9CF] flex items-center justify-center">
                    <Video className="text-white w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold tracking-wider uppercase text-white block">WabiSeminar</span>
                    <span className="text-[10px] text-[#0DA9CF] font-semibold tracking-wide">KENENISA OS</span>
                  </div>
                </div>
                
                {/* Close Button X */}
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Drawer Menu Links (iceaddis style with clean typography and '+' accordion) */}
              <div className="px-6 sm:px-8 py-6 flex-1 space-y-1">
                {menuItems.map((item) => {
                  const isOpen = openAccordions[item.id];

                  return (
                    <div key={item.id} className="border-b border-white/5 pb-2">
                      <div className="flex items-center justify-between py-3">
                        {item.hasSubmenu ? (
                          <button
                            onClick={() => toggleAccordion(item.id)}
                            className="flex-1 flex items-center justify-between text-left text-lg sm:text-xl font-medium text-slate-200 hover:text-[#0DA9CF] transition-colors cursor-pointer"
                          >
                            <span>{item.label}</span>
                            <span className="text-slate-400 text-lg font-light pl-4">
                              {isOpen ? <Minus size={18} className="text-[#F67E31]" /> : <Plus size={18} />}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleNavClick(item.view || 'dashboard')}
                            className="w-full text-left text-lg sm:text-xl font-medium text-slate-200 hover:text-[#0DA9CF] transition-colors cursor-pointer"
                          >
                            {item.label}
                          </button>
                        )}
                      </div>

                      {/* Submenu Accordion */}
                      {item.hasSubmenu && isOpen && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 pb-2 space-y-2 border-l border-[#0DA9CF]/30 my-1"
                        >
                          {item.subItems.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleNavClick(sub.view)}
                              className="block w-full text-left text-sm text-slate-400 hover:text-white py-1 transition-colors cursor-pointer"
                            >
                              {sub.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 sm:p-8 bg-black/40 border-t border-white/10 space-y-3">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-[#0DA9CF] text-white flex items-center justify-center font-bold text-sm">
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white truncate max-w-[150px]">{username}</p>
                          <p className="text-xs text-[#04B84C] font-semibold flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#04B84C] inline-block"></span>
                            <span>Online</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleNavClick('profile')}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                          title="Profile"
                        >
                          <User size={16} />
                        </button>
                        <button 
                          onClick={() => handleNavClick('settings')}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                          title="Settings"
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleNavClick('user-dashboard')}
                      className="w-full bg-[#0DA9CF] hover:bg-[#0C8DB0] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#0DA9CF]/25 cursor-pointer"
                    >
                      <Video size={16} />
                      <span>Open Meeting Dashboard</span>
                    </button>

                    <button 
                      onClick={() => { setIsDrawerOpen(false); handleAuthAction(); }}
                      className="w-full border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 py-2.5 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button 
                      onClick={() => handleNavClick('auth')}
                      className="w-full bg-[#F67E31] hover:bg-[#CC6A2F] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#F67E31]/25 cursor-pointer"
                    >
                      <LogIn size={16} />
                      <span>Sign In</span>
                    </button>
                    
                    <button 
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <Video size={16} />
                      <span>Host Instant Meeting</span>
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
