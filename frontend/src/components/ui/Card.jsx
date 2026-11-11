import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = true, glow = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      className={`
        bg-white border border-[#E4E8EE] 
        shadow-sm rounded-2xl sm:rounded-3xl relative overflow-hidden 
        transition-all duration-300 
        ${hover ? 'hover:border-[#1E2761]/30 hover:shadow-md' : ''}
        ${glow ? 'border-[#FF5A36]/40 shadow-[0_4px_25px_rgba(255,90,54,0.12)]' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
