---
chatId: 11a05495-91b3-4b9b-a729-bed444412c88
workspace: client-engine-1
source: cursor
title: "Repo review and architectural assessment"
updated: 1772839933919
messageCount: 85
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/client-engine-money]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Repo review and architectural assessment

**Workspace:** `client-engine-1`  
**Chat ID:** `11a05495-91b3-4b9b-a729-bed444412c88`  
**Messages:** 85  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/11a05495-91b3-4b9b-a729-bed444412c88/11a05495-91b3-4b9b-a729-bed444412c88.jsonl`

## What you asked

- I did a real repo review pass on snevemoney/client-engine. I did not read every single file line by line, but I reviewed the parts that define the system’s shape and risk:
	•	README.md
	•	.env.example
	•	prisma/schema.prisma
	•	src/lib/api-utils.ts
	•	src/lib/next-actions/ranking.ts
	•	src/app/api/internal/copilot/coach/action/route.ts
	•	src/app/api/internal/founder/summary/route.ts
	•	src/app/dashboard/growth/page.tsx
	•	recent commit history on main

That’s enough to give you a senior-level repo review of architecture, risks, and what I would do next.

⸻

Executive summary

My honest read



---

- We also need internally, better Prompt Engineering → Controls the immediate instruction (the syntax)
Context Engineering → Architects the environment and memory (the infrastructure)
Intent Engineering → Defines organisational purpose and constraints (the strategy)
AI Engineering → Helping you to learn the full stack (putting this mofo together init)
Each layer builds on the one below it. it’s more mature than just saying “prompt engineering.”

You’re separating 4 different layers of AI leverage:

1) Prompt Engineering

What it is: the immediate instruction layer
Job: control the response in th

---

- combine both plans

---

- What I would tighten

1) Move Tier-A API contract suite higher

Right now you have it in P2.

I would move it to high P1 or call it P1.5 / P1.8.

Why:
	•	once migration discipline and degraded-state are fixed, the next most valuable thing is locking Tier-A routes
	•	it reduces breakage across the app faster than some documentation work

So my adjusted ordering would be:
	•	P0.1 Migration discipline
	•	P0.2 Founder degraded-state
	•	P1.3 ranking audit
	•	P1.4 requireAuth ops event
	•	P1.5 bounded-context doc
	•	P1.6 AI Stack Doctrine
	•	P1.7 Tier-A API contract suite
	•	P1.8 env + release disci

---

- <attached_files>

<code_selection path="file:///Users/evenslouis/.cursor/plans/repo_review_%2B_ai_doctrine_b960abd7.plan.md" lines="1-205">
     1|---
     2|name: Repo Review + AI Doctrine
     3|overview: "Combined plan: (1) Repo review blockers — P0/P1/P2 production discipline, degraded-state signaling, ranking audit, bounded contexts, env/release discipline, Tier-A contracts; (2) AI Stack Doctrine — four-layer AI leverage hierarchy doc (AI → Context → Intent → Prompt) with Client Engine mapping."
     4|todos: []
     5|isProject: false
     6|---
     7|
     8|# Repo Review Blockers + AI

---

- I did a real repo review pass on snevemoney/client-engine. I did not read every single file line by line, but I reviewed the parts that define the system’s shape and risk:
	•	README.md
	•	.env.example
	•	prisma/schema.prisma
	•	src/lib/api-utils.ts
	•	src/lib/next-actions/ranking.ts
	•	src/app/api/internal/copilot/coach/action/route.ts
	•	src/app/api/internal/founder/summary/route.ts
	•	src/app/dashboard/growth/page.tsx
	•	recent commit history on main

That’s enough to give you a senior-level repo review of architecture, risks, and what I would do next.

⸻

Executive summary

My honest read



---

- We also need internally, better Prompt Engineering → Controls the immediate instruction (the syntax)
Context Engineering → Architects the environment and memory (the infrastructure)
Intent Engineering → Defines organisational purpose and constraints (the strategy)
AI Engineering → Helping you to learn the full stack (putting this mofo together init)
Each layer builds on the one below it. it’s more mature than just saying “prompt engineering.”

You’re separating 4 different layers of AI leverage:

1) Prompt Engineering

What it is: the immediate instruction layer
Job: control the response in th

---

- combine both plans

## Assistant (excerpts)

- Seems like there may be special characters. Let me read the raw bytes around that line.

---

- The file uses Unicode smart quotes (`\xe2\x80\x9c` and `\xe2\x80\x9d` — left/right double quotes). My replacement string used ASCII quotes. Let me use the exact content.

---

- The unicode escapes aren't being interpreted. Let me try a different approach — copy the exact characters from the file.

---

- Now update CHANGELOG.

---

- All done. Here's what shipped:

**`docs/CLIENT_ENGINE_POWER_OF_10.md`** — 10 adapted reliability laws:

| Law | Rule | Status |
|-----|------|--------|
| 1 | No silent failures on Tier-A routes | Aligned |
| 2 | Every mutation idempotent or deduped | Aligned |
| 3 | Every Tier-A page renders degraded/error | Partial |
| 4 | Every route has contract tests | Partial |
| 5 | Every new domain declares bounded context | Aligned |
| 6 | Every background process logs before/after/result | Partial |
| 7 | Every deploy uses migrate deploy | Aligned |
| 8 | Every AI action has scope, limits, audit trail

## Composer meta

- Name: Repo review and architectural assessment
- Subtitle: Edited CHANGELOG.md, CLIENT_ENGINE_AXIOMS.md, CLAUDE.md, CLIENT_ENGINE_POWER_OF_10.md

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/client-engine-money]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260308-self-improvement-skill-framework-0e0eaab3|Self-improvement skill framework]]
- [[20260310-website-building-prompts-for-claude-opus-and-fig-dc690e0c|Website building prompts for Claude Opus and Figma]]
- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]
- [[20260222-cursor-cloud-agent-integration-plan-623a99f6|Cursor Cloud Agent integration plan]]
- [[20260323-tool.md-file-in-openclaw-workspace-65580f3d|Tool.md file in openclaw workspace]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
