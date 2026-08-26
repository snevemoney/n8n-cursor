# Forge — 7siRW0My05o
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **AAS Plus hackathon #1** winner interview. Beats: **$5,000**, **3 weeks**, brief = **voice agent + n8n backend**; winner **Azim/Zane**, ~**6 months** in, **high school**, no prior tech, YouTube/courses, Bolt new 2 months ago → product **Seolassium** (name garbled): mental-health web app; **Bolt** front, **9 n8n** workflows, **Vapi** voice, **Firebase** auth → signup: name/email/phone/tz/password → 5 onboarding Qs to tailor → start session → n8n personalizes agent → **Vapi outbound call** → Nate: work stress, not ready to share, breathing; voice “natural, not aggressive,” male default → after hangup: another agent condenses transcript/summary into the profile → Nate: linear flow, **you stay in control**, not a giant autonomous blob → **onboarding webhook** → code extract → profile-manager agent (Sheets) + preference agent (morning/evening sheets) → Bolt/Lovable: drop webhook URL on the button → **on-demand call** webhook → **safety/crisis** branch (“would alert emergency services” — **not proven live**) → caution score → mental-health agent loads user by ID from Sheets → **new** vs **existing**: write prompt + create Vapi assistant vs fetch + update prompt → HTTP place-call + **dynamic phone-number pool** (mark busy / free) → poll **every 30s** until ended → notify web app → merge transcript into profile → **scheduled** twins for morning/evening/Sunday → **preference-changed** webhook: master + two sub-agents (overall vs sub-profiles) → **weekly report** (WIP): Fri 8–6 hourly, walk users/prefs, email (Gmail demo; “real world = CRM”) → Nate: keep it **linear** when the order is known; don’t give an agent four sheet-tools to shuffle → Azim: **HIPAA / data protection / funding** before public; idea from a Plus announcement; agency portfolio piece even if it never ships; his YT / Skool / consults → Plus templates. Timestamp UNKNOWN. Vapi / Bolt / Firebase / n8n / Plus on-tape. Caption-only: call audio unobserved beyond his words.

## B. Atomic Knowledge

### Linear + crisis fork + number pool; do not ship a therapist
- **Claim:** Winner kept n8n mostly linear: webhook → safety → load profile → create/update assistant → call → poll → write-back. Known order ≠ a tool-pile. Phone numbers are a mutex.
- **Reasoning:** Autonomous “do the weekly report however” would miss a sheet. Crisis path is a product claim, not a live proof.
- **Mechanism:** Sheets as profile; Vapi assistant mutated per user; 30s poll; busy/free numbers.
- **Evidence:** Nine workflows; Nate praises control.
- **Conditions:** Hackathon demo.
- **Exceptions:** HIPAA unnamed; emergency-services path unproven. Mental-health outbound is a legal/clinical gun.
- **Action:** Steal linear-when-order-is-known + mutex + poll-until-done. Do not install Vapi/Bolt. Do not build or sell an AI therapist.
- **Confidence:** high on the wiring shape; $5k / 6 months UNVERIFIED.
- **Source:** `7siRW0My05o` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Front (Bolt) talks to back (webhook). Profile compounds after each call. Preference = a scheduled twin, not a smarter agent. Portfolio ≠ production. “Everyone thinks agency; he says Plus” is the close.

## D. Procedures
1. Don’t install Vapi / Bolt / Firebase-as-hive. 2. Don’t ship mental-health voice. 3. If a flow has a known order: keep it linear. 4. If a resource is exclusive: mark busy/free. 5. Don’t quote $5k as a hive KPI.

## E. Examples
**Situation:** New vs returning caller.  
**Action:** Create vs update Vapi assistant.  
**Reasoning:** Prompt must match history.  
**Outcome:** Tailored outbound.  
**Lesson:** State lives in the sheet, not the model.

**Situation:** Weekly email.  
**Action:** Walk four sheets in order.  
**Reasoning:** Agent-with-tools would shuffle.  
**Outcome:** Nate: this is why he won.  
**Lesson:** Deterministic spine.

**Situation:** Crisis language.  
**Action:** Safety branch.  
**Reasoning:** Don’t continue the companion path.  
**Outcome:** Claimed emergency route.  
**Lesson:** Unproven. Still don’t build this SKU.

## F. Decision Rules
- If the order is known → linear, not a tool blob.
- If the SKU is therapy / HIPAA / outbound voice → refuse.
- If Vapi / Bolt / Plus CTA → park.
- If $5k / high-school / 200+ appear → UNVERIFIED.

## G. Contrarian
Field makes one mega-agent. He (and Nate) keep the spine linear. Field wants to launch the app; Azim says HIPAA/funding first.

## H. Assumptions
Demo as taped. Falsifier: crisis path is a stub. We do not install Vapi (workspace rule). Mental-health data in Sheets is operate-never for us.

## I. Questions
None for hive product. The steal is control-flow, not the category.

## J. Connections
SYSTEM SYNTHESIS: `kOKavHnlPik` retrieve-what-the-question-needs. `jZgcWCzxh1I` don’t climb the autonomy ladder. No Vapi / Bolt / Lovable. Clients parked — no therapy ICP.

## K. Future-Use
Linear-when-known. Mutex the scarce resource. Never the therapist SKU.

## Steal / Operate-never

### Machine: known order stays linear; exclusive resource gets a lock; crisis is a hard fork — and we still don’t build this
- **Epistemic:** SOURCE
- **Workflow / loop:** intake → safety fork → load state → mutate prompt → act → poll done → write state
- **Questions / signals:** Is the order known? Is a number/seat exclusive? Is this clinical?
- **Qualify / frame / objections:** Hackathon ≠ HIPAA. Vapi is banned here.
- **Procedure:** No Vapi. No therapist. No Plus-as-ours.
- **Example that proves it:** New/existing assistant; 30s poll; weekly linear walk.
- **Why it works:** Control beats a blob when the path is the same every time.
- **Conditions / exceptions:** Demo only. Tape $ UNVERIFIED.
- **Operate-never payload:** Vapi; mental-health outbound; quote $5k as FACT; agency-from-this.
- **Hive run:** none. Deploy HITL.
- **Source:** `7siRW0My05o` @ UNKNOWN

### Operate-never
- Install Vapi / Bolt / ship an AI therapist.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not add Vapi. I will not build a companion. Linear when the order is known. Deploy HITL.
