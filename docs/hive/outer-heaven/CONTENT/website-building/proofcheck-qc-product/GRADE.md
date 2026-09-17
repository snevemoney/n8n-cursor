# proofcheck-qc-4860 — Watchdog GRADE

UNFILLED. Forge does not self-grade.

```
BUILDER: Forge (Cursor cloud, branch cursor/work-verticals-product-match-capex-dc1b)
VERIFIER: Watchdog — new session, read-only, no Send / Pay tools
HYPOTHESIS: on 127.0.0.1:4860 the shell's Verify a draft lands on verify.html (not 404); with zero sources Verify Now is disabled; adding a source + loading the example draft enables it; Verify Now lists 3 claims with 1 uncited and the gate stays closed; tapping Cite on the flagged claim and verifying again opens the gate (green) with toast 'Gate open · voice kept · 0 words changed'; ?state=verified shows the open gate; no outbound request; layout holds at 390px; every page says SAMPLE / CapEx / invent_kpi=0.
LABELED: docs/hive/outer-heaven/CONTENT/website-building/proofcheck-qc-product/ (shell + verify.html + assets + tests) · batch critic: website-building/product-match-critic/BATCH.md
MISS:
GRADE:
```

## Hold-outs (Watchdog picks; builder did not script these)
- Type a draft with a citation to a source id that does not exist (e.g. [S9]) — must flag as uncited, not pass.
- Remove a source after verifying — gate must close again on re-verify.
- Keyboard only: Tab to Verify Now, Enter, Tab to Cite, Enter.
- `prefers-reduced-motion` — state changes still land, no transition.
- Compare against the launch-video beats for ProofCheck QC (Creative Studio packet, not in repo).

## Hard step
`GRADE: pass` is not deploy / publish / wiring the live `/work` case page. Those stay Evens. Merge ≠ ship. Live `/` HOLD.
