---
name: Issue spine (GitHub)
description: >-
  Use when hive/client work needs a durable ticket spine — GitHub Issues/Projects
  (connected), not a new Linear/Notion product.
---
# Issue spine (GitHub)

**Owners:** Forge · Watchdog
**Path:** **PROVE** — GitHub MCP connected.
Sources enriched: Cole AI-native cycle `yt:Tliio-33w4g` `yt:eecUhBpTz_g` (CAPTION_GAP) — issue = Plan gate before Implement.

## Steps
1. One issue per actionable gap; link PR.
2. Prefer GitHub Projects over installing Linear/Notion MCP unless operator asks.
3. agent-job-card may point at the issue URL.

## Never
- New PM SaaS as default spine
- New agents/icp_id for ticketing

## Tools
| Need | Path |
|---|---|
| Issues/PRs | GitHub MCP — **PROVE** |
| Linear/Notion MCP spine | **BLOCKED** unless operator asks |

## Prompts
**Issue spine**
```
Title:
Acceptance (done-when):
Lane / desk:
Link PR when open.
Plan → Implement → Validate.
```



## Wired 2026-10-13: safety tools + missed methods (Evens yes, Oct 13 1:14 AM ET)
Tools live in `/workspace/builds` (installed in `~/.local/bin` by `install.sh`, which runs every test first). Packet: `/workspace/research/packets/missed-methods-20261013/`.
- **PR body:** use the repo template `.github/pull_request_template.md` (Summary / Evidence / **Merge Danger**: one- or two-way door, blast radius, rollback). Do not delete the Merge Danger block. Write "none" with a reason instead.
- **Push guard:** every box/Mac clone carries `/workspace/builds/blast-radius-guard/pre-push`. Pushes to main, deletes and public pushes need `EVENS_OK=yes` for that one command, after Evens says yes.
- **Before review:** `two-review` (spec reviewer ≠ standards reviewer ≠ builder). Draft PRs only. No merge without Evens.
