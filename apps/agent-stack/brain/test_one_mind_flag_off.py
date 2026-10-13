"""B1: with JARVIS_ONE_MIND unset, the live paths never import One-Mind."""
import os
import subprocess
import sys
import unittest
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]
PROBE = r'''
import importlib.util, sys
for name, rel in (("p", "brain/pipeline.py"), ("b", "hands/browser_runtime.py"), ("c", "brain/mission_controller.py")):
    spec = importlib.util.spec_from_file_location("probe_" + name, rel)
    mod = importlib.util.module_from_spec(spec); sys.modules[spec.name] = mod; spec.loader.exec_module(mod)
print(sorted(m for m in sys.modules if "one_mind" in m))
'''


class FlagOffTests(unittest.TestCase):
    def test_live_paths_do_not_import_one_mind(self):
        env = {k: v for k, v in os.environ.items() if k != 'JARVIS_ONE_MIND'}
        env.update(AGENT_STACK_DRY_TTS='1', AGENT_STACK_CURSOR_DRY='1')
        out = subprocess.run([sys.executable, '-c', PROBE], cwd=STACK, env=env, capture_output=True, text=True, timeout=120)
        self.assertEqual(out.returncode, 0, out.stderr[-2000:])
        self.assertEqual(out.stdout.strip().splitlines()[-1], '[]')


if __name__ == '__main__':
    unittest.main()
