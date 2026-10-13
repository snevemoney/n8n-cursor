---
name: ug-discrete-structures
description: >
  Frame an undergraduate discrete-structures question using the Saylor
  CS202 school: start from single-membership sets and discrete (one
  state at a time), keep counting distinct from probability, keep
  logic distinct from induction/proofs, then seat recursion, graphs,
  trees, and finite-state automata as named units. Use when a prompt
  asks how to reason about discrete objects, assess a proof, count
  outcomes, diagram a hierarchy, or describe state transitions. Do
  not use for CS201 C++ ADT implementations, CS107 C++ language,
  CS101/102/105, CS402 networks, CS120, ENGL, SOC101, ACE exam-taking,
  or exam reconstruction.
---

# Discrete structures: single-membership first, then proof, then structure (clustered)

**Use when:** a task asks how to **place a discrete-math-for-CS question** in the Saylor CS202 school — sets/relations/functions, counting, logic, induction/proofs, probability, recursion, graphs, trees, or finite-state automata.

**Do not use when:** CS201 C++ data-structure implementation; CS107 C++ language; CS101 Java CS1; CS102 Programming II; CS105 Python; CS402 networks; CS120 Bitcoin; ENGL; SOC101; sitting ACE; exam reconstruction; ESL (PD still in flight).

This is **one** skill. Nine live units, one argument: **most students already have a calculus story or a coding-structures story; this course's pass is discrete — objects in one set, systems in one state, theory with practicality, then named seats from counting through automata.**

## 0. Hygiene

- Label **school**. Undergraduate **discrete structures** (Saylor CS202; live title **Discrete Structures**). Catalog Computer Science. **44 h / 4.4 CEU.** LMS **67** (`/course/cs202`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 13:40**. Primary: articles, lectures, videos. No guest-visible textbook.
- Nine **live** units: Sets, Set Relations, and Set Functions; Counting Theory; Mathematical Logic; Mathematical Induction and Proofs; Probability; Recursion; Graphs; Trees; Finite-State Automata.
- Ten **live** CLOs (single-membership solutions; discrete reasoning; probabilistic accuracy; assess proofs X→Y; predetermined sequences; next as function of previous; states and transitions; categorize outcomes; diagram hierarchies; apply networks as CS tools).
- Intro spine: **discrete** = sequence of individual steps (not continuous). **Single-membership** = grouped in only one set; system in only one state at a time.
- Neighbors: **CS201** implements trees/graphs in C++. **CS402** is computer communications (ACE SAYA-0016) — skip ACE here too. **CS120** Watchdog. **CS103** 404.
- Skip ACE. Skip webcam. Do not sit the final. Stay off ENGL*. Do not re-harvest SOC101.

**Label claim vs data.** Guest truncates. Named counting formulas, proof templates, and automaton examples are **login**. Encode the *job*.

## 1. Procedure — six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Identity (always)

| Prompt smells like | Hand off |
|---|---|
| Implement tree/stack/hash in C++ | **CS201** |
| C++ as a language course | **CS107** |
| Java CS1 / Programming II / intro Python | **CS101 / CS102 / CS105** |
| Packet networks / sockets | **CS402** |
| Bitcoin / CS120 | **Watchdog — do not harvest** |
| CS103 | **404 — no skill** |
| Take the final / ACE | **refuse** |
| Sets, proofs, counting, discrete graphs/trees, FSA | **this skill** |

**Primary goal:** discrete mathematics combining theory with practicality for computer science. Not "write the structure in C++" and not "pass calculus."

### Check B — Sets and counting (Units 1–2; CLOs 1, 2, 8)

Single-membership sets, relations, functions. Formulate solutions for problem classes that are classifiable / identifiable event categories. **Categorize all possible outcomes** or all possible collections (CLO 8) *before* probability.

Do not invent a live roster of inclusion-exclusion identities. Encode the *job*: which set, which relation/function, how many collections.

### Check C — Logic and proofs (Units 3–4; CLO 4)

Mathematical logic is Unit 3. Induction and proofs are Unit 4. CLO 4: **assess** a proof claiming Y holds given premise X — accept, reject, or repair the *claim shape*, not dump a proof textbook.

If they only need "is this statement compound," stay in logic. If they need "does this induction go through," Unit 4.

### Check D — Probability and recursion (Units 5–6; CLOs 3, 6)

Probability: **assess the accuracy of a probabilistic statement** in a specific situation (CLO 3). That sits *after* counting (Check B). Do not start here.

Recursion: next event or result is a **function of previous ones** (CLO 6). Predetermined sequences that depend on a limited sequence of events (CLO 5) may also live here or in automata — pick the seat that matches (sequence-of-actions vs self-reference vs state machine).

**Hand off CS201** if they want a recursive *implementation* on a linked structure. Stay here for the discrete recurrence.

### Check E — Graphs and trees (Units 7–8; CLOs 9–10)

Graphs: **apply networks of mathematical or system entities as tools in computer science** (CLO 10). Not CS402 routing. Not CS201 adjacency-list homework unless they explicitly want the C++ overlay — then recap and **hand off CS201**.

Trees: **diagram hierarchical relationships** (CLO 9). Hierarchy ≠ general graph. If they need both, name two seats.

### Check F — Finite-state automata (Unit 9; CLO 7)

Systems of states: collection of variables, **initial state**, **transition conditions**. One state at a time (intro spine). Predetermined sequences of actions that depend on a limited sequence of events (CLO 5) often land here.

Not a programming course. Not CS402. Encode state + transition + what is accepted/produced as the *job*.

## 2. Worked patterns (shape only — not exam items)

**"How many ways can we pick …?"**
Check B (counting / CLO 8). Probability only if they already categorized outcomes and now assess a statement (Check D).

**"Is this proof valid?"**
Check C: premise X, claimed Y, assess (CLO 4). Induction is Unit 4, not Unit 3 logic-only.

**"Draw the family / org / file hierarchy."**
Check E trees (CLO 9). If they also want C++ nodes, recap then **CS201**.

**"Can we model this as a graph?"**
Check E graphs (CLO 10). If they want packets and protocols, **CS402**.

**"This process has states and inputs."**
Check F FSA (CLO 7) plus intro single-state. Recursion (Check D) only if next is a function of previous *values*, not of machine state.

**"Is this CS202 or CS201?"**
Reason about the discrete object / proof / count → **this skill**. Implement the structure in C++ → **CS201**.

## 3. Refuse / redirect

- Exam reconstruction, item banks, sitting the final → refuse.
- ACE / transfer credit as this 70% cert → **not current**. Skip ACE. SAYA-0018 = CS302. SAYA-0016 = CS402.
- CS201 implementation homework → that skill.
- CS107 / CS101 / CS102 / CS105 language homework → those skills.
- CS402 networks → that skill.
- CS120 → Watchdog.
- CS103 → 404.
- ENGL* → Publishing.
- SOC101 re-harvest → refuse.
- ESL before PD is done → refuse this sitting (Big Boss: ESL after PD).
- Dumping a discrete-math textbook → summarize the school.

## 4. Adjacent skills (do not merge)

- Elementary data structures in C++ → CS201
- C++ programming → CS107
- Java CS1 / Programming II / intro Python → CS101 / CS102 / CS105
- Building with AI / ML / Python for data science → CS205 / CS207 / CS250 (next numeric after this close: **CS205**)
- Cryptography and network security → CS260
- Computer architecture → CS301
- Software engineering (ACE SAYA-0018) → CS302
- Operating systems → CS401
- Computer communications (ACE SAYA-0016) → CS402
- Databases / information security → CS403 / CS406
- CS120 → Watchdog
- CS103 → no course
- Saylor CS202 certificate exam → **do not encode**

## 5. What not to encode

- Exam items. Textbook dumps. Login-only LO letters guessed as fact.
- A fake SAYA id. 44 h confused with CS201's 36 h.
- Graphs as CS201 C++ or CS402 networks.
- Trees as CS105 nested dicts.
- Forums. Webcam. How to sit the final.
- ENGL*. SOC101. ESL this sitting. CS120.

## 6. Output shape

1. Name the school (CS202 discrete structures) and what it is not (especially **CS201** implementation vs this reasoning).
2. Name the **unit seat**.
3. If counting vs probability: categorize outcomes **before** assessing a probability statement.
4. If proof: assess Y given X; do not dump a chapter.
5. Do not invent ACE. Do not sit the final.

## 7. Guest vs login (do not bluff)

Guest has: catalog row, LMS 67, nine unit titles, ten CLOs, 44 h, 70% / 14-day / max 3, ACE N, single-membership definition.
Guest does not have: unit-LO letters, page 101905 job, assigned counting identities, automaton examples, item banks.

When a detail is login-only, say so and encode the *job* from the CLO.

## 8. Pass encoded (one paragraph)

Finishing CS202 means you can **reason about discrete objects that sit in one set and systems that sit in one state**: count collections, assess a proof that Y follows from X, check a probabilistic statement, describe recursion and state transitions, diagram hierarchies, and apply graph networks as CS tools. It does not mean you implemented those structures in C++ (**CS201**) or finished a networks course (**CS402**).
