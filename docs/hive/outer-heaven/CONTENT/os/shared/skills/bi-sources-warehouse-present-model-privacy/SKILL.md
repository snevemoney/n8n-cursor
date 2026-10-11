---
name: bi-sources-warehouse-present-model-privacy
description: >
  Frame a business-intelligence question using the standard undergraduate
  school (Saylor BUS250): pair the information systems that store, collect,
  and manage data with analytic techniques so decision-makers can run more
  efficient operations and compete. Use when naming what BI is, where the
  data comes from (TPS plus external and social-text feeds), why it lives
  in a governed warehouse, whether to present it (viz/dashboards) or model
  it (predictive / prescriptive / diagnostic / cluster; forecast / scenario),
  which class of BI tool fits, or whether privacy, anonymization, and policy
  allow the use. Do not use for BUS204 business statistics, BUS206 MIS
  survey, CS250 Python data science, PRDV spreadsheet or communicating-with-
  data courses, graduate BUS607/610/611/612, or exam-taking.
---

# Intro BI: sources, warehouse, present or model, privacy (clustered)

**Use when:** a task asks what business intelligence is for, which data should feed a decision-support system, why operational data is copied into a warehouse, how to interpret or visualize a result so a manager can act, which analytic family (predictive / prescriptive / diagnostic / cluster) or forecast/scenario model to reach for, which *class* of BI tool fits, or whether a use of data is allowed under privacy, protection, security, and policy.

**Do not use when:** the job is reconstructing or taking a Saylor (or any) exam, dumping Gallaugher / Bourgeois / OpenStax, running **BUS204** distributions-probability-inference-regression, **BUS206** five-components / CIA / Porter-Carr MIS survey, **BUS303** IT-as-firm-strategy, **CS105/CS250** Python implementation (pandas / scikit-learn / statsmodels), **PRDV004/006/007/433** spreadsheet mastery, **PRDV200** communicating-with-data craft, **BUS607** graduate data-driven decision-making, **BUS610** graduate advanced BI (lifecycle, text mining, dashboards as a PM problem), **BUS611** graduate DBMS/SQL, **BUS612** graduate data-driven communications, a vendor cert (Tableau / Power BI), or coaching privacy evasion / re-identification.

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". BUS250's eight units are one argument: **business intelligence is the manager-facing stack that turns stored data into a better decision** — sources → warehouse/governance → present or model → tool → stay legal — under undergraduate survey rules, not as a statistician, not as a programmer, and not as a spreadsheet operator.

## 0. Hygiene

- Label **school**. This is the **standard undergraduate introduction to business intelligence and analytics** school (Saylor BUS250; live materials are "articles, lectures, and videos," not a named book). Parallel public CC chapters exist in MIS textbooks — Gallaugher *Information Systems: A Manager's Guide to Harnessing Technology* v2.0 data-asset / BI-toolkit chapter (**CC BY-NC-SA 3.0 US** on the Saylor HTML / MERLOT record); *Business Information Systems: Design an App for That* BI chapter (**CC BY-NC-SA 3.0**); Bourgeois *Information Systems for Business and Beyond* ch.4 (**CC BY-NC 4.0**, that book is **BUS206's** spine). Shared with undergrad "intro BI / business analytics survey / decision support for managers" courses. It is not the only way to do analytics (CS data science, econometrics, vendor BI engineering). Say so if the user is not inside this course.
- Label **claim vs data**. Catalog ACE is **N**. Guest banner has **no** "College Credit Recommended." BUS250 is **absent** from Saylor's ACE credit table, the support ACE article, and the ACE National Guide org list. The live syllabus still carries **leftover ACE template copy** ($5 / 3 attempts / 14-day wait / "eligible for ACE credit") — that copy is **stale**. Live public total is **46 hours / 4.6 CEU**. No ACE ID, no ACE window. No SNLS/NCCRS archive located. No named live textbook. Unit 7 tool names are a **login gap**. Re-fetch hours, ACE list, and the live resource tree.
- Intro BI ≠ business stats ≠ MIS survey ≠ Python data science ≠ spreadsheet how-to ≠ graduate advanced BI. BUS204 *infers*. BUS206 *surveys the IS*. CS250 *implements in Python*. PRDV *operates Excel or crafts a chart*. BUS303 *allocates IT as strategy* (its Unit 3 only touches BI). BUS610 *deepens* the same stack at graduate grain with mining/text, dashboards, and project management. This skill *walks the undergrad BI stack* so a manager can ask the next question of data without becoming the statistician, the DBA, or the coder.
- No exam items. No all-rights-reserved chapter dumps. CC OER: summarize. BUS250 is **not** on any ACE allowed-materials list because it is not an ACE course.
- Ethics floor: do not dress a pre-chosen decision in a fake "the dashboard says so"; do not coach concealment, re-identification of anonymized data, or regulatory evasion; do not dump a GDPR/CCPA how-to-dodge. Anonymize / pseudonymize are named as *privacy supports* on the live intro.

## 1. Procedure — answer an intro-BI question in six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Identity: what BI is (always)

**BI pairs information systems that store, collect, and manage data with analytic techniques** so organizational decision-makers get information and insight. The point of the decision is more **efficient and effective operations** that enable a **competitive advantage**.

Say the split out loud:

| This school does | Neighbor that actually owns it |
|---|---|
| Manager-facing decision support from data | — |
| Five IS components / CIA / Porter-Carr / ERP-as-MIS | **BUS206** |
| Distributions, probability, sampling, inference, regression as a stats course | **BUS204** |
| Whether/where to deploy IT as firm strategy | **BUS303** (Unit 3 only *touches* BI) |
| Implement pandas / sklearn / statsmodels | **CS250** |
| Operate Excel / Google Sheets | **PRDV004/006/007/433** |
| Graduate BI lifecycle, text mining, dashboards-as-PM | **BUS610** |

If the prompt is "write the Python" or "run the t-test" or "build the five-component diagram," **stop and hand off**. Stay here for "what decision, fed by what data, through which BI step."

### Check B — Sources: what feeds the system

Public named sources:

1. **Transaction processing systems (TPS)** — automated operational systems create and store data as a by-product of doing business.
2. **External overlay** — customers, economic indicators, customer preferences.
3. **Text-based social media** — named on the live intro; treat as an unstructured/external text feed, not a Twitter-API course.

Ask: is the bit **internal/operational**, **external/purchased or public**, or **unstructured text**? Mixing them without saying so is how dashboards lie.

Parallel CC (unconfirmed live) also names CRM/SCM/ERP, surveys, and data aggregators. Use those names only as *optional* source types; do not assert Saylor assigned them until login.

**Hand off BUS204** if the real question is sampling bias or inference about a source. Stay here for "what is allowed to enter the BI system."

### Check C — Warehouse: store, model, govern, quality

**Big data is stored in data warehouses**, extracted and organized (the intro names **data mining** here as an organize-step), and incorporated into **data governance** and **quality management**. CLO 3 is data *modeling* and *warehousing* to organize and store.

Load-bearing idea (parallel CC, label as such): do **not** run heavy analytics against the live TPS — it slows operations. Copy into a warehouse (ETL is the Design-an-App name; do not require the acronym unless the live tree uses it). A **data mart** is the narrower, problem-or-function slice — parallel CC, not a live unit title.

Quality and governance come *before* pretty charts. Garbage in, dashboard out is still garbage.

**Hand off BUS611** for DBMS, SQL, data models, big-data processing, cloud. **Hand off CS250** for the pipeline code. Stay here for "why this belongs in a warehouse, and can we trust it."

### Check D — Present or model

Public intro split — this is the course's load-bearing fork:

**Sometimes presentation is enough.** Unit 5 / CLO 5: visualization and **dashboards** in formats the live intro actually names:

- graphs
- heat maps
- tree maps
- charts
- word clouds
- text tables
- sentiment analysis

Dashboard = heads-up for a decision-maker, not decoration. **Hand off PRDV200 / PRDV007** for *how to draw* the chart or how people process visuals. Stay here for "this format is how BI reports the answer."

**Often presentation is not enough.** Unit 6 / CLO 6: data populate **models** the decision-maker can interact with through **forecasting** and **scenario analysis**. Named analytic families:

| Family | Manager question |
|---|---|
| Diagnostic | Why did this happen |
| Predictive | What is likely to happen |
| Prescriptive | What should we do |
| Cluster | What groups exist in this data |

Refine and optimize from **feedback** and evolving requirements. A one-shot model that is never checked is not this school's analytics.

Unit 4 / CLO 4 sits between warehouse and this fork: **analyze and interpret for actionable insight**. If it cannot change a decision, it is not yet BI.

**Hand off BUS204** for the statistical machinery behind a forecast. **Hand off CS250** to fit the model in code. Stay here for "present vs model, and which family."

### Check E — Tools (class, not vendor zoo)

CLO 7: apply **common business intelligence tools** to relevant problems. **The public syllabus names no product.**

Encode the *job*, then name a **class** of tool:

- reporting / dashboarding
- spreadsheet exploration
- OLAP / cube-style slice-and-dice (Gallaugher parallel)
- mining / modeling environment

Do **not** invent Tableau, Power BI, Looker, or a Saylor sandbox as assigned. If the user names a vendor, you may talk to that class of tool without claiming Saylor taught it.

**Hand off PRDV004/006/007/433** to actually operate the spreadsheet. **Hand off CS250** to write the notebook. Stay here for "this problem needs a reporting tool vs a model vs a warehouse query."

### Check F — Privacy, protection, security, policy

CLO 8: apply legal and ethical considerations to **specific case situations**. Live intro: laws and **industry-specific regulations**; ethical principles underlying them; adhere. Support privacy including **anonymize** and **pseudonymize**. Ethical best practices live in **organizational policies**.

Before shipping a dashboard or a model:

1. May we use this data for *this* decision (law + industry rule + policy)?
2. If we can, have we **anonymized or pseudonymized** where the intro says privacy needs support?
3. Security/protection is a constraint on the stack, not a CS406 controls course.

Named statutes (GDPR, CCPA, HIPAA, GLBA, etc.) are a **login gap**. Parallel CC names HIPAA as a health-data example — do not assert it as a live BUS250 unit unless the tree does. Industry-specific = name the industry, then say which rule *might* bind, and flag the gap.

**Hand off BUS200** for ethics theory. **Hand off BUS205** for the legal-environment survey. **Hand off CS406** for implementation. Stay here for "may this BI use proceed, and how do we support privacy." Do not coach re-identification or evasion.

## 2. Worked micro-patterns

**"What is BI / why should we bother?"**
Check A. IS + analytics → decision-makers → ops advantage. Not "we bought a dashboard."

**"We have cash-register data, plus tweets, plus a purchased customer file."**
Check B then C. TPS + social text + external. Warehouse/govern before mixing. Do not query the register database for the quarterly model.

**"The chart looks fine — ship it?"**
Check D then F. Presentation can be enough *if* it answers the decision. If not, you need a model. Either way, privacy/policy.

**"Why did sales drop / what happens next quarter / what should we do / who are the segments?"**
Check D. Diagnostic / predictive / prescriptive / cluster. Forecast or scenario if they need to interact with the model. Stats machinery → BUS204. sklearn → CS250.

**"Which tool do I learn — Tableau or Python or Excel?"**
Check E. Class of tool from the problem. Do not pretend Saylor named a vendor. Spreadsheet ops → PRDV. Python → CS250.

**"Can we mash loyalty-card data with health records / scrape social and deanonymize?"**
Check F. No. Anonymize/pseudonymize are supports, not puzzles to undo. Do not coach the mash-up.

**"Is this an information system / what's the CIA triad / should we buy ERP?"**
Wrong home. **BUS206** (and BUS303 for the buy/strategy question). You may *name* that BI sits on top of systems that store data.

**"How do I pass the Saylor final / what's on the quiz?"**
Refuse. No items. No blueprint. Point at the public unit list and eight CLOs only.

## 3. Adjacent skills (do not merge)

- **Business statistics (distributions → probability → sampling → inference → regression)** → BUS204 (**do not merge**)
- **MIS survey (five components, eras, CIA, Porter/Carr, ethics+globalization as IS impact)** → BUS206 (**do not merge**)
- **IT as firm strategy; ERP/BPM; BI as a strategy unit** → BUS303 (**do not merge**)
- **Python for data science (pandas, scikit-learn, scipy.stats, statsmodels, time series code)** → CS250 (**do not merge**)
- **Intro Python** → CS105
- **Spreadsheets I–III + generative-AI spreadsheet automation** → PRDV004 / PRDV006 / PRDV007 / PRDV433 (Spreadsheet Mastery program **id=12**)
- **Communicating with data / dashboard craft / how people process visuals** → PRDV200
- **Graduate data-driven decision-making (leadership, continuums, CRM storytelling)** → BUS607 (Advanced Leadership program **id=19**)
- **Graduate advanced BI (lifecycle, mining/text, warehousing, dashboards, project management)** → BUS610
- **Graduate data management (DBMS, SQL, data models, cloud, warehousing as DBA)** → BUS611
- **Graduate data-driven communications** → BUS612
- **Graduate applications of MIS** → BUS642
- **Business ethics theory** → BUS200
- **Legal environment of business** → BUS205
- **Information-security specialty** → CS406

If a prompt needs both "which analytic family" and "fit it in scikit-learn," run this skill first for the BI frame, then hand off CS250.

## 4. What not to encode from this course

- Exam items, quiz banks, discussion-prompt keys, or "how to pass the Saylor final."
- Chapter dumps from Gallaugher (CC BY-NC-SA — summarize; unconfirmed live), Design-an-App BI (CC BY-NC-SA — summarize), Bourgeois (CC BY-NC 4.0 — that is BUS206), OpenStax 8.2 (CC BY-NC-SA — unconfirmed), or UTS *Decoding Data* (not Saylor). FlatWorld paid Gallaugher reprints are not the CC HTML.
- Invented Unit 7 vendor lists (Tableau / Power BI / Looker) or invented Unit 8 statute lists (GDPR / CCPA) presented as live Saylor assignments.
- BUS204 inference checklists, BUS206 five-component tables, CS250 notebooks, PRDV spreadsheet steps, BUS610 graduate lifecycle/PM.
- Stuvia / Course Hero item banks.
- Syllabus ACE boilerplate as if catalog ACE were Y. Live is **ACE N**, **46 h / 4.6 CEU**, no SAYA id.
- Privacy evasion, re-identification, or "the dashboard said so" as a substitute for a decision.
