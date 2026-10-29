import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Bell, Lock, Video, Shield, Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api.js';

export default function UserSettings({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('general');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLight, setIsLight] = useState(false);
  const [hardwareAcc, setHardwareAcc] = useState(() => {
    const saved = localStorage.getItem('hardwareAcc');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    // Check initial theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || document.documentElement.classList.contains('light')) {
      setIsLight(true);
      document.documentElement.classList.add('light');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hardwareAcc', JSON.stringify(hardwareAcc));
  }, [hardwareAcc]);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match.' });
    }
    if (newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await api.changePassword(token, currentPassword, newPassword);
      if (res.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update password.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'meetings', label: 'Meeting Defaults', icon: Video },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <main className="flex-1 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 relative z-10 px-4 sm:px-6 lg:px-8 xl:px-16 w-full max-w-[1400px] mx-auto text-white light:text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-1.5 sm:mb-2 tracking-tight text-white light:text-slate-900">
            Account Settings
          </h1>
          <p className="text-[#94A3B8] light:text-slate-600 text-sm sm:text-base md:text-lg">Manage your preferences, security, and notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 flex lg:flex-col overflow-x-auto gap-2 pb-2 lg:pb-0 scrollbar-none"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage(null);
                }} 
                className={`shrink-0 lg:w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full font-semibold border text-left transition-colors text-xs sm:text-sm ${
                  isActive 
                  ? 'bg-indigo-500/10 light:bg-indigo-500/5 text-indigo-400 light:text-indigo-600 border-indigo-500/20 light:border-indigo-500/30' 
                  : 'text-[#94A3B8] light:text-slate-500 hover:bg-white/5 light:hover:bg-slate-100 hover:text-white light:text-slate-900 border-transparent'
                }`}
              >
                <Icon size={16} className="sm:w-[18px] sm:h-[18px]" /> {tab.label}
              </button>
            );
          })}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-6 sm:space-y-8"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 light:shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 flex items-center gap-2 text-white light:text-slate-900">
                    <Settings className="text-indigo-400 light:text-indigo-600" /> General Preferences
                  </h3>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 light:bg-slate-50 rounded-2xl border border-white/5 light:border-slate-200">
                      <div className="pr-3">
                        <h4 className="font-semibold text-sm sm:text-base text-white light:text-slate-900">Theme Mode</h4>
                        <p className="text-xs sm:text-sm text-[#94A3B8] light:text-slate-500">Toggle between dark mode and light mode.</p>
                      </div>
                      <div onClick={toggleTheme} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.5)] light:shadow-none transition-colors shrink-0 ${!isLight ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${!isLight ? 'right-1' : 'right-7'}`}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 light:bg-slate-50 rounded-2xl border border-white/5 light:border-slate-200">
                      <div className="pr-3">
                        <h4 className="font-semibold text-sm sm:text-base text-white light:text-slate-900">Hardware Acceleration</h4>
                        <p className="text-xs sm:text-sm text-[#94A3B8] light:text-slate-500">Improves video performance during masterclasses.</p>
                      </div>
                      <div onClick={() => setHardwareAcc(!hardwareAcc)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.5)] light:shadow-none transition-colors shrink-0 ${hardwareAcc ? 'bg-indigo-500' : 'bg-slate-500 light:bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${hardwareAcc ? 'right-1' : 'right-7'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 light:shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-rose-400 light:text-rose-500">
                    <Shield className="text-rose-400 light:text-rose-500" /> Danger Zone
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] light:text-slate-500 mb-5 sm:mb-6 leading-relaxed">Permanently delete your account and all associated meeting history. This action cannot be undone.</p>
                  <button onClick={() => { if(window.confirm('Are you sure you want to delete your account?')) onNavigate('dashboard'); }} className="w-full sm:w-auto px-6 py-2.5 rounded-full font-bold bg-rose-500/10 light:bg-rose-50 text-rose-400 light:text-rose-500 border border-rose-500/20 light:border-rose-200 hover:bg-rose-500/20 light:hover:bg-rose-100 transition-all text-sm sm:text-base">
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 light:shadow-sm"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 flex items-center gap-2 text-white light:text-slate-900">
                  <Key className="text-indigo-400 light:text-indigo-600" /> Change Password
                </h3>
                
                {message && (
                  <div className={`p-3.5 sm:p-4 rounded-xl mb-5 sm:mb-6 flex items-start gap-2.5 sm:gap-3 border ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    {message.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="shrink-0 mt-0.5" />}
                    <p className="text-xs sm:text-sm font-medium">{message.text}</p>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-6 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider block mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full bg-[#050816]/60 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-full px-4 py-2.5 sm:py-3 text-sm text-white light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 light:focus:ring-indigo-400 focus:border-indigo-500/50 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider block mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full bg-[#050816]/60 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-full px-4 py-2.5 sm:py-3 text-sm text-white light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 light:focus:ring-indigo-400 focus:border-indigo-500/50 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider block mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-[#050816]/60 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-full px-4 py-2.5 sm:py-3 text-sm text-white light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 light:focus:ring-indigo-400 focus:border-indigo-500/50 transition-all" 
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-3 rounded-full font-bold bg-indigo-600 hover:bg-indigo-500 text-white light:text-slate-900 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-70 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {(activeTab === 'meetings' || activeTab === 'notifications') && (
              <motion.div 
                key="other"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] p-8 sm:p-12 text-center light:shadow-sm"
              >
                <Bell size={40} className="mx-auto text-slate-600 light:text-slate-300 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
                <h3 className="text-lg sm:text-xl font-bold text-white light:text-slate-900 mb-1 sm:mb-2">Coming Soon</h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] light:text-slate-500">These settings will be available in the next platform update.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
