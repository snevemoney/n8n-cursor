# Fleet migration audit (spec 27). Doc only, no runtime change
Classes: KEEP AS PROFILE · KEEP AS CAPABILITY · REFACTOR INTO WORKER · MERGE · REMOVE. Proposed classes, 2026-10-11, Forge. Each needs operator confirmation before anything moves.

## Jarvis hands (apps/agent-stack)
| Unit | Class | Target |
|---|---|---|
| `browser_mission` (hands/browser_runtime.py + brain/mission_controller.py) | REFACTOR INTO WORKER | browser.planner/operator/verifier under the generic controller (runs alongside until then) |
| `cursor_ask` | REFACTOR INTO WORKER | software.builder backend (box agent; never the Mac for One-Mind missions) |
| `vault_read`, memory/retrieve.py | KEEP AS CAPABILITY | ContextBuilder source |
| `safari_see`, hands/see.py, macos_read.py, watch_frame (`mac_act`) | KEEP AS CAPABILITY | Mac-local senses for conversation; excluded from mission backends |
| `craft` (hands/craft.py) | REFACTOR INTO WORKER | design.ui / media.video |
| `status` | KEEP AS CAPABILITY | ResponseRuntime.progress |
| `refuse_hard_step` | MERGE | MissionAuthority (hard actions → REQUIRE_APPROVAL) |
| `jev_preflight.py` | KEEP AS CAPABILITY | jev_hooks default judge |
| `response.synthesizer` profile | MERGE | ResponseRuntime |

## Grok desks (fixed agents)
| Desk | Class | Target profile / capability |
|---|---|---|
| Forge | KEEP AS PROFILE | software.builder + architecture.reviewer |
| Watchdog | KEEP AS PROFILE | software.verifier / mission verification |
| Researcher | KEEP AS PROFILE | research.fast / research.deep |
| Librarian | KEEP AS CAPABILITY | memory provenance for ContextBuilder |
| Creative Studio | KEEP AS PROFILE | design.ui / media.video |
| HITL Operator | KEEP AS CAPABILITY | approval boundary handler |
| Consultant | MERGE | architecture.reviewer |
| Money Desk, Personal CFO, Wealth Manager | KEEP AS PROFILE (outside Jarvis missions) | finance.* (not seeded; spend forbidden by default) |
| Lead Hunter, Career Strategist, Product GTM | KEEP AS PROFILE (outside Jarvis missions) | research.fast variants |
| Communications Manager, Publishing Engine | KEEP AS CAPABILITY | outward actions; always approval-gated |
| Day Planner | KEEP AS CAPABILITY | calendar/context source |
| Disk Saver | KEEP AS CAPABILITY | infra hygiene, not a mission worker |
| Duplicate one-off scratch agents | REMOVE | — |
