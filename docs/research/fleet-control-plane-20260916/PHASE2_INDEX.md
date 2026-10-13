# PHASE 2 INDEX — Fleet Control Plane readiness

**Packet root:** `/workspace/research/packets/fleet-control-plane-20260916/`  
**Read-only baseline:** `/workspace/research/packets/fleet-reentry-20260916-IMMUTABLE-SNAPSHOT/`  
**Generated:** 2026-09-16 ~17:45 America/Toronto (ET)  
**Mode:** WRITE only in this packet. No production / Outer Heaven / profile / routine / credential / MCP-connect mutations.

---

## Deliverables

| # | File | Description |
|---|---|---|
| 1 | `capability-graph.v1.schema.json` | JSON Schema v1 — Capability multi-path `access_paths[]`; extended evidence/auth/health enums; nodes/edges compatible with v0 migration |
| 2 | `capability-graph.v1.seed.json` | Migrated multi-path seed (GitHub, Vercel, AWS, gcloud, Stripe, Docker, Gmail, X, Slack, Higgsfield, Hostinger-*, Codex, Claude, credential-provider, browser/computerUse + role/HOLD caps). Live-probes evidence; no secrets |
| 3a | `auth-gap-matrix.md` | Human-readable auth gaps + recommended next actions |
| 3b | `auth-gap-matrix.json` | Machine-readable same matrix |
| 4 | `ssot-precedence.md` | Ranks 1–7 SSOT ladder; mid-4 vs Stage 5 CONFLICT examples |
| 5 | `jarvis-control-plane-v0.md` | Architecture-only control plane pipeline |
| 6 | `PHASE2_INDEX.md` | This index |
| 7 | `routines-clusters.md` | Human clusters + KEEP/MERGE/MODERNIZE/REPLACE/ARCHIVE/DELETE (229/229, 48 clusters) |
| 8 | `routines-clusters.json` | Machine-readable cluster map |
| 9 | `routines-do-not-rearm.md` | Hard list: 176 numbered clone IDs + paused army bases — never re-arm |
| 10 | `n8n-mcp-surface.md` | n8n MCP surface inspection — **do not connect yet** |

---

## Source inputs (immutable — do not edit)

| Snapshot file | Role |
|---|---|
| `capability-graph.schema.json` / `capability-graph.seed.json` | v0 graph to migrate |
| `live-probes-20260916.md` | MCP + credential-provider evidence |
| `shared-surface.md` / `.json` | CLI/auth REF census |
| `FLEET_REPORT.md` | Operator report, stage drift, HOLD |
| `JARVIS_NOTES.md` | Routing notes absorbed into v0 architecture |
| `agents-directory.md` / `agents-raw.json` | Desk inventory (read-only) |
| `SNAPSHOT_MANIFEST.json` / `DO_NOT_EDIT.md` | Freeze policy |

---

## Multi-path capabilities in seed (rollup)

| Capability | Paths | Rollup |
|---|---|---|
| `capability:github` | mcp, cli, api | **verified** (MCP up; CLI broken) |
| `capability:vercel` | cli, mcp | **broken** |
| `capability:aws` | cli | **broken** |
| `capability:gcloud` | cli | **broken** |
| `capability:stripe` | cli, api | **broken** |
| `capability:docker` | cli, local_service | **verified** (CLI ok; daemon down → path-level) |
| `capability:gmail` | mcp | **verified** |
| `capability:x` | mcp | **verified** |
| `capability:slack` | mcp | **verified** |
| `capability:higgsfield` | mcp | **verified** |
| `capability:hostinger` | 8× mcp + token REF | **verified** |
| `capability:codex` | cli | **verified** |
| `capability:claude` | cli | **verified** |
| `capability:credential_provider` | provider + 1Password | **broken** |
| `capability:browser_computer_use` | playwright mcp/cli, browser-use, computer_use, chrome | **verified** |
| `capability:live_root_ship` | blocked | **blocked** (HOLD) |
| `capability:ironlane_public_publish` | blocked | **blocked** (HOLD) |

Deprecated v0 stubs retained with `metadata.superseded_by` for edge compatibility.

---

## Explicit non-actions this phase

- No MCP reconnect / CallMcpTool auth flows  
- No CLI logins  
- No routine enable/disable  
- No agent profile edits (mid-4 drift documented only)  
- No credential reads beyond REF filenames already in snapshot  
- No Outer Heaven / production modifications  

---

## Success checklist

- [x] All Phase 2 files written under packet root  
- [x] Snapshot left immutable  
- [x] No connects / routine activation  
- [x] Routines clustered (advice only; automations untouched)  
