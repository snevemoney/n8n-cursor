"""pytest: every test run logs turns to a temp file, never the real logs/jarvis-turns.jsonl."""
import os
from pathlib import Path
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
    os.environ.setdefault("JARVIS_OPERATOR_FIRST", "0")  # routed-turn tests; brain/test_operator_first.py opts in
    if "JARVIS_BRAIN_FILE" not in os.environ:
        import tempfile
        brain = Path(tempfile.gettempdir()) / f"jarvis-brain-test-{os.getpid()}.json"
        brain.unlink(missing_ok=True)  # every test starts on the default model
        os.environ["JARVIS_BRAIN_FILE"] = str(brain)
    yield
    os.environ.clear()
    os.environ.update(saved)
