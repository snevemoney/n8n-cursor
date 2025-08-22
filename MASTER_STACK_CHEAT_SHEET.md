# 🧭 Master Stack Cheat Sheet

**n8n-cursor DevOps - Quick Reference Guide**

## 0) Golden Rules (Never Skip)

- **Everything runs through make** (safe & DRY_RUN by default)
- **No secrets in files** - Put them in your shell:
  ```bash
  export MASTER_UNLOCK=your-secret
  export OPENAI_API_KEY=...
  export SUPABASE_URL=...
  export SUPABASE_ANON_KEY=...
  ```
- **Don't edit workflows/*.json content** (validate only)
- **Don't change service names/ports** in docker-compose.yml
- **If stuck**: "Check health" (see Section 4)

---

## 1) Before You Start Coding (Once Per Machine)

```bash
# Clone + enter
git clone <your repo url> && cd n8n-cursor

# Pre-commit hooks (optional but nice)
pip install pre-commit && pre-commit install

# Make sure basic tools exist
make guard     # structure check
make doctor    # docker/disk/ports check
```

**If anything fails → go to Section 4 (Health & Fixes)**

---

## 2) Daily Flow (What To Do Every Time)

### A) Start Work
```bash
git pull origin main
git checkout -b feat/<short-name>   # new branch for your change
make status                          # see containers
make up                             # dry-run start
DRY_RUN=0 make up                  # real start if needed
```

### B) While Coding in Cursor

Say things like:
- **"Create a new script called rotate-logs"** →
  ```bash
  make new-script NAME="rotate-logs" DESC="Rotate & compress logs"
  ```

- **"Create a new workflow called Customer Sync"** →
  ```bash
  make new-workflow NAME="Customer Sync"
  ```

- **"Where should this file go?"** →
  ```bash
  make brain-suggest FILE="myfile.txt"
  ```

### C) Before Committing
```bash
make fmt && make lint && make guard && make wf-validate
git add -A
git commit -m "feat: <what you did>"
git push -u origin feat/<short-name>
```

### D) Open a PR
- Title must follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`)
- CI will run: lint, structure-guard, compose-guard, repo-brain-review
- If CI warns "move file here", follow it; don't fight it

---

## 3) After the PR Merges

### Deploy / Run on the Server (VPS)
```bash
ssh <user>@<server-ip>
cd /path/to/n8n-cursor
git pull origin main
make doctor
DRY_RUN=0 make up
make status
```

### Tag and Release (Automatic if Set Up)
- The semantic-release workflow will cut a version tag & changelog
- You don't do anything unless the PR title didn't follow the convention

---

## 4) Health & Fixes (Plain English → Commands)

| What You Want | Command |
|---------------|---------|
| **"Check health."** | `make guard && make doctor && make wf-validate` |
| **"Start everything for real."** | `DRY_RUN=0 make up` |
| **"Stop everything safely."** | `DRY_RUN=0 make down` |
| **"Restart the system."** | `DRY_RUN=0 make repair` |
| **"Fix my remote connection (Cursor/VS Code)."** | `make repair-remote` |
| **"Make a full repo backup."** | `DRY_RUN=0 make backup` |
| **"Restore (needs unlock)."** | `export MASTER_UNLOCK=your-secret && make restore` |

---

## 5) When Something Weird Happens

### A) Compose Error or Ports Busy
```bash
make doctor
# If it says "Port 80 busy", stop the conflicting service or change that other app's port
```

### B) Disk Almost Full
- Delete old images/containers (only if you know what you're doing):
  ```bash
  DRY_RUN=0 docker system prune -f
  ```
- Or increase VPS disk, then re-run `make doctor`

### C) Cursor Suggests Putting Files at Repo Root
- Say: **"Use Repo Brain to choose the correct folder."**
  ```bash
  make brain-suggest FILE="thefile"
  ```
- Follow the suggested path (or it will fail the PR)

### D) "I Can't Push to Main"
- **Good!** Use a branch + PR. Protections are working

### E) "I Forgot How to Run It"
- Open `README.md` — it's a one-page runbook mirroring this cheat sheet

---

## 6) Secrets — How to Use Them Safely

### Local Machine or SSH Session
```bash
export OPENAI_API_KEY=...
export SUPABASE_URL=...
export SUPABASE_ANON_KEY=...
export MASTER_UNLOCK=...
```

- **Never commit these**
- In GitHub, add them in Settings → Secrets and variables → Actions
- `.env.example` shows what you need; copy to `.env` (don't commit)

---

## 7) Workflows (n8n) Basics

- **Validate**: `make wf-validate`
- **Find duplicates**: `make wf-dedupe`
- **Import/export**: Ask Cursor to use n8n-mcp with a dry-run first (we kept import off by default to be safe)

---

## 8) Branches & Environments (Mental Model)

```
main → production
staging → pre-production tests
dev → your experimental base branch
your branches → feat/*, fix/*, chore/* → PR → dev or staging → main
```

**If CI is red on a PR → don't merge.** Ask Cursor:
*"Explain the CI failure and fix it for me in a new commit."*

---

## 9) Say These to Cursor (Natural Language)

- **"Check if my project is healthy."**
- **"Start the system for real."**
- **"Restart the system safely."**
- **"Fix my remote connection."**
- **"Where should this new file go?"**
- **"Make a backup."**
- **"Validate all workflows."**
- **"Open a PR to clean structure and add shims."**
- **"Set up GitHub protections and CI if missing."**

---

## 🔁 Quick Decision Tree

| Problem | Solution |
|---------|----------|
| **Did something fail?** | → `make doctor` |
| **Ports?** | → stop the conflicting app |
| **Disk low?** | → prune or increase disk |
| **Docker down?** | → `sudo systemctl restart docker` then `DRY_RUN=0 make up` |
| **Repo looks messy?** | → `make guard` → follow errors |
| **PR blocked?** | → read the CI messages → fix paths or formatting |
| **Remote broken?** | → `make repair-remote` |
| **Need to undo a change?** | → use git: `git checkout -b revert/<name> && git revert <commit> && git push -u origin revert/<name>` |

---

## 10) When You're Totally Stuck

Say to Cursor:
*"Walk me through recovery step by step, one command at a time, starting with checking health. I'm on macOS and connected over SSH to my VPS."*

It will use this cheat sheet as the map: **health → structure → restart → remote repair → PR**

---

## 🎯 That's It!

**Keep this open while you work.**

If you want, I can also drop a tiny menu script so you can type `./help.sh` and pick options 1-9 from a list (no commands to remember).

---

## 📚 Related Files

- **README.md** - Comprehensive runbook
- **docs/MIGRATION.md** - Migration guide from old structure
- **reports/DEVOPS_SETUP_SUMMARY.md** - What was implemented
- **Makefile** - All available commands
- **.env.example** - Required environment variables

---

**Status**: 🟢 READY_FOR_USE - DevOps setup complete with comprehensive documentation
