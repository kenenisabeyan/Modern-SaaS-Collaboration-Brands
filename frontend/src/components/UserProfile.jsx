import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, Edit3 } from 'lucide-react';

export default function UserProfile({ onNavigate }) {
  const username = localStorage.getItem('username') || 'User';

  return (
    <main className="flex-1 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 relative z-10 px-4 sm:px-6 lg:px-8 xl:px-16 w-full max-w-[1400px] mx-auto text-white light:text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-1.5 sm:mb-2 tracking-tight">
            User Profile
          </h1>
          <p className="text-[#94A3B8] light:text-slate-600 text-sm sm:text-base md:text-lg">Manage your personal information and presence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(99,102,241,0.2)] light:shadow-md text-center relative">
            <button 
              onClick={() => onNavigate('settings')}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 flex items-center justify-center text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 hover:bg-white/10 transition-colors"
            >
              <Edit3 size={16} />
            </button>
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-indigo-500 p-[2px] mb-4 sm:mb-6 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
              <div className="w-full h-full rounded-full bg-[#050816] light:bg-white flex items-center justify-center text-3xl sm:text-4xl font-bold text-white light:text-slate-900">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">{username}</h2>
            <p className="text-emerald-400 light:text-emerald-600 text-xs sm:text-sm font-semibold mb-5 sm:mb-6 flex items-center justify-center gap-2">
              <Shield size={14} /> Verified Account
            </p>
            <div className="w-full h-px bg-white/10 light:bg-slate-200 mb-5 sm:mb-6"></div>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900">12</p>
                <p className="text-[10px] sm:text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider">Meetings</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900">84</p>
                <p className="text-[10px] sm:text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider">Hours</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6 sm:space-y-8"
        >
          <div className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 light:shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 flex items-center gap-2 text-white light:text-slate-900">
              <User className="text-indigo-400 light:text-indigo-600" /> Personal Information
            </h3>
            <div className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider block mb-2">Username</label>
                  <input type="text" defaultValue={username} className="w-full bg-[#050816]/60 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-full px-4 py-2.5 sm:py-3 text-sm text-white light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 light:focus:ring-indigo-400 focus:border-indigo-500/50 light:focus:border-indigo-400 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider block mb-2">Email Address</label>
                  <input type="email" defaultValue={`${username.toLowerCase()}@example.com`} className="w-full bg-[#050816]/60 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-full px-4 py-2.5 sm:py-3 text-sm text-white light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 light:focus:ring-indigo-400 focus:border-indigo-500/50 light:focus:border-indigo-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider block mb-2">Bio</label>
                <textarea rows="3" placeholder="Tell us about yourself..." className="w-full bg-[#050816]/60 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-2xl px-4 py-3 text-sm text-white light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 light:focus:ring-indigo-400 focus:border-indigo-500/50 light:focus:border-indigo-400 transition-all resize-none"></textarea>
              </div>
              <div className="flex justify-end pt-2 sm:pt-4">
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-full font-bold bg-indigo-600 hover:bg-indigo-500 text-white light:text-slate-900 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
