import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location('workflow_config_lock_test',Path(__file__).with_name('workflow_config_lock.py'))
M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
AGENT="""import os
CODE_MODEL='anthropic/claude-opus-5.5'
CODE_MODEL_BACKUP='anthropic/claude-sonnet-5.5'
RANK_MODEL='x-ai/grok-4.7'
CODE_SYS='existing coding instructions'
MAX_ITERS=4
def llm(messages,model):
    key=os.environ.get('OPENROUTER_API_KEY')
    return '',model
def rank_skills(goal):
    return []
def _or_key():
    return ''
def _load_brain_online():
    return None
def harness(messages):
    return llm(messages,CODE_MODEL)
"""

class ConfigurationLockTests(unittest.TestCase):
    def fixture(self,root):
        for rel in M.WHOLE_FILES:
            path=root/rel;path.parent.mkdir(parents=True,exist_ok=True);path.write_text('UNCHANGED_CONFIGURATION = 1\n')
        for rel,text in {'hands/agent_tools.py':AGENT,'hands/browser_runtime.py':'class ModelGateway:\n    def route(self):\n        return "current"\n','brain/pipeline.py':'def online_talk(prompt):\n    return None\n'}.items():
            path=root/rel;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
        dirty={'brain/online.py':M._read(root/'brain/online.py')[1]['sha256']}
        return M.capture_lock(root,dirty)
    def check(self,root,lock,writes):
        return M.validate_candidate(lock,root,writes,expected_digest=lock['digest'])
    def test_complete_guard_separates_dirty_baseline_and_never_saves_env_values(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            self.assertGreater(lock['coverage']['whole_file_count'],len(lock['dirty_preimages']))
            self.assertIn('mouth/voice.py',lock['whole_files']);self.assertIn('brain/jev_router.py',lock['whole_files'])
            self.assertEqual(set(lock['environment_presence']),{'OPENROUTER_API_KEY'})
            self.assertTrue(all(type(value) is bool for value in lock['environment_presence'].values()))
            self.assertTrue(self.check(root,lock,{})['ok'])
    def test_voice_jev_provider_and_profiles_edits_fail_before_write(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            for rel in ('mouth/voice.py','brain/jev_router.py','brain/online.py','brain/profiles.py'):
                old=(root/rel).read_bytes()
                result=self.check(root,lock,{rel:'NEW_MODEL="different"\n'})
                self.assertFalse(result['ok']);self.assertEqual((root/rel).read_bytes(),old)
    def test_coding_constant_fallback_call_argument_and_dynamic_override_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            variants=[AGENT.replace('claude-opus-5.5','different-model'),AGENT.replace('claude-sonnet-5.5','different-backup'),
                      AGENT.replace('llm(messages,CODE_MODEL)','llm(messages,"another")'),AGENT+'\nglobals()["CODE_MODEL"]="another"\n']
            for body in variants:self.assertFalse(self.check(root,lock,{'hands/agent_tools.py':body})['ok'])
            self.assertEqual((root/'hands/agent_tools.py').read_text(),AGENT)
    def test_legitimate_harness_code_and_local_feature_are_allowed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            improved=AGENT+'\ndef cancellation_fence(check):\n    return bool(check())\n'
            result=self.check(root,lock,[{'path':'apps/agent-stack/hands/agent_tools.py','content':improved},
                                        {'path':'hands/local_feature.py','content':'def add(a,b):\n    return a+b\n'}])
            self.assertTrue(result['ok'],result)
    def test_gateway_and_pipeline_selector_replacement_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            self.assertFalse(self.check(root,lock,{'hands/browser_runtime.py':'class ModelGateway:\n    def route(self):\n        return "other"\n'})['ok'])
            self.assertFalse(self.check(root,lock,{'brain/pipeline.py':'def online_talk(prompt):\n    return "new backend"\n'})['ok'])
    def test_tampered_incomplete_lock_and_pinned_digest_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            altered=json.loads(json.dumps(lock));del altered['whole_files']['mouth/voice.py']
            altered['digest']=M._digest({k:v for k,v in altered.items() if k!='digest'})
            self.assertFalse(M.validate_candidate(altered,root,{},expected_digest=lock['digest'])['ok'])
            self.assertFalse(M.validate_candidate(altered,root,{})['ok'])
    def test_new_python_or_data_model_configuration_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            for path,body in [('hands/new_backend.py','def call():\n    return {"model":"unapproved"}\n'),
                              ('settings.json','{"model":"unapproved"}'),('voice.toml','voice="unapproved"')]:
                self.assertFalse(self.check(root,lock,{path:body})['ok'])
    def test_unknown_current_drift_missing_source_or_symlink_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            (root/'mouth/voice.py').write_text('changed=1\n')
            self.assertFalse(self.check(root,lock,{})['ok'])
            (root/'mouth/voice.py').unlink();(root/'mouth/voice.py').symlink_to(root/'brain/online.py')
            self.assertFalse(self.check(root,lock,{})['ok'])
    def test_invalid_proposed_path_syntax_and_guard_edit_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            for path,body in [('../outside.py','x=1'),('hands/other.py','this is not python:'),('hands/workflow_config_lock.py','x=1')]:
                self.assertFalse(self.check(root,lock,{path:body})['ok'])

    def test_normalized_case_and_symlink_aliases_cannot_bypass_whole_file_guard(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            for rel in ('apps//agent-stack/brain/online.py','BRAIN/ONLINE.PY'):
                self.assertFalse(self.check(root,lock,{rel:'x=1\n'})['ok'])
            alias=root/'test_alias.py';alias.symlink_to(root/'brain/online.py')
            self.assertFalse(self.check(root,lock,{'test_alias.py':'x=1\n'})['ok'])

    def test_dirty_preimages_cannot_expand_read_scope(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();self.fixture(root)
            with self.assertRaises(M.ConfigLockError):M.capture_lock(root,{'../outside.py':'0'*64})

    def test_fragmented_reflection_and_configuration_subscript_override_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            for body in ('globals()["C"+"ODE_"+"MO"+"DEL"]="another"\n',
                         'def override(options):\n    options["model"]="another"\n',
                         'setattr(target,name,"another")\n'):
                self.assertFalse(self.check(root,lock,{'hands/override.py':body})['ok'])

    def test_test_filename_configuration_override_cannot_be_production_imported(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            override='import os\nos.environ["JARVIS_CODE_MODEL"]="unapproved"\n'
            writes={'test_selector_override.py':override,'hands/agent_tools.py':AGENT+'\nimport test_selector_override\n'}
            self.assertFalse(self.check(root,lock,writes)['ok'])
            # A preexisting test is still not a newly authorized production dependency.
            (root/'test_selector_override.py').write_text(override)
            lock=M.capture_lock(root,lock['dirty_preimages'])
            self.assertFalse(self.check(root,lock,{'hands/agent_tools.py':AGENT+'\nimport test_selector_override\n'})['ok'])

    def test_same_call_multiset_cannot_hide_changed_selector_control_flow(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();self.fixture(root)
            original=AGENT+'\ndef choose(messages):\n    if True:\n        return llm(messages,CODE_MODEL)\n    return llm(messages,CODE_MODEL_BACKUP)\n'
            (root/'hands/agent_tools.py').write_text(original)
            lock=M.capture_lock(root,{})
            altered=original.replace('if True:','if False:')
            self.assertFalse(self.check(root,lock,{'hands/agent_tools.py':altered})['ok'])
            self.assertTrue(self.check(root,lock,{'hands/agent_tools.py':original+'\ndef checkpoint_label():\n    return "pending"\n'})['ok'])

    def test_module_control_cannot_switch_model_with_unchanged_assignment_multiset(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();self.fixture(root)
            original='if True:\n    CODE_MODEL="anthropic/claude-opus"\nelse:\n    CODE_MODEL="anthropic/claude-sonnet"\n'+AGENT
            (root/'hands/agent_tools.py').write_text(original)
            lock=M.capture_lock(root,{})
            altered=original.replace('if True:','if False:')
            self.assertFalse(self.check(root,lock,{'hands/agent_tools.py':altered})['ok'])
            self.assertTrue(self.check(root,lock,{'hands/agent_tools.py':original+'\ndef checkpoint_label():\n    return "pending"\n'})['ok'])

    def test_persisted_json_lock_validates_unchanged_source_and_still_rejects_model_change(self):
        import json
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();lock=self.fixture(root)
            restored=json.loads(json.dumps(lock))
            self.assertTrue(self.check(root,restored,{})['ok'])
            self.assertFalse(self.check(root,restored,{'hands/agent_tools.py':AGENT.replace('CODE_MODEL','DIFFERENT_MODEL')})['ok'])

if __name__=='__main__':unittest.main()
