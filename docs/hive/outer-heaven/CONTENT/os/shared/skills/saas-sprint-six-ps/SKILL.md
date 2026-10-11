---
name: saas-sprint-six-ps
description: >-
  Use when running a one-day SaaS/product sprint with the 17 hive desks —
  Pain Promise Product Plumbing Packaging Proof. Not for cloning Nate's
  Client Pack as a live store. Not for installing Fable or Claude desktop.
---
# SaaS sprint — Six P's (hive COURSE)

Source: Nate Herk `yt:IVx8OSMbTss` *Watch Me Build an AI SaaS in a Day (2 HOUR COURSE)* — timedtext **PROVE** 2026-09-02. Packet: `/workspace/research/packets/nate-saas-IVx8OSMbTss/`. Proof clone of Client Pack is owned by a cloud agent — **do not rebuild**. Do not open Saylor Chrome.

## When
Operator wants a one-day SaaS/product sprint (idea → sandbox app) using the 17 desks.

## Do not use when
- Cloning Nate's Client Pack as a live store / live Stripe
- Installing Fable, Claude desktop, Codex desktop, Glaido
- Selling, ads, waitlist blast (building mode — GTM HOLD until operator exits)
- Generic "find me a business idea" with no primary data / no niche the operator understands

## Six P's → desks

### Pain = Researcher
Primary data first (our comments, community, niche the operator actually knows). Outsource **collection**, not **understanding**. No generic idea prompt — that yields the same AI recs everyone else gets. Researcher synthesizes; operator chooses.

### Promise = Consultant
One sentence on the landing. Avatar + pain locked before copy. $ bands from a tape or scrape = **UNVERIFIED** until Money Desk / operator say otherwise. Consultant does not invent a price as ours.

### Product = Forge (build) + Creative (deck / brand feel)
Verifier **MUST** be a different node: Watchdog / [golden-test-loop](sand-workflow:golden-test-loop) / Codex-as-breaker **remap** (Cursor CloudAgent or Playwright breaker — not the builder). **Big Boss is PM not executor.** Forge does not grade its own homework.

### Plumbing = Forge + HITL
Supabase / Stripe keys, deploy. **Tier 3.** Sandbox first. No live spend until operator yes. See packet `HITL-LIVE-STRIPE.md` (QUEUED, not approved). Operator **building mode: no selling.**

### Packaging = Creative + Publishing
Name, logo, waitlist. Sell-before-build waitlist is **GTM HOLD** until operator exits building mode. Publishing does not blast, ads, or outreach.

### Proof = Watchdog
Break the app, security review, launch blockers. **Agent saying done is not done.** Pair [verify-then-done](sand-workflow:verify-then-done).

## Session handoff (Librarian)
Before context rot: dump done / not-done / files / next ask. Fresh session. Librarian writes the topic. Do not keep one fat thread through a whole sprint.

## Moat
Grill-me IP lives in the **backend prompt** (Consultant + Forge), not the UI. Anyone can rebuild the chrome in a day. [grill-me-into-prompt](sand-workflow:grill-me-into-prompt).

## Parallelism
Parallel work trees. Progress written back to the plan doc (or a per-stream folder). **Max 3 streams** on one desk. Nate's nine-worker fan-out is not hive policy.

## Remap (do not install)
| Tape | Hive |
|---|---|
| Claude Code / Claude desktop / Fable 5 as PM | Cursor + Grok. Big Boss / Consultant PM. **Do not install Fable.** |
| Codex desktop (ChatGPT app) as breaker | Watchdog + golden-test-loop + Cursor CloudAgent computer-use **WORKAROUND** |
| Glaido voice | [local-push-to-talk-dictation](sand-workflow:local-push-to-talk-dictation) if needed. Do not install Glaido. |
| `/goal` unattended hours | Bounded golden-test-loop. No 24–48h unattended. |
| Client Pack live store | Cloud agent owns proof clone. This skill does not rebuild it. |

## Claims (HIS, UNVERIFIED — do not quote as ours)
`$39/mo` · `60k comments` · `10x ROI` = **HIS claims UNVERIFIED**. Tape also: 16k YT + 8k community + 4k tweets + ~20k Reddit; Stripe $39/mo + $390/yr; one-pack ~16–20¢; smoke-test 13¢. Treat as FACT-as-stated on his run, not hive metrics.

## Tools
| Need | Path |
|---|---|
| Sprint SOP | this skill — **PROVE** |
| Packet / chapters / prompts | `/workspace/research/packets/nate-saas-IVx8OSMbTss/` — **PROVE** |
| Verifier node | Watchdog · golden-test-loop · verify-then-done — **PROVE** (different node) |
| Voice | local-push-to-talk-dictation — **WORKAROUND** |
| Keys / live Stripe | HITL sandbox first · `HITL-LIVE-STRIPE.md` QUEUED — **Tier 3** |
| Fable / Claude desktop / Codex desktop / Glaido | **BLOCKED** |
| Client Pack as live store | **BLOCKED** (cloud agent owns proof clone) |
| Live ads / waitlist blast | **GTM HOLD** until operator exits building mode |

## Don't
- Install Fable or Claude desktop
- Rebuild Client Pack
- Quote $39/mo, 60k comments, or 10x ROI as ours
- Live Stripe / live spend without operator yes
- Generic idea prompt with no primary data
- Same node as builder and verifier
- More than 3 parallel streams
- Sell in building mode

## Prompts
All blocks below are **CAPTION** (auto-captions `yt:IVx8OSMbTss`, not invented). Hive remap sits *after* each block. Full set: packet `PROMPTS.md`.

### 1. Research orchestrator — Pain (CAPTION ~4:44)
```
So what I'm trying to do today is build an AI SAS product. I'm trying to show my audience how much they can actually do with AI. And the first most important part of building a SAS product is we have to have an actual painoint. We have to answer a problem or solve a problem that the market actually has. So a lot of my audience might not have you know a big YouTube channel or a big community to leverage data from and we have that ability. So basically the idea is I want you to use our primary data which could be things like YouTube comments um people talking in our school community what are the problems they're having but then also I want you to go on more of the publicly accessible data like secondaries forums of Reddit, LinkedIn X, Instagram. I want you to look through this type of stuff and help me identify a painoint that we can actually solve or a few pain points that we can solve. What we're looking to do here is we're looking to build some sort of AI SAS product that realistically can be built in one day. Something that is very visual and the promise is very clear. So it's not like a super super technical um like CRM sort of product that they would have to get onboarded to and that they would have to get familiar with over the you know a week or two get trained up. I'm looking for something that people can sign up for and get value immediately. Like within five to 10 minutes, they can use it, they can understand it, and then they'll get value. So, what I want you to do here is I want you to act as the orchestrator. I want you to spin up different sub aents, and I want you to do research, scrape different methods, and then at the end, come back, consolidate everything, and just give me clear signals of a couple ideas, and then from there, I will choose. Let me know if there's anything specifically that you need for me as far as like API keys or if you don't have access to certain data because I've already set you up with my Herk 2 project which you can go in there and you can use you know you might have more reach into some things but just let me know if there's anything that you can't reach that you would really like to.
```
**Hive:** Researcher desk. Cursor + Grok orchestrator, max 3 streams. Primary data the operator actually has. No generic idea prompt. Operator chooses.

### 2. Packaging name / logo — Creative (CAPTION ~13:08)
```
Okay, so inside of our project, you should see a research folder. We just did a bunch of research on what product we actually want to build inside of this project. And we're ending up going with a client sort of handover sort of like a AI agency client management product where people will log in, they will be able to upload information about the project that they're working on with a client and it will create them, you know, a proposal, a PDF, maybe even like the audit. It'll give them the deliverables based on their natural language and it's going to be professionally branded as well as there'll be images and diagrams and whatnot. So, that's the idea for this product. Ask me any questions if you have any about it so that we can go ahead and design, you know, like the name of it and um you can give me a bunch of different logo variations and color schemes so that we can have a sort of like a design system ready to go for this entire product.
```
Follow-up CAPTION ~16:12 (avatar answers): main moment = after discovery/sales, branded consistent deliverables to close; avatar = AI agency owners getting started or overwhelmed; naming = literal; brand feel = premium consultancy; independent of Nate's name; skip domain for now; stay away from red; modern clean not AI slop; stronger one-line promise then iterate logos/concepts/colors.
**Hive:** Creative. Codex GPT-image remap → owned image path / Higgsfield WORKAROUND. Collision-check names. Do not lock a live domain in building mode.

### 3. Fable-as-PM plan doc — Big Boss remap (CAPTION ~19:07)
```
So I actually have a different codec session helping right now figure out the name, the oneline promise, the logo, the color scheme, stuff like that. Your job in this session, you're Fable 5. You're super intelligent. You need to help me figure out and plan out the actual build. So what that means is your deliverable right now is a plan document, something that you can use when you are delegating work to other sub agents to actually build. You're not the executor. You are just the manager. You're the project manager here. So like I said, figure out what this is going to look like from a building perspective. If you don't yet have a clear vision of the actual product, then ask me some questions and let's brainstorm about that a little bit until you feel confident that you know exactly what the user experience and on the technical side what needs to happen in order to build this out.
```
V1 vision CAPTION ~20:03: dump discovery + sales transcripts → dashboard project → analyze → full deck that highlights pain, constraint, solutions, expected outcomes, 10x-as-justification (**HIS claim UNVERIFIED**), destination metrics not journey, visual for non-technical owners, user case studies + logo/brand on PDFs. Plan doc = running task list; parallel work trees; progress written back.
**Hive:** Do **not** install Fable. Big Boss / Consultant = PM. Plan artifact on disk. Forge executes later.

### 4. Waitlist landing, verify-until-works — Packaging (CAPTION ~28:23)
```
hey, so now that we know this information when it comes to branding, we know the name, we know the logo, the color scheme, I want you to create a really simple, professional onepage landing page. What this means is I want you to create a waiting list for people to be able to sign up for access once this product is ready. So we can start going around getting feedback and validating if it's something that people are actually interested enough to get on the waiting list for. So we should have obviously the logo up top. We should have the headline and the promise up top as well so that they understand what they'd be signing up for and then a little bit of information down below as far as what the product will actually do. So if you have any specific questions about what it's going to do and feel free to ask. You can also investigate inside this project. You can look at the planning doc. You can let other conversations that I've been having about it. But basically just create us a super simple onepage landing page that we can start to either run ads to or you know hit to our email list or drop in different communities things like that. somewhere where we can just send people once you have actually finished building that. Don't stop until you've validated it. So, open it up, take screenshots, make sure the waiting list works. Make sure that when they sign up for um you know, when they put their email in there, make sure it actually captures somewhere. Like, we need to capture that somewhere. Whether that be a Google sheet or um it sends me an email, whatever you want to do, just make sure that it's actually all completely functional before we actually push that anywhere.
```
**Hive:** Creative + Publishing. Verify-until-works stays. Ads / email blast / community drop = **GTM HOLD** until operator exits building mode.

### 5. PM /goal delegate V1 — Big Boss remap (CAPTION ~32:51)
```
Okay, so you are the project manager of this entire project. You need to see that it from end to end all gets implemented right and all gets built right because you at the end of the day are responsible for any of the mistakes here. So what I want you to do is you're going to work off of that build plan. You're going to work through these phases by delegating work to different sub aents using opus or sonnet whatever you see fit for the complexity of the task. So what I want you to do is you can use dynamic workflows, you can use just sub agents, you can use agent teams, whatever you see fit because you know how to do this best. You know how to manage the project best. Your job is to do this as fast as possible. Meaning anything that can be done in parallel, do them in parallel. There's no need to wait and do this as an assembly line. So figure out based on your build plan what can be done together and what has to you know what has dependencies and just execute this as fast as you can. Um if you need to use different work trees, feel free. If you want to just spin up a bunch of different sub agents, feel free. But what's really important is that you're having the agents write progress back to either the build plan or each agent independently is creating a new folder and is saying, "Hey, here's what I've done. Here's what I'm still working on." So that you can always check in on them to see where they are to make sure that they're not overwriting each other and to make sure that you're constantly verifying what they're doing and giving them feedback. So your end deliverable to me is basically a finished V1, a finished P that we can get in there and we can test and see if we're ready to kind of like move on to the next phase of this thing. A few things I imagine potentially getting in your way would be setting up like a superbase connection because you might not have that API key. Setting up the Stripe integration if there's anything like that. Build out the supporting infrastructure around it. Build out the plumbing and then you can basically flag me at the end when you finished and say, "Hey, I need this API key and I need this API key." But that's the only thing I should have to do. You should be able to then take the API keys and set up everything else that has to do with the front end and the back end. You should be thinking about how people pay and what it looks like when they get onboarded, where their accounts get made, how that happens in the back end, and how we as admins are going to manage the infrastructure in the back end of our users and our databases and things like that as well. This has to be idiot proof on the customer journey side as well as on the admin side. So that's your goal. Go ahead and do whatever you need to do to accomplish these tasks.
```
**Hive:** `/goal` → bounded golden-test-loop. PM does not execute. Max 3 streams. Keys = HITL flag, sandbox first. No live Stripe.

### 6. Codex break-the-app — Watchdog remap (CAPTION ~55:02)
```
Okay, Codex, here's what I want you to do. This is V1 of client pack. You can see it open in a local host. What I want you to do is I want you to use your computer use and I want you to click every button. I want you to play around with this. I want you to try to break this. I want you to try to find bugs. Your goal is to tell us what needs to be fixed so that we can fix this before any customers actually come in here. I want you to try to upload different formats. I want you to try to generate transcripts or sorry, generate decks. I want you to play with different buttons and find where there might be either like a visual bug or an actual technical bug, a limitation in the functionality of this app. And once you've tested this um you know through a bunch of different workflows and tried to find edge cases and you either have found a bunch or you found none, once you feel confident that you've tried enough stuff to confidently say that this version is ready, then go ahead and let me know what we need to change.
```
**Hive:** Watchdog / golden-test-loop on a **different node** than Forge. Codex desktop **BLOCKED**. Playwright / box browser / CloudAgent computer-use **WORKAROUND**. Agent saying done is not done.

### 7. Onboarding + Stripe sandbox — Plumbing (CAPTION ~56:24)
```
Now what I'm curious about from you is once again you're Fable 5. You're the orchestrator. You don't execute anything. You're basically just um you're basically just orchestrating a team of sub agents, opus workers, sonnet workers to help you build this out and you are the project manager who's responsible for everything. I'm now curious about the onboarding flow. We have to figure out what does it look like from the beginning into the actual dashboard when a client comes in and they pay, you know, they subscribe and then they onboard, they get logged in. Where do we hold all that data in the back end? And what does that journey look like for the customer? Because it has to has to be quick. It has to be easy and seamless. Otherwise, we're going to lose paying customers in that onboarding process. So, that's what I want to build out here. And I want to make sure that I'm giving you everything you need as far as like Superbase integration, Stripe, whatever you need here. Let's start building out that whole onboarding and the payment processing flow.
```
Tape also: isolated work trees so breaker stays untouched; Stripe **sandbox** before live (`No real transactions will be processed`); `$39/mo` = HIS UNVERIFIED. **Hive:** Forge + HITL. Sandbox keys only. Live flip is `HITL-LIVE-STRIPE.md` QUEUED — not this skill.

### 8. Fix blockers only (CAPTION ~70:00)
```
okay cool. So now you are in charge of managing all of these things that you found. You're in charge of fixing the blockers and fixing the high priority bugs for now. Let's just leave the medium priority bugs alone. But what I want you to do is you need to utilize a team of agents. I want you to be the orchestrator. You're the project manager. I want you to utilize sub aents. I want you to utilize agent teams. Whatever you need to do to delegate the work around so that each agent is specifically focused on one very specific thing so that it can do that job really well. I also want you to be wary that no agents are overwriting each other's work. I also want you to know that right now in a different session we have claude code building out sort of like the onboarding flow and the payment flow. So don't mess with any of that. Only attack the actual blockers and bugs that you found in our app. Ultimately, you are responsible for this. If it doesn't go well, I will blame you. So, you have to verify what the sub agents that you are orchestrating. You have to verify that what they're doing is correct. So, your goal is to fix all the blockers and fix the high priority bugs and verify that they are truly fixed. You can use computer use, whatever you need to do. And then once you're confident that all of that has been fixed and it's customer ready, at least in your scope of work, then report back to me.
```
Tape blockers (FACT-as-stated): review/sign-off not enforced; regenerate with empty/negative findings; unknown ROI → client-facing 0x slide. **Hive:** breaker node may fix *its* blockers; do not collide with Plumbing stream. Still verify after. Still max 3 streams.

## Pair
hive-smarter-loop · golden-test-loop · verify-then-done · grill-me-into-prompt · four-blank-before-build · local-push-to-talk-dictation · session-bootstrap

## Wave Y 2026-09-09 (`yt:IVx8OSMbTss`)
- A–E verified PARTIAL with fresh VTT+26 chapter stills; delta to `packets/nate-saas-IVx8OSMbTss/`
- Live Client Pack/Stripe still **BLOCKED**; Fable/Claude/Glaido **NO-SKILL**

## YT daily stamp 2026-10-03 — Solo builder validate→stack→monetize (`yt:A4_TFHzqAAg`)

Packet: `/workspace/research/youtube-daily/l2-20261003/A4_TFHzqAAg/` · Cap≤1 A–E demonstration.
Creator: Fireship · *How to get rich as a solo software developer*.

### Steal (FACT → hive recipe)
| Rule | Hive path |
|---|---|
| Validate before deep build; users ASAP; ideas cheap | Pain+Promise locked **before** Product; gate in `recreation/solo_builder_gate_demo.py` |
| Marketing / business model **before** code | Packaging one-pager required; building mode = waitlist only (GTM HOLD) |
| Sticky productive stack > trendy Twitter stack | Prefer owned Next/Astro+Supabase; remap his SvelteKit+Firebase |
| Design order functional→beautiful→unique; Mobbin | Creative + Mobbin MCP |
| Backend: write→job→status→realtime; no client vendor keys | Plumbing Forge; secrets Tier-3 |
| DB: document only if simple; else Postgres safest | Default Supabase/Postgres |
| Free-trial tokens + Checkout + webhook credit | Sandbox Stripe only; live = HITL-LIVE-STRIPE + exit building mode |
| Cost-plus "$0.69" comedy / Levels $3M / $20M plugin | **UNVERIFIED** — not ours |

### PROVE / WORKAROUND / BLOCKED
| Item | Class | Note |
|---|---|---|
| `l2-20261003/A4_TFHzqAAg/recreation/solo_builder_gate_demo.py` exit 0 | **PROVE** | 6/6 cases: marketing gate, pain gate, Firebase remap, live-Stripe block, client-key block |
| SvelteKit + Firebase ("SKIT") as hive face | **WORKAROUND** | → Next/Astro + Supabase/Postgres + Grok Bot + Cursor |
| ElevenLabs voice clone in product | **BLOCKED** | would work if we had ElevenLabs key + policy OK |
| Live Stripe Checkout / SendGrid receipts | **BLOCKED** | would work if HITL-LIVE-STRIPE approved and building-mode exited |
| Title alone / "we already have Stripe" mastery | **FAIL** | must run validation+marketing gates |

### Prompt (validation gate)
```
Idea: …
Primary pain evidence (our data / URL / comments): …
Avatar: …
Distribution path (organic channel we own): …
Reversible validation action in ≤7 days: …
Marketing plan one-pager (before any Forge build): …
Stack hypothesis (sticky / owned / no-rent): …
HITL: building mode — no live Stripe, no blast.
```

Platform: **Grok Bot + Cursor**. Install: **none (process-only)**. NO mint. Pair: stack-pick · client-delivery-checklist-grok-first · host-automations-outside-subscription.
