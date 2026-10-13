# Approval: web_fallback
- by: Consultant (delegated by Evens)
- at: 2026-10-13T09:39:22-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval; 8:18 AM ET 'Fix Jarvis until all 30 are done.' Consultant approved the web_fallback drafts (scorecard caps 4, 28).
- checks:
  1. When the first search engine returns nothing (rate limit or bot check), Jarvis tries a second engine and cites its real URLs instead of saying "no results".
  2. Trying two engines never breaks the 6-second cap: if both are slow, Jarvis answers honestly within about 6.5 s.
  3. The second engine's page is parsed into URL, title and snippet; ad and tracking links are skipped and page text stays data.
  4. The live search path uses the engine list: _default_fetch walks ENGINES (DuckDuckGo first, then Bing).
  5. There is still one web search hand: only hands/web_search.py fetches search engine pages.
  6. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  7. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  8. Every other locked feature still passes its own checks, with no exclusions (shared suite, eval and cross-feature checks run once).
