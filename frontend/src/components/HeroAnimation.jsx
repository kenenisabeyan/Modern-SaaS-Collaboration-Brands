import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import heroAnimationData from '../assets/hero-lottie.json';

export default function HeroAnimation() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full max-w-[650px] aspect-square flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#ec232b]/20 border-t-[#ec232b] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[650px] aspect-square mx-auto flex items-center justify-center select-none pointer-events-none sm:pointer-events-auto">
      <Lottie 
        animationData={heroAnimationData} 
        loop={true} 
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
