# Routine clusters — Phase 2 inventory

**Census:** 2026-09-16 17:45 EDT (America/Toronto)
**Source:** fleet-reentry-20260916-IMMUTABLE-SNAPSHOT (`agents-raw.json`); disk verified READ-ONLY (229 match)
**Write root:** `/workspace/research/packets/fleet-control-plane-20260916/` only — **no** agent-data mutations
**Standing lock:** never re-arm clone armies (`*-2`…`*-N`, especially `*-10`+)

## Coverage

- Total routines: **229** (34 enabled / 195 paused)
- Clusters: **48**
- Uncategorized leftovers: **0** — none

## Summary by cluster recommendation

| Recommendation | Clusters |
|---|---:|
| KEEP | 21 |
| MERGE | 3 |
| MODERNIZE | 2 |
| REPLACE | 2 |
| ARCHIVE | 20 |
| DELETE | 0 |

## Summary by routine disposition

Member-level disposition (canonical survivors in ARCHIVE/REPLACE clusters counted as KEEP when enabled):

| Disposition | Routines |
|---|---:|
| KEEP | 31 |
| MERGE | 4 |
| MODERNIZE | 2 |
| REPLACE | 0 |
| ARCHIVE | 192 |
| DELETE | 0 |
| **Total** | **229** |

## Summary by agent

| Agent | Total | En/Paused | KEEP | MERGE | MODERNIZE | REPLACE | ARCHIVE | DELETE |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| Big Boss | 3 | 1/2 | 1 | 1 | 0 | 0 | 1 | 0 |
| Career Strategist | 14 | 1/13 | 1 | 0 | 0 | 0 | 13 | 0 |
| Communications Manager | 14 | 1/13 | 1 | 0 | 0 | 0 | 13 | 0 |
| Consultant | 4 | 4/0 | 4 | 0 | 0 | 0 | 0 | 0 |
| Creative Studio | 21 | 0/21 | 0 | 0 | 0 | 0 | 21 | 0 |
| Day Planner | 17 | 2/15 | 2 | 0 | 0 | 0 | 15 | 0 |
| Forge | 4 | 4/0 | 1 | 2 | 1 | 0 | 0 | 0 |
| HITL Operator | 25 | 1/24 | 1 | 0 | 0 | 0 | 24 | 0 |
| Lead Hunter | 20 | 0/20 | 0 | 0 | 0 | 0 | 20 | 0 |
| Librarian | 4 | 0/4 | 0 | 0 | 1 | 0 | 3 | 0 |
| Money Desk | 15 | 3/12 | 3 | 0 | 0 | 0 | 12 | 0 |
| Personal CFO | 14 | 1/13 | 1 | 0 | 0 | 0 | 13 | 0 |
| Product GTM | 19 | 2/17 | 2 | 1 | 0 | 0 | 16 | 0 |
| Publishing Engine | 14 | 1/13 | 1 | 0 | 0 | 0 | 13 | 0 |
| Researcher | 23 | 7/16 | 7 | 0 | 0 | 0 | 16 | 0 |
| Watchdog | 15 | 3/12 | 3 | 0 | 0 | 0 | 12 | 0 |
| Wealth Manager | 3 | 3/0 | 3 | 0 | 0 | 0 | 0 | 0 |

## Clusters

### `CLONE-001` — Career Strategist: career-development-check clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** Weekly career lane; ARCHIVE numbered clones; leave canonical enabled. NEVER re-arm *-N.
- **Members:** 14 (1 en / 13 paused)
- **Canonical:** `career-development-check`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `career-development-check` | Career development check | `0 9 * * 1` | canonical | KEEP |
| PA | `career-development-check-10` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-11` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-12` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-13` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-14` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-2` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-3` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-4` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-5` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-6` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-7` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-8` | Career development check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `career-development-check-9` | Career development check | `0 9 * * 1` | clone | ARCHIVE |

### `CLONE-002` — Communications Manager: inbox-triage clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** Daily inbox triage; ARCHIVE numbered clones; leave canonical enabled. NEVER re-arm *-N.
- **Members:** 14 (1 en / 13 paused)
- **Canonical:** `inbox-triage`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `inbox-triage` | Inbox triage | `0 7 * * *` | canonical | KEEP |
| PA | `inbox-triage-10` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-11` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-12` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-13` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-14` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-2` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-3` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-4` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-5` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-6` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-7` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-8` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |
| PA | `inbox-triage-9` | Inbox triage | `0 7 * * *` | clone | ARCHIVE |

### `CLONE-003` — HITL Operator: morning-hitl-digest clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** Morning HITL digest; ARCHIVE *-2..*-25 clone army; leave canonical enabled. NEVER re-arm *-N.
- **Members:** 25 (1 en / 24 paused)
- **Canonical:** `morning-hitl-digest`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `morning-hitl-digest` | Morning HITL digest | `0 8 * * *` | canonical | KEEP |
| PA | `morning-hitl-digest-10` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-11` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-12` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-13` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-14` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-15` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-16` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-17` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-18` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-19` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-2` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-20` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-21` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-22` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-23` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-24` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-25` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-3` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-4` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-5` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-6` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-7` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-8` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |
| PA | `morning-hitl-digest-9` | Morning HITL digest | `0 8 * * *` | clone | ARCHIVE |

### `CLONE-004` — Personal CFO: personal-finance-check clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** Weekly personal finance; ARCHIVE numbered clones; leave canonical enabled. NEVER re-arm *-N.
- **Members:** 14 (1 en / 13 paused)
- **Canonical:** `personal-finance-check`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `personal-finance-check` | Personal finance check | `0 9 * * 1` | canonical | KEEP |
| PA | `personal-finance-check-10` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-11` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-12` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-13` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-14` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-2` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-3` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-4` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-5` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-6` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-7` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-8` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `personal-finance-check-9` | Personal finance check | `0 9 * * 1` | clone | ARCHIVE |

### `CLONE-005` — Publishing Engine: publishing-pipeline-check clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** Weekly publishing check; ARCHIVE numbered clones; leave canonical enabled. NEVER re-arm *-N.
- **Members:** 14 (1 en / 13 paused)
- **Canonical:** `publishing-pipeline-check`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `publishing-pipeline-check` | Publishing pipeline check | `0 9 * * 1` | canonical | KEEP |
| PA | `publishing-pipeline-check-10` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-11` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-12` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-13` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-14` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-2` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-3` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-4` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-5` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-6` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-7` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-8` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `publishing-pipeline-check-9` | Publishing pipeline check | `0 9 * * 1` | clone | ARCHIVE |

### `CLONE-006` — Researcher: weekly-intel-dossier clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** Weekly intel dossier; ARCHIVE *-2..*-15; leave canonical enabled (schedule already modernized vs clone 0 9). NEVER re-arm *-N.
- **Members:** 15 (1 en / 14 paused)
- **Canonical:** `weekly-intel-dossier`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `weekly-intel-dossier` | Weekly intel dossier | `0 15 * * 1` | canonical | KEEP |
| PA | `weekly-intel-dossier-10` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-11` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-12` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-13` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-14` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-15` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-2` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-3` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-4` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-5` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-6` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-7` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-8` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |
| PA | `weekly-intel-dossier-9` | Weekly intel dossier | `0 9 * * 1` | clone | ARCHIVE |

### `CLONE-007` — Watchdog: control-plane-heartbeat clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** Control-plane heartbeat; ARCHIVE *-2..*-12 (stale */6 schedule); leave canonical enabled (8,14,20). NEVER re-arm *-N.
- **Members:** 12 (1 en / 11 paused)
- **Canonical:** `control-plane-heartbeat`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `control-plane-heartbeat` | Control plane heartbeat | `0 8,14,20 * * 1-5` | canonical | KEEP |
| PA | `control-plane-heartbeat-10` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-11` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-12` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-2` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-3` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-4` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-5` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-6` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-7` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-8` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |
| PA | `control-plane-heartbeat-9` | Control plane heartbeat | `0 */6 * * *` | clone | ARCHIVE |

### `CLONE-008` — Researcher: web-intelligence-hunter-routine clone pair

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE paused -2 sibling; KEEP canonical enabled (Mon 15:30). NEVER re-arm clone.
- **Members:** 2 (1 en / 1 paused)
- **Canonical:** `web-intelligence-hunter-routine`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `web-intelligence-hunter-routine` | Web Intelligence Hunter routine | `30 15 * * 1` | canonical | KEEP |
| PA | `web-intelligence-hunter-routine-2` | Web Intelligence Hunter routine | `0 9 * * 1` | clone | ARCHIVE |

### `SUPER-009` — Day Planner: morning-day-plan → weekday-ceo-day-card

- **Kind:** supersession
- **Recommendation:** **REPLACE**
- **Rationale:** REPLACE morning-day-plan* (all paused) with live weekday-ceo-day-card; ARCHIVE all morning-day-plan clones; never re-arm.
- **Members:** 16 (1 en / 15 paused)
- **Canonical:** `weekday-ceo-day-card`
- **Notes:** weekly-focus-propose is separate KEEP (see singleton).

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `weekday-ceo-day-card` | Weekday CEO day card | `15 8 * * 1-5` | canonical | KEEP |
| PA | `morning-day-plan` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-10` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-11` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-12` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-13` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-14` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-15` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-2` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-3` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-4` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-5` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-6` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-7` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-8` | Morning day plan | `0 7 * * *` | member | ARCHIVE |
| PA | `morning-day-plan-9` | Morning day plan | `0 7 * * *` | member | ARCHIVE |

### `SUPER-010` — Money Desk: business-finance-snapshot → ce-read-snapshot

- **Kind:** supersession
- **Recommendation:** **REPLACE**
- **Rationale:** REPLACE paused business-finance-snapshot* army with live ce-read-snapshot (same 18:00 observe lane); ARCHIVE all *-N; never re-arm.
- **Members:** 13 (1 en / 12 paused)
- **Canonical:** `ce-read-snapshot`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `ce-read-snapshot` | CE read snapshot | `0 18 * * *` | canonical | KEEP |
| PA | `business-finance-snapshot` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-10` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-11` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-12` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-2` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-3` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-4` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-5` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-6` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-7` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-8` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |
| PA | `business-finance-snapshot-9` | Business finance snapshot | `0 18 * * *` | member | ARCHIVE |

### `CLONE-011` — Product GTM: gtm-phase-rotation clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE all gtm-phase-rotation (base+*-2..*-14 paused); building-mode/no-sell; never re-arm clones.
- **Members:** 14 (0 en / 14 paused)
- **Canonical:** `gtm-phase-rotation`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `gtm-phase-rotation` | GTM phase rotation | `0 9 * * 1` | canonical | ARCHIVE |
| PA | `gtm-phase-rotation-10` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-11` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-12` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-13` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-14` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-2` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-3` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-4` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-5` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-6` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-7` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-8` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |
| PA | `gtm-phase-rotation-9` | GTM phase rotation | `0 9 * * 1` | clone | ARCHIVE |

### `SUPER-012` — Product GTM: ProofCheck GTM family

- **Kind:** supersession
- **Recommendation:** **MERGE**
- **Rationale:** MERGE proofcheck-gtm-routine* + product-gtm-proofcheck-weekly into one paused ProofCheck design; ARCHIVE clones; do not re-arm until lifecycle leaves building mode.
- **Members:** 3 (0 en / 3 paused)
- **Canonical:** `product-gtm-proofcheck-weekly`
- **Notes:** Canonical pick is the clearer weekly id; all remain paused.

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `product-gtm-proofcheck-weekly` | product-gtm-proofcheck weekly | `0 9 * * 1` | canonical | MERGE |
| PA | `proofcheck-gtm-routine` | ProofCheck GTM routine | `0 9 * * 1` | member | ARCHIVE |
| PA | `proofcheck-gtm-routine-2` | ProofCheck GTM routine | `0 9 * * 1` | member | ARCHIVE |

### `CLONE-013` — Lead Hunter: lead-pipeline-check clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE lead-pipeline-check army (all paused); drafts-HITL/building-mode; never re-arm *-N.
- **Members:** 14 (0 en / 14 paused)
- **Canonical:** `lead-pipeline-check`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `lead-pipeline-check` | Lead pipeline check | `0 18 * * *` | canonical | ARCHIVE |
| PA | `lead-pipeline-check-10` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-11` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-12` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-13` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-14` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-2` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-3` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-4` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-5` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-6` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-7` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-8` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-pipeline-check-9` | Lead pipeline check | `0 18 * * *` | clone | ARCHIVE |

### `CLONE-014` — Lead Hunter: lead-surface-read clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE lead-surface-read army (base+*-2..*-4 paused); never re-arm.
- **Members:** 4 (0 en / 4 paused)
- **Canonical:** `lead-surface-read`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `lead-surface-read` | Lead surface read | `0 18 * * *` | canonical | ARCHIVE |
| PA | `lead-surface-read-2` | Lead surface read | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-surface-read-3` | Lead surface read | `0 18 * * *` | clone | ARCHIVE |
| PA | `lead-surface-read-4` | Lead surface read | `0 18 * * *` | clone | ARCHIVE |

### `CLONE-015` — Lead Hunter: warm-outreach-rep clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE warm-outreach-rep pair (paused); no send in building mode; never re-arm.
- **Members:** 2 (0 en / 2 paused)
- **Canonical:** `warm-outreach-rep`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `warm-outreach-rep` | Warm outreach rep | `0 18 * * *` | canonical | ARCHIVE |
| PA | `warm-outreach-rep-2` | Warm outreach rep | `0 18 * * *` | clone | ARCHIVE |

### `CLONE-016` — Creative Studio: creative-lane-check clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE creative-lane-check army (all 14 paused); never re-arm clones; CapEx/public HOLD.
- **Members:** 14 (0 en / 14 paused)
- **Canonical:** `creative-lane-check`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `creative-lane-check` | Creative lane check | `0 9 * * 1` | canonical | ARCHIVE |
| PA | `creative-lane-check-10` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-11` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-12` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-13` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-14` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-2` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-3` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-4` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-5` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-6` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-7` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-8` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `creative-lane-check-9` | Creative lane check | `0 9 * * 1` | clone | ARCHIVE |

### `CLONE-017` — Creative Studio: themes-lane-check clone army

- **Kind:** clone_army
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE themes-lane-check army (6 paused); never re-arm.
- **Members:** 6 (0 en / 6 paused)
- **Canonical:** `themes-lane-check`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `themes-lane-check` | THEMES lane check | `0 9 * * 1` | canonical | ARCHIVE |
| PA | `themes-lane-check-2` | THEMES lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `themes-lane-check-3` | THEMES lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `themes-lane-check-4` | THEMES lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `themes-lane-check-5` | THEMES lane check | `0 9 * * 1` | clone | ARCHIVE |
| PA | `themes-lane-check-6` | THEMES lane check | `0 9 * * 1` | clone | ARCHIVE |

### `SUPER-018` — Big Boss: morning brief / operator digest

- **Kind:** supersession
- **Recommendation:** **MERGE**
- **Rationale:** MERGE morning-brief + daily-operator-digest (both paused, same 07:00) into one operator digest design; keep paused until stagger policy clear; do not dual-arm.
- **Members:** 2 (0 en / 2 paused)
- **Canonical:** `daily-operator-digest`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `daily-operator-digest` | Daily operator digest | `0 7 * * *` | canonical | MERGE |
| PA | `morning-brief` | Morning brief | `0 7 * * *` | member | ARCHIVE |

### `KEEP-019` — Big Boss: box-ram-hygiene

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP enabled RAM hygiene (token/resource steward); unique control-plane duty.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `box-ram-hygiene`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `box-ram-hygiene` | Box RAM hygiene | `15 12,18 * * 1-5` | canonical | KEEP |

### `DUP-020` — Forge: dual weekly smoke

- **Kind:** duplicate_function
- **Recommendation:** **MERGE**
- **Rationale:** MERGE builder-smoke + engineering-smoke (both enabled Mon 09:00) into one engineering smoke to cut duplicate stream risk (token-meter).
- **Members:** 2 (2 en / 0 paused)
- **Canonical:** `engineering-smoke`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `engineering-smoke` | Engineering smoke | `0 9 * * 1` | canonical | MERGE |
| EN | `builder-smoke` | Builder smoke | `0 9 * * 1` | member | MERGE |

### `KEEP-021` — Forge: elevenlabs-release-watch

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP weekday ElevenLabs release watch; distinct from smoke.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `elevenlabs-release-watch`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `elevenlabs-release-watch` | ElevenLabs release watch | `15 9 * * 1-5` | canonical | KEEP |

### `KEEP-022` — Forge: pr-23-ci-babysit

- **Kind:** singleton
- **Recommendation:** **MODERNIZE**
- **Rationale:** MODERNIZE or retire when PR 23 lands; github-trigger babysitter is ticket-scoped not evergreen.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `pr-23-ci-babysit`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `pr-23-ci-babysit` | PR 23 CI babysit | `github` | canonical | MODERNIZE |

### `KEEP-023` — Consultant: harness-doorbell

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP weekday 9:15 harness doorbell; owned Consultant duty.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `harness-doorbell`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `harness-doorbell` | Harness doorbell | `15 9 * * 1-5` | canonical | KEEP |

### `KEEP-024` — Consultant: harness-event-doorbell

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP webhook event doorbell; complements cron doorbell.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `harness-event-doorbell`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `harness-event-doorbell` | Harness event doorbell | `webhook` | canonical | KEEP |

### `KEEP-025` — Consultant: ai-audit-partner-routine

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP Monday AI Audit Partner lane.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `ai-audit-partner-routine`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `ai-audit-partner-routine` | AI Audit Partner routine | `15 11 * * 1` | canonical | KEEP |

### `KEEP-026` — Consultant: consulting-ladder-prep

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP Monday consulting ladder prep.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `consulting-ladder-prep`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `consulting-ladder-prep` | Consulting ladder prep | `0 14 * * 1` | canonical | KEEP |

### `KEEP-027` — Day Planner: weekly-focus-propose

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP Monday weekly focus propose; distinct from day-card.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `weekly-focus-propose`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `weekly-focus-propose` | Weekly focus propose | `0 11 * * 1` | canonical | KEEP |

### `LIB-028` — Librarian: capture-cycle-verify

- **Kind:** singleton
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE paused capture-cycle-verify until memory pipeline SSOT refreshed.
- **Members:** 1 (0 en / 1 paused)
- **Canonical:** `capture-cycle-verify`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `capture-cycle-verify` | Capture cycle verify | `30 7 * * *` | canonical | ARCHIVE |

### `LIB-029` — Librarian: memory-consolidation

- **Kind:** singleton
- **Recommendation:** **MODERNIZE**
- **Rationale:** MODERNIZE memory-consolidation against Stage-5 harness/l5-replay SSOT before any re-enable.
- **Members:** 1 (0 en / 1 paused)
- **Canonical:** `memory-consolidation`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `memory-consolidation` | Memory consolidation | `30 7 * * *` | canonical | MODERNIZE |

### `LIB-030` — Librarian: obsidian-vault-mirror

- **Kind:** singleton
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE paused vault mirror; confirm path/credentials before any future single instance.
- **Members:** 1 (0 en / 1 paused)
- **Canonical:** `obsidian-vault-mirror`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `obsidian-vault-mirror` | Obsidian vault mirror | `28 8,12,17 * * 1-5` | canonical | ARCHIVE |

### `LIB-031` — Librarian: stale-fact-detector

- **Kind:** singleton
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE paused stale-fact-detector; reintroduce only with Librarian SSOT.
- **Members:** 1 (0 en / 1 paused)
- **Canonical:** `stale-fact-detector`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `stale-fact-detector` | Stale fact detector | `0 8 * * 1` | canonical | ARCHIVE |

### `KEEP-032` — Money Desk: daily-upgrade-money-loop

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP weekday upgrade money loop (observe/advise); distinct from CE snapshot.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `daily-upgrade-money-loop`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `daily-upgrade-money-loop` | Daily upgrade money loop | `17 8 * * 1-5` | canonical | KEEP |

### `KEEP-033` — Money Desk: stripe-cfo-weekly-scan

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP Monday Stripe CFO weekly scan; advise-only.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `stripe-cfo-weekly-scan`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `stripe-cfo-weekly-scan` | Stripe CFO weekly scan | `0 9 * * 1` | canonical | KEEP |

### `KEEP-034` — Product GTM: competitor-door-watch

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP Tuesday competitor door watch; live and non-clone.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `competitor-door-watch`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `competitor-door-watch` | Competitor door watch | `0 9 * * 2` | canonical | KEEP |

### `KEEP-035` — Product GTM: fleet-skill-gtm-observe

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP Wed fleet-skill GTM observe; skill-lane not clone army.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `fleet-skill-gtm-observe`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `fleet-skill-gtm-observe` | fleet-skill-gtm-observe | `0 13 * * 3` | canonical | KEEP |

### `KEEP-036` — Creative Studio: fleet-skill-creative-forge

- **Kind:** singleton
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE paused fleet-skill-creative-forge until creative lane policy clear; not a clone but stay off under CapEx/public HOLD.
- **Members:** 1 (0 en / 1 paused)
- **Canonical:** `fleet-skill-creative-forge`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `fleet-skill-creative-forge` | fleet-skill-creative-forge | `0 14 * * 2,4` | canonical | ARCHIVE |

### `RES-037` — Researcher: daily-youtube-watch-digest

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP daily YouTube watch digest.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `daily-youtube-watch-digest`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `daily-youtube-watch-digest` | Daily YouTube watch digest | `6 9 * * *` | canonical | KEEP |

### `RES-038` — Researcher: hive-smarter-loop-daily

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP weekday hive smarter loop.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `hive-smarter-loop-daily`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `hive-smarter-loop-daily` | Hive smarter loop daily | `43 8 * * 1-5` | canonical | KEEP |

### `RES-039` — Researcher: signals-daily-close

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP weekday signals daily close.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `signals-daily-close`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `signals-daily-close` | Signals daily close | `43 9 * * 1-5` | canonical | KEEP |

### `RES-040` — Researcher: weekly-ai-bookmark-theme-diff

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP Monday AI bookmark theme diff.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `weekly-ai-bookmark-theme-diff`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `weekly-ai-bookmark-theme-diff` | Weekly AI bookmark theme diff | `0 16 * * 1` | canonical | KEEP |

### `RES-041` — Researcher: x-bookmarks-shared-memory-ingest

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP weekday X bookmarks ingest.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `x-bookmarks-shared-memory-ingest`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `x-bookmarks-shared-memory-ingest` | X bookmarks shared-memory ingest | `15 10,13,16 * * 1-5` | canonical | KEEP |

### `RES-042` — Researcher: video-repass-queue-continue

- **Kind:** singleton
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE paused video-repass queue (high-frequency */30); do not re-arm without budget review.
- **Members:** 1 (0 en / 1 paused)
- **Canonical:** `video-repass-queue-continue`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `video-repass-queue-continue` | Video repass queue continue | `*/30 9-19 * * 1-5` | canonical | ARCHIVE |

### `KEEP-043` — Watchdog: bot-fleet-auditor

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP Monday bot fleet auditor.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `bot-fleet-auditor`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `bot-fleet-auditor` | Bot fleet auditor | `15 10 * * 1` | canonical | KEEP |

### `KEEP-044` — Watchdog: hive-smoke-check-4

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP hive-smoke-check-4 (sole survivor name; no *-N siblings on disk — not a clone army).
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `hive-smoke-check-4`
- **Notes:** Standing lock forbids re-arming clone armies; this id suffix alone with zero siblings is treated as the live singleton.

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `hive-smoke-check-4` | Hive smoke check | `15 8,14,20 * * 1-5` | canonical | KEEP |

### `ARCH-045` — Watchdog: hive-n8n-notify

- **Kind:** singleton
- **Recommendation:** **ARCHIVE**
- **Rationale:** ARCHIVE paused hive-n8n-notify webhook; legacy notify path (elou+notify LEGACY).
- **Members:** 1 (0 en / 1 paused)
- **Canonical:** `hive-n8n-notify`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| PA | `hive-n8n-notify` | Hive n8n notify | `webhook` | canonical | ARCHIVE |

### `KEEP-046` — Wealth Manager: biweekly-wealthsimple-coach

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP biweekly Wealthsimple coach; advise-only.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `biweekly-wealthsimple-coach`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `biweekly-wealthsimple-coach` | Biweekly Wealthsimple coach | `0 9 1,15 * 1-5` | canonical | KEEP |

### `KEEP-047` — Wealth Manager: daily-wealth-video

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP weekday daily wealth video.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `daily-wealth-video`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `daily-wealth-video` | Daily wealth video | `0 9 * * 1-5` | canonical | KEEP |

### `KEEP-048` — Wealth Manager: portfolio-review

- **Kind:** singleton
- **Recommendation:** **KEEP**
- **Rationale:** KEEP Friday portfolio/weekly wealth video review.
- **Members:** 1 (1 en / 0 paused)
- **Canonical:** `portfolio-review`

| State | ID | Name | Schedule | Role | Disposition |
|---|---|---|---|---|---|
| EN | `portfolio-review` | Weekly wealth video | `0 17 * * 5` | canonical | KEEP |

## Uncategorized leftovers

_None — all 229 routines assigned to a cluster._

## Policy reminders

1. **Never re-arm** any `*-N` clone (see `routines-do-not-rearm.md`).
2. ARCHIVE/DELETE recommendations are **inventory advice only** — this phase did not mutate disk.
3. Building mode + live `/` HOLD + Ironlane public HOLD still gate any future single-instance re-enable.

