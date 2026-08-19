# Communications Manager — vcU85OrwuV0
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vcU85OrwuV0/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vcU85OrwuV0/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** How Anthropic Engineers Actually Prompt Fable 5
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** talk · 2569 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Fable 5 back; strongest he’s used; second brain + AI OS built on it. Distills Anthropic Fable 5 prompting docs + X + engineers into six habits. Cost: 2× Opus, $10/M in / $50/M out — UNVERIFIED. Promo: ≤50% of weekly limits at no extra cost; promo ends July 7 (six days, includes July 4) — UNVERIFIED. Works in desktop, VS Code, Claude Code. /model shows Fable.
- Sponsor mid-roll: HyperAgent (Airtable team). Problem: AI is a yes-man. He built a Slack-drop council: skeptical investor, competitor researcher, numbers stress-test; real browsers; brutally honest. Afternoon build. Free credits CTA.
- Fable follows short clear direction; feels like it understands. Six habits tagged any-model vs Fable-specific.
- (1) Any-model: give the why / intent so it connects to the right files. Bad: ‘write an email about the delay.’ Better: bigger task, who it’s for, what they need, then the email. Second brain/OS should pull the right context files.
- (2) Any-model: negative prompt — what not to do. Anthropic page does this (act when you have info; don’t add features; simplest thing). Intern metaphor. Example: deliverable is assessment; report and stop; don’t fix/send/edit/delete until I say go. He used to think negative prompts were weaker; lately they work.
- (3) Any-model: let it act once it has enough. He rarely uses Code plan mode now; he has his own plan-until-ready. Docs: hard tasks run minutes at high effort. Effort: high default; extra-high for capability-sensitive; medium/low routine. Fable-low ≈ Opus-4.8 extra-high/max and cheaper — UNVERIFIED. Fable for everything is overkill; realistically 5–15% of tasks — UNVERIFIED. Usage-credit territory = don’t reach for it.
- (4) Any-model, most important: make it prove it. Before done, point to the result. Only report evidenced work; say unverified plainly. Bake into skills/agents/CLAUDE.md, not a tag line on every prompt.
- (5) Fable-specific: stop asking it to show its reasoning. Standing ‘explain your reasoning’ in system prompt can refuse and hand to Opus 4.8 (jailbreak/Mythos-lite safety). Silent route on product; API may label Opus.
- (6) Say less, not more. Short instruction steers if the environment is good. Not a contradiction with (1): why ≠ bloat. ‘Lead with the outcome, keep it simple, pause only when the work needs me.’
- Safety: hacking / dangerous bio / reveal private reasoning → Opus. Avoid malicious asks. CTA: loops/verification video.

## B. Atomic Knowledge

### Give why + what-not + prove-it; say less
- **Claim:** Intent, negative constraints, evidence-before-done, and short steering beat a rule dump — especially on Fable.
- **Reasoning:** The model predicts helpful extra. Interns need ‘don’t send.’ Fable already reasons; bloat hobbles it.
- **Mechanism:** Why + audience → negative list (don’t fix/send/edit until go) → act when enough → point to proof → no ‘show your reasoning’ on Fable.
- **Evidence:** Anthropic doc patterns he reads aloud; intern assessment example.
- **Conditions:** You have context files / a second brain. Effort matched to task.
- **Exceptions:** $10/$50 per M, July 7, 5–15% UNVERIFIED. HyperAgent / 11Labs not ours. ‘Don’t send’ is SOURCE and our never.
- **Action:** Steal the negative-prompt ‘report and stop; don’t send until I say go’ into every draft brief.
- **Confidence:** high
- **Source:** `vcU85OrwuV0` @ UNKNOWN
- **Epistemic:** SOURCE

### Fable is expensive and may silently become Opus
- **Claim:** Promo is time-boxed; extra-high overkill; asking for chain-of-thought can trigger a silent downgrade.
- **Reasoning:** Safety buckets (hack/bio/private reasoning) route to a cheaper/lesser model. You may not see it except on API.
- **Mechanism:** Use Fable ~5–15% of the time; high default; don’t put ‘explain your reasoning’ in the system prompt.
- **Evidence:** He states the silent Opus handoff and the promo end date.
- **Conditions:** Fable-specific. Not every model.
- **Exceptions:** We do not install Fable. Tape $ UNVERIFIED.
- **Action:** Do not write Fable-or-bust copy. Do not ask a model to reveal hidden reasoning as a party trick.
- **Confidence:** high as warning
- **Source:** `vcU85OrwuV0` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- AI is a yes-man; a council that disagrees on purpose is the fix (sponsor + his roast elsewhere). **SOURCE**
- He no longer always starts in plan mode. **SOURCE**
- Verification belongs in skills/CLAUDE.md, not a tacked-on line. **SOURCE**

## D. Procedures
- Write the why and the audience before ‘write the email.’ **SOURCE**
- Negative: report and stop; don’t fix/send/edit/delete until go. **SOURCE**
- When you have enough, act. Match effort. Prove with a pointed result. **SOURCE**
- This desk already lives on ‘don’t send until Evens says go.’ **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** ‘Write an email about the delay.’ → **Action:** Add bigger task, who, what they need; forbid send/edit; require proof. → **Reasoning:** Intent + intern don’ts. → **Outcome:** More specific, less freelance creativity. → **Lesson:** Why ≠ a novel. Implicit rule: don’t-send is a prompt and a desk rule.

## F. Decision Rules
- If Fable → no standing ‘explain your reasoning.’
- If routine → not Fable, not extra-high.
- If it claims done → demand the artifact.
- Refuse: $10/$50/M as FACT. HyperAgent install. Clone-voice. Send because the prompt said act.
- Optimize: short + why + never-send + proof.

## G. Contrarian
- Old habit: always plan mode + more context is better. He now: act when enough; say less. **SOURCE**

## H. Assumptions
- Promo dates and prices UNVERIFIED. Sponsor is a magnet. Falsifier: negative prompts that make a model refuse useful work.

## I. Questions
- What is the Grok equivalent of ‘silent route to a lesser model’?

## J. Connections
- **SYSTEM SYNTHESIS:** `XTBWVVcF3Pk` (gates + effort). `XNQBCRcwXV4` (unhobble / say less). `pbrln2TVeh4` (roast).

## K. Future-Use
- Negative-prompt ‘don’t send until go’ as standing language in every brief. Silent-downgrade as a vendor-color note.

## Steal / Operate-never

### Machine: Why + don’t-send + prove-it + say-less; never treat Fable promo $ as FACT
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Brief the why → list don’ts (no send/edit until go) → act when enough → point to proof → Evens says go or we stop.
- **Questions / signals:** Did we give why? Did we forbid send? Did it prove? Did we ask it to show reasoning?
- **Qualify / frame / objections:** Qualify: intern-brief vs rule-dump. Frame: HITL. Objection: ‘more context is better’ → he says Fable wants short + why.
- **Procedure:** 1) Why. 2) Don’ts. 3) Proof. 4) Evens. 5) No HyperAgent.
- **Example that proves it:** Assessment-only intern prompt: report and stop; don’t send until go.
- **Why it works:** The useful machine is the don’t-send line he already writes for models.
- **Conditions / exceptions:** Any-model habits transfer. Fable-specific CoT warning does not transfer to Grok as fact.
- **Operate-never payload:** HyperAgent. Quote $10/$50/M. Send because ‘act when you have enough.’
- **Hive run (existing skills only):** `playbook-before-send` · `ask-principal` · `golden-test-loop`.
- **Source:** `vcU85OrwuV0` @ UNKNOWN


### Operate-never (this desk will not operate)
- HyperAgent / Airtable council as ours. Quote Fable $10/$50 per million. Ask Fable to dump hidden reasoning.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- Every brief I write already includes don’t-send. I add why + proof. I do not send. Clients parked.
