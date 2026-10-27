import { useState, useEffect, useCallback, useRef } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MeetingRoom from './components/MeetingRoom';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import { roomIdFromPathname } from './routeUtils.js';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/ui/PageTransition';
import ParticleBackground from './components/ui/ParticleBackground';
import Header from './components/ui/Header';
import Footer from './components/ui/Footer';
import UserDashboard from './components/UserDashboard';
import UserProfile from './components/UserProfile';
import UserSettings from './components/UserSettings';

function readRouteSnapshot() {
  const roomId = roomIdFromPathname(window.location.pathname);
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const authed = Boolean(token && username);

  if (roomId) {
    return {
      currentRoomId: roomId,
      currentView: authed ? 'meeting' : 'auth',
    };
  }

  return {
    currentRoomId: '',
    currentView: 'dashboard', // Always show dashboard as landing page
  };
}

function App() {
  const [routeState, setRouteState] = useState(readRouteSnapshot);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const { currentView, currentRoomId } = routeState;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, [currentView]); // Re-check on view changes

  const handleAuthAction = () => {
    if (isAuthenticated) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      notify('success', 'Logged out successfully');
      setCurrentView('dashboard');
    } else {
      setCurrentView('auth');
    }
  };

  const setCurrentView = (currentView) => {
    setRouteState((prev) => ({ ...prev, currentView }));
  };

  const syncRouteFromLocation = useCallback(() => {
    setRouteState(readRouteSnapshot());
  }, []);

  useEffect(() => {
    const onPop = () => syncRouteFromLocation();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [syncRouteFromLocation]);

  const navigateToRoom = (roomId) => {
    setRouteState({ currentRoomId: roomId, currentView: 'meeting' });
    window.history.pushState({}, '', `/meeting/${roomId}`);
  };

  const leaveRoom = () => {
    setRouteState({ currentRoomId: '', currentView: 'dashboard' });
    window.history.pushState({}, '', '/');
  };

  const handleAuthSuccess = () => {
    const roomId = roomIdFromPathname(window.location.pathname) || currentRoomId;
    if (roomId) {
      setRouteState({ currentRoomId: roomId, currentView: 'meeting' });
      window.history.pushState({}, '', `/meeting/${roomId}`);
    } else {
      setRouteState({ currentRoomId: '', currentView: 'dashboard' });
    }
  };

  const notify = useCallback((type, message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showHeaderFooter = !['auth', 'meeting'].includes(currentView);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden bg-[#050816] light:bg-slate-50">
      <ParticleBackground />
      
      {showHeaderFooter && (
        <Header 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          isAuthenticated={isAuthenticated} 
          handleAuthAction={handleAuthAction} 
        />
      )}

      <AnimatePresence mode="wait">
        <PageTransition currentKey={currentView}>
          {currentView === 'auth' && <Auth onNavigate={handleAuthSuccess} />}
          
          {currentView === 'dashboard' && isAuthenticated && (
            <UserDashboard onNavigate={setCurrentView} onJoinRoom={navigateToRoom} notify={notify} />
          )}
          
          {currentView === 'dashboard' && !isAuthenticated && (
            <Dashboard onNavigate={setCurrentView} onJoinRoom={navigateToRoom} notify={notify} />
          )}

          {currentView === 'profile' && isAuthenticated && (
            <UserProfile onNavigate={setCurrentView} />
          )}

          {currentView === 'settings' && isAuthenticated && (
            <UserSettings onNavigate={setCurrentView} />
          )}
          
          {currentView === 'features' && <Features onNavigate={setCurrentView} />}
          {currentView === 'how-it-works' && <HowItWorks onNavigate={setCurrentView} />}
          {currentView === 'pricing' && <Pricing onNavigate={setCurrentView} />}
          {currentView === 'faq' && <FAQ onNavigate={setCurrentView} />}
          {currentView === 'meeting' && <MeetingRoom onLeave={leaveRoom} roomId={currentRoomId} notify={notify} />}
        </PageTransition>
      </AnimatePresence>

      {showHeaderFooter && <Footer onNavigate={setCurrentView} />}

      {toast && (
        <div className="fixed top-4 left-1/2 z-[100] w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2">
          <div
            className={`rounded-full border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${
              toast.type === 'error'
                ? 'border-red-500/30 bg-red-950/80 text-red-100'
                : 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
