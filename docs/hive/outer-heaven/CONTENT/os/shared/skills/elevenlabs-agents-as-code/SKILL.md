---
name: ElevenLabs agents as code
description: Use when a hive desk must version, preview, or change an ElevenLabs Conversational AI agent (Big Boss voice line first). Local JSON, dry-run before any push. Not for voice-SDR, client send, or live site widgets.
---

# ElevenLabs agents as code

Owner: Consultant (bar). Forge runs it on the Big Boss voice agent. HITL on push.
Platform: Grok Bot shared computer plus Cursor Cloud. Claude and Codex use generate-skills in a repo.
Install: GitHub elevenlabs/cli. No marketplace connector. Do not add hosted MCP this cycle.

Shared box: one binary on PATH is enough for all 17 desks. Do not fan out DMs.

## When
- Big Boss voice agent config must be pulled, diffed, or changed
- Operator asks for agents-as-code or the ElevenLabs CLI
- A desk is about to treat the dashboard as the source of truth

## Anti-triggers
- Voice-SDR, AITuber, auto-dial, Lead Hunter outbound
- Client SKU this cycle (building mode: plan only)
- Widget on the public site (HOLD)
- Mac install unless Evens asked for local
- CI push without HITL (that is prod deploy)
- API keys in markdown or chat

## Inputs
- agent_id default agent_0001m12xxdbge58ttc2701w67nyk
- workdir default /workspace/voice-line
- mode: pull, diff, dry-run-push, push

## Order
1. Index: auth status. Operator may already be in the browser. Do not ask for a password. If empty, stop.
2. Init once in workdir if agents.json is missing.
3. Pull one agent (dry-run first). Never pull all on first sitting.
4. Edit JSON. Do not mint a second Grok desk. transfer_to_agent later.
5. Preview with dry-run. Critic grades the diff. Citing this skill is not failure-replay.
6. Push only after HITL. Spoken confirm still required.

generate-skills --output-dir workdir/cli-skills is offline and needs no key. Do not copy those files 1:1 into hive workflows.

## Validate
One agent id. Dry-run exists before push. No key in git. If live agent would change, name Watchdog replay truths.

## Return
Path to agent_configs, dry-run text, replay still-true or no live swap.

## Approval
HITL: push, new number, spend cap, key mint, public widget.

## Never
make_call from Consultant, Researcher, Lead Hunter, or GTM. n8n as the path. Fable. Ship live slash. Merge PR 149.

## X bookmarks 20260929-1616 — local OSS ElevenLabs-class TTS pointer

Packet: `/workspace/research/packets/x-bookmarks/20260929-1616-desktop/` · desktop-computerUse-dom-scroll head · API bookmarks+posts 403 spend-cap.

### @liambraus local free ElevenLabs replacement (`x:2103825720807993573`)
**FACT (DOM preview):** solo-dev open-sourced claim of a **100% FREE** ElevenLabs-class replacement that **runs entirely on your own machine**.
**INFERENCE:** cost/privacy alternative watch for voice line — does **not** replace this skill's ElevenLabs CLI agents-as-code path (Big Boss voice still HITL/push via hosted ElevenLabs until operator greens a local swap).
**UNVERIFIED:** project name, repo quality, latency/quality vs ElevenLabs, license (Cap video held; no fullwatch this fire; posts-by-id also 403).

| Need | Label |
|---|---|
| ElevenLabs agents-as-code (hosted) | **PROVE** (this skill) |
| Local OSS TTS as hive voice SoT | **BLOCKED** (import-gate + HITL only if operator greens) |
| Fullwatch liambraus Cap | **HELD** |

Anti: mint a twin local-TTS skill from title alone; swap Big Boss voice off ElevenLabs without HITL; treat marketing "100% FREE / incredible" as FACT. Install: **none (process-only)**. NO mint.

