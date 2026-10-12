# Jarvis

Project facts. Root constitution is `AGENTS.md` and `.cursor/rules/hive-engineering-rules.mdc`.

- Face: `127.0.0.1:4018` only. `GET /healthz`, `GET /widget`.
- Talk: `POST /api/turn`.
- Browser use: `POST /api/watch` family `computer.next_op` (Safari look, then tick). Not Chrome.
- Computer use: `POST /api/voice-mac` reset, then `POST /api/turn` `{partial:true, family:"voice.mac_op"}`.
- Jev is the picker (`typesafe/jev-1.13` via OpenRouter Decisions). Not the TypeSafe SDK. Not a `jev-ultrafast` install. Not the planner.
- Plates stay split. Do not merge Watch onto `voice.mac_op`.
- Proof on `:4018` does not prove `evenslouis.ca /`.
- Book, Select flight, Post, send, pay, deploy stay Evens.
- Hands detail: `apps/agent-stack/hands/AGENTS.md`.
