---
name: Vibe click live
description: >-
  Use after every site ship — open the live URL and click; docs alone are not done.
merged_from: [osmani-ship-checklist]
---

# Vibe click live

Sources: X bookmark vibe-test; Watchdog/Forge standing; verify-then-done.

## When
After deploy or "site done" claim.

## Do
1. Open the real URL (mobile + desktop).
2. Click primary CTAs, forms, book path.
3. Screenshot fails. No "looks good" without clicks.

## Don't
- Buy a vibe-test SaaS
- Accept staging-only proof for a public claim

---

## Merged from `osmani-ship-checklist` (2026-10-11)

- Original description: Use when claiming ship or launch — click-live-site and HOLD gates; remaps Osmani shipping-and-launch. Live `/` stays HOLD unless Big Boss says ship.
- Unique content carried: HOLD gate: live / stays HOLD unless Big Boss says ship

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
