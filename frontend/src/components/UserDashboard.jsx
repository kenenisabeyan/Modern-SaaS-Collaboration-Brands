import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Link as LinkIcon, Calendar, Clock, Loader2, ArrowRight, ShieldCheck, Zap, Users, Copy, Check, Trash2, X, Sparkles } from 'lucide-react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';

export default function UserDashboard({ onNavigate, onJoinRoom, notify }) {
  const [myRooms, setMyRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [username, setUsername] = useState('User');
  const [deleteModalRoomId, setDeleteModalRoomId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const createInFlightRef = useRef(false);

  useEffect(() => {
    setUsername(localStorage.getItem('username') || 'User');
    const loadRooms = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.getUserRooms(token);
          if (response.success && response.data) {
            setMyRooms(response.data);
          } else {
            notify('error', response.message || 'Failed to load your meetings history.');
          }
        }
      } catch (error) {
        console.error('Dashboard loadRooms error:', error);
        notify('error', 'Connection error. The backend server might be down.');
      } finally {
        setIsLoading(false);
      }
    };
    loadRooms();
    window.scrollTo(0, 0);
  }, []);

  const extractRoomId = (value) => {
    const raw = value.trim();
    if (!raw) return '';
    try {
      const url = raw.startsWith('http') ? new URL(raw) : null;
      if (url) return roomIdFromPathname(url.pathname) || '';
    } catch { /* empty */ }
    if (raw.includes('/')) {
      const fromPath = roomIdFromPathname(raw.startsWith('/') ? raw : `/${raw}`);
      if (fromPath) return fromPath;
    }
    return raw.split('?')[0].replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  };

  const handleCreateRoom = async () => {
    if (createInFlightRef.current) return;
    createInFlightRef.current = true;
    setIsCreating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.createRoom(token);
      
      if (!response.success || !response.data?.roomId) {
        notify('error', response.message || 'Failed to create room.');
        return;
      }

      notify('success', 'Meeting created successfully!');
      onJoinRoom(response.data.roomId);
    } catch (error) {
      console.error('Dashboard handleCreateRoom error:', error);
      notify('error', 'Connection error. Please check your internet or if the server is running.');
    } finally {
      setIsCreating(false);
      createInFlightRef.current = false;
    }
  };

  const handleJoinRoom = async () => {
    const id = extractRoomId(joinId);
    if (!id || isJoining) return;
    setIsJoining(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.getRoom(token, id);
      if (!response.success) {
        notify('error', response.status === 404 ? 'Room not found. Please check the code.' : response.message || 'Unable to join.');
        return;
      }
      notify('success', 'Joining meeting...');
      onJoinRoom(id);
    } catch (error) {
      notify('error', 'Connection error. Unable to reach the server.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyLink = (roomId) => {
    const link = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(roomId);
    notify('success', 'Invite link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteRoom = async () => {
    if (!deleteModalRoomId || isDeleting) return;
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.deleteRoom(token, deleteModalRoomId);
      
      if (!response.success) {
        notify('error', response.message || 'Failed to delete room.');
        return;
      }
      
      notify('success', 'Meeting room deleted.');
      setMyRooms(prev => prev.filter(r => r.roomId !== deleteModalRoomId));
    } catch (error) {
      notify('error', 'Network error while deleting.');
    } finally {
      setIsDeleting(false);
      setDeleteModalRoomId(null);
    }
  };

  return (
    <main className="flex-1 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto text-slate-900 dark:text-white">
      
      {/* Friendly Welcome Header */}
      <div className="mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles size={13} className="text-indigo-500" />
          <span>Real-time Video & Collaboration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
          Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{username}</span> 👋
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
          Start an instant collaborative meeting, join with an invite code, or manage your recent rooms.
        </p>

        {/* Quick Indicators Bar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
            <Zap size={13} className="text-amber-500" />
            <span>Sub-50ms Latency</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
            <Users size={13} className="text-indigo-500" />
            <span>{myRooms.length} {myRooms.length === 1 ? 'Meeting' : 'Meetings'} Created</span>
          </div>
        </div>
      </div>

      {/* 2-Column Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-12 sm:mb-16">
        
        {/* Card 1: Start Meeting */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0A0F24]/80 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md dark:shadow-none transition-all flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60"></div>
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-5 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              <Video size={26} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Host a Meeting</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Create an instant seminar room with live video, collaborative drawing canvas, and real-time chat.
            </p>
          </div>
          <button 
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
          >
            {isCreating ? <Loader2 className="animate-spin text-white" size={19} /> : <Plus size={19} className="text-white" />}
            <span className="text-white">{isCreating ? 'Creating Room...' : 'Start Instant Meeting'}</span>
          </button>
        </motion.div>

        {/* Card 2: Join Meeting */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white dark:bg-[#0A0F24]/80 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md dark:shadow-none transition-all flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60"></div>
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-5 border border-purple-100 dark:border-purple-500/20 shadow-sm">
              <LinkIcon size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Join a Meeting</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Enter an invite code or paste the full meeting link to jump straight into an active session.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="Enter room code or link..."
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-[#0A0F24] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
            </div>
            <button 
              onClick={handleJoinRoom}
              disabled={isJoining || !joinId.trim()}
              className="py-3.5 px-6 rounded-2xl font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 active:scale-[0.99] text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shrink-0 cursor-pointer"
            >
              {isJoining ? <Loader2 className="animate-spin text-white" size={18} /> : <ArrowRight size={18} className="text-white" />}
              <span className="text-white">{isJoining ? 'Joining...' : 'Join'}</span>
            </button>
          </div>
        </motion.div>

      </div>

      {/* Recent Meetings Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Clock size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Recent Meetings</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
              {myRooms.length}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-[#0A0F24]/60 border border-slate-200 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={30} />
            <p className="text-xs text-slate-500">Loading your meetings...</p>
          </div>
        ) : myRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRooms.map((room) => (
              <div 
                key={room.id}
                className="bg-white dark:bg-[#0A0F24]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                      {room.roomId}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar size={13} />
                    <span>Created {new Date(room.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                  <button 
                    onClick={() => onJoinRoom(room.roomId)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Video size={14} className="text-white" />
                    <span className="text-white">Rejoin</span>
                  </button>

                  <button 
                    onClick={() => handleCopyLink(room.roomId)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                    title="Copy invite link"
                  >
                    {copiedId === room.roomId ? (
                      <Check size={15} className="text-emerald-500" />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>

                  <button 
                    onClick={() => setDeleteModalRoomId(room.roomId)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-colors cursor-pointer"
                    title="Delete meeting"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0A0F24]/50 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-3">
              <Video size={28} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">No meetings yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mb-5 leading-relaxed">
              You haven't created any sessions yet. Click "Start Instant Meeting" above to host your first room.
            </p>
            <button 
              onClick={handleCreateRoom}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
            >
              Start First Meeting
            </button>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteModalRoomId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0F24] border border-slate-200 dark:border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => !isDeleting && setDeleteModalRoomId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full bg-slate-100 dark:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-500/20">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">Delete Meeting?</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Are you sure you want to delete room <strong className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{deleteModalRoomId}</strong>? Participants will no longer be able to join.
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setDeleteModalRoomId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors text-xs sm:text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex justify-center items-center gap-1.5 text-xs sm:text-sm shadow-md cursor-pointer"
              >
                {isDeleting ? <Loader2 size={15} className="animate-spin text-white" /> : null}
                <span className="text-white">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
