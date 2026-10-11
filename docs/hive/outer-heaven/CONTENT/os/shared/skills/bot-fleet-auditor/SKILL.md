---
name: Bot fleet auditor
description: Use weekly to tally what each routine or agent produced versus cost, and recommend kill or keep. Nothing dies without operator say-so.
---
# Bot fleet auditor
Owner: Watchdog. Consultant may co-score.
1. List every routine and always-on bot.
2. Last useful output, last fire, duplicates, failures.
3. Kill / keep / merge. Same-cron duplicates merge.
4. Post a ledger. Nothing deleted without operator yes.
Never auto-delete. Never pause money/send jobs alone.

## Routine wake-frequency and cost review (added 2026-10-11, "bot-maker" routine pattern, packet `/workspace/research/packets/x-scarfpinkgirl-2107529989612581311` 0:18:15–0:19:01)
Run as part of the weekly audit. Every wake costs usage even when nothing happens.
1. For each routine, collect: schedule/interval, wakes in the last 7 days, wakes that produced a useful output (message, PR, ticket, alert acted on), and estimated cost per wake.
2. Compute **value rate** = useful outputs ÷ wakes, and **wakes per useful output**.
3. **Flag** (a) any routine waking **more often than every 15 minutes**, and (b) any routine that **rarely produces output** (for example under 10% value rate, or no useful output in 7 days).
4. **Recommend trimming** per flag: lengthen the interval (15–30 min or more), switch to an event trigger (webhook, new mail, CI change) with a long heartbeat fallback, gate behind a cheap preflight check, merge with a same-purpose routine, or pause. Show the projected wake savings.
5. Put this in the ledger as a table (routine · interval · wakes/7d · useful · value rate · recommendation). Recommendations only: no schedule changes without operator yes.
