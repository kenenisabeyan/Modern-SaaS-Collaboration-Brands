import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, X, Plus, Minus, Users, LogIn, LogOut, 
  User, Settings, Sparkles, Shield, ArrowRight,
  Search, Bell, ChevronDown, Check, Camera,
  Link as LinkIcon, Radio, Layers, Activity, HelpCircle
} from 'lucide-react';

export default function Header({ currentView, onNavigate, isAuthenticated, handleAuthAction }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});
  
  // Dashboard Header Interactive States (Strictly for User Dashboard after sign-in)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  
  // These upgraded header elements are ONLY visible inside dashboards after sign-in
  const isDashboardMode = isAuthenticated && ['user-dashboard', 'profile', 'settings'].includes(currentView);

  // Notification items matching CoVideo ecosystem
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Live Masterclass Engine Online',
      desc: 'Sub-50ms peer mesh active with 60 FPS 1080p WebRTC capability.',
      time: 'Just now',
      unread: true,
      icon: 'engine'
    },
    {
      id: 2,
      title: 'DTLS-SRTP Encryption Verified',
      desc: 'All audio, video, and data channels cryptographically secured.',
      time: '8m ago',
      unread: true,
      icon: 'security'
    },
    {
      id: 3,
      title: 'Masterclass Room Link Ready',
      desc: 'Your instant browser-native room is live and ready for attendees.',
      time: '25m ago',
      unread: true,
      icon: 'room'
    },
    {
      id: 4,
      title: 'Adaptive Bitrate Engine Active',
      desc: 'Smart bandwidth throttling configured for low-latency streaming.',
      time: '1h ago',
      unread: false,
      icon: 'stream'
    }
  ]);

  const searchInputRef = useRef(null);
  const headerRef = useRef(null);

  const username = localStorage.getItem('username') || (isAuthenticated ? 'Host Administrator' : 'Administration');
  const userInitial = (username || 'A').charAt(0).toUpperCase();

  const unreadCount = notifications.filter(n => n.unread).length;

  // Quick search items across CoVideo
  const searchItems = [
    {
      category: 'Meeting Actions',
      items: [
        { label: 'Start Instant Meeting', icon: Video, action: () => handleNavClick('dashboard') },
        { label: 'Join Room with Invite Code', icon: LinkIcon, action: () => {
          handleNavClick('dashboard');
          setTimeout(() => document.getElementById('room-join-input')?.focus(), 250);
        }},
        { label: 'Hardware Cam & Mic Check', icon: Camera, action: () => handleNavClick('user-dashboard') }
      ]
    },
    {
      category: 'Workspace & Management',
      items: [
        { label: 'My Meeting Dashboard', icon: Radio, action: () => handleNavClick(isAuthenticated ? 'user-dashboard' : 'dashboard') },
        { label: 'Host Profile & Bio', icon: User, action: () => handleNavClick('profile') },
        { label: 'Audio & Video Preferences', icon: Settings, action: () => handleNavClick('settings') },
        { label: 'Platform Capabilities & WebRTC', icon: Layers, action: () => handleNavClick('features') },
        { label: 'Pricing Plans & Enterprise', icon: Shield, action: () => handleNavClick('pricing') },
        { label: 'Frequently Asked Questions', icon: HelpCircle, action: () => handleNavClick('faq') }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
        setShowNotifications(false);
        setShowProfileDropdown(false);
        setShowWorkspaceModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K) for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setShowNotifications(false);
        setShowProfileDropdown(false);
        setShowWorkspaceModal(false);
        setShowMobileSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dispatch search query to active dashboard views
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    window.dispatchEvent(new CustomEvent('covideo-search', { detail: val }));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNavClick = (id) => {
    setIsDrawerOpen(false);
    setIsSearchFocused(false);
    setShowMobileSearch(false);
    setShowNotifications(false);
    setShowProfileDropdown(false);
    setShowWorkspaceModal(false);
    onNavigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuItemClick = (item) => {
    setIsDrawerOpen(false);
    if (item.action) {
      item.action();
    } else {
      handleNavClick(item.view || 'dashboard');
    }
  };

  // Filtered search results
  const filteredSearchItems = searchItems.map(cat => ({
    category: cat.category,
    items: cat.items.filter(item => 
      !searchQuery.trim() || item.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
  })).filter(cat => cat.items.length > 0);

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      hasSubmenu: true,
      view: 'dashboard',
      action: () => handleNavClick('dashboard'),
      subItems: [
        { label: 'Instant Room Creator', action: () => handleNavClick('dashboard') },
        { label: 'Join Meeting Session', action: () => {
          handleNavClick('dashboard');
          setTimeout(() => {
            const el = document.getElementById('room-join-input');
            el?.focus();
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }},
        ...(isAuthenticated ? [{ label: 'My Meeting Dashboard', action: () => handleNavClick('user-dashboard') }] : [])
      ]
    },
    {
      id: 'about',
      label: 'About',
      hasSubmenu: true,
      view: 'about',
      action: () => handleNavClick('about'),
      subItems: [
        { label: 'The CoVideo Story', action: () => {
          handleNavClick('about');
          setTimeout(() => document.getElementById('genesis')?.scrollIntoView({ behavior: 'smooth' }), 150);
        }},
        { label: 'Our Core Pillars', action: () => {
          handleNavClick('about');
          setTimeout(() => document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' }), 150);
        }},
        { label: 'Technical Architecture', action: () => {
          handleNavClick('about');
          setTimeout(() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' }), 150);
        }}
      ]
    },
    {
      id: 'features',
      label: 'Features',
      hasSubmenu: true,
      view: 'features',
      subItems: [
        { label: 'Platform Capabilities', action: () => {
          handleNavClick('features');
          setTimeout(() => document.getElementById('features-list')?.scrollIntoView({ behavior: 'smooth' }), 150);
        }},
        { label: 'How It Works (4 Steps)', action: () => {
          handleNavClick('features');
          setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 150);
        }},
        { label: 'WebRTC Infrastructure', action: () => {
          handleNavClick('features');
          setTimeout(() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' }), 150);
        }}
      ]
    },
    {
      id: 'pricing',
      label: 'Pricing',
      hasSubmenu: true,
      view: 'pricing',
      subItems: [
        { label: 'Plans & Comparison', action: () => handleNavClick('pricing') },
        { label: 'Frequently Asked Questions', action: () => {
          handleNavClick('pricing');
          setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 150);
        }},
        { label: 'Talk to Solutions Team', action: () => {
          handleNavClick('pricing');
          setTimeout(() => document.getElementById('contact-solutions')?.scrollIntoView({ behavior: 'smooth' }), 150);
        }}
      ]
    }
  ];

  return (
    <>
      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isDashboardMode 
            ? 'h-16 sm:h-20 bg-white/95 backdrop-blur-md shadow-none border-0' 
            : isScrolled
              ? 'border-b border-[#E4E8EE]/60 h-16 sm:h-20 bg-[#FEFEFE]/95 backdrop-blur-md shadow-[0_12px_30px_-6px_rgba(30,39,97,0.08)]'
              : 'border-b border-transparent h-16 sm:h-20 bg-[#FEFEFE] shadow-none'
        }`}
      >
        {/* =========================================================================
            MODE 1: DASHBOARD HEADER (Visible strictly inside dashboard after sign-in)
           ========================================================================= */}
        {isDashboardMode ? (
          <div className="w-full max-w-[1920px] h-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-3 sm:gap-6">
            
            {/* LEFT: Circular Brand Logo Badge & Name */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <div 
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none group"
                title="Return to Home"
              >
                <div className="relative">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1E2761] flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-none transition-transform duration-200 group-hover:scale-105 border-0">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A36]" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#FF5A36] rounded-full animate-pulse border-0"></span>
                </div>
                <span className="font-black text-sm sm:text-base lg:text-lg tracking-wider text-[#1E2761] uppercase hidden xs:inline-block">
                  COVIDEO
                </span>
              </div>
            </div>

            {/* CENTER-LEFT: Pill Search Bar */}
            <div className="relative flex-1 max-w-sm sm:max-w-md lg:max-w-lg hidden md:block">
              <div 
                className={`w-full flex items-center bg-[#F5F7FA] hover:bg-[#EEF2F6] focus-within:bg-white rounded-full px-4 py-2 transition-all shadow-none border-0 ${
                  isSearchFocused 
                    ? 'ring-2 ring-[#1E2761]/10 bg-white' 
                    : ''
                }`}
              >
                <Search size={16} className="text-slate-400 shrink-0 mr-2.5" />
                <input 
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search seminars, rooms, participants, recordings..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#1E2761] placeholder-slate-400 outline-none font-medium min-w-0"
                />
                {searchQuery ? (
                  <button 
                    onClick={() => handleSearchChange('')}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors ml-1 cursor-pointer border-0 shadow-none"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <span className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded-md shrink-0 ml-2 shadow-none border-0">
                    ⌘K
                  </span>
                )}
              </div>

              {/* Search Palette Floating Dropdown */}
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 right-0 top-12 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 p-2 text-left"
                  >
                    <div className="max-h-80 overflow-y-auto space-y-3 p-1">
                      {filteredSearchItems.length > 0 ? (
                        filteredSearchItems.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                              {group.category}
                            </p>
                            {group.items.map((item, iIdx) => {
                              const ItemIcon = item.icon;
                              return (
                                <button
                                  key={iIdx}
                                  onClick={() => item.action()}
                                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left text-xs sm:text-sm text-[#1E2761] hover:bg-[#1E2761]/5 hover:text-[#FF5A36] transition-colors cursor-pointer group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-[#1E2761]/8 group-hover:bg-[#FF5A36]/10 text-[#1E2761] group-hover:text-[#FF5A36] flex items-center justify-center shrink-0 transition-colors">
                                    <ItemIcon size={14} />
                                  </div>
                                  <span className="font-semibold flex-1 truncate">{item.label}</span>
                                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-[#FF5A36] transition-opacity" />
                                </button>
                              );
                            })}
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-slate-500 text-xs">
                          No matches found for <span className="font-bold text-[#1E2761]">"{searchQuery}"</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT CLUSTER: Workspace Pill, Bell, Profile Pill, Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              
              {/* Mobile Search Trigger Button */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5F7FA] hover:bg-slate-100 flex md:hidden items-center justify-center text-slate-700 hover:text-[#1E2761] transition-all cursor-pointer shadow-none border-0"
                title="Search"
              >
                <Search size={16} />
              </button>

              {/* Workspace Pill Badge */}
              <div className="relative">
                <button 
                  onClick={() => setShowWorkspaceModal(!showWorkspaceModal)}
                  className="hidden 2xl:flex items-center space-x-2 bg-[#FF5A36]/10 hover:bg-[#FF5A36]/15 text-[#FF5A36] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-none select-none border-0"
                  title="CoVideo Masterclass Architecture"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
                  <span>COVIDEO MASTERCLASS SUITE</span>
                </button>

                <AnimatePresence>
                  {showWorkspaceModal && (
                    <motion.div 
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 text-left"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <Sparkles size={16} className="text-[#FF5A36]" />
                          <h4 className="text-xs font-bold text-[#1E2761] uppercase tracking-wider">Suite Details</h4>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Live 1080p 60fps
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400">Infrastructure</span>
                          <span className="font-semibold text-[#1E2761]">WebRTC Mesh + Socket.IO</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400">Security</span>
                          <span className="font-semibold text-[#1E2761]">DTLS-SRTP 256-Bit</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Latency Target</span>
                          <span className="font-semibold text-emerald-600">&lt; 50ms Peer Sync</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notification Bell Icon Button with Badge Counter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileDropdown(false);
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5F7FA] hover:bg-[#EEF2F6] flex items-center justify-center text-slate-700 hover:text-[#1E2761] transition-all relative cursor-pointer shadow-none border-0"
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 bg-[#FF5A36] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-none border-0">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-12 mt-1 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 text-left"
                    >
                      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1E2761]">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FF5A36]/10 text-[#FF5A36] text-[10px] font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[11px] font-semibold text-[#FF5A36] hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.map((item) => (
                          <div 
                            key={item.id}
                            className={`p-3 sm:p-3.5 hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                              item.unread ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                              item.unread 
                                ? 'bg-[#FF5A36]/15 text-[#FF5A36]' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              <Activity size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-[#1E2761] truncate">{item.title}</p>
                                <span className="text-[10px] text-slate-400 shrink-0 ml-2">{item.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
                        <span className="text-[11px] font-semibold text-slate-500 inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          All WebRTC systems operational
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile / Administration Pill Card */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowNotifications(false);
                  }}
                  className="bg-[#F5F7FA] hover:bg-[#EEF2F6] rounded-full pl-3 sm:pl-3.5 pr-1.5 py-1 flex items-center space-x-2.5 transition-all cursor-pointer shadow-none select-none border-0"
                  title="Administration & Account"
                >
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-[#1E2761] leading-tight truncate max-w-[120px]">
                      {username === 'User' || username === 'Admin' ? 'Administration' : username}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Host & Guest
                    </p>
                  </div>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E2761]/10 text-[#1E2761] font-bold text-xs flex items-center justify-center shrink-0 border-0">
                    {userInitial}
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-12 mt-1 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 p-2 text-left"
                    >
                      <div className="p-3 bg-[#F5F7FA] rounded-xl mb-2 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#1E2761] text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1E2761] truncate">{username}</p>
                          <p className="text-[10px] text-slate-500 font-medium truncate">
                            Host Administrator
                          </p>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-semibold text-emerald-600">Online Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <button
                          onClick={() => handleNavClick('user-dashboard')}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#1E2761] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Video size={14} className="text-[#FF5A36]" />
                          <span>Meeting Dashboard</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('profile')}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#1E2761] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <User size={14} className="text-slate-500" />
                          <span>Host Profile & Bio</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('settings')}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#1E2761] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Settings size={14} className="text-slate-500" />
                          <span>Audio & Video Settings</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('pricing')}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#1E2761] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Sparkles size={14} className="text-amber-500" />
                          <span>Plans & Upgrades</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 my-1 pt-1">
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            handleAuthAction();
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#FF5A36] hover:bg-[#FF5A36]/10 transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Boxed Hamburger Menu Button [ ≡ ] for Dashboard Navigation Drawer */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F5F7FA] hover:bg-[#EEF2F6] flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-none focus:outline-none border-0"
                aria-label="Toggle navigation menu"
                title="Open Navigation Menu"
              >
                <span className="w-4 h-[2px] bg-[#1E2761] rounded-full"></span>
                <span className="w-4 h-[2px] bg-[#1E2761] rounded-full"></span>
                <span className="w-4 h-[2px] bg-[#1E2761] rounded-full"></span>
              </button>

            </div>

          </div>
        ) : (
          /* =========================================================================
              MODE 2: PUBLIC WEBSITE HEADER (Visible outside dashboards / before signin)
             ========================================================================= */
          <div className="w-full max-w-[1800px] h-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 flex items-center justify-between">
            
            {/* Logo on Left (Navigates to Home) */}
            <div 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center space-x-3 cursor-pointer select-none group"
              title="Return to Home"
            >
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1E2761] border border-[#151A44] flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#FF5A36] border-2 border-[#FEFEFE] rounded-full animate-pulse"></span>
              </div>
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-[#1E2761] uppercase">
                COVIDEO
              </span>
            </div>

            {/* Center Navigation Links (Revealed smoothly when scrolling) */}
            <AnimatePresence>
              {isScrolled && (
                <motion.nav 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="hidden lg:flex items-center space-x-3 xl:space-x-5"
                >
                  {menuItems.map((item) => {
                    const isActive = item.id === 'home'
                      ? (currentView === 'dashboard' || currentView === 'user-dashboard')
                      : currentView === item.view;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuItemClick(item)}
                        className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer select-none bg-transparent border-0 px-3 py-1 rounded-full ${
                          isActive
                            ? 'text-[#FF5A36] font-bold bg-[#FF5A36]/10'
                            : 'text-[#1E2761]/85 hover:text-[#FF5A36] hover:bg-[#1E2761]/5'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </motion.nav>
              )}
            </AnimatePresence>

            {/* Right Side: Boxed Square Hamburger Button [ ≡ ] + Electric Coral Sign In Button */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              
              {/* Boxed Square Hamburger Button [ ≡ ] */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="w-10 h-10 rounded-lg border border-[#E4E8EE] bg-[#FEFEFE] hover:bg-[#E4E8EE]/40 flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-sm focus:outline-none"
                aria-label="Toggle navigation menu"
                title="Open Navigation Menu"
              >
                <span className="w-4 h-[2px] bg-[#1E2761] rounded-full"></span>
                <span className="w-4 h-[2px] bg-[#1E2761] rounded-full"></span>
                <span className="w-4 h-[2px] bg-[#1E2761] rounded-full"></span>
              </button>

              {/* Solid Electric Coral Sign In / Dashboard Button */}
              {isAuthenticated ? (
                <button 
                  onClick={() => handleNavClick('user-dashboard')}
                  className="bg-[#1E2761] hover:bg-[#151A44] text-white px-4 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
                    {userInitial}
                  </div>
                  <span>Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('auth')}
                  className="bg-[#FF5A36] hover:bg-[#E04826] text-white px-4 sm:px-5 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-md shadow-[#FF5A36]/20 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Sign In</span>
                </button>
              )}

            </div>
          </div>
        )}

        {/* Mobile Search Overlay Bar (Dashboard Mode Only) */}
        <AnimatePresence>
          {isDashboardMode && showMobileSearch && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden px-4 pb-3 pt-1 bg-white border-t border-slate-100 shadow-sm"
            >
              <div className="flex items-center bg-[#F5F7FA] border border-[#E4E8EE] rounded-full px-3 py-1.5">
                <Search size={14} className="text-slate-400 mr-2" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search seminars, rooms..."
                  className="w-full bg-transparent text-xs text-[#1E2761] outline-none"
                  autoFocus
                />
                <button onClick={() => setShowMobileSearch(false)} className="p-1 text-slate-400">
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================
          SLIDE-OUT RIGHT DRAWER MENU (Deep Midnight Blue #1E2761)
         ======================================================== */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            
            {/* Dark Dimmed Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#1E2761]/60 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Slide-over Right Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="absolute inset-y-0 right-0 max-w-full w-full sm:w-[380px] md:w-[420px] bg-[#1E2761] text-white shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/10">
                <div 
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center space-x-2.5 cursor-pointer select-none group"
                  title="Return to Home"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Video className="text-[#FF5A36] w-4 h-4" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#FF5A36] border-2 border-[#1E2761] rounded-full"></span>
                  </div>
                  <span className="text-sm font-bold tracking-wider uppercase text-white group-hover:text-[#FF5A36] transition-colors">COVIDEO</span>
                </div>
                
                {/* Close Button X */}
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Drawer Menu Links */}
              <div className="px-6 sm:px-8 py-6 flex-1 space-y-1">
                {menuItems.map((item) => {
                  const isOpen = openAccordions[item.id];

                  return (
                    <div key={item.id} className="border-b border-white/10 pb-2">
                      <div className="flex items-center justify-between py-3">
                        {item.hasSubmenu ? (
                          <button
                            onClick={() => toggleAccordion(item.id)}
                            className="flex-1 flex items-center justify-between text-left text-lg sm:text-xl font-light text-slate-100 hover:text-white transition-colors cursor-pointer"
                          >
                            <span>{item.label}</span>
                            <span className="text-slate-300 text-lg font-light pl-4">
                              {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (item.action) item.action();
                              else handleNavClick(item.view || 'dashboard');
                            }}
                            className="w-full text-left text-lg sm:text-xl font-light text-slate-100 hover:text-[#FF5A36] transition-colors cursor-pointer"
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
                          className="pl-4 pb-2 space-y-2 border-l border-white/20 my-1"
                        >
                          {item.subItems.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (sub.action) sub.action();
                                else handleNavClick(sub.view);
                              }}
                              className="block w-full text-left text-sm text-slate-300 hover:text-[#FF5A36] py-1 transition-colors cursor-pointer"
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
              <div className="p-6 sm:p-8 bg-[#151A44] border-t border-white/10 space-y-3">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-[#FF5A36] text-white flex items-center justify-center font-bold text-sm">
                          {userInitial}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white truncate max-w-[150px]">{username}</p>
                          <p className="text-xs text-[#FF5A36] flex items-center gap-1">
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
                          <User size={16} />
                        </button>
                        <button 
                          onClick={() => handleNavClick('settings')}
                          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                          title="Settings"
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleNavClick('user-dashboard')}
                      className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#FF5A36]/25 cursor-pointer"
                    >
                      <Video size={16} />
                      <span>Open Meeting Dashboard</span>
                    </button>

                    <button 
                      onClick={() => { setIsDrawerOpen(false); handleAuthAction(); }}
                      className="w-full border border-white/15 hover:border-[#FF5A36]/40 hover:bg-[#FF5A36]/10 text-slate-300 hover:text-[#FF5A36] py-2.5 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button 
                      onClick={() => handleNavClick('auth')}
                      className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#FF5A36]/25 cursor-pointer"
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
