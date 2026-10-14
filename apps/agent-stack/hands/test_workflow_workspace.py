import importlib.util
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('workflow_workspace_test',Path(__file__).with_name('workflow_workspace.py'))
M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
IDENT='a'*32

class WorkspaceTests(unittest.TestCase):
    def fixture(self,base):
        repo=base/'source';app=repo/'apps/agent-stack';app.mkdir(parents=True)
        for rel in set(M.CRITICAL+M.LOCKED):
            path=app/rel;path.parent.mkdir(parents=True,exist_ok=True);path.write_text('# actual source '+rel+'\n')
        (app/'dirty.py').write_text('original dirty bytes\n')
        scratch=base/'scratch';scratch.mkdir()
        env={**os.environ,'GIT_CONFIG_GLOBAL':'/dev/null','GIT_CONFIG_NOSYSTEM':'1'}
        def git(*args):
            result=subprocess.run(['/usr/bin/git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-C',str(repo),*args],capture_output=True,text=True,env=env,check=True)
            return result.stdout.strip()
        git('init','-q','-b','owner/source');git('config','user.email','fixture@example.invalid');git('config','user.name','Fixture')
        git('add','-A');git('commit','-qm','source baseline');head=git('rev-parse','HEAD')
        (app/'dirty.py').write_text('preserve changed uncommitted bytes\n')
        hand=M._hand()
        class Perm:
            def scratch_roots(self):return [scratch]
            def is_secret_path(self,p):return '.env' in Path(p).parts
            def decide(self,kind,target):return 'allow'
            def log_action(self,*a,**k):pass
        hand.PERM=lambda:Perm()
        files,_=M._snapshot(repo,'apps/agent-stack',hand,{})
        receipt={'verified':True,'verification_method':'owner_verified_current_checkout','source_repo':str(repo),
                 'bound_source_repo':str(repo),'source_subtree':'apps/agent-stack','git_dir':str(repo/'.git'),
                 'git_common_dir':str(repo/'.git'),'source_head':head,'source_branch':'owner/source',
                 'app_manifest':files,'tracked_app_paths':list(files),'locked_files':{'apps/agent-stack/'+rel:files['apps/agent-stack/'+rel] for rel in M.LOCKED},
                 'dependencies':{},'integration_target':str(base/'integration')}
        return repo,scratch,hand,receipt

    def test_real_existing_project_copy_preserves_dirty_source_and_locks(self):
        with tempfile.TemporaryDirectory() as tmp:
            base=Path(tmp).resolve();repo,scratch,hand,receipt=self.fixture(base)
            before=M._snapshot(repo,'apps/agent-stack',hand,{})
            with patch.object(M,'_hand',return_value=hand):result=M.prepare(IDENT,source_receipt=receipt,scratch_root=scratch,active_fn=lambda:True)
            self.assertTrue(result['ok'],result);self.assertFalse(result['task_verified'])
            self.assertEqual([row['kind'] for row in result['actions']],['owned_working_copy','owned_git_branch','owned_baseline_commit'])
            target=Path(result['working_copy']);self.assertEqual((target/'apps/agent-stack/dirty.py').read_bytes(),(repo/'apps/agent-stack/dirty.py').read_bytes())
            self.assertEqual(M._snapshot(repo,'apps/agent-stack',hand,{}),before)
            self.assertTrue(M.verify_working_copy(target,result['manifest']))
            (target/'apps/agent-stack/brain/online.py').write_text('changed locked model source')
            self.assertFalse(M.verify_working_copy(target,result['manifest']))

    def test_wrong_source_identity_or_incomplete_manifest_blocks_before_copy(self):
        with tempfile.TemporaryDirectory() as tmp:
            base=Path(tmp).resolve();repo,scratch,hand,receipt=self.fixture(base)
            for changes in ({'bound_source_repo':str(base/'other')},{'source_head':'b'*40},{'tracked_app_paths':['apps/agent-stack/missing.py']},{'app_manifest':{}},{'verified':False}):
                with patch.object(M,'_hand',return_value=hand):result=M.prepare(IDENT,source_receipt={**receipt,**changes},scratch_root=scratch,active_fn=lambda:True)
                self.assertFalse(result['ok']);self.assertFalse((scratch/('workflow-'+IDENT)).exists())

    def test_budget_and_symlink_block_before_any_working_copy(self):
        with tempfile.TemporaryDirectory() as tmp:
            base=Path(tmp).resolve();repo,scratch,hand,receipt=self.fixture(base)
            (repo/'apps/agent-stack/oversize.bin').write_bytes(b'0'*(M.MAX_FILE+1))
            with patch.object(M,'_hand',return_value=hand):result=M.prepare(IDENT,source_receipt=receipt,scratch_root=scratch,active_fn=lambda:True)
            self.assertFalse(result['ok']);self.assertFalse((scratch/('workflow-'+IDENT)).exists())
            (repo/'apps/agent-stack/link').symlink_to(base)
            with patch.object(M,'_hand',return_value=hand):result=M.prepare(IDENT,source_receipt=receipt,scratch_root=scratch,active_fn=lambda:True)
            self.assertFalse(result['ok'])

    def test_stop_during_copy_never_returns_ready(self):
        with tempfile.TemporaryDirectory() as tmp:
            base=Path(tmp).resolve();repo,scratch,hand,receipt=self.fixture(base)
            calls=[0]
            def active():calls[0]+=1;return calls[0]<5
            with patch.object(M,'_hand',return_value=hand):result=M.prepare(IDENT,source_receipt=receipt,scratch_root=scratch,active_fn=active)
            self.assertFalse(result['ok']);self.assertEqual(result['reason'],'cancelled')
            self.assertFalse((scratch/('workflow-'+IDENT)/'.git').exists())

    def test_source_change_during_copy_blocks_without_baseline(self):
        with tempfile.TemporaryDirectory() as tmp:
            base=Path(tmp).resolve();repo,scratch,hand,receipt=self.fixture(base)
            real_read=M._regular_bytes;count=[0];dirty=repo/'apps/agent-stack/dirty.py'
            def racing(path,*args):
                result=real_read(path,*args)
                if path==dirty:
                    count[0]+=1
                    if count[0]==2:dirty.write_text('external owner changed source')
                return result
            with patch.object(M,'_hand',return_value=hand),patch.object(M,'_regular_bytes',side_effect=racing):
                result=M.prepare(IDENT,source_receipt=receipt,scratch_root=scratch,active_fn=lambda:True)
            self.assertFalse(result['ok']);self.assertEqual(result['reason'],'source_changed_during_copy')
            self.assertFalse((scratch/('workflow-'+IDENT)/'.git').exists())

    def test_source_hooks_never_execute_and_mode_preserved(self):
        with tempfile.TemporaryDirectory() as tmp:
            base=Path(tmp).resolve();repo,scratch,hand,receipt=self.fixture(base)
            marker=base/'unexpected-hook'
            hook=repo/'.git/hooks/pre-commit';hook.write_text('#!/bin/sh\ntouch '+str(marker)+'\n');hook.chmod(0o755)
            mode_file=repo/'apps/agent-stack/dirty.py';mode_file.chmod(0o755)
            files,_=M._snapshot(repo,'apps/agent-stack',hand,{})
            receipt['app_manifest']=files
            with patch.object(M,'_hand',return_value=hand):result=M.prepare(IDENT,source_receipt=receipt,scratch_root=scratch,active_fn=lambda:True)
            self.assertTrue(result['ok'],result);self.assertFalse(marker.exists())
            self.assertEqual((Path(result['working_copy'])/'apps/agent-stack/dirty.py').stat().st_mode&0o777,0o755)

    def test_secret_source_is_denied_before_git_metadata_read(self):
        with tempfile.TemporaryDirectory() as tmp:
            base=Path(tmp).resolve();repo,scratch,hand,receipt=self.fixture(base)
            secret=base/'.env';repo.rename(secret)
            receipt.update(source_repo=str(secret),bound_source_repo=str(secret))
            with patch.object(M,'_hand',return_value=hand),patch.object(M,'_git_identity',side_effect=AssertionError('must not read metadata')):
                result=M.prepare(IDENT,source_receipt=receipt,scratch_root=scratch,active_fn=lambda:True)
            self.assertEqual(result['reason'],'secret_source_root');self.assertFalse((scratch/('workflow-'+IDENT)).exists())

if __name__=='__main__':unittest.main()
