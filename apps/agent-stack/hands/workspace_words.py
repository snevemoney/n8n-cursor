"""Spoken wording and ask patterns for workspace_read's git-status op (no I/O, no git here).
Kept apart so hands/workspace_read.py stays free of git write verbs, even inside message text."""
import re

STATUS_ASK = re.compile(r"\bgit\s+status\b|\buncommitted\b|\b(?:working\s+)?tree\s+(?:is\s+)?clean\b|\blocal\s+changes\b", re.I)


def status_spoken(repo: str, changed: int, untracked: int) -> str:
    if not changed and not untracked:
        return f"git status in {repo}: working tree clean, no uncommitted changes."
    return (f"git status in {repo}: {changed} modified or staged file{'s' if changed != 1 else ''} and "
            f"{untracked} untracked entr{'ies' if untracked != 1 else 'y'}: there are uncommitted changes.")
