import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-white text-[#050816] hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]',
  brand: 'bg-indigo-500 text-white light:text-slate-900 hover:bg-indigo-600 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-white/10',
  secondary: 'bg-white/[0.03] text-white light:text-slate-900 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 backdrop-blur-sm',
  ghost: 'bg-transparent text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 light:bg-slate-100',
  danger: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40'
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
