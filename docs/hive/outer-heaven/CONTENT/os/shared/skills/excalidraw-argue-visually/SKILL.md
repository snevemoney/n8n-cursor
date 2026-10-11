---
name: excalidraw-argue-visually
description: >-
  Use when asked for an architecture, workflow, data-flow or explainer diagram
  (for docs, a YouTube script, a PDF) that should be an editable Excalidraw file
  and not a blocky box dump. Layout carries the argument. Anti-triggers: pixel-perfect
  brand illustration; charts of numbers (use a charting tool).
---
# Diagrams that argue visually

Source: yt:m3fqyXZ4k4I (Cole Medin, "Build BEAUTIFUL Diagrams with Claude Code"), studied 2026-10-10. His repo `coleam00/excalidraw-diagram-skill` has **no licence**, so it is read-only and nothing was copied. This recipe is our own.

## Steps
1. Write the claim the diagram must prove in one sentence ("signals become skills only after a recreation").
2. Choose the structure that proves it. Left-to-right flow for process, lanes for ownership, nesting for containment, and one accent colour for the single thing the viewer must notice.
3. Strip test: delete every explanatory sentence. If the structure plus short labels still explains the idea, keep it; otherwise restructure. Don't add more text.
4. Write a small spec (lanes, nodes, edges, accent) and run `python3 spec_to_excalidraw.py spec.json out.excalidraw`. Arrows are bound to their boxes, so they stay attached when someone edits.
5. Use one palette, either the brand palette or the default `node` light blue plus a red `accent`, and keep it consistent.
6. Open it in excalidraw.com or the VS Code extension and iterate on the spec, not by hand-dragging.

## Proof
Packet signals-2mo-backlog-20261010/recreations/excalidraw.proof.json (valid JSON with bound arrows). A visual render was not done because renders are off-limits under box limits. Check it by opening the file.

## Corroboration
Codex can draw diagrams inline for architecture, data-flow, dependency or incident-reconstruction reviews (x:2094122811144933426, x:2094089507444298173). Same use cases; this skill gives an editable file instead of a chat image.
