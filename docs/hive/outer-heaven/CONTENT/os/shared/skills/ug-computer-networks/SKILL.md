---
name: ug-computer-networks
description: >
  Frame an undergraduate computer-networks question using the Saylor
  CS402 school: start from network architecture and how devices
  communicate, keep TCP/IP layers compared with OSI counterparts,
  keep TCP distinct from UDP, keep IP configuration distinct from
  subnetting/supernetting, then seat application protocols, link-layer
  access, WANs, and Unit 7 multimedia/security/cloud over the Internet.
  Use when a prompt asks how a packet is layered, addressed, or
  switched as this 38-hour course. Do not use for CS401 OS networking
  as the whole SKU, CS260 applied crypto, CS406 info-sec as a course,
  CS120, ENGL, sitting ACE SAYA-0016, exam reconstruction, or attack
  procedures.
---

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
