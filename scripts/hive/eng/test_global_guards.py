"""Exercise actual workflow shell blocks, including unavailable Git baseline."""
import subprocess, tempfile, os, unittest
from pathlib import Path

class GlobalGuardsTest(unittest.TestCase):
    def test_git_errors_and_existing_policies(self):
        source=(Path(__file__).resolve().parents[3] / '.github/workflows/guards.yml').read_text()
        blocks=[]
        for chunk in source.split('      - run: |\n')[1:]:
         lines=[]
         for line in chunk.splitlines():
          if line and not line.startswith('          '):break
          lines.append(line[10:])
         blocks.append('\n'.join(lines).replace('${{ github.base_ref }}','main'))
        self.assertEqual(len(blocks), 3, "all existing guard scripts must be exercised")
        results=[]
        with tempfile.TemporaryDirectory()as tmp:
         git=Path(tmp)/'git';git.write_text("#!/bin/sh\nif [ \"$FIXTURE\" = missing ]; then exit 128; fi\ncase \"$*\" in *'-- apps/api') printf '%s\\n' \"$FILES\" | grep '^apps/api/' || true;; *'-- contracts/openapi.yaml') printf '%s\\n' \"$FILES\" | grep '^contracts/openapi.yaml$' || true;; *) printf '%s\\n' \"$FILES\";; esac\n");git.chmod(0o755)
         for i,block in enumerate(blocks):
          for fixture,files,expected in [('missing','',False),('good','README.md',True),('good','',True),('good',('.env.local','apps/api/test.ts','apps/lfai/a.ts\napps/side/b.ts')[i],False)]:
           r=subprocess.run(['bash','-e','-c',block],env={**os.environ,'PATH':tmp+':'+os.environ['PATH'],'FIXTURE':fixture,'FILES':files},capture_output=True,text=True)
           results.append({'guard':i,'fixture':fixture,'passed':r.returncode==0,'expected':expected})
         for index, files in ((1, 'apps/api/test.ts\ncontracts/openapi.yaml'), (2, 'apps/lfai/a.ts')):
          r=subprocess.run(['bash','-e','-c',blocks[index]],env={**os.environ,'PATH':tmp+':'+os.environ['PATH'],'FIXTURE':'good','FILES':files},capture_output=True,text=True)
          self.assertEqual(r.returncode, 0, r.stderr)
        self.assertTrue(all(r['passed']==r['expected']for r in results), results)

if __name__ == "__main__":
    unittest.main()
