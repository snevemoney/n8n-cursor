# Skill: morning-day-plan

**Description:** Pull today's calendar and actionable Gmail; write a short weekday day plan.

**Instructions:**

1. Use Grok **Google Calendar** plugin — list today's events with times; note conflicts and gaps.
2. Use Grok **Gmail** plugin — find threads needing reply, deadlines, or pending invites (last 48h).
3. Write a concise plan:
   - Meetings (time-ordered)
   - Top 3 actions for the operator
   - One "protect evening" note if afternoon is stacked
4. Do **not** send email or accept calendar invites — suggestions only.
5. Optional register:
   ```bash
   python3 scripts/hive/grok-hive-tool.py --grok-agent "Day Planner" --tool scorpion_register_outcome --params '{"jobType":"ops.day_plan","status":"done","summary":"..."}'
   ```

**Owner agent:** Day Planner
