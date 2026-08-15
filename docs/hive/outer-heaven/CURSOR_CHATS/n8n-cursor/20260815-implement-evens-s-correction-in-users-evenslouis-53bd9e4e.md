---
chatId: 53bd9e4e-5887-4aba-8dca-92e7be8cd831
workspace: n8n-cursor
source: cursor
title: "Implement Evens's correction in `/Users/evenslouis/client-engine-1` ONLY. Do not edit `~/client-engine`. Do not edit the"
updated: 2026-08-15T22:50:30.675899+00:00
messageCount: 7
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/client-engine-money]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Implement Evens's correction in `/Users/evenslouis/client-engine-1` ONLY. Do not edit `~/client-engine`. Do not edit the

**Workspace:** `n8n-cursor`  
**Chat ID:** `53bd9e4e-5887-4aba-8dca-92e7be8cd831`  
**Messages:** 7  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/c7f2f99c-2f1e-4dff-b245-29e61bad49df/subagents/53bd9e4e-5887-4aba-8dca-92e7be8cd831.jsonl`

## What you asked

- Implement Evens's correction in `/Users/evenslouis/client-engine-1` ONLY. Do not edit `~/client-engine`. Do not edit the plan file. Do not commit. Do not deploy. No Stripe. No new demoUrl.

## The map (do not invent a new job for /pro)

Public site (ONE homepage, ONE catalog):
- Home = `https://evenslouis.ca/` only
- Catalog = `https://evenslouis.ca/work` and `/work/{slug}` only

Operator (keep):
- `https://evenslouis.ca/pro/login` = Client Engine sign-in
- After login → `https://evenslouis.ca/pro/dashboard/founder` (keep `/pro/dashboard/*`)

KILL as served public pages (not a twin, not a seco

## Assistant (excerpts)

- Hive rules loaded. Next I’ll read the existing redirect/base-path files in `client-engine-1` and apply Evens’s map only there.

---

- Current files still treat `/pro` as a public twin. I’ll read config, `SiteLink`, and public CTAs next so the 308s and hrefs match Evens’s map.

---

- I have the twin list and the CTA sweep. Checking Next.js proxy matching and a couple of public pages before I write the 308s.

---

- Implementing the 308 aliases, public-path href rules, and the `/pro` homepage kill. Public CTAs stay raw/`SiteLink`; login and dashboard stay put.

---

- Leftover `/pro` twins now 308 to the real public site **on disk** in `client-engine-1` only. Login and dashboard stay. Live still shows the twin until Evens deploys.

**Tests:** `pnpm exec vitest run src/lib/base-path.test.ts src/lib/catalog-alias-redirects.test.ts` — **10/10 passed**.

**Grep:** `rg 'pro/work' src --glob '*.tsx'` → zero hrefs.

**Live (readonly curl, unchanged):** `/` already has `href="/work"`. `/pro` still 200s marketing with `href="/pro/work"`. `/pro/work` still 200s. Friends still see that until you deploy.

**Not done:** no commit, no deploy, no Stripe, no new `demoUrl`,

## Files touched

- `scripts/hive/grok-skills/desk-wiki-before-work.md`
- `scripts/hive/grok-skills/checkable-stop.md`
- `docs/hive/outer-heaven/CONTENT/job-cards/forge.md`
- `scripts/hive/grok-skills/assume-it-will-touch.md`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/client-engine-money]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260815-evens-https-evenslouis.ca-work-is-the-real-catal-d49faf0f|Evens: https://evenslouis.ca/work is the **real** ]]
- [[20260815-evens-selected-the-home-hero-cta-view-my-work-in-0a3a48ff|Evens selected the home hero CTA \u201cView my wor]]
- [[20260815-fix-evenslouis.ca-client-engine-catalog-case-pag-efb61348|Fix evenslouis.ca / Client Engine catalog + case-p]]
- [[20260814-you-are-working-in-users-evenslouis-n8n-cursor-f-ddc9e8df|You are working in /Users/evenslouis/n8n-cursor fo]]
- [[20260815-evens-asked-do-our-system-and-agents-work-this-w-49b662c5|Evens asked: do our system and agents work this wa]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
