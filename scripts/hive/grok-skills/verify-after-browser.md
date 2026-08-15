---
name: verify-after-browser
description: >-
  After a browser or UI act, observe the resulting state and compare
  expected. Do not assume the click landed. Use when a desk clicks,
  types, or navigates, or after click-live-site. Caption-only tapes
  do not invent click traces. Cursor plus Grok Bot.
---

# Verify after browser

**Stack:** Cursor + Grok Bot. After a UI act, success is observed, not assumed.

**Browser path (where the desk is running):**

```
IF Cursor (this IDE, Task agents, click-live-site from Cursor)
→ Cursor IDE browser (`cursor-ide-browser`: navigate, snapshot, click, take_screenshot; lock/unlock).
  Not Chrome. Not Playwright. Not browser-use.

IF Grok Bot
→ Grok Bot’s own web browser (Grok Bot path). Do not call Cursor MCP. Do not rip this path out.
```

Same card either way. `OBSERVED` from that host’s snapshot/screenshot/page. Playwright = Scorpion/app e2e only, not hive tape/click.

**Upgrade:** `UPG-nate82-verify-after-browser`  
**Sources:** `CB5bG4mvnS0` · `EuzYhzB0vbI` (timestamps UNKNOWN, caption-only)  
**Cursor copy:** `.cursor/skills/verify-after-browser/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/verify-after-browser/SKILL.md`

**Contradiction (keep labeled):** He used browser despite an X API. Abbey Road verify-loop hit the cap and still failed likeness. 85 / 100 scenario counts UNVERIFIED. Planted form bugs ≠ agent-found. Do not flatten.

## When

A desk **does** use the browser or a UI: click, type, navigate, submit-that-is-not-a-hard-step. Wired job = `click-live-site` (Forge + Watchdog after a surface flow — any owned UI, not only a page ship).

Caption-only tape: **do not invent click traces.** Skip this card if you did not act in a browser this session.

## Card (required after each act)

```
ACT: <click | type | navigate — what and where>
EXPECTED: <observable state after>
OBSERVED: <url + what the page/UI actually shows>
COMPARE: match | miss
NEXT: proceed | retry | escalate
```

Write the card on the job. A click without OBSERVED is a fail. “Looks good” is not OBSERVED.

## Steps

1. Name the act and the expected state **before** or immediately after the click. If you cannot name EXPECTED, do not click.
2. Act once on the host path (Cursor → `cursor-ide-browser`; Grok Bot → Grok Bot web browser). Then observe: URL, visible copy, form state, error, or missing change.
3. Compare. Match → proceed. Miss → retry or escalate. Do not assume the tool call worked.
4. Retry cap = 2, then escalate to Evens. Do not raise the cap. A retry loop also needs `checkable-stop`.
5. COMPARE=match is not a hard-step close. Send / pay / deploy / book / publish stay Evens.
6. Verify ≠ success. Cap hit with miss → halt and report (Abbey Road).

## Click-live-site job (the wired instance)

After Forge/Watchdog run a `click-live-site` flow (owned URL — prod / staging / preview / localhost-if-ship) and act one step:

```
ACT: clicked primary CTA on shipped URL
EXPECTED: next section / form / named error — not a silent no-op
OBSERVED: <url + visible state>
COMPARE: match | miss
NEXT: proceed | retry (cap 2) | escalate
```

No headed drive of a surface that can send / pay / publish. Those stay HITL.

## Spawn / job-cards

`hive-spawn-desks` / `tape-self-teach` prompts carry a **conditional** card: only if the desk clicks this session. Caption-only walks skip it. Do not invent clicks to fill the card.

Forge · Watchdog · HITL load this skill when they open a UI. Not a 17-desk rewrite.

## Related

- `api-macro-vision` — write LADDER before headed vision.
- `separate-verifier` — Watchdog grades; Forge does not fill GRADE.
- `golden-test-loop` — fixture vs last-known-good (not a click).

## Stop

Send / pay / deploy / book / publish = operator. This skill never closes a hard step. Headed watch is only for surfaces that cannot fire those verbs.

## X-bookmark merge (2026-08-14)

Same primitive, do not clone: @ClaudeDevs in-app browser (`x:2075635283211772279`) · @AdamKPx “vibe test” (`x:2074046218741678570`) · @tryrevyl live-device drive (`x:2072001793492763022`, iOS shop skip — **habit only**: drive the real surface). After a ship, open and click. Do not buy a vibe-test SaaS.

## Never

Assume the click landed · looks-good without OBSERVED · invent click traces from captions · Playwright / Chrome / puppeteer / browser-use for hive click-verify · tell a Grok Bot desk to call Cursor MCP · rip out the Grok Bot browser path · headed send/pay/publish/book/deploy · password CSV · Codex / computer-use plugin · quote 85/100 as FACT · treat planted bugs as agent-found · treat verify as success · flatten API-first vs his X-browser exception · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
