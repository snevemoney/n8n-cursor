# ce-pro-work — click-live RUN

STATUS: fail (alias not live yet)
HOST: cursor-ide-browser
ALIAS_OF: evenslouis-ca
CANONICAL: https://evenslouis.ca/work
HARD_STEP: send — not executed.

2026-08-15 product rule: /work = real catalog. /pro/work = alias (308). /pro = CE login.
This sitting: playbook only. No new tab. No headed re-run.

Last headed pass (2026-08-15T20:55Z) walked the **duplicate** at /pro/work. That pass is stale.
After Evens deploys CE: launch /pro/work → must land on /work. Then use evenslouis-ca.yaml.

## Steps (alias only)
| n | id | action | COMPARE | NEXT | card |
|---|----|--------|---------|------|------|
| 1 | launch-alias | launchApp | pending-deploy | after deploy | cards/01-launch-catalog.md |
| 2 | assert-canonical | assertVisible | pending-deploy | evenslouis-ca.yaml | cards/02-assert-cards.md |

Steps 03–08 retired. Do not keep a third catalog walk.

## Watchdog GRADE
(other session — Forge does not fill)
