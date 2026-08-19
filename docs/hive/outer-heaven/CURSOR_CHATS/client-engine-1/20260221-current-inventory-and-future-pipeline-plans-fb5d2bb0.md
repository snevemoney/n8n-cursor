---
chatId: fb5d2bb0-dad5-4deb-80e9-cd122f8f9d2c
workspace: client-engine-1
source: cursor
title: "Current inventory and future pipeline plans"
updated: 1771644745519
messageCount: 50
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]", "[[THEMES/gaming-mac]]"]
tags: [hive]
---

# Current inventory and future pipeline plans

**Workspace:** `client-engine-1`  
**Chat ID:** `fb5d2bb0-dad5-4deb-80e9-cd122f8f9d2c`  
**Messages:** 50  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/fb5d2bb0-dad5-4deb-80e9-cd122f8f9d2c/fb5d2bb0-dad5-4deb-80e9-cd122f8f9d2c.jsonl`

## What you asked

- Here’s the full inventory of what you have right now, and the one pipeline we’re about to build before production.

⸻

What you have right now

A) Core product behavior

Goal: turn inbound leads into positioning → proposals → approved builds, with hard gates and metrics.
	•	Lead lifecycle (status-driven, money-path locked)
	•	Leads exist in DB
	•	Pipeline can run automatically or manually
	•	Owner approval is required before Build can happen
	•	Artifacts system (everything important is saved as an Artifact)
	•	enrichment
	•	score
	•	positioning (POSITIONING_BRIEF)
	•	proposal
	•	RUN_REPORT.md 

---

- we already have a context.md so from the inventory and outline we discussed.  update the context

---

- Good — this is the right moment to sanity-check, not add ideas.

I’ll answer you in three layers, clean and grounded, no hype.

⸻

1️⃣ Did we forget anything in scope for this repo?

No.
Based on everything you just summarized and what’s actually merged, PROJECT_CONTEXT.md now fully matches reality.

Nothing critical is missing for the goal we locked.

Here’s why I’m confident:

The money path is complete end-to-end
	•	Input exists (manual, email, soon research)
	•	Pipeline is deterministic, gated, idempotent
	•	Proposals are generated, revised, approved
	•	Builds are protected by server-side 

---

- Context
	•	Read PROJECT_CONTEXT.md and SYSTEM_MANIFEST.md first.
	•	This repo is client-engine-1.
	•	Goal: Run the existing system in production with real inbound clients, not experiments.
	•	Do not add new product ideas, abstractions, or long-term systems.
	•	Do not touch money-path gates.

⸻

Task
We are moving from “ready” → live usage with real clients.

Implement and verify the following, in order, using the existing architecture:

1. Production hardening (no new features)
	•	Verify .env.production (or VPS env) includes:
	•	DATABASE_URL
	•	AUTH_SECRET
	•	NEXTAUTH_URL
	•	OPENAI_API_KEY
	•	

---

- Got it — what you pasted confirms two big things:
	1.	The prod baseline is actually deployable now (build blockers fixed, gates + metrics + safety are in place).
	2.	R1 “Research → Lead Factory → Pipeline” is fully spec’d and proposal logic is already wired to consume it (via RESEARCH_SNAPSHOT).

So what’s left is execution plumbing + ops (cron + discover/extract + dedupe + create lead + call pipeline), and then a real-client runbook so it keeps working while you’re at your 9–5.

⸻

What’s still missing (the real blockers before “real clients” at scale)

A) Research Engine R1 implementation (n

---

- I can’t directly drive your Cursor side-panel browser from here (I don’t have remote control of your IDE). But I can give you the exact “do this, click this” sequence so you can watch it happen in the Cursor browser in real time.

Below is the cleanest way to see the system run end-to-end in the Cursor side panel (no Playwright).

⸻

0) One-time setup (so the browser works)

In Cursor terminal (repo root):

cd /Users/evenslouis/client-engine-1
npm install

Make sure .env exists and has at least:
	•	DATABASE_URL=...
	•	AUTH_[REDACTED]
	•	NEXTAUTH_URL=http://localhost:3000 (for local)
	•	ADMIN_E

---

- ⸻

A. What you have right now (the “Money Path Machine”)

From your debrief + notes, the repo already includes:

Intake
	•	Manual lead creation (POST /api/leads)
	•	Email ingestion lead creation (worker path) triggering pipeline

Pipeline (auto)
	•	runPipelineIfEligible(leadId, reason) single entrypoint
	•	Advisory lock to prevent double-runs
	•	Steps: Enrich → Score → Position → Propose
	•	Idempotent: re-runs skip steps if artifacts exist

Safety gates (hard locks)
	•	No auto-send of proposals (proposalSentAt is only set by a manual endpoint/action)
	•	Build is manual only
	•	Build route requ

---

- Got it: no manual “start” clicks. The system should run by itself (ingest → create lead → pipeline → proposal ready) while you’re at your 9–5.

Here’s the clean, goal-aligned way to do it without auto-sending emails or auto-building (those are separate locks you already intentionally kept).

⸻

1) What “no manual click” means in your architecture

You need one always-on trigger that runs on the VPS:

Option A (best): Cron → Research Engine → create lead → runPipelineIfEligible
	•	Every X minutes, pull fresh opportunities online
	•	Create leads + RESEARCH_SNAPSHOT
	•	Immediately run the pipelin

## Assistant (excerpts)

- Adding the API route and CLI runner. Checking auth pattern for the API:

---

- Adding "How to test locally" and "How to run on VPS" to the spec.

---

- Summary of what was implemented:

---

## Implemented (file tree)

**Research engine**
- `src/lib/research/types.ts` — `RawOpportunity`, `ResearchSourceAdapter`, `ResearchRunReport`
- `src/lib/research/canonicalize.ts` — `canonicalizeSourceUrl()` for dedupe
- `src/lib/research/filter.ts` — `shouldSkipLowSignal()` (intern/unpaid/volunteer/equity only)
- `src/lib/research/adapters/rss.ts` — RSS/Atom adapter (reads `RESEARCH_FEED_URL`, Node-safe regex parsing)
- `src/lib/research/run.ts` — `runResearchDiscoverAndPipeline({ limit })`: discover → filter → dedupe → create Lead + RESEARCH_SNAPSHOT → 

---

- Checking the project's documented scope and comparing it to the codebase.

---

- Here’s what’s **missing** relative to your own docs and goals, and what would help to decide next steps.

---

## 1. Notifications (explicitly “next”, not built)

- **Docs:** NEXT_R1 and RESEARCH_ENGINE_SPEC say: “Strongly recommended: notification channel (email/Discord) for pipeline failures, health failures, ‘new proposals ready’.” Next build order: “Add notifications (so failures don’t hide).”
- **Code:** No `notify`, webhook, or Discord/email code in `src/`. You only see problems when you open the dashboard.

So the main **missing feature** for “runs while I’m at my 9–5” is: **alerts when

## Composer meta

- Name: Current inventory and future pipeline plans
- Subtitle: Edited package.json, .env.example, RESEARCH_ENGINE_SPEC.md, PROJECT_CONTEXT.md, research-run.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]
- [[THEMES/gaming-mac]]

## Related chats

- [[20260221-quiet-proof-engine-implementation-4e9afda5|Quiet proof engine implementation]]
- [[20260222-missing-components-in-build-5ad508ad|Missing components in build]]
- [[20260320-vps-health-check-and-pm2-status-8f6ce894|VPS health check and pm2 status]]
- [[20260226-website-performance-issues-2db66e24|Website performance issues]]
- [[20260222-cursor-cloud-agent-integration-plan-623a99f6|Cursor Cloud Agent integration plan]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
