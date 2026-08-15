# 01-launch-catalog (alias check)

ACT: launchApp https://evenslouis.ca/pro/work
EXPECTED: 308 to https://evenslouis.ca/work. Catalog cards. Not the /pro login desk. Not a second catalog at /pro/work.
OBSERVED: playbook only 2026-08-15. No headed this sitting. Live still serves /pro/work as a duplicate until Evens deploys CE.
COMPARE: pending-deploy
NEXT: after deploy, assert URL is /work then stop — catalog walk is evenslouis-ca.yaml
