import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Moon, Sun, LogOut, LogIn, Menu, X, User, Settings, ChevronDown } from 'lucide-react';

export default function Header({ currentView, onNavigate, isAuthenticated, handleAuthAction }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [isLight, setIsLight] = useState(false);
  
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    // Check initial theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      const isLightTheme = document.documentElement.classList.contains('light');
      setIsLight(isLightTheme);
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isLight;
    setIsLight(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
    window.dispatchEvent(new Event('themechange'));
  };

  const navLinks = [
    { id: 'dashboard', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
  ];

  const handleNavClick = (id) => {
    setIsMenuOpen(false);
    onNavigate(id);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <motion.header 
        className={`fixed top-0 w-full flex items-center justify-between px-6 lg:px-8 xl:px-16 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'h-20 lg:h-24 bg-[#050816]/80 light:bg-white/80 backdrop-blur-xl border-b border-white/5 light:border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.1)] light:shadow-[0_4px_20px_rgba(0,0,0,0.05)]' 
            : 'h-24 lg:h-28 bg-transparent border-b-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,174,239,0.4)]">
            <Video className="text-white light:text-slate-900 w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <span className="font-bold text-lg lg:text-xl tracking-wide text-white light:text-slate-900">
            WabiSeminar
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = currentView === link.id || (currentView === 'user-dashboard' && link.id === 'dashboard');
            return (
              <button 
                key={link.id}
                onClick={() => handleNavClick(link.id)} 
                className={`text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-purple-300 light:text-orange-600 bg-purple-600/20 light:bg-orange-500/10 px-6 py-2 rounded-full border border-purple-500/20 light:border-orange-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)] light:shadow-none' 
                    : 'text-[#94A3B8] light:text-slate-600 hover:text-white light:text-slate-900 light:hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button 
            onClick={toggleTheme}
            className="flex w-10 h-10 rounded-full border border-white/10 light:border-slate-200 items-center justify-center text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900 transition-colors hover:bg-white/5 light:hover:bg-slate-100 light:bg-slate-100 light:hover:bg-slate-100"
            title="Toggle theme"
          >
            {isLight ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isAuthenticated ? (
            <div className="relative">
              <button 
                className="flex items-center space-x-2 text-sm font-semibold text-white light:text-slate-900 bg-indigo-500/10 border border-indigo-500/20 light:border-indigo-500/30 px-4 py-2 lg:py-2.5 rounded-full hover:bg-indigo-500/20 light:hover:bg-indigo-500/10 transition-all"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold shadow-lg text-white light:text-slate-900">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{username}</span>
                <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-3 w-48 bg-[#0A0F24] light:bg-white border border-white/10 light:border-slate-200 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/5 light:border-slate-100 mb-1">
                      <p className="text-xs text-[#94A3B8] light:text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-white light:text-slate-900 truncate">{username}</p>
                    </div>
                    <button 
                      className="w-full px-4 py-2 text-sm text-left text-[#94A3B8] light:text-slate-600 hover:text-white light:text-slate-900 light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 light:bg-slate-100 light:hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      onClick={() => { setIsProfileOpen(false); handleNavClick('profile'); }}
                    >
                      <User size={16} /> Profile
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-sm text-left text-[#94A3B8] light:text-slate-600 hover:text-white light:text-slate-900 light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 light:bg-slate-100 light:hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      onClick={() => { setIsProfileOpen(false); handleNavClick('settings'); }}
                    >
                      <Settings size={16} /> Settings
                    </button>
                    <div className="h-px bg-white/5 light:bg-slate-100 my-1 w-full"></div>
                    <button 
                      className="w-full px-4 py-2 text-sm text-left text-rose-400 hover:text-rose-300 light:hover:text-rose-500 hover:bg-rose-500/10 light:hover:bg-rose-50 flex items-center gap-2 transition-colors"
                      onClick={() => { setIsProfileOpen(false); handleAuthAction(); }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          ) : (
            <button 
              className="flex items-center space-x-2 text-sm font-semibold text-white light:text-slate-900 bg-white/10 light:bg-slate-100 border border-white/10 light:border-slate-200 px-5 py-2 lg:py-2.5 rounded-full hover:bg-white/20 light:hover:bg-slate-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] light:shadow-sm"
              onClick={() => { setIsMenuOpen(false); handleAuthAction(); }}
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#050816]/95 light:bg-white/95 backdrop-blur-xl pt-24 px-6 pb-6 flex flex-col space-y-6 lg:hidden border-b border-white/10 light:border-slate-200">
          {navLinks.map((link) => {
            const isActive = currentView === link.id || (currentView === 'user-dashboard' && link.id === 'dashboard');
            return (
              <button 
                key={link.id}
                onClick={() => handleNavClick(link.id)} 
                className={`text-left text-lg font-medium ${isActive ? 'text-purple-400 light:text-orange-600 font-semibold' : 'text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900'}`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
