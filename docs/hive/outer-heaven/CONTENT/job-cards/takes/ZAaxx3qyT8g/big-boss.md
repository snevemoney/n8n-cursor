# Big Boss — ZAaxx3qyT8g
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZAaxx3qyT8g/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZAaxx3qyT8g/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 7:36, 2123 words, captions `en-orig` json3). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: the four-agent dashboard, color status chips, recap cards, `/goal` runtime, directory names in the header.

Beats, in order:

1. Cold open: four Claude Code agents in one view. Arrow keys or click to enter a session; back to the main view. Status: done vs waiting on him.
2. Yellow = needs input. He clicks in; it wants plan approval or feedback.
3. Pain he names: five-plus sessions, VS Code tab soup, “which terminal is doing what.” Even finish-hooks + end-of-session recaps still meant hunting tabs.
4. Feature: Agent View (dropped “today”). One terminal tab to view and move in/out of sessions.
5. CLI-only. He challenges extension users to use the terminal this week — “most functionality.”
6. Controls: left arrow opens Agent View from any session; right arrow enters; left returns. `/bg` backgrounds a live session into the view. `claude --bg` + task name also works; describing a task *from* the view kicks a new session (he prefers this).
7. Demo: research “Claude’s new agent view” from the dashboard; new row appears; he hops in and out.
8. Four usage patterns (from the doc): scale concurrent sessions; manage long-running agents; (doc also lists more; he focuses on these). New `/goal` = Codex-like / Ralph Wiggum loop: set an objective, it experiments until hit; can run hours / overnight. Bad example: “build me a 3D monster fighting game” (subjective). Better: objective metric, Karpathy auto-research style. “This video is not about goal” — he only needs it because long goals must be visible in one place. Runtime shown on the right.
9. Launch paths: `claude agents` in a fresh terminal; `claude --bg "task"` (quotes required; square brackets failed). Research preview: first launch made his machine “really, really slow”; prompt got cut off until quotes.
10. Directory caveat: a new terminal stays in the current project. To work two repos, `cd` then `--bg`. He wishes the view showed directory without entering. Header shows project name once inside.
11. Kill: select + Ctrl-X twice. Reply from the view: Space, then type (demo: refuse saving two projects / a LinkedIn post — “just a demo”).
12. CTA: if you do not see the value, you are not running multiple sessions / not using Claude as an OS. 2.5-hour “build your AIOS” course video. Like.

Off-topic / not skipped: LinkedIn-post save prompt; monster-game joke; extension vs CLI culture talk.

## B. Atomic Knowledge

### One pane for many workers, with a status that means “I owe a decision”
- **Claim:** Parallel agents are unmanageable as tab soup. One view with done / working / needs-input is the operator seat.
- **Reasoning:** Hooks and recaps tell you *something* finished. They do not tell you *which* session needs a yes.
- **Mechanism:** Color + “needs input” + enter/exit without losing the roster. Space-reply from the roster so the worker is not blocked in a hidden tab.
- **Evidence:** Yellow plan-approval; green when finished and it “goes down.” Four agents on screen.
- **Conditions:** You are actually running more than one job. He says if you are not, the feature looks pointless.
- **Exceptions:** Research preview: slowness, truncated prompts, missing directory column.
- **Action:** Done includes “blocked work is visible.” Hidden wait-on-human is a leak.
- **Confidence:** high for the pane shape; medium for CLI-only as a law.
- **Source:** `ZAaxx3qyT8g` @ UNKNOWN — “manage all of your different working agents just in one terminal tab”
- **Epistemic:** SOURCE

### Long loops need an objective metric, not a vibe goal
- **Claim:** `/goal` will run for hours if you let it. Subjective prompts (“3D monster fighting game”) are the wrong fuel. Auto-research style: optimize a number.
- **Reasoning:** One-shot goal prompting skips the human metric. The loop will “experiment” without a pass/fail.
- **Mechanism:** `/goal` + visible runtime in Agent View so overnight jobs stay on the roster.
- **Evidence:** “Build a loan is too ambiguous” (cut-off prompt / research-preview bug) — the system itself rejected mush. He laughs.
- **Conditions:** Useful when the stop condition is checkable. He is not selling `/goal` as the video’s product.
- **Exceptions:** He still demos a mushy game to show the dashboard, then walks it back.
- **Action:** No overnight loop without a number. Visibility ≠ permission to run unsupervised ship.
- **Confidence:** high
- **Source:** `ZAaxx3qyT8g` @ UNKNOWN — “usually best if you can give it an objective metric to hit”
- **Epistemic:** SOURCE

### Launch from the roster; flags are fallback
- **Claim:** The valuable path is: describe a task in Agent View (or `/bg` a live chat). Remembering `claude --bg` is optional; quotes matter if you use the flag.
- **Reasoning:** Commands exist for *cross-directory* work. Same-directory work should not require flag memory.
- **Mechanism:** View-spawned session inherits current project. `cd` + `--bg` for a second repo. Enter to read the path in the header.
- **Evidence:** Quotes vs square brackets; truncated “build a loan”; he says he will almost never launch via flag.
- **Conditions:** Preview bugs mean the first launch may lie about what was injected.
- **Exceptions:** Multi-repo days still need the flag / a new cwd.
- **Action:** If two jobs share a folder, say so. If they do not, split cwd before spawn.
- **Confidence:** high for the preference; medium for directory inheritance (he says “pretty sure”).
- **Source:** `ZAaxx3qyT8g` @ UNKNOWN — “I’m not really going to be ever launching sessions using this flag”
- **Epistemic:** SOURCE

### Kill and refuse from the same seat
- **Claim:** Ctrl-X twice kills. Space replies without entering. He refuses a save/LinkedIn-post from the roster.
- **Reasoning:** A dashboard that cannot reject is a spectator sport.
- **Mechanism:** Select → kill or inject input → status updates.
- **Evidence:** On-tape refuse: “No, I don’t want you to save those. That was just a demo.”
- **Conditions:** Human is watching the yellow chips.
- **Exceptions:** Overnight `/goal` will not yellow if it never asks — metric must be the stop.
- **Action:** Roster includes reject. Volunteer LinkedIn posts stay operate-never.
- **Confidence:** high
- **Source:** `ZAaxx3qyT8g` @ UNKNOWN — “I could shoot that off from this view”
- **Epistemic:** SOURCE

### Multi-session is his definition of “using it as an OS”
- **Claim:** If you do not run concurrent sessions, you will not value the view — and you are “not really using it as your operating system.”
- **Reasoning:** The CTA is a 2.5-hour AIOS course. The dashboard is a magnet for that course.
- **Mechanism:** Shame-the-single-session → course video.
- **Evidence:** Last spoken block.
- **Conditions:** Only works if the viewer wants Claude as OS.
- **Exceptions:** A single-session operator can still need a status pane for one long `/goal`.
- **Action:** Do not treat “not parallel” as failure. Do not install his AIOS course stack.
- **Confidence:** high that he said it; low that parallel = OS.
- **Source:** `ZAaxx3qyT8g` @ UNKNOWN — “you’re not really using it as your operating system”
- **Epistemic:** SOURCE

## C. Mental Models

- **CEO seat is a roster, not a chat.** Enter only to decide. **SOURCE**
- **Yellow means I owe a call.** Hidden input is how work dies. **SOURCE**
- **Long work must be visible by runtime and status.** **SOURCE**
- **Objective metric or do not loop overnight.** **SOURCE**
- **Preview means expect slowness and truncated prompts.** **SOURCE**
- **Directory is part of the job card.** Same view, different cwd, easy to smash. **SOURCE**
- **“OS” is the upsell.** **INFERENCE**

## D. Procedures

1. **Roster first:** all in-flight jobs on one pane with working / needs-input / done.
2. **Spawn from the pane** (or background a live job). Split cwd before a second repo.
3. **Write the stop:** objective metric for any long loop. Refuse subjective `/goal`.
4. **Watch yellow:** enter or Space-reply. Approve plan or reject (his LinkedIn-save refuse).
5. **Kill dead work:** two-key kill. Do not let zombies hold the machine.
6. **Checkable stop:** every row is either done, killed, or waiting on a named human decision.
7. **Do not confuse visibility with ship.** Overnight loop is not publish.

**Qualify / frame:** dashboard tape, not a client SKU. Claude Agent View / `/goal` / Ralph stay on tape.
**Objections:** “I only run one chat” — then this tape is a future-use pane, not a mandate to go parallel. “Let it run overnight” — only with a metric and a reject path.
**Avoid:** Claude as hive OS; 2.5h AIOS course as a build spec; auto-save / auto-LinkedIn.
**When to change:** if the roster cannot show directory or input, stop spawning; you will edit the wrong repo.

## E. Examples

**Situation:** Four agents; one turns yellow and asks to approve a plan.  
**Action:** Click in (or Space from the view); decide; return to roster.  
**Reasoning:** The scarce thing is the human call, not another tab.  
**Outcome:** Other agents keep running; blocked one unblocks.  
**Lesson:** Needs-input must be a chip, not a buried terminal. Implicit rule: if you cannot see who waits, you are not managing.

**Situation:** He `/goal`s a 3D monster fighting game.  
**Action:** Shows it as the wrong use; wants a metric like auto-research. Preview truncates the prompt; model says too ambiguous.  
**Reasoning:** Subjective loops run forever and still miss.  
**Outcome:** Laugh + course CTA.  
**Lesson:** Long loop + mushy done = waste. Implicit rule: overnight requires a number.

**Situation:** A session offers to save two projects / a LinkedIn post.  
**Action:** Space from the roster: no, demo only.  
**Reasoning:** Reject must be as cheap as spawn.  
**Outcome:** Input injected without tab-hunting.  
**Lesson:** Dashboard without refuse is theater.

## F. Decision Rules

- If more than one job is live → they share a roster or you are not managing.
- If status is needs-input → human decides before anything else is “done.”
- If the loop is overnight → require an objective metric or do not start.
- If two jobs are different repos → split cwd before spawn.
- If preview is slow / truncated → read the injected prompt before trusting the row.
- Optimize: time-to-human-decision on blocked work.
- Refuse: Claude OS, unsupervised `/goal` ship, LinkedIn auto-save, nameless session farms.

## G. Contrarian

- Against the friendly extension as the real product (CLI has the pane).
- Against “hooks + recap are enough.”
- Against `/goal` as one-shot creativity.
- Against treating single-session work as not-an-OS (that is his upsell, not a law).
- Field assumes more parallel agents = more output. He assumes more parallel *without a roster* = lost input.

## H. Assumptions

**His:** CLI is the grown-up surface; four patterns in the doc are complete; Agent View will stabilize; the 2.5h course is the conversion; parallel = OS.

**Ours:** Captions complete enough (2123 words). Colors, runtimes, and “four agents” are visual-only **UNVERIFIED**. Domain-specific: Claude-Code power users. Research preview bugs are dated to “dropped today.”

**Falsifiers:** Roster hides directory and you ship to the wrong repo. `/goal` hits a metric and the artifact is still wrong (metric was vanity). Yellow chips lie (done but broken).

**Disagreement (keep labeled):** Hive will not operate Claude Agent View. The **one roster + yellow-means-decide + metric-or-no-overnight** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What are the other two “four patterns” he did not read out?
- Does `/bg` ever drop a session from the view?
- How do you see cwd without entering? (He wishes; not shipped.)
- What metric would he actually use for a content or OS job?
- Machine slowness: session count vs preview bug?

## J. Connections

- **SYSTEM SYNTHESIS** → `brB-hSiV2iU` `/goal` + auto-research (same loop, this tape is the pane).
- **SYSTEM SYNTHESIS** → `XTBWVVcF3Pk` (officer vs workers; roster is how you manage them).
- **SYSTEM SYNTHESIS** → `ask-principal` (plan approval / LinkedIn save = HITL).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (metric as the overnight stop).
- **SYSTEM SYNTHESIS** → `agent-job-card` (named jobs on a roster, not tab soup).
- **SYSTEM SYNTHESIS** → doctrine: don’t chat — manage.
- Do not spawn hundreds of nameless agents because the pane can hold them.

## K. Future-Use

- Directory column as a Watchdog request on any multi-root runner (unassigned).
- Yellow-chip review as morning Big Boss ritual (unassigned).
- Preview-bug log: always read the injected prompt (unassigned).
- Course CTA as Publishing magnet-only (learn; no publish).

## Steal / Operate-never

### Machine: One roster · yellow = human decision · no overnight without a metric
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (more than one live job, or one long loop) → put every job on one pane with working / needs-input / done → spawn from the pane; split cwd if repos differ → long loops get an objective metric or do not start → when yellow, approve / edit / reject from the seat → kill zombies → human ships (HITL).
- **Questions / signals:** “Who is waiting on me?” “What is the stop number?” “Which directory is this row?” “Did the prompt actually inject?”
- **Qualify / frame / objections:** This is command surface, not a Claude SKU. “You’re not using it as an OS” is the course magnet. Objection: I only run one chat — then keep the yellow/metric rules for that one long job.
- **Procedure:** D steps 1–7. Checkable stops: (1) every live job is on the pane, (2) blocked work is visible, (3) overnight has a metric, (4) reject was as cheap as spawn.
- **Example that proves it:** Yellow plan-approval; Space-refuse a LinkedIn save; mushy `/goal` called out. Lesson: manage the roster; do not chat the army.
- **Why it works:** Parallel work dies in tabs. Humans decide; workers run. Conditions: named jobs, a reject path, a metric for long loops. Exceptions: preview bugs; missing cwd column; single-session is allowed.
- **Conditions / exceptions:** Cursor + Grok only. Claude Agent View / `/goal` / Ralph / AIOS course stay on tape. Clients parked. No auto-post.
- **Operate-never payload:** Claude as hive OS; unsupervised overnight ship; LinkedIn auto-save; nameless session farm; 2.5h course as spec.
- **Hive run (existing skills only):** `agent-job-card` · `ask-principal` (approve/reject) · `golden-test-loop` (metric) · `slice-build` (one system, not five tabs of mush) · `interview-to-desk` (named workers, not tab soup).
- **Source:** `ZAaxx3qyT8g` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Claude Code Agent View / `/goal` / Ralph as hive OS
- Auto-save / auto-LinkedIn / unsupervised overnight ship
- Quote preview performance as FACT
- New `icp_id` / unpark Normand / “AIOS course” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not become the fourth terminal tab.

- **Done** on a parallel slice: roster of named jobs + every yellow decided + any long loop has a metric. “Four agents running” is not done.
- **Delegate without being asked:** Day Planner keeps the roster. HITL owns approve/reject. Watchdog checks cwd before merge. Forge kills zombies. Publishing does not ship a demo LinkedIn post.
- **Skeptical review:** “Not using it as an OS” is a CTA, not a diagnosis of Outer Heaven. Seventeen named desks already *are* the roster. I will not buy his course to prove that.
- **One system this take:** one pane of named work. Not “go parallel for its own sake.”
- Live hunt stays parked.
