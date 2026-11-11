import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import video1Thumb from '../assets/videos/video1-thumb.jpg';
import video2Thumb from '../assets/videos/video2-thumb.png';

export default function HeroVideos({ className = '' }) {
  const [isPlaying1, setIsPlaying1] = useState(true);
  const [isPlaying2, setIsPlaying2] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError1, setHasError1] = useState(false);
  const [hasError2, setHasError2] = useState(false);

  const video1Ref = useRef(null);
  const video2Ref = useRef(null);

  const togglePlay1 = () => {
    if (!video1Ref.current) return;
    if (video1Ref.current.paused) {
      video1Ref.current.play();
      setIsPlaying1(true);
    } else {
      video1Ref.current.pause();
      setIsPlaying1(false);
    }
  };

  const togglePlay2 = () => {
    if (!video2Ref.current) return;
    if (video2Ref.current.paused) {
      video2Ref.current.play();
      setIsPlaying2(true);
    } else {
      video2Ref.current.pause();
      setIsPlaying2(false);
    }
  };

  const toggleMuteAll = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (video1Ref.current) video1Ref.current.muted = nextMuted;
    if (video2Ref.current) video2Ref.current.muted = nextMuted;
  };

  return (
    <div className={`w-full flex flex-col space-y-3 ${className}`}>
      
      {/* Top Header Badge */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
          <span className="text-[11px] sm:text-xs font-bold text-[#1E2761] uppercase tracking-wider">
            Live Interactive Sessions
          </span>
        </div>
        <button
          type="button"
          onClick={toggleMuteAll}
          className="p-1.5 rounded-full text-slate-400 hover:text-[#1E2761] hover:bg-[#F5F7FA] transition-colors cursor-pointer"
          title={isMuted ? 'Unmute preview' : 'Mute preview'}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#FF5A36]" />}
        </button>
      </div>

      {/* Two Videos in One Row */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
        
        {/* Video 1 Card: Live Masterclass (10s) */}
        <div 
          onClick={togglePlay1}
          className="group relative rounded-2xl overflow-hidden bg-[#1E2761] border border-[#E4E8EE] shadow-sm aspect-[4/5] sm:aspect-[3/4] cursor-pointer flex items-center justify-center transition-all duration-300 hover:shadow-md"
        >
          {!hasError1 ? (
            <video
              ref={video1Ref}
              src="/videos/video1.mp4"
              poster={video1Thumb}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => setHasError1(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              <img 
                src={video1Thumb} 
                alt="Masterclass session" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#1E2761]/30 backdrop-blur-[1px]"></div>
            </div>
          )}

          {/* Top Live Pill */}
          <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1E2761]/85 backdrop-blur-md text-white border border-white/15 flex items-center space-x-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] animate-pulse"></span>
            <span>Masterclass</span>
          </div>

          {/* Center Play Overlay on Hover / Paused */}
          <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200 ${
            isPlaying1 ? 'opacity-0 group-hover:opacity-100 bg-black/20' : 'opacity-100 bg-black/40'
          }`}>
            <div className="w-10 h-10 rounded-full bg-white/95 text-[#1E2761] shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              {isPlaying1 ? <Pause size={16} /> : <Play size={16} className="ml-0.5 text-[#FF5A36] fill-current" />}
            </div>
          </div>

          {/* Bottom Duration Badge */}
          <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#1E2761]/85 text-white backdrop-blur-md border border-white/10">
            0:10
          </div>
        </div>

        {/* Video 2 Card: Interactive Studio (15s) */}
        <div 
          onClick={togglePlay2}
          className="group relative rounded-2xl overflow-hidden bg-[#1E2761] border border-[#E4E8EE] shadow-sm aspect-[4/5] sm:aspect-[3/4] cursor-pointer flex items-center justify-center transition-all duration-300 hover:shadow-md"
        >
          {!hasError2 ? (
            <video
              ref={video2Ref}
              src="/videos/video2.mp4"
              poster={video2Thumb}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => setHasError2(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              <img 
                src={video2Thumb} 
                alt="Interactive seminar" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#1E2761]/30 backdrop-blur-[1px]"></div>
            </div>
          )}

          {/* Top Live Pill */}
          <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1E2761]/85 backdrop-blur-md text-white border border-white/15 flex items-center space-x-1.5 shadow-sm">
            <Sparkles size={11} className="text-[#FF5A36]" />
            <span>Studio</span>
          </div>

          {/* Center Play Overlay on Hover / Paused */}
          <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200 ${
            isPlaying2 ? 'opacity-0 group-hover:opacity-100 bg-black/20' : 'opacity-100 bg-black/40'
          }`}>
            <div className="w-10 h-10 rounded-full bg-white/95 text-[#1E2761] shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              {isPlaying2 ? <Pause size={16} /> : <Play size={16} className="ml-0.5 text-[#FF5A36] fill-current" />}
            </div>
          </div>

          {/* Bottom Duration Badge */}
          <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#1E2761]/85 text-white backdrop-blur-md border border-white/10">
            0:15
          </div>
        </div>

      </div>

      {/* Subtitle Footer */}
      <div className="text-center pt-1">
        <p className="text-[11px] text-slate-500 font-medium">
          Ultra-low latency WebRTC video & collaborative whiteboard
        </p>
      </div>

    </div>
  );
}
