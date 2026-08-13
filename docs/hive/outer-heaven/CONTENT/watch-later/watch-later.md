# YouTube Watch Later scrape

**URL:** https://www.youtube.com/playlist?list=WL
**Logged in:** True
**Items:** 4
**Scraped:** 2026-08-13T18:41:00+00:00
**Source:** docs/hive/outer-heaven/CONTENT/watch-later/first-screen.json

## Notes

- Operator selected ytd-item-section-renderer on the logged-in Watch Later preview (page-subtype=playlist).
- UI: French, YouTube Premium CA, owner Snevemoney, claimed 1802 videos, unavailable videos hidden.
- Sort: Date d'ajout (plus récentes). Item 1 marked En cours de lecture.
- Selected node bounds height 13004px — list is loaded well beyond the first viewport; visible_text from the selection was truncated in-chat.
- Cloud VM Chrome and Playwright MCP are a different signed-out session (blank WL). This scrape uses the operator preview node + oembed-verified IDs for the first-screen rows only.
- Do not treat 4 items as the full 1802.

| # | Title | Channel | Duration | URL |
|---|-------|---------|----------|-----|
| 1 | 4 AI Agents To Automate 99% Of Your Life | Sandeep Swadia | 20:47 | https://www.youtube.com/watch?v=TL8V41Ea6oM |
| 2 | Andrej Karpathy Just 10x'd Everyone's Claude Code | Nate Herk \| AI Automation | 17:47 | https://www.youtube.com/watch?v=sboNwYmH3AY |
| 3 | Andrej Karpathy just changed how he prompts claude... (INSANE RESULTS!) | Dream Labs AI | 14:12 | https://www.youtube.com/watch?v=eMPWBunaOic |
| 4 | Skill Issue: Andrej Karpathy on Code Agents, AutoResearch, and the Loopy Era of AI | No Priors: AI, Machine Learning, Tech, & Startups |  | https://www.youtube.com/watch?v=kwSVtQ7dziU |
