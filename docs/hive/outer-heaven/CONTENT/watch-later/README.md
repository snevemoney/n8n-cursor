# Watch Later (Researcher)

Private YouTube queue for @snevemoney. Refresh with:

```bash
python3 scripts/hive/scrape-youtube-watch-later.py --from-json PATH --write-dir docs/hive/outer-heaven/CONTENT/watch-later
python3 scripts/hive/researcher-research-implement.py watchlater --from-json PATH --write --mirror-repo
```

Signed-out scrapes must keep `items: []` — never invent videos.
