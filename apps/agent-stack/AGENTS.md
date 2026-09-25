# Jarvis

Project facts. Root constitution is `AGENTS.md` and `.cursor/rules/hive-engineering-rules.mdc`.

- Face: `127.0.0.1:4018` only. `GET /healthz`, `GET /widget`.
- Talk: `POST /api/turn`.
- Browser use: `POST /api/watch` family `computer.next_op` (Safari look, then tick). Not Chrome.
- Computer use: `POST /api/voice-mac` reset, then `POST /api/turn` `{partial:true, family:"voice.mac_op"}`.
- Jev is the picker (`typesafe/jev-1.13` via OpenRouter Decisions) only after `scripts/hive/eng/judgment.py` allows a bounded verb: route, rank, gate, filter, score, react. Exact state is deterministic and does not call Jev: pid alive, count increased, output stopped, batch finished, artifact appeared, error code. A stall past the line starts repair without Jev. Jev is not the planner, not Jarvis's brain, not authority, not a code generator, and not a researcher. Not the TypeSafe SDK. Not a `jev-ultrafast` install.
- Plates stay split. Do not merge Watch onto `voice.mac_op`.
- Proof on `:4018` does not prove `evenslouis.ca /`.
- Book, Select flight, Post, send, pay, deploy stay Evens.
- Hands detail: `apps/agent-stack/hands/AGENTS.md`.
