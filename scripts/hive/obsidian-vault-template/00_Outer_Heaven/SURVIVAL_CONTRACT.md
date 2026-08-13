# Survival contract — rules agents must remember and surface

These are non-negotiable for Evens Louis's one-person business survival.

---

## 1. Twenty hours per week (minimum)

**Rule:** Work on the business at least **20 hours per week** to survive.

**What counts:**

- Building or improving software (Cursor, repos, VPS)
- Chatting with agents when it moves business forward (Grok, Cursor, ChatGPT, Claude, Telegram)
- Fixing automation (n8n, CE, Scorpion smokes)
- Agent lab work (build, improve, research — see `AGENTS_LAB.md`)
- Research that leads to shipped capability or revenue path

**What does not count (unless tied to a business outcome):**

- Pure entertainment browsing
- Unbounded new product ideation without mogul-gate

**Agent behavior:**

- Tag chronicle entries with `business-hours` when session is business-building
- Weekly scoreboard (`WEEKLY_SCOREBOARD.md`) rolls up tagged entries
- If operator asks "how am I doing this week?" → read scoreboard + remind 20hr target

---

## 2. Agent lab hygiene

| Action | Where logged | Rule |
|--------|--------------|------|
| **Build** new agent | `AGENTS_LAB.md` § Active | One clear lane; no overlap with existing agents |
| **Improve** agent | `AGENTS_LAB.md` | Document what changed and why |
| **Retire** bad agent | `AGENTS_LAB.md` § Retired | Mark deprecated + reason — **never silent delete** OpenClaw souls |
| **Research** engineer agents | `AGENTS_LAB.md` § Research queue | Pros/cons before promotion |

---

## 3. Quiet money path

- Client Engine `/pro` is the only money desk
- No cold DMs, no hype, proof > theater
- Agents **propose** via HITL; operator approves on `/pro`

---

## 4. Execute + verify

- Check live URLs and smokes before claiming done
- Register outcomes with correlationId when touching hive APIs

---

## 5. Capture everything

- Every meaningful chat → chronicle (auto-miner, INBOX, or manual append)
- Reusable workflows → promote to `METHODS/`

---

## Proactive reminders (when to speak up)

- End of week and `< 20` business-hours signal → gentle reminder
- Agent repeatedly failing missions → suggest retire/improve in lab
- New shiny AI tool → add to research queue, don't auto-switch production
