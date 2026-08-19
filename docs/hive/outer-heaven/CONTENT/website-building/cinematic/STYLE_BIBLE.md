# Style bible — cinematic-ai-partner (v2)

**Lane:** `ai-partner-websites`  
**Owner:** Creative Studio · 2026-08-13  
**For:** Forge wrap (no code until WHY exists — this file is that lock)  
**Refs:** Inkwell · Streets of Punk · fromanother (live, 2026-08-12)  
**Preview residual:** https://cinematic-ai-partner.vercel.app/ — no prod deploy  
**Do not:** GOD-MODE copy · tweet prices · WebGL default · Arcads MCP · Higgsfield generate (credits)

Label: **FACT** · **OPINION** · **INFERENCE**

---

## One-paragraph brief (hand to Forge)

AI Partner landing for SMB operators: a short cinematic **scroll-story** (hook → constraint → Acquire/Grow/Cut proof → how → CTA) whose **hero is muted video driven by scroll + cursor**, not Three.js. Every animation has a job — reveal the next beat, scrub the film, or keep the CTA reachable — or it does not ship. Dark premium; signature = cool light leak + grain.

---

## 1) Inkwell — https://inkwell.tech/

| | |
|--|--|
| **Mood** | Cool-dark, low density, atmospheric rather than neon. Quiet confidence. **OPINION:** closest tonal match to “AI Partner, not automation guy.” |
| **Type** | Large restrained display over plates; sparse body; labels as orientation, not chrome. High contrast on dark. |
| **Pacing** | Long-form three-act (**FACT** Awwwards). **Our steal:** same *scene-as-section* idea, compressed to ~1–1.5vh per beat (5 beats, not a 10-min film). Soft ease-out, no bounce. |
| **WHY motion exists** | Motion is the **narrative cut**. It sells “this is a directed story, not a SaaS template.” Pathfinder exists so you never feel lost — not as decoration. End CTA exists because the arc earned the ask. |

**Ship:** three-act framing, pathfinder-as-progress (optional, read-only), quiet CTA.  
**Do not ship:** their WebGL/physics stack.

---

## 2) Streets of Punk — https://dappasol.com/streetsofpunk

| | |
|--|--|
| **Mood** | Cold-open energy; full-bleed; cover-fit or it dies. Density high in the *media*, not in the UI chrome. |
| **Type** | Per-word kinetic lines; split headlines; type is the second camera. Keep word count low. Real HTML over media (**FACT** build log). |
| **Pacing** | Scroll **is** the timeline (**FACT**: scroll position → frame). Linear-to-scroll + soft dissolves. Site-wide pin is too expensive for our demo. |
| **WHY motion exists** | Scrub sells **immersion** (“you’re inside the film”) without a 3D team. Kinetic type sells **editorial control**. Cover-fit exists so letterboxing doesn’t break the cinema read. |

**Ship:** hero as scroll-scrubbed (or loop + scroll-linked scale/opacity) **video**; HTML overlay; cover-fit.  
**Do not ship:** full-page pinned JPEG-sequence WebGL; unmuted autoplay.

---

## 3) fromanother — https://www.fromanother.love/

| | |
|--|--|
| **Mood** | Editorial, taste-first, fluid light via **video layering / blend** (**FACT** SOTD notes) — not shaders everywhere. Generous negative space around stills. |
| **Type** | Large display statements; numbered chapters. **OPINION:** steal pacing, not shapeshifting identity labels (confuses SMB operators). One stable wordmark. |
| **Pacing** | Shared timeline, long ease-outs, overlapping enters. More portfolio-length than conversion-length — **compress**. |
| **WHY motion exists** | Overlap/ease-out sells **choreography** (one director). Blend/video-layer sells **atmosphere cheaply**. WebGL is reserved for signature moments so the rest of the page stays maintainable. |

**Ship:** shared easing token, video/blend atmosphere, editorial whitespace.  
**Do not ship:** award walls, constant rebrand mid-scroll, multi-canvas WebGL.

---

## Locked tokens (from brand-call)

`--bg #0A0A0C` · `--surface #141418` · `--text #F2F2F4` · `--muted #8B8B96` · `--accent #5B8CFF` · `--line #2A2A32`  
Display: Instrument Serif / Newsreader (hook only). Body: Geist/Inter.  
Signature: **light leak + grain** (glass only in hero).  
Easing: `cubic-bezier(0.22, 1, 0.36, 1)`

---

## Motion jobs (if it has no job, cut it)

| Motion | Job |
|--------|-----|
| Hero video loop / scroll-scrub | Make the first viewport feel expensive; carry the light-leak motif |
| Cursor parallax (subtle, hero only) | Presence — “the plate notices you”; **not** fake 3D |
| Section fade/translateY | Mark beat changes (hook → constraint → proof…) |
| Pathfinder or scroll progress | Orientation, skip-anxiety |
| CTA rest state | Always reachable; no motion required to find it |
| `prefers-reduced-motion` | Static poster; instant layout; offer still readable |

Nothing else moves on v1.

---

## Hero clip pipeline (Creative Studio → Forge)

**Status:** v1 plates already in `assets/` (WebM ~272KB, MP4 ~631KB, poster jpg/webp). Higgsfield generate **off** (credits). Seedance/Runway regen is optional later — not blocking wrap.

1. **Stills** — `hero-poster` + broll WebPs (use WebP on-page, PNG masters off-page)  
2. **Previs** — 3-frame crossfade already encodes light-leak travel L→R→loop. Enough for v1.  
3. **Video** — muted 9.5s 1080p under 4MB. Forge: `autoplay muted loop playsinline` + **scroll progress 0→1** (opacity/scale or `currentTime` scrub) + **cursor** (translate hero plate 4–8px max).  
4. **Not WebGL.** Reduced-motion → poster only.

Higgsfield/AE: P1 proof already accepted (`higgsfield-ae-proof/`). Conceptual layer-stack, **not** a plugin SKU. Live AE screenshot still optional / blocked on operator sign-in. No credit burn.

---

## Fail-the-build bar (for Forge second pass)

> A motion designer can’t tell this from an agency.

Biggest likely gaps vs that bar (OPINION): hero still reads as “looping poster” if scroll/cursor aren’t wired; proof cards may still feel SaaS; type may be all-sans. Close those before another asset regen.
