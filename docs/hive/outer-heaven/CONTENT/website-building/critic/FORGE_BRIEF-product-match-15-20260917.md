# Forge brief — product-match CapEx for remaining 15 /work verticals (2026-09-17)

**From:** Creative Studio (operator ask)  
**To:** Forge  
**Pattern:** Same as Ironlane product-match (PR 323 / `:4842` slice) — **build CapEx product stages that match the launch-video story**, not landing-only. Then CS captures ≥1920 plates and swaps refs.

**Locks:** CapEx / preview only · **live `/` HOLD** · invent_kpi=0 · stop at critic · **no self-PASS** · no Remotion/video edits · no deploy

## Operator wording
> Tell forge to go through the same process on the 15 too.

Ironlane precedent: video story showed booking/calendar; product was landing-only → Forge built book/calendar/check CapEx stage → CS swapped product plates. **Repeat per vertical.**

## Parallel lane
Creative Studio is remaking the 15 launch videos (Commas bar · dual 9:16+16:9). Forge owns **product CapEx stages**. Do not wait on final video renders — use tokens + promises below + Ironlane slice as structural template.

## Template to clone
`docs/hive/outer-heaven/CONTENT/website-building/ironlane-product/` (PR #323)  
Per vertical: `…/website-building/<slug>-product/` with `serve.sh` on a free localhost port, amber/token shell, **working door** for the story’s primary CTA, empty vs success states, optional friction contrast, tests, GRADE UNFILLED.

## Per-vertical product surfaces (match story, keep brand shell)

| slug | name | Primary product to build (CapEx) | Friction / contrast | Door |
|---|---|---|---|---|
| ashford | Ashford & Vale | Private apply → qualify flow (not public Book) | Intake noise / loud Book | HOLD |
| quay | Quay Team | Request showing → approve → calendar | Cold calls / phone tag | DEMO |
| atelier | Atelier Cohort | Request a seat / cohort waitlist (not funnel opt-in) | Funnel spam | HOLD |
| ledgerline | Ledgerline | Demo book · 10s product clarity UI | Feature fog | DEMO |
| harbor | Harbor & Co. | Job request → calendar visit book | Phone tag | DEMO |
| northline | Northline Clinic | Private book + form SLA | Waitlist chaos | HOLD |
| outer-heaven | Outer Heaven | Factory / ops proof walkthrough (not “I do AI”) | Agency talk | HOLD |
| sketchbook | Sketchbook | Desk-book page-turn site interaction | Template sameness | HOLD |
| betawise-earth | Betawise Earth | Owned WebGL / motion flex stage (not stock) | Stock motion | HOLD |
| field-manuals | Field Manuals | Tactile manual open / held-docs UI | Flat PDF dumps | HOLD |
| working-volumes | Working Volumes | Shelf pull-a-volume interaction | Dead shelves | HOLD |
| autoflow | Autoflow | Visual-editor idea screens (**cite-only · NOT finance**) | Name collision | HOLD |
| proofcheck-qc | ProofCheck QC | Sources → Verify Now → voice-kept draft gate | Voice washout | DEMO |
| clearfield | Clearfield | Claims/evidence workbench (**no truth adjudicate**) | Noise flood | HOLD |
| business | Evens Louis | Soft /work proofs door (building mode · not pitch deck) | Agency fog | HOLD |

Tokens SSOT: `launch-samples/project/src/lib/tokens.ts` (`VERTICALS.*`)

## Done when (each vertical or batched PRs OK)
1. CapEx preview slice runnable (`serve.sh` + tests) with working primary door states
2. Critic packet filed under this folder `critic/<slug>/` or one batch `critic/BATCH.md` — GRADE UNFILLED
3. Ping Creative Studio — CS will capture ≥1920 product plates and replace landing-only refs
4. live `/work` case-page wiring stays **separate HITL** (same gap note as Ironlane)

## Out of scope
- Changing Remotion / launch videos
- Live `/` publish · invent KPIs · paid seats
- Ironlane redo (already product-matched)

## Priority suggestion
Book-path twins first (quay · harbor · northline · ashford · atelier · ledgerline), then tools (proofcheck · clearfield · autoflow), then craft shelves (sketchbook · field-manuals · working-volumes · betawise · outer-heaven · business).
