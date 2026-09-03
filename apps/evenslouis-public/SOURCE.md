# Source map — what serves `https://evenslouis.ca/`

**State:** 2026-09-03 · hive-os · building mode  
**Lane fact:** live `/` is a hire page. `apps/portfolio` is a stale Scorpion pitch. Neither is this walkthrough.

## Probed (this sitting)

| Probe | Result |
|---|---|
| `GET https://evenslouis.ca/` | 200 Next.js prerender · Caddy `via` · Auth.js cookies · title `evenslouis.ca` |
| Hero | badge “Available for new projects” · H1 “I build software that runs your business.” |
| Residual | services pitch + Discovery/Build/Ship + “Ready to build something?” + `contact@evenslouis.ca` |
| Proof cards on live `/` | Ironlane Studio · Ashford & Vale · Quay Team — labeled Proof / concept; hrefs `/work/ironlane-studio` etc. |
| `apps/portfolio/app/page.tsx` | STALE Scorpion / portfolio.n8ncloud.tech. Not live `/`. Do not revive. |
| Repo Caddy | lightningflow.online + n8ncloud.tech. No evenslouis.ca apex block in git. |
| GitHub `snevemoney/*` | only `n8n-cursor`. Zero hits for live hire copy. |
| VPS note in wiki | `/root/domain-paths/n8n-cursor` — path stack (Scorpion etc.), not the hire Next app. |

**Conclusion:** the Next app that actually serves live `/` is **not in this git**. Closest correct place = this folder. `public/index.html` **is** `/` for the intended HITL swap. Do not invent a second domain.

## This PR does not

- Merge to main
- Prod deploy
- SSH-write the VPS
- Flip Caddy live
- Ask Evens to HITL live `/` yet

Preview: `python3 -m http.server 4011 --bind 127.0.0.1 --directory public` → `http://127.0.0.1:4011/`
