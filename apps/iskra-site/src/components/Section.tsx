import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { SectionId } from '../types';

interface SectionProps {
  id: SectionId;
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function Section({ id, children, className = '', fullHeight = true }: SectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      initial={reducedMotion ? {} : { opacity: 0, y: 24 }}
      whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
      className={`relative w-full px-6 py-20 md:px-12 lg:px-20 ${
        fullHeight ? 'min-h-screen flex flex-col justify-center' : ''
      } ${className}`}
    >
      {children}
    </motion.section>
  );
}
