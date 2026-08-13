# Watch Later learnings → hive

**Date:** 2026-08-13  
**Source:** Researcher native-browser scrape of `playlist?list=WL` (signed out)  
**Label:** FACT (auth miss) / pending (queue contents)

## Implemented this pass

1. **First-class type `watchlater`** — same full-read protocol as X bookmarks (ledger + batches).
2. **Signed-out is a blocker, not an empty list** — CLI keeps `items: []` and refuses to invent titles.
3. **Acquire order** — already-open YouTube tab → confirm renderers > 0 → scroll → JSON → Researcher CLI.

## Still blocked

Operator-logged Watch Later rows. Re-run on Grok computer / local Chrome where `ytd-playlist-video-renderer` count > 0, then:

```bash
python3 scripts/hive/researcher-research-implement.py watchlater --from-json PATH --write --mirror-repo
```

## Don'ts

- Don't treat cloud Chrome as the operator's Google session.
- Don't substitute Gmail YouTube memberships, live alerts, or the ~827-sub interest graph for Watch Later.
