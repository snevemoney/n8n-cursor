---
name: Teach from transcript
description: >-
  Use when turning a YouTube or hive.json transcript into a reusable skill
  because there is no box screen recording. Do not use when a teach-session
  mp4 is already queued — that is learn-from-demonstration. Do not use for
  auto-like, credential-entry, or farm demos.
---
# Teach from transcript

**Owner:** Consultant (audit close) · Researcher (extract) · all desks consume.
**Tape:** Nate `yt:TMPUUyQC5aM` tip 7 (teach a task) + `yt:NyfYxpXiw_0`. Hive remap, not a second product.

Nate records the agent computer; Grok writes a skill via learn-from-demonstration. When the demonstration is a **signal transcript**, replay that transcript as the demo. Chat-only summary = failure.

## When

- Operator says teach-a-task / learn-from-demonstration and no recording is queued under `/workspace/teach-sessions/`
- A YouTube L2 or SIGNAL_INDEX row needs a skill and the tape is visual-procedural
- Repassing an existing `*.hive.json` / `transcripts/<id>/full.txt`

## Anti-triggers

- A claimed teach-session `demo.mp4` exists → learn-from-demonstration only
- Auto-like / Instagram / School engagement loops → NO-SKILL
- The demo is mostly typing a password → stop, no skill
- New desk / ClickUp board / Composio-first YouTube → NO-SKILL or grokbot-signal-training WORKAROUND

## Inputs

- `{transcript_path}` hive.json or full.txt
- `{video_id}` e.g. `TMPUUyQC5aM`
- `{goal}` one sentence of the reusable job

## Sequence

1. **Read the transcript.** Prefer `fullTranscript` in `*.hive.json`, else `transcripts/<id>/full.txt`, else timedtext. Do not invent lines. Label FACT vs INFERENCE.
2. **Play-by-play.** Starting state, each UI action in order, ending state, exact typed text except credentials.
3. **Decide the skill.** Goal, steps, inputs vs constants. If we already own the click-path, enrich that skill. Do not mint a twin.
4. **Write or enrich** the workflow. Description must include what / trigger phrases / anti-triggers.
5. **Tools table.** PROVE · WORKAROUND · BLOCKED (would work if we had X).
6. **Close.** SKILL_DELTA.md + SIGNAL_INDEX row + ACTION_LOG card. Offer a dry run. Never run unprompted. Routine only if recurring.

## Prompts

**Transcript → skill**

```
Signal: {video_id} path={transcript_path}
Goal: {goal}
1) Quote FACT steps from the transcript (no invented UI)
2) Inputs vs constants
3) create | enrich | NO-SKILL
4) Tools: PROVE | WORKAROUND | BLOCKED (would work if we had X)
5) Write SKILL_DELTA + SIGNAL_INDEX row
Chat-only = fail.
```

**Teach-a-task remap (Nate tip 7)**

```
If /workspace/teach-sessions has a queued mp4 → learn-from-demonstration.
Else replay {transcript_path} with teach-from-transcript.
Never paste passwords in chat. Login wall = box handoff.
Never auto-like. Never require ClickUp (ACTION_LOG.jsonl).
```

## Tools

| Need | Path |
|---|---|
| Transcript | `*.hive.json` fullTranscript / Whisper full.txt — **PROVE** |
| Skill write | workflows disk — **PROVE** |
| Box recording queue | `/workspace/teach-sessions/` — **WORKAROUND** this skill when empty; learn-from-demonstration when queued |
| ClickUp | **WORKAROUND** ACTION_LOG.jsonl |
| Composio YouTube | **WORKAROUND** disk history JSON + timedtext |
| School / IG auto-like | **NO-SKILL** |

## Never

- Claim teach-a-task is untestable when a transcript exists
- Fake a demo.mp4 or a teach-session claim
- Paste secrets, one-time codes, or webhook keys
- Install Jotform Agents / Claude desktop / a second knowledge product
- Mint desks from a tape
