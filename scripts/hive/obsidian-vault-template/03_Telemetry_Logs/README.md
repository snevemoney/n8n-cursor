---
date: 2026-08-08
type: telemetry_log
---

# Telemetry sample

Daily append target for n8n / CI scripts via `append-telemetry-log.sh`.

```dataview
TABLE file.ctime AS logged
FROM "03_Telemetry_Logs"
SORT file.name DESC
LIMIT 7
```
