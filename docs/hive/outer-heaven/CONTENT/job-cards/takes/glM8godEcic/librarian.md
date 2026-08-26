# Librarian — glM8godEcic
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/glM8godEcic/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/glM8godEcic/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Built an AI Voice Receptionist with Vapi and n8n MCP
**Channel:** Nate Herk | AI Automation
**Kind:** short (~2:14 / ~484 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. n8n MCP server "powers my entire voice agent": Vapi front, n8n back.
2. Vapi tool named n8n = MCP server with seven workflows: client lookup, new client CRM, check availability, book event, update appointment, lookup appointment, delete appointment.
3. Each tool has one specific function; Vapi+MCP choose which to call.
4. Live: calendar left, CRM right; call Kylie / Hercules Detailing.
5. New caller not in system → email, full name, phone to set up. nate@acample.com / Natek (K) / 333-444-5678. She confirms (email garbled in captions).
6. Interior detailing tomorrow; she lists taken slots 10:15–11:15 and 2–3; he picks 8 a.m.; booked.
7. CTA: full breakdown.
Gap: MCP auth. Timestamp UNKNOWN. Vapi / n8n MCP. Auto-book. Hercules parked.

## B. Atomic Knowledge

### One function per MCP tool
- **Claim:** Seven n8n workflows are exposed as single-purpose MCP tools (lookup/create/check/book/update/lookup/delete).
- **Reasoning:** Specific functions let the voice layer choose quickly.
- **Evidence:** "each tool has one very specific function"
- **Conditions:** Vapi + n8n MCP
- **Exceptions:** None
- **Action:** File one-function-per-tool; park Vapi/MCP book
- **Confidence:** high
- **Source:** `glM8godEcic` @ UNKNOWN
- **Epistemic:** SOURCE

### New-caller collect, then calendar
- **Claim:** If not in CRM, collect email/name/phone, confirm, then show taken vs open slots and book.
- **Evidence:** "I won't be in the system" / "get you set up" / taken 10:15 and 2–3 / 8 a.m. reserved
- **Action:** File collect-then-slots; book HITL for us
- **Confidence:** high as demo
- **Source:** `glM8godEcic` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Front (voice) vs back (workflows). Thin tools beat a god-tool. Confirm the identifiers before write. Show taken slots, not only opens.

## D. Procedures
On-tape: ask email → if new, name+phone → confirm → create profile → check tomorrow → name taken windows → book chosen slot. Hive: stop before book. Signals: seven named tools; 8 a.m. reserved.

## E. Examples
**Kylie / Nate K:** Situation — new caller, interior tomorrow. Action — collect+confirm → taken slots → 8 a.m. Reasoning — MCP tools. Outcome — reserved. Lesson — one-function tools + confirm; do not operate the book.

## F. Decision Rules
- If a tool does two jobs → not this tape's MCP.
- If identifiers are not confirmed → do not write (her).
- If booking fires without Evens → never.
- Refuse: Vapi/n8n MCP as hive; Hercules `icp_id`; auto-book.

## G. Contrarian
Against one fat "n8n" tool that does everything. Against hiding taken slots.

## H. Assumptions
Theirs: MCP+Vapi is the whole receptionist. Ours: teaser of `y-cq_Qo4zVo`. Same Hercules as `G9Ho8n4lD6I`. Confirm step is good; auto-book is not.

## I. Questions
Auth on MCP? Delete-appointment ever demoed? Long-tape HITL?

## J. Connections
SYSTEM SYNTHESIS → `y-cq_Qo4zVo`; `G9Ho8n4lD6I`; `9IzGe0BBj_c`; `ask-principal`.

## K. Future-Use
One-function-per-tool + confirm-identifiers as atoms. Unassigned: hive never books.

## Steal / Operate-never

### Machine: thin MCP tools + confirm IDs; book stays HITL
- **Epistemic:** SOURCE
- **Workflow / loop:** lookup → if missing collect+confirm → check availability (name taken slots) → (on-tape book) hive stop → checkable stop = IDs confirmed and taken windows stated
- **Questions / signals:** In the CRM? Email/name/phone confirmed? Which hours taken?
- **Qualify / frame / objections:** "Powers my entire voice agent" is the hook
- **Procedure:** seven named workflows
- **Example that proves it:** new caller → confirm → 10:15 and 2–3 taken → 8 a.m.
- **Why it works:** thin tools + confirm reduce wrong writes
- **Conditions / exceptions:** auto-book on tape
- **Operate-never payload:** Vapi; auto-book; n8n instance MCP; Hercules hunt
- **Hive run:** `ask-principal` · `send-removed`
- **Source:** `glM8godEcic` @ UNKNOWN

### Operate-never
- Vapi / n8n MCP as hive. Auto-book. Hercules `icp_id`.
- Merge `LESSONS-FROM-TAPE.md`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File one-function tools and confirm-before-write. Do not expose hive workflows to Vapi. Book remains HITL.
