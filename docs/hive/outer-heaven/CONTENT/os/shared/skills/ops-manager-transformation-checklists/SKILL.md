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
