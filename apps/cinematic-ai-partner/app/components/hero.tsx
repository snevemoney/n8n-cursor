'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { siteConfig } from '../config';

export function Hero() {
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (prefersReduced) return;

    fetch('/hero/hero.webm', { method: 'HEAD' })
      .then((r) => {
        if (r.ok) setVideoReady(true);
      })
      .catch(() => {});
  }, [prefersReduced]);

  useEffect(() => {
    if (videoReady && videoRef.current && !prefersReduced) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoReady, prefersReduced]);

  return (
    <section className="hero-glass relative flex min-h-[100svh] items-end overflow-hidden">
      {/* Poster / gradient fallback — always rendered */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(91,140,255,0.06), transparent)',
            'linear-gradient(175deg, #0e0e12 0%, #0A0A0C 40%, #141418 100%)',
          ].join(', '),
        }}
      />

      {/* Video layer — only when media exists AND motion is allowed */}
      {videoReady && !prefersReduced && (
        <video
          ref={videoRef}
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-35"
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          poster="/hero/poster.jpg"
          aria-hidden="true"
        >
          <source src="/hero/hero.webm" type="video/webm" />
          <source src="/hero/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* Static poster for reduced-motion users when media exists */}
      {prefersReduced && (
        <img
          src="/hero/poster.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-30"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {/* Bottom vignette */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            'linear-gradient(to top, var(--bg) 0%, transparent 50%, rgba(10,10,12,0.4) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-[3] mx-auto w-full max-w-5xl px-6 pb-20 pt-40 md:pb-28 md:pt-56">
        <motion.p
          className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-accent"
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          AI Partner
        </motion.p>

        <motion.h1
          className="max-w-3xl font-display text-4xl font-normal leading-[1.1] tracking-tight text-text md:text-6xl lg:text-7xl"
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Your growth team&apos;s
          <br />
          <span className="text-accent">unfair advantage.</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted md:text-xl"
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
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
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-7 py-3.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {siteConfig.ctaLabel}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
