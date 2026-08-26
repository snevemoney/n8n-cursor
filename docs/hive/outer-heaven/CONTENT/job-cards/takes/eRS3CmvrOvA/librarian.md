# Librarian — eRS3CmvrOvA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Tried 100+ Claude Code Skills. These 6 Are The Best
**Channel:** Nate Herk | AI Automation
**Kind:** video (~3401 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Hook: “400 hours”; most public skills are video-costume; businesses pay for six **boring** skills that save time/money/mistakes and let you build agents cheaper. He has seen the same pains across RE / HVAC / coaches / marketing (examples, not a hunt list).
2. Skill vs plugin: skill = md that teaches a job; plugin = skills + hooks/MCP that change harness behavior. He will still say “skill.” Not an AI avatar aside.
3. **1 Skill Creator** (official Anthropic): describe / drop an SOP → it drafts, tests, packages; you do not hand-edit skill.md. Clients do not buy this; it is the **factory**. Global user-scope so it auto-invokes. `/plugin install skill-creator` (on-tape).
4. **2 Superpowers:** senior-dev loop — plan first, isolated env, tests before code, two-stage review (spec match + quality). Failure mode = sprint-then-collapse in prod. HVAC dispatch / agency reporting as “must work.” Not one-shot; first pass 80% vs 60% = fewer debug cycles / tokens. “150k GitHub stars” (UNVERIFIED). Separate token-spend tape.
5. **3 GSD (Get Stuff Done):** environment vs process. Context rot mid-window (sloppy, forgets, fake-done). Fresh **sub-agents per task**, clean main session; quality gates (scope-production detection if planner drops a requirement; security tied to threat model). Autonomous mode: spec → plan/execute/commit. **Not a token saver** — subs cost; it saves redo-hours. `/gsd-help`.
6. **4 `/review` + `/ultra-review` (built-in, not installed).** `/review` = local structured review (bugs/edges/design), fast, usual tokens. `/ultra-review` (with Opus 4.7): upload branch to **cloud sandbox**, parallel reviewers (logic/security/perf/edges); bugs must be **independently reproduced** before they list. Needs Code ≥2.1.86 + **Claude account (API key alone fails)**; 10–20 min background. Use `/review` always; ultra before merge of payments/auth/migration. Pro/Max “3 free then $5–20/run” — may have changed (UNVERIFIED).
7. **5 Context Mode:** tool calls dump garbage (Playwright 56kB, 20 GH issues 59kB; ~40% window in 30 min). Routes via sandbox; only the needed slice returns (their bench: 56kB→299B; 315kB→5kB). Local SQL of edits/tasks/decisions/errors; on compact, reinjects snapshot. “30 min → 3h” (their/his claim). `/contextmode:ctx-stats`. Auto-installs MCP+hooks.
8. **6 ClaudeMem:** cross-session. Hooks lifecycle → compress via agent SDK → local SQLite + vectors; auto folder-level `CLAUDE.md`. Three-layer retrieval (index → timeline → details); repo claims ~10× vs dump-at-start. Local web viewer. **Do not `npm install` the SDK-only path** — hooks never register; use the two marketplace commands.
9. Bonus **7 official front-end design** (global) — less “AI-looking”; also in Claude Design; bring back to Code with the skill.
10. Sell the outcome (10h / mistakes / leads), not the six names. New: pick **one**, demo. Skool guide. Do not unpark HVAC/RE.
Gap: install commands on-screen. Timestamp UNKNOWN. Claude/Skool on-tape.

## B. Atomic Knowledge

### Factory + process + clean context + verified review + memory layers
- **Claim:** The paid stack is boring: a skill factory, a plan/test/review loop, per-task fresh context, local-then-ultra review (reproduced bugs), sandbox-trimmed tool output + compact snapshot, and cross-session retrieval — then you sell hours/mistakes, not plugin names.
- **Reasoning:** Fancy skills are YouTube; clients buy systems that do not rot or ship fake-done.
- **Mechanism:** Creator → Superpowers → GSD → /review → /ultra on scary merges → Context Mode → ClaudeMem. API-key-only cannot ultra.
- **Evidence:** Their byte benches; npm-install warning; 80% vs 60% first pass.
- **Conditions:** Account login for ultra; ultra costs after freebies. GSD spends tokens to save redo.
- **Exceptions:** He is not claiming one-shot. 150k stars / $5–20 / 10× UNVERIFIED.
- **Action:** Steal the layering and the npm-hook warning. Do not install these as hive. Do not auto-write SKILL.md (Creator is on-tape). No niche hunt.
- **Confidence:** high as a stack map; benches UNVERIFIED
- **Source:** `eRS3CmvrOvA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** context rot / fake-done / SDK-only install
- **Speech ≠ behavior:** “100+ skills” vs six (+bonus); “skill” vs plugin

## C. Mental Models
Factory ≠ product. Process vs environment. Ultra is for commits where a bug costs more than the run. Memory has a session layer and a lifetime layer.

## D. Procedures
1. Creator (or equivalent) from an SOP — do not hand-format first.
2. Plan/test/two-review before prod.
3. One clean sub-context per task; gates for dropped scope.
4. `/review` always; `/ultra` on auth/pay/migrate if you accept cloud upload + account.
5. Strip tool-dump; persist events across compact.
6. Cross-session retrieve in layers, not a dump.
7. Sell one demo’d outcome.
Avoid: npm SDK-only; ultra on API-key-only; six-at-once for a beginner; HVAC hunt.

## E. Examples
**Ultra vs review:** Situation — about to merge payments. Action — background 10–20 min reproduced-bug fleet. Outcome — confirmed bugs not nits. Lesson — match review weight to blast radius.

**npm install:** Situation — repo has an SDK command. Action — he warns hooks never register. Outcome — nothing works. Lesson — install path is the product.

## F. Decision Rules
- IF the commit touches pay/auth/DB → ultra (if you accept the upload).
- IF the window is filling with snapshots → sandbox-trim, do not compact-and-pray.
- IF you are selling the plugin name → stop; name hours/mistakes.
- IF install is SDK-only → refuse.
- Refuse: hive install; $5–20 as FACT; new `icp_id`.

## G. Contrarian
Against fancy YouTube skills. Against GSD-as-token-saver. Against selling the workflow graph.

## H. Assumptions
400 hours / 150k stars UNVERIFIED. Complements `c0kaKxM2pHg` (factory vs grill) and `6cEQEba0i2A` (rot). Caption-only. Niche names are examples.

## I. Questions
What does “scope production detection” actually flag? Is ultra still account-gated?

## J. Connections
SYSTEM SYNTHESIS → `c0kaKxM2pHg`; `6cEQEba0i2A`; `w9-gfaV5vlM`; do not auto-write SKILL.md.

## K. Future-Use
Layer cake + npm-hook warning + ultra-for-blast-radius as atoms.

## Steal / Operate-never

### Machine: factory → plan/test → fresh context → local review → ultra on blast-radius → session trim → cross-session retrieve
- **Epistemic:** SOURCE
- **Workflow / loop:** SOP → packaged skill → plan/test/review → per-task clean context → /review → ultra if pay/auth/migrate → trim tool dumps → mem across sessions → demo hours/mistakes. Checkable stop = reproduced bug list or a session that survives compact without a re-brief
- **Questions / signals:** Fake-done? Window 40% garbage? Touching payments?
- **Qualify / frame / objections:** Boring skills; clients do not buy the factory.
- **Procedure:** D above.
- **Example that proves it:** Ultra reproduced-bugs; npm-only fail.
- **Why it works:** Rot and fake-done are the expensive failures.
- **Conditions / exceptions:** Ultra needs account + may cost; GSD spends tokens.
- **Operate-never payload:** Install the six as hive; auto-write SKILL.md; HVAC/RE hunt; $ as FACT; cloud-upload ultra on hive secrets.
- **Hive run:** Cursor + Grok. `ask-principal` on any upload review.
- **Source:** `eRS3CmvrOvA` @ UNKNOWN

### Operate-never
- Install Superpowers/GSD/Context Mode/ClaudeMem as hive. Unpark niches. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File factory-vs-product and the npm-hook landmine. Do not copy the six into the hive.
