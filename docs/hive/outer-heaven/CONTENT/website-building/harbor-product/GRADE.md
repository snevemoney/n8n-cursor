# harbor-4847 — Watchdog GRADE

UNFILLED. Forge does not self-grade.

```
BUILDER: Forge (Cursor cloud, branch cursor/book-path-product-match-capex-9b2e)
VERIFIER: Watchdog — new session, read-only, no Send / Pay tools
HYPOTHESIS: on 127.0.0.1:4847 every Request-a-job CTA lands on job.html (not 404, no tel:); Pick a visit stays disabled until service AND address are filled; step 2 shows a Mon–Fri × AM/PM grid; Book visit turns exactly one window green with the service name, pill "visit booked · on the calendar", outcome card carrying job + address + name, toast; the phone-tag card mutes; ?state=booked and ?service=Small+plumbing land deterministically; no $ figure anywhere; layout holds at 390px; every page says SAMPLE / CapEx / invent_kpi=0.
LABELED: docs/hive/outer-heaven/CONTENT/website-building/harbor-product/
MISS:
GRADE:
```

## Hold-outs (Watchdog picks; builder did not script these)
- Pick a window, go Back, change the service, come forward — the window must still be selected and Book visit enabled.
- Keyboard only: Tab from the address field to Pick a visit, Enter, does focus land on the first grid slot?
- Reset to empty after booking — pill "empty · describe the job", step 1 visible, phone-tag un-muted.
- `prefers-reduced-motion` — toast still appears, no transition.
- Network panel: zero requests after load.

## Hard step
`GRADE: pass` is not deploy / publish / wiring the live case page. Those stay Evens. Merge ≠ ship. Live `/` HOLD.
