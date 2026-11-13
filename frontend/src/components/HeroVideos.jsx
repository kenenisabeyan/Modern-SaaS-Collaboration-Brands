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

        {/* Center: Seamless Click-to-Play/Pause Overlay */}
        <div 
          onClick={togglePlay}
          className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isPlaying ? 'opacity-0 group-hover:opacity-100 bg-black/15' : 'opacity-100 bg-black/30 backdrop-blur-[1px]'
          }`}
          title={isPlaying ? 'Click to pause' : 'Click to resume'}
        >
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#FEFEFE]/95 text-[#1E2761] shadow-xl flex items-center justify-center transform group-hover:scale-110 active:scale-95 transition-all">
            {isPlaying ? (
              <Pause size={20} className="text-[#1E2761]" />
            ) : (
              <Play size={20} className="text-[#FF5A36] fill-current" />
            )}
          </div>
        </div>

      </div>

      {/* Modern Professional Control & Indicator Bar Below the Video */}
      <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full px-1">
        {/* Left: Modern Live Masterclass & 1080p Ultra HD Buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* 1. Live Masterclass Interactive Modern Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="group/btn inline-flex items-center justify-center space-x-2 px-3.5 sm:px-4 py-2 rounded-full bg-[#FEFEFE] hover:bg-[#F5F7FA] text-[#1E2761] hover:text-[#FF5A36] border border-[#E4E8EE] hover:border-[#FF5A36]/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-xs sm:text-sm font-bold tracking-tight active:scale-[0.98]"
            title={isPlaying ? "Live Masterclass stream active (click to pause)" : "Click to resume live stream"}
          >
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
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
            className="group/hd inline-flex items-center justify-center space-x-2 px-3.5 sm:px-4 py-2 rounded-full bg-[#FEFEFE] text-[#1E2761] border border-[#E4E8EE] shadow-xs hover:shadow-md transition-all duration-200 select-none text-xs sm:text-sm font-bold"
            title="Streamed in 1080p Ultra HD 60FPS WebRTC"
          >
            <Sparkles size={14} className="text-[#FF5A36] transition-transform duration-300 group-hover/hd:rotate-12 group-hover/hd:scale-110 shrink-0" />
            <span className="font-mono tracking-tight font-extrabold">1080p Ultra HD</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
              60 FPS
            </span>
          </div>
        </div>

        {/* Right: Media Playback & Audio Controls */}
        <div className="flex items-center space-x-2">
          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center justify-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-[#FEFEFE] hover:bg-[#F5F7FA] text-[#1E2761] hover:text-[#FF5A36] border border-[#E4E8EE] hover:border-[#FF5A36]/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-xs sm:text-sm font-bold active:scale-[0.98]"
            title={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <>
                <Pause size={14} className="text-[#1E2761] shrink-0" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play size={14} className="text-[#FF5A36] fill-current shrink-0" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex items-center justify-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-[#FEFEFE] hover:bg-[#F5F7FA] text-[#1E2761] hover:text-[#FF5A36] border border-[#E4E8EE] hover:border-[#FF5A36]/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-xs sm:text-sm font-bold active:scale-[0.98]"
            title={isMuted ? "Unmute video audio" : "Mute video audio"}
          >
            {isMuted ? (
              <>
                <VolumeX size={14} className="text-slate-400 shrink-0" />
                <span className="text-slate-500 hidden sm:inline">Sound Off</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-[#FF5A36] shrink-0" />
                <span className="text-[#FF5A36] hidden sm:inline">Sound On</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
