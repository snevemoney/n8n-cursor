"""pytest: every test run logs turns to a temp file, never the real logs/jarvis-turns.jsonl."""
import os
import tempfile

os.environ.setdefault("JARVIS_TURN_LOG", os.path.join(tempfile.mkdtemp(prefix="jarvis-test-turns-"), "jarvis-turns.jsonl"))

import pytest


@pytest.fixture(autouse=True)
def _restore_environ():
    """Each test starts from the same environment: several tests set JARVIS_MODE_FILE / JARVIS_SCRATCH_ROOTS and never
    restored them, so a later safety test silently ran in another permission mode (found 2026-10-15)."""
    saved = dict(os.environ)
    # Tests never read the live model switch (~/.grok-private/jarvis-brain.json): a live "switch to Sonnet" during a run
    # changed model-identity answers (2026-10-16).
    os.environ.setdefault("JARVIS_BRAIN_FILE", os.devnull + ".jarvis-brain-none")
    yield
    os.environ.clear()
    os.environ.update(saved)
