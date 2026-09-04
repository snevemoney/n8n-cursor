# Watchdog GRADE — adopt-then-bus-then-mouth-or-face sitting 4 2026-09-04

Status: **pending**

Builder must not self-PROVEN.

Check:

- `apps/agent-stack` is original MIT, not an AGPL copy
- we did not clone Jared’s installer, `ai-visualizer`, `ai-memory-vault`, `backtalk`, or `barehands`
- mouth `turn.py --self-test` + `test_turn.py`: always-on classify routes vault questions to memory; fixture Q&A cites; miss is UNKNOWN; still refuses send/pay/deploy/book/publish; desk jobs ASK then queue on spoken yes
- face `serve.py --self-test` binds `127.0.0.1`, `/healthz` ok, GET `/` 200 with canvas + LIVE/MUTE
- `start.sh check` exits 0; `start.sh` execs `apps/agent-stack/face/serve.py`; mouth is not a second OS; `voice-os.py` stays gone
- pieces: mouth=wired · face=wired · hands=parked · memory=adopted path + Q&A write path
- no ElevenLabs · no `0.0.0.0` · no Claude Code · no mouse · no WebGL-as-product
- skill is still `adopt-then-bus-then-mouth-or-face` (not a remap-as-done of session-bootstrap or observe-pane)
- cinematic-recipe loop is on disk at `apps/agent-stack/face/DESIGN-FACE.md` (pick = cloud-glass presence)
