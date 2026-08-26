---
name: capability-acquisition
description: >-
  Extract demonstrated capabilities from a tape: capability,
  implementation, workflow, primitive, business leverage, and skill
  candidates for existing desks. Also flag system upgrades and new
  opportunities. Use after deep-video-learning / multimodal observe,
  or when the operator says capability acquisition / what became
  possible. Candidates stay UNTESTED. Do not clone the YouTuber.
  Cursor plus Grok only.
---

# Capability acquisition

Most tapes show someone building an agent, automating a workflow, running part of a business with agents, or discovering an agent technique.

Desks should **not** primarily extract generic knowledge. They should do **capability acquisition**.

**Core question (every tape):**

What new thing became possible in this video, how did they make it possible, and can our system reproduce, generalize, and improve it?

Do **not** stop at: “AI agents can automate outbound sales.”

**Principle:** Agents learn globally, specialize locally, and upgrade the system when a lesson is infrastructural.

**Parent:** `knowledge-architecture`  
**Hosts:** `deep-video-learning` + `multimodal-youtube-learning`  
**Cursor copy:** `.cursor/skills/capability-acquisition/SKILL.md`  
**Write:** `docs/hive/outer-heaven/CONTENT/knowledge/capabilities/` · `primitives/` · `skill-candidates/` · `system-upgrades/` · `opportunities/`

## Hive constraints

- Stack: Cursor + Grok only. On-tape vendors stay on-tape.
- Clients parked. No new `icp_id`. Do not unpark Normand.
- Hard steps HITL: send / pay / deploy / book / publish. Guardrails on acquired capabilities **must** include that.
- **Last-mile (operator override 2026-08-14):** Evens overrode “do not auto-write SKILL.md from YouTube.” Bookmark pass already overrode this. YouTube must do the same. After A–K + the six: if the procedure is **distinct** → write `SKILL.md` in `scripts/hive/grok-skills/{slug}.md` + `.cursor/skills/{slug}/SKILL.md` + `~/.grokbot/skills/{slug}/SKILL.md`, add a hive-funnels table row, sync inventory/desk Tools. Status **WIRED**, not accepted-forever. Merge **only** when the steps are actually the same — labeled dissent row. **Remap-as-done is forbidden.** Also compile **one named workflow** per tape (`knowledge/workflows/{machine_id}.md` + `.json`) and a **reproduce card** on owning desks. Caption-only: no invented clicks. Do not clone the YouTuber. Do **not** rip anti-Frankenstein, HITL, or stack doctrine.
- Caption-only: implementation / click / tool / API / prompt details = `transcript-implied` or `unobserved`. Do not invent them.
- Do not dump the 146. Do not overwrite `full.txt`. Do not spawn 17. Do not clone Nate into every desk.
- Do not wire remaining Keep skills this turn.

## Four outputs (never flatten into one summary)

| Output | Meaning | Path |
|--------|---------|------|
| **KNOWLEDGE** | “I learned something.” | atoms + graph (existing layers) |
| **SKILL** | “I learned how to do something.” | `skill-candidates/` — named desk + **fragment**, not the whole YouTuber workflow |
| **SYSTEM UPGRADE** | “We discovered a better way for agents to operate.” | `system-upgrades/` — infrastructural; not a marketing-agent skill |
| **NEW CAPABILITY / OPPORTUNITY** | “We can now do something we couldn’t do before.” | `capabilities/` + `opportunities/` — may improve a desk **and/or** become a standalone service. Discovery engine, not education-only. |

## Six extractions (every YouTube learner)

### 1. Capability

What did this person make AI capable of doing?

```
CAPABILITY: {name}
GOAL: {start} → {end}
OBSERVED WORKFLOW: {ordered steps — do not slogan-compress}
TOOLS / AGENT ABILITIES / TRIGGERS / STATE / GUARDRAILS
```

Example shape (shape only, not hive FACT):

```
CAPABILITY: Autonomous outbound prospecting
GOAL: ICP definition → qualified conversations
OBSERVED WORKFLOW: ICP → find prospects → visit company → extract context
  → qualify → find contact → personalize → send → monitor → classify
  → follow up → update CRM → escalate to human
GUARDRAILS: don’t contact twice · don’t hallucinate personalization
  · don’t send without valid contact · HITL for sensitive send
```

Then: **reproduce / generalize / improve?** Caption-honest. Tape $ UNVERIFIED.

### 2. Implementation

How exactly: prompts, agents, tools, APIs, browser actions, memory, files, triggers, code, integrations.

Caption-only: only what speech reports. Else `unobserved`. Do not invent APIs or prompts.

### 3. Workflow

Actual sequence including clicks/demos, not only speech.  
Use `multimodal-youtube-learning`. Never compress a tool chain into “Research the market.”  
Write `behaviors/` + `fragments/`.

### 4. Primitive

The reusable agent pattern **underneath** the demo. Difference: copying what a YouTuber built vs learning the engineering/business principle.

Demo: “AI agent auto-replies to customer emails”  
Obvious: customer-support-email-agent  
Underneath: **EVENT-DRIVEN AGENT LOOP**

```
incoming event → retrieve context → classify → determine allowed action
  → execute → verify → update state → wait
```

That primitive can later power (examples, **not** auto-wired): email→comms, GitHub issue→Forge, cancel→retention, competitor feature→strategy, payment fail→ops, new lead→sales, PR fail tests→Forge.

### 5. Business leverage

Human work, cost, delay, bottleneck, or opportunity this affects.  
$ on tape = UNVERIFIED. Not a price analog. Not a new hunt.

### 6. Skill candidates

Which of **our existing 17 desks** could gain **all or part** of this?

One video improves several agents. **No desk copies the whole YouTuber workflow.**

Slugs (do not invent):

`big-boss` · `hitl-operator` · `communications-manager` · `lead-hunter` · `product-gtm` · `researcher` · `librarian` · `creative-studio` · `consultant` · `forge` · `personal-cfo` · `wealth-manager` · `money-desk` · `publishing-engine` · `day-planner` · `career-strategist` · `watchdog`

Example routing (shape only):

| Part | Desk |
|------|------|
| prospect-research-and-outreach | `product-gtm` / `lead-hunter` |
| reply classification | `communications-manager` |
| website → company intelligence | `researcher` |
| observe → classify → act → wait → observe again | `big-boss` (orchestrator pattern) |

Content-pipeline tape → capability + workflow + primitives (research / generation / quality / approval / publishing loops) + leverage + skills to `researcher` / `publishing-engine` / `creative-studio` — **not** one mega-agent clone.

## System upgrades (not a desk skill)

If the lesson is infrastructural (state.json, memory architecture, screenshot-after-browser-action, separate verifier), do **not** assign it as a marketing-agent skill.

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: verify after browser actions instead of assuming success
Applicability: ALL browser-using agents
Proposed change: action → observe state → compare expected → retry/escalate
Evidence: video + timestamps
Status: UNTESTED
Next: test against existing browser agents
```

## Reproduce / generalize / improve

After the six:

1. **Reproduce** — can Cursor + Grok run a dry-run of the *part* (draft only)? What’s missing? Caption gaps = `unobserved`.
2. **Generalize** — same primitive, other events? List as notes, do not wire.
3. **Improve** — HITL spine we already have (`send-removed`, `confirm-then-actuate`, `input-required-gate`). Do not “improve” by auto-send.

Hard-step guardrails on every capability: send / pay / deploy / book / publish stay Evens.

## Desk-routing rule

- Route **parts**, not clones.
- One capability → many desks possible.
- Infrastructural → `system-upgrades/`, not a desk SKILL.md.
- Status **WIRED** when a distinct procedure is written (not accepted-forever). Merge only when steps match. Remap-as-done is forbidden. Do not wire the Keep list as a dump.

## Caption-only

| On tape | Extract | Do not |
|---------|---------|--------|
| Speech names a workflow | Ordered capability + `transcript-implied` | Invent clicks, APIs, prompts |
| Speech names a tool | Tool string + `unobserved` settings | Fake an Ahrefs query |
| No implementation detail | `implementation: unobserved` | Hallucinate n8n nodes |

## Related

| Skill | Job |
|-------|-----|
| `deep-video-learning` | A–K + Steal. Then this emit. |
| `multimodal-youtube-learning` | Observe/extract sequences that feed workflow + implementation. |
| `knowledge-architecture` | KNOWLEDGE stays atoms/graph. These four outputs do not flatten into atoms-only. |
| `coverage-loop` | After steal + atoms: last-mile wire (distinct SKILL.md or labeled merge) + one named workflow. Not 147→1. |
| `workflow-compiler` | One named machine per tape walked. Not a parked ICP card. |

## Last-mile (after the six)

```
IF procedure steps ≠ any existing skill → write SKILL.md (3 places) + hive-funnels row + inventory. Status WIRED.
IF steps are the same → labeled merge + dissent. Not “already session-bootstrap.”
THEN compile knowledge/workflows/{machine_id}.md + .json (workflow-compiler + knowledge-audit).
THEN write reproduce card on owning desk(s): GOAL · ordered Cursor+Grok steps · tools · checkable-stop · HITL · UNKNOWNs · $ UNVERIFIED.
THEN extract THINK / BEHAVE / TRICKS / USE (caption-honest). Each trick lands as a desk action, not a quote.
```

**THINK** — decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue.  
**BEHAVE** — what they repeatedly check, what they skip, retries, speech≠behavior. Visual/click = UNKNOWN unless `watch.json`. Sequence-from-speech allowed.  
**TRICKS** — do / don’t, implicit shortcuts. Reverse-engineer the **shown** system (files, loops, UI, offer, CTA) into Cursor+Grok primitives. Caption-only = `transcript-implied` / `unobserved`.  
**USE** — each trick → a desk **does** this on our stack. Operate-never on their vendors.

Do not flatten 147 minds into one personality. Keep dissent.

## Never

- Stop at a generic slogan
- Clone the YouTuber into a desk
- Remap-as-done / park a distinct machine as “already X”
- Frankenstein 147 tapes into one mega-workflow
- Assign infra to a marketing desk
- Flatten the four outputs into one summary
- Invent APIs / prompts / clicks from captions
- Dump 146 capabilities
- Quote tape $ as FACT / unpark a client
- Send / pay / deploy / book / publish
