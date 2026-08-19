---
name: pipeline-stage-brief
description: Summarize ICP hunt pipeline stages from HUNT_LOG and OPERATOR_FOCUS for Big Boss or Lead Hunter.
---

# Pipeline stage brief (Cursor)

Read `scripts/hive/grok-skills/pipeline-stage-brief.md` and run:

```bash
python3 scripts/hive/hunt-log-stats.py
python3 scripts/hive/os/outer-heaven-brief.py --agent "Big Boss" --hunt-stats
```

Report stage counts and next action for tagged `OPERATOR_FOCUS.icp_id`.
