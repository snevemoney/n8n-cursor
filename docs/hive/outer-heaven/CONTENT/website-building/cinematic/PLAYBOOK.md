# Cinematic Site Playbook v2 — locked 2026-08-13

**Lane:** `ai-partner-websites`  
**Owners:** Forge (page wrap + fail-the-build pass) · Creative Studio (style bible + hero clip)  
**Extends:** `CONTENT/website-building/` — do not replace the 12 site skills  
**Source:** Researcher FINDINGS addendum 2026-08-13 11:37 ET — full @0xMiraqle tweet text (recipe only) + @monokern (video, not WebGL)  
**Do not copy:** jailbreak / “GOD-MODE” tone, paid article, unverified price tags

Label legend: **FACT** · **INFERENCE** · **OPINION** · **UNVERIFIED**

---

## Locked recipe (run in this order)

Every cinematic site in this lane follows these five steps. Skip none.

### 1) Three reference sites → style bible
Creative Studio picks **3 live sites whose motion we actually love**. For each, write:

- mood (light, color temperature, density)
- type (display vs body, scale, tracking)
- pacing (how long a beat holds; what scroll distance does)
- **WHY each motion exists** (what it is selling, not “it looks cool”)

Output: `cinematic/motion-ref-pack.md` (or a per-client copy). No code until this exists.

### 2) One-paragraph brief
Forge writes **one paragraph** before scaffold:

> Niche + cinematic scroll + every animation has a job.

If a motion cannot be named in that paragraph, it does not ship. See `DEMO_BRIEF.md` for the AI Partner demo paragraph.

### 3) House rules (non-negotiable)
- No template hero
- No stock gradients as the look
- Nothing moves without a reason
- Taste work stays on a strong model — do not send art direction to a small/cheap model (**FACT** of the @0xMiraqle recipe; we do not copy the jailbreak wrapper)
- No WebGL / Three.js default. Hero is **video driven by scroll + cursor** (**FACT** @monokern: see-through scrub, “3D” scroll, mouse tracking — afternoon, not a 3D team)

### 4) Fail-the-build pass (second pass only)
After the first wrap exists, a **second pass whose only job is to FAIL the build** against:

> A motion designer can’t tell this from an agency.

Not a polish pass. Not “looks good.” List the biggest gaps. Close the biggest one. Repeat until the verifier runs out of complaints, then ship a **live preview URL**. Overnight loop allowed: build → grade → close the biggest gap.

**Reject 70% done:** open the URL, click the path, check mobile, check reduced-motion. Docs ≠ done.

### 5) Hero is video (scroll + cursor), not WebGL
Creative Studio owns the clip: stills → previs → Seedance/equivalent → grade.  
Forge wraps: muted loop, poster, scroll-scrub + cursor parallax, `prefers-reduced-motion` → static poster.

---

## What “cinematic site” means here (OPINION, unchanged)

Not a Three.js agency rebuild by default. A **premium marketing page** that feels filmic:

1. Strong art direction (tokens + one signature motif)
2. Motion with intent (scroll/timeline, not random floaties)
3. Hero that reads as expensive — **video in a scroll frame**, not real-time 3D
4. Taste references before code
5. Ship on owned stack (Next/Astro + Vercel) so agents can maintain it

---

## Bookmark-derived workflow (keep)

| Step | Pattern | Hive move |
|------|---------|-----------|
| A. Taste pack | 3 motion sites + why | Creative Studio style bible |
| B. Previs | Pose/depth before video (@TheoMediaAI / JoshDaws still→previs) | Optional; skip only if hero is already a finished clip |
| C. Generate plates | Stills → Seedance/Runway (@ibexdream, @monokern) | Creative Studio: 1–2 hero clips |
| D. Wrap in code | Immersive scroll around video | Forge Next/Astro page |
| E. Fail pass | Second model/agent FAILS vs agency bar | Forge + Researcher DoD |
| F. Polish | Reduced-motion, perf, SEO | `a11y-pass` + `perf-pass` + `seo-pass` |
| G. Click the live URL | Agent opens and clicks (vibe-test) | Forge + Watchdog — no “looks good” |

Related watch-later (not a new stack): @viktoroddy 21-min / motionsites.ai. Spanish @maarcoofdezz tutorial only if these rules are not enough.

---

## Skills to encode (add, do not replace)

1. `cinematic-brief` — niche + scroll + every animation has a job
2. `motion-ref-pack` — 3 refs: mood, type, pacing, WHY
3. `hero-media-pipeline` — stills → clip → poster → compressed WebM/MP4
4. `cinematic-scaffold` — Next App Router landing, video hero, tokens
5. `scroll-story` — beat sheet mapped to scroll stops
6. `motion-budget` — CSS/Framer Motion; video hero; never WebGL by default; always reduced-motion
7. `fail-the-build` — second pass vs agency bar; ship only when complaints run out
8. `cinematic-ship` — Lighthouse mobile, CDN video, OG from poster

---

## Stack (OPINION)

| Choice | Default |
|--------|---------|
| Framework | Next.js App Router |
| Styling | Tailwind + CSS variables from `design-tokens` |
| Motion | CSS + Framer Motion; **video hero primary**; scroll + cursor, not WebGL |
| CMS | None for v1 demo |
| Host | Vercel preview only until operator Tier 3 for a prod domain |
| AI build | Cursor cloud agent / Claude Code — not Lovable-as-production |

---

## Anti-patterns

- Template hero / stock-gradient look
- Motion with no job
- WebGL/Three.js as the default “cinematic”
- Autoplaying heavy unmuted video
- Fake 3D that dies on mobile
- Copying jailbreak / “GOD-MODE” prompt tweets into production prompts
- Quoting tweet prices as our SKU or as a sold case study
- Shipping on Lovable/v0 with no Git
- Saying “looks good” without opening the live URL and clicking
- Ignoring reduced-motion / LCP

---

## Definition of done

- Style bible from 3 refs exists (WHY filled in)
- One-paragraph brief exists
- House rules held
- Fail-the-build pass ran and remaining complaints are empty or accepted in writing
- Live **preview URL** (not a screenshot-only handoff)
- Hero = muted video + poster; reduced-motion path works
- Mobile click path works

AI Partner demo specifics: `DEMO_BRIEF.md`. Live preview residual: https://cinematic-ai-partner.vercel.app/
