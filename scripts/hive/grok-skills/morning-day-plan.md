---
name: morning-day-plan
description: >-
  Weekday plan from Calendar + Gmail plugins. CUT slider, three inbox
  buckets, no-move-meeting. Draft only. Day Planner owns this machine.
---

# Morning day plan

**Owner:** Day Planner. **Stack:** Grok Calendar + Gmail plugins. Consume digests; do not fire webhooks.

## When
Weekday morning, or Evens asks for today’s plan. Not a product build. Not a client send.

## Steps
1. **Calendar plugin** — list today’s events with times. Flag conflicts and gaps vs open agent jobs. Escalate; **do not move the meeting**.
2. **Gmail plugin** — last 48h into three buckets only: **urgent** / **info** / **ignore**. First Gmail = read+draft.
3. Write the plan:
   - Meetings (time-ordered)
   - Top 3 actions
   - **CUT** slider — what we will not do today (protect deep work)
   - One protect-evening note if afternoon is stacked
4. Ladder: **visible → efficient → automatic**. Do not skip to automatic.
5. Optional register (no webhook):
   ```bash
   python3 scripts/hive/grok-hive-tool.py --grok-agent "Day Planner" --tool scorpion_register_outcome --params '{"jobType":"ops.day_plan","status":"done","summary":"..."}'
   ```

## Stop
Send, accept, move invite, pay, deploy, book, publish = operator.

## Never
- Send email or accept/move calendar invites
- Fire `n8n_trigger_catalog_webhook` or `hive_send_report`
- Invent `hive-operator-digest.json` fields when the file is missing
- Build product or client deliverables from this desk
