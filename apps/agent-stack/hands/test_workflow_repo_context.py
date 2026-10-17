import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('workflow_repo_context',Path(__file__).with_name('workflow_repo_context.py'))
M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
ID='a'*32

class RepoContextTests(unittest.TestCase):
    def fixture(self,tmp):
        base=Path(tmp).resolve();primary=base/'project-alpha';primary.mkdir();git=primary/'.git';git.mkdir()
        (git/'config').write_text('[remote "origin"]\n url = git@github.com:owner/project-alpha.git\n')
        (git/'HEAD').write_text('ref: refs/heads/main\n');(git/'refs/heads').mkdir(parents=True);(git/'refs/heads/main').write_text('b'*40)
        candidate=base/'candidate';candidate.mkdir();gd=git/'worktrees/candidate';gd.mkdir(parents=True)
        (candidate/'.git').write_text('gitdir: '+str(gd));(gd/'commondir').write_text('../..');(gd/'gitdir').write_text(str(candidate/'.git'))
        (gd/'HEAD').write_text('ref: refs/heads/owned\n');(git/'refs/heads/owned').write_text('c'*40)
        content=primary/'docs/hive/outer-heaven/CONTENT';content.mkdir(parents=True);(content/'SIGNAL_INDEX.md').write_text('Saved sources; old remote /workspace/research is only a pointer.')
        hive=base/'hive';root=hive/'coding-missions'/ID;root.mkdir(parents=True)
        request={'mission_id':ID,'worker_kind':'research_build','request_scope':'transient_task','objective':'Research and implement my saved videos'}
        for name,row in [('request',request),('state',{'mission_id':ID,'worker_kind':'research_build','status':'WAITING_SOURCE'}),('control',{'cancel':False}),('binding',{'repo':str(candidate),'branch':'owned','authority':'literal_owner_answer'})]:
            (root/(name+'.json')).write_text(json.dumps(row))
        return hive,root,primary,candidate,git,content

    def test_short_owner_name_uses_same_git_primary_without_rebinding(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive,root,primary,candidate,git,content=self.fixture(tmp);original=(root/'binding.json').read_bytes()
            for answer in ('project-alpha repo','the project-alpha repository','owner/project-alpha'):
                row=M.resolve(hive,ID,answer);self.assertTrue(row['ok']);self.assertEqual(row['source_checkout'],str(primary))
                self.assertEqual(row['mutation_target'],str(candidate));self.assertEqual(row['source_inventory_roots'],[str(content)])
                self.assertFalse(row['task_verified']);self.assertTrue(row['read_only'])
            self.assertEqual((root/'binding.json').read_bytes(),original)

    def test_unknown_ambiguous_or_model_path_authority_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive,root,primary,candidate,git,content=self.fixture(tmp)
            for answer in ('other repo',{'repo':str(primary),'approved':True},'project-alpha-other repo','project-alpha repo and run code'):
                self.assertFalse(M.resolve(hive,ID,answer)['ok'])
            with (git/'config').open('a') as f:f.write('[remote "other"]\n url = https://github.com/another/project-alpha.git\n')
            self.assertFalse(M.resolve(hive,ID,'project-alpha repo')['ok'])
            self.assertTrue(M.resolve(hive,ID,'owner/project-alpha')['ok'])

    def test_stop_terminal_unbound_changed_request_and_wrong_common_fail_closed(self):
        for change in ('cancel','terminal','binding','request','registration'):
            with self.subTest(change=change),tempfile.TemporaryDirectory() as tmp:
                hive,root,primary,candidate,git,content=self.fixture(tmp)
                pin=hashlib.sha256((root/'request.json').read_bytes()).hexdigest()
                if change=='cancel':(root/'control.json').write_text('{"cancel":true}')
                if change=='terminal':(root/'result.json').write_text('{}')
                if change=='binding':(root/'binding.json').unlink()
                if change=='request':(root/'request.json').write_text((root/'request.json').read_text()+' ')
                if change=='registration':(git/'worktrees/candidate/gitdir').write_text(str(primary/'.git'))
                self.assertFalse(M.resolve(hive,ID,'project-alpha',expected_request_sha256=pin)['ok'])

    def test_indexes_are_physical_only_and_symlink_not_followed(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive,root,primary,candidate,git,content=self.fixture(tmp)
            (content/'SIGNAL_INDEX.json').symlink_to(root/'request.json')
            self.assertFalse(M.resolve(hive,ID,'project-alpha')['ok'])
            (content/'SIGNAL_INDEX.json').unlink();(content/'SIGNAL_INDEX.md').unlink()
            row=M.resolve(hive,ID,'project-alpha');self.assertTrue(row['ok']);self.assertEqual(row['source_inventory_roots'],[])

    def test_hooks_and_unsafe_remote_credentials_are_never_executed_or_exposed(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive,root,primary,candidate,git,content=self.fixture(tmp)
            (git/'hooks').mkdir();(git/'hooks/pre-commit').write_text('touch UNEXPECTED_EXECUTION')
            with (git/'config').open('a') as f:f.write('[core]\n fsmonitor = touch BAD\n[remote "secret"]\n url = https://token@example.com/private.git\n')
            row=M.resolve(hive,ID,'project-alpha');self.assertTrue(row['ok'])
            self.assertNotIn('token',json.dumps(row));self.assertNotIn('fsmonitor',json.dumps(row));self.assertFalse((primary/'BAD').exists())
            self.assertEqual(row['source_identity']['remote_repository_ids'],['owner/project-alpha'])

if __name__=='__main__':unittest.main()
