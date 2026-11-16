import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollEnhancer() {
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const unsubscribeScroll = scrollY.on('change', (latest) => {
      setShowScrollTop(latest > 280);
    });
    const unsubscribeProgress = scrollYProgress.on('change', (latest) => {
      setScrollPercent(Math.round(latest * 100));
    });

    return () => {
      unsubscribeScroll();
      unsubscribeProgress();
    };
  }, [scrollY, scrollYProgress]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Circular progress calculations (Radius = 20, center = 24, circumference = 2 * π * 20 ≈ 125.66)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercent / 100) * circumference;

  return (
    <>
      {/* 1. Sleek Gradient Scroll Progress Bar at the Top */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1E2761] via-[#FF5A36] to-[#FF8A65] origin-left z-[9999] shadow-[0_1px_10px_rgba(255,90,54,0.45)] pointer-events-none"
      />

      {/* 2. Interactive Circular Floating Back-To-Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 group"
          >
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="relative w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#E4E8EE] shadow-lg shadow-[#1E2761]/10 text-[#1E2761] hover:text-[#FF5A36] hover:border-[#FF5A36]/40 hover:shadow-xl hover:shadow-[#FF5A36]/20 transition-all duration-300 flex items-center justify-center cursor-pointer group-hover:-translate-y-1 active:translate-y-0 select-none"
            >
              {/* SVG Circular Progress Ring */}
              <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                {/* Track background */}
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-[#E4E8EE]"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                {/* Active progress track */}
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="#FF5A36"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-150 ease-out"
                />
              </svg>

              {/* Arrow Icon */}
              <ArrowUp 
                size={18} 
                className="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5" 
                strokeWidth={2.5}
              />
            </button>

            {/* Micro Tooltip */}
            <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="px-2.5 py-1 rounded-md bg-[#1E2761] text-white text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shadow-md">
                {scrollPercent}% • Top
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
