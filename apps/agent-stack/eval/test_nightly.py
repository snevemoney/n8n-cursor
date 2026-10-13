"""F2: nightly eval set runs offline and appends to a JSON history."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent / 'nightly'))
import run_nightly as N  # noqa: E402


class Nightly(unittest.TestCase):
    def test_all_tasks_pass_and_history_appends(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}), tempfile.TemporaryDirectory() as d:
            h = Path(d) / 'h.json'
            first = N.run_all(h); N.run_all(h)
            hist = json.loads(h.read_text())
        self.assertEqual(len(hist), 2)
        self.assertEqual({t['id'] for t in first['tasks']}, {t for t, _ in N.TASKS})
        self.assertEqual(first['score'], 1.0, json.dumps(first['tasks'], indent=1))
        self.assertEqual(first['cost_usd'], 0.0)


if __name__ == '__main__':
    unittest.main()
