---
name: click-live-site
description: After any site or page ship, open the live URL in the browser and click the primary path. Looks good without a click is a fail. Forge and Watchdog. Cursor plus Grok Bot.
---

# Click the live site

**Machine:** `click-live-site` · **Path:** C · **Owners:** Forge + Watchdog

## When
After every site/page ship — preview URL, staging, or custom domain. Before calling the build done.

## Steps
1. Open the **shipped URL** in Cursor browser (not localhost unless that is what shipped).
2. Click the primary CTA (book, apply, checkout, nav to proof section).
3. Check mobile width or responsive breakpoint if the slice touched layout.
4. Check `prefers-reduced-motion` if the slice is cinematic.
5. Record **pass / fail** with what broke. Screenshot optional.
6. Fail-the-build pass: if a motion designer could still tell this from a template, list the biggest gap — do not say "looks good."

## Pass criteria
- CTA path works or fails with a named error (not silent).
- No console blocker on the happy path.
- Hero loads (poster/video) on cinematic pages.

## Stop
Custom domain / Stripe / prod deploy still needs HITL + `paid-slice-funnel` smoke.

## Anti-patterns
- "Looks good" without opening the URL
- Buying a vibe-test SaaS
- Docs-only verification
- Preview host as proof of production domain

**Playbook:** `CONTENT/website-building/cinematic/PLAYBOOK.md` step G.
