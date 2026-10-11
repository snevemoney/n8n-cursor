---
name: Landing page design
description: >-
  Use whenever building, editing, styling, reviewing, or writing copy for any
  landing page, marketing site, section, component, or prototype. Consult before
  choosing sections, headlines, CTAs, fonts, sizes, spacing, radii, backgrounds,
  icons, or transitions.
---
# Landing Page Design

A landing page is not a homepage. A homepage serves multiple intents. A landing page wins one intent:

**one offer → one audience → one primary action.**

This skill has two halves. **Part A** decides what the page says and how it is structured. **Part B** is the non negotiable visual system. Work through A before touching B.

## Scope

Apply to all web UI work: landing pages, marketing sites, components, dashboards, prototypes, and design reviews. When a rule here conflicts with a framework default, this file wins. When the user's explicit prompt conflicts with a rule, the user wins.

**Companion skill.** For upgrading an *existing* site rather than building a new one, use redesign-existing-projects. It diagnoses generic patterns and defers to this file for every concrete value.

---

# PART A — Strategy and structure

## A1. Intake

Gather these before designing or writing. Ask only for what is missing, and ask in one batch rather than one question at a time.

**Purpose**
- What is the ONE primary action? (trial, demo, buy, waitlist, download)
- What is the offer, exactly what do they get?
- What counts as a conversion? (click, signup, purchase)

**Audience and context**
- Who is the ICP?
- What problem are they trying to solve?
- Top three objections, meaning why they do not convert today
- Traffic source: ads, search, social, email
- What do visitors already know when they land?

**Proof and assets**
- Proof points: logos, testimonials, numbers, case studies
- Screenshots, demo video, product GIFs
- Guarantees, refund terms, cancellation terms

**Constraints**
- Brand voice: casual or professional
- Design direction: minimal editorial, playful 3D, glass UI
- Mobile priority?

If the user cannot answer, make a reasonable assumption, state it in one line, and continue. Do not stall the build.

## A2. Page structure

**Above the fold (required)**
1. Headline, outcome plus audience
2. Subheadline, clarifies how and adds specificity
3. Primary CTA, clear verb plus what they get
4. One proof signal, logo strip, stat, or short testimonial
5. Hero visual, product screenshot or video, or a strong illustration

**Mid page (the argument)**
6. Problem to solution, one section
7. Benefits, three to five, outcome driven
8. How it works, three steps
9. Social proof, testimonials or a case study

**Bottom (objection handling)**
10. FAQ, six to twelve questions
11. Risk reversal, trial, cancel anytime, guarantee
12. Final CTA, identical to the top

Include the mandatory tagline reveal section from B11 somewhere in the mid page argument, typically right after the hero or after benefits.

## A3. Layout selection

Pick one and say why.

| Type | Use when |
|---|---|
| **A. Classic hero plus sections** | The product is understandable from a hero screenshot. Most common. |
| **B. Long form story** | You need to educate and overcome skepticism. |
| **C. Minimal conversion page** | High intent traffic (email to known users), or a short offer like a download or waitlist. |
| **D. Comparison page** | Search intent includes alternatives ("X vs Y", "best for"). Usually paired with SEO pages. |

## A4. Conversion rules

**Match message to source.** If traffic comes from ads, mirror the ad headline in the hero and keep the same promise and visual tone.

**Make the next step obvious.** One primary CTA. Never place competing CTAs above the fold.

**Write benefit first.** Features are what it does. Benefits are what that means for them.

**Be specific.**
- ❌ "Save time and streamline"
- ✅ "Cut your weekly reporting from 4 hours to 15 minutes"

**Reduce risk.** Pick at least one: free trial, free plan, no credit card, cancel anytime, money back guarantee.

**Treat objections as a section, not a footnote.** Move the FAQ earlier for high friction offers. Put proof directly beside the claim it supports.

## A5. Copywriting

**Headline formulas**
- "{Outcome} without {pain}"
- "The {category} for {audience}"
- "Ship {result} in {time}"

**Subheadline.** One or two sentences. Clarify what it is and who it is for.

**CTA.** Verb plus what they get. Never "Learn more" or "Submit". Use "Start free trial", "Book a demo", "Get the checklist".

**Benefit bullets.** Bold benefit, then the proof or detail. Example: **Faster iteration** — generate three layout variants in one click.

Note: the copy rules in B1 still apply. No hyphens inside sentences, no orphaned words.

## A6. Build order

Work section by section, in this order:

1. Hero
2. Benefits
3. How it works
4. Proof
5. FAQ
6. Final CTA

Never rebuild the whole page on each iteration. Section by section keeps control and keeps diffs reviewable.

## A7. SEO and AEO

**Do not index** ad only campaign pages or highly time bound offers. Use `noindex` or keep them behind a non indexed path.

**Do index** evergreen offers and pages where search intent matches the promise. Add a clear title and meta description, internal links from the homepage and feature pages, and the FAQ in plain question and answer form for AEO. Add FAQ schema if appropriate.

## A8. Pitfalls

- Too many CTAs above the fold
- Vague value prop: "streamline", "optimize"
- A large feature list with no outcomes
- Proof buried at the bottom
- Mobile layout that breaks readability
- No clear next step

---

# PART B — Visual system

Every visual value must resolve through these rules instead of being invented ad hoc.

## B1. Typography

### Fonts

**Use:** Geist, Manrope, Geist Mono, Poppins.

**Never use:** Inter, Roboto, Arial, Open Sans, Helvetica.

**Never use italic fonts** anywhere in the interface.

**One typeface per site.** Do not pair two fonts unless the prompt explicitly asks for it. Geist Mono is allowed alongside a primary font only for code, data, or numeric UI where a monospace is functionally required.

**Never use ultra bold weights** (900 / black). Cap at semibold or bold.

### Copy rules

**No hyphens in text.** Do not use `-` inside body copy, headings, or labels. Rewrite the phrase instead.

**No orphaned words.** A single word must never sit alone on the last line. Apply `text-wrap: balance` for headings and `text-wrap: pretty` for body copy.

### Type scale

Always resolve font sizes to Tailwind's default type scale. Never leave arbitrary values in place.

If an existing size does not land exactly on a step, snap it to the **closest step below**, taking both the size and its paired line height.

| Class | Size | Line height |
|---|---|---|
| `text-xs` | 12px (0.75rem) | 16px |
| `text-sm` | 14px (0.875rem) | 20px |
| `text-base` | 16px (1rem) | 24px |
| `text-lg` | 18px (1.125rem) | 28px |
| `text-xl` | 20px (1.25rem) | 28px |
| `text-2xl` | 24px (1.5rem) | 32px |
| `text-3xl` | 30px (1.875rem) | 36px |
| `text-4xl` | 36px (2.25rem) | 40px |
| `text-5xl` | 48px (3rem) | 1 |
| `text-6xl` | 60px (3.75rem) | 1 |
| `text-7xl` | 72px (4.5rem) | 1 |
| `text-8xl` | 96px (6rem) | 1 |
| `text-9xl` | 128px (8rem) | 1 |

### Button type

- Main buttons: `text-base` (16px), semibold.
- Smaller header buttons: `text-sm` (14px), semibold.

## B2. Spacing

Only these values. Nothing between them, nothing outside them.

| Token | Value |
|---|---|
| Spacing-0 | 0 |
| Spacing-25 | 2px |
| Spacing-50 | 4px |
| Spacing-75 | 8px |
| Spacing-100 | 12px |
| Spacing-200 | 16px |
| Spacing-300 | 24px |
| Spacing-400 | 32px |
| Spacing-500 | 40px |
| Spacing-600 | 48px |
| Spacing-700 | 64px |
| Spacing-800 | 80px |
| Spacing-900 | 96px |

**Main buttons:** 8px vertical padding, 12px horizontal padding.

## B3. Corner radius

Only use Tailwind's radius values.

**Nested radius formula.** When a shape sits inside another shape and the gap between them is **less than 32px**:

```
inner radius = outer radius − gap
```

Apply this only when the result is **greater than 2**.

## B4. Borders and backgrounds

- **Never apply a border to only one side of a card.** Borders go all the way around or not at all.
- **Never use gradients in backgrounds.** Backgrounds are flat.

### Dark mode background colors

Use only these:

`#000000` · `#181818` · `#1F1F1F` · `#272727` · `#313131` · `#131209`

## B5. Hero section

### Heading color

- **Dark theme:** left to right gradient on the heading text, `#FFFFFF` → `#9B9B9B`.
- **Light theme:** left to right gradient on the heading text, `#000000` → `#666666`.

This is the one place gradients are used, and only on text, never on the background.

### Layout

- Heading and subheading both get a **max width of 680px**.
- Read the heading copy and insert line breaks at **meaningful** points.

## B6. Icons

**Use:** Phosphor, Solar, or Iconamoon.

**Never use:** Material Icons, Material Symbols.

## B7. Motion choreography (fluid dynamics)

Never use default transitions. All motion simulates real world mass and spring physics through custom cubic beziers.

```
transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
```

### Fluid island nav

**Closed state.** The navbar is a floating glass pill detached from the top: `mt-6`, `mx-auto`, `w-max`, `rounded-full`.

**Hamburger morph.** On click, the hamburger lines fluidly rotate and translate into a perfect X using `rotate-45` and `-rotate-45` with absolute positioning.

**Modal expansion.** The menu opens as a screen filling overlay with a heavy glass effect: `backdrop-blur-3xl bg-black/80` or `bg-white/80`.

**Staggered mask reveal.** Nav links fade in and slide up, staggered per item.

### Scroll interpolation

Elements never appear statically on load. As they enter the viewport they execute a gentle, heavy fade up:

```
translate-y-16 blur-md opacity-0  →  translate-y-0 blur-0 opacity-100
```

over 800ms or longer.

For JavaScript driven reveals use `IntersectionObserver` or Framer Motion's `whileInView`. **Never use `window.addEventListener('scroll')`**.

---

## B8. Content realism

Never ship filler. No Lorem Ipsum, no John Doe, no placeholder brands, no round fake numbers, no AI cliches. Sentence case headers. Active voice.

## B9. States

Every interactive element ships with hover, active, focus, loading, empty, and error. No dead links.

## B10. Ship requirements

Privacy, terms, 404, form validation, skip to content, cookie consent where required, favicon, meta tags, alt text, semantic HTML, a way back.

## B11. Tagline reveal section (mandatory)

Every landing page includes one large type section stating the core benefit or tagline, separate from the hero. It sits further down the page as its own moment, not stacked directly under the hero.

**Copy**
- Minimum two lines of text.
- A benefit statement or tagline, written in the voice of A5, not a generic section heading.

**Typography**
- Size `text-4xl` to `text-6xl` depending on line count.
- Max width capped like the hero.

**Animation**
- Text starts in a subtle, muted tone, roughly 25 to 35% opacity.
- As the section scrolls into view, each word transitions individually from that muted tone to the full text color, in reading order.
- Words activate one at a time as they cross a trigger line.
- Implement with `IntersectionObserver` per word, or a single scroll listener throttled through `requestAnimationFrame`. Never an unthrottled `window.addEventListener('scroll')`.

---

# Output format

When generating a landing page from scratch, return these in order before writing code:

1. **Page outline**
2. **Hero copy**
3. **Benefits**
4. **How it works**
5. **FAQ**
6. **SEO / AEO**
7. **Layout recommendation**

Then build section by section per A6.

---

# Quick checklist

**Strategy**
- [ ] One offer, one audience, one primary action
- [ ] No competing CTAs above the fold
- [ ] Specific numbers instead of vague verbs
- [ ] At least one risk reversal
- [ ] Proof sits next to the claim it supports
- [ ] Layout type chosen deliberately

**Visual**
- [ ] Single approved typeface, no italics, no ultra bold
- [ ] No hyphens in copy, no orphaned words
- [ ] Every font size lands on a Tailwind scale step
- [ ] Every spacing value comes from the spacing table
- [ ] Nested radii follow the formula
- [ ] No single sided card borders, no background gradients
- [ ] Hero heading and subheading capped at 680px with meaningful line breaks
- [ ] Icons from Phosphor, Solar, or Iconamoon
- [ ] Custom cubic bezier, IntersectionObserver reveals
- [ ] Tagline reveal section present, words activate one at a time on scroll

**Content and ship**
- [ ] No Lorem Ipsum, no placeholder brands, no AI cliches, no round fake numbers
- [ ] Hover, active, focus, loading, empty, and error states
- [ ] No dead links
- [ ] 404, legal links, form validation, favicon, meta tags, alt text


## Bookmark enrich 2026-09-07 — Homepage vs LP + AI LP skill watch
Source: X bookmarks live packet `20260907-1051` · @UiSavior homepage vs LP · @dannypostma “AI writes code / terrible LPs” free skill · @chhddavid animated marketing sites ($50k = **UNVERIFIED**).

- Reaffirm: **homepage ≠ landing page**. Multi-intent nav/home → use homepage IA; one-offer conversion → this skill’s single-CTA checklist.
- AI LP packs: treat as **taste/process** signals (hierarchy, proof next to claim, risk reversal). Do **not** auto-install third-party skill files — propose via [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate) only if operator yes.
- Animated marketing sites → pair [cinematic-site-recipe](sand-workflow:cinematic-site-recipe) + [video-to-website](sand-workflow:video-to-website) known-good; Remotion WORKAROUND for cinema tutorials (no Fable / Claude desktop face).
- Platform: **Grok Bot / Cursor**. Install: **none (process-only)** unless operator greens an import-gate skill file.


## X bookmarks enrich 2026-09-07

Packet: `/workspace/research/packets/x-bookmarks/20260907-1051/`

- **Homepage vs Landing Page** (@UiSavior): homepage = multi-path product home; LP = one offer/one CTA. Check this before visual polish.
- **AI designs terrible LPs** (@dannypostma): **RESEARCH-OK** — remap to this skill + `cinematic-site-recipe` + `video-to-website`; no mall install. Platform: Cursor + Grok Bot. Install: none unless import-gate.
- Animated site demos (@chhddavid): $50k = **UNVERIFIED**. **WORKAROUND** Claude-desktop → Remotion/video-to-website known-good.

## Repass 20260909 wave AC — Multi-direction pick
- Force ≥3 divergent directions; operator picks before code; then reviewer against slop list (RVeCbPg0liw).

## X bookmarks 20260925-1019 (`x:2095927702758838588` ab_workss)

Packet: `/workspace/research/packets/x-bookmarks/20260925-1019-desktop/`.

**FACT (preview):** Homepages get a few seconds; creator lists 4 approaches to make the product click.

**Map:** Fold as craft inspiration under Part A (one intent / hierarchy) + Part B visual system. Pair [cinematic-site-recipe](sand-workflow:cinematic-site-recipe) + [taste-landing-enrich](sand-workflow:taste-landing-enrich). Cap video HELD — do not deep-watch or ADOPT vendor 4-ways as doctrine this fire. Label **WORKAROUND** / Cap.


## X bookmarks 20260930-1616-desktop — one-brief video+landing
`x:2105023417716191488` @ArchiveExplorer: Opus 5.5 claimed to ship launch video + ad cuts + landing from one brief. STRENGTHENS brief→landing pairing with motion-pipeline / remotion-brief-to-render. Cap HELD for recreation atoms. Timing UNVERIFIED. Install: **none**. NO mint.

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **DESIGN.md seeds.** Ready-made DESIGN.md files (styles.refero.design, designmd.me, getdesign.md, design-md.hyperbrowser.ai) and per-section galleries (supahero.io, cta.gallery) can seed taste before the build (x:2095213960719208618, x:2095078647652917329). Sites existed per the posts; check each one live before relying on it.
- **Motion sites.** Use the official `greensock/gsap-skills` so the agent writes real GSAP/ScrollTrigger APIs. Animate only transform and opacity, honour prefers-reduced-motion, and put a cost-approval gate in front of any paid Higgsfield generation (x:2067213248517017884). The repo was gated in this packet: see `repos/greensock_gsap-skills.json`.
- **Cheap fake 3D.** Scrub a pre-rendered video with scroll position instead of building WebGL (x:2074158868142194898).
- **Style bible plus fail-only verifier.** Reverse-engineer three reference sites into a style bible (mood, type, pacing, and why each choice works), then loop the build against a fresh-context verifier until the biggest gap closes (x:2077199463278395732). Loop mechanics: agent-harness-loops `fresh_verifier_loop.py`.
