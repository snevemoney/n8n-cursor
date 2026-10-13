"""pytest: every test run logs turns to a temp file, never the real logs/jarvis-turns.jsonl."""
import os
import tempfile

os.environ.setdefault("JARVIS_TURN_LOG", os.path.join(tempfile.mkdtemp(prefix="jarvis-test-turns-"), "jarvis-turns.jsonl"))
