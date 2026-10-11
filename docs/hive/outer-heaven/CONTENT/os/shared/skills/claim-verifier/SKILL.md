---
name: Claim verifier
description: >-
  Use before publishing or repeating a wild claim — Demkinn #47 five-bucket
  verification with earliest primary source; also Path C ProofCheck clinical
  atomic-claim cards. Owner Researcher.
---
---
name: Claim verifier
description: >-
  Use before publishing or repeating a wild claim — Demkinn #47 five-bucket
  verification with earliest primary source; also Path C ProofCheck clinical
  atomic-claim cards. Owner Researcher.
---
# Claim verifier (Demkinn #47)

Owner: Researcher. Aligns with FACT / INFERENCE / OPINION / UNVERIFIED.

**vs Compare sources (#48):** This skill verifies ONE claim. Use compare-sources when several accounts disagree about the same story.

**vs Viral scout (#2, Creative):** Virality never upgrades a truth bucket.

## Buckets (exactly one)
- **Confirmed** — independent primary supports the claim as stated → may state as FACT
- **Partial** — core true; scope/time/$ narrower → publish only with narrowed wording
- **Company claim** — only seller/founder/marketing asserts it → never FACT
- **Unverified** — no usable primary in budget → must label; do not promote as fact
- **False** — primary contradicts → do not publish

## Steps
1. State the claim exactly (one sentence; keep units and time window).
2. Strip hype words before searching.
3. Find the **earliest primary** (filing, paper, official docs, dataset). Note date + URL. Never invent sources.
4. Assign one bucket. Prefer Unverified over Partial when thin.
5. Write a claim card to disk (research packet `verifications/` or day’s research folder).
6. Gate: block public publish if False, or Unverified without an explicit label in the copy.

## Claim card template
- Claim:
- Bucket:
- Earliest primary: title · date · URL
- What the primary actually says:
- Narrowed wording (if Partial):
- Labels: FACT / INFERENCE / OPINION / UNVERIFIED
- Publish: YES (FACT) | YES with label | NO

## Path C / clinical pattern (weekly intel 2026-09-07)
Use when ProofCheck QC or nursing/clinical documentation verification is in scope.

Primary comps (abstracts only until full PDF audit): VeriFact `arxiv:2501.16672`, MedRAGChecker `arxiv:2601.06519`, independent fact-check module `arxiv:2512.16189`. Compliance comps: CMS MLN909160 (Dec 2024), ACDIS/AHIMA Compliant Query Practice 2026 update.

**Do**
1. Decompose the note/answer into **atomic claims** (one proposition each).
2. For every claim, attach an **evidence span** (EHR/note/source quote or “insufficient”).
3. Label support: supported | contradicted | under-evidenced | safety-critical.
4. Keep the **verifier separate from the generator** (verifier ≠ builder).
5. Human review required before any clinical or billing action — building mode: no PHI, no live patient data, no sell/send.

**Don’t**
- Treat author abstract % (e.g. VeriFact 92.7%, MMIA >98%) as ProofCheck product KPIs.
- Ship ambient scribe demos as Path C (wrong wedge).
- Auto-query providers or auto-code ICD from model output.

## Never
- Quote $ / job-loss % / reply-rates as FACT without Confirmed
- Let likes/views change the bucket
- Mint agents, auto-send, auto-publish, new icp_id without operator yes
- Ingest real PHI to “try” clinical verifiers

## Tools
| Need | Path |
|---|---|
| Web primary | WebSearch/WebFetch — **PROVE** |
| Scholar | scholar-web-lookup / arXiv export API — **PROVE** |
| X corroboration | **BLOCKED** needsAuth — bookmarks **WORKAROUND** |

## Prompts
**Claim card**
```
Claim: …
Earliest primary: title · date · URL
Bucket: Confirmed|Partial|Company claim|Unverified|False
Publish: YES (FACT) | YES with label | NO
```

**Clinical atomic card (ProofCheck)**
```
Claim (atomic): …
Evidence span: …
Support: supported|contradicted|under-evidenced|insufficient
Safety-critical: yes|no
Verifier ≠ generator: yes
Human review: pending|pass|fail
```

## Enrich 2026-10-10: quote-grounded insights (`yt:D0sTSFUSx-g` echohive "Branch")
Every model-extracted insight must carry a verbatim quote. Drop it if the normalized quote is not a substring of the fetched source text. This proves the words exist, not that they're true; the five-bucket check above still applies. PROVE: `branch_quote_verify.py` (fabricated quote dropped).
