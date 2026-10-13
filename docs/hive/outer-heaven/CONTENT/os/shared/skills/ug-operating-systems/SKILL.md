---
name: ug-operating-systems
description: >
  Frame an undergraduate operating-systems question using the Saylor
  CS401 school: start from OS functions/structures/evolution and
  design trade-offs, keep processes distinct from threads, keep
  synchronization distinct from CPU scheduling and from deadlock,
  then seat memory management, file systems, OS security, and OS
  networking. UNIX-based with Windows as an alternative. Use when a
  prompt asks how an OS coordinates resources or which OS design fits
  a situation. Do not use for CS301 computer architecture as a course,
  CS402 networks as a course, CS406 info-sec as a course, CS201 ADTs,
  CS120, ENGL, ACE exam-taking, or exam reconstruction.
merged_from: [ug-applied-cryptography, ug-computer-architecture, ug-computer-networks, ug-discrete-structures, ug-information-security, ug-modern-database-systems, ug-software-engineering]
---

# Operating systems: abstractions first, then coordinate, then store (clustered)

**Use when:** a task asks how to **place an OS question** in the Saylor CS401 school — what an OS is, which design fits, process vs thread, sync vs schedule vs deadlock, virtual memory, files, OS security, or OS networking.

**Do not use when:** CS301 architecture-as-course; CS402 communications-as-course; CS406 info-sec-as-course; CS201 ADTs; CS120; ENGL; sitting ACE; exam reconstruction; ESL (PD still in flight).

This is **one** skill. Nine live units, one argument: **most students already have a hardware story or a networks story; this course's pass is the OS — UNIX-based focus, evolution and trade-offs, then named coordination seats, then memory/files, then security and networking as OS units not other courses.**

## 0. Hygiene

- Label **school**. Undergraduate **operating systems** (Saylor CS401). **120 h / 12 CEU.** LMS **94** (`/course/cs401`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 13:58**. Primary: articles, lectures, videos. Intro: **UNIX-based**, also **Windows** as alternative.
- Nine **live** units. Four **live** CLOs (functions/evolution; design trade-offs; debug/modify OS code; explain DS/algorithms/architecture/programming *in OS context*). Units 2–9 still count.
- Next numeric: **CS402** (ACE SAYA-0016 — harvest only when we get there). Skip CS120. Stay off ENGL*. ESL waits. Chrome off until **BUS501**.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| Processor, cache, RAID, floating-point as *architecture* | **CS301** |
| Sockets, routing, packet networks as a *course* | **CS402** |
| InfoSec as a *course* | **CS406** |
| C++ ADTs | **CS201** |
| Take the final / ACE | **refuse** |
| Processes, threads, scheduler, deadlock, VM, files | **this skill** |

### Check B — What an OS is (Unit 1; CLOs 1–2)

Functions, structures, evolution. Evaluate design choices and trade-offs; pick which OS type fits a situation. UNIX-based default; Windows is the named alternative.

### Check C — Processes, threads, sync (Units 2–3)

Process ≠ thread. Synchronization is Unit 3 — after both exist. CLO 4 may overlay data structures here *in OS context*.

### Check D — Schedule and deadlock (Units 4–5)

CPU scheduling ≠ deadlock. Two seats. Do not treat deadlock as a scheduling footnote.

### Check E — Memory and files (Units 6–7)

Memory management (OS) ≠ CS301 memory hierarchy. File system is Unit 7. If they asked cache lines, recap then **CS301**.

### Check F — Security and networking as OS units (Units 8–9)

OS security (Unit 8) ≠ CS406 as a course. OS networking (Unit 9) ≠ CS402 as a course. Recap then hand off if the homework is those SKUs.

**Code (CLO 3):** evaluate, debug, modify OS code to desired functionality. Guest did not name the tree — encode the *job*.

## 2. Worked patterns (shape only)

**"Process or thread?"**
Check C Unit 2. Sync (Unit 3) only if they share state.

**"Why is it stuck / why unfair?"**
Check D: scheduler vs deadlock. Different units.

**"Where does this address live?"**
Check E OS memory. If cache/RAID, **CS301**.

**"Which OS should we pick?"**
Check B CLO 2 trade-offs. UNIX-based vs Windows as named alternatives.

**"Secure this / connect this"**
Check F: OS unit first. If the course homework is CS406 or CS402, hand off.

**"CS401 or CS301?"**
OS abstractions → **this skill**. Inside-out hardware → **CS301**.

## 3. Refuse / redirect

- Exam reconstruction; sitting the final; ACE as this 70% cert.
- CS301 / CS402 / CS406 / CS201 as if this were those SKUs.
- CS120. ENGL*. ESL this sitting.
- Inventing xv6/Linux as confirmed live code.

## 4. Adjacent

CS302 (previous), CS402 (next), CS403, CS406, CS301, CS201, CS260, CS120 Watchdog, CS103 404, Saylor CS401 exam (do not encode).

## 5. What not to encode

Exam items. Fake SAYA. 120 h confused with CS301 48 h. Unit 9 as CS402. Unit 8 as CS406. Forums. Webcam. ENGL. CS120.

## 6. Output shape

1. Name the school (CS401 operating systems) and what it is not (**CS301**, **CS402**).
2. Name the **unit seat**.
3. If stuck: **schedule vs deadlock**.
4. If memory: OS VM vs CS301 hierarchy.
5. Do not sit the final. Do not invent ACE. Do not invent the code tree.

## 7. Guest vs login

Guest has: catalog, LMS 94, nine units, four CLOs, 120 h, ACE N, UNIX-based + Windows, 70% / 14-day / max 3.
Guest does not have: named kernel tree, unit-LO letters, item banks.

## 8. Pass encoded

Finishing CS401 means you can **explain an OS, pick a design for a situation, and walk processes/threads, sync, scheduling, deadlock, memory, files, then security and networking as OS units** — including a code-shaped CLO whose tree is login. It does not mean you finished CS301 or CS402.

---

## Merged from `ug-applied-cryptography` (2026-10-11)

- Original description: Frame an undergraduate applied-cryptography question using the Saylor CS260 school: start from intro crypto, keep hashes distinct from symmetric vs asymmetric encryption, keep signatures/certificates distinct from key management, then seat ECC, zero-knowledge proofs, quantum key distribution, and quantum algorithms. Use when a prompt asks how a cryptographic building block is explained or implemented as this 50-hour course. Do not use for CS402 networks, CS406 information security as a course, CS120 Bitcoin, CS202 discrete math, ENGL, ACE exam-taking, exam reconstruction, or attack/exploit procedures.
- Unique content carried: one section per course code

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


---

## Merged from `ug-computer-architecture` (2026-10-11)

- Original description: Frame an undergraduate computer-architecture question using the Saylor CS301 school: start from computing history/trends and how software directs hardware, keep sequential logic design and floating-point as named jobs, then seat processor design, memory hierarchy, storage/I/O including RAID, parallel processing, and emerging-architecture performance challenges. Use when a prompt asks how a machine is organized from the inside out or why a hardware/software choice changes performance. Do not use for CS401 operating systems, CS201 C++ ADTs, CS107 C++, CS402 networks, CS120, ENGL, ACE exam-taking, or exam reconstruction.
- Unique content carried: one section per course code

# Computer architecture: inside out, then performance seats (clustered)

**Use when:** a task asks how to **place a computer-architecture question** in the Saylor CS301 school — how software directs hardware, sequential logic, floating-point bits, processor, memory hierarchy, RAID/storage/I/O, parallel, or emerging performance.

**Do not use when:** CS401 OS; CS201 data structures; CS107 C++ language; CS402 networks; CS120; ENGL; sitting ACE; exam reconstruction; ESL (PD still in flight).

This is **one** skill. Nine live units, one argument: **most students already have a programming story or an OS story; this course's pass is the machine from the inside out — history, hardware language, logic, arithmetic, processor, memory, I/O, parallel, emerging — with performance asked at several seats, not once.**

## 0. Hygiene

- Label **school**. Undergraduate **computer architecture** (Saylor CS301). **48 h / 4.8 CEU.** LMS **1316** (`/course/cs301`). ACE **N**. Cert **70% / 14-day / max 3**. Syllabus **2025-10-03 13:52**. Primary: articles, lectures, videos. Description: processors, memory, storage, I/O, parallel systems, emerging trends.
- Nine **live** units. Ten **live** CLOs.
- Next numeric: **CS302** (ACE SAYA-0018 exists there — skip ACE *here*). Skip CS120. Stay off ENGL*. ESL waits.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| Processes, scheduling, OS abstractions | **CS401** |
| C++ ADTs / stacks / trees as structures | **CS201** |
| C++ as a language course | **CS107** |
| Sockets / routing | **CS402** |
| Take the final / ACE | **refuse** |
| Processor, cache, RAID, ISA, floating-point bits | **this skill** |

### Check B — History and hardware language (Units 1–2; CLOs 1–2)

Progression of modern computing: historical advances to current industry trends. Then **how software directs hardware** to accomplish desired functions (CLO 2 / Unit 2 Hardware Language). Not CS105 Python.

### Check C — Logic and arithmetic (Units 3–4; CLOs 3–4)

**List the steps** of sequential logic design. **Illustrate** floating-point representation of a decimal number. Two named jobs. Do not start at the processor.

### Check D — Processor and performance of choices (Unit 5; CLOs 5–6)

Designing a processor. Analyze how **hardware and software design choices** influence system performance. Explain techniques to **improve program performance on hardware**. Performance here is *choice* and *program-on-hardware*, not yet the memory-hierarchy CLO.

### Check E — Memory, storage, I/O (Units 6–7; CLOs 7–8)

Memory hierarchy's **impact on system performance** (CLO 7) — a distinct performance seat. Storage and I/O devices, including **RAID**, in function, performance measurement, and technology (CLO 8).

### Check F — Parallel and emerging (Units 8–9; CLOs 9–10)

Reasons and consequences of **parallel processing**. Then review + emerging perspectives: **performance challenges in emerging computer architectures**.

## 2. Worked patterns (shape only)

**"Why is my program slow?"**
Check D (program on hardware) vs Check E (memory hierarchy) vs Check F (parallel/emerging). Name the seat. Not CS401 scheduling unless they framed OS — then recap and **CS401**.

**"How is 0.1 stored?"**
Check C CLO 4 floating-point illustrate-job.

**"What are the steps of this logic?"**
Check C CLO 3 sequential logic design.

**"Cache vs disk vs RAID"**
Check E: hierarchy vs storage/I/O/RAID. RAID is named in CLO 8.

**"Should we go parallel?"**
Check F CLO 9 reasons and consequences, then CLO 10 if the architecture is emerging.

**"CS301 or CS401?"**
Inside-out machine → **this skill**. OS abstractions → **CS401**.

## 3. Refuse / redirect

- Exam reconstruction; sitting the final; ACE as this 70% cert (SAYA-0018 is CS302).
- CS401 / CS201 / CS107 / CS402 as if this were those SKUs.
- CS120. ENGL*. ESL this sitting.
- HDL dumps as if guest-named.

## 4. Adjacent

CS260 (previous), CS302 (next, ACE SAYA-0018), CS401, CS402 (ACE SAYA-0016), CS403, CS406, CS201, CS107, CS120 Watchdog, CS103 404, Saylor CS301 exam (do not encode).

## 5. What not to encode

Exam items. Fake SAYA. 48 h confused with CS401 120 h. RAID as CS406. Forums. Webcam. ENGL. CS120.

## 6. Output shape

1. Name the school (CS301 computer architecture) and what it is not (**CS401**, **CS201**).
2. Name the **unit seat**.
3. If performance: say **which** CLO (design choice, program-on-hardware, memory, emerging).
4. If storage: include **RAID** when that is the device class.
5. Do not sit the final. Do not invent ACE.

## 7. Guest vs login

Guest has: catalog, LMS 1316, nine units, ten CLOs, 48 h, ACE N, RAID named.
Guest does not have: ISA name, unit-LO letters, item banks.

## 8. Pass encoded

Finishing CS301 means you can **walk a machine from the inside out**: how software directs hardware, sequential logic steps, floating-point bits, processor design, memory hierarchy, storage/I/O including RAID, parallel reasons/consequences, and emerging performance challenges. It does not mean you finished CS401.


---

## Merged from `ug-computer-networks` (2026-10-11)

- Original description: Frame an undergraduate computer-networks question using the Saylor CS402 school: start from network architecture and how devices communicate, keep TCP/IP layers compared with OSI counterparts, keep TCP distinct from UDP, keep IP configuration distinct from subnetting/supernetting, then seat application protocols, link-layer access, WANs, and Unit 7 multimedia/security/cloud over the Internet. Use when a prompt asks how a packet is layered, addressed, or switched as this 38-hour course. Do not use for CS401 OS networking as the whole SKU, CS260 applied crypto, CS406 info-sec as a course, CS120, ENGL, sitting ACE SAYA-0016, exam reconstruction, or attack procedures.
- Unique content carried: one section per course code

# Computer networks: layers first, then address, then WAN (clustered)

**Use when:** a task asks how to **place a computer-networks question** in the Saylor CS402 school — architecture, TCP/IP vs OSI, TCP vs UDP, IP config, subnet/supernet, application protocols, link-layer access, WANs, or internet multimedia/security/cloud.

**Do not use when:** CS401 OS as the course; CS260 crypto; CS406 info-sec as the course; CS120; ENGL; sitting ACE SAYA-0016; exam reconstruction; exploits/attack procedures; ESL (PD still in flight).

This is **one** skill. Seven live units, one argument: **most students already have a padlock story or an OS-sockets story; this course's pass is communications — fundamentals and protocols, then layers top-down (app, transport TCP/UDP, network, link), then multimedia/security/cloud over the Internet, with ACE as a separate exam you do not sit.**

## 0. Hygiene

- Label **school**. Undergraduate **computer communications and networks** (Saylor CS402). **38 h / 3.8 CEU.** LMS **790** (`/course/cs402`). ACE **SAYA-0016** 3 LD ends 01-31-2027 — **harvest only, do not sit, skip webcam.** Cert **70%** on *either* certificate final (**7-day**) *or* ACE final (**14-day / max 3 / $5**). Syllabus **2025-10-03 14:00**. Description: LAN communications, switching, routing, protocols, security.
- Seven **live** units. Seven **live** CLOs. Transport TCP/UDP and Unit 7 still count.
- Next numeric: **CS403**. Skip CS120. Stay off ENGL*. ESL waits. Chrome off until **BUS501**.
- **Safety:** no exploit PoCs, no attack procedures. IP/subnet as configuration *jobs*.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| Processes, VM, OS files | **CS401** |
| Hash, ECC, ZKP | **CS260** |
| InfoSec as a *course* | **CS406** |
| Take ACE / webcam / cert final | **refuse** |
| Attack / pwn / malware | **refuse** |
| Layers, IP, subnet, TCP/UDP, WAN | **this skill** |

### Check B — Fundamentals and protocols (Units 1–2; CLOs 1–2)

Network architecture; how devices communicate. Compare protocols in each **TCP/IP** layer with the **OSI counterpart**. Layers are the frame.

### Check C — Application and transport (Units 3–4; CLO 6)

Compare application-layer protocols (CLO 6 / Unit 3). Transport is **TCP and UDP** (Unit 4) — two protocols, one unit. Intro names Web, email, VoIP, video as *why* networks exist, not as Unit 7 yet.

### Check D — Network layer addressing (Unit 5; CLOs 3–4)

**Configure IP addresses** and use them in complex networks (CLO 3). **Illustrate subnetting and supernetting** to divide a large network into smaller logical subnetworks (CLO 4). Two jobs. Not CS260 keys.

### Check E — Link layer and WAN (Unit 6; CLOs 5, 7)

Compare link-layer **access mechanisms, protocols, and technologies**. Apply network techniques to **create WANs** (CLO 7). LAN in the description; WAN is a CLO.

### Check F — Multimedia, security, cloud (Unit 7)

Live unit over the Internet. Security here is this overlay, not CS406 as a course and not CS260's primitive map. Recap then hand off if the homework is those SKUs.

## 2. Worked patterns (shape only)

**"Which layer?"**
Check B CLO 2 TCP/IP vs OSI counterpart. Then name Unit 3–6.

**"TCP or UDP?"**
Check C Unit 4. Not "the network layer."

**"What address / how many subnets?"**
Check D: configure IP (CLO 3) vs subnet/supernet (CLO 4).

**"Wi-Fi vs Ethernet vs access method"**
Check E link layer. WAN if they asked to *create* a wide-area network.

**"Is the video call a network problem?"**
Intro motivation plus Unit 3 apps plus Unit 7 multimedia/cloud. Not CS205 NLP.

**"CS402 or CS401?"**
Communications course → **this skill**. OS networking unit → **CS401** (recap then that skill).

## 3. Refuse / redirect

- Exam reconstruction; sitting cert final or ACE SAYA-0016; webcam.
- Exploits, attack procedures, malware.
- CS401 / CS260 / CS406 as if this were those SKUs.
- CS120. ENGL*. ESL this sitting.

## 4. Adjacent

CS401 (previous), CS403 (next), CS406, CS260, CS301, CS302 (ACE SAYA-0018), CS120 Watchdog, CS103 404, Saylor CS402 exams (do not encode).

## 5. What not to encode

Exam items. Sitting ACE. Fake SAYA (0016 is this course; 0018 is CS302). 38 h confused with CS401 120 h. Unit 7 as CS406. Forums. Webcam. ENGL. CS120. Attack how-tos.

## 6. Output shape

1. Name the school (CS402 computer communications and networks) and what it is not (**CS401**, **CS260**, **CS406**).
2. Name the **unit / layer**.
3. If address: **configure IP vs subnet/supernet**.
4. If transport: **TCP vs UDP**.
5. Do not sit ACE. Do not sit the final. Do not write exploits.

## 7. Guest vs login

Guest has: catalog, LMS 790, seven units, seven CLOs, 38 h, ACE SAYA-0016, 7-day cert vs 14-day ACE, $5 proctor.
Guest does not have: named app-protocol roster as required titles, unit-LO letters, item banks.

## 8. Pass encoded

Finishing CS402 means you can **describe a network, compare TCP/IP with OSI, configure IP, subnet/supernet, tell TCP from UDP, compare app and link protocols, and apply WAN techniques** — with Unit 7 as internet multimedia/security/cloud. It does not mean you sat SAYA-0016 or finished CS401 or CS406.


---

## Merged from `ug-discrete-structures` (2026-10-11)

- Original description: Frame an undergraduate discrete-structures question using the Saylor CS202 school: start from single-membership sets and discrete (one state at a time), keep counting distinct from probability, keep logic distinct from induction/proofs, then seat recursion, graphs, trees, and finite-state automata as named units. Use when a prompt asks how to reason about discrete objects, assess a proof, count outcomes, diagram a hierarchy, or describe state transitions. Do not use for CS201 C++ ADT implementations, CS107 C++ language, CS101/102/105, CS402 networks, CS120, ENGL, SOC101, ACE exam-taking, or exam reconstruction.
- Unique content carried: one section per course code

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


---

## Merged from `ug-information-security` (2026-10-11)

- Original description: Frame an undergraduate information-security question using the Saylor CS406 school: start from CIA principles, identify threats and attack modes without writing exploits, keep cryptographic models as how they are used for security (not CS260 implementation), then seat access-control types, identification/authentication, network security methods, OS hardening, IDS vs IPS, and privacy laws. Use when a prompt asks how to protect confidentiality, integrity, and availability as this 46-hour course. Do not use for CS260 applied crypto, CS402 networks as a course, CS401 OS security as an OS unit, CS120, ENGL, ACE exam-taking, exam reconstruction, or attack procedures.
- Unique content carried: one section per course code

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


---

## Merged from `ug-modern-database-systems` (2026-10-11)

- Original description: Frame an undergraduate modern-database-systems question using the Saylor CS403 school: start from DBMS structure, people, history, and architecture, keep ER distinct from the relational model, keep relational algebra distinct from SQL, keep normalization and referential integrity as named jobs, then seat SQL intro, SELECT, and JOIN even though the CLO list under-names them. Use when a prompt asks how to organize large data so parts are easy to modify. Do not use for BUS611 MBA data-management, CS250 pandas, CS401 file systems, CS120, ENGL, ACE exam-taking, or exam reconstruction.
- Unique content carried: one section per course code

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


---

## Merged from `ug-software-engineering` (2026-10-11)

- Original description: Frame an undergraduate software-engineering question using the Saylor CS302 school: start from the profession and named principles (separation of concerns, abstraction, incremental development), keep processes distinct from methods, keep SDLC deliverables (use case / class / sequence) and UML as jobs, keep requirements gather distinct from analysis, then seat design, OO implementation, testing, project management, and modification/quality control. Use when a prompt asks how to engineer software as this 36-hour course. Do not use for CS107 C++ language, CS201 ADTs, CS401 OS, BUS MBA project-management as the SKU, CS120, ENGL, sitting ACE SAYA-0018, or exam reconstruction.
- Unique content carried: one section per course code

# Software engineering: principles, then lifecycle, then quality (clustered)

**Use when:** a task asks how to **place a software-engineering question** in the Saylor CS302 school — professional issues, named principles, process vs method, SDLC diagrams, UML, requirements gather vs analysis, design, OO implementation, testing, PM, or quality control.

**Do not use when:** CS107 C++ as language; CS201 data structures; CS401 OS; BUS MBA PM as the course; CS120; ENGL; sitting ACE SAYA-0018; exam reconstruction; ESL (PD still in flight).

This is **one** skill. Ten live units, one argument: **most students already have a "write the code" story; this course's pass is an engineering approach — profession and principles, then lifecycle and models, then requirements/design/OO/test/PM/quality, with ACE as a separate exam you do not sit.**

## 0. Hygiene

- Label **school**. Undergraduate **software engineering** (Saylor CS302). **36 h / 3.6 CEU.** LMS **788** (`/course/cs302`). ACE **SAYA-0018** 3 LD ends 01-31-2027 — **harvest only, do not sit, skip webcam.** Cert **70%** on *either* certificate final (**7-day**) *or* ACE final (**14-day / max 3 / $5**). Syllabus **2025-10-03 13:55**. Primary: articles, lectures, videos.
- Ten **live** units. Seven **live** CLOs.
- Named principles (CLO 2): **separation of concerns, abstraction, incremental development.**
- Named SDLC deliverables (CLO 4): **use case, class, and sequence diagrams.**
- Next numeric: **CS401**. Skip CS120. Stay off ENGL*. ESL waits.

## 1. Procedure — six checks

### Check A — Identity

| Prompt smells like | Hand off |
|---|---|
| C++ syntax / language course | **CS107** |
| Stacks/trees as ADTs | **CS201** |
| OS processes / scheduling | **CS401** |
| MBA project-management as the SKU | **BUS*** |
| Take ACE / webcam / cert final | **refuse** |
| SDLC, UML, requirements, test, SE profession | **this skill** |

### Check B — Profession and principles (Unit 1; CLOs 1–2)

Knowledge, skills, **professional issues**. Then use **separation of concerns, abstraction, incremental development** to develop reliable software. Do not start at UML.

### Check C — Process and lifecycle (Units 2–3; CLOs 3–5)

Differentiate **processes and methods** (CLO 3). SDLC: create major activities and key deliverables — use case, class, sequence (CLO 4). Software modeling (Unit 3) plus **UML for analysis and design in the OO methodology** (CLO 5). Diagrams are jobs, not a tool dump.

### Check D — Requirements (Units 4–5)

**Gathering ≠ analysis.** Two seats. Specs live here before design. Do not skip to code.

### Check E — Design, OO, test (Units 6–8; CLO 7)

Design (Unit 6). Object-oriented **implementations** (Unit 7) — engineering OO, not CS107 language. Testing (Unit 8). Construct **quality** software systems (CLO 7) uses these seats plus Unit 10.

### Check F — PM and quality (Units 9–10; CLO 6)

Project management: **projects, people, and products**. Design modification and quality control (Unit 10) after test — change is a named unit, not an accident.

## 2. Worked patterns (shape only)

**"Which diagram?"**
Check C: use case vs class vs sequence as SDLC deliverables; UML for analysis vs design. If they want C++ class syntax, recap then **CS107**.

**"We already talked to the user."**
That is gather (Unit 4). Analysis (Unit 5) is the next seat. Do not jump to Unit 7.

**"Agile vs waterfall"**
Check C CLO 3 processes vs methods. Do not invent a live named-model roster; encode the *job*.

**"The design changed after test."**
Check F Unit 10 modification + QC, plus Unit 8 testing. Incremental development (CLO 2) is the principle.

**"How do we manage this?"**
Check F CLO 6: projects, people, products. Not BUS MBA PM as this map.

**"CS302 or CS107?"**
Engineering the software → **this skill**. C++ as the course → **CS107**.

## 3. Refuse / redirect

- Exam reconstruction; sitting cert final or ACE SAYA-0018; webcam.
- CS107 / CS201 / CS401 / BUS PM as if this were those SKUs.
- CS120. ENGL*. ESL this sitting.
- UML textbook dumps.

## 4. Adjacent

CS301 (previous), CS401 (next), CS402 (ACE SAYA-0016 — skip ACE here too except encoding 0018), CS403, CS406, CS107, CS201, CS120 Watchdog, CS103 404, Saylor CS302 exams (do not encode).

## 5. What not to encode

Exam items. Sitting ACE. Fake SAYA (0018 is this course; 0016 is CS402). 36 h confused with CS401 120 h. Forums. Webcam. ENGL. CS120.

## 6. Output shape

1. Name the school (CS302 software engineering) and what it is not (**CS107**, **CS401**).
2. Name the **unit seat**.
3. If diagrams: **use case / class / sequence** and analysis vs design.
4. If requirements: **gather vs analyze**.
5. Do not sit ACE. Do not sit the final.

## 7. Guest vs login

Guest has: catalog, LMS 788, ten units, seven CLOs, 36 h, ACE SAYA-0018, 7-day cert vs 14-day ACE, $5 proctor.
Guest does not have: named process-model roster, unit-LO letters, item banks.

## 8. Pass encoded

Finishing CS302 means you can **practice software engineering as a discipline**: principles, process vs method, SDLC diagrams, UML, gather then analyze, design, OO implementation, test, manage projects/people/products, and modify with quality control. It does not mean you sat SAYA-0018 or finished CS107.
