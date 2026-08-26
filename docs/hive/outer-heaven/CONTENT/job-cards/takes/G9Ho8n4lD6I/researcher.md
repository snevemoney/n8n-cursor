# Researcher — G9Ho8n4lD6I
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/G9Ho8n4lD6I/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/G9Ho8n4lD6I/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
First Vapi + n8n voice-agent short. Beats: (1) Create blank assistant; name “booking agent.” (2) Persona: Hercules Detailing (car detailing); callers book via the site number. (3) Needs calendar look-up + create event. (4) Vapi tools: Google Calendar create event + check availability. (5) ChatGPT drafts the system prompt: name Nate, booking assistant, Hercules; he checks it has overview, purpose, service options, **when to use each tool**. (6) Paste into Vapi; test call: full interior+exterior today → checks remaining today → 4–6pm → caller picks 5pm → asks email → books; confirmation to nate@acample.com. (7) Play-button. Timestamp UNKNOWN. Long: `zWLZ3bVVwD8`, `y-cq_Qo4zVo`, `BO-jFbN4p8Y`. Vapi on-tape. Hive: do not install Vapi.

## B. Atomic Knowledge

### Calendar tools before the pretty prompt
- **Claim:** A booking voice agent needs check-availability and create-event tools, then a prompt that says when to use each.
- **Reasoning:** Otherwise it cannot book; the prompt section he insists on is tool policy.
- **Mechanism:** Blank assistant → two Calendar tools → generated prompt with when-to-use → live call.
- **Evidence:** “the one thing I just want to make sure we have here is when to use each tool.”
- **Conditions:** Calendar connected; a bookable service list.
- **Exceptions:** Prompt-only booking without tools is not shown (and would be fake).
- **Action:** Attach the two tools; require a when-to-use clause.
- **Confidence:** high.
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN
- **Epistemic:** SOURCE

### Generated prompt is a draft you inspect
- **Claim:** He uses ChatGPT to draft the system prompt, then checks structure (overview/purpose/services/tool policy) before paste.
- **Reasoning:** Speed, but he names the section that must exist.
- **Mechanism:** Generate → skim required headings → copy into Vapi.
- **Evidence:** Same move as `NO97pqqc10A`, here with an explicit checklist.
- **Conditions:** Time or laziness; tools already exist.
- **Exceptions:** Arena clip reported tail issues; this clip’s test call sounds clean (do not flatten).
- **Action:** If you generate a prompt, inspect tool-policy before the call.
- **Confidence:** high he did this.
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Voice booking is calendar I/O plus a scripted agent name. Demo business (Hercules Detailing) is a prop. Confirmation email is part of “you’re all set.” He is fine generating the prompt if the tool section is present.

## D. Procedures
1. Create a blank assistant; name the job (booking).
2. Add check-availability + create-event.
3. Generate or write a prompt that includes when-to-use-each-tool.
4. Test: named service + “today” → slots → pick → email → booked + confirmation.
5. Hive: do not place a real call / do not install Vapi.

## E. Examples
- **Situation:** Fake detailing shop. **Action:** Two calendar tools + generated prompt + test call. **Reasoning:** Book needs both tools. **Outcome:** 5pm full detail; confirmation to a dummy email. **Lesson:** The prove is a booked slot, not the voice. Implicit rule: “today” forces a live availability check.

## F. Decision Rules
- If the job is booking → two calendar tools + when-to-use.
- If the prompt was generated → check tool policy before the call.
- Refuse: Vapi as hive SKU; auto-book real customers; quote the demo as a $5k win (`7siRW0My05o` is a different tape).

## G. Contrarian
Starts blank, not from a marketplace assistant. Insists on tool policy over clever personality.

## H. Assumptions
Slots 4–6pm are real calendar data (or mocked — not said). Email send happened. Hercules is fictional-for-demo (not verified).
**Desk dissent:** Researcher operate-never Vapi even though the speaker’s whole point is Vapi. Learn ≠ operate.

## I. Questions
- Did create-event actually write a Calendar row?
- n8n’s role on this short? (title says Vapi and n8n; body is Vapi dashboard)

## J. Connections
- **SYSTEM SYNTHESIS:** `zWLZ3bVVwD8` beginner voice course. `y-cq_Qo4zVo` receptionist + MCP. `BO-jFbN4p8Y` call every new lead. `private-book-install` is our book machine — do not swap in Vapi. `NO97pqqc10A` prompt-gen.

## K. Future-Use
When-to-use-each-tool as a required prompt section for any multi-tool agent.

## Steal / Operate-never

### Machine: two-calendar-tools-plus-when-to-use
- **Epistemic:** SOURCE
- **Workflow / loop:** blank assistant → check availability + create event → prompt must include when-to-use → test “today” + named service → slot → email → booked
- **Questions / signals:** Does the prompt say when to check vs create? Did a slot get written?
- **Qualify / frame / objections:** Personality is optional; tool policy is not.
- **Procedure:** D.
- **Example that proves it:** Hercules full detail today → 4–6pm → 5pm → confirmation email.
- **Why it works:** Booking is a calendar state change, not a chat.
- **Conditions / exceptions:** Demo shop. Vapi on-tape. Email may be fake.
- **Operate-never payload:** Vapi/ChatGPT install; auto-book; detailing ICP; quote demo as FACT.
- **Hive run:** `private-book-install` (our book) · `ask-principal` · `golden-test-loop`
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN

**Operate-never**
- Install Vapi. Place live calls. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Steal tool-policy + calendar pair. Map book to `private-book-install`, not Vapi. Clients parked.
