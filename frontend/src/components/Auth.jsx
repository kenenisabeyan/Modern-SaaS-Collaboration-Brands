import { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Video, Loader2 } from 'lucide-react';
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
    const username = urlParams.get('username');
    if (username) {
      localStorage.setItem('username', username);
    }
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.location.href = window.location.pathname;
    }
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-[#050816] light:bg-[#FAFAFA] min-h-screen font-sans text-white light:text-slate-900">
      {/* Background Glow Effects */}
      <div className="absolute bg-purple-600/15 blur-[120px] w-[600px] h-[600px] rounded-full top-[-10%] left-[-10%] pointer-events-none"></div>
      <div className="absolute bg-blue-600/10 blur-[120px] w-[500px] h-[500px] rounded-full bottom-[-10%] right-[-10%] pointer-events-none"></div>

      <div className="premium-card w-full max-w-md p-10 flex flex-col items-center space-y-8 z-10 relative">
        
        {/* Floating Accent */}
        <div className="absolute top-4 right-4 w-10 h-10 bg-[#050816] light:bg-slate-50 border border-purple-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)] z-20">
          <Lock size={18} className="text-indigo-300" />
        </div>

        {/* Logo/Icon */}
        <div className="w-16 h-16 rounded-full bg-indigo-500 p-[1px] shadow-[0_10px_20px_-10px_rgba(0,174,239,0.6)]">
          <div className="w-full h-full bg-[#0A0F24] light:bg-white rounded-[15px] flex items-center justify-center">
            <Video className="text-indigo-400" size={32} />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white light:text-slate-900">WabiSeminar Live</h1>
          <p className="text-sm text-slate-400 light:text-slate-500">
            {isLogin ? 'Sign in to your account to continue' : 'Create an account to get started'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-full text-center">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2 group">
              <label className="text-xs font-semibold text-slate-300 light:text-slate-600 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe" 
                  className="premium-input pl-4" 
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-300 light:text-slate-600 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 light:text-slate-400 group-focus-within:text-indigo-400 light:group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                className="premium-input pl-11" 
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 group">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-slate-300 light:text-slate-600 uppercase tracking-wider">Password</label>
              {isLogin && (
                <button type="button" className="text-xs font-medium text-indigo-400 light:text-indigo-600 hover:text-indigo-300 light:hover:text-indigo-500 transition-colors">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 light:text-slate-400 group-focus-within:text-indigo-400 light:group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="premium-input pl-11" 
                required
              />
            </div>
          </div>

          <div className="w-full pt-4 space-y-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="premium-btn premium-btn-brand w-full group disabled:opacity-70 disabled:cursor-not-allowed py-3.5 text-base shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-3" size={20} />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </button>

            {isLogin && (
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10 light:border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0A0F24] light:bg-white text-[#94A3B8] light:text-slate-500 font-medium rounded-full border border-white/5 light:border-slate-200">Or continue with</span>
                </div>
              </div>
            )}

            {isLogin && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-[#0A0F24]/60 light:bg-white border border-white/10 light:border-slate-200 hover:bg-white/5 light:hover:bg-slate-100 light:bg-slate-100 light:hover:bg-slate-50 text-white light:text-slate-900 py-3.5 rounded-full font-semibold transition-all shadow-lg light:shadow-sm hover:shadow-xl light:hover:shadow-md backdrop-blur-md light:backdrop-blur-none"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>
            )}

            <button 
              type="button"
              className="w-full pt-2 text-sm font-medium text-slate-400 light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900 transition-colors"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


