# Approval: on_it
- by: Consultant (delegated by Evens)
- at: 2026-10-13T02:25:04-0400
- words: Evens at 2:01 AM ET Oct 13 delegated check approval to Consultant ('approve each round's checks yourself and keep building'), restated 2:10 AM ET ('approval stays delegated to Consultant'). Consultant approved these 9 on_it checks.
- checks:
  1. On a tool ask (a web search that takes 2 s), Jarvis says 'On it.' first, in under 1.5 s, and the final answer follows.
  2. Small talk and model-only answers get no 'On it.' line.
  3. Instant replies (say X) and refused hard steps get no 'On it.' line.
  4. Each turn log row records latency_ms and first_chunk_ms (whole ms, first <= total), plus tool_ms for tool turns.
  5. The latency log stays metadata only: no utterance, no spoken text, no 'On it.' in the row.
  6. The face's streamed turn records first_chunk_ms from the first spoken chunk it actually yielded.
  7. 'On it.' is actually wired: the turn code yields ACK_LINE before running a fixed-route or file-read tool, and the logger writes first_chunk_ms.
  8. There is one ack line: 'On it.' is defined once (ACK_LINE in brain/pipeline.py), not copied into mouth/ or face/.
  9. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
