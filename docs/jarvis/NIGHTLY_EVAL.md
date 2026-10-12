# One-Mind nightly evaluation (F2)
Fixed offline suite: `coding.golden`, `coding.box_agent`, `research.cited_claim`, `browser.fake_page`, `voice.text`. It makes no network calls and costs $0.
```bash
cd apps/agent-stack && JARVIS_ONE_MIND=1 python3 eval/nightly/run_nightly.py \
  [--history ~/.local/state/jarvis-one-mind/nightly-history.json]
```
Each run appends `{run_at, git_sha, tasks[{id, score, passed, seconds, detail, error}], score, cost_usd}` to the history JSON. It exits 0 only when every task scores 1.0.
No scheduler is installed. To run it nightly, an operator adds a cron or launchd entry that calls the command above. Do not add one without Evens's OK.
The live coding check is separate and capped at $0.50: `JARVIS_ONE_MIND=1 python3 eval/golden_mission/live_run.py`. It needs a Jarvis LiteLLM key and `JARVIS_ONE_MIND_CODING_MODEL`, and prints SKIPPED otherwise.
