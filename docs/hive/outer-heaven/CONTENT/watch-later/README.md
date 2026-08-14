# Watch Later (Researcher)

Private YouTube queue for @snevemoney. Refresh with:

```bash
python3 scripts/hive/scrape-youtube-watch-later.py --from-json PATH --write-dir docs/hive/outer-heaven/CONTENT/watch-later
python3 scripts/hive/researcher-research-implement.py watchlater --from-json PATH --write --mirror-repo
```

Signed-out scrapes must keep `items: []` — never invent videos.

After L2, Researcher **must**:
1. Append ICPs/machines to [STEAL_SHEET.md](STEAL_SHEET.md) (`steal-usecases`). Thesis-only is not done.
2. Append the **whole argument** to [DEEP_SUMMARIES.md](DEEP_SUMMARIES.md) — do not flatten a doctrine into a SKU.

Hunt catalog: `business-types.json`.  
X bookmarks use the **same** two files (tag `x:{id}`, clusters in DEEP_SUMMARIES). Do not fork a second catalog.

**Transcripts (packets, not this repo):** `~/.grokbot/research-packets/watchlater-15-20260813/transcripts/{id}/full.txt` plus the three later video packets. `full.txt` is the clean caption file. `.vtt` is timed. Overlapping auto-caption dumps (if any) sit next to it as `full.overlap.txt`.
