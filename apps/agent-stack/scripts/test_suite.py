"""Run the offline Jarvis regression suites in isolated processes. No live claims."""
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
ENV = {**os.environ, "AGENT_STACK_DRY_TTS": "1", "AGENT_STACK_CURSOR_DRY": "1"}
COMMANDS = [
    [sys.executable, "mouth/turn.py", "--self-test"],
    [sys.executable, "mouth/voice.py", "--self-test"],
    [sys.executable, "face/serve.py", "--self-test"],
]
COMMANDS += [[sys.executable, "-m", "unittest", "discover", "-s", directory,
              "-p", "test_*.py", "-v"]
             for directory in ("brain", "face", "mouth", "memory", "hands", "tests", "eval", "eval/computer")]
COMMANDS += [["node", "face/test_turn.cjs"]]

def main():
    for command in COMMANDS:
        print("RUN " + " ".join(command), flush=True)
        result = subprocess.run(command, cwd=ROOT, env=ENV)
        if result.returncode:
            print("FAILED " + " ".join(command), file=sys.stderr, flush=True)
            return result.returncode
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
