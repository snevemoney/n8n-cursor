'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const SAFETY_TIMEOUT_MS = 3500;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => setIsVisible(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          show();
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 40px 0px' },
    );

    observer.observe(el);

    const timer = window.setTimeout(show, SAFETY_TIMEOUT_MS + delay * 1000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [delay]);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : undefined}
      style={isVisible ? undefined : { opacity: 0, transform: 'translateY(24px)' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
