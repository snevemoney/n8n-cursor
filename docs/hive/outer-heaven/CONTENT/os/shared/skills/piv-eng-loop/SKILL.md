---
name: PIV eng loop
description: >-
  Use on Forge / Cursor Cloud builds — Plan, Implement, Verify gates above agents.
  Triggers: PIV, AI-native SDLC, CLAUDE.md/agents.md, Expo/mobile tutorial remap.
  Anti-triggers: dark-factory spec-in-ship-out, Claude Code required, skip verify.
---

# PIV eng loop

Sources: Cole Medin PIV; youtube-ai-implement.

## When
Non-trivial Forge / Cursor cloud build.

## Do
1. Plan with done-when and bounds.
2. Implement on a branch / cloud agent.
3. Verify with golden checks (golden-test-loop + verify-then-done).
4. Prefer harness/discipline over spawning more agents.

## Don't
- Full Archon clone
- Skip verify
- Quote Cole demo rates as FACT

## Tools
| Need | Path |
|---|---|
| Cursor cloud | CloudAgent — **PROVE** |
| Claude Code | **BLOCKED** — Cursor **WORKAROUND** |

## Prompts
**PIV loop**
```
Plan → Implement → Verify
One slice. Success check. No second desktop.
```

## Batch-4 extract — Cole AI-native workshop + Expo mobile course (2026-09-01)

Tapes: Cole Medin `yt:Tliio-33w4g` (AI Native Engineering Org, FULL); Expo/Clerk mobile `yt:p80OV6kjIO8`. Claude Code / Claude.md demos → **Cursor Cloud + thin Cursor rules**.

### Cole PIV FACT (`yt:Tliio-33w4g`)

- Goal: agent writes the code; **humans plan and validate**. Not vibe-coding; not a dark factory.
- **Do not start** at spec-in → shipped-code-out with no human in the middle. HITL at each gate until the harness is proven.
- Thin always-on rules file (tape `claude.md`): short, loaded every session. Detail lives in skills loaded on demand — pair [cursor-rules-fleet](sand-workflow:cursor-rules-fleet). Context rot = fail.
- Guardrails first. Productivity mirage = fast code then slower review of AI mistakes.
- Tickets in GitHub Issues ([issue-spine-github](sand-workflow:issue-spine-github)). Linear/Jira MCP not connected — do not add from a sponsor read.
- Superpowers / Archon / enterprise SDLC product = **do not clone**. Steal the gates.

### Expo/mobile course remap (`yt:p80OV6kjIO8`)

FACT stack on tape: React Native + Expo, Clerk auth, Postgres, Sentry, Inngest, ImageKit, CodeRabbit, `claude.md` + `agents.md`. 14-day App Store claim / first-customer-in-5-days = **UNVERIFIED**.

Hive remap:
- Web SKU stays Next + Better Auth ([better-auth-next-scaffold](sand-workflow:better-auth-next-scaffold)) — do not start an App Store product from this tape.
- Expo path only if Evens explicitly asks mobile. Cursor Cloud implements; App Store submit = **BLOCKED** (would work if we had App Store Connect + operator Mac).
- Clerk → Better Auth on web. Sentry loop → [sentry-fix-to-pr](sand-workflow:sentry-fix-to-pr) (**BLOCKED** until Sentry exists; workaround = host logs + GitHub issue).
- `agents.md` / `claude.md` → one thin Cursor rules file + this PIV skill. No second desktop.

### Tools

| Need | Path |
|---|---|
| Cursor Cloud | CloudAgent — **PROVE** |
| GitHub issues | GitHub MCP — **PROVE** |
| Verify | Playwright / tests — **PROVE** |
| Claude Code / Claude desktop | **BLOCKED** — Cursor **WORKAROUND** |
| Sentry | **BLOCKED** would work if we had Sentry — [sentry-fix-to-pr](sand-workflow:sentry-fix-to-pr) |
| App Store / Expo EAS submit | **BLOCKED** would work if operator asked mobile + store credentials |
| Linear MCP | **BLOCKED** — GitHub Issues **WORKAROUND** |

### Prompt

```
PIV for [job]:
Plan (done-when, bounds, HITL gates)
Implement (one Cursor Cloud slice, thin rules)
Verify (golden check / click URL / test)
No spec-in-ship-out. No second desktop. No App Store unless Evens asked.
```
