# saylor-remaining

**State (REPLACE)** 2026-09-02 01:40 ET
Open harvest queue. Fold each COURSE-SKILL close with `saylor-fold.py`. Remaining ≠ 0 until unproctored finals are done. Webcam ACE skipped.

Status: **open** | **folded** | **parked** (BUS650 left alone) | **exam-closer**

| course | desk | status | notes |
|---|---|---|---|
| BUS301 | Big Boss | exam-closer | one certificate final at a time |
| BUS612 | Researcher | open | harvest packet+skill |
| BUS613 | Money Desk | open | harvest |
| BUS614 | Personal CFO | open | harvest |
| ECON101 | Wealth Manager | open | harvest |
| BUS630 | Product GTM | open | harvest |
| CS105 | Watchdog | open | harvest |
| CS101 | Forge | open | harvest |
| BUS640 | Career Strategist | open | harvest |
| COMM101 | Communications Manager | open | harvest |
| ARTH101 | Creative Studio | open | harvest |
| ENGL101 | Publishing Engine | open | harvest |
| BUS650 | — | parked | left alone |
| BUS651 | — | open | entrepreneurship cluster (with 652–654) |
| BUS652 | — | open | |
| BUS653 | — | open | |
| BUS654 | Personal CFO | open | seminar on disk; fold when COURSE-SKILL closes |

Fold:

```
python3 scripts/hive/os/saylor-fold.py --course BUS612 --slug <kebab> --when "…" --never "… exam …" --desk Watchdog --plain "…" --lane hive-os
python3 scripts/hive/os/skills-sync.py --write
```

`--dry-run` prints the fold and writes nothing. Do not invent `--when` / `--never`. Packet on the box first. Same command for every future close.

## Events
- 2026-09-02 Queue from parallel-harvest + 651–654 cluster. COMM100 + BUS633 already folded.
