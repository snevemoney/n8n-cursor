# SKILLS_DELTA — box → Mac and Mac → box (checked 2026-10-10 ~22:25 ET)
## Box → Mac
- Baseline: `/workspace/grok-skills-20261010.tgz`, mtime 2026-10-10 22:02:46 ET, 464 skill dirs, copied to the Mac.
- Check 1: `find /home/box/agent-data/workflows -newermt '2026-10-10 22:02'` found **0 files and 0 dirs**. The newest file in the catalog is from 20:30 ET.
- Check 2: extracted the tgz and ran `diff -rq` against the live catalog. **No differences** (464 = 464).
- **Delta: 0 skills.** `/workspace/skills-delta-20261010.tgz` holds only `DELTA_MANIFEST.txt`, which records the empty result. Nothing new needs copying.
- Note: `~/.grokbot/outer-heaven/CONTENT/skills/` (SKILL_USAGE_LOG, SKILL_STRUCTURE) changed on 10-10 before 22:02. These are mirror/index files, not skills.
## Mac → box (import back)
- I searched `raw/` (93 Claude + 63 Codex jsonl) for `~/.claude/skills`, `~/.codex/skills`, `.claude/commands|agents`, and Write/mkdir of SKILL.md.
- Found only:
  - `~/.codex/skills/.system/openai-docs/SKILL.md`: a Codex built-in. Do not import.
  - `~/.codex/plugins/cache/openai-curated-remote/google-drive/0.1.16/skills/google-drive/SKILL.md`: a plugin cache. Do not import.
  - `coleam00/skills .claude/skills/second-brain-audit/SKILL.md`: an external repo read via GitHub MCP inside an Outer Heaven note, not installed. Import gate only (CANDIDATE).
- **No Mac-agent-created skills found. Nothing to import back.** ArtCraft (10-10) installed MCP CLIs, not skills.
