---
name: Website build pipeline
description: >-
  Use this when shipping a client or portfolio site end-to-end (brief → stack →
  design → build → SEO/a11y/perf → Vercel → /work card → handoff).
merged_from: [client-handoff, ship-vercel]
---
# Website build pipeline (PIV-style)

Source pack: `/workspace/research/website-building/` (INDEX, dossier, vercel-next-patterns, design-to-code).
LIVE enrich: Ed Hill `yt:NNv80mMzFDs` (assemble/normalize/fill); Cole AI-native/PIV `yt:Tliio-33w4g` `yt:eecUhBpTz_g` (CAPTION_GAP — dossier PIV); remap Claude Code → Cursor cloud agent.

## Defaults (hive)
- Brochure / portfolio / content-first → **Astro + Sanity**
- App-shaped (auth, DB, dashboards, AI UI) → **Next.js App Router + Vercel + shadcn**
- Visual client, no Git → **Framer** or **Webflow**
- Small commerce → **Shopify** (theme first; headless only when storytelling needs it)
- Booking CTA → **Cal.com** embed; confirmations → **n8n webhook on canonical host only** (`https://…/webhook/*`)
- Client owns hosting project + domain + API keys in prod; operator is collaborator

## Phases (do in order; lock each gate before next)

### 1. site-brief
One-pager: audience, job-to-be-done, page list, CMS owner, success metric, out-of-scope.

### 2. stack-pick
Apply defaults above. Record stack + CMS + why in one short paragraph. Do not start UI code yet.

### 3. design-tokens
Anthropic landing-page-design two-pass: 4–6 colors, type roles, spacing, one signature element. Reject AI-slop defaults. Lock tokens before compose.

### 4. Scaffold
- Next → create-next-app (App Router, TS, Tailwind, ESLint) + shadcn preset + CI
- Astro → content collections or Sanity + islands policy (minimal JS)
Install baseline agent skills when available: vercel-labs/agent-skills, shadcn/ui, Anthropic landing-page-design; optional coleam00 PIV patterns (do **not** require Claude Code). Figma MCP only if client has files. **WORKAROUND:** Claude Code demos → Cursor cloud agent + Grok Bot skills.

### 5. ui-compose
shadcn + locked tokens. Optional v0 for a single section, then normalize to the system. Prefer SSR/SSG for public pages — no client-only marketing SPA.

### 6. cms-wire
Sanity / Payload / Notion schemas; draft/preview; image CDN rules. No fake CMS (hardcoded weekly copy).

### 7. booking-embed
Cal.com inline or modal; thank-you path; n8n webhook on canonical n8n only. Never n8ncloud.

### 8. Pre-ship gates (all required)
- **seo-pass** — metadata, sitemap, robots, JSON-LD, OG
- **a11y-pass** — landmarks, keyboard, focus, alt, contrast, reduced-motion (axe/Lighthouse)
- **perf-pass** — images/fonts/JS budget; vercel react-best-practices / Core Web Vitals

### 9. website-build-pipeline
Preview URLs → prod on **client-owned** project; env audit (no secrets in `NEXT_PUBLIC_*` or client bundles); domain handoff.


### 9b. ship-work-card (required for operator portfolio)
After the public URL is click-pass, run Ship work card (sand-workflow:ship-work-card):
60fps Baseline MP4 + WebM + 1-hero.jpg, CASE_COPY, seed on Client Engine,
verify https://evenslouis.ca/work. Looks-good-without-a-click = fail.
Ownership: operator-owned proof on /work; commercial path is clone + client mods.
Skip only if the operator says the site is client-private / not for the catalog.

### 10. website-build-pipeline
Access inventory, CMS training, secrets rotated, support SLA, DNS checklist.

## Anti-patterns (never)
- Secrets in client / repo / MCP JSON
- Site only on builder account
- Infinite redesign without locked tokens
- Custom commerce cosplay for small catalogs
- Ship without seo/a11y/perf validate
- Ship a finished operator site without a /work card (unless operator said private)
- Bypass-permissions or sacred-rule violations (hive zero-loss)

## Validate gate
lint → typecheck → build → Lighthouse or axe → screenshot review before handoff.

## Tools
| Need | Path |
|---|---|
| Scaffold | next/astro scaffolds — **PROVE** |
| Shadcn/Prisma | MCP — **PROVE** |
| GitHub issue spine | GitHub MCP — **PROVE** |
| Cursor cloud agent | CloudAgent — **PROVE** (Claude Code **WORKAROUND**) |
| Vercel | **BLOCKED** needsAuth — Hostinger HITL **WORKAROUND** |
| Claude Code / Claude SEO skill install | **BLOCKED** — pattern only |

## Prompts
**Build pipeline**
```
Brief→stack-pick→scaffold→CMS wire→perf/a11y/seo→proof URL click
No unattended deploy.
Claude Code tape → Cursor cloud agent + Grok skills.
```

**PIV overlay**
```
Plan (issue + acceptance) → Implement (cloud agent) → Validate (verify-then-done)
Fresh session on context rot.
```

## LIVE enrich 2026-08-22 — Qwen local vs Cursor stack
Source: `yt:0Yin3Er9DX0`.

- Signal uses Qwen 3.8 27B local + pi.dev + Higgsfield for cinematic sites.
- **WORKAROUND:** keep **Cursor + Grok + this pipeline** as default desk. Local Qwen = optional via `local-private-agent-lab` (wiki card first; Mac install only on explicit ask).
- Motion plates still go through `motion-pipeline` / Higgsfield WORKAROUND — not a second GPU desktop.
- Do not mark “owned” a skill that requires local Qwen weights to ship.

## LIVE enrich 2026-08-24 — Nate ScrollCraft sites (`yt:QUI6Ug4cHnE`) FACT
Insert **interview gate** between site-brief and design-tokens when the deliverable is a premium marketing/landing site:
- Run cinematic-site-recipe ScrollCraft interview (journey · belief · assets · signature · calm/intense).
- Prefer owned photos/screenshots; generate only gaps via Higgsfield/Canva (**WORKAROUND** for Key.ai).
- After ui-compose: **keyframe screenshot verify** before seo/a11y/perf (wrong links, wrong captions, motion too fast).
- Remap Claude Code + ScrollCraft skill install → Cursor cloud agent + cinematic-site-recipe. **$10K** = UNVERIFIED.


## WL26-100 remaining L2 2026-08-27 — plates / ANF / mobile plan (PROVE tape)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2-REMAINING.md`

- `yt:0Yin3Er9DX0` tape: assets folder always; scroll-scrub via frame sequence; before/after slider from same-scene edit. Local Qwen still WORKAROUND only.
- `yt:NNv80mMzFDs` tape: ANF (assemble / normalize / fill). Do not prompt a whole site from unspecified taste.
- `yt:p80OV6kjIO8` ASR: interview plan **before** pixels; operator picks stack (Expo/Clerk/Neon named on tape — remap to our stack, do not install his). Store pages: privacy / terms / support. In-app **delete account** required for App Store.

## Grill Me / plan before build 2026-08-29 (`yt:gznB0MQclhY`) watch-page PROVE
Outbid tape: voice/chat → Cursor plan mode auto-switch → clarify (Grill Me / ask-hard-questions) → then build.
Do not vibe-code the whole product from one vague prompt. Charge-path HITL day one if the SKU is paid.
Clone Outbid / pay-to-rank **NO-SKILL**. $212k / visitors / clones **UNVERIFIED**. Polar→Stripe eval HITL. Vercel spend caps.
Pair `grill-me-into-prompt` + factory-not-feature. Stack already Cursor — **PROVE** match, no Claude desktop.

## Wave-M repass 2026-09-09 (`yt:-7xBUCVtB0E`)
GSAP+Cursor+Webflow tape — packet `/workspace/research/youtube-daily/repass-20260909/-7xBUCVtB0E/`. Steal: Cursor-authored scroll motion; Remotion **WORKAROUND**; Webflow GSAP install **BLOCKED** until ask. Motion bar PARTIAL (no side-by-side).

## Live enrich (wave-N-20260909-65-69)
- `yt:06E-D2RCx6g` — audit-before-redesign + variant links in outreach drafts.
- `yt:3DWuhBWQ-Ug` — folder→variants→Vercel preview multiplicity→custom CMS ownership→SEO upsell. Claude Desktop **WORKAROUND** → Cursor cloud agent. Prefer Sanity/Payload via cms-wire over bespoke admin.

## Wave W enrich 2026-09-09
- `yt:eecUhBpTz_g`: dark-factory validation before ship; remap Claude skill → Cursor. Packet PROVE.
- `yt:gznB0MQclhY`: Outbid Next.js+payments observe only; Superstarter-like base = factory primitives, not clone SKU.

---

## Merged from `client-handoff` (2026-10-11)

- Original description: use this when handing a finished site to a client — hosting, secrets, CMS training, V2 backlog
- Unique content carried: client handoff (hosting, secrets, CMS training, V2 backlog); Vercel env hygiene + domain ownership

# Client handoff

## Checklist
1. Hosting account owner (client vs builder) + access transfer steps.
2. Domain/DNS ownership.
3. Secrets rotation schedule; no secrets in repo/chat history reliance.
4. CMS training: how to edit/publish; who to call.
5. Backup/restore note.
6. Out of scope / V2 backlog list (do not shrink price — shrink scope).
7. Maintenance retainer definition if any (keep-alive ≠ feature factory).

## Output
One handoff doc the operator can send; Loom optional.


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.

Sitting save is [session-handoff](sand-workflow:session-handoff) + ACTION_LOG, not this skill.


---

## Merged from `ship-vercel` (2026-10-11)

- Original description: use this when deploying to Vercel production with env hygiene and domain ownership clear
- Unique content carried: client handoff (hosting, secrets, CMS training, V2 backlog); Vercel env hygiene + domain ownership

# Ship Vercel

## Steps
1. Confirm preview green after seo/a11y/perf passes.
2. Env vars only on Vercel/host — rotate any that were pasted in chat.
3. Production domain ownership documented (client account preferred).
4. Deploy production; verify HTTPS and redirects.
5. Smoke key paths: home, primary CTA, booking/form.
6. Hand remaining items to website-build-pipeline.

## Tier 3
- Never change prod secrets or DNS without operator approval when client-owned.
