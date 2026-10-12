---
name: ops-manager-transformation-checklists
description: >
  Frame an operations-management question using the standard undergraduate
  OM intro school (Saylor BUS300 / Open University transformation model):
  operations as the system that turns inputs into goods and services;
  a process as the cross-functional chain (operational vs administrative);
  then manager-level checklists for capacity, quality, inventory/JIT-lean,
  and supply chain. Use when distinguishing process vs operations,
  manufacturing vs service, sizing capacity or choosing a layout, applying
  TQM/SPC, setting inventory/JIT policy, or diagnosing a supply chain
  (bullwhip, supplier choice, distribution). Do not use for Heizer/Render
  chapter dumps, APICS exam coaching, factory-floor SOPs, or exam-taking.
merged_from: [grad-oscm-process-forecast-chain-shock, prdv-scm-bullwhip-procurement-distribution]
---

# Operations-manager checklists (clustered)

**Use when:** a task asks what operations management is, how a process differs from the operations *function*, how to match market needs to operational capabilities, or how a manager should think about capacity, quality, inventory/JIT, or the supply chain.

**Do not use when:** the job is reconstructing or taking a Saylor (or any) exam, dumping Heizer & Render, running an APICS/CSCP item bank, writing a plant SOP, or treating BUS300 as graduate OSCM (that is BUS606).

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". BUS300's nine units are one argument: transformation → process view → strategy as capability match → then the toolkit (capacity, quality, inventory/JIT, supply chain).

## 0. Hygiene

- Label **school**. This is the **standard undergraduate OM intro** (Saylor BUS300; Open University transformation model; Slack-adjacent. Topics overlap Heizer/Render; **the Pearson book is not the source and is all-rights-reserved**). It is not the only OM theory (factory physics, TOC, system dynamics, behavioral OM). Say so if the user is not inside this course.
- Label **claim vs data**. Fast-food location heuristics, "70% of manufacturers use lean," manufacturing-employment shares, and Walmart VMI as taught are **course-era illustrations**. Re-fetch if the user needs current numbers.
- Operations ≠ the COO's department ≠ "efficiency" as a slogan. Every function has processes; OM is the discipline of designing and controlling them.
- No exam items. No proprietary formula sheets copied from a closed textbook. EOQ/ROP at definition level only.
- CC OER: summarize. Do not dump OU, *Exploring Business*, or *Principles of Management* chapters.

## 1. Procedure — answer an OM question in five checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Process vs operations (always)

**Operations** is the system: the systematic direction and control of processes that transform resources into goods or services. **A process** is a linked chain of activities, usually cutting across departments, with a beginning, an end, and a customer (internal or external).

Draw the transformation before giving advice:

| Piece | Ask | Typical contents |
|---|---|---|
| **Inputs — transformed** | What is changed? | Materials, information, customers (people) |
| **Inputs — transforming** | What does the changing? | Staff/labor, facilities/capital |
| **Transformation** | What kind of change? | Manufacture / transport / supply (ownership) / service (treatment or storage). Also: physical, location, ownership, storage, information-form, physiological/psychological |
| **Outputs** | Goods, services, *and* undesirables? | Waste, H&S, ethical residue in the supply base count |
| **Feedback** | How do outputs correct inputs? | Quality signals, demand, capacity utilization |

Macro vs micro: name the overall transformation (brewery: make beer) then the micro-operations (mill, mash, ferment, filter, package). Advice that only touches one micro-step is incomplete.

**Operational vs administrative processes** (Garvin via this school):

| | Operational | Administrative |
|---|---|---|
| Job | Create, produce, deliver what external customers want | Information and plans internal groups need |
| Examples | NPD, manufacturing, logistics/distribution | Strategy, budgeting, performance measurement |
| Failure | Local optimization in a department | Plans that the operating chain cannot run |

They must be aligned. Forecasting that logistics cannot execute is not a strategy.

**Manufacturing vs service** (do not collapse):

| | Manufacturing | Service |
|---|---|---|
| Output | Tangible, often standardized, inventory-able | Intangible, often customized, often produced *and* consumed together |
| Contact | You can assemble cars and never meet a buyer | Satisfaction is partly the encounter |
| Capacity | You can build ahead (at a holding cost) | You cannot inventory a haircut, an OR slot, or a ride |
| Control focus | Schedule materials and machines | Schedule **people** to a demand curve |

Production-method trio (when "how do we make it?" is in play): **make-to-order** (high variety, customer spec) / **make-to-stock** (forecast, inventory, low unit cost) / **mass customization** (interact, then efficient fulfillment). Match to marketing's promise; low cost and infinite variety do not coexist.

**Function vs process:** OM as a department sits next to marketing, finance, IT, HR (Director of Operations → COO → CEO in the Saylor org chart). That is the *function*. The *process* crosses those silos. If the user asks "who owns this," name both the function and the chain.

**Strategy test (course LO 2):** market needs vs operational capabilities (productivity, workflow, quality). Competitive priorities in this school are some permutation of **cost, quality, time/delivery, flexibility** (sometimes innovation). Name the order-winner vs the qualifier. Controlling a distinctive transformation can be a moat (3M Magic Tape teaching story); a commodity transformation is not worth defending as "ops strategy."

If asked "what should operations *do*?," the manufacturing answer in this school is three buckets: **plan** (method, site, layout), **control** (schedule, buy, inventory), **assure quality**. Services add: choose the offer, the delivery process, the customer-facing site, and the demand forecast you cannot store.

### Check B — Capacity (when volume, location, or layout is in play)

Capacity = maximum output over a period under **normal** working conditions. The manager's job is a match to forecast demand, not a monument.

1. **Forecast demand** (range, mix, timing — seasonality and peak hours for services).
2. **Design vs effective capacity.** Design is the nameplate. Effective is what you actually get after the eight determinant classes this school lists:
   - facilities
   - product / service mix
   - process (quality/rework, changeover time)
   - human
   - policy
   - operational (scheduling mismatches, inventory policy, late deliveries, incoming quality, inspection)
   - supply chain (will suppliers, warehouses, transport, distributors absorb an increase *or* a cut?)
   - external
3. **Too low** → lost sales and customers. **Too high** → wasted capital and inflated operating cost. Services cannot bank unused capacity; staff the curve (POS history → next Thursday's lunch headcount is the teaching move).
4. **Location** (rank; you will not get all of them): inbound/outbound shipping, skilled labor, livability, land/labor/utilities/tax, business climate/incentives. Service overlay: be where the customer already is (traffic count, transit stops). Course-era "through the light and to the right" is an illustration, not a 2026 GIS model.
5. **Layout** — pick the one that matches flow:

   | Layout | When | Watch-out |
   |---|---|---|
   | **Process** (job shop) | High variety, low volume; similar resources grouped | Long travel, high WIP |
   | **Product** (line) | High volume, stable mix | Needs **line balancing**; brittle to mix change |
   | **Cellular** | Families of parts/services in a cell | Needs grouping discipline |
   | **Fixed-position** | Product cannot move (ship, building, patient in OR) | Coordination of arriving trades |

   Line balancing belongs on a product layout: even the stations, or the bottleneck *is* the capacity.

Do not skip the supply-chain determinant: a plant that can make 2× with a supplier that cannot is not 2× capacity.

### Check C — Quality (when defects, variation, or "is it good enough?" is in play)

Quality in this school has two faces. Name which one you are on:

- **Output quality:** does the unit meet spec? (sampling a seam, a lab test, a mystery shopper)
- **Process quality:** is the transformation healthy? (productivity, bottlenecks, rework loops) — especially on low-margin work

**TQM / CQI:** quality is designed in and owned by everyone; a dedicated team still exists. Deming is the named pioneer: variation, PDCA, stop treating inspection as the quality system.

**SPC at manager level** (not a black-belt project):

- Every process has **variation**.
- **Common-cause** = the current system. Do not tamper.
- **Special-cause** = a signal. Find it; do not "motivate" the chart.
- SPC *assesses* process variation to measure quality; it does not by itself fix a bad design.

**Cost test:** continuous improvement has a cost; so does the status quo (scrap, warranty, lost customers, hidden capacity burned on rework). Ask which cost they are actually paying. ISO-style "tell me / show me the document / prove it happened" is a cousin of this posture, not a certificate to chase unless they asked.

Poor quality is also a **JIT problem**: it is a major source of uncertainty and non-value-added work. Do not run pull on a process that cannot make it right the first time.

### Check D — Inventory and JIT / lean (when "how much / when / why is this sitting here?" is in play)

**Inventory classes:** raw materials, WIP, finished goods. Goal = balance ordering + holding cost against the cost of **not having it**. Sitting stock is a clock on cash.

**Demand type (do this before any formula):**

| | Independent | Dependent |
|---|---|---|
| What | Finished goods (or service capacity) driven by the market | Components exploded from a parent |
| Tool | Forecasting + EOQ/ROP-class models | MRP / pull from the parent schedule |
| Failure | EOQ on a dependent part | Treating a forecast error as a warehouse problem |

**Intro math (definitions only):**

- **EOQ** — order volume that trades off setup/order cost against holding cost. Assumptions break under quantity discounts, perishability, unstable demand, or when setup cost is the thing lean is attacking.
- **Reorder point** — when to order so you do not stock out given lead time and demand during lead time (plus safety stock if they named uncertainty).

**JIT / lean overlay** (same check, not a separate religion):

- JIT = make what demand needs **when** it needs it. Not early (stale pizza / overproduction) and not late (lost customer).
- **Pull vs push:** work flows to a center only if that center needs it. High utilization is not the goal; exposing problems is.
- Inventory **covers up** weak vendors, long setups, bad quality, sloppy layout. Lower it to reveal; then fix. Do not lower it and pray.
- **Seven wastes (*muda*):** defects, **overproduction** (the one that hides the others), transportation, waiting, inventory, motion, overprocessing. An eighth — unused talent — appears in some course videos; say "seven plus unused talent" if counting.
- **Five lean principles:** (1) value from the **customer**, (2) map the **value stream**, (3) create **flow** (challenge batch-and-queue), (4) produce at the **pull** of actual demand, (5) **kaizen**. Lean is conservation of resources, not a layoff slogan.
- Kanban = a signal, not a software brand. "Lean operations" is the service-friendly name.

VMI (Walmart teaching story): stock stays with the supplier until the store signals — a process design that moves the holding cost. Encode as an option, not as "always do what Walmart did."

### Check E — Supply chain at manager level (when the problem crosses the four walls)

OM usually owns conversion. A good manager owns **obtain → convert → ship → put in front of the customer**. The question is not only "how do we make this?" but "how does it get from A to B?"

Run:

1. **Map the chain.** Suppliers → inbound → transformation → outbound → distribution (direct ship vs warehouse-then-local is a cost/service tradeoff) → customer. Name who holds inventory and who sees demand.
2. **Bullwhip.** Demand variance amplifies upstream. Manager counters: share real demand, smaller more frequent orders, stop promotional spikes that fake demand, shorten lead times, consider VMI where the partner can actually run it.
3. **Supplier choice is multi-criteria**, not lowest unit price. This school's list: can they supply the **quantity** at a reasonable price; is **quality** good; are they **reliable**; **reputation**; are they **easy to work with**. Add lead time and capacity-to-absorb-our-growth from Check B.
4. **Distribution.** Two main areas in the Lumen LOs: the physical movement/placement of finished goods, and the policies that govern it (where stock sits, who owns it, service level). Direct-to-customer vs DC network is a math + service-level decision.
5. **Alignment.** Capacity changes, quality escapes, and JIT inventory cuts all land on suppliers and distributors. If they cannot absorb the change, the "ops improvement" is a transfer of chaos.

Procurement ethics (OU teaching beat): child labor / subsistence wages in the supply base are an operations responsibility, not a PR afterthought.

## 2. How to answer

- Start from Check A unless the user already named the transformation. A capacity number with no process is a guess.
- Use the table the check provides. Do not recite all five checks if only one is in play.
- If manufacturing and service are mixed (restaurant, hospital, software+support), split the transformation: which inputs are materials vs customers vs information.
- Neighbor courses: BUS208 (management POLC) is upstream of "who is the manager"; BUS206 (MIS) is the information system *inside* these processes; BUS402 is project work systems; BUS606 is the graduate overlay — do not import its scheduling/bullwhip depth unless asked.
- Stop at manager level. No exam keys, no plant SOP, no "implement kanban in Jira this afternoon."

## 3. Refuse / redirect

- Exam reconstruction, item dumps, or "what will be on the Saylor final."
- Verbatim Heizer/Render (or any all-rights-reserved) chapters.
- Exploit-adjacent "how do I hide defects from an auditor."
- APICS exam drills unless the user clearly wants *this* school's manager checklists as a conceptual overlay.

---

## Merged from `grad-oscm-process-forecast-chain-shock` (2026-10-11)

- Original description: Frame a graduate operations-and-supply-chain-management question using the Saylor BUS606 school: produce goods and services efficiently inside a supply chain by designing process and capacity, analyzing and scheduling work, forecasting demand, controlling inventory, locating and laying out facilities, moving goods through distribution, integrating the chain against the bullwhip, using project management as an implementation module, and reacting to operational shocks. Use when an MBA-core prompt asks how to run operations inside a supply chain, not as intro OM. Do not use for BUS300 undergrad operations, BUS605 strategic PM, PRDV304 mini-SCM, MBA606 exam-taking, ACE-credit promises, or exam reconstruction.
- Unique content carried: one section per course code

# Graduate OSCM: process → forecast → chain → shock (clustered)

**Use when:** a task asks how a manager should produce goods and services **efficiently inside a supply chain** — how to design process and capacity, analyze a workflow, schedule shifts, forecast demand for outputs and inputs, control inventory so the line does not starve, locate and lay out facilities, move goods through distribution, integrate the chain against the bullwhip, use a project to stand something up, or react to an operational shock (supplier typhoon, labor shortage, trade/transportation regime change) without dropping quality.

**Do not use when:** the job is reconstructing or taking a Saylor (or any) exam, dumping Heizer/Chopra/APICS banks, running **BUS300** undergraduate nine-unit operations checklists as *the course*, treating the prompt as **BUS208** POLC as the standing manager's job, **BUS605** strategic project management as a *course*, **PRDV304** mini-SCM, treating the free 70% certificate as **MBA606**'s 80% proctored exam, promising ACE/transfer credit (SAYA-0038 is **BUS300**), or writing fake-progress / hidden-shortage scripts.

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". BUS606's ten live units are one argument: **OSCM is how the firm produces efficiently inside a supply chain, and what it does when that chain is shocked.**

## 0. Hygiene

- Label **school**. This is the **graduate MBA-core operations and supply chain management (OSCM)** survey (Saylor BUS606; live title **Operations and Supply Chain Management**). Catalog-marked graduate-level. Content is aligned with Saylor **MBA** only (live catalog/info.php/syllabus do **not** list MMKT / MMGT / MEI). The free certificate **prepares** for those master’s courses — a **graduate-level final assessment** is required for graduate credit. Parallel CC (topic match, **not** a confirmed live reader; syllabus: articles, lectures, and videos): Saylor BUS300 Lumen mashup (**CC BY 4.0** except where noted — **BUS300** already owns intro depth), Saylor *Exploring Business* OM chapter (**CC BY-NC-SA 3.0**), Saylor *Small Business Management* ch.15 SCM (**CC BY-NC-SA**; APICS/SCOR *named*), OpenStax *Introduction to Business* 2e ch.10 (**CC BY**, survey). Summarize. Do not dump. It is not the only OSCM school (Heizer, Chopra, Cachon, APICS SCOR-as-cert). Say so if the user is not inside this course.
- Label **claim vs data**. Catalog MBA-only alignment vs BUS601–605's MMKT/MMGT/MEI lines; MBA606's **80% / $5 proctor** vs this course's **70% free certificate**; Class Central / SNLS **missing** BUS606 cards; BUS300's ACE card (**SAYA-0038**, 38 h, stale Lumen 54 h) is the **undergrad neighbor**, not this course. Live public total is **96 hours / 9.6 CEU**. **No current ACE credit** (do not invent a SAYA id). Exploring Business 2000s PowerSki/BK stories are **course-era**. Re-fetch if the user needs current ACE lists or transfer rules.
- Graduate OSCM ≠ intro OM ≠ POLC ≠ strategic PM ≠ APICS. **BUS300** *teaches* the transformation model and nine undergrad units (and *is* ACE). This skill *spends* that literacy as the manager's **OSCM** job, splits forecasting / scheduling / bullwhip / PM into their own units, and treats **shock response** as a live CLO. **BUS208** *is* POLC. **BUS605** *is* the PM course. APICS *exams a professional*.
- Live Saylor intro (Oct 2025): OM is a **main function**; the supply chain **ensures inputs**; OSCM studies how a firm **produces goods and services efficiently**. Basic questions: workers to hire, raw material on hand, shifts per week to meet **forecast** demand, where to source (local / regional / international). When an overseas supplier is hit with a **typhoon** or a **labor shortage** hits a key production area, OSCM asks how the firm will react and which tools it will use. Quality is a constraint on the output bet, not a slogan.
- No exam items. No Heizer/Chopra/APICS dumps. CC OER: **summarize. Do not dump.** Certificate identity only: **70%**; live syllabus **14-day** wait, **max 3** attempts. **96 h / 9.6 CEU.** **Do not encode 38 h (BUS300), 54 h (stale Lumen BUS300), or 44 h (BUS605).** ACE: **not current**. Completing the free certificate is **not** an ACE recommendation and is **not** MBA credit. Do not promise transfer credit.
- Ten **live** units (Oct 2025): Introduction to OSCM; Process and Service Design Capacity Management; Operations and Process Analysis; Scheduling Model Analysis; Demand Forecasting; Process and Inventory Management; Facility Analysis – Location and Layout Planning; Supply Chain Distribution and Logistics; Supply Chain Integration and the Bullwhip Effect; Project Management.

## 1. Procedure — answer a graduate OSCM question in six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Identity, level, overlay (always)

**The course question:** is the user asking for an **undergrad OM recap**, **POLC as the manager's job**, a **strategic-PM overlay**, a **mini "what is SCM"**, an **APICS dump**, or an **OSCM decision** about producing efficiently inside a chain — including what to do when the chain is shocked?

Live test:

| Prompt smell | Hand off |
|---|---|
| "What is OM / transformation model / nine undergrad units / ACE BUS300" | **BUS300** |
| "What does a manager do (POLC nine units)" | **BUS208** |
| "Ten KAs / initiate-plan-execute-monitor-close as a *course*" | **BUS605** |
| "What is a supply chain in 0.4 CEU" | **PRDV304** |
| "CSCP / CPIM / SCOR as certification / Heizer chapter dump" | **refuse exam / textbook dumps**; this skill is not APICS prep |
| "NPV / WACC this plant as finance" | **BUS601** |
| "This process, this forecast, this inventory, this shock" | **this skill** |

**Primary goal:** produce goods and services **efficiently** (CLO 1: productivity linked to OSCM) **inside the supply-chain framework** (CLO 2), **without dropping quality** (CLO 3). On-time output with a starved line or a hidden defect is not success in this school. Other functions (marketing, finance, HR — CLO 8) constrain the path.

**Think as an operations *and* supply-chain manager** (graduate overlay). CLO 4: issues that affect the chain. CLO 9: **evaluate shocks** and the method that fits each. CLO 7: transportation modes, political uncertainty, trade agreements as the *external* weather the chain lives in.

**Level check:** if the prompt is actually undergrad homework in BUS300's nine units, **hand off BUS300** and recap only. If it is MBA606's proctored 80% exam, **refuse exam reconstruction**; this skill is the *content* overlay, not the degree exam.

### Check B — What OSCM is, and which process/capacity bet (Units 1–2)

CLO 1, 2, 8.

Live intro: OM is a main function; the chain is how **inputs** arrive; OSCM is how the firm produces efficiently.

Encode at manager depth (OU transformation + Exploring Business overlay, summarize):

- **Transformation:** inputs (materials, information, customers, labor, facilities) → process → outputs (goods/services) + feedback. Undesirable outputs (waste, H&S, supply-base labor) are an OM responsibility.
- **Productivity** = output/input. CLO 1: it is *linked* to OSCM, not a separate accounting course. Raising output while holding quality is CLO 3.
- **OM inside the chain (CLO 2):** procurement → operations (the conversion) → distribution. A good manager owns the **whole chain**, not just the factory floor. Small Biz ch.15 four elements: **procurement, operations, distribution, integration**.
- **Process trio:** make-to-order / make-to-stock (mass production) / mass customization. Services: intangible, often customized, often produced and consumed together; **service capacity cannot be stored**.
- **Capacity:** maximum output under **normal** conditions. Too low → lost sales; too high → wasted resources. Size it to a **forecast** (Check D). Rank the service/goods twist: a plant can inventory output; a clinic cannot inventory appointments.
- CLO 8: OM interacts with marketing (what to make), finance (what we can fund — **hand off BUS601** for WACC), HR (how many workers — live intro).

**Hand off BUS300** the moment they need intro-OM as a *course* or the ACE exam. Stay here for "this process + this capacity is how we will hit production goals inside the chain."

### Check C — Analyze the process and schedule the work (Units 3–4)

CLO 3.

**Process analysis:** find the bottleneck, the rework loop, the idle resource. Raise output **while maintaining quality**. Workflow analysis (catalog blurb). Name tools at manager depth (utilization, throughput, yield) — confirm live labels on login. Do not dump a factory SOP.

**Scheduling:** live intro's "how many production shifts to schedule each week to meet forecast demand." MPS / routing / Gantt / PERT as *named* scheduling tools. Critical path is a **schedule** tool here.

**Hand off BUS605** if the object is a temporary unique *project* with ten KAs and a competitive-advantage close. Stay here for "this week's shifts / this line's sequence."

Quality in this check is a **constraint**, not a TQM *course* (BUS300 Unit 9). Name SPC/ISO/Six Sigma as tools if the case needs them; do not run a belt exam.

### Check D — Forecast, then inventory the inputs (Units 5–6)

CLO 5 (+ forecast as the plan's input).

**Forecast (Unit 5 is standalone — the graduate split vs BUS300):** forecast demand for **outputs and for inputs**. Naive / moving-average / exponential-smoothing / causal as *named families*. Confirm live methods on login. **Hand off BUS204 / BUS607** if they need a stats engine as a *course*. Stay here for "this number is what we will staff, buy, and locate against."

**Inventory (CLO 5):** enough raw material so production does not short; not so much that cash sits. Independent vs dependent demand; raw / WIP / finished. EOQ / ROP as *named* intro math (BUS300 owns the drill — recap). JIT / MRP as named systems. Sitting inventory is a clock on cash; stock-out is a clock on the line.

Do not run EOQ blindly on dependent-demand parts (that's MRP territory). Do not treat JIT as "zero inventory" — it is *timed* inventory plus a quality/vendor overlay.

### Check E — Place the system in space, then move and integrate the chain (Units 7–9)

CLO 4, 7, 9.

**Location / layout (Unit 7):** shipping in and out, skilled labor, factor costs, business climate; service twist = accessibility / traffic. Layouts: **process, product, cellular, fixed-position**. Catalog: analyzing physical facilities.

**Distribution / logistics (Unit 8):** source **local, regional, or international** (live intro). Direct-ship vs warehouse-then-local is a cost/service tradeoff. Supplier selection is multi-criteria (quantity/price, quality, reliability, reputation, easy to work with) — not lowest unit price. CLO 7: changing **modes of transportation**, political uncertainty, **trade agreements**.

**Integration / bullwhip (Unit 9):** demand variance **amplifies upstream**. Counters at manager depth: share information, smaller more frequent orders, avoid promotional fake-demand, VMI where it fits. SCOR plan/source/make/deliver/return as a *named* benchmark — **not** APICS cram.

**Shocks (CLO 9 / live intro):** typhoon at an overseas supplier; labor shortage in a key production area. Pick a method that matches the shock (alternate source, buffer, expedite, redesign, delay a non-critical SKU). Hidden shortage is not control.

**Hand off PRDV304** if they only need "what is a supply chain." Stay here for "this chain has to keep producing when a link breaks."

### Check F — Implement with a project, then ask whether the machine still runs (Unit 10 + always)

CLO 6.

- Use **project management and project-completion forecasts** to *implement* operations (stand up a line, a warehouse, a recovery). Gantt / PERT / critical path as named tools.
- **This is a module.** If the prompt is actually "manage this unique temporary effort as a strategic bet across ten KAs," **hand off BUS605**. If it is undergrad intro-PM / ACE, **hand off BUS402**.
- Close the loop: did we raise output at maintained quality (CLO 3)? Did inventory keep the line fed (CLO 5)? Could we absorb the shock (CLO 9)? Did other functions stay in the room (CLO 8)?

Ethics floor: fake inventory, hidden shortages, unauthorized quality waivers, or abusive overtime *as a plan* → refuse / rewrite the plan.

## 2. Worked micro-patterns

**"What is OSCM / how is it not operations management?"**
Check A in one paragraph. Past vs decide-what-to-do-as-a-manager. Hook: produce efficiently **inside a chain**, with **shock tools**. Name the overlays: BUS300 teaches the transformation and nine units; this course *spends* them as ten units with forecasting / scheduling / bullwhip / PM standalone.

**"Make-to-order vs make-to-stock vs mass customization / how much capacity?"**
Check B. Services cannot inventory capacity. Size to a forecast (Check D). Too low loses sales; too high wastes resources.

**"The line is slow / quality is slipping / how many shifts next week?"**
Check C. Bottleneck + quality as constraint + schedule against the forecast. Do not dump a work-measurement lab (BUS300 Unit 7).

**"What will we sell / how much material to buy?"**
Check D. Forecast first; then independent vs dependent demand; EOQ/ROP/JIT/MRP as named. Stock-out vs cash-clock.

**"Where should the plant / warehouse / clinic go? What layout?"**
Check E Unit 7. Rank criteria; name the four layouts. Service accessibility ≠ manufacturing inbound-freight.

**"Direct ship or DC? Local or overseas supplier?"**
Check E Unit 8. Cost/service tradeoff. Multi-criteria supplier choice. CLO 7 weather (transport modes, politics, trade).

**"Orders are exploding upstream / a typhoon hit the supplier."**
Check E Unit 9. Bullwhip counters; shock method that matches. Hidden shortage is not a plan.

**"We need a project to stand this up / what's the critical path?"**
Check F. Gantt/PERT as implementation. **Hand off BUS605** if they want the ten-KA *course*.

**"Walk me through undergrad OM as nine units / ACE BUS300."**
Wrong course. **BUS300**. Recap a term only if this prompt still needs it. SAYA-0038 is not this course.

**"POLC the department."**
Wrong course. **BUS208**.

**"PMP / ten KAs / agile vs waterfall as a course."**
Wrong course. **BUS605**. Unit 10 may *use* a project.

**"CSCP / dump Heizer / dump Chopra."**
Refuse dumps. Name the school; summarize CC Exploring Business / Small Biz / BUS300-Lumen; do not paste Pearson/APICS.

## 3. Refuse / redirect

- Exam reconstruction, practice-item harvesting, certificate-final text, **MBA606** proctored-item text → refuse. Point at public CLOs, this checklist, CC summaries.
- BUS300 nine-unit intro homework / ACE coaching → intro-OM skill. Stay here only if they need the *graduate overlay* (forecast/schedule/bullwhip/PM as standalone units, shock response, OM inside the chain).
- BUS208 POLC → manager-POLC skill.
- BUS605 strategic PM / BUS402 intro PM → those skills. Stay here only for PM as an *OSCM implementation module*.
- PRDV304 mini-SCM → that skill.
- ACE / transfer-credit / "this 70% certificate is MBA credit" → **not current** for BUS606. Free certificate only. MBA606 is a **different** LMS object (80%, proctored, $5). BUS300 *is* ACE (SAYA-0038) — do not confuse the codes.
- All-rights-reserved Heizer / Chopra / Jacobs / Cachon / APICS dumps → name the tool, summarize the CC school, do not paste chapters.
- Fake inventory, hidden shortage, unauthorized quality waiver, abusive-overtime-as-plan → refuse / rewrite.
- Invented **MMGT606 / MEI606 / MMKT606 Operations and Supply Chain** twins → they do not exist. MMGT606 = Strategic Negotiations. MEI606 = Ethical & Strategic Management. Twin that exists: **MBA606**.

## 4. Adjacent skills (do not merge)

- **Undergrad operations management (transformation / nine units / ACE)** → BUS300 (do not merge)
- **POLC manager job** → BUS208 `mgmt-polc-manager-checklists`
- **Graduate strategic PM (ten KAs / lifecycle / value)** → BUS605 `intro-pm-process-groups-people-checklists`
- **Undergrad intro PM** → BUS402 `intro-pm-process-groups-people-checklists`
- **Mini supply-chain intro** → PRDV304 (do not merge)
- **Graduate financial management (the 600-core twin)** → BUS601 `corpfin-tvm-value-capital-checklists`
- **Graduate data-driven decisions / undergrad stats** → BUS607 / BUS204 (forecast *engine*, not this plan)
- **MBA606 degree exam** → different LMS; **do not encode**

If a prompt needs both "remind me what OM is" and an OSCM shock decision, run BUS300 for the frame, then this skill for the overlay. If it needs both a critical-path *and* a chain-shock call, start here for the shock and hand off BUS605 only if the object is the project *as a course*.

## 5. What not to encode from this course

- Exam items, quiz banks, discussion-prompt keys, or "how to pass the Saylor final / MBA606 final."
- Chapter dumps from Exploring Business / Small Biz / Lumen BUS300 (CC — summarize) or Heizer/Chopra/APICS (not CC).
- Live "focus on" notes not yet harvested as a reading list.
- BUS300 nine-unit undergrad checklists, BUS208 POLC nine units, BUS605 ten-KA overlay copied wholesale into Unit 10.
- BUS300's 38 h, stale Lumen 54 h, BUS605's 44 h, or Class Central's missing-card-as-404.
- A fake ACE / SAYA id. Live catalog: **no college-credit recommendation**. SAYA-0038 is BUS300.
- The free 70% certificate as MBA credit or as ACE credit.
- Invented MMGT606/MEI606/MMKT606 OSCM twins.

## Exam-close (receipt only — not a study aid)

- 2026-09-02 Certificate final **passed**: **29/40 (72.5%)**, attempt **4151501**, cmid **61487**.
- Do **not** reconstruct items, dump the quiz, or sit ACE unless the operator asks.
- Do **not** reopen BUS606, BUS605, BUS604, BUS603, BUS602, or BUS301.
- Exam closes **PAUSED** 2026-09-02. Do **not** sit BUS607 or any other certificate final until the operator says resume. Chrome **FREE** (no live exam). Holds: BUS301 after 2026-09-09 1:02 AM ET; BUS602 after 2026-09-16 7:48 PM ET; BUS603 after 2026-09-16 8:02 PM ET. BUS208 webcam skip. Remaining exams not 0 (paused, not done).


---

## Merged from `prdv-scm-bullwhip-procurement-distribution` (2026-10-11)

- Original description: Frame an intro-supply-chain question using the Saylor PRDV304 school: apply SCM principles in various settings; explain the bullwhip effect and strategies to limit variation; apply criteria for choosing suppliers; and describe the two main areas of distribution management. Use when an adult-learner prompt asks how raw materials become a finished product at the customer. Do not use for Amazon-ops sends, inventing the two distribution-area names, inventing supplier scorecards, PRDV226 HR, PRDV227 strategy, ACE-credit promises, sending, or exam reconstruction.
- Unique content carried: one section per course code

# Intro SCM: bullwhip, procurement, distribution (clustered)

**Use when:** a prompt needs **introduction to supply chain management** — select suppliers, move raw materials to manufacturing, finish the product, deliver to the customer; fluctuations including the bullwhip effect; procurement criteria; two main areas of distribution — in the Saylor PRDV304 **Introduction to Supply Chain Management** school (4 h). **Never send.** Building mode: never pitch.

**Do not use when:** reconstructing exams; running operator Amazon/logistics *ops*; **PRDV226** HR; **PRDV227** planning/strategy; inventing the two distribution-area names; inventing supplier-scorecard metrics; promising ACE; **sending**.

This is **one** skill. Three live units, four CLOs. Loop: **principles in a setting then fluctuations/bullwhip then choose suppliers then distribution.** Do not mint three unit-skills. **Bullwhip is live.** Distribution’s two areas and supplier-criteria names are **not** live.

## 0. Hygiene

- Label **school**. Saylor **PRDV304**. LMS **1299**. Catalog **4 h / 0.4 CEU**. ACE **N**. Certificate: only the final counts; **70%**; live syllabus **14-day** wait; **max 3**. 0.4 CEUs. Last B&C PD after 231.
- Label **claim vs data**. Guest only. Units never opened. Guest objects: syllabus `95387`, CLO page `96388`, AI zone `102905`, intro video `103510` **not watched**. Syllabus last edited **2025-10-03**. **Not the late-1800s family.** **No LMS Chrome** until BUS601 (LMS 686). **No cert final.**
- Intro SCM ≠ Amazon send ≠ strategy course ≠ HR. Live intro: how goods get to stores (computers, produce, coffee); select suppliers for raw materials, bring to a plant, finish, deliver; snags include supplier problems, law changes, inefficiencies, hidden costs; useful even if you never work in SCM.
- Four **live** CLOs. **Never send.** Building mode: never sell/pitch. Not operator logistics.

## 1. Procedure — five checks

Run in order. Stop if Check A says another school or send.

### Check A — Identity overlay (always)

| Prompt smells like | Hand off |
|---|---|
| "Amazon listing / FBA send" | **not this** — refuse send; not Amazon-ops |
| "Goals / corporate strategy" | **PRDV227** |
| "Hire the buyer" | **PRDV226** |
| "How does this thing get to the customer" | **this skill** |
| "Send this PO / shipment" | **HITL — refuse send** |

**Primary goal:** literacy on the path from raw material to customer, including bullwhip and procurement. Named failure mode: inventing distribution-area names, treating this as Amazon ops, or sending.

### Check B — Principles in a setting (when "does SCM apply here" is in play)

CLO 1.

**Apply the principles of supply chain management to various organizational settings.** Live path: supplier → plant → finished goods → customer. Examples: computers, fruits and vegetables, coffee.

Shape: apply the path, do not invent a SCOR-model dump. Guest did not name SCOR.

### Check C — Fluctuations / bullwhip (when "orders swing wildly" is in play)

CLO 2. Unit 1.

**Explain the "bullwhip effect" and evaluate strategies to limit variation.** **Bullwhip is live.** Strategies to limit variation were **not named**. Intro hindrances: supplier problems, changes in laws, inefficiencies, hidden costs.

Shape: name bullwhip. Do not invent a four-cause roster. Evaluate limiting variation as a job without invented tactics.

### Check D — Choosing suppliers (when "who do we buy from" is in play)

CLO 3. Unit 2.

**Apply appropriate criteria in choosing suppliers.** Live unit: Supply Chain Procurement. Criteria **not listed**.

Shape: criteria exist as a job. **Do not invent** cost/quality/delivery/scorecard names. **Refuse send** of a PO or RFP.

### Check E — Two areas of distribution (when "how does it get to the customer" is in play)

CLO 4. Unit 3.

**Describe the two main areas of distribution management.** Guest named **no** areas.

Shape: two areas exist. **Do not invent** inbound/outbound, warehousing/transportation, or other pairs. Unnamed overlay, same rule as Tuckman.

## 2. Worked patterns (shape only)

**"Parts sit in three countries and we still stock out."**
Check B then C. Path + fluctuation/bullwhip.

**"Retail orders a spike, we overproduce."**
Check C. Bullwhip is live. Limit-variation tactics are **not live** — do not guess.

**"Pick a cheaper vendor."**
Check D. Criteria exist, names do not. Do not send the PO.

**"Is distribution warehousing plus trucking?"**
Check E. Two areas exist. Names are **not live**. Do not confirm a guessed pair.

**"Reorder this SKU and email the 3PL."**
Check A: **refuse send**. Literacy only.

## 3. Refuse / redirect

- Exam reconstruction, invented distribution-area dumps, invented scorecard dumps, invented SCOR dumps → refuse.
- ACE / transfer credit → **not current**.
- **Send** PO / shipment / Amazon ops → refuse. HITL. Building mode.
- PRDV226 / 227 → those schools.
- Late-1800s description as this job → refuse (family ended at 229).
- Copying 7-day unlimited from 102–104 → refuse; live is **14-day / max 3**.
- Watching intro video 103510 via Chrome → refuse until BUS601.

## 4. Adjacent skills (do not merge)

- **Planning / strategy** → PRDV227
- **HR / procurement of *people*** → PRDV226
- **Decision-making** → PRDV228
- **Spreadsheets / presenting data** → PRDV007 (not SCM)
- Operator Amazon store → not this literacy course

If a prompt needs both "strategy" and "the chain is whipping," recap 227 then C here. Still do not send.

## 5. What not to encode from this course

- Exam items. Invented inbound/outbound dumps. Invented supplier-scorecard dumps. Invented SCOR.
- A fake ACE id. A send path. Amazon FBA as this course.
- 7-day unlimited copied from PRDV102–104.
- Chrome / logged-in LMS / intro-video watch until BUS601 is submitted.
- Treating the two unnamed distribution areas as named.
