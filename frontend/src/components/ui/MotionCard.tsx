import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  /** Stagger index for list entrance. */
  index?: number;
  interactive?: boolean;
}

/** A surface card with entrance animation and optional hover lift. */
export function MotionCard({ children, className = '', index = 0, interactive = true }: MotionCardProps) {
  return (
    <motion.section
      className={`card ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(index * 0.05, 0.4) }}
      whileHover={interactive ? { y: -4, transition: { duration: 0.2 } } : undefined}
    >
      {children}
    </motion.section>
  );
}
