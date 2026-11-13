import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function HeroVideos({ className = '' }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  // Guarantee continuous looping autoplay on mount and state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Modern browsers require muted for unprompted autoplay
    video.muted = isMuted;

    const startPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            // Autoplay policy: ensure muted and retry seamlessly
            console.warn('[HeroVideos] Autoplay retry with muted audio:', err);
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
      }
    };

    startPlay();

    // Auto-resume playback if user switches back to this tab
    const handleVisibilityChange = () => {
      if (!document.hidden && video && video.paused) {
        video.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMuted]);

  const togglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (video) {
      video.muted = nextMuted;
      if (video.paused) {
        video.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className={`relative w-full max-w-none group select-none ${className}`}>
      
      {/* Ambient Atmospheric Diffusion: seamless soft glow blending video into background with zero harsh lines */}
      <div 
        aria-hidden="true" 
        className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-[#1E2761]/15 via-[#FF5A36]/10 to-[#1E2761]/5 rounded-3xl blur-2xl sm:blur-3xl -z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-700"
      />

      {/* Video Container: Completely borderless, seamless edge transition, full 1886x1080 resolution visibility */}
      <div 
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(30,39,97,0.14)] bg-[#1E2761] aspect-[1886/1080] w-full flex items-center justify-center border-0 outline-none"
      >
        {!hasError ? (
          <video
            ref={videoRef}
            src="/videos/hero-video.mp4"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onError={() => {
              console.warn('[HeroVideos] Video loading failed');
              setHasError(true);
            }}
            onEnded={(e) => {
              // Ensure uninterrupted continuous loop repeat
              e.target.currentTime = 0;
              e.target.play().catch(() => {});
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.015] border-0 outline-none block"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#1E2761] text-white text-center">
            <span className="w-3 h-3 rounded-full bg-[#FF5A36] animate-ping mb-3"></span>
            <p className="text-sm font-bold text-white tracking-wide">Live Masterclass Interactive Session</p>
            <p className="text-xs text-slate-300 mt-1">Connecting participants in Ultra HD...</p>
          </div>
        )}

        {/* Top-Left: Sleek Glassmorphic Live Session Badge */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#1E2761]/70 backdrop-blur-md text-white flex items-center justify-center space-x-2 shadow-sm pointer-events-none border-0">
          <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
          <span className="tracking-wide">Live Masterclass</span>
        </div>

        {/* Top-Right: Glassmorphic Audio Unmute / Mute Toggle Button */}
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-[#1E2761]/70 hover:bg-[#1E2761]/90 backdrop-blur-md text-white transition-all cursor-pointer flex items-center justify-center shadow-md hover:scale-105 active:scale-95 border-0 focus:outline-none"
          title={isMuted ? 'Click to unmute sound' : 'Click to mute sound'}
          aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
        >
          {isMuted ? (
            <VolumeX size={15} className="text-white/90" />
          ) : (
            <Volume2 size={15} className="text-[#FF5A36]" />
          )}
        </button>

        {/* Center: Seamless Click-to-Play/Pause Overlay */}
        <div 
          onClick={togglePlay}
          className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isPlaying ? 'opacity-0 group-hover:opacity-100 bg-black/15' : 'opacity-100 bg-black/30 backdrop-blur-[1px]'
          }`}
          title={isPlaying ? 'Click to pause' : 'Click to resume'}
        >
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white/95 text-[#1E2761] shadow-xl flex items-center justify-center transform group-hover:scale-110 active:scale-95 transition-all">
            {isPlaying ? (
              <Pause size={20} className="text-[#1E2761]" />
            ) : (
              <Play size={20} className="text-[#FF5A36] fill-current" />
            )}
          </div>
        </div>

        {/* Bottom-Right: Ultra HD Quality Indicator Badge */}
        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-20 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold bg-[#1E2761]/70 backdrop-blur-md text-white flex items-center justify-center space-x-1.5 shadow-sm pointer-events-none border-0">
          <Sparkles size={11} className="text-[#FF5A36]" />
          <span>1080p Ultra HD</span>
        </div>

      </div>

    </div>
  );
}
