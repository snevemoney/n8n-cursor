---
name: ug-python-for-data-science
description: >
  Frame an undergraduate Python-for-data-science question using the
  Saylor CS250 school: start in Google Colaboratory, keep numpy arrays
  distinct from pandas dataframes (including spreadsheet I/O), keep
  visualization on arrays/dataframes distinct from CS105 list plots,
  then seat sklearn data mining (supervised, clustering, statistical
  models) and statsmodels time series (AR vs MA vs ARIMA). Use when a
  prompt asks how to process, analyze, mine, or model data in Python
  as this 67-hour course. Do not use for CS105 intro Python, CS207
  ML-fundamentals as the whole SKU, CS205 building-with-AI, BUS611
  SQL, CS120, ENGL, ACE exam-taking, or exam reconstruction.
---

# Python for data science: Colab, then numpy/pandas, then sklearn/statsmodels (clustered)

**Use when:** a task asks how to **place a Python data-science question** in the Saylor CS250 school — Colab, numpy arrays, pandas dataframes/spreadsheets, viz on arrays/frames, sklearn mining, or statsmodels time series.

**Do not use when:** CS105 beginner Python; CS207 ML-as-a-19h-course; CS205 agents/search/NLP; BUS611 SQL; CS120; ENGL; sitting ACE; exam reconstruction; ESL (PD still in flight).

This is **one** skill. Ten live units, one argument: **most students already have intro Python or a generic "do ML" story; this course's pass is data science in named Python modules — Colab, numpy, stats, pandas, viz, sklearn mining in three seats, then statsmodels time series.**

## 0. Hygiene

- Label **school**. Undergraduate **Python for data science** (Saylor CS250). **67 h / 6.7 CEU.** LMS **504** (`/course/cs250`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 13:49**. Primary: articles, lectures, videos.
- Named live environment: **Google Colaboratory**.
- Named live modules: **numpy**, **pandas**, **scikit-learn**, **statsmodels**; intro also **scipy.stats**.
- Ten **live** units. Fifteen **live** CLOs.
- Next numeric: **CS260**. Skip CS120. Skip ACE. Stay off ENGL*. ESL waits.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| `int`/`list`/`matplotlib` on a list / beginner class | **CS105** |
| ML workflow / overfit / ethics as a 19 h *fundamentals* course | **CS207** |
| Agents, search, games, NLP as a *build* | **CS205** |
| SQL / MBA data-management plan | **BUS611** |
| Take the final / ACE | **refuse** |
| Colab, numpy, pandas, sklearn, statsmodels, ARIMA | **this skill** |

### Check B — What and where (Units 1–2; CLOs 1–2)

What is data science. Python's relevance. **Colab** to implement and test. Do not start in a local IDE as live CLO language.

### Check C — Arrays, stats, frames (Units 3–5; CLOs 3–6)

**numpy** arrays (Unit 3). Basic statistical computation (Unit 4; scipy.stats in the intro). **pandas** dataframes (Unit 5) plus **spreadsheet I/O** (CLO 6). Array ≠ dataframe. Do not reach for sklearn yet.

### Check D — Visualization (Unit 6; CLO 7)

Scripts that visualize **arrays and dataframes**. Not CS105 plot-a-list as this map. If they only have a Python list, recap then **CS105** unless they should `np.array` / `pd.DataFrame` first (Check C).

### Check E — Data mining (Units 7–9; CLOs 8–13)

Three seats, sklearn-named:
- I Supervised learning (apply + explain)
- II Clustering (unsupervised)
- III Statistical modeling + regression scripts

sklearn for **data mining** (CLO 8) and **statistical models** (CLO 12). Regression analyses as Python scripts (CLO 13). If they want CS207's overfit/ethics workflow without pandas, recap then **CS207**. Stay here when the object is a dataframe/array in sklearn.

### Check F — Time series (Unit 10; CLOs 14–15)

**statsmodels** to build and analyze time-series models. Explain **AR vs MA vs ARIMA**. Not sklearn's Units 7–9. Not CS207 logistic.

## 2. Worked patterns (shape only)

**"I have a spreadsheet."**
Check C CLO 6 (pandas ↔ spreadsheet) then Check D viz or Check E mine.

**"Should this be numpy or pandas?"**
Check C: homogeneous array vs tabular dataframe. Viz (Check D) uses both.

**"Fit a classifier / cluster / regression."**
Check E: Unit 7 vs 8 vs 9. sklearn. If they never built a dataframe, Check C first.

**"Is this random walk / seasonality / ARIMA?"**
Check F. AR vs MA vs ARIMA is the CLO. statsmodels, not sklearn.

**"Colab vs Jupyter vs Pickcode?"**
Live CLO is **Colab**. Pickcode is **CS105**. Do not claim Jupyter is the Saylor CLO.

**"CS250 or CS105?"**
DataFrame / numpy / sklearn / statsmodels → **this skill**. Types, lists, `re`, beginner class → **CS105**.

**"CS250 or CS207?"**
Named data-science stack + time series → **this skill**. ML workflow/overfit/ethics without this stack → **CS207**.

## 3. Refuse / redirect

- Exam reconstruction; sitting the final; ACE as this 70% cert.
- CS105 / CS207 / CS205 / BUS611 as if this were those SKUs.
- CS120. ENGL*. ESL this sitting.
- Dumping pandas/sklearn galleries. Inventing seaborn as live if guest didn't name it (viz is "scripts using arrays and dataframes").

## 4. Adjacent

CS105, CS207 (previous), CS205, CS201, CS202, CS260 (next), CS301, CS302 (ACE SAYA-0018 — skip ACE here), CS401–406, BUS611, CS120 Watchdog, CS103 404, Saylor CS250 exam (do not encode).

## 5. What not to encode

Exam items. Fake SAYA. 67 h confused with CS105 41 h / CS207 19 h. Pickcode as this CLO. Forums. Webcam. ENGL. CS120.

## 6. Output shape

1. Name the school (CS250 Python for data science) and what it is not (**CS105**, **CS207**).
2. Name the **module + unit** (Colab / numpy / pandas / viz / sklearn I-II-III / statsmodels).
3. If time series: **AR vs MA vs ARIMA**.
4. If a spreadsheet: pandas I/O (CLO 6).
5. Do not sit the final. Do not invent ACE.

## 7. Guest vs login

Guest has: catalog, LMS 504, ten units, fifteen CLOs, named Colab/numpy/pandas/sklearn/statsmodels/scipy.stats, 67 h, ACE N.
Guest does not have: unit-LO letters, viz library brand, item banks.

## 8. Pass encoded

Finishing CS250 means you can **work data science in Python on Colab**: numpy arrays, pandas frames (including spreadsheets), viz on both, sklearn mining in three seats, statsmodels time series with AR/MA/ARIMA distinct. It does not mean you finished CS105 or CS207.
