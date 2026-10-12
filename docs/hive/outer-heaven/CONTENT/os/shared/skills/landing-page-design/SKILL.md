---
name: Landing page design
description: >-
  Use whenever building, editing, styling, reviewing, or writing copy for any
  landing page, marketing site, section, component, or prototype. Consult before
  choosing sections, headlines, CTAs, fonts, sizes, spacing, radii, backgrounds,
  icons, or transitions.
merged_from: [frontend-design, taste-landing-enrich, uupm-craft-checklist, uupm-ui-styling-literacy, vercel-web-design-guidelines]
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

**Map:** Fold as craft inspiration under Part A (one intent / hierarchy) + Part B visual system. Pair [cinematic-site-recipe](sand-workflow:cinematic-site-recipe) + [landing-page-design](sand-workflow:landing-page-design). Cap video HELD — do not deep-watch or ADOPT vendor 4-ways as doctrine this fire. Label **WORKAROUND** / Cap.


## X bookmarks 20260930-1616-desktop — one-brief video+landing
`x:2105023417716191488` @ArchiveExplorer: Opus 5.5 claimed to ship launch video + ad cuts + landing from one brief. STRENGTHENS brief→landing pairing with motion-pipeline / motion-pipeline. Cap HELD for recreation atoms. Timing UNVERIFIED. Install: **none**. NO mint.

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **DESIGN.md seeds.** Ready-made DESIGN.md files (styles.refero.design, designmd.me, getdesign.md, design-md.hyperbrowser.ai) and per-section galleries (supahero.io, cta.gallery) can seed taste before the build (x:2095213960719208618, x:2095078647652917329). Sites existed per the posts; check each one live before relying on it.
- **Motion sites.** Use the official `greensock/gsap-skills` so the agent writes real GSAP/ScrollTrigger APIs. Animate only transform and opacity, honour prefers-reduced-motion, and put a cost-approval gate in front of any paid Higgsfield generation (x:2067213248517017884). The repo was gated in this packet: see `repos/greensock_gsap-skills.json`.
- **Cheap fake 3D.** Scrub a pre-rendered video with scroll position instead of building WebGL (x:2074158868142194898).
- **Style bible plus fail-only verifier.** Reverse-engineer three reference sites into a style bible (mood, type, pacing, and why each choice works), then loop the build against a fresh-context verifier until the biggest gap closes (x:2077199463278395732). Loop mechanics: agent-harness-loops `fresh_verifier_loop.py`.

---

## Merged from `frontend-design` (2026-10-11)

- Original description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
- Unique content carried: frontend-design aesthetic-direction section; taste dials; uupm 1→10 craft checklist; dark-mode/utility CSS literacy; Vercel Web Interface Guidelines rules file (keep upstream file verbatim)
- Original support files moved to `merged/frontend-design/` (LICENSE.txt, SOURCE.md); relative paths in this section resolve there.

# Frontend Design

Approach this as the design lead at a design studio known for giving every client a distinct visual identity that is not mistaken for anyone else's. This client has already rejected proposals that felt cliché or templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take aesthetic risk if justified.

## Ground your designs in the subject matter

If the brief does not identify what the product or subject matter is, identify it yourself before designing, and confirm with the client. You can come up with one concrete subject, the design's audience, and the design's primary job, as a proposal. If there's any information in your memory about the client's preferences or context about what they're building, use that as a hint. The subject's industry, subject matter, materials, and vernacular are where distinctive visual choices come from — a design for a toy for girls aged 8–11 will be very aesthetically different from a dashboard for financial analysts. Build with the brief's real content and subject matter throughout.

## Design principles

For web designs, the hero is the first thing viewers will see. Open with the most characteristic thing in the subject's world, in the form that is most appropriate: a headline, an image, an animation, a live demo, an interactive moment, or other treatments. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the default treatment, so only use it if that's truly the best option.

Typography carries the personality of the page. You don't need a different typeface for display or headline text and body content: use one family or two, and if two, make them clearly distinct.

Choose your typefaces deliberately, not the default families you would reach for on any other project, and set a clear type scale following the default guidance of The Elements of Typographic Style with intentional weights, widths, and spacing. When type is used as a headline or visual element, use the type treatment itself as an active part of the design, not a neutral delivery vehicle for the content.

Default to line lengths of less than 80 characters. Serif typefaces can have slightly longer line lengths; give serif body text slightly more line-height than a sans-serif.

Avoid these default typographic treatments; they are the commonest tells of a generated page:
- Accenting just a single word or phrase in a headline, like putting one word in italic/bold or a different color.
- Using all caps for labels.
- Adding unnecessary typographic labels above content.

Visual structure is information. Structural devices like outlines, borders, numbering, eyebrows, dividers, labels, etc., encode useful information about the content rather than decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence — like a stepped process or a timeline. Before adding numbered markers, check the content really is a sequence.

Use non-user-triggered motion sparingly and deliberately, only to draw attention. A single orchestrated moment — one page-load sequence or one reveal — lands better than scattered effects; fade-and-slide-up entrances on each section and hover transitions on every card are the generic default and read as AI-generated. Motion that answers a person's action (opening, expanding, confirming) is welcome when it shows what changed.

Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy and placeholder content. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.

## Process: plan, review against the brief, build, critique

For calibration, AI-generated design right now clusters around some traits:
1. a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta or warm-clay accent (often near #D97757 — Anthropic's own Claude-interaction accent, so on a user's brief it reads as a tell);
2. a near-black background with a single bright acid-green or vermilion accent;
3. a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns;
4. the SaaS-card kit: content chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow (rgba(0,0,0,.1)) under each, and gradient washes as decoration;
5. template chrome that appears whatever the subject: a tracked-out ALL-CAPS eyebrow label above every heading; meta strings joined with middle dots ('A · B · C'); labels built as 'WORD — fragment' with a spaced em dash; tinted near-black (#0B0B0B, #111) standing in for black; a monospace face for small data labels; a '→' appended to link and button text.

All traits are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly — the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults. As with a hired human designer, there's often a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.

Work in two passes. First, brainstorm a short design plan based on the client's design brief: create a compact token system with color, type, layout, and principles.
- Color: describe the core base palette as 4–6 named hex values.
- Type: the typefaces and their roles.
- Layout: a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare. Include alignment guidance; should the content be left aligned, center aligned, justified?
- Principles: the high-level guidance for what makes this page unique.

Then review that plan against the brief before building: if any part of it reads like the generic default you would produce for any similar page (work through a similar prompt to see if you arrive somewhere similar) rather than a choice made for this specific brief — revise that part, say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan.

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and an element-based selector like .cta). This can happen often with padding/margin between sections.

## Restraint and self-critique

Spend your boldness in one place. Let one element be the memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief. Build to a quality floor without announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected, visually accessible, harmonious color palettes. Critique your own work as you build, taking screenshots to review if your environment supports it — a picture is worth 1000 tokens. Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory. Human creatives have memory and always try to do something new, so if you have a space to quickly jot down notes about what you've tried, it can help you in future passes.

## More on writing in design

Words appear in a design for one reason: to make it easier to understand and use. They are design content, not decoration. Bring the same intentionality and minimalism to copywriting that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's perspective. Name things by what users will understand in simple language, not by how the system is built. A user manages notifications, not webhook config. Describe what something is or does in plain terms rather than selling it. Being specific and legible to new users is always better than being clever.

Use active voice as default. A CTA says exactly what happens when it is used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the tone conversational: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each written element do exactly one job.


---

## Merged from `taste-landing-enrich` (2026-10-11)

- Original description: Use when enriching landing/portfolio craft with anti-slop taste dials — remaps Leonxlnx/taste-skill; pair landing-page-design + uupm-craft-checklist + cinematic-site-recipe. Creative/Forge craft. No imagegen. No live /.
- Unique content carried: frontend-design aesthetic-direction section; taste dials; uupm 1→10 craft checklist; dark-mode/utility CSS literacy; Vercel Web Interface Guidelines rules file (keep upstream file verbatim)

# Taste landing enrich

Source: Leonxlnx/taste-skill `skills/taste-skill` (MIT).
Packet: `/workspace/research/packets/taste-skill/skills/taste-skill/`.
Owner: **Creative/Forge** craft. Hive remap only — cite packet; do not 1:1 dump or run packet helpers.

## When
Landing pages, portfolios, marketing craft where brief inference + design dials (variance / motion / density) beat LLM defaults. Pair before ship with [landing-page-design](sand-workflow:landing-page-design). Default client-site look when we build one: **cinematic** ([cinematic-site-recipe](sand-workflow:cinematic-site-recipe)).

## Do
1. Emit a one-line **Design Read** (page kind, audience, vibe, system family) before code.
2. Set three dials from the brief: `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY` — override conversationally, not by editing files.
3. **Style bible first** when cinematic: [cinematic-site-recipe](sand-workflow:cinematic-site-recipe) + 3 refs, then dials. No code until bible exists.
4. Hand structure + Part B values to [landing-page-design](sand-workflow:landing-page-design) (wins conflicts).
5. Motion: Remotion when animate / map route / composition ([motion-pipeline](sand-workflow:motion-pipeline)); scroll-scrub hero = video frames + cursor, not WebGL / Three.js theater.
6. Pre-delivery craft: [landing-page-design](sand-workflow:landing-page-design) + [a11y-pass](sand-workflow:a11y-pass).
7. Pull only fitting sections from packet SKILL.md — contextual, never whole-file paste.

## Hive dial presets (use unless Design Read overrides)

| Use case | VARIANCE | MOTION | DENSITY | Notes |
|---|---|---|---|---|
| AI Partner / cinematic portfolio proof | 8 | 7 | 3 | Default craft; video hero; warm-gray not purple mesh |
| Sample-factory internal sample | 7 | 6 | 3 | ≠ hire page; box preview only; omit fake $ / traffic |
| Agency / Awwwards ceiling ref | 9 | 8 | 3 | Refs for bible only — do not steal brand |
| Calm B2B / trust-first | 5 | 3 | 4 | Restraint overrides cinematic default |
| Developer portfolio | 6 | 5 | 4 | Receipts > theater |

Baseline upstream: `8 / 6 / 4`. Hive cinematic portfolio default: **`8 / 7 / 3`**.

## Design Read examples (hive)
- *"Reading this as: cinematic AI Partner portfolio for partner credibility, with scroll-story language, leaning toward video hero + Lenis scrub (not Three.js)."*
- *"Reading this as: internal sample-factory emit proof for Craft→Forge, with known-good orb-scroll language, leaning toward box preview + noindex (≠ hire / ≠ live `/`)."*
- *"Reading this as: calm B2B landing for technical buyers, with Linear-style minimalist language, leaning toward shadcn + restrained motion."*

## Known-good craft path (prefer)
1. Bible + 3 refs ([cinematic-site-recipe](sand-workflow:cinematic-site-recipe) steps 1–2).
2. This skill: Design Read + dials.
3. Brief one-paragraph (every motion has a job).
4. Forge implement slice with distinct L4 evidence; Watchdog ship gate.
5. Sample-factory CapEx: known-good orb-scroll at `/workspace/orb-scroll-demo`; craft pack under `CONTENT/topics/bau-evidence/sample-factory-orch-20260903-*`. Sample factory ≠ ship hire page. Live `/` HOLD. PR 149 draft ≠ ship.

## Anti-slop (always)
Do not default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism everywhere, Inter + slate-900, fake testimonials, invented $, traffic, or KPI claims.

## Standing locks bind
Building mode — no client sell / send. Live `/` HOLD. Tier-3 HITL. Token-meter max-3. No Squarespace / elou asks. Exams PAUSED. No catalog dump.

## Dont
Install imagegen skills or image-to-code. Copy packet helpers / `scripts/` into workflows. Package-manager side-install from this packet. Treat as second marketplace face. Ship live from this enrich alone. Merge PR 149 as ship. Open live `/`. Fan-out desks. Burn Higgsfield credits unless operator asks.

## X bookmarks 20260925-1019 (`x:2095927702758838588` ab_workss)

Packet: `/workspace/research/packets/x-bookmarks/20260925-1019-desktop/`.

Homepage craft “4 ways” Cap video — enrich dials only (variance/motion/density) after Design Read; defer concrete values to landing-page-design. Cap HELD; no deep-watch; no ADOPT.


---

## Merged from `uupm-craft-checklist` (2026-10-11)

- Original description: Use when reviewing UI/UX craft before ship — priority 1→10 checklist remapped from ui-ux-pro-max; Creative craft. Pair a11y-pass / landing-page-design / design-tokens.
- Unique content carried: frontend-design aesthetic-direction section; taste dials; uupm 1→10 craft checklist; dark-mode/utility CSS literacy; Vercel Web Interface Guidelines rules file (keep upstream file verbatim)

# UUPM craft checklist

Source: nextlevelbuilder/ui-ux-pro-max-skill `.claude/skills/ui-ux-pro-max` priority table (MIT).
Packet: `/workspace/research/packets/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max/`.
Owner: **Creative** craft. Literacy only — do not run packet CLI/scripts.

## When
Pre-delivery UI review, visual QA, or craft critique on web/mobile/desktop surfaces.

## Priority checks (1→10)
1. **Accessibility** — contrast ≥4.5:1, alt text, keyboard, aria-labels; no removed focus rings.
2. **Touch & interaction** — ≥44×44 targets, 8px+ spacing, loading feedback; no hover-only.
3. **Performance** — modern image formats, lazy load, reserve space (CLS); no layout thrash.
4. **Style selection** — match product type; consistent icons (SVG not emoji); no mixed metaphors.
5. **Layout & responsive** — mobile-first, viewport meta, no horizontal scroll / fixed-px traps.
6. **Typography & color** — base ≥16px, line-height ~1.5, semantic tokens; no raw hex in components.
7. **Animation** — meaning-bearing motion; honor reduced-motion; avoid animating width/height.
8. **Forms & feedback** — visible labels, errors near fields, progressive disclosure.
9. **Navigation** — predictable back, lean nav, deep links where needed.
10. **Charts & data** — legends/tooltips; never color-alone meaning.

## Pair
- [a11y-pass](sand-workflow:a11y-pass) for ship a11y
- [landing-page-design](sand-workflow:landing-page-design) for marketing structure (wins conflicts)
- [design-tokens](sand-workflow:design-tokens) for foundations

## Don't
Install cli/, package-manager, or browser automation from this packet. Copy scripts into workflows. Override landing-page-design Part B without explicit user ask. Ship live from this skill.


---

## Merged from `uupm-ui-styling-literacy` (2026-10-11)

- Original description: Use for accessible UI styling literacy (components, utility CSS, dark mode concepts) — remaps ui-ux-pro-max ui-styling. Creative craft. landing-page-design wins conflicts.
- Unique content carried: frontend-design aesthetic-direction section; taste dials; uupm 1→10 craft checklist; dark-mode/utility CSS literacy; Vercel Web Interface Guidelines rules file (keep upstream file verbatim)

# UUPM UI styling literacy

Source: nextlevelbuilder/ui-ux-pro-max-skill `.claude/skills/ui-styling` (MIT).
Packet: `/workspace/research/packets/ui-ux-pro-max-skill/.claude/skills/ui-styling/`.
Owner: **Creative** craft. Literacy only — no package installs from this skill.

## When
Talking accessible components, utility-first styling patterns, responsive/mobile-first layouts, theme/dark-mode concepts — as literacy for Creative/Forge.

## Do
1. Prefer accessible primitives (focus, keyboard, labels) over visual-only chrome.
2. Mobile-first breakpoints; consistent spacing/type from tokens.
3. Dark mode as semantic token flip, not one-off hex swaps.
4. **Conflict rule:** [landing-page-design](sand-workflow:landing-page-design) wins on marketing/landing visual system and structure. Pair [a11y-pass](sand-workflow:a11y-pass) + [design-tokens](sand-workflow:design-tokens).

## Don't
Run component CLIs or packet scripts from this skill. Install ui-ux-pro-max cli/. Override landing-page-design Part B. Dump full component catalogs into the window.


---

## Merged from `vercel-web-design-guidelines` (2026-10-11)

- Original description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
- Unique content carried: frontend-design aesthetic-direction section; taste dials; uupm 1→10 craft checklist; dark-mode/utility CSS literacy; Vercel Web Interface Guidelines rules file (keep upstream file verbatim)
- Original support files moved to `merged/vercel-web-design-guidelines/` (LICENSE, SOURCE.md); relative paths in this section resolve there.

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:
1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
