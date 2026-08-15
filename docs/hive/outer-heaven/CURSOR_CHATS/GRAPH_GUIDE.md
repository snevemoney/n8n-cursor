# Cursor chats — graph guide

Obsidian **Graph View** draws edges only from `[[wikilinks]]`. Chat notes get wikilinks automatically from `link-cursor-chats.py` after export.

## Lanes

| Lane | Links to | Meaning |
|------|----------|---------|
| **Hive** | `PROJECTS/*` + `THEMES/*` | Monorepo, CE, Scorpion, n8n, OpenClaw work |
| **Personal / creative** | `THEMES/creative-personal` (+ sub-themes) | Games, After Effects, Mac fixes — **not** hive PROJECTS |

## How to explore

1. Open **Graph View** → disable **Orphans** temporarily to see new edges.
2. Filter frontmatter tags: `#hive` or `#theme/creative`.
3. Open a hub (e.g. `THEMES/hive-mind.md`) → **Local graph** to see one cluster.
4. Open a project (e.g. `PROJECTS/n8n-cursor.md`) → **Cursor chat links** lists backlinks.

## Hub vs project

- **PROJECT** = GitHub repo / money lane (registry-backed).
- **THEME** = keyword cluster across chats (may span repos or personal work).

## Re-run linking

```bash
python3 scripts/hive/outer-heaven/link-cursor-chats.py
node scripts/hive/obsidian/build-graph-index.mjs
```

Capture cycle runs the linker every 15 minutes via `run-capture-cycle.sh`.
