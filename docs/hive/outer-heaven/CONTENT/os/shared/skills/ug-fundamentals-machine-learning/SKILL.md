---
name: ug-fundamentals-machine-learning
description: >
  Frame an undergraduate fundamentals-of-machine-learning question
  using the Saylor CS207 school: start from supervised vs unsupervised
  and the ML workflow, keep preprocess distinct from visualize, keep
  regression distinct from logistic regression and from clustering,
  then evaluate (overfit/underfit, basic metrics), implement a
  reproducible end-to-end project, and analyze ethics. Use when a
  prompt asks how to learn, prepare, fit, or judge an ML model as
  this 19-hour course. Do not use for CS205 building-with-AI as the
  whole map, CS250 pandas/sklearn as a data-science course, CS105
  intro Python, CS120, ENGL, ACE exam-taking, or exam reconstruction.
---

# Fundamentals of ML: workflow first, then model family, then judge (clustered)

**Use when:** a task asks how to **place an ML-fundamentals question** in the Saylor CS207 school — supervised vs unsupervised, the workflow, preprocess/visualize/feature extraction, regression vs logistic vs clustering, overfit, metrics, a reproducible project, or ethics.

**Do not use when:** CS205 building-with-AI as the SKU; CS250 Python for data science; CS105 intro Python; CS201/202; CS120; ENGL; sitting ACE; exam reconstruction.

This is **one** skill. Ten live units, one argument: **most students already have a "train a model" story or a CS205 agent story; this course's pass is ML as a workflow — concepts, prepare data, fit one named family, evaluate honestly, ship a documented project, then ethics.**

## 0. Hygiene

- Label **school**. Undergraduate **fundamentals of machine learning** (Saylor CS207). **19 h / 1.9 CEU.** LMS **1267** (`/course/cs207`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 13:43**. Primary: articles, lectures, videos. Description: hands-on **Python** to build and evaluate ML models. Guest does **not** name pandas/sklearn as live — encode Python + the job; **CS250** owns pandas/sklearn as a course.
- Ten **live** units: Intro; Workflow; Preprocessing; Visualization; Supervised Regression; Supervised Logistic Regression; Unsupervised Clustering; Evaluation and Validation; Practical Implementation; Ethical and Responsible AI.
- Eight **live** CLOs.
- Next numeric: **CS250**. Skip CS120. Skip ACE. Stay off ENGL*.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| Agents, search, games, NLP as a *build-with-AI* survey | **CS205** |
| pandas / sklearn / statsmodels as *data science* | **CS250** |
| Intro Python 3 syntax | **CS105** |
| Take the final / ACE | **refuse** |
| ML workflow, regression/logistic/cluster, metrics, ethics | **this skill** |

### Check B — Concepts and workflow (Units 1–2; CLOs 1–2)

Supervised vs unsupervised. Workflow: **data collection, preprocessing, modeling, evaluation**. Do not fit a model before naming the stage.

### Check C — Prepare (Units 3–4; CLO 3)

Preprocess ≠ visualize. Combined apply-job: prepare data sets, interpret, **feature extraction**. Visualization is Unit 4, not CS205 matplotlib-on-a-list (that's CS105) and not CS250 EDA-as-a-course.

### Check D — Model families (Units 5–7; CLO 4)

Three named seats: **regression** (Unit 5), **logistic regression** (Unit 6 — the live classification seat), **clustering** (Unit 7). CLO 4 says regression, classification, clustering — do not invent a random-forest unit. Implement as the *job*; libraries are login.

### Check E — Judge (Unit 8; CLOs 5, 7)

Overfitting, underfitting, other challenges. **Basic metrics** to explain performance. Evaluation before "we're done."

### Check F — Ship and ethics (Units 9–10; CLOs 6, 8)

End-to-end projects with **documented, reproducible workflows**. Then **ethical and responsible AI** as a live unit, not a disclaimer.

## 2. Worked patterns (shape only)

**"Supervised or unsupervised?"**
Check B. If they already have labels → Units 5–6. If they want groups → Unit 7.

**"The model's accuracy is 99%."**
Check E: overfit/underfit, basic metrics, validation. Then Check C: was the data leaked in preprocess?

**"Which algorithm?"**
Check D: regression vs logistic vs clustering from the *job* (numeric target, binary class, groups). Not CS205 search.

**"Build the whole pipeline."**
Check B workflow → Check C prepare → Check D one family → Check E judge → Check F document. Ethics if the data or use is human.

**"CS207 or CS205?"**
ML-as-the-course (19 h, workflow through ethics) → **this skill**. Agents/search/NLP/games as a build → **CS205**.

**"CS207 or CS250?"**
Fit/evaluate an ML model in Python as this map → **this skill**. DataFrames, sklearn as *data science course* → **CS250**. Recap then hand off if the homework is pandas.

## 3. Refuse / redirect

- Exam reconstruction; sitting the final; ACE as this 70% cert.
- CS205 / CS250 / CS105 as if this were those SKUs.
- Inventing sklearn/pandas as confirmed live CLO language.
- CS120. ENGL*. Textbook dumps.

## 4. Adjacent

CS205 (previous), CS250 (next), CS105, CS201, CS202, CS260, CS301, CS302 (ACE SAYA-0018 — skip ACE here), CS401–406, CS120 Watchdog, CS103 404, Saylor CS207 exam (do not encode).

## 5. What not to encode

Exam items. Fake SAYA. 19 h confused with CS205's 48 h or CS250's 67 h. Named libraries as live. Forums. Webcam. ENGL. CS120.

## 6. Output shape

1. Name the school (CS207 fundamentals of ML) and what it is not (**CS205**, **CS250**).
2. Name the **unit seat**.
3. If a model: regression vs logistic vs clustering.
4. If a score: overfit/metrics before celebration.
5. Do not invent libraries. Do not sit the final.

## 7. Guest vs login

Guest has: catalog, LMS 1267, ten units, eight CLOs, 19 h, ACE N, Python in the description, 70% / 14-day / max 3.
Guest does not have: library names, whether logistic is the only classifier, unit-LO letters, item banks.

## 8. Pass encoded

Finishing CS207 means you can **walk an ML workflow in Python**: prepare and visualize, fit regression or logistic or clustering, catch overfit, explain basic metrics, document a reproducible project, and analyze ethics. It does not mean you finished CS205's AI-build survey or CS250's data-science course.
