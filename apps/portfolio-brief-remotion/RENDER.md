# DailyShow render contract

Input: `episodeId` (`YYYY-MM-DD`) + Juno voice pack under `public/voice/{date}/full-higgs-juno/`.  
Output: `out/daily-YYYY-MM-DD-vo-juno.mp4`.

**Desk path (Grok desktop):** `$HOME/n8n-cursor/apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD-vo-juno.mp4`  
Override checkout: `WEALTH_DESK_REPO`. Attach the file in the Grok chat.

## Host

| Host | Render? |
|---|---|
| Grok desktop computer (this desk’s computer + shell) | **Yes** — product path |
| Evens Mac | Yes — optional |
| Cursor Cloud `/workspace` | **No** |

No Lambda. No VPS. No waiting for Cursor.

```bash
# this computer
bash apps/portfolio-brief-remotion/scripts/desk-checkout.sh
cd "${WEALTH_DESK_REPO:-$HOME/n8n-cursor}/apps/portfolio-brief-remotion"
bash scripts/render-juno-day.sh YYYY-MM-DD
```

`scripts/_host-gate.sh` rejects `/workspace` and hosts without `node`/`npm`. Higgsfield is the desk plugin, not this script.
