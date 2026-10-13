# Do-not-rearm — clone / paused patterns (HARD)

**Census:** 2026-09-16 17:45 EDT
**Rule:** Standing lock — do **not** re-arm clone armies. No exceptions for `*-10` etc.
**Phase 2:** advice only; no routines were enabled/disabled/deleted.

## Hard patterns (stay OFF)

| Agent | Base ID | Suffixes | Clone count |
|---|---|---|---:|
| HITL Operator | `morning-hitl-digest` | `morning-hitl-digest-{2..25}` | 24 |
| Day Planner | `morning-day-plan` | `morning-day-plan-{2..15}` | 14 |
| Researcher | `weekly-intel-dossier` | `weekly-intel-dossier-{2..15}` | 14 |
| Career Strategist | `career-development-check` | `career-development-check-{2..14}` | 13 |
| Communications Manager | `inbox-triage` | `inbox-triage-{2..14}` | 13 |
| Creative Studio | `creative-lane-check` | `creative-lane-check-{2..14}` | 13 |
| Lead Hunter | `lead-pipeline-check` | `lead-pipeline-check-{2..14}` | 13 |
| Personal CFO | `personal-finance-check` | `personal-finance-check-{2..14}` | 13 |
| Product GTM | `gtm-phase-rotation` | `gtm-phase-rotation-{2..14}` | 13 |
| Publishing Engine | `publishing-pipeline-check` | `publishing-pipeline-check-{2..14}` | 13 |
| Money Desk | `business-finance-snapshot` | `business-finance-snapshot-{2..12}` | 11 |
| Watchdog | `control-plane-heartbeat` | `control-plane-heartbeat-{2..12}` | 11 |
| Creative Studio | `themes-lane-check` | `themes-lane-check-{2..6}` | 5 |
| Lead Hunter | `lead-surface-read` | `lead-surface-read-{2..4}` | 3 |
| Lead Hunter | `warm-outreach-rep` | `warm-outreach-rep-2` | 1 |
| Product GTM | `proofcheck-gtm-routine` | `proofcheck-gtm-routine-2` | 1 |
| Researcher | `web-intelligence-hunter-routine` | `web-intelligence-hunter-routine-2` | 1 |

**Total numbered clone IDs that must stay off:** 176

## Paused bases / supersession leftovers (stay OFF — never bring back *with* clones)

| Agent | ID | Note |
|---|---|---|
| Day Planner | `morning-day-plan` | superseded by weekday-ceo-day-card |
| Money Desk | `business-finance-snapshot` | superseded by ce-read-snapshot |
| Product GTM | `gtm-phase-rotation` | entire army paused; building-mode |
| Product GTM | `proofcheck-gtm-routine` | merge into single ProofCheck design later |
| Product GTM | `product-gtm-proofcheck-weekly` | paused MERGE canonical — stay off for now |
| Lead Hunter | `lead-pipeline-check` | army paused |
| Lead Hunter | `lead-surface-read` | army paused |
| Lead Hunter | `warm-outreach-rep` | army paused |
| Creative Studio | `creative-lane-check` | army paused |
| Creative Studio | `themes-lane-check` | army paused |

## Explicit never-rearm ID list (numbered clones only)

- `Career Strategist` / `career-development-check-10`
- `Career Strategist` / `career-development-check-11`
- `Career Strategist` / `career-development-check-12`
- `Career Strategist` / `career-development-check-13`
- `Career Strategist` / `career-development-check-14`
- `Career Strategist` / `career-development-check-2`
- `Career Strategist` / `career-development-check-3`
- `Career Strategist` / `career-development-check-4`
- `Career Strategist` / `career-development-check-5`
- `Career Strategist` / `career-development-check-6`
- `Career Strategist` / `career-development-check-7`
- `Career Strategist` / `career-development-check-8`
- `Career Strategist` / `career-development-check-9`
- `Communications Manager` / `inbox-triage-10`
- `Communications Manager` / `inbox-triage-11`
- `Communications Manager` / `inbox-triage-12`
- `Communications Manager` / `inbox-triage-13`
- `Communications Manager` / `inbox-triage-14`
- `Communications Manager` / `inbox-triage-2`
- `Communications Manager` / `inbox-triage-3`
- `Communications Manager` / `inbox-triage-4`
- `Communications Manager` / `inbox-triage-5`
- `Communications Manager` / `inbox-triage-6`
- `Communications Manager` / `inbox-triage-7`
- `Communications Manager` / `inbox-triage-8`
- `Communications Manager` / `inbox-triage-9`
- `Creative Studio` / `creative-lane-check-10`
- `Creative Studio` / `creative-lane-check-11`
- `Creative Studio` / `creative-lane-check-12`
- `Creative Studio` / `creative-lane-check-13`
- `Creative Studio` / `creative-lane-check-14`
- `Creative Studio` / `creative-lane-check-2`
- `Creative Studio` / `creative-lane-check-3`
- `Creative Studio` / `creative-lane-check-4`
- `Creative Studio` / `creative-lane-check-5`
- `Creative Studio` / `creative-lane-check-6`
- `Creative Studio` / `creative-lane-check-7`
- `Creative Studio` / `creative-lane-check-8`
- `Creative Studio` / `creative-lane-check-9`
- `Creative Studio` / `themes-lane-check-2`
- `Creative Studio` / `themes-lane-check-3`
- `Creative Studio` / `themes-lane-check-4`
- `Creative Studio` / `themes-lane-check-5`
- `Creative Studio` / `themes-lane-check-6`
- `Day Planner` / `morning-day-plan-10`
- `Day Planner` / `morning-day-plan-11`
- `Day Planner` / `morning-day-plan-12`
- `Day Planner` / `morning-day-plan-13`
- `Day Planner` / `morning-day-plan-14`
- `Day Planner` / `morning-day-plan-15`
- `Day Planner` / `morning-day-plan-2`
- `Day Planner` / `morning-day-plan-3`
- `Day Planner` / `morning-day-plan-4`
- `Day Planner` / `morning-day-plan-5`
- `Day Planner` / `morning-day-plan-6`
- `Day Planner` / `morning-day-plan-7`
- `Day Planner` / `morning-day-plan-8`
- `Day Planner` / `morning-day-plan-9`
- `HITL Operator` / `morning-hitl-digest-10`
- `HITL Operator` / `morning-hitl-digest-11`
- `HITL Operator` / `morning-hitl-digest-12`
- `HITL Operator` / `morning-hitl-digest-13`
- `HITL Operator` / `morning-hitl-digest-14`
- `HITL Operator` / `morning-hitl-digest-15`
- `HITL Operator` / `morning-hitl-digest-16`
- `HITL Operator` / `morning-hitl-digest-17`
- `HITL Operator` / `morning-hitl-digest-18`
- `HITL Operator` / `morning-hitl-digest-19`
- `HITL Operator` / `morning-hitl-digest-2`
- `HITL Operator` / `morning-hitl-digest-20`
- `HITL Operator` / `morning-hitl-digest-21`
- `HITL Operator` / `morning-hitl-digest-22`
- `HITL Operator` / `morning-hitl-digest-23`
- `HITL Operator` / `morning-hitl-digest-24`
- `HITL Operator` / `morning-hitl-digest-25`
- `HITL Operator` / `morning-hitl-digest-3`
- `HITL Operator` / `morning-hitl-digest-4`
- `HITL Operator` / `morning-hitl-digest-5`
- `HITL Operator` / `morning-hitl-digest-6`
- `HITL Operator` / `morning-hitl-digest-7`
- `HITL Operator` / `morning-hitl-digest-8`
- `HITL Operator` / `morning-hitl-digest-9`
- `Lead Hunter` / `lead-pipeline-check-10`
- `Lead Hunter` / `lead-pipeline-check-11`
- `Lead Hunter` / `lead-pipeline-check-12`
- `Lead Hunter` / `lead-pipeline-check-13`
- `Lead Hunter` / `lead-pipeline-check-14`
- `Lead Hunter` / `lead-pipeline-check-2`
- `Lead Hunter` / `lead-pipeline-check-3`
- `Lead Hunter` / `lead-pipeline-check-4`
- `Lead Hunter` / `lead-pipeline-check-5`
- `Lead Hunter` / `lead-pipeline-check-6`
- `Lead Hunter` / `lead-pipeline-check-7`
- `Lead Hunter` / `lead-pipeline-check-8`
- `Lead Hunter` / `lead-pipeline-check-9`
- `Lead Hunter` / `lead-surface-read-2`
- `Lead Hunter` / `lead-surface-read-3`
- `Lead Hunter` / `lead-surface-read-4`
- `Lead Hunter` / `warm-outreach-rep-2`
- `Money Desk` / `business-finance-snapshot-10`
- `Money Desk` / `business-finance-snapshot-11`
- `Money Desk` / `business-finance-snapshot-12`
- `Money Desk` / `business-finance-snapshot-2`
- `Money Desk` / `business-finance-snapshot-3`
- `Money Desk` / `business-finance-snapshot-4`
- `Money Desk` / `business-finance-snapshot-5`
- `Money Desk` / `business-finance-snapshot-6`
- `Money Desk` / `business-finance-snapshot-7`
- `Money Desk` / `business-finance-snapshot-8`
- `Money Desk` / `business-finance-snapshot-9`
- `Personal CFO` / `personal-finance-check-10`
- `Personal CFO` / `personal-finance-check-11`
- `Personal CFO` / `personal-finance-check-12`
- `Personal CFO` / `personal-finance-check-13`
- `Personal CFO` / `personal-finance-check-14`
- `Personal CFO` / `personal-finance-check-2`
- `Personal CFO` / `personal-finance-check-3`
- `Personal CFO` / `personal-finance-check-4`
- `Personal CFO` / `personal-finance-check-5`
- `Personal CFO` / `personal-finance-check-6`
- `Personal CFO` / `personal-finance-check-7`
- `Personal CFO` / `personal-finance-check-8`
- `Personal CFO` / `personal-finance-check-9`
- `Product GTM` / `gtm-phase-rotation-10`
- `Product GTM` / `gtm-phase-rotation-11`
- `Product GTM` / `gtm-phase-rotation-12`
- `Product GTM` / `gtm-phase-rotation-13`
- `Product GTM` / `gtm-phase-rotation-14`
- `Product GTM` / `gtm-phase-rotation-2`
- `Product GTM` / `gtm-phase-rotation-3`
- `Product GTM` / `gtm-phase-rotation-4`
- `Product GTM` / `gtm-phase-rotation-5`
- `Product GTM` / `gtm-phase-rotation-6`
- `Product GTM` / `gtm-phase-rotation-7`
- `Product GTM` / `gtm-phase-rotation-8`
- `Product GTM` / `gtm-phase-rotation-9`
- `Product GTM` / `proofcheck-gtm-routine-2`
- `Publishing Engine` / `publishing-pipeline-check-10`
- `Publishing Engine` / `publishing-pipeline-check-11`
- `Publishing Engine` / `publishing-pipeline-check-12`
- `Publishing Engine` / `publishing-pipeline-check-13`
- `Publishing Engine` / `publishing-pipeline-check-14`
- `Publishing Engine` / `publishing-pipeline-check-2`
- `Publishing Engine` / `publishing-pipeline-check-3`
- `Publishing Engine` / `publishing-pipeline-check-4`
- `Publishing Engine` / `publishing-pipeline-check-5`
- `Publishing Engine` / `publishing-pipeline-check-6`
- `Publishing Engine` / `publishing-pipeline-check-7`
- `Publishing Engine` / `publishing-pipeline-check-8`
- `Publishing Engine` / `publishing-pipeline-check-9`
- `Researcher` / `web-intelligence-hunter-routine-2`
- `Researcher` / `weekly-intel-dossier-10`
- `Researcher` / `weekly-intel-dossier-11`
- `Researcher` / `weekly-intel-dossier-12`
- `Researcher` / `weekly-intel-dossier-13`
- `Researcher` / `weekly-intel-dossier-14`
- `Researcher` / `weekly-intel-dossier-15`
- `Researcher` / `weekly-intel-dossier-2`
- `Researcher` / `weekly-intel-dossier-3`
- `Researcher` / `weekly-intel-dossier-4`
- `Researcher` / `weekly-intel-dossier-5`
- `Researcher` / `weekly-intel-dossier-6`
- `Researcher` / `weekly-intel-dossier-7`
- `Researcher` / `weekly-intel-dossier-8`
- `Researcher` / `weekly-intel-dossier-9`
- `Watchdog` / `control-plane-heartbeat-10`
- `Watchdog` / `control-plane-heartbeat-11`
- `Watchdog` / `control-plane-heartbeat-12`
- `Watchdog` / `control-plane-heartbeat-2`
- `Watchdog` / `control-plane-heartbeat-3`
- `Watchdog` / `control-plane-heartbeat-4`
- `Watchdog` / `control-plane-heartbeat-5`
- `Watchdog` / `control-plane-heartbeat-6`
- `Watchdog` / `control-plane-heartbeat-7`
- `Watchdog` / `control-plane-heartbeat-8`
- `Watchdog` / `control-plane-heartbeat-9`

## Related paused non-clone stay-offs

- **Lead Hunter:** all routines paused — building-mode drafts HITL only
- **Creative Studio:** all routines paused — CapEx/public HOLD
- **Librarian:** all routines paused — refresh SSOT before any single enable
- **Watchdog:** hive-n8n-notify — legacy webhook
- **Researcher:** video-repass-queue-continue — high-frequency cost risk
- **Big Boss:** morning-brief + daily-operator-digest — merge before any enable

## Exception note

- `Watchdog/hive-smoke-check-4` is **KEEP** (enabled singleton; **no** numbered siblings on disk — not a clone army). Do **not** spawn `hive-smoke-check-5`…

