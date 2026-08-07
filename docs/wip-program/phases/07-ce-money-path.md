# Phase 7 — CE full money path

**Macro:** Private money OS path is complete for solo operator use.

**Refs:** `docs/patches/client-engine/HIVE_API.md`, `https://evenslouis.ca/pro`, `client-engine` repo, OpenClaw `#crm` (1651) / `#business` (417), `packages/shared-config/src/repo-registry.ts`

**Anti-overlap:** CE proofs/deliverables ≠ ProofCheck QC product (`proof-qc-assist`).

**Exit:** One deal walked lead→close without SQL hand-edits.

## Micro-tasks

- [ ] Lead create/qualify UX verified in `/pro`
- [ ] Build/job linkage from lead
- [ ] Proof/deliverable attachment flow (CE proofs only — not ProofCheck)
- [ ] Invoice / deliverable closeout path works
- [ ] Worker queue depth visible in `/pro`
- [ ] Dead-letter / retry visibility for CE workers
- [ ] Agent-originated notes appear on deal timeline (`source=openclaw|n8n`)
- [ ] Builder happy-path publish under HITL (one site)
- [ ] CE postgres backup job + restore drill
- [ ] Resource caps revalidated after Scorpion image deploy (Phase 3)
- [ ] CRM topic `#crm` (1651) Ocelot path smoke
- [ ] Business topic `#business` (417) path smoke
