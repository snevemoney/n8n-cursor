# Big Boss — Ek1NBfnnTH0
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Ek1NBfnnTH0/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Ek1NBfnnTH0/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 25:03, 5985 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (json3 present; no VTT in the take). Visual-only gaps: OS audit markdown, red/yellow/green scorecard, Herc 2 tree, router `CLAUDE.md`, Hyper Agent sponsor council, and the skill.md preview are described, not seen.

Beats, in order:

1. Hook: #1 question is how his AI OS is organized (routing, wikis, client folders). Bad org → hallucinations in answers, skills, and automations. Five tricks to stay accurate while adding data weekly.
2. Demo: older Hercule + free **OS audit** skill. Reads project + routing; lists ~10 issues and ~10 fixes; **asks yes/no; does not change anything yet.** Writes `audits/` markdown. Skool CTA while it runs.
3. **Four context failure modes:** (1) **Poisoning** — false fact in context, agent repeats it (email to customer). Fix: verify / second search / live DB / HITL if not sure. Easiest. (2) **Bloat** — too much loaded; needle in haystack; bleed. Harder. Tie to expertise vs situational. (3) **Confusion** — irrelevant or missing; classic hallucination (fills gaps). (4) **Clash** — two truths (March always-refund vs June never-refund); agent picks old, new, or invents.
4. **Two context types:** expertise vs situational. Maps to his four C’s: context≈expertise (always-on rulebook: who you are, goals, policies — principal), connections≈situational (teacher’s seating-chart facts — load just-in-time). Yesterday’s support ticket should not live in every run.
5. Sponsor: Hyper Agent (Airtable) — cloud machine per agent; he published a 5-persona council; $1,000 credits via his link **UNVERIFIED**. On-tape vendor.
6. Audit result (~2 min): knowledge current through June 29 (almost a month stale). Routing integrity red (OTA mis-route); index truth red (index 55 folders / disk 79); freshness red; bloat yellow; hygiene red; context placement red. “What would wrong-answer you today” — post-June 29 questions get a confident June answer. Fix list **await approval**: finish in-flight, routing+index, data catch-up, durability crons (Fireflies, YouTube, archive, quarterly reruns).
7. Skill guts: “is your AIOS still true?” Indexes/wikis are **claims**. Audit checks claims vs disk. **Read only — never fix/rename/delete.** Fan-out one explore sub-agent per check on 100+ folder projects. Checks: routing integrity (forward + reverse), index truth, freshness (fresh/drifting/frozen/retired/on-demand), memory, bloat/dup/org.
8. **Tip 1 — CLAUDE.md as router.** One big Herc 2 folder (easy GitHub backup). Nested projects can have their own md. Root md is almost purely “if you need X go here” (wiki, hot cache, index, GP fallback, memory, tools, keys, skills, decisions, templates, references, projects, other worlds). Other worlds = standalone repos. Projects = largest; every chat/deliverable lands there. Brand assets at root. Files/folders → Hermes/Codex/anything. Flat vs deep doesn’t matter if routing works.
9. **Tip 2 — AI audits itself.** Weekly/monthly “look through everything, suggest.” Claude suggested splitting YouTube vs meeting wikis (less bloat, cheaper). Formal skill optional. Wrong = ignoring wrong answers. Self-test: find a thing in Finder without search/Claude.
10. **Tip 3 — automations to update data.** If you pull the same feed every Monday/Tuesday, cron it (Fireflies, Q&A). Not JIT if it’s really weekly-evergreen.
11. **Tip 4 — segment knowledge.** Distinct growing nodes get their own wiki. Clients: internal folder (dates, contract, discovery, price) inside the OS; **deliverable repo separate** (they can collaborate) with a pointer back. Situational; wrong = wrong answers.
12. **Tip 5 — backtrack.** On a miss (“I don’t have that” but you know it’s there): don’t only say “never again.” Make it replay the search, prove the miss, then patch routing/move files.
13. Team sync: still a **people/habit** problem (Drive/Notion/GitHub). Master your own first.
14. Close: like/CTA.

Off-topic / not skipped: Hyper Agent sponsor; $1,000 credits; Fireflies as the meeting pipe.

## B. Atomic Knowledge

### Four ways context lies
- **Claim:** Wrong answers from context are poisoning, bloat, confusion, or clash — not “the model is evil.”
- **Reasoning:** Agent repeats or fills. March vs June refund is a clash, not a vibe.
- **Mechanism:** Name the mode → pick the fix (verify, shrink, fill the hole, pick a winner date).
- **Evidence:** Refund policy example; audit’s “confident June state.”
- **Conditions:** You must be able to see the sources. Exceptions: poisoning is easiest only if you have a live check.
- **Action:** Watchdog labels the mode. HITL if it would leave the building (doctrine 7).
- **Confidence:** high
- **Source:** `Ek1NBfnnTH0` @ UNKNOWN — “poisoning, bloat, confusion, and clash”
- **Epistemic:** SOURCE

### Expertise stays; situational is just-in-time
- **Claim:** Always-load the rulebook. Fetch the seating chart when the question needs it. Parking yesterday’s ticket in every run is how you bloat/clash.
- **Reasoning:** Principal vs teacher. Four C’s: context vs connections.
- **Mechanism:** Live lookup at 2pm Thursday, not a paste into memory.md.
- **Evidence:** Support-ticket example; pairs with `DTCyvo6cC54` evergreen vs leash.
- **Conditions:** JIT needs a working fetch path. Exceptions: if the “situational” fact became policy, promote it.
- **Action:** Don’t wiki-ingest the inbox.
- **Confidence:** high
- **Source:** `Ek1NBfnnTH0` @ UNKNOWN — “situational context is things that you need just in time”
- **Epistemic:** SOURCE

### Audit is read-only and waits
- **Claim:** Indexes and wikis are claims. The audit diffs them to disk and **does not fix** until yes.
- **Reasoning:** An eager helper that renames 79 folders is a new clash.
- **Mechanism:** `audits/` report + await approval. Fan-out checks on big trees. “What would wrong-answer you today.”
- **Evidence:** June 29 stale; 55 vs 79 folders; red routing.
- **Conditions:** Approval is the human. Exceptions: durability crons still need HITL if they send.
- **Action:** Forge/Watchdog: executed check, then ask. Doctrine 6.
- **Confidence:** high
- **Source:** `Ek1NBfnnTH0` @ UNKNOWN — “Read only, never fix, or rename or delete”
- **Epistemic:** SOURCE

### Router, segment, cron, backtrack
- **Claim:** Five tips are one machine: map where things live; split growing corpora; automate the feeds you already trust; on a miss, replay then patch.
- **Reasoning:** Organization is how you stop hallucinating into skills and customer text.
- **Mechanism:** Root md as ToC; client-internal vs client-facing repos; weekly Fireflies; “show me why you missed.”
- **Evidence:** Claude suggested the wiki split; Finder self-test.
- **Conditions:** No canonical tree. Exceptions: Hyper Agent council is a sponsor, not tip 6.
- **Action:** Hive folders already exist. Steal the audit+backtrack, not his tree.
- **Confidence:** high
- **Source:** `Ek1NBfnnTH0` @ UNKNOWN — “all that matters is that you have the right routing rules”
- **Epistemic:** SOURCE

## C. Mental Models

- **Indexes are claims, not truth.** **SOURCE**
- **Eager fix without approval is a new bug.** **SOURCE**
- **Wrong answers ignored are the only real fail.** **SOURCE**
- **If you can walk it, the agent can — if the map says so.** **SOURCE**
- **Team OS is habits.** **SOURCE**
- **Sponsor council is not the lesson.** **INFERENCE**

## D. Procedures

1. **Name failure modes** when an answer is wrong (poison/bloat/confusion/clash).
2. **Split** always-on expertise vs JIT situational.
3. **Run a read-only audit** (routing, index vs disk, freshness).
4. **Print “what would lie today.”**
5. **Approve a fix list** — then fix. Never silent rename.
6. **Keep the root file a router.**
7. **Segment** any corpus that is growing and distinct.
8. **Cron only evergreen feeds** you already decided to keep.
9. **On a miss: backtrack → prove → patch routing.**
10. **Finder self-test** without the agent.

**Qualify / frame:** OS hygiene tape. Hyper Agent is a paid read. Clients parked.
**Objections:** “Just let it clean up” — read-only first. “Put client repos inside the OS” — he splits internal vs facing.
**Avoid:** Installing the audit skill from Skool as a Claude dependency. Auto-cron that sends. $1,000 credits as FACT.
**When to change:** If answers are wrong and you only shrug, that is the fail.

## E. Examples

**Situation:** Index says 55 folders, disk has 79.  
**Action:** Audit marks index truth red; waits.  
**Reasoning:** Claims vs reality.  
**Outcome:** Fix list, not a silent rewrite.  
**Lesson:** Read-only is the stop. Implicit rule: eager cleanup is clash.

**Situation:** Knowledge frozen June 29, asked in late July.  
**Action:** “What would wrong-answer you today” = confident June.  
**Reasoning:** Freshness is a lie mode.  
**Outcome:** He can see the landmine.  
**Lesson:** Stale + confident is poisoning’s cousin. Implicit rule: date the claims.

**Situation:** Agent says it can’t find a file he knows is there.  
**Action:** Backtrack the search, then patch the router.  
**Reasoning:** “Never again” without a replay doesn’t teach the map.  
**Outcome:** Routing update.  
**Lesson:** Prove the miss. Implicit rule: don’ts come from a walk, not a scold.

## F. Decision Rules

- If the agent would email a fact → verify or HITL (poisoning).
- If two policies disagree → date the winner (clash).
- If a ticket is one-off → JIT, don’t ingest (bloat).
- If audit wants to rename → wait for yes.
- If you pull the same feed every week → cron the ingest, not the send.
- If you missed → backtrack before you nag.
- Optimize: true claims vs disk.
- Refuse: Hyper Agent install; silent cleanup; client-facing repo merged into the hive without a pointer policy.

## G. Contrarian

- Against “more context is more smarter”: bloat/clash.
- Against “let the agent fix the OS”: read-only first.
- Against “there is a correct folder tree”: only wrong answers are wrong.
- Against “team sync is a vendor pick”: habits.

## H. Assumptions

**His:** One mega-folder + GitHub is enough; sub-agent fan-out is safe read-only; Fireflies crons are evergreen; Skool skill is the conversion; Hyper Agent credits are real.

**Ours:** Captions complete enough (5985 words). Audit unseen. Folder counts / $1,000 **UNVERIFIED**. Domain: personal OS. Clients parked. Cursor + Grok.

**Falsifiers:** Read-only skill still writes. Cron ingest becomes a firehose. Client pointer leaks secrets into the facing repo.

**Disagreement (keep labeled):** We will not install Hyper Agent or his Claude audit skill. The **four failure modes**, **read-only audit**, **JIT vs expertise**, and **backtrack-then-patch** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- How often does he actually approve the whole fix list vs cherry-pick?
- Sibling `DTCyvo6cC54` — pair for evergreen vs JIT.
- What is “GP fallback” in the router? Named, not explained.

## J. Connections

- **SYSTEM SYNTHESIS** → `DTCyvo6cC54` (router, L2, ingest control).
- **SYSTEM SYNTHESIS** → `XNQBCRcwXV4` (keep the map, loosen recipes).
- **SYSTEM SYNTHESIS** → doctrine 4 (don’ts from misses), 6 (don’t accept looks-good), 7 (email).
- **SYSTEM SYNTHESIS** → `wiki-ingest` · `golden-test-loop` · `ask-principal`.

## K. Future-Use

- “What would lie today” as a morning Watchdog line (unassigned).
- Client-internal vs facing split as a future Path A folder rule (unassigned; clients parked).

## Steal / Operate-never

### Machine: Label the lie → read-only audit → approve fixes → router + segment + backtrack
- **Epistemic:** SOURCE (tips) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (wrong answer or weekly hygiene) → name poison/bloat/confusion/clash → run read-only claim-vs-disk audit → print what would lie today → Evens approves the fix list → patch router / split a wiki / cron only evergreen feeds → on the next miss, replay then patch → Finder walk test → no send from a cron.
- **Questions / signals:** “Which lie mode?” “Does the index match disk?” “Is this expertise or JIT?” “Show me the search you ran.”
- **Qualify / frame / objections:** Hygiene tape + sponsor. Objection: let it clean — he waits. Objection: install Hyper Agent council — on-tape vendor.
- **Procedure:** D steps 1–10. Checkable stops: (1) mode named, (2) audit file, (3) approval, (4) backtrack on miss.
- **Example that proves it:** 55 vs 79 folders, await approval. Lesson: claims are not truth.
- **Why it works:** Org failures look like model failures. Eager fixes create clash. JIT keeps the window small. Conditions: human yes. Exceptions: sponsor; numbers unverified.
- **Conditions / exceptions:** Cursor + Grok only. Claude/Fireflies/Hyper Agent/Skool on tape. Clients parked.
- **Operate-never payload:** Silent rename; install his skill/vendor; quote $1,000 credits as FACT; inbox ingest; new hunt.
- **Hive run (existing skills only):** `wiki-ingest` · `context-docs` · `golden-test-loop` · `ask-principal` · doctrine don’ts.
- **Source:** `Ek1NBfnnTH0` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude audit skill / Hyper Agent / Fireflies / Skool
- Auto-fix the tree
- Quote $1,000 credits as FACT
- New `icp_id` / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not let an audit skill rename the company.

- **Done** on hygiene: claim-vs-disk report + approved fix list. Not a silent cleanup.
- **Delegate without being asked:** Watchdog prints what would lie today; Librarian patches only what Evens keeps; HITL if a “fact” would go to a customer.
- **Skeptical review:** Five “simple tips” plus a sponsor council. The machine is read-only then yes.
- **One system this take:** indexes are claims.
- Live hunt stays parked.
