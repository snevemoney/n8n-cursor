"""Exercise the real CI entrypoint against isolated tracked credential fixtures."""
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

class ScannerEntrypointTests(unittest.TestCase):
    def test_clean_then_tracked_credential_fails_without_disclosing_value(self):
        with tempfile.TemporaryDirectory() as temporary:
            repo = Path(temporary)
            for rel in ('tooling/scripts/scan-secrets.sh','scripts/hive/eng/secret-scan.py'):
                target = repo / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(ROOT / rel, target)
            subprocess.run(['git','init','-q',str(repo)],check=True)
            command = ['bash',str(repo / 'tooling/scripts/scan-secrets.sh')]
            clean = subprocess.run(command,cwd=repo.parent,capture_output=True,text=True)
            self.assertEqual(clean.returncode,0,clean.stderr)
            synthetic = 'sk-' + 'A' * 24
            (repo / '.env').write_text('API_KEY=' + synthetic)
            subprocess.run(['git','-C',str(repo),'add','.env'],check=True)
            detected = subprocess.run(command,cwd=repo.parent,capture_output=True,text=True)
            self.assertEqual(detected.returncode,1)
            self.assertIn('.env:',detected.stdout)
            self.assertIn('sk-prefix',detected.stdout)
            self.assertNotIn(synthetic,detected.stdout + detected.stderr)

if __name__ == '__main__':
    unittest.main()
