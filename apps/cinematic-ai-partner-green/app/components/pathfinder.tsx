'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Read-only scroll progress. Job: orientation / skip-anxiety.
 * Not a decoration — updates transform on a ref, no per-frame React state.
 */
export function Pathfinder() {
  const barRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[40] h-px bg-line/40"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-accent/80"
        style={{
          transform: 'scaleX(0)',
          transition: prefersReduced ? undefined : 'transform 80ms linear',
        }}
      />
    </div>
  );
}
