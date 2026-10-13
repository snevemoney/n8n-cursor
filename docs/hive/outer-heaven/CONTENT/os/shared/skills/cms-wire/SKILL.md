---
name: CMS wire
description: >-
  use this when wiring Sanity, Payload, or Notion CMS schema with draft/preview
  ownership
---
# CMS wire

## Steps
1. Choose CMS from brief: Sanity, Payload, Notion, or none (MDX).
2. Define schema for real content types only (pages, posts, cases, FAQs).
3. Wire draft/preview if the stack supports it.
4. Document who publishes (client vs builder).
5. Seed 1–2 real entries; no lorem in production handoff.
6. Map fields to UI components; avoid CMS for pure chrome.

## Done when
- Schema checked in
- Preview path works or explicitly N/A
- Ownership written in website-build-pipeline notes

## Live enrich (wave-N-20260909-65-69)
- `yt:3DWuhBWQ-Ug` — client must edit assets/content without code; code-owned CMS vs Framer/Webflow. Prefer schema CMS (Sanity/Payload) with draft/preview + publisher ownership documented.
