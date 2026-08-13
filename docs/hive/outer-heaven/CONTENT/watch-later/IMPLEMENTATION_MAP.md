# Implementation map: YouTube Watch Later

**Type:** watchlater
**Packet:** ~/.grokbot/research-packets/watchlater-youtube-watch-later-20260813/
**Skill:** scripts/hive/grok-skills/researcher-research-to-system.md
**Analyzed:** 2026-08-13

| # | Takeaway | Hive target | Agent(s) | Status |
|---|----------|-------------|----------|--------|
| 1 | Cloud/native Chrome without Google login is not the operator YouTube tab. Signed-out WL scrape = 0 items, not an empty playlist. | docs/hive/outer-heaven/OPERATOR_MEMORY.md (LESSONS + CONTENT) | Librarian | done |
| 2 | Watch Later is a first-class research type (ledger + batches + signed-out blocker). | scripts/hive/researcher-watchlater-implement.py, scrape-youtube-watch-later.py, grok-skills/researcher-research-to-system.md | Researcher | done |
| 3 | Doctrine + cookbook + scenarios: never invent WL videos; require logged-in tab. | agent-doctrine-lanes.py, grokbot-tool-cookbook.py, agent-scenarios.py, grokbot-setup-agents.py | Researcher, all 17 (doctrine inject) | done |
| 4 | Re-scrape WL from operator-logged YouTube (Grok computer / local Chrome) then `--from-json` for theme pass. | CONTENT/watch-later/latest.json | Researcher | pending (needs operator session) |

## Reprovision checklist

- [x] Edit target files in repo
- [ ] `python3 scripts/hive/build-grok-agent-routines.py --write` (when Grok gateway is up)
- [ ] `python3 scripts/hive/grokbot-setup-agents.py` (when Grok gateway is up)
- [x] Message @Librarian via OPERATOR_MEMORY LESSON + CONTENT entry
