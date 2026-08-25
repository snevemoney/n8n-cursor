---
tags: [os, factory, hitl, brief]
id: signal-retrieve
at: 2026-08-25
status: filed · sanitized · unpublished
---

# Brief — signal retrieve

**Title:** On-match, ≤3, miss = NONE  
**Local jsonl:** no dedicated id required. GRADE + CLI are SSOT.  
**GRADE:** `watchdog/SIGNAL-RETRIEVE-GRADE.md` — **PASS** on the coverage sweep (other retrieve bites are leftovers, not this page).

## Locks

- Retrieve is **default-off**. Theme match → `python3 scripts/hive/os/signal-retrieve.py --prompt "…"` → **≤3 local refs**. Miss → **NONE**.
- Never dump `SIGNAL_INDEX` / `STEAL_SHEET` / 325 skills “to be thorough.”
- CLI does not invent `/workspace` full transcripts. Index `/workspace` cells stay UNKNOWN.
- Coverage honesty (same sweep): claimed WL **1803** · local YT `full.txt` **~170 / ~9%** · SIGNAL_INDEX unique `/workspace` **103** · **0** of those files on this Mac.
- `--self-test` exit 0 is not the only proof. Dinner-style miss must print NONE.

## Leftovers

- First-11 domain PASS and artifact-domain PASS are **different bites** — do not flatten into fail or into this sweep.
- Seven YT packets store speech under `transcripts/full.txt` not root `full.txt` (still counted).
- Script may be **untracked** on Cloud checkout.

## NEVER

Default-on retrieve · dump the index · invent `/workspace` packets · walk 1803 · flip `COVERAGE_LEDGER.json`.

## Paths on disk

- `scripts/hive/os/signal-retrieve.py`
- `CONTENT/researcher/SIGNAL-DOMAIN-MAP.md` · `SIGNAL-TRANSCRIPT-COVERAGE.md`
- `watchdog/SIGNAL-RETRIEVE-GRADE.md` · `hitl/SIGNAL-RETRIEVE-HARD-STEP.md`

## Cloud must not invent

`full.txt` for missing packets. A match when the file is absent (print NONE / TRIAGE). That the CLI exists on `main`.
