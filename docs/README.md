# Ops Runbook (Safe Mode)

> All commands are **DRY-RUN** by default. To actually apply changes: prefix with `DRY_RUN=0`.

## Quick
```bash
make status      # see containers
DRY_RUN=0 make up
DRY_RUN=0 make down
```

## Health & Recovery
```bash
make doctor
DRY_RUN=0 make repair
make repair-remote
```

## Workflows
```bash
make wf-validate
make wf-dedupe
```

## Create Things
```bash
make new-script NAME="rotate-logs" DESC="Rotate & compress"
make new-workflow NAME="Customer Sync"
```

## Master unlock (emergency)
```bash
export MASTER_UNLOCK=<your value>   # stored only in .env, never committed
```

## Docs
See `docs/README.en.md`, `docs/README.fr.md`, `docs/MIGRATION.md`.
