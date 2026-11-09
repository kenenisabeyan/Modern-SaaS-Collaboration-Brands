import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-[#0DA9CF] text-white hover:bg-[#0C8DB0] shadow-[0_0_20px_rgba(13,169,207,0.35)] hover:shadow-[0_0_30px_rgba(13,169,207,0.5)]',
  brand: 'bg-[#0DA9CF] text-white hover:bg-[#0C8DB0] shadow-[0_0_20px_rgba(13,169,207,0.35)] hover:shadow-[0_0_30px_rgba(13,169,207,0.5)] border border-white/10',
  orange: 'bg-[#F67E31] text-white hover:bg-[#CC6A2F] shadow-[0_0_20px_rgba(246,126,49,0.35)] hover:shadow-[0_0_30px_rgba(246,126,49,0.5)] border border-white/10',
  green: 'bg-[#04B84C] text-white hover:bg-[#059A45] shadow-[0_0_20px_rgba(4,184,76,0.35)] hover:shadow-[0_0_30px_rgba(4,184,76,0.5)] border border-white/10',
  secondary: 'bg-white text-[#0DA9CF] border border-[#0DA9CF]/40 hover:bg-[#0DA9CF]/10 shadow-sm',
  ghost: 'bg-transparent text-[#0DA9CF] hover:bg-[#0DA9CF]/10',
  danger: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40'
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
  xl: 'px-8 py-4 text-lg'
};

export const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center font-semibold rounded-full
        transition-all duration-300 relative overflow-hidden
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {!isLoading && Icon && iconPosition === 'left' && (
        <Icon className="mr-2 h-5 w-5" />
      )}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="ml-2 h-5 w-5" />
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
