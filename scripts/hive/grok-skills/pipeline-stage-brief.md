---
name: pipeline-stage-brief
description: Summarize ICP hunt pipeline stages from HUNT_LOG and OPERATOR_FOCUS for Big Boss or Lead Hunter.
---

# Pipeline stage brief

**When:** Morning brief, EOD Lead Hunter, or operator asks "where is the hunt pipeline?"

## Commands

```bash
python3 scripts/hive/hunt-log-stats.py
python3 scripts/hive/os/outer-heaven-brief.py --agent "Lead Hunter" --hunt-stats
cat docs/hive/outer-heaven/CONTENT/OPERATOR_FOCUS.json
```

## Stage meanings

See `docs/hive/outer-heaven/CONTENT/icp-runbooks/ICP_PIPELINE.md`:

- `discovered` → MUST stub (Consultant)
- `qualified` → MUST PASS/HOLD + margin + four-blank
- `ready` → warm draft in HITL queue
- `delivering` → send approved / install in progress
- `parked` → HOLD or disqualify

## Report format

1. OPERATOR_FOCUS icp_id + city
2. Row counts by stage
3. Last 3 rows (url, stage, next)
4. One recommended action for operator's 20hr week

## Never

Rotate ICP without operator changing OPERATOR_FOCUS · invent icp_id · skip HUNT_LOG append.
