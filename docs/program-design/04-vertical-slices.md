# Stage 4 — Vertical slices

Models love horizontal layers (all DB, then all API, then all UI). That leaves nothing testable until the end.

## Required order

1. Thin end-to-end stub (fake data OK)
2. Wire real path
3. Business logic
4. Edge cases / errors

Test after each slice (curl, browser, unit — whatever fits).
