export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export const slideDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export const slideInRight = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export const buttonHover = {
  scale: 1.03,
  transition: { duration: 0.2, ease: "easeInOut" }
};

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1, ease: "easeInOut" }
};

export const cardHover = {
  y: -5,
  boxShadow: "0 20px 40px -15px rgba(30, 39, 97, 0.12)",
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};

// Expert professional scroll-triggered reveals with hardware-accelerated easing
export const scrollSection = {
  hidden: { opacity: 0, y: 28 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.65, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

export const scrollStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08
    }
  }
};

export const scrollItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.55, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

export const viewportConfig = {
  once: true,
  amount: 0.15,
  margin: "0px 0px -50px 0px"
};
