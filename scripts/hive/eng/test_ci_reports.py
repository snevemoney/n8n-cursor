"""Council must report observations, including failure on a shared commit."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[3]
WORKFLOW=ROOT/'.github/workflows/council-consolidated-reports.yml'
class CIReportTest(unittest.TestCase):
    def collect(self, runs):
        source=WORKFLOW.read_text()
        start=source.index('        run: |',source.index('        id: collect-workflows'))+len('        run: |\n')
        end=source.index('      - name:',start)
        code='\n'.join(line[10:] if line.startswith('          ') else line for line in source[start:end].splitlines())
        code=code.replace('${{ steps.config.outputs.period }}','daily')
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); (root/'runs.json').write_text(json.dumps(runs))
            gh=root/'gh'; gh.write_text('#!/bin/sh\ncat "$JARVIS_TEST_RUNS"\n');gh.chmod(0o755)
            output=root/'output'
            subprocess.run(['bash','-c',code],check=True,capture_output=True,text=True,
                env={**os.environ,'PATH':str(root)+':'+os.environ['PATH'],'JARVIS_TEST_RUNS':str(root/'runs.json'),'GITHUB_OUTPUT':str(output)})
            text=output.read_text()
            return json.loads(text.split('workflows<<EOF\n')[1].split('\nEOF')[0])
    def test_empty_history_does_not_fabricate_success(self):
        self.assertEqual(self.collect([]),[])
    def test_different_workflows_on_same_sha_keep_failure(self):
        stamp=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        runs=[{'workflowName':name,'conclusion':status,'headBranch':'test','headSha':'same-sha','createdAt':stamp,'displayTitle':'fixture'}
              for name,status in [('CI','success'),('Security Scan','failure')]]
        rows=self.collect(runs)
        self.assertEqual(len(rows),2,rows)
        self.assertEqual({row['status'] for row in rows},{'success','failure'})
if __name__=='__main__': unittest.main()
