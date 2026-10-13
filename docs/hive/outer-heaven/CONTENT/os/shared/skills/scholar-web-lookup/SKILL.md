---
name: Scholar web lookup
description: >-
  Use when Researcher needs paper/DOI context — WebSearch/WebFetch first;
  Semantic Scholar MCP is BLOCKED until operator connects one.
---
# Scholar web lookup

**Owner:** Researcher
**Lane:** hive OS / research

## Stack
| Path | Status |
|---|---|
| WebSearch + WebFetch + claim-verifier | **PROVE / WORKAROUND** — default |
| Semantic Scholar / arXiv MCP from awesome lists | **BLOCKED** — it would work if we had an approved scholar MCP connected |
| Zotero/NotebookLM MCP stacks | **BLOCKED** — would work if operator wants a citation vault MCP; Outer Heaven wiki-ingest is workaround |

## Steps
1. Search title/DOI/arXiv id via web tools.
2. Label FACT vs abstract-marketing.
3. File into research packet; do not auto-install scholar MCPs from awesome lists.
4. If volume academic work becomes weekly, propose one connector via awesome-skill-import-gate + HITL.

## Never
- Install Zotero+Obsidian+NotebookLM triple stack unprompted
- Quote paper metrics as business ROI FACT

## Tools
| Need | Path |
|---|---|
| Scholar/web | WebSearch/WebFetch — **PROVE** |

## Prompts
**Paper card**
```
Query:
Title · year · DOI/URL · claim relevant · bucket
```
