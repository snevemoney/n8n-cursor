# scripts/evals/promptfoo — eval gate v1
Run: `scripts/evals/promptfoo/run.sh` (needs OPENROUTER_API_KEY; ≈$0.0004/run, gpt-4o-mini). Exit 0 = all suites pass.
Suites: Jarvis SYS (extracted live from apps/agent-stack/brain/online.py), n8n support-agent-webhook (extracted from the workflow JSON), Watchdog and Researcher desks (snapshots, no repo source). `extract_prompts.py --check` fails on drift.
Rule: edited a system prompt? run this; any regression = revert. Not run in GitHub CI (no paid calls in CI); runs on the build box.
Fixed 2026-10-13: the n8n-support prompt now steers webhook 404s to test (/webhook-test/) vs production (/webhook/) URLs; the old prompt fails the stricter assert, the new one passes 3/3.
