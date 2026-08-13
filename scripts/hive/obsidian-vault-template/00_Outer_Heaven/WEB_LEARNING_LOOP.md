# Web learning loop — bounded read-only research

Agents learn from the **web + library**, not by bypassing operator on Tier 3.

---

## Goals

1. Pull public best practices for items in `AGENTS_LAB.md` research queue
2. Append chronicle entries (`source: web-learning`)
3. Draft `METHODS/draft-web-<slug>.md` for operator review
4. Never auto-spend, auto-deploy, or auto client send

---

## Script

```bash
python3 scripts/hive/outer-heaven/web-learning-cycle.py
python3 scripts/hive/outer-heaven/web-learning-cycle.py --dry-run
python3 scripts/hive/outer-heaven/web-learning-cycle.py --max-items 1
```

**Inputs:**

- `AGENTS_LAB.md` — research queue section
- `NORTH_STAR.md` — capability lanes

**Outputs:**

- Chronicle append (INFO telemetry)
- Draft method in `METHODS/draft-web-*.md`
- Optional Grok Scout mission via `emit-operator-event.sh` (INFO — silent)

---

## Budget and containment

- Respect hive $15 API expense breaker (`CONTAINMENT_GRID.md`)
- Skip if no search API key configured
- Max **3 items per run** (default)
- Read-only fetch — no form submit, no login scraping

---

## Schedule

| Where | When | How |
|-------|------|-----|
| VPS | Sunday after meta-critique | cron doc below |
| Mac | Manual or weekly launchd | optional |

**VPS cron example (operator adds):**

```cron
0 15 * * 0 cd /root/domain-paths/n8n-cursor && python3 scripts/hive/outer-heaven/web-learning-cycle.py >> /tmp/web-learning.log 2>&1
```

Or activate n8n workflow `hive-web-learning-cycle` on evenslouis.ca/n8n (inactive until operator enables).

---

## Promotion path

1. Draft appears in `METHODS/draft-web-*.md`
2. Operator reviews in Obsidian
3. Approve → `bash scripts/hive/outer-heaven/promote-to-method.sh`
4. Or reject — draft stays; chronicle retains raw learnings

---

## Grok Scout integration

Scout Lead Gen can run read-only research missions aligned with queue items. Output goes to library only — **no client send**.

---

## Safety

- No credential scraping
- No paywalled account automation
- No auto-apply to prod
- Findings stay DRAFT until operator promotes
