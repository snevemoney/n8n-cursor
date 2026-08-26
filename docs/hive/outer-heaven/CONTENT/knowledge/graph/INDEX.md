# Graph / ontology (layer 3)

Relationships live in two places:

1. **On the atom:** `requires`, `before`, `conflicts_with`, `supports`, `domain`, `stage`, `objective`.
2. **Edge log:** [edges.jsonl](edges.jsonl) — one edge per line.

```json
{"from":"K-…","to":"K-…","rel":"conflicts_with","note":""}
```

`rel`: `conflicts_with` | `supports` | `requires` | `before` | `same-video` | `elaborates` | `condition-conflict` | `applies_when` | `depends_on` | `inputs` | `outputs`

## Rules

- NEVER merge two lessons just because they are semantically similar.
- Merge only when conditions, goals, and contexts are compatible.
- Store contradictions separately. Do not flatten.
- Speech≠behavior → [../mismatches/](../mismatches/INDEX.md), not a blended node.

**2609 edges this turn** from 849 atoms. Existing Fazio `applies_when` edges kept. `114` mismatches filed.

| rel | count |
|-----|------:|
| `applies_when` | 2 |
| `before` | 194 |
| `condition-conflict` | 114 |
| `conflicts_with` | 439 |
| `elaborates` | 1 |
| `requires` | 60 |
| `same-video` | 702 |
| `supports` | 1097 |
