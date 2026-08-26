# Communications Manager — 8IUWeF3B-hk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** STOP Guessing! Evaluating Your Agents is Easy
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 332 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Visual-only UI clicks not fully narrated. Caption ingest; some ASR errors (Naden/Nitn = n8n).

Beats, in order:
- If you want to build and sell workflows, you have to evaluate them.
- Eval = validating your hypothesis with objective proof.
- Old loop: unhappy with results → “if I do X it will be better” → change → run → subjectively judge better/worse.
- n8n eval flow: dataset of six examples with expected category + expected priority → feed model → write AI answers back to Google Sheet → evaluations tab → run test.
- Test reports average tokens, prompts total, duration, and average correctness for priority and category.
- Click in: all six processed; see which were right and which weren’t.

## B. Atomic Knowledge

### Eval is hypothesis + objective proof
- **Claim:** Evaluation means validating a hypothesis with objective proof, not a vibe after one run.
- **Reasoning:** Subjective better/worse is what people already do; the sheet scores correctness against expected labels.
- **Mechanism:** Labeled set → run → write outputs → score vs expected.
- **Evidence:** “validating your hypothesis with objective proof” + six-row sheet demo.
- **Conditions:** You have expected labels. Task is classifiable (category/priority here).
- **Exceptions:** A letter’s “tone” is not a category column unless you define the labels.
- **Action:** Write expecteds before the change. Do not self-grade after send.
- **Confidence:** high
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE

### Six labeled rows beat a feeling
- **Claim:** He runs six examples with expected category and priority and reads a correctness average plus token/time.
- **Reasoning:** You can see which rows failed.
- **Mechanism:** Sheet in → model → sheet out → evaluations tab.
- **Evidence:** Demo finishes; six processed; right vs wrong visible.
- **Conditions:** n8n + Google Sheet on tape. Six is his demo size, not a law.
- **Exceptions:** Token averages are not quality. n8n eval node is on-tape tooling.
- **Action:** Steal the labeled-set loop, not the vendor.
- **Confidence:** high as demo; six UNVERIFIED as a standard
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Guessing is the enemy; a hypothesis needs a labeled stop. **SOURCE**
- Subjective judge-after-run is the default and it is insufficient. **SOURCE**
- Tokens/time are secondary metrics next to correctness. **SOURCE**

## D. Procedures
- State hypothesis (if I do X, output improves). Change. Run against expected labels. Read fails. **SOURCE**
- Dataset columns on tape: expected category, expected priority. **SOURCE**
- This desk: expecteds for a letter = leak + destination + voice + public FACT. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Classifier should tag category + priority. → **Action:** Six labeled rows through the model; sheet shows right/wrong + averages. → **Reasoning:** Objective proof. → **Outcome:** Test finished; fails visible. → **Lesson:** You cannot improve what you only vibe. Implicit rule: write expecteds first.

## F. Decision Rules
- If there are no expecteds → you are guessing.
- If you only judge subjectively after one run → not eval.
- Refuse: “it looks better” as a send condition.
- Optimize for visible fails, not a token average.

## G. Contrarian
- Field iterates by vibe. Nate: that’s not evaluation. **SOURCE**

## H. Assumptions
- Six rows is a demo. Google Sheet as SoR. Falsifier: labels themselves are wrong.

## I. Questions
- What is a labeled set for a warm letter? Who writes the expecteds?

## J. Connections
- **SYSTEM SYNTHESIS:** `NWbh5ZoEHkA` (calculator). `EuzYhzB0vbI` (X=Y stop). `golden-test-loop`.

## K. Future-Use
- Letter golden set (3–6 expecteds) as a parked card.

## Steal / Operate-never

### Machine: Hypothesis + labeled expecteds before another pass
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Unhappy with a draft → write the hypothesis and 3–6 expecteds (leak, destination, voice, FACT) → change one thing → check rows → **stop** if pass. Do not send on a vibe.
- **Questions / signals:** What is the hypothesis? What is expected? Which row failed?
- **Qualify / frame / objections:** Qualify: objective vs subjective. Frame: proof. Objection: “looks better, send it” → refuse.
- **Procedure:** 1) Expecteds first. 2) One change. 3) Read fails. 4) Evens is the checker.
- **Example that proves it:** Six category/priority rows; right vs wrong visible.
- **Why it works:** Without expecteds you cannot tell if X helped. Send-on-vibe scales bugs.
- **Conditions / exceptions:** Task can be labeled. Exceptions: no expecteds → hold the draft.
- **Operate-never payload:** Send because it “looks better.” Quote token averages as quality.
- **Hive run (existing skills only):** `golden-test-loop` · `warm-draft-hitl` · `playbook-before-send`.
- **Source:** `8IUWeF3B-hk` @ UNKNOWN


### Operate-never (this desk will not operate)
- Send on a vibe. Treat token/time averages as quality.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I write expecteds on the card before a rewrite. I do not self-grade a send. Clients parked.
