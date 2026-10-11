---
name: ug-building-with-ai
description: >
  Frame an undergraduate building-with-AI question using the Saylor
  CS205 school: start from what intelligence is (Turing test and four
  orientations), keep agents distinct from ML, keep supervised library
  application distinct from unsupervised/RL principles, then seat
  problem-solving, heuristic search, iterative improvement, two-person
  games, NLP libraries, and reasoning under uncertainty. Use when a
  prompt asks how to build an AI business solution as this survey, not
  how to run CS207 ML-as-a-course or CS250 pandas. Do not use for
  CS105 intro Python, CS201/202, CS120, ENGL, ACE exam-taking, or
  exam reconstruction.
---

# Building with AI: intelligence, then agents, then methods (clustered)

**Use when:** a task asks how to **place a building-with-AI question** in the Saylor CS205 school — definition of intelligence, agents, which ML kind, search vs improvement vs games, NLP with libraries, or reasoning under uncertainty.

**Do not use when:** CS207 ML-as-a-course; CS250 pandas/sklearn data science as the SKU; CS105 intro Python; CS201/202; CS120; ENGL; sitting ACE; exam reconstruction.

This is **one** skill. Ten live units, one argument: **most students already have a chatbot story or a model-training story; this course's pass is building with AI — define intelligence, pick an agent, then the method (ML, search, games, NLP, reasoning) as named seats, with business-solution language in the CLOs.**

## 0. Hygiene

- Label **school**. Undergraduate **building with artificial intelligence** (Saylor CS205). **48 h / 4.8 CEU.** LMS **777** (`/course/cs205`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 13:42**. Primary: articles, lectures, videos. No guest-visible textbook.
- Ten **live** units (What Is AI through Reasoning Agents). Eleven **live** CLOs.
- CLO language: **AI business solutions**; **contemporary libraries** (supervised); **existing libraries** (NLP analysis and generative). Guest does **not** name the libraries — encode the *job*, do not invent sklearn/spacy as live.
- Next numeric after this close: **CS207**. Skip CS120 (Watchdog). Skip ACE. Stay off ENGL*.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| ML fundamentals as a *course* | **CS207** |
| pandas / sklearn data science as a *course* | **CS250** |
| Intro Python 3 syntax | **CS105** |
| C++ ADTs / discrete proofs | **CS201 / CS202** |
| Take the final / ACE | **refuse** |
| Intelligence, agents, search, games, NLP, reasoning as a *build* | **this skill** |

### Check B — Intelligence and agents (Units 1–2; CLOs 1–3)

Turing test → **four basic orientations of modern AI**. Then **agents** in contemporary AI business solutions: types and capabilities. Do not start at neural nets.

### Check C — Machine learning (Units 3–4; CLOs 4–6)

Kinds of ML and why they matter for **building AI business solutions**. **Apply supervised** algorithms and contemporary libraries (CLO 5) — job, not a guessed package. **Explain** unsupervised and RL principles (CLO 6) — explain ≠ apply-supervised.

If the homework is a DataFrame pipeline, recap CLO 5 then **CS250**. If the homework is ML-as-the-whole-course, **CS207**.

### Check D — Problem-solving and search (Units 5–7; CLOs 7–8)

General AI problem-solving methods and computational characteristics (CLO 7 / Unit 5). **Heuristic search** to improve optimality (CLO 8 / Unit 6). **Iterative improvement** is Unit 7 — not the same as heuristic search. Do not collapse.

### Check E — Games (Unit 8; CLO 11)

Basics of **two-person, adversarial** game-playing. Not CS202 graph theory. Not NLP.

### Check F — NLP and reasoning (Units 9–10; CLOs 9–10)

NLP with **existing libraries** for **analysis and generative** applications. Logical reasoning and **reasoning under uncertainty**. Agents return here as *reasoning* agents (Unit 10), not Unit 2's intro types.

## 2. Worked patterns (shape only)

**"Is this intelligent / does it pass Turing?"**
Check B Unit 1. Four orientations before a library.

**"Which agent should we use?"**
Check B types/capabilities, then Check C or D depending on whether the build is learned or searched.

**"Supervised vs unsupervised vs RL"**
Check C: describe kinds (CLO 4); apply supervised + libraries (CLO 5); explain unsupervised/RL (CLO 6).

**"How do we search this space?"**
Check D: general method vs heuristic vs iterative improvement — three seats.

**"Chess / two-player"**
Check E. Not Unit 6 search-as-pathfinding unless they framed it that way — then name both seats.

**"Analyze text / generate text"**
Check F NLP. Libraries are login. Not CS105 strings.

**"CS205 or CS207?"**
Whole-map build (agents+search+NLP+ML) → **this skill**. ML-only course → **CS207**.

## 3. Refuse / redirect

- Exam reconstruction; sitting the final; ACE/transfer as this 70% cert.
- CS207 / CS250 / CS105 / CS201 / CS202 homework as if this were those SKUs.
- CS120. ENGL*. Inventing library names as live CLO language.
- Dumping an AI textbook.

## 4. Adjacent

CS207 (next), CS250, CS105, CS201, CS202, CS260, CS301, CS302 (ACE SAYA-0018 — skip ACE here), CS401–406, CS120 Watchdog, CS103 404, Saylor CS205 exam (do not encode).

## 5. What not to encode

Exam items. Fake SAYA. 48 h confused with CS207's 19 h. sklearn as confirmed live. Forums. Webcam. ENGL. CS120.

## 6. Output shape

1. Name the school (CS205 building with AI) and what it is not (**CS207**, **CS250**).
2. Name the **unit seat**.
3. If ML: supervised-apply vs unsupervised/RL-explain.
4. If search: heuristic vs iterative improvement.
5. Do not invent libraries. Do not sit the final.

## 7. Guest vs login

Guest has: catalog, LMS 777, ten units, eleven CLOs, 48 h, ACE N, 70% / 14-day / max 3.
Guest does not have: library names, unit-LO letters, Course Map, item banks.

## 8. Pass encoded

Finishing CS205 means you can **say what intelligence and agents are, pick a method (ML, search, games, NLP, reasoning), and talk about AI business solutions** — including applying supervised methods with libraries whose names are login. It does not mean you finished CS207 or CS250.

## Enrich 2026-10-10: minimal cited RAG (`yt:XN3xNJvWXsc` IBM tiers)
Tier order: fundamentals → embeddings/RAG + agents → deploy/observability. The smallest honest RAG: chunk, index, top-k, cite the chunk ids, refuse below threshold. `mini_rag.py` (TF-IDF stand-in; swap in embeddings).
