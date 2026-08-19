---
chatId: 0e0eaab3-47d2-4e63-8a07-b07e277c5b6c
workspace: client-engine-1
source: cursor
title: "Self-improvement skill framework"
updated: 1773004073316
messageCount: 62
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/client-engine-money]]", "[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Self-improvement skill framework

**Workspace:** `client-engine-1`  
**Chat ID:** `0e0eaab3-47d2-4e63-8a07-b07e277c5b6c`  
**Messages:** 62  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/0e0eaab3-47d2-4e63-8a07-b07e277c5b6c/0e0eaab3-47d2-4e63-8a07-b07e277c5b6c.jsonl`

## What you asked

- my chat summary with chatgpt: "What can we do if we made a self learning skill? "SKILL.md
Self-Improvement Skill
Log learnings and errors to markdown files for continuous improvement. Coding agents can later process these into fixes, and important learnings get promoted to project memory.
Quick Reference
Situation	Action
Command/operation fails	Log to .learnings/ERRORS.md
User corrects you	Log to .learnings/LEARNINGS.md with category correction
User wants missing feature	Log to .learnings/FEATURE_REQUESTS.md
API/external tool fails	Log to .learnings/ERRORS.md with integration details
Knowledge

---

- <attached_files>

<code_selection path="/Users/evenslouis/client-engine-1/.cursor/plans/doctrine_docs_and_roadmap_baa6199d.plan.md" lines="1-140">
# Doctrine Docs and Roadmap Plan

## Phase 1: Doctrine Docs (A)

Create three new docs under `docs/` that codify the ChatGPT conversation into Client Engine doctrine. These are read-only guidance for Cursor, future agents, and human operators — no code changes.

### 1.1 `docs/BUSINESS_ALIGNMENT_GATE.md`

**Purpose:** Gate for every new idea — Active Bet vs Incubator vs Kill.

**Content (from ChatGPT summary):**

- **Core rule:** An idea is not activ

---

- That’s a very good implementation pass.

You did the right thing:
	•	doctrine before code
	•	prioritization before expansion
	•	cross-references so it actually becomes part of the system
	•	session/changelog updates so it doesn’t disappear

What this means

You now have a stronger spine for Client Engine:
	•	BUSINESS_ALIGNMENT_GATE controls what gets in
	•	PROACTIVE_PERSISTENT_SELF_IMPROVING... controls how agents behave
	•	SELF_LEARNING_SKILL_DOCTRINE controls how mistakes become doctrine
	•	IDEA_ROADMAP controls what is active vs waiting

That is real organizational progress, not just docume

---

- <attached_files>

<code_selection path="/Users/evenslouis/.cursor/plans/voice_phase_1_mvp_doc_4dd4ce9b.plan.md" lines="1-104">
# Voice Phase 1 MVP Planning Doc

## Goal

Create a single planning doc that makes the Voice Assistant active bet **smaller, clearer, and more executable**. Doctrine stays frozen; this doc uses it to define the next buildable step.

---

## File to Create

`**docs/VOICE_ASSISTANT_PHASE_1_MVP.md`**

---

## Document Structure

### 1. Business Loop Served

- Map to [IDEA_ROADMAP.md](docs/IDEA_ROADMAP.md) and [BUSINESS_ALIGNMENT_GATE.md](docs/BUSINESS_ALIGNMENT_GATE.md)
-

---

- Yes — this is a good MVP planning doc.

It does exactly what it should do:
	•	narrows the active bet
	•	converts doctrine into execution
	•	prevents voice from becoming another sprawling idea
	•	keeps the repo aligned with business loops

What’s especially strong

1. “Pick one workflow”

That is the most important line in the whole plan.

If you keep that rule, the voice project stays sane.

2. Proposal follow-up as the default recommendation

That’s a strong first choice because it has:
	•	clear trigger
	•	clear owner
	•	clear business loop
	•	measurable outcome
	•	lower ambiguity than a gene

---

- what about the ui?

---

- do it

---

- <attached_files>

<code_selection path="/Users/evenslouis/.cursor/plans/voice_mvp_ui_scope_1ae7bb1b.plan.md" lines="1-33">
# Add UI Scope to Voice Phase 1 MVP Doc

## Change

Insert a new section **"12. UI Scope (Phase 1)"** in [docs/VOICE_ASSISTANT_PHASE_1_MVP.md](docs/VOICE_ASSISTANT_PHASE_1_MVP.md) after section 11 (Next Steps) and before See Also.

## Content to Add

```markdown
## 12. UI Scope (Phase 1)

| Surface | Purpose |
|---------|---------|
| **Proposal Follow-ups page** | Add "Eligible for voice" bucket; consent toggle; "Schedule voice call" action |
| **Lead/Proposal detail** | C

## Assistant (excerpts)

- Navigating to a proposal detail to test the consent flow:

---

- Filtering for sent proposals and opening one to test the voice consent UI:

---

- Checking for console errors and testing the overview page:

---

- Summary of the browser MCP tests:

---

## Browser MCP test results

### Command Center (`/dashboard/command`)
- Page loads
- **Voice follow-ups** card appears (initially "Loading…", then loads)
- **"View eligible proposals →"** link works and navigates to proposal-followups with `?bucket=voice_eligible`

### Proposal Follow-ups (`/dashboard/proposal-followups`)
- Page loads with bucket buttons: All, overdue, today, upcoming, stale, no followup, **Voice eligible**
- Voice eligible bucket is selectable
- Search and bucket filters work

### Voice call log (`/dashboard/voice/calls`)
- Page loads


---

- Here's what’s still missing or could be improved from the Voice work:

---

## 1. **Contract tests for `/api/voice/*`**

Session doc `docs/sessions/2025-03-08-voice-phase-2-5-implementation.md` lists:

> - [ ] Contract tests for /api/voice/* per API_CONTRACTS.md

There are no contract tests for the voice routes. Growth routes have tests in `src/app/api/internal/growth/*/route.test.ts`, but nothing equivalent for `/api/voice/*`.

---

## 2. **Cron schedule for `POST /api/voice/process`**

Same session doc:

> - [ ] Cron job schedule for POST /api/voice/process (e.g. 2x/day within 9–18 window)



## Composer meta

- Name: Self-improvement skill framework
- Subtitle: Edited CHANGELOG.md, migration.sql, schema.prisma, 2025-03-06-voice-phases-implementation.md

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/client-engine-money]]
- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]
- [[20260306-repo-review-and-architectural-assessment-11a05495|Repo review and architectural assessment]]
- [[20260310-website-building-prompts-for-claude-opus-and-fig-dc690e0c|Website building prompts for Claude Opus and Figma]]
- [[20260221-quiet-proof-engine-implementation-4e9afda5|Quiet proof engine implementation]]
- [[20260222-missing-components-in-build-5ad508ad|Missing components in build]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
