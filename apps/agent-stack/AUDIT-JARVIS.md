# AUDIT-JARVIS

**When:** 2026-09-04  
**Lane:** hive-os  
**Audited HEAD:** `cursor/jarvis-converse-no-ask-4282` @ `502d68565` (PR #179)  
**This branch:** `cursor/jarvis-contract-audit-4282` stacked on that HEAD  
**Method:** DISCOVER → TRACE. Read the live files. Did not assume missing. Did not scoop hive/desk dirt.

Owner locks used: Safari on `http://127.0.0.1:4018/` · conversation first · ASK only for send/pay/deploy/book/publish · face/mic/TTS local · brain online Grok · no Ollama as product · no Chrome advice · #178 English Daniel / repo Tarquin if key exists · Cursor is a worker.

Sources of truth checked:

| Source | Present? | Used by 4018 loop? |
|---|---|---|
| FiOTrxq9ckM packet + LEARNED + DESIGN-FACE | yes | face pixels / wake-word only |
| github.com/jaredrhod/fullstack-agent | pattern, not cloned | bus phases only |
| `apps/agent-stack/` | yes | **this is the product** |
| vault + `.hive/agent-stack.json` + `.hive/bus/state.json` | yes | retrieve + bus write |
| `scripts/hive/grok-skills/` | yes | skill list / load by keyword only |
| serve-desk `127.0.0.1:4017` | yes | **not** on the 4018 path |
| `scripts/hive/os/agent-stack.py` | yes | adopt twin, not the talk loop |
| AGENTS.md / CONTRACT.md / PATHS.yaml / PROCESSES.yaml | **not in this package** | — |
| capability defs `CONTENT/knowledge/capabilities/` | yes | tape SKUs, **not** Jarvis runtime |

Sibling PRs (do not scoop; stack cleanly):

| PR | Branch | Role |
|---|---|---|
| #174 | `jarvis-visualizer-from-tape-4282` | PCB face |
| #175 | `jarvis-hear-talk-4282` | mic / SR |
| #176 | `jarvis-wired-online-4282` | Grok / hive / VPS wires |
| #177 | `jarvis-local-brain-4282` | Ollama local brain — **not product** |
| #178 | `jarvis-voice-from-repo-4282` | English Daniel / Tarquin TTS |
| #179 | `jarvis-converse-no-ask-4282` | converse default, kill every-turn ASK |

---

## 1. Actual runtime path: user input → Jarvis response

One loop. Face is the product. Mouth is the write path.

```
Safari (or type fallback) on http://127.0.0.1:4018/
  pane.html
    tap board / Space → getUserMedia + webkitSpeechRecognition (en-US)
      OR "/" then Enter on #typed
    handleHeard() strips optional "Jarvis"
    POST /api/turn { utterance, approved }
  face/serve.py Handler.do_POST
    MOUTH.apply_turn(utterance, hive=.hive, speak=False)
  mouth/turn.py
    classify() → idle | refuse | hello | skills | skill | status | converse
    converse: retrieve.py keyword search → brain/online.py think()
      Grok xAI if XAI_API_KEY/GROK_API_KEY else Grok Bot gateway
    bus_write(.hive/bus/state.json) phase=speak, last utterance + spoken
  JSON { spoken, ask:false, wires, cites }
  pane.html speak() via window.speechSynthesis
```

CLI twin (same function): `python3 apps/agent-stack/mouth/turn.py "…"`.

Not on this path: serve-desk 4017, observe-pane product UI, `voice-os.py`, `mouth/brain.py` Ollama (#177), Grok desk `jobs.jsonl`, Cursor agent spawn, Claude Code.

---

## 2. Every prompt involved

| Where | Prompt | When it runs |
|---|---|---|
| `brain/online.py` `SYS` | "You are Jarvis for Evens Louis. Face and mic stay on the 8GB Mac. You are the online brain. Answer from the live facts and vault snippets. Vault is one memory among live state, not the whole OS. Hard steps stay Evens. Never invent Claude, ChatGPT, Gemini, or Ollama. If a wire is missing, say UNKNOWN and name it. Speak short." | Every `call_xai()` |
| `brain/online.py` `call_xai` user | current utterance + optional `Live context:` blob (vault snippets only) | Grok xAI |
| `brain/online.py` `call_grokbot` | same utterance + context, posted to `/api/sendPrompt` as a **new** prompt | fallback if no xAI key |
| `mouth/turn.py` canned | "Holding. Say Jarvis, or tap Space." / "Online. Face is local. Brain calls Grok…" / "Hive skills: …" / "Loaded {slug}." / "I will not do that…" / "Okay, cancelled." / `DARK_GROK` | hello / idle / skill / refuse / cancel / dark Grok — **bypasses the model** |
| `pane.html` greet | "Hello {operator}, what are we working on today?" | first wake-word only, client-side, no brain |
| #177 `mouth/brain.py` `_prompt` | "You are Jarvis, Evens's local vault assistant. Answer ONLY from the snippets…" | **not on this HEAD** (file absent here) |

There is **no** multi-turn `messages[]` history. `call_xai` always sends `[system, user]` for this one sentence.

---

## 3. Every memory / context source

| Source | How it reaches the model | Status |
|---|---|---|
| `.hive/bus/state.json` `utterance` + `spoken` | overwritten every turn; **not** sent back to Grok | written, unused as context |
| Conversation history | none | **NOT CONNECTED** |
| `memory/retrieve.py` allowlist | keyword tokens → up to 3 snippets stuffed into `Live context` | PARTIAL |
| `OPERATOR_MEMORY.md` / `NORTH_STAR.md` / hot files | only if query tokens hit (STOP list drops `that` / `this` / `who`) | PARTIAL |
| Identity expand | `who am i` → evens/operator/louis | only those regexes |
| `.hive/agent-stack.json` `operator: Evens` | pane greet + HUD; **not** in Grok context | PARTIAL |
| Live vault `My_Billion_Dollar_Vault` | retrieve fallback after repo miss | PARTIAL |
| Repo `docs/hive/outer-heaven` | retrieve first | PARTIAL |
| `CONTENT/os/jobs.json` / hive `state.json` | `observe_jobs()` for `/api/jobs` only | not in talk |
| `scripts/hive/hive-state.py last_run` | status verb only | keyword-gated |
| Hive golden-paths / Scorpion / Pro health | status verb only | keyword-gated |
| VPS SSH `root@69.62.66.78` | status verb only | keyword-gated |
| Cursor CLI `--version` | status verb only | keyword-gated |
| CURSOR_CHATS / hive/desk / ChatGPT `.data` | blocked by retrieve | correctly parked |
| serve-desk 4017 wiki | not imported | **NOT CONNECTED** |

`bus/schema.ts` has no `history` field. `permission_ask` leftover from the ASK era is still on the bus but #179 always writes `null`.

---

## 4. Model / provider called

| Wire | Function | Model | When |
|---|---|---|---|
| xAI | `call_xai` → `https://api.x.ai/v1/chat/completions` | `GROK_MODEL` or `grok-4` | `XAI_API_KEY` or `GROK_API_KEY` set |
| Grok Bot | `listAgents` + `sendPrompt` | Big Boss / Jarvis / first listed | no xAI key; often **no spoken reply** |
| Ollama `127.0.0.1:11434` | #177 `mouth/brain.py` | llama3.2:* | **refused on this HEAD** (`wire_report.ollama = "refused"`) |
| macOS `say -v Samantha` | `speak_local` | Samantha | CLI `--speak` only, not the face |
| `speechSynthesis` | `pane.html` `speak()` | **browser default** on this HEAD | face TTS. #178 picks Daniel / en-GB; **not merged here** |

Missing key → spoken `I can't reach Grok (missing XAI_API_KEY or GROK_API_KEY).` Vault extractive is a fallback only when Grok is dark **and** retrieve hit.

---

## 5. Agent / orchestration path

There is **no** multi-agent orchestrator on the talk loop.

`classify()` is a **keyword tree**, then one function:

| Verb | Host | Orchestration |
|---|---|---|
| converse | online | retrieve + one Grok call |
| status | online | `ONLINE.status()` hive/VPS/Cursor — **skips Grok** |
| hello / idle / skill / skills | local | canned string — **skips Grok** |
| refuse | local | canned hard-step line — **skips Grok** |
| cancel | local | leftover ASK yes/no |

Hive desks (Forge / Watchdog / Researcher / …) are **not** called. Grok Bot `sendPrompt` to "Big Boss" is a fallback wire, not a desk handoff. Hands stay parked. `jobs.jsonl` is not the converse path (#179).

---

## 6. Tool path

| Tool | Connected to talk? |
|---|---|
| `POST /api/turn` | yes — the brain door |
| `POST /api/listen` | yes — bus phase listen/idle |
| `GET /api/bus` | yes — HUD poll |
| `GET /api/wires` | yes on this HEAD — grok live/dark |
| `GET /api/stack` | yes — operator name for greet |
| `GET /api/jobs` | yes, unused by the PCB HUD |
| `GET /healthz` | yes |
| #178 `POST /api/tts` Tarquin | **not on this HEAD** |
| Grok tools / function calling | **none** |
| Cursor agent spawn | refused in `call_cursor` spoken line |
| Hostinger / Gmail / Stripe / browser | **none** from the face |
| n8n / Scorpion APIs | status HTTP only |

Hands parked is real, not a slogan. Do not add tools while 1–4 are broken.

---

## 7. CONNECTED table

| Piece | Grade | Evidence |
|---|---|---|
| PCB face on 4018 | **CONNECTED** | `serve.py` GET `/` → `pane.html` canvas HUD |
| Mic / hear (Safari) | **CONNECTED** | `webkitSpeechRecognition` + `getUserMedia`; owner: Safari hears |
| Type fallback | **CONNECTED** | `#typed` + Enter |
| Local TTS | **PARTIALLY CONNECTED** | `speechSynthesis` works in Safari; this HEAD uses default voice (French/Samantha risk). Daniel picker lives on #178 only. CLI `say` is Samantha. |
| Online Grok brain | **PARTIALLY CONNECTED** | xAI is called on `converse` only; single-turn; hello/status/refuse/skill never call it |
| Grok Bot fallback | **PARTIALLY CONNECTED** | sendPrompt often returns UNKNOWN (no spoken reply) |
| Vault retrieve | **PARTIALLY CONNECTED** | keyword allowlist; not session memory; `that` is a STOP word |
| Identity | **PARTIALLY CONNECTED** | one SYS sentence + greet "Evens"; OPERATOR_MEMORY not loaded every turn |
| Conversational context | **NOT CONNECTED** | no history array; bus last-line overwrite |
| Hard-step ASK | **PARTIALLY CONNECTED** | #179 killed desk ASK; `HARD_REFUSE` is a word list so "send me a joke" / "pay attention" refuse |
| Every-turn desk ASK | **NOT CONNECTED** (killed) | correct on this HEAD |
| Ollama product brain | **NOT CONNECTED** here; **CONNECTED** on #177 | owner: do not merge #177 |
| Status wires (hive/VPS/Cursor) | **PARTIALLY CONNECTED** | live when `STATUS_RE` hits; steals ordinary talk |
| Hive desks / 4017 | **NOT CONNECTED** to 4018 talk | correct |
| Hands / mouse | **CONNECTED** parked | correct |
| Observe/Mouth chrome | **NOT CONNECTED** as product | tests ban those cards |

---

## 8. Duplicated systems

1. **Two brains:** #176 `brain/online.py` (Grok) vs #177 `mouth/brain.py` (Ollama). This HEAD uses online only. Do not merge both.
2. **Two faces:** `apps/agent-stack/face` (product) vs leftover `voice-os.py` on 4018 vs serve-desk 4017. Skill says kill voice-os, do not bring it back.
3. **Two TTS:** pane `speechSynthesis` vs CLI `say -v Samantha` vs #178 `/api/tts` Tarquin.
4. **Two memory stories:** retrieve extractive fallback vs Grok-with-snippets. Dark Grok speaks a vault cite as if it were Jarvis.
5. **Two adopt twins:** `apps/agent-stack/wizard/adopt.ts` and `scripts/hive/os/agent-stack.py`. Same bus files.
6. **Two ASK leftovers:** `permission_ask` on the bus + pane `state.pending` / `YES_RE` still replay a prior utterance.
7. **Observe jobs** still assembled in `serve.py` even though the HUD is the tape PCB.

---

## 9. Bypassed systems

| Built | Bypassed by |
|---|---|
| Grok (the product brain) | `HELLO_RE`, `STATUS_RE`, `SKILL_RE`, `HARD_REFUSE`, empty/yes/no → idle |
| Conversation memory | bus overwrite; xAI messages have no prior turns |
| Operator identity files | retrieve only on token hit; casual talk gets none |
| #178 Daniel / Tarquin | this HEAD never imported the picker |
| Owner Safari | pane + tests + DESIGN-FACE still say "Use Chrome" |
| Vault as extra context | keyword miss → empty context, so Grok has no Evens |
| Hard-step HITL (ASK) | replaced by blanket refuse on the words send/pay/deploy/book/publish/dial/… |
| Grok Bot as spoken brain | sendPrompt does not return speech; xAI is the real wire |

---

## 10. Why it feels unintelligent

Not because the face is wrong. The PCB and mic are the tape. The talk loop is a classifier plus a goldfish.

1. **No memory of the last sentence.** "Tell me a joke" then "that was bad" cannot resolve `that`. History is not a prompt.
2. **Keyword trees eat ordinary English.** `send me a joke` refuses. `what's up with the hive` dumps golden-paths/SSH. `hey` never reaches Grok. `yes` with no pending ASK says "Holding. Say Jarvis."
3. **Identity is a sticker.** SYS says "Jarvis for Evens Louis" but the model is not given who Evens is, the north stars, or the current project unless the sentence happens to contain boosted tokens.
4. **Vault retrieval is bag-of-words.** STOP drops the words a follow-up needs. Casual talk retrieves nothing or a random hot-file snippet.
5. **Canned lines sound like a kiosk.** Hello / skills / refuse / holding are scripted. That is the opposite of conversation-first.
6. **Chrome scolding.** Owner uses Safari and already hears. The HUD tells him to switch browsers. That reads as "this product is not for you."
7. **Default TTS** on this HEAD can come out French/Samantha. He locked English Daniel on #178.
8. **#177 Ollama path** (if someone merges it) answers vault extracts instead of talking. Owner: 8GB Mac, brain online.

---

## 11. Code added without a requirement

| Extra | Where | Owner said |
|---|---|---|
| Observe / Mouth two-card chrome | earlier sittings; **rejected**; tests ban it | tape PCB only |
| Every-turn "say yes to send to Grok desk" | #176 classify `desk`/`needs_ask` | killed in #179; do not bring back |
| Ollama as product brain | #177 `mouth/brain.py` | do not merge |
| "Use Chrome" / "Safari speech is flaky" | `pane.html`, `serve.py` self-test, `test_serve.py`, `DESIGN-FACE.md` | Safari; never tell him to switch |
| `say -v Samantha` | `turn.py` `speak_local` | #178 Daniel |
| Broad `HARD_REFUSE` word list | `turn.py` | ASK only on real hard steps, not the word "send" |
| Canned hello / idle / skills | `turn.py` | conversation first |
| `permission_ask` replay | `turn.py` + pane `pending` | leftover from desk ASK |
| Status keyword steal | `STATUS_RE` | status is a wire, not a conversation interceptor |
| Observe jobs API on the face server | `serve.py` `observe_jobs` | not the product UI |

---

## 12. Minimum sequence of changes

Do **not** jump to delegation, tools, or proactive. Fix 1–4 only. Smallest reuse of this HEAD.

1. **Natural conversation (`turn.py`)**  
   Default almost everything to `converse` → Grok. Keep refuse only for real hard-step intent (send this email / pay / deploy / book / publish as actions), not the bare words. Route `hey` / `yes` / `that` / jokes through Grok. Do not ASK to send to a desk.
2. **Conversational context (`turn.py` + bus)**  
   Keep last N (utterance, spoken) turns on the bus. Prepend them into the existing `context` string that `call_xai` already accepts. No new orchestrator. No parallel memory store.
3. **Relevant memory (`turn.py` + existing `retrieve.py`)**  
   Attach vault snippets only when they actually score. Stop treating extractive cite as the spoken product when Grok is live. Do not scoop desk/chats.
4. **Identity (`turn.py`)**  
   Every converse turn, attach a short identity block: Jarvis · operator Evens Louis from `agent-stack.json` + north-star lines from `OPERATOR_MEMORY.md` (already on the retrieve allowlist). Not a second vault.
5. **Safari + #178 voice (`pane.html`, tests as required)**  
   Delete every "Use Chrome" string. Keep type fallback. Keep `webkitSpeechRecognition`. Import Daniel / en-GB picker from #178 (not Tarquin cloud unless key already wired). Hard-refresh note only.
6. **Stop**  
   No tools, no desk spawn, no Ollama, no Observe chrome, no PATHS.yaml invention, no hive/desk scoop.

Done-check for this sitting: casual / joke / follow-up "that" / project / correction through `python3 turn.py` or `POST /api/turn` using the real `apply_turn`. Safari hard-refresh after pane change.

---

## What this sitting will patch (after this file commits)

`mouth/turn.py` · `face/pane.html` · `face/serve.py` / tests **only as required** for 1–4 + Safari. Then verify through the real runtime.
