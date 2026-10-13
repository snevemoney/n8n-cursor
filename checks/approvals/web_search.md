# Approval: web_search
- by: Consultant (delegated by Evens)
- at: 2026-10-13T02:02:57-0400
- words: Evens at 2:01 AM ET Oct 13 delegated check approval to Consultant: 'approve each round's checks yourself and keep building'. Consultant approved the 10 web_search draft checks from 2419cf055 unchanged.
- checks:
  1. A web search answers with at least 2 distinct cited source URLs taken from the actual results, never invented ones.
  2. When search returns nothing or fails, Jarvis says it could not find sources instead of making an answer up.
  3. A search never takes longer than 6 seconds; a slow search is cut off with an honest line.
  4. Text on a web page is treated as data: instructions inside results (like ignore your rules or send an email) are never followed or spoken as commands.
  5. The search hand is read-only: one GET-style search, no posting, no forms, no logins, no keys printed.
  6. Asks like 'search the web for the latest stable Python' go to web search, not the browser mission; small talk, 'open example.com' and file reads do not.
  7. The turn log keeps metadata only for search turns: no query text, no snippets.
  8. web_search is actually wired: it is in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
  9. There is one web search path: no second ad-hoc search function elsewhere in brain/, mouth/ or hands/.
  10. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
