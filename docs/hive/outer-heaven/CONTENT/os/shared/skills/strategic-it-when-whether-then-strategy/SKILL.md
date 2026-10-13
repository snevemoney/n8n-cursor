---
name: strategic-it-when-whether-then-strategy
description: >
  Frame a strategic-information-technology question using the standard
  undergraduate school (Saylor BUS303, ACE SAYA-0014, 3 UD): scarce
  capital, so a manager must decide when, where, and whether to deploy
  IT, run the Carr-vs-process advantage debate, then use ERP/BPM/BPR,
  BI/warehouse/mining, e-commerce architecture, and a dated trend
  watch-list to write a technology strategy. Use when the task is
  funding or refusing an IT initiative, distinguishing enterprise /
  B2B / e-commerce uses, or composing an IT strategy a manager can
  defend. Do not use for BUS206 intro MIS, BUS250 intro BI, BUS300
  operations, BUS401/BUS501 corporate strategy, CS security/networks/
  SE, or exam-taking.
---

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
