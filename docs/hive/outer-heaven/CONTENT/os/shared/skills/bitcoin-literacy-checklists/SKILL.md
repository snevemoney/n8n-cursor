---
name: bitcoin-literacy-checklists
description: >
  Apply Saylor PRDV151 / Livera beginner Bitcoin literacy via clustered
  manager-level checklists: keys vs custody identity, UTXO and fee/confirmation
  shape, self-custody vs counterparty tradeoffs, venue and scam hygiene, and a
  short history/governance check (PoW, predecessors, who-controls-Bitcoin).
  Use when briefing how Bitcoin actually moves and stores value, comparing
  custodial vs self-custody, or explaining keys, UTXO, fees, nodes, difficulty
  adjustment, and Lightning as a layer — without wallet setup. Label the
  school. Do not use for ECON135 what-is-money framing, operational
  seed/wallet/KYC how-to, trading, CS120 encodings, or Saylor exam-taking.
---

# Bitcoin literacy checklists (clustered)

**Use when:** a task asks how Bitcoin works as a payment/settlement system for a non-developer, what "not your keys, not your coins" means, how a transaction/fee/confirmation actually behaves, whether to self-custody, how Lightning differs from L1, how Bitcoin differs from gold/fiat/*as an asset to hold* (not as "what is money?"), or how SegWit2x / nodes / miners answer "who controls Bitcoin?"

**Do not use when:** the job is ECON135 "what is money?" / energy-network / functions-of-money overlay; CS120 encodings, scripts, or hash-by-hand; ECON105 Ammous applied Q&A (FRB, fiat food, mining-as-energy-security in full); operational wallet/seed/hardware setup, coin-mixing, or AML-evasion; trading or "should I buy"; taking or reconstructing a Saylor exam.

This is **one** skill. It is not "Unit 1 skill + Unit 2 skill…". PRDV151's five units are one literacy stack: market-chosen money → why hold it → cypherpunk/predecessor history → how the machine works → manager-level practice.

## 0. Hygiene

- **Label school.** This is **Livera-curated Saylor PRDV151 beginner Bitcoin literacy** (cypherpunk + Mengerian candidates-on-the-market + practical Bitcoin). It is **not** the Saylor–Breedlove energy-network school (ECON135), **not** Ammous ECO31 (ECON105), **not** CS120 developer crypto, **not** a multi-coin investment survey.
- **Conceptual, not ops.** Describe *what must be true* (who can spend, what a UTXO is, what a fee buys). Do **not** give seed-phrase procedures, wallet install steps, storage locations, mixing recipes, or "how to buy on exchange X."
- **No investment advice.** Compare properties. No price targets, no "buy Bitcoin," no allocation %.
- **Claim vs fact.** "Melting ice cube," "uncorrelated," "government cannot ban the protocol" are **course-shaped claims**. Live inflation, correlation, and legal overlays need a re-fetch if the user needs current numbers or counsel.
- No exam items. No third-party "answer keys."

## 1. Procedure — run four checklists (plus a short on-ramp)

Run in order unless the user already constrained the frame.

### On-ramp — Monetary candidate, not "what is money?" (Units 1–2; LOs 1–2)

Give **one short paragraph**, then stop. Do **not** run the ECON135 five-check "what is money?" procedure.

1. Money-ish goods are **market-chosen** (most saleable), not decreed into existence. Bitcoin is offered as a **strictly limited bearer digital good** on a peer-to-peer network.
2. Score it as a *candidate* on ordinary monetary properties: scarce/hard, divisible, portable, durable, verifiable. Bitcoin's distinctive claims: **capped issuance**, **globally cheap verification**, **no issuer**.
3. If the user asked "what *is* money?" or wants energy/SoV-MoE-UoA reweighting, **hand off to ECON135**. If they asked layered history (gold → deposits → Fed funds), **hand off to ECON120**. If they asked human-action / subjective value, **hand off to ECON103**.

**Investment/holding contrast (LO 2) — only if asked:** compare cash, gold, equity, real estate, BTC on *issuer, supply, bearer-vs-claim, seizure/transfer, volatility, legal overlay*. Ponzi test: a Ponzi has an operator who pays old inflows from new and can halt the game; Bitcoin has no issuer and no redemption promise. Greater-fool *trading* can still sit on top of a non-Ponzi base. Ban-risk hits **venues** harder than the protocol.

---

### Checklist A — Keys and custody identity (Unit 4; LO 5)

**Question this checklist answers:** who can spend this bitcoin, and what kind of risk is that?

| # | Test | Write this |
|---|---|---|
| A1 | **What is the authorization?** | A **private key** authorizes a spend. A **public key / address** is where value is received. Software called a "wallet" is a key-and-UTXO manager, not a container of coins. |
| A2 | **Who holds the keys?** | If a firm holds them, the user has a **claim** (custodial). If the user (or their multisig set) holds them, they have **bitcoin** (self-custody). "Not your keys, not your coins" is this identity test. |
| A3 | **Hot vs cold as exposure class** | Keys on a networked general-purpose device = **hot** (theft/malware surface). Keys kept offline = **cold** (loss, inheritance, and operational-complexity surface). These are *classes*, not product recs. |
| A4 | **Shared control?** | Multisig / threshold schemes split the spend authority (business continuity, two-person rule). They reduce *single-key* failure and add *coordination* failure. Name the tradeoff; do not design a scheme. |
| A5 | **Validation vs trust** | A **node** checks that received coins follow the rules (supply cap, scripts, block limits). Without one, the user trusts someone else's view of the ledger. Miners **order**; nodes **enforce**. |

**Fail closed:** if you cannot name who can sign, you do not know the custody model. Do **not** proceed into seed generation, backup geography, or vendor setup.

**Worked micro-pattern — "Our exchange account says 10 BTC."**
A2: that is a claim on the exchange, not 10 UTXOs the firm can spend. Counterparty, freeze, insolvency, and withdrawal-policy risk dominate. Self-custody would swap those for operational/key-person risk (Checklist C).

---

### Checklist B — UTXO, fees, confirmation, layers (Units 4–5; LO 4)

**Question this checklist answers:** what actually moves, what a fee buys, and which layer the payment belongs on.

| # | Test | Write this |
|---|---|---|
| B1 | **Account or UTXO?** | Bitcoin does **not** keep account balances. Value lives in **unspent transaction outputs**. "Balance" in a wallet is the **sum of UTXOs** it can sign for. |
| B2 | **What does a send do?** | It **consumes** specific UTXOs as inputs and **creates** new UTXOs as outputs (payee, and usually **change** back to the sender). Leftover input-sum minus output-sum = **fee**. |
| B3 | **What does the fee buy?** | Scarce **block space**. Fees bid for inclusion under the current mempool. Difficulty **adjustment** keeps block production roughly on schedule as hashrate moves — issuance does not need a central clock (LO 4 exhibit). |
| B4 | **When is it "done"?** | A transaction is **unconfirmed** until in a block; **confirmations** = depth. Reorg/double-spend risk falls with depth; it does not hit zero. High-value settlement waits. |
| B5 | **Which layer?** | **L1 / on-chain** = expensive, scarce, high-finality, low-frequency (savings, large settlement). **Lightning** = off-chain channels; on-chain open/close; cheaper/faster; extra assumptions (liveness, liquidity, routing). Use Lightning for **low-value / high-frequency**, not as a replacement for L1 savings. |

**Do not encode:** coin-control UIs, fee-estimator settings, RBF how-to, channel-open recipes, or "increase the block size" as a free lunch (that is the SegWit2x/control fight — Checklist D).

**Worked micro-pattern — "Why did a $5 coffee cost $8 in fees?"**
B3+B5: L1 fee is a block-space auction, not a % of payment. Small payments on a congested L1 are the wrong layer. Lightning exists *because* of that mismatch. Also: UTXO **change** can look like "the wallet sent almost everything" — that is B2, not theft, but the user should still verify addresses (Checklist C3).

**Worked micro-pattern — "Can't we just make blocks bigger?"**
Point at Checklist D (who controls the rules) and B5 (layers). Throughput-only forks trade validation cost / decentralization for speed. PRDV151 treats that as a **governance** question, not a performance tweak. CS120 if they want scripts; ECON105 if they want Ammous scaling economics.

---

### Checklist C — Self-custody tradeoffs at manager level (Unit 5; LO 5)

**Question this checklist answers:** given amount, threat model, and who must not be a single point of failure, which *risk class* is this organization accepting?

Run as a **tradeoff table**, never as a shopping list.

| Risk class | Custodial (they hold keys) | Self-custody (you hold keys) |
|---|---|---|
| Counterparty | Insolvency, freeze, policy, account takeover at the firm | Near-zero *issuer* risk; you *are* the operator |
| Operational | Password/2FA, withdrawal whitelist, outage | Key loss, malware, backup failure, fat-finger send |
| Key-person / inheritance | Depends on corporate account controls + the firm's recovery | If one person holds the only key, **that person dying is a loss event** |
| Censorship / seizure | Venue and bank rails; legal process on the firm | Protocol is hard to stop; **devices, people, and on-ramps** are not |
| UX / speed of spend | Usually easier; Lightning may be built-in | User must understand UTXO/fees/layers (Checklist B) |
| Audit / title | Statement from a third party | UTXOs the org can sign; node lets you verify without the vendor |

**Manager rules of thumb (course-shaped, not advice):**

1. **Amount × irreversibility.** Larger, longer-horizon pots argue against a single hot key and against an unexamined custodian. Smaller, spend-it-this-week pots argue for convenience (hot or custodial Lightning).
2. **Two-failure test.** Ask: "If this one person, device, or vendor fails, is the money gone or frozen?" If yes, the design is not ready for a balance the board would care about.
3. **Do not split the difference badly.** Leaving "savings" on an exchange *and* keeping no recovery plan is two bad models at once. Moving to self-custody *without* a rehearsal spend and a documented recovery path just relocates the failure.
4. **Lightning vs L1 is not a custody decision.** You can be custodial-on-Lightning or self-custodial-on-L1. Layer (B5) and custody (A2) are orthogonal.

**Worked micro-pattern — "Should we self-custody treasury BTC?"**
Do not say yes/no. Walk C: name the custodian's failure modes, name the org's key-person and backup failure modes, ask whether anyone can run or trust a node (A5), ask which layer the expected spends need (B5). Hand legal/accounting (tax lots, impairment) to counsel — this skill does not practice law.

**Worked micro-pattern — "Employee wants a company wallet on their phone."**
A3 + C: phone = hot, employee = key-person. Fine for *trivial* working balances with a loss budget. Not a treasury. If they meant payroll *in* BTC, that is a tax/accounting question ECON135 ep-8 flagged as usually a bad idea — mention once, do not lecture.

---

### Checklist D — History / governance / "is this even Bitcoin?" (Unit 3; LO 3)

**Question this checklist answers:** why this protocol looks like this, and who gets to change it.

| # | Test | Write this |
|---|---|---|
| D1 | **Cypherpunk parentage** | Privacy and bearer digital cash were pursued by people who **wrote code**, not only policy. That culture is why "just add a backdoor / just KYC the protocol" fights the design. |
| D2 | **Predecessor parts** | **Hashcash** → PoW as a cost. **b-money** → distributed computational money sketch. **Bit Gold** → costly digital collectibles without a finished consensus. **e-gold** → centralized digital gold, died of **counterparty/political** capture. Bitcoin is the combination that shipped: P2P cash that **minimizes trust** in a mint (white paper job). |
| D3 | **PoW's job** | Ties block production to **energy/work** so writing history is expensive and checking it is cheap. Difficulty adjustment (B3) is the thermostat. |
| D4 | **Who controls Bitcoin?** | **Users/nodes** enforce the rules they run. Miners order transactions inside those rules. Developers propose software; they cannot push a rule change onto nodes that refuse it. **SegWit2x** is the course's worked example: a block-size political bargain failed when users/nodes did not follow. |
| D5 | **Altcoin / fork test** | A ticker that changes supply schedule, block constants, or "who may spend" is not "Bitcoin with features." Treat it as a **different candidate** (on-ramp + A2). Feature-speed forks that weaken validation are the extinction-level move this course warns about — label as PRDV151, not as physics. |

**Worked micro-pattern — "Miners will just vote a change."**
D4: miners who mine invalid-to-nodes blocks waste energy. The SegWit2x moral is that **hashrate is not sovereignty**. If the user wants the seven-layer security grid, that is ECON135 Unit 5 — one sentence, then hand off.

---

## 2. Scam and pitfall hygiene (Unit 5 — always-on add-on)

Attach whenever U5, "how do I start," or "someone asked me to send BTC" is in play:

- Nobody legitimate needs your **seed / private key** to "help," "verify," "sync," or "upgrade."
- "Send BTC to this address to unlock / double / claim" is theft.
- Support impersonation, fake wallet sites, and lookalike addresses are the common path. Verify **out of band**.
- Open-source, widely reviewed software is an argument about **inspectability**, not a blessing of whatever `.exe` is on a download page.
- Irreversibility (B4) means there is no chargeback desk. That is a property, not a bug to "fix" with a trusted third party unless you *chose* a custodian (A2).

Do not turn this into a brand-recommendation list.

## 3. How the five units sit on the checklists

Do not emit a unit-by-unit essay unless asked.

| Block | Units | Checklist weight |
|---|---|---|
| Why a candidate / why hold | 1–2 | On-ramp only |
| History & who-controls | 3 | D |
| Machine | 4 | A + B |
| Practice | 5 | C + scam add-on + B5 |

## 4. Out of scope (hand off)

- **ECON135 `what-is-money-framing`:** functions of money, energy network, seven security layers, crypto-asset vs currency vs application.
- **ECON103 / 104:** action, calculation, ABCT, fiduciary media.
- **ECON105:** FRB-on-Bitcoin, fiat food, mining-as-energy-security in full, developing-world reserves.
- **ECON120:** layered-money history.
- **CS120:** encodings, signature math, script, node implementation.
- **Ops / security engineering:** actual key ceremonies, hardware setup, coinjoin.

## 5. Output shape

Default answer:

1. One sentence **school label** (PRDV151 / Livera literacy, not ECON135).
2. The **one** of A/B/C/D that carries the question (or A→C if the question is "should we self-custody").
3. A tradeoff table if custody or layer is in play — **no vendor list, no seed steps**.
4. A handoff sentence if they actually asked what money is, how to implement a node, or how to pass the Saylor exam.
5. No MCQ, no dump of the white paper, no "you should buy."
