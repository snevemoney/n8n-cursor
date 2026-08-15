# Money Desk — eRS3CmvrOvA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~3401 words. Nate: after “400 hours” in Claude Code, six (plus a bonus) skills businesses actually pay for — boring, time/money/mistakes. Caption-only; timestamp UNKNOWN. Beats in order: fancy skills are for videos; clients want simple/effective; same patterns across real estate, HVAC, coaches, marketing agencies. (1) Skill creator (official Anthropic) — factory that builds every other skill; talk like a coworker / drop an SOP; drafts, tests, packages; you don’t hand-edit skill.md; clients don’t pay for this, they pay for what it produces; /plugin install skill-creator; he installed globally/user-scope. Aside: skill = md that teaches a job; plugin = bigger pack (skills + hooks + MCP); he’ll still say “skills”; “I’m not an AI avatar.” (2) Superpowers — forces senior-dev loop: plan first, isolated env, tests before code, two-stage review (spec match + quality); #1 failure mode is rushed/sloppy code that dies when the client runs it; HVAC dispatch / agency reporting — they care it works, not LOC; 80% first pass vs 60% = fewer debug cycles / lower tokens; “150,000 GitHub stars” UNVERIFIED; install cmd + a prior token-spend video. (3) GSD (Get Stuff Done) — environment, not how-to-code; context rot halfway through the window (sloppy, forgets requirements, skips, lies “done”); fresh sub-agent per task, clean window; quality gates (scope-production detection when planner drops a requirement; security enforcement vs threat model); autonomous mode: spec → plan/execute/commit with less babysit; not a token-saver (subs cost); saves redo hours. Superpowers = process; GSD = clean context so the process works. /gsd-help. (4) Not an install: /review (local, fast, usual tokens) and /ultra-review (with Opus 4.7) — uploads branch to cloud sandbox, parallel reviewer fleet (logic/security/perf/edge); bugs must be independently reproduced before they hit the list; needs CC ≥2.1.86 + Claude account (API key alone won’t); 10–20 min background; /review always, /ultra before merge that matters (refactor, payments, auth, migration) — prod bug costs more than the run; not free — Pro/Max “three free then $5–20/run” (may have changed) UNVERIFIED. (5) Context Mode — tool calls dump garbage (Playwright 56kb, 20 GitHub issues 59kb; ~30 min → 40% window is logs); compact then forgets files/tasks/last ask. Routes calls through a sandbox; only the needed slice returns (their bench: 56kb→299b, 46kb log→155b, 315kb→5kb/session) UNVERIFIED; /contextmode:ctx-stats. Second half: local SQL of every edit/task/decision/error; on compact, injects a snapshot so you resume. Sessions that died at 30 min “now run 3 hours”; stop wasting remind-prompts. Two install cmds + restart; auto MCP/hooks/routing. (6) ClaudeMem — across sessions (CC starts from zero; 10 min + thousands of tokens catching up). CLAUDE.md/memory files work but you maintain them by hand. Hooks session lifecycle; captures edits/decisions/fixes/commands; agent SDK → semantic summaries → local SQLite + vector search; injects relevant bits; auto folder-level CLAUDE.md. Retrieval is 3-layer (compact index → timeline → full details); repo claims ~10× token savings vs dump-everything UNVERIFIED. Local + web viewer. Plugin marketplace; warning: do not npm-install the SDK only — hooks never register. Bonus (7) official front-end design skill (global); also baked into Anthropic Labs “Claude Design” — still use the skill if you bring the project back to CC. Sell: not the workflow — outcome (10 hours/week, fewer admin mistakes, more/faster leads, profit). New: pick one skill, a few workflows, a demo; they care about the value on screen. Skills → faster/cheaper builds → more demos/content/own ops. Close: free School resource guide; “how I make money in 2026” card. Like CTA.

## B. Atomic Knowledge
### Factory-then-boring-paid-skills
- **Claim:** Clients pay for time saved, money saved, or mistakes removed — not fancy skills for a video. Skill creator is the factory (not the SKU). Superpowers/GSD/review/context/memory are how you ship something that doesn’t die on the client’s machine.
- **Reasoning:** Same pains across HVAC / real estate / coaches / agencies. A skill that breaks when they touch it is the wall. 80% first pass vs 60% is fewer debug cycles.
- **Mechanism:** Install the factory globally → pick one paid outcome → demo that, not the plugin list.
- **Evidence:** On-tape 400 hours / 150k stars / 10h/week. UNVERIFIED. Real-estate listing-copy as the skill-creator example.
- **Conditions:** You can name a time/money/mistake outcome.
- **Exceptions:** Claude Code / plugins / HVAC-as-hunt are not ours. 10h/week is not our analog.
- **Action:** Steal outcome-not-workflow. Do not install the six. Do not new-ICP HVAC.
- **Confidence:** high as a sell frame; hours/stars UNVERIFIED
- **Source:** eRS3CmvrOvA @ UNKNOWN
- **Epistemic:** SOURCE
### Process-plus-clean-context-plus-verified-review
- **Claim:** Superpowers = plan/test/two-stage review (don’t sprint). GSD = fresh sub-agent per task so context rot doesn’t skip requirements. /review always; /ultra-review only before a merge that can cost more than $5–20 (payments/auth/migration).
- **Reasoning:** Halfway-window rot is the #1 long-session fail. Ultra is a cloud fleet that must reproduce a bug before it lists it — not style nits. API key alone won’t run ultra; need an account + CC 2.1.86+.
- **Mechanism:** Plan → clean-context execute → local review → ultra only on the expensive-if-wrong commit. Autonomous GSD is a walk-away mode, not a token saver.
- **Evidence:** On-tape 10–20 min ultra; 3 free then $5–20. UNVERIFIED.
- **Conditions:** You are about to merge something that touches money or auth — we still HITL and do not run CC.
- **Exceptions:** GSD subs cost tokens. Ultra is a bill. Do not treat “walk away” as unattended prod.
- **Action:** Steal the sequence. HOLD ultra $ and Claude.
- **Confidence:** high as a sequence; $ UNVERIFIED
- **Source:** eRS3CmvrOvA @ UNKNOWN
- **Epistemic:** SOURCE
### Keep-garbage-out-carry-memory-across
- **Claim:** Context Mode: sandbox the tool call, return the slice (their 56kb→299b). Snapshot SQL so compact doesn’t wipe files/tasks/last prompt. ClaudeMem: auto-capture across sessions; 3-layer retrieve, don’t dump the past; don’t npm-install SDK-only (hooks never register).
- **Reasoning:** 30 min of raw Playwright/GitHub and 40% of the window is trash; then compact amnesia. New session tax is 10 min + thousands of tokens if you re-explain.
- **Mechanism:** If we ever had a long session: don’t paste raw logs; keep a handoff index. Port the idea; do not install the plugins.
- **Evidence:** On-tape 315kb→5kb, 30min→3h, 10× retrieval. Their benches UNVERIFIED.
- **Conditions:** Sessions run long enough to compact.
- **Exceptions:** Local SQL + vector store is a vendor pack. Front-end design / Claude Design are bonus, not a SKU.
- **Action:** Steal slice-not-dump + 3-layer handoff. Do not install Context Mode / ClaudeMem.
- **Confidence:** high as a pattern; benches UNVERIFIED
- **Source:** eRS3CmvrOvA @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: boring skills that save time/money/mistakes are what sell; fancy is content. Priority: factory → one demo outcome; process + clean context + verified review; then window hygiene + cross-session memory. Experience: 400 hours claim; multi-industry sameness. Contrarian: GSD is not cheaper tokens; ultra is not free; npm-install is the trap. Uncertainty: 3-free / $5–20 may have changed; 150k stars UNVERIFIED.

## D. Procedures
On-tape order (do not run): skill-creator global → Superpowers on anything production → GSD for long sessions → /review always, /ultra on money/auth/migration → Context Mode if tool-output is drowning the window → ClaudeMem if you re-explain every session → optional front-end design. Sell the outcome, not the plugin. New: one skill, a few workflows, a demo. Caption-only: install cmds UNKNOWN as clicks we run.

## E. Examples
**Situation:** Client runs the automation and it falls apart. **Action:** Superpowers plan/test/review so first pass is ~80% not ~60%. **Reasoning:** They pay for it working, not LOC. **Outcome:** Fewer debug cycles / tokens on his mouth. **Lesson:** Slow down before the client is the QA.

**Situation:** About to merge payments/auth. **Action:** /ultra-review (reproduce-before-list), 10–20 min background, $5–20 after freebies. **Reasoning:** Prod bug > run cost. **Outcome:** Confirmed bugs, not nits. **Lesson:** Pay-for-review is a HOLD for us; the gate (reproduce-before-list) is the steal.

## F. Decision Rules
IF the pitch is a fancy skill video → rewrite as time/money/mistake. IF first-pass is sloppy → process (plan/test/review) before more plugins. IF the window is rotting → new sub-agent, don’t pile on. IF the commit touches money/auth → verified review (we do not run ultra). IF someone says npm-install ClaudeMem → refuse (hooks never register). IF HVAC/real-estate as a new hunt → no. Refuse: School guide, Claude plugins, $5–20 ultra, 10h/week analog.

## G. Contrarian
Rejects fancy-skills-for-YouTube. Rejects selling the workflow. Rejects “GSD saves tokens.” Rejects ultra-on-every-commit. Field installs everything; he says pick one and demo an outcome.

## H. Assumptions
Assumes the six still exist and the $5–20 tag is current. Survivorship: his client mix. 400h / 150k stars / 10× / 56kb→299b UNVERIFIED. Falsifier: Superpowers still one-shots garbage. Speech≠behavior: “not an avatar” + plugin install wall. Clients parked — HVAC is on-tape, not a lane.

## I. Questions
What’s the Superpowers token-spend sibling tape? Did ultra’s 3-free stay. Any checkout we can open from a “10 hours/week” demo?

## J. Connections
SYSTEM SYNTHESIS: outcome-not-workflow = `outcome-offer-funnel`. Plan+verify = `XNQBCRcwXV4` / `U6k4MeVks_Y`. Context slice = `token-receipt`. 10h/week is educator stretch — `pricing-margin-roi-guardrails`. No new ICP.

## K. Future-Use
Unassigned: reproduce-before-list as a review primitive. npm-install-without-hooks as a fragment. Claude Design mention — observe only.

## Steal / Operate-never

### Machine: Sell-the-outcome-ship-with-process-and-a-clean-window
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: someone wants to sell “AI skills” → action: name time/money/mistake → factory one skill → plan/test/review → clean context per task → verified review only when a miss is expensive → checkable stop: a demo of the outcome, not a plugin list
- **Questions / signals:** What hour/mistake did we remove? Did the client run it? Is this commit money/auth?
- **Qualify / frame / objections:** Frame: boring and paid. Objection: “install all six” — he says pick one if new. Objection: “ultra everything” — $5–20 and 10–20 min.
- **Procedure:** Outcome first. Process + GSD + review ladder. Slice tool output. Cross-session handoff without dump-all. Do not npm-only.
- **Example that proves it:** Listing-copy via skill-creator; HVAC dispatch needs Superpowers; ultra on payments. $ / stars / 10h UNVERIFIED.
- **Why it works:** Fancy breaks when they touch it. Rot and raw logs make the model lie “done.”
- **Conditions / exceptions:** Works as a sell+ship frame. Exception: 400h / 150k / $5–20 / 10× / 3h UNVERIFIED. CC plugins / School / HVAC ICP operate-never.
- **Operate-never payload:** Claude Code · skill-creator/Superpowers/GSD/Context Mode/ClaudeMem · /ultra-review $ · School guide · 10h/week analog · new HVAC/RE ICP
- **Hive run (existing skills only):** `outcome-offer-funnel` · `golden-test-loop` · `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** eRS3CmvrOvA @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 400 hours / 150k stars / 10h/week / $5–20 ultra / 10× / 56kb→299b / 3h sessions as FACT or analog.
- Install Claude Code plugins. Join School. Ultra-review as a bill. New hunt ICP (HVAC/RE/coaches).

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD the six plugins, ultra $, and School. Steal outcome-not-workflow, plan/test/review, clean window, reproduce-before-list. Early rung $500–1K/mo CAD. HVAC stays parked.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
