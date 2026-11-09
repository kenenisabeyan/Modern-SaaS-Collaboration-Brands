import { useEffect, useState } from 'react';
import { Lottie } from 'lottie-react';
import heroAnimationData from '../assets/hero-lottie.json';

export default function HeroAnimation({ className = "w-full max-w-[650px] aspect-square" }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="w-10 h-10 rounded-full border-3 border-[#0DA9CF]/20 border-t-[#0DA9CF] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`mx-auto flex items-center justify-center select-none pointer-events-none ${className}`}>
      <Lottie 
        animationData={heroAnimationData} 
        loop={true} 
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
