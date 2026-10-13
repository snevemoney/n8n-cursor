---
name: Voice-ramble session context dump
description: >-
  Use when: New project / max context session start — grill-me interview or
  dictation dump then short loops; local push-to-talk optional.
---
# Voice-ramble session context dump

**Owner desk:** Big Boss  
**Lane:** hive-os  
**Sources:** tape-walk eMPWBunaOic Karpathy prompting 2.0; session-bootstrap; Nate grill-me `yt:TMPUUyQC5aM`; Pat Simmons local dictation `yt:IMQw3aHjf2Q`.

## When
New project / max context session start; quarterly plans; before building an automation.

## Do
1. Long ramble **or** grill-me interview until shared understanding ([interview-to-desk](sand-workflow:interview-to-desk)).
2. Prefer local push-to-talk when available ([local-push-to-talk-dictation](sand-workflow:local-push-to-talk-dictation)) so dumps stay on-device.
3. Agent reconstructs goals · constraints · links · success check.
4. Light edits after; then recipes / skills.
5. Persist durable facts to shared wiki; keep private notes desk-local.

## Don't
- Always 10-min prompts
- Skip verify after
- Require Wispr cloud / Claude Code for dictation
- Paste secrets into the dump

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| Dump | session-bootstrap / interview-to-desk — **PROVE** |
| Local dictation | local-push-to-talk-dictation — **WORKAROUND** for Wispr |
| Whisper (file audio) | whisper path if audio file — **PROVE** |
| Wispr Flow cloud | **BLOCKED** — local app **WORKAROUND** |

## Prompts
**Ramble dump**
```
Paste/transcript:
Goals · constraints · links · success check. One dump then short loops.
```

**Grill me**
```
Relentlessly interview me about [topic] until shared understanding.
Then write owns/never/wake/done-when and propose desk/skills. No build mid-confusion.
```

## X bookmarks 20261001-1028-desktop — verbose dump (`x:2105367304817250566` @Jhaddix)
**FACT (preview):** Prompt-engineering tip — speak/write **verbose**: when dictating problems, solutions, architecture, best practices, dump **pages** of current understanding to the model (not a one-line ask).
**Map:** STRENGTHENS this skill + [grill-me-into-prompt](sand-workflow:grill-me-into-prompt) + [local-push-to-talk-dictation](sand-workflow:local-push-to-talk-dictation). Session start = long dump of what you already believe, then short verify loops.
**Label:** STRENGTHENS_EXISTING · process-only · **PROVE** (hive already dumps via voice-ramble / grill-me).
Platform: **Grok Bot + Cursor**. Install: **none (process-only)**. Anti: mint a new "verbose prompting" skill; treat as leisure tip only.
