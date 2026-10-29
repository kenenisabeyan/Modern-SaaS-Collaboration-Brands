import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, ShieldCheck, Edit3, ArrowLeft, Check, Sparkles, Video, Clock } from 'lucide-react';
import api from '../services/api.js';

export default function UserProfile({ onNavigate }) {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState(() => localStorage.getItem('user_bio') || 'Passionate about real-time collaboration and online masterclasses.');
  const [createdAt, setCreatedAt] = useState(null);
  const [roomCount, setRoomCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(username);
  const [editBio, setEditBio] = useState(bio);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.username) {
          setUsername(parsed.username);
          setEditUsername(parsed.username);
        }
        if (parsed.createdAt) setCreatedAt(parsed.createdAt);
      } catch (e) {
        console.error('Failed to parse user cache:', e);
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      api.getMe(token).then((res) => {
        if (res.success && res.data) {
          if (res.data.email) setEmail(res.data.email);
          if (res.data.username) {
            setUsername(res.data.username);
            setEditUsername(res.data.username);
            localStorage.setItem('username', res.data.username);
          }
          if (res.data.createdAt) setCreatedAt(res.data.createdAt);
        }
      }).catch(console.error);

      api.getUserRooms(token).then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setRoomCount(res.data.length);
        }
      }).catch(console.error);
    }
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const trimmed = editUsername.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    setBio(editBio);
    localStorage.setItem('username', trimmed);
    localStorage.setItem('user_bio', editBio);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <main className="flex-1 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 w-full max-w-5xl mx-auto text-slate-900 dark:text-white">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        {isSaved && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold"
          >
            <Check size={13} />
            <span>Profile Updated!</span>
          </motion.div>
        )}
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5">
          User Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Manage your personal information, presence, and session statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Avatar & Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-[#0A0F24]/80 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-sm relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-3xl sm:text-4xl font-extrabold mb-4 shadow-lg shadow-indigo-600/20">
              {username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 truncate">{username}</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mb-3">{email || `${username.toLowerCase()}@wabiseminar.com`}</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-500/20 mb-6">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Verified Account</span>
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-white/10 mb-6"></div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{roomCount}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Rooms Created</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Pro</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Tier Plan</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Profile Form / Edit */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-[#0A0F24]/80 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                <span>Account Information</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <Edit3 size={14} />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Username</label>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#0A0F24] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Email Address (Read-only)</label>
                  <input 
                    type="email" 
                    value={email || `${username.toLowerCase()}@wabiseminar.com`}
                    disabled
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed opacity-80"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Bio / About You</label>
                  <textarea 
                    rows="3" 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell your attendees about yourself..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#0A0F24] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white text-sm shadow-md transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Username</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{username}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bio</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{bio}</p>
                </div>

                {createdAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                    <Calendar size={14} />
                    <span>Member since {new Date(createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
