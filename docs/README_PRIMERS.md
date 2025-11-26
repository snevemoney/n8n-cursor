# 🦂 Scorpion Primer Suite

**Your complete knowledge transfer package for onboarding any AI to Scorpion.**

Welcome! This directory contains everything you need to bring a new AI (Google Antigravity, Gemini, Claude, etc.) up to speed on Scorpion—your personal AI operating system and agent orchestration platform.

---

## The Problem (and Solution)

When Cursor "knew" Scorpion, it had months of context and interaction history. When you start a fresh chat with a new AI, it knows nothing about your codebase, architecture, or vision.

**The Solution**: This primer suite packages that knowledge so any new AI can understand Scorpion immediately.

Think of it like **hiring a senior dev**: you give them onboarding docs, architecture diagrams, and code examples—and they're productive within a day.

---

## Quick Start

### For a New Chat (Fastest)

1. Open a new chat with Google Antigravity, Gemini, Claude, etc.
2. **Copy the entire section** between the triple backticks in **`SCORPION_PRIMER_SHORT.md`**
3. Paste it as your first message
4. Follow with: "Here's the file I'm working on:" + code snippet
5. The AI now "knows" Scorpion and can help effectively

---

## The Primer Suite

Five documents, each for a different purpose:

### 1. **Short Version** (`SCORPION_PRIMER_SHORT.md`)
**What**: Paste-ready onboarding (500 words)  
**When**: Starting a new chat with any AI  
**Goal**: Fast context in one message  
**Time to read**: 2 minutes  
**Copy from here** →

```
SCORPION PRIMER – CONTEXT FOR THIS AI
[...paste this section into any new chat...]
```

---

### 2. **Master Primer** (`SCORPION_PRIMER.md`)
**What**: Complete architecture guide (3000+ words)  
**When**: New AI needs comprehensive understanding  
**Includes**:
- High-level vision and philosophy
- Full repository structure
- Core architecture (the Plan→Council→Tools→Result pipeline)
- All key components and modules
- Agent roles and responsibilities
- Detailed execution flows
- File path quick reference (50+ key locations)
- Development guidelines (add tools, agents, modify pipeline)
- Debugging & troubleshooting (6 major issue categories)

**How to use**:
1. Share with AI: "Read this for full context: [link/paste]"
2. Or reference sections: "This is in the Planner phase, which is in `lib/orchestrator/run-pipeline.ts`"
3. Or keep in VS Code tab and reference: "See the Master Primer section on 'Phase Pipeline'"

**Read time**: 15-20 minutes (skim sections you don't need)

---

### 3. **Debugging Primer** (`SCORPION_DEBUGGING_PRIMER.md`)
**What**: Troubleshooting & diagnostics guide (2000+ words)  
**When**: Something is broken or behaving oddly  
**Includes**:
- **Quick triage flowchart** (what's broken → go here)
- **6 major issue categories** with step-by-step fixes:
  - Chat streaming issues
  - Council phase issues
  - Tool execution issues
  - Knowledge/RAG issues
  - LLM integration issues
  - Event persistence issues
  - Build & type issues
- **Debug logging patterns** (what to add to your code)
- **Useful commands** (curl, pnpm, git)
- **Escalation checklist** (when everything else fails)

**How to use**:
1. Something's broken?
2. Find your issue in the flowchart
3. Follow the step-by-step debugging guide
4. If stuck, share the logs + relevant file with AI

**Read time**: 5-10 minutes (per section)

---

### 4. **Architect's Primer** (`SCORPION_ARCHITECTS_PRIMER.md`)
**What**: Design patterns, refactoring guide (2000+ words)  
**When**: Discussing architecture, planning refactors, making design decisions  
**Includes**:
- **Design principles** (Separation of Concerns, Composition, DI, Strong Typing, Immutability)
- **Architecture patterns** (Pipeline, Tool Registry, Agent Roles)
- **Refactoring opportunities** (Phase Factory, Event Store, Semantic tool matching)
- **Best practices** (DO/DON'T checklists)
- **Scaling patterns** (Worker queues, caching, agent pools, streaming)
- **Decision framework** (when to refactor and when not to)
- **Code review checklist** (what to look for in PRs)

**How to use**:
1. Starting a refactor? Read the relevant pattern
2. Code review? Use the checklist
3. Designing a feature? Check "Architecture patterns"
4. Share with AI: "Here's the Architect's Primer for reference..."

**Read time**: 10-15 minutes (per topic)

---

### 5. **Quick Reference** (`SCORPION_QUICK_REFERENCE.md`)
**What**: One-pager for fast lookups (1 page, dense)  
**When**: Need to quickly find a file path, command, or type  
**Includes**:
- **Pipeline diagram** (visual at a glance)
- **File locations** (muscle memory table: "Where's the chat endpoint?" → `app/api/chat/stream/route.ts`)
- **Common tasks** (how to add a tool, agent, debug, etc.)
- **Environment variables** (minimal required keys)
- **Key types** (Phase, Tool, Agent, Event, ExecutionResult)
- **Phase details table** (inputs/outputs/conditions)
- **Debugging checklist** (✅ quick yes/no verification)
- **Commands** (dev, test, deploy, knowledge base, debugging)
- **Useful URLs** (localhost:3003, Supabase console, OpenAI dashboard, etc.)
- **Architecture principles** (8 core ideas, memorize these)
- **Common patterns** (copy-paste code snippets)

**How to use**:
- Bookmark this file
- Ctrl+F to find what you need
- Use for quick answers mid-conversation
- Reference when asking AI for help: "According to the Quick Reference, the chat endpoint is at..."

**Read time**: 1-2 minutes (lookup only, not sequential)

---

## How to Use This Suite

### Scenario 1: "I'm using a new AI"

1. Start fresh chat with Google Antigravity
2. Paste `SCORPION_PRIMER_SHORT.md` section
3. Immediately follow with your task
4. Done!

### Scenario 2: "The AI is confused about architecture"

1. Say: "Read the Master Primer (docs/SCORPION_PRIMER.md) for full context"
2. Or share a section: Copy from `SCORPION_PRIMER.md` and paste it
3. Reference during work: "This is the Council phase, see Master Primer section 'Agent Roles'"

### Scenario 3: "Something's broken"

1. Check `SCORPION_QUICK_REFERENCE.md` debugging checklist
2. Follow steps in `SCORPION_DEBUGGING_PRIMER.md`
3. If still stuck: Share logs + error + relevant file with new AI chat + Short Primer

### Scenario 4: "I'm refactoring or redesigning"

1. Read `SCORPION_ARCHITECTS_PRIMER.md` section on relevant pattern
2. Share with AI: "Here's the architectural context [paste section]"
3. Discuss design decisions informed by principles in the doc

### Scenario 5: "I need to quickly find something"

1. Ctrl+F `SCORPION_QUICK_REFERENCE.md`
2. Example: "Where's the Planner?" → File Locations table → `lib/orchestrator/run-pipeline.ts`

---

## Navigation

**You are here**: `docs/README_PRIMERS.md` (this file)

**The primers**:
- `docs/SCORPION_PRIMER_SHORT.md` — **START HERE** for new chats
- `docs/SCORPION_PRIMER.md` — Master reference
- `docs/SCORPION_DEBUGGING_PRIMER.md` — When things break
- `docs/SCORPION_ARCHITECTS_PRIMER.md` — Design & refactoring
- `docs/SCORPION_QUICK_REFERENCE.md` — Fast lookups

---

## Maintaining the Primers

As Scorpion evolves:

### When you add a feature:
1. Update `SCORPION_PRIMER.md` under "Key Components & Modules"
2. Add file path to `SCORPION_QUICK_REFERENCE.md` table
3. Add debugging tips to `SCORPION_DEBUGGING_PRIMER.md` if applicable
4. Update type definitions in Quick Reference if needed

### When you fix a bug:
1. Note it in `SCORPION_DEBUGGING_PRIMER.md` under "Debugging Checklist"
2. Add the fix steps to relevant issue category

### When you refactor:
1. Document the pattern in `SCORPION_ARCHITECTS_PRIMER.md`
2. Update file paths in all primers if needed
3. Update `SCORPION_QUICK_REFERENCE.md` file locations table

### Annual refresh:
1. Open each primer
2. Update file paths (use `find apps/scorpion -name "*.ts" | grep ...`)
3. Update component names if they've changed
4. Add any new agents, tools, or phases
5. Update "Last Updated" timestamp

---

## Pro Tips

### 1. **Version Control These Docs**

Keep primers in git so you can track what changed:
```bash
git add docs/SCORPION_PRIMER*.md
git commit -m "Update primers with new architecture"
```

### 2. **Link Them in Your IDE**

VS Code: Pin `SCORPION_QUICK_REFERENCE.md` to tab, keep it open during dev.

### 3. **Customize for Your Workflow**

These are templates. Feel free to:
- Add project-specific URLs
- Add your team members' names
- Add internal deployment steps
- Remove sections you don't need

### 4. **Use in onboarding docs**

Link these primers in your project README:

```markdown
## Onboarding

New to Scorpion? Start here:
1. Read [Short Primer](docs/SCORPION_PRIMER_SHORT.md) (2 min)
2. For details: [Master Primer](docs/SCORPION_PRIMER.md)
3. For debugging: [Debugging Primer](docs/SCORPION_DEBUGGING_PRIMER.md)
4. For design decisions: [Architect's Primer](docs/SCORPION_ARCHITECTS_PRIMER.md)
5. Quick lookup: [Quick Reference](docs/SCORPION_QUICK_REFERENCE.md)
```

### 5. **Paste into every new chat**

Make it a habit:
1. New problem → new AI chat
2. Immediately paste Short Primer
3. Describe problem
4. Done!

---

## FAQ

**Q: How often should I update the primers?**  
A: Whenever you make major changes (new agents, tools, phases). Quarterly review minimum.

**Q: Can I share these with others?**  
A: Yes! These are designed to be shared. Customize for your team and share widely.

**Q: What if the AI misunderstands something?**  
A: That's a signal the primer is unclear. Update that section and re-test.

**Q: Do I need to use all 5 primers?**  
A: No. The Short Primer alone gets you 80% of the way. Use others as needed.

**Q: Can I combine these into one big document?**  
A: Sure! But the separate structure is intentional—easier to find what you need.

**Q: What if Scorpion changes significantly?**  
A: Update the primers. The structure stays the same, only the details change.

---

## The Vision

With these primers, you never lose context again.

You can:
- ✅ Start a new chat and be productive immediately
- ✅ Onboard new team members (human or AI) quickly
- ✅ Fix bugs faster with clear debugging guides
- ✅ Make better design decisions with architectural principles
- ✅ Scale Scorpion without losing coherence

The primers are your **knowledge vault**. Treat them like code—maintain, version, and share them.

---

## Last Updated

**Date**: 2025-01-27  
**Scorpion Branch**: `scorpion`  
**Main App**: `apps/scorpion` (Next.js)  
**Remote Services**: n8n on KVM2

---

## Questions?

- **First time?** → Read `SCORPION_PRIMER_SHORT.md`
- **Confused?** → Check `SCORPION_PRIMER.md` (Master Primer)
- **Broken?** → Use `SCORPION_DEBUGGING_PRIMER.md`
- **Designing?** → Reference `SCORPION_ARCHITECTS_PRIMER.md`
- **Need to find something?** → Ctrl+F in `SCORPION_QUICK_REFERENCE.md`

Good luck! 🦂
