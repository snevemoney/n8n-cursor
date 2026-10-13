# evals/promptfoo — eval gate v1
Run: `evals/promptfoo/run.sh` (needs OPENROUTER_API_KEY; ≈$0.0004/run, gpt-4o-mini). Exit 0 = all suites pass.
Suites: Jarvis SYS (apps/agent-stack/brain/online.py), Watchdog desk, Researcher desk, n8n support-agent-webhook.
Rule: edited a system prompt? run this; any regression = revert. Not run in GitHub CI (no paid calls in CI); runs on the build box.
Known FAIL (accepted 2026-10-13): n8n-support doesn't point users to the test-vs-production webhook URL for 404s.
