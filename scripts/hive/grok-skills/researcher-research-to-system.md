# Skill: researcher-research-to-system

**Owner:** Researcher — **mandatory** for **any** operator research request (not just video).

**Goal:** Structured breakdown for the operator **and** implement learnings so all 17 agents adapt. Research that stays in-chat = failure.

**Parent skill.** Type-specific add-ons:
- Video → `researcher-video-to-system.md`
- X bookmarks → section below + `CONTENT/x-bookmarks/learnings-implement.md` as example output

**CLI:**

```bash
# Video
python3 scripts/hive/researcher-research-implement.py video --youtube-url 'URL' --title "TITLE" --write

# X bookmarks (AI filter default)
python3 scripts/hive/researcher-research-implement.py bookmarks --filter ai --write

# Web dossier / packet
python3 scripts/hive/researcher-research-implement.py dossier --question "TOPIC" --write
```

---

## Universal trigger phrases

| Operator says | Research type |
|---------------|---------------|
| "Watch this video" / URL | video |
| "Find my X bookmarks" / "AI bookmarks" | bookmarks |
| "Research X" / "Look into Y" / "What's the state of Z" | dossier |
| "Break down what you found" | **always** — any type |
| "Implement this" | **always** — system pass required |

---

## Universal pipeline (every research type)

### 1. Acquire

Use the right source — **execute tools**, don't ask operator to paste data you can read.

| Type | Sources (in order) |
|------|-------------------|
| **Video** | Grok watch → `researcher-research-implement.py video` |
| **X bookmarks** | `~/.grokbot/x-bookmarks.json` or `CONTENT/x-bookmarks/ai-only.json` (sync via `~/.grokbot/scripts/x-bookmarks-sync.sh` if stale) |
| **Web / topic** | `hive-web-research.py dossier` or `packet` |
| **Papers** | `hive-web-research.py papers --query` |
| **Social** | Grok browser read-only; label UNVERIFIED |

Budget: `python3 scripts/hive/os/knowledge-policy.py --hierarchy Researcher`

### 2. Breakdown (operator-facing) — **required**

Researcher delivers **FINDINGS.md** structure (not a vague paragraph):

```markdown
# Research: {title}
**Type:** video | bookmarks | dossier | …
**Source:** … · **Count/items:** … · **Analyzed:** date

## Executive summary (3–7 bullets)

## Themes / clusters
### Theme 1 — {name} ({N} items)
- **What we found:** …
- **Means for Evens / hive:** … (tag business lane: ai-partner-websites | amazon-own-store | hive-os | …)
- **Label:** FACT | INFERENCE | OPINION | UNVERIFIED
- **Top sources:** links or bookmark ids

## Actionable implementables (ranked P0–P2)
| Priority | Action | Owner agent(s) | Hive target |

## Quarantine / ignore (if any)
Noise, hacks, off-brand — say why.

## Appendix (optional)
Full item list, raw counts, methodology.
```

**Video** uses **Chapters** instead of Themes (timestamps).  
**Bookmarks** uses **Themes/clusters** (e.g. Claude Code, MCP, cinematic sites, agent hype).  
**Dossier** uses **Findings by source** with confidence labels.

### 3. System implementation (agents adapt)

Same as video skill — fill `IMPLEMENTATION_MAP.md`:

| Target | When |
|--------|------|
| `OPERATOR_MEMORY.md` | durable LESSONS/FACTS |
| `agent-doctrine-lanes.py` | behavior change for any of 17 |
| `grok-skills/*.md` | new procedure |
| `business-lanes.json` | new business model |
| `CONTENT/x-bookmarks/learnings-implement.md` | bookmark-derived implementables |
| Reprovision agents | after repo edits |

### 4. Hand off

1. **@Librarian** — promote don'ts/learnings with provenance  
2. **Affected agents** — concrete tasks (e.g. @Forge MCP demo, @Creative Studio cinematic playbook)  
3. **@Big Boss** — if portfolio priority shifts across business lanes  
4. Register: `jobType research.bookmarks_system | research.dossier_system | research.video_system`

Packet path: `~/.grokbot/research-packets/{type}-{slug}/`

### 5. Operator reply template

1. **Breakdown** (themes/chapters/findings — scannable)  
2. **What we implemented** (files touched)  
3. **Which agents adapt** (name all affected)  
4. **Gaps / stale data** (e.g. bookmarks sync needed)

---

## X bookmarks (specific)

**Never** claim live X API from Grok — read synced files only.

Paths (first existing wins):
1. `~/.grokbot/outer-heaven/CONTENT/x-bookmarks/ai-only.json` (working set, ~34 AI-related)
2. `docs/hive/outer-heaven/CONTENT/x-bookmarks/ai-only.json` (repo mirror)
3. `~/.grokbot/x-bookmarks.json` (full set — filter with `--filter ai`)

```bash
python3 scripts/hive/researcher-research-implement.py bookmarks --filter ai --write
# Stale? Operator runs: ~/.grokbot/scripts/x-bookmarks-sync.sh --max 100
```

Cluster bookmarks into themes; reference `learnings-implement.md` pattern for P0–P2 table.  
Working set for daily signal = **AI-only**, not full 98.

---

## Do not

- Reply "I found some interesting bookmarks" without theme breakdown + counts  
- Skip implementation map  
- Treat one business lane as the whole company  
- Invent bookmarks not in synced JSON  
- Copy hype literally (40-agent marketing swarms → sober 17-agent OS narrative)

---

## Related

- `researcher-video-to-system.md`
- `CONTENT/x-bookmarks/README.md`
- `hive-web-research.py`
- `ai-native-operator-doctrine.md`
