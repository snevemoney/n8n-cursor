---
name: ug-applied-cryptography
description: >
  Frame an undergraduate applied-cryptography question using the
  Saylor CS260 school: start from intro crypto, keep hashes distinct
  from symmetric vs asymmetric encryption, keep signatures/certificates
  distinct from key management, then seat ECC, zero-knowledge proofs,
  quantum key distribution, and quantum algorithms. Use when a prompt
  asks how a cryptographic building block is explained or implemented
  as this 50-hour course. Do not use for CS402 networks, CS406
  information security as a course, CS120 Bitcoin, CS202 discrete
  math, ENGL, ACE exam-taking, exam reconstruction, or attack/exploit
  procedures.
---

# Applied cryptography: primitives first, then keys, then quantum seats (clustered)

**Use when:** a task asks how to **place an applied-cryptography question** in the Saylor CS260 school — hash vs encrypt vs sign, symmetric vs asymmetric, certificates, key management, ECC, ZKP, QKD, or quantum algorithms for crypto.

**Do not use when:** CS402 computer communications; CS406 information security as the SKU; CS120 Bitcoin (Watchdog); CS202 discrete; ENGL; sitting ACE; exam reconstruction; writing exploits, attack procedures, or malware.

This is **one** skill. Ten live units, one argument: **most students already have a "HTTPS padlock" story or a networks story; this course's pass is applied crypto — primitives, then authentication architecture, then ECC/ZKP, then quantum seats — even though the catalog title also says network security (guest units do not).**

## 0. Hygiene

- Label **school**. Undergraduate **applied cryptography** (Saylor CS260; catalog title **Introduction to Cryptography and Network Security**). **50 h / 5.0 CEU.** LMS **805** (`/course/cs260`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 13:50**. Description: basic concepts in applied cryptography implemented in real-world programs.
- Ten **live** units (intro through quantum algorithms). **No guest unit titled network security** — do not invent firewalls/IDS as live.
- Eight **live** CLOs. Programs that implement hashes and cryptographic techniques are CLOs 3–4 — encode the *job* (implement/apply), not an attack.
- Next numeric: **CS301**. Skip CS120 (Watchdog). Skip ACE. Stay off ENGL*. ESL waits.
- **Safety:** no exploit PoCs, no attack procedures, no malware. Concepts and legitimate implementation jobs only.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| Sockets, routing, packet networks as a *course* | **CS402** |
| InfoSec policy / org security as a *course* | **CS406** |
| Bitcoin for developers | **CS120 — Watchdog; do not harvest** |
| Discrete proofs / graphs as math | **CS202** |
| How to break / pwn / write malware | **refuse** |
| Take the final / ACE | **refuse** |
| Hash, encrypt, sign, ECC, ZKP, QKD | **this skill** |

### Check B — Intro and hashes (Units 1–2; CLOs 2–3)

Intro to cryptography. **Compose programs that implement and apply hash functions** (CLO 3). Hash ≠ encryption. Solve cryptographic-application problems (CLO 2) without turning them into exam items.

### Check C — Symmetric vs asymmetric (Units 3–4; CLO 1)

**Explain the difference.** Then create programs that implement and apply cryptographic techniques (CLO 4) on the correct side. Do not collapse to "public key is just better."

### Check D — Signatures, certificates, keys (Units 5–6; CLO 5)

Analyze architectures for **signatures, certificates, and authentication**. Key management is Unit 6 — its own seat. Certs are not "the hash unit."

### Check E — ECC and ZKP (Units 7–8; CLO 8)

Elliptic curve cryptography as a named unit after key management. Zero-knowledge proofs: **construct applications that show understanding** (CLO 8) — a demo of the idea, not a break of a system.

### Check F — Quantum seats (Units 9–10; CLOs 6–7)

QKD: **explain security benefits**. Quantum algorithms: **explain algorithms useful for cryptographic applications**. Two seats. Do not invent a live "break RSA with Shor" lab as guest-visible; encode explain-the-algorithm as the CLO.

## 2. Worked patterns (shape only)

**"Hash or encrypt?"**
Check B vs Check C. Hash is Unit 2. Encrypt is 3 or 4.

**"Public key vs secret key"**
Check C CLO 1. If they then need certificates, Check D.

**"How do certificates work?"**
Check D architecture (signatures, certs, authentication) plus key management (Unit 6).

**"Is this ECC or just RSA-asymmetric?"**
Unit 7 vs Unit 4. ECC is named.

**"Prove I know X without revealing X"**
Check E ZKP. Construct an application that *shows understanding* — not an exploit.

**"Quantum — keys or algorithms?"**
QKD benefits (Unit 9) vs quantum algorithms for crypto (Unit 10).

**"CS260 or CS402?"**
Crypto primitives → **this skill**. Networks as a course → **CS402**.

**"CS260 or CS406?"**
Applied crypto map → **this skill**. Information security as the course → **CS406**.

## 3. Refuse / redirect

- Exam reconstruction; sitting the final; ACE as this 70% cert (SAYA-0016 is CS402).
- Exploits, attack procedures, malware, pwn, unauthorized access — refuse. Point at public CLOs (explain, implement hash/encrypt, analyze cert architecture).
- CS402 / CS406 / CS120 / CS202 as if this were those SKUs.
- ENGL*. ESL this sitting.
- Inventing a live network-security unit the syllabus does not list.

## 4. Adjacent

CS250 (previous), CS301 (next), CS302 (ACE SAYA-0018 — skip ACE here), CS401, CS402 (ACE SAYA-0016), CS403, CS406, CS120 Watchdog, CS202, CS103 404, Saylor CS260 exam (do not encode).

## 5. What not to encode

Exam items. Attack how-tos. Fake SAYA. 50 h confused with CS406 46 h or CS402 38 h. A firewalls unit. Forums. Webcam. ENGL. CS120.

## 6. Output shape

1. Name the school (CS260 applied cryptography) and what it is not (**CS402**, **CS406**, **CS120**).
2. Name the **unit seat**.
3. If encrypt: **symmetric vs asymmetric**.
4. If quantum: **QKD benefits vs algorithms**.
5. Do not sit the final. Do not write exploits. Do not invent ACE.

## 7. Guest vs login

Guest has: catalog, LMS 805, ten units, eight CLOs, 50 h, ACE N, applied-crypto description.
Guest does not have: unit-LO letters, named ciphers as required titles, language of the program CLOs, item banks, a network-security unit title.

## 8. Pass encoded

Finishing CS260 means you can **tell hash from encrypt, symmetric from asymmetric, sign/cert/key-management apart, and seat ECC, ZKP, QKD, and quantum algorithms** — including program-shaped CLOs to implement hashes and techniques. It does not mean you finished CS402 or CS406, and it does not license attack writeups.
