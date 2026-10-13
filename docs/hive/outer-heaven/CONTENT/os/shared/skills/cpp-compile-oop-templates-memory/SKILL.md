---
name: cpp-compile-oop-templates-memory
description: >
  Frame an undergraduate C++ question using the Saylor CS107 school:
  edit and compile C++, code elementary types and control, define
  functions/arrays/struct/unions/enumerations, write OOP applications,
  write templates and manipulate files, translate simple word problems,
  debug common C++ errors, and manage allocation/deallocation. Use when
  a prompt asks how to write, trace, or repair a C++ program at intro
  through OOP/files/memory depth. Do not use for CS101 Java CS1, CS102
  Java/C++ II (STL/search-sort), CS105 Python CS1, CS201 data structures,
  CS202 discrete, CS250 pandas, CS403 databases, BUS611 SQL, ACE-credit
  promises, vendor C++ dumps, or exam reconstruction.
---

# C++ programming: compile, OOP, templates, memory (clustered)

**Use when:** a task asks how to **write a beginner-to-intermediate C++ program** — compile and run, pick a type, branch or loop, factor a function, group data in an array/struct/union/enum, design a class, write a template or a file I/O routine, debug a common error, or allocate/deallocate memory — in the Saylor CS107 **C++ Programming** school.

**Do not use when:** the job is reconstructing or taking a Saylor (or any) exam, dumping *Think C++* / Busbee / cppreference / Gaddis, running **CS101** Java CS1, **CS102** Java/C++ continuation (OOP-as-sequel / STL / containers / exceptions-as-a-course / search-sort), **CS105** Python CS1, **CS201** ADTs in C/C++, **CS202** discrete-math recursion, **CS250** pandas/sklearn, **CS403** CS-database, **BUS611** graduate SQL/data-management, promising ACE/transfer credit from expired **SAYA-0017**, coaching vendor C++ certs, encoding Think C++ **ch.19–22** stacks/queues/trees/heap as this course, or inventing Eclipse as the confirmed live IDE.

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". CS107's five live units are one argument: **finishing the course means you can edit and compile C++ and use it to solve simple word problems — types, control, functions, simple data structures, classes, templates and files, debug, memory — not that you became a Java programmer, a Python programmer, a Programming II STL student, or a data-structures analyst.**

## 0. Hygiene

- Label **school**. This is the **undergraduate C++ programming** survey (Saylor CS107; live title **C++ Programming**). LMS **65** (`/course/cs107`, Moodle category **9** Computer Science). Catalog Computer Science, **40 h / 4.0 CEU** (catalog card writes **4 CEU**), **not** graduate-level. **No degree twin** (do not invent MCS107 / CS707). Parallel texts: Downey *Think C++* (hub **CC BY-NC-SA 4.0**; 2016 Terms of Use lists the PDF as **CC BY-NC 3.0** — **attribution-named**, not re-confirmed on the Oct 2025 syllabus) and Busbee *Programming Fundamentals using C++* (**CC BY 4.0** — **not named**). Syllabus: articles, lectures, and videos. CS101 owns "think like a computer scientist" in **Java**. CS102 owns OOP / Java-vs-C++ / STL as a *sequel course*. CS105 owns the same CS1 *job* in **Python 3**. CS201 owns ADTs. It is not the only C++ school (university CS1-in-C++, vendor certs). Say so if the user is not inside this course.
- Label **claim vs data**. Live catalog + LMS + syllabus (Oct 2025) say **C++ Programming**, **40 hours / 4.0 CEU**, five units, eight CLOs, **Free Certificate**, **14-day / max 3**, **70%**. Catalog ACE **N**. Expired **SAYA-0017** (06/01/2019–**11/30/2022**, 3 LD CS or CIS, version 2) was **not renewed** — do not treat it as live and do not invent a *new* SAYA id. **SAYA-0018 is CS302**. **SAYA-0016 is CS402**. **SAYA-0012 is CS101**. **SAYA-0002 is BIO101B**, not this course. SNLS still names **Eclipse** and **8 h/unit** and a **$25 College Credit** comment; Class Central still lists **Saylor Direct Credit**. JSON-LD placeholder copy "Unit 1: Introduction; Unit 2: Core Concepts; Unit 3: Advanced Topics" is **junk** — encode the five live titles. Terms of Use last modified **2016-12-15**; syllabus **2025-10-03**. Completing the free certificate is **not** an ACE recommendation. Re-fetch if the user needs current transfer rules.
- Label **login gaps**. This COURSE-SKILL was closed from **public sources only** (operator lock 2026-09-02). Guest LMS does **not** expand units. **Not public / do not invent:** live unit intros, unit-level LOs, "focus on" resource notes, assigned-reader confirmation, **IDE product name**, unit quizzes, study-guide book, practice-exam **items**, certificate-final **blueprint or items**. Eight public CLOs + five live unit titles + intro-named phenomena are the encode depth. SNLS unit intros (Eclipse; parking-garage arrays; inheritance/polymorphism; templates then files then exceptions) are **archive residue** — useful as *topic hints*, not as live wording. Confirm on a later login pass; do not fill gaps from Chrome.
- C++ language course ≠ Java CS1 ≠ Python CS1 ≠ Programming II ≠ data structures ≠ discrete math ≠ pandas ≠ CS database ≠ MBA SQL. **CS101** *teaches* CS1 in Java. **CS102** *continues* in Java+C++ / STL. **CS105** *teaches* CS1 in Python. This skill *writes C++*. **CS201** is ADTs. **CS202** is discrete. **CS250** is pandas. **CS403** is databases as CS. **BUS611** stores and retrieves as an MBA plan.
- Live Saylor intro (Oct 2025): learn the **mechanics of editing and compiling programs in C++**; essential elements **variables, loops, expressions, functions, string class**; then **OOP: classes, inheritance, templates, exceptions, file manipulation**; then **function and class templates** and **file character I/O**; also **namespaces, exception handling, preprocessor directives**; last part **linked lists and binary trees**. Named language is **C++**. Do not swap Java or Python in.
- No exam items. No textbook dumps. CC OER: **summarize. Do not dump.** Certificate identity only: **70%**; live syllabus **14-day** wait, **max 3** attempts. Unit assessments do **not** count toward the certificate. **40 h / 4.0 CEU.** **Do not encode 26 h (CS101), 51 h (CS102), 41 h (CS105), 36 h (CS201), 44 h (CS202), 67 h (CS250), 29 h (CS403), or 44 h (BUS611).** ACE: **not current**. Skip forums. Skip webcam ACE. Do not sit the final. Do not start the certificate exam.
- Five **live** units (Oct 2025 syllabus — use these): Introduction and Setup; Structuring Program Code; Working with Simple Data Structures; Object-Oriented Programming; Advanced Concepts.
- Eight **live** public CLOs (do **not** invent unit-level LOs): compile and execute C++; elementary data types and conditional and iteration structures; functions, arrays, struct, unions, and enumerations; OOP applications; templates and manipulate files; translate simple word problems into C++; debug and fix common C++ errors; manage memory including allocation/deallocation.

## 1. Procedure — answer an undergrad C++ question in six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Identity, language, overlay (always)

**The course question:** is the user asking for a **Java CS1** answer, a **Python CS1** answer, a **Java/C++ Programming II / STL / search-sort** answer, an **ADT / discrete-math / pandas / CS-database / MBA SQL** answer, or a **C++ program** that has to compile and show they can use the language through OOP/files/memory?

Live test:

| Prompt smells like | Hand off |
|---|---|
| "Think like a CS / write-trace-repair Java CS1: types, I/O, methods, arrays, recursion" | **CS101** |
| "Java and C++ / OOP building blocks / STL / containers / exceptions / search-sort as Programming II" | **CS102** |
| "Write/trace/repair Python 3: types, ops, flow, collections, files, regex, class" | **CS105** |
| "ADTs, stacks/queues/trees, algorithms in C/C++ as a *course*" | **CS201** |
| "Sets, induction, graphs, trees, automata, recursion as *math*" | **CS202** |
| "pandas / sklearn / statsmodels / time series" | **CS250** |
| "ERD, 3NF, relational algebra, SQL as a *CS* course" | **CS403** |
| "Pick a DBMS / write SQL / data-management plan" | **BUS611** |
| "Compile/write/trace/repair C++: types, control, functions, array/struct, class, template, file, memory" | **this skill** |

**Primary goal:** write C++ programs that compile and solve simple word problems. That is not "pass a vendor C++ cert," not "write Python" (**CS105**), not "think in Java" (**CS101**), and not "STL + search-sort as a course" (**CS102**). C++-the-skill **is** the point of this course (unlike CS101's "Java as a means").

**Named live failure mode:** treating this as a Java course, a Python course, CS102's sequel, or CS201 ADT analysis.

**Named live language:** **C++**. Encode C++. Other languages are fine as *equivalents* if the user is not inside Saylor; do not claim Java or Python is the Saylor CS107 CLO.

**Think C++ overlay (attribution-named 2016 — not confirmed live 2025; summarize, do not dump):** ch.1–17 + files/templates/lists as *topic match* for Units 1–5. **Do not file ch.19–22** (stacks, queues, trees, heap) as CS107 — that depth is **CS201**. Busbee overlay (not named): Units 1–3 only. **Do not encode Eclipse / Dev-C++ / any IDE product as live CLO language** (login gap). Encode the *job*: edit, compile, execute.

**Level check:** if the prompt is actually CS102 STL/search-sort, **hand off CS102**. If it is CS201 trees-as-ADTs, **hand off CS201**. If it is the Saylor certificate final, **refuse exam reconstruction**; this skill is the *content* overlay, not the exam.

### Check B — Compile and setup (when "how do I start / why won't this compile / what is main" is in play)

CLO 1. Unit 1 Introduction and Setup.

1. **Compile and execute code written in C++** (CLO 1).
2. Mechanics of **editing and compiling** (live intro). `main`, a first program, variables, arithmetic (SNLS archive hint — confirm login).
3. CLO 6 starts here: **translate a simple word problem** into a program that actually builds.

Think C++ ch.1 overlay (summarize): what a program is; compile/run as the *job*. Do **not** dump Hello World listings as if they were Saylor's assigned lab. IDE name is a **login gap** — SNLS says Eclipse; 2016 Terms of Use attributes an Eclipse-debugging article. Encode the *job* (write, compile, run) and leave product names until login.

**Hand off CS101** for Java compile/run. **Hand off CS105** for Pickcode / Python interpreter. Stay here for C++ compile/execute.

### Check C — Types and control (when "which type / if / loop / string" is in play)

CLO 2. Unit 2 Structuring Program Code (string class sits here in the live intro + SNLS).

- **Elementary data types and conditional and iteration structures** (CLO 2).
- Live intro names **variables, loops, expressions**, then **the string class**.
- CLO 7 (debug common errors) starts as soon as the program compiles but is wrong, or does not compile.

Think C++ ch.2–7 overlay (summarize): types; conditionals; iteration; strings. SNLS archive: by-value vs by-reference and scope with functions — that is Check D. Do not invent a live primitive-type list as guest-visible CLO language — encode the *job* (which type, which control structure).

**Hand off CS101** for Java types/`if`/loops. **Hand off CS105** for Python `int`/`float`/`str`/`bool`. Stay here for C++ types/control/string class.

### Check D — Functions and simple data structures (when "function / array / struct / union / enum / vector" is in play)

CLO 3. Units 2–3.

- **Define and use functions, arrays, struct, unions, and enumerations** (CLO 3).
- Unit 3 title: **Working with Simple Data Structures**. Course Description also names **vectors**. SNLS: arrays first, then struct/union/enum; vectors/queues/lists named as examples of "data structures" then set aside.
- This is CS1 grouping, **not** CS201 ADT analysis. A `struct` is not a stack.

Think C++ ch.3–5 (functions) + ch.8–10 (structures/vectors) overlay (summarize). Busbee arrays/file-I/O as *topic match* only.

**Hand off CS201** for trees/stacks as CS. **Hand off CS102** for STL containers as Programming II. Stay here for C++ functions + array/struct/union/enum.

### Check E — OOP (when "class / object / inheritance / private / polymorphism" is in play)

CLO 4. Unit 4 Object-Oriented Programming.

- **Write C++ applications using principles of object-oriented programming** (CLO 4).
- Live intro: **classes, inheritance** (templates/exceptions/files are also named in that sentence — they also live in Unit 5 / CLO 5).
- SNLS archive: class vs object, private/protected, inheritance including more than one class, polymorphism. **Confirm login.** Encode the *job*: design a class, instantiate an object, inherit. Do not invent a multiple-inheritance doctrine as guest-visible CLO language.

Think C++ ch.11–15 overlay (summarize). **Do not** use Busbee's one-chapter OOP as Unit 4 depth. **Hand off CS102** once the job is Java+C++ OOP as *Programming II* or STL. **Hand off CS105 Unit 10** for beginner Python classes. Stay here for C++ classes as this course.

### Check F — Templates, files, debug, memory, advanced overlay (when "template / file / exception / new-delete / list / tree" is in play)

CLOs 5, 6, 7, 8. Unit 5 Advanced Concepts (+ overlays).

- **Write templates and manipulate files** (CLO 5). SNLS Unit 5 order: generic programming / templates → file read/write → exceptions.
- **Translate simple word problems into C++** (CLO 6) — whole-course close; the program has to compile (Check B) and use the right structures.
- **Debugging and fixing of common C++ errors** (CLO 7). Syntax vs logic. Not CS102 exceptions-as-a-course, though the live intro names exception handling.
- **Manage memory appropriately, including proper allocation/deallocation procedures** (CLO 8). Encode the *job*. Do not invent RAII vs `new`/`delete` as live CLO language until login. Expired ACE named **pointers** as an LO; live CLO 3 does **not**. Pointers/references overlay CLO 8 + Think C++ ch.16 — label the gap.
- Intro-named last part: **linked lists and binary trees**. Overlay Unit 5. **Not** CS201. **Not** Think C++ ch.19–22 as live units. Intro also names **namespaces, exception handling, preprocessor directives**.

**Hand off CS102** for STL / search-sort / exceptions as Programming II. **Hand off CS201** for ADT analysis of lists/trees. **Hand off CS105 Unit 7/9** for Python files/`try`. Stay here for C++ templates, file character I/O, debug, allocation/deallocation, and intro-named lists/trees as language constructs.

## 2. Worked patterns (shape only — not exam items)

**"I need a C++ program that reads numbers and repeats an action."**
Check A (this skill, not CS105) → Check B (compile) → Check C (types + loop) → Check F if they must read a file (CLO 5). Do not reach for Python `input` or pandas.

**"Why won't this compile / it compiles but the answer is wrong?"**
Check B (CLO 1) → Check C/D (CLO 7: common errors) → Check F if the bug is memory (CLO 8) or a missing include/template. Not a Python Traceback lecture (**CS105**). Not CS102 exceptions-as-a-course.

**"Should this be a function or a class?"**
Check D (CLO 3: oft-used blocks as functions) vs Check E (CLO 4: data+functions as a class). If they want Java/C++ OOP as Programming II or a class hierarchy plus STL, **hand off CS102**.

**"Array vs struct vs class vs STL vector."**
Check D for array/struct/union/enum. Course Description names **vectors** — encode as a simple contiguous collection, **not** CS102's STL unit as a *course*. Check E if they actually need a class. Check F if they named a linked list/tree from the intro.

**"Template / write a file / new and delete."**
Check F. CLO 5 pairs templates **and** files. CLO 8 is allocation/deallocation. If they want Boost or STL algorithms, **hand off CS102**. If they want a heap/priority queue, **hand off CS201**.

**"Is this CS107 or CS101 or CS102 or CS201?"**
C++ compile + types/control/functions/array/struct + class + templates/files/memory → **this skill**. Java CS1 through recursion → **CS101**. Java+C++ OOP/STL/search-sort as II → **CS102**. ADT analysis of stacks/trees → **CS201**.

## 3. Refuse / redirect

- Exam reconstruction, practice-item harvesting, certificate-final text, unit-quiz items, study-guide Q&A dumps → refuse. Point at public CLOs, this checklist, Think C++ / Busbee *summaries*.
- CS101 Java homework → Java CS1 skill. Stay here only for a C++ restatement of the CS1 job.
- CS102 / STL / search-sort homework → that skill. C++ overlay only at CS107 depth (no STL-as-a-course CLO).
- CS105 Python homework → Python CS1 skill.
- CS201 data-structures homework → that skill. Arrays/struct/intro-named lists overlay only as language constructs.
- CS202 discrete homework → that skill. No live CS107 recursion CLO.
- CS250 pandas / CS403 databases / BUS611 SQL → those skills.
- ACE / transfer-credit / "this 70% certificate is college credit" → **not current** for CS107. Free certificate only. **SAYA-0017 expired 11/30/2022 and was not renewed.** CS302 *is* ACE (SAYA-0018) — do not confuse the codes.
- Think C++ / Busbee / cppreference / Gaddis / Stroustrup dumps → name the tool, summarize the school, do not paste chapters. **Do not dump ch.19–22 as this course.**
- Vendor C++ / Microsoft / Oracle item-set coaching → refuse as this course.
- Inventing Eclipse (or any IDE) as a live CLO, or promoting expired ACE pointer/list/tree LOs as current CLOs → refuse the guess; encode the *job*.
- Sitting the Saylor final / starting the certificate exam / webcam ACE → refuse. This harvest does not sit exams. Skip forums.

## 4. Adjacent skills (do not merge)

- **Java introduction to programming I** → CS101
- **Java/C++ introduction to programming II (OOP / STL / search-sort)** → CS102
- **Introduction to Python 3 (CS1 in Python)** → CS105
- **Elementary data structures** → CS201
- **Discrete structures** → CS202
- **Python for data science (pandas / sklearn)** → CS250
- **CS introduction to modern database systems** → CS403
- **Graduate data management / SQL** → BUS611
- **Management information systems** → BUS206
- **Saylor CS107 certificate exam** → **do not encode**

If a prompt needs both "what is a C++ array" and "analyze a tree as an ADT," recap Check D grouping, then **hand off CS201** — do not paste CS201's labs as this skill. If it needs STL `sort` as Programming II, recap Check F templates, then **hand off CS102**.

## 5. What not to encode from this course

- Exam items, quiz banks, discussion-prompt keys, practice-exam items, certificate-final items, or "how to pass the Saylor final."
- Chapter dumps from *Think C++* (CC — **summarize**; **attribution-named 2016, not confirmed live 2025**), Busbee (CC BY — **parallel, not named**), cppreference, Gaddis, Stroustrup PPP, Lafore, or other commercial C++ books.
- Think C++ **ch.19–22** stacks/queues/trees/heap as live CS107 units (that is **CS201**).
- Live **unit intros**, **"focus on" notes**, unit-level LOs, assigned-reader confirmation, **IDE product names**, quiz stems, or exam blueprint — **login gaps; not public this harvest.** SNLS Eclipse / 8 h-per-unit / parking-garage wording is **archive residue**.
- CS101 eight-unit Java checklists copied wholesale, CS102 OOP/C++/STL checklists copied wholesale, CS105 ten-unit Python checklists, CS201 ADT labs, CS202 discrete labs, CS250 pandas checklists, CS403 ERD/SQL labs, BUS611 SQL/plan checklists.
- Vendor C++ item-set coaching.
- CS101's **26 h**, CS102's **51 h**, CS105's **41 h**, CS201's **36 h**, or SNLS **8 h/unit** as this course's identity. Live: **40 h / 4.0 CEU**, LMS **65**.
- JSON-LD "Introduction / Core Concepts / Advanced Topics" placeholder units.
- A fake *current* ACE / SAYA id, or SAYA-0017 as if still live. Live catalog: **no college-credit recommendation**. Expired **SAYA-0017** ended 11/30/2022. SAYA-0018 is **CS302**. SAYA-0016 is **CS402**. SAYA-0002 is **BIO101B**.
- The free 70% certificate as ACE credit or as degree credit.
- Expired ACE LOs (pointers as a named LO; "write linked lists and binary trees" as a named LO; namespaces/preprocessor as a named LO; six-topic ACE outline) as if they were the eight public CLOs.
- Forums. Webcam ACE. How to sit the certificate final.
