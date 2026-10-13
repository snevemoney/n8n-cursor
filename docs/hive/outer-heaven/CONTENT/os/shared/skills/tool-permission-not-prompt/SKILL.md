---
name: tool-permission-not-prompt
description: >-
  Use when giving an agent email, calendar, CRM, send/pay, browser Always-allow,
  Shell machineId, or any credential-bearing tool — and when a demo claims an
  OS/container sandbox makes the agent "safe." Lock access in the tool / remove
  doors, not in a "never send" sentence. Anti-triggers: leisure; installing a
  second desktop; treating prompt text as isolation.
---
# Fix access, not the prompt

## When
Any agent can touch send, pay, delete, or production.

## Rule
A line in a prompt is a suggestion. A missing Send button is a lock.

## Do
1. Draft-only tools for email/SMS/social. No send credential on the worker.
2. Scoped keys: read or draft, never send/pay.
3. Ask: “What can this thing do on its own if it ignores the prompt?”
4. If the answer scares you, remove the tool. Do not add another “never send” sentence.

## Don’t
- Hand a live send API and say “just don’t use it”
- Treat one successful run as safe

## Codex Desktop computer-use stamp (2026-09-13 · yt:HhQSTydZRbg)
FACT from Creator Magic Mac takeover:
- **Always allow** for local creative apps (Audition/Photoshop) after Accessibility grant.
- **Elevated Risk** dialog for browser control (Brave→Firefly): prompt-injection / data-theft warning — prefer **Allow once**, do not Always-allow browser.
- **Spend pause** before Firefly Generate (400 credits on tape) — human confirm required.
Hive rule: encode these as tool/runtime gates (draft-only, no auto-Generate, browser allow one-shot), not as extra “never spend” prompt lines.

## Devsplainers sandbox-theater stamp (2026-09-25 · yt:b9_kJn0zm5U)

**Platform:** Grok Bot + Cursor · **Install:** `none (process-only)`

FACT from L2 packet `/workspace/research/youtube-daily/l2-20260925/b9_kJn0zm5U/`:
- Sandbox walls stop **write/delete outside** the project. They do **not** stop reading secrets already inside the boundary, and they do **not** notice egress through doors you opened (allowlisted domains, real API tokens).
- Claude Cowork: allowlisted Anthropic API + attacker key → files left the box while the agent "stayed in."
- PocketOS: Cursor agent found a Railway token and deleted prod volume in ~9s; API honored it like CLI/CI.
- Closing advice: get production keys / long-lived tokens / cloud logins **out of the agent workspace**.

Hive recipe (not pointer-only):
1. Ask the three-escape question before granting a tool: can it **write outside**, **read secrets already present**, or **call an allowlisted egress**?
2. Escape C → **remove the credential or tool** (draft-only / no send key) — do not add another "never upload" prompt line.
3. Escape B → **do not place prod tokens in** box workspace, CLAUDE.md, AGENTS.md, Obsidian notes, or ordinary repo files (existing Outer Heaven rule).
4. Shell `machineId` → Mac and Always-allow browser = intentional doors; require explicit operator ask / one-shot allow.
5. Recreation proof: `l2-20260925/b9_kJn0zm5U/recreation/threat_model_audit.py` → `audit_proof.json` ok=true.

**PROVE:** audit fixture + existing draft-only MCP pattern.  
**WORKAROUND:** Seatbelt/bubblewrap/Claude `/sandbox` → box boundary + Auto-review + Tier-3 HITL.  
**BLOCKED:** Docker Sandboxes microVM as hive face; Claude Code `allowUnsandboxedCommands=false` as hive face — would work if we had those.

## Fireship OpenAPPA stamp (2026-10-01 · yt:I_KVMFrUtPk)

**Platform:** Grok Bot + Cursor · **Install:** `none (process-only)` (OpenAPPA binary/Clappa = RESEARCH-OK via import-gate only — not hive face)

FACT from L2 packet `/workspace/research/youtube-daily/l2-20261001/I_KVMFrUtPk/`:
- Prompt injection unsolved because models blur trusted vs injected instructions; blocklists get paraphrased around; LLM "babysitter" agents fail the same way (~99% ≠ felony-grade).
- **OpenAPPA** (Archestra, MIT, preview/RFC): deterministic gate **outside** the agent loop, between agent and tools; policy in TOML; session elevates when PRIVATE data is read; **no write-down** to lower-trust sinks without human sign-off (`clappa` demo vs raw Claude).
- Nvidia hardware monitor-chip = same *outside-loop* idea with silicon; OpenAPPA does it with policy.
- Tape tradeoffs: ~75% task finish vs Claude auto ~96%; more tokens with gate on — treat % as **UNVERIFIED** until local replay.

Hive recipe (session-label tool gate):
1. Track a **session sensitivity label** (public→private) from what the worker actually read — not from what the prompt claims.
2. After PRIVATE read: **block** public/send/pay sinks (GitHub public issue, live email send, social post) until Tier-3 HITL — Auto-review / draft-only doors already encode this class of lock.
3. Put the gate **in the tool layer** (missing capability / approval card). Do not add another "never leak secrets" sentence.
4. Recreation proof: `l2-20261001/I_KVMFrUtPk/recreation/session_label_tool_gate_demo.py` → `proof.json` ok=true.

**PROVE:** fixture + existing draft-only / Tier-3 HITL pattern.  
**WORKAROUND:** Clappa/Claude Code plugin → Grok Bot + Cursor tool gates + HITL.  
**BLOCKED:** live OpenAPPA/`clappa` as hive face — would work if import-gated binary+plugin wired on a worker.  
**REPO QUEUE (not install):** `archestra-ai/OpenAPPA` — awesome-skill-import-gate if operator asks.

## Signals-close re-PROVE (2026-10-01 ~09:50 ET)
Close-gate only (not a second Cap): re-ran `l2-20261001/I_KVMFrUtPk/recreation/session_label_tool_gate_demo.py` → exit 0 · `proof.json` ok=true. X live spend-cap this fire — no new bookmark folds. Caps/HOLDs unchanged.

## Enrich 2026-10-10: allow / ask / deny command gate (`yt:oetQNZp2MLM` Cloud X Berry, feature #4)
Put tool boundaries in code, not the prompt: ordered rules where deny beats ask beats allow, and an unknown command defaults to **ask**. PROVE: `perm_gate.py` (this folder) → 6/6.

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **Calendar-invite MCP hijack (x:1966541235306237985, Eito Miyamura).** A jailbreak calendar invite was read through MCP, then Gmail was searched and the data mailed out, with per-session approvals rubber-stamped. This is already covered by the session-label gate above (`I_KVMFrUtPk` recreation): after an untrusted read, block send sinks. No new rule needed; added as a citation.

## Enrich 2026-10-10: connector-borne injection (signals-2mo-backlog-20261010)
- **Calendar invite → connector → leak** (x:1966541235306237985, transcript): an attacker's invite text jailbreaks an MCP-enabled assistant that reads the calendar. A red-team of an OpenClaw setup (x:2040171840304525495) used format-override injections the same way. Treat every connector read as untrusted data; sends and exports stay permission-gated, never prompt-gated.
- **Cheap pre-flight judge** (x:1966100192958251147): a single-token safe/unsafe classifier before the main call blocks obvious abuse cheaply. It's a filter, not a permission boundary. Proof: packet `recreations/guardrail_gate.py`.

## Enrich 2026-10-11: the agent never holds the secret (yt:UFfruslHYy4)
- Meta's Muse design as narrated: the agent runs in a locked-down container and only ever sees placeholders; a separate boundary component swaps the real credential in after the request leaves the agent, and only for the host that secret belongs to.
- Contrast: an assistant whose privacy policy invites you to hand it usernames and passwords. Reject that class.
- PROVE: `/workspace/research/packets/signals-2mo-backlog-20261010/recreations/20261011/run1430/secret_swap.py` (agent view has no secret, egress does, wrong host refused) PASS. Our equivalent today: keys live in env files outside agent prompts and repos, never pasted into chat.
