import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, X, Plus, Minus, Users, LogIn, LogOut, 
  User, Settings, Sparkles, Shield, ArrowRight, ChevronDown 
} from 'lucide-react';

export default function Header({ currentView, onNavigate, isAuthenticated, handleAuthAction }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  
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
    setHoveredSubmenu(null);
    onNavigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuItemClick = (item) => {
    setIsDrawerOpen(false);
    setHoveredSubmenu(null);
    if (item.action) {
      item.action();
    } else if (item.id === 'about') {
      if (currentView === 'dashboard') {
        const el = document.getElementById('features');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else handleNavClick('features');
      } else {
        handleNavClick('features');
      }
    } else if (item.id === 'masterclasses') {
      handleNavClick(isAuthenticated ? 'user-dashboard' : 'dashboard');
    } else {
      handleNavClick(item.view || 'dashboard');
    }
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
        { 
          label: 'Host a Session', 
          action: () => handleNavClick('dashboard') 
        },
        { 
          label: 'Join Existing Room', 
          action: () => {
            handleNavClick('dashboard');
            setTimeout(() => {
              const el = document.getElementById('room-join-input');
              el?.focus();
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          } 
        },
        { 
          label: 'My Sessions & History', 
          view: 'user-dashboard' 
        }
      ]
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
      action: () => {
        setIsDrawerOpen(false);
        setHoveredSubmenu(null);
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 200);
      }
    }
  ];

  return (
    <>
      {/* Top Sticky Header: Reduced Sleek Height (h-14 sm:h-16), All Contents Retained */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'h-14 sm:h-16 bg-[#FEFEFE]/95 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(30,39,97,0.06)]' 
            : 'h-14 sm:h-16 bg-[#FEFEFE] shadow-none'
        }`}
      >
        <div className="w-full max-w-[1720px] h-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between">
          
          {/* Logo on Left: Compact Deep Midnight Blue Avatar with Electric Coral Live Indicator */}
          <div 
            onClick={() => handleNavClick(isAuthenticated ? 'user-dashboard' : 'dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="relative">
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#1E2761] border border-[#151A44] flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-xs transition-transform duration-200 group-hover:scale-105">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#FF5A36] border-[1.5px] border-[#FEFEFE] rounded-full animate-pulse"></span>
            </div>
            <span className="font-extrabold text-sm sm:text-[15px] tracking-wider text-[#1E2761] uppercase">
              WABISEMINAR
            </span>
          </div>

          {/* Center Navigation Links: Sleek, Compact Spacing (All 7 links + dropdown retained) */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {menuItems.map((item) => {
              const isActive = currentView === item.view || (item.id === 'masterclasses' && currentView === 'dashboard');
              
              if (item.hasSubmenu) {
                return (
                  <div 
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredSubmenu(item.id)}
                    onMouseLeave={() => setHoveredSubmenu(null)}
                  >
                    <button
                      onClick={() => handleMenuItemClick(item)}
                      className={`text-xs xl:text-[13px] font-semibold transition-colors cursor-pointer select-none bg-transparent border-0 py-1 px-1 flex items-center space-x-1 ${
                        isActive
                          ? 'text-[#FF5A36] font-bold'
                          : 'text-[#1E2761] hover:text-[#FF5A36]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown size={12} className="opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                    </button>

                    {/* Compact Dropdown Popover on Hover */}
                    <AnimatePresence>
                      {hoveredSubmenu === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-48 bg-[#FEFEFE] rounded-xl shadow-xl border border-[#E4E8EE] py-1.5 z-50 overflow-hidden"
                        >
                          {item.subItems.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setHoveredSubmenu(null);
                                if (sub.action) sub.action();
                                else handleNavClick(sub.view);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#1E2761] hover:text-[#FF5A36] hover:bg-[#F5F7FA] transition-colors cursor-pointer flex items-center space-x-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36]/40"></span>
                              <span>{sub.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className={`text-xs xl:text-[13px] font-semibold transition-colors cursor-pointer select-none bg-transparent border-0 py-1 px-1 ${
                    isActive
                      ? 'text-[#FF5A36] font-bold'
                      : 'text-[#1E2761] hover:text-[#FF5A36]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Side: Compact Boxed Square Hamburger Button [ ≡ ] + Electric Coral Sign In Button */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            
            {/* Boxed Square Hamburger Button [ ≡ ] */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg border border-[#E4E8EE] bg-[#FEFEFE] hover:bg-[#E4E8EE]/40 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-xs focus:outline-none"
              aria-label="Toggle navigation menu"
              title="Open Navigation Menu"
            >
              <span className="w-3.5 h-[1.5px] bg-[#1E2761] rounded-full"></span>
              <span className="w-3.5 h-[1.5px] bg-[#1E2761] rounded-full"></span>
              <span className="w-3.5 h-[1.5px] bg-[#1E2761] rounded-full"></span>
            </button>

            {/* Solid Electric Coral Sign In / Dashboard Button (10% High Priority Action) */}
            {isAuthenticated ? (
              <button 
                onClick={() => handleNavClick('user-dashboard')}
                className="bg-[#1E2761] hover:bg-[#151A44] text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-[13px] shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white/20 text-white flex items-center justify-center text-[9px] font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="bg-[#FF5A36] hover:bg-[#E04826] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-[13px] shadow-sm shadow-[#FF5A36]/20 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Slide-out Right Drawer Menu (Deep Midnight Blue #1E2761) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            
            {/* Dark Dimmed Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-[#1E2761]/60 backdrop-blur-xs"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Slide-over Right Panel (Deep Midnight Blue #1E2761) */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="absolute inset-y-0 right-0 max-w-full w-full sm:w-[360px] md:w-[390px] bg-[#1E2761] text-white shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Header: Compact & Sleek */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                      <Video className="text-[#FF5A36] w-3.5 h-3.5" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#FF5A36] border-[1.5px] border-[#1E2761] rounded-full"></span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white">WABISEMINAR</span>
                </div>
                
                {/* Close Button X */}
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Menu Links */}
              <div className="px-5 sm:px-6 py-4 flex-1 space-y-0.5">
                {menuItems.map((item) => {
                  const isOpen = openAccordions[item.id];

                  return (
                    <div key={item.id} className="border-b border-white/10 pb-1.5">
                      <div className="flex items-center justify-between py-2">
                        {item.hasSubmenu ? (
                          <button
                            onClick={() => toggleAccordion(item.id)}
                            className="flex-1 flex items-center justify-between text-left text-base sm:text-lg font-light text-slate-100 hover:text-white transition-colors cursor-pointer"
                          >
                            <span>{item.label}</span>
                            <span className="text-slate-300 text-base font-light pl-4">
                              {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (item.action) item.action();
                              else handleNavClick(item.view || 'dashboard');
                            }}
                            className="w-full text-left text-base sm:text-lg font-light text-slate-100 hover:text-[#FF5A36] transition-colors cursor-pointer"
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
                          className="pl-3 pb-1.5 space-y-1.5 border-l border-white/20 my-1"
                        >
                          {item.subItems.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (sub.action) sub.action();
                                else handleNavClick(sub.view);
                              }}
                              className="block w-full text-left text-xs sm:text-sm text-slate-300 hover:text-[#FF5A36] py-1 transition-colors cursor-pointer"
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
              <div className="p-4 sm:p-5 bg-[#151A44] border-t border-white/10 space-y-2.5">
                {isAuthenticated ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FF5A36] text-white flex items-center justify-center font-bold text-xs">
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px]">{username}</p>
                          <p className="text-[11px] text-[#FF5A36] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] inline-block animate-pulse"></span>
                            <span>Active Online</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleNavClick('profile')}
                          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                          title="Profile"
                        >
                          <User size={15} />
                        </button>
                        <button 
                          onClick={() => handleNavClick('settings')}
                          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                          title="Settings"
                        >
                          <Settings size={15} />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleNavClick('user-dashboard')}
                      className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#FF5A36]/20 cursor-pointer"
                    >
                      <Video size={15} />
                      <span>Open Meeting Dashboard</span>
                    </button>

                    <button 
                      onClick={() => { setIsDrawerOpen(false); handleAuthAction(); }}
                      className="w-full border border-white/15 hover:border-[#FF5A36]/40 hover:bg-[#FF5A36]/10 text-slate-300 hover:text-[#FF5A36] py-2 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleNavClick('auth')}
                      className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#FF5A36]/20 cursor-pointer"
                    >
                      <LogIn size={15} />
                      <span>Sign In</span>
                    </button>
                    
                    <button 
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <Video size={15} />
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
