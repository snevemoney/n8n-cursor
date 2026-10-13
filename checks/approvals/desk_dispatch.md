# Approval: desk_dispatch
- by: Consultant (delegated by Evens)
- at: 2026-10-13T04:03:06-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the desk_dispatch drafts.
- checks:
  1. Asking Jarvis to hand something to a desk writes one advisory job card on the hive bus with the desk, the ask and a time.
  2. Nothing is sent anywhere: the dispatch hand has no network, shell or messaging calls, and the result says sent: false.
  3. The card quotes the desk's current ACTIVE_TASKS lock row, or says there is none.
  4. Asks like ask Jev whether..., dispatch this to the watchdog desk go to desk_dispatch; small talk, asking Cursor about code and sending email do not.
  5. Jarvis says the card is advisory and was not sent, and names the desk.
  6. desk_dispatch is wired: in the model tool list, the HANDS list, the turn code runs it with the hive path, and the Jev router knows it.
  7. There is one desk-card writer: wants_desk_dispatch is defined once and only the dispatch hand writes desk_cards.
  8. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  9. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  10. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
