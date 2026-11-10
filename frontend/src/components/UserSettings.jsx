import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Bell, Lock, Video, Shield, Key, Loader2, 
  CheckCircle2, AlertCircle, ArrowLeft, Mic, MicOff, VideoOff, 
  Volume2, Sliders, Check
} from 'lucide-react';
import api from '../services/api.js';

export default function UserSettings({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('general');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLight, setIsLight] = useState(false);

  // Settings State persisted in localStorage
  const [hardwareAcc, setHardwareAcc] = useState(() => {
    const saved = localStorage.getItem('hardwareAcc');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [autoCopyLink, setAutoCopyLink] = useState(() => {
    const saved = localStorage.getItem('pref_autocopy');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [muteMicDefault, setMuteMicDefault] = useState(() => {
    const saved = localStorage.getItem('pref_mute_mic');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [muteCamDefault, setMuteCamDefault] = useState(() => {
    const saved = localStorage.getItem('pref_mute_cam');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [mirrorVideo, setMirrorVideo] = useState(() => {
    const saved = localStorage.getItem('pref_mirror_video');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [hdVideo, setHdVideo] = useState(() => {
    const saved = localStorage.getItem('pref_hd_video');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [soundJoin, setSoundJoin] = useState(() => {
    const saved = localStorage.getItem('pref_sound_join');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [chatSounds, setChatSounds] = useState(() => {
    const saved = localStorage.getItem('pref_chat_sounds');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
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
    localStorage.setItem('pref_autocopy', JSON.stringify(autoCopyLink));
  }, [autoCopyLink]);

  useEffect(() => {
    localStorage.setItem('pref_mute_mic', JSON.stringify(muteMicDefault));
  }, [muteMicDefault]);

  useEffect(() => {
    localStorage.setItem('pref_mute_cam', JSON.stringify(muteCamDefault));
  }, [muteCamDefault]);

  useEffect(() => {
    localStorage.setItem('pref_mirror_video', JSON.stringify(mirrorVideo));
  }, [mirrorVideo]);

  useEffect(() => {
    localStorage.setItem('pref_hd_video', JSON.stringify(hdVideo));
  }, [hdVideo]);

  useEffect(() => {
    localStorage.setItem('pref_sound_join', JSON.stringify(soundJoin));
  }, [soundJoin]);

  useEffect(() => {
    localStorage.setItem('pref_chat_sounds', JSON.stringify(chatSounds));
  }, [chatSounds]);

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
    { id: 'meetings', label: 'Meeting Defaults', icon: Video },
    { id: 'notifications', label: 'Audio & Alerts', icon: Bell },
    { id: 'security', label: 'Security & Auth', icon: Lock },
  ];

  return (
    <main className="flex-1 pt-20 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 w-full max-w-5xl mx-auto text-[#1E2761]">
      
      {/* Top Back Navigation */}
      <div className="mb-6">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#FF5A36] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E2761] mb-1.5">
          Account Settings
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Customize your meeting audio/video defaults, interface preferences, and password.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        
        {/* Settings Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 flex lg:flex-col overflow-x-auto gap-1.5 pb-2 lg:pb-0 scrollbar-none"
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
                className={`shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-left transition-all text-xs sm:text-sm cursor-pointer ${
                  isActive 
                    ? 'bg-[#1E2761] text-white shadow-md shadow-[#1E2761]/20' 
                    : 'text-slate-600 hover:bg-[#F5F7FA] hover:text-[#1E2761]'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content Panes */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-3 space-y-6"
        >
          <AnimatePresence mode="wait">
            
            {/* Tab 1: General Preferences */}
            {activeTab === 'general' && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1E2761] mb-6 flex items-center gap-2">
                    <Settings size={20} className="text-[#FF5A36]" />
                    <span>General Preferences</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Theme Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-2xl border border-[#E4E8EE] shadow-sm">
                      <div className="pr-4">
                        <h4 className="font-semibold text-sm text-[#1E2761]">Theme Mode</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Toggle between dark mode and light mode.</p>
                      </div>
                      <button 
                        onClick={toggleTheme} 
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${isLight ? 'bg-[#FF5A36]' : 'bg-[#1E2761]'}`}
                        aria-label="Toggle theme"
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isLight ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    {/* Hardware Acceleration */}
                    <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-2xl border border-[#E4E8EE] shadow-sm">
                      <div className="pr-4">
                        <h4 className="font-semibold text-sm text-[#1E2761]">Hardware Canvas Acceleration</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Optimizes graphics performance during whiteboard drawing sessions.</p>
                      </div>
                      <button 
                        onClick={() => setHardwareAcc(!hardwareAcc)} 
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${hardwareAcc ? 'bg-[#FF5A36]' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${hardwareAcc ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    {/* Auto-copy Room Links */}
                    <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-2xl border border-[#E4E8EE] shadow-sm">
                      <div className="pr-4">
                        <h4 className="font-semibold text-sm text-[#1E2761]">Auto-copy Invite Links</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Automatically copy the invite URL to your clipboard whenever you create a room.</p>
                      </div>
                      <button 
                        onClick={() => setAutoCopyLink(!autoCopyLink)} 
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${autoCopyLink ? 'bg-[#FF5A36]' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoCopyLink ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Meeting Defaults */}
            {activeTab === 'meetings' && (
              <motion.div 
                key="meetings"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 shadow-sm"
              >
                <h3 className="text-lg sm:text-xl font-bold text-[#1E2761] mb-6 flex items-center gap-2">
                  <Video size={20} className="text-[#FF5A36]" />
                  <span>Meeting Join Defaults</span>
                </h3>

                <div className="space-y-4">
                  {/* Default Mic Off */}
                  <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="pr-4">
                      <h4 className="font-semibold text-sm text-[#1E2761]">Start With Microphone Muted</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Always join rooms with your microphone initially muted.</p>
                    </div>
                    <button 
                      onClick={() => setMuteMicDefault(!muteMicDefault)} 
                      className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${muteMicDefault ? 'bg-[#FF5A36]' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${muteMicDefault ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>

                  {/* Default Camera Off */}
                  <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="pr-4">
                      <h4 className="font-semibold text-sm text-[#1E2761]">Start With Camera Turned Off</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Keep your video disabled until you choose to turn it on inside the room.</p>
                    </div>
                    <button 
                      onClick={() => setMuteCamDefault(!muteCamDefault)} 
                      className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${muteCamDefault ? 'bg-[#FF5A36]' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${muteCamDefault ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>

                  {/* Mirror Video */}
                  <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="pr-4">
                      <h4 className="font-semibold text-sm text-[#1E2761]">Mirror Self Video</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Mirror your own video preview so it appears like looking in a mirror.</p>
                    </div>
                    <button 
                      onClick={() => setMirrorVideo(!mirrorVideo)} 
                      className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${mirrorVideo ? 'bg-[#FF5A36]' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${mirrorVideo ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>

                  {/* HD Video */}
                  <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="pr-4">
                      <h4 className="font-semibold text-sm text-[#1E2761]">High Definition (HD) Video</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Broadcast video in high-clarity 720p/1080p when bandwidth permits.</p>
                    </div>
                    <button 
                      onClick={() => setHdVideo(!hdVideo)} 
                      className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${hdVideo ? 'bg-[#FF5A36]' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${hdVideo ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Audio & Alerts */}
            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 shadow-sm"
              >
                <h3 className="text-lg sm:text-xl font-bold text-[#1E2761] mb-6 flex items-center gap-2">
                  <Volume2 size={20} className="text-[#FF5A36]" />
                  <span>Audio & Notification Alerts</span>
                </h3>

                <div className="space-y-4">
                  {/* Join Sound */}
                  <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="pr-4">
                      <h4 className="font-semibold text-sm text-[#1E2761]">Play Chime on Participant Join</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Play a subtle sound when new attendees join the meeting room.</p>
                    </div>
                    <button 
                      onClick={() => setSoundJoin(!soundJoin)} 
                      className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${soundJoin ? 'bg-[#FF5A36]' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${soundJoin ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>

                  {/* Chat Notification Sound */}
                  <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-2xl border border-[#E4E8EE] shadow-sm">
                    <div className="pr-4">
                      <h4 className="font-semibold text-sm text-[#1E2761]">In-Room Chat Sound Alerts</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Play a quiet audio tone when a new chat message arrives during a call.</p>
                    </div>
                    <button 
                      onClick={() => setChatSounds(!chatSounds)} 
                      className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${chatSounds ? 'bg-[#FF5A36]' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${chatSounds ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 4: Security & Password */}
            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 shadow-sm"
              >
                <h3 className="text-lg sm:text-xl font-bold text-[#1E2761] mb-6 flex items-center gap-2">
                  <Key size={20} className="text-[#FF5A36]" />
                  <span>Update Password</span>
                </h3>
                
                {message && (
                  <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-[#FF5A36]/10 border-[#FF5A36]/20 text-[#FF5A36]'}`}>
                    {message.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#FF5A36]" />}
                    <p className="text-xs sm:text-sm font-medium">{message.text}</p>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl px-4 py-3 text-sm text-[#1E2761] focus:bg-white focus:border-[#1E2761] focus:ring-2 focus:ring-[#1E2761]/15 outline-none transition-all shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                      className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl px-4 py-3 text-sm text-[#1E2761] focus:bg-white focus:border-[#1E2761] focus:ring-2 focus:ring-[#1E2761]/15 outline-none transition-all shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat new password"
                      className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl px-4 py-3 text-sm text-[#1E2761] focus:bg-white focus:border-[#1E2761] focus:ring-2 focus:ring-[#1E2761]/15 outline-none transition-all shadow-sm" 
                    />
                  </div>
                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-7 py-3 rounded-2xl font-semibold bg-[#FF5A36] hover:bg-[#E04826] text-white transition-all shadow-md shadow-[#FF5A36]/20 disabled:opacity-70 flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin text-white" /> : null}
                      <span className="text-white">{isLoading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
