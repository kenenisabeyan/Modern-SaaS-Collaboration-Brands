import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Minus, Video, Users, LogIn, LogOut, 
  User, Settings, ChevronRight, Sparkles, Shield, ArrowRight 
} from 'lucide-react';

export default function Header({ currentView, onNavigate, isAuthenticated, handleAuthAction }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});
  
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
      hasSubmenu: true,
      subItems: [
        { label: 'Who We Are', view: 'features' },
        { label: 'Our Mission & Vision', view: 'how-it-works' },
        { label: 'Innovation Hub', view: 'features' }
      ]
    },
    {
      id: 'startups',
      label: 'Startups',
      hasSubmenu: true,
      subItems: [
        { label: 'Incubation Program', view: 'pricing' },
        { label: 'Acceleration (ice180)', view: 'pricing' },
        { label: 'Mentorship & Network', view: 'features' }
      ]
    },
    {
      id: 'innovation',
      label: 'Innovation',
      hasSubmenu: false,
      view: 'features'
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      hasSubmenu: true,
      subItems: [
        { label: 'Video Meeting Rooms', view: 'dashboard' },
        { label: 'Host a Masterclass', view: 'dashboard' },
        { label: 'Join Existing Room', view: 'dashboard' }
      ]
    },
    {
      id: 'entrepreneurship',
      label: 'Entrepreneurship',
      hasSubmenu: false,
      view: 'how-it-works'
    },
    {
      id: 'media',
      label: 'Media',
      hasSubmenu: false,
      view: 'how-it-works'
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
      {/* Top Sticky Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white ${
          isScrolled 
            ? 'h-20 sm:h-24 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border-b border-slate-100' 
            : 'h-20 sm:h-28'
        }`}
      >
        <div className="max-w-[1400px] h-full mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          
          {/* Logo on Left */}
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center cursor-pointer select-none group"
          >
            <img 
              src="/iceaddis-logo.svg" 
              alt="iceaddis" 
              className="h-7 sm:h-9 md:h-10 w-auto transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          {/* Right Hamburger Menu (3 red horizontal bars) */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            
            {/* Quick Action Buttons for logged-in users on Desktop */}
            {isAuthenticated && (
              <button 
                onClick={() => handleNavClick('user-dashboard')}
                className="hidden md:flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-full transition-all cursor-pointer shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-[#ec232b] text-white flex items-center justify-center text-[10px] font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span>Dashboard</span>
              </button>
            )}

            {/* Hamburger Button (Matches Screenshots 1 & 3) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 sm:p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group focus:outline-none"
              aria-label="Toggle navigation menu"
              title="Open Navigation Menu"
            >
              <div className="w-7 sm:w-8 h-4 sm:h-5 flex flex-col justify-between items-end">
                <span className="w-7 sm:w-8 h-[2.5px] bg-[#ec232b] rounded-full transition-all duration-300 group-hover:w-6"></span>
                <span className="w-5 sm:w-6 h-[2.5px] bg-[#ec232b] rounded-full transition-all duration-300 group-hover:w-8"></span>
                <span className="w-7 sm:w-8 h-[2.5px] bg-[#ec232b] rounded-full transition-all duration-300 group-hover:w-5"></span>
              </div>
            </button>

          </div>
        </div>
      </header>

      {/* Slide-out Right Drawer Menu (Matches Screenshot 2) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            
            {/* Dark Dimmed Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Slide-over Right Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="absolute inset-y-0 right-0 max-w-full w-full sm:w-[380px] md:w-[420px] bg-[#18181B] text-white shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Navigation</span>
                </div>
                
                {/* Close Button X (Matches Screenshot 2) */}
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={26} />
                </button>
              </div>

              {/* Drawer Menu Links (Matches Screenshot 2) */}
              <div className="px-6 sm:px-8 py-6 flex-1 space-y-1">
                {menuItems.map((item) => {
                  const isOpen = openAccordions[item.id];

                  return (
                    <div key={item.id} className="border-b border-white/5 pb-2">
                      <div className="flex items-center justify-between py-3">
                        {item.hasSubmenu ? (
                          <button
                            onClick={() => toggleAccordion(item.id)}
                            className="flex-1 flex items-center justify-between text-left text-lg sm:text-xl font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                          >
                            <span>{item.label}</span>
                            <span className="text-slate-400 text-lg font-light pl-4">
                              {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleNavClick(item.view || 'dashboard')}
                            className="w-full text-left text-lg sm:text-xl font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
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
                          className="pl-4 pb-2 space-y-2 border-l border-white/10 my-1"
                        >
                          {item.subItems.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleNavClick(sub.view)}
                              className="block w-full text-left text-sm text-slate-400 hover:text-[#ec232b] py-1 transition-colors cursor-pointer"
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

              {/* Drawer Footer Actions (Video Meetings & Auth) */}
              <div className="p-6 sm:p-8 bg-black/30 border-t border-white/10 space-y-3">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-[#ec232b] text-white flex items-center justify-center font-bold text-sm">
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white truncate max-w-[150px]">{username}</p>
                          <p className="text-[11px] text-slate-400">Logged In</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleNavClick('profile')} 
                          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                          title="Profile"
                        >
                          <User size={16} />
                        </button>
                        <button 
                          onClick={() => handleNavClick('settings')} 
                          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                          title="Settings"
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleNavClick('user-dashboard')}
                        className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold text-center transition-colors cursor-pointer"
                      >
                        My Meetings
                      </button>
                      <button
                        onClick={() => { setIsDrawerOpen(false); handleAuthAction(); }}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setIsDrawerOpen(false); handleAuthAction(); }}
                    className="w-full py-3.5 rounded-full bg-[#ec232b] hover:bg-[#d41c24] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    <LogIn size={16} />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
