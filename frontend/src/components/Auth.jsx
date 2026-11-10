import { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Video, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';

export default function Auth({ onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isLogin && !username) {
      setError('Please enter a username.');
      return;
    }

    setIsLoading(true);
    
    try {
      let response;
      if (isLogin) {
        response = await api.login(email, password);
      } else {
        response = await api.register(username, email, password);
      }

      if (response.success) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user || response.data));
        }
        const userUsername = response.data.user?.username || response.data.username || username;
        localStorage.setItem('username', userUsername);
        setIsLoading(false);
        onNavigate('dashboard');
      } else {
        setError(response.message || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Connection error. The backend server might be unreachable.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const pathOnly = window.location.pathname || '/';
    const isMeetingPath = pathOnly.startsWith('/room/') || pathOnly.startsWith('/meeting/');
    const suffix = isMeetingPath ? `?returnTo=${encodeURIComponent(pathOnly)}` : '';
    window.location.href = `${API_BASE_URL}/auth/google${suffix}`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get('username');
    if (urlUsername) {
      localStorage.setItem('username', urlUsername);
    }
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.location.href = window.location.pathname;
    }
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center pt-20 sm:pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden bg-[#F5F7FA] min-h-[calc(100vh-80px)] font-sans text-[#1E2761]">
      
      <div className="w-full max-w-md p-6 sm:p-10 bg-white rounded-3xl border border-[#E4E8EE] shadow-[0_10px_35px_rgba(30,39,97,0.05)] flex flex-col items-center space-y-6 sm:space-y-7 z-10 relative">
        
        {/* Top Icon */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#1E2761] border border-[#151A44] flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-sm">
            <Video size={22} className="text-white" />
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#FF5A36] border-2 border-white rounded-full animate-pulse"></span>
        </div>

        <div className="text-center space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-[#1E2761] uppercase">
            WABISEMINAR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isLogin ? 'Sign in to manage and join masterclasses' : 'Create an account to host unlimited sessions'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm p-3 rounded-2xl text-center">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E2761] uppercase tracking-wider ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe" 
                className="w-full px-4 py-3 bg-slate-50 border border-[#E4E8EE] rounded-full text-[#1E2761] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E2761]/15 focus:border-[#1E2761] text-sm transition-all" 
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E2761] uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-[#E4E8EE] rounded-full text-[#1E2761] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E2761]/15 focus:border-[#1E2761] text-sm transition-all" 
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-[#1E2761] uppercase tracking-wider">Password</label>
              {isLogin && (
                <button type="button" className="text-xs font-semibold text-[#FF5A36] hover:underline transition-colors">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-[#E4E8EE] rounded-full text-[#1E2761] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E2761]/15 focus:border-[#1E2761] text-sm transition-all" 
                required
              />
            </div>
          </div>

          <div className="w-full pt-3 space-y-3.5">
            {/* 10% High Priority Action Button (Electric Coral #FF5A36) */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full font-bold text-white bg-[#FF5A36] hover:bg-[#E04826] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF5A36]/25 hover:shadow-xl hover:shadow-[#FF5A36]/35 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {isLogin && (
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E4E8EE]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400 font-semibold uppercase tracking-wider">Or continue with</span>
                </div>
              </div>
            )}

            {isLogin && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-[#E4E8EE] hover:border-[#1E2761]/40 hover:bg-slate-50 text-[#1E2761] py-3 rounded-full font-semibold transition-all shadow-sm cursor-pointer text-sm"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            )}

            <button 
              type="button"
              className="w-full pt-1 text-sm font-semibold text-[#1E2761] hover:text-[#FF5A36] hover:underline transition-colors cursor-pointer"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>

        <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
          <ShieldCheck size={14} className="text-[#FF5A36]" />
          <span>Protected with 256-bit SSL encryption</span>
        </div>

      </div>
    </div>
  );
}
