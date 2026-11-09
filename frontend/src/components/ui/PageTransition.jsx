import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 }
};

const pageTransition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1]
};

export default function PageTransition({ children, currentKey }) {
  return (
    <motion.div
      key={currentKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full min-h-screen flex flex-col relative z-10"
    >
      {children}
    </motion.div>
  );
}
