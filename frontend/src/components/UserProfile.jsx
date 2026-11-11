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
    <main className="flex-1 pt-20 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 w-full max-w-5xl mx-auto text-[#1E2761]">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#FF5A36] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        {isSaved && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20 text-xs font-semibold"
          >
            <Check size={13} />
            <span>Profile Updated!</span>
          </motion.div>
        )}
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E2761] mb-1.5">
          User Profile
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
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
          <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 text-center shadow-sm relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-[#1E2761] text-white flex items-center justify-center text-3xl sm:text-4xl font-extrabold mb-4 shadow-lg shadow-[#1E2761]/20">
              {username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E2761] mb-1 truncate">{username}</h2>
            <p className="text-xs sm:text-sm text-slate-500 truncate mb-3">{email || `${username.toLowerCase()}@wabiseminar.com`}</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A36]/10 text-[#FF5A36] text-xs font-semibold border border-[#FF5A36]/20 mb-6">
              <ShieldCheck size={14} className="text-[#FF5A36]" />
              <span>Verified Account</span>
            </div>

            <div className="w-full h-px bg-[#E4E8EE] mb-6"></div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE] shadow-sm">
                <p className="text-2xl font-extrabold text-[#1E2761]">{roomCount}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Rooms Created</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE] shadow-sm">
                <p className="text-2xl font-extrabold text-[#FF5A36]">Pro</p>
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
          <div className="bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#1E2761] flex items-center gap-2">
                <User size={20} className="text-[#FF5A36]" />
                <span>Account Information</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F7FA] hover:bg-[#E4E8EE] text-[#1E2761] border border-[#E4E8EE] transition-colors cursor-pointer shadow-sm"
              >
                <Edit3 size={14} className="text-[#1E2761]" />
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
                    className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl px-4 py-3 text-sm text-[#1E2761] focus:bg-white focus:border-[#1E2761] focus:ring-2 focus:ring-[#1E2761]/15 outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Email Address (Read-only)</label>
                  <input 
                    type="email" 
                    value={email || `${username.toLowerCase()}@wabiseminar.com`}
                    disabled
                    className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed opacity-80 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Bio / About You</label>
                  <textarea 
                    rows="3" 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell your attendees about yourself..."
                    className="w-full bg-[#F5F7FA] border border-[#E4E8EE] rounded-2xl px-4 py-3 text-sm text-[#1E2761] focus:bg-white focus:border-[#1E2761] focus:ring-2 focus:ring-[#1E2761]/15 outline-none transition-all resize-none shadow-sm"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-white hover:bg-[#F5F7FA] text-slate-700 text-sm border border-[#E4E8EE] transition-colors cursor-pointer shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-semibold bg-[#FF5A36] hover:bg-[#E04826] text-white text-sm shadow-md shadow-[#FF5A36]/20 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE] shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Username</p>
                    <p className="text-sm font-bold text-[#1E2761]">{username}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE] shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-bold text-[#1E2761] truncate">{email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-[#E4E8EE] shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bio</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{bio}</p>
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
