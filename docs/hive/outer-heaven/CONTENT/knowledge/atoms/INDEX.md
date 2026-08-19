# Atoms (layer 2)

One tactic / principle / warning / step / example / claim / metric / decision-rule per unit.

**Schema:** [schema.json](schema.json)  
**Append:** `by-video/{video_id}.jsonl` — one JSON object per line.  
**Validate / append:** `python3 scripts/hive/knowledge-emit-atoms.py`

Atoms are the structured extract from packet `LEARNED.md` §B (+ D/E/F sequences). They do **not** replace `full.txt` or the desk take.

## Integrity

See `knowledge-architecture`. Required: source, conditions, confidence, `knowledge_type`, `modality`, `evidence_status`, `layer_tag`, `conflicts_with`, `supports`.

Caption-only: `knowledge_type=declared`, `modality=speech`, visual/click `evidence_status=unobserved` or `UNKNOWN`. Do not invent clicks.

Version the same id when more sources appear (`K-174` v4). Never freeze after the first video.

## On disk this turn

Named slice only. Do not emit the 146.

| video_id | file | count |
|----------|------|------:|
| `x-2088007687149601254` | [by-video/x-2088007687149601254.jsonl](by-video/x-2088007687149601254.jsonl) | 5 |
| `-6yUeJ3rkvg` | [by-video/-6yUeJ3rkvg.jsonl](by-video/-6yUeJ3rkvg.jsonl) | 2 |
| `-Lo_SlSgtnA` | [by-video/-Lo_SlSgtnA.jsonl](by-video/-Lo_SlSgtnA.jsonl) | 2 |
| `-Q_P7HFydZk` | [by-video/-Q_P7HFydZk.jsonl](by-video/-Q_P7HFydZk.jsonl) | 3 |
| `-cdexJWN8YA` | [by-video/-cdexJWN8YA.jsonl](by-video/-cdexJWN8YA.jsonl) | 6 |
| `-nG-9vlSkho` | [by-video/-nG-9vlSkho.jsonl](by-video/-nG-9vlSkho.jsonl) | 1 |
| `-zL_trhnQaI` | [by-video/-zL_trhnQaI.jsonl](by-video/-zL_trhnQaI.jsonl) | 5 |
| `0Ujdys4LqNs` | [by-video/0Ujdys4LqNs.jsonl](by-video/0Ujdys4LqNs.jsonl) | 2 |
| `0WDkwMxj13s` | [by-video/0WDkwMxj13s.jsonl](by-video/0WDkwMxj13s.jsonl) | 6 |
| `0YXjEzFfft8` | [by-video/0YXjEzFfft8.jsonl](by-video/0YXjEzFfft8.jsonl) | 6 |
| `27Y44JYXZJ8` | [by-video/27Y44JYXZJ8.jsonl](by-video/27Y44JYXZJ8.jsonl) | 5 |
| `2J3uX8iRNng` | [by-video/2J3uX8iRNng.jsonl](by-video/2J3uX8iRNng.jsonl) | 6 |
| `2OD14-0cot4` | [by-video/2OD14-0cot4.jsonl](by-video/2OD14-0cot4.jsonl) | 5 |
| `35WuZxbAY68` | [by-video/35WuZxbAY68.jsonl](by-video/35WuZxbAY68.jsonl) | 5 |
| `3GAxd90fEE4` | [by-video/3GAxd90fEE4.jsonl](by-video/3GAxd90fEE4.jsonl) | 6 |
| `3QclAjmu5Tw` | [by-video/3QclAjmu5Tw.jsonl](by-video/3QclAjmu5Tw.jsonl) | 1 |
| `3TdD8Qv5Tk8` | [by-video/3TdD8Qv5Tk8.jsonl](by-video/3TdD8Qv5Tk8.jsonl) | 6 |
| `3XIGcM7VICc` | [by-video/3XIGcM7VICc.jsonl](by-video/3XIGcM7VICc.jsonl) | 6 |
| `4OOS96i2gfI` | [by-video/4OOS96i2gfI.jsonl](by-video/4OOS96i2gfI.jsonl) | 3 |
| `5IM27lbCwjM` | [by-video/5IM27lbCwjM.jsonl](by-video/5IM27lbCwjM.jsonl) | 2 |
| `5p5cV0yVDvQ` | [by-video/5p5cV0yVDvQ.jsonl](by-video/5p5cV0yVDvQ.jsonl) | 6 |
| `62Rfe1w9NBc` | [by-video/62Rfe1w9NBc.jsonl](by-video/62Rfe1w9NBc.jsonl) | 4 |
| `6cEQEba0i2A` | [by-video/6cEQEba0i2A.jsonl](by-video/6cEQEba0i2A.jsonl) | 1 |
| `7UNsK9LoORo` | [by-video/7UNsK9LoORo.jsonl](by-video/7UNsK9LoORo.jsonl) | 4 |
| `7siRW0My05o` | [by-video/7siRW0My05o.jsonl](by-video/7siRW0My05o.jsonl) | 4 |
| `8C6iCpJ9HPo` | [by-video/8C6iCpJ9HPo.jsonl](by-video/8C6iCpJ9HPo.jsonl) | 2 |
| `8IUWeF3B-hk` | [by-video/8IUWeF3B-hk.jsonl](by-video/8IUWeF3B-hk.jsonl) | 2 |
| `8MEJen0nblQ` | [by-video/8MEJen0nblQ.jsonl](by-video/8MEJen0nblQ.jsonl) | 6 |
| `8QQ_INxAhRs` | [by-video/8QQ_INxAhRs.jsonl](by-video/8QQ_INxAhRs.jsonl) | 6 |
| `8ktcSaSTvxk` | [by-video/8ktcSaSTvxk.jsonl](by-video/8ktcSaSTvxk.jsonl) | 6 |
| `9IzGe0BBj_c` | [by-video/9IzGe0BBj_c.jsonl](by-video/9IzGe0BBj_c.jsonl) | 2 |
| `9mqsVK6Iqoc` | [by-video/9mqsVK6Iqoc.jsonl](by-video/9mqsVK6Iqoc.jsonl) | 2 |
| `AO5aW01DKHo` | [by-video/AO5aW01DKHo.jsonl](by-video/AO5aW01DKHo.jsonl) | 6 |
| `AYsg5gAMWyo` | [by-video/AYsg5gAMWyo.jsonl](by-video/AYsg5gAMWyo.jsonl) | 6 |
| `B4p9O2P2a3c` | [by-video/B4p9O2P2a3c.jsonl](by-video/B4p9O2P2a3c.jsonl) | 6 |
| `BO-jFbN4p8Y` | [by-video/BO-jFbN4p8Y.jsonl](by-video/BO-jFbN4p8Y.jsonl) | 6 |
| `CB5bG4mvnS0` | [by-video/CB5bG4mvnS0.jsonl](by-video/CB5bG4mvnS0.jsonl) | 6 |
| `CvA8-aScqio` | [by-video/CvA8-aScqio.jsonl](by-video/CvA8-aScqio.jsonl) | 5 |

VIEW A `category-pitch-fails` and VIEW B `buyers-dislike-term-AI` are **separate atoms**. Do not merge.

Slice 0–36 (lexicographic `full.txt` ids): source `packets/{id}/LEARNED.md` §B. Speech≠behavior kept as separate implicit atoms. Caption-only. Tape $ UNVERIFIED. Fazio `x-2088007687149601254` is index 139 — not in this slice; left untouched. Slice total **158**.

### Slice 111–end (remainder; lex `full.txt` ids, total corpus 147)

Source `LEARNED.md` §B + D/E/F/G. Speech≠behavior kept separate. Caption-only. Tape $ UNVERIFIED. Clients parked. `x-2088007687149601254` already on disk — not rewritten. Leftover id `zyvdl__Ywfk` included. Slice atoms **483** (35 files).

| video_id | file | count |
|----------|------|------:|
| `irg-2IfAjpo` | [by-video/irg-2IfAjpo.jsonl](by-video/irg-2IfAjpo.jsonl) | 16 |
| `jBanaNBY-sM` | [by-video/jBanaNBY-sM.jsonl](by-video/jBanaNBY-sM.jsonl) | 18 |
| `jZgcWCzxh1I` | [by-video/jZgcWCzxh1I.jsonl](by-video/jZgcWCzxh1I.jsonl) | 18 |
| `jdbOVepEtUE` | [by-video/jdbOVepEtUE.jsonl](by-video/jdbOVepEtUE.jsonl) | 17 |
| `kB9iMD0EjT8` | [by-video/kB9iMD0EjT8.jsonl](by-video/kB9iMD0EjT8.jsonl) | 6 |
| `kOKavHnlPik` | [by-video/kOKavHnlPik.jsonl](by-video/kOKavHnlPik.jsonl) | 15 |
| `lcNN3X9gXls` | [by-video/lcNN3X9gXls.jsonl](by-video/lcNN3X9gXls.jsonl) | 12 |
| `lkR6mvqQQlk` | [by-video/lkR6mvqQQlk.jsonl](by-video/lkR6mvqQQlk.jsonl) | 15 |
| `lokbsA5VXOk` | [by-video/lokbsA5VXOk.jsonl](by-video/lokbsA5VXOk.jsonl) | 17 |
| `mPflFTQUCGk` | [by-video/mPflFTQUCGk.jsonl](by-video/mPflFTQUCGk.jsonl) | 7 |
| `nQtogLs_dlg` | [by-video/nQtogLs_dlg.jsonl](by-video/nQtogLs_dlg.jsonl) | 6 |
| `oWdJMJp2HgM` | [by-video/oWdJMJp2HgM.jsonl](by-video/oWdJMJp2HgM.jsonl) | 14 |
| `pbrln2TVeh4` | [by-video/pbrln2TVeh4.jsonl](by-video/pbrln2TVeh4.jsonl) | 16 |
| `pxzo2lXhWJE` | [by-video/pxzo2lXhWJE.jsonl](by-video/pxzo2lXhWJE.jsonl) | 17 |
| `q5lg3npxjAc` | [by-video/q5lg3npxjAc.jsonl](by-video/q5lg3npxjAc.jsonl) | 15 |
| `rMf-JuikR-Q` | [by-video/rMf-JuikR-Q.jsonl](by-video/rMf-JuikR-Q.jsonl) | 16 |
| `rXpHzWXjHrw` | [by-video/rXpHzWXjHrw.jsonl](by-video/rXpHzWXjHrw.jsonl) | 7 |
| `tDGiWn0flK8` | [by-video/tDGiWn0flK8.jsonl](by-video/tDGiWn0flK8.jsonl) | 17 |
| `tFFKuq2t0rI` | [by-video/tFFKuq2t0rI.jsonl](by-video/tFFKuq2t0rI.jsonl) | 16 |
| `tNOk29fs_aY` | [by-video/tNOk29fs_aY.jsonl](by-video/tNOk29fs_aY.jsonl) | 8 |
| `uC5tDwGhyVA` | [by-video/uC5tDwGhyVA.jsonl](by-video/uC5tDwGhyVA.jsonl) | 6 |
| `vDVSGVpB2vc` | [by-video/vDVSGVpB2vc.jsonl](by-video/vDVSGVpB2vc.jsonl) | 17 |
| `vFepZE_wrfg` | [by-video/vFepZE_wrfg.jsonl](by-video/vFepZE_wrfg.jsonl) | 17 |
| `vY0EzTP-7EA` | [by-video/vY0EzTP-7EA.jsonl](by-video/vY0EzTP-7EA.jsonl) | 7 |
| `vcU85OrwuV0` | [by-video/vcU85OrwuV0.jsonl](by-video/vcU85OrwuV0.jsonl) | 17 |
| `vfWTyEreOEc` | [by-video/vfWTyEreOEc.jsonl](by-video/vfWTyEreOEc.jsonl) | 16 |
| `w9-gfaV5vlM` | [by-video/w9-gfaV5vlM.jsonl](by-video/w9-gfaV5vlM.jsonl) | 28 |
| `wk8KV280fbg` | [by-video/wk8KV280fbg.jsonl](by-video/wk8KV280fbg.jsonl) | 8 |
| `xJ5oz63mIec` | [by-video/xJ5oz63mIec.jsonl](by-video/xJ5oz63mIec.jsonl) | 16 |
| `xn6Z5PYyAIE` | [by-video/xn6Z5PYyAIE.jsonl](by-video/xn6Z5PYyAIE.jsonl) | 16 |
| `xsAOpqjebOo` | [by-video/xsAOpqjebOo.jsonl](by-video/xsAOpqjebOo.jsonl) | 7 |
| `y-cq_Qo4zVo` | [by-video/y-cq_Qo4zVo.jsonl](by-video/y-cq_Qo4zVo.jsonl) | 16 |
| `ySl-SyboPa4` | [by-video/ySl-SyboPa4.jsonl](by-video/ySl-SyboPa4.jsonl) | 7 |
| `zWLZ3bVVwD8` | [by-video/zWLZ3bVVwD8.jsonl](by-video/zWLZ3bVVwD8.jsonl) | 16 |
| `zyvdl__Ywfk` | [by-video/zyvdl__Ywfk.jsonl](by-video/zyvdl__Ywfk.jsonl) | 16 |

### HIS social packets (2026-08-14) — Path C ingest only

Source `packets/social/*/visible.txt`. Caption/public JSON only. Not stranger slugs. 0 schema failures. Tape $ UNVERIFIED.

| source_id | file | count |
|-----------|------|------:|
| `tt-evenslouistv` | [by-video/tt-evenslouistv.jsonl](by-video/tt-evenslouistv.jsonl) | 1 |
| `ig-evenslouis_` | [by-video/ig-evenslouis_.jsonl](by-video/ig-evenslouis_.jsonl) | 2 |
| `x-snevemoney` | [by-video/x-snevemoney.jsonl](by-video/x-snevemoney.jsonl) | 2 |
| `x-1894541007636648097` | [by-video/x-1894541007636648097.jsonl](by-video/x-1894541007636648097.jsonl) | 1 |

### YT WL AI 2026-08-14 (caption-only; 6 new ids)

Source `packets/{id}/LEARNED.md` §B. Speech≠behavior kept separate. Validated `--caption-only`. `U6k4MeVks_Y` / `I7mpF7_pnPM` MERGE only — atoms not re-emitted.

| video_id | file | count |
|----------|------|------:|
| `gt8k4bA01Mo` | [by-video/gt8k4bA01Mo.jsonl](by-video/gt8k4bA01Mo.jsonl) | 4 |
| `RDytbVDzMF4` | [by-video/RDytbVDzMF4.jsonl](by-video/RDytbVDzMF4.jsonl) | 4 |
| `vLlIBT0HSSc` | [by-video/vLlIBT0HSSc.jsonl](by-video/vLlIBT0HSSc.jsonl) | 4 |
| `eecUhBpTz_g` | [by-video/eecUhBpTz_g.jsonl](by-video/eecUhBpTz_g.jsonl) | 4 |
| `iRBs8PCBCaA` | [by-video/iRBs8PCBCaA.jsonl](by-video/iRBs8PCBCaA.jsonl) | 4 |
| `lRUpu2-KtGQ` | [by-video/lRUpu2-KtGQ.jsonl](by-video/lRUpu2-KtGQ.jsonl) | 4 |
