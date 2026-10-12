"""The real E2E workflow command must preserve the test runner exit status."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[3]

class ScorpionGateTest(unittest.TestCase):
    def test_e2e_runner_failure_is_not_masked(self):
        workflow = (ROOT / '.github/workflows/scorpion-ci.yml').read_text()
        chunk = workflow.split('      - name: Run E2E tests\n', 1)[1]
        script = chunk.split('        run: |\n', 1)[1].split('\n      - name:', 1)[0]
        script = '\n'.join(line[10:] for line in script.splitlines() if line.startswith('          '))
        with tempfile.TemporaryDirectory() as tmp:
            runner = Path(tmp) / 'pnpm'
            runner.write_text('#!/bin/sh\nexit "$RUNNER_STATUS"\n')
            runner.chmod(0o755)
            for status in (0, 17):
                result = subprocess.run(['bash', '-e', '-c', script], cwd=tmp,
                    env={**os.environ, 'PATH': tmp + ':' + os.environ['PATH'], 'RUNNER_STATUS': str(status)},
                    capture_output=True, text=True)
                self.assertEqual(result.returncode, status, result.stderr)
        self.assertNotIn('pnpm audit:install', chunk)

if __name__ == '__main__':
    unittest.main()
