---
name: adopt-then-bus-then-mouth-or-face
description: >-
  Adopt the existing vault, write the file bus, then attach mouth
  and face. PTT Home writes the bus; the localhost pane reads it.
  Hands stay parked. Use when Evens names fullstack-agent or the
  agentic OS bus. Do not install Claude Code. Cursor plus Grok.
---

# Adopt, then bus, then mouth or face

**Owner:** Forge (adopt + mouth + face) · Watchdog (GRADE) · Librarian (index).  
**Status:** WIRED 2026-09-04 sittings 1–3. Not accepted forever.  
**Cursor copy:** `.cursor/skills/adopt-then-bus-then-mouth-or-face/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/adopt-then-bus-then-mouth-or-face/SKILL.md`  
**CLI:** `cd apps/agent-stack && npm test && npm run adopt && ./start.sh check`  
**Package:** `apps/agent-stack/` (MIT, original). Not a fork.  
**Labeled aliases (do not remap-as-done):** `session-bootstrap` (dump once) · `observe-pane` (yellow/done on the same jobs).  
**Also on disk:** `adopt-then-bus-then-os` is the Python twin (`scripts/hive/os/agent-stack.py`). Same bus files. Do not remint `session-bootstrap`.

**Source:** public repo + README (observed). Tour tape `FiOTrxq9ckM` caption-only / unwatched. AGPL upstream — pattern rewrite, no vendor.

## When

Evens names fullstack-agent / Jarvis / memory+voice+face / “make it the agentic OS.” Not a client SKU. Not a second dashboard.

## Card

```
KIND: agentic-os
VAULT: adopt existing path (never create)
BUS: .hive/bus/state.json  phase=idle|listen|think|speak + utterance + permission_ask
JOB: observe-pane working|yellow|done
PERMISSION: ask
HOSTS: cursor + grok
MOUTH: wired — PTT Home / hold Talk → local STT → bus → desk job after spoken yes
FACE: wired — 127.0.0.1:4018 cinematic observe-pane reads the bus
PARK: hands
NEVER: claude-code · second-home · live-/ · AGPL vendor into apps/ · ElevenLabs without ASK · 0.0.0.0
DONE-CHECK: mouth self-test + face /healthz on 127.0.0.1 · Home PTT writes bus · yellow ASK · start.sh starts face · hands parked
CAP: localhost · no inferred hard-step · no ElevenLabs · no mouse
COST: Web Speech + speechSynthesis + optional `say`
STOP-KIND: cap + done-check
```

## Steps

1. Spectacle test — if you were about to clone four repos or write `~/my-agent/CLAUDE.md`, stop.
2. `cd apps/agent-stack && npm test`
3. `npm run adopt` — writes `.hive/agent-stack.json` + idle bus against the existing vault. Mouth/face mark wired when their `start.sh` exists. Hands stay parked.
4. Mouth tests: `AGENT_STACK_DRY_TTS=1 python3 apps/agent-stack/mouth/turn.py --self-test` and `python3 apps/agent-stack/mouth/test_turn.py`.
5. Face tests: `python3 apps/agent-stack/face/serve.py --self-test` and `python3 apps/agent-stack/face/test_serve.py`.
6. `./start.sh check` — no daemon. `./start.sh` execs the face on `127.0.0.1:4018`.
7. PTT is hold Home (or hold Talk). Type is fallback. Spoken yes queues a `desk-turn` for Cursor or Grok. There is no live Cursor `Agent.send` SDK on this box — the remap is the queued job.
8. Watchdog GRADE those JSON files + healthz. Builder does not self-PROVEN.

## Never

Claude Code / Cowork · vendor AGPL trees into `apps/` · second vault · extra dashboard · live `/` · send / pay / deploy / book / publish · ElevenLabs without ASK · mouse takeover · `0.0.0.0` · self-PROVEN · remap `session-bootstrap` or `observe-pane` as done
