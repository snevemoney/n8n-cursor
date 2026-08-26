# X bookmarks → Shared Memory Plane

Grok agents cannot hold X user OAuth. Cursor `user-X` with bearer/app-only cannot call bookmarks.

## Pattern (same as Cursor chats)

1. **Mac** runs `~/.grokbot/scripts/x-bookmarks-sync.sh` (xurl + OAuth2 user token in `~/.xurl`).
2. Writes `~/.grokbot/x-bookmarks.json` + `CONTENT/x-bookmarks/latest.{json,md}`.
3. **Researcher / Librarian** read that file (ExternalRead / outer-heaven-brief) — never live API every turn.
4. Optional: launchd every few hours while Mac is awake.

## One-time auth (operator)

```bash
# install xurl from https://github.com/xdevplatform/xurl
xurl auth apps add snevemoney --client-id YOUR_CLIENT_ID
xurl auth oauth2 --app snevemoney snevemoney
~/.grokbot/scripts/x-bookmarks-sync.sh --max 100
```

Portal scopes: `bookmark.read` `tweet.read` `users.read` `offline.access`.
Redirect URI must match xurl (default `http://localhost:8080/callback`).

## launchd (optional)

Copy plist from `com.grokbot.x-bookmarks-sync.plist.example` into `~/Library/LaunchAgents/` and `launchctl load` it.

## Hive consumers

- Researcher: dossier / brief Big Boss + Librarian when file changes
- After a true-read: **§2b/2c** — merge into the **one** master [../watch-later/STEAL_SHEET.md](../watch-later/STEAL_SHEET.md) + [../watch-later/DEEP_SUMMARIES.md](../watch-later/DEEP_SUMMARIES.md) (clusters, tag `x:{id}`). Do not create `x-bookmarks/STEAL_SHEET.md`.
- Librarian: canonize themes into Outer Heaven
- Handle: `@snevemoney`

**2026-08-13 ingest (additive):** [ingest-20260813.md](./ingest-20260813.md) — do not overwrite dossier.md. Working set now **42** AI (true-read), library 98. AI-only JSON cut is **34**.
