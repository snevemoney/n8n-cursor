---
name: deep-video-learning
description: >-
  Reconstruct a speaker’s knowledge from a full video transcript (A–K),
  then steal the machine (informed steal, not a skim). Use when studying
  a tape, tape-self-teach, channel-walk teach, coverage-loop teach, or
  when the operator says deep video learning / study this video / learn
  this tape. Not a summary. Not understand-only. Not steal-first.
---

# Deep Video Learning Protocol

You are not summarizing videos. You are studying training material that may contain knowledge useful to the entire AI system now or in the future. Reconstruct the speaker’s knowledge, reasoning, methods, observations, mental models, examples, and worldview with enough fidelity that another agent who never watched the video can later reason using what was taught.

**Core rule:** not “what should I do with this video?” but “what did this person know, observe, believe, test, discover, and teach—and how do I preserve enough that the rest of the system can reason with it later?”

**Steal-after-global:** learn globally first (A–K), then steal the machine. Deep Video Learning does **not** replace steal-the-machine. It makes steal better. Never “understand only, don’t steal.” Never “steal first, skip the transcript.”

**Cursor copy:** `.cursor/skills/deep-video-learning/SKILL.md`  
**Atoms (layer 2):** `docs/hive/outer-heaven/CONTENT/knowledge/atoms/by-video/{id}.jsonl` — Researcher emits after A–K + LEARNED. Not a replacement for `full.txt`.  
**Multimodal:** `multimodal-youtube-learning` — video ≠ transcript. Caption-only: do not invent clicks.  
**Capability:** `capability-acquisition` — after observe/extract, emit the six + last-mile (WIRE distinct or labeled merge) + one named workflow + THINK/BEHAVE/TRICKS/USE. Not generic-knowledge-only.

## Hive constraints

- Evens is the visionary. Job card is a lens, not a muzzle. Role does not filter what you **learn**.
- **Operate ≠ learn.** Payload can stay operate-never; the machine still gets stolen. Ugly tapes stay in the room.
- **Steal the machine** even from extreme / ugly sources (workflow, loop, checkable stop, questions, procedures, examples).
- Hard steps stay HITL: send / pay / deploy / book / publish.
- Tape $ / student counts / job-loss % = **UNVERIFIED**. Not FACT. Not a price analog.
- **Stack:** Cursor + Grok only. On-tape tool names (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool) stay on-tape.
- Clients parked unless Evens names one. No new `icp_id`. Do not unpark Normand. Learning ≠ hunt.
- Never skip a section because “not my job.”
- Do not re-walk the Nate 82 unless Evens says. Do not merge `LESSONS-FROM-TAPE.md`.

## The 12 steps

1. **Read the Entire Source** — complete transcript; do not skip; role does not filter what you LEARN.
2. **Reconstruct What the Speaker Knows** — claims, methods, heuristics, models, warnings, examples, implicit lessons; preserve **why**.
3. **Learn the Speaker’s Perspective** — beliefs, priorities, mental models, decision rules, experience, contrarian views, uncertainty.
4. **Extract Atomic Knowledge** — Concept, Claim, Reasoning, Mechanism, Evidence, Conditions, Exceptions, Action, Confidence, Source (video + timestamp).
5. **Extract Procedures Separately** — operational how (questions, signals, qualify, frame, objections, avoid, when to change).
6. **Preserve Examples** — Situation → Action → Reasoning → Outcome → Lesson; implicit rules.
7. **Separate SOURCE / INFERENCE / SYSTEM SYNTHESIS** — never convert inference into “speaker said.”
8. **Challenge What You Learn** — evidence, assumptions, survivorship, outdated, domain-specific, conflicts, falsifiers; store disagreements.
9. **Connect Knowledge Across Domains** — only real connections.
10. **Role Application Comes LAST** — LEARN GLOBALLY → STORE GLOBALLY → APPLY LOCALLY. Specialize locally. Upgrade the system when the lesson is infrastructural (`capability-acquisition`).
11. **Preserve Unknown Future Value** — mark future-use / unassigned.
12. **Final output sections A–L** — then the **Steal / Operate-never** block (after K, before L), then L.

## Order (do not invert)

```
full.txt (entire) → A–K (global reconstruct) → Steal / Operate-never → L (role only)
```

1. Reconstruct A–K from the whole transcript.
2. **Steal pass** — informed by A–K (why it works, conditions, exceptions, implicit rules from examples). Not a one-line “steal: folder not graph” from a skim.
3. **L** — role-specific applications only. Steal is not parked in L.

## Paths

| What | Where | Contents |
|------|--------|----------|
| Desk take | `docs/hive/outer-heaven/CONTENT/job-cards/takes/{video_id}/{slug}.md` | Short header + **A–L** + **Steal / Operate-never** |
| Global store | `docs/hive/outer-heaven/CONTENT/watch-later/packets/{id}/LEARNED.md` | Shared **A–K** + stolen machines as SOURCE/INFERENCE units. **No L.** |
| Atoms | `docs/hive/outer-heaven/CONTENT/knowledge/atoms/by-video/{id}.jsonl` | Structured extract from B (+ D/E/F). Researcher emit. Schema in `knowledge/atoms/schema.json`. |
| Capability set | `knowledge/capabilities/` · `primitives/` · `skill-candidates/` · `system-upgrades/` · `opportunities/` | Six extractions + flags. UNTESTED. Parts, not clones. |

**Split (do both):**

- **Each desk** still writes a full A–L take **plus** Steal / Operate-never. Each desk learns globally. Never skip A–K because “Researcher will do it.”
- **Researcher + Librarian** merge A–K **and** stolen machines into packet `LEARNED.md` without flattening disagreements. Other desks may read `LEARNED.md` as a cross-check **after** they have read `full.txt`; they still write their own A–K.
- **Researcher emits atoms** from LEARNED §B (+ D/E/F sequences) into `knowledge/atoms/by-video/{id}.jsonl`. Validate: `python3 scripts/hive/knowledge-emit-atoms.py --file … --validate`. Append with `--video-id {id}`. Atoms are the reusable units, not a replacement for `full.txt`. Do not emit the 146 unless Evens names that slice. Do not compile a mega-workflow from this tape.
- **Researcher also runs `capability-acquisition`** after observe/extract: capability, implementation, workflow, primitive, leverage, skill candidates (our 17 slugs, parts not clones) + system-upgrade / opportunity flags. **Last-mile (override 2026-08-14):** if the procedure is distinct → write SKILL.md (3 places) + hive-funnels row + inventory (WIRED). Merge only when steps match. Remap-as-done forbidden. Compile one named workflow per tape + desk reproduce card. Extract **THINK / BEHAVE / TRICKS / USE** (caption-honest). Caption-only: no invented APIs, prompts, or clicks.

Old short steal/never take is not enough. Old takes stay valid until re-walked. Do not rewrite the 82.

## Header (desk take)

```markdown
# {Desk} — {video_id}
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/{video_id}/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/{video_id}/LEARNED.md`
**ICP:** parked unless Evens named one.
```

Then sections A–K, then **Steal / Operate-never**, then L.

## Epistemic labels

Tag every claim and every stolen machine:

| Label | Meaning |
|-------|---------|
| **SOURCE** | Speaker said / showed. Quote or tight paraphrase + timestamp. |
| **INFERENCE** | You derived it. Never write as “speaker said.” |
| **SYSTEM SYNTHESIS** | Hive connection or steal mapping. Not the speaker’s words. |

Timestamps: use VTT when present. If only `full.txt`, cite a quote locus and mark timestamp `UNKNOWN`.

## Sections A–L

### A. Source Map
What was covered, in order. Beats, demos, asides. Do not skip “off-topic.” Note gaps (no captions, visual-only, timestamp UNKNOWN).  
State **caption-only** vs visual-available. Ask: shown, clicked, sequenced, failed, retried. If only `full.txt`, mark visual/click **UNKNOWN** — do not invent a UI path.

### B. Atomic Knowledge
One block per atom. Write reusable units **here and** (Researcher) into `knowledge/atoms/`. Takes stay A–L + Steal.

```markdown
### {Concept}
- **Claim:**
- **Reasoning:** (preserve why)
- **Mechanism:**
- **Evidence:**
- **Conditions:**
- **Exceptions:**
- **Action:**
- **Confidence:**
- **Source:** `{video_id}` @ {timestamp or UNKNOWN}
- **Epistemic:** SOURCE | INFERENCE | SYSTEM SYNTHESIS
- **Knowledge type:** declared | demonstrated | implicit | synthesis
- **Modality:** speech | screen | click | navigation | visual | timing | failure | edit-signal
- **Evidence status:** observed | transcript-implied | unobserved | UNKNOWN
- **Shown / clicked / sequenced:** or UNKNOWN (caption-only)
- **Failed / retried:**
- **Speech ≠ behavior:** or none
```

Caption-only: `declared` + `modality=speech` + sequence-from-speech. Demonstrated/click without pixels = `transcript-implied` or `unobserved`. Never invent clicks from a caption.

### C. Mental Models
Beliefs, priorities, decision rules, experience, contrarian views, uncertainty. How the speaker sees the world.

### D. Procedures
Operational how, separate from claims: questions, signals, qualify, frame, objections, avoid, when to change.  
Preserve **order**. Never compress “Trends → Amazon reviews → Reddit → Similarweb → ads library → positioning” into “Research the market.” Caption-only chains = `transcript-implied`.

### E. Examples
Each: **Situation → Action → Reasoning → Outcome → Lesson**. Extract implicit rules. These feed the steal pass.

### F. Decision Rules
If X then Y. What they optimize. What they refuse. When they change course.  
Extract decision points as `IF [condition] → choose [action]`, not only the final action. Tool strategy: GOAL → TOOL → INPUT → OUTPUT → DECISION.

### G. Contrarian
What they reject that the field assumes. Store it even if the hive disagrees.

### H. Assumptions
Theirs and yours. Survivorship, outdated, domain-specific. Falsifiers. Disagreements stay labeled — do not flatten.  
Speech vs behavior mismatches stay as mismatches (do not pick a winner). Implicit tricks stay `implicit`, never “speaker said.”

### I. Questions
Open questions the tape leaves. What another agent should test. Do not invent answers.

### J. Connections
Only **real** connections to other tapes, skills, or domains. Tag SYSTEM SYNTHESIS. No forced analogies.

### K. Future-Use
Mark unknown future value / unassigned. Do not discard because it is not this desk’s job this week.

### Steal / Operate-never (after K, before L)

Informed by A–K. Another desk must be able to **execute or critique** this block using **D (procedures)** and **E (examples)**.

**Steal the machine** (workflow, loop, checkable stop, questions, procedures, examples) even from ugly tapes.

**Operate ≠ learn** — the payload can stay operate-never; the machine still gets stolen.

Not a skim one-liner.

```markdown
## Steal / Operate-never

### Machine: {name}
- **Epistemic:** SOURCE | INFERENCE | SYSTEM SYNTHESIS
- **Workflow / loop:** trigger → action → checkable stop
- **Questions / signals:** (from D)
- **Qualify / frame / objections:** (from D)
- **Procedure:** (from D)
- **Example that proves it:** Situation → Action → Reasoning → Outcome → Lesson (from E)
- **Why it works:** (from B/C — conditions, exceptions, implicit rules)
- **Conditions / exceptions:**
- **Operate-never payload:** (may be non-empty; machine still stolen)
- **Hive run (existing skills only):**
- **Source:** `{video_id}` @ {timestamp or UNKNOWN}
```

Also list **Operate-never** as a short bullet list (install vendor X, auto-send, quote tape $ as FACT, new hunt, unpark client). Never = what this desk will not **operate**, not what it will not look at.

If a machine maps to an existing `steal_as` / hive skill **and the steps are the same**, name it and write a labeled dissent. If the procedure is **distinct**, last-mile: write SKILL.md (3 places) + hive-funnels row. Remap-as-done is forbidden. Do not add an `icp_id`. Pointer to `steal-usecases` / `steal-sheet` is allowed **after** this block exists.

### THINK / BEHAVE / TRICKS / USE (required on LEARNED + owning desks)

Videos show a result **and** how a visionary/engineer thinks and behaves. Reverse-engineer what they **show** (not only what they say). Caption-honest. Do not invent clicks. Visual/click = UNKNOWN unless `watch.json`.

```markdown
## THINK / BEHAVE / TRICKS / USE
### THINK
Decision order · what they ask before they build · what they ignore · how they choose tools · when they kill vs continue.
### BEHAVE
What they repeatedly check · what they skip · retries · speech≠behavior. Sequence-from-speech. Visual UNKNOWN unless watch.json.
### TRICKS
Do / don’t · implicit shortcuts · shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok. Caption-only = transcript-implied / unobserved.
### USE
Each trick → a desk **does** this on Cursor+Grok. Not a quote. Operate-never on their vendors.
```

Do not flatten 147 minds into one personality. Keep dissent.

### L. Role-Specific Applications
**Last.** Only this desk’s local apply. Do not hide steal here. Do not skip A–K because L felt urgent.

## Packet LEARNED.md

`docs/hive/outer-heaven/CONTENT/watch-later/packets/{id}/LEARNED.md`

- Shared **A–K** (no role filter) **plus** stolen machines as **SOURCE / INFERENCE / SYSTEM SYNTHESIS** units — not only in desk L.
- Researcher + Librarian merge after **their own** A–L + Steal take is written.
- Keep desk dissent as labeled rows. Do not flatten disagreements.
- Do not copy L into LEARNED.md. Desk take = L + pointers back to this file.
- After LEARNED exists, Researcher emits layer-2 atoms (see Paths). Speech≠behavior → `knowledge/mismatches/`. Ordered chains → `knowledge/behaviors/`. Fragments → `knowledge/fragments/`. Then `capability-acquisition` (six + upgrade/opportunity). Not a project workflow. Not a desk clone.

## Related (do not replace)

| Skill | Job |
|-------|-----|
| `tape-self-teach` | After `full.txt`: this protocol is how you study. |
| `hive-spawn-desks` | Parent launches 17. Each desk writes A–L + Steal. |
| `channel-walk` | Ingest one tape, then this protocol. Not 17×N. |
| `coverage-loop` | Teach stage = this protocol, then steal, then **atoms to layer 2**. Do not jump to a mega-workflow. |
| `steal-usecases` + `steal-sheet` | After A–K + Steal block. Learn globally first, then steal. |
| `knowledge-architecture` | Five layers + compiler + audits. Atoms live there. |
| `multimodal-youtube-learning` | 15-step behavior trace. Caption-only = no invented clicks. |
| `capability-acquisition` | What became possible. Six extractions. Desk **parts**. Last-mile WIRE or labeled merge. |
| `workflow-compiler` | One named machine per tape walked. Not a parked ICP card. |
| `knowledge-audit` | After a compile, not after a tape. |

`researcher-video-to-system` / chapter dumps are not a substitute.

## Never

- Summarize instead of reconstruct
- Steal first / skip the transcript
- Understand only / skip steal
- One-line skim steal (“folder not graph”) without A–K
- Convert INFERENCE into “speaker said”
- Skip a section because “not my job”
- Re-walk the Nate 82 unless Evens says
- Merge `LESSONS-FROM-TAPE.md`
- Send / pay / deploy / book / publish
- Quote tape $ as FACT
- Unpark a client / new `icp_id`
- Install on-tape vendors
- Spawn 17 from this skill (parent does)
- Invent click traces from captions
- Emit the 146 packets into atoms unless Evens names that slice
- Compile a Frankenstein workflow from this tape
- Flatten speech≠behavior or average incompatible tactics
- Remap-as-done / park a distinct machine as “already X”
- Clone the YouTuber into a desk
- Frankenstein 147 tapes into one mega-workflow
- Stop at a generic slogan (“AI can automate outbound”)
