# Librarian — kB9iMD0EjT8
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kB9iMD0EjT8/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kB9iMD0EjT8/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How to Use Your Claude Code Projects in Codex in 5 Mins
**Channel:** Nate Herk | AI Automation
**Kind:** video (~2202 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Problem: stuck in Claude Code, handed same project to Codex, it solved — no new project, no duplicated context. Split screen: Claude left, Codex right.
2. Claude looks for `CLAUDE.md` + `.claude/`. Codex looks for `agents.md` + `.codex/` + `.agents/`. Shared knowledge (docs, references, scripts) is the same; each harness has its own names.
3. Demo project “Herc 2” OS: `CLAUDE.md` = executive assistant, KB, wiki path. Codex injects `agents.md` the same way. `.claude` holds memory, agents, rules, skills, settings. `.codex` holds agents + config. HTML cheat sheet promised in free Skool — agents can research their own docs so you need not memorize.
4. Both have global (~) vs project-level rules/skills. Claude: project `CLAUDE.md` + `.claude` (settings/agents/skills). Codex: `agents.md` + `.codex` (config/agents) + `.agents` (skills). Skill files = same markdown + YAML front matter. Agent files differ: Claude markdown vs Codex TOML. ClickUp searcher example: same job, different file type.
5. Three layers: (1) shared knowledge any agent can read (archives, audits, brand, decisions, worlds, projects, references) — change nothing; (2) skills/agents — same content, different folders (`.claude` vs `.agents`); (3) tool-specific config (`settings.local.json` vs `config`).
6. Fastest convert: natural language to Codex — create `agents.md` from `CLAUDE.md`; `.codex` config; skills → `.agents`; agents → `.codex`; research both docs. Maintenance: if you change `CLAUDE.md` / skills / sub-agents, also patch the Codex twins. Codex sub-agents do **not** auto-invoke — you must call them. Tools/slash commands differ. “If you’ve mastered Claude Code, you’ve basically mastered Codex.”
7. Dual-agent HTML: both researched/compared; Claude styled; Codex restored value Claude lost. Warning: two agents on one file can overwrite. Two terminals in one project. **Session handoff** skill: summarize talked / active files / decisions / next steps → paste into the other harness when stuck. Sometimes Codex unsticks in ~10 seconds.
8. Become tool-agnostic. If Claude is down all day, can you work as fast? VS Code extensions exist; he is “terminal boy” now (`claude` / `codex` commands). Comparison video coming.
Gap: HTML cheat sheet + “five things that trip beginners” not read aloud. Timestamp UNKNOWN. Claude/Codex/Hermes/Skool on-tape.

## B. Atomic Knowledge

### Three-layer port: shared knowledge / relocated skills / tool config
- **Claim:** Any coding agent can share docs; you only relocate skills/agents and duplicate harness config; skills stay markdown+YAML; agents may change format (md vs TOML).
- **Reasoning:** Stuck-on-Claude → same repo in Codex solved it; names differ, knowledge does not.
- **Mechanism:** `CLAUDE.md`↔`agents.md`; `.claude`↔`.codex`+`.agents`; NL convert + research both official docs; keep twins in sync on major edits.
- **Evidence:** Herc 2 OS; ClickUp searcher md vs TOML; dual-built HTML.
- **Conditions:** You will maintain two files when one changes. Codex sub-agents need explicit invoke.
- **Exceptions:** Overwrite risk if two agents edit one file.
- **Action:** Steal the three-layer map + NL convert + session handoff. Do not install Codex as hive.
- **Confidence:** high as a port method
- **Source:** `kB9iMD0EjT8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (caption-only folder tour)
- **Failed / retried:** Claude lost value in the HTML; Codex restored it
- **Speech ≠ behavior:** none

### Session handoff is the unstick
- **Claim:** When one harness is stuck, summarize talked/files/decisions/next → paste into the other; do not rebuild the project.
- **Evidence:** “sometimes it really does” fix in ~10 seconds
- **Action:** File handoff skill as a machine; Skool copy is operate-never
- **Confidence:** high as his habit
- **Source:** `kB9iMD0EjT8` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Tool-agnostic > ecosystem lock. Master one harness and the other is mostly names. AI can read its own docs — do not memorize the cheat sheet. Terminal over IDE extensions (his preference). Two subscriptions if you can afford the optionality.

## D. Procedures
1. Keep shared knowledge outside harness folders.
2. Ask the target harness to research both docs and emit `agents.md` / `.codex` / `.agents` from the Claude twins.
3. Convert agent files md→TOML (or reverse) without changing the job.
4. On major `CLAUDE.md`/skill/agent edits, patch the twin.
5. Explicitly invoke Codex sub-agents.
6. One file, one writer — or accept overwrite risk.
7. Stuck → session handoff → other terminal.
Avoid: duplicating the whole project; memorizing the HTML; Skool as source of truth.

## E. Examples
**Stuck then Codex:** Situation — problem inside Claude Code. Action — same project, other harness. Outcome — solved without new context. Lesson — port beats rebuild.

**HTML together:** Situation — cheat-sheet page. Action — both research; Claude styles; Codex restores lost value. Outcome — joint artifact. Lesson — complementary, but overwrite is real.

## F. Decision Rules
- IF Claude is down / stupid / stuck → handoff, do not wait.
- IF a file is shared → do not dual-write blindly.
- IF you change the brain file → change both brains.
- IF Codex sub-agent should run → call it; it will not auto.
- Refuse: hive = Claude or Codex; Skool; quote two-subs as required.

## G. Contrarian
Against “pick one coding agent.” Against memorizing vendor folder taxonomy. Against new-project-per-harness.

## H. Assumptions
“Mastered Claude ⇒ mastered Codex” is his similarity claim — tools/slash still differ. Caption-only. Completes `-nG-9vlSkho` (why portable) with how. Hive stack remains Cursor+Grok; this is on-tape method.

## I. Questions
What are the unread “five beginner trips”? Exact TOML schema? Does handoff include secrets accidentally?

## J. Connections
SYSTEM SYNTHESIS → `-nG-9vlSkho` hour-move. → `c0kaKxM2pHg` skills as reusable prompts. → hive: do not lock.

## K. Future-Use
Three-layer port + session-handoff as atoms.

## Steal / Operate-never

### Machine: three-layer port + NL convert + session handoff
- **Epistemic:** SOURCE
- **Workflow / loop:** shared knowledge stays → NL “convert this Claude project for Codex, research both docs” → twins on disk → major edit patches both → stuck → handoff paste → checkable stop = other harness can run the same job without a new repo
- **Questions / signals:** What is shared vs harness-specific? Did the twin get the last brain-file edit? Is a sub-agent auto or explicit?
- **Qualify / frame / objections:** “Easier than you think” / don’t memorize.
- **Procedure:** D above.
- **Example that proves it:** Stuck Claude → Codex same repo; HTML restore.
- **Why it works:** Knowledge is files; names are costumes.
- **Conditions / exceptions:** Dual-write overwrite; Codex no auto-invoke.
- **Operate-never payload:** Install Codex/Claude as hive; Skool HTML as SSOT; two-subs as doctrine.
- **Hive run:** Cursor + Grok. Portability = repo files.
- **Source:** `kB9iMD0EjT8` @ UNKNOWN

### Operate-never
- Hive stack = Claude or Codex. Skool classroom. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File the three-layer map next to the hour-move. Librarian stores `CLAUDE.md`/`agents.md` as costume names, not as hive doctrine. No Skool cheat-sheet wiki.
