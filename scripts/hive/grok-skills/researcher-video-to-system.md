# Skill: researcher-video-to-system

**Owner:** Researcher — video subtype of `researcher-research-to-system.md`.

**Parent skill (all research types):** `scripts/hive/grok-skills/researcher-research-to-system.md`

**Goal:** Chapter breakdown for the operator **and** implement learnings in the hive so all 17 agents adapt — research is not a chat summary that dies in-thread.

**Companion CLI:**

```bash
python3 scripts/hive/researcher-research-implement.py video --watch-json /path/to/watch.json --title "VIDEO TITLE" --write
python3 scripts/hive/researcher-research-implement.py video --youtube-url 'https://www.youtube.com/watch?v=...' --title "VIDEO TITLE" --write
```

---

## Trigger phrases (operator)

- "Watch this video"
- "Break down this video"
- "What does this video say"
- YouTube / TikTok / Loom URL pasted
- "Implement this in our system"

When triggered → **do not** reply with a vague summary only. Run the full pipeline below.

---

## Pipeline (always in order)

### 1. Acquire (L1 → L4)

| Level | Action |
|-------|--------|
| L1 | Metadata + title + duration + URL |
| L2 | Transcript: `python3 scripts/hive/hive-web-research.py youtube --url 'URL'` OR Grok watch JSON |
| L3 | Grok **computer watch** if visuals/procedure matter; save watch JSON |
| L4 | `python3 scripts/hive/os/analyze-video-watch.py --input watch.json --output analysis.json` |

Budget: `python3 scripts/hive/os/knowledge-policy.py --hierarchy Researcher`

### 2. Chapter breakdown (operator-facing)

Produce **CHAPTERS** with timestamps — this is what the operator reads first.

Format (required):

```markdown
# Video: {title}
**URL:** … · **Duration:** … · **Analyzed:** YYYY-MM-DD · **Labels:** FACT / INFERENCE / UNVERIFIED

## Executive summary (3–5 bullets)

## Chapters

### Ch 1 — {title} `[00:00–02:15]`
- **Says:** …
- **Means for Evens:** …
- **Label:** FACT | INFERENCE | OPINION | UNVERIFIED

### Ch 2 — …

## Top 3 actionable takeaways (with timestamps)
```

Chapter rules:

- One chapter per **topic shift** (new argument, numbered tip, demo section, Q&A block)
- Minimum 2 chapters for videos >3 min; merge micro-segments
- Every chapter needs **Means for Evens** (portfolio / agents / workflow — not generic)
- Never invent quotes — mark gaps UNVERIFIED

CLI scaffold: `researcher-video-implement.py` writes `CHAPTERS.md` from transcript/watch JSON.

### 3. System implementation map (agents adapt)

Research without implementation = failure. For each takeaway, fill:

| Takeaway | Hive target | Agent(s) | Change |
|----------|-------------|----------|--------|
| e.g. "reject 70% done" | `agent-doctrine-lanes.py` → Forge | Forge, Watchdog | verification checklist |
| e.g. "multi-business" | `business-lanes.json` | Big Boss | portfolio rotation |
| e.g. new DON'T | `OPERATOR_MEMORY.md` LESSONS | Librarian | promote with provenance |
| e.g. new procedure | `scripts/hive/grok-skills/{slug}.md` | all | skill reference |
| e.g. client pattern | `AI_PARTNER_PLAYBOOK.md` | Consultant, GTM | scope rule |

**Implementation targets (check each video):**

1. `docs/hive/outer-heaven/OPERATOR_MEMORY.md` — LESSONS / DECISIONS / FACTS (tag business lane)
2. `scripts/hive/agent-doctrine-lanes.py` — per-agent lane lines (all 17)
3. `scripts/hive/grok-skills/` — new or updated skill md
4. `scripts/hive/business-lanes.json` — if new business model / lane
5. `scripts/hive/grokbot-setup-agents.py` — if shared rule for everyone
6. `scripts/hive/build-grok-agent-routines.py` — if routine behavior changes
7. Reprovision: `grokbot-setup-agents.py` + `grokbot-setup-routines.py --core --force-update`

Write `IMPLEMENTATION_MAP.md` in the packet folder before editing repo files.

### 4. Execute + hand off

1. **Message @Librarian** — promote DON'TS/LESSONS to OPERATOR_MEMORY (with source URL + chapter refs)
2. **Message affected agents** — e.g. @Forge @Consultant @Big Boss with concrete "adapt X" tasks
3. **Message @Big Boss** — if portfolio priority changes across business lanes
4. Register packet:

```bash
python3 scripts/hive/hive-web-research.py packet --question "Video: TITLE — system implementation" --agent Researcher --tier standard --register
```

Packet path: `~/.grokbot/research-packets/video-{slug}/`

### 5. Operator reply template

Always end with:

1. **Chapters** (linked or inline — timestamped)
2. **What we implemented** (files touched or PR/commit planned)
3. **Which agents now behave differently** (name them — all affected lanes)
4. **Open gaps** (UNVERIFIED / needs operator decision)

---

## Do not

- Stop at "here's a summary" without chapters
- Skip system implementation ("interesting video" is not done)
- Implement without labeling claims FACT vs INFERENCE
- Let one business lane absorb unrelated video advice (tag lane id)
- Reprovision agents without noting it in the reply

---

## Related

- `/analyze-video-watch-output` — L3–L4 beat merge
- `scripts/hive/grok-skills/ai-native-operator-doctrine.md` — example of video → system pass
- `docs/os/RESEARCH.md` — budgets
