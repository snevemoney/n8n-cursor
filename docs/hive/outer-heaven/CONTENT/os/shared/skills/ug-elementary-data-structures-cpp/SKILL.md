---
name: ug-elementary-data-structures-cpp
description: >
  Frame an undergraduate elementary-data-structures question using the
  Saylor CS201 school: start from algorithm efficiency, keep ADTs and
  CDTs distinct, interpret them in C++ (arrays, pointers, references,
  dynamic memory), then seat stacks/queues, linked variants, sequential
  vs binary search plus sorting, and hash tables / graphs / trees as
  one later unit. Use when a prompt asks which structure, how it is
  implemented in C++, or how expensive an operation is. Do not use
  for CS107 C++-as-language, CS101 Java CS1, CS102 Programming II,
  CS105 Python collections, CS202 discrete math, CS250 pandas, CS103
  (404), CS120, ENGL, ACE exam-taking, or exam reconstruction.
---

# Elementary data structures: efficiency first, then C++ ADTs (clustered)

**Use when:** a task asks how to **place a data-structures question** in the Saylor CS201 school — which ADT/CDT, how it is interpreted in C++, pointer vs array vs linked node, stack vs queue vs list, sequential vs binary search, or hash/graph/tree as the Unit 8 cluster.

**Do not use when:** CS107 C++ programming as a *language* course; CS101 Java CS1; CS102 Programming II; CS105 Python lists/dicts; CS202 discrete structures; CS250 pandas/sklearn; CS402 networks; CS103 (does not exist); CS120 (Watchdog); ENGL; sitting ACE; exam reconstruction.

This is **one** skill. Eight live units, one argument: **most students already have a language-syntax story or a Python-collections story; this course's pass is data stored so operations yield a type of output — efficiency first, then abstract the type, then implement it in C++, then search/sort and the Unit 8 cluster.**

## 0. Hygiene

- Label **school**. Undergraduate **elementary data structures** (Saylor CS201; live title **Elementary Data Structures**). Catalog Computer Science. **36 h / 3.6 CEU.** LMS **1307** (`/course/cs201`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 16:49**. Primary: articles, lectures, videos. No guest-visible textbook.
- Language of implementation in the live description and CLOs: **C++**. That is *ADT interpretation*, not CS107's C++-as-a-course.
- Eight **live** units: Algorithm Efficiency; Abstract Data Types and Arrays in C++; Pointers and References in C++; Dynamic Memory Allocation; Introduction to Stacks and Queues; Linked Stacks, Queues, and Lists; Searching and Sorting Algorithms; Hash Tables, Graphs, and Trees.
- Six **live** CLOs (ADTs; ADTs in C++; CDTs; implement with ADTs/CDTs; analyze resource utilization/efficiency; contrast sequential vs binary search). Units 5–6 and 8 still count even though the CLO list is short.
- Neighbors with skills already: **CS101** Java CS1, **CS102** Programming II, **CS105** intro Python 3, **CS107** C++ programming. **CS120** is Watchdog — do not harvest. **CS103** is a **404 numbering gap** — no skill.
- Certificate identity only. Completing the free 70% exam is **not** ACE. Skip ACE. Skip webcam. Do not sit the final. Stay off ENGL*. Do not re-close PSYCH/SOC.

**Label claim vs data.** Guest pages truncate ("Fetching learning content…"). Named sorts, node diagrams, and `new`/`delete` vs smart-pointer doctrine are **login**. Encode the *job*, not a guessed STL roster. Do not silently swap in Java generics or Python lists as live CLO language.

## 1. Procedure — six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Identity, language, overlay (always)

**The course question:** is the user asking for a **C++ language** answer (CS107), a **Java CS1** answer (CS101), a **Programming II** answer (CS102), a **Python collections** answer (CS105), a **discrete-math** answer (CS202), a **data-science** answer (CS250), or an **elementary data-structures** answer that has to name an ADT and its C++ interpretation?

Live test:

| Prompt smells like | Hand off |
|---|---|
| "Think like a CS / Java / arrays as CS1" | **CS101** |
| "Java and C++ / STL / sorting as Programming II" | **CS102** |
| "Write/trace a beginner Python 3 program: types, lists, dicts" | **CS105** |
| "C++ compile / templates / iostream as a *language* course" | **CS107** |
| "Proofs, sets, graphs as discrete math" | **CS202** |
| "pandas / sklearn" | **CS250** |
| "Bitcoin / CS120" | **Watchdog — do not harvest** |
| "CS103" | **404 — no skill** |
| "Which ADT / how expensive / pointer vs array / stack vs queue / sequential vs binary" | **this skill** |

**Primary goal:** survey basic abstract data types, their associated algorithms, and how they are implemented in **C++**. That is not "pass a C++ syntax exam" (**CS107**) and not "think in Java" (**CS101**).

**Level check:** if the prompt is actually CS107 homework (language, not structure), **hand off CS107**. If it is CS105 "should this be a list or a dict," stay at CS105 unless they want a tree/stack as CS — then **this skill**. If it is the Saylor certificate final, **refuse exam reconstruction**.

### Check B — Efficiency (when "how slow / big-O / which is cheaper" is in play)

CLO 5. Unit 1.

Analyze algorithms to estimate **computer resource utilization and efficiency**. Do this *before* picking a cute structure. Time and space as resources. Compare two approaches on the same job.

Do **not** invent a named big-O table as if guest-visible. Encode the *job*: estimate, compare, justify. Guest did not list the exact notation set.

**Hand off CS202** if the prompt is discrete-math proofs about graphs without an implementation seat. Stay here for "this algorithm vs that one on this ADT."

### Check C — ADTs, CDTs, arrays in C++ (when "what is this type / how is it an array" is in play)

CLOs 1–4. Unit 2.

1. **Describe the ADT** (what operations, what guarantees) without jumping to bytes.
2. **Interpret it in C++** (CLO 2) — native terms of the language, not Java, not Python.
3. **Describe the CDT** (CLO 3) — composite as distinct from the abstract type.
4. **Implement a solution using algorithms that employ ADTs and CDTs** (CLO 4).
5. Arrays in C++ are the first concrete seat. Indexing, contiguous layout, and why that matters for efficiency (Check B).

Intro residue: data stored in certain forms so operations yield a type of output; abstract the donor before estimating real donors. Encode **abstract then operate**, not the nonprofit story as an item.

**Hand off CS107** for "how do I declare a C++ array / class" as language. Stay here for "this is the ADT, this is the C++ array interpretation."

### Check D — Pointers, references, dynamic memory (when "address / alias / new / leak" is in play)

Units 3–4.

- **Pointers and references in C++** are two seats. Pointer: address, dereference, arithmetic as *this course uses it* (do not dump a C book). Reference: alias. Do not collapse.
- **Dynamic memory allocation** is Unit 4, after pointers. Heap vs the array in Unit 2. Encode the *job* (allocate, use, release) without inventing a smart-pointer doctrine as live CLO language.

These seats exist so Units 5–6 can be array-backed *or* linked. If the prompt is still "what is an ADT," stay in Check C.

**Hand off CS107** for C++ memory as a language unit. Stay here when memory is in service of an ADT.

### Check E — Stacks, queues, linked variants (when "LIFO / FIFO / node / list" is in play)

Units 5–6.

- **Unit 5:** introduction to stacks and queues — typically the array-backed reading of LIFO vs FIFO, after arrays and before linking.
- **Unit 6:** **linked** stacks, queues, *and* lists. Linking is the point. Do not treat Unit 5 and Unit 6 as one "stack chapter."

Operations: push/pop vs enqueue/dequeue vs list insert/delete as *jobs*. Efficiency (Check B) decides array vs linked for the same ADT.

**Hand off CS105** if they wanted a Python list. **Hand off CS102** if they wanted Programming II STL as that course. Stay here for elementary stack/queue/list in C++.

### Check F — Search, sort, hash, graphs, trees (when "find / order / map / connect / hierarchy" is in play)

Units 7–8. CLO 6.

- **Unit 7:** searching and sorting algorithms. **Contrast sequential and binary search** is the named CLO. Binary search assumes an ordered collection — sorting is in the same unit because of that dependency. Do not invent a required sort roster (quick/merge/heap) as guest-visible; encode the *job* (search technique, why ordered, resource cost).
- **Unit 8:** hash tables, graphs, and trees **together**. One unit, three structures. Hash: average-case lookup vs tree vs scan. Graph: vertices/edges as an ADT, not CS402 packet-switching. Tree: hierarchy, not CS105 nested dicts.

If the prompt is "which search," run CLO 6 before drawing a tree. If the prompt is "network protocol," **hand off CS402**. If the prompt is "discrete graph theory," **hand off CS202**.

## 2. Worked patterns (shape only — not exam items)

**"Should I use an array or a linked list?"**
Check A (this skill, not CS105) → Check B (access pattern, extra memory) → Check C (array ADT/CDT) vs Check E Unit 6 (linked list). Pointers (Check D) only if they must build the nodes.

**"Why is my binary search wrong?"**
Check F: is the collection ordered (Unit 7 sort sits with search)? Sequential vs binary is the CLO. If they never sorted, that is the bug shape — not an exam item.

**"Stack or queue?"**
Check E Unit 5: LIFO vs FIFO. If they need to insert in the middle, Unit 6 list. If they need random lookup, Unit 8 hash/tree, not a stack.

**"What's a pointer vs a reference?"**
Check D. If they asked how to *compile* C++, **hand off CS107**. If they asked how the stack ADT is stored, stay here.

**"I need a tree / graph / hashmap."**
Check F Unit 8 as one cluster. Do not open CS202 proofs or CS402 networks. Do not open CS105 dicts as this map.

**"Is this CS201 or CS107?"**
ADT, efficiency, structure choice → **this skill**. Syntax, compilation, C++ as the course → **CS107**.

**"Is this CS201 or CS105?"**
Python list/dict/matplotlib → **CS105**. Trees/stacks as CS structures in C++ → **this skill** (CS105's own adjacent line).

## 3. Refuse / redirect

- Exam reconstruction, practice-item harvesting, certificate-final text → refuse. Point at public CLOs and this checklist.
- CS107 C++-as-language homework → that skill. Stay here only for the ADT overlay.
- CS101 Java homework → Java CS1 skill.
- CS102 Programming II homework → that skill.
- CS105 Python homework → that skill, unless they explicitly want stacks/trees as CS201.
- CS202 discrete-math homework → that skill.
- CS250 pandas/sklearn → that skill.
- CS120 Bitcoin → Watchdog owns the claim. Do not harvest.
- CS103 → 404. No skill. Do not invent one.
- ACE / transfer-credit / "this 70% certificate is college credit" → **not current**. Skip ACE. SAYA-0018 is **CS302**. SAYA-0016 is **CS402**. Do not invent a CS201 SAYA.
- Sitting the Saylor final / webcam ACE → refuse.
- ENGL* harvest → refuse.
- Re-closing PSYCH101 / SOC101 → refuse.
- Dumping a C++ textbook or STL reference as if it were the live reader → summarize the school; do not paste chapters.
- Inventing a live `std::vector` / smart-pointer doctrine as guest-visible CLO language → encode the *job* with arrays, pointers, references, DMA as named units.

## 4. Adjacent skills (do not merge)

- **Java introduction to programming I** → CS101
- **Java/C++ introduction to programming II** → CS102
- **Intro Python 3** → CS105
- **C++ programming (language)** → CS107
- **Discrete structures** → CS202 (next numeric after this close)
- **Building with AI / ML / Python for data science** → CS205 / CS207 / CS250
- **Cryptography and network security** → CS260
- **Computer architecture** → CS301
- **Software engineering (ACE SAYA-0018)** → CS302
- **Operating systems** → CS401
- **Computer communications and networks (ACE SAYA-0016)** → CS402
- **Modern database systems** → CS403
- **Information security** → CS406
- **CS120 Bitcoin for Developers I** → Watchdog
- **CS103** → no course
- **Saylor CS201 certificate exam** → **do not encode**

If a prompt needs both "what is a C++ pointer" and "what is a stack," recap Check D, then **this skill's Check E** — do not paste CS107's language checklist as this skill.

## 5. What not to encode from this course

- Exam items, quiz banks, discussion-prompt keys, or "how to pass the Saylor final."
- A named live textbook. Guest: articles, lectures, videos.
- Live "focus on" notes not yet harvested.
- CS107 C++ language checklists copied wholesale, CS105 Python collection checklists, CS101 Java checklists.
- A fake current ACE / SAYA id. Live catalog: **no college-credit recommendation**.
- The free 70% certificate as ACE or degree credit.
- CS103 as if it existed. CS120 as if it were this desk.
- Invented sort names as required live titles.
- Forums. Webcam ACE. How to sit the certificate final.
- ENGL*. PSYCH/SOC re-close.

## 6. Output shape

1. Name the school (CS201 elementary data structures in C++) and what it is not (especially **CS107** and **CS105**).
2. Name the **unit seat** (efficiency / ADT-array / pointer-ref / DMA / stack-queue / linked / search-sort / hash-graph-tree).
3. If they asked efficiency: estimate resources **before** naming a cute structure.
4. If they asked search: **sequential vs binary**, and whether the collection is ordered.
5. Do not invent ACE. Do not sit the final. Do not harvest CS120.

## 7. Guest vs login (do not bluff)

Guest has: catalog row, pretty URL, LMS 1307, eight unit titles, six CLOs, 36 h, 70% / 14-day / max 3, ACE N, C++ in the description.
Guest does not have: unit-LO letters, Course Map expansions, named code files, which sorts are assigned, whether vector is live, item banks.

When a detail is login-only, say so and encode the *job* from the CLO.

## 8. Pass encoded (one paragraph)

Finishing CS201 means you can **describe an ADT, say it in C++, pick a CDT, implement an algorithm on it, estimate whether that algorithm is an acceptable use of computer resources, and contrast sequential vs binary search** — with stacks/queues (array then linked), lists, sorting, and the hash/graph/tree cluster as the rest of the map. It does not mean you finished CS107, CS105, or a discrete-math course.
