---
name: Osmani ship checklist
description: >-
  Use when claiming ship or launch — click-live-site and HOLD gates; remaps Osmani shipping-and-launch. Live `/` stays HOLD unless Big Boss says ship.
---
# Osmani ship checklist

Source: addyosmani/agent-skills `shipping-and-launch` (MIT).

## When
About to claim ship, launch, or public URL.

## Do
1. DONE_WHEN checklist executed (not imagined).
2. click-live-site: open URL, click CTA; looks good without a click = fail.
3. Watchdog critic PASS before Forge-done.
4. Live `/` HOLD unless Big Boss explicitly says ship. Merge ≠ ship. No PR 149 as ship.

## Don't
Self-PASS. Publish under HOLD. Install BMAD or OpenBot as face to ship.
