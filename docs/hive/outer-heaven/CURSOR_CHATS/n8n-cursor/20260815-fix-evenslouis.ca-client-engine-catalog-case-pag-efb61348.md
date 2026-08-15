---
chatId: efb61348-092e-4c82-b33e-ca397ee7424b
workspace: n8n-cursor
source: cursor
title: "Fix evenslouis.ca / Client Engine catalog + case-page bugs found by headed Maestro click-live (2026-08-15). Evens said \u201c"
updated: 2026-08-15T21:27:43.443691+00:00
messageCount: 9
archived: false
projects: ["[[PROJECTS/autoflow-finance]]", "[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]", "[[PROJECTS/proof-qc-assist]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Fix evenslouis.ca / Client Engine catalog + case-page bugs found by headed Maestro click-live (2026-08-15). Evens said “

**Workspace:** `n8n-cursor`  
**Chat ID:** `efb61348-092e-4c82-b33e-ca397ee7424b`  
**Messages:** 9  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/c7f2f99c-2f1e-4dff-b245-29e61bad49df/subagents/efb61348-092e-4c82-b33e-ca397ee7424b.jsonl`

## What you asked

- Fix evenslouis.ca / Client Engine catalog + case-page bugs found by headed Maestro click-live (2026-08-15). Evens said “do it all” for the friend-demo list.

Repo: /Users/evenslouis/client-engine-1
Live: https://evenslouis.ca/work and https://evenslouis.ca/pro/work
Date: 2026-08-15
Operator: Evens Louis

DO NOT send / pay / deploy / book / publish. Fix locally only. Evens deploys.
DO NOT mint icp_id. Path A parked. DO NOT restamp 145. DO NOT commit.
DO NOT live Stripe. DO NOT invent demoUrl / public ProofCheck URL.
DO NOT open new browser tabs. Do not run headed click-live (parent already ran 

## Assistant (excerpts)

- The case page hardcodes em-dashes and the seed copy is wrong. Next I’ll trace `/pro` routing, image srcs, and why clicks focus but don’t navigate.

---

- Live check: `/screenshots/...` is 200 on both hosts; `/pro/_next/image` returns 400. Next Link’s click handler `preventDefault`s and soft-navs — that matches focus-then-Enter. I’ll fix copy, thumbs, and native click targets next.

---

- I'll use an explicit project select that skips the new columns so a code-only deploy still works if the migration hasn't run yet.

---

- Keeping the catalog query on columns that already exist so a missed migration doesn’t blank `/work`. CASE_COPY still supplies PROBLEM/RESULT.

---

- Local-only. Friends will not see this until Evens deploys. No send / pay / deploy / book / publish. No `demoUrl`. No `icp_id`. No commit.

**What was wrong**
- PROBLEM/RESULT were hardcoded `—`. ProofCheck BUILD still sold team proof-docs.
- `/pro/work` thumbs went through `/pro/_next/image` (400). The same files are 200 at `/screenshots/...` (and `/_next/image` on `/work`).
- `next/link` `preventDefault` + soft nav: click focused, Enter navigated.

**What changed**
- Case copy is nursing claim-verify for ProofCheck; QuickMarket does not claim favorites; Autoflow is labeled proof/concept (no i

## Files touched

- `docs/hive/outer-heaven/CONTENT/job-cards/WORK-AS-BUSINESSES-2026-08-14.md`
- `docs/hive/outer-heaven/CONTENT/knowledge/workflows/click-live/flows/ce-pro-work/RUN.md`
- `docs/hive/outer-heaven/CONTENT/knowledge/workflows/click-live/flows/evenslouis-ca/RUN.md`
- `docs/hive/outer-heaven/CONTENT/knowledge/product-factory/roadblocks.json`
- `scripts/hive/grok-skills/checkable-stop.md`
- `scripts/hive/grok-skills/roadblock-bank.md`
- `scripts/hive/grok-skills/assume-it-will-touch.md`
- `docs/hive/outer-heaven/CONTENT/knowledge/workflows/click-live/flows/ce-pro-work/cards/04-tap-proofcheck.md`
- `docs/hive/outer-heaven/CONTENT/knowledge/product-factory/roadblocks.schema.json`
- `scripts/hive/product-factory.py`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/autoflow-finance]]
- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]
- [[PROJECTS/proof-qc-assist]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260815-evens-https-evenslouis.ca-work-is-the-real-catal-d49faf0f|Evens: https://evenslouis.ca/work is the **real** ]]
- [[20260815-fix-proofcheck-qc-frontend-bugs-found-by-headed--ad243fac|Fix ProofCheck QC frontend bugs found by headed Ma]]
- [[20260815-evens-asked-do-our-system-and-agents-work-this-w-49b662c5|Evens asked: do our system and agents work this wa]]
- [[20260814-you-are-working-in-users-evenslouis-n8n-cursor-f-ddc9e8df|You are working in /Users/evenslouis/n8n-cursor fo]]
- [[20260815-evens-do-the-loginprimitive-slice-then-full-maes-b26bf88e|Evens: do the LoginPrimitive slice, THEN full maes]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
