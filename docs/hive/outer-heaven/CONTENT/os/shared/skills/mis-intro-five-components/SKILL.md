---
name: mis-intro-five-components
description: >-
  Use when defining an information system, distinguishing it from computer science, evaluating build vs buy options, or discussing the impact of IT on competitive advantage. Consider constraints like ethics, privacy, IP, globalization, and the digital divide in your analysis.
merged_from: [grad-mis-applications-strategy-security-decision, strategic-it-when-whether-then-strategy]
---

# MIS intro (clustered)

**Use when:** a task asks what an information system is, how MIS differs from CS, which component to pull for advantage, how to secure information at a manager's level, whether to build or buy / adopt ERP / run BPM, whether IT is a commodity, or how ethics and the digital divide constrain a design.

**Do not use when:** the job is writing exploits or attack procedures, administering a specific ERP tenant, teaching a programming language, running a Saylor (or any) exam, or treating BUS206 as CISSP/CS406.

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". BUS206's six units are one argument: components → eras → CIA → strategy resolved by process (with people who can run it) → ethics/globalization/divide as constraints → trends as a watch-list.

## 0. Hygiene

- Label **school**. This is the **standard MIS intro** school (Bourgeois 2019, Saylor BUS206, Laudon-adjacent). Shared with almost every undergrad business-IS survey. It is not the only IS theory (sociotechnical, critical IS, design-science, security-engineering). Say so if the user is not inside this course.
- Label **claim vs data**. Moore's Law prices, Nielsen 2006 "economic divide is moot," Carr 2003, Meeker 2016, GDPR 2018, Target Canada 2015, Walmart sidebar figures are **course-era claims**. Re-fetch if the user needs current numbers.
- IS ≠ IT department ≠ computer science. CS can ignore people and process; MIS cannot.
- No exam items. No attack steps, payloads, or bypasses. CIA is a manager's checklist, not a pentest.
- CC BY-NC textbook: summarize, do not dump chapters.

## 1. Procedure — answer an MIS question in six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Five components (always)

An information system is interrelated components that **collect, process, store, and distribute information** to support decision making, coordination, control, analysis, and visualization.

Name all five. The first three are technology; the last two are why this is not CS:

| Component | What it is | Failure if ignored |
|---|---|---|
| **Hardware** | Tangible devices (CPU, board, RAM, storage, I/O; also phones, sensors) | Commoditized: clones made PCs a poor differentiator. Buying faster boxes rarely *is* the strategy. |
| **Software** | Instructions: OS (hardware ↔ apps) and applications. Cloud/SaaS is a delivery model, not a fifth OS. | Capex→subscription, vendor patches/backups; you pay with residency, lock-in, connectivity. |
| **Data** | Facts. Useless until aggregated/indexed. MIS turns data → information → (with people) knowledge. | Hoarding data is not an advantage. Integrity/availability failures make "more data" worse. |
| **People** | Users, analysts, developers, admins, CIO, customers/suppliers who touch the process. | A technically perfect system that the org will not run is not an IS. |
| **Process** | Series of steps to a business outcome. The lever firms actually pull for advantage (BPR/BPM/ERP). | Automating a bad process paves the cow path. |

**Networking/communication** is the usual sixth: technically hardware+software, but in a hyper-connected world a standalone IS is the exception. Mention it when the system crosses a boundary (EDI, VPN, IoT, global firm).

**MIS specifically:** collect data, turn it into information, distribute it in a form managers can use. It **requires humans**. It does **not** automate decision-making outright. DSS can *support* semi-structured decisions; structured reorder-points can be automated; unstructured first-time calls cannot be "the system decided."

If asked "which component matters most for competitive advantage?" in this school, the answer is **process** (not data, not hardware). Data is the attractive wrong answer.

### Check B — Era (only when history, "how did we get here," or matching is in play)

Do not recite the table unless the prompt is historical or diagnostic ("why do we have ERP / browsers / phones?").

| Era | Signature | What it unlocked |
|---|---|---|
| Mainframe (1950s–70s) | Room-sized, specialized crew, time-sharing | MRP / data processing; only large orgs |
| PC (1980s) | Apple II, IBM PC + clones, MS-DOS/Windows | Affordable IS for small business; **standalone** |
| Client-server (late 80s–90s) | PC + LAN + server; SAP-class ERP | Shared DB, email, intra-firm collaboration |
| WWW (mid-90s–early 2000s) | Browser + domain name; commercial Internet 1991 | Inter-firm + consumer; then dot-com boom/bust (fiber left in the ground) |
| Web 2.0 (mid-2000s) | Interactive, UGC, social | Disintermediation (travel agents, video rental, newspapers) |
| Post-PC (now) | Smartphone/tablet + cloud | PC remains in the business back office; the device is a channel, not the store of apps/data |

Diagnostic use: if they are solving a 1992 problem with a 2026 tool (or the reverse), say so. The Internet is older than the IBM PC; do not reverse them.

### Check C — CIA triad (security as a constraint, not a chapter)

Before praising a process, ask whether the information can stay **C, I, and A**. Tradeoffs are allowed; silent drops are not.

| Letter | Meaning in this school | Manager's tools (intro level) |
|---|---|---|
| **Confidentiality** | Only NTK parties see it | AuthN (know / have / are; MFA), access control (**RBAC** over sprawling ACLs), encryption (symmetric shared key vs public/private), VPN for remote insiders, physical locks, policy |
| **Integrity** | It still represents what is intended (malice *or* accident — power surge, wrong edit) | Access control, backups + tested restore, change discipline, not "the hacker" only |
| **Availability** | Authorized people can use it in an **appropriate timeframe** (trader ≠ daily sales report ≠ 24/7 cart) | Backups, UPS, offsite, hot site, redundancy, firewall/DMZ as *perimeter hygiene*; IDS **detects/logs**, it does not itself block |

Policy is the **starting point** (SANS: brief, high-level, CIA-based, with teeth). Usability vs security: an impossible password gets written on a sticky note and *lowers* C.

Stop at this layer. Do not provide exploit, bypass, or payload guidance.

### Check D — Process as the advantage lever (strategy + BPM/ERP + build-vs-buy)

This is the course's resolution of "does IT matter?"

**Strategy frame (run fast):**

1. **Productivity paradox** (Brynjolfsson 1991): spend did not show up in the stats (mismeasurement, lags, redistribution, mismanagement). Later work: IT *can* pay, unevenly, often in organizational "soft" gains.
2. **Carr (2003):** ubiquitous IT is a commodity like electricity — manage cost, uptime, risk; do not expect differentiation from the tool itself.
3. **Porter:** advantage = **cost** or **differentiation**, above-industry profits, sustained. Value chain (primary: inbound, operations, outbound, sales/marketing, service; support: infrastructure/ERP, HR, tech development, procurement) is the map of *where* IS can change cost or uniqueness. Five forces + the Internet generally **lowered average industry profit** (more substitutes visible, more suppliers, more customer power, easier entry, more rivalry). Walmart Retail Link is the course's "IT *did* matter" sidebar — suppliers manage inventory on Walmart's data; that is a **process** design, not a server purchase.
4. **Brynjolfsson & McAfee 2008:** IT **amplifies** firm differences; value is the process innovation on the platform; executives cannot delegate that.
5. Smith & Fingar (course-adjacent): *IT Doesn't Matter – Business Processes Do.*

A **strategic IS** tries to do at least one of: lower cost, differentiate, focus a segment, enable innovation. EDI, collaboration suites, and DSS are examples, not a taxonomy you must force.

**Process checklist (use this on any "how do we gain advantage with systems?" prompt):**

1. Name the **outcome**, not the task list (Hammer).
2. Document the as-is (checklist if linear; BPMN/DFD/UML if there are decisions). If you cannot show the process, you cannot improve it (ISO 9000 posture: tell me / show me the doc / prove it happened).
3. Decide **BPM vs BPR**:
   - BPM = plan, document, implement, distribute — with IT — for processes that are essential, cross-department, judgment-heavy, or circumstance-dependent. Payoffs this school claims: employee empowerment, built-in metrics, enforced best practice, consistency.
   - BPR = do not automate the 1950s flow. Redesign from zero for *dramatic* gains. Hammer guidelines worth reciting: outcomes not tasks; users of the output do the work; merge information-processing into the work that creates it; treat dispersed resources as central; link parallel work during, not after; decisions at the work + controls in the process; capture information once at the source.
   - BPR's bad name = used as a layoff slogan. That is not the method.
4. **ERP test**: centralized database + modules that run the firm + vendor best practices. Ask:
   - Are we buying the vendor's process (commoditized, cheaper to stay current) or forcing unique process (customization you must re-apply on every upgrade)?
   - Do we have one version of the truth, or silos the ERP is supposed to kill?
   - Can the org absorb the implementation (Target Canada: timeline, testing, training — miss any, the supply chain becomes fiction)?
5. **Build vs buy** (run even if they already said "buy"):

   | | Buy / SaaS | Build (or heavy customize) |
   |---|---|---|
   | Cost / speed / bugs | Usually cheaper, days-to-weeks, already shaken out | Months–years, you own the defects |
   | Differentiation | Competitors can buy the same thing | You can encode a unique process |
   | Upgrades | Vendor's problem, until you customized | You own the roadmap |
   | Integration | Needs a systems integrator / APIs | Needs discipline so you do not recreate shadow-IT islands |
   | When | Commodity process, not how you win | The process *is* the product, or no package fits |

   Web services blur the binary: build the app, buy the map. End-user computing (spreadsheets that feed the GL) is **shadow IT**: faster and closer to the user; also duplicated, untested, governance-blind. Set guidelines; do not pretend it will not happen.

6. **Implementation policy** (after the system exists):

   | Policy | Speed | Cost | Risk |
   |---|---|---|---|
   | Direct cutover | Fastest | Lowest | Highest |
   | Pilot | Contained | Medium | Blast radius limited |
   | Parallel | Slow | Highest (dual ops) | Lowest |
   | Phased | Medium | Medium | Medium (function by function) |

   Pick from complexity + risk appetite. Pair with change management (communicate before, support after). Quality triangle: only two of time / cost / quality. Conway's Law: the system will look like your org chart / communication paths.

7. Methodology picker (only if they are *creating* software): waterfall/SDLC for large, known, high-impact, change-hostile work; RAD for smaller user-heavy; agile for incremental quality with a working slice each time-box; lean/MVP when the requirements themselves are the experiment (pivot). Waterfall vs incremental is the Unit 5 contrast; do not turn it into a religion.

### Check E — People (LO 2, short)

Do not skip, do not over-build. Ask who designs, who operates, who manages, who uses, and **where IS sits** (central CIO vs departmental shadow shops vs ERP as the recentralizer). The systems analyst is the bridge (business need ↔ system). ERP needs owners who keep the package current and talk to the business. If the people component is "IT will handle it," the process lever will not move (Brynjolfsson & McAfee: cannot delegate).

### Check F — Constraints: ethics, IP, privacy, globalization, digital divide

A process that "wins" by violating these is not a valid answer in this school.

**Globalization:** Friedman 3.0 (individuals on a PC+fiber+workflow platform) is the course's vivid model. Ghemawat is the brake — most activity is still domestic. Advantages of the global firm: labor anywhere, 24-hour handoff, bigger market. **Constraints:** bandwidth variance, labor law, product/ad legality, language/customs, shipping. Near-sourcing can beat far-outsourcing. Encode as design constraints, not as a TED talk.

**Digital divide (Nielsen, 2006 — label the date):**

1. **Economic** — can they afford access? Course claim: largely moot (cheap smartphones). Treat as a claim, not 2026 evidence.
2. **Usability** — could not use it if it were free (literacy, seniors, complexity). We know how to help; little profit in it.
3. **Empowerment** — hardest. Few contribute, few search well, few see ads vs organic; people accept defaults.

Shipping devices solves (1) at best. If the proposed IS assumes empowered users on fat pipes, name the excluded class.

**Ethics:** new capabilities (perfect copies, instant profiling) outrun old norms. A **code of ethics** (ACM as the course example) clarifies group standards; it is not law; it lags the tech; it may not match every member. AUPs are the operational form.

**IP — protect the tangible result, for a limited time:**

- Copyright: attaches on creation; copies/derivatives/performance/display/distribution. Fair use = four factors. First sale ≠ right to copy. DMCA anti-circumvention + safe harbor. CC is a license (this textbook is CC BY-NC), not public domain.
- Patent: new, non-obvious, useful, *applied for*; ~20 years US; includes business processes; trolls exist.
- Trademark: source identifier; TM vs ®; lives if used and defended; dies by genericide.

**Privacy:** control over information about oneself. **PII** — minimize. **NORA** — aggregation can identify without any one field being "the SSN." US: opt-out default + COPPA/FERPA/HIPAA. EU: privacy as a right, opt-in, GDPR, transfer limits. Do not treat "the data is already public" as permission to profile.

When the prompt is a future-tech toy (wearable, IoT, 3-D print, drone, blockchain, VoIP, virtualization, cloud, sensors): name the trend, then run C and F. IoT keywords: independent, interconnected, embedded; default passwords and eavesdropping are the intro-level risks. Blockchain = open distributed ledger, smart contracts, governance questions — not an automatic ethics win. Meeker is a **method** for refreshing the watch-list, not a 2016 scoreboard.

## 2. Worked micro-patterns

**"What is an information system / MIS?"**
Check A in one paragraph. List five components. Add: people+process distinguish it from CS; MIS informs managers and does not replace them.

**"Which component should we invest in?"**
If they mean competitive advantage: **process**, then the people who will run the new process, then the data/software/hardware that make that process real. Hardware spend without process change is Carr's commodity trap.

**"Does IT matter?"**
Carr: the *tool* is a commodity. Porter/Brynjolfsson/Smith-Fingar: IT matters when it is the substrate of a process you can actually differentiate or cheapen, and management propagates that process. Cite Walmart as process+data sharing, not as "they bought computers."

**"Should we buy SAP / this SaaS?"**
Run D.5 + D.4. If the process is how we win, buying the same module as the rival commoditizes us unless we configure something we are willing to maintain. Recite SaaS tradeoffs: vendor patches and backups vs residency, lock-in, connectivity.

**"Waterfall or agile?"**
Known, large, high-impact, regulators want a document trail → SDLC. Discovery, users in the room, small blast radius → RAD/agile. Idea not yet proven → lean MVP. Then pick an implementation policy (D.6) separately — methodology ≠ cutover plan.

**"Is this secure enough?"**
Name C, I, A against the actual timeframe and audience. Map each concern to a control family. Stop. If they ask how to break it, refuse.

**"We're going global / we're closing the digital divide."**
Friedman for the platform story, Ghemawat for proportions, then the constraint list. Divide: do not claim a laptop drop solved usability or empowerment.

**"Can we scrape / train / profile this?"**
PII minimization, NORA, COPPA/FERPA/HIPAA/GDPR as applicable, IP (copyright of the source, patent if a process, trademark if branding). ACM: no unauthorized use of others' systems or data.

## 3. Adjacent skills (do not merge)

- **Strategic IT allocation / when to fund a new initiative** → BUS303.
- **Graduate MIS / social media / decision-making overlay** → BUS642.
- **BI, warehousing, analytics practice** → BUS250 / BUS611 / BUS610.
- **Information security engineering** → CS406 (CIA is the shared vocabulary; the controls go deeper).
- **Software engineering lifecycle as an engineering discipline** → CS302.
- **Databases as a CS subject** → CS403.
- **Practical cloud/SaaS ops** — not in BUS206; this skill only names the managerial tradeoffs.

If a prompt needs both "what is an IS?" and a deep security or data-engineering design, run this skill first for the frame, then hand off.

## 4. What not to encode from this course

- Exam items, quiz banks, discussion-prompt keys, or "how to pass the Saylor final."
- Chapter dumps from Bourgeois (CC BY-NC — summarize).
- Exploit PoCs, malware, credential theft, or attack procedures (including "lab" framing).
- Vendor-specific ERP configuration, EHR product advice, or live Meeker/Gartner numbers as if current.
- Health-IT article conclusions not yet harvested from the LMS.

---

## Merged from `grad-mis-applications-strategy-security-decision` (2026-10-11)

- Original description: Frame a graduate applications-of-MIS question using the Saylor BUS642 school: evaluate how technology has integrated into the management discipline; analyze how MIS impacts strategic planning; evaluate enterprise-level MIS trends including internet and social media management; evaluate IT/software solutions for the enterprise through data-driven analysis; analyze the decision-making process used for MIS protection; analyze MIS impact on the global landscape; evaluate the differences between data and data management; and evaluate the effect of MIS on the management decision process. Use when an MMGT-track prompt asks a manager to align technology with strategy, pick a software path, turn a security protocol into a protection decision, or use MIS to decide. Do not use for BUS206 undergrad MIS, BUS611 DBMS-and-plan, BUS303 strategic IT, BUS610 advanced BI, BUS250 intro BI, BUS607 D3M, CS403/CS406, MMGT608 exam-taking, ACE-credit promises, Bourgeois/Gallaugher dumps, or exam reconstruction.
- Unique content carried: one section per course code

# Graduate applications of MIS: align, secure, decide (clustered)

**Use when:** a task asks how a manager should treat **technology as part of the management discipline** — align solutions with strategic goals, read enterprise MIS trends (including internet/social), evaluate software/IT solutions through data-driven analysis, turn security-protocol results into protection decisions, read the global landscape, distinguish data from data management, or use MIS to improve the management decision process, including communicating with technology stakeholders and securing infrastructure — in the Saylor BUS642 **graduate** applications-of-MIS school.

**Do not use when:** the job is reconstructing or taking a Saylor (or any) exam, dumping Bourgeois/Gallaugher/CISSP item banks, running **BUS206** undergraduate MIS (five components / CIA / does-IT-matter), **BUS611** graduate data management (pick DBMS / write the plan), **BUS303** undergrad strategic IT, **BUS610** advanced BI, **BUS250** intro BI, **BUS607** D3M as a *course*, **CS403** CS-database or **CS406** security specialty, treating the free 70% certificate as **MMGT608** 80% proctored exams, promising ACE/transfer credit, or inventing **MBA642**.

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". BUS642's ten live units are one argument: **IT is a management discipline — align it with strategy, evaluate solutions, decide protection, and use it to decide.**

## 0. Hygiene

- Label **school**. This is the **graduate MMGT-track applications of management information systems** survey (Saylor BUS642; live title **Applications of Management Information Systems**). Catalog-marked graduate-level. Content is aligned with Saylor MMGT; the free certificate **prepares** for those courses — a **graduate-level final assessment** is required for graduate credit. **Twin that actually exists:** MMGT608 (`info.php?id=78`). Program page title **Applications of Management Information Systems**; info.php short title **Management Information Systems** — both real. **MBA has no Applications of MIS course.** MBA608 = Ethical and Strategic Management. Do not invent MBA642. **Not** in ALS (program id=19). Parallel CC: Bourgeois *Information Systems for Business and Beyond* (**CC BY-NC 4.0**) — **BUS206 already owns it at undergrad depth**; use here as overlay. Syllabus: articles, lectures, and videos.
- Label **claim vs data**. Bourgeois as parallel not confirmed live; **no live unit tree**. Live public total is **38 hours / 3.8 CEU**. **No current ACE credit** (do not invent a SAYA id; **SAYA-0013 is BUS206**). Re-fetch if the user needs current transfer rules or live unit-LO numbering.
- Graduate applications of MIS ≠ intro MIS ≠ data-management plan ≠ strategic-IT undergrad ≠ BI ≠ D3M ≠ CS database ≠ CISSP. **BUS206** *teaches* five components. This skill *spends* MIS as a manager aligning, securing, and deciding. **BUS611** *picks the engine and writes the plan*. Unit 7 here only **evaluates the difference** between data and data management.
- Live Saylor intro (Oct 2025): technology integral to the management discipline; align solutions with strategic goals; business management imperatives driving IT; risk mitigation for enterprise systems; entry points for security compromise; communicate with technology stakeholders; comprehensive corporate approach to securing IT infrastructure.
- No exam items. No Bourgeois/CISSP dumps. CC OER: **summarize. Do not dump.** Certificate identity only: **70%**; live syllabus **14-day** wait, **max 3** attempts. **38 h / 3.8 CEU.** **Do not encode 57 h (BUS206) or 44 h (BUS611) or 83 h (BUS610).** ACE: **not current**. Completing the free certificate is **not** an ACE recommendation and is **not** MMGT credit.
- Ten **live** units (Oct 2025): Information System Overview; MIS, Organizations, and Strategy; Internet and Social Media Management; Software Solutions; MIS Security; MIS and the Global Landscape; Data and Data Management; The Management Component of Information Systems; Enhancing Decision-Making; Networking and Communication.
- Eight **live** CLOs: evaluate tech integrated into management; analyze MIS impact on strategic planning; evaluate enterprise MIS trends; evaluate IT solutions via data-driven analysis; analyze protection decision process; analyze global-landscape impact; evaluate data vs data management; evaluate MIS effect on the management decision process.

## 1. Procedure — answer a graduate applications-of-MIS question in six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Identity overlay (always)

**The course question:** is the user asking for an **intro MIS survey**, a **DBMS/plan** answer, an **undergrad strategic-IT** job, a **BI/D3M** course, a **CS/security specialty**, or a **manager** move that is supposed to **align technology with strategy and use MIS to decide**?

Live test:

| Prompt smells like | Hand off |
|---|---|
| "Five components / CIA triad / does IT matter / Bourgeois homework" | **BUS206** |
| "Which DBMS / write a data-management plan / SQL as the job" | **BUS611** |
| "Strategic information technology as an undergrad *course*" | **BUS303** |
| "BI lifecycle / warehouse / dashboard as a *course*" | **BUS610** / **BUS250** |
| "Bias / CRM / decide-with-data as a *course*" | **BUS607** |
| "CS database / CISSP specialty" | **CS403** / **CS406** |
| "Align this system with strategy, pick this software, turn this security finding into a protection decision, use MIS to decide" | **this skill** |

**Primary goal:** **align technology solutions with strategic business goals** and improve the management decision process. Named failure mode: treating IT as a specialist residual instead of a management discipline.

**Level check:** if the prompt is undergrad BUS206 homework, **hand off BUS206**. If it is MMGT608's proctored 80% exam, **refuse exam reconstruction**.

### Check B — Literacy + strategy (when "what is this system / does it change strategy" is in play)

CLO 1, CLO 2. Units 1–2, 8.

**Evaluate** how technology has integrated into the **management discipline**. **Analyze** how MIS impacts **strategic planning**. Align solutions with strategic goals. Unit 8 is the **management component** (communicate with technology stakeholders).

**Hand off BUS206** for five-components intro. **Hand off BUS303** for undergrad strategic-IT as a course. Stay here for "this system, this strategy, this management discipline."

### Check C — Enterprise trends and software solutions (when "social / internet / which package / build vs buy" is in play)

CLO 3, CLO 4. Units 3–4.

**Evaluate trends** in MIS at an **enterprise level** (internet and social media management are live description emphasis). **Evaluate IT solutions** to meet enterprise needs through **data-driven analysis**. Unit 4 is software solutions.

**Hand off BUS206** for intro build-vs-buy checklists. Stay here for "this trend, this enterprise, this data-driven software choice."

### Check D — Protection as a decision (when "security / risk / breach / what do we do" is in play)

CLO 5. Unit 5.

**Analyze the decision-making process used for MIS protection.** Intro: entry points for compromise; risk mitigation for enterprise systems; **comprehensive corporate approach** to securing IT infrastructure. Verb is *analyze the decision process*, not "define CIA."

**Hand off BUS206** for CIA-as-intro. **Hand off CS406** for security specialty. Stay here for "this protocol result, this protection decision, this corporate approach."

### Check E — Global landscape + data vs data management (when "we went global / is this data or data management" is in play)

CLO 6, CLO 7. Units 6–7.

**Analyze MIS impact on the global landscape.** **Evaluate the differences between data and data management.**

Unit 7 is **not** BUS611. Do not answer with a DBMS/plan. The CLO is the *difference*.

**Hand off BUS611** if they actually need to pick an engine and write a plan. Stay here for "this is data; that is data management; this is the global MIS consequence."

### Check F — MIS effect on the management decision process (when "how should we decide / what does the system change about deciding" is in play)

CLO 8. Unit 9. Unit 10 (networking) is the transmission layer under this overlay.

**Evaluate the effect on the management decision process using MIS.** Not the BI lifecycle and not D3M-as-a-course.

**Hand off BUS610 / BUS250** for BI as a course. **Hand off BUS607** for D3M as a course. Stay here for "this MIS, this management decision."

## 2. Worked patterns (shape only — not exam items)

**"We bought Slack and strategy did not move."**
Check A (management discipline vs tool) → Check B (alignment with strategic planning) → Check C (enterprise social/internet trend vs actual solution fit) → Check F (did the decision process change). Not BUS206's five-components quiz.

**"The scan found open ports. Do we patch, buy a box, or accept?"**
Check D (protection as a *decision process*; corporate approach). Not CS406's specialty exam. Not CIA definitions.

**"Is our customer file 'data' or do we already 'manage data'?"**
Check E (CLO 7 difference). If they then need a DBMS and a plan, **hand off BUS611**.

**"MMGT608 / MBA642 / BUS206."**
Only **MMGT608** exists as this title at degree depth (`info.php?id=78`). MBA642 was **not** found. BUS206 is the undergrad ACE course. Do not invent twins. Do not treat the 70% certificate as 80% proctored credit.

## 3. Refuse / redirect

- Exam reconstruction, practice-item harvesting, certificate-final text, **MMGT608** proctored-item text → refuse.
- BUS206 undergrad MIS homework → undergrad skill.
- BUS611 DBMS/plan → that skill. Stay here only for data *vs* data management as a distinction.
- BUS303 / BUS610 / BUS250 / BUS607 / CS403 / CS406 → those skills.
- ACE / "this 70% certificate is MMGT credit" → **not current**. MMGT608 is a **different** LMS object (80%, proctored, $5). BUS206 *is* ACE (SAYA-0013) — do not confuse the codes.
- Bourgeois / Gallaugher / CISSP dumps → summarize the CC school; do not paste chapters.
- Inventing a live vendor stack (Salesforce/SAP/AWS) as if guest-visible → refuse the guess; encode the *job*.

## 4. Adjacent skills (do not merge)

- **Undergraduate MIS** → BUS206
- **Graduate data management (DBMS + plan)** → BUS611
- **Undergraduate strategic IT** → BUS303
- **Graduate advanced BI** → BUS610
- **Undergraduate intro BI** → BUS250
- **Graduate D3M** → BUS607
- **CS database / security specialty** → CS403 / CS406
- **MMGT608 degree exam** → different LMS; **do not encode**

If a prompt needs both "what are the five components" and "align this platform with strategy and turn the security finding into a decision," recap Check A, then run literacy/strategy → trends/software → protection-decision → global/data-distinction → management decision here — do not paste BUS206's five CLOs or BUS611's SQL checklist as this skill.

## 5. What not to encode from this course

- Exam items, quiz banks, or "how to pass the Saylor final / MMGT608 final."
- Chapter dumps from Bourgeois (CC — summarize) or Gallaugher/Laudon/CISSP (not this assignment).
- BUS206's 57 h, BUS611's 44 h, or BUS610's 83 h.
- A fake ACE / SAYA id. **SAYA-0013 is BUS206.**
- The free 70% certificate as MMGT credits or ACE credit.
- MBA642 as an Applications of MIS twin. Twin = **MMGT608** only.
- A guessed mandatory vendor list as live CLO language.
- ALS membership. This course is **MMGT core, not ALS**.


---

## Merged from `strategic-it-when-whether-then-strategy` (2026-10-11)

- Original description: Frame a strategic-information-technology question using the standard undergraduate school (Saylor BUS303, ACE SAYA-0014, 3 UD): scarce capital, so a manager must decide when, where, and whether to deploy IT, run the Carr-vs-process advantage debate, then use ERP/BPM/BPR, BI/warehouse/mining, e-commerce architecture, and a dated trend watch-list to write a technology strategy. Use when the task is funding or refusing an IT initiative, distinguishing enterprise / B2B / e-commerce uses, or composing an IT strategy a manager can defend. Do not use for BUS206 intro MIS, BUS250 intro BI, BUS300 operations, BUS401/BUS501 corporate strategy, CS security/networks/ SE, or exam-taking.
- Unique content carried: one section per course code

# Strategic IT: when/whether to deploy, then write the strategy (clustered)

**Use when:** a task asks whether IT can be a competitive advantage, whether to fund or refuse a systems initiative, how ERP/BPM/BPR or BI or e-commerce should sit in a firm’s strategy, or how to write a technology strategy.

**Do not use when:** the job is reconstructing or taking a Saylor (or any) exam; **BUS206** five-components / CIA / SDLC-as-intro-MIS; **BUS250** warehouse-viz-predict-prescribe as a BI *course*; **BUS300** transformation/JIT/inventory; **BUS401** or **BUS501** corporate/leadership strategy; **CS302/CS402/CS406** engineering; configuring a named ERP tenant; or dumping Carr/HBR or Gallaugher.

This is **one** skill. It is not “Unit 1 skill + Unit 2 skill…”. BUS303’s six units are one argument: **allocate scarce IT capital → settle the advantage debate → pick process systems and planning methods → give decision-makers information → treat e-commerce as an architecture, not a storefront → treat trends as bets → write the technology strategy.**

## 0. Hygiene

- Label **school**. This is the **undergraduate strategic-IT / IT-strategy-for-managers** school (Saylor BUS303; ACE subject “Strategic Business Use of Information Technology,” 3 **upper-division**). Shared with courses other schools call IT strategy, strategic information systems, or “does IT matter for this firm?” It is not the only IS theory (intro MIS, critical IS, security-engineering). Say so if the user is not inside this course.
- Label **claim vs data**. Live public total is **35 hours / 3.5 CEU**. ACE National Guide still prints **83 hours** (legacy / SNLS header). Catalog ACE is **Y**, SAYA-0014, window **2024-02-01 → 2027-01-31**. Carr 2003, beer-and-diapers mining lore, Pew/Web 2.0-era examples, SNLS 2016 “social media strategy” closer, and any 2010 Gallaugher case numbers are **course-era claims**. Re-fetch if the user needs current numbers.
- BUS303 ≠ BUS206 ≠ BUS250 ≠ BUS300. BUS206 *defines the system* (people, process, CIA). BUS303 *allocates IT as strategy*. BUS250 *builds the BI stack*. BUS300 *runs the transformation*. Shared nouns (ERP, BI, process) are not a merge license.
- No exam items. No ARR dumps (Carr HBR, FlatWorld Gallaugher v11). Parallel CC (Gallaugher-family v1.x CC BY-NC-SA): summarize, do not dump cases.
- Ethics floor: a strategy that “wins” by ignoring IP, implementation risk, or process commoditization is not a valid answer in this school.

## 1. Procedure — answer a strategic-IT question in six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — When / whether / where (always)

Write the allocation sentence before you name a product:

1. **What outcome** is the firm trying to change (cost, differentiation, a decision, a channel)?
2. **What process** would the IT sit in (not “the IT department”)?
3. **Deploy / defer / do not deploy** — and why, given scarce capital.

**Advantage debate (run fast, do not sermonize):**

- **Carr (2003, claim):** ubiquitous IT is a commodity like electricity. Manage cost, uptime, risk. Do not expect the tool itself to differentiate.
- **Rebuttal in this school:** IT *can* support sustainable advantage when it is **integrated into a process** (and complementary resources) rivals cannot cheaply copy. Resource-based overlay: valuable, rare, hard to imitate, non-substitutable — usually the **process + people + data**, not the license key.
- Porter maps (from “other courses,” SNLS): **value chain** (where in the flow?) and **five forces** (does this IT change power, substitutes, entry, rivalry?). Internet-as-channel often **lowers average industry profit**; the captured surplus is not automatically yours.

If the prompt is “what are the five components of an IS?” → **BUS206**. Stay here for **funding**.

### Check B — Process lever: ERP / BPM / BPR + planning methods

Advantage is not “we installed software.”

| Move | What it is in this school | Failure if ignored |
|---|---|---|
| **BPM** | Plan, document, implement, distribute a process *with IT support* | You automate tribal knowledge you never drew |
| **BPR** | Redesign from the **outcome**, not the 1990s task list | You pave the cow path and call it digital transformation |
| **ERP** | Modules + **one** database + vendor best practice | You buy the rival’s process (commodity) *or* customize so hard every upgrade is a project |

**ERP test:** are we buying the vendor’s process (cheaper to stay current, easier to copy) or encoding a unique process we will **maintain**? Can the org absorb timeline, testing, and training? A missed implementation is a **strategy** miss.

**LO 4 (methods):** compare formal approaches to **planning, analysis, and architecture design**. Pick on fit (known vs discovery, blast radius, architecture vs feature). Do not preach a named framework (TOGAF, SAFe) unless the user brought it — guest pages do not.

If the prompt is factory layout / JIT / EOQ → **BUS300**. If it is “what is an information system?” → **BUS206**.

### Check C — Information for decisions (BI as a lever, not a major)

BI here = get the **right information** to the **right decision maker**.

Distinguish:

- **Static report** — snapshot. Fine when the question is stable.
- **Dynamic report / dashboard** — interactive; **drill-down** (region → plant → line) is the teaching move.
- **Data mining** — unexpected pattern, correlation, cluster. It is not a prettier report.
- **Data warehouse** — copy of operational data (often via **ETL**) so analysis does not starve the TPS and so multiple sources can merge. The warehouse is not the store.

Do not turn this check into BUS250 (sources → viz → predict/prescribe → anonymize). If they need that stack, hand off. Privacy/IP still bind: a mining win that burns PII or copyright is not a valid BUS303 answer.

### Check D — Strategic use-type + e-commerce architecture

LO 2: **enterprise** vs **B2B** vs **e-commerce** are different bets. A portal is not a strategy.

When the channel is online, run the **architecture checklist** (LO 5–6) as a manager, not as a sysadmin:

| Layer | Ask |
|---|---|
| Hardware | What has to stay up for the transaction? Commodity boxes rarely *are* the advantage. |
| Software | Buy vs build the storefront / engine; lock-in vs uniqueness (same test as ERP). |
| Database | One version of the truth for orders, inventory, identity? |
| Online transaction | Integrity, confirmation, fulfillment handoff — the process again. |
| User interface | Who is the user (customer, partner, employee) and what decision do they complete? |

Then: how does **each** layer improve the firm and contribute to advantage — or fail to? **IP** and **online marketing** are constraints and levers on this channel (copyright of content, brand, paid discovery). Not a digital-marketing major (that is other BUS/PRDV codes).

### Check E — Trends as bets (watch-list, not prophecy)

Historical Saylor core: **cloud**, **Web 2.0 / social / peer production**, **mobile**. Live Unit 5 may have added later names — treat extra labels as **unconfirmed** until login.

Rules:

- A trend is a **bet about how the firm will operate**, not a gadget to recite.
- Cloud is a **delivery/cost/lock-in** choice (capex → subscription; residency; vendor patches). It is not automatically strategy.
- Social/Web 2.0 can feed marketing **and** (legacy Unit 6) a slice of tech strategy. It is **not** the whole of LO 7.
- Date the examples. 2016 mobile/Web 2.0 talk is a method for watching, not a 2026 inventory.

### Check F — Write the technology strategy (capstone)

Produce something a manager could defend. Minimum headings:

1. **Outcome** the firm wants (and the process it lives in).
2. **Deploy / defer / do not deploy** (Check A), with the Carr-vs-process sentence explicit.
3. **Process systems** (Check B) and the commoditize-vs-unique choice.
4. **Decision information** (Check C) — what lands in whose hands, from what store.
5. **Use-type + architecture** (Check D) if a channel is in play.
6. **Trend bets + constraints** (Check E + IP, implementation risk, ethics).
7. **What we will not buy.** A strategy that cannot refuse an initiative is a shopping list.

If the user wanted a corporate strategy / leadership narrative with no IT allocation → **BUS401 / BUS501**. If they wanted “applications of MIS” at graduate depth → **BUS642**.

## 2. Worked micro-patterns

**“Does IT matter for us?”**
Check A. Carr: the tool is a commodity. This school: it matters when it is the substrate of a process you can actually differentiate or cheapen, and management will run that process. Do not cite a vendor logo as the advantage.

**“Should we buy SAP / this SaaS / this AI copilot?”**
Checks A–B, then F. Same software as the rival → commodity unless the **process** around it is yours to keep. Implementation (time, test, train) is part of the strategy, not an IT-department footnote.

**“We need a dashboard / a data lake.”**
Check C, then ask what **decision** changes. If they want the full BI lifecycle, hand to **BUS250**. If they want Python, **CS250**.

**“We’re going online / launching a store.”**
Check D architecture five-box + IP/marketing, then F. Enterprise vs B2B vs consumer e-commerce — pick one primary use-type.

**“What’s our technology strategy?”**
Check F with A–E filled. Refuse a recitation of Unit 5 gadgets.

**“Is this the MIS course?”**
No. **BUS206** is intro MIS. This is the **upper-division allocation overlay**. Shared Carr/ERP/BI nouns, different job.

## 3. Adjacent skills (do not merge)

- **What is an IS / five components / CIA / SDLC intro** → BUS206.
- **Intro BI (warehouse, viz, predict/prescribe, privacy as the course)** → BUS250.
- **Graduate BI lifecycle** → BUS610; **data management** → BUS611.
- **Applications of MIS (grad)** → BUS642.
- **Operations / JIT / inventory / quality** → BUS300.
- **Corporate / leadership strategy** → BUS401, BUS501.
- **Software engineering / networks / information security** → CS302, CS402, CS406.
- **Study.com Business 303** is MIS, not this course.

If a prompt needs both “what is an IS?” and “should we fund this,” run BUS206 for the frame, then this skill for the allocation.

## 4. What not to encode from this course

- Exam items, quiz banks, discussion-prompt keys, or “how to pass the Saylor / ACE final.”
- Chapter dumps from Gallaugher-family CC text; any FlatWorld v11 / Carr HBR dump.
- Exploit PoCs, ERP tenant hacks, or attack procedures.
- Vendor-specific configuration, live Gartner/Meeker numbers as if current.
- SNLS 83-hour effort or SNLS Unit 6 “social media only” as if they were live 2026 doctrine.

## Exam-close (receipt only — not a study aid)

- 2026-09-02 Certificate final **passed**: **47/50 (94%)**, attempt **4151321**.
- Do **not** reconstruct items, dump the quiz, or sit ACE SAYA-0014 unless the operator asks.
- Live certificate final moved to **BUS305**. Harvest Chrome stays off `learn.saylor.org` until that submits. Remaining is not 0.
