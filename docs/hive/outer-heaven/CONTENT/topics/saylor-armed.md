# saylor-armed

**State (REPLACE)** 2026-09-02 01:40 ET
Two stops. Do not flatten.

| Stop | Meaning | When |
|---|---|---|
| **ARMED-TO-WORK** | You can sit down and work professionally today. Future courses fold without a rewire. | Setup score PASS |
| **CATALOG-COMPLETE** | Remaining enrolled = 0 (unproctored finals done). | `saylor-catalog-complete.md` SHIPPED |
| **MASTER-SURFACE** | A visitor can see one demonstrated build. The world infers mastery from the work. | Proof blank on hive-os card filled. Evens HITL publish |

Master is **inbound from a demonstrated build**, not a certificate claim and not “I do AI.” Building mode holds until operator lifts it.

## DONE-CHECK (ARMED-TO-WORK)

```
DONE-CHECK: setup score PASS (fold + mentor + two facts cards + brief bind)
CAP: 1–3 skills per sitting · no exam dump · no invented KPI
COST: local only (no billed harvest in this score)
STOP-KIND: metric
```

CLI: `python3 scripts/hive/os/saylor-setup-score.py`

You can be ARMED while remaining > 0. That is the point of fold.

## Sit down today (you are armed)

1. Score: `python3 scripts/hive/os/saylor-setup-score.py` — PASS means work professionally now. Remaining > 0 is expected.
2. Name LANE (`hive-os` | `agency`). One bite. **Every turn:** one teaching beat (`saylor-mentor-pass --live`), then work. End emit. Honest skip only if no hive/site/money.
3. Next course close: one fold. Do not rewire.

```
python3 scripts/hive/os/saylor-fold.py --course BUS612 --slug <kebab> --when "…" --never "… exam …" --plain "…" --lane hive-os
python3 scripts/hive/os/skills-sync.py --write
```

4. World-thinks-master: fill `Last verified proof` on `live-facts-hive-os.md` when a visitor can see one build. That is `inbound-from-demonstrated-build`. Publish HITL. Not a slogan. Not a certificate claim.

## What “fully setup” feels like
- Name a lane. Every turn the mentor teaches one school on the live work, then does the work. You do not have to ask.
- A new COURSE-SKILL close is one fold command, not a new architecture.
- One proof on evenslouis.ca is how the world decides you are a master. Fill that blank when it is true. Do not invent it.

## Events
- 2026-09-02 Operator: future courses must keep working; end-state = fully setup, world thinks master.
