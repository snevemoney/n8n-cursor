# Motion Ref Pack — Cinematic AI Partner Landing

**Date:** 2026-08-12  
**Owner:** Creative Studio  
**Demo:** `cinematic-ai-partner` (Evens Louis / hive)  
**Signal:** @monokern video-as-immersive-scroll · @0xMiraqle / @viktoroddy Sol/taste-first cinematic sites  
**Constraint:** Real live sites only; no invented $50k case studies.

Label legend: **FACT** · **OPINION** · **INFERENCE**

---

## 1) Inkwell

**URL:** https://inkwell.tech/  
**Verified:** WebFetch + Awwwards editorial (live 2026-08-12)

### Vibe
Stealth AI B2B that unfolds like a short film: quiet confidence, atmospheric gradients, one uninterrupted narrative arc. **FACT:** Launched May 2025 as Inkwell’s first public brand surface; designed as a three-act scroll story with no chapter-skipping nav — only a pathfinder for orientation and a single contact click at the end (Awwwards case study). Closest tonal match to an AI Partner landing that sells outcomes without a feature laundry list.

### Motion notes

- **Easing**
  - **FACT:** Built with Vue + GSAP + OGL/Rapier for scroll-driven dynamics (Awwwards tech notes).
  - **OPINION:** Feels ease-out / soft-inertia rather than snappy UI springs — motion reads “directed,” not “product micro-interaction.”
  - **INFERENCE:** Scene transitions are paced like cuts; avoid bounce or elastic easings that break the filmic register.

- **Scroll length / behavior**
  - **FACT:** Continuous scroll-only journey; pathfinder shows progress but does not jump sections; story is meant to be experienced in order.
  - **OPINION:** Scroll length is long-form marketing (multiple “acts”), not a 2-screen SaaS hero. Good model for hook → constraint → proof → CTA beats, but our demo should be shorter.
  - **Steal the structure, not the runtime:** map DEMO_BRIEF beat sheet to ~1–1.5× viewport per beat, not a 10-minute film.

- **Overlay typography**
  - **FACT:** Restrained modern type over geometric/isometric compositions; “Scroll to explore” and section labels orient without chrome-heavy nav.
  - **OPINION:** Large display lines with generous tracking; copy stays sparse so motion and motif carry intrigue.
  - Keep overlays high-contrast on dark/atmospheric plates; never put critical CTA copy only inside WebGL/canvas.

- **Steal**
  - Three-act / scene-as-section framing before code (**FACT** process from their case study).
  - Pathfinder-as-progress (read-only) instead of sticky mega-nav.
  - Proof-by-persuasion tone for AI without fake client logos or invented case studies.
  - Quiet end CTA after the arc (matches our Cal.com / mailto placeholder).

- **Avoid**
  - Full WebGL + physics stack for v1 — playbook default is video hero + CSS/Framer Motion (**OPINION** / playbook).
  - Forcing zero navigation on a sales demo where operators need a fast CTA skip.
  - Overlong scroll that tanks mobile patience and LCP.

---

## 2) Streets of Punk (DappaSol × Jatin “Juice” Kumar)

**URL:** https://dappasol.com/streetsofpunk  
**Verified:** WebFetch of live page + published build log (2026-08-12)

### Vibe
One continuous “scroll film”: pinned full-bleed imagery scrubbed by scroll, kinetic per-word type, cold-open energy before you understand the UI. **FACT:** Architecture is scroll position → frame/film timeline (build log); HTML copy layered over the canvas so content stays crawlable. Direct match to the @monokern signal (video/frames as immersive scroll, not a real-time 3D product).

### Motion notes

- **Easing**
  - **FACT:** Playback is scrubbed by scroll (not autoplay timeline); cross-dissolves between frame sequences; text tied to the same scroll position.
  - **OPINION:** Feels linear-to-scroll with soft crossfades — “thumb is the scrub bar.” Any easing lives in the dissolve and type, not in fake physics on the film plane.
  - Prefer scroll-linked progress (0→1) with slight smoothing over springy section snaps.

- **Scroll length / behavior**
  - **FACT:** Single pinned canvas for the whole page; sections are beats on one timeline, not discrete page chunks sliding past.
  - **OPINION:** High immersion, high cost if naively reimplemented as full WebGL frame sequences for a partner demo.
  - **INFERENCE for our demo:** Use a shorter hero sticky scrub (or muted looping hero + scroll-linked opacity/scale) rather than a site-wide pinned film.

- **Overlay typography**
  - **FACT:** Per-word kinetic text synchronized to scroll; large split headlines (“More than / a videographer”).
  - **OPINION:** Type is the second camera — short lines, hard line breaks, editorial rhythm. Steal the cadence; keep word count low so motion stays legible.

- **Steal**
  - Cold open: first viewport already “rolling” before chrome explains itself.
  - Real HTML text over media (SEO + a11y + reduced-motion fallback path).
  - Cover-fit full-bleed framing (build log warns contain-fit letterboxing kills the cinematic read).
  - Mobile as a frame-rate budget problem (cap DPR / lighter assets), not only a CSS breakpoint problem.

- **Avoid**
  - Shipping unmuted autoplay film.
  - Full JPEG frame-sequence WebGL pipeline for v1 (scope/perf; playbook prefers compressed MP4/WebM hero ≤ ~4MB).
  - Assuming screenshot QA works for canvas-heavy heroes — verify with state + real device scroll.
  - Claiming this is a “$50k system”; public build log positions their flagship from a much lower fixed starting point (**FACT** from their pricing copy — use only as market context, not our quote).

---

## 3) fromanother

**URL:** https://www.fromanother.love/  
**Verified:** WebFetch of live site + Awwwards SOTD listing / build write-ups (2026-08-12)

### Vibe
Artist-led agency front door: editorial pacing, shapeshifting identity language, cinematic imagery with fluid section reveals. **FACT:** Awarded FWA of the Day + Awwwards Site of the Day / Developer Award (May 2026 listings); Next.js + GSAP + targeted WebGL; case notes emphasize **video-layering / blend modes** for fluid light instead of shaders everywhere. Strong taste-first reference aligned with @viktoroddy / Sol “pick refs before code” workflow.

### Motion notes

- **Easing**
  - **FACT:** GSAP + Web Animations API for the motion system; WebGL reserved for signature moments (ripple / hero interactions), not every section.
  - **OPINION:** Premium “soft power” easing — long ease-outs, overlapping enters (new content lifts before previous fully clears). Feels choreographed as one shared timeline rather than per-component random fades.
  - For Framer Motion port: prefer custom cubic-beziers / shared transition tokens over default spring on large editorial blocks.

- **Scroll length / behavior**
  - **FACT:** Numbered chapter sections (About → What We Do → Work → Team → Trust → Awards → Contact) with continuous scroll and cinematic media presentation.
  - **OPINION:** More “portfolio journey” than single-product conversion page — steal pacing and media treatment, compress into our 5-beat sheet.
  - Smooth inertia scrolling + intentional sticky/reveal moments; avoid carnival of simultaneous animations.

- **Overlay typography**
  - **FACT:** Large display statements, mixed case / shifting labels (“AGENCY STUDIO COLLECTIVE”), numbered section markers.
  - **OPINION:** Typography does identity work — slightly unstable labels can feel premium if restrained; for AI Partner, keep one stable wordmark + one signature motif (grain / light leak / glass) instead of constant rebranding mid-scroll.
  - Overlay type should sit in a clear safe zone over darkened video plates (gradient scrim).

- **Steal**
  - Video/media layering + blend for atmosphere instead of defaulting to Three.js.
  - WebGL only where it earns the “immersive” promise; DOM elsewhere (**FACT** build philosophy).
  - Editorial whitespace around cinematic stills/reels so proof images breathe.
  - One shared motion system (tokens for duration/easing) so the page feels directed.

- **Avoid**
  - Agency-length portfolios and award walls on a conversion demo.
  - Shapeshifting brand gimmicks that confuse SMB operators.
  - Heavy multi-canvas WebGL on mobile.
  - Decorating every hover — motion must reinforce spotlight on outcomes (Acquire / Grow / Cut).

---

## Implications for cinematic-ai-partner demo

1. **Primary hero = video (or scroll-scrubbed clip), not real-time 3D**  
   Follow Inkwell’s narrative intent + Streets of Punk’s media-as-timeline idea, implemented as muted looping / scroll-linked **MP4+WebM** with a dark poster (**FACT** playbook stack). Reserve WebGL for a later flagship if sold.

2. **Motion stack = CSS + Framer Motion**  
   Port fromanother’s “shared timeline / soft ease-out / overlap” feel with Framer Motion variants and CSS scroll-driven where cheap. One easing token set for hero, section reveals, and CTA.

3. **Scroll story length**  
   Map DEMO_BRIEF beats only: Hook → Constraint → Proof (Acquire/Grow/Cut) → How we work → CTA. Shorter than Inkwell/fromanother; denser than a static SaaS template.

4. **Typography**  
   Large restrained display over scrimmed hero; kinetic words optional in the hook only. Keep body and CTA in real DOM for SEO/a11y.

5. **`prefers-reduced-motion` (non-negotiable)**  
   Static poster + instant section layout; no scrub dependency for understanding the offer. Match playbook `motion-budget` / `a11y-pass`.

6. **Taste before code**  
   These three refs are the taste pack. Next Creative Studio step: hero media into `assets/` (loop + poster), then Forge scaffolds Next App Router against this pack — no Lovable-as-production, no $50k claims.

---

## Source verification log

| Site | Live URL checked | Supporting source |
|------|------------------|-------------------|
| Inkwell | https://inkwell.tech/ | Awwwards editorial “scroll-driven narrative…” |
| Streets of Punk | https://dappasol.com/streetsofpunk | DappaSol build log (scroll-film architecture) |
| fromanother | https://www.fromanother.love/ | Awwwards SOTD + developer build write-ups |

**Blockers:** None. Hero media landed in `assets/` (WebM/MP4/poster) — Creative Studio 2026-08-12.
