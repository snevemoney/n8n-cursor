'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { siteConfig } from '../config';

export function Hero() {
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoAvailable, setVideoAvailable] = useState(false);

  useEffect(() => {
    if (prefersReduced) return;

    fetch('/hero/hero.webm', { method: 'HEAD' })
      .then((r) => {
        if (r.ok) setVideoAvailable(true);
      })
      .catch(() => {});
  }, [prefersReduced]);

  useEffect(() => {
    if (videoAvailable && videoRef.current && !prefersReduced) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoAvailable, prefersReduced]);

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      {/* Poster / gradient fallback */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(200,149,108,0.08), transparent)',
            'linear-gradient(175deg, #0d0d10 0%, #0a0a0c 40%, #111115 100%)',
          ].join(', '),
        }}
      />

      {/* Optional video layer */}
      {videoAvailable && !prefersReduced && (
        <video
          ref={videoRef}
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-40"
          muted
          loop
          playsInline
          preload="none"
          poster="/hero/poster.jpg"
          aria-hidden="true"
        >
          <source src="/hero/hero.webm" type="video/webm" />
          <source src="/hero/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* Gradient vignette */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to top, var(--surface-primary) 0%, transparent 50%, rgba(10,10,12,0.4) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-[2] mx-auto w-full max-w-5xl px-6 pb-20 pt-40 md:pb-28 md:pt-56">
        <motion.p
          className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-accent"
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          AI Partner
        </motion.p>

        <motion.h1
          className="max-w-3xl font-display text-4xl font-normal leading-[1.1] tracking-tight text-text-primary md:text-6xl lg:text-7xl"
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Your growth team&apos;s
          <br />
          <span className="text-accent">unfair advantage.</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary md:text-xl"
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          We embed as your AI operations partner — a focused operator backed by
          purpose-built agents — so you ship outcomes, not tickets.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <a
            href={siteConfig.ctaHref}
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-7 py-3.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary"
          >
            {siteConfig.ctaLabel}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
