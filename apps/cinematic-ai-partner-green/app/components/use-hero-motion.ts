'use client';

import { useEffect, type RefObject } from 'react';

/** Style bible: cursor parallax 4–8px, hero plate only. */
const CURSOR_PX = 8;
const SCRUB_EPSILON = 0.04;

type HeroMotionRefs = {
  enabled: boolean;
  sectionRef: RefObject<HTMLElement | null>;
  plateRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
};

/**
 * Drive the hero plate from scroll + cursor via refs (no React state per frame).
 * Scroll progress 0→1 maps to video currentTime and a slight scale.
 * Reduced-motion callers pass enabled=false and skip this hook's listeners.
 */
export function useHeroMotion({
  enabled,
  sectionRef,
  plateRef,
  videoRef,
}: HeroMotionRefs) {
  useEffect(() => {
    if (!enabled) return;

    const section = sectionRef.current;
    const plate = plateRef.current;
    const video = videoRef.current;
    if (!section || !plate) return;

    let raf = 0;
    let cursorX = 0;
    let cursorY = 0;
    let progress = 0;

    const apply = () => {
      raf = 0;
      const scale = 1 + progress * 0.045;
      plate.style.transform = `translate3d(${cursorX * CURSOR_PX}px, ${cursorY * CURSOR_PX}px, 0) scale(${scale})`;

      if (video && video.duration && Number.isFinite(video.duration)) {
        const nextTime = progress * video.duration;
        if (Math.abs(video.currentTime - nextTime) > SCRUB_EPSILON) {
          video.currentTime = nextTime;
        }
        video.style.opacity = String(0.28 + progress * 0.12);
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    const onScroll = () => {
      const height = section.offsetHeight || 1;
      const top = section.getBoundingClientRect().top;
      progress = Math.min(1, Math.max(0, -top / height));
      schedule();
    };

    const onMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      cursorX = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth) * 2 - 1));
      cursorY = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight) * 2 - 1));
      schedule();
    };

    const armVideo = () => {
      video?.pause();
      onScroll();
    };

    if (video) {
      video.pause();
      video.addEventListener('loadedmetadata', armVideo);
      if (video.readyState >= 1) armVideo();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
      video?.removeEventListener('loadedmetadata', armVideo);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, plateRef, sectionRef, videoRef]);
}
