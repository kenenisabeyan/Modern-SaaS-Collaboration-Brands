import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Link, Calendar, Clock, Loader2, ArrowRight, Shield, Activity, Users, Copy, Trash2, X } from 'lucide-react';
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
        notify('error', response.status === 404 ? 'Room not found.' : response.message || 'Unable to join.');
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
    setTimeout(() => setCopiedId(null), 2000);
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
    <main className="flex-1 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 relative z-10 px-4 sm:px-6 lg:px-8 xl:px-16 w-full max-w-[1400px] mx-auto text-white light:text-slate-900">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight break-words">
            Welcome back, <span className="text-indigo-500">{username}</span>
          </h1>
          <p className="text-[#94A3B8] light:text-slate-600 text-sm sm:text-base lg:text-lg">Manage your masterclasses, join sessions, or review your history.</p>
        </div>
      </div>

      {/* Main Grid Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
        
        {/* Create Meeting Card (Col 1) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_10px_30px_-15px_rgba(99,102,241,0.2)] light:shadow-md hover:border-indigo-500/30 light:hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-5 sm:mb-6 border border-indigo-500/20">
              <Video size={24} className="sm:w-7 sm:h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Host a Session</h2>
            <p className="text-[#94A3B8] light:text-slate-600 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
              Generate a secure, end-to-end encrypted room instantly and invite your audience.
            </p>
          </div>
          <button 
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full py-3.5 sm:py-4 rounded-full font-bold bg-indigo-600 hover:bg-indigo-500 text-white light:text-slate-900 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {isCreating ? 'Creating...' : 'New Meeting'}
          </button>
        </motion.div>

        {/* Join Meeting Card (Col 2) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_10px_30px_-15px_rgba(243,112,33,0.2)] light:shadow-md hover:border-purple-500/30 light:hover:border-purple-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mb-5 sm:mb-6 border border-purple-500/20">
              <Link size={24} className="sm:w-7 sm:h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Join a Session</h2>
            <p className="text-[#94A3B8] light:text-slate-600 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
              Enter a valid Room ID or paste the invite link to securely join an existing masterclass.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="e.g. abc-defg-hij"
              className="w-full bg-white/5 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-full px-4 py-3 sm:py-3.5 text-sm text-white light:text-slate-900 placeholder-[#94A3B8] light:placeholder-slate-400 focus:border-purple-500/50 light:focus:border-purple-400 focus:ring-1 focus:ring-purple-500/50 light:focus:ring-purple-400 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button 
              onClick={handleJoinRoom}
              disabled={isJoining || !joinId.trim()}
              className="w-full py-3 sm:py-3.5 rounded-full font-bold bg-white/10 light:bg-slate-100 border border-white/10 light:border-slate-200 hover:bg-purple-500/20 light:hover:bg-purple-50 hover:border-purple-500/30 light:hover:border-purple-200 hover:text-purple-300 light:hover:text-purple-600 text-white light:text-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isJoining ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
              {isJoining ? 'Joining...' : 'Join Now'}
            </button>
          </div>
        </motion.div>

        {/* Stats Summary (Col 3) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-6"
        >
          <div className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-5 sm:p-6 flex items-center gap-4 sm:gap-6 hover:border-white/20 light:hover:border-slate-300 light:shadow-sm transition-all flex-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
              <Activity size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[#94A3B8] light:text-slate-500 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">Total Hosted</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold">{myRooms.length}</h3>
            </div>
          </div>
          
          <div className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-5 sm:p-6 flex items-center gap-4 sm:gap-6 hover:border-white/20 light:hover:border-slate-300 light:shadow-sm transition-all flex-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shrink-0">
              <Shield size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[#94A3B8] light:text-slate-500 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">Security Status</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-emerald-400 light:text-emerald-500 flex items-center gap-2">
                Protected <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* History Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5 sm:gap-3 text-white light:text-slate-900">
            <Clock size={22} className="text-indigo-400 light:text-indigo-600 sm:w-6 sm:h-6" />
            Meeting History
          </h2>
        </div>

        {isLoading ? (
          <div className="bg-[#0A0F24]/40 light:bg-slate-50 border border-white/5 light:border-slate-200 rounded-2xl sm:rounded-3xl p-10 sm:p-12 flex justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : myRooms.length > 0 ? (
          <div className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] overflow-hidden light:shadow-sm">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-50">
                    <th className="py-4 px-6 text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider">Room ID</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider">Created</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold text-[#94A3B8] light:text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 light:divide-slate-200">
                  {myRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-white/[0.02] light:hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-mono text-sm text-indigo-300 light:text-indigo-600 font-semibold">{room.roomId}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-white light:text-slate-700">
                          <Calendar size={14} className="text-[#94A3B8] light:text-slate-400" />
                          {new Date(room.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 light:bg-emerald-100 text-emerald-400 light:text-emerald-700 border border-emerald-500/20 light:border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleCopyLink(room.roomId)}
                            className="p-2 text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900 bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 rounded-lg transition-colors border border-white/5 light:border-slate-200"
                            title="Copy Invite Link"
                          >
                            <Copy size={16} className={copiedId === room.roomId ? "text-emerald-400 light:text-emerald-600" : ""} />
                          </button>
                          
                          <button 
                            onClick={() => onJoinRoom(room.roomId)}
                            className="text-sm font-semibold text-indigo-400 light:text-indigo-600 hover:text-indigo-300 light:hover:text-indigo-500 transition-colors bg-indigo-500/10 light:bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-500/20 light:border-indigo-200 hover:bg-indigo-500/20 light:hover:bg-indigo-100 flex items-center gap-2"
                          >
                            Rejoin
                          </button>
                          
                          <button 
                            onClick={() => setDeleteModalRoomId(room.roomId)}
                            className="p-2 text-rose-400 light:text-rose-600 hover:text-rose-300 light:hover:text-rose-500 bg-rose-500/10 light:bg-rose-50 hover:bg-rose-500/20 light:hover:bg-rose-100 rounded-lg transition-colors border border-rose-500/20 light:border-rose-200"
                            title="Delete Room"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-white/10 light:divide-slate-200">
              {myRooms.map((room) => (
                <div key={room.id} className="p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-indigo-300 light:text-indigo-600">
                      {room.roomId}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 light:bg-emerald-100 text-emerald-400 light:text-emerald-700 border border-emerald-500/20 light:border-emerald-200">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs text-[#94A3B8] light:text-slate-500 gap-1.5">
                    <Calendar size={13} />
                    <span>Created {new Date(room.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={() => onJoinRoom(room.roomId)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Rejoin Meeting</span>
                    </button>
                    <button 
                      onClick={() => handleCopyLink(room.roomId)}
                      className="p-2 rounded-xl text-[#94A3B8] light:text-slate-600 bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 hover:text-white transition-colors"
                      title="Copy Link"
                    >
                      <Copy size={16} className={copiedId === room.roomId ? "text-emerald-400" : ""} />
                    </button>
                    <button 
                      onClick={() => setDeleteModalRoomId(room.roomId)}
                      className="p-2 rounded-xl text-rose-400 bg-rose-500/10 light:bg-rose-50 border border-rose-500/20 light:border-rose-200 hover:bg-rose-500/20 transition-colors"
                      title="Delete Room"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="bg-[#0A0F24]/40 light:bg-slate-50 border border-dashed border-white/10 light:border-slate-300 rounded-2xl sm:rounded-[2rem] p-8 sm:p-16 text-center flex flex-col items-center">
            <Video size={40} className="text-slate-600 light:text-slate-400 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
            <p className="text-white light:text-slate-900 text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">No meetings yet</p>
            <p className="text-[#94A3B8] light:text-slate-500 text-xs sm:text-sm max-w-sm mb-5 sm:mb-6 leading-relaxed">You haven't hosted any masterclasses yet. Create your first secure meeting room to get started.</p>
            <button 
              onClick={handleCreateRoom}
              className="px-6 py-2.5 bg-white/10 light:bg-slate-200 hover:bg-white/15 light:hover:bg-slate-300 text-white light:text-slate-800 font-semibold rounded-full border border-white/10 light:border-slate-300 transition-colors text-sm"
            >
              Create First Room
            </button>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteModalRoomId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050816]/90 light:bg-white/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0A0F24] light:bg-white border border-white/10 light:border-slate-200 rounded-2xl sm:rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl relative mx-4">
            <button 
              onClick={() => !isDeleting && setDeleteModalRoomId(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900 transition-colors bg-white/5 light:bg-slate-100 p-2 rounded-full"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-500/10 light:bg-rose-50 flex items-center justify-center mb-5 sm:mb-6 border border-rose-500/20 light:border-rose-200">
              <Trash2 className="text-rose-400 light:text-rose-600" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white light:text-slate-900 mb-2">Delete Meeting Room?</h2>
            <p className="text-[#94A3B8] light:text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
              Are you sure you want to delete room <strong className="text-indigo-300 light:text-indigo-600">{deleteModalRoomId}</strong>? This action cannot be undone and any future participants will not be able to join.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <button 
                onClick={() => setDeleteModalRoomId(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full font-bold bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 text-white light:text-slate-700 transition-all disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full font-bold bg-rose-600 hover:bg-rose-500 text-white light:text-slate-900 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isDeleting ? 'Deleting...' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
