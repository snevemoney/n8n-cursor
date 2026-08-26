# Primitives

The engineering / business principle **underneath** the demo. Not the YouTuber’s SKU name.

**Schema:** [schema.json](schema.json)

Demo: “AI agent auto-replies to customer emails” → obvious `customer-support-email-agent` → underneath `EVENT-DRIVEN AGENT LOOP`:

```
incoming event → retrieve context → classify → determine allowed action
  → execute → verify → update state → wait
```

`other_applications` are notes. Do not auto-wire email→comms, GitHub→Forge, etc.

Later, a primitive may support a layer-4 pattern. It does not delete atoms. Status UNTESTED.

**1 primitive this turn (UNTESTED).**

| id | file |
|----|------|
| `SPECIFIC-ARTIFACT-TO-INBOUND` | [specific-artifact-inbound.json](specific-artifact-inbound.json) |

### YT WL AI 2026-08-14 (UNTESTED)

| id | file |
|----|------|
| `CONTINUOUS-PLATE-THEN-SCRUB` | [continuous-plate-scrub.json](continuous-plate-scrub.json) |
| `SCRIPT-BEAT-THEN-GRAPHIC` | [script-beat-graphic.json](script-beat-graphic.json) |
| `DEMO-VS-MESS-GAP` | [demo-vs-mess.json](demo-vs-mess.json) |
| `BUILDER-MUST-NOT-SEE-EXAM` | [builder-must-not-see-exam.json](builder-must-not-see-exam.json) |
| `OFFLINE-PLATE-VS-INTERACTIVE-WORLD` | [offline-vs-interactive.json](offline-vs-interactive.json) |
| `SPECIALIST-HANDOFF-THEN-DRAFT` | [specialist-handoff.json](specialist-handoff.json) |
