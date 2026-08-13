# Skill: researcher-research-to-system

**Owner:** Researcher — **mandatory** for **any** operator research request (not just video).

**Goal:** Structured breakdown for the operator **and** implement learnings so all 17 agents adapt. Research that stays in-chat = failure.

**Parent skill.** Type-specific add-ons:
- Video → `researcher-video-to-system.md`
- X bookmarks → section below + `CONTENT/x-bookmarks/learnings-implement.md` as theme-table example. Steal + deep merge into the **same** master files as Watch Later (do not fork `x-bookmarks/STEAL_SHEET.md`).

**CLI:**

```bash
# Video
python3 scripts/hive/researcher-research-implement.py video --youtube-url 'URL' --title "TITLE" --write

# X bookmarks (AI filter default)
python3 scripts/hive/researcher-research-implement.py bookmarks --filter ai --write

# Web dossier / packet
python3 scripts/hive/researcher-research-implement.py dossier --question "TOPIC" --write

# YouTube Watch Later (native logged-in browser scrape JSON)
python3 scripts/hive/scrape-youtube-watch-later.py --from-json PATH --write-dir docs/hive/outer-heaven/CONTENT/watch-later
python3 scripts/hive/researcher-research-implement.py watchlater --from-json PATH --write --mirror-repo
```

---

## Universal trigger phrases

| Operator says | Research type |
|---------------|---------------|
| "Watch this video" / URL | video |
| "Find my X bookmarks" / "AI bookmarks" | bookmarks |
| "Scrape Watch Later" / "my YouTube queue" | watchlater |
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
| **Watch Later** | Native **logged-in** YouTube tab `playlist?list=WL` → JSON → `researcher-research-implement.py watchlater`. Signed-out cloud Chrome = **0 items, do not invent**. |
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
**Watch Later** uses **Themes/clusters** (same family as bookmarks; full ITEMS_LEDGER + batches/). Signed-out scrape → blocker FINDINGS, empty ledger.  
**Bookmarks** uses **Themes/clusters** (e.g. Claude Code, MCP, cinematic sites, agent hype).  
**Dossier** uses **Findings by source** with confidence labels.

### 2b. Steal sheet (mandatory)

Thesis-only is **not done**. **Any source** (video, Watch Later, X bookmarks, dossier) that names an ICP, numbered offer, or delivery machine:

1. Load `scripts/hive/grok-skills/steal-usecases.md`
2. Write/append packet `STEAL_SHEET.md` (who + machine + Path A/B/C + hive skills + kill)
3. Merge into the **one** master: `docs/hive/outer-heaven/CONTENT/watch-later/STEAL_SHEET.md` + `business-types.json`
4. Tag sources `yt:{videoId}` or `x:{tweetId}`. Bookmarks = **cluster** rows, not one row per tweet
5. Sellable rows → `usecase-to-sku`. New `icp_id` → OPERATOR_MEMORY FACTS
6. $ on tape/tweet = UNVERIFIED. Stack = Cursor + Grok only

Do **not** create `CONTENT/x-bookmarks/STEAL_SHEET.md`. **Every later video/bookmark batch must append the master.**

### 2c. Deep summaries (mandatory)

Do not flatten a doctrine into a SKU. After steal:

1. Write/append packet + `CONTENT/watch-later/DEEP_SUMMARIES.md` — the **whole argument** (economics, role, failure modes, close), not just machines
2. Videos = per-video (video 8 pattern: paradox / orchestration / illusion of progress). Bookmarks = **clusters**, not 98 essays
3. Theme tables (`learnings-implement.md`) ≠ this file. CHAPTERS stays Means-for-Evens
4. Do **not** create `CONTENT/x-bookmarks/DEEP_SUMMARIES.md`

### 3. System implementation (agents adapt)

Same as video skill — fill `IMPLEMENTATION_MAP.md`:

| Target | When |
|--------|------|
| `OPERATOR_MEMORY.md` | durable LESSONS/FACTS |
| `agent-doctrine-lanes.py` | behavior change for any of 17 |
| `grok-skills/*.md` | new procedure |
| `business-lanes.json` | new business model |
| `CONTENT/watch-later/STEAL_SHEET.md` + `business-types.json` | steal ICPs / machines from **any** source (one catalog) |
| `CONTENT/watch-later/DEEP_SUMMARIES.md` | whole-argument summaries (videos + bookmark clusters) |
| `CONTENT/x-bookmarks/learnings-implement.md` | bookmark theme table + P0–P2 (not a second steal sheet) |
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

### Full read pass (not a glance)

Even with **hundreds** of bookmarks, Researcher must **read every item**:

1. Run CLI with `--write` — produces:
   - `ITEMS_LEDGER.md` — **every** bookmark, full tweet text, one row each
   - `batches/batch-001.md`, `batch-002.md`, … — **25 items per batch** (default)
   - `coverage.json` — `total_items` must equal `items_in_ledger` (100%)
2. Read **each batch file in order** in Grok (shell `cat` or `--read` via brief)
3. Synthesize themes in FINDINGS.md — top items are **summary only**; ledger is proof
4. Report to operator: `Read 98/98 bookmarks across 4 batches` — never "…and 93 more" without ledger

```bash
python3 scripts/hive/researcher-research-implement.py bookmarks --filter ai --write --batch-size 25
# Full set (98+): --filter all
```

Paths (first existing wins):
1. `~/.grokbot/outer-heaven/CONTENT/x-bookmarks/ai-only.json` (working set, ~34 AI-related)
2. `docs/hive/outer-heaven/CONTENT/x-bookmarks/ai-only.json` (repo mirror)
3. `~/.grokbot/x-bookmarks.json` (full set — filter with `--filter ai`)

```bash
python3 scripts/hive/researcher-research-implement.py bookmarks --filter ai --write
# Stale? Operator runs: ~/.grokbot/scripts/x-bookmarks-sync.sh --max 100
```

Cluster bookmarks into themes; reference `learnings-implement.md` pattern for P0–P2 table.  
Then **§2b + §2c**: merge ICPs/machines and cluster doctrine into the **master** steal sheet + `DEEP_SUMMARIES.md` (same files as Watch Later).  
Working set for daily signal = **AI-only**, not full 98.

---

## YouTube Watch Later (specific)

**Private playlist** (`https://www.youtube.com/playlist?list=WL`). Requires the **operator's logged-in YouTube tab**. Cloud Chrome / signed-out native browser will show a blank page — that is **not** an empty queue.

### Acquire

1. Use the **already-open** YouTube tab (do not start a logged-out session).
2. Confirm Watch Later rows render (`ytd-playlist-video-renderer` count > 0). If Sign in CTA is visible, **stop** and write `loggedIn: false`, `items: []`.
3. Scroll until the list stops growing. Dump JSON (`title`, `channel`, `url`, `videoId`, `duration`, `index`).
4. Normalize: `python3 scripts/hive/scrape-youtube-watch-later.py --from-json PATH --write-dir …`

### Full read pass

Same as bookmarks: `ITEMS_LEDGER.md` + `batches/` + `coverage.json`. Then:

```bash
python3 scripts/hive/researcher-research-implement.py watchlater --from-json PATH --write --mirror-repo
```

Repo mirror: `docs/hive/outer-heaven/CONTENT/watch-later/`

After L2 chapters: **§2b steal sheet** — append every ICP/machine to `STEAL_SHEET.md`. **§2c** — whole argument into `DEEP_SUMMARIES.md`. Thesis-only or SKU-only = not done.

**Never** invent videos. **Never** substitute subscriptions, Gmail YouTube mail, or the public homepage for Watch Later.

---

## Do not

- Reply "I found some interesting bookmarks" without theme breakdown + counts  
- Skip implementation map  
- Treat one business lane as the whole company  
- Invent bookmarks not in synced JSON
- Invent Watch Later videos when the browser session is signed out
- Copy hype literally (40-agent marketing swarms → sober 17-agent OS narrative)
- Stop at thesis after L2 or a bookmark true-read — steal ICPs/machines into the **master** `STEAL_SHEET.md` (`steal-usecases`)
- Fork a second steal/deep file under `x-bookmarks/`

---

## Related

- `researcher-video-to-system.md`
- `steal-usecases.md` — mandatory after L2 **or** bookmark true-read
- `CONTENT/watch-later/STEAL_SHEET.md` + `business-types.json` — **one** catalog (yt + x)
- `CONTENT/watch-later/DEEP_SUMMARIES.md` — whole argument (videos + bookmark clusters)
- `CONTENT/x-bookmarks/README.md` · `learnings-implement.md` (theme table only)
- `hive-web-research.py`
- `ai-native-operator-doctrine.md`
