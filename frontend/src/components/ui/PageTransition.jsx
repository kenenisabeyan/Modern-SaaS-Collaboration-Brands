import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.35, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  },
  out: { 
    opacity: 0, 
    y: -8,
    transition: { 
      duration: 0.2, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

export default function PageTransition({ children, currentKey }) {
  return (
    <motion.div
      key={currentKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="w-full min-h-screen flex flex-col relative z-10"
    >
      {children}
    </motion.div>
  );
}
