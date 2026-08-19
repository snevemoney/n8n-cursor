---
name: separate-verifier
description: >-
  Maker-checker. A read-only second desk grades against last-known-good.
  The builder does not pass its own pane. Use when a path ships, a loop
  claims green, or Forge / Watchdog share a golden path. Cursor plus Grok Bot.
---

# Separate verifier

**Stack:** Cursor + Grok Bot. The lead does not grade the lead.

**Upgrade:** `UPG-nate82-separate-verifier`  
**Sources:** `e18sdZLwP7o` · `EuzYhzB0vbI` · `vDVSGVpB2vc` · `8IUWeF3B-hk` · `lcNN3X9gXls` (timestamps UNKNOWN, caption-only) · **merged `eecUhBpTz_g`** Cole hold-out scenarios the builder must not see · **merged `U6k4MeVks_Y`** other-model grade (Codex on-tape; hive = Watchdog)  
**Cursor copy:** `.cursor/skills/separate-verifier/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/separate-verifier/SKILL.md`

**Contradiction (keep labeled):** Five personas + self-score 8/10 is not a fixture. “One-shot” landing page was a QA bounce. Do not flatten eval-tab with arena scores. Do not enable Claude teams.
**`eecUhBpTz_g`:** “human out of the loop” ⊥ escalate-sometimes + hold-outs. Steal the **separation**, not auto-deploy. Claude Code / Codex / dark-factory merge-to-users = operate-never.

## When

Any ship path, golden-path smoke, or loop that claims green. Default verifier = Watchdog. Wired job = Watchdog grades Forge on `golden-test-loop` / `click-live-site`.

## Card (required — verifier fills GRADE)

```
BUILDER: <desk that made it>
VERIFIER: Watchdog (default) — no Send / Pay
HYPOTHESIS: <what should be true>
LABELED: <fixture or last-known-good>
MISS: <per-row or none>
GRADE: pass | fail
```

Builder may fill BUILDER / HYPOTHESIS. Builder must not fill GRADE.

## Steps

1. Name the verifier desk before the ship. Default Watchdog. No Send/Pay tools on the grader.
2. Eval = hypothesis + labeled set + per-row misses. Average green is not a sitting.
3. Subjective “until satisfied” → dedicated scorer **or** `checkable-stop` hard cap. Not a self-8/10.
4. GRADE=pass is not a hard-step close. Send / pay / deploy / book / publish stay Evens.

## Watchdog-grades-Forge (the wired instance)

On `golden-test-loop` and after `click-live-site`:

```
BUILDER: Forge
VERIFIER: Watchdog
HYPOTHESIS: fixture matches last-known-good / CTA path is not a silent no-op
LABELED: workflows/hive/golden-path-smoke-notify.json or the shipped URL card
MISS: <row or none>
GRADE: <Watchdog only>
```

If Forge writes GRADE, the path fails.

## Stop

Send / pay / deploy / book / publish = operator. Verifier is read-only.

## Never

Builder grades builder · self-score 8/10 as a fixture · Claude teams · live webhook POST · flatten eval-tab with arena · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
