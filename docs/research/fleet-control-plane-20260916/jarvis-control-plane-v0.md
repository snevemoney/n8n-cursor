# Jarvis Control Plane v0 — Architecture (no implementation)

**Status:** Architecture only — Phase 2 readiness packet  
**Inputs:** multi-path capability graph v1, auth-gap matrix, SSOT precedence, fleet census immutable snapshot  
**Non-goals:** No code, no MCP connects, no routine activation, no credential mutation, no Outer Heaven / production writes.

---

## Purpose

Jarvis routes work to the right **desk + access path** on a **shared box**, under **building mode**, **token-meter max-3**, and **live `/` HOLD**, without assuming exclusive tool ownership.

---

## Pipeline (stages)

```
discovery → route selection → environment selection → ownership
        → policy/HITL → execution → verification → fallback/replanning
        → telemetry/learning
```

### 1) Capability discovery

- Load `capability-graph.v1.seed.json` (registry) + refresh with **live runtime evidence** when available (SSOT rank 1).
- For each need, resolve **Capability** nodes and their `access_paths[]` (`mcp | api | cli | browser | computer_use | local_service | remote_worker`).
- Filter out paths with `evidence_level ∈ {broken, blocked}` unless the task explicitly allows escalation-only planning.
- Auth-plane split: e.g. GitHub **MCP** may be verified while **gh CLI** is logged out — treat as distinct paths.

### 2) Route selection

- Match task intent → Capability name(s).
- Score paths: prefer `verified` + `authenticated` + `healthy` + lower `latency_cost.class`.
- Prefer **MCP/API** over CLI when CLI auth is broken (GitHub pattern).
- Cap concurrent workstreams at **token-meter max-3**; prefer Big Boss + subagents over desk↔desk fan-out.
- If no usable path: escalate with auth-gap `recommended_next` (reconnect MCP / login CLI / leave HOLD / broker later) — **never ask for secret values**.

### 3) Environment selection

- Default: shared Linux **box** (`shared_box: true`); per-agent **desktops** for browser/computer_use.
- Choose environment class: box shell | MCP session | browser profile | computer_use desktop | remote_worker (future).
- Building mode: no sell / no outreach send; CapEx craft ≠ public publish.
- **Live `/` HOLD** and **Ironlane public HOLD** force environment = non-prod / sample-only regardless of path health.

### 4) Ownership

- Primary: `Capability.owning_agent_ids` / path `owning_agent_ids`.
- If empty owners + shared capability → Big Boss orchestrates and delegates.
- Role capabilities (orchestration, autonomous_engineer, …) bind desks even when `access_paths` is empty.
- Do-not-route lists from agent metadata remain binding (e.g. Forge never self-PASS; HITL Operator never auto-approves).

### 5) Policy / HITL

- Consult SSOT precedence (locks > profiles).
- Actions in `{money, send, deploy, secrets, client publish, employment send}` → require HITL Operator path (`requires_hitl` / `hitl_tier`).
- Stage scoring from **Stage 5 harness default** tracker; ignore stale “late mid-4” profile text (CONFLICT → SSOT wins).
- Token-meter: max **3** streams; no ack spam; short handoff receipts.

### 6) Execution

- Invoke selected path only (do not silently swap planes).
- REF-only credentials; no secret material in graph or logs.
- This architecture stage does **not** implement executors — adapters (MCP/CLI/browser) are future work.

### 7) Verification

- After action: re-probe path health / auth when feasible.
- Evidence levels: `declared | discovered | authenticated | verified | degraded | broken | blocked | unknown`.
- Critic path: Forge stops at Consultant; Watchdog fails missing critic — unchanged from census norms.

### 8) Fallback / replanning

- Use `falls_back_to` edges and alternate `access_paths` (e.g. gh CLI → MCP Github).
- If all paths down: return structured gap from auth-gap matrix; do not invent credentials.
- If HOLD applies (live `/`, Ironlane public): **refuse**, do not fallback to a shipping path.

### 9) Telemetry / learning

- Record: capability id, path id, evidence before/after, owner, HITL decision, stream slot (1–3), outcome.
- Feed future census refreshes; do not auto-mutate standing locks or profiles from telemetry alone.
- Learning outputs stay in research packets until operator promotes to OM / SSOT.

---

## Control constraints (always on)

| Constraint | Effect |
|---|---|
| **Building mode** | No sell; drafts OK; CapEx ≠ public |
| **Live `/` HOLD** | No ship to live root hire page |
| **Ironlane public HOLD** | Organic/CapEx only |
| **Token-meter max-3** | Concurrent stream cap |
| **Shared box** | Tools shared; desktops separate |
| **No secret asks** | Broker/reconnect UX only |

---

## Multi-path capability (conceptual)

```
Capability
  access_paths[]:
    kind, evidence_level, authentication_state, health,
    permissions[], requires_hitl, hitl_tier?,
    latency_cost?, last_verified_at, owning_agent_ids[],
    shared_box, notes
```

Routing picks a **path**, not merely a capability name. Rollup `evidence_level` on the Capability is advisory (`usable_path_wins_else_worst`).

---

## Minimal decision function (architecture pseudocode)

```
function jarvis_plan(task):
  assert not violates(locks: building_mode, live_root_HOLD, ironlane_public_HOLD, token_meter_max_3)

  caps = discover(task.need)  # registry + optional live refresh
  paths = flatten(c.access_paths for c in caps)
  paths = filter_usable(paths)  # drop broken/blocked unless escalate-only

  if empty(paths):
    return Escalate(auth_gap_matrix.recommended_next(task.need))

  path = select_best(paths)  # health, auth, latency, permissions
  owner = first(path.owning_agent_ids) or BigBoss
  if task.tier3 or path.requires_hitl:
    insert HITL_Operator before execute

  env = select_environment(path.kind, shared_box=True)
  plan = {owner, path, env, streams: allocate(<=3)}
  return plan  # execution/verification adapters not in v0
```

---

## Relationship to Phase 1 census

- Immutable snapshot is the **audit baseline**.
- Phase 2 writes only under `fleet-control-plane-20260916/`.
- v1 graph **extends** v0; deprecated stubs (`gh_cli_auth`, `vercel_deploy`, …) point at multi-path successors.

---

## Out of scope for v0 implementation

- Actual executor services, queues, or OM writers  
- Automatic MCP OAuth / CLI login flows  
- Profile rewrites to clear mid-4 drift  
- Enabling/disabling routines  
