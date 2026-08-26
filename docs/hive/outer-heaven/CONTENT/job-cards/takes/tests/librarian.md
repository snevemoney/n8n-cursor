# Librarian workflow tests
Status: filled
Date: 2026-08-14
From take: takes/librarian.md

## Tests

### 1. takes/ SSOT wiring
- Tape change: Canonical = `takes/{slug}.md`. Agents load their own take. Cursor-draft is not the scoreboard. Librarian persists what Evens keeps. Do not flatten 17 desks into one memo.
- Command: `python3` schema check of `tape-self-teach-mission.py` AGENTS vs `takes/*.md` vs `takes/README.md` vs `job-cards/INDEX.md`; `python3 scripts/hive/cursor-spawn-desks.py --job tape-self-teach --print --agent Librarian`; `python3 scripts/hive/os/outer-heaven-brief.py --agent Librarian`
- Result: fail
- Evidence:
  - Repo write-path is intact: 17/17 slugs match AGENTS, README, and INDEX. Each take is `Status: filled`, has a Roll-up, and names all 18 corpus ids. Librarian take is 31582 bytes. Spawn `--print` writes only `takes/librarian.md` and Hard-never includes “Do not edit LESSONS-FROM-TAPE.md.”
  - `LESSONS-FROM-TAPE.md` is a 43-line shell (2965 bytes), not a merged scoreboard. `LESSONS-FROM-TAPE.cursor-draft.md` is 601 lines / 57087 bytes and marked not canonical.
  - Read-path is not wired. Librarian job card Load first is `wiki-ingest.md` + `INDEX.md` only — no `takes/librarian.md`. Brief injects job-card owns/never (`wiki-ingest` present) and does not mention `job-cards/takes`, skip-merge, or the cursor-draft. Brief correctly omits the 17-desk dump.
  - Vault mirror `~/.grokbot/outer-heaven/CONTENT/job-cards/` has the 17 cards + INDEX and no `takes/`, no `LESSONS-FROM-TAPE.md`. `.hive/graph-index.json` (`generatedAt` 2026-08-14T06:23:14Z, vault=`~/.grokbot/outer-heaven`, 400 nodes / 4839 edges) has 0 paths under `job-cards/takes`.

### 2. skip-merge banner
- Tape change: Evens skipped merge 2026-08-14. Takes stay SSOT. Do not merge. Do not ask again. Do not Load the cursor-draft.
- Command: string check on LESSONS shell, `takes/README.md`, `tape-self-teach.md`, `tape-self-teach-mission.py`, `hive-spawn-desks/SKILL.md`, `_prompts/librarian.md`, `_prompts/researcher.md`; spawn `--print --agent Librarian`
- Result: fail
- Evidence:
  - Banner is on the shell and the takes index: `LESSONS-FROM-TAPE.md` Decision + Walk + Maintain; `takes/README.md` line 5. Both have “skipped merge”, “Do not merge. Do not ask again”, “takes stay SSOT.”
  - Live spawn/skill still teach a merge. `tape-self-teach.md` description: “Merge into LESSONS-FROM-TAPE.md only after Evens keeps.” Fleet-walk line: “Researcher + Librarian merge unique desk wording after Evens keeps.” No skip-merge banner on that skill.
  - `tape-self-teach-mission.py` `extra_for("Librarian")`: “Same merge gate as Researcher: wait until Evens keeps and 17 roll-ups exist.” Researcher extra: “Then merge unique voices into LESSONS-FROM-TAPE.md.” Spawn `--print` for Librarian still emits that gate; skip-merge / “Do not ask again” are absent.
  - `.cursor/skills/hive-spawn-desks/SKILL.md` step 5: “Evens keeps or kills before anyone merges `LESSONS-FROM-TAPE.md`.”
  - This test did not merge the scoreboard and does not ask to.

### 3. wiki-ingest skill vs take
- Tape change: Outer Heaven is the only wiki. Cycle = raw drop → pages + index + log + provenance. Two-vault split: tape takes in `CONTENT/job-cards/takes/`, operator keeps in OPERATOR_MEMORY / CHRONICLE. `hot.md` only as a short working set. No second wiki app. No 8k-node Obsidian theater. n8n is notify, not the reader.
- Command: read `scripts/hive/grok-skills/wiki-ingest.md` vs `takes/librarian.md`; disk check of `docs/hive/outer-heaven/` + `~/.grokbot/outer-heaven/`; confirm no `apps/*wiki*`; read n8n one-pager `CONTENT/n8n-learning/one-pagers/librarian.md`
- Result: fail
- Evidence:
  - Skill still matches the never: “No second wiki app”; “Do not stand up Claude Code, Cowork, or a second Obsidian vault”; raw / index / log / lint; `OPERATOR_MEMORY`. No `apps/` named wiki. Graph is 400 nodes, not 8k theater. `obsidian/build-graph-index.mjs` is an indexer, not a second app. n8n one-pager: do not use n8n as SSOT; prefer `outer-heaven-brief.py` / vault. Webhooks not fired.
  - Skill vs take gaps: wiki-ingest does not name `takes/`, skip-merge, CHRONICLE, `hot.md`, or provenance (the word is absent). It still says “Grok Librarian queries” (this test did not call Grok Bot). Take’s two-vault split is not in the skill.
  - Repo wiki shape exists (`CONTENT/`, `CHRONICLE/`, `OPERATOR_MEMORY.md`, `.hive/graph-index.json`). Nate-clone `wiki/` + `raw/` dirs are correctly absent. No `hot.md` under Outer Heaven (allowed — optional working set).
  - Query-side vault is stale vs the take: `~/.grokbot/outer-heaven` is a separate tree from `docs/hive/outer-heaven`; takes and the skip-merge shell are repo-only. Index was built from the vault, so the SSOT the take named is invisible to the graph.

## Never (operate)
- Do not merge `LESSONS-FROM-TAPE.md`. Do not ask again. Do not Load the cursor-draft.
- Do not call Grok Bot, `grokbot-dispatch-tape-self-teach.py`, or `/api/sendPrompt`.
- Do not fire n8n `hive-outer-heaven-report` or `hive-chronicle-ingest`.
- Do not stand up a second wiki or 8k-node Obsidian theater. Do not delete CHRONICLE.
- Do not operate farms, OTP, fake identity, mass-DM, betting, or auto-dial.
- Do not promote tape dollars or job-loss percents as FACT.
- Do not rewrite other desks’ takes. Do not auto-write proposed `SKILL.md` files.

## Blocked on Evens
- Say write before anyone patches `tape-self-teach.md`, `tape-self-teach-mission.py` `extra_for`, `hive-spawn-desks`, or `wiki-ingest.md` to the skip-merge + takes SSOT. Proposed skills on the take stay listed until Evens says write the file.
- Say sync before mirroring `takes/` + the LESSONS shell into `~/.grokbot/outer-heaven` and rebuilding `graph-index.json`. Vault mirror is Librarian-owned; this test did not sync.
- Job-card Load first still omits `takes/librarian.md`. Brief should keep omitting the 17-desk dump. Pointer vs dump is Evens’s call.
