---
name: intro-python3-ops-control-flow-oop
description: >
  Frame a beginner Python 3 question using the Saylor CS105 school:
  write programs in an IDE (live: Pickcode) with int/float/str/bool,
  operators and precedence, input and control flow, lists/strings/sets/
  tuples/dicts, functions plus math/random/matplotlib, files, regular
  expressions, try/except/finally, and beginner OOP so the code stays
  readable. Use when a prompt asks how to write, trace, or repair a
  Python 3 program at intro depth. Do not use for CS101 Java CS1,
  CS102 Java/C++ II, CS250 pandas/sklearn data science, CS107 C++,
  PRDV401/402 JavaScript, PRDV420 R, BUS611 SQL/data-management,
  ACE-credit promises, vendor Python cert dumps, or exam reconstruction.
---

# Intro Python 3: ops, control flow, collections, OOP (clustered)

**Use when:** a task asks how to **write a beginner Python 3 program** — open the IDE, pick a type, apply an operator, drive `if`/`for`/`while`, choose list vs dict, `def` a function, `import math`/`random`/`matplotlib`/`re`, read a file, catch an error, or put behavior on a class — in the Saylor CS105 **Introduction to Python** school.

**Do not use when:** the job is reconstructing or taking a Saylor (or any) exam, dumping Think Python / Automate / matplotlib galleries, running **CS101** Java CS1, **CS102** Java/C++ continuation, **CS250** Python for Data Science (pandas / scikit-learn), **CS107** C++ as a course, **PRDV401/402** JavaScript minis, **PRDV420** R, **BUS611** graduate data-management / SQL, promising ACE/transfer credit, coaching PCEP/PCAP, or inventing a live numpy/pandas stack.

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". CS105's ten live units are one argument: **finishing the course means you can create Python 3 programs for a variety of applications — IDE, types, ops, flow, collections, functions, files, regex, exceptions, OOP — not that you became a data scientist or a Java programmer.**

## 0. Hygiene

- Label **school**. This is the **undergraduate intro Python 3 programming** survey (Saylor CS105; live title **Introduction to Python**). Catalog Computer Science, **not** graduate-level. **No degree twin** (MBA / MMKT / MMGT / MEI have no CS105). Parallel texts: PSF *Python Tutorial* (PSF license), Downey *Think Python* 2e (**CC BY-NC**), Sweigart *Automate the Boring Stuff* (mixed) — used here as a **topic match**, not as a confirmed live reader (syllabus: articles, lectures, and videos). CS101 owns "think like a computer scientist" in **Java**. CS250 owns pandas/sklearn. It is not the only Python school (CS250, vendor certs, university CS1-in-Python). Say so if the user is not inside this course.
- Label **claim vs data**. Leftover `info.php?id=439` still says **(2020.A.01)**; SNLS syllabus **27139** says **36 hours** and **7-day unlimited** retries; live pretty URL `/course/cs105` is LMS **1282**, course map **2025.A.01**, **41 hours / 4.1 CEU**, **14-day / max 3**. Syllabus Unit 4 title is **Data**; course map expands it to **Data Structures I – Lists and Strings**. Named live IDE is **Pickcode** — do not silently swap in Jupyter/VS Code as live CLO language. Named live libraries are **math, random, matplotlib, re** — do not silently add numpy/pandas. **No current ACE credit.** Expired **SAYA-0033** (05/01/2022–04/30/2025, 3 LD) was **not renewed** — do not treat it as live and do not invent a *new* SAYA id. **SAYA-0018 is CS302**. **SAYA-0016 is CS402**. Re-fetch if the user needs current transfer rules.
- Intro Python 3 ≠ Java CS1 ≠ C++ ≠ data science ≠ JavaScript ≠ R ≠ MBA SQL. **CS101** *teaches* CS1 in Java. **CS250** *applies* Python to pandas/sklearn. This skill *writes beginner Python 3 programs*. **CS107** is C++. **PRDV401/402** are JS minis. **PRDV420** is R. **BUS611** stores and retrieves as an MBA plan.
- Live Saylor intro (Oct 2025): Python 3 is a **high-level interpreted** language with **easy-to-read/write syntax** and **powerful libraries**; used in engineering, data science, AI/ML as *motivation*, not as the syllabus; intended for **no or very little prior experience**; finish able to **create Python programs for a variety of applications**.
- No exam items. No textbook dumps. CC/PSF OER: **summarize. Do not dump.** Certificate identity only: **70%**; live syllabus **14-day** wait, **max 3** attempts. **41 h / 4.1 CEU.** **Do not encode 36 h (SNLS) or 67 h (CS250) or 26 h (CS101).** ACE: **not current**. Completing the free certificate is **not** an ACE recommendation. Do not promise transfer credit. Skip forums. Skip webcam ACE. Do not sit the final.
- Ten **live** units (Oct 2025): Introduction to Python 3; Operators; Input and Flow Control Statements; Data (map: lists/strings); Functions; Basic Data Structures II – Tuples, Sets, and Dictionaries; File Handling; Regular Expressions; Exception Handling; Object-Oriented Programming (OOP).
- Eleven **live** CLOs: IDE; `int`/`float`/`str`/`bool`; operators/precedence; control + collections; import libraries (random, viz); interactive input; functions/methods; basic data viz; regex; `try`/`except`/`finally`; OOP for readable/maintainable code.

## 1. Procedure — answer a beginner Python 3 question in six checks

Run in order. Skip a check only if the user already constrained the frame.

### Check A — Identity, language, overlay (always)

**The course question:** is the user asking for a **Java CS1** answer, a **C++** answer, a **pandas/sklearn data-science** answer, a **JavaScript/R mini**, an **MBA SQL/data-management plan**, or a **beginner Python 3 program** that has to run in an IDE?

Live test:

| Prompt smells like | Hand off |
|---|---|
| "Think like a CS / Java / arrays / recursion as CS1" | **CS101** |
| "Java and C++ / STL / sorting as Programming II" | **CS102** |
| "pandas / sklearn / statsmodels / time series" | **CS250** |
| "C++ compile / templates / linked lists as a course" | **CS107** |
| "JavaScript I/II / DOM / forms" | **PRDV401 / PRDV402** |
| "R scripts / tidy data as a mini" | **PRDV420** |
| "Pick a DBMS / write SQL / data-management plan" | **BUS611** |
| "Write/trace/repair a Python 3 program: types, ops, flow, collections, files, regex, class" | **this skill** |

**Primary goal:** create Python 3 programs. That is not "pass PCEP," not "fit a sklearn model" (**CS250**), and not "think in Java" (**CS101**).

**Named live tool:** **Pickcode** IDE (Course Map 1a/1.2). Encode Pickcode as the live environment. Other IDEs are fine as *equivalents* if the user is not inside Saylor; do not claim Jupyter is the Saylor CLO.

**Named live libraries** (encode these; do not silently expand): **math**, **random**, **matplotlib**, **re**. `matplotlib` is **plot a list / plot a file**, not pandas.

**Level check:** if the prompt is actually CS250 homework, **hand off CS250** and recap only. If it is CS101 Java, **hand off CS101**. If it is the Saylor certificate final, **refuse exam reconstruction**; this skill is the *content* overlay, not the exam.

### Check B — IDE, types, operators (when "how do I start / which type / why is 1/2 == 0" is in play)

CLOs 1–3. Units 1–2.

1. **Where does the program live?** Pickcode (or the user's IDE if they are not in Saylor). `print()` is the first output CLO (1d).
2. **Which of the four types?** `int`, `float`, `str`, and (Unit 2) `bool`. Scientific notation for floats is on the course map. Compare types (1f).
3. **Which operators and what precedence?** Arithmetic `+ - * / ** % //`; PEMDAS; relational and logical; `bool`. LO 2d: pick the expression that is correct *and* readable.

PSF overlay (summarize): numbers and strings; `/` vs `//`; assignment is not math-equals.

**Hand off CS101** for Java types/operators. Stay here for Python 3.

### Check C — Input and control flow (when "ask the user / if / loop" is in play)

CLOs 4 and 6. Unit 3.

- Programmer-initialized vs **user input** (`input`; string vs numerical conversion).
- `if` / `else` / `elif`.
- `while` and `for` with `range`.
- `break`, `continue`, `pass`.
- Choose the structure that is more efficient, readable, or appropriate (3f).

**Hand off CS101 Units 5–6** for Java conditionals/loops. Stay here for Python 3 `input` + flow.

### Check D — Collections and basic viz (when "list / string / dict / plot these numbers" is in play)

CLO 4 remainder + CLO 8. Units 4 and 6 (and Unit 7 when the data is in a file).

**Data Structures I (Unit 4, syllabus title "Data"):** lists, indexing, slicing, list methods, list comprehension; strings revisited; **`matplotlib` to plot list data**.

**Data Structures II (Unit 6):** tuples vs lists; sets and set operations; `dict`; strengths and weaknesses of the four.

Encode the *job*: which collection, which method, whether a plot of a list answers CLO 8. Do **not** reach for pandas.

**Hand off CS250** for DataFrames / statistical plots as data science. **Hand off CS201** for trees/stacks as CS. Stay here for Python's four builtin collections + matplotlib-on-lists.

### Check E — Functions, imports, files, regex, exceptions (when "def / import / open / match / crash" is in play)

CLOs 5, 7, 9, 10. Units 5, 7, 8, 9.

- **Functions (Unit 5):** when a function improves the program; `def`; params / return / scope; **`math`**; **`random`**; a simple game as the map's application — encode the *job*, do not reconstruct the game.
- **Files (Unit 7):** read / write / append / create; visualize **from a file**.
- **Regex (Unit 8):** `re`; translate a search term into a pattern; run it over file data; readability vs cleverness.
- **Exceptions (Unit 9):** `try` / `except` / `finally` (map also names `else`); file errors as the application.

**Hand off CS250** to process the file in pandas. **Hand off Automate dumps** for cookbook scripts. Stay here for beginner `def` / files / `re` / `try`.

### Check F — OOP last (when "class / object / inheritance / magic method" is in play)

CLO 11. Unit 10.

Procedural vs structured vs OOP. Classes, objects, instances. Methods. Magic methods. **Inheritance**. The CLO is **readable and maintainable**, plus map 10e (robust / maintainable / scalable) as a *judgment*, not a design-patterns course.

**Hand off CS102** for OO as Java/C++ II. **Hand off CS107** for C++ classes. Stay here for beginner Python classes *after* files/regex/exceptions.

## 2. Worked patterns (shape only — not exam items)

**"I need a Python program that asks for numbers and plots them."**
Check A (this skill, not CS250) → Check B (types) → Check C (`input` + loop) → Check D (`list` + matplotlib) → Check E only if they must read a file (Unit 7). Do not reach for pandas.

**"Why is my if-statement not running / 3 / 2 is 1?"**
Check B (types, `/` vs `//`, precedence, `bool`) → Check C (elif chain; compare the actual types). Not a Java `==` lecture (**CS101**).

**"Should this be a list or a dictionary?"**
Check D. Unit 6 LO 6e: strengths and weaknesses of lists, tuples, sets, dicts. If they want a tree, **hand off CS201**.

**"Match these lines in a file."**
Check E: files (Unit 7) then `re` (Unit 8), wrap with `try`/`except` (Unit 9). Not Automate chapter dumps.

**"Make a class for …"**
Check F after the data actually needs a class. If they only need a dict, stay in Check D. If they want Java/C++ OO as a course, **hand off CS102/CS107**.

**"Is this CS105 or CS250?"**
matplotlib-on-a-list / `random` / `re` / beginner class → **this skill**. pandas / sklearn / statsmodels → **CS250**.

## 3. Refuse / redirect

- Exam reconstruction, practice-item harvesting, certificate-final text → refuse. Point at public CLOs, this checklist, PSF/Think Python/Automate *summaries*.
- CS101 Java homework → Java CS1 skill. Stay here only for a Python restatement.
- CS102 / CS107 homework → those skills. Python OOP overlay only at beginner depth.
- CS250 data-science homework → that skill. Stay here only if they need the *language* overlay (types, `def`, files) that CS250 assumes.
- PRDV401/402 JavaScript / PRDV420 R → those skills.
- BUS611 SQL / data-management plan → that skill.
- ACE / transfer-credit / "this 70% certificate is college credit" → **not current** for CS105. Free certificate only. **SAYA-0033 expired 04-30-2025 and was not renewed.** CS302 *is* ACE (SAYA-0018) — do not confuse the codes.
- Think Python / Automate / matplotlib gallery dumps → name the tool, summarize the school, do not paste chapters.
- PCEP / PCAP / vendor Python item-set coaching → refuse as this course.
- Inventing a live numpy/pandas/jupyter doctrine as if guest-visible → refuse the guess; encode the *job* with math/random/matplotlib/re.
- Sitting the Saylor final / starting the certificate exam / webcam ACE → refuse. This harvest does not sit exams.

## 4. Adjacent skills (do not merge)

- **Java introduction to programming I** → CS101
- **Java/C++ introduction to programming II** → CS102
- **C++ programming** → CS107
- **Python for data science (pandas / sklearn)** → CS250
- **Introduction to JavaScript I / II** → PRDV401 / PRDV402
- **Introduction to R** → PRDV420
- **Graduate data management / SQL** → BUS611
- **Elementary data structures** → CS201
- **CS introduction to modern database systems** → CS403
- **Saylor CS105 certificate exam** → **do not encode**

If a prompt needs both "what is a list" and "fit a sklearn model," recap Check D, then **hand off CS250** — do not paste CS250's data-science checklists as this skill.

## 5. What not to encode from this course

- Exam items, quiz banks, discussion-prompt keys, or "how to pass the Saylor final."
- Chapter dumps from the PSF Tutorial, *Think Python* (CC BY-NC — summarize), *Automate* (not confirmed live), or commercial intro-Python books.
- Live "focus on" notes not yet harvested as a reading list.
- CS101 eight-unit Java checklists copied wholesale, CS250 pandas/sklearn checklists copied wholesale, CS107 C++ checklists, BUS611 SQL checklists.
- PCEP / PCAP / vendor Python item-set coaching.
- SNLS **36 h**, CS250's **67 h**, CS101's **26 h**, or leftover LMS **439** as this course's identity.
- A fake *current* ACE / SAYA id, or SAYA-0033 as if still live. Live catalog: **no college-credit recommendation**. Expired **SAYA-0033** ended 04-30-2025. SAYA-0018 is **CS302**. SAYA-0016 is **CS402**.
- The free 70% certificate as ACE credit or as a degree credit.
- Numpy/pandas/jupyter as live CLO language.
- CS101 Java CLOs or CS250 data-science CLOs as this course.
- Forums. Webcam ACE. How to sit the certificate final.
