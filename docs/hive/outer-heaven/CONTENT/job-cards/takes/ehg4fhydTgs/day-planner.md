# Day Planner — ehg4fhydTgs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: Claude Code **routines** (web, laptop closed). Beats: Apr 14 research preview — schedule / API / GitHub event on Anthropic infra; local vs remote (GitHub) tasks; desktop scheduled-tasks UI; min cadence ~hourly; connectors (Slack/Gmail) or API keys; **one-shot, never ask** (you’re not there); first gotcha: remote clones the GitHub repo, then destroys it — **`.env` is gitignored so keys are missing**; keys go in a **cloud environment** on the scheduled task (rest of tape = more gotchas). Timestamp UNKNOWN. Vendor: Claude — on-tape. 24/7-adjacent.

## B. Atomic Knowledge
### Remote run ≠ your laptop secrets
- **Claim:** A web routine sees the GitHub clone, not your gitignored `.env`; you must put secrets in the vendor’s cloud environment or the job silently fails / you get tempted to commit keys.
- **Reasoning:** Clone then destroy; no local files.
- **Mechanism:** Repo sync → missing `.env` → cloud env vars.
- **Evidence:** “if this is only looking at your GitHub repo, there’s no .env.”
- **Conditions:** Remote/scheduled on their infra.
- **Exceptions:** Local scheduled tasks still have the laptop — he still migrated.
- **Action:** Steal the secret-split. Do not put keys in git. Do not stand up Claude routines. Gmail connector = send risk.
- **Confidence:** high as the gotcha.
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE

### Unattended = never-ask, and that is a send/pay footgun
- **Claim:** Routines are one-shot because you are gone; if it must ask, the automation is pointless — so people will pre-allow send/connectors.
- **Reasoning:** Laptop-closed is the pitch.
- **Mechanism:** Hourly+ cadence, connectors, permissions.
- **Evidence:** “you’re not around… doesn’t ever have to stop and ask you questions.”
- **Conditions:** Remote.
- **Exceptions:** A dry-run that cannot send/pay is a different machine.
- **Action:** Unattended + Gmail/Slack = operate-never. Cadence belongs on a digest we consume, not a send we fire.
- **Confidence:** high.
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE + INFERENCE (footgun)

## C. Mental Models
Laptop-closed is the dream. First migrations fail on secrets. He is excited and documenting gotchas. Priority: make it work. We care about the never-ask + connector combo. Uncertainty: later gotchas on the rest of the tape.

## D. Procedures
1. Never commit `.env`.
2. Do not create a Claude cloud env.
3. If a job is unattended, it must not have send/pay connectors.
4. Hourly min is already a CUT collision if it does work we should head.
Avoid: Claude routines; Gmail auto; Slack auto; keys in git.

## E. Examples
**ClickUp ping without connector:** Situation → test a routine. Action → fires but wrong until he understands clone vs `.env`. Reasoning → remote has no secrets. Outcome → cloud env lesson. Lesson → steal the split; don’t migrate.

## F. Decision Rules
- If the job is laptop-closed and can send → never.
- If someone would commit `.env` to make it work → never.
- If cadence < a headed block → conflict flag.

## G. Contrarian
He celebrates laptop-closed. We store operate-never on unattended send. The gotcha (secrets aren’t in git) is the steal.

## H. Assumptions
Theirs: cloud env is the right place for keys. Ours: we will not give Anthropic a key vault for routines. Falsifier: a routine with zero connectors that only writes a local digest — still not our stack. Survivorship: first tests.

## I. Questions
Remaining gotchas on the tape? Which four remote jobs did he keep? Gmail connector — did he send?

## J. Connections
- SYSTEM SYNTHESIS → `hN58VkYLie4` (local vs always-on host) · `send-removed` · `morning-day-plan` (consume, don’t fire) · `ask-principal`.

## K. Future-Use
Remote-has-no-.env as a general rule. Unattended-never-ask as a send flag. Unassigned.

## Steal / Operate-never

### Machine: remote ≠ secrets; unattended + connector = never
- **Epistemic:** SOURCE (gotcha) + INFERENCE (never)
- **Workflow / loop:** if a job would run closed-laptop → deny send/pay connectors → do not copy keys to a vendor cloud → headed digest only
- **Questions / signals:** Does the clone see `.env`? Can it Gmail? Must it never-ask?
- **Qualify / frame / objections:** “Laptop closed” is the sales line. Missing `.env` is the tell.
- **Procedure:** No Claude routine. No keys in git. No Gmail connector.
- **Example that proves it:** Situation → ClickUp test. Action → clone has no `.env`. Reasoning → gitignore. Outcome → cloud env pitch. Lesson → steal the split; don’t migrate.
- **Why it works (as warning):** Unattended never-ask is how a send node fires at 2am.
- **Conditions / exceptions:** We do not adopt Claude. Hourly is already coarse.
- **Operate-never payload:** Claude routines; keys in git or vendor vault; Gmail/Slack auto; 24/7.
- **Hive run (existing skills only):** `send-removed` · `morning-day-plan` · `ask-principal`.
- **Source:** `ehg4fhydTgs` @ UNKNOWN

### Operate-never
- Claude web routines / laptop-closed send.
- Commit `.env` / install Claude.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as remote-≠-secrets (no routine). Clients parked.
