# Researcher workflow tests
Status: filled
Date: 2026-08-14
From take: takes/researcher.md

## Tests

### 1. steal-usecases catalog merge (take machines)

- Tape change: Take roll-up added three Path C `steal_as` rows to `scripts/hive/grok-skills/steal-usecases.md` — `agent-as-hire` (`yt:Ums8suyAG1A`), `info-gain-cite` (`yt:kpMreA9ATOo`), `solo-then-consult` (`yt:QIsJe-nZ5XE`). Skill says append the master sheet and merge `business-types.json`. No new `icp_id`. $ on those tapes stays UNVERIFIED.
- Command: compared skill Run table vs `CONTENT/watch-later/STEAL_SHEET.md` Machines table vs `CONTENT/watch-later/business-types.json` `machines` keys; `python3 scripts/hive/catalog-demand-match.py --need "agent as hire onboard SOP"` (and the two sibling needs).
- Result: fail
- Evidence: Skill has 32 `steal_as`; sheet and JSON have 28. In skill, not sheet/JSON: `agent-as-hire`, `info-gain-cite`, `solo-then-consult`, plus pre-existing `private-book-install`. Take-new trio is in the skill and in `watch-later/videos/{Ums8suyAG1A,kpMreA9ATOo,QIsJe-nZ5XE}.md`. Missing from STEAL_SHEET body and from DEEP_SUMMARIES (no §16–18; those three ids absent). `catalog-demand-match` returns verdict RESEARCH / “Not in catalog” for all three needs. ICP list still the 11 catalog ids (no dentist / robotics / Harvey / betting row). No `x-bookmarks/STEAL_SHEET.md` fork.

### 2. catalog scripts --help / --check (no new lane)

- Tape change: Take parks other business and says learning ≠ hunt — do not add `icp_id` or a `business-lanes.json` row. Catalog scripts are the cheap check that the live hunt did not rotate.
- Command:
  - `python3 scripts/hive/catalog-lanes-sync-check.py`
  - `python3 scripts/hive/catalog-lanes-sync-check.py --json`
  - `python3 scripts/hive/catalog-demand-match.py --help`
  - `python3 scripts/hive/catalog-demand-match.py --need "betting ofm farm auto-dial" --format text`
  - `python3 scripts/hive/catalog-demand-match.py --need "betting ofm farm auto-dial" --format json`
  - `python3 scripts/hive/catalog-demand-match.py --need "list outbound b2b anneal" --format json`
  - `python3 scripts/hive/catalog-lane-upgrade.py --help`
- Result: fail
- Evidence: Lanes sync **OK** (`{"ok": true, "errors": []}`). Active lanes unchanged: `ai-partner-websites`, `amazon-own-store`, `dropship`, `hive-os`, `future`. `business-types.json` still 11 ICPs; all 11 runbooks exist; kill list still has `ofm-ig-farm` / `betting-prediction` / `auto-dial-factory`. JSON kill need → REFUSE, matches []. List-anneal need → BUILD on existing `list-anneal__industrial-smb__greater-montreal` (no new ICP). `--operator-yes` stays on the upgrade CLI (HITL). **Break:** `--format text` on the kill need crashes `KeyError: 'next'` after printing `VERDICT: REFUSE` — REFUSE payload has no `next` key. `--help` itself exits 0.

### 3. take packets + researcher self-test + inventory lint

- Tape change: Take says full.txt is the source; wiki-ingest = raw → wiki + index + log + lint; do not RAG a small vault. Researcher scripts and estate inventory are the verification, not a new n8n RAG fire.
- Command:
  - `python3 scripts/hive/researcher-watchlater-implement.py --self-test`
  - `python3 scripts/hive/researcher-research-implement.py --help`
  - `python3 scripts/hive/researcher-research-implement.py watchlater --self-test`
  - `python3 scripts/hive/agent-tool-inventory.py --check`
  - file existence on the three take packets + `wiki-ingest` skill + `live-workflow-inventory.{json,md}` (no live n8n `--write`)
- Result: pass
- Evidence: Both watchlater self-tests print `researcher-watchlater-implement self-test: OK` (fixture 4 items; signed-out path blocks invent). `agent-tool-inventory --check` → `OK: agent-tool-inventory`. Packets on disk with `transcripts/full.txt`: `~/.grokbot/research-packets/video-nate-herk-agentic-ai-manager-Ums8suyAG1A/` (19773 B), `video-julian-goldie-grok-seo-kpMreA9ATOo/` (16125 B), `video-nate-herk-sell-workflows-QIsJe-nZ5XE/` (19006 B). Skills present: `steal-usecases.md`, `wiki-ingest.md`, `.cursor/skills/steal-sheet/SKILL.md`. n8n inventory file lint (no API call): `generatedAt` 2026-08-12, total **177** / active **69** / inactive **108** — matches one-pager FACT. Did not POST scrapers. Note (not this fail): no grokbot packet glob `*sboNwYmH3AY*` and no `watch-later/videos/sboNwYmH3AY.md` (wiki-ingest tape is already on the sheet via DEEP_SUMMARIES).

## Never (operate)

This desk will not operate farms, OTP, fake identity, mass-DM seduction, betting / prediction SKUs, or auto-dial. It will not send / pay / deploy / book / publish. It will not run Grok Bot, merge `LESSONS-FROM-TAPE.md`, fork `x-bookmarks/STEAL_SHEET.md`, add an `icp_id`, or write a `business-lanes.json` row. Quote tape $ as UNVERIFIED — never as ours.

## Blocked on Evens

- Keep or kill merge of the three take `steal_as` into STEAL_SHEET + `business-types.json` (machines only, still `us` / Path C — no new ICP). Librarian persists what you keep.
- Keep or kill a DEEP_SUMMARIES §16–18 for those three ids.
- Fix `catalog-demand-match.py` `--format text` REFUSE `KeyError: 'next'` — yes/no.
- Do not merge takes into `LESSONS-FROM-TAPE.md` (already skipped 2026-08-14).
