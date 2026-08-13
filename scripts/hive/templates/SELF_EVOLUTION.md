# Self-evolution (Secrets 14–16) — hive-bound

**Lights-dimmed:** full auto on **staging**. **Prod + money = Tier 3 HITL** (never auto-merge `main`).

## Loop

SENSE (n8n + register) → HYPOTHESIZE (AI Brain) → EXECUTE (Forge PR `agent/*`) → VALIDATE (GitHub Actions) → STAGING auto-merge → operator promotes prod.

## Secret 14

PR `agent/*` → staging. CI green = auto-merge. Fail = `hive-error-heal-notify`.

## Secret 15

Hourly read-only revenue/usage sensor → hypothesis register. No auto Stripe writes.

## Secret 16

Error webhook → self-heal branch → test → staging. Prod after operator + golden paths.

Full doc: hub `docs/hive/SELF_EVOLUTION.md` · Protocol: `SELF_EVOLUTION_PROTOCOL.md`
