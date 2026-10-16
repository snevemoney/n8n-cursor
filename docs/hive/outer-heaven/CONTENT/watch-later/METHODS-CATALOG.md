# Evens's signal methods — full catalog (2026-10-16)

Raw methods extracted: 2477 from 754 sources read; failed slices: [].
Status vs Jarvis as of 2026-10-16 15:00 (graded by merge agents; builder evidence, not Watchdog). Jarvis gained the plan tool, helpers, background apps and ONE-BRAIN after this grading.

## Evals and verification

This family covers how an agent proves that work is done and correct. It includes reading back side effects, separating the builder from the grader, golden sets and model bakeoffs, citation and number checks, visual and UI QA, guardrails, and failure-to-regression loops. 335 raw methods from the signal corpus were merged into 82 methods below. Every source id is kept. Close variants are folded into one row, and their names appear in the summaries.

Overall picture: Jarvis has the hands for most checks. The computer tool gives screenshot, act, then a fresh screenshot. Safari snapshots, shell, files and fetch are all there, and send, pay and delete are held for Evens. What Jarvis lacks is the discipline layer. Nothing forces a side-effect read-back before `done`, there is no separate verifier, and there is no golden set behind Jev's model routing. There is no injection scoring on text it reads in Safari, and the trace log is not structured. Sub-agents, hooks, a skills library, resume after a reboot and signal ingestion are all missing, so methods that depend on them are graded MISSING.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Prove done on a real run, read back the side effect | Before `done`, run on a real input and read the target back: file, sent folder, ticket, page. Write CLAIM, SIDE-EFFECT and DIFF. Never trust a summary that says "sent" or "fixed". | 27Y44JYXZJ8, upgrades/nate-82/CLUSTER-ops.md, workflows/click-live/flows/keyline-4841/RUN.md, iTY8Q449YNQ, vcU85OrwuV0, pbrln2TVeh4, jdbOVepEtUE, 8ktcSaSTvxk, upgrades/nate-82/watchdog.md | PARTIAL | P0 |
| Independent verifier, no self-PASS | A fresh session or a different model grades the work against last-known-good. The builder never fills in GRADE. Includes a QA bounce loop and escalation after repeated fix loops. | upgrades/nate-82/CLUSTER-ops.md, workflows/dark-factory.md, workflows/hours-deposit-then-they-ask-the-next-rung.md, product-factory/GRADE.template.md, eecUhBpTz_g, vDVSGVpB2vc, 8MEJen0nblQ, NDeyhGnNECc, J_jswzXhYJA | MISSING | P1 |
| Cross-model referee and blind bakeoff | A third model writes the task and judges anonymized outputs, or gives several rounds of plan critique. | 2J3uX8iRNng, 2OD14-0cot4, EthxaDswUFo, GpSqBjW6hR4, Tj3018n5MVg, U6k4MeVks_Y | MISSING | P2 |
| Hidden hold-outs written before the build | The verifier writes acceptance checks the builder never sees, plus a leak check afterwards. | eecUhBpTz_g, SIGNAL-TRAIN-LOOP.md, workflows/dry-runs/dark-factory-2026-08-14/watchdog/HOLD-OUTS.md | MISSING | P2 |
| GRADE record template | Fixed fields: BUILDER, VERIFIER, HYPOTHESIS, LABELED, MISS, GRADE. Includes a per-check table and pending stubs that name the blocker. | product-factory/GRADE.template.md, workflows/dry-runs/dark-factory-2026-08-14/watchdog/GRADE.md, workflows/click-live/flows/keyline-4841/GRADE.md | MISSING | P3 |
| Per-step verify card | ACT / EXPECTED / OBSERVED / COMPARE / NEXT after each browser or screen action. Retry at most twice. Capture the screen the moment a check diverges. | social/x-2088359756096532965/PACKET.md, workflows/click-live/flows/evenslouis-ca/RUN.md, workflows/seedance-site.md, bWhjRLX0jpo | PARTIAL | P1 |
| Honest not-run / UNKNOWN reporting | Never invent OBSERVED when a tab drops. No self-estimated durations. Say "I don't know". Write a coverage-gap card instead of improvising. | workflows/click-live/flows/proofcheck-qc-bugs-2026-08-15/RUN.md, Pi-m8R068r4, YHk45NEpspE, workflows/industrial-smb.md | PARTIAL | P1 |
| Written done-check and hard cap before any loop | A countable or metric done condition, how to check it, and a cap. Refuse "until satisfied". Covers the trigger/action/stop scope and human-readable success criteria. | 2J3uX8iRNng, 3GAxd90fEE4, EuzYhzB0vbI, SIGNAL-TRAIN-LOOP.md, upgrades/nate-82/consultant.md, XNQBCRcwXV4, CB5bG4mvnS0, 27Y44JYXZJ8, RzLV8sfFdMM, 8ktcSaSTvxk | PARTIAL | P1 |
| Scope-drop detection gate | List every ask, tick each one against the plan, and block if one is dropped. | eRS3CmvrOvA | MISSING | P1 |
| KPI and baseline scoping gate | Fill four blanks before building (bucket, KPI, baseline, target), plus a not-building list. | 8ktcSaSTvxk, LVAHYV4Xrto, 3XIGcM7VICc, jdbOVepEtUE | MISSING | P3 |
| Before/after proof capture | Measure a baseline, then re-measure at 30, 60 and 90 days. Use a fixed observation window and write one verifiable sentence. | HNKlFTd1maM, Lg5TYWPSg6M, LVAHYV4Xrto, eFOTQpbGcy8, I7mpF7_pnPM | MISSING | P3 |
| Capped small-batch first run | Run on a small sample and inspect each field before the full run. | 3GAxd90fEE4, AO5aW01DKHo | PARTIAL | P2 |
| Fixture capture and replay | Pin a real input, cut off the side-effecting step, and replay it while debugging. | -Q_P7HFydZk, BO-jFbN4p8Y, tFFKuq2t0rI, HN0oWxbF2bM, a5sJNwfZ528 | MISSING | P2 |
| Time-triggered job testing | Fire the job on demand or with a shifted clock, and rehearse well before the deadline. | bxGE_LXPyAU, UGIZnh6HNLc, bWhjRLX0jpo | MISSING | P3 |
| Supervised runs before unattended | Watch the first runs, reduce supervision slowly, watch money flows 10 or more times, keep an inventory of what runs. | 3XIGcM7VICc, jdbOVepEtUE, vFepZE_wrfg, xJ5oz63mIec, ehg4fhydTgs, CB5bG4mvnS0 | MISSING | P2 |
| Test-observe-fix loop with defect notes | Write concrete likes and dislikes after each live test, revise per batch, and treat the prompt as living. | -cdexJWN8YA, zWLZ3bVVwD8, BO-jFbN4p8Y, pxzo2lXhWJE, HN0oWxbF2bM, 8C6iCpJ9HPo | PARTIAL | P2 |
| Localize the failing layer | Check the raw tool output, then the args sent, then the interpretation. Covers null fields traced upstream, key names, missing model wiring and empty sub-agent payloads. | -cdexJWN8YA, QojPKL96Dx4, a5sJNwfZ528, 8ktcSaSTvxk, TDHFkKSTJ30, 9mqsVK6Iqoc | PARTIAL | P1 |
| Context failure-mode diagnosis | Classify as poisoning, bloat, confusion or clash. Check that the fact exists before blaming retrieval, and that the problem is the model and not the skill. | Ek1NBfnnTH0, DTCyvo6cC54, q5lg3npxjAc | MISSING | P2 |
| Structured per-job trace and error log | One row per run with tools, args, tokens, duration and outcome, errors included, with memory writes and their source. | 27Y44JYXZJ8, 7UNsK9LoORo, HN0oWxbF2bM, jBanaNBY-sM, lcNN3X9gXls, UGIZnh6HNLc, hN58VkYLie4, y-cq_Qo4zVo, NWbh5ZoEHkA, a5sJNwfZ528, gb5TlGw6Uks, -cdexJWN8YA | PARTIAL | P1 |
| Provider-side logs and 5xx triage | Read vendor logs and durations. Treat a 5xx as vendor-side or a policy reject, not only your own bug. | -cdexJWN8YA, Vm8QOo9MiC4, UGIZnh6HNLc | PARTIAL | P3 |
| Audit delegation briefs | Read the exact prompt each sub-agent received. | e18sdZLwP7o, vDVSGVpB2vc | MISSING | P3 |
| Golden labeled set, rerun on change | Expected outputs per task, scored per row, rerun on every model, prompt or skill change. | 8IUWeF3B-hk, jdbOVepEtUE, lcNN3X9gXls, Vb1SwBAn9cQ, X80ljdCPM_U, irg-2IfAjpo, NHFbAg2b54U, vFepZE_wrfg, q5lg3npxjAc | MISSING | P1 |
| One-knob, hypothesis-first A/B | State the hypothesis and change one variable. Variants: skill vs no-skill control, toggle off/on, worker-tier A/B, removing an extra hop. | 8IUWeF3B-hk, lcNN3X9gXls, upgrades/nate-82/researcher.md, AYsg5gAMWyo, FFWtxjvW2ts, XTBWVVcF3Pk, XNQBCRcwXV4, iTY8Q449YNQ, jBanaNBY-sM, lokbsA5VXOk | MISSING | P2 |
| Eval statistics hygiene | Adequate sample size, a cost column, refusals counted separately, median and mean latency, error projected at real volume, a planted hard item, fail-type labels, model, date and incumbent confounds. | X80ljdCPM_U, EthxaDswUFo, 8ktcSaSTvxk, NO97pqqc10A, upgrades/nate-82/librarian.md, 2J3uX8iRNng, RLjaUES9P8A, GpSqBjW6hR4 | MISSING | P3 |
| Calibrate the grader | Check a scorer or critic against labeled examples before it gates work. | EuzYhzB0vbI | MISSING | P2 |
| Model bakeoff on Evens's own tasks | Same task across models, tested inside the real harness. Vendor benchmarks are signals only. | EthxaDswUFo, RLjaUES9P8A, J_jswzXhYJA, q5lg3npxjAc, GpSqBjW6hR4, dYrrEKXtttk, Vb1SwBAn9cQ, X80ljdCPM_U, QojPKL96Dx4, QCjMBOEhpLE | MISSING | P2 |
| Full tool round-trip test before routing to a model | Run a harmless multi-hop tool call per provider, check required fields such as thought signatures, and bisect the tool set. | Vb1SwBAn9cQ, X80ljdCPM_U, q5lg3npxjAc | MISSING | P1 |
| Log the responding model id | Detect silent downgrade routing and label the model on every run. | vcU85OrwuV0, 2J3uX8iRNng | PARTIAL | P2 |
| Evaluating a new tool | Audience split and fixed categories, a blank-canvas first run, and vague, specific and agentic prompt tiers. | -6yUeJ3rkvg, TDHFkKSTJ30 | PARTIAL | P3 |
| Cite with locator, verify quoted spans | Give doc, page and span, then search the source for it. Check that a retrieval call fired, and attach URLs and a date to live facts. | QojPKL96Dx4, upgrades/nate-82/researcher.md, KVFfApQZhE4, irg-2IfAjpo, QrJhdTbK3TU, 8QQ_INxAhRs, YHk45NEpspE, zWLZ3bVVwD8 | PARTIAL | P1 |
| Verify every number, label UNVERIFIED | No invented ROI, no tape dollar figures, facts checked separately from design. | 0YXjEzFfft8, QojPKL96Dx4, tFFKuq2t0rI, KGXFkUlBHxw, upgrades/nate-82/DRY-RUN-SIX.md, Ek1NBfnnTH0, RLjaUES9P8A | PARTIAL | P1 |
| Statistic scope hygiene | Separate what is measured from opinion, and state the sample and population. | -nG-9vlSkho, -zL_trhnQaI | PARTIAL | P3 |
| Adversarial primary-source verification | Verifier agents confirm, correct or demote each claim, and each claim gets a reliability label. | Tj3018n5MVg | MISSING | P2 |
| Evidence-tier honesty labels | Caption-only, speech vs behavior, hype filter, quarantine list, workflow vs agent. | workflows/hours-deposit-then-they-ask-the-next-rung.md, workflows/remote-oneshot-vs-local-cookies.md, tFFKuq2t0rI/LEARNED.md, i4Q8wHZNPBU, learnings-implement.md, tNOk29fs_aY | MISSING | P2 |
| Render/screenshot visual verification | Check per section at desktop and mobile, with scroll frames and full-size slides. Use a score threshold and a hard pass cap, and match the check to the artifact type. | 3TdD8Qv5Tk8, ZRb7D6R64hM, iTY8Q449YNQ, FFWtxjvW2ts, jdbOVepEtUE, RzLV8sfFdMM, dYrrEKXtttk, tDGiWn0flK8, EuzYhzB0vbI, gb5TlGw6Uks, 8QQ_INxAhRs | PARTIAL | P1 |
| Generated media QA checklist | Text fidelity, identity, hallucinated objects, color cast, first frame, physics artifacts, and a full watch-back. | AYsg5gAMWyo, UT_Ek_tmeVA, TWvjqpk3uSQ, iRBs8PCBCaA, ONmaDdOBGig, J_jswzXhYJA, 3XIGcM7VICc | MISSING | P3 |
| UI break-it QA | Headed adversarial pass: empty, invalid, round-trip, keyboard, mobile. N unique scenarios, one real annotated break, a human click-through. | CB5bG4mvnS0, iTY8Q449YNQ, upgrades/nate-82/creative-studio.md, 3TdD8Qv5Tk8 | PARTIAL | P2 |
| Negative and edge-case tests | "What could go wrong" inputs, bad credentials, decline-then-retry, clean-state end-to-end, fail-safe review, reproduce before reporting. | RzLV8sfFdMM, bWhjRLX0jpo, jdbOVepEtUE, eRS3CmvrOvA | PARTIAL | P2 |
| Persona walkthrough panel | Parallel persona reviewers (beginner, engineer, owner). | 8QQ_INxAhRs, jdbOVepEtUE | MISSING | P3 |
| Fail the build, no "looks good" | Named defects per dimension. "Flow completed" and "values correct" are separate verdicts. | workflows/CLICK-LIVE-EVENSLUIS-2026-08-14.md, bWhjRLX0jpo | PARTIAL | P2 |
| Adversarial critic on plans and drafts | Plan roaster or roast council (go/reshape/kill), a devil's-advocate session, five gates, a debate pass on copy. | e18sdZLwP7o, pbrln2TVeh4, RzLV8sfFdMM, zyvdl__Ywfk, XTBWVVcF3Pk | MISSING | P2 |
| Skeptic refuters and red-team ledger | Refute each claim, run a completeness critic before a phase is done, keep an attack and ruling ledger. | R0qF17BVl9w | MISSING | P2 |
| Multi-judge decision panel | Criteria-scored judges, advocate and skeptic, fresh voters, persona debate, N-agent consensus. | R0qF17BVl9w, jdbOVepEtUE, 2J3uX8iRNng | MISSING | P3 |
| Options and dissent, unaveraged | At least 2 paths with their tradeoffs. Never blend conflicting views. Evens decides. | diY71x7GUjI, upgrades/nate-82/DRY-RUN-SIX.md | PARTIAL | P3 |
| Secret/PII leak scan on writes and builds | Scan written files, client bundles and screen captures. Report type and location only. | AO5aW01DKHo, RzLV8sfFdMM, rXpHzWXjHrw, bWhjRLX0jpo | MISSING | P1 |
| Enforce limits at the tool layer | Detach or block rather than rely on the prompt. Inspect scripts before running them. Plan first, use a permission ladder, show the script and wait for a go. | RzLV8sfFdMM, lcNN3X9gXls, AO5aW01DKHo, 3GAxd90fEE4, jZgcWCzxh1I | PARTIAL | P1 |
| Tiered code review by blast radius | Cheap review on every change, multi-angle review on money, auth or schema. | eRS3CmvrOvA, vfWTyEreOEc | MISSING | P3 |
| Inbound/outbound guardrails | Injection score, URL allowlist, PII, keywords, topical and custom checks. A pass does not mean send. | oWdJMJp2HgM, workflows/us.md | MISSING | P1 |
| Guard fixture suite | No-send, cap refusal, refuse-the-dollars, contradiction, and known-miss cases (password lines). Kept in a score table. | upgrades/nate-82/DRY-RUN-SIX.md, upgrades/nate-82/watchdog.md, oWdJMJp2HgM | MISSING | P2 |
| Draft-only outbound with human gate | Drafts go to Evens. An agent's numbers are flagged before any send. | KGXFkUlBHxw, a5sJNwfZ528, workflows/us.md, upgrades/nate-82/DRY-RUN-SIX.md | HAVE | P2 |
| Periodic self-audit of usage logs | /insights-style monthly review that ranks features by real use. | 0WDkwMxj13s, ZRb7D6R64hM, vfWTyEreOEc | MISSING | P3 |
| Memory and index audit | Routing both directions, index vs disk, freshness, contradictions, hand-find test, stale memory checked first. | Ek1NBfnnTH0, DTCyvo6cC54, hQvwMj7IJe4, vDVSGVpB2vc, workflows/AUDIT-2026-08-14.md, gb5TlGw6Uks | MISSING | P2 |
| Failure to regression pattern | Write a case study, replay the failed trace, patch memory or the skill, cite the source. | 8QQ_INxAhRs, Ek1NBfnnTH0, q5lg3npxjAc | PARTIAL | P1 |
| Skill improvement loop | Binary checks, overnight loop, dry-run self-patch, kept only on improvement. | simon-scrapes-dossier.md, PQBYZQqan2g | MISSING | P2 |
| Skill or agent misfire diagnosis | Compare the description to the prompt and validate the YAML front matter. | e18sdZLwP7o, jdbOVepEtUE | MISSING | P2 |
| Cold-start context test | Stranger vs cofounder answers from a fresh session or directory. | 0WDkwMxj13s, 8QQ_INxAhRs, 2J3uX8iRNng | MISSING | P3 |
| Ingest count and gold question | Stored vs reported count, then one known-answer question. | Fu6vOfzFmcw, upgrades/nate-82/researcher.md | MISSING | P2 |
| Connector preflight and generated-config audit | Health call, enumerate resources, find empty tool configs, list setup debt. | 3TdD8Qv5Tk8, gb5TlGw6Uks, gt8k4bA01Mo, PQBYZQqan2g, TDHFkKSTJ30, rXpHzWXjHrw, vFepZE_wrfg | PARTIAL | P1 |
| Pipeline output-count assertions | Positive branch plus empty negatives, merge item count, run every entry path. | 9mqsVK6Iqoc, TDHFkKSTJ30, KGXFkUlBHxw | MISSING | P3 |
| Multi-hop end-to-end verification | UI acknowledgement, backend run, final artifact. Commit, deploy, live page. Systems side by side. | 3TdD8Qv5Tk8, bX_stJ_Eiog, glM8godEcic, y-cq_Qo4zVo | PARTIAL | P2 |
| Prove idempotency by running twice | Re-run the write job and diff the destination. Use a unique key and split find from create. | UGIZnh6HNLc, upgrades/nate-82/forge.md | MISSING | P2 |
| Check whether a side effect fired after an error | Check the mailbox or DB before any retry. Curl the API directly. | Vb1SwBAn9cQ, upgrades/nate-82/researcher.md | PARTIAL | P1 |
| Verify claimed config/memory changes by diff | Diff the stored prompt or config before and after "it learned" or "fixed". | 27Y44JYXZJ8, TDHFkKSTJ30 | PARTIAL | P2 |
| Click-live the real production URL | The prod domain, not a preview. Drive the real app path, such as pay, then login, then dashboard, in test mode. | 2075635283211772279, IMPLEMENTATION_MAP.md, I7mpF7_pnPM, social/x-snevemoney-bookmarks-ai | PARTIAL | P1 |
| Served-HTML metadata and vendor-leak grep | Fetch the page and check lang, title, og tags and vendor strings. | workflows/click-live/flows/proofcheck-qc-bugs-2026-08-15/RUN.md | HAVE | P3 |
| Crawl an app into a screen/path map | A map of every screen and path, compared with the design. | 2074271032589074881 | MISSING | P3 |
| Landing-page acceptance checks | CTA above the fold and repeated, a unique CTA color, reduced-motion poster, visible refs. | gt8k4bA01Mo, workflows/dry-runs/dark-factory-2026-08-14/watchdog/HOLD-OUTS.md | MISSING | P3 |
| Writing lints | AI-tell check (em dashes), cover-the-title thumbnail test. | 3XIGcM7VICc, FHsY924cEAk | MISSING | P3 |
| Voice regression cases | Noise, spelled alphanumerics, affect, multi-step tools, relative dates, a transcript harness. | Qt3zMBH-FNg, UCKLHU5AkEM, G9Ho8n4lD6I, zWLZ3bVVwD8 | MISSING | P2 |
| Known-answer vision checks | A physical prop or a known-object ID question. | UCKLHU5AkEM | MISSING | P3 |
| Structured output field hygiene | Absolute dates and explicit NA. | zWLZ3bVVwD8 | PARTIAL | P3 |
| Long-horizon drift test | Test multi-day drift and track unattended duration and interventions. | AO5aW01DKHo, NDeyhGnNECc | MISSING | P2 |
| Decision-point replay and open-ended bucket | Freeze past sessions at decision points and compare with Evens's choice. Score vague tasks separately. | NDeyhGnNECc | MISSING | P3 |
| Live reproduction as proof of learning | Signal train loop: reproduce one demonstrated task, graded separately. Observable pass conditions. | SIGNAL-TRAIN-LOOP.md, NHFbAg2b54U | MISSING | P2 |
| Recap artifact and dated run summary | One page linking every deliverable, plus a dated output and summary. | R0qF17BVl9w, zyvdl__Ywfk | PARTIAL | P2 |
| Check against an independent result or real outcome | A pivot-table answer, or the outcome after it resolves. | kOKavHnlPik, I7mpF7_pnPM | MISSING | P3 |
| Retest capacity-blocked projects | Keep a blocked-by-model list and retest when the model roster changes. | 3QclAjmu5Tw | MISSING | P3 |
| Cache hit rate as an SLO | Track cache-read share and flag drops. | 6cEQEba0i2A | PARTIAL | P3 |
| Promote or demote automation layers | Demote LLM steps that the run logs show are deterministic. | 4OOS96i2gfI | MISSING | P3 |
| Games as a stress-test bed | A sandbox project whose complexity grows freely. | eecUhBpTz_g | MISSING | P3 |
| Sales call feedback analyzer | Rubric critique of a rep's call. | 0YXjEzFfft8 | NOT_FOR_JARVIS | P3 |
| Two-week QA (internal, then client) | Client delivery QA phases. | HNKlFTd1maM | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Prove-done gate (PARTIAL, P0).** Jarvis can call `done` today on its own summary.
   - Make `done` require an `evidence` field: an artifact path, a fresh screenshot id, or a read-back result (sent/drafts count, file hash, page text).
   - For each tool class, store the expected side effect and run the matching read-back automatically before `done`. Examples: `files` re-reads the file, `safari` re-snapshots the target page, `mcp` makes a get-call on the written object.
   - If the read-back does not match, write OBSERVED as a miss and continue or ask_owner. Never report done.
   - Add a regression fixture: an action that "succeeds" but writes nothing must not end in done.
2. **Independent verifier before done (MISSING, P1).**
   - Add a read-only `verify` step. Jev routes it to a different provider than the builder.
   - Give the verifier the job card's done-check, the evidence bundle and the last-known-good state. Give it no builder plan or chat history.
   - It returns a GRADE record (BUILDER / VERIFIER / HYPOTHESIS / MISS / GRADE). Jarvis reports the verifier's grade, not its own.
   - After two failed fix rounds, escalate to Evens with ask_owner.
3. **Guardrails on text Jarvis reads and writes (MISSING, P1).**
   - Score Safari snapshot text and fetched pages with an injection classifier before they enter the operator loop.
   - Strip or quarantine the text when the score is above a threshold tuned on a small fixture set.
   - Apply a URL allowlist and HTTPS-only check before `open` or a click on a link taken from untrusted content.
   - Run a PII and secret scan on every file Jarvis writes and on every screenshot it keeps. Report type and location only.
   - Keep a fixture file with password lines, key-shaped strings and known injection strings, and run it whenever a guard changes.
4. **Golden set plus tool round-trip test behind Jev routing (MISSING, P1).**
   - For each task class, store about 10 to 20 real past jobs with expected outcomes. Grow the set before trusting close scores.
   - Before any model or provider joins a Jev pool, run a harmless multi-hop tool call: shell read, then file write, then read-back. Fail the provider on a missing required field such as thought signatures.
   - Rerun the golden set on every pool or prompt change. Record correctness, cost, refusals, and median and mean latency per row, with the responding model id.
5. **Structured trace with per-step verify cards (PARTIAL, P1).**
   - Write one JSONL row per tool call: job id, model id, tool, args (secrets redacted), duration, tokens, outcome or error.
   - For computer and safari actions, add EXPECTED, OBSERVED and COMPARE, and capture a screenshot on any mismatch.
   - Route every error to one error log, with the job, step and message.
   - Use this trace as the input for the verifier (item 2) and for failure-to-regression patterns, so procedural memory learns from misses as well as finished jobs.

## Signal ingestion and research

This family covers how a signal (a YouTube video, an X post or clip, a bookmark, a repo, an article) becomes raw evidence and then reusable knowledge. It also covers research habits Jarvis should follow when it answers questions from the web.

Most of the 305 raw rows describe one practice that the research desk repeated across dozens of packets:
1. Pull captions with yt-dlp.
2. Store `full.txt` unchanged, with a metadata `PACKET.md`.
3. Fill a fixed `LEARNED.md` A-K template.
4. Tag every number UNVERIFIED and every visual step UNKNOWN.
5. Keep disagreements between sources as labelled rows.
6. Map each lesson onto an existing skill, with a list of things never to operate.

I merged those repeats into single rows and kept every source id. Different variants stay separate (frames vs captions, shorts, X clips, bookmarks).

Today Jarvis has `shell`, `web_search`/`fetch`, files, `safari` and procedural memory. It has no signal ingestion of its own, no sub-agents, no skills library and no independent verifier. Most of the ingestion rows are therefore MISSING, and the research-habit rows are mostly PARTIAL: Jarvis could follow them with its current tools, but nothing enforces them.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Caption-only packet ingest | yt-dlp en-orig json3 captions to an unchanged `full.txt` plus a mirror; `PACKET.md` holds metadata, word count and a pointer, with no invented summary | 50 packets (e.g. -6yUeJ3rkvg, 8MEJen0nblQ, jdbOVepEtUE, zWLZ3bVVwD8) | MISSING | P0 |
| LEARNED A-K template | Fixed distillation: source map, atomic knowledge, models, procedures, rules, contrarian, assumptions, questions, connections, future use | ~46 packets | PARTIAL | P1 |
| Per-claim epistemic card | Each claim records evidence status, modality, shown/clicked, failed/retried and speech vs behaviour | -cdexJWN8YA, CB5bG4mvnS0, x-2088007687149601254 +8 | PARTIAL | P1 |
| Caption-honest provenance labels | Visuals, clicks and timestamps are UNKNOWN when only captions were read; no invented clicks | 3TdD8Qv5Tk8, AYsg5gAMWyo, README.md +11 | MISSING | P1 |
| Goal-directed watch with stills | ffmpeg stills at chosen beats, each paired with a ±4s caption window; fall back to the yt-dlp android client on 403 | FFWtxjvW2ts, FiOTrxq9ckM | MISSING | P1 |
| Multi-source X clip ground truth | Tweet text from the fxtwitter API, captions from the source episode, and local ASR on the clip itself, each labelled by source | x-2088007687149601254 | MISSING | P1 |
| Dedupe into existing skills | Map each method to an existing skill, park proposed skill names, write a MERGE file | B4p9O2P2a3c, I7mpF7_pnPM, rMf-JuikR-Q +21 | MISSING | P1 |
| Parallel research fan-out with re-fetch verifiers | Parallel source agents, claim voting, and independent re-fetch of each quote | R0qF17BVl9w, U6k4MeVks_Y, jZgcWCzxh1I | MISSING | P1 |
| Tape-to-practice dry run with separate verifier | Map the tape's vendors to Jarvis's own tools, rehearse in draft mode, and leave the grade to someone other than the builder | workflows/remote-oneshot-vs-local-cookies.md, FFWtxjvW2ts | PARTIAL | P1 |
| UNVERIFIED number tagging | Every $, %, benchmark, betting odd or survey figure is labelled as claimed | ~36 sources | PARTIAL | P2 |
| Speech vs behaviour and failure capture | Log where the claim, title or hook differs from what the demo showed; failures and retries become lessons | ~31 sources | MISSING | P2 |
| Do-not-flatten dissent rows | Link sibling signals by id and keep conflicts as labelled rows | ~45 sources | MISSING | P2 |
| Steal vs operate-never split | Adopt the pattern; keep vendor installs, spend and sends gated | ~27 sources | PARTIAL | P2 |
| Stolen-machine procedure card | Loop, signals, proving example, conditions, operate-never list, and the existing skill that runs it | EthxaDswUFo, Lg5TYWPSg6M +5 | PARTIAL | P2 |
| Shorts and partial sources | Score only the clip that was read, link the long-form id, never fill the gaps | -6yUeJ3rkvg, D-OOsl8C4Ns, xsAOpqjebOo +4 | MISSING | P2 |
| Timestamp-cited atoms as jsonl | Claims cite time ranges and are exported to `atoms/by-video/<id>.jsonl` | lRUpu2-KtGQ, vLlIBT0HSSc | MISSING | P2 |
| Local word-timed ASR | Transcript with word-level timestamps from a local file or URL | RDytbVDzMF4 | MISSING | P2 |
| Four tape outputs and write-flow order | Knowledge, skill, system-upgrade and opportunity outputs kept as separate files, in a fixed order | README.md, x-2088007687149601254 | MISSING | P2 |
| Capability reconstruction card | Goal, observed workflow, tools, guardrails, reproduce step; UNTESTED until confirmed | capabilities/INDEX.md | MISSING | P2 |
| TRAIN vs TRIAGE gate | Train only when `full.txt` and an action trace exist; otherwise file a triage card | SIGNAL-TRAIN-LOOP.md | MISSING | P2 |
| Channel watcher, new item to brief | Check named channels on a schedule; write a structured brief only when there is a new video | UGIZnh6HNLc, 8MEJen0nblQ | MISSING | P2 |
| Pain-now gate and "what, not how" index | Save the link, or run a one-week real-environment trial with a dated keep/kill review | 35WuZxbAY68 | MISSING | P2 |
| Owner-only capped social ingest | Owner's handles only, capped item count, author filter, lookalike accounts listed as not the owner | social/INDEX.md, social/x-snevemoney/PACKET.md | MISSING | P2 |
| Bookmarks sync, topic filter, delta ingest | xurl sync to a file; AI-only cut labelled FACT/INFERENCE/UNVERIFIED; dated delta notes keyed by post id | README.md (x-bookmarks), ai-only.md, social/x-snevemoney-bookmarks-ai/PACKET.md, ingest-20260813.md | PARTIAL / MISSING | P2 |
| Raw inbox ingestion | A file drop, a URL or a web-clipper page lands in `raw/`, then gets ingested and indexed | hQvwMj7IJe4, jdbOVepEtUE | PARTIAL | P2 |
| Primary-source attribution | Quote the vendor's or source's own words; filings rank above social posts and videos | NDeyhGnNECc, lkR6mvqQQlk, upgrades/nate-82/wealth-manager.md | PARTIAL | P2 |
| Cited research, drop unsourced numbers | Prompt against hallucination, spot-check claims, use only sourced figures | Qt3zMBH-FNg, RDytbVDzMF4 | PARTIAL | P2 |
| STORM lenses and contradiction pass | Five contrasting expert lenses, a contradiction map, then a check for the missing seat | Tj3018n5MVg | MISSING / PARTIAL | P2 / P3 |
| Research loop then screenshot-verified build | Gather sources until there is enough coverage, then build and iterate with a screenshot stop condition | EuzYhzB0vbI | PARTIAL | P2 |
| Repo ingest with license gate | Read README and scripts, record licenses, extract the pattern only, never clone AGPL code | github-jaredrhod-fullstack-agent | PARTIAL | P2 |
| Operator-heard phrase verification | Search all source texts for a phrase Evens heard; report found or not found and keep it labelled | x-2088007687149601254 | PARTIAL | P2 |
| Search-then-read (two pass) | Cheap discovery search first, then full-text fetch for the chosen topics only | hN58VkYLie4, pxzo2lXhWJE | HAVE | P3 |
| Docs as markdown, PDF/HTML to text, vendor gallery check | Fetch docs or convert files before reasoning; check the vendor's own examples | irg-2IfAjpo, jdbOVepEtUE, EiHVBPyvTiE | HAVE | P3 |
| News-reasoning habits | Scenarios side by side, stats with their sample, motive line, referee test, score past predictions | NDeyhGnNECc, lkR6mvqQQlk, brB-hSiV2iU, iIfOprq2kCM, q5lg3npxjAc, CvA8-aScqio, dYrrEKXtttk | PARTIAL / MISSING | P3 |
| Classify tape type | Method vs promo vs commentary vs news vs bio; extract "no method" when there is none | Q8aqkHi5qY4, S2ME69hra-k, lkR6mvqQQlk, 3QclAjmu5Tw | MISSING | P3 |
| Other research tools | Fixed-niche query, self-teach guide, reuse-first search, X-shaped research, Perplexity/Grok split, Apify scrape, waterfall lookup, competitor SOP, branding scrape, audience pain mining, topic monitor, allow-listed search | see methods list | PARTIAL / MISSING | P3 |
| Last-mile and library items | THINK/BEHAVE/TRICKS/USE, provenance backfill, tape workflow index, autoresearch next-row pick, creator cross-map, true-read themes, IG public profile, proofreading generated drafts | see methods list | MISSING / PARTIAL | P3 |

### Top 5 to build next

1. **Signal packet ingest (P0, MISSING)**
   - Add one `ingest_signal(url)` job inside the existing operator loop, run with the shell tool. Do not add a new scheduler or daemon.
   - For YouTube: `yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs en-orig,en --sub-format json3`. Flatten to `packets/<id>/full.txt` with a byte-identical mirror at `transcripts/full.txt`, and keep the raw json3.
   - Write `PACKET.md` with id, URL, title, channel, kind, duration, word count, upload and ingest dates, and "caption-only, no invented summary".
   - Raw files are write-once. Jarvis says `done` only after the files exist and the word count is above zero.
2. **Caption-honest labels plus goal-directed frames (P1, MISSING)**
   - Every extracted step defaults to modality=speech and visual/click=UNKNOWN.
   - When Evens wants a method copied (the live-match rule), download the 720p source. Retry with the yt-dlp android client on a 403.
   - Pick beats from the transcript and pull ffmpeg stills at those timestamps. Build a contact sheet with a still / cue / spoken table, and only then mark a step "shown".
3. **Parallel read-only research with independent re-fetch verification (P1, MISSING)**
   - Add parallel read-only tool calls first, capped at 3 streams under the rules.
   - Fan out by source or angle. Merge the claims.
   - Run a separate verifier pass that re-fetches every quoted URL and drops any quote it cannot find. That same verifier becomes the independent check before `done`.
4. **Skills library with a dedupe-before-mint step (P1, MISSING)**
   - Load `SKILLS_INDEX.md` into the job context.
   - Before Jarvis stores a new procedure from a signal, search the index. If a skill covers it, write a MERGE note (skill, why it is not new, dissent). If none does, park the proposed name.
   - A new skill needs 2+ independent sources and Evens's OK.
5. **X ingestion: clip ground truth and bookmarks (P1, MISSING / PARTIAL)**
   - Read the existing `~/.grokbot/x-bookmarks.json` instead of calling the live API.
   - For a clip, fetch the tweet text via the fxtwitter API, find the source episode and pull its captions for the matching window, and run local ASR on the clip file. Label each by source.
   - Apply the owner/author filter and write a delta note keyed by post id. Never route around an auth wall: hand login walls to Evens.

Not checked: which ingest scripts already exist on the Mac. HAVE/PARTIAL grades come from the harness description, not from a live run.


## Workflows and automation

This family covers how an agent turns a repeated request into a reliable procedure. It covers triggers and wake-ups, job ledgers, polling, approval gates, draft-not-send, verification, scheduling and the order in which things get built. 273 raw methods from about 100 sources merged into 103 methods. Most of the n8n, Vapi and Modal material is a general pattern that Jarvis can apply to its own loop. The sales and outreach items are NOT_FOR_JARVIS because of the Building-mode lock. Each method is graded against the Jarvis harness as of 2026-10-16. P0 means it blocks Jarvis today on Evens's Mac or browser.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Hard-step gate on every tool | Stop at send/pay/deploy/book/publish/delete, write BLOCKED + why, ask Evens | workflows/api-then-macro-then-vision.md, workflows/human-gesture-retriever.md, workflows/4c-default-tab-key-ring-bike-skill.md, 7siRW0My05o, R0qF17BVl9w | PARTIAL (Safari only) | P0 |
| Durable job ledger keyed by stable IDs | Carry trigger IDs, update by key not row, status transitions, survives reboot | KGXFkUlBHxw, AYsg5gAMWyo, HN0oWxbF2bM, y-cq_Qo4zVo, bxGE_LXPyAU, QCjMBOEhpLE, eecUhBpTz_g | MISSING | P0 |
| Draft-not-send for outbound | Draft in-thread with recipient filled; Evens sends | HN0oWxbF2bM, pxzo2lXhWJE, vFepZE_wrfg, lRUpu2-KtGQ, tFFKuq2t0rI, zWLZ3bVVwD8, jBanaNBY-sM, workflows/dry-runs/specialist-handoff-2026-08-14/DRAFT.md | HAVE (Safari) | P0 |
| Manual replay by record ID | Re-run a skipped or failed item by its ID | KGXFkUlBHxw | MISSING | P1 |
| Verify after write | Re-read the destination or state before saying done | QCjMBOEhpLE, CB5bG4mvnS0, mPflFTQUCGk, 5p5cV0yVDvQ | MISSING | P1 |
| Self-check before showing Evens | Separate checker or proof block; Evens reviews V2, not V1 | EuzYhzB0vbI, jdbOVepEtUE | MISSING | P1 |
| Job card with checkable stop | Goal, scope, must-not, DONE-CHECK, CAP, COST, STOP-KIND | R0qF17BVl9w, social/x-2088359756096532965/PACKET.md, workflows/dry-runs/dark-factory-2026-08-14/PRD.md, EuzYhzB0vbI | PARTIAL | P1 |
| Classify the wake primitive | Manual / event / schedule; webhooks over polling; one procedure, many triggers | 8QQ_INxAhRs, 27Y44JYXZJ8, lRUpu2-KtGQ, ehg4fhydTgs, jdbOVepEtUE, upgrades/nate-82/CLUSTER-ops.md, 7siRW0My05o | MISSING | P1 |
| Scheduled local routine | Self-contained prompt runs a named skill in a fresh session on a cadence | 3TdD8Qv5Tk8, RzLV8sfFdMM, ZRb7D6R64hM, vfWTyEreOEc, xJ5oz63mIec, gb5TlGw6Uks, CB5bG4mvnS0, Ek1NBfnnTH0, ehg4fhydTgs, lRUpu2-KtGQ | MISSING | P1 |
| Async job poll loop | Task ID, wait, check state, success/failed/timeout branches, attempt cap | AYsg5gAMWyo, Vm8QOo9MiC4, KGXFkUlBHxw, jBanaNBY-sM, 4OOS96i2gfI | PARTIAL | P1 |
| Self-heal in session, then freeze | Patch the tool, rerun, write the lesson into the SOP, freeze before scheduling | 3GAxd90fEE4, tDGiWn0flK8, upgrades/nate-82/forge.md, vFepZE_wrfg | PARTIAL | P1 |
| Prove it is live | Active state, production endpoint, listener membership, one real end-to-end run | HN0oWxbF2bM, tFFKuq2t0rI, zWLZ3bVVwD8, UGIZnh6HNLc, PQBYZQqan2g | PARTIAL | P1 |
| Inbox triage, never reply | Full body, fixed buckets, label/draft/notify/file only | HN0oWxbF2bM, upgrades/nate-82/communications-manager.md, jdbOVepEtUE, lRUpu2-KtGQ | PARTIAL | P1 |
| Sanitize in, check out, pass is not send | Deterministic redaction before model calls; a failed check halts and notifies | NQhsLVmuItA, workflows/law-adj.md | PARTIAL | P1 |
| Saved procedures / prompt packs | Repeated prompts become named, loadable procedures | ZRb7D6R64hM, gt8k4bA01Mo, 4OOS96i2gfI | PARTIAL | P1 |
| Approval gate before costly generation | Yes/no before generating; declined is a terminal status; generating is not sending | -Q_P7HFydZk, KGXFkUlBHxw, upgrades/nate-82/product-gtm.md | HAVE | P2 |
| Capture split from generation | Always log cheaply; generate in a separate gated step | -Q_P7HFydZk, KGXFkUlBHxw, upgrades/nate-82/product-gtm.md | PARTIAL | P2 |
| End-of-job receipt plus ledger status | Short receipt, terminal status, clear pending triggers | KGXFkUlBHxw, bxGE_LXPyAU | PARTIAL | P2 |
| Long loops need a scripted metric | /goal-style loop only when success is machine-checkable | U6k4MeVks_Y, ZAaxx3qyT8g, brB-hSiV2iU, workflows/plan-mode-objective.md | MISSING | P2 |
| Expiry on every recurring job | Cadence or event with a hard stop, not 24/7 | EuzYhzB0vbI, upgrades/nate-82/day-planner.md, gb5TlGw6Uks, xJ5oz63mIec | PARTIAL | P2 |
| Bounded poll worker | Poll only where there is no webhook, no more than every 15 min, quiet when empty | 27Y44JYXZJ8, UGIZnh6HNLc, hN58VkYLie4 | MISSING | P2 |
| Run once, watched, before scheduling | Setup interview, connector check, sample run, overkill test | PQBYZQqan2g, upgrades/nate-82/CLUSTER-ops.md, upgrades/nate-82/publishing-engine.md, jdbOVepEtUE | PARTIAL | P2 |
| Session-scoped timed loop | Create/list/delete timers; tear down after demos | vfWTyEreOEc, xJ5oz63mIec, RLjaUES9P8A, gb5TlGw6Uks | PARTIAL | P2 |
| Run log, score, alert on flag | Log every run, alert only on a structured found/failed flag | U6k4MeVks_Y, Vb1SwBAn9cQ, ehg4fhydTgs | MISSING | P2 |
| Report real counts, offer options | When a target can't be met, stop and offer choices | 3GAxd90fEE4 | PARTIAL | P2 |
| Steer stuck runs | Compare to baseline, check file locks, ask one specific question | 3TdD8Qv5Tk8 | PARTIAL | P2 |
| Needs-input is a stop | Dialogs, admin prompts and approvals halt the run | upgrades/nate-82/hitl-operator.md | HAVE | P2 |
| Five-field approval card | ACTION / WHY / AGENT / RISK / REVERSIBILITY on each draft | upgrades/nate-82/hitl-operator.md | PARTIAL | P2 |
| Observe pane | One board: working / needs-input / done, with the artifact opened before approval | upgrades/nate-82/CLUSTER-gtm.md | PARTIAL | P2 |
| Trust ramp | Supervised, then watched, then autonomous; Evens promotes | 0WDkwMxj13s, 3TdD8Qv5Tk8, ZRb7D6R64hM, 8QQ_INxAhRs | MISSING | P2 |
| Build disabled, promote on OK | Keep local or inactive until approved | 3TdD8Qv5Tk8, pxzo2lXhWJE | PARTIAL | P2 |
| Build against captured real output | Fixtures, pinned data, mock payloads, inspect nested fields | a5sJNwfZ528, pxzo2lXhWJE, tFFKuq2t0rI, bxGE_LXPyAU, BO-jFbN4p8Y, HN0oWxbF2bM | PARTIAL | P2 |
| Check generated workflows and code | Check against real responses; lint deprecated nodes and missing credentials | a5sJNwfZ528, Vb1SwBAn9cQ, TDHFkKSTJ30 | PARTIAL | P2 |
| Name the stack in generator prompts | Trigger / source / transform / destination / model / format | TDHFkKSTJ30, a5sJNwfZ528, rXpHzWXjHrw | PARTIAL | P2 |
| Wireframe and approve before building | Step map plus plan approval before any nodes | BO-jFbN4p8Y, HN0oWxbF2bM, 9mqsVK6Iqoc, bxGE_LXPyAU, TDHFkKSTJ30, RLjaUES9P8A | PARTIAL | P2 |
| Map the process to atomic steps | Automate vs keep-human labels; mirror the owner's own loop | a5sJNwfZ528, jdbOVepEtUE, diY71x7GUjI, rMf-JuikR-Q, RzLV8sfFdMM, eecUhBpTz_g | PARTIAL | P2 |
| Outcome request to written brief | Ask only questions that change the result; what / how today / win | 3GAxd90fEE4, 8ktcSaSTvxk, pbrln2TVeh4, tFFKuq2t0rI | PARTIAL | P2 |
| Deterministic first | Scripts and templates before model calls; linear when the order is fixed | 8ktcSaSTvxk, 7siRW0My05o, 4OOS96i2gfI, HN0oWxbF2bM, jdbOVepEtUE, bxGE_LXPyAU | PARTIAL | P2 |
| Cheap classifier router | Fixed categories, permission set per route | 4OOS96i2gfI, HN0oWxbF2bM, 9mqsVK6Iqoc | PARTIAL | P2 |
| Lookup before create | Check existence; split create vs update | 7siRW0My05o, glM8godEcic, y-cq_Qo4zVo | PARTIAL | P2 |
| Scheduling tools: read vs write | Availability is read; booking is held; read back details; log the event ID | -cdexJWN8YA, y-cq_Qo4zVo, glM8godEcic, upgrades/nate-82/communications-manager.md | PARTIAL | P2 |
| Lookup ID, update, verify | Task updates from chat with a confirmed state change | 5p5cV0yVDvQ, mPflFTQUCGk | PARTIAL | P2 |
| Small owned automations as named tools | Expose 1-3 step workflows where Evens already works | 5p5cV0yVDvQ, zWLZ3bVVwD8 | PARTIAL | P2 |
| Slice then draft | Fetch the contact's keyed record before drafting | upgrades/nate-82/lead-hunter.md, upgrades/nate-82/communications-manager.md | PARTIAL | P2 |
| Resolve file, then contact, then draft | Chain lookups, fill the signature, stop at a draft | jBanaNBY-sM | PARTIAL | P2 |
| Task board as agent inbox | Status change triggers work; result written back to the item | 27Y44JYXZJ8, UGIZnh6HNLc, hN58VkYLie4, 8MEJen0nblQ | MISSING | P2 |
| Phased spec with handoffs | Fresh session per phase, handoff file, review before merge | RzLV8sfFdMM, eRS3CmvrOvA, iTY8Q449YNQ | MISSING | P2 |
| Feedback feeds the next run | Same-context revisions, a feedback file, corrections become rules | 0YXjEzFfft8, TDHFkKSTJ30, R0qF17BVl9w, pbrln2TVeh4, jdbOVepEtUE | PARTIAL | P2 |
| Compile a procedure from fragments | Classify, decompose, coverage map, support/dissent ids | workflows/agency-delivery.md, fragments/INDEX.md, workflows/4c-default-tab-key-ring-bike-skill.md | MISSING | P2 |
| Folder contract | Read the profile first, templates read-only, outputs folder | ZRb7D6R64hM | PARTIAL | P2 |
| Replace invented values | Swap placeholder or made-up config for real assets before running | tDGiWn0flK8, zWLZ3bVVwD8, jBanaNBY-sM | PARTIAL | P2 |
| Normalize and gate before billed calls | Canonicalize input, log rejects, don't retry them | BO-jFbN4p8Y | PARTIAL | P2 |
| Finished is not succeeded | Check the reason field before trusting a result | BO-jFbN4p8Y | PARTIAL | P2 |
| Intake record | Fixed fields + summary + timestamp per session | zWLZ3bVVwD8, D-OOsl8C4Ns, HNKlFTd1maM | PARTIAL | P2 |
| Brief routines to Evens only | Morning inbox/calendar buckets, weekly digest, send held | 7siRW0My05o, lRUpu2-KtGQ, U6k4MeVks_Y, gb5TlGw6Uks, jdbOVepEtUE | MISSING | P2 |
| Pre/post-meeting brief | Internal research brief from calendar or transcript | Vb1SwBAn9cQ, diY71x7GUjI | PARTIAL | P2 |
| Notes and mail to tasks | Route action items into Evens's existing task store | lRUpu2-KtGQ | PARTIAL | P2 |
| Watched-folder ingest | Ingest the exact file named by the event | Fu6vOfzFmcw | MISSING | P2 |
| Human-approved ingest batches | Weekly batch with OK; recurring pulls, no always-on sync | DTCyvo6cC54, Ek1NBfnnTH0 | MISSING | P2 |
| Sheet/CSV job queue | Status column claims rows, one ready row at a time | AYsg5gAMWyo, xn6Z5PYyAIE, Vm8QOo9MiC4 | PARTIAL | P2 |
| Scheduler realities | Jitter, expiry, catch-up bursts, DST guard | xJ5oz63mIec, gb5TlGw6Uks | MISSING | P3 |
| Cloud routine for Mac-off jobs | Schedule/API/GitHub-triggered cloud run | PQBYZQqan2g, ehg4fhydTgs, jdbOVepEtUE, xJ5oz63mIec, ZRb7D6R64hM | NOT_FOR_JARVIS | P3 |
| Deterministic script hosting | Frozen script on Modal/trigger.dev, one hardcoded destination | AO5aW01DKHo, 8QQ_INxAhRs, jdbOVepEtUE, xJ5oz63mIec, vFepZE_wrfg, UGIZnh6HNLc | PARTIAL | P3 |
| One event per run | Keep the last item, queue the rest | KGXFkUlBHxw, upgrades/nate-82/product-gtm.md | PARTIAL | P3 |
| Local stand-in trigger, labeled | Form or fixture trigger next to the documented production trigger | -Lo_SlSgtnA, BO-jFbN4p8Y, bxGE_LXPyAU | PARTIAL | P3 |
| Pick the first automation from repeated work | Hours x safe-if-wrong, one task at a time | 0YXjEzFfft8, 3TdD8Qv5Tk8, ZRb7D6R64hM, eFOTQpbGcy8, pbrln2TVeh4 | PARTIAL | P3 |
| Measure time saved | Baseline vs assisted, one KPI, list the remaining judgment steps | 0YXjEzFfft8, jdbOVepEtUE, 8ktcSaSTvxk | PARTIAL | P3 |
| Timeboxed ugly prototype | Spec + done, one-platform build, short demo | 3XIGcM7VICc, w9-gfaV5vlM | PARTIAL | P3 |
| Strip attribution footers | Turn off platform footers on drafts | HN0oWxbF2bM, bxGE_LXPyAU, tFFKuq2t0rI, zWLZ3bVVwD8 | PARTIAL | P3 |
| Check source-system constraints | Availability windows and limits before blaming the model | -cdexJWN8YA | PARTIAL | P3 |
| Follow-ups reread the thread | Resolve pronouns from item context | UGIZnh6HNLc, hN58VkYLie4 | PARTIAL | P3 |
| Issue-queue factory tick | Labels hold state; fix, then review, then build, then triage | eecUhBpTz_g | MISSING | P3 |
| Phase arc with try-to-kill | Viability first, red-team phase, orchestration as a floor | R0qF17BVl9w, iTY8Q449YNQ | MISSING | P3 |
| Minimal prompt, grow on failures | One rule per observed failure | 7UNsK9LoORo | PARTIAL | P3 |
| SOP-grade prompt | Role, context, rules/negatives, format, proof | 0YXjEzFfft8, jdbOVepEtUE | PARTIAL | P3 |
| System slot vs user slot | Stable rules in system, payload in user | TDHFkKSTJ30 | PARTIAL | P3 |
| Delimit bundled documents | Labeled separators between samples | 0YXjEzFfft8 | HAVE | P3 |
| Hand off by artifact path | Each step returns path/link + status; the next step takes it as input | 0YXjEzFfft8, 7UNsK9LoORo, e18sdZLwP7o, jBanaNBY-sM, CB5bG4mvnS0 | HAVE | P3 |
| Capped backlog closed with proof | Adopted methods leave the queue only when wired or killed | REPASS-QUEUE.md, IMPLEMENTATION_MAP.md | MISSING | P3 |
| Encode model output for payloads | JSON-encode/sanitize before HTTP bodies | AYsg5gAMWyo | PARTIAL | P3 |
| JSON output matching tool fields | Model returns fields the next tool takes | bxGE_LXPyAU, Vb1SwBAn9cQ, pxzo2lXhWJE | PARTIAL | P3 |
| Resource IDs from source, state locale | Copy IDs from the dashboard or API; note assumptions | BO-jFbN4p8Y | PARTIAL | P3 |
| Name incoming files | Save at once, ask or propose a meaningful name | 7UNsK9LoORo, TWvjqpk3uSQ, IlNwjnIzrOo | PARTIAL | P3 |
| Specialist prompt-writer step | Separate cheap step writes media prompts | 7UNsK9LoORo | MISSING | P3 |
| One writer per memory store | Narrow writers so updates don't clobber each other | 7siRW0My05o | MISSING | P3 |
| Two specialists, one-sentence handoff | Flagger / drafter / done; transport-aware send hold | workflows/specialist-handoff.md, workflows/dry-runs/specialist-handoff-2026-08-14/DRAFT.md, IlNwjnIzrOo | MISSING | P3 |
| Idempotent chase with escalation | Status + due dates, act once, escalate after one nudge | bxGE_LXPyAU | MISSING | P3 |
| Planning vs production routines | Ideate job and generate job linked by a status ledger | xn6Z5PYyAIE | MISSING | P3 |
| Route and log media jobs | Route by model field; log prompt/model/id/path/status | AYsg5gAMWyo, xn6Z5PYyAIE | PARTIAL | P3 |
| Preconditions before external action | e.g. sharing state before a post | jBanaNBY-sM | PARTIAL | P3 |
| Config table with allowlist | Edit models/prompts per step; validate names | lcNN3X9gXls | PARTIAL | P3 |
| One-way mirror to human sheet | Clear and rewrite secondary daily | lcNN3X9gXls | PARTIAL | P3 |
| n8n data-table hygiene | Native tables, check types, IDs don't reset | QCjMBOEhpLE | NOT_FOR_JARVIS | P3 |
| Importable source + credentials checklist | Hand off JSON plus env var names | Vm8QOo9MiC4 | PARTIAL | P3 |
| Set defaults once | Channel-level upload defaults | FHsY924cEAk | PARTIAL | P3 |
| Prompt in a recurring calendar block | Procedure attached to the time block (calendar change needs OK) | 0YXjEzFfft8 | PARTIAL | P3 |
| Spreadsheet insight report | API pull classified into a tabbed workbook | 3TdD8Qv5Tk8 | PARTIAL | P3 |
| Multi-agent research-to-draft pipeline | Discover, plan, research per topic, writers, editor, draft | pxzo2lXhWJE, lcNN3X9gXls | MISSING | P3 |
| Context reset on long loops | Scheduled clear or fresh session, check schedules survive | xJ5oz63mIec | HAVE | P3 |
| Lowest workflow rung | Sequential before teams or headless | simon-scrapes-dossier.md | HAVE | P3 |
| Comment-reply loop | Transcript-grounded public replies | xJ5oz63mIec | NOT_FOR_JARVIS | P3 |
| Research-and-draft outreach DB | Researched outreach drafts | ECfusvK5tEU, HNKlFTd1maM, upgrades/nate-82/lead-hunter.md, zyvdl__Ywfk | NOT_FOR_JARVIS | P3 |
| Lead qualification funnels | Voice-call qualify, lead scoring, lead magnet, Clay campaigns | -Lo_SlSgtnA, TDHFkKSTJ30, bX_stJ_Eiog, zyvdl__Ywfk | NOT_FOR_JARVIS | P3 |
| Sales quote agent to CRM | Inquiry, quote, CRM writeback | D-OOsl8C4Ns, HNKlFTd1maM | NOT_FOR_JARVIS | P3 |
| Role-bot fleets | Persistent role agents with A2A | riley-brown-dossier.md | NOT_FOR_JARVIS | P3 |
| Tool ladder Zapier to Claude Code | Learning path | diY71x7GUjI | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Durable job ledger and resume after reboot (P0, MISSING).** The Mac restarted today, so this is a live gap.
   - Write one ledger row per job: job id, goal, trigger ids, status, last step, artifact paths and a pending ask. Use a local file under Jarvis state and append it on every step transition.
   - Update rows by job id, never by position.
   - On startup, read the rows that are not terminal. Show them to Evens as resumable, and resume only on his line.
   - Add a "replay <job id>" entry that re-runs one item through the same procedure.
   - Test: kill Jarvis mid-job, restart, and confirm the job comes back with the same artifacts.
2. **Hard-step gate on every tool (P0, PARTIAL).** Today only Safari holds send/pay/delete.
   - Put one verb classifier in front of shell, MCP and computer actions: send, pay, deploy, book, publish, delete, push.
   - On a hit, write BLOCKED + why with the five-field card (action / why / agent / risk / reversibility), then call ask_owner and resume on his yes.
   - Add a deterministic secret and PII redactor before any model call.
   - Regression tests: a labeled pass/fail set of commands and MCP calls.
3. **Verifier before done (P1, MISSING).**
   - Each job card names a DONE-CHECK: files that must exist, a state to re-read, a URL to load.
   - Before `done`, a separate cheap-tier call re-reads the destination (file, page, task state) and grades it against the check. It must not reuse the builder's own transcript.
   - A failed check returns the job to work, with the reason logged.
   - For anything claimed live, also require active state, the production endpoint and one real end-to-end run.
4. **Wake and schedule layer (P1, MISSING).** Under rule 19, inspect the existing schedulers (launchd, scheduled-tasks) before adding anything.
   - Tag each procedure as manual, event or schedule, and prefer webhooks.
   - A new routine runs once while Evens watches, starts as notify-Evens-only, carries an expiry, and polls no more often than every 15 minutes.
   - Every run writes a run-log row and alerts only on a structured found or failed flag.
   - Before a planned shutdown, list the schedules and pause any that would cause a harmful catch-up burst.
5. **Async poll standard plus self-heal writeback (P1, PARTIAL).**
   - Give background jobs one helper: submit, record the task id in the ledger, wait, check state, and branch on success, failed or timeout, with a maximum attempt count and an escalation on failure.
   - When a tool script fails, patch it, rerun it, and append the fix to that procedure's SOP in procedural memory.
   - Freeze the script before it is ever scheduled.

Grades are against the 2026-10-16 harness description, not a live run. None of these methods counts as built until a live run matches its source (rule 13a).

## Business and other methods (family: business-other)

Most of this family comes from consultants and agency owners describing how they find, price, scope and sell AI automation work. Evens is in BUILDING mode, so the selling, outreach, ads and pricing playbooks are kept as reference rows (NOT_FOR_JARVIS). Many sources repeat the same operating habits, and those habits do apply to Jarvis: check the goal and the constraint before building, write down a baseline number, scope the job with a checkable definition of done, have someone else check the result, report the outcome rather than the tool, keep sensitive data away from cloud models, and turn each incident into a rule. The input held 211 raw rows, and many were duplicates. They are merged into the 55 methods below, and every source id is kept. Dollar figures and percentages from the tapes are UNVERIFIED and are not repeated here.

Status is graded against Jarvis's harness as of 2026-10-16. P0 would mean the method blocks Jarvis from doing what Evens asks on his Mac or browser today. No method in this family is P0.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Baseline-then-receipt for every automation | Write the number to move before building, then report before/after | -zL_trhnQaI, vY0EzTP-7EA, 3XIGcM7VICc, iIfOprq2kCM, nate-82/consultant.md, nate-82/career-strategist.md, w9-gfaV5vlM, vFepZE_wrfg, eFOTQpbGcy8, HNKlFTd1maM, vLlIBT0HSSc | PARTIAL | P1 |
| Checkable done statement + independent check | Each terminal condition states an input, an observable output and a time bound, and someone other than the builder checks it | Lg5TYWPSg6M, w9-gfaV5vlM, nate-82/consultant.md, nate-82/product-gtm.md, 8MEJen0nblQ, vLlIBT0HSSc, workflows/fde-career.md | MISSING | P1 |
| Sensitive-data gate + dummy-data sandbox | Flag private data before it goes to a cloud model; experiment on fixtures | jdbOVepEtUE, eFOTQpbGcy8, iIfOprq2kCM, 3XIGcM7VICc, 8MEJen0nblQ, workflows/local-clinic.md | MISSING | P1 |
| Incident to written case study to rule | Contain, notify, write it up, turn it into a guard rule | RzLV8sfFdMM | PARTIAL | P1 |
| Check owned tools / SaaS / plain script first | Don't build an agent when an existing tool or a deterministic script works | 8ktcSaSTvxk, 4OOS96i2gfI, Lg5TYWPSg6M, B4p9O2P2a3c | PARTIAL | P1 |
| Running wins / proof ledger with rollup | Ledger of task, baseline, after and date, plus links-only proof packet | vY0EzTP-7EA, eFOTQpbGcy8, diY71x7GUjI, HNKlFTd1maM | MISSING | P2 |
| Written scope + change requests to v2 backlog | In/out of scope; new asks go to a backlog, not into the current job | HNKlFTd1maM, Lg5TYWPSg6M, w9-gfaV5vlM, nate-82/consultant.md, 8ktcSaSTvxk | PARTIAL | P2 |
| Outcome-bucket / named-pain gate | Each build names its pain and outcome (more customers / worth more / cut cost), or it is dropped | LVAHYV4Xrto, 8C6iCpJ9HPo, wk8KV280fbg, PQBYZQqan2g, FFWtxjvW2ts, 4OOS96i2gfI, -zL_trhnQaI | PARTIAL | P2 |
| Goal / North Star filter + daily X | Rank work against the active goal; side exploration only after the day's deliverable | 0WDkwMxj13s, 35WuZxbAY68, 8MEJen0nblQ, diY71x7GUjI | PARTIAL | P2 |
| Diagnose before prescribe | Find the real problem behind the requested solution before proposing a build | -zL_trhnQaI, 8C6iCpJ9HPo, vFepZE_wrfg, YF0XPMXLHOA, w9-gfaV5vlM, HNKlFTd1maM, nate-82/consultant.md, Pi-m8R068r4, mert-yerlikaya-dossier.md, diY71x7GUjI, eFOTQpbGcy8 | PARTIAL | P2 |
| First bottleneck (pipe / 2x / 5x / front-to-back walk) | Fix the first clog in the flow, then look for the next one | 8ktcSaSTvxk, LVAHYV4Xrto, eFOTQpbGcy8, jdbOVepEtUE, diY71x7GUjI, -zL_trhnQaI | PARTIAL | P2 |
| Deterministic ROI calculator with labeled inputs | Hours x rate x period, payback, error-cost; computed in code, not by the LLM | 8C6iCpJ9HPo, HNKlFTd1maM, Lg5TYWPSg6M, YF0XPMXLHOA, bxGE_LXPyAU, w9-gfaV5vlM, ySl-SyboPa4, nate-82/consultant.md, 8ktcSaSTvxk | PARTIAL | P2 |
| Claim quarantine + labeled contradictions | Creator dollar claims tagged UNVERIFIED; conflicting advice kept as labeled rows with the conditions each applies under | nate-82/CLUSTER-money.md, nate-82/money-desk.md, LVAHYV4Xrto, 8ktcSaSTvxk, S2ME69hra-k | MISSING | P2 |
| Write the procedure before automating; one activity per skill | Turn the existing logic into a spec; split a role into atomic activities | 8ktcSaSTvxk, rMf-JuikR-Q, NHFbAg2b54U | PARTIAL | P2 |
| Mine Evens's repeated work for automation candidates | Watch logs and history for recurring manual steps; propose, never act unasked | rMf-JuikR-Q, bxGE_LXPyAU, B4p9O2P2a3c, CvA8-aScqio, 3XIGcM7VICc, -zL_trhnQaI, iIfOprq2kCM | MISSING | P2 |
| One canonical shared knowledge place | Owners update their docs; others read before asking | 8QQ_INxAhRs, DTCyvo6cC54 | PARTIAL | P2 |
| Feasibility / capacity pass before commit | A separate pass that looks for hidden technical needs and checks bandwidth | HNKlFTd1maM | PARTIAL | P2 |
| Detect self as bottleneck and split work | Flag when Jarvis is the queue and hand parts to other workers | diY71x7GUjI | MISSING | P2 |
| Booking safety: never auto-book, time math in code | Booking stays HITL; time zone and notice periods are computed in code | workflows/local-pro.md, workflows/restaurant.md | PARTIAL | P2 |
| Clarify, restate, quantify (LRP) | Listen, repeat back, then ask for the numbers before acting | w9-gfaV5vlM, Lg5TYWPSg6M, vLlIBT0HSSc, workflows/fde-career.md, -Lo_SlSgtnA | PARTIAL | P3 |
| Outcome-first reporting | Lead with time saved or what is unblocked, not the tool used | 8MEJen0nblQ, YF0XPMXLHOA, wk8KV280fbg, eRS3CmvrOvA, 8ktcSaSTvxk, eFOTQpbGcy8, 3XIGcM7VICc, vLlIBT0HSSc | PARTIAL | P3 |
| Offer-copy lint (no "AI" headline, no category pitch) | Flag category-only wording and outcome-less offers in drafts | workflows/local-clinic.md, workflows/restaurant.md, workflows/exec-coach.md, workflows/owner-coach-fitness.md, x-2088007687149601254 | MISSING | P3 |
| Approval-held lead/qualify drafts | Jarvis prepares the questions and the row; Evens sends | -Lo_SlSgtnA, nate-82/lead-hunter.md, zyvdl__Ywfk, Pi-m8R068r4 | HAVE | P3 |
| Research table with per-claim source + needs-review flag | Every personalization or claim cites its source | zyvdl__Ywfk, -Lo_SlSgtnA | PARTIAL | P3 |
| Read-only availability check, never buy | Check domain or name availability; purchase goes to Evens | R0qF17BVl9w | HAVE | P3 |
| Vision triage of photo intake | Describe the damage and likely cause from attached images | Vb1SwBAn9cQ | PARTIAL | P3 |
| Exact prompt / one sharp question handoff | Give Evens the exact inputs and wording for another tool or a mentor | RzLV8sfFdMM, S2ME69hra-k | HAVE | P3 |
| Decision-memo frames | Historical analogy, payoff-to-defect, verifiable conditions, what won't change | -nG-9vlSkho, CvA8-aScqio, NDeyhGnNECc, 8ktcSaSTvxk | HAVE | P3 |
| Audit artifacts (process map, opportunity matrix, ROI deck) | Assessment deliverables made before any build | liam-ottley-dossier.md, mert-yerlikaya-dossier.md, 8ktcSaSTvxk, tFFKuq2t0rI | PARTIAL | P3 |
| Clean parallel build over legacy rewiring | Stand up a new path instead of retrofitting a tangled one | iIfOprq2kCM | PARTIAL | P3 |
| Prefer compounding (flywheel) tasks | Rank tasks whose value grows with volume above one-off admin | HNKlFTd1maM, nate-82/product-gtm.md | PARTIAL | P3 |
| Label drafts and prototypes honestly | Generated output is a draft; prototypes list their compliance and launch gaps | TDHFkKSTJ30, 7siRW0My05o | PARTIAL | P3 |
| Rubric to reusable generator; template reuse | Turn a repeated scoring or build pattern into a reusable template | 2088359756096532965, B4p9O2P2a3c | PARTIAL | P3 |
| Service ladder (education, audit, project, retainer) | Staged trust and sales funnel | LVAHYV4Xrto, Pi-m8R068r4, vY0EzTP-7EA, 8ktcSaSTvxk, mert-yerlikaya-dossier.md, liam-ottley-dossier.md | NOT_FOR_JARVIS | P3 |
| Inbound from public builds | Post a specific finished build; inbound asks define the sale | 5IM27lbCwjM, HNKlFTd1maM, 8C6iCpJ9HPo, bxGE_LXPyAU, x-2088007687149601254, nate-82/consultant.md, 8ktcSaSTvxk | NOT_FOR_JARVIS | P3 |
| Three-tier pricing with high anchor | Starter/growth/scale; the middle tier is meant to win | HNKlFTd1maM, Lg5TYWPSg6M, LVAHYV4Xrto | NOT_FOR_JARVIS | P3 |
| Cost floor / value ceiling | Price sits between your walk-away cost and the client's value | Lg5TYWPSg6M | NOT_FOR_JARVIS | P3 |
| Hourly only as on-ramp | Bill hourly for the first few projects, then switch to value pricing | Lg5TYWPSg6M, vFepZE_wrfg | NOT_FOR_JARVIS | P3 |
| Keep-alive maintenance retainer | Flat fee covers breakage only; new features are separate | Lg5TYWPSg6M | NOT_FOR_JARVIS | P3 |
| Reduce scope, not rate | Answer sticker shock with a smaller first slice | Lg5TYWPSg6M | NOT_FOR_JARVIS | P3 |
| Price-first shopper red flag | Don't quote before discovery; consider walking away | Lg5TYWPSg6M | NOT_FOR_JARVIS | P3 |
| Close-rate thermometer | A close rate with no pushback suggests prices are low | HNKlFTd1maM | NOT_FOR_JARVIS | P3 |
| Anchor on previous sale (beginner) | Last price plus a bump, with no ROI basis (flag it) | ySl-SyboPa4 | NOT_FOR_JARVIS | P3 |
| Rev-share only with attributable KPI | Performance pricing only with a direct, attributable metric | 8ktcSaSTvxk | NOT_FOR_JARVIS | P3 |
| Proposal opening and measurable-return page | Their now, their goal, why you; return page first | Lg5TYWPSg6M, D-OOsl8C4Ns | NOT_FOR_JARVIS | P3 |
| Niche selection | Filters, a few conversations first, ICP sheet, offline tactics | w9-gfaV5vlM, LVAHYV4Xrto, 8MEJen0nblQ, I7mpF7_pnPM | NOT_FOR_JARVIS | P3 |
| Warm-first outreach | Warm network, then inbound, then cold; templates per group | LVAHYV4Xrto, zyvdl__Ywfk, Pi-m8R068r4, I7mpF7_pnPM, bWhjRLX0jpo | NOT_FOR_JARVIS | P3 |
| No-pitch informational interview / race to 10 nos | Discovery opener; count rejections as data | w9-gfaV5vlM, LVAHYV4Xrto | NOT_FOR_JARVIS | P3 |
| Cold outreach infrastructure and diagnosis | Sender domains, warmup, daily caps; targeting, data and copy checks | zyvdl__Ywfk | NOT_FOR_JARVIS | P3 |
| Free work for proof / enterprise via network | Unpaid build in exchange for posting rights; enterprise comes from brand | x-2088007687149601254 | NOT_FOR_JARVIS | P3 |
| Ads: specific problem + guarantee; winner variants | Problem-and-buyer ad; scale the winning variant | x-2088007687149601254, xn6Z5PYyAIE | NOT_FOR_JARVIS | P3 |
| Offer sprint in one sitting | Tease, thin page, checkout, 48h signal count; GTM rules | workflows/checkout-in-one-sitting.md, I7mpF7_pnPM, david-ondrej-dossier.md, B4p9O2P2a3c | NOT_FOR_JARVIS | P3 |
| Vertical install playbooks | Review-to-book, missed-call book, intake-to-book, list-anneal | workflows/local-clinic.md, workflows/local-pro.md, workflows/restaurant.md, workflows/owner-coach-fitness.md, workflows/industrial-smb.md | NOT_FOR_JARVIS | P3 |
| Audience engagement and lead magnets | First-hour replies, meetup speaking, roadmap lead magnet | FHsY924cEAk, diY71x7GUjI, tFFKuq2t0rI | NOT_FOR_JARVIS | P3 |
| Career path and monetization choices | Consultant vs in-house vs FDE, income branches, playbook maps | -zL_trhnQaI, iIfOprq2kCM, LVAHYV4Xrto, liam-ottley-dossier.md, vLlIBT0HSSc, 3XIGcM7VICc, diY71x7GUjI, 8ktcSaSTvxk, vY0EzTP-7EA | NOT_FOR_JARVIS | P3 |
| Org AI adoption | Catalyst project, enablement, champions, leader-first, not-replacing opener, policy map | 8MEJen0nblQ, diY71x7GUjI, 3XIGcM7VICc | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Independent done-check against a checkable terminal condition** (MISSING, P1)
   - Add a `done_when` field to each job: input, observable output, time bound. Subjective wording such as "works as expected" is rejected at intake.
   - Before `done`, run a separate verifier pass. It should be a different model tier from the builder, with read-only tools. It re-runs the check against the real Mac or browser and stores a fresh screenshot or file path.
   - The verifier may return only MATCH, PARTIAL or FAIL with the artifact path. On anything other than MATCH, the job goes back to the loop or to ask_owner.
   - Add a regression fixture: a job whose output deliberately misses `done_when` must not reach `done`.
2. **Sensitive-data gate before cloud routing** (MISSING, P1)
   - Before any model call that carries file or screen content, scan for secret patterns, `.env*` and key files, PHI and PII markers, and private-vault paths. Report presence only, never values.
   - On a hit, Jev is limited to a local or approved model, or the job pauses with ask_owner. Log the decision in the cost meter row.
   - Experiments that touch private records use fixtures or dummy data by default.
3. **Baseline and receipt fields in job card and procedural memory** (PARTIAL, P1)
   - At intake, capture the baseline (minutes, error count, or "NONE"). If the job claims to save time and has no baseline, ask_owner before building.
   - At close, record the after value next to the cost meter. Write task, baseline, after, date and evidence path to an append-only wins ledger.
   - Add a weekly read-only rollup built from ledger rows only, with no invented totals.
4. **Incident to guard rule or regression test** (PARTIAL, P1; needs hooks)
   - When a job fails, a hold is overridden, or the repetition brake fires, write a short incident note: what happened, why, and the proposed rule.
   - Turn the rule into a pre-tool hook or a regression fixture, proposed to Evens and adopted only on his OK.
   - Link the incident to procedural memory so the same job type loads the guard next time.
5. **Owned-tools / skills check before building** (PARTIAL, P1; needs skills library loading)
   - Index the installed skills, MCP tools and scripts on the Mac into a searchable list.
   - At plan time, search the list for the task. If a match exists, load it, or report it and explain why it is not used.
   - Prefer a deterministic script over an agent when the "why this" check shows no judgment is needed. Record that choice in the job card.

Not checked: whether Jarvis's job card already has fields like these, since the grading is based only on the harness description in the task. Risk: several PARTIAL grades assume prompt-level behavior that has not been verified live.

## Wiring, engineering and architecture

This family covers how an agent system is put together: where it keeps its rules and procedures, how tools are exposed and locked down, how secrets are handled, how APIs and webhooks are wired, how long jobs are polled, and when to use sub-agents, schedules or hosted runners. The sources are mostly YouTube builders (n8n, Claude Code, Codex) plus the fleet's own packets (nate-82 upgrade clusters, dark-factory dry run, product-factory). Many sources say the same few things. The most repeated are: tools are the lock and prompts are not; secrets go in env and never in chat; keep deterministic code at the edges and use the model only for judgment; keep the system in plain files that any harness can run.

Grades are against Jarvis as of 2026-10-16. The harness has one operator loop, shell, files, web, MCP, a computer tool, a Safari tool with held send/pay/delete buttons, Jev tiering, lean context, procedural memory and a repetition brake. It lacks sub-agents, parallel read-only tools, resume after reboot, an independent verifier, a skills library and hooks. No method here is P0. Nothing in this family stops Jarvis from doing what Evens asks on his Mac today. The P1 gaps are safety and reliability gaps.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Lifecycle hooks as guardrails | Pre-tool hooks block dangerous commands and secret paths; post-tool hooks format or log; stop hooks notify | RLjaUES9P8A, ZRb7D6R64hM, xJ5oz63mIec, RzLV8sfFdMM | MISSING | P1 |
| Capabilities, not instructions | Remove send/pay/delete tools. Assume anything reachable will be used. Drafts go to disk and are sent only on Evens's word | 0WDkwMxj13s, 8QQ_INxAhRs, RzLV8sfFdMM, jdbOVepEtUE, upgrades/nate-82/CLUSTER-ops.md, workflows/specialist-handoff.md | PARTIAL (Safari holds; shell is not locked) | P1 |
| WAT: markdown workflows + one-job tools + agent coordinator | SOPs in workflows/*.md, deterministic scripts in tools/, the agent picks and sequences them and patches both after failures | 3GAxd90fEE4, AO5aW01DKHo, tDGiWn0flK8, vFepZE_wrfg | PARTIAL (procedural memory; no skills library) | P1 |
| Description is the routing key | Each tool or skill has a terse one-line when-to-use plus valid enums. The full body loads only when chosen | PQBYZQqan2g, patterns/INDEX.md, QojPKL96Dx4, QCjMBOEhpLE, 9IzGe0BBj_c, jBanaNBY-sM | PARTIAL | P1 |
| Specialist sub-agents under one coordinator | Narrow workers (research, verify, docs) behind a coordinator; fewer tools per worker | AO5aW01DKHo, X80ljdCPM_U, e18sdZLwP7o, pxzo2lXhWJE, jBanaNBY-sM | MISSING | P1 |
| Wiring checks on the real surface | Tools actually attached, one live trigger after deploy, read the execution log, inspect the rendered output | tFFKuq2t0rI, zWLZ3bVVwD8, X80ljdCPM_U | PARTIAL (no independent verifier) | P1 |
| Durable sessions + state backup | Session ID per task, state committed to a private repo, so work survives a dead host | xJ5oz63mIec, RLjaUES9P8A, gb5TlGw6Uks | PARTIAL (idle continue only; no resume after reboot) | P1 |
| Per-worker allow-list, territory, max-turns, no inherited bypass | Each spawned worker gets an explicit tool/MCP list, file territory and turn cap | e18sdZLwP7o, jdbOVepEtUE, upgrades/nate-82/CLUSTER-ops.md, vDVSGVpB2vc | MISSING | P2 |
| ALLOW/DENY/TERRITORY/BYPASS job card | Declare allowed and denied actions and file territory before work | SIGNAL-TRAIN-LOOP.md, workflows/dry-runs/dark-factory-2026-08-14/tickets/T-001-scroll-scrub-wrap.md | MISSING | P2 |
| Pre-run guard bundle for live jobs | Five blocks: checkable stop, touch policy, observe status, sanitize/check, actuation ladder | workflows/CLICK-LIVE-EVENSLUIS-2026-08-14.md | MISSING | P2 |
| Sanitize-in / check-out, secret scan | Redact PII and keys before the model, check output after; pass still waits for HITL | oWdJMJp2HgM, upgrades/nate-82/CLUSTER-ops.md, 27Y44JYXZJ8 | MISSING | P2 |
| Secrets in .env placeholders, human pastes | Agent writes the placeholder, the human fills it, .gitignore is checked, nothing goes in chat | 3GAxd90fEE4, 3TdD8Qv5Tk8, UGIZnh6HNLc, jdbOVepEtUE, vFepZE_wrfg, gb5TlGw6Uks, QojPKL96Dx4 | PARTIAL (rule exists; not enforced in tools) | P2 |
| Permission tiers, earned per workflow | Deny list first, ask/auto rules per action, full access only after watched runs | jdbOVepEtUE, PQBYZQqan2g, 3TdD8Qv5Tk8 | PARTIAL | P2 |
| Event-driven classify, route, verify, learn | Event, context, classify, fixed allowed action per class, execute, verify, update state | 8ktcSaSTvxk, primitives/INDEX.md, upgrades/nate-82/hitl-operator.md | PARTIAL | P2 |
| Rails first, AI last mile | Build the deterministic flow with statuses and escalation first; add the model only at the judgment step | bxGE_LXPyAU, upgrades/nate-82/product-gtm.md, jdbOVepEtUE | PARTIAL | P2 |
| Orchestration shape catalog | Solo, maker-checker, manager+helpers, fan-out/synthesize, classify-and-act, tournament, loop-until-done; name the assignee and combiner | EuzYhzB0vbI, U6k4MeVks_Y, GpSqBjW6hR4 | PARTIAL (solo only) | P2 |
| Sub-agents vs agent teams | Hub-and-spoke by default; debate teams only when a decision needs it (higher cost) | Tj3018n5MVg | MISSING | P2 |
| Harness above agents (workflow engine) | YAML/coded workflow decides when the LLM runs; markdown contracts between workers; run board | cole-medin-dossier.md, RzLV8sfFdMM | MISSING | P2 |
| Deploy chooser: live operator vs scheduled script | Where it runs × how deterministic × machine/session must stay on; deployed scripts do not self-heal | 3GAxd90fEE4, xJ5oz63mIec, ehg4fhydTgs | MISSING | P2 |
| Async submit then poll | Ticket ID, first wait, short retry, dedupe, terminal-state check, max-attempt cap | 7UNsK9LoORo, BO-jFbN4p8Y, Vm8QOo9MiC4 | PARTIAL (background jobs; no standard poller) | P2 |
| Gather, then per-item act (fan-out/fan-in) | Finder task triggers one writer run per item; split and aggregate; retry one item alone | UGIZnh6HNLc, pxzo2lXhWJE | PARTIAL | P2 |
| Off-window tool output | Raw results go to disk; only a short summary enters context | YHk45NEpspE | PARTIAL (lean screenshots only) | P2 |
| Brittle capabilities as typed standalone tools | Subflows or scripts with declared inputs; pass paths/IDs, never bytes | 7UNsK9LoORo, jBanaNBY-sM | PARTIAL | P2 |
| Schema-validated structured outputs | JSON schema on any model step that feeds another step; retry on a schema miss | BO-jFbN4p8Y, bxGE_LXPyAU, pxzo2lXhWJE | PARTIAL | P2 |
| MCP discover, read schema, call, verify | Find the tool, read its fields, call it, check the side effect on the real surface | 5p5cV0yVDvQ | PARTIAL | P2 |
| Webhook event as pointer | Wait briefly, re-fetch the full record by ID, fail closed on missing fields | -Q_P7HFydZk, KGXFkUlBHxw | PARTIAL | P2 |
| No user files to third-party hosts without OK | Data allowlist; no PII to managed indexes; flag public-URL hops; upload ledger | 7UNsK9LoORo, irg-2IfAjpo, vY0EzTP-7EA | MISSING | P2 |
| Harness-agnostic project directory | The folder is the OS; any harness can run it; portability test | -nG-9vlSkho, 35WuZxbAY68, 3TdD8Qv5Tk8, 8QQ_INxAhRs, i4Q8wHZNPBU | PARTIAL | P2 |
| Vendor-outage fallback drill | A tested fallback model/harness for each core loop | 35WuZxbAY68 | PARTIAL (Jev pools; fallback not drilled) | P2 |
| Four Cs in order (context, connections, capabilities, cadence) | Never schedule what is not proven in the lower layers | 0WDkwMxj13s, 8QQ_INxAhRs, jdbOVepEtUE | PARTIAL | P2 |
| Operator habits from a system prompt | Verify recalled facts, stat files before claiming them, attempt then ask one question, own errors | XTBWVVcF3Pk | PARTIAL | P2 |
| Inject current date/time and TZ | Every turn gets the current time and zone; check dates first when scheduling misbehaves | zWLZ3bVVwD8 | PARTIAL (not verified) | P2 |
| Reject or split asks against mission | Check scope and non-goals; push back with a reason or propose a split | eecUhBpTz_g | PARTIAL | P2 |
| Global rules vs stricter unattended rules + mission.md | Always-on rules, plus a stricter file loaded only in autonomous runs | eecUhBpTz_g, workflows/dry-runs/dark-factory-2026-08-14/factory-rules.md | MISSING | P2 |
| Agent-to-agent delegation audit thread | Every handoff is readable by Evens; a "delegated to X" receipt in the reply | PQBYZQqan2g | MISSING | P2 |
| Headless claude -p behind a UI | Background headless runs triggered from buttons or shell | U6k4MeVks_Y | PARTIAL | P2 |
| Agent loop calls deterministic tools | One brain in front; dumb one-job tools behind; no nested LLMs | 8MEJen0nblQ, 4OOS96i2gfI, y-cq_Qo4zVo, zyvdl__Ywfk, 9IzGe0BBj_c | HAVE | P3 |
| Agent node spec card | Name, instructions, history, model, reasoning, tools, output format | -6yUeJ3rkvg | PARTIAL | P3 |
| AI systems pyramid | Use the lowest autonomy level that does the job | jdbOVepEtUE | PARTIAL | P3 |
| AIOS five layers | Context, data, intelligence, automate, build | liam-ottley-dossier.md | PARTIAL | P3 |
| Item-count and collision rules | Last-wins/dedupe/queue for bursts; assert one item before any output step | -Q_P7HFydZk, a5sJNwfZ528 | PARTIAL | P3 |
| Normalize every inbound channel | Voice/text/file/screenshot into one envelope; attachments saved to disk first | 7UNsK9LoORo, KGXFkUlBHxw, jBanaNBY-sM | PARTIAL | P3 |
| Bind routing IDs from the trigger | Session/channel/file IDs set deterministically, not generated by the model | jBanaNBY-sM | PARTIAL | P3 |
| Serialize model text into JSON bodies | Escape or serialize; never string-template model output | 7UNsK9LoORo, KGXFkUlBHxw, Vm8QOo9MiC4 | PARTIAL | P3 |
| Wire APIs from the vendor's curl + docs | Import curl, mark fields required/optional, path vs query params | KGXFkUlBHxw, QojPKL96Dx4, Vm8QOo9MiC4, irg-2IfAjpo | PARTIAL | P3 |
| Pin model and params in the request | Do not trust playground/dashboard defaults; call the API directly when a wrapper lacks a param | QojPKL96Dx4, Vb1SwBAn9cQ | PARTIAL | P3 |
| Model-filled tool parameters, inspect per call | Model writes the query and may split it; trace each call's input | QojPKL96Dx4 | HAVE | P3 |
| Narrow context by key before the model | Lookup/filter rows by unique key; tools for filtered queries | QCjMBOEhpLE | PARTIAL | P3 |
| Compute numbers and dates in code | Arithmetic, booking clock, TZ and notice in code; the model only words it | upgrades/nate-82/wealth-manager.md, QCjMBOEhpLE, workflows/owner-coach-fitness.md | PARTIAL | P3 |
| Templated prompts filled per run | Variables and documents injected per run; lists formatted programmatically; user message built explicitly | BO-jFbN4p8Y, kOKavHnlPik, pxzo2lXhWJE | PARTIAL | P3 |
| Prompts and models as keyed config | Per-task prompt/model in one config; private prompts kept out of shared exports | lcNN3X9gXls, upgrades/nate-82/librarian.md | PARTIAL (Jev tiers) | P3 |
| Run parameters in one config block | Tunables in config files; secrets only in env | TDHFkKSTJ30, vFepZE_wrfg | PARTIAL | P3 |
| Wireframe the flow before building | If-X-do-Y diagram; derive tools and prompt sections from it | pxzo2lXhWJE, y-cq_Qo4zVo | PARTIAL | P3 |
| Update on a unique key | Match on email/ID, never name; refuse when the key is not unique | bxGE_LXPyAU | PARTIAL | P3 |
| One folder per job, scratch apart | Outputs in a job folder; scratch in temp; promote only reusable tools | 3TdD8Qv5Tk8, 3GAxd90fEE4 | PARTIAL | P3 |
| Smallest fix first | Collapse the workflow; check native or existing tools; simple stack | 8ktcSaSTvxk, w9-gfaV5vlM, HNKlFTd1maM | PARTIAL | P3 |
| Named reusable credential | Store a key once as a named credential/env ref; no inline keys | QojPKL96Dx4, Vm8QOo9MiC4, irg-2IfAjpo | PARTIAL | P3 |
| Scoped, capped key per agent | Separate named key per harness with spend cap and endpoint limits (Evens creates it) | 3TdD8Qv5Tk8, jdbOVepEtUE | PARTIAL | P3 |
| Token-scope errors and duplicate env names | Name the missing scope, ask for rotation, check for duplicate vars | gb5TlGw6Uks | PARTIAL | P3 |
| Host vs container filesystem check | Confirm which filesystem a process reads before editing config | gb5TlGw6Uks | PARTIAL | P3 |
| Runtime inventory | One doc per managed runtime: host, port, container, env var names only | gb5TlGw6Uks | PARTIAL | P3 |
| Read-only security posture audit | Periodic report of listeners and ports; no offensive testing | gb5TlGw6Uks | MISSING | P3 |
| When to split into a new agent | Split only for different creds, memory or audience | gb5TlGw6Uks | PARTIAL | P3 |
| Occupy/release lock on scarce resources | Mark a tab/device/surface busy during use and free it after | 7siRW0My05o | MISSING | P3 |
| Throttle bulk actions | Rate-limit any bulk shell or network loop | 8MEJen0nblQ | MISSING | P3 |
| Separate logging pipe | Subscribe only to the session-end event for logs | zWLZ3bVVwD8 | PARTIAL | P3 |
| Separate memory write and read paths | Validate ingest before building query | Fu6vOfzFmcw | PARTIAL | P3 |
| Prune by known constraints before choosing | Crib-style elimination, then model or human picks | NHFbAg2b54U | PARTIAL | P3 |
| Expert-system failure mode | Growing conflicting rules signal a switch to model handling (no phrase routes) | NHFbAg2b54U | HAVE | P3 |
| Account-adjacent = confirm first | Logged-in account writes are treated like money transfers | upgrades/nate-82/wealth-manager.md | HAVE | P3 |
| Router file imported by every harness | CLAUDE.md/AGENTS.md mirror or @import | DTCyvo6cC54, jdbOVepEtUE | HAVE (rules re-read each turn) | P3 |
| Global vs project scope | User-level vs repo-level rules, skills and agents | jdbOVepEtUE | PARTIAL | P3 |
| One git-backed root with nested projects | Other-worlds folder; nested context files | 8QQ_INxAhRs, Ek1NBfnnTH0 | PARTIAL | P3 |
| Internal facts vs deliverable repo | Job facts in memory; deliverables in their own repo, referenced by path | Ek1NBfnnTH0 | PARTIAL | P3 |
| Upgrade registry with dedupe | Harness upgrades tracked UNTESTED to WIRED to DRY-RUN PASS; duplicates mapped to one ID | system-upgrades/INDEX.md | PARTIAL | P3 |
| Factory first / primitives registry | Reusable primitives with status; connected only after a verifier grade | x-2088359756096532965, product-factory/PRIMITIVES.md | PARTIAL | P3 |
| Thin adapter, do not fake gaps | Wrap existing code; report missing pieces | product-factory/PRIMITIVES.md | PARTIAL | P3 |
| Graph engineering / per-step micro-loops | Each step gets its own check and log, only where steps often fail | U6k4MeVks_Y, 2087910909947642285 | MISSING | P3 |
| Shared connectors, isolated per-lane browsers | Connectors global; browser profiles isolated per task lane | PQBYZQqan2g | MISSING | P3 |
| Agent/environment/session/vault split | Definition, sandbox with explicit network rules, run, credentials apart | 27Y44JYXZJ8 | MISSING | P3 |
| Egress allowlist tiers | Trusted/custom/full/none network for unattended runs | ehg4fhydTgs | MISSING | P3 |
| Hosted runner for always-on jobs | Code in a repo, hosted scheduler with retries (hosting needs Evens's OK) | UGIZnh6HNLc, hN58VkYLie4 | MISSING | P3 |
| Secrets in host env, var named in prompt | Bulk-import env for dev+prod; prompt says use the env var, not .env | UGIZnh6HNLc, ehg4fhydTgs | NOT_FOR_JARVIS | P3 |
| Git-push deploy behind approval | GitHub to Vercel/Trigger.dev; local first; push only on explicit OK | 3TdD8Qv5Tk8, UGIZnh6HNLc, jdbOVepEtUE | PARTIAL | P3 |
| Dark-factory autonomy levels | Stay at level 3 (agent writes, human specs and accepts) until the harness is proven | eecUhBpTz_g | PARTIAL | P3 |
| Merge is not ship (blue-green) | Label merged, standby and live separately | eecUhBpTz_g | NOT_FOR_JARVIS | P3 |
| Dumb front end, webhook back end | The page POSTs an explicit field contract to an endpoint | 7siRW0My05o, tFFKuq2t0rI | NOT_FOR_JARVIS | P3 |
| Respond-to-webhook for inline results | Return the result to the caller rather than by email | tFFKuq2t0rI | NOT_FOR_JARVIS | P3 |
| Native provider tools via Responses API | Check whether the routed model offers native search/file tools | QrJhdTbK3TU | PARTIAL | P3 |
| Persistent voice socket owned by one service | Live API over one long-lived websocket process | Qt3zMBH-FNg | PARTIAL (live :4018 untouched without Evens) | P3 |
| File signal bus between voice and face | Voice writes status files; Face reads the bus dir | github-jaredrhod-fullstack-agent | PARTIAL (live surface; Evens OK needed) | P3 |
| Gemini File Search managed RAG | Four HTTP calls: store, upload, import, generate | irg-2IfAjpo | NOT_FOR_JARVIS | P3 |
| Supervisor keeps workers running | One agent whose only job is keeping N workers going | 2072255044544512004 | NOT_FOR_JARVIS (Watchdog role) | P3 |
| A2A agent cards | Agent-to-agent protocol with capability cards and task lifecycle | AO5aW01DKHo | NOT_FOR_JARVIS | P3 |
| Design AI into team workflows | Don't hand out raw credits; wire AI into named workflows | 8MEJen0nblQ | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Pre-tool hook layer (Hooks + Capabilities, not instructions), P1.**
   - Add one pre-action guard that every shell, file, computer and Safari action passes through before it runs.
   - Deny reads of secret paths (`.env*`, keychains, mcp configs) and destructive commands (rm -rf, git reset/force-push, DB drop).
   - Deny outbound sends from shell (curl to mail/SMTP/post endpoints) unless an ask_owner approval token exists for that job.
   - Add a post-action hook that logs the call to the job ledger and a stop hook that writes the handoff.
   - Keep a fixture of known-bad commands and prove that each one is blocked.

2. **Skills library with a terse index (WAT + description routing), P1.**
   - Store each repeatable job as `workflows/<name>.md` (goal, inputs, tools, steps, edge cases) plus `tools/*.py|sh` one-job scripts.
   - Build an index file with one line per skill: name, when to use, valid inputs.
   - Load only the index each turn and load the full body when a skill is chosen.
   - Turn finished-job procedural memory into candidate skills that wait for Evens's review.
   - Test by routing a set of real past requests and checking which skill was picked.

3. **Independent verifier before done (Wiring checks on the real surface), P1.**
   - Add a separate, cheaper verifier call with read-only tools. It gets the job's done-check list and fresh evidence (screenshot, file stat, log), not the builder's narrative.
   - Require one live end-to-end check for anything wired: the tool is registered, the trigger fired, the output renders in the destination app.
   - `done` stays blocked until the verifier returns MATCH, PARTIAL or FAIL with an artifact path. This is builder evidence, not Watchdog PASS.

4. **Resume after reboot (Durable sessions + state backup), P1.**
   - Persist a per-job state file: job ID, session ID, goal, step index, pending approvals, last 3 screenshot paths, cost so far.
   - Write it after every step.
   - On launch, list unfinished jobs and ask Evens whether to resume each one. Never auto-resume a held send/pay/delete.
   - Re-check the live state (open tabs, files) before continuing, because the world may have changed.

5. **Bounded sub-agents with allow-lists (Specialist sub-agents + per-worker allow-list), P1/P2.**
   - Start with read-only parallel workers (search, fetch, file read) behind a Jev preflight.
   - Each worker gets an explicit tool allow-list with no send/write tools, a file territory, a max-turn cap, and no inherited bypass.
   - Name the assignee and the combiner for each fan-out. Write every handoff transcript to a file Evens can open, and put a one-line receipt in the reply.

The table has no numbers in it: no sources gave measured results that apply to Jarvis.

## Coding agents: how to brief, run, split and check agent work

This family covers how people get dependable work out of coding agents such as Claude Code, Codex, Cursor and builder UIs. The sources keep returning to six ideas:

- Plan and ask questions before building.
- Give the agent a goal it can check.
- Keep the context small: clear it, hand off, or use sub-agents.
- Run work in parallel only in isolated spaces.
- Never let the builder grade its own work.
- Write every fix back into the stored workflow.

The 193 raw entries merge into the 62 methods below. Every source id is kept in the structured output.

Jarvis today already has the single reason-act-observe loop, shell with background jobs, Safari and computer control, approvals for gated actions, Jev model routing and procedural memory. What it lacks for this family:

- sub-agents
- an independent verifier
- resume after reboot
- skills loading
- hooks
- a structured plan/job card that it actually enforces

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Plan, ask questions, approve, then execute | Plan mode, clarifying questions, plan reviewed before side effects | -cdexJWN8YA, 3GAxd90fEE4, 3TdD8Qv5Tk8, AO5aW01DKHo, B4p9O2P2a3c, U6k4MeVks_Y, UGIZnh6HNLc, tDGiWn0flK8, tFFKuq2t0rI, RzLV8sfFdMM, vDVSGVpB2vc, nate-82 lead-hunter, nate-82 hitl-operator | PARTIAL | P1 |
| Options with a recommended default and a one-line explanation | Fast multiple-choice questions that you can still understand | AO5aW01DKHo, U6k4MeVks_Y, plan-mode-objective | PARTIAL | P2 |
| "What am I not thinking of?" check | Unknowns prompt at the end of planning | vFepZE_wrfg, plan-mode-objective | MISSING | P2 |
| Editable plan: annotate and override | Comment on or override plan choices before accepting | U6k4MeVks_Y, vFepZE_wrfg | PARTIAL | P2 |
| Research pass before planning | Agent researches unknowns or runs deep research first | 3TdD8Qv5Tk8, U6k4MeVks_Y | PARTIAL | P2 |
| Local resource guide from official docs | Write a cited API reference file and build from it | Qt3zMBH-FNg, UGIZnh6HNLc, david-ondrej | PARTIAL | P2 |
| Code beats clicks | Configure vendors through their API or docs, then check the UI once | -cdexJWN8YA | PARTIAL | P2 |
| Fewest hops between systems | Go direct vendor to vendor unless an extra hop adds something | -cdexJWN8YA | PARTIAL | P3 |
| Outcome brief: goal, guardrails, exit criteria | Brief by outcome, not by micro-steps | AO5aW01DKHo, XNQBCRcwXV4, J_jswzXhYJA | PARTIAL | P1 |
| State the why and the stakes | Intent plus a named verify clause in the prompt | RzLV8sfFdMM, ONmaDdOBGig | PARTIAL | P2 |
| Precise systems vocabulary | Trigger, object, transform, endpoint, plus expected failure modes | AO5aW01DKHo, 3TdD8Qv5Tk8 | PARTIAL | P2 |
| Mirror vs diverge from a reference | Say which aspects to copy and which to differ | I7mpF7_pnPM | PARTIAL | P3 |
| Real sample payload plus output contract | Paste real input JSON, the exact output and failure sentinels; iterate on the diff | BO-jFbN4p8Y, KGXFkUlBHxw | PARTIAL | P2 |
| Goal loop with a checkable stop condition | /goal-style run until an objective done condition holds | GpSqBjW6hR4, RLjaUES9P8A, jdbOVepEtUE, vfWTyEreOEc, zyvdl__Ywfk | PARTIAL | P1 |
| Independent evaluator decides done | A separate model or session grades the work; builder cannot self-PASS | iTY8Q449YNQ, dark-factory | MISSING | P1 |
| Bounded retry loop | Max iterations, explicit done signal, redesign after repeated failure | AO5aW01DKHo (Ralph), a5sJNwfZ528 | PARTIAL | P2 |
| Job card in a file, pointer in the prompt | Full spec behind a divider; prompt says "read and execute" | R0qF17BVl9w | PARTIAL | P2 |
| Clear or compact context at about 60% | Watch context use; reset between phases | 3GAxd90fEE4, tDGiWn0flK8, vfWTyEreOEc, vFepZE_wrfg | PARTIAL | P2 |
| Structured handoff into a fresh session | Done, open, decisions, key files, pick-up point; reload after reset or reboot | 0WDkwMxj13s | MISSING | P0 |
| Rewind instead of stacking corrections | Roll back to a checkpoint, branch to try alternatives | ZRb7D6R64hM, vfWTyEreOEc | MISSING | P2 |
| Session-start context dump | Load goals, constraints and state before work | IMPLEMENTATION_MAP | PARTIAL | P3 |
| Plan / build / check as separate passes with file handoffs | Director loop, PIV, assembly line; checker is not the builder | RzLV8sfFdMM, cole-medin, 8QQ_INxAhRs | PARTIAL | P1 |
| Plan.md: goal, success, validation, touch-points | One-page spec or PRP before multi-file work | RzLV8sfFdMM, cole-medin | PARTIAL | P2 |
| Read-only sub-agents for bulk reading or research | Fresh context, cheaper model, summary-only return | jdbOVepEtUE, ZRb7D6R64hM, RzLV8sfFdMM, 62Rfe1w9NBc, xsAOpqjebOo, iTY8Q449YNQ, RLjaUES9P8A, nate-82 forge, nate-82 career-strategist | MISSING | P1 |
| Fresh sub-agent per task plus scope-drop gate | GSD-style per-task context with a check for silently dropped requirements | eRS3CmvrOvA | MISSING | P2 |
| Map-reduce fan-out | Many cheap per-item workers plus one strong merger; partition, dedupe, yield check | Ek1NBfnnTH0, jZgcWCzxh1I, zyvdl__Ywfk, vfWTyEreOEc | MISSING | P2 |
| Worker brief: goal, role, output, recipient, owned files | The child has no history; give it territory, a kill switch and handoff receipts | vDVSGVpB2vc, nate-82 researcher | MISSING | P2 |
| Size fan-out to rate limits | Check tokens-per-minute before parallel calls | 3QclAjmu5Tw | PARTIAL | P3 |
| Sub-agent spec as a markdown file | name, description, tools, model, memory; /agents wizard | e18sdZLwP7o, jdbOVepEtUE, vfWTyEreOEc | MISSING | P2 |
| Decision rule: skill vs sub-agent vs team | Sequential or shared files means sub-agent or inline; peer bounce means team | vDVSGVpB2vc, e18sdZLwP7o, 62Rfe1w9NBc | MISSING | P3 |
| Explicit naming beats auto-routing | Name the skill, agent or file; use exact trigger phrases | e18sdZLwP7o, kB9iMD0EjT8, 3TdD8Qv5Tk8 | PARTIAL | P3 |
| Status board for parallel workers | Working / needs input / done, runtime, dispatched prompt, reply or kill, panes | ZAaxx3qyT8g, 62Rfe1w9NBc, Tj3018n5MVg, vDVSGVpB2vc | MISSING | P2 |
| Surface approval gates with a notification | Delegated step halts until the owner says OK | xsAOpqjebOo, 62Rfe1w9NBc | HAVE | P3 |
| Critic / persona review pass | Devil's advocate, read-only plan roaster, persona reviewers merged before showing | e18sdZLwP7o, vcU85OrwuV0, 8QQ_INxAhRs, XNQBCRcwXV4, jdbOVepEtUE | MISSING | P2 |
| Agent teams that debate | Lead plus shared task list plus peer messaging; token-heavy | ZRb7D6R64hM, jdbOVepEtUE, vfWTyEreOEc | MISSING | P3 |
| Worker checkpoints and graceful shutdown | Temp-file checkpoints; save before kill | vDVSGVpB2vc | PARTIAL | P2 |
| Orchestrator-only main loop | Main agent delegates and reviews, and designs the delegation plan | 2J3uX8iRNng, gb5TlGw6Uks | MISSING | P2 |
| Worktree per parallel task, ending in a draft PR | Isolated git workspace per stream (cap of 3) | RLjaUES9P8A, ZRb7D6R64hM, vfWTyEreOEc, Qt3zMBH-FNg, 3TdD8Qv5Tk8, U6k4MeVks_Y | PARTIAL | P2 |
| Best-of-N variants, then compare | N approaches, scored on cost, speed and quality | 3GAxd90fEE4, AO5aW01DKHo, david-ondrej | MISSING | P2 |
| Drive coding agents headless | claude -p / codex exec / claude --bg per step, cwd logged, output parsed | ZRb7D6R64hM, eecUhBpTz_g, ZAaxx3qyT8g | PARTIAL | P1 |
| Long jobs in the background, report on completion | Optimize for result, not speed | RzLV8sfFdMM | PARTIAL | P2 |
| Cloud offload (cloud sandbox, ultra plan) | Plan or run in vendor cloud | RLjaUES9P8A, vfWTyEreOEc | NOT_FOR_JARVIS | P3 |
| Hosted/managed agent spec card | Declarative agent card drafted from a goal plus local context | 27Y44JYXZJ8 | MISSING | P3 |
| Cross-harness routing | Plan in one agent, build or review in another; hand stuck work over; one writer per file | 35WuZxbAY68, 3TdD8Qv5Tk8, kB9iMD0EjT8 | PARTIAL | P2 |
| Harness adapter map | One instruction/skill source rendered to CLAUDE.md, AGENTS.md, .agents; engine-neutral skills | kB9iMD0EjT8, 8ktcSaSTvxk, 2OD14-0cot4 | MISSING | P2 |
| Plug a third-party model via a setup doc | Route a new model with env-referenced keys | GpSqBjW6hR4 | HAVE | P3 |
| Know the coding-agent knobs | /model, /effort, dynamic workflows, CLI-only features, interface check | q5lg3npxjAc, jZgcWCzxh1I, jdbOVepEtUE, ZAaxx3qyT8g, U6k4MeVks_Y | PARTIAL | P3 |
| Danger classifier / allowlist instead of bypass | Auto-run safe commands, gate risky ones | U6k4MeVks_Y, ZRb7D6R64hM, jdbOVepEtUE, tDGiWn0flK8, vDVSGVpB2vc, -cdexJWN8YA | PARTIAL | P2 |
| Side channel for questions mid-run | /btw-style answers without aborting the job | 3TdD8Qv5Tk8, RzLV8sfFdMM, vfWTyEreOEc, ZRb7D6R64hM | MISSING | P2 |
| Explain own actions on request | Answer "why did you do that" from the trace | tDGiWn0flK8, jdbOVepEtUE | PARTIAL | P3 |
| Self-repair with write-back | Read the error, check docs, patch, persist the fix in the stored workflow or tool; NL tweaks edit stored files | AO5aW01DKHo, vFepZE_wrfg | PARTIAL | P1 |
| Expected vs observed with the exact bad output | Feed the real wrong output plus mapping to the fixer | -cdexJWN8YA, a5sJNwfZ528, UGIZnh6HNLc | PARTIAL | P2 |
| Reopen what the agent claims it fixed | Generated output is a draft; verify each "fixed" item | nate-82 forge | PARTIAL | P2 |
| Compile stable agent work into scripts | Replace agent orchestration with a deterministic script; recurring requests become code | 3TdD8Qv5Tk8, hN58VkYLie4 | MISSING | P2 |
| Explicit to-do list execution | Plan becomes a tracked task list with per-item progress | AO5aW01DKHo | PARTIAL | P2 |
| Smallest working slice first | No whole-product prompts; grow in verified slices | pbrln2TVeh4, IMPLEMENTATION_MAP | PARTIAL | P2 |
| Rough POC labeled as a proposal | Quick prototype for feedback | 2J3uX8iRNng | PARTIAL | P3 |
| Act once you have enough | Stop over-researching once a reversible step exists | vcU85OrwuV0 | PARTIAL | P3 |
| Screenshot after every UI edit, one correction at a time | Targeted follow-ups, visual NL edits | tFFKuq2t0rI, bX_stJ_Eiog, riley-brown | PARTIAL | P2 |
| Element-anchored annotations, batch-sent | Selector plus issue notes sent as one batch | CB5bG4mvnS0 | PARTIAL | P2 |
| Serve locally, state the host, review in browser | Localhost URL opened in Safari; never deploy without OK | gt8k4bA01Mo, PQBYZQqan2g | HAVE | P3 |
| Give the UI builder the backend schema | Builder reads workflow/MCP schema instead of hand-written webhooks | 5p5cV0yVDvQ | PARTIAL | P3 |
| Every build in a real job folder with scaffold | Folder layout from the operating file | 3GAxd90fEE4, gt8k4bA01Mo, U6k4MeVks_Y | PARTIAL | P3 |
| Standing rules file plus repo map in context | Rules and file tree as a permanent prompt | david-ondrej, UGIZnh6HNLc | PARTIAL | P2 |
| Keys as env-var placeholders | Agent writes .env placeholders; owner fills them; values never echoed | -cdexJWN8YA, Qt3zMBH-FNg, riley-brown | PARTIAL | P2 |
| Interview card | Autonomy, loop, validation, escalation before an autonomous job | eecUhBpTz_g, T-001 ticket | MISSING | P2 |
| Mission file with in, out and reject plus never-rules | Lets the agent refuse off-mission work | mission.md, nate-82 big-boss | MISSING | P2 |
| Dark factory level 3 | PRD to ticket to bite built against hidden hold-outs, graded elsewhere, human flips deploy | dark-factory.md | MISSING | P2 |
| Senior-dev process (Superpowers shape) | Plan, worktree, test-first, spec review, then quality review | eRS3CmvrOvA | MISSING | P2 |
| Reason-act-observe loop | Observe real evidence each turn; build-test-fix | EuzYhzB0vbI, FiOTrxq9ckM, pbrln2TVeh4 | HAVE | P3 |
| Chat copy-paste prototype | Generate, run, feed errors back when there is no harness | pbrln2TVeh4 | HAVE | P3 |
| Channel-specific output style | Terse voice vs detailed report | ZRb7D6R64hM | PARTIAL | P3 |
| Long output to a file, not the terminal | Give the path | jdbOVepEtUE | HAVE | P3 |
| Long unsupervised swarms / round-the-clock grind | Signal only; budget and stream caps apply | 2077827886149439547, NDeyhGnNECc | NOT_FOR_JARVIS | P3 |
| Procedural assets / AI-assembled game projects | Creative signal only | 2073469967308030384, 2073306997064421677 | NOT_FOR_JARVIS | P3 |
| Agent self-deploys its servers | Deploy is Tier-3 | 2073272122508513702 | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Resumable job state and handoff (P0, MISSING).** The Mac just restarted, and Jarvis has no way to pick a job back up.
   1. On every turn, write a small `job.json` and `HANDOFF.md` to the job folder: goal, stop condition, done items, open questions, decisions locked, key files, next step, and background job PIDs/logs.
   2. On start-up, scan for unfinished jobs and tell Evens which job and step it would resume at.
   3. Resume only after his "yes".
   4. Test it with a real job killed mid-run by a reboot.
2. **Independent verifier before `done` (P1, MISSING).**
   1. `done` sends the job card, stop condition and evidence paths to a separate model call. Jev routes it to a different provider or tier than the builder.
   2. That call has read-only tools.
   3. It returns PASS, FAIL or UNKNOWN with reasons.
   4. On FAIL, Jarvis goes back to work. On UNKNOWN, Jarvis asks Evens.
   5. Its verdict is evidence only. It is not a Watchdog PASS.
3. **Read-only sub-agents (P1, MISSING).**
   1. Add a `delegate` tool that takes a worker brief: goal, scope or territory, output file, allowed tools (read-only by default) and a time/cost cap.
   2. Allow at most 3 at once.
   3. Each worker runs in a fresh context on a Jev-chosen cheap tier and returns only a summary.
   4. Log each dispatched prompt for audit.
   5. Show a simple board (working / needs input / done, runtime).
4. **An enforced job card with a plan step and checkable stop condition (P1, PARTIAL).**
   1. For multi-step or side-effecting jobs, Jarvis writes a card before acting: why, outcome, guardrails or never-rules, a stop condition a script can check, the verification step, and touch-points.
   2. It asks only the questions that change the result, offering options with a recommended default.
   3. It waits for Evens's OK on Tier-3 steps.
   4. Long specs live in the file; the loop gets a pointer to it.
   5. Retries run under an iteration cap.
5. **Headless coding-agent dispatch in worktrees (P1, PARTIAL).**
   1. Wrap `claude -p` / `codex exec` as a tool that creates a `loop/*` or feature worktree, runs in the background, logs the cwd, and parses the output.
   2. The build step and the review step go to different harnesses.
   3. Each stream ends in a draft PR under the bot identity.
   4. Merges, deploys and pushes to the public repo stay with Evens.

## Memory and knowledge

This family covers how an agent remembers between turns, sessions and restarts, and how it finds the right knowledge when it needs it. The corpus keeps repeating a few ideas:
- Keep the always-loaded context short and use it as a router.
- Write state to files so a reset loses nothing.
- Turn every correction into a durable rule.
- Store knowledge as plain markdown (raw, then wiki, then index and log).
- Before picking retrieval, classify the question: filter, SQL, full read or vector.

Jarvis today has lean context, procedural memory from finished jobs, a repetition brake, and an idle session that continues on Evens's next line. It cannot yet resume a job after a reboot, load skills on demand, run hooks, or ingest its own signals. Those gaps carry most of the weight below.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Durable job ledger read on resume | Append-only record of files touched, decisions, open tasks and the last ask; re-read after any reset or restart | 27Y44JYXZJ8, ONmaDdOBGig, eRS3CmvrOvA, nate-82/librarian.md | MISSING | P0 |
| Structured session handoff instead of compact | Fixed note (start, locked decisions, shipped, key files, running state, verification, open items, pick up here), then clear and reload | -cdexJWN8YA, 6cEQEba0i2A, AO5aW01DKHo, iTY8Q449YNQ, jdbOVepEtUE, vfWTyEreOEc | PARTIAL | P0 |
| Idle session recap | One-line "what I was doing" shown on resume | vfWTyEreOEc | PARTIAL | P1 |
| Checkpoint each answer to disk | Long interviews or planning write every Q&A to a brainstorm doc as they go (decisions, Q&A log, open flags) | c0kaKxM2pHg | MISSING | P1 |
| Fresh context per topic or threshold | New thread for unrelated asks or when context fills; files carry continuity | 0YXjEzFfft8, U6k4MeVks_Y, plan-mode-objective.md | PARTIAL | P2 |
| Lean always-loaded context | Only identity, goals and policies stay loaded every turn; tickets and threads are looked up when needed | 0WDkwMxj13s, Ek1NBfnnTH0, U6k4MeVks_Y, plan-mode-objective.md | PARTIAL | P2 |
| Load skills and tool schemas on demand | Procedures stored as skills and pulled only when a step needs them; idle MCP schemas stay deferred | RzLV8sfFdMM | MISSING | P1 |
| Sandbox big tool output | Big shell, page or log output goes to a file; only a filtered slice enters context | eRS3CmvrOvA | PARTIAL | P1 |
| Root context file as router | Short role line plus a "where things live" map, with key locations given by path only | 0WDkwMxj13s, 8QQ_INxAhRs, DTCyvo6cC54, Ek1NBfnnTH0, jdbOVepEtUE | PARTIAL | P1 |
| Every failure becomes a durable rule | Scar file or one-line rule after each miss; the core rules file stays small | 0WDkwMxj13s, 3TdD8Qv5Tk8, RzLV8sfFdMM, ZRb7D6R64hM, gb5TlGw6Uks, jdbOVepEtUE, rMf-JuikR-Q, SIGNAL-TRAIN-LOOP.md | PARTIAL | P1 |
| End-of-session distill and daily promotion | A hook summarizes each session into a daily log; a daily pass proposes what to promote into core memory | 7siRW0My05o, RzLV8sfFdMM, vfWTyEreOEc | PARTIAL | P1 |
| Job ContextPack before work | Business context, SOPs, past winners and losers, loaded before the task, never a cold start | 0YXjEzFfft8, 3XIGcM7VICc, ZRb7D6R64hM, brB-hSiV2iU, c0kaKxM2pHg, jdbOVepEtUE, zyvdl__Ywfk | PARTIAL | P1 |
| LLM wiki (raw / wiki / index / log) with agent ingest | Karpathy pattern: drop a source, the agent writes linked pages and updates the index and log | 8QQ_INxAhRs, DTCyvo6cC54, U6k4MeVks_Y, brB-hSiV2iU, hQvwMj7IJe4, jdbOVepEtUE, workflows/us.md | MISSING | P1 |
| Retrieval router by question type | Count or date questions go to a filter, aggregates to SQL, order or summary questions to a full read, needle lookups to vectors | DTCyvo6cC54, ZwQ8rJhVCr4, irg-2IfAjpo, jdbOVepEtUE, kOKavHnlPik, nate-82/researcher.md | MISSING | P2 |
| Filter-then-LLM | Exact-key filter first; only matching rows reach the model | ZwQ8rJhVCr4, kOKavHnlPik, nate-82/CLUSTER-ops.md | PARTIAL | P2 |
| SQL for aggregates | The database does totals and rankings, not the model | ZwQ8rJhVCr4, kOKavHnlPik | PARTIAL | P2 |
| Full-document read | Read the whole file for summaries, order, or one small doc | Vb1SwBAn9cQ, ZwQ8rJhVCr4, kOKavHnlPik, zWLZ3bVVwD8 | HAVE | P3 |
| Vector retrieval (chunk, embed, hybrid, rerank) | Only for needles in large piles; top-k is a lever | DTCyvo6cC54, ZwQ8rJhVCr4, kOKavHnlPik | MISSING | P3 |
| Typed relation graph | Entities plus typed edges for relationship chains | DTCyvo6cC54, graph/INDEX.md | MISSING | P3 |
| Managed vendor file-search stores | Gemini, Pinecone Assistant, OpenAI vector stores | KVFfApQZhE4, QojPKL96Dx4, QrJhdTbK3TU, lokbsA5VXOk | NOT_FOR_JARVIS | P3 |
| Grounded answers with verbatim citations | Answer only from the designated file, return exact spans, never pass a summary off as a quote | QojPKL96Dx4, lokbsA5VXOk, y-cq_Qo4zVo | PARTIAL | P2 |
| Searchable past sessions, progressive retrieval | Index of past sessions; search the index, then the timeline, then full detail | eRS3CmvrOvA, gb5TlGw6Uks | MISSING | P2 |
| Typed state store, one key at a time | Facts kept in JSON, set and read one key at a time; only the needed key is loaded into context | nate-82/CLUSTER-ops.md | MISSING | P2 |
| User / business profile loaded each session | user.md, memory.md or profile JSON; never holds secrets or in-flight status | 7siRW0My05o, gb5TlGw6Uks, pbrln2TVeh4, tDGiWn0flK8 | PARTIAL | P2 |
| Per-project AGENTS.md | Project goal and operating rules, read when working in that folder | 3TdD8Qv5Tk8, gb5TlGw6Uks, tDGiWn0flK8 | PARTIAL | P2 |
| Edit-diff to preference rules | When Evens edits a draft, list the changes and reasons and update the instructions | 3XIGcM7VICc, jdbOVepEtUE, tDGiWn0flK8 | MISSING | P2 |
| Runbook and tool saved after success | Script plus markdown workflow, integration recipe, accepted style preset | 0YXjEzFfft8, 3GAxd90fEE4, RDytbVDzMF4, jdbOVepEtUE | PARTIAL | P2 |
| Memory consolidation, lint and coverage pass | Prune contradictions, merge duplicates, use absolute dates, find gaps; one capped pass, output as proposals | ZRb7D6R64hM, jdbOVepEtUE, workflows/coverage-loop.md | MISSING | P2 |
| Layered memory | Atomic fact files plus index, a separate rules file, and an on-demand wiki | DTCyvo6cC54, jdbOVepEtUE | PARTIAL | P2 |
| Hot cache | Tiny recent-context file read before the index | jdbOVepEtUE | PARTIAL | P2 |
| Evergreen ingest, live fetch, freshness labels | Store only what lasts; re-fetch changing numbers; trace stale facts to their file | 2J3uX8iRNng, 8QQ_INxAhRs, DTCyvo6cC54, jdbOVepEtUE | PARTIAL | P2 |
| Ordered lookup cascade | Project file, then wiki, then transcripts, then the live tool | DTCyvo6cC54, jdbOVepEtUE | MISSING | P2 |
| Recall over read-only comms connectors | Mail, Slack and transcripts queried live, never sent from | 3XIGcM7VICc | PARTIAL | P2 |
| Privacy gate | Sensitive data goes to local models or is kept out of hosted context | DTCyvo6cC54 | PARTIAL | P2 |
| Own-voice exemplar corpus | Evens's own writing, calls and SOPs, curated and read before drafting | 0YXjEzFfft8, 3TdD8Qv5Tk8, brB-hSiV2iU | MISSING | P2 |
| Local reference and playbook docs | Cache vendor docs or research as local markdown with URL and date | vDVSGVpB2vc, xn6Z5PYyAIE | PARTIAL | P2 |
| One folder per job with README | Inputs kept apart from outputs, a run log, a guide to the file map | 3TdD8Qv5Tk8, 7UNsK9LoORo, 8QQ_INxAhRs, Qt3zMBH-FNg, R0qF17BVl9w | PARTIAL | P2 |
| Dated decision log and quarterly priorities | Big calls appended with dates; current-quarter status file | DTCyvo6cC54 | PARTIAL | P2 |
| Open flags routed to the real owner | Unknowns recorded with who to ask, never guessed | c0kaKxM2pHg | PARTIAL | P2 |
| Coverage-gap card | No learned procedure means stop, say so, and list transferable rules | workflows/gaps/local-clinic.md, workflows/restaurant.md | PARTIAL | P2 |
| Desk / role wiki before work | Read the owns / never rules and the job card before acting | x:2074304050880012736, 2074304050880012736, audience-then-category-compare.md, hypothesis-plus-labeled-set.md | PARTIAL | P2 |
| Workflow-compiler card | Classify, decompose, coverage map, narrow retrieve, steps with IF / valid_when / confidence / source, audits, operate-never | ai-authors-code-that-runs-without-tokens.md, human-gesture-retriever.md, remote-oneshot-vs-local-cookies.md | PARTIAL | P2 |
| Five-layer knowledge store | Raw, atoms, graph, patterns, workflows, with provenance back to raw | README.md (knowledge) | PARTIAL | P2 |
| One steal catalog keyed by source id | Merge into one master sheet; no per-source forks | README.md (watch-later) | MISSING | P2 |
| Do not flatten; keep dissent visible | Merge only when conditions match; opposing views kept as siblings | README.md, industrial-smb.md, restaurant.md | PARTIAL | P3 |
| Retrieve, compare, condition, synthesize, audit | Never blend retrieved items | README.md | MISSING | P3 |
| Classify and decompose before retrieving | State the task class before opening memory | coverage-loop.md | MISSING | P3 |
| Raw-source immutability | Raw transcripts are read-only and referenced by path | RAW.md | PARTIAL | P3 |
| Atom schema with validator | Required source and evidence fields, written through a script | atoms/INDEX.md | PARTIAL | P3 |
| Speech vs behavior mismatch rows | Record both sides; follow the approval side | mismatches/INDEX.md | PARTIAL | P3 |
| Ordered behavior sequences with failure branches | Full step chains, not slogans | behaviors/INDEX.md | PARTIAL | P3 |
| Versioned patterns with support / dissent / valid_when | Rank procedures by support and check conditions | patterns/INDEX.md | PARTIAL | P3 |
| Creator OS versioning | Track how a source's advice changes; never clone it | creators/INDEX.md | PARTIAL | P3 |
| Single SSOT tree | Stale copies get a pointer README only | dry-runs/desk-missions-now/README.md | PARTIAL | P3 |
| Separate wiki per growing corpus | Flat for homogeneous logs, nested for mixed knowledge | Ek1NBfnnTH0, hQvwMj7IJe4 | MISSING | P3 |
| Co-ingest related sources | Surface baseline and harness mismatches across sources | hQvwMj7IJe4 | MISSING | P3 |
| Plain-file, harness-agnostic brain | Markdown and repo readable by Claude Code, Codex and Jarvis | 0WDkwMxj13s, PQBYZQqan2g, gb5TlGw6Uks, hQvwMj7IJe4, kB9iMD0EjT8 | PARTIAL | P3 |
| Keep twin rule files in sync | CLAUDE.md / AGENTS.md / .mdc drift check, proposed rather than silent | kB9iMD0EjT8 | MISSING | P3 |
| Workspace top-level layout | decisions/, audits/, archives/, brainstorms/, projects/, other worlds | 0WDkwMxj13s, Ek1NBfnnTH0 | PARTIAL | P3 |
| Markdown vault is the store; Obsidian only views | Judge memory by retrieval, not the graph view | DTCyvo6cC54, FiOTrxq9ckM, i4Q8wHZNPBU | HAVE | P3 |
| Lowest second-brain level that removes the pain | Knowledge layer before automations; climb only after a logged failure | 8QQ_INxAhRs, DTCyvo6cC54, jdbOVepEtUE | PARTIAL | P3 |
| Design storage from the future question | Write the recall questions first, then pick the shape | DTCyvo6cC54, jdbOVepEtUE, kOKavHnlPik | MISSING | P3 |
| Find-time pulse check | Slow lookups mean restructure the tree | 8QQ_INxAhRs | MISSING | P3 |
| Rolling context window | Anything outside the live window must be on disk | iRBs8PCBCaA | HAVE | P3 |
| Compaction fallback marker | Degrade with a logged marker if summarizing fails | gb5TlGw6Uks | MISSING | P3 |
| Queue rule edits for next boot | Mid-session memory edits apply at the next session | 6cEQEba0i2A | PARTIAL | P3 |
| Onboarding brain-dump | A voice ramble distilled into profile proposals | gb5TlGw6Uks | MISSING | P3 |
| Re-grill on process change | Delta interview on an existing capture doc | c0kaKxM2pHg | MISSING | P3 |
| Speaker-block transcript cleanup | Speaker label only when the speaker changes; plus an attendee list | -Q_P7HFydZk, KGXFkUlBHxw | MISSING | P3 |
| Ingest-then-name files | File drops get a meaningful name in a known folder | jBanaNBY-sM | PARTIAL | P3 |
| Past-work retrieval for deliverables | Ground a proposal in the closest prior case | KGXFkUlBHxw | MISSING | P3 |
| Explain-on-request (mentor mode) | Plain-language explanation of an action | pbrln2TVeh4 | HAVE | P3 |
| Always-on syncing brain | Gbrain-style constant sync | DTCyvo6cC54 | NOT_FOR_JARVIS | P3 |
| Open-source shared brain repo | Community "open brain" reference | 8MEJen0nblQ | NOT_FOR_JARVIS | P3 |
| Active building over watching | Human learning advice | vLlIBT0HSSc | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Job ledger plus resume after reboot (P0).** Evens's last line was "continue (my mac restarted)", and today Jarvis cannot pick up a job after a restart.
   - Write `jobs/<id>/ledger.jsonl` (append-only). Each entry holds a step, the files touched, decisions, the pending approval and the last owner line. Write it after every tool call.
   - On boot, list unfinished ledgers and read the newest one.
   - Re-check live state (open apps, Safari tab, running background jobs) before acting.
   - Say a one-line recap, then continue or ask_owner.
   - Test: kill the process mid-job, restart, and confirm the job resumes at the right step.
2. **Structured handoff at a token threshold or task switch (P0).**
   - Add a `handoff` step that fills the fixed schema: start, locked decisions, shipped, key files, running state, verification, open items, pick up here.
   - Trigger it on a context threshold, a task change, or a done step.
   - Store it in the job folder and start the next context from it alone.
3. **Failure-to-rule and end-of-session distill (P1). Needs hooks.**
   - Add session-end and failure hooks that write a short summary or scar entry to a daily log.
   - A daily capped pass proposes promotions or rules as diffs for Evens to approve (Librarian rule), using absolute dates.
   - Also feed in the diff of Evens's edits to Jarvis drafts.
4. **Router file plus on-demand skill loading (P1).**
   - Cut the always-loaded context to a role line and a "where things live" map: ContextPack, decisions, procedural memory, skills index, project roots, and the lookup order (project, then wiki, then transcripts, then live MCP).
   - Load a skill's body only when a step matches its description.
   - Write big tool output to a file and return only a slice.
5. **Signal ingestion into an LLM wiki (P1).**
   - For each YouTube or X item: raw transcript (immutable, speaker-collapsed), wiki pages, an index line and a log entry. Merge into one steal catalog keyed by source id.
   - Compile methods into the workflow-compiler card format with dissent kept visible.
   - Before answering, add the retrieval router: grep/jq filter, sqlite for aggregates, full read for order or summary questions, and vectors only after a logged miss.

## Content and creative methods (family: content-creative)

I merged 171 raw methods from Evens's signal corpus into 124 entries. A merge happened only when two sources described the same procedure, and every source id was kept. Each entry is graded against Jarvis's harness as of 2026-10-16. Jarvis can already draft, drive Safari and the screen, run shell and ffmpeg, and call MCPs, including the ArtCraft apps. Most of these methods are therefore PARTIAL: Jarvis can do the steps by hand, but four things are missing:
- a voice profile or skills library it loads every time
- a way to pull transcripts and frames on its own (signal ingestion)
- an independent verifier before it says "done"
- hooks that lint drafts automatically

Some limits apply to every row:
- Building mode bars all selling and outreach, so those prompts are NOT_FOR_JARVIS, or drafts only.
- Sends and publishes stay with Evens.
- Paid generation (Higgsfield, Sora, Veo, HeyGen, ElevenLabs) needs his OK for each job, plus a quote.

No method here is P0. Nothing blocks Jarvis from doing a content job today. These gaps lower quality and trust; they don't make the work impossible.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Build-in-public proof library | Record each build and answer "what have you built?" with links | -zL_trhnQaI, 3XIGcM7VICc, diY71x7GUjI | PARTIAL | P2 |
| Before/after short demo capture | A clip of the old time cost, then the new one-command run | vY0EzTP-7EA | PARTIAL | P1 |
| Demo video from driving the real UI | Click through the real product, capture it, cut a launch video | R0qF17BVl9w | PARTIAL | P2 |
| Outcome-labeled proof pack | Name the result, not the tech; attach one proof | upgrades/nate-82/publishing-engine.md | PARTIAL | P3 |
| 90-minute one-bottleneck proof | 15 min to draw it, 60 min rough build, 15 min walkthrough on camera | upgrades/nate-82/product-gtm.md | PARTIAL | P3 |
| Outline + Excalidraw diagrams per job, render-checked | Folder per video; diagrams checked for overlaps | 0WDkwMxj13s, gb5TlGw6Uks | PARTIAL | P2 |
| Evens supplies the idea; Jarvis expands or offers angles | Hand off typing, not thinking; AI suggests things to react to | 0YXjEzFfft8 | PARTIAL | P2 |
| Voice profile from real samples | Analyze his own writing and transcripts into a reusable style profile | 0YXjEzFfft8, ONmaDdOBGig, 2087589633152459123 | MISSING | P1 |
| Newsletter voice blueprint, then a new issue | Pull the template from past winners, then write from his new idea | 0YXjEzFfft8 | PARTIAL | P2 |
| Script templates from liked YouTube transcripts | "Show transcript", then extract structure, then write a new script | 0YXjEzFfft8 | PARTIAL | P2 |
| Style transfer from an expert transcript | An expert's transcript as the style guide | zyvdl__Ywfk | PARTIAL | P3 |
| Taste/exemplar library with "why it's good" | Saved examples plus an analysis of what makes each work | 3XIGcM7VICc | MISSING | P2 |
| Style + best-practice grounded post | His best posts plus platform guides plus new source | HbsbqMQE-lI | PARTIAL | P3 |
| Pinned-sources content chat | Transcript + site gives takeaways, applied to his brand | HbsbqMQE-lI | PARTIAL | P2 |
| AI-phrase kill list lint | A global banned-phrase list, checked on every draft | jdbOVepEtUE | MISSING | P1 |
| Draft-and-review default | AI drafts, the human reviews, and nothing is sent automatically | jdbOVepEtUE | HAVE | P2 |
| Skill-stacked social post + carousel on a cheap tier | Writing skill + anti-slop skill, run on a mid model | 2J3uX8iRNng | PARTIAL | P3 |
| Mother sales script from winning calls | Keep the lines that repeat across winning calls | 0YXjEzFfft8 | NOT_FOR_JARVIS | P3 |
| Failure clustering (objection playbook analog) | Group failed runs by root cause, with quotes | 0YXjEzFfft8 | PARTIAL | P2 |
| Transcripts to VSL script | Persuasion beats turned into a VSL | 0YXjEzFfft8 | NOT_FOR_JARVIS | P3 |
| Content to lead magnet to follow-up sequence | Email/SMS sequence | 0YXjEzFfft8 | NOT_FOR_JARVIS | P3 |
| Warm first-touch outreach prompt | Casual message under 100 words | LVAHYV4Xrto | NOT_FOR_JARVIS | P3 |
| Signal-based personalized email | Public signal, then outcome, then honest offer | zyvdl__Ywfk | NOT_FOR_JARVIS | P3 |
| Fixed-section document prompt | Role, constraints, placeholders, section skeleton | KGXFkUlBHxw | PARTIAL | P3 |
| Renderer "preserve text" + pinned theme | Renderer formats the text without rewriting it; brand theme fixed by ID | KGXFkUlBHxw | MISSING | P3 |
| Five-section brief template | Overview, pains, industry, approach, questions | a5sJNwfZ528 | PARTIAL | P3 |
| Unattended one-goal video build with caps | One goal produces the full video; time and cost recorded | 2J3uX8iRNng, 2OD14-0cot4, ONmaDdOBGig | PARTIAL | P1 |
| Self-summary video/report as recall audit | Journey video or visual recap that surfaces stale facts | 8QQ_INxAhRs, hQvwMj7IJe4 | PARTIAL | P2 |
| Browsable concept map over a transcript corpus | Clickable map with beginner start paths | 8QQ_INxAhRs, hQvwMj7IJe4 | MISSING | P2 |
| Brand-asset grounding | brand_assets/ folder with exact paths, passed to delegates, plan before drafting | 2J3uX8iRNng, jdbOVepEtUE, vFepZE_wrfg, PQBYZQqan2g, upgrades/nate-82/creative-studio.md | PARTIAL | P1 |
| Shared design system / tokens | One stored design system reused for every page | 35WuZxbAY68, vfWTyEreOEc, ZRb7D6R64hM | MISSING | P2 |
| Local brand-asset reuse | Find his signature and photos in local folders | FFWtxjvW2ts | PARTIAL | P2 |
| Frontend-design skill before UI | Load the design skill before any front-end code | eRS3CmvrOvA, jdbOVepEtUE | MISSING | P1 |
| Reference library before design | No "make it premium"; named references from Awwwards, Godly and similar sites | FFWtxjvW2ts, gt8k4bA01Mo | PARTIAL | P1 |
| Clone a reference or competitor, then rebrand | Screenshot + styles, clone, then apply the brand | jdbOVepEtUE, FFWtxjvW2ts | PARTIAL | P2 |
| Frontier tier + 3 motion references for cinematic sites | Taste work never goes to small models | x:2077199463278395732, 2077199463278395732 | PARTIAL | P2 |
| Three divergent versions from one reference screenshot | Compare in a browser, pick one | U6k4MeVks_Y | PARTIAL | P2 |
| Cheap previews, human pick, then final render | Low-res options before any expensive render | IlNwjnIzrOo, jBanaNBY-sM, upgrades/nate-82/creative-studio.md | PARTIAL | P1 |
| Label unrequested attempts as secondary | Present the requested path first | IlNwjnIzrOo | PARTIAL | P3 |
| Generate, score, select, improve loop | N candidates, rubric scoring, refine the top 3 | EuzYhzB0vbI | PARTIAL | P2 |
| Two brakes: hard cap + human taste | A self-score never marks taste as done | upgrades/nate-82/creative-studio.md | PARTIAL | P2 |
| Logo critique loop, then vector master | Generate options, critique, vectorize, export sizes | R0qF17BVl9w | PARTIAL | P2 |
| Transcript-synced edit loop with bounds checks | Cut, set beats, render, verify alignment and that nothing goes out of frame | EuzYhzB0vbI, RzLV8sfFdMM | MISSING | P1 |
| ffmpeg stitch + word-level timing track | Concatenate clips, then word-level ASR | ONmaDdOBGig | PARTIAL | P1 |
| Word-timed motion graphics | One graphic per explaining beat, keyed to phrases; speaker stays visible | ONmaDdOBGig, J_jswzXhYJA, workflows/claude-design-motion.md | PARTIAL | P1 |
| Animate real sourced data | Real numbers + style prompt, not a menu preset | RDytbVDzMF4 | PARTIAL | P2 |
| Named non-default font gate | Default fonts are the main sign of AI slop | RDytbVDzMF4 | MISSING | P2 |
| Font from screenshot to a free match | Google Fonts, Fontshare and similar | RDytbVDzMF4 | PARTIAL | P3 |
| One icon pack per piece | Never mix icon styles | RDytbVDzMF4 | MISSING | P3 |
| Licensed Lottie library | License-checked JSON animation folder | RDytbVDzMF4 | MISSING | P3 |
| Generate a still and drop it into a composition | Check the cost, then place the image | RDytbVDzMF4 | PARTIAL | P2 |
| Visual concepts before a UI build | Concept images and logo first, assets stored in the job folder | 3TdD8Qv5Tk8 | PARTIAL | P2 |
| Fixed HTML report template | Same template every run so reports compare | Tj3018n5MVg | PARTIAL | P2 |
| Product-locked still, animate, fidelity compare | Lock the product, generate a still, animate it, compare the last frame to the source | AYsg5gAMWyo, Vm8QOo9MiC4, uC5tDwGhyVA, upgrades/nate-82/creative-studio.md, xn6Z5PYyAIE | PARTIAL | P1 |
| Caption the intermediate output and feed it forward | Vision-model description of each output goes into the next prompt | AYsg5gAMWyo | PARTIAL | P3 |
| Sectioned prompt-expansion agent, tuned per use case | Cinematographer checklist; output only the prompt | AYsg5gAMWyo, Vm8QOo9MiC4 | PARTIAL | P2 |
| Video prompt with visual direction + dialogue | One structured prompt carrying the spoken line | AYsg5gAMWyo | PARTIAL | P3 |
| Prompt craft in the caller; media tools stay dumb | Subflows only run the call; the caller writes the prompt | jBanaNBY-sM | PARTIAL | P2 |
| Per-model media restrictions memory | Sora's ban on realistic humans, first-frame source still | AYsg5gAMWyo, Vm8QOo9MiC4 | PARTIAL | P2 |
| Test prompts in a playground before the API | Cheapest interactive surface first | Vm8QOo9MiC4 | PARTIAL | P3 |
| Don't grade a model on a thin prompt | A/B the raw prompt against the expanded one | Vm8QOo9MiC4 | PARTIAL | P3 |
| Cameos via public username | Using a real person's likeness | Vm8QOo9MiC4 | NOT_FOR_JARVIS | P3 |
| Storyboard duration check + long timeout | Scene lengths must add up to the total | Vm8QOo9MiC4 | PARTIAL | P3 |
| Async poll, sanitize, frame-0 gate | Poll the job, clean the JSON, write back by key, inspect frame 0 | upgrades/nate-82/creative-studio.md | PARTIAL | P2 |
| Resolve the named source file, then edit | File ID/path first, save the result beside the original | TWvjqpk3uSQ, UT_Ek_tmeVA, jBanaNBY-sM, upgrades/nate-82/creative-studio.md | PARTIAL | P2 |
| Text legibility stop | Fix or simplify the label rather than re-roll | upgrades/nate-82/creative-studio.md, xn6Z5PYyAIE | MISSING | P2 |
| Product-in-scene ad prompt | Product held in front of a landmark | UT_Ek_tmeVA | PARTIAL | P3 |
| Chain media tools as a pipeline | Image tool, then video tool | 7UNsK9LoORo | PARTIAL | P3 |
| Scheduled ideas into brand-voice drafts | Runs 3 times each morning; stops at a draft | 8C6iCpJ9HPo, tNOk29fs_aY | MISSING | P3 |
| Specific positive examples over snark | Cited examples; unverified claims labeled | 8MEJen0nblQ | PARTIAL | P3 |
| Taste as a deliberate zag | Flag outputs that copy the default look | 8MEJen0nblQ | PARTIAL | P3 |
| Ten boring questions ranked by demand | Topic mining from what people ask him | B4p9O2P2a3c | PARTIAL | P3 |
| Time-machine letter script | A lived decision written as advice | B4p9O2P2a3c | PARTIAL | P3 |
| Explain-the-system insider gap | Things insiders think are obvious that would anger an outsider | B4p9O2P2a3c | PARTIAL | P3 |
| Outperformers x competency ideas | Topics that outperform, crossed with what he can speak to | rMf-JuikR-Q | PARTIAL | P3 |
| Copy proven formats; link in comments | Model posts that already performed | I7mpF7_pnPM | PARTIAL | P3 |
| Video to platform article draft with frame grabs | Article + screenshots left as a draft | CB5bG4mvnS0 | PARTIAL | P2 |
| State your stake first | Disclose biases before a comparison | CvA8-aScqio | PARTIAL | P3 |
| Hold the best item to the end | Retention hook | ECfusvK5tEU | PARTIAL | P3 |
| Teach one tool at a time | Narrow teaching surface | 35WuZxbAY68 | PARTIAL | P3 |
| Layered parallax hero | Named layers moving at different scroll rates | FFWtxjvW2ts | PARTIAL | P3 |
| Product-in-use demo animations | Show the product working inside real apps | FFWtxjvW2ts | PARTIAL | P3 |
| Sticky nav + reveal micro-interactions | Default site interactions | FFWtxjvW2ts | PARTIAL | P3 |
| Seven-principle anti-slop site checklist | Brand, pain/person/promise, scroll, references, components, mobile, screenshots | FFWtxjvW2ts | MISSING | P2 |
| CTA-before-scroll roast | Main button visible before scrolling, repeated, unique color | workflows/seedance-site.md | PARTIAL | P2 |
| Scroll-scrub site from one continuous plate | One 720p shot split into frames that scroll position scrubs | gt8k4bA01Mo, workflows/seedance-site.md, FFWtxjvW2ts | PARTIAL | P2 |
| Two AI frames to clip to scrollable hero | Cheap fake-3D hero | x:2074158868142194898, 2074158868142194898 | PARTIAL | P3 |
| Pose/depth previs before a render | Cheap blocking pass before a long render | x:2073423288882090405, x:2074108067361280173, 2073423288882090405 | MISSING | P3 |
| Offline plate vs interactive world classifier | Route "3D video" requests | workflows/offline-plate-vs-world.md | PARTIAL | P3 |
| Motion stack checklist | Image, animate, upscale, grade, timing | 2075192866553413944 | PARTIAL | P3 |
| Reference to editable vector layers | Break a reference into layers you can animate | 2077016770939122149 | PARTIAL | P3 |
| Video rendered through an MCP, no editor | Video produced through tool calls | 2088258814554390943 | PARTIAL | P2 |
| Title audit (click + SEO scores) | 5 rewrites; keyword first | FHsY924cEAk | PARTIAL | P3 |
| Transcript to SEO description | Links above the fold | FHsY924cEAk | PARTIAL | P3 |
| Chapters from a timestamped transcript | Teaser chapters, A/B tested | FHsY924cEAk | PARTIAL | P3 |
| Pinned comment draft | Question + link | FHsY924cEAk | PARTIAL | P3 |
| Comment screenshots to draft replies | Replies wait for approval | FHsY924cEAk | PARTIAL | P3 |
| Go-live community post | Curiosity copy + thumbnail | FHsY924cEAk | PARTIAL | P3 |
| Transcript to 3 clip moments | Exact cut points | FHsY924cEAk | PARTIAL | P2 |
| End-screen next-video pitch | Cliffhanger into the next video | FHsY924cEAk | PARTIAL | P3 |
| Call recording to tension-start clips | Split by speaker, start at the tensest moment, strip filler | rMf-JuikR-Q | PARTIAL | P3 |
| Real office files as deliverables | xlsx/pptx/docx/pdf, saved and opened | ZRb7D6R64hM | PARTIAL | P2 |
| Hosted artifacts / mini-apps | Live-URL reports and tools | ZRb7D6R64hM, jdbOVepEtUE | MISSING | P3 |
| Inline throwaway visuals | Quick charts that aren't saved | ZRb7D6R64hM | PARTIAL | P3 |
| Analysis passed from spreadsheet to deck | GridCraft to DeckCraft | ZRb7D6R64hM | PARTIAL | P3 |
| Component prompt scoped to one element | 21st.dev prompt on selected divs only, then iterate | jdbOVepEtUE, tFFKuq2t0rI | PARTIAL | P2 |
| Direct style edits without a model | Change CSS/properties by hand | tFFKuq2t0rI | HAVE | P3 |
| Style preset spec in UI prompts | Neo-brutalism, glassmorphism and similar | tFFKuq2t0rI | PARTIAL | P3 |
| Phone photos to product ad via creative MCP | Several reference photos + a skill | lRUpu2-KtGQ | PARTIAL | P3 |
| One-prompt brand + per-product asset pack | Research, brand, catalog, assets for each product | xn6Z5PYyAIE | PARTIAL | P3 |
| Debug a filter block by printing the prompt | Find trigger words, save them to memory | xn6Z5PYyAIE | PARTIAL | P2 |
| Creative test matrix written to a named sheet | Output goes to a named place, not chat | xn6Z5PYyAIE | PARTIAL | P3 |
| Founder video from keys found in .env | A risk pattern to block | R0qF17BVl9w | NOT_FOR_JARVIS | P2 |
| Fact-check the primary source before scripting | Check every claim first | ONmaDdOBGig | PARTIAL | P1 |
| View count is not value | Rank by method value, not engagement | w9-gfaV5vlM | PARTIAL | P3 |
| Research newsletter with cited sections + approval | Fixed query, cited sections, HTML editor, human approves | pxzo2lXhWJE, upgrades/nate-82/publishing-engine.md | PARTIAL | P2 |
| Share card after a ship, then stop | Update title/hook/url; Evens publishes | product-factory/PROMOTION.md, product-factory/SHARE-CARD.md | MISSING | P3 |
| Clip factory: reference lock + generation log | Log every generation; stop at packaging | workflows/creator-longform.md | PARTIAL | P2 |
| Repurpose YouTube to Spotify | Second distribution channel (publishing) | 2073432082458517827 | NOT_FOR_JARVIS | P3 |
| Single image to sprite sheets | Game asset generation | 2072364163054395409 | NOT_FOR_JARVIS | P3 |
| Demo in a browser tab | Ship proofs as one clickable page | 2073320835658772937 | PARTIAL | P3 |
| UE5 anime toon shader | Style reference only | 2073722809063543275 | NOT_FOR_JARVIS | P3 |
| AKIRA-style effect in After Effects | Craft reference only | 2072633456505549070 | NOT_FOR_JARVIS | P3 |
| Poster-on-paper mockup | PhotoCraft mockup for reviews | 2085380194081100244 | PARTIAL | P3 |

### Top 5 to build next

1. **Voice profile + AI-phrase kill list, applied to every draft (MISSING, P1).**
   - Collect his real messages and transcripts. Run the style-analyzer prompt to get his voice, rhythm, structure, sign-offs, phrases he uses and phrases he never uses.
   - Save the result as a versioned skill file under his tiny-active or skills folder.
   - Add a pre-show hook that lints every draft against the kill list and blocks it on a hit.
   - When Evens says a draft "sounds like AI", that phrase gets appended to the kill list.
   - Needs the missing skills-library loading and hooks.

2. **Brand + design grounding before any visual job (PARTIAL/MISSING, P1).**
   - Pick one brand_assets/ path holding the logo, guidelines, font and icon pack, plus one design-token file.
   - Every design or site job loads the frontend-design skill and these paths first, and passes them to any delegate.
   - Jarvis opens 1 to 3 named references in Safari and writes their signature motion into the spec.
   - Gates: a named non-default font, one icon pack, and the seven-principle checklist with the CTA-before-scroll roast run as screenshot checks.

3. **Independent media verifier before "done" (MISSING, P1).**
   - A separate checker process, never the builder grading itself.
   - It extracts frame 0 and the last frame with ffmpeg and shows them beside the source still (product lock).
   - It flags elements outside the frame bounds and checks that graphics line up with word timestamps.
   - It runs an OCR legibility check on on-screen text.
   - It writes a side-by-side capture as live-match evidence. Taste stays with Evens.

4. **Cheap previews, Evens picks, then the final render, with a cost gate and generation log (PARTIAL, P1).**
   - Any image or video job first makes N low-res or owned-tool (ArtCraft) proofs into the job folder and asks Evens to pick, using ask-then-resume.
   - Only after his pick does Jarvis quote the paid final render and wait for his OK.
   - Every generation is logged (prompt, model, cost, file).
   - Model restrictions and filter trigger words go to procedural memory.
   - Unrequested extra attempts are labeled secondary.

5. **Transcript-driven video pipeline (PARTIAL/MISSING, P1).**
   - Add signal ingestion: pull a YouTube transcript (with timestamps), frames and contact sheets into a packet.
   - Run one local word-level ASR for his own footage, never more than one ASR at a time.
   - Mark the explaining beats and render one sourced graphic per beat in HyperFrames/Remotion, keyed to phrases.
   - Fact-check claims against the primary source.
   - Run the verifier from item 3, cap time and cost, and stop at packaging. Publishing stays with Evens.

All five also need "resume after reboot" for long unattended runs.

Not checked: whether a local word-level ASR is actually installed on the Mac, and which ArtCraft MCPs Jarvis's mcp tool really reaches. Their status is inferred from the harness description, not tested live.

## Cost-ops

Cost-ops covers how Jarvis keeps spending bounded and visible: per-job budgets and receipts, model and effort routing, prompt-cache and context hygiene, caps on loops and fan-out, quotas, and spend gates on keys, public endpoints and paid media. The 104 raw entries merge into 51 methods. Every source id is kept. Some multi-habit sources, such as jdbOVepEtUE's tier lists, appear under more than one method. Vendor prices and ratios in the sources are claims and stay UNVERIFIED until Jarvis measures them.

Jarvis already has a per-job cost meter, Jev tier routing with escalation, prompt caching, lean context (the last 3 screenshots), a repetition brake and held pay/send/delete buttons. The main gaps are hard per-job budgets that wrap up cleanly, full receipts (time, correctness, cache split), sensitivity-aware routing, held key/subscription creation, resuming after a reboot, caching expensive step outputs, and fan-out caps for when sub-agents exist.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Per-job budget with graceful wrap-up | Time, token and $ cap per job, no open-ended loops, handoff when the budget runs out | EuzYhzB0vbI, ZRb7D6R64hM, dYrrEKXtttk, upgrades/nate-82/personal-cfo.md | PARTIAL | P1 |
| Per-job cost receipt | Tokens, duration, $ and correctness written for each finished job | EthxaDswUFo, jdbOVepEtUE, upgrades/nate-82/money-desk.md | PARTIAL | P1 |
| Sensitivity-aware routing / no free tiers that train on inputs | Private data goes only to approved or local models, never to tiers that train on inputs | 8QQ_INxAhRs, Qt3zMBH-FNg | PARTIAL | P1 |
| Key or subscription creation is a spend event | Ask Evens before creating any API key, seat or plan | upgrades/nate-82/personal-cfo.md | PARTIAL | P1 |
| Mac-local schedules are best-effort; resume after reboot | A local cron dies when the machine sleeps or restarts; check the host and resume | 3TdD8Qv5Tk8 | MISSING | P1 |
| Vault-not-prompt secrets | Keys stay in env/keychain, never in prompts, logs or state | upgrades/nate-82/CLUSTER-ops.md | PARTIAL | P1 |
| Cache expensive step outputs | Pin research and model outputs so retries and debugging don't pay again | 0Ujdys4LqNs, HN0oWxbF2bM, tDGiWn0flK8, upgrades/nate-82/CLUSTER-gtm.md | MISSING | P2 |
| Route by cost per finished job | Compare quality, latency and total tokens, not price per token; on a quality tie, pick the cheaper option | 2J3uX8iRNng, EthxaDswUFo, GpSqBjW6hR4, RLjaUES9P8A | PARTIAL | P2 |
| Local cost report from session logs | Totals from logs (including sub-agents and the cache read/write split), not the UI widget | 2J3uX8iRNng, 6cEQEba0i2A, J_jswzXhYJA, RLjaUES9P8A, jdbOVepEtUE, q5lg3npxjAc | PARTIAL | P2 |
| Plan quota and burn monitoring | 5-hour, weekly and per-model meters; premium burn; off-peak bulk work | 2OD14-0cot4, GpSqBjW6hR4, ONmaDdOBGig, i4Q8wHZNPBU, jdbOVepEtUE, 8QQ_INxAhRs | MISSING | P2 |
| Stable prefix for prompt cache | Keep system prompt, tools and model fixed within a session; volatile data goes last | 6cEQEba0i2A, jdbOVepEtUE, ZRb7D6R64hM | PARTIAL | P2 |
| Cache-TTL-aware idle resume | After an idle gap longer than the TTL, start a compact fresh session instead of resending full history | 6cEQEba0i2A, jdbOVepEtUE | MISSING | P2 |
| One task per context | Clear or hand off on topic switch; batch instructions; plan before acting | 6cEQEba0i2A, jdbOVepEtUE | PARTIAL | P2 |
| Compact or hand off at a context threshold | Compact or reset at a fixed fill level, before quality decays | 3TdD8Qv5Tk8, ZRb7D6R64hM, iTY8Q449YNQ, jdbOVepEtUE | PARTIAL | P2 |
| Effort cap (default medium/high) | Max effort costs more and can overthink or over-test; ultra modes stay off | U6k4MeVks_Y, XTBWVVcF3Pk, EthxaDswUFo, jZgcWCzxh1I | PARTIAL | P2 |
| Fan-out cap and bounded scope | Fixed worker count, named deliverable and paths, cheap worker tier | Tj3018n5MVg, U6k4MeVks_Y, e18sdZLwP7o, jdbOVepEtUE, jZgcWCzxh1I, upgrades/nate-82/personal-cfo.md | MISSING | P2 |
| Max turns per sub-worker | Hard turn/step limit per worker | e18sdZLwP7o | MISSING | P2 |
| Live worker view with kill switch | List running workers with model, tokens and time; stop runaways | jZgcWCzxh1I | MISSING | P2 |
| Cheap-model bulk reader | A small model digests long documents; the main loop sees only the summary | e18sdZLwP7o | MISSING | P2 |
| Lazy tool loading | Load MCP/tool schemas only when needed; drop unused servers | U6k4MeVks_Y, jdbOVepEtUE | MISSING | P2 |
| Public endpoint is a credit hose | No public or unauthenticated paid-model surface without domain lock, rate limit, duration cap or auth | -cdexJWN8YA, tFFKuq2t0rI, workflows/owner-coach-fitness.md, workflows/restaurant.md | PARTIAL | P2 |
| Key scope check and per-key spend cap | Check scopes when a call "succeeds" but does nothing; named, capped keys per agent/project | -cdexJWN8YA, gb5TlGw6Uks, jdbOVepEtUE | PARTIAL | P2 |
| Per-unit quote before spend | Per-image/second/piece cost per option, track trial credits, wait for OK | AYsg5gAMWyo, jBanaNBY-sM, zWLZ3bVVwD8 | PARTIAL | P2 |
| Spend cap plus fallback provider per scheduled job | Name the worst case, cap spend, define a fallback model/harness | jdbOVepEtUE, kB9iMD0EjT8 | PARTIAL | P2 |
| AI writes the script; plain code runs it | Recurring jobs become token-free scripts; the model runs only on exceptions | i4Q8wHZNPBU | PARTIAL | P2 |
| Narrow input | Exact paths, minimal excerpts, narrow retrieval, truncated noisy output | 3TdD8Qv5Tk8, jdbOVepEtUE, kOKavHnlPik | PARTIAL | P3 |
| Context/model/effort status display | Visible model tier, effort and context % | RzLV8sfFdMM, vfWTyEreOEc, e18sdZLwP7o, jdbOVepEtUE | PARTIAL | P3 |
| Baseline startup context check | Record startup context size each session; alert on growth; keep the always-loaded file short | 8QQ_INxAhRs, jdbOVepEtUE | MISSING | P3 |
| Unchanging meter = anomaly | A token/context meter that stays still means routing or state is elsewhere; investigate | GpSqBjW6hR4 | MISSING | P3 |
| Cheap default, frontier on escalation | About 95% of calls on the open/cheap tier (source claim); frontier only for hard steps | 8MEJen0nblQ, jdbOVepEtUE | HAVE | P3 |
| Per-service API quotas | Record quotas per service; read the vendor error log before proposing a paid swap | YHk45NEpspE, BO-jFbN4p8Y | MISSING | P3 |
| Routine budget and run quotas | Budget scheduled runs against interactive use and platform caps | 3QclAjmu5Tw, ehg4fhydTgs | MISSING | P3 |
| Minimal context pack per background run | A thin repo or pack per routine instead of the whole vault | ehg4fhydTgs | PARTIAL | P3 |
| Verified price table | Per-token/storage/hourly prices and marketplace routes, labeled UNVERIFIED | Vb1SwBAn9cQ, Vm8QOo9MiC4, irg-2IfAjpo, lokbsA5VXOk | MISSING | P3 |
| Tokens and correctness per retrieval strategy | Same question through each method; vendor wins are hypotheses | QojPKL96Dx4, kOKavHnlPik | MISSING | P3 |
| Local state for small frequent writes | Prefer a local store over a rate-limited Sheets API | QCjMBOEhpLE | PARTIAL | P3 |
| Promo and inclusion windows | Note end dates, run bounded evals inside the window, avoid lock-in | -nG-9vlSkho, dYrrEKXtttk | MISSING | P3 |
| Subscription vs metered API comparison | Price real usage both ways | -nG-9vlSkho, 3TdD8Qv5Tk8 | MISSING | P3 |
| Vendor ToS check before harness routing | Some subscriptions can't be used through third-party harnesses | RLjaUES9P8A | MISSING | P3 |
| Browser over a paid API when cheaper or better | Use the existing browser session instead of a per-use API (ask on ToS risk) | CB5bG4mvnS0 | HAVE | P3 |
| Text-only reference docs | Strip images and convert to text before loading | 0YXjEzFfft8 | PARTIAL | P3 |
| Tiered tool inventory | S/A/specialist/experiment/graduated tiers | 35WuZxbAY68 | MISSING | P3 |
| Graduate a SaaS into an owned skill | Rebuild the narrow feature you use; drop the rent | 35WuZxbAY68 | PARTIAL | P3 |
| Per-turn token cap and low temperature | Bound voice-loop spend and keep answers predictable | zWLZ3bVVwD8 | PARTIAL | P3 |
| Bring your own provider keys | Owned keys via env instead of reseller markup | zWLZ3bVVwD8 | HAVE | P3 |
| Short applied-learnings list | One-line lessons from repeated failures, pruned | jdbOVepEtUE | HAVE | P3 |
| Session-metered hosted billing | Per-live-hour runtime billing note | 27Y44JYXZJ8 | NOT_FOR_JARVIS | P3 |
| Dual subscription bounce | Hold two plans and switch by task | 2OD14-0cot4 | NOT_FOR_JARVIS | P3 |
| Client account, client card | Production costs billed to the client | Lg5TYWPSg6M | NOT_FOR_JARVIS | P3 |
| Credit-to-dollar ROI per conversion | Lead-gen cost per conversion | zyvdl__Ywfk | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Per-job budget with graceful wrap-up (PARTIAL, P1).**
   - Add `budget = {wall_s, tokens, usd}` to the job record, with defaults set by Jev tier.
   - Check it in the operator loop after every tool call.
   - At 80%, inject a "wrap up" instruction. At 100%, stop and write a handoff (what's done, what's left, the receipt).
   - Have `say` the stop to Evens. Raising a budget needs `ask_owner`.
   - Add a regression test: a fake looping job must stop at its cap.
2. **Full per-job receipt (PARTIAL, P1).**
   - Extend the cost meter so each finished job writes tokens (input, output, cache read, cache write), wall time, $, model tier, escalations and a correctness field (unknown until the verifier exists).
   - Write it as an append-only JSONL line under the job's directory.
   - A zero-API script sums the receipts into a daily report. That covers the "local cost report" method as well.
3. **Sensitivity-aware routing (PARTIAL, P1).**
   - Tag each job's inputs as private when they come from screenshots of his Mac, Safari snapshots of logged-in pages, or files under his home directory.
   - Give Jev an allow-list of providers/tiers for private inputs, excluding free or training tiers. Jev refuses or downgrades to an allowed pool and logs why.
   - Test that a private screenshot job never reaches a disallowed pool.
4. **Key or subscription creation held as spend (PARTIAL, P1).**
   - Extend the Safari hold list from send/pay/delete to "create key", "generate token", "upgrade", "start trial" and "add seat" buttons and pages.
   - Before the click, Jarvis shows what will be created, the expected cost and the cap, then waits for `ask_owner`.
   - Never read back or echo the generated key value.
5. **Resume after reboot and host-awake check (MISSING, P1).**
   - Persist the job state (goal, step, last receipt, pending approvals) to disk after every step.
   - On launch, list unfinished jobs and ask Evens which to resume. Don't auto-run anything held for approval.
   - Mark any Mac-local schedule as best-effort, and record missed runs after sleep or restart instead of silently skipping them.
   - Live check: restart mid-job, then confirm the resume prompt and the state match.

Next after these: cache expensive step outputs to disk by key (P2), and build fan-out/max-turn caps together with sub-agents, never after them.

## Family: skills

This family covers how agents store a repeatable procedure as a named skill and then load it, trigger it, improve it, share it and keep it safe. The 100 raw entries merge into 56 methods. Most sources say the same few things. A skill is a markdown file whose YAML front matter holds a name and a "use when" description. The agent reads only that front matter until a request matches, then loads the body. Good skills come from a run that already worked, and they get patched after every use. Third-party skills need a safety check before install.

Jarvis today has procedural memory from finished jobs, but no skills library it loads or triggers. It also has no hooks, sub-agents, independent verifier or resume after reboot. So most of this family is PARTIAL or MISSING. No method is P0: nothing here stops Jarvis from doing what Evens asks on his Mac or browser today. The P1 items decide whether Jarvis gets faster and more consistent on repeated jobs. Evidence levels (said / shown / claimed) come from the sources and have not been checked against a live run.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Skill file format + progressive disclosure | SKILL.md with front matter (name, "use when") and a body that loads only on match | 3TdD8Qv5Tk8, RLjaUES9P8A, e18sdZLwP7o, gb5TlGw6Uks, jdbOVepEtUE | MISSING | P1 |
| Promote a finished, liked run to a skill | Retro on the session (what we did, tools, questions), then save it as a skill | 0WDkwMxj13s, 3TdD8Qv5Tk8, 8QQ_INxAhRs, Tj3018n5MVg, U6k4MeVks_Y, XTBWVVcF3Pk, gb5TlGw6Uks, jdbOVepEtUE, vFepZE_wrfg, xn6Z5PYyAIE, zyvdl__Ywfk, workflows/plan-mode-objective.md | PARTIAL | P1 |
| Patch the skill after every use (with approval) | Feedback on what was good or bad goes back into the skill; related docs are updated only on a yes | 0WDkwMxj13s, 8QQ_INxAhRs, e18sdZLwP7o, gb5TlGw6Uks, c0kaKxM2pHg | MISSING | P1 |
| Replay a browser flow as a parameterized skill | Run a Safari click path once, save steps and destination, replay it with a parameter | CB5bG4mvnS0 | PARTIAL | P1 |
| Session handoff skill | Four fields: what was discussed, active files, decisions, next steps | kB9iMD0EjT8, vfWTyEreOEc | PARTIAL | P1 |
| Self-QA baked into skills | Do not report until the browser stress test and visual pass are done | 3TdD8Qv5Tk8 | PARTIAL | P1 |
| Repeated prompt becomes a skill (2x rule) | Any prompt typed twice becomes a named skill; set user-only or agent invocation | 0WDkwMxj13s, 8QQ_INxAhRs, RzLV8sfFdMM, c0kaKxM2pHg, gb5TlGw6Uks, vfWTyEreOEc | MISSING | P2 |
| Forward-build with a skill factory | Describe the job or paste an SOP; skill-creator drafts, tests and packages it | 0WDkwMxj13s, eRS3CmvrOvA, gb5TlGw6Uks, jdbOVepEtUE | MISSING | P2 |
| Build from real process docs | Give the agent past outputs, the template and a checklist of where each number comes from; iterate, then wrap as a skill | vY0EzTP-7EA | MISSING | P2 |
| Skill candidate, never auto-install | Learned fragment attached to an existing capability, status UNTESTED, do_not_auto_install | skill-candidates/INDEX.md | MISSING | P2 |
| Semantic goals, not coordinates | UI skills store the target's meaning and the expected state, never x,y | SIGNAL-TRAIN-LOOP.md | PARTIAL | P2 |
| Global vs project-local scope | General skills global, job-specific ones in the project (versioned) | 0WDkwMxj13s, 3TdD8Qv5Tk8, jZgcWCzxh1I | MISSING | P2 |
| Trigger tuning from misfires | Keep descriptions to 1-2 lines with trigger phrases; rewrite after a miss or false fire | e18sdZLwP7o, gb5TlGw6Uks | MISSING | P2 |
| Resolve overlapping skills | Name the exact skill, or make one delegate to the other | U6k4MeVks_Y, e18sdZLwP7o | MISSING | P2 |
| Verify the skill actually fired | Watch the "invoked skill" line; re-register new skills; use the exact name | xn6Z5PYyAIE | MISSING | P2 |
| Vetted install of third-party skills | Install from a hub, URL, zip or plugin only after a read-only injection scan and the install gate | U6k4MeVks_Y, gb5TlGw6Uks, jdbOVepEtUE, lRUpu2-KtGQ, pbrln2TVeh4 | MISSING | P2 |
| Search or reuse before building | Check existing MCP servers and skills first; otherwise split the problem into its inputs and build | 8MEJen0nblQ, ZRb7D6R64hM | PARTIAL | P2 |
| Grill-me interview skill | One question at a time, each with a recommended answer; read files instead of asking; save every answer to brainstorms/ | 8QQ_INxAhRs, DTCyvo6cC54, c0kaKxM2pHg, jdbOVepEtUE | PARTIAL | P2 |
| Retest skills on model change | When the model changes, re-run skills against a golden set | XNQBCRcwXV4 | MISSING | P2 |
| Thin choreography, keep routing context | Store paths, preferences and must-includes, not micromanaged steps | XNQBCRcwXV4 | PARTIAL | P2 |
| Export frontier judgment as a skill | Frontier model writes a "careful mode" skill for cheaper models to load | XTBWVVcF3Pk | MISSING | P2 |
| Custom planning skill | Owned plan procedure with set questioning, research and plan sections | RzLV8sfFdMM | MISSING | P2 |
| Hooks that propose skill and rule improvements | At session end, propose one improvement; never apply it | RzLV8sfFdMM | MISSING | P2 |
| Read-only self-audit skill | Check routing and index claims against disk, write a dated report, wait for approval | Ek1NBfnnTH0 | MISSING | P2 |
| Inbox-triage skill, brief first | Read-only first; learn sender rules from corrections; act only after confirmation | jdbOVepEtUE | PARTIAL | P2 |
| Reproduce the result, not the vendor | Map vendor steps from the video to owned tools | workflows/human-name-then-combine.md | PARTIAL | P2 |
| Teach-a-task by demonstration | Record Evens doing a task and turn it into a skill | PQBYZQqan2g | MISSING | P2 |
| Multi-persona research (storm) | Persona sub-agents gather, a second pass revises, findings tagged by who supports or challenges | 2OD14-0cot4 | MISSING | P2 |
| Roast council before building | 3 intake questions, 5 persona sub-agents, judge verdict, cheapest 48h test | iTY8Q449YNQ | MISSING | P2 |
| Portable skill folders across harnesses | One source library, symlinked into each harness's expected folder | Tj3018n5MVg, jdbOVepEtUE, IMPLEMENTATION_MAP.md | MISSING | P2 |
| Invoke skills by natural language | "Run a storm research on X" with no slash command | Tj3018n5MVg | MISSING | P2 |
| Front-load extraction | Interview fully before writing a skill so the first draft starts high (claimed %, unverified) | c0kaKxM2pHg | PARTIAL | P3 |
| Onboarding-interview first run | Interview the user, list connectors, audit setup | 0WDkwMxj13s | MISSING | P3 |
| Brainstorm skill before build | Use an existing brainstorming procedure in plan mode | -cdexJWN8YA | MISSING | P3 |
| Phase-0 scoping inside a skill | State the inferred topic and reader; ask only when the gap changes the result | Tj3018n5MVg | PARTIAL | P3 |
| Tailor research skill to the business | Inject current priorities; end with "what we do differently" | Tj3018n5MVg | MISSING | P3 |
| Portable project setup file | One md for operating rules, layers and file structure that another agent can rebuild from | 3GAxd90fEE4, zyvdl__Ywfk | PARTIAL | P3 |
| Agent reads docs to write front matter | Fetch current docs before generating a config | e18sdZLwP7o | PARTIAL | P3 |
| Skill vs plugin classification | Instructions only, or runtime-changing (hooks or MCP), which needs review | eRS3CmvrOvA | MISSING | P3 |
| Tool and skill inventory | List installed CLIs and skills before picking one | YHk45NEpspE | PARTIAL | P3 |
| Until-condition commands | Package a job with its own stop condition | brB-hSiV2iU | PARTIAL | P3 |
| Package expertise with evals and connectors | Skill plus good/bad examples, a check and data sources | brB-hSiV2iU | MISSING | P3 |
| Small skills chained into systems | Narrow skills composed into pipelines, not one mega-skill | CB5bG4mvnS0, simon-scrapes-dossier.md | MISSING | P3 |
| Thin skill that routes to playbooks, scripts and sub-agents | Master SKILL.md loads references and delegates heavy steps | jdbOVepEtUE | MISSING | P3 |
| Curated small library (20-30) | Cap active skills; use progressive disclosure | simon-scrapes-dossier.md | MISSING | P3 |
| Parameterized data sources | Same pattern, swap the sources per context | LVAHYV4Xrto | MISSING | P3 |
| Offer distinct options, let Evens pick | 2+ variants or a menu of treatments before refining | FFWtxjvW2ts, RDytbVDzMF4 | PARTIAL | P3 |
| Closed vocabulary in tool schemas | Enums and formats for exact-match tools | kOKavHnlPik | PARTIAL | P3 |
| LLM-drafted prompts with tool-usage rules | Draft prompts with a model and lint that every tool has a "when to use" line | NO97pqqc10A, zWLZ3bVVwD8 | PARTIAL | P3 |
| Script-beat motion skill | Timed transcript, then animation moments, then graphics | RDytbVDzMF4 | MISSING | P3 |
| Match advice to workload | Tag signal methods with the source's context; test before adopting | XNQBCRcwXV4 | MISSING | P3 |
| Periodic delete-and-observe | Run without skills to see what the model does unaided | XNQBCRcwXV4 | NOT_FOR_JARVIS | P3 |
| Reference image to motion via vendor MCP | Image model, then video model, inside one skill | x:2074119000137601528 (social/x-snevemoney-bookmarks-ai), 2074119000137601528 | NOT_FOR_JARVIS | P3 |
| Run the template, trace each step | Execute once and inspect real inputs and outputs per step | 7UNsK9LoORo | PARTIAL | P3 |
| Explain to consolidate | After learning a method, write a short procedure | 8C6iCpJ9HPo | PARTIAL | P3 |
| Calculator tool for math | Do arithmetic in a tool, not in the model | NWbh5ZoEHkA | HAVE | P3 |

### Top 5 to build next

1. **Skills library loader (MISSING, P1).** Steps:
   - Pick one folder for skills (one SKILL.md per skill, with name and a 1-2 line "use when" in front matter).
   - At job start, put only the index of names and descriptions into context.
   - Load a skill's body only when Jarvis matches it, and log which skill fired on every job.
   - When two skills match, name the chosen one and say why.
   - Symlink the same folder into the Claude/Codex paths so the fleet shares it.
2. **Promote finished runs to skill candidates (PARTIAL, P1).** Steps:
   - When a job ends with Evens's approval, run a retro prompt over the transcript (what we did, tools used, questions asked, how it was proven).
   - Write a candidate with status UNTESTED and do_not_auto_install.
   - Dedupe it against existing skills.
   - Show Evens the diff, and install only on his yes.
3. **Patch-on-feedback loop (MISSING, P1).** Steps:
   - After each skill run, capture Evens's corrections and turn them into a proposed edit to that skill.
   - Use the 2x rule: the same correction twice triggers a patch proposal.
   - Apply only on approval, and keep a changelog per skill.
   - Re-run the skill's golden case whenever Jev's model pool changes.
4. **Browser and computer flows as parameterized skills (PARTIAL, P1).** Steps:
   - From a successful Safari job, save the steps as semantic targets (element role and text, expected page state), never coordinates.
   - Save the destination paths and the parameters (for example month or account).
   - Replay through the existing safari tool, keeping the send/pay/delete holds.
   - On a mismatch, fall back to snapshot-driven live operation and propose a patch.
5. **Handoff skill plus independent check before done (PARTIAL, P1).** Steps:
   - At every checkpoint and at job end, write the four-field handoff (discussion, active files, decisions, next steps) to disk, so a reboot or a model switch can resume from it.
   - Add a done-gate: for UI or browser artifacts, a fresh-context verifier (a different model tier) compares a fresh screenshot against the goal before Jarvis calls done.

Labels: these are proposals (PROPOSED). Statuses come from the 2026-10-16 harness description and were not verified live.

## Jev routing decisions

This family covers how Jarvis (through Jev) decides which model, effort level, tool or orchestration shape each piece of work gets. The sources agree on a few points. Route each step, not the whole job or the whole day. Use the frontier model to plan and judge, and cheaper models to gather, draft and execute. Try a script before an LLM and the lowest orchestration rung before an agent. Spend more only when the quality gap is worth it. Jarvis already covers the job-level part: Jev picks a tier per job, escalates on failure and tracks cost. It cannot yet split one job across tiers or roles, fan work out to sub-agents, check its work with an independent verifier, or survive a reboot. Every cost and share figure in the sources (20% dip, 80%+, 5-15%, 4-10%, "halves cost") is the speaker's claim and is not treated as fact here.

No method in this family is P0: none of these gaps stops Jarvis from doing what Evens asks on his Mac or in his browser today. They affect cost, quality and resilience.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Route per step, not per job | Split the job into steps and pick a model or tool for each step | 35WuZxbAY68, 2OD14-0cot4, patterns/INDEX.md | PARTIAL | P1 |
| Expensive orchestrator, cheap workers | The frontier model only plans, delegates and reviews; cheaper sub-agents execute and report back | 2J3uX8iRNng, 8QQ_INxAhRs, EthxaDswUFo, R0qF17BVl9w, XTBWVVcF3Pk, e18sdZLwP7o | MISSING | P1 |
| Plan / critique / execute on different models | Plan on a strong model, optionally critique, execute on a cheaper one | RLjaUES9P8A, ZRb7D6R64hM, david-ondrej-dossier.md | PARTIAL | P1 |
| Cheap bulk step, strong final step | Cheap model to classify, ingest or draft; strong model to write, polish or synthesize | HN0oWxbF2bM, pxzo2lXhWJE, hQvwMj7IJe4, 2OD14-0cot4 | PARTIAL | P2 |
| Deterministic first (vending vs slot machine) | Ask whether a step needs AI at all; scripts and plain workflows for predictable work, agents only for messy input | 3XIGcM7VICc, jdbOVepEtUE, LVAHYV4Xrto, tDGiWn0flK8 | PARTIAL | P1 |
| When to delegate / independence test | Delegate when there are many files, big output, a repeat job, independent parallel work or a need for a fresh reviewer; stay inline otherwise | e18sdZLwP7o, jdbOVepEtUE, jZgcWCzxh1I | MISSING | P1 |
| Pick scheduler by constraint (+ restart survival) | Cloud routine vs desktop task vs /loop, chosen by local files, machine-on, cadence and restart needs | ehg4fhydTgs, jdbOVepEtUE | MISSING | P1 |
| Two-speed: quick fetch vs verified run | Cheap single pass when raw data is enough; multi-pass with verification when quality matters | zyvdl__Ywfk | PARTIAL | P2 |
| Right-size the model / cheapest passing model | Don't pay for a 10 on a 5 task; route to the cheapest model that clears the task's bar | EthxaDswUFo, GpSqBjW6hR4, nQtogLs_dlg, gt8k4bA01Mo | PARTIAL | P2 |
| Token thrift can cost quality | Weigh the quality gap against the cost ratio; don't default to cheapest for showpiece work | EthxaDswUFo | PARTIAL | P2 |
| Task-type to model mapping | Route sub-tasks by a model's strengths (writing, coding, research, images, edgy questions) | 0YXjEzFfft8, GpSqBjW6hR4, RLjaUES9P8A, riley-brown-dossier.md | PARTIAL | P2 |
| Model routing table (cost / intelligence / taste) | A scored table of available models kept in context to choose delegates | XTBWVVcF3Pk | PARTIAL | P2 |
| Effort ladder | Medium by default, high for big builds, extra-high only when stuck; tune effort before switching models | 3TdD8Qv5Tk8, q5lg3npxjAc, vcU85OrwuV0 | PARTIAL | P2 |
| Stronger model at lower effort | Map effort levels across model generations; a new model at low effort may replace an old one at max effort | dYrrEKXtttk | MISSING | P3 |
| Effort budgeting by task size | Budget tool calls by request size: about 1 for a fact, 3-5 for medium, 5-10 for deep research | XTBWVVcF3Pk | PARTIAL | P2 |
| Model switch breaks cache | A mid-thread model switch rereads the full history with no cache hits; route at the start, or hand off with a compact summary | 6cEQEba0i2A | PARTIAL | P2 |
| Distill frontier run into a skill for cheaper model | Explore on frontier, capture as a skill, repeat on mid tier | ONmaDdOBGig | PARTIAL | P2 |
| Desk vs pocket split | Deep build goes to a coding agent at the desk; quick ops, check-ins and reminders go to the mobile/voice agent; no long coding over voice | PQBYZQqan2g, gb5TlGw6Uks | PARTIAL | P2 |
| Agent-feature ladder | Ask, then skill, sub-agent, team, /goal, workflow; climb only as needed | jZgcWCzxh1I | PARTIAL | P2 |
| Width vs depth | Loop-until-verified for one goal and fan-out for many pieces; never both without approval | jZgcWCzxh1I | MISSING | P2 |
| Mode gate (NO_ACTION when parked) | Check BUILDING/no-selling mode before any lead or outreach step | workflows/local-clinic.md | PARTIAL | P2 |
| Hosted vs self-hosted voice socket | Localhost first; production hosting is an architecture choice for Evens | Qt3zMBH-FNg | NOT_FOR_JARVIS | P2 |
| Layer pyramid / three-question tree | GPT, then workflow, AI workflow, agent; climb only when forced | 4OOS96i2gfI, upgrades/nate-82/big-boss.md | PARTIAL | P3 |
| Variable-pass retrieval | Let the agent choose 0..N retrieval passes, with a cap | 4OOS96i2gfI | HAVE | P3 |
| Stay interactive if you edit every run | Automate only after output is stable | upgrades/nate-82/day-planner.md | HAVE | P3 |
| Overkill check before a trigger | Don't build automation that manual work matches at low volume | HbsbqMQE-lI | PARTIAL | P3 |
| Native tool before custom workflow | Use built-in connectors first; custom round-trip only when needed | zWLZ3bVVwD8 | PARTIAL | P3 |
| Partial agent coverage | Always do the agent-doable share; hand trust-heavy steps to the human | 8ktcSaSTvxk | HAVE | P3 |
| Pin model for scheduled jobs | Set model and effort explicitly instead of trusting defaults | 3TdD8Qv5Tk8 | PARTIAL | P3 |
| Re-tune tiers when limits change | Loosen downgrading when budgets grow; keep context hygiene | 3QclAjmu5Tw | PARTIAL | P3 |
| Per-workspace engine selection | Folder or workspace config pins the provider route so experiments don't leak into the main setup | 2OD14-0cot4 | MISSING | P3 |
| Retrieval by what a human would do | Filter, SQL, full context or vector search, chosen by the question shape | kOKavHnlPik | MISSING | P3 |
| Persona debate panel | Capped multi-persona debate; Evens gets the transcript, not a decision | RzLV8sfFdMM | MISSING | P3 |
| One lane / one ship per session | Classify the session first; at most one deliverable, picked by Evens | workflows/us.md | PARTIAL | P3 |
| Pain-first tool adoption | Adopt a new tool only if it removes a current pain (e.g. BUS300) | 8MEJen0nblQ, jZgcWCzxh1I | PARTIAL | P3 |
| Productivity-dip rule for switches | Switch stacks only if the post-dip line ends higher; Evens decides | 35WuZxbAY68 | NOT_FOR_JARVIS | P3 |
| Kill on opportunity cost | Judge side bets against the main line; the keep/kill call is Evens's | I7mpF7_pnPM | NOT_FOR_JARVIS | P3 |
| NL builders for linear workflows only | Generators handle linear paths; multi-agent builds need hand-building | TDHFkKSTJ30 | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Per-step role routing (PARTIAL, P1).** Today Jev picks one tier per job.
   - Add a step-role field (gather / plan / execute / verify / polish) to each operator-loop step.
   - Have Jev return a tier per role. Plan and verify go to frontier; gather and execute go to cheap or mid.
   - Record each role's tier in the per-job cost meter so splits can be compared with an all-frontier run on the same task.
   - Do switches at step boundaries with a compact handoff rather than full history (method: Model switch breaks cache).
2. **Sub-agents with a delegate-or-inline gate (MISSING, P1).**
   - Add a sub-agent tool that takes a task, a tier and a read-only tool set, and returns only a summary to the main loop.
   - Gate each spawn on the checklist: many files or big output, a repeat job, independent pieces, or a need for a fresh reviewer. Stay inline for dependent steps, anything that needs full context, or anything that needs to ask Evens.
   - Cap concurrent workers at 3 (AGENT_RULES §24) and require approval before combining fan-out with a loop-until-done.
3. **Deterministic-first classifier (PARTIAL, P1).**
   - Before calling a model, ask Jev whether the step is deterministic.
   - If it is, run a shell script, or a procedure saved in procedural memory, without an LLM call.
   - Log each step as deterministic or reasoning so repeated reasoning steps can later be turned into scripts.
4. **Restart-safe scheduling and resume (MISSING, P1).** The Mac reboot that started this session is the case this fixes.
   - Persist job state (goal, step list, last completed step, approvals pending) to disk at each step.
   - Use launchd for recurring local-file jobs, not in-session loops, which die on restart.
   - On startup, list unfinished jobs and ask Evens before resuming any of them.
5. **Two-speed output with an independent verifier (PARTIAL, P2).**
   - Let Jev label each request "quick" (single cheap pass) or "verified".
   - For verified requests, run a separate verifier pass on a different model or a fresh context before `done`, checking against the stated goal.
   - Attach the verifier's evidence to the job record. The builder never grades its own work (AGENT_RULES §8).


## Models and AI (family: models-ai)

This family covers how to pick, combine, test and prompt models: which tier gets which step, how to compare models fairly, fallbacks when a provider fails, gateways for many models, prompting habits, and reading vendor claims. 65 raw entries were merged into 38 methods. True duplicates were merged and every source id was kept. Distinct variants stay separate, including the two opposite prompting stances ("say what to do" and "give a don't-list with a do-not-act gate"). The AI history entries are kept as background only.

Grading uses Jarvis's harness as of 2026-10-16. Jev already does tier routing, escalation, a per-job cost meter and the prompt cache, so many routing methods are HAVE or PARTIAL. The gaps are evaluation and redundancy: no golden-task replay, no same-task cross-model ledger, no cross-provider fallback on outage, no independent verifier, no sub-agents and no skills library. No method here was graded P0. Nothing in this family stops Jarvis from doing what Evens asks on his Mac or browser today. The gaps affect quality, cost and resilience.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Tier selection by cost and capability | Small tier for bulk work, mid tier as default, frontier for hard reasoning; output tokens cost more | jdbOVepEtUE | HAVE | P3 |
| Per-step model routing (planner, reasoner, stylist) | Cheap model plans or formats, a reasoning model thinks, a writer model formats; separate calls | 0Ujdys4LqNs, tFFKuq2t0rI | PARTIAL | P2 |
| Model per sub-agent | Cheap tiers for gather sub-agents, frontier for synthesis | Tj3018n5MVg | MISSING | P2 |
| Cheap or local models wrapped as skills | Expose a cheap or local model call as a skill | U6k4MeVks_Y | MISSING | P3 |
| Effort capped at high; change model, not effort | Default effort is high; a higher mode overthinks and costs more | J_jswzXhYJA, jdbOVepEtUE | PARTIAL | P2 |
| Same-prompt, same-harness bakeoff with ledger | Same task on each model; record cost, time and tokens; ask whether the price multiple is worth it | 2J3uX8iRNng, 2OD14-0cot4 | PARTIAL | P1 |
| Compare the wrapper, not just the model | Record the harness, skills and context with every model result | brB-hSiV2iU | PARTIAL | P2 |
| Golden-task replay on a new model / default first, swap after eval | Run your own regular tasks on a new model before routing real work to it | 2J3uX8iRNng, X80ljdCPM_U | MISSING | P1 |
| Open creative probe | An open-ended creative goal to see a model's taste and range | 2OD14-0cot4 | MISSING | P3 |
| Harness-free diagram test (render and check) | Ask for Excalidraw JSON, render it, spot errors that a check would catch | 2J3uX8iRNng | PARTIAL | P1 |
| Primary plus cross-provider fallback | Fallback model on a different provider; memory keyed by chat id | 7UNsK9LoORo, jBanaNBY-sM | PARTIAL | P1 |
| Fall back to the previous model version | Keep the prior version as a route when a new one degrades | XNQBCRcwXV4 | PARTIAL | P2 |
| Model-agnostic harness / open-weights hedge | Model = engine, harness = car, human = driver; keep memory and procedures portable; open models as a hedge | 2OD14-0cot4, XTBWVVcF3Pk, jdbOVepEtUE | PARTIAL | P2 |
| Closed vs local compute tradeoff | Check RAM/VRAM before running a model locally | 3QclAjmu5Tw | PARTIAL | P3 |
| One gateway credential for many models | One OpenRouter-style credential reused across nodes and agents; billing in one place | tFFKuq2t0rI, Vb1SwBAn9cQ, EiHVBPyvTiE | HAVE | P3 |
| Route around a native-integration bug | Isolate by testing the prior model, then retry through the router | X80ljdCPM_U | PARTIAL | P2 |
| Read real provider limits at call time | Context window and price differ between the router and the vendor | X80ljdCPM_U | MISSING | P3 |
| Native-only provider features | Responses API built-in tools are not exposed through aggregators | lokbsA5VXOk | MISSING | P3 |
| Provider built-in web/file search with domain limits | Model-native search with context size, location and allowed domains | lokbsA5VXOk | PARTIAL | P3 |
| Try a newer same-family model before calling a feature broken | The domain filter failed on GPT-4.1 and worked on GPT-5 mini | lokbsA5VXOk | MISSING | P3 |
| Responses API extras (cache key, metadata, service tier) | Prompt cache keys and metadata tags for cost and tracing; keep memory local | lokbsA5VXOk | PARTIAL | P3 |
| Subscription inference via OAuth device code | Use a ChatGPT subscription through Codex login instead of metered keys | gb5TlGw6Uks | PARTIAL | P3 |
| Media-generation gateway | One aggregator for image and video models; test in the playground first; fast variants; cost gate | 35WuZxbAY68, AYsg5gAMWyo, 7UNsK9LoORo | MISSING | P2 |
| Classify video-model jobs | Offline diffusion clip vs real-time autoregressive world model | iRBs8PCBCaA | PARTIAL | P3 |
| Camera-pose control of a world model | Speculative phone-pose input to a world model | iRBs8PCBCaA | NOT_FOR_JARVIS | P3 |
| Voice LLM chosen on latency and cost | Measure latency on the real surface; A/B model swaps on test calls; check instruction following | -cdexJWN8YA, zWLZ3bVVwD8, y-cq_Qo4zVo | PARTIAL | P1 |
| Prompt edits as a diff, then test | Generate the edit, review struck and added text, accept only after a test | y-cq_Qo4zVo | MISSING | P2 |
| Context "dumb-zone" handoff | Write a handoff and start fresh before quality decays, instead of compacting | RzLV8sfFdMM | PARTIAL | P1 |
| Give the why (intent, audience, purpose) | Attach the reason, the bigger task and the audience to each request or constraint | 8QQ_INxAhRs, q5lg3npxjAc, vcU85OrwuV0 | PARTIAL | P2 |
| Say what to do, not what not to do | Rewrite don'ts as positive targets | q5lg3npxjAc | PARTIAL | P3 |
| Don't-list with a do-not-act gate | For questions, the deliverable is the assessment; no fix, send, edit or delete until go | vcU85OrwuV0 | HAVE | P3 |
| Say less, not more | A short steer plus the why; detail lives in skills and memory | vcU85OrwuV0 | PARTIAL | P3 |
| No standing "explain your reasoning" line | Ask for conclusions plus evidence; on one model the line can cause refusals | vcU85OrwuV0 | PARTIAL | P3 |
| Observable-behavior specs | Turn vague adjectives into black-and-white checks | rMf-JuikR-Q | PARTIAL | P2 |
| Ask to explain or test, not for an opinion | Avoid sycophancy by turning "is this good?" into a test | RzLV8sfFdMM | PARTIAL | P2 |
| Treat vendor benchmarks and launch posts as claims | Pick benchmarks that fit the job; read access, price and date windows; tag numbers UNVERIFIED | UCKLHU5AkEM, Vb1SwBAn9cQ, dYrrEKXtttk | PARTIAL | P2 |
| Price tier as a capability tell | Benchmark a new model against the same-priced peer | EthxaDswUFo | MISSING | P3 |
| Classify a "frontier killer": base model or orchestrator | Is it a new LLM or a conductor over existing models? | GpSqBjW6hR4 | MISSING | P3 |
| Fusion vs split-and-delegate | Broadcast plus judge for one high-stakes answer; split and delegate for multi-part tasks | GpSqBjW6hR4 | MISSING | P2 |
| Managed file search instead of custom RAG (claim) | Managed embeddings store; the cost claim is unexplained | KVFfApQZhE4 | MISSING | P3 |
| Diagnose method vs compute vs data | Before rewriting a failing capability, find which of the three blocks it | NHFbAg2b54U | PARTIAL | P3 |
| Give the goal, not micro-steps (AlexNet lesson) | Let the model choose the approach, then verify the result | NHFbAg2b54U | PARTIAL | P3 |
| Backprop as a post-mortem analogy | Assign a failed run's error to the steps that caused it | NHFbAg2b54U | PARTIAL | P3 |
| Perceptron and transformer history | Background knowledge | NHFbAg2b54U | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Golden-task replay plus same-task ledger (MISSING/PARTIAL, P1).**
   1. Pick a small fixed set of real Jarvis jobs from procedural memory: a Safari form, a file task, a computer-tool click path and a summary.
   2. Write a runner that replays each job on candidate models with the same harness. Log model, harness version, cost, wall time, input/output tokens and pass/fail in a ledger file.
   3. Jev reads the ledger before promoting a model into a pool.
   4. A new model gets real work only after its replay. Results stay "evidence" until Watchdog re-runs them.
2. **Cross-provider fallback (PARTIAL, P1).**
   1. For each Jev pool, define a fallback on a different vendor.
   2. On provider error or timeout, retry once on that fallback and log it in the cost meter.
   3. Keep the prior model version available as a route.
   4. Test by forcing a provider failure on a dev route, never on live :4018.
3. **Independent check before done: render and verify, explain or test (MISSING verifier, P1).**
   1. Before `done`, a separate cheap-tier verifier call gets the goal, the observable acceptance checks and the final screenshot or artifact. It answers pass or fail with evidence.
   2. Diagrams and pages are rendered and screenshot-checked.
   3. "Does this look right?" becomes a concrete check, not an opinion.
   4. Vague feedback from Evens is stored as observable criteria.
4. **Voice-turn latency routing (PARTIAL, P1, BUS300-adjacent).**
   1. Measure end-to-end turn latency on the real Face surface, not localhost.
   2. Have Jev pick a low-latency tier for voice turns.
   3. A/B any voice model swap on recorded test calls. Listen for repeated filler phrases and check instruction following.
   4. Any change to live Jarvis needs Evens's OK (rule 17a).
5. **Context-budget handoff plus resume (PARTIAL, P1).**
   1. Track tokens per job.
   2. At a per-model budget (set from Jarvis's own runs, not vendor numbers), write a handoff file and continue in a fresh context instead of compacting.
   3. Use the same handoff file to resume after a reboot.

Not checked: the vendor prices, benchmark figures and context-window numbers in the sources are unverified claims. Status grades rest on the harness summary given, not on reading Jarvis code.

## MCP connectors

This family covers how an agent reaches outside services: through MCP servers, OAuth connectors, CLIs or raw APIs, and how to keep that access narrow and safe. There were 61 raw methods across about 30 sources. They merge into 27 methods. Most sources agree on four points:
- Check what already exists (connector, CLI, MCP) before writing glue code.
- Expose only an allowlist of narrow, single-verb tools.
- Keep keys in a vault or env var, never in a prompt.
- After connecting, ask the connector what it can actually see and do.

Jarvis already has a generic `mcp` tool, shell, web fetch and Safari/computer fallbacks, so it can use connectors. What it lacks is the policy around them: per-tool side-effect gates, a capability inventory, a skills library for CLI wrappers, and an independent verifier. Nothing here is P0, because Jarvis can still finish Evens's Mac/browser asks through Safari or the computer tool. The P1 items make connector use safe and cheap.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Connection inventory, then connect one at a time | List where you look each week (revenue, customers, calendar, comms, tasks, meetings, knowledge, plus tabs and bookmarks), then wire the tier-1 sources one by one | 0WDkwMxj13s, 8QQ_INxAhRs, jdbOVepEtUE | PARTIAL | P2 |
| Credentials in a vault or named credential, never in the prompt | OAuth connectors or named credentials (vault, n8n Bearer credential, Integrations page) hold the auth. Keys go in env vars and are never pasted | 27Y44JYXZJ8, ZRb7D6R64hM, ehg4fhydTgs, zWLZ3bVVwD8, BO-jFbN4p8Y, EiHVBPyvTiE | PARTIAL | P1 |
| Scoped, read-only key per agent | Dedicated least-privilege key per connector; no edit, delete or team scope | 8QQ_INxAhRs | PARTIAL | P2 |
| Keys in .env so integrations survive a harness switch | Desktop connectors are tied to one app; env vars plus scripts in a folder carry over | jdbOVepEtUE | PARTIAL | P3 |
| Install an MCP from the vendor command or by asking the agent | Copy the vendor's `mcp add` command or ask the agent/marketplace to add it, then confirm it shows as configured | 3GAxd90fEE4, lRUpu2-KtGQ | PARTIAL | P2 |
| Add a remote MCP as a custom connector, OAuth by owner, verify it is on | Paste the remote URL, owner completes OAuth (copy the full link if wrapping breaks it), set per-tool permissions, confirm it is toggled on before use | gt8k4bA01Mo, xn6Z5PYyAIE, zyvdl__Ywfk | PARTIAL | P2 |
| Integration route check: connector, plugin/MCP or CLI before raw glue | Search existing connectors and plugins first; fall back to API/OAuth only when none exists | 3TdD8Qv5Tk8, U6k4MeVks_Y | PARTIAL | P2 |
| CLI-first tier: CLI, then API, then MCP | MCP schemas cost context every session; prefer CLI, wrap the API as a CLI, MCP last | YHk45NEpspE, 8QQ_INxAhRs, jdbOVepEtUE, xn6Z5PYyAIE, ZRb7D6R64hM | PARTIAL | P2 |
| Skill + CLI for each platform | A CLI plus a skill explaining when and how to use it (gh, gws, browser CLI) | RzLV8sfFdMM, vfWTyEreOEc | MISSING | P1 |
| Wrap your own APIs into CLIs | Turn APIs you already call into small local CLIs with keys from env, then add a skill | YHk45NEpspE | MISSING | P2 |
| Defer MCP tool loading | Load MCP tool schemas on demand, not at session start (vendor claims large savings) | ZRb7D6R64hM | PARTIAL | P2 |
| One broad MCP per domain ("supermarket") | One server bundling many actions; the model picks tool and parameters | 3GAxd90fEE4 | PARTIAL | P3 |
| Connect any tool from its API docs | Find the official docs, list the exact endpoints, owner supplies a scoped key via env, test, save the recipe; handle retries, pagination and rate limits | 8QQ_INxAhRs, AO5aW01DKHo, jdbOVepEtUE | PARTIAL | P2 |
| Least-privilege allowlist; never instance-wide execute or always-allow | Only hand-enabled, assigned tools are exposed. Execute-anything plus always-allow is a wide blast radius; send/pay/delete get allow-once | 5p5cV0yVDvQ, 9IzGe0BBj_c, upgrades/nate-82/CLUSTER-gtm.md | PARTIAL | P1 |
| Anti-pattern: drop auth to make a connector work | n8n MCP trigger with no auth pasted into ChatGPT/Vapi; escalate instead | 5p5cV0yVDvQ | HAVE (rule 6) | P3 |
| Discover, read schema, then execute with allow-once | search tools, then get details/input schema, then execute after human allow-once; check the result exists | mPflFTQUCGk, 5p5cV0yVDvQ, upgrades/nate-82/librarian.md | PARTIAL | P1 |
| Tool description is the routing contract | Write each tool's name, purpose and input fields so a stranger model can call it correctly | 5p5cV0yVDvQ, 9IzGe0BBj_c, upgrades/nate-82/librarian.md | PARTIAL | P2 |
| Single-verb tools, read and write split | One state change per tool with a verb name (lookup, book, update, delete); separate read (availability) from write (create), with matching settings | glM8godEcic, zWLZ3bVVwD8 | PARTIAL | P2 |
| Post-connect capability inventory | Ask the connector what it can see and do; tag each action read/write, credit-cost, risk; report scope gaps | zyvdl__Ywfk, PQBYZQqan2g | MISSING | P1 |
| Coverage map: MCP vs UI gap handoff | Record which steps the MCP cannot do and do them in the UI, flagged | zyvdl__Ywfk | PARTIAL | P1 |
| Multiple accounts per connector | Add a second named connection (default + work) when one account cannot see everything | PQBYZQqan2g | MISSING | P3 |
| n8n MCP bridge (instance-level, Claude/Claude Code) | Turn on n8n MCP access, connect via OAuth, get search/details/execute tools | 5p5cV0yVDvQ, mPflFTQUCGk, simon-scrapes-dossier.md | PARTIAL (connector fails 401) | P2 |
| One n8n MCP Server Trigger for many workflows, behind voice | Group one-job workflows as tools of one MCP server with per-tool descriptions; voice front-end picks | y-cq_Qo4zVo, glM8godEcic | MISSING | P3 |
| Bearer header + SSE transport fallback | Production URL, Bearer from env, switch to SSE if streamable HTTP fails | y-cq_Qo4zVo | PARTIAL | P3 |
| Native mail connectors are read-only; send is a separate approved action | Chat Gmail connectors search only; send goes through a separate workflow, drafted and owner-approved | 5p5cV0yVDvQ | PARTIAL | P3 |
| ChatGPT custom MCP via developer mode | Dev-mode connector with OAuth; failed live on tape | 5p5cV0yVDvQ | NOT_FOR_JARVIS | P3 |
| Vendor webhook into a local workflow | Fireflies "transcription complete" event to the n8n production webhook | KGXFkUlBHxw | MISSING | P3 |
| Platform MCP for test runs instead of the browser | Trigger.dev MCP lets the coding agent trigger and inspect runs | UGIZnh6HNLc | PARTIAL | P3 |
| Second agent verifies setup via the analytics MCP | PostHog MCP used by a different person to check event setup | bWhjRLX0jpo | MISSING | P2 |
| MCP results are point-in-time facts | Store only verified facts; re-query for current state | IMPLEMENTATION_MAP.md | PARTIAL | P2 |
| Scraping actor on demand | Call a specific Apify actor inside one task, not as a standing loop | 35WuZxbAY68 | PARTIAL | P3 |
| Zapier MCP bridge for missing apps | Use the Zapier MCP for apps with no native connector (rent/lock-in concern) | lRUpu2-KtGQ | MISSING | P3 |
| Channels: push phone messages into a session | MCP pushes Telegram/Discord/iMessage into a running session | RLjaUES9P8A | NOT_FOR_JARVIS (Telegram legacy) | P3 |
| Artifacts that call MCP per viewer | Private dashboards that fetch and act through connectors | 2077489907350856038 | NOT_FOR_JARVIS | P3 |
| Research-to-publish through one MCP | Research, then draft, then publish inside chat via a vendor MCP | 2074589352273867128 | NOT_FOR_JARVIS (publish is HITL) | P3 |

### Top 5 to build next

1. **Side-effect gate on MCP calls (allowlist + allow-once).** PARTIAL, P1. Safari already holds send/pay/delete, but the `mcp` tool has no equivalent gate.
   - Classify every MCP tool verb as read, write or send/pay/delete when the server is registered, from its name and description; unknown counts as write.
   - Route write and send/pay/delete calls through `ask_owner` with the exact arguments, then resume, reusing Safari's ask-then-resume flow.
   - Never persist "always allow" for send/pay/delete. Keep a per-job allowlist of enabled tools only.
   - Regression test: a fake MCP server with a `send_email` tool must stop at `ask_owner`.
2. **Post-connect capability inventory and coverage map.** MISSING, P1.
   - On first use of a server, list its tools and record name, read/write, cost flag and account/scope seen, in procedural memory as a dated FACT.
   - Store a coverage map per connector: which of Evens's common asks it covers.
   - When a step is not covered, hand it to the Safari/computer tool and say so in the job log.
   - Re-run the inventory when a call fails with an auth or scope error. Report 401s to Evens and do not route around them.
3. **Skills library loading with skill + CLI wrappers.** MISSING, P1.
   - Load skill cards (name, when to use, CLI command, inputs) from a folder at job start, matched by description and not loaded all at once.
   - Seed it with CLIs already on the Mac: gh, then gws once verified.
   - Each skill references env var names only, never values.
4. **Discover schema, then execute.** PARTIAL, P1.
   - Before calling any MCP tool or workflow for the first time in a job, fetch its description and input schema and fill the fields from that schema.
   - After a write call, run a read-back check (the record or email exists) before `done`. This also covers part of the missing independent verifier.
5. **Credential handling as a fixed procedure.** PARTIAL, P1.
   - Add a "new connector" playbook: check connector, then CLI, then MCP, then the docs API.
   - Ask Evens for a scoped, read-only key by env var name, or show him the full OAuth link and wait for him to complete it.
   - Jarvis never types or echoes keys.
   - Run one test call, then save the recipe as a skill card.

Evidence notes: the token-savings figures in the sources are vendor or speaker claims and are not repeated here. The n8n connector's 401 comes from the source notes and has not been re-checked.

## Voice UI (voice-ui family)

This family covers how a voice agent is built and how it feels to use: the listen → transcribe → decide/tool → speak loop, the face and status signals, confirming details before acting, interruptions, triggers, and remote or phone access. The 59 raw methods merge into 43. Jarvis already has the operator loop, a `say` tool, `ask_owner`, holds on send/pay/delete, and Jev routing. The talk path itself (BUS300) is still not proven live. None of these methods blocks Mac or browser work today, so none is rated P0. The P1 items are the ones that decide whether BUS300 voice works and feels right. Any change to live Jarvis Face (:4018) or the Orb needs Evens's OK (rule 17a). Outbound calls, phone numbers, voice clones and lead capture stay gated or out of scope while the system is in BUILDING mode.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Voice loop = STT → LLM/tools → TTS | One agent loop with speech wrapped around it, each stage logged | -cdexJWN8YA, zWLZ3bVVwD8 | PARTIAL | P1 |
| Barge-in acceptance test | Talking over the agent stops playback at once and routes the new request | Qt3zMBH-FNg | MISSING | P1 |
| Spoken ack before slow tools | Say "checking that" before a tool call; measure the silent gap | Qt3zMBH-FNg, y-cq_Qo4zVo | MISSING | P1 |
| Visible thinking state | Face switches to a "think" visual while tools or memory run | FiOTrxq9ckM | PARTIAL | P1 |
| Full-screen face with listen/think/speak states | One full-bleed surface plus a small state HUD, no dashboard cards | FiOTrxq9ckM | PARTIAL | P1 |
| Wake word + key push-to-talk | "Jarvis" wake word, with a key held as fallback | FiOTrxq9ckM | MISSING | P1 |
| Push-to-talk dictation with custom vocabulary | Dictate long briefs; add dictionary fixes for names it mishears | -cdexJWN8YA, jdbOVepEtUE, vfWTyEreOEc | PARTIAL | P1 |
| Read back and confirm before writes | Normalize inputs, spell back names, emails and numbers, confirm, then write | -cdexJWN8YA, zWLZ3bVVwD8, y-cq_Qo4zVo | PARTIAL | P1 |
| Speech-to-speech vs chain benchmark | Try a native S2S model (free playground first) against the STT/TTS chain | Qt3zMBH-FNg, UCKLHU5AkEM | MISSING | P1 |
| Done / needs-you cue | Sound or notification when a job ends or is blocked on Evens | RzLV8sfFdMM | PARTIAL | P1 |
| Four-part anatomy | Spec checklist: model/persona, prompt, voice, knowledge, tools | -cdexJWN8YA, zWLZ3bVVwD8 | PARTIAL | P2 |
| Grounded in own corpus | Answer from Evens's transcripts and notes through retrieval, not model memory | -cdexJWN8YA | PARTIAL | P2 |
| One engine, many doors | Same brain behind Face, Orb, and later phone | -cdexJWN8YA | PARTIAL | P2 |
| Voice reply style | ET timezone, short replies, low temperature | -cdexJWN8YA | PARTIAL | P2 |
| Live transcript + text fallback | Show the transcript and allow typing during voice | -cdexJWN8YA | PARTIAL | P2 |
| Ramble + "what am I missing?" | Take loose voice dumps and reply with gaps and questions before acting | U6k4MeVks_Y | PARTIAL | P2 |
| Per-task status indicator | Always-visible working / idle / needs-approval state per task | 3TdD8Qv5Tk8, lRUpu2-KtGQ, xsAOpqjebOo | PARTIAL | P2 |
| Calendar + task tools with disambiguation | Ask one short question when the write target is ambiguous; writes under HITL | Qt3zMBH-FNg | PARTIAL | P2 |
| TTS chunking under 60s | Generate long speech in short chunks to keep the voice stable | J_jswzXhYJA, ONmaDdOBGig | MISSING | P2 |
| Vision grounding with stated confidence | Say what was seen and how sure; confirm through elements before acting | Qt3zMBH-FNg | PARTIAL | P2 |
| Per-turn thinking/grounding knobs | No thinking for chit-chat, more for tool tasks; search grounding for live facts | Qt3zMBH-FNg | PARTIAL | P2 |
| Phone dispatch, notify when done | Send a task from the phone; the Mac does it and pings back | ZRb7D6R64hM | MISSING | P2 |
| Phone as remote for the Mac session | Drive a running local session from the phone | ZRb7D6R64hM, jdbOVepEtUE | MISSING | P2 |
| Event-trigger channels (webhooks) | External events start Jarvis tasks; replies follow the no-send rule | ZRb7D6R64hM | MISSING | P2 |
| First-turn policy | Explicit greet-first or wait-for-user setting | BO-jFbN4p8Y, zWLZ3bVVwD8 | PARTIAL | P3 |
| Sectioned agent prompt with if-X-do-Y branches | Identity, style, context variables, branches, required data, stop rule | BO-jFbN4p8Y, zWLZ3bVVwD8 | HAVE | P3 |
| Explicit end action | Turn on default-off end/stop tools | BO-jFbN4p8Y | HAVE | P3 |
| Booking agent with exactly two calendar tools | Check availability + create event, nothing more | G9Ho8n4lD6I | PARTIAL | P3 |
| Check understanding, manage overwhelm | Explain in chunks and ask "does this make sense?" | Pi-m8R068r4 | PARTIAL | P3 |
| Swappable personas | Named instruction profiles change tone, not the loop | Qt3zMBH-FNg | PARTIAL | P3 |
| Remote surface shows context/resets | Messaging hides context; use it only for low-risk tasks | gb5TlGw6Uks | PARTIAL | P3 |
| Voice note in, voice + text out | Transcribe voice input; reply with both text and speech | gb5TlGw6Uks | PARTIAL | P3 |
| Embed widget snippet (knowledge widget) | Coding path places the vendor snippet; verify by reloading on localhost | -cdexJWN8YA, Qt3zMBH-FNg | HAVE | P3 |
| Voice only where it replaces a person | Routine status goes out as short text | i4Q8wHZNPBU | HAVE | P3 |
| Talk-to-agent replaces click UX | Answer questions directly from connected data | rMf-JuikR-Q | HAVE | P3 |
| Copyable deliverables as files | Return files or rendered panes, not wrapped terminal text | vfWTyEreOEc | HAVE | P3 |
| Inbound / outbound / widget types | Who starts the call; outbound is a Tier-3 send | zWLZ3bVVwD8 | NOT_FOR_JARVIS | P3 |
| Disclose AI + human handoff | Third-party calls open with an AI disclosure | BO-jFbN4p8Y, y-cq_Qo4zVo | NOT_FOR_JARVIS | P3 |
| Professional voice clone | Clone trained on hours of the owner's voice (spend gate) | -cdexJWN8YA | NOT_FOR_JARVIS | P3 |
| Phone number provisioning | Vapi/Twilio numbers for inbound/outbound | y-cq_Qo4zVo, zWLZ3bVVwD8 | NOT_FOR_JARVIS | P3 |
| Telegram bot with user-ID allowlist | Telegram is a legacy channel (do not revive); the allowlist idea applies to any future channel | gb5TlGw6Uks | NOT_FOR_JARVIS | P3 |
| Site chat must capture the lead | Selling surface; locked in BUILDING mode | rMf-JuikR-Q | NOT_FOR_JARVIS | P3 |
| /theme in Claude Code | Terminal theme setting | vfWTyEreOEc | NOT_FOR_JARVIS | P3 |

### Top 5 to build next (behind a flag, never on live :4018 without Evens's OK)

1. **Stage-logged voice loop + barge-in test** (PARTIAL/MISSING, P1)
   - Log a timestamp at each stage: mic open, STT final, model first token, tool start/end, TTS start, TTS end.
   - Add a barge-in handler: voice activity during TTS stops playback and sends the new utterance into the same session.
   - Write a scripted acceptance run: interrupt mid-sentence, check that playback stops and the new request is answered, and save the log as evidence.
   - Watchdog re-runs it. Record a side-by-side capture against the source tape (rule 13a).
2. **Spoken ack + think state during tools** (MISSING/PARTIAL, P1)
   - In the operator loop, when a tool runs longer than a set threshold, call `say` with a one-line ack ("checking your calendar") before waiting.
   - Send a "thinking" state event to the Face so it shows the think visual until the answer starts.
   - Measure the silent gap per turn as a latency metric in the job log.
3. **Read back and confirm before writes** (PARTIAL, P1)
   - Extend the existing send/pay/delete hold to any write that carries an identifier (email, name, phone, date, path).
   - Normalize first (lowercase emails, trim), then speak or show a short read-back and wait for "yes" through `ask_owner`.
   - Add a regression case: a misheard email gets caught at read-back.
4. **Wake word / push-to-talk with custom vocabulary** (MISSING/PARTIAL, P1)
   - Check the existing `local-push-to-talk-dictation` skill before building anything new.
   - Add a key-held push-to-talk first (cheapest and reliable), then a local wake-word detector as an option.
   - Keep a vocabulary file of tool and person names that STT gets wrong, and apply it after transcription.
5. **Speech-to-speech vs chain benchmark** (MISSING, P1)
   - Run the same 5–10 scripted prompts through Jarvis's STT → LLM → TTS chain and through a free S2S playground (noting that free tiers may train on the data, so use no private content).
   - Compare measured latency, barge-in behavior, alphanumeric accuracy, and tool-call silence. Record only observed values.
   - Write it up as a decision packet for Evens. No install or integration without his OK.


## Family: jarvis-assistant

The 55 raw entries come from Evens's signal corpus: YouTube transcripts, two internal upgrade notes and one X post. They merge into 38 methods. I merged only true duplicates and kept every source id. Where two sources describe different mechanics, they stay as separate variants. Each method is graded against the Jarvis harness as described on 2026-10-16. These grades are a desk read only; nothing here has been live-tested (status UNPROVEN). The priority scale is:

- **P0:** blocks Jarvis on Evens's Mac or browser today. No method reached P0.
- **P1:** the top gap.
- **P2:** worth building.
- **P3:** nice to have, or already covered.

Two methods describe several bots working in parallel or a service for many members. Both are marked NOT_FOR_JARVIS, because Evens defines Jarvis as one general operator and the fleet is in BUILDING mode. Telegram and OpenClaw channels appear in several sources. They are legacy in this fleet: the patterns are kept, the channels are not.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Jarvis as the default first surface | Try every task, including writing and planning, in the one agent loop before opening an app | 0WDkwMxj13s, 8QQ_INxAhRs, vfWTyEreOEc | HAVE | P3 |
| Log every time he leaves Jarvis | Note each time Evens leaves Jarvis to do a task by hand, then propose the missing connector or skill | jdbOVepEtUE, 8QQ_INxAhRs | MISSING | P2 |
| Search across his sources | "Where did X send me Y" searched over Gmail, Slack and Drive (read-only) | 0WDkwMxj13s | PARTIAL (MCP yes; no parallel read-only fan-out) | P2 |
| Process mentor ("is this possible?") | Evens describes a manual process; Jarvis proposes options and tests them with him | 0WDkwMxj13s | PARTIAL | P3 |
| Map recurring tasks to skills | Turn a spoken list of his week into a list of skill candidates | U6k4MeVks_Y, diY71x7GUjI | MISSING (no skills library loading) | P2 |
| Trigger audit | List the weekly tasks set off by something predictable, rank them, draft the top routine for approval | 3XIGcM7VICc, jdbOVepEtUE | MISSING | P2 |
| Wake on a message, plus a sparse heartbeat | Wakes on each inbound message or webhook, plus an occasional check-in | 27Y44JYXZJ8, 35WuZxbAY68 | MISSING (only an idle session continuing on his next line) | P2 |
| Phone as a remote control | The phone drives the same Mac session, through the same approval gates | vfWTyEreOEc (dispatch + remote control), CB5bG4mvnS0 | MISSING | P2 |
| Pending actions with a stop window | Show the next consequential action and its cost so he can stop it in time; approve or deny from one place | 62Rfe1w9NBc, 2075611333668540502 | PARTIAL (holds and cost meter exist; no single place to see pending actions) | P2 |
| Permission scopes: once / session / always | Each grant has a scope; "always" only for narrow, reversible actions | gb5TlGw6Uks | PARTIAL (holds exist; no scopes) | P2 |
| Human approval on sends and outreach | Explicit human confirmation before any send or outreach (one source adds a PIN) | X80ljdCPM_U, IMPLEMENTATION_MAP.md | HAVE (send/pay/delete held; no PIN) | P3 |
| Human picks the problem, the agent executes | Evens gives direction and acceptance; Jarvis does the work | NDeyhGnNECc | HAVE (ask_owner/done) | P3 |
| Shoot and return (background delegation) | Start a scoped job, he works elsewhere, Jarvis notifies when done | AO5aW01DKHo, upgrades/nate-82/day-planner.md | PARTIAL (shell background jobs and Safari background tab; computer tool is foreground only; no resume after reboot) | P1 |
| Proactive risk scan | Scan his CRM and inbox for risks, flag them, propose fixes; no autonomous action | AO5aW01DKHo | MISSING | P3 |
| Ops monitoring and self-repair | Watch services and repair them overnight | FiOTrxq9ckM | MISSING (live-surface repairs need Evens's OK) | P3 |
| Diagnose its own broken connector | "X isn't working": Jarvis investigates with the shell and reports the root cause | gb5TlGw6Uks | PARTIAL (shell exists; restarts gated; unproven) | P2 |
| Idea council | Several critic personas review an idea and return a verdict plus the cheapest test | Ek1NBfnnTH0 | MISSING (no sub-agents; could run one after another) | P3 |
| Persona file with a pushback trait | Tone kept in its own editable file, apart from facts; "push back on bad ideas" | FiOTrxq9ckM, gb5TlGw6Uks | PARTIAL (JARVIS_CONTEXT exists; edits are a live-surface change) | P3 |
| "Show me X" puts a file on screen | Spoken request → find the file on disk → open it → confirm by voice | FiOTrxq9ckM | HAVE (shell/files/open/say) | P3 |
| Say when to use each tool | Prompts and procedures name the tool for each step, not just the list of tools | G9Ho8n4lD6I, y-cq_Qo4zVo | PARTIAL | P2 |
| Procedures written as scripts with preconditions | Branching scripts; rules such as "resolve the contact first" and "always return a status line" | y-cq_Qo4zVo, jBanaNBY-sM | PARTIAL (procedural memory exists, format is loose) | P2 |
| No formatting leaks in output | Remove markdown tokens that leak into speech or outgoing text | HN0oWxbF2bM | PARTIAL | P3 |
| Meet him where he already works | Jarvis lives in a surface he already uses, with retrieval and task tools behind it | HNKlFTd1maM | PARTIAL | P3 |
| Member concierge with per-person history | One agent serving many members, with a history for each | HNKlFTd1maM | NOT_FOR_JARVIS | P3 |
| Morning brief | Calendar + inbox + tasks → a draft plan with suggested time-block moves, refined from his feedback | LVAHYV4Xrto, PQBYZQqan2g | PARTIAL (on demand via MCP; not scheduled) | P2 |
| Own the foundation | Build on the base harness; borrow ideas from OpenClaw and Hermes without adopting them | RzLV8sfFdMM | HAVE | P3 |
| Model decides how long research runs | Search and read tools plus a done criterion, not a fixed pipeline | UGIZnh6HNLc | HAVE | P3 |
| Current date and time in context | Current ET date and time in each turn, so scheduling asks work | X80ljdCPM_U | PARTIAL (not confirmed) | P2 |
| Ask Jarvis about itself; a link goes to read-then-propose | Answers from its own docs; a pasted post becomes a proposal | gb5TlGw6Uks | PARTIAL (no signal ingestion) | P2 |
| Clean strings in tool payloads | Escape model text before putting it into JSON or JS payloads | irg-2IfAjpo | PARTIAL (risk mainly in Safari eval) | P3 |
| Think before asking or acting | Plan step between tool calls; check memory and files before asking Evens | jBanaNBY-sM, lcNN3X9gXls | PARTIAL | P2 |
| Specialist bots in group chats | Many named bots handing work to each other | lRUpu2-KtGQ | NOT_FOR_JARVIS (one operator; named roles are fine) | P3 |
| Handoff routing and standing handoff rules | Route by destination description to a procedure or a human; write down which inputs route where | y-cq_Qo4zVo, lRUpu2-KtGQ | PARTIAL (ask_owner handoff only) | P3 |
| Brief + reference example → skill | Save a new routine as a brief plus an example of the expected output, so later outputs match it | lRUpu2-KtGQ | MISSING | P2 |
| Resolve contact → draft → hold | Research, then resolve the recipient from a source of truth, then draft, then stop for Evens's OK | nQtogLs_dlg, lcNN3X9gXls | PARTIAL (works serially; no sub-agents) | P2 |
| Find the procedure from intent | A plain-language goal → search the procedure store → run the matching procedure | tDGiWn0flK8 | PARTIAL (procedural memory; no skills library) | P2 |
| Calendar window rules | Explicit query windows; report free slots only, never other events' details | y-cq_Qo4zVo | PARTIAL | P3 |
| Scheduled runs in isolated sessions | Fresh session per scheduled run, no recursive spawn, timezone check, check memory freshness first | upgrades/nate-82/day-planner.md | MISSING | P3 |

### Top 5 to build next

1. **Shoot and return: resume after reboot, plus native apps in the background** (P1, PARTIAL)
   - Save the state of each job (goal, step, last tool result, any pending approval) to disk after every step.
   - On start, list unfinished jobs and ask Evens "resume X?" before continuing. The Mac restart today is the test case.
   - Add an Accessibility-based tool for native apps so GUI work does not take over his foreground screen.
   - Finish each job with a short receipt, spoken with `say`.
   - Acceptance needs a live capture: start a job, restart, resume, finish. A builder's own run is not a pass.
2. **Skills library: map recurring tasks, save brief + example as a skill, find the procedure from intent** (MISSING/PARTIAL, P2)
   - Load skills from one directory in the format the fleet already uses. No new store.
   - Turn finished-job procedural memory into skill drafts that name the tool for each step and the preconditions.
   - Match each incoming line against skill descriptions. No phrase routes.
   - When Evens defines a routine, save his brief plus the reference artifact.
   - New skills follow the rule 25 dedupe and two-source checks.
3. **Pending actions and permission scopes** (PARTIAL, P2)
   - Put every held send, pay or delete action in one queue showing what will happen, the target, the reversibility and the cost so far.
   - Let him approve or deny from that queue.
   - Grants can be scoped once, session or always. "Always" is limited to narrow, reversible action classes; Tier-3 actions are never "always".
4. **Morning brief, on demand first** (PARTIAL, P2)
   - Read calendar and inbox through the existing MCPs, read-only, and draft the plan with suggested block moves. It sends nothing.
   - Store his likes and dislikes in memory.
   - Make sure current ET date and time is in context; this check is cheap and is a precondition.
   - Run it on a schedule only through the existing canonical scheduler, after Evens approves. No new scheduler (rule 19).
5. **Link → read → propose (signal ingestion)** (PARTIAL, P2)
   - When Evens pastes a YouTube or X link, fetch the transcript or text, frames and contact sheets.
   - Write a packet in the repo's existing packet format.
   - Reply with a proposal that compares the method against current Jarvis capability. Signals stay signals until extracted, with evidence.

Two smaller additions that help across the family:

- Log each time he leaves Jarvis to do something by hand. Each entry becomes a candidate connector or skill.
- Add a "think before asking" check: search memory and files before using `ask_owner`.

## Repos, tools and installs

This family covers how agents install and wire tools: coding-agent front ends, CLIs, skills and plugins, API keys and `.env` files, project scaffolds, deploy pipelines and hosting. There were 43 raw methods. Duplicates were merged into 28 methods, and every source id is kept. Most of these Jarvis can already do mechanically with shell, files, web and Safari. Four things are missing:
- an install gate written as an actual step in the code;
- a check after an install that the tool is really wired in;
- skills-library loading;
- tighter handling of credentials on screen and in snapshots.

None of the gaps in this family stops Jarvis from doing what Evens asks today, so nothing is P0. The P1 items are the ones that make installs safe and checkable.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Agent-driven install from docs URLs or vendor commands | Give the agent the tool's URLs or its install/auth/skills commands. It reads them, installs the prerequisites and hands the OAuth step to the human. | YHk45NEpspE, xn6Z5PYyAIE | PARTIAL | P1 |
| Pre-install code vetting checklist | Before installing, check: verified publisher, a real author, stars and forks. Review the code for outbound calls, exfiltration, shell injection, suspicious dependencies, secret handling, file-system access and remote script loading. | 62Rfe1w9NBc | MISSING | P1 |
| Verify wiring after install | Confirm that hooks, MCP servers or launch agents actually registered, and that each linked part opens. Installing the library alone is not "installed". | eRS3CmvrOvA, jBanaNBY-sM | PARTIAL | P1 |
| Install a skill from a GitHub URL | Paste a skill repo URL and say "add this skill". | U6k4MeVks_Y | MISSING | P1 |
| Credential hygiene | Name keys by purpose, copy `.env` from `.env.example`, keep secrets in env only (including in shared CLI repos), check that a key is present without printing it, and flag temporary keys for rotation. | HN0oWxbF2bM, tDGiWn0flK8, YHk45NEpspE | PARTIAL | P1 |
| Prompt-injection scan before importing third-party agent or skill files | Scan community agent markdown with a read-only worker that has no network before importing it. | e18sdZLwP7o | MISSING | P2 |
| Global vs project scope for skills and agents | Meta-skills live at user scope and fire everywhere. Job skills live in the repo. Move the file to change its scope. | e18sdZLwP7o, eRS3CmvrOvA | MISSING | P2 |
| Provider API key creation (owner-only) | Walk Evens through console steps: Google Cloud restricted YouTube Data API key, Anthropic console billing and a named key. He creates and pastes the key. | 3TdD8Qv5Tk8, X80ljdCPM_U | PARTIAL | P2 |
| Clone a starter agent-OS repo and run its guided setup | Clone the repo, run "set me up", and let the interview/audit build the structure, adopting the existing vault instead of making a second home. | FiOTrxq9ckM, github-jaredrhod-fullstack-agent, 8QQ_INxAhRs | PARTIAL | P2 |
| New workspace scaffold | Empty folder, trust it, have the agent create CLAUDE.md and `.claude/` (settings, agents, skills) or build from a template file, then review its summary. | jdbOVepEtUE, vFepZE_wrfg | PARTIAL | P2 |
| Check version and feature toggles before calling something missing | Update the CLI or app, or enable community nodes, before saying a model or node is unavailable (`/model`, n8n verified community nodes for Tavily). | dYrrEKXtttk, pxzo2lXhWJE | PARTIAL | P2 |
| Google Workspace CLI install with manual OAuth | The agent installs gws from its repo. The human creates the GCP project, consent screen and Desktop client. The JSON goes in `~/.config/gws`, then `gws auth login`, then enable each API. | jdbOVepEtUE | PARTIAL | P2 |
| Re-check vendor free tier at build time | Plans can name a dead free tier (Yelp Fusion). Re-check, swap, and flag any paid switch to the owner. | UGIZnh6HNLc | PARTIAL | P2 |
| GitHub + Vercel deploy pipeline via CLIs | The agent finds and adds the gh/vercel CLIs, creates the repo and connects hosting. Deploys are Tier-3. | -cdexJWN8YA, U6k4MeVks_Y | PARTIAL | P2 |
| Setup script before the agent launches | A fixed pre-step installs dependencies before the agent session starts. | ehg4fhydTgs | MISSING | P2 |
| Own-stack remap; BLOCKED card instead of a vendor install | Reproduce the result on owned tools. If a tool is missing, file BLOCKED (what the tape used, the house remap, a workaround, whether it blocks) and stop. | SIGNAL-TRAIN-LOOP.md, workflows/assigned-tools-not-whole-instance.md | PARTIAL | P2 |
| Plugin marketplace install from the terminal CLI | `/plugin` → add marketplace URL → install → reload. This only works in the CLI. | zyvdl__Ywfk | PARTIAL | P3 |
| CLI factory | Research a site or API, generate a Go CLI, dogfood it and score it, then wrap it in a skill. | YHk45NEpspE | MISSING | P3 |
| Custom domain DNS A-record hookup | Add the domain in the host, copy the A records into the registrar's DNS, wait, deploy. | I7mpF7_pnPM | PARTIAL | P3 |
| Path hygiene for watchers | Spaces or periods in a folder name broke log pickup. Rename to lowercase-hyphen and retest. | 62Rfe1w9NBc | PARTIAL | P3 |
| Install/run the coding-agent front end; the files are the product | VS Code extension, desktop app or CLI on a paid plan. The project files stay the same whichever one is used. | 3GAxd90fEE4, jdbOVepEtUE | HAVE | P3 |
| Port a project between harnesses | Push to GitHub, open it in the other agent, swap CLAUDE.md for AGENTS.md. | 3TdD8Qv5Tk8, RLjaUES9P8A | HAVE | P3 |
| Swap the model backend via settings env | Anthropic-compatible base URL plus the provider token in `settings.local.json` env ("harness is the car, model is the engine"). | 2OD14-0cot4 | HAVE | P3 |
| Enable an experimental flag via project `settings.local.json` | Paste the docs' env JSON into the project's local settings. | vDVSGVpB2vc | HAVE | P3 |
| 21st.dev copy-prompt components | Open a component, click "Copy prompt", feed the result to the build. | FFWtxjvW2ts | HAVE | P3 |
| Bypass-permissions toggle | Turn on "dangerously skip permissions" after the plan is approved. | vFepZE_wrfg | NOT_FOR_JARVIS | P3 |
| VPS hosting: root install vs one container per agent; one-click n8n | Hosted agent or n8n installs, with one container per agent for isolation. | gb5TlGw6Uks, pxzo2lXhWJE | NOT_FOR_JARVIS | P3 |
| Beamhook media-key app picker | An open-source macOS utility candidate. | 2083539190038299045 | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Install gate as a real step (vetting checklist plus rule 18).** Covers agent-driven installs and the pre-install vetting checklist.
   - Add an `install_gate(repo_or_url)` step that runs before any `brew`, `npm -g`, `pip`, `git clone`, plugin or extension install. It records license, archived status, last push and pinned version. It applies the vetting checklist: publisher verified, outbound calls, exfiltration, shell injection, dependencies, secret handling, file-system access, remote scripts.
   - It returns GREEN / YELLOW / RED. YELLOW goes to `ask_owner` and RED refuses (AGPL held).
   - It writes the result to the job log so procedural memory reuses it.
   - Live test: ask Jarvis to install a small CLI. The gate card should appear before any install command runs.
2. **Post-install wiring check.** Covers verifying that hooks, MCP servers or launch agents registered, and click-testing each link.
   - After an install, run the tool's own status command (version, `mcp list`, `launchctl list`, a plugin list) and one real call.
   - Do not report "installed" unless that check passes.
   - Later, give this check to the planned independent verifier, so the builder does not grade itself.
3. **Skills library loading plus a safe import path.** Covers install-skill-from-URL, the injection scan, and global vs project scope.
   - Load a small global meta-skill set plus per-job skills from a known folder.
   - Import from a URL only through the install gate (step 1) and a read-only, no-network scan pass over the markdown for injected instructions.
   - Record the scope (global or job) for each skill.
4. **Credential handling on screen and in files.** Covers credential hygiene and owner-only key creation.
   - Add an env presence/length check helper that never prints the value.
   - Make sure `.env` files come from `.env.example`.
   - When Safari snapshots or screenshots show a console key page, have Jarvis redact or skip reading the value and hand the paste to Evens.
   - Flag keys made for a demo for rotation.
5. **Tier-3 hold for deploy, DNS and publish commands run through shell.** Covers the GitHub+Vercel pipeline and DNS hookup.
   - The Safari tool already holds send/pay/delete. Whether shell commands like `vercel --prod`, `gh pr merge` or DNS edits get the same hold is UNKNOWN; check it first.
   - If they don't, add a command-pattern hold that asks first, then resumes after approval, the same way the Safari tool does.

Not checked: whether gws, gh or vercel are installed on the Mac today, and whether Jarvis's shell already holds deploy commands. Both are marked UNKNOWN or PARTIAL rather than assumed.

## Browser use

This family covers how agents drive a web browser: verifying their own web work, automating sites that have no API, keeping logins with the human, and walking live sites safely. 33 raw methods from 16 sources were merged into 22. True duplicates were merged and every source id was kept. Distinct variants, such as the Enter fallback and the Escape fallback, stay separate.

Jarvis already has most of the parts. It has a background Safari tool that drives page elements, a foreground computer tool, curl/fetch, hand-off of login walls to Evens, and send/pay/delete buttons held for his OK. The gaps are in discipline and proof: no structured expected-vs-observed check after each act, no step-file runner, no self-test of the Safari driver, no independent verifier before `done`, and no way to watch a video and save what it saw.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Watch a social/YouTube video in his browser | Reuse the open tab, play, confirm currentTime advances, turn on captions, sample frames, mark caption gaps, write watch.json | social/x-2088359756096532965/PACKET.md | PARTIAL | P0 |
| Verify-after-act card | ACT / EXPECTED / OBSERVED / COMPARE / NEXT after every click, type or navigate; never invent OBSERVED | upgrades/nate-82/DRY-RUN-SIX.md | PARTIAL | P1 |
| Use it like a user, with proof screenshots and a hard cap | Open the built page, interact with it, screenshot each result, obey an iteration bound | 2J3uX8iRNng, RzLV8sfFdMM, EuzYhzB0vbI | PARTIAL | P1 |
| Click-live flow file + RUN.md on disk | Step file (launch/navigate/tap/scroll/assertVisible) with expected state and a card per step; status written to disk | workflows/click-live/SCHEMA.md | MISSING | P1 |
| Local fixture page proves a click landed | 127.0.0.1 page with a reveal button; curl 200 is not a click; the token must appear after the click | upgrades/nate-82/DRY-RUN-SIX.md | MISSING | P1 |
| Retry cap 2, no silent driver switch, escalate | Log every host act; stop after 2 retries; never swap browser stacks; HOLD with the exact blocker | upgrades/nate-82/DRY-RUN-SIX.md | PARTIAL | P1 |
| Fetch-first probe, then headed browser | curl status/redirects/robots/sitemap/healthz/routes and assert on HTML first; mark visuals UNKNOWN if no real browser pass | workflows/CLICK-LIVE-EVENSLUIS-2026-08-14.md, workflows/click-live/flows/vale-4840/RUN.md, workflows/us.md | PARTIAL | P2 |
| Capped click path that stops at the hard step | Walk CTAs with a click budget up to the submit/pay control, assert it is visible, never press it, then hand to a verifier | workflows/CLICK-LIVE-EVENSLUIS-2026-08-14.md, workflows/click-live/flows/evenslouis-ca/RUN.md, workflows/us.md | PARTIAL | P2 |
| QA stress test of a build | Click everything, try to break it, return a bug list, then plan the fixes | 3TdD8Qv5Tk8 | PARTIAL | P2 |
| Fallback ladder when a fetch is blocked | Try RSS, API, scraper or a Safari DOM read before giving up; report which path worked | lRUpu2-KtGQ | PARTIAL | P2 |
| Enter when a click only focuses | Link focused but no navigation: press Enter and re-observe the URL/H1 | workflows/click-live/flows/evenslouis-ca/RUN.md | PARTIAL | P2 |
| Escape when a modal won't close | Close button only focused: press Escape and verify the workspace is visible | workflows/click-live/flows/proofcheck-local/RUN.md | PARTIAL | P2 |
| API first, browser as fallback | Use the API/MCP; drive the web UI only for a setting the API lacks, verify it, switch back when the API catches up | 3TdD8Qv5Tk8, J_jswzXhYJA, ONmaDdOBGig | HAVE | P2 |
| Signed-in sessions stay with the human | Reuse the already-signed-in browser; check signed-in state first; human does login and captcha; expect banks to expire | 3TdD8Qv5Tk8, CB5bG4mvnS0, PQBYZQqan2g | HAVE | P2 |
| Detect a looping fix and change strategy | When guided GUI fixes repeat without progress, stop and switch approach | diY71x7GUjI | PARTIAL | P3 |
| Bilingual step targets | Match FR or EN labels (Connexion/Sign In) and note the UI language | workflows/click-live/flows/proofcheck-local/cards/05-tap-draft.md | PARTIAL | P3 |
| Alias/redirect canonical check | Flow for an alias only asserts the 308 to the canonical URL; duplicate walks are retired | workflows/click-live/flows/ce-pro-work/RUN.md | PARTIAL | P3 |
| Element comments on a live page | Human selects an element on the page, comments, and the comment becomes an edit prompt | RLjaUES9P8A, U6k4MeVks_Y | MISSING | P3 |
| Headed vs headless runs | Visible when the flow is new or Evens wants to watch; background for routine runs | CB5bG4mvnS0 | HAVE | P3 |
| Reuse the existing tab | Lock onto the open tab and navigate in place; record the tab id | workflows/click-live/flows/proofcheck-local/RUN.md | HAVE | P3 |
| Read location.href on SPA navigation | Snapshot URL lags client-side routing; read it via JS | workflows/CLICK-LIVE-EVENSLUIS-2026-08-14.md | HAVE | P3 |
| Drive the browser from the session that owns the tabs | Sub-agents could not see the parent's tabs; the act passed only from the owning loop | upgrades/nate-82/DRY-RUN-SIX.md | HAVE | P3 |
| Cookie-bound jobs stay local | A job that needs the local cookie jar fails on a stateless cloud runner; keep it on the Mac | ehg4fhydTgs | HAVE | P3 |
| Agent password manager fills logins | Import a credential CSV into the agent's own password manager | CB5bG4mvnS0 | NOT_FOR_JARVIS | P3 |

### Top 5 to build next

1. **Video watch in Safari, saved as a packet (P0, PARTIAL).** The Safari tool can already play and read the page. The missing part is saving the result.
   - Add a `safari watch` action: reuse the matching tab, click Play, sample `currentTime`/`paused`/`muted` at intervals, and fail if playback does not advance.
   - Enable the caption track and read its cues through `eval`. Take a screenshot frame at a fixed interval.
   - Write `watch.json` (frames, cues, gaps marked as gaps, never filled in) plus a contact sheet into a packet folder in the repo.
   - Live-match test against the existing x-2088359756096532965 packet, side by side (rule 13a).
2. **Verify-after-act card in the operator loop (P1, PARTIAL).**
   - Before each Safari or computer act, require an EXPECTED field in the tool call.
   - After the act, record OBSERVED from the fresh snapshot or screenshot plus `location.href`, and compute COMPARE match/miss.
   - On a miss, NEXT is retry (within the cap) or escalate. Log cards to the job record so the cost meter and procedural memory can see them.
3. **Retry cap and the Enter/Escape fallbacks (P1/P2, PARTIAL).**
   - A per-target retry counter (cap 2) that sits next to the repetition brake. When it is exceeded: HOLD, `ask_owner` with the exact error, and no switching to a different driver.
   - Built-in recovery before a retry counts: if the URL is unchanged and the target is focused, send Enter; if a dialog persists after Close, send Escape. Record each as "match (retry Enter/Escape)".
4. **Local fixture self-test for the Safari driver (P1, MISSING).**
   - Check a fixture HTML into the Jarvis repo (#reveal button, hidden #observed token) and serve it on 127.0.0.1 through a background shell job.
   - Test: curl 200 alone does not pass; it passes only after a Safari click when the snapshot shows the token visible. Run it at startup or on demand before claiming browser control works.
   - Add the same check for the computer tool's real-mouse click.
5. **Click-live flow runner plus an independent verifier before done (P1, MISSING).**
   - Load `flows/{id}.yaml` (the SCHEMA.md format) as a skill-like input. Execute steps through the Safari tool and write a card per step plus RUN.md with STATUS.
   - Enforce `hard_step`: the runner can only `assertVisible` on that control and can never click it.
   - Before `done` on any web job, a separate verifier pass (different model tier through Jev, fresh context) re-reads the cards and screenshots and grades them. The builder never self-PASSes.

These depend on harness items already listed as missing: skills-library loading (flow files), an independent verifier, and signal ingestion (video packets).

## Computer use (driving the Mac screen, browser and desktop apps)

These methods cover how an agent should operate a real computer: which control path to pick, when to stop for a human, how to check its own work on screen, and how to keep risky work contained. Jarvis already covers the core loop. It has a screen computer tool (screenshot, act, fresh screenshot, blue overlay cursor, real mouse through Jarvis Hands), a Safari page-element tool with send/pay/delete holds, plus shell, files and MCP. Most gaps are about rules and checks around those tools, not new tools. Nothing in this family is P0: none of these gaps stops Jarvis from doing what Evens asks on his Mac or in his browser today.

The 17 raw items merge into 13 methods. The ladder, 2FA and connector-fallback items appeared in several sources; all source ids are kept.

| Method | What it is | Sources | Jarvis status | Priority |
|---|---|---|---|---|
| Actuation ladder: API/MCP, then fixed script, then page elements, then screen vision | Before any UI job, write down which tier you will use and why. Try API/CLI/MCP first, a fixed macro if the click path never changes, and screen vision only when the UI needs reasoning. Includes the "agent over SaaS UI" and "computer use only for apps without connectors" variants. | CB5bG4mvnS0, ZRb7D6R64hM, zyvdl__Ywfk, upgrades/nate-82/CLUSTER-ops.md | PARTIAL: every tier exists, but the choice is never written down or enforced | P1 |
| 2FA, admin and secrets stay human | Stop at 2FA codes, admin password prompts, OS security dialogs and password imports, then hand control to Evens. A saved session is not permission. Do not auto-read texted codes. | CB5bG4mvnS0, upgrades/nate-82/hitl-operator.md | PARTIAL: the Safari tool hands login walls to Evens and holds send/pay/delete. The screen computer tool has no stated hard stop on 2FA or OS security prompts. | P1 |
| Native desktop-app control with safety stops and a scope check | Drive a native app to change an in-app setting. Say the stop conditions first, show a visible "driving" indicator, refuse OS privacy settings, and check afterwards that only the intended scope changed. | CB5bG4mvnS0 | PARTIAL: has the computer tool with overlay cursor, but only in the foreground. Missing: background control through Accessibility, refusing OS security settings, and a scope check after the run. | P1 |
| Computer-use QA with structured bug reports | The agent opens the built app, explores it, and logs bugs with severity, expected vs actual, repro steps and a triage summary | RLjaUES9P8A | PARTIAL: can drive the app, but has no bug-report schema and no independent verifier before done | P2 |
| Screen critique ("roast") as a separate grader pass | Look at the live page and critique layout, CTA and clarity as its own step after building | gt8k4bA01Mo | PARTIAL: can screenshot and critique, but the builder grades itself. The independent verifier is missing. | P2 |
| Test on the real surface (simulator or live device) | Run the app in a simulator beside the chat and have the agent exercise its features with no scripts or selectors | 2079674432038248611 | PARTIAL: the computer tool can drive a simulator window in the foreground. There is no simulator-aware tool and no verifier step. | P2 |
| Granted-folder file agent | File chores (sort, rename, summarize) only inside folders the owner names, ending with a change summary | ZRb7D6R64hM | PARTIAL: files and shell exist, but nothing limits them to a named folder and there is no standard change summary | P2 |
| Sandboxed agent for risky OS/file work | Run risky shell or file experiments in a Docker container, not on the host | david-ondrej-dossier.md | MISSING | P2 |
| Slow-down / wait-for-idle before acting | For fast-changing UIs, pause, step or wait for idle so the agent acts one frame at a time and checks the way a user would | RzLV8sfFdMM | PARTIAL: Safari has wait. The screen computer tool has no wait-for-idle or stepping control. | P2 |
| Supervise from a second monitor and nudge | Owner glances at short progress receipts and steers when the agent drifts | 3GAxd90fEE4 | PARTIAL: has say/ask_owner, the repetition brake and idle continuation. No regular, concise progress-receipt format. | P2 |
| Screenshot instead of describing | Capture the screen region rather than asking the human to describe it | ZRb7D6R64hM | HAVE | P3 |
| Find a local file by description, confirmed visually | Search with several keyword variants, open candidates to confirm, then return the path | jdbOVepEtUE | HAVE: shell (mdfind/find), files, open, then screenshot to confirm | P3 |
| Bare Hands gesture interface over local folders | Webcam hand-gesture UI over folder-backed panels | FiOTrxq9ckM | NOT_FOR_JARVIS (parked; the folder-panel idea might suit a future Face mode) | P3 |

### Top 5 to build next

1. **Write the actuation ladder into every UI job (P1).**
   - Add a required `ladder` field (api | mcp | script | safari | screen) with a one-line reason. The operator fills it in before its first safari or computer call.
   - Have the operator loop refuse a `computer` call when the ladder is missing, or when it says api/mcp and no attempt was logged.
   - Record the chosen tier in procedural memory so repeat jobs start at the tier that worked last time.
   - Regression test: a job that has an MCP route and goes straight to `computer` gets blocked.

2. **Hard stop on 2FA, admin and OS security in the screen computer tool (P1).**
   - Before each act step, classify the fresh screenshot for 2FA code fields, password/admin dialogs, System Settings Privacy & Security, and Keychain prompts. Accessibility window titles help where available.
   - On a match, stop the action, call ask_owner with what is on screen, and resume only after his reply. This reuses the Safari ask-then-resume path.
   - Never read Messages/SMS to get a code. Add this as a fixed rule in the Jarvis prompt.
   - Regression test with a captured 2FA screen and an OS privacy dialog.

3. **Native-app control: say stop conditions, refuse OS settings, check scope after (P1).**
   - Before a native-app run, say the target app, the intended change and the stop conditions in one line.
   - Block System Settings security panes unless Evens explicitly asks.
   - After the run, take a fresh screenshot (plus an Accessibility read when available). Confirm the target control changed and nothing outside the app did, and report what changed.
   - Separate track: Accessibility (AX) background control, so native apps can be driven without taking the foreground. This is already on the missing list.

4. **Independent verifier pass with a QA bug schema (P2; covers QA, the screen critique and simulator testing).**
   - Define a bug record: severity, expected, actual, repro steps, screenshot path, and a triage summary.
   - Before `done` on any build or UI job, start a separate verifier run (a different model tier through Jev, fresh context). It exercises the real surface (browser page, app window or simulator) and returns records plus a critique.
   - The builder cannot mark done while open high-severity records exist. Evens or Watchdog still issues the PASS.
   - Depends on the missing sub-agent / verifier capability.

5. **Containment: named-folder scope and a sandbox for risky shell (P2).**
   - File chores take an explicit folder list. Writes outside it are refused, and the run ends with a change summary (moved, renamed, created).
   - Add a `sandbox` option to the shell tool that runs the command in a throwaway Docker container with only the named folder mounted. Use it by default for unknown scripts or downloaded code.
   - Before any clone or install, check the license and pin versions (repo install gate). Docker Desktop must be running.

Not covered here: resume after reboot (relevant since the Mac just restarted) and parallel read-only tools. These are harness-wide gaps, not computer-use methods, so they are tracked in their own family.
