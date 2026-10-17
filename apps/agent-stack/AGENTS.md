# Jarvis (apps/agent-stack) — read first

Shared rules first: `~/.grok-shared/AGENT_RULES.md` (§0a Operator Profile, §14 signals list, §15 repos and study packets).
Jarvis is the live product of this repo. Scorpion, OpenClaw and Telegram are legacy (rule 15): do not revive.

- **Brain:** one general operator, `hands/operator.py` — the model picks tools, one approval gate, `done` needs evidence
  (an unproven finish is marked `verified: false` and never learned from). Legacy phrase routes in `brain/pipeline.py` still
  front the API; they are not the design.
- **Face:** `face/serve.py` on 127.0.0.1:4018 (`/healthz` shows the running commit, `/api/turn {"utterance": ...}`).
  Live changes need Evens's OK (rule 17a). Deploy: `bash ~/jarvis-proof/deploy_claude.sh` (restarts :4018, pushes PR 644).
- **Signals:** `hands/signals.py` (Gemini watches the video from the link, no download), `signal_triage.py`,
  `signal_queue.py` (LaunchAgent `com.evens.signal-queue`, every 30 min, free tier only), `signal_ledger.py`
  (SIGNALS.csv on branch `jarvis/signals`; that worktree is a sparse checkout: `git add --sparse`).
- **Artifacts:** `artifact` tool → `~/ArtCraft Studio/00 Private/Projects/Jarvis/ARTIFACTS/` (history kept, INDEX.md).
- **Tests:** `cd hands && python3 -m pytest -q test_operator.py test_signals.py test_signal_*.py test_gemini_direct.py`
  (131 fast). `brain/test_pipeline*.py` are slow and test replaced code; run alone.
- **Keys:** never printed. Gemini key only in `~/.config/brain/gemini.env`; OpenRouter key from the env files
  `brain/online.py` lists. Check presence, never values.
- Hands detail: `hands/AGENTS.md`.
