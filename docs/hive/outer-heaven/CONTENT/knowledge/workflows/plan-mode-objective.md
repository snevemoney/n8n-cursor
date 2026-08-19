# Workflow — plan-mode-objective
Status: compiled · tape-faithful 2026-08-14
Protocol: workflow-compiler
**Provenance:** WORKFLOW → PATTERN → ATOMS → TRANSCRIPT
**Title:** Plan + unknowns → folder survives → session becomes a skill → objective done-when
**Tape:** `U6k4MeVks_Y` · Chase AI · caption-only · 11335 words
**Owners:** forge, librarian, watchdog
**Hive skill:** `skill-from-session` (the un-hid machine). `session-bootstrap` is the dump, not this.

## Classify
- **Who:** Cursor / Grok sitting that produced a repeatable result.
- **Outcome:** Named SKILL.md in three places, or a plan + explain-don’t-recommend trail in a folder.
- **Operate-never:** Claude Code / Codex / unsupervised `/goal` / 6M-token burn / accept-forever

## Decompose (spoken order)
1. Plan first; end with “what am I not thinking?”
2. Do not smash Recommended — ask it to explain the options
3. Work in a folder; new chat in the **same folder** when context rots
4. Leave global instructions blank unless true for every chat
5. When the run wins: turn the session into a named skill
6. Long-horizon only with an **objective** done-when
7. Other session grades (Watchdog, not Codex)

## Coverage map
| id | task | coverage | pointer |
|----|------|----------|---------|
| T1 | Plan + unknowns | have | LEARNED A prompt beat |
| T2 | Explain-don’t-recommend | have | Lighthouse / Recommended |
| T3 | Folder survives new-chat | have | `/clear` vs same folder |
| T4 | Blank global | have | rhyme warning |
| T5 | Session → skill | have | skill-creator on-tape |
| T6 | Objective `/goal` | have | merge stricter into `checkable-stop` |
| T7 | Other-model grade | have | Watchdog = hive Codex |

## Steps
### 1. Plan + unknowns
- **Do:** Plan mode first. Mic/stream dump + “what am I not thinking?”
- **Transcript:** `packets/U6k4MeVks_Y/transcripts/full.txt` @ UNKNOWN
- **support_ids:** K-U6k4MeVks_Y-01

### 2. Explain-don’t-recommend
- **Do:** Ask the model to explain stack/options. Recommended-loop = replaceable.
- **Transcript:** `packets/U6k4MeVks_Y/transcripts/full.txt` @ UNKNOWN

### 3. Folder survives the thread
- **Do:** Pick a folder. If the ring fills (~30% his rule, not a bench) → new chat in the **same folder**. Files outlive the thread.
- **Transcript:** `packets/U6k4MeVks_Y/transcripts/full.txt` @ UNKNOWN

### 4. Blank global
- **Do:** Do not stuff rhyme-level globals. Load tools when needed.
- **Transcript:** `packets/U6k4MeVks_Y/transcripts/full.txt` @ UNKNOWN

### 5. Session → named skill
- **Do:** Write `scripts/hive/grok-skills/{slug}.md` + `.cursor/skills/{slug}/SKILL.md` + `~/.grokbot/skills/{slug}/SKILL.md`. Funnel row + inventory. WIRED, not forever.
- **Transcript:** `packets/U6k4MeVks_Y/transcripts/full.txt` @ UNKNOWN
- **Hive:** `skill-from-session`

### 6. Objective done-when
- **Do:** Long loop only if success is checkable. Eternal = skill + log + routine Evens names. Unsupervised `/goal` never.
- **Transcript:** `packets/U6k4MeVks_Y/transcripts/full.txt` @ UNKNOWN
- **Hive:** `checkable-stop`

### 7. Watchdog grades
- **Do:** Builder does not fill GRADE. `separate-verifier`.
- **Transcript:** `packets/U6k4MeVks_Y/transcripts/full.txt` @ UNKNOWN

## Audits
- **coverage:** pass
- **context-misuse:** pass
- **contradiction:** pass — not remapped to session-bootstrap
