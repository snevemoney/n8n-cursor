# Skill: hive-health-snapshot

**Description:** One-paragraph hive ops status for Big Boss or Engineering Lead.

**Instructions:**

1. Run:
   ```bash
   python3 scripts/hive/grok-hive-tool.py --grok-agent "Watchdog Ops" --tool scorpion_health
   ```
2. Browser or curl golden paths:
   `https://evenslouis.ca/scorpion/api/hive/golden-paths`
3. Summarize in **one paragraph**:
   - Scorpion / CE / n8n health (pass/fail)
   - Golden paths score if available
   - Open missions count (if scorpion_list_missions available)
   - One WARN or CRITICAL item max, with /pro or /n8n link if Tier 3
4. Read-only — no heals, restarts, or deploys.

**Owner agents:** Watchdog Ops, Big Boss, Engineering Lead
