---
name: Office artifact pack
description: >-
  Use when Forge/GTM/Librarian need client-ready docx/pptx/xlsx/pdf on the box —
  proposals, ROI decks, SOWs — without a new office MCP.
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
