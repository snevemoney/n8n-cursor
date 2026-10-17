import importlib.util, os, subprocess, tempfile, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('ww_overlay',Path(__file__).with_name('workflow_workspace.py'))
M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)

class ApprovedOverlay(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.repo=Path(self.tmp.name)
        env={**os.environ,'GIT_CONFIG_GLOBAL':'/dev/null','GIT_CONFIG_NOSYSTEM':'1'}
        self.git=lambda *a:subprocess.run(['/usr/bin/git','-C',str(self.repo),*a],check=True,capture_output=True,env=env)
        self.git('init','-q');self.git('config','user.email','f@example.invalid');self.git('config','user.name','F')
        for n in ('PROGRESS.md','clean.py'):(self.repo/n).write_text('base\n')
        self.git('add','-A');self.git('commit','-qm','base')
        (self.repo/'PROGRESS.md').write_text('another agent is working\n')
    def tearDown(self):self.tmp.cleanup()

    def test_manifest_digests_the_approved_edit_and_verifies(self):
        m=M.overlay_manifest(self.repo,['PROGRESS.md'])
        self.assertEqual(list(m['files']),['PROGRESS.md']);self.assertTrue(M.verify_overlay(self.repo,m))

    def test_unchanged_file_cannot_be_called_an_overlay(self):
        with self.assertRaises(M.WorkspaceBlocked):M.overlay_manifest(self.repo,['clean.py'])

    def test_later_edit_or_moved_base_is_caught(self):
        m=M.overlay_manifest(self.repo,['PROGRESS.md'])
        (self.repo/'PROGRESS.md').write_text('changed after approval\n')
        with self.assertRaises(M.WorkspaceBlocked):M.verify_overlay(self.repo,m)
        self.git('commit','-qam','moved');(self.repo/'PROGRESS.md').write_text('another agent is working\n')
        with self.assertRaises(M.WorkspaceBlocked):M.verify_overlay(self.repo,m)

    def test_tampered_manifest_is_caught(self):
        m=M.overlay_manifest(self.repo,['PROGRESS.md']);m['files']['PROGRESS.md']['size']+=1
        with self.assertRaises(M.WorkspaceBlocked):M.verify_overlay(self.repo,m)

if __name__=='__main__':unittest.main()
