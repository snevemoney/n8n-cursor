---
name: side-effect-not-essay
description: >-
  Chat-refine can leave the system prompt unchanged. OAuth connected ≠
  tool called. Ship check = external side effect + prompt diff.
  Use on Watchdog smoke and any wrapper that says it learned.
  Cursor plus Grok Bot.
---

# Side effect, not essay

**Stack:** Cursor + Grok Bot. The chat summary of the prompt can lie.

**Upgrade:** `UPG-nate82-side-effect-not-essay`  
**Sources:** `27Y44JYXZJ8` (timestamps UNKNOWN, caption-only)  
**Cursor copy:** `.cursor/skills/side-effect-not-essay/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/side-effect-not-essay/SKILL.md`

**Contradiction (keep labeled):** Chat-refine can lie vs guided-edit writes the prompt. Do not trust the chat summary of the prompt.

## When

A wrapper / “it learned” / “I updated the prompt” UI. Watchdog smoke. After Forge says a path is wired.

## Card (required on smoke)

```
CLAIM: <what the UI or chat said>
SIDE-EFFECT: <external artifact / none>
DIFF: <v1 vs v2 text or none>
```

No SIDE-EFFECT and no DIFF → fail. Essay is not a ship.

## Steps

1. Name the claim (connected, learned, updated, sent).
2. Open the external artifact: file, URL, fixture, inbox draft, `state.json` last_run. If URL → `click-live-site` + `verify-after-browser`.
3. Diff v1/v2 of the actual prompt or config text. Chat said “updated” without a diff = miss.
4. OAuth connected ≠ tool called. Check the call / the row.
5. Pair with `separate-verifier` — Watchdog fills this card, not Forge.

## Watchdog smoke (the wired instance)

Add the card to `golden-test-loop` / `click-live-site` report:

```
CLAIM: path green / prompt updated / OAuth connected
SIDE-EFFECT: fixture parse / URL OBSERVED / last_run row
DIFF: <or none>
```

## Stop

Send / pay / deploy / book / publish = operator.

## Never

Trust chat-refine · OAuth as proof of a call · looks-good essay · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
