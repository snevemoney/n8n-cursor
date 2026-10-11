---
name: bizstat-describe-sample-infer-regress-checklists
description: >
  Frame a business-statistics question using the standard undergraduate
  school (Saylor BUS204): workplace inference from imperfect samples —
  describe the data so the mean cannot lie, model uncertainty with
  probability and the normal, sample so the CLT applies, estimate
  intervals and test hypotheses (fail-to-reject is not proof), then fit
  a simple regression without confusing correlation with cause. Use when
  summarizing a dataset, choosing a sample, reading a confidence
  interval or p-value, or drawing a line through business data. Do not
  use for BUS103 financial accounting, BUS105 managerial CVP, MA121
  math-department intro stats, BUS250 BI/analytics, or exam-taking.
---

# Business statistics: describe, sample, infer, regress (clustered)

**Use when:** a task asks what a workplace number actually means, how to summarize a dataset without letting the mean lie, how likely an event is under a named distribution, how a sample was (or should have been) drawn, whether a sample mean or proportion supports a claim, how to read a confidence interval, or how two business series move together on a scatter plot.

**Do not use when:** the job is reconstructing or taking a Saylor (or any) exam, dumping Shafer / Nica / OpenStax, running **BUS103** financial-cycle / GAAP / four-statement work, **BUS105** cost-CVP-relevant-control, **MA121** intro stats as a mathematics / “science of data” course, **BUS250** warehouses / mining / dashboards / predictive-prescriptive analytics, **BUS607** data-driven decision-making, **BUS202** TVM / beta as a finance object, **CS250** Python for data science, **PRDV004–007 / Spreadsheet Mastery** Excel mechanics, **PRDV200** communicating with data as a comms course, **PRDV420** R, or chi-square / ANOVA / machine-learning model shops.

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". BUS204's six units are one argument: **business statistics is workplace inference from imperfect samples** — describe so the mean cannot lie, model with probability and the normal, sample so the CLT applies, estimate and test (fail-to-reject ≠ prove), then regress without confusing correlation with cause, usually in a spreadsheet, not a warehouse.

## 0. Hygiene

- Label **school**. This is the **standard undergraduate business statistics** school (Saylor BUS204; Shafer & Zhang *Introductory Statistics* as an archived public spine, **CC BY-NC-SA**; OpenStax CNX *Principles of Business Statistics* / Illowsky–Dean as a parallel remix, **CC BY 3.0**, that **skips probability**; OpenStax *Introductory Business Statistics 2e*, **CC BY 4.0**, as a fuller parallel). Shared with almost every undergrad “business statistics” / “stats for business and economics” / STA 2023-style course. It is not the only way to do inference (Bayesian, resampling-first, causal ML). Say so if the user is not inside this course.
- Label **claim vs data**. Class Central / SNLS banner “53 hours,” ACE National Guide Version 3 “39 hours,” and NCCRS “122 hours” (recommendation **ended December 2023**) are **stale or expired**. Live public total is **40 hours / 4.0 CEU**. ACE: **SAYA-0037**, 3 LD SH Business Statistics, **2025-06-01 → 2028-05-31**. Historic LMS id=109. Nica’s missing probability chapter vs live Unit 2. SNLS marketing example uses “cluster sampling” in a way that is easy to confuse with stratified — prefer standard intro-stats definitions and flag the archive wording. Re-fetch hours, ACE window, and transfer rules.
- Business statistics ≠ financial accounting ≠ managerial CVP ≠ math-dept intro stats ≠ BI/analytics. BUS103 *books* the numbers. BUS105 *costs* them. MA121 *teaches stats as a science of data* (and has **no ACE**). BUS250 *warehouses, mines, and dashboards* them. This skill *infers from a sample* so a manager can act.
- No exam items. No all-rights-reserved chapter dumps. CC OER: summarize. The public *t*/*z* tables PDF is a lookup tool, not a table dump.
- Ethics floor: do not dress a pre-chosen decision in a p-value; do not p-hack, hide the sampling method, or treat correlation as cause. Hypothesis tests cannot prove H0 true.

## 1. Procedure — answer a business-statistics question in five checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Identity: describe so the mean cannot lie (always)

**Statistics = gather, analyze, interpret data.** This course is the **workplace** application (anthropology to hedge funds is the public range; the job is still a managerial decision). Summary statistics give an overview; they do **not** always tell the story. Half the class at 100 and half at 60 is not “an 80.”

**Quantitative vs qualitative.** Name the type before you pick a picture or a formula. Quantitative → mean/median/spread, histogram. Qualitative → counts, mode, bar/pie. Mixing them is how dashboards lie.

**“Average” in this school is any single middle.** The three common ones:

| Measure | Meaning | When it misleads |
|---|---|---|
| Arithmetic mean | Sum / n | Outliers, strong skew, the 100/60 exam |
| Median | Value that splits the ordered list in half | Tiny samples; ignores how far the tails go |
| Mode | Most common value | Multimodal or continuous data with no repeats |

Spread: **variance** and **standard deviation** (and, from the CC spines, range / IQR / box plot as extras). Graphs: frequency table, histogram. CLO 4 is “create a picture of *this* dataset,” not a Tableau build — **hand off BUS250** for dashboards, heat maps, warehouses.

**Population vs sample** starts here (30 store prices vs every store’s price for the 50-inch TV) and is spent in Checks C–D. Parameter belongs to the population; statistic belongs to the sample.

If the prompt is “close the books / read the 10-K,” **stop and hand off BUS103**. If it is “break-even units / relevant cost,” **hand off BUS105**. If it is “statistics as a science of data” with no workplace frame, **hand off MA121**.

### Check B — Model: counting, probability, the normal

Before you infer, name the random mechanism.

1. **Count the ways** (permutations vs combinations) when “how many outcomes” is the blocker. This is intro counting, not **CS202** discrete structures.
2. **Probability** of an event; a **distribution** is a model of how the data is organized (line-graph of likelihood, not a user-chosen histogram bin).
3. **Random variable.** Discrete vs continuous. Binomial at intro depth (n independent trials, two outcomes, constant p) — Nica *assumes* it; Shafer teaches it. Do not skip discrete-vs-continuous just because a remix has no probability chapter.
4. **Normal model.** Standard normal, **z-score**, area to the left/right of *x*. Many business events can be approximated as normal **if** the assumptions hold — say the if. Empirical rule (68–95–99.7) is the descriptive preview; z makes it exact. **Do not dump the z-table**; look up.

Unit 2 is live on this course and **missing from Nica**. If a source skips probability and jumps to z, you still owe Check B.

### Check C — Sample: method + CLT

You will not get a census. Unemployment, QC off the line, a marketing test — all samples. **The method must fit the application.**

Encode the NCCRS/intro list (names, not a sampling consultancy):

| Method | One-line |
|---|---|
| Simple random | Every subset of size n equally likely |
| Systematic | Every k-th after a random start |
| Stratified random | Sample from **every** stratum |
| Cluster | Sample **some** clusters whole |
| Convenience | Whoever is handy (bias risk) |
| Panel | Same respondents over time |
| Quota | Fill demographic slots, not randomly |

Sampling frame ≠ population. Sampling error is a named caution, not an accusation. SNLS’s marketing “divide by age/race/geography/income and sample each group” is **stratified** in standard vocab even when the archive says “cluster” — **label that conflict**; do not silently “fix” Saylor.

**Central limit theorem (load-bearing):** for large enough n, the sampling distribution of the mean is approximately normal (iid caveats this school teaches), which is why Check B’s normal becomes the engine of Check D. Sample size and the normal are CLO 7; do not skip the “why the mean is normal” step.

**Hand off BUS250** when the job is mining a warehouse or streaming big data. Stay here for “how did these rows get into the sheet, and can I treat the mean as normal?”

### Check D — Infer: estimate, then test (fail-to-reject ≠ prove)

**Estimation** = a disciplined guess from the sample. Point estimator first, then an **interval** over which the parameter could exist (mean with σ known vs **t** when σ unknown; proportion). Sample-size talk is allowed at intro depth.

**Hypothesis test anatomy** (one *or* two samples — CLO 10):

1. Write H0 and Ha in context. H0 is the “no change / claim / innocence” statement this school tests.
2. Choose the test (one-sample mean or proportion; two means independent or paired; two proportions).
3. Significance level α. “Beyond a reasonable doubt” is the public courtroom analogy for α — analog, not a legal opinion.
4. Test statistic and decision.
5. Conclusion **in the business context**.

**Load-bearing doctrine:** a hypothesis cannot be proven true; it can only be **rejected** or **not rejected**. Fail to reject H0 is **not** a proof of H0 (the jury’s “not guilty” is not “innocent”). Do not let the user “accept the null.” Do not dress a decision already made in a p-value.

Type I / Type II at naming depth. Two-sample is in the live CLO; do not hide behind a remix that only does one sample.

**Hand off BUS105** for CVP / make-or-buy as cost. **Hand off BUS202** for NPV / WACC. Stay here for “is this sample different from the claim, and how sure are we?”

### Check E — Relate: regression without causation

If two series move together, **does one cause the other?** Usually you do not know.

**Simple linear model (live CLOs 11–12):**

- Name **dependent** (response) vs **independent** (predictor). Speed vs fatalities is the archive’s example: accidents depend on speed, not the other way around — and even that is not a cause until confounders are faced.
- Scatter plot first. Least-squares line: intercept + slope. The **regression coefficient / slope** is how the line is shaped (CLO 12).
- Correlation coefficient and r² at intro depth. Low coefficient → look for other factors (time of day, rain, alcohol in the archive example).
- Predict only inside the data range this school will support; say when you are extrapolating.
- **Multiple regression** is *named* as an extension (several independents at once), not a live unit. Do not run a full multivariate course.
- Finance overlay: stock vs market regression coefficient = **beta** → **BUS202**. Do not teach CAPM here.
- Spreadsheet is the workbench (NCCRS). Not PRDV Excel formatting, not CS250 pandas, not BUS250 a predictive-analytics platform.

Chi-square / ANOVA (Shafer ch.11) are **not** live BUS204 units. If that is the actual job, say so and do not pretend.

**Hand off BUS250 / BUS610 / CS207** for predictive/prescriptive stacks and ML. Stay here for one line, one coefficient, and an honest “this is association.”

## 2. Worked micro-patterns

**"What does this average actually mean / which number should we show?"**
Check A. Mean vs median vs mode. Draw the picture. Name quantitative vs qualitative. The 100/60 exam is the caution.

**"How likely is this event / is it normal?"**
Check B then C. Count, name the distribution, z if normal assumptions hold. CLT if they are talking about a *mean of a sample*.

**"We surveyed 30 stores / 200 customers — can we act?"**
Check C then D. Method first (frame, strata vs cluster, convenience bias). Then interval or test. Do not skip “how did this sample happen.”

**"Is next year’s profit below 5% / did the new process change the mean?"**
Check D. Write H0/Ha. Fail-to-reject ≠ prove. Courtroom analogy if they want to “accept the null.”

**"Does speed cause fatalities / does ad spend drive sales?"**
Check E. Scatter, line, coefficient. Correlation ≠ causation. Name confounders. Multiple regression only as a named next step.

**"Give me the beta of this stock."**
Wrong home. **BUS202**. You may *name* that beta is a regression coefficient; do not run the finance course.

**"Build the dashboard / warehouse / predictive model."**
Wrong course. **BUS250** (and BUS610 / CS250 as depth). This skill will still insist the mean can lie and that the sample is not the population.

**"Close the month / break-even units."**
Wrong course. **BUS103** / **BUS105**.

**"How do I pass the Saylor final / what’s on the quiz?"**
Refuse. No items. No blueprint. Point at the public unit list and CLOs only.

## 3. Adjacent skills (do not merge)

- **Financial cycle / four statements / GAAP** → BUS103 (packet neighbor; do not merge)
- **Cost / CVP / relevant cost / control** → BUS105 `mgracct-cost-cvp-relevant-control-checklists`
- **Math-department intro stats / science of data** → MA121 (not harvested; **no ACE**; do not merge)
- **BI warehouses, mining, dashboards, predictive/prescriptive** → BUS250 (not harvested; do not merge)
- **Data-driven decision-making (grad spec)** → BUS607 (program id=19; not harvested)
- **TVM / NPV / WACC / beta as finance** → BUS202 `corpfin-tvm-value-capital-checklists`
- **Spreadsheet mechanics / GenAI-in-sheets** → PRDV004 / PRDV006 / PRDV007 / PRDV433 (Spreadsheet Mastery id=12)
- **Communicating with data** → PRDV200 (not harvested)
- **Python for data science / R** → CS250 / PRDV420 (not harvested)
- **Survey 4Ps / intro to business literacy** → BUS101
- **Integrity / stakeholder / CSR** → BUS200 (p-hacking and deceptive charts fail the ethics floor here too)

If a prompt needs both “is this sample mean real?” and a warehouse/dashboard, run this skill first for the inference frame, then hand off BUS250.

## 4. What not to encode from this course

- Exam items, quiz banks, discussion-prompt keys, or "how to pass the Saylor final." The SNLS Direct Credit box (50 MC / 2 hours / closed-book) is **archive**, not a live blueprint.
- Chapter dumps from Shafer (CC BY-NC-SA — summarize), Nica / Illowsky (CC BY — summarize), or OpenStax IBS 2e (CC BY — summarize).
- Live "focus on" notes not yet harvested; Shafer ch.11 chi-square/ANOVA as if they were live Saylor units.
- BUS103 financial-cycle checklists, BUS105 CVP tables, MA121 math-dept framing, BUS250 BI stacks, BUS202 CAPM.
- Stuvia / Course Hero item banks; Nica’s TI-83 keystroke sequences as if required.
- Class Central 53-hour, ACE Guide 39-hour, or NCCRS 122-hour figures as if live (live is **40 h / 4.0 CEU**).
- p-hacking procedures, fake sampling frames, or treating fail-to-reject as proof.
