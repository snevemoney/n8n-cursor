---
name: golden-test-loop
description: >-
  Compare a fixture to last-known-good before calling a path green.
  Watchdog owns this machine. Do not live-POST webhooks.
---

# Golden test loop

**Owner:** Watchdog. **SSOT name:** `hive-golden-path-smoke` (JSON path). Not `hive-smoke-notify`.

## When
After a deploy/change, or when docs and fixture disagree. Pick one recurring check and run it until known-good.

## Steps
1. Load `CONTENT/job-cards/takes/watchdog.md` then this skill.
2. Parse the on-disk fixture: `workflows/hive/golden-path-smoke-notify.json`.
3. Compare path / responseMode / register URL / code nodes to the one-pager. Docs follow JSON.
4. Run a local check (`should-run`, `product-state --validate`, or `json.loads` on the fixture). Do not POST the live webhook.
5. Report pass/fail vs last-known-good. Preview host ≠ custom domain.
6. **Separate-verifier** (Watchdog fills GRADE — Forge must not):

```
BUILDER: Forge
VERIFIER: Watchdog
HYPOTHESIS: fixture matches last-known-good
LABELED: workflows/hive/golden-path-smoke-notify.json
MISS: <row or none>
GRADE: pass | fail
```

7. **Side-effect-not-essay:** CLAIM + SIDE-EFFECT + DIFF. Chat-refine / OAuth connected is not a ship.

## Stop
Live webhook POST, prod deploy, custom-domain attach, Stripe live = operator.

## Never
- POST `/webhook/hive-golden-path-smoke` or `/webhook/hive-smoke-notify` from this desk
- Call a ship done from a dashboard reload or `*.vercel.app` 200
- Invent a second golden-path name

**Merged 2026-08-14:** `eecUhBpTz_g` hold-outs written before the bite; builder must not see the exam. `U6k4MeVks_Y` objective done-when. Claude/Codex operate-never.
