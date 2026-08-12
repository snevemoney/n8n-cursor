# Skill: github-ci-failure-triage

**Description:** Triage GitHub Actions failure emails in Gmail for `snevemoney/n8n-cursor`; summarize and route to Forge for fix.

**Trigger subjects:** `[snevemoney/n8n-cursor] PR run failed:` or `workflow run` from `notifications@github.com`.

**Instructions:**

1. Use Grok **Gmail** plugin — search last 24h:
   - `from:notifications@github.com subject:"n8n-cursor" (failed OR "not successful")`
2. For each unread failure (newest first, max 5):
   - Repo, workflow name, commit/PR title, failed job(s), duration
   - Extract **View workflow run** URL from the email body
3. Use Grok **GitHub** plugin (read-only) — confirm run status and failed job logs summary on `snevemoney/n8n-cursor`.
4. Classify:
   - **UI Integrity / Reliability Guards** → likely flaky UI or health check; note file paths from logs
   - **Security Scan** → dependency or secret finding; do not auto-fix secrets
   - **Scope Validation / Consistency** → doc or path contract drift
5. Output for operator:
   - One-line severity (P0 broken main vs P2 PR noise)
   - **Recommended owner:** Forge (code fix) or operator (GitHub settings / secrets)
   - Draft handoff bullet list for Cursor if code fix needed
6. Mark thread read only after summary delivered — never reply to GitHub notification emails.
7. Optional register:
   ```bash
   python3 scripts/hive/grok-hive-tool.py --grok-agent "Communications Manager" --tool scorpion_register_outcome --params '{"jobType":"ops.ci_triage","status":"done","summary":"..."}'
   ```

**Owner agents:** Communications Manager (triage) → Forge (fix)
