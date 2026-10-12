# Jarvis One-Mind — architecture (behind `JARVIS_ONE_MIND=1`, default off)
Code: `apps/agent-stack/brain/one_mind/`. Golden Mission: `apps/agent-stack/eval/golden_mission/`.
The existing browser path (`brain/mission_controller.py`, `hands/browser_runtime.py`) runs **alongside**. With the flag off it is byte-identical to main except two approved spots: `mission_controller.py` terminal-commit id (now deterministic `ter_…`, waived) and the `pipeline.py` hook (only acts when the flag is on).

## Flow (spec 25)
Workers → WorkerResults (`worker_results.py`) → MissionController (`controller.py`) → 4-level verification (`verification.py`) → one terminal commit → ResponseRuntime (`response_runtime.py`) → frontier writer (injected) → user.

## Modules → spec points
| Module | Points | Notes |
|---|---|---|
| `flag.py` | all | `JARVIS_ONE_MIND=1` gate; constructors call `require_enabled()` |
| `authority.py` MissionAuthority, `select_mode`, `approval_scope` | 2, 3, 21, 23 | extends AuthorityEnvelope (systems, credentials, limits, confirm actions); hard/outward actions always need approval; pause only the affected subgraph |
| `registry.py` | 7–10 | 4 browser + 9 seed profiles; objective/reasoning_policy/authority_ref/budgets; roles, not models |
| `backends.py`, `router.py` | 10, 20 | pluggable backends; FakeBackend; Mac runtimes and paid backends refused by default; EvidenceRouter: preference > proven evidence (≥5 trials) > config order |
| `context_builder.py` | 19 | minimal per-profile context, secret-key redaction, caps; does not read files or touch `JARVIS_SHARED_CONTEXT` |
| `scheduler.py` | 5, 6, 17 | DAG order, safe-parallel batches (file/worktree/resource conflicts), downstream closure |
| `controller.py` | 1, 4, 13, 23, 25 | GOAL→GROUND→PLAN→GRAPH→EXECUTE→OBSERVE→VERIFY→RECOVER→REPLAN→COMPLETE; repair loop within retry budget; steering at batch boundaries replans only affected nodes and keeps verified work |
| `verification.py` | 14, 15 | worker / flow (independent verifier profile, downstream, PASS with evidence) / integration / mission; self-certification rejected |
| `trace.py` | 21, 26 | deterministic ids `sha256(mission, kind, parent, seq)`; ActionRecord (possible/authorized/executed/outcome_occurred); Jev decisions `authoritative=false` |
| terminal commit | 26 | `terminal_commit_id = sha256(mission_id + verified outcome{status, verified, accepted})`; O_EXCL write; replay returns the same id and `duplicate=true`; `deliver` callback fires once |
| `jev_hooks.py` | 16 | SHADOW/ADVISORY only; failure_classify / context_sufficiency etc.; output is never read back; default judge = `jev_preflight.advise` (offline) |
| `response_runtime.py` | 11, 24 | one voice from MissionResult; unverified → deterministic honest line; success words are refused on unverified outcomes; `progress()` from trace |
| `box_backend.py` BoxCodingBackend | 10, 20 | real box-agent coding backend (`box.coding`, runtime `box`, tool `box.shell`) chosen by the ModelRouter; sandbox copy → BoxCodingAgent edit/test loop → independent re-run; model alias per call via `RoutedModelClient` from `JARVIS_ONE_MIND_ALIASES['frontier.chat']` (defaults are placeholders); paid client only via `from_env(allow_paid=True)` with a key in env; CI uses FakeLLM |
| `profile_improvement.py` | 22 | traces → versioned candidate (budgets/context/persona only; never tools/authority) → offline eval → shadow (baseline always served) → promote (new ProfileRegistry) or reject; zero-regression gate; metrics to a JSONL ledger |
| `eval/golden_mission` | 28 + metrics | real sandboxed repair (tmp repo, real unittest verifier); 6 runs: 3 clean, 1 injected failure, 1 steering, 1 steering+failure; replay; six metrics = 0 |

## Eight components (spec 18)
Identity/Persona: `response_runtime.JARVIS_PROFILE` + `mouth/persona.py` · Memory/Knowledge: `memory/` (unchanged) · Reasoning/Judgment: frontier writer + `jev_hooks` · Planning/Mission State: `controller`, `scheduler` · Actions/Tools: worker adapters, `backends` · Verification: `verification` · Policy/Authority: `authority` · Observability/Evidence: `trace` · Feedback: traces → `profile_improvement` loop.

## Not in this PR (by design)
- **Point 22 profile improvement (done 2026-10-12).** See `profile_improvement.py`. Not wired to a scheduler; runs offline on demand.
- **Pipeline hook (done, Evens OK 2026-10-11 23:00 ET).** `pipeline.run_tool` → `one_mind_route` runs only with `JARVIS_ONE_MIND=1`, after the hard-step and unauthorized refusals. It routes coding turns (`cursor_ask`) to the generic controller when box-agent workers are registered (`one_mind/pipeline_hook.register_workers`). Otherwise it returns None and the legacy path runs. browser_mission keeps its own controller. Not deployed.
- **Still to do:** Real box-agent coding backend and research/browser graph templates under the generic controller are follow-ups.
- **Browser controller commit id (done, Evens OK 2026-10-11 22:54 ET).** `brain/mission_controller.py` `_terminal_commit_id`: with `JARVIS_ONE_MIND=1` it is `trace.terminal_commit_id` (sha256 of mission id + verified outcome). **Updated 2026-10-12 (Evens GO):** the id is deterministic `ter_` + sha256 regardless of the flag (same formula as `trace.terminal_commit_id`, inlined so nothing imports one_mind). Byte-identity is waived for this path only (`test_mission_controller_commit_id`).

## Overlaps
#599/#606 loaders are reused, not duplicated. Consultant's `jarvis/fixes-20261011` adds `brain/shared_context.py` under the same `JARVIS_SHARED_CONTEXT` flag; One-Mind doesn't import it. Draft #613 REA becomes the `rea.analyze` tool on `software.reviewer`.
