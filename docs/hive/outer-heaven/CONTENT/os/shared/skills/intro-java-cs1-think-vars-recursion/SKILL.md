---
name: intro-java-cs1-think-vars-recursion
description: >
  Frame a beginner Java CS1 question using the Saylor CS101 school:
  think like a computer scientist, problem-solve, and write Java as a
  means to an end — computers and software, variables and operators,
  input and output, methods and testing, conditionals and logic,
  loops and strings, arrays and references, recursive methods. Use
  when a prompt asks how to write, trace, or repair a Java program at
  intro CS1 depth. Do not use for CS105 Python CS1, CS102 Java/C++ II,
  CS107 C++, CS201 data structures, CS202 discrete, CS250 pandas,
  CS403 databases, BUS611 SQL, ACE-credit promises, Oracle/AP CS A
  dumps, or exam reconstruction.
---

# Intro Java CS1: think like a CS, write Java as a means (clustered)

**Use when:** a task asks how to **think like a computer scientist and write a beginner Java program** — what a computer/software does, pick a type, apply an operator, get data in and out, factor a method, test/repair syntax and logic, branch on input (logical vs relational), loop over strings, group data in arrays/references, or compare recursion to looping — in the Saylor CS101 **Introduction to Programming I** school.

**Do not use when:** the job is reconstructing or taking a Saylor (or any) exam, dumping *Think Java* / Oracle tutorials / AP CS A item banks, running **CS105** Python CS1, **CS102** Java/C++ continuation (OOP / STL / containers / exceptions / search-sort), **CS107** C++ as a course, **CS201** ADTs in C/C++, **CS202** discrete-math recursion, **CS250** pandas/sklearn, **CS403** CS-database, **BUS611** graduate SQL/data-management, promising ACE/transfer credit from expired **SAYA-0012**, coaching Oracle Java / AP CS A, encoding Think Java **ch.9–17** objects/classes/inheritance as this course, or inventing the retired Computer Science I OOP/files/exceptions eight-unit shell.

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". CS101's eight live units are one argument: **finishing the course means you can think like a computer scientist — detect a problem, express a solution in Java syntax, and use programming as a means to an end — not that you became a Python programmer, a C++ programmer, or a CS102 OOP sequel student.**

## 0. Hygiene

- Label **school**. This is the **undergraduate CS1 / introduction to programming I in Java** survey (Saylor CS101; live title **Introduction to Programming I**). LMS **1146** (`/course/cs101`, Moodle category **9** Computer Science). Catalog Computer Science, **26 h / 2.6 CEU**, **not** graduate-level. **No degree twin** (do not invent MCS101 / CS611). Parallel text: Downey/Mayfield *Think Java* 2e ch.1–8 (**CC BY-NC-SA 4.0**) — used here as a **topic match**, not as a confirmed live reader (syllabus: articles, lectures, and videos; **not confirmed live**). CS105 owns the same CS1 *job* in **Python 3**. CS102 owns OOP / Java-vs-C++ as a *course*. CS107 owns C++ as a *course*. It is not the only Java school (Oracle certs, AP CS A, university CS1-in-Java). Say so if the user is not inside this course.
- Label **claim vs data**. Class Central / NCCRS / ACE / Help Center still say **Introduction to Computer Science I**; live catalog + LMS + syllabus (Oct 2025) say **Introduction to Programming I**. Stale hours: Class Central **52 h**, NCCRS **94.5 h** (Jan 2011–Dec 2023). Live total is **26 hours / 2.6 CEU**. Stale LMS ids (**6**, search-indexed **747**, generic unavailable **28**) are **not** live **1146**. JSON-LD placeholder copy "Unit 1: Introduction; Unit 2: Core Concepts; Unit 3: Advanced Topics" is **junk** — encode the eight live titles. **No current ACE credit.** Expired **SAYA-0012** (title *Introduction to Computer Science I*, 01/01/2021–**01/31/2024**, 3 credits) was **not renewed** — do not treat it as live and do not invent a *new* SAYA id. **SAYA-0018 is CS302**. **SAYA-0016 is CS402**. **SAYA-0017 is CS107**. Completing the free certificate is **not** an ACE recommendation. Re-fetch if the user needs current transfer rules.
- Label **login gaps**. This COURSE-SKILL was closed from **public sources only** (operator lock 2026-09-01). Guest LMS does **not** expand units. **Not public / do not invent:** unit intros, unit-level LOs, "focus on" resource notes, assigned reader confirmation, JDK/IDE names, unit quizzes, study-guide book, practice-exam **items**, certificate-final **blueprint or items**. Sixteen public CLOs + eight live unit titles are the encode depth. Confirm wording on a later login pass; do not fill gaps from Chrome.
- Intro Java CS1 ≠ Python CS1 ≠ C++ ≠ Programming II ≠ data structures ≠ discrete math ≠ pandas ≠ CS database ≠ MBA SQL. **CS105** *teaches* CS1 in Python. **CS102** *continues* in Java+C++ / OOP. This skill *thinks like a computer scientist and writes beginner Java*. **CS107** is C++. **CS201** is ADTs. **CS202** is discrete. **CS250** is pandas. **CS403** is databases as CS. **BUS611** stores and retrieves as an MBA plan.
- Live Saylor intro (Oct 2025): goal is to **think like a computer scientist** (formal languages for computations; design/assemble/evaluate like engineers; hypothesize like scientists; logical constructs a machine can carry out). An important skill is **problem-solving** (detect, think creatively, express clearly). On one level you **write Java programs**; on the other, programming is a **means to an end** — something useful to society. Named language is **Java**. Do not swap Python or C++ in as the CS101 language.
- No exam items. No textbook dumps. CC OER: **summarize. Do not dump.** Certificate identity only: **70%**; live syllabus **14-day** wait, **max 3** attempts. Unit assessments do **not** count toward the certificate. **26 h / 2.6 CEU.** **Do not encode 52 h (Class Central), 94.5 h (NCCRS), 51 h (CS102), 41 h (CS105), 40 h (CS107), 36 h (CS201), 44 h (CS202), 67 h (CS250), 29 h (CS403), or 44 h (BUS611).** ACE: **not current**. Skip forums. Skip webcam ACE. Do not sit the final. Do not start the certificate exam.
- Eight **live** units (Oct 2025 syllabus — use these, not the retired OOP shell): Computer Programming; Variables and Operators; Input and Output; Methods and Testing; Conditionals and Logic; Loops and Strings; Arrays and References; Recursive Methods.
- Sixteen **live** public CLOs (do **not** invent unit-level LOs): computers/what they do; software vs computers; human logic in programming syntax; variable types and differences; operations on variables; recognize/repair syntax and logic errors; data into and out of a computer; Java's basic services; dissect programs for subtle errors; reusable methods; "logical" vs "relational"; vary activity as input changes; repetitive actions; how data should be grouped; acquire values of specific elements; recursive processes vs traditional looping.

## 1. Procedure — answer a beginner Java CS1 question in six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Identity, language, overlay (always)

**The course question:** is the user asking for a **Python CS1** answer, a **C++** answer, a **Java/C++ Programming II / OOP** answer, an **ADT / discrete-math / pandas / CS-database / MBA SQL** answer, or a **beginner Java program** that has to show they can think like a computer scientist?

Live test:

| Prompt smells like | Hand off |
|---|---|
| "Write/trace/repair Python 3: types, ops, flow, collections, files, regex, class" | **CS105** |
| "Java and C++ / OOP building blocks / STL / containers / exceptions / search-sort as Programming II" | **CS102** |
| "C++ compile / templates / linked lists / files as a *course*" | **CS107** |
| "ADTs, stacks/queues/trees, algorithms in C/C++" | **CS201** |
| "Sets, induction, graphs, trees, automata, recursion as *math*" | **CS202** |
| "pandas / sklearn / statsmodels / time series" | **CS250** |
| "ERD, 3NF, relational algebra, SQL as a *CS* course" | **CS403** |
| "Pick a DBMS / write SQL / data-management plan" | **BUS611** |
| "Think like a CS / write-trace-repair Java CS1: types, I/O, methods, branch, loops/strings, arrays, recursion" | **this skill** |

**Primary goal:** problem-solving expressed in Java. That is not "pass Oracle Java," not "pass AP CS A," not "write Python" (**CS105**), and not "OOP + C++ as a course" (**CS102** / **CS107**). Java-the-skill is **not** the point; Java is the **means**.

**Named live failure mode:** treating this as a language-syntax dump, a Python course, a C++ course, or the retired Computer Science I OOP/files/exceptions shell.

**Named live language:** **Java**. Encode Java. Other languages are fine as *equivalents* if the user is not inside Saylor; do not claim Python is the Saylor CS101 CLO.

**Think Java 2e overlay (parallel — not confirmed live; summarize, do not dump):** chapter titles of ch.1–8 **are** the live unit titles. Use them as *topic match* for Units 1–8. **Do not file ch.9–17** (objects, classes, inheritance, 2D arrays, graphics) as CS101 — that depth is **CS102** / late-OOP. Oracle tutorials, AP CS A manuals, Horstmann/Liang are all-rights-reserved — named language and named CLO verbs only.

**Level check:** if the prompt is actually CS105 homework, **hand off CS105** and recap only. If it is CS102 OOP/C++, **hand off CS102**. If it is the Saylor certificate final, **refuse exam reconstruction**; this skill is the *content* overlay, not the exam.

### Check B — Computers, software, syntax (when "what is a computer / what is a program / how do I say this in Java" is in play)

CLOs 1–3. Unit 1 Computer Programming.

1. **What computers are and what they do** (CLO 1).
2. **Software vs computers** (CLO 2) — the machine vs the instructions.
3. **Human logic in programming syntax** (CLO 3) — formal language for computations, not English.

Think Java ch.1 overlay (summarize): what a program is; compile/run as the *job* of getting a first program to exist; formal vs natural language. Do **not** dump Hello World listings as if they were Saylor's assigned lab. JDK/IDE names are a **login gap** — encode the *job* (write, compile, run) and leave product names until login.

**Hand off CS105** for Python's interpreter/Pickcode start. Stay here for Java CS1 "what is a program."

### Check C — Variables, operators, errors (when "which type / which operator / why won't this compile / the math is wrong" is in play)

CLOs 4–6. Unit 2 Variables and Operators.

- **Describe various variable types and their differences** (CLO 4).
- **Choose means of performing operations on variables** (CLO 5).
- **Recognize and repair errors in syntax and logic** (CLO 6). Syntax ≠ logic. A program that compiles can still be wrong.

Think Java ch.2 overlay (summarize): types, assignment, arithmetic, errors. Assignment is not math-equals. Do not invent a live primitive-type list (or `String` vs primitive doctrine) as guest-visible CLO language — encode the *job* (which type, which operation, which class of error).

**Hand off CS105** for Python `int`/`float`/`str`/`bool` and `/` vs `//`. Stay here for Java types/operators/errors.

### Check D — Input, output, Java's basic services (when "how does data get in or out / print / read" is in play)

CLOs 7–8. Unit 3 Input and Output.

- **Ways to get data into and out of a computer** (CLO 7).
- **Demonstrate Java's basic services** (CLO 8).

This unit is **not** the retired "Java I/O and Exception Handling" unit. Do **not** encode `FileReader`, file streams, or exception hierarchy as live CS101 until login confirms they live here. Encode console-class in/out and "Java's basic services" as the public job.

Think Java ch.3 overlay (summarize): getting data in and out; Java services. **Not** CS102's exceptions unit as a *course*.

**Hand off CS105 Unit 3/7** for Python `input` + files. **Hand off CS102** for exceptions as sequel. Stay here for CS1 Java I/O services.

### Check E — Methods and testing (when "reuse this block / the bug is subtle / extract a method" is in play)

CLOs 9–10. Unit 4 Methods and Testing.

- **Dissect computer programs to reveal subtle errors** (CLO 9) — the testing spine next to CLO 6's syntax-vs-logic.
- **Convert blocks of oft-used code into reusable methods** (CLO 10).

Think Java ch.4 overlay (summarize): reusable methods; debugging subtle errors. Do not invent JUnit / a named test framework as live CLO language (login gap). Encode the *job*: find the subtle error, factor the repeated block.

**Hand off CS105** for Python `def`. **Hand off CS102** for OO methods-on-objects as a course. Stay here for CS1 Java methods + testing.

### Check F — Branch, loop/string, array, recurse (when "if / loop / index / recurse vs loop" is in play)

CLOs 11–16. Units 5–8.

**Conditionals and Logic (Unit 5).** CLO 11: **state the difference between "logical" and "relational"** — do not invent a truth-table doctrine until login. CLO 12: **cause programs to vary their activities as the input data changes**. Think Java ch.5 overlay (summarize): branch on input; logical vs relational as a distinction to *state*.

**Loops and Strings (Unit 6).** CLO 13: **create programs that perform repetitive actions**. Strings **share the live title** with loops — encode strings as CS1 data next to repetition, not as a regex course (**CS105** Unit 8) and not as CS202 formal languages. Think Java ch.6 overlay (summarize): repetition; strings as data. String-API depth is a login gap.

**Arrays and References (Unit 7).** CLO 14: **how data should be grouped for a given analysis**. CLO 15: **various ways to acquire the values of specific elements within a data grouping**. This is CS1 grouping and element access, **not** CS201 ADT analysis. Think Java ch.7 overlay (summarize): arrays; references. Do not encode 2D arrays / object arrays from Think Java ch.9+ as live units.

**Recursive Methods (Unit 8).** CLO 16: **compare recursive processes to traditional looping**. Recursion here is the **CS1 close**, not CS102's later recursion/search-sort unit as a *course*, and not CS202's recursion-as-math. Think Java ch.8 overlay (summarize): recursion vs looping.

**Hand off CS102** once the job is OOP, C++, STL, containers, exceptions, or search-sort as Programming II. **Hand off CS201** for trees/stacks as CS. **Hand off CS202** if they want induction/recurrence as discrete math. Stay here for Java `if` / loops / strings / arrays / CS1 recursion.

## 2. Worked patterns (shape only — not exam items)

**"I need a Java program that reads numbers and repeats an action."**
Check A (this skill, not CS105) → Check C (types/ops) → Check D (data in/out) → Check F (loop; maybe branch). Do not reach for Python `input` or pandas.

**"Why won't this compile / it compiles but the answer is wrong?"**
Check C (CLO 6: syntax vs logic) → Check E (CLO 9: subtle errors; maybe the fix is a method). Not a Python Traceback lecture (**CS105**). Not CS102 exceptions-as-a-course.

**"Should this be a method?"**
Check E. CLO 10: oft-used blocks become reusable methods. If they want a class/object/inheritance design, **hand off CS102** — do not encode Think Java ch.9–17 here.

**"If vs loop vs recurse."**
Check F. Relational vs logical (Unit 5) first if they cannot state the difference. Loop vs string-as-data (Unit 6). Recursion vs traditional looping (Unit 8) only when the process is actually recursive. Not CS202 induction.

**"How do I store many values and get the k-th?"**
Check F Units 7: grouping (CLO 14) then element access (CLO 15). If they want a stack/tree/ADT, **hand off CS201**. If they want a DataFrame, **hand off CS250**.

**"Is this CS101 or CS105 or CS102?"**
Think-like-a-CS + Java CS1 through recursion → **this skill**. Python 3 IDE/types/files/regex/OOP → **CS105**. Java+C++ OOP/STL/search-sort as II → **CS102**.

## 3. Refuse / redirect

- Exam reconstruction, practice-item harvesting, certificate-final text, unit-quiz items, study-guide Q&A dumps → refuse. Point at public CLOs, this checklist, Think Java ch.1–8 *summaries*.
- CS105 Python homework → Python CS1 skill. Stay here only for a Java restatement of the CS1 job.
- CS102 / CS107 homework → those skills. Java overlay only at CS1 depth (no STL, no inheritance CLO).
- CS201 data-structures homework → that skill. Arrays/references overlay only as CS1 grouping.
- CS202 discrete homework → that skill. Recursion overlay only as programming vs looping.
- CS250 pandas / CS403 databases / BUS611 SQL → those skills.
- ACE / transfer-credit / "this 70% certificate is college credit" → **not current** for CS101. Free certificate only. **SAYA-0012 expired 01-31-2024 and was not renewed.** CS302 *is* ACE (SAYA-0018) — do not confuse the codes.
- Think Java / Oracle / AP CS A / Horstmann / Liang dumps → name the tool, summarize the school, do not paste chapters. **Do not dump ch.9–17 as this course.**
- Oracle Java / AP CS A / vendor item-set coaching → refuse as this course.
- Inventing a live OOP/files/exceptions/JVM-translation doctrine as if it were a current CS101 CLO → refuse; that is the **retired Computer Science I / NCCRS** shell, not the Oct 2025 syllabus.
- Sitting the Saylor final / starting the certificate exam / webcam ACE → refuse. This harvest does not sit exams. Skip forums.

## 4. Adjacent skills (do not merge)

- **Introduction to Python 3 (CS1 in Python)** → CS105
- **Java/C++ introduction to programming II (OOP / STL / search-sort)** → CS102
- **C++ programming** → CS107
- **Elementary data structures** → CS201
- **Discrete structures** → CS202
- **Python for data science (pandas / sklearn)** → CS250
- **CS introduction to modern database systems** → CS403
- **Graduate data management / SQL** → BUS611
- **Management information systems** → BUS206
- **Saylor CS101 certificate exam** → **do not encode**

If a prompt needs both "what is a Java array" and "design an OOP class hierarchy," recap Check F grouping, then **hand off CS102** — do not paste CS102's sequel checklists or Think Java ch.9–17 as this skill.

## 5. What not to encode from this course

- Exam items, quiz banks, discussion-prompt keys, practice-exam items, certificate-final items, or "how to pass the Saylor final."
- Chapter dumps from *Think Java* 2e (CC BY-NC-SA — **summarize**; **parallel, not confirmed live**), Oracle Java tutorials, AP CS A, Horstmann, Liang, or other commercial intro-Java books.
- Think Java **ch.9–17** objects/classes/inheritance/2D arrays/graphics as live CS101 units (that is **CS102** / late-OOP).
- Live **unit intros**, **"focus on" notes**, unit-level LOs, assigned-reader confirmation, JDK/IDE product names, quiz stems, or exam blueprint — **login gaps; not public this harvest.**
- CS105 ten-unit Python checklists copied wholesale, CS102 OOP/C++/STL checklists copied wholesale, CS107 C++ checklists, CS201 ADT labs, CS202 discrete labs, CS250 pandas checklists, CS403 ERD/SQL labs, BUS611 SQL/plan checklists.
- Oracle Java / AP CS A / vendor Java item-set coaching.
- Class Central **52 h**, NCCRS **94.5 h**, CS102's **51 h**, CS105's **41 h**, CS107's **40 h**, or leftover LMS **6** / **747** / **28** as this course's identity. Live: **26 h / 2.6 CEU**, LMS **1146**.
- The retired eight-unit shell (Introduction; OOP; Java in Practice; Relational/Logical Operators; Control Structures; User-Defined Methods; Arrays; Java I/O and Exception Handling) as if live. Live units are the Oct 2025 eight (Computer Programming through Recursive Methods).
- JSON-LD "Introduction / Core Concepts / Advanced Topics" placeholder units.
- A fake *current* ACE / SAYA id, or SAYA-0012 as if still live. Live catalog: **no college-credit recommendation**. Expired **SAYA-0012** ended 01-31-2024 (old title Introduction to Computer Science I). SAYA-0018 is **CS302**. SAYA-0016 is **CS402**. SAYA-0017 is **CS107**.
- The free 70% certificate as ACE credit or as degree credit.
- JVM translation, inheritance, polymorphism, exception handling, or Java I/O class hierarchy as live CLOs (NCCRS/old course — **not** the sixteen public CLOs).
- Forums. Webcam ACE. How to sit the certificate final.
