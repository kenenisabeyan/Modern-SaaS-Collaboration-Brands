import { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';

export default function HeroVideos({ className = '' }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const isMuted = true;
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  // Guarantee continuous looping autoplay on mount and state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Modern browsers require muted for unprompted autoplay
    video.muted = true;

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
  }, []);

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

  return (
    <div className={`relative w-full max-w-none ${className}`}>

      {/* Video Container: Completely borderless, seamless edge transition, full 1886x1080 resolution visibility */}
      <div 
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-none bg-[#FEFEFE] aspect-[1886/1080] w-full flex items-center justify-center border-0 outline-none"
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
            className="w-full h-full object-cover border-0 outline-none block pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#1E2761] text-white text-center">
            <span className="w-3 h-3 rounded-full bg-[#FF5A36] animate-ping mb-3"></span>
            <p className="text-sm font-bold text-white tracking-wide">Live Masterclass Interactive Session</p>
            <p className="text-xs text-slate-300 mt-1">Connecting participants in Ultra HD...</p>
          </div>
        )}
      </div>

      {/* Modern Professional Control & Indicator Bar Below the Video - Single Clean Row with Sleek Scroll Indicator */}
      <div className="mt-3.5 sm:mt-4 flex flex-nowrap items-center justify-between gap-2.5 sm:gap-3.5 w-full px-1 pb-2 sm:pb-2.5 overflow-x-auto modern-scrollbar">
        {/* Left: Modern Live Masterclass & 1080p Ultra HD Buttons */}
        <div className="flex items-center flex-nowrap shrink-0 gap-2 sm:gap-3">
          {/* 1. Live Masterclass Interactive Modern Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="group/btn inline-flex items-center justify-center space-x-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#FEFEFE] hover:bg-[#F5F7FA] text-[#1E2761] hover:text-[#FF5A36] border border-[#E4E8EE] hover:border-[#FF5A36]/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-xs sm:text-sm font-bold tracking-tight active:scale-[0.98] shrink-0 whitespace-nowrap"
            title={isPlaying ? "Live Masterclass stream active (click to pause)" : "Click to resume live stream"}
          >
            <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-[#FF5A36] opacity-75' : 'bg-slate-400 opacity-40'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-[#FF5A36]' : 'bg-slate-400'}`}></span>
            </span>
            <span className="tracking-wide">Live Masterclass</span>
            <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md ${isPlaying ? 'bg-[#FF5A36]/10 text-[#FF5A36]' : 'bg-slate-100 text-slate-500'}`}>
              {isPlaying ? 'LIVE' : 'PAUSED'}
            </span>
          </button>

          {/* 2. 1080p Ultra HD Modern Pill Button */}
          <div 
            className="group/hd inline-flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#FEFEFE] text-[#1E2761] border border-[#E4E8EE] shadow-xs hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-bold shrink-0 whitespace-nowrap"
            title="Streamed in 1080p Ultra HD 60FPS WebRTC"
          >
            <Sparkles size={14} className="text-[#FF5A36] transition-transform duration-300 group-hover/hd:rotate-12 group-hover/hd:scale-110 shrink-0" />
            <span className="font-mono tracking-tight font-extrabold">1080p Ultra HD</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
              60 FPS
            </span>
          </div>
        </div>

        {/* Right: Remaining feature check marks on the same row */}
        <div className="flex items-center flex-nowrap shrink-0 gap-3 sm:gap-4.5 text-xs text-slate-500 font-semibold">
          <div className="flex items-center space-x-1.5 shrink-0 whitespace-nowrap">
            <CheckCircle size={14} className="text-[#FF5A36] shrink-0" />
            <span>Zero Downloads</span>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 whitespace-nowrap">
            <CheckCircle size={14} className="text-[#FF5A36] shrink-0" />
            <span>End-to-End Secure</span>
          </div>
        </div>
      </div>

    </div>
  );
}
