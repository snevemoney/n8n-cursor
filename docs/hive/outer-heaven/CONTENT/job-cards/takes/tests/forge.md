# Forge workflow tests
Status: filled
Date: 2026-08-14
From take: takes/forge.md

## Tests

### 1. Spawn / mission compile (isolated workers)
- Tape change: Manila OFM machine → one job per isolated desk, live prompt, host cap. `cursor-spawn-desks.py` + `tape-self-teach-mission.py` are that board. Take also refuses Device Farm / OTP / secrets in repo.
- Command: `python3 -m py_compile scripts/hive/cursor-spawn-desks.py scripts/hive/tape-self-teach-mission.py scripts/hive/spawn-agent-squad.py scripts/hive/grokbot-dispatch-missions.py` then `python3 scripts/hive/cursor-spawn-desks.py --job tape-self-teach --print --agent Forge` (no `--write`).
- Result: pass
- Evidence: all four files compile. Forge dry-print exit 0, 497 words. Prompt greps pass: write-only `takes/forge.md`, do not edit `LESSONS-FROM-TAPE.md`, send/pay/deploy/book/publish banned, operate ≠ learn, farms+OTP named, `Never sendPrompt`, correlation `tape-self-teach-20260814`, no `sk-` / `xoxb-` / `n8n_api` literals. `rg` on the three spawn/mission scripts found no Device Farm, OTP inbox, or private-key blobs. Did not run Grok dispatch.

### 2. Forge-owned workflow JSON (heal / pivot / golden path)
- Tape change: Nate SaaS + Alli factory primitive — verification harness before the fifth product. Take’s known-good / golden compare. One-pager owns `error-heal-notify.json` and `creative-pivot-notify.json`; golden-path JSON is the on-disk smoke.
- Command: local `json.loads` + shape check on `workflows/hive/*.json`; existence check for the two owned files the import scripts name. Did not `curl` live webhooks. Did not run `n8n-import-error-heal.sh` or `n8n-import-creative-pivot.sh` (both activate).
- Result: fail
- Evidence: `workflows/hive/error-heal-notify.json` and `workflows/hive/creative-pivot-notify.json` are **missing**. Import scripts still point at those paths and would activate if a key were present. Live inventory (read-only) still lists Hive Error Heal Notify `RbQEZ8LYInOIsWoK` and Hive Creative Pivot Notify `ZK6R6e0EqK9AX1qo` as active — repo is not SSOT. Present hive JSON all parse: golden-path 5 nodes, path `hive-golden-path-smoke`, no secrets. Catalog mismatch: `scripts/hive/n8n-catalog.json` says `/webhook/hive-smoke-notify` vs JSON path `hive-golden-path-smoke`. README already notes golden-path exec 1404 Register Scorpion 400 — not re-hit.

### 3. slice-build skill vs take
- Tape change: Godot + Person B + Karpathy dump — one system per session, bible before code, preview ≠ domain, reject 70%. Take roll-up names `slice-build` / `click-live-site` / `session-bootstrap` and parks six proposed skills.
- Command: static compare of `scripts/hive/grok-skills/slice-build.md`, `click-live-site.md`, `paid-slice-funnel.md` against `takes/forge.md` roll-up. No site build. No deploy.
- Result: pass
- Evidence: skill still has one system, bible first, `click-live-site`, “Preview host as proof of production,” HITL on custom domain / Stripe / prod. `click-live-site` and `paid-slice-funnel` dual-smoke match take tape 6/14. Named skills on disk: slice-build, click-live-site, session-bootstrap, list-anneal-funnel, agent-as-hire, info-gain-cite, solo-then-consult. `cinematic-recipe` is PLAYBOOK + slice-build pointer, not a `grok-skills/*.md` file — consistent with “wired,” not a missing skill write. Proposed (`adversarial-click-pass`, `isolated-worktree-board`, `domain-cutover-smoke`, `sandbox-then-live`, `wiki-lint`, `known-good-artifact`) correctly absent — Evens gate, take not rewritten.

## Never (operate)
Device Farm / OTP / fake identity / mass-DM. Auto-dial / betting. Grok Bot / `sendPrompt` / `grokbot-dispatch-*.py`. Prod deploy, n8n activate, live webhook POST, custom domain, Stripe live. Secrets in repo. Merge `LESSONS-FROM-TAPE.md`. One-shot a site. Mark done from preview host.

## Blocked on Evens
Export heal + pivot JSON from live n8n into `workflows/hive/` (or kill the import scripts). Confirm which golden-path path is live (`hive-golden-path-smoke` vs `hive-smoke-notify`) — Forge will not POST to find out. Proposed skills stay listed until you say write the file.
