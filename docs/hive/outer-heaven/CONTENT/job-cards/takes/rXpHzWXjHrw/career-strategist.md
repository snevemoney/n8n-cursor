# Career Strategist — rXpHzWXjHrw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (1:52, 475 words). Text-to-workflow. Beats: (1) “build n8n agents with just your words” (2) he specifies: newsletter every morning 7am; Tavily + Perplexity for top five AI/tech stories; **names the chat model and tools** so it does not invent a random HTTP (3) builder searches nodes, returns a different structure; he can request changes; he **approves the one-shot plan** (4) setup guide: email, Tavily key, Perplexity, Anthropic, Gmail (5) Tavily key in HTTP body; Perplexity connected; merge append; newsletter writer agent (6) user message: HTML newsletter from research, start with headers; system prompt short — “I would have expected this to be a little more detailed” / expert newsletter writer (7) run; Gmail check; looks cool; sources include a YouTube and TechCrunch (8) CTA. Auto-email at 7am is the payload.

## B. Atomic Knowledge

### Name the tools or the builder will guess HTTP
- **Claim:** He told it which model and tools to use so it would not assemble a random HTTP request.
- **Reasoning:** One-shot text-to-workflow hallucinates nodes if you only name the outcome.
- **Mechanism:** constrain tools → it searches node docs → plan → approve.
- **Evidence:** “it didn’t just try to throw together a random HTTP request.” @ UNKNOWN
- **Conditions:** Builder can search nodes.
- **Exceptions:** If you want it to choose, you get randomness (he refuses).
- **Action:** Name tools in the ask.
- **Confidence:** high as his move.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

### Approve the plan; lint the prompt
- **Claim:** He approves the one-shot plan, then finds the writer system prompt thinner than he wanted.
- **Reasoning:** Plan ≠ quality of the hidden prompt.
- **Mechanism:** approve → inspect nodes → run → check Gmail + sources.
- **Evidence:** “I would have expected this to be a little more detailed.” @ UNKNOWN
- **Conditions:** You open the agent node.
- **Exceptions:** Blind approve (he did not stay blind).
- **Action:** Open the system prompt before you trust the schedule.
- **Confidence:** high as his reaction.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Words can draft a graph. Approval is a gate. Setup guide is a keys list (pay). Sources at the bottom are the honesty check. Short prompts are a smell.

## D. Procedures
State schedule + tools + model → review plan → approve → configure keys → open writer prompt → run once → check sources in the sent mail.  
Hive: do not schedule Gmail send.  
Avoid: random HTTP.

## E. Examples
**Situation:** 7am AI/tech newsletter.  
**Action:** Constrain Tavily+Perplexity; approve; run; mail has YouTube + TechCrunch sources.  
**Reasoning:** Real articles.  
**Outcome:** He likes the look; prompt was thin.  
**Lesson:** Sources save a thin prompt. Implicit rule: still lint the prompt.

## F. Decision Rules
- If you did not name tools, expect junk HTTP.
- If you did not open the system prompt, you approved a mystery.
- 7am send is HITL or never.

## G. Contrarian
Rejects fully unconstrained “just say what you want.” Also quietly rejects his own thin generated prompt.

## H. Assumptions
**Theirs:** 7am, five stories, Tavily/Perplexity/Anthropic/Gmail. **Ours:** keys = pay; auto-send never. Falsifier: sources that do not match the claims.

## I. Questions
- What change would he request to the prompt?
- Long `TDHFkKSTJ30` / `a5sJNwfZ528`?

## J. Connections
- SYSTEM SYNTHESIS → `0Ujdys4LqNs` / `pxzo2lXhWJE`.
- SYSTEM SYNTHESIS → `TDHFkKSTJ30` (agent builder).
- SYSTEM SYNTHESIS → `ask-principal` (keys/send).

## K. Future-Use
Unassigned: “name the tools in the ask” as a session-bootstrap line.

## Steal / Operate-never

### Machine: constrain-tools → approve-plan → lint-prompt → human send
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** say schedule + named tools → read the plan → approve or request changes → open the hidden prompt → dry-run → check sources → **do not leave Gmail on a cron**
- **Questions / signals:** Did it invent HTTP? Is the prompt thinner than the job?
- **Qualify / frame / objections:** One-shot is a draft graph.
- **Procedure:** Setup guide = HITL pay list, not a to-do we execute.
- **Example that proves it:** 7am newsletter with thin prompt + real sources (E).
- **Why it works:** Tool names bound the search; lint catches the rest (B/C).
- **Conditions / exceptions:** Builder must search nodes. Auto-send never.
- **Operate-never payload:** Cron Gmail; buy the keys; quit-job.
- **Hive run:** `session-bootstrap` · `ask-principal` · `send-removed` · `golden-test-loop`
- **Source:** `rXpHzWXjHrw` @ UNKNOWN

### Operate-never
- Auto-send 7am mail. Pay for Tavily/Perplexity without HITL.
- Employment send. Quit-job. Unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: a generated weekly update graph is a plan to lint, not a cron into a hiring manager’s inbox. Name the sources. Clients parked.
