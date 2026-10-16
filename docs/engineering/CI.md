# Automated checks (GitHub Actions)

Measured from the last 200 runs on 2026-10-16.

## Checks that work and matter

| Check | Result | What it protects |
|---|---|---|
| `public-guard` | 20 pass / 4 fail | No secrets, private shared files or home paths in a public repo. **Required.** |
| `jarvis-probe-eval` | 23 / 0 | Jarvis's 17-probe offline eval on every PR touching `apps/agent-stack`. **Required.** |
| `Global Guards` | 25 / 0 | Repo-wide guard rules. |
| `Global Consistency Contract Enforcement` | 3 / 0 | Consistency contract. |
| `Agent PR Review` | 23 / 2 | Automated review comments. |

## Legacy checks that fail on every PR

They come from the LightningFlow and Scorpion era and test code nobody works on now. Each failure also triggers
`CI Failure Notify Gmail`.

| Check | Result |
|---|---|
| `council-consolidated-reports.yml` | 0 / 26 |
| `Security Scan` | 0 / 4 |
| `Scope Validation & Quality Gates` | 0 / 3 |
| `Reliability Guards` | 0 / 3 |
| `LightningFlow AI CI/CD Pipeline` | 0 / 3 |
| `AI Code Validation` | 0 / 3 |
| `Nightly Capture` | 0 / 1 |
| `Automated Backup & Verification` | 0 / 1 |

Proposal: limit them to their own folders (`paths:` filters), or move them to `.github/workflows-archive/`. See
[DECISIONS-NEEDED.md](DECISIONS-NEEDED.md) #2. Jarvis's full pytest suite (about 1,840 tests, about 22 minutes) runs on the
Mac before each deploy. A CI job for it is proposal #3.
