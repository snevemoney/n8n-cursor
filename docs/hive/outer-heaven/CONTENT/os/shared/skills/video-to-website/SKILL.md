---
name: video-to-website
description: >-
  Use this when turning a video file (MP4, MOV, etc.) into a premium
  scroll-driven animated website with GSAP, canvas frame rendering, Lenis,
  and mixed animation choreography.
---

# Video to Premium Scroll-Driven Website

Turn a video file into a scroll-driven animated website with animation variety and choreography: multiple animation types working together, not one repeated effect.

Consult [Landing page design](sand-workflow:landing-page-design) before choosing type, color, copy hierarchy, or spacing.

## Input

The user provides a video file path (MP4, MOV, etc.) and optionally:
- A theme or brand name
- Desired text sections and where they appear
- Color scheme preferences
- Any specific design direction

If those are missing, ask briefly or use sensible creative defaults.

## Premium Checklist (Non-Negotiable)

1. Lenis smooth scroll. Native scroll feels like a web page. Lenis feels like an experience.
2. 4+ animation types. Never repeat the same entrance animation consecutively.
3. Staggered reveals: label, then heading, then body, then CTA. Never all at once.
4. No glassmorphism cards. Text on clean backgrounds. Hierarchy via font size, weight, and color.
5. Direction variety. Sections enter from different directions (left, right, up, scale, clip).
6. Dark overlay for stats: 0.88-0.92 opacity, counters animate up. Only time center text is OK.
7. Horizontal text marquee. At least one oversized text element sliding on scroll (12vw+).
8. Counter animations. All numbers count up from 0. Never appear statically.
9. Massive typography: hero 12rem+, section headings 4rem+, marquee 10vw+.
10. CTA persists. data-persist="true" keeps the final section visible. It never disappears.
11. Hero prominence plus generous scroll. Hero gets 20%+ scroll range. 800vh+ total for 6 sections.
12. Side-aligned text ONLY. All text in the outer 40% zones (align-left / align-right), never center. Exception: stats with a full dark overlay.
13. Circle-wipe hero reveal. Hero is a standalone 100vh section. Canvas reveals via clip-path circle() as the hero scrolls away.
14. Frame speed 1.8-2.2. Product animation completes by about 55% scroll. Below 1.8 feels sluggish.

## Workflow

FFmpeg and FFprobe are expected on PATH. Do not reinstall them if they already work.

### Step 1: Analyze the Video

```
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,r_frame_rate,nb_frames -of csv=p=0 "<VIDEO_PATH>"
```

Target 150-300 frames:
- Short video (under 10s): extract at original fps, cap at about 300
- Medium (10-30s): extract at 10-15fps
- Long (30s+): extract at 5-10fps
Output resolution: match aspect ratio, cap width at 1920px.

### Step 2: Extract Frames

```
mkdir -p frames
ffmpeg -i "<VIDEO_PATH>" -vf "fps=<CALCULATED_FPS>,scale=<WIDTH>:-1" -c:v libwebp -quality 80 "frames/frame_%04d.webp"
```

Count files after extraction.

### Step 3: Scaffold

project-root contains index.html, css/style.css, js/app.js, and frames/. No bundler. Vanilla HTML/CSS/JS plus CDN libraries.

### Step 4: Build index.html

Required structure, in this order:
1. Loader: #loader, .loader-brand, #loader-bar, #loader-percent
2. Fixed header: .site-header nav with logo and links
3. Hero: .hero-standalone (100vh, solid bg, word-split heading) with .section-label, .hero-heading (words in spans), .hero-tagline, scroll indicator
4. Canvas: .canvas-wrap and canvas#canvas (fixed, full viewport)
5. Dark overlay: #dark-overlay (fixed, full viewport, pointer-events none)
6. Marquee: .marquee-wrap and .marquee-text (fixed, 12vw font)
7. Scroll container: #scroll-container (800vh+)
   - Content sections with data-enter, data-leave, data-animation
   - Stats section with .stat-number plus data-value and data-decimals
   - CTA section with data-persist="true"

Content section example HTML:

```html
<section class="scroll-section section-content align-left" data-enter="22" data-leave="38" data-animation="slide-left">
  <div class="section-inner">
    <span class="section-label">The Craft</span>
    <h2 class="section-heading">Precision in every frame</h2>
    <p class="section-body">Copy that earns its space. Keep it short, high-contrast, and side-aligned.</p>
  </div>
</section>
```

Stats section example HTML:

```html
<section class="scroll-section section-stats" data-enter="54" data-leave="72" data-animation="stagger-up">
  <div class="section-inner">
    <div class="stat">
      <span class="stat-number" data-value="24" data-decimals="0">0</span>
      <span class="stat-suffix">h</span>
      <span class="stat-label">Endurance</span>
    </div>
  </div>
</section>
```

CDN scripts at end of body, this order: lenis@1 jsdelivr, gsap@3 jsdelivr, gsap ScrollTrigger jsdelivr, js/app.js

```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="js/app.js"></script>
```

### Step 5: Build css/style.css

```css
:root { --bg-light:#f5f3f0; --bg-dark:#111111; --text-on-light:#1a1a1a; --text-on-dark:#f0ede8; --font-display: "PP Editorial New", "Playfair Display", Georgia, serif; --font-body: "Inter", system-ui, sans-serif; }
.align-left { padding-left:5vw; padding-right:55vw; }
.align-right { padding-left:55vw; padding-right:5vw; }
.align-left .section-inner, .align-right .section-inner { max-width:40vw; }
```

Also document:
- Hero-first: standalone 100vh solid bg. Canvas starts hidden, circle-wipe as hero scrolls away.
- Scroll sections: position absolute in the scroll container, midpoint of enter/leave, translateY(-50%).
- Mobile under 768px: collapse side alignment to centered text with dark backdrop. Scroll height about 550vh.
- Contrast: never #999 for important text on light backgrounds. Body #666 minimum. Headings use --text-on-light.

### Step 6: Build js/app.js

#### 6a Lenis mandatory

```js
const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

#### 6b Frame preloader

Two-phase: first 10 frames immediately, rest in background, progress bar, hide loader only after all frames ready.

```js
const FRAME_COUNT = 0;
const frames = [];
const FIRST_BATCH = 10;
function loadFrame(i) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { frames[i] = img; resolve(img); };
    img.onerror = reject;
    img.src = `frames/frame_${String(i + 1).padStart(4, "0")}.webp`;
  });
}
async function preloadFrames() {
  const bar = document.getElementById("loader-bar");
  const percent = document.getElementById("loader-percent");
  let loaded = 0;
  const tick = () => { loaded += 1; const p = Math.round((loaded / FRAME_COUNT) * 100); if (bar) bar.style.width = p + "%"; if (percent) percent.textContent = p + "%"; };
  await Promise.all(Array.from({ length: Math.min(FIRST_BATCH, FRAME_COUNT) }, (_, i) => loadFrame(i).then(tick)));
  await Promise.all(Array.from({ length: Math.max(0, FRAME_COUNT - FIRST_BATCH) }, (_, i) => loadFrame(i + FIRST_BATCH).then(tick)));
  document.getElementById("loader").classList.add("is-hidden");
}
```

#### 6c Canvas padded cover IMAGE_SCALE 0.85 (0.82-0.90)

```js
const IMAGE_SCALE = 0.85;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let sampledBg = "#111111";
function sampleBgColor(img) {
  const probe = document.createElement("canvas"); probe.width = 8; probe.height = 8;
  const pctx = probe.getContext("2d"); pctx.drawImage(img, 0, 0, 8, 8);
  const data = pctx.getImageData(0, 0, 8, 8).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n += 1; }
  sampledBg = "rgb(" + Math.round(r / n) + ", " + Math.round(g / n) + ", " + Math.round(b / n) + ")";
}
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const cw = window.innerWidth, ch = window.innerHeight;
  canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
  canvas.style.width = cw + "px"; canvas.style.height = ch + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function drawFrame(img, index) {
  const cw = window.innerWidth, ch = window.innerHeight;
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * IMAGE_SCALE;
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  if (index % 20 === 0) sampleBgColor(img);
  ctx.fillStyle = sampledBg; ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}
```

#### 6d FRAME_SPEED 2.0 (1.8-2.2)

ScrollTrigger on scroll container start top top end bottom bottom scrub true. index from min(progress * FRAME_SPEED, 1) * FRAME_COUNT. rAF draw on change.

```js
const FRAME_SPEED = 2.0;
let currentIndex = -1, rafId = 0;
ScrollTrigger.create({
  trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: true,
  onUpdate: (self) => {
    const index = Math.min(Math.floor(Math.min(self.progress * FRAME_SPEED, 1) * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
    if (index !== currentIndex) {
      currentIndex = index;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => { const img = frames[currentIndex]; if (img) drawFrame(img, currentIndex); });
    }
  }
});
```

#### 6e Section animation system

Read data-animation. persist if data-persist is true. Stagger .section-label, .section-heading, .section-body, .section-note, .cta-button, .stat. If persist, never reverse past leave. Position sections at midpoint of enter/leave with translateY(-50%).

```js
function animationFrom(type) {
  switch (type) {
    case "fade-up": return { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" };
    case "slide-left": return { x: -80, opacity: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" };
    case "slide-right": return { x: 80, opacity: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" };
    case "scale-up": return { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: "power2.out" };
    case "rotate-in": return { y: 40, rotation: 3, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out" };
    case "stagger-up": return { y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" };
    case "clip-reveal": return { clipPath: "inset(100% 0 0 0)", opacity: 0, stagger: 0.15, duration: 1.2, ease: "power4.inOut" };
    default: return { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" };
  }
}
document.querySelectorAll(".scroll-section").forEach((section) => {
  const enter = Number(section.dataset.enter), leave = Number(section.dataset.leave);
  const persist = section.dataset.persist === "true";
  const fromVars = animationFrom(section.dataset.animation);
  const targets = section.querySelectorAll(".section-label, .section-heading, .section-body, .section-note, .cta-button, .stat");
  gsap.set(section, { top: ((enter + leave) / 2) + "%", yPercent: -50 });
  gsap.set(targets, fromVars);
  ScrollTrigger.create({
    trigger: "#scroll-container", start: "top top", end: "bottom bottom",
    onUpdate: (self) => {
      const p = self.progress * 100;
      const active = persist ? p >= enter : p >= enter && p < leave;
      if (active) gsap.to(targets, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", stagger: fromVars.stagger, duration: fromVars.duration, ease: fromVars.ease, overwrite: "auto" });
      else if (!persist) gsap.to(targets, Object.assign({}, fromVars, { overwrite: "auto" }));
    }
  });
});
```

#### 6f Counters

.stat-number from 0 to data-value, duration 2, ease power1.out, snap 1 or 0.01 from data-decimals. ScrollTrigger start top 70%, toggleActions play none none reverse.

```js
document.querySelectorAll(".stat-number").forEach((el) => {
  const value = Number(el.dataset.value), decimals = Number(el.dataset.decimals || 0), proxy = { n: 0 };
  gsap.fromTo(proxy, { n: 0 }, {
    n: value, duration: 2, ease: "power1.out", snap: { n: decimals > 0 ? 0.01 : 1 },
    onUpdate: () => { el.textContent = proxy.n.toFixed(decimals); },
    scrollTrigger: { trigger: el, start: "top 70%", toggleActions: "play none none reverse" }
  });
});
```

#### 6g Marquee

each .marquee-wrap scrubs xPercent on .marquee-text across full scroll, default data-scroll-speed -25. Fade by range.

```js
document.querySelectorAll(".marquee-wrap").forEach((wrap) => {
  const text = wrap.querySelector(".marquee-text");
  const speed = Number(wrap.dataset.scrollSpeed || -25);
  gsap.fromTo(text, { xPercent: 0 }, { xPercent: speed, ease: "none", scrollTrigger: { trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: true } });
});
```

#### 6h Dark overlay #dark-overlay opacity 0 until enter, 0.9 between enter and leave, fadeRange 0.04.

```js
const overlay = document.getElementById("dark-overlay");
const overlayEnter = 0.54, overlayLeave = 0.72, fadeRange = 0.04;
ScrollTrigger.create({
  trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: true,
  onUpdate: (self) => {
    const p = self.progress;
    let opacity = 0;
    if (p < overlayEnter) opacity = gsap.utils.clamp(0, 0.9, (p - (overlayEnter - fadeRange)) / fadeRange) * 0.9;
    else if (p <= overlayLeave) opacity = 0.9;
    else opacity = gsap.utils.clamp(0, 0.9, 1 - (p - overlayLeave) / fadeRange) * 0.9;
    overlay.style.opacity = String(opacity);
  }
});
```

#### 6i Circle-wipe: hero opacity max(0, 1 - p * 15). canvas wrap clip-path circle from 0% to 75% at 50% 50% over p 0.01 to 0.07.

```js
const hero = document.querySelector(".hero-standalone");
const canvasWrap = document.querySelector(".canvas-wrap");
ScrollTrigger.create({
  trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: true,
  onUpdate: (self) => {
    const p = self.progress;
    if (hero) hero.style.opacity = String(Math.max(0, 1 - p * 15));
    const wipe = gsap.utils.clamp(0, 1, (p - 0.01) / 0.06);
    if (canvasWrap) canvasWrap.style.clipPath = "circle(" + (wipe * 75) + "% at 50% 50%)";
  }
});
```

### Step 7: Test

Serve over HTTP (npx serve . or python -m http.server 8000). Never file://. Scroll fully. Each section a different animation type. Confirm Lenis, frames, staggers, marquee, counters, overlay, persisting CTA.

## Animation Types Quick Reference

| Type | Initial State | Animate To | Duration |
| --- | --- | --- | --- |
| fade-up | y 50, opacity 0 | y 0, opacity 1 | 0.9 |
| slide-left | x -80, opacity 0 | x 0, opacity 1 | 0.9 |
| slide-right | x 80, opacity 0 | x 0, opacity 1 | 0.9 |
| scale-up | scale 0.85, opacity 0 | scale 1, opacity 1 | 1.0 |
| rotate-in | y 40, rotation 3, opacity 0 | y 0, rotation 0, opacity 1 | 0.9 |
| stagger-up | y 60, opacity 0 | y 0, opacity 1 | 0.8 |
| clip-reveal | clipPath inset(100% 0 0 0), opacity 0 | inset(0% 0 0 0), opacity 1 | 1.2 |

## Anti-Patterns

- Cycling feature cards in a pinned section. Give each feature its own 8-10% range and animation type.
- Pure cover (Math.max at 1.0) clips into the header. Use IMAGE_SCALE 0.82-0.90.
- Pure contain (Math.min) leaves a border that does not match page bg.
- FRAME_SPEED under 1.8 feels sluggish.
- Hero under 20% scroll range needs more room.
- Same entrance type on consecutive sections.
- Wide centered grids over canvas. Use vertical lists in the 40% side zone.
- Scroll height under 800vh for 6 sections feels rushed.

## Clip-Path Variations

- Circle: 0% to 75% at 50% 50%
- Wipe from left: inset 0 100% 0 0 to inset 0 0% 0 0
- Wipe from bottom: inset 100% 0 0 0 to inset 0% 0 0 0
- Polygon expand from a vertical line to full rect

## Troubleshooting

- Frames not loading: must serve via HTTP, not file://
- Choppy scrolling: increase scrub, reduce frame count
- White flashes: wait until all frames loaded before hiding loader
- Blurry canvas: devicePixelRatio scaling
- Lenis conflicts: connect lenis scroll to ScrollTrigger.update
- Counters stuck: data-value and snap vs decimals
- Mobile memory: under 150 frames, 1280px wide


## Known good (production lock)

Locked 2026-09-01 after operator yes on the Betawise-type earth scroll demo.

**Score new work against this pile before a client or prod ship.**

- Live known-good site: `/workspace/orb-scroll-demo` (serve `python3 -m http.server 4861 --bind 127.0.0.1`)
- Frozen templates (no frame dump): this skill folder `known-good/` (`index.html`, `css/style.css`, `js/app.js`, `generate_frames.py`, `assets/land-mask.png`, `preview-frame.png`)
- Visual: owned Betawise-type earth. Continents as a land-mask point cloud (~19178 points), oceans empty, cyan limb, 4 orbit hairlines, starfield, night falling off the left/lower limb. Algorithm from `/workspace/ingest-sites/betawise-earth/assets/globe.js`. Do not copy ThreeUI/Betawise HTML, wordmark, or their preview webm.
- Thinking Orbs 90-dot lattice is chat UI only. Never use it as the marketing canvas.
- FRAME_SPEED 2.0 with `min(progress * FRAME_SPEED, 1)` then index. Never modulo-wrap the frame index.
- Click-pass: loader to 100%, globe continents readable on scroll, persist CTA `Start from your own film` returns to hero. Looks good without a click = fail.

### Next real production job

1. Take the client or product mp4.
2. ffprobe, extract 150-300 webp frames per this skill (or run `generate_frames.py` only when the visual IS the earth orb).
3. Clone `known-good/` scaffold. Swap `frames/`, rewrite copy, keep Lenis/GSAP/circle-wipe/side-align.
4. Consult [Landing page design](sand-workflow:landing-page-design) for type and color. No hyphens in copy. Geist only.
5. Click the live CTA. Do not publish until the operator says ship.


## Bookmark enrich 2026-09-07 — Marketing site from AI video
Source: X `20260907-1051` · animated marketing tutorials (@chhddavid) · homepage vs LP (@UiSavior).

- When a bookmark sells “AI built a $50k animated site,” score against **known-good** scaffold first (clone → swap frames/copy → click-pass). $ claims stay **UNVERIFIED**.
- If the ask is a **landing page** (one offer), consult [landing-page-design](sand-workflow:landing-page-design) before scroll theater. Homepage multi-intent ≠ LP.
- Platform: **Cursor / Forge**. Install: **none (process-only)**; production path = known-good clone only.
