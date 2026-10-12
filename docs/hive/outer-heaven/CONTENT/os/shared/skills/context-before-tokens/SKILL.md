---
name: Context before tokens
description: >-
  Use before a long dump, bookmark batch, or DESIGN.md pack hits the model.
  Select, order, and compress what deserves the window.
---
# Context before tokens

**Owner:** all desks. Researcher on ingest.
**Source:** X `x:2092462057379729861` (@VibeMarketer_)

Bigger windows are not the work. Selecting what enters them is.

## When
Session start after a dump, a 100-cap bookmark window, a DESIGN.md pack, or "paste the whole library."

## Do
1. Select what this step needs. Drop leisure, link-only, closed packets.
2. Order: don'ts first, then one packet, then optional refs.
3. Compress to 8-15 lines or a SIGNAL_INDEX pointer.
4. Then short loops (session-bootstrap, hive-smarter-loop).

## Never
- Stuff the window to "use the context"
- Treat 100 bookmarks as 100 chats
- Quote educator window-size rules as FACT

## Tools
| Need | Path | Label |
|---|---|---|
| SIGNAL_INDEX | /workspace/research/SIGNAL_INDEX.md | **PROVE** |
| Topic files | /home/box/.grokbot/outer-heaven/CONTENT/topics/ | **PROVE** |
| 2000-file DESIGN.md dump | do not ingest whole | **WORKAROUND** one page of tokens + screenshot-to-code-brief |

## BMAD 2026-08-28 (`yt:6XgSpFdD3EU`) FACT creator description
Planning and context before generation. Human on the loop. Do not stuff a BMAD-METHOD clone or a 2,000-file DESIGN pack into the window. ASR CAPTION_GAP — do not invent v7 details from chapter titles. Pair verify-then-done + improve-system-writeback.

## Simon 37 2026-08-30 (`yt:RDeofKimDxo`) watch-page PROVE
After a plan is accepted, drop the exploration (file reads / dead ends) from the window. Keep the plan file. Resume a >1h / huge sitting from a summary, not the raw transcript. Path-scoped rules load when that path is in play — do not stuff every rule into every session.


## Repass delta — video-training 20260909 Wave I
- yt:6XgSpFdD3EU: planning/specs/acceptance criteria before fat generation; eng speed without plan just moves bottleneck to review.

## Wave AA enrich 2026-09-09 — 18 token hacks (`yt:49V-5Ock8LU`)
- Tier map: /clear between topics · disconnect unused MCP · batch prompts · plan-before-build · status visibility · lean constitution (<~200 lines) · compact~60% · cache idle cost · model ladder (mid default / cheap subtasks / expensive rare). Remap Claude slash → hive session hygiene. Claude face **BLOCKED**; Skool **NO-SKILL**. Packet `repass-20260909/49V-5Ock8LU/` · `recreation/TOKEN_HYGIENE_GATE.md`.


## Cursor Context Decay bookmark 2026-09-14 (`x:2098616247961432306` @corbin_braun)

**Bookmark FACT:** operator bookmarked a claim that Cursor's update "solved Context Decay" and "one-shot" Codex / Claude Code.
**UNVERIFIED:** Cursor competitive win / "solved" as product truth. Do not quote as hive FACT.
**Cheap cross-read (web):** Codex CLI **v0.153.0** (2026-09-03) ships experimental `features.context_management.experimental_mode` — token-budget context, history notes, `new_context` tool (PR #42385 / openai/codex). Quality of what sits in the window > raw window size. Sources: Codex Knowledge Base + changelog — treat as **FACT-as-stated**, not re-audited on our box.

### Steal → hive (enrich, not second stack)
1. Keep **select → order → compress** before any long dump (this skill). A vendor context tool does not license stuffing 100 bookmarks.
2. Prefer **artifacts + notes** over transcript replay: topic files, SIGNAL_INDEX pointers, SKILL_DELTA, ACTION_LOG — same job as "history notes."
3. When the window is poisoned (drift, wrong plan, leisure noise): **fresh loop with invariants** (job card + standing locks + 8–15 line keep list) — hive analogue of `new_context`, not a Codex install.
4. Pair **token-meter** (max-3 streams, no ack fan-out) with this skill. Bigger Cursor context ≠ more parallel desks.
5. Codex CLI / Claude Code as hive face stay **BLOCKED** → [session-handoff](sand-workflow:session-handoff) packet only. Do not install Codex experimental mode as a second harness.
6. Competitive "Cursor one-shot Codex/Claude" marketing → **UNVERIFIED**; still run verify-then-done on our builds.

### Sibling bookmarks same fire (title-only / NO-SKILL)
- `x:2097808059254951972` @ashen_one Unity CLI AI mini-game — builder curiosity; no Unity game farm skill; leisure-adjacent **NO-SKILL** unless operator asks game lane.
- `x:2096047546024206347` @theaaron Grok Bot + Codex CLI + Astra 6 on VM — reinforce Grok-first + session-handoff; no Codex desktop face.
- `x:2099105429296939119` @dev_TEMITAYO SE-2026 POV meme — **NO-SKILL** leisure/meme.

## Enrich 2026-10-11: code map instead of the grep loop (yt:cyIWQHYoUg8, AI LABS)
- Why agents burn tokens before editing: each search/read turn resends the whole growing conversation. Vector search doesn't fix it (create_account and delete_account look alike but do opposite things).
- Fix: a local, deterministic code map. Parse code into nodes (functions/classes with file:line) and edges (who calls/imports what), store as JSON, and give the agent the top few matching locations per prompt plus the blast radius (everything that depends on what it's about to change). Refresh only changed files after each edit; no model and no extra API key needed. Push mode (a hook attaches ~3 locations to every prompt) is faster; pull mode (MCP, agent asks when needed) was a bit more accurate in the creator's tests. Maps cover code only, so PRDs and notes still need normal reads.
- The tape's tool name is spoken as "Graphed"; the exact repo wasn't identified. Nearest public tools of this kind: Graphify-Labs/graphify (tree-sitter, Claude Code hooks, `graphifyy` on PyPI) and colbymchenry/codegraph (MCP). Vendor numbers (4× cheaper best case; 162 runs: −60% time, −42% tokens, −32% cost) are UNVERIFIED. Pays off on big repos, not small ones. Install is an import-gate decision, not done here.
- PROVE: `recreations/20261011/run1230/code_map.py` in signals-2mo-backlog-20261010 (AST map, top-3 lookup, blast radius, one-file incremental rebuild) → PASS.

## Enrich 2026-10-11: bulk jobs go through a script, not tool calls (x:2040104842664751422, Nick Saraev Claude Code course)
- For a bulk job (label 100–1,000 emails, rename files, score rows), have the agent write one script against the service's direct API and run it, instead of calling an MCP tool once per item. Every tool turn resends the tool schemas plus the growing history; the script path reads one compact result.
- Split the items into K slices, run K parallel classifier workers (subagents or threads), then one merge-and-apply step. Check the merged labels against a serial sample before writing back.
- Front-load research in plan mode, then build; web/API reads during the build stage are what fill the window.
- Write-back to a real account (labels, sends) still needs the operator's yes; this is about how the read/classify step runs.
- PROVE: `recreations/20261011/run1630/bulk_api_vs_tools.py` in signals-2mo-backlog-20261010 (toy token model + 10-way fan-out/merge, labels identical to serial) → PASS. The token numbers are a model, not a measurement; the course's speed-up figures are UNVERIFIED.
