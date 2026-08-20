'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { siteConfig } from '../config';
import { useHeroMotion } from './use-hero-motion';

export function Hero() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const motionOn = prefersReduced === false;

  useHeroMotion({
    enabled: motionOn,
    sectionRef,
    plateRef,
    videoRef,
  });

  return (
    <section
      ref={sectionRef}
      className="hero-glass relative flex min-h-[100svh] items-end overflow-hidden"
    >
      <div
        ref={plateRef}
        className="hero-plate absolute inset-[-4%] z-0 will-change-transform"
      >
        <div className="hero-plate-wash absolute inset-0" />

        {motionOn ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.32 }}
            muted
            playsInline
            preload="auto"
            poster="/hero/poster.webp"
            aria-hidden="true"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          >
            <source src="/hero/hero.webm" type="video/webm" />
            <source src="/hero/hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/hero/poster.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            onError={(event) => {
              event.currentTarget.src = '/hero/poster.jpg';
            }}
          />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'linear-gradient(to top, var(--bg) 0%, transparent 50%, rgba(10,10,12,0.4) 100%)',
        }}
      />

      <div className="relative z-[3] mx-auto w-full max-w-5xl px-6 pb-20 pt-40 md:pb-28 md:pt-56">
        <motion.p
          className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-accent"
          initial={motionOn ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          AI Partner
        </motion.p>

        <motion.h1
          className="max-w-3xl font-display text-4xl font-normal leading-[1.1] tracking-tight text-text md:text-6xl lg:text-7xl"
          initial={motionOn ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Taste plus agents.
          <br />
          <span className="text-accent">Not another tool stack.</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted md:text-xl"
          initial={motionOn ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          One operator. Named employees for research, build, and taste. We
          embed so Acquire, Grow, and Cut actually ship.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={motionOn ? { opacity: 0 } : false}
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
