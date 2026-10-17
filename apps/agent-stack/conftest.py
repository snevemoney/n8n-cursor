"""pytest: every test run logs turns to a temp file, never the real logs/jarvis-turns.jsonl."""
import os
from pathlib import Path
import tempfile

# 10-17: a Safari test said "yes, send it" and wrote fake "Evens approved a send" rows into his real approval log
os.environ.setdefault("JARVIS_APPROVALS_FILE", os.path.join(tempfile.mkdtemp(prefix="jarvis-test-approvals-"), "approvals.jsonl"))
# 10-17: test outcomes were written into the live model scorecard that picks real jobs' models
os.environ.setdefault("JARVIS_SCORES_FILE", os.path.join(tempfile.mkdtemp(prefix="jarvis-test-scores-"), "model-scores.json"))
os.environ.setdefault("JARVIS_TURN_LOG", os.path.join(tempfile.mkdtemp(prefix="jarvis-test-turns-"), "jarvis-turns.jsonl"))

import pytest


@pytest.fixture(autouse=True)
def _restore_environ():
    """Each test starts from the same environment: several tests set JARVIS_MODE_FILE / JARVIS_SCRATCH_ROOTS and never
    restored them, so a later safety test silently ran in another permission mode (found 2026-10-15)."""
    saved = dict(os.environ)
    # Tests never read the live model switch (~/.grok-private/jarvis-brain.json): a live "switch to Sonnet" during a run
    # changed model-identity answers (2026-10-16).
    os.environ["JARVIS_NO_ENV_FILES"] = "1"  # no test may load a real API key from the env files (no paid calls in tests)
    for k in ("OPENROUTER_API_KEY", "XAI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "PERPLEXITY_API_KEY"):
        os.environ.pop(k, None)
    os.environ.setdefault("JARVIS_OPERATOR_FIRST", "0")  # routed-turn tests; brain/test_operator_first.py opts in
    os.environ.setdefault("JARVIS_ONE_LOOP", "0")  # the front-door model tests; test_one_loop_turn.py opts in
    if "JARVIS_BRAIN_FILE" not in os.environ:
        import tempfile
        brain = Path(tempfile.gettempdir()) / f"jarvis-brain-test-{os.getpid()}.json"
        brain.unlink(missing_ok=True)  # every test starts on the default model
        os.environ["JARVIS_BRAIN_FILE"] = str(brain)
    yield
    os.environ.clear()
    os.environ.update(saved)
