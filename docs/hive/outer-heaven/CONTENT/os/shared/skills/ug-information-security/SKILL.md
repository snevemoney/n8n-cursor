---
name: ug-information-security
description: >
  Frame an undergraduate information-security question using the
  Saylor CS406 school: start from CIA principles, identify threats and
  attack modes without writing exploits, keep cryptographic models as
  how they are used for security (not CS260 implementation), then seat
  access-control types, identification/authentication, network security
  methods, OS hardening, IDS vs IPS, and privacy laws. Use when a
  prompt asks how to protect confidentiality, integrity, and
  availability as this 46-hour course. Do not use for CS260 applied
  crypto, CS402 networks as a course, CS401 OS security as an OS unit,
  CS120, ENGL, ACE exam-taking, exam reconstruction, or attack
  procedures.
---

# Information security: CIA first, then control seats (clustered)

**Use when:** a task asks how to place an information-security question in the Saylor CS406 school — CIA principles, threat modes, crypto models as used for security, DAC/MAC/role/rule, passwords/PINs/biometrics/tokens, firewalls/tunneling, OS hardening, IDS vs IPS, or privacy laws.

**Do not use when:** CS260 applied crypto implementation; CS402 communications as the SKU; CS401 OS as the SKU; CS120; ENGL; sitting ACE; exam reconstruction; writing exploits, attack procedures, or malware; ESL (PD still in flight).

This is **one** skill. Nine live units, one argument: **most students already have a padlock story or a crypto-primitive story; this course pass is information security as a discipline — CIA, identify threat modes, then named control seats, then privacy law — not how to break a system.**

## 0. Hygiene

- Label **school**. Undergraduate **information security** (Saylor CS406). **46 h / 4.6 CEU.** LMS **453** (`/course/cs406`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 14:04**. Description: protect confidentiality, integrity, and availability; threat modes; mitigation; cryptography.
- Nine **live** units. Nine **live** CLOs.
- **Safety:** identify modes of attack (CLO 2) is classification, not a how-to. No exploit PoCs, no malware writeups, no unauthorized-access procedures.
- CS family remaining after this close: **0** on the numeric list (skip 101/102/105/107/120; CS103 404). Skip CS120. Stay off ENGL*. ESL waits. Chrome off until **BUS501**.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| Hash, ECC, ZKP, QKD as *applied crypto* | **CS260** |
| TCP/IP, subnet, WAN as a *networks course* | **CS402** |
| Processes, VM, OS files as an *OS course* | **CS401** |
| How to break / pwn / write malware | **refuse** |
| Take the final / ACE | **refuse** |
| CIA, access control, IDS/IPS, privacy law | **this skill** |

### Check B — Principles and threats (Units 1–2; CLOs 1–2)

Fundamental principles of information security (CIA). **Identify** major threats and their **modes of attack**. Name and classify. Do not provide attack steps.

### Check C — Crypto models (Unit 3; CLO 3)

**Describe cryptographic models and how they are used to provide security.** If they need to implement hash/encrypt/sign, recap then **CS260**.

### Check D — Access and identity (Units 4–5; CLOs 4–5)

Access control: **discretionary, mandatory, role, and rule-based**. Identification/authentication: **passwords, PINs, biometrics, and tokens**. Illustrate methods — not crack them.

### Check E — Network and OS security (Units 6–7; CLOs 6–7)

Network security methods: designs, firewalls, wireless encryption, tunneling, protection tools. OS hardening, malware *protection*, firewalls, security tools. If the homework is CS402 or CS401 as those courses, recap then hand off.

### Check F — Detect and law (Units 8–9; CLOs 8–9)

IDS vs IPS: explain each, advantages and disadvantages. Privacy laws, penalties, implications of violations on organizations. Synthesize current law as the CLO — do not invent a statute roster as live.

## 2. Worked patterns (shape only)

**What are we protecting?** Check B CIA.

**What kind of threat is this?** Check B identify mode — classify, do not weaponize.

**Which crypto?** Check C models-as-used. Implementation → CS260.

**Who may open this file?** Check D DAC/MAC/role/rule then auth methods.

**Firewall or IDS?** Check E network methods vs Check F IDS/IPS.

**CS406 or CS260?** Info-sec discipline / CIA / IDS / privacy → this skill. Primitives / ECC / ZKP → CS260.

**CS406 or CS402?** Network *security methods* → this skill. Layers/IP/subnet as the networks course → CS402.

## 3. Refuse / redirect

Exam reconstruction; sitting the final; ACE as this 70% cert. Exploits, attack procedures, malware, unauthorized access. CS260 / CS402 / CS401 as if this were those SKUs. CS120. ENGL*. ESL this sitting.

## 4. Adjacent

CS403 (previous), CS402, CS401, CS260, CS302 (ACE SAYA-0018), CS120 Watchdog, CS103 404, Saylor CS406 exam (do not encode). CS numeric list complete after this close.

## 5. What not to encode

Exam items. Attack how-tos. Fake SAYA. 46 h confused with CS260 50 h or CS402 38 h. Unit 3 as CS260 labs. Forums. Webcam. ENGL. CS120.

## 6. Output shape

1. Name the school (CS406 information security) and what it is not (CS260, CS402, CS401).
2. Name the unit seat.
3. If threats: identify the *mode*, do not write the attack.
4. If access: name DAC/MAC/role/rule.
5. If detect: IDS vs IPS. Do not sit the final. Do not invent ACE.

## 7. Guest vs login

Guest has: catalog, LMS 453, nine units, nine CLOs, 46 h, ACE N, CIA in the description.
Guest does not have: named statute roster, unit-LO letters, item banks.

## 8. Pass encoded

Finishing CS406 means you can explain CIA, identify threat modes, describe crypto models as used for security, pick an access-control and auth method, describe network and OS security methods, tell IDS from IPS, and synthesize privacy-law implications. It does not mean you finished CS260 or CS402, and it does not license attack writeups.
