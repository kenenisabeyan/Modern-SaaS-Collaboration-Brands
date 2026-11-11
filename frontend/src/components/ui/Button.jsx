import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-[#1E2761] text-white hover:bg-[#151A44] shadow-md shadow-[#1E2761]/20',
  accent: 'bg-[#FF5A36] text-white hover:bg-[#E04826] shadow-md shadow-[#FF5A36]/25',
  brand: 'bg-[#FF5A36] text-white hover:bg-[#E04826] shadow-md shadow-[#FF5A36]/25',
  orange: 'bg-[#FF5A36] text-white hover:bg-[#E04826] shadow-md shadow-[#FF5A36]/25',
  green: 'bg-[#1E2761] text-white hover:bg-[#151A44]',
  secondary: 'bg-white text-[#1E2761] border border-[#E4E8EE] hover:bg-[#F5F7FA] shadow-sm',
  ghost: 'bg-transparent text-[#1E2761] hover:bg-[#F5F7FA]',
  danger: 'bg-[#FF5A36]/10 text-[#FF5A36] hover:bg-[#FF5A36]/20 border border-[#FF5A36]/25'
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
