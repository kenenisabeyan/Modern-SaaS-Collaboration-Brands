import { useState, useRef, useEffect } from 'react';

export default function HeroVideos({ className = '' }) {
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

    </div>
  );
}
