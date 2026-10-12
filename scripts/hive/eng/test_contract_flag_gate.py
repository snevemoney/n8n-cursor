import json
import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[3] / 'packages/contracts/scripts/check-flags.py'

class ContractFlagGateTest(unittest.TestCase):
    def run_case(self, source, extension="ts"):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for folder in ('contracts', 'apps', 'packages'):
                (root / folder).mkdir()
            (root / 'contracts/flags.schema.json').write_text(json.dumps({'properties': {'KNOWN': {}, 'LNbits_WEBHOOK_VALIDATION': {}}}))
            (root / f'apps/fixture.{extension}').write_text(source)
            return subprocess.run(['python3', str(SCRIPT), str(root)], text=True, capture_output=True)
    def test_known_public_and_mixed_case_identifiers(self):
        self.assertEqual(self.run_case('process.env.NEXT_PUBLIC_FF_KNOWN; process.env.FF_LNbits_WEBHOOK_VALIDATION').returncode, 0)
    def test_unknown_on_same_line_as_known_is_denied(self):
        out = self.run_case('process.env.FF_KNOWN; process.env.FF_KNOWN_EXTRA')
        self.assertEqual(out.returncode, 1)
        self.assertIn('FF_KNOWN_EXTRA', out.stderr)
    def test_unknown_in_react_sources_is_denied(self):
        for extension in ("tsx", "jsx"):
            with self.subTest(extension=extension):
                self.assertEqual(self.run_case('const view = <div>{process.env.FF_MISSING}</div>', extension).returncode, 1)
    def test_no_flags_is_valid(self):
        self.assertEqual(self.run_case('const value = 42').returncode, 0)

if __name__ == '__main__': unittest.main()
