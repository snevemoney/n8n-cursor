# SSOT precedence — Jarvis Control Plane (Phase 2)

**Packet:** `fleet-control-plane-20260916`  
**Evidence baseline:** `fleet-reentry-20260916-IMMUTABLE-SNAPSHOT` (2026-09-16 ~17:31–17:44 ET)  
**Rule:** Higher rank **wins** on conflict. Lower ranks may **inform** but must not override.

---

## Precedence ladder (1 = highest)

| Rank | Source | What it is | Jarvis behavior |
|---:|---|---|---|
| **1** | **Live runtime evidence** | Probes that just returned: MCP status, CLI auth status, credential-provider status, daemon health, HTTP checks | Trust for routing *now*. Update capability `access_paths[].evidence_level` / `authentication_state` / `health` / `last_verified_at`. |
| **2** | **Locks / current runtime state** | Standing locks, building-mode flags, live `/` HOLD, Ironlane public HOLD, enabled/paused routines, token-meter max-3 | Hard stops and stream caps. Cannot be waived by docs or stale profiles. |
| **3** | **Canonical SSOT** | Autonomy stage tracker, OM-promoted locks, Big Boss / Librarian Stage 5 harness default | Score autonomy and stage **only** from here. Prefer tracker over desk prose. |
| **4** | **Capability registry** | This control-plane graph (`capability-graph.v1.*`) + auth-gap matrix | Route by multi-path capabilities; refuse broken/blocked paths; pick fallbacks. Descriptive — not a license to sell/send/deploy. |
| **5** | **Current agent instructions** | Live desk `profile.json` / standing-locks snippets on agents | Use for role, not_for, HITL defaults — **except** where they conflict with ranks 1–3 (see CONFLICT examples). |
| **6** | **Documentation** | FLEET_REPORT, JARVIS_NOTES, Outer Heaven topics, research packets | Context and playbooks; stale until reconciled with 1–3. |
| **7** | **Historical chat** | Prior turns, old handoffs, anecdotal “we used to…” | Lowest. Never override probes, locks, or SSOT. |

---

## Conflict resolution algorithm

```
on_conflict(claim_a, claim_b):
  ra, rb = rank(claim_a), rank(claim_b)
  if ra != rb: return higher_rank_claim
  if both rank==1: prefer fresher last_verified_at; else escalate operator
  if both rank==5 (profiles disagree): defer to rank 3 (canonical SSOT)
  never invent a merge that enables money/send/deploy/live-root without HITL + locks check
```

---

## CONFLICT examples — profile stage drift (mid-4 vs Stage 5)

Census (`FLEET_REPORT` / agent metadata) shows **instruction drift**:

| Agent | Profile / standing-locks text (rank 5) | Canonical SSOT (rank 3) | Resolution |
|---|---|---|---|
| Career Strategist, Communications Manager, Consultant, Creative Studio, Day Planner, Forge, HITL Operator, Lead Hunter, Personal CFO, Product GTM, Publishing Engine, Researcher, Watchdog, Wealth Manager | Still says **"late mid-4 not Stage 5"** | Big Boss / standing-locks / autonomy-stage-tracker → **Stage 5 harness default** | **CONFLICT → prefer rank 3.** Treat mid-4 wording as stale DECLARED prompt text. Do **not** route as if mid-4. Do **not** rewrite profiles in this Phase 2 packet. |
| Big Boss, Librarian | ALIGNED: Stage 5 harness default | Stage 5 harness default | **ALIGNED** — no conflict |
| Money Desk | PARTIAL: mentions Stage harness / Stage 5 without full SSOT wording | Stage 5 harness default | **PARTIAL CONFLICT** — use rank 3 for scoring; keep Money Desk observe/advise + no money-move locks (rank 2) |

### How Jarvis should speak about stage

- **Score / report autonomy stage** → from tracker / locks (ranks 2–3) only.
- **Ignore** `"late mid-4 not Stage 5"` for autonomy scoring (per JARVIS_NOTES §8).
- **Still obey** building mode, live `/` HOLD, Ironlane public HOLD, Tier-3 HITL — these are rank **2** and survive Stage 5.

---

## Other high-value conflicts

| Topic | Lower-rank claim | Higher-rank claim | Prefer |
|---|---|---|---|
| GitHub usable? | Docs: “log in gh first” | Live: MCP Github authenticated; gh CLI logged out | **MCP path** (rank 1 evidence + rank 4 multi-path) |
| Vercel deploy? | Profile implies deploy ownership | Live: CLI logged out + MCP needsAuth; live `/` HOLD | **Refuse / escalate** (ranks 1–2) |
| Docker OK? | CLI verified on PATH | Daemon socket permission denied | **Capability degraded/broken for runtime** (path-level) |
| Secret injection | Historical “1Password works” | Credential provider not connected; 0 saved | **BROKEN** until broker (rank 1) |

---

## Refresh contract

After any auth reconnect or lock change:

1. Re-run **live probes** (rank 1) → patch `access_paths` + auth-gap matrix.
2. Confirm **locks** (rank 2) unchanged unless operator explicitly updates them.
3. Re-emit capability seed; keep schema stable unless enums change.
4. Do **not** “fix” rank-5 profile drift in Phase 2 without an explicit profile-edit workstream.

---

## Non-goals

- This document does not authorize MCP reconnects, CLI logins, routine enable/disable, or profile edits.
- Graph + precedence are routing aids — not permission to ship live `/` or move money.
