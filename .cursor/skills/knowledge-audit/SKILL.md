---
name: knowledge-audit
description: >-
  Three auditor passes on a compiled hive workflow: coverage,
  context-misuse, and contradiction. Use after workflow-compiler,
  or when the operator says audit this workflow / knowledge audit.
  Fail any pass means do not ship. Cursor plus Grok only.
---

# Knowledge audit (Cursor)

Load `scripts/hive/grok-skills/knowledge-audit.md` and follow it.

**In:** a compiled file under `docs/hive/outer-heaven/CONTENT/knowledge/workflows/`.  
**Passes:** coverage → context-misuse → contradiction. All three required.  
**Fail:** status `audit-fail`. Do not blend to get a green pass. Do not delete dissent.
