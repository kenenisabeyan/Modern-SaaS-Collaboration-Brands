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
        className={`fixed top-0 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-16 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'h-16 sm:h-20 bg-white/90 dark:bg-[#050816]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-sm' 
            : 'h-18 sm:h-22 bg-transparent border-b-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div 
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none" 
          onClick={() => handleNavClick('dashboard')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Video className="text-white w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
            WabiSeminar
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center space-x-1.5 bg-slate-100/70 dark:bg-white/5 p-1 rounded-full border border-slate-200/60 dark:border-white/10">
          {navLinks.map((link) => {
            const isActive = currentView === link.id || (currentView === 'user-dashboard' && link.id === 'dashboard');
            return (
              <button 
                key={link.id}
                onClick={() => handleNavClick(link.id)} 
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  isActive 
                    ? 'text-indigo-600 dark:text-white bg-white dark:bg-indigo-600 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <button 
            onClick={toggleTheme}
            className="flex w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border border-slate-200 dark:border-white/10 items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer shadow-sm"
            title="Toggle color theme"
          >
            {isLight ? <Sun size={17} className="text-amber-500" /> : <Moon size={17} />}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button 
                className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm cursor-pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{username}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-[#0A0F24] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5 mb-1">
                      <p className="text-[11px] font-medium text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{username}</p>
                    </div>
                    <button 
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
                      onClick={() => { setIsProfileOpen(false); handleNavClick('profile'); }}
                    >
                      <User size={15} /> Profile
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
                      onClick={() => { setIsProfileOpen(false); handleNavClick('settings'); }}
                    >
                      <Settings size={15} /> Settings
                    </button>
                    <div className="h-px bg-slate-100 dark:border-white/5 my-1 w-full"></div>
                    <button 
                      className="w-full px-4 py-2 text-xs sm:text-sm text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                      onClick={() => { setIsProfileOpen(false); handleAuthAction(); }}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          ) : (
            <button 
              className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 sm:px-5 py-2 rounded-2xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              onClick={() => { setIsMenuOpen(false); handleAuthAction(); }}
            >
              <LogIn size={15} className="text-white" />
              <span className="text-white">Sign In</span>
            </button>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl border border-slate-200 dark:border-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-white dark:bg-[#050816] px-5 pt-4 pb-8 flex flex-col space-y-2 lg:hidden border-b border-slate-200 dark:border-white/10 shadow-2xl max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
            {/* Authenticated User Snapshot in Mobile Menu */}
            {isAuthenticated && (
              <div className="p-3.5 mb-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{username}</p>
                    <p className="text-xs text-slate-500">Active Account</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => { setIsMenuOpen(false); handleNavClick('profile'); }}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    title="Profile"
                  >
                    <User size={18} />
                  </button>
                  <button 
                    onClick={() => { setIsMenuOpen(false); handleNavClick('settings'); }}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    title="Settings"
                  >
                    <Settings size={18} />
                  </button>
                  <button 
                    onClick={() => { setIsMenuOpen(false); handleAuthAction(); }}
                    className="p-2 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation items */}
            {navLinks.map((link) => {
              const isActive = currentView === link.id || (currentView === 'user-dashboard' && link.id === 'dashboard');
              return (
                <button 
                  key={link.id}
                  onClick={() => handleNavClick(link.id)} 
                  className={`text-left text-sm font-semibold py-2.5 px-3 rounded-xl transition-all ${
                    isActive 
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 font-bold border border-indigo-200/60 dark:border-indigo-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {!isAuthenticated && (
              <div className="pt-2">
                <button
                  onClick={() => { setIsMenuOpen(false); handleAuthAction(); }}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <LogIn size={18} />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </>
  );
}
