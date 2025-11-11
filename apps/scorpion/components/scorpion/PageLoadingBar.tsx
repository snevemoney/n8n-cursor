'use client';

import { useEffect, useState } from 'react';

interface PageLoadingBarProps {
  loading?: boolean;
  className?: string;
}

/**
 * A subtle loading bar that appears at the top of the page during data loading
 * Provides visual feedback without being intrusive
 */
export function PageLoadingBar({ loading = false, className = '' }: PageLoadingBarProps) {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      setShow(true);
      setProgress(0);
      // Simulate progress for better UX
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Don't go to 100% until actually done
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      // Complete the progress bar before hiding
      setProgress(100);
      const timer = setTimeout(() => {
        setShow(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-[3px] bg-transparent pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: '3px',
        width: '100%'
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 transition-all duration-300 ease-out shadow-lg shadow-emerald-400/50"
        style={{
          width: `${progress}%`,
          transition: loading ? 'width 0.2s ease-out' : 'width 0.3s ease-out',
          height: '100%',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
        }}
      />
    </div>
  );
}

export default PageLoadingBar;

