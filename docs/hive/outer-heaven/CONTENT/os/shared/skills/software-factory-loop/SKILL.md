---
name: Software factory loop
description: Use when setting up agents to take issues all the way to a reviewed PR. Covers the queue, control plane, sandbox, a validation contract written before work, sequential workers, an event stream, and human PR handoff, plus cheating detection.
---
# Software factory loop
Sources: `yt:lx0Eaane4Ng` Jaymin West (Warren, github.com/jayminwest/warren) and `yt:vGCJ7diEtrw` Tereza Tížková (Factory). Studied 2026-10-10.
## Steps
1. Work enters as an **issue** in a queue, not an ad-hoc prompt.
2. The control plane assigns one issue to one worker at a time. Run workers **in sequence** with fresh context; don't swarm.
3. Each run gets a throwaway **sandbox** copy.
4. Write the **validation contract before any code**: which tests or checks, which command, and hashes of the test files. Add a user-testing validator that clicks through the app where there's a UI.
5. Validate: if the contract files changed, reject (a cheating agent). Then run the checks.
6. Emit every step to an **event stream**. Keep memory per repo.
7. Hand off as a **PR diff** for human review. Humans decide what to build.
8. Cost: route models automatically, switching on failure (Factory claims ~25% savings), and use deferred/progressive context.
## Proof
`software_factory.py` → PASS (cheater rejected, honest fix handed off). Live model routing: BLOCKED_CURSOR_USAGE.
Related: [factory-not-feature](sand-workflow:factory-not-feature), [agent-harness-loops](sand-workflow:agent-harness-loops), [n8n-llm-build-bakeoff](sand-workflow:n8n-llm-build-bakeoff).

## Enrich 2026-10-11: triage gate + remote deploy (yt:joKb_QMmglM, Cole Medin, on Archon)
- **Triage before any worker runs.** Each issue is checked against the factory's mission and rules: reject, accept with a priority, or flag needs-human. Auto-merge only when validation passes *and* triage said accept; anything hitting an escalation rule (auth, billing, data deletion, secrets) holds for a human. PROVE: `recreations/20261011/factory_triage_gate.py` in signals-2mo-backlog-20261010 → PASS.
- **Remote, always-on.** The factory runs on a small Ubuntu VPS and takes GitHub issues 24/7. Setup is a cheat-sheet URL handed to the coding agent ("help me set this up"); it interviews you for the mission/rules context files, then uses SSH plus the host's MCP to configure firewall, tooling, repo and DNS.
- **Credentials stay human.** The agent stops for GitHub and coding-agent login on the box (device-code auth); it never gets your passwords. Instance creation is also left to the human. Matches our read-only-toward-accounts rule.
- End-to-end test = one tiny real issue taken to a validated PR before real work. "GPT-6 Astra beats Fable 5.1" is the creator's opinion, UNVERIFIED; sponsor segment (Hostinger) ignored. Live deploy: BLOCKED (would need a VPS and Evens's approval; building mode, no spend).

## Enrich 2026-10-11: label-triggered factory (yt:AbpyqAfxZ8c, Owain Lewis; repo github.com/owainlewis/factory, MIT)
- **Issue labels are the pipeline.** One-shot readiness labels are the machine gates: `factory:ready-for-spec` runs a triage workflow (rewrite a vague ticket into outcome, context, acceptance criteria, repro), a human then adds `factory:ready-to-implement`, which runs the implement workflow (worktree → plan → code → tests → review → address findings → conventional commit → PR). Workflows are plain Markdown prompts in the repo; the implement prompt says never merge.
- **Always watching, not always spending.** Polling is plain code; a model runs only when a trigger matches, so an idle factory costs zero tokens.
- **Version-control scheduled jobs** (e.g. a nightly bug finder that opens a ticket, not a PR) next to the triggers, so the team can review and run them by hand.
- **Isolation honesty.** Git worktrees isolate branches but share host files, network and credentials, so they're for trusted work only; use a disposable sandbox VM/container (Docker Sandboxes) when running on a shared box. Label/triage access on the repo is the trust boundary; don't point it at repos where strangers can label.
- Grant trust gradually: ticket → PR → (personal projects only) merge. The newer repo version adds a control plane with leases, retries and Codex or Claude Code workers.
- PROVE: `recreations/20261011/run1230/factory_labels.py` in signals-2mo-backlog-20261010 → PASS (only the labeled issue runs, idle polls spend nothing, no auto-merge).
