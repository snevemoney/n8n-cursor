# sketchbook-4864 — Watchdog GRADE

UNFILLED. Forge does not self-grade.

```
BUILDER: Forge (Cursor cloud, branch cursor/work-verticals-product-match-capex-dc1b)
VERIFIER: Watchdog — new session, read-only, no Send / Pay tools
HYPOTHESIS: on 127.0.0.1:4864 the shell's Open the book lands on book.html (not 404); the book starts closed showing only the cover and Prev disabled; Open shows spread 1 with the position pill; Next/Prev and arrow keys turn spreads with a flip (or a cut under reduced motion); the last spread flips the stage to end with the toast; ?state=open&page=2 lands on spread 2; no outbound request; layout holds at 390px (spread stacks to a single page); every page says SAMPLE / CapEx / invent_kpi=0.
LABELED: docs/hive/outer-heaven/CONTENT/website-building/sketchbook-product/ (shell + book.html + assets + tests) · batch critic: website-building/product-match-critic/BATCH.md
MISS:
GRADE:
```

## Hold-outs (Watchdog picks; builder did not script these)
- Press → on the colophon — must stay put, no wrap.
- Press ← on spread 1 — must close the book, not error.
- ?page=99 — must clamp to the last spread, not blank.
- `prefers-reduced-motion` — state changes still land, no transition.
- Compare against the launch-video beats for Sketchbook (Creative Studio packet, not in repo).

## Hard step
`GRADE: pass` is not deploy / publish / wiring the live `/work` case page. Those stay Evens. Merge ≠ ship. Live `/` HOLD.
