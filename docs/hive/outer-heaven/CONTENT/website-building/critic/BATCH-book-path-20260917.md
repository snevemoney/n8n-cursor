# Critic batch — book-path product-match CapEx (6 verticals) · 2026-09-17

**Builder:** Forge (Cursor cloud) · branch `cursor/book-path-product-match-capex-9b2e`
**Verifier:** Watchdog — new session, read-only, no Send / Pay tools. **GRADE UNFILLED for all six.** Forge does not self-PASS.
**Locks held:** CapEx / preview only · live `/` HOLD · invent_kpi=0 · no Remotion / launch-video edits · no deploy · no ironlane redo · no live `/work` case-page wiring (separate HITL).
**Brief:** [`FORGE_BRIEF-product-match-15-20260917.md`](FORGE_BRIEF-product-match-15-20260917.md) (Creative Studio → Forge; copy attached here from the operator upload). **Template:** `../ironlane-product/` (PR #323).

**Slug lock (exact, from the brief · no renames):** `ashford-product` · `quay-product` · `atelier-product` · `ledgerline-product` · `harbor-product` · `northline-product`, all under `docs/hive/outer-heaven/CONTENT/website-building/` — the same root PR #323 used for `ironlane-product`.

## Slices

| slug | name | port | door built | friction contrast | door tag | tests (`npm test`) | GRADE |
|---|---|---|---|---|---|---|---|
| ashford | Ashford & Vale | 127.0.0.1:4843 | private apply → qualify (3 steps, 3 lanes, **no public Book**) | loud Book widget card mutes | HOLD | 15 pass / 0 fail | [UNFILLED](../ashford-product/GRADE.md) |
| quay | Quay Team | 127.0.0.1:4844 | request showing (≤2 windows) → agent approve → green on calendar | phone-tag card mutes | DEMO | 15 pass / 0 fail | [UNFILLED](../quay-product/GRADE.md) |
| atelier | Atelier Cohort | 127.0.0.1:4845 | request a seat (12-chair map) · full cohort → numbered waitlist · **no opt-in** | funnel-spam card mutes | HOLD | 15 pass / 0 fail | [UNFILLED](../atelier-product/GRADE.md) |
| ledgerline | Ledgerline | 127.0.0.1:4846 | 10s clarity block (3 lines ↔ 24-tab fog toggle) + demo book | feature-fog toggle + card | DEMO | 19 pass / 0 fail | [UNFILLED](../ledgerline-product/GRADE.md) |
| harbor | Harbor & Co. | 127.0.0.1:4847 | job request (service · address · line) → AM/PM visit on calendar | phone-tag card mutes | DEMO | 14 pass / 0 fail | [UNFILLED](../harbor-product/GRADE.md) |
| northline | Northline Clinic | 127.0.0.1:4848 | private book + form SLA track (received → review → confirmed, consent gate) | waitlist-chaos card mutes | HOLD | 14 pass / 0 fail | [UNFILLED](../northline-product/GRADE.md) |

Door tags (HOLD / DEMO) are product-mode tags from the brief, not deploy gates. Everything here is CapEx.

## What Forge ran (not a GRADE)

- `npm test` in each folder → **92 node tests, 0 fail** (counts above).
- `node --check` on all 16 JS modules → clean.
- API ladder: `bash serve.sh` ×6 (127.0.0.1, never kills a listener) → `curl` on `/`, the door page, the door page with its success `?state=`, `assets/tokens.css`, `assets/product.css`, every JS module → all **200**.
- Runtime DOM smoke (jsdom in `/tmp`, not committed): every UI module imported against a real DOM, primary door driven by DOM events to its success state, `?state=` presets and preselects checked → 13/13.
- Headless Chrome stills of each success state at 1440px + two at 390px (attached to the PR). No headed `cursor-ide-browser` pass in this run (not in the tool catalog) — Watchdog's headed pass is the verifier step.

## Shared conventions (same across the six)

- `index.html` shell → every primary CTA lands on the door page (tested: no local href points at a missing file).
- `assets/tokens.css` = brand tokens per slug, **swap point for `VERTICALS.<slug>`** in `launch-samples/project/src/lib/tokens.ts`. **That file is not in this repo** — colours are preview placeholders; CS / Forge swap on sight of the SSOT.
- `assets/product.css` = one token-only shell, byte-identical across the six (tested: it defines no `--brand`).
- Pure state module (no clock / storage / network / `Math.random`; tested) + DOM module. Deterministic `?state=` presets for plates.
- Empty state on load · success state · friction card that mutes once the door is walked · demo controls (load example / reset).
- CapEx locks on every page: SAMPLE · CapEx · invent_kpi=0 · `noindex` · no external scripts · no payment words · no `%` claims · no `$` figures (quay / atelier / ledgerline / harbor / northline) · no email / tel / date inputs (northline).

## Hold-outs

Per-slug hold-outs live in each `GRADE.md`. Cross-cutting ones Watchdog should pick from:
- 390px on every door page: no horizontal overflow, nav wraps, hero CTAs unclipped.
- `prefers-reduced-motion`: toast still appears.
- Network panel: zero requests after load on every page.
- Compare each success still against the vertical's launch-video product beat (CS holds the refs; not in repo).

## Hard step

`GRADE: pass` on any row is not deploy / publish / wiring the live `/work` case page. Those stay Evens. Merge ≠ ship. Live `/` HOLD.

## Next (Creative Studio)

Capture ≥1920 product plates from the six success URLs above and swap the landing-only refs. Do not wait on Watchdog to start capture; do wait on Watchdog before any plate is called final.
