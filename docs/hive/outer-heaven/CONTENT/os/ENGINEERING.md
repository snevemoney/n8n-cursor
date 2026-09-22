# Hive engineering SSOT

Continuity (Slack, session folders) is how the four see each other. It is **not** whether a capability is true.

**Rules:** `.cursor/rules/hive-engineering-rules.mdc` and root `AGENTS.md` (same constitution). Roles in `roles/`.
**Transitions:** `python3 scripts/hive/eng/forge-transition.py request --job <id> --to <STATE> --actor <name> --role <role>`
**Conductor:** `python3 scripts/hive/eng/hive-matrix.py next --job <id>`  
**Evidence gate:** `python3 scripts/hive/eng/hive-job.py verify --job <id>`  
**Jobs:** `CONTENT/os/jobs/`  
**L4 Forge-done (unchanged):** `python3 docs/hive/outer-heaven/check-forge-done.py --slice-id <id>`

## Two lanes

Lane A is this conductor (scope → architect → audit → develop → verify → test → review → document/sync). Debug is a separate route (`REGRESSION` / `WIRE_FAILURE`), not another develop pass.

Lane B is the product. First dogfood: `JOB-JEV-001` — Jarvis calls Jev for browser Watch (`computer.next_op`) and computer voice-Mac (`voice.mac_op`). Not a new agent OS.

Big Boss reads `next`. It does not implement, verify, and declare victory in one breath.

## Law

No agent may claim DONE. File, unit test, typecheck, commit, and status prose cannot advance a runtime capability past `IMPLEMENTED_UNVERIFIED`.

Only observable evidence from the claimed path advances `WIRED` / `LIVE`. Only a **different** verifier may stamp `VERIFIED`.

Builder ≠ verifier. Watchdog / Grok / another model grades Cursor. Cursor does not grade Cursor.

Hard step (send / pay / deploy / book / publish / Post) stays Evens. `SHIPPED` is not a merge.

## States

`DISCOVERED` `SCOPED` `DECISION_OWED` `ARCHITECTED` `READY` `IMPLEMENTING` `IMPLEMENTED_UNVERIFIED` `WIRED` `LIVE` `VERIFIED` `REVIEWED` `SHIPPED` `WIRE_FAILURE` `VERIFICATION_UNAVAILABLE` `VERIFICATION_PREREQUISITE_REQUIRED` `REGRESSION` `PARKED`

`PARKED` is not complete. Face down is `VERIFICATION_UNAVAILABLE`, not PASS.

## Context split

| SSOT | Holds |
|---|---|
| Engineering | this file · `jobs/` · gate exit code · Face `127.0.0.1:4018` |
| Continuity | `#hive` · session folders · transcripts |

Do not inject all four session folders unless the **job** names them.

## Reuse

Do not mint a second Jarvis pipeline. Canonical Face is `apps/agent-stack/face` on `127.0.0.1:4018`. Jev picker is OpenRouter Decisions `typesafe/jev-1.13` — not the TypeSafe SDK, not `jev-ultrafast` clone.

## Signal loop

Saved material is untrusted research. `python3 scripts/hive/eng/signal.py` captures an immutable raw signal, extracts claims, and can file a candidate. `promote --write-rule` fails. A candidate stays a candidate until an experiment is `PROVEN` on the claimed surface, and an untrusted signal cannot promote itself. Lookup of old sheets stays `scripts/hive/os/signal-retrieve.py` (≤3 refs, default off). A saved signal is not a Hive rule.
