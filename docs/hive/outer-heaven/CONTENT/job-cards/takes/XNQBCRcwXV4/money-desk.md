# Money Desk — XNQBCRcwXV4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/XNQBCRcwXV4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/XNQBCRcwXV4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~2902 words. Nate on Boris Cherny (Claude Code creator) YC interview + Nate’s own delete-test. Caption-only; timestamp UNKNOWN; clips are speech-in-speech; visual/click UNKNOWN. Beats in order: more skills + more system prompts are probably breaking you; three things everyone should do, no technical experience. Clip 1 — new release deleted >80% of Claude Code’s system prompt: harness always changes (add/delete prompt, tools, tool-prompts) because each model is a different personality; Opus 5 is “really intelligent” so old prompt text was correcting behaviors it now just does. Nate: treat each model as a new personality; when a model drops, run it through your skills; Opus 5 felt degraded so he sometimes goes back to 4.8; he had not considered getting out of the way. Clip 2 — Boris to non-product users: every 6 months delete CLAUDE.md, skills, hooks; for Opus 5 they really recommend try deleting all of it. Nate 10-year-old vs 10-year-worker slide-deck metaphor: over-specify the kid, get in the worker’s way; “unhobbling.” His test: duplicate repo, strip CLAUDE.md + skills; gut — keep routing context (where files/wikis/business live), loosen task skills. Same prompt “make my YouTube resource guide”: with skills = 9-page pretty guide, his header, channel links, AIS Plus (preferences/styles); fresh/no-skills = messier, no header, but better content — ideas with timestamps (“prompts are disposable,” “rebuild from observation”). His bake: let it make the guide however it sees fit, then skill only the header image + YT link + AIS Plus at bottom — less delete-all, more less-specific versions. Edit-insert: do not blanket-apply Boris/Karpathy/Nate; their advice is harness/massive-codebase/training; he does research/knowledge/docs/deliverables, not day-to-day software; that is why he did not sweep-delete — rework; product builders may should delete build/orchestrate skills because the harness does that now; brand/image/color still needed; Boris agrees. Clip 3 — hobbling / product overhang: today’s model can do things we have not realized; give slightly harder tasks; common mistake = overly specific 1-2-3-4; go higher level: task + guardrails + exit criteria, let it cook (would not have worked 6 months ago). Nate: balance CLAUDE.md/skills so you don’t hobble vs getting an output you like; mediocre output may be you not saying what good looks like; /goal = standard + X/Y/Z proof it was reached + iterate until proven; “verify yourself so I don’t have to”; he appends emotional “not a prototype — tested 10 times, QA’d, ready to market tomorrow.” Clip 4 — skill now is less prompt-engineering, more: give a slightly-too-hard task + make it possible for Claude to verify along the way; verification is what people don’t get right. Nate: skills are tool-agnostic (Claude Code / Hermes / Agent Cortex); managing agents like people — don’t micromanage, check in, review, judgment/taste, let them use their brains; outsource thinking, never outsource understanding; founder drives vision; devil’s-advocate agents + self-check. Close: 35-min YC interview, link in description; like CTA. No School close on this tape.

## B. Atomic Knowledge
### Unhobble-keep-routing-loosen-tasks
- **Claim:** Each new model is a different personality. Old prompts/skills that corrected last quarter’s flaws can hobble this quarter’s model. Boris: try deleting CLAUDE.md/skills/hooks (esp. Opus 5). Nate: do not sweep-delete routing context; loosen task skills to preferences-only.
- **Reasoning:** A 10-year worker given a 10-year-old’s slide spec cannot use expertise. Product overhang: today’s model can already do more than the harness lets through.
- **Mechanism:** When a model drops: run skills; if degraded, duplicate repo, strip task skills, keep “where files live.” Compare outputs. Bake back only brand/header/links.
- **Evidence:** On-tape: Anthropic deleted >80% of CC system prompt. Nate resource-guide A/B: pretty+on-brand vs messier+better ideas+timestamps.
- **Conditions:** You have a CLAUDE.md/skills pile and a new model.
- **Exceptions:** Boris’s every-6-months delete-all is for his seat (harness/codebase). Nate says do not blanket-apply. We do not run Claude Code.
- **Action:** Steal the A/B + preferences-only bake. Do not delete our wiki. Do not install Claude.
- **Confidence:** high as a procedure; 80% UNVERIFIED
- **Source:** XNQBCRcwXV4 @ UNKNOWN
- **Epistemic:** SOURCE
### Hard-task-plus-self-verify
- **Claim:** The transferring skill is: give a slightly-too-hard task, name guardrails + exit criteria, and make the agent verify along the way. Verification is what people miss. Prompt-engineering is the old skill.
- **Reasoning:** Over-specific 1-2-3-4 hobbled modern models. Mediocre output is often “you never said what good looks like.” /goal without proof steps is a vibe.
- **Mechanism:** High-level goal + standard + X/Y/Z proof + “verify yourself” + iterate until the proof exists. Nate’s emotional closer: not a prototype, 10× tested, QA’d, ship-tomorrow — still a prompt, not a publish.
- **Evidence:** Boris on tape: slightly harder than you think; cook; would not have worked 6 months ago.
- **Conditions:** You can write a pass/fail sentence. You will still judge.
- **Exceptions:** “Ready to market tomorrow” is rhetoric. Publish/pay stay HITL. Hermes/Cortex named — not ours.
- **Action:** Steal hard-task + verify. Do not auto-ship.
- **Confidence:** high
- **Source:** XNQBCRcwXV4 @ UNKNOWN
- **Epistemic:** SOURCE
### Outsource-thinking-not-understanding
- **Claim:** Manage agents like people: get out of the way, check in, review, taste. Outsource thinking; never outsource understanding. You remain the founder/vision.
- **Reasoning:** Good managers don’t micromanage the how. Devil’s-advocate + self-check are how the agent uses its brain without you abandoning the why.
- **Mechanism:** Assign the hard task → let it cook → review the verification → you still understand the output.
- **Evidence:** On-tape manager metaphor; tool-agnostic (CC / Hermes / Cortex).
- **Conditions:** You can review. You will not rubber-stamp.
- **Exceptions:** Does not authorize unattended spend or vendor install.
- **Action:** Steal the split. Cursor + Grok only.
- **Confidence:** high
- **Source:** XNQBCRcwXV4 @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: more instructions can make a smarter model worse; verification > prompt craft. Priority: routing context stays; task specs loosen; take advice from people who use AI the way you do. Experience: resource-guide A/B after the interview; he still uses 4.8 when Opus 5 feels worse. Contrarian: delete-all is not his move; Karpathy/Boris are a different job. Uncertainty: unhobbling is “an element,” not always.

## D. Procedures
Order: (1) Hear the harness delete (>80% system prompt per model). (2) Hear Boris delete-all every 6 months / Opus 5. (3) Do not blanket-apply — name your job (his: knowledge work). (4) A/B: strip task skills, keep file-map. (5) Bake back only preferences (header/link/brand). (6) Raise the task one notch; write guardrails + exit + verify-yourself. (7) Review; never outsource understanding. Caption-only: repo duplicate / skill files UNKNOWN as clicks.

## E. Examples
**Situation:** Same “make my resource guide” prompt. **Action:** With skills → pretty 9-pager, header, AIS Plus. Without → messier, idea+timestamp outline he likes more. **Reasoning:** Task skill over-specified the format and hid the better breakdown. **Outcome:** He would skill only header + links, not the outline. **Lesson:** Preferences stay; procedure specs may hobble.

**Situation:** Mediocre Claude output. **Action:** Boris/Nate: you may not have said what good looks like or how it proves done. **Reasoning:** Exit criteria + self-verify. **Outcome:** /goal with proof steps, not 1-2-3-4 how. **Lesson:** Standard + verify, not a longer how-to.

## F. Decision Rules
IF a new model feels worse → A/B strip task skills before you buy a different sub. IF the skill is brand/header/file-map → keep. IF the skill is “build/orchestrate like last quarter” → consider delete (his software-builder branch, not ours). IF advice is from a harness trainer and you do docs → do not sweep-delete. IF /goal has no proof steps → HOLD. IF AIS Plus / Hermes / Cortex → not a SKU. Refuse: Claude Code as ours; auto-ship “ready to market.”

## G. Contrarian
Rejects “more skills = better system.” Rejects blanket Boris. Rejects prompt-engineering as the current skill (verification is). Field piles CLAUDE.md; he and Boris say get out of the way.

## H. Assumptions
Assumes Opus 5 vs 4.8 feel is real. Survivorship: one resource-guide A/B. Domain: his knowledge work. Falsifier: strip skills and the output is worse on content too. Disagreement: hive does not delete our wiki or join AIS Plus. Speech≠behavior: “outsource thinking” vs “never outsource understanding” — keep both; do not flatten.

## I. Questions
What are the other two of his “three things” if this tape is the whole list? Did he keep the timestamped outline as the new skill? YC interview date/url in packet?

## J. Connections
SYSTEM SYNTHESIS: hard-task + done-when = `U6k4MeVks_Y` /goal. Direction+judge = `NDeyhGnNECc`. Idea-is-alpha / don’t outsource thinking = `0YXjEzFfft8`. AIS Plus mention is operate-never.

## K. Future-Use
Unassigned: every-6-months skill audit as a future job-card hygiene — do not auto-write SKILL.md. Product overhang as a Researcher note.

## Steal / Operate-never

### Machine: A-B-strip-then-preferences-only-plus-self-verify
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: new model or degraded feel → action: duplicate; strip task skills; keep file-map; compare; bake back only preferences; raise task one notch with guardrails + exit + verify-yourself → checkable stop: content-better or you restore a specific skill for a named reason
- **Questions / signals:** Is this routing context or a how-to? What does good look like? How does it prove done without me?
- **Qualify / frame / objections:** Frame: unhobble, don’t sweep-delete. Objection: “Boris said delete all” — he is a harness/codebase seat; Nate did not. Objection: “more skills = moat” — more skills can be the hobble.
- **Procedure:** Model-drop → run skills → A/B strip → preferences-only bake → hard task + verify. You still understand.
- **Example that proves it:** Resource guide: pretty+AIS-Plus vs messier+timestamps; he keeps header/links only.
- **Why it works:** Last quarter’s corrections fight this quarter’s model. Verification is the skill that transfers.
- **Conditions / exceptions:** Works on knowledge/docs. Exception: >80% delete, Opus 5/4.8, AIS Plus, Hermes/Cortex stay UNVERIFIED / operate-never.
- **Operate-never payload:** Claude Code · AIS Plus · Hermes · Agent Cortex · sweep-delete our wiki · auto-ship “ready to market”
- **Hive run (existing skills only):** `golden-test-loop` · `session-bootstrap` · `context-docs` · `ask-principal`
- **Source:** XNQBCRcwXV4 @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote >80% system-prompt delete / Opus 5 vs 4.8 as FACT or as a reason to buy Claude.
- AIS Plus / Hermes / Agent Cortex as a SKU. Install Claude Code. Auto-publish a “ship tomorrow” artifact.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD Claude Code and AIS Plus. Steal: A/B strip task specs, keep routing, hard-task + self-verify, never outsource understanding. Port to Cursor + Grok. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
