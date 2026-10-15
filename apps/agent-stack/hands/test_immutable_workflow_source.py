import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('immutable_workspace',Path(__file__).with_name('workflow_workspace.py'))
W=importlib.util.module_from_spec(spec);spec.loader.exec_module(W)

class ImmutableSource(unittest.TestCase):
    def setUp(self):
        self.temp=Path(tempfile.mkdtemp(prefix='jarvis-source-test-')).resolve()
        self.repo=self.temp/'repo';self.repo.mkdir()
        self.hand=SimpleNamespace(PERM=lambda:SimpleNamespace(is_secret_path=lambda p:False))
        self.mock=patch.object(W,'_hand',lambda:self.hand);self.mock.start();self.addCleanup(self.mock.stop)
        self.git('init','-q');self.git('config','user.name','Fixture');self.git('config','user.email','fixture@example.invalid')
        for rel in set(W.CRITICAL+W.LOCKED):
            p=self.repo/'apps/agent-stack'/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('pass\n')
        self.feature=self.repo/'apps/agent-stack/feature.py';self.feature.write_text('value = "original"\n')
        self.git('add','.');self.git('commit','-qm','initial');self.revision=self.git('rev-parse','HEAD').strip()
    def git(self,*args):
        return subprocess.run(['/usr/bin/git','-C',str(self.repo),*args],capture_output=True,text=True,check=True,timeout=5).stdout
    def capture(self):
        return W.revision_source(self.repo,self.revision)
    def seal(self):
        files,meta=self.capture()
        return W.seal_source(files,store_root=self.temp/'store',source_revision=meta['source_revision'],source_tree=meta['source_tree'])
    def test_immutable_revision_ignores_and_preserves_dirty_checkout(self):
        self.feature.write_text('value = "unfinished dirty work"\n')
        files,meta=self.capture()
        self.assertEqual(files['apps/agent-stack/feature.py'][0],b'value = "original"\n')
        self.assertEqual(self.feature.read_text(),'value = "unfinished dirty work"\n')
        self.assertEqual(meta['source_revision'],self.revision)
    def test_sealed_input_survives_branch_advance_and_deleted_checkout_body(self):
        receipt=self.seal();self.feature.write_text('next revision\n');self.git('add','.');self.git('commit','-qm','another worker')
        self.feature.unlink()
        manifest=W.verify_source_bundle(receipt)
        body,row=W.frozen_source_bytes(receipt,'apps/agent-stack/feature.py',manifest)
        self.assertEqual(body,b'value = "original"\n');self.assertEqual(row['size'],len(body))
    def test_capture_never_calls_checkout_body_reader(self):
        old=W._regular_bytes
        def reader(path,*args):
            self.assertFalse(self.repo in path.parents,'mutable checkout body was read')
            return old(path,*args)
        with patch.object(W,'_regular_bytes',reader):self.seal()
    def test_tampered_bundle_fails_closed(self):
        receipt=self.seal();p=Path(receipt['root'])/'apps/agent-stack/feature.py';p.chmod(0o644);p.write_text('tampered\n');p.chmod(0o444)
        with self.assertRaises(W.WorkspaceBlocked):W.verify_source_bundle(receipt)
    def test_extra_importable_file_fails_closed(self):
        receipt=self.seal();root=Path(receipt['root']);root.chmod(0o755);(root/'unexpected.py').write_text('pass\n');root.chmod(0o555)
        with self.assertRaisesRegex(W.WorkspaceBlocked,'inventory'):W.verify_source_bundle(receipt)
    def test_reuse_requires_verified_existing_bundle(self):
        a=self.seal();b=self.seal();self.assertEqual(a,b)
    def test_cancel_does_not_read_or_copy_source(self):
        with self.assertRaisesRegex(W.WorkspaceBlocked,'cancelled'):W.revision_source(self.repo,self.revision,active_fn=lambda:False)
    def test_writeable_bundle_directory_fails_closed(self):
        receipt=self.seal();Path(receipt['root']).chmod(0o755)
        with self.assertRaisesRegex(W.WorkspaceBlocked,'directory_changed'):W.verify_source_bundle(receipt)
    def test_relative_receipt_path_fails_closed(self):
        receipt=self.seal();receipt['root']='relative/'+receipt['digest']
        with self.assertRaises(W.WorkspaceBlocked):W.verify_source_bundle(receipt)
    def test_added_empty_directory_fails_closed(self):
        receipt=self.seal();root=Path(receipt['root']);root.chmod(0o755);(root/'extra').mkdir(mode=0o555);root.chmod(0o555)
        with self.assertRaisesRegex(W.WorkspaceBlocked,'inventory'):W.verify_source_bundle(receipt)
    def test_dataless_is_refused_before_open(self):
        path=self.feature;real_stat=Path.stat
        def fake(p,*args,**kwargs):
            value=real_stat(p,*args,**kwargs)
            if p==path:
                attrs={key:getattr(value,key) for key in dir(value) if key.startswith('st_')};attrs['st_flags']=getattr(stat,'SF_DATALESS',0x40000000);return SimpleNamespace(**attrs)
            return value
        with patch.object(Path,'stat',fake),patch.object(os,'open',side_effect=AssertionError('must not open dataless body')):
            with self.assertRaisesRegex(W.WorkspaceBlocked,'unavailable'):W._regular_bytes(path)

if __name__=='__main__':unittest.main()
