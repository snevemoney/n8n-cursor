---
name: token-receipt
description: >-
  A billed run writes tokens + duration + correctness. Tape $ stays
  UNVERIFIED. Use on coverage-loop, money-desk PASS/HOLD, or any
  metered agent run. Cursor plus Grok Bot.
---

# Token receipt

**Stack:** Cursor + Grok Bot. Tokens + duration + correctness. Not a YouTube dashboard.

**Upgrade:** `UPG-nate82-token-receipt`  
**Sources:** CLUSTER-money (`SU-token-receipt`) · loop cost field on `EuzYhzB0vbI` (timestamps UNKNOWN, caption-only)  
**Cursor copy:** `.cursor/skills/token-receipt/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/token-receipt/SKILL.md`  
**CLI:** `python3 scripts/hive/hive-state.py receipt --tokens unknown --duration "<m>" --correctness untested|pass|fail`

**Contradiction (keep labeled):** Tape $ / prize / $50/h stay UNVERIFIED. Do not fill `unit-econ-card` from reel $.

## When

Coverage-loop COST field. Money-desk on a billed run. Any metered loop after `checkable-stop`.

## Card (required on a billed run)

```
TOKENS: <n or unknown>
DURATION: <minutes or this session>
CORRECTNESS: pass | fail | untested
```

COST without this card is a vibe.

## Steps

1. Write the card when the run ends. Unknown tokens is honest; invented $ is not.
2. Persist onto `state.json` last_run via the CLI.
3. Money-desk may PASS/HOLD on the receipt. Personal CFO flags seats. Neither moves money.
4. Correctness is a labeled check (`separate-verifier` / fixture), not “looks good.”
5. Tape $ stays UNVERIFIED. Do not price a SKU from this card.

## Coverage-loop job (the wired instance)

After the iteration, next to `checkable-stop` COST:

```
python3 scripts/hive/hive-state.py receipt --tokens unknown --duration "this session" --correctness untested
```

`--correctness pass` only after Watchdog grades.

## Stop

Pay / refund / fee = operator. This skill never moves money.

## Never

Quote tape $ as FACT · fill unit-econ from a reel · skip correctness · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
