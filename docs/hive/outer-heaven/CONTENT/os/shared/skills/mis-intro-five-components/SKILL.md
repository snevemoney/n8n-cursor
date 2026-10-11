---
name: mis-intro-five-components
description: >
  Frame a management-information-systems question using the standard
  undergraduate MIS intro school (Bourgeois / Saylor BUS206): five
  components (hardware, software, data, people, process), computing
  eras, CIA triad, and process as the competitive-advantage lever
  (BPM / BPR / ERP, build-vs-buy). Use when defining what an information
  system is, separating IS from computer science, choosing build vs buy
  or ERP/SaaS, applying Porter/Carr/Brynjolfsson to "does IT matter?",
  or treating ethics, privacy, IP, globalization, and the digital divide
  as constraints on a proposed system. Do not use for exploit writing,
  vendor implementation playbooks, coding instruction, or exam-taking.
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
