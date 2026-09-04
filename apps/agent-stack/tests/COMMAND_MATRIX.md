# Jarvis command matrix

One idea: **every named hand has a checkable test, or it is UNKNOWN.**

Source: `apps/agent-stack/mouth/turn.py classify()`
Product browser: Safari via hands/see.py — Playwright never drives Evens's Mac

| Verb | Triggers | Hand | Wire | Tests | Last unit | Last live |
|---|---|---|---|---|---|---|
| stop | `stop`, `never mind`, `shut up` | `stop` | mouth/turn.py local | unit / playwright | pass | UNKNOWN |
| greet | `hello`, `hey`, `hi jarvis` | `greet` | mouth/turn.py local | unit / playwright | pass | quoted `hey` → Sir. Hey Evens. What are we working on? |
| crumb | `it`, `uh`, `hmm` | `crumb` | mouth/turn.py local | unit | pass | UNKNOWN |
| refuse | `send this email`, `deploy this to prod`, `publish this now` | `refuse` | mouth/turn.py HARD_REFUSE | unit | pass | UNKNOWN |
| mode | `agent mode`, `switch to plan mode`, `put yourself in ask mode` | `mode` | mouth/turn.py local | unit | pass | UNKNOWN |
| heal | `heal yourself`, `send an agent`, `look at the logs` | `heal` | mouth/turn.py heal_spoken + memory/scars.py | unit | pass | quoted `(scar log)` → {"id": "cursor-auth-dark", "at": "2026-09-04T20:03:46Z", "symptom": "Cursor harn |
| today | `what should we do today`, `what should I work on today` | `today` | mouth/turn.py today_spoken + memory/retrieve.py | unit | pass | UNKNOWN |
| can | `what can you do`, `what are you able`, `your tools` | `can` | mouth/turn.py capabilities_spoken | unit | pass | UNKNOWN |
| skills | `list skills`, `hive skills` | `skills` | mouth/turn.py skills_spoken | unit | pass | UNKNOWN |
| life | `who am i`, `what do you know about me`, `remember me` | `life` | memory/retrieve.py life_card | unit | pass | UNKNOWN |
| files | `search my computer for ledger`, `find the file invoice`, `look through my documents` | `files` | hands/files.py search_files | unit | pass | UNKNOWN |
| safari | `go to YouTube`, `open YouTube`, `scroll`, `scroll down`, `screenshot` | `safari` | hands/see.py safari_act | unit / playwright | pass | quoted `Hi Jarvis open YouTube` → Sir. Safari, as requested. Safari: J.A.R.V.I.S.. http://127.0.0.1:4018/ |
| calendar | `what's on my calendar`, `meetings today`, `meetings tomorrow` | `calendar` | hands/inbox.py calendar_events | unit | pass | UNKNOWN |
| mail | `any unread mail`, `unread emails`, `my inbox` | `mail` | hands/inbox.py mail_unread | unit | pass | UNKNOWN |
| invoice | `what's the unpaid invoice`, `show invoices`, `create an invoice for Mike` | `invoice` | hands/inbox.py invoice_lookup | unit | pass | UNKNOWN |
| status | `what's the VPS status`, `hostinger status`, `status of the hive` | `status` | brain/online.py status | unit | pass | UNKNOWN |
| skill | `use skill hive-funnels`, `load skill checkable-stop`, `run skill slice-build` | `skill` | brain/online.py call_cursor_turn + grok-skills | unit | pass | UNKNOWN |
| build | `build a new skill for invoices`, `create a workflow`, `write a new plugin` | `build` | brain/online.py call_cursor_turn | unit | pass | UNKNOWN |
| cursor | `check my repo`, `look at the code`, `fix this bug` | `cursor` | brain/online.py call_cursor_turn | unit / playwright | pass | UNKNOWN |
| converse | `what's going on`, `tell me a joke`, `can you` | `converse` | brain/online.py call_cursor_turn | unit / playwright | pass | UNKNOWN |
| search | `search the web for rust`, `web search bitcoin`, `search for rust on the web` | `search` | hands/named.py web_search | unit | pass | UNKNOWN |
| watch_later | `watch later`, `what's on my watch later`, `watch later playlist` | `watch_later` | hands/named.py watch_later | unit | pass | UNKNOWN |
| news | `what's the news`, `hive signals`, `news today` | `news` | hands/named.py news_from_disk | unit | pass | UNKNOWN |
| make | `make an image`, `create a remotion`, `generate a video` | `make` | hands/named.py make_route | unit | pass | UNKNOWN |
| pro | `what is marketing`, `brief me on marketing`, `BUS 204` | `pro` | hands/pro.py brief | unit / playwright | pass | UNKNOWN |
| idle | `(empty)` | `idle` | mouth/turn.py local | unit | pass | UNKNOWN |
| farewell | `good night`, `goodbye`, `bye` | `farewell` | mouth/turn.py talk_spoken | unit | UNKNOWN | quoted `Good night` → Sir. As requested. Scar cursor-auth-dark already saved. After one cursor-auth-da |
| talk | `thanks`, `serious`, `what the hell are you saying` | `talk` | mouth/turn.py talk_spoken | unit | UNKNOWN | quoted `Serious` → Sir. As requested. Scar cursor-auth-dark already saved. After one cursor-auth-da |

## YouTube must-hit

Suite **fails** if any of these classify outside `safari` / `watch_later`.

- `go to YouTube` → `safari` (pass)
- `open YouTube` → `safari` (pass)
- `go on YouTube` → `safari` (pass)
- `watch later` → `watch_later` (pass)
- `what's on my watch later` → `watch_later` (pass)
- `scroll` → `safari` (pass)
- `scroll down` → `safari` (pass)
- `screenshot` → `safari` (pass)

## Playwright (face only · 4019)

Spec: `apps/agent-stack/face/e2e/command-matrix.spec.cjs`
2 passed / 0 failed (pane + SSE). DRY_TTS on 4019 only. 4018 not touched.
Playwright never opens youtube.com. Product browser stays Safari via see.py.
