---
name: ug-modern-database-systems
description: >
  Frame an undergraduate modern-database-systems question using the
  Saylor CS403 school: start from DBMS structure, people, history, and
  architecture, keep ER distinct from the relational model, keep
  relational algebra distinct from SQL, keep normalization and
  referential integrity as named jobs, then seat SQL intro, SELECT,
  and JOIN even though the CLO list under-names them. Use when a
  prompt asks how to organize large data so parts are easy to modify.
  Do not use for BUS611 MBA data-management, CS250 pandas, CS401 file
  systems, CS120, ENGL, ACE exam-taking, or exam reconstruction.
---

# Modern databases: model first, then algebra, then SQL (clustered)

**Use when:** a task asks how to place a database-systems question in the Saylor CS403 school — DBMS diagram/people/history, architecture, ER, relational model, relational algebra, normalization, referential integrity, or SQL SELECT/JOIN.

**Do not use when:** BUS611 graduate SQL/data-management; CS250 pandas; CS401 file systems; CS120; ENGL; sitting ACE; exam reconstruction; ESL (PD still in flight).

This is **one** skill. Nine live units, one argument: **most students already have a SELECT or spreadsheet story; this course pass is modern DBMS — structure and people, ER then relational then algebra then normalize, then SQL as three later seats, so components stay easy to modify, add, and remove.**

## 0. Hygiene

- Label **school**. Undergraduate **introduction to modern database systems** (Saylor CS403). **29 h / 2.9 CEU.** LMS **863** (`/course/cs403`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 16:55**. Description: organize large volumes of data so components are easy to modify, add, and remove.
- Nine **live** units. Nine **live** CLOs. SQL Units 7–9 still count.
- Last remaining CS after this close: **CS406**. Skip CS120. Stay off ENGL*. ESL waits. Chrome off until **BUS501**.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| MBA pick DBMS / graduate SQL plan | **BUS611** |
| pandas DataFrame / sklearn | **CS250** |
| OS files / VM | **CS401** |
| Take the final / ACE | **refuse** |
| ER, normalize, relational algebra, SELECT/JOIN | **this skill** |

### Check B — What a DBMS is (Units 1–2; CLOs 1–4)

System diagram of structure and functions. People involved. Historical background vs current technology. Demonstrate DBMS functions. Architecture is Unit 2.

### Check C — ER and relational (Units 3–4; CLO 5)

Develop an **entity-relationship model from user requirements**. Relational database model is Unit 4 — distinct. Do not start at SQL.

### Check D — Algebra, normalize, integrity (Units 5–6; CLOs 6–9)

**Relational algebra to construct queries** (CLO 9 / Unit 5) — not SQL yet. **Normalization** (CLO 6). **Convert ER to normalized relations** (CLO 7). **Referential integrity** with an example where it fails (CLO 8).

### Check E — SQL (Units 7–9)

Introduction to SQL; basic SELECT; JOIN. Three seats. Algebra (Check D) is the theory; these units are the language. Do not invent a vendor dialect as live.

### Check F — Modify/add/remove

Course description finish line: organized so components are easy to **modify, add, and remove**. Normalization and integrity serve that, not make-a-table.

## 2. Worked patterns (shape only)

**Who owns this data / which DBMS role?** Check B CLO 2 people.

**Draw the database.** Check B system diagram vs Check C ER. Different jobs.

**Is this normalized?** Check D. Then CLO 7 if they started from ER.

**This orphan row.** Check D CLO 8 referential integrity — failing-example shape, not exam items.

**Write the query.** Theory operators: Unit 5 algebra. SQL: Units 8–9 SELECT then JOIN.

**CS403 or BUS611?** Undergraduate modern DB → this skill. MBA data-management plan → BUS611.

**CS403 or CS250?** Relations/ER/SQL → this skill. DataFrame/numpy → CS250.

## 3. Refuse / redirect

Exam reconstruction; sitting the final; ACE as this 70% cert. BUS611 / CS250 / CS401 as if this were those SKUs. CS120. ENGL*. ESL this sitting. Vendor SQL dumps as live CLO language.

## 4. Adjacent

CS402 (previous), CS406 (next, last CS on the list), BUS611, CS250, CS401, CS302, CS120 Watchdog, CS103 404, Saylor CS403 exam (do not encode).

## 5. What not to encode

Exam items. Fake SAYA. 29 h confused with BUS611. SQL Units dropped because CLOs are short. Forums. Webcam. ENGL. CS120.

## 6. Output shape

1. Name the school (CS403 modern database systems) and what it is not (BUS611, CS250).
2. Name the unit seat.
3. If query: algebra vs SELECT vs JOIN.
4. If model: ER vs relational vs normalized relations.
5. Do not sit the final. Do not invent ACE.

## 7. Guest vs login

Guest has: catalog, LMS 863, nine units, nine CLOs, 29 h, ACE N.
Guest does not have: SQL dialect, NF roster, unit-LO letters, item banks.

## 8. Pass encoded

Finishing CS403 means you can diagram a DBMS, name the people, model ER, go relational, query in algebra, normalize, check referential integrity, then use SQL intro/SELECT/JOIN so data stays easy to modify. It does not mean you finished BUS611 or CS250.
