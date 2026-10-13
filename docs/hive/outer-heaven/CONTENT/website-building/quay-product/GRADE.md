# quay-4844 — Watchdog GRADE

UNFILLED. Forge does not self-grade.

```
BUILDER: Forge (Cursor cloud, branch cursor/book-path-product-match-capex-9b2e)
VERIFIER: Watchdog — new session, read-only, no Send / Pay tools
HYPOTHESIS: on 127.0.0.1:4844 every Request-a-showing CTA lands on showing.html (not 404, no tel:); a listing can be picked and up to two windows offered (third refused); Request showing flips the pill to "requested · awaiting agent approval" and freezes listing + windows; Approve turns exactly one slot green with "✓ Sample buyer", pill "approved · on the calendar", toast; the phone-tag card mutes; ?state=requested and ?state=approved show the same pictures; ?listing=quay-12 preselects; layout holds at 390px; every page says SAMPLE / CapEx / invent_kpi=0.
LABELED: docs/hive/outer-heaven/CONTENT/website-building/quay-product/
MISS:
GRADE:
```

## Hold-outs (Watchdog picks; builder did not script these)
- Offer two windows, then approve the **second** via its chip — the first must stay dashed "Offered", not disappear.
- Keyboard only: Tab to a slot, Space to offer, Enter on Request showing — does focus land on Approve?
- Reset to empty after approve — pill "no showing requested", listings re-enabled, phone-tag un-muted.
- `prefers-reduced-motion` — toast still appears, no transition.
- Network panel: zero requests after load.

## Hard step
`GRADE: pass` is not deploy / publish / wiring the live case page. Those stay Evens. Merge ≠ ship. Live `/` HOLD.
