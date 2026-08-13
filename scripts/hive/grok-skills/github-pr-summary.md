# Skill: github-pr-summary

**Description:** Read open PRs on n8n-cursor and return a 5-bullet summary for the operator.

**Instructions:**

1. Use Grok **GitHub** plugin — repo `n8n-cursor` (operator monorepo).
2. List open pull requests (newest first, max 5).
3. For each PR with activity in last 7 days, one bullet:
   - `#number` title — author — status — one-line change summary
4. End with: **Recommended next step** (review, merge staging, or hand to Cursor).
5. Read-only — do not merge, comment, or push.

**Owner agents:** Engineering Lead, Forge Builder, Big Boss (delegate)
