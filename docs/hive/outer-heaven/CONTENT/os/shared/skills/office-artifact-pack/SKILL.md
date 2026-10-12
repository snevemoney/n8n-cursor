---
name: Office artifact pack
description: >-
  Use when Forge/GTM/Librarian need client-ready docx/pptx/xlsx/pdf on the box —
  proposals, ROI decks, SOWs — without a new office MCP.
merged_from: [esign-packet-hitl, workspace-sheets-docs-slides]
---
# Office artifact pack

**Owners:** Forge (build) · Librarian (templates) · GTM (deck content)
**Path:** **PROVE** — Python/`openpyxl`/pptx tooling + poppler on box; upload via Google Drive MCP. Tier 3 before any client send.

## Steps
1. Pick template from known-good pile (or start blank).
2. Generate artifact on box; verify openable (pdf via poppler if needed).
3. Upload to Drive; share link internally first.
4. Client send = HITL only.

## Never
- Auto-email clients
- Install random office SaaS MCP farms from awesome lists

## Enrich 2026-10-10: agent decks as HTML (`yt:JRTAtZ5iBkU` Nori, AI Engineer)
Agents lay out well in HTML/CSS, badly in canvas or pixel tools. Pattern: one `<section>` per 16:9 slide → headless Chrome → PNG per slide + PDF, with an automatic overflow check before you ship. PROVE: `html_deck.py`.

---

## Merged from `esign-packet-hitl` (2026-10-11)

- Original description: Use when GTM/Money Desk need proposal→signature — generate PDF via office pack; human sends/signs in browser. No agent auto-sign or auto-pay.
- Unique content carried: Google connector SOPs; proposal→signature human-signs flow

# E-sign packet (HITL)

**Owners:** Product GTM · Money Desk
**Path:** **WORKAROUND** — office-artifact-pack PDF + Drive + box browser DocuSign/SignWell UI.  
**BLOCKED** for auto-send API — **it would work if operator picked an e-sign vendor + Tier 3 approval**.

## Steps
1. Generate proposal/SOW PDF (office-artifact-pack).
2. Upload Drive; operator reviews.
3. Operator (or HITL Operator desk) sends/signs in vendor UI on box — agent does not sign alone.
4. File signed PDF + lane id into packet / ledger.

## Never
- Agent pays or agent signs alone
- Secrets in chat
- Skip Tier 3 on money documents


---

## Merged from `workspace-sheets-docs-slides` (2026-10-11)

- Original description: Use when Money Desk/GTM/Librarian need structured Google Sheets/Docs/Slides ops beyond Drive file dump — SOPs on connected Google connectors first.
- Unique content carried: Google connector SOPs; proposal→signature human-signs flow

# Workspace sheets / docs / slides

**Owners:** Librarian · Money Desk (sheets) · Product GTM
**Path:** **WORKAROUND/PROVE** — Google Drive + Gmail/Calendar already connected; use Drive MCP + box browser for structured edits. Full Workspace CLI MCP optional later.

## Steps
1. Prefer Drive MCP for file create/upload; open Docs/Sheets/Slides in box browser when structure matters.
2. CFO tables → Sheets; collaborative briefs → Docs; client decks → Slides or office-artifact-pack pptx then upload.
3. Never auto-share externally without HITL.
4. If weekly pain stays high, propose one Workspace-deep connector via awesome-skill-import-gate (operator yes).

## Never
- Install every Google Workspace MCP from awesome lists
- Client-facing share without HITL
