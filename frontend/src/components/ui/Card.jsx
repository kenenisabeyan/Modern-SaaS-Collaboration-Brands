import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = true, glow = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      className={`
        bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] 
        shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl sm:rounded-3xl relative overflow-hidden 
        transition-all duration-500 
        ${hover ? 'hover:border-white/[0.15] hover:bg-white/[0.04]' : ''}
        ${glow ? 'shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:shadow-[0_0_50px_rgba(99,102,241,0.25)]' : ''}
        ${className}
      `}
      {...props}
    >
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 transition-opacity duration-500 z-0 pointer-events-none hover:opacity-100" />
      )}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
