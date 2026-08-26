# Librarian — e18sdZLwP7o
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/e18sdZLwP7o/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/e18sdZLwP7o/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How to Build Claude Subagents Better Than 99% of People
**Channel:** Nate Herk | AI Automation
**Kind:** video (~6662 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Live: five persona sub-agents review his book chapters (Linda 58 beginner teacher; David 52 Fortune-500 COO; …) → overall ~**8/10**. Main = orchestrator; subs report only to main. Ranked #6 in his features video.
2. Why: **clean context** (main 48k / 5%). Built-in explore/research can auto-fire; custom = markdown in `.claude/agents/` same shape as a skill (YAML + body). Demo: `clickup-searcher` — name/description/model/color; NL invoke; color in the UI. **Progressive disclosure:** model reads front matter only, then the body if it matches. Description = trigger; tune misfires (should-fire-didn't / shouldn't-and-did) by rewriting it. Docs: tools, **disallowed tools** (read-only), MCP allowlist, skills. Skills ↔ agents can invoke each other. Iterate the body like a skill.
3. Skill vs agent: both are "do X in order"; agent = **fresh window + parallel + cheaper model**. Project vs global (same as skills/hooks/MCP): project ships with the repo; global is yours on every repo; move is a file move. `/agents` library: built-ins (guide, explore, plan) + yours. Create: generate-with-Claude vs manual; personal vs project. Live **plan-roaster**: roast/review phrases, read-only, Haiku, pink, project memory. Claude writes a **too-long** description — **trim for disclosure**. Ice-cream-stand roast: first hit his **roast skill** (which itself spawns five general-purpose agents). Unclosed YAML quotes = mechanical miss, not judgment. Explicit "use plan-roaster not roast skill" works; **22.8k on the sub, not the main**.
4. Doctrine: specialists > mega-assistant; main stays jack-of-skills. Borrow from `awesome-claude-code-subagents` but **scan for prompt injection**; optional read-only verifier that cannot send. Invoke: auto / `use proactively` / name / `claude --agent`. Assume if it *can* read it *will* — permission layer ≠ "please don't." Money: Opus boss + Haiku workers (300-page → three facts). `maxTurns` exists; he rarely uses it. When: about to dump a pile you'll never reread; many files; wall of output; repeated job; parallel independent (15 chapters); unbiased fresh reviewer. Skip: tiny edit; strictly sequential; **subs cannot talk** (need teams); needs full main context or to ask you. **Dynamic workflows** (Opus 4.8): one ask → many parallel subs; he saw **41** on video, **210** off-video; ate the session; trigger word later changed **workflow → ultra code** so casual "workflow" wouldn't fire. Don't force agents on a one-liner. Skool slides.
Gap: book, awesome-repo audit. Timestamp UNKNOWN. Claude/ClickUp on-tape. Do not flatten "subs can't talk" vs teams (`ZRb7D6R64hM`).

## B. Atomic Knowledge

### Fresh window + precise description; don't force a swarm
- **Claim:** A sub-agent is a skill-shaped file with its own context, model, and tool fence. The description is the router; misfires are tuned, not hoped. Unclosed YAML is a silent miss. Skills can shadow agents (roast). Isolate expensive reads on Haiku. Parallel only when independent. Teams if they must peer-DM. Dynamic/ultra-code can spawn dozens and burn the session. Permission is allowlist, not prose.
- **Reasoning:** 99% is a title. The tape's proof is the ice-cream miss + 22.8k isolation + 210-agent bill.
- **Mechanism:** YAML name/description/tools/model → trim description → test fire/misfire → rewrite → explicit name if collision.
- **Evidence:** five book reviewers; ClickUp color; unclosed quotes; roast-skill collision; 22.8k; 41/210.
- **Conditions:** 99%, 8/10, 210 UNVERIFIED as habit. Product trigger-word change dated.
- **Exceptions:** Hive already has 17 named desks. Do not install Claude agents as OS. Do not download random GitHub agents.
- **Action:** File fresh-window, description-as-trigger, YAML-must-close, skill-can-shadow, Opus-boss-Haiku-workers, don't-force, ultra-code-cost. Claude stays on-tape.
- **Confidence:** high as an orchestration tape
- **Source:** `e18sdZLwP7o` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** roast skill stole the invoke; unclosed YAML; needed explicit name
- **Speech ≠ behavior:** "better than 99%" vs sloppy live miss; "I never use --agent" vs the feature tour

## C. Mental Models
Orchestrator + specialists. Progressive disclosure. Permission ≠ prompt. Fresh reviewer. Ultra-code is a bill. Skool room.

## D. Procedures
1. Decide project (ships) vs global (yours).
2. Write a short trigger description; close the YAML.
3. Fence tools (read-only if it only reviews).
4. Put pile-work on a cheap model.
5. On misfire: read the description against the prompt; patch.
6. If two routers collide, compose them or name one.
7. Never say ultra-code unless you mean a swarm.
Avoid: random GitHub agents; 210-agent flex; Claude as hive; force a sub on a one-line edit.

## E. Examples
**Unclosed quotes:** Situation — plan-roaster silent. Action — it reads the file. Outcome — mechanical, not taste. Lesson — YAML is a lock.

**22.8k:** Situation — roast the stand. Action — sub burns tokens. Outcome — main stays clean. Lesson — that is the product.

## F. Decision Rules
- IF you will never reread the pile → sub.
- IF steps are 1-2-3-4 → stay in main.
- IF they must talk to each other → not subs (teams).
- IF you typed "ultra code" → expect a session-eating swarm.
- Refuse: unvetted awesome-list; Claude as hive; 99% as FACT.

## G. Contrarian
Against mega-assistant. Against forcing the feature. Against prompt-only "don't read that."

## H. Assumptions
Caption-only. Complements `ZRb7D6R64hM` L4 and `PQBYZQqan2g` (one-job + description). Keep isolation vs teams.

## I. Questions
What did the 210-run actually produce? Did the injection-scanner agent ever catch one?

## J. Connections
SYSTEM SYNTHESIS → hive 17-desk descriptions; `ZRb7D6R64hM`; `PQBYZQqan2g`.

## K. Future-Use
Description-as-trigger + YAML-must-close + cheap-worker + don't-force as atoms.

## Steal / Operate-never

### Machine: isolate the pile; tune the trigger; name it when routers collide
- **Epistemic:** SOURCE
- **Workflow / loop:** write short YAML → fence tools → test fire → patch description → explicit name if shadow
- **Questions / signals:** Will I reread this? Can they stay silent to each other? Did YAML close?
- **Qualify / frame / objections:** Specialists beat a mega. A swarm is a bill.
- **Procedure:** D above.
- **Example that proves it:** unclosed YAML; 22.8k isolation; roast-skill shadow.
- **Why it works:** Fresh context + a sentence router.
- **Conditions / exceptions:** 41/210 UNVERIFIED as practice. Hive does not clone Claude agents.
- **Operate-never payload:** Random GitHub agents; ultra-code flex; Claude as hive; 99% as FACT.
- **Hive run:** Map description-as-trigger onto the 17 slugs. Do not add a 210-agent mode.
- **Source:** `e18sdZLwP7o` @ UNKNOWN

### Operate-never
- Claude sub-agents as hive OS. Unvetted awesome-list. Ultra-code spend. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Librarian: description-as-trigger is the same machine as packet routing. Keep isolation vs teams. Hard steps HITL.
