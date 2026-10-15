"""Static classifier adversarial cases only; never executes candidate source."""
import importlib.util,unittest
from pathlib import Path
S=importlib.util.spec_from_file_location('regex_guard',Path(__file__).with_name('workflow_config_lock.py'));G=importlib.util.module_from_spec(S);S.loader.exec_module(G)
class RegexProof(unittest.TestCase):
 def dynamic(self,text):return any(kind=='dynamic_configuration' for kind,_ in G._semantics(text,'hands/candidate.py')['sensitive'])
 def test_direct_unshadowed_standard_regex_compile_is_not_dynamic_code(self):
  for text in ['import re\nPATTERN=re.compile(r"hello",re.IGNORECASE)\n',
               'import re\ndef match(text):\n return re.compile(r"hello").search(text)\n',
               'import re\ndef words(text):\n return re.findall(r"word",text)\nP=re.compile("hello")\n']:
   with self.subTest(text=text):self.assertFalse(self.dynamic(text))
 def test_rebinding_local_argument_alias_and_mutation_remain_fail_closed(self):
  snippets=[
   'import re\nre=other\nP=re.compile("x")',
   'import re\ndef f(re):\n return re.compile("x")',
   'import re\ndef f():\n re=other\n return re.compile("x")',
   'import re as regex\nP=regex.compile("x")',
   'from re import compile as regex_compile\nP=regex_compile("x")',
   'import re\ncompiler=re.compile\nP=compiler("x")',
   'import re\ncompiler=getattr(re,"compile")\nP=compiler("x")',
   'import re\nre.compile=other\nP=re.compile("x")',
   'import re\nsetattr(re,"compile",other)\nP=re.compile("x")',
   'import re\nobject.__setattr__(re,"compile",other)\nP=re.compile("x")',
   'import re\ndef f():\n global re\n re=other\n return re.compile("x")',
   'import re\nfor re in values:\n P=re.compile("x")',
   'import re\ntry:pass\nexcept Exception as re:\n P=re.compile("x")',
   'import re\nmatch value:\n case re:\n  P=re.compile("x")',
   'import re\nre.__dict__["compile"]=other\nP=re.compile("x")',
   'import re\nfrom unknown import *\nP=re.compile("x")',
   'import re\nexec(code)\nP=re.compile("x")',
   'import re\n__import__("plugin")\nP=re.compile("x")',
   'import re\nimportlib.import_module("plugin")\nP=re.compile("x")',
   'P=compile("x","<input>","exec")',
   'compiler=compile\nP=compiler("x","<input>","exec")',
   'import re\nP=other.compile("x")',
  ]
  for text in snippets:
   with self.subTest(text=text):self.assertTrue(self.dynamic(text))
 def test_regex_exemption_never_removes_model_provider_or_endpoint_selection(self):
  for extra in ['CODE_MODEL="new-model"','os.environ["CODE_MODEL"]="changed"','llm([],"model-other")','client.chat(model="changed")','ENDPOINT="https://api.openrouter.ai"']:
   with self.subTest(extra=extra):self.assertTrue(G._semantics('import re\nP=re.compile("x")\n'+extra,'hands/candidate.py')['sensitive'])
if __name__=='__main__':unittest.main()

class ImportNamespace(unittest.TestCase):
 def dynamic(self,text):return any(k=='dynamic_configuration' for k,_ in G._semantics(text,'brain/new_feature.py')['sensitive'])
 def test_import_registry_hooks_and_unknown_import_effects_disable_exemption(self):
  cases=['import re\nimport sys\nsys.modules["re"]=other\nP=re.compile("x")',
   'import re\nimport sys as s\ns.path.insert(0,"other")\nP=re.compile("x")',
   'import re\nfrom sys import modules as registry\nregistry["re"]=other\nP=re.compile("x")',
   'import re\nimport builtins\nbuiltins.__import__=other\nP=re.compile("x")',
   'import re\nimport plugin\nP=re.compile("x")',
   'import re\ndef f(sys):\n sys.path.insert(0,"other")\n return re.compile("x")',
   'import re\ndef f(builtins):\n builtins.__dict__["__import__"]=other\n return re.compile("x")',
   'import re\nloader.meta_path.insert(0,hook)\nP=re.compile("x")',
   'import re\n__builtins__["__import__"]=other\nP=re.compile("x")']
  for text in cases:
   with self.subTest(text=text):self.assertTrue(self.dynamic(text))
  self.assertFalse(self.dynamic('from __future__ import annotations\nimport re\nP=re.compile("x")'))
 def test_existing_local_re_module_and_new_shadow_paths_fail_closed(self):
  import tempfile
  from hands.test_workflow_config_lock import ConfigurationLockTests
  fixture=ConfigurationLockTests()
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp).resolve();lock=fixture.fixture(root)
   normal='import re\nP=re.compile("hello")\n'
   self.assertTrue(G.validate_candidate(lock,root,{'brain/ordinary.py':normal},expected_digest=lock['digest'])['ok'])
   for path in ('re.py','brain/re.py','re/__init__.py','hands/re/__init__.py'):
    with self.subTest(path=path):self.assertFalse(G.validate_candidate(lock,root,{path:'def compile(value):return value\n'},expected_digest=lock['digest'])['ok'])
   (root/'re.py').write_text('def compile(value):return value\n');lock=G.capture_lock(root,{})
   self.assertFalse(G.validate_candidate(lock,root,{'brain/ordinary.py':normal},expected_digest=lock['digest'])['ok'])
 def test_historical_lock_is_not_rewritten_or_silently_migrated(self):
  import tempfile,json,hashlib
  from hands.test_workflow_config_lock import ConfigurationLockTests
  fixture=ConfigurationLockTests()
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp).resolve();lock=fixture.fixture(root);saved=json.dumps(lock,sort_keys=True);old=dict(lock);old['guard_sha256']='0'*64;old['digest']=G._digest({k:v for k,v in old.items() if k!='digest'})
   result=G.validate_candidate(old,root,{},expected_digest=old['digest']);self.assertFalse(result['ok']);self.assertEqual(result['reason'],'configuration_guard_changed');self.assertEqual(json.dumps(lock,sort_keys=True),saved)

class CrossModuleNamespace(unittest.TestCase):
 def test_namespace_helper_is_sensitive_without_a_compile_call(self):
  snippets=['import re\nre.__dict__["compile"]=other\n',
            'import re as regex\nregex.__dict__.update(compile=other)\n',
            'import sys\nregistry=sys.modules\nregistry["re"]=other\n',
            'import builtins\nbuiltins.__dict__["__import__"]=other\n']
  for text in snippets:
   with self.subTest(text=text):self.assertTrue(any(k=='dynamic_configuration' for k,_ in G._semantics(text,'brain/helper.py')['sensitive']))
 def test_helper_mutation_and_regex_feature_are_rejected_together(self):
  import tempfile
  from hands.test_workflow_config_lock import ConfigurationLockTests
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp).resolve();lock=ConfigurationLockTests().fixture(root)
   writes={'brain/helper.py':'import re\nre.__dict__["compile"]=other\n','brain/ordinary.py':'import re\nP=re.compile("hello")\n'}
   self.assertFalse(G.validate_candidate(lock,root,writes,expected_digest=lock['digest'])['ok'])
   self.assertTrue(G.validate_candidate(lock,root,{'brain/ordinary.py':writes['brain/ordinary.py']},expected_digest=lock['digest'])['ok'])

class ReflectedNamespace(unittest.TestCase):
 def test_reflective_helper_cannot_change_regex_in_another_file(self):
  for expression in ['object.__getattribute__(re,"__dict__")','type(re).__getattribute__(re,"__dict__")','operator.attrgetter("__dict__")(re)']:
   with self.subTest(expression=expression):
    text='import re\n'+expression+'["compile"]=other\n'
    self.assertTrue(any(k=='dynamic_configuration' for k,_ in G._semantics(text,'brain/helper.py')['sensitive']))

class RegexModuleMutation(unittest.TestCase):
 def test_any_regex_module_mutation_or_escape_is_bound_even_in_helper(self):
  snippets=['import re\nre._compile=other','import re as regex\nregex._compile=other',
            'import re\ndel re._compile','import re\nmodule=re\nmodule._compile=other',
            'import re\nchange(re)']
  for text in snippets:
   with self.subTest(text=text):self.assertTrue(any(k=='dynamic_configuration' for k,_ in G._semantics(text,'brain/helper.py')['sensitive']))

class NestedRegexMutation(unittest.TestCase):
 def test_nested_attribute_and_subscript_mutation_is_bound(self):
  for statement in ['re._compiler._compile=other','del re._compiler._compile','re._cache["key"]=other','re._compiler.options["key"]=other']:
   with self.subTest(statement=statement):self.assertTrue(any(k=='dynamic_configuration' for k,_ in G._semantics('import re\n'+statement,'brain/helper.py')['sensitive']))

class RestrictedImportedRegexUse(unittest.TestCase):
 def test_internals_and_mutator_calls_in_helpers_are_bound(self):
  for statement in ['re._cache.update({})','re._cache.clear()','re._compiler.options.update({})','re.compile.__defaults__=other','re.__getattribute__("_cache").update({})']:
   with self.subTest(statement=statement):self.assertTrue(any(k=='dynamic_configuration' for k,_ in G._semantics('import re\n'+statement,'brain/helper.py')['sensitive']))
 def test_public_direct_regex_calls_and_flags_are_nonsensitive(self):
  for statement in ['re.search("x",text)','re.findall("x",text,re.I)','re.finditer("x",text)','re.escape(text)']:
   with self.subTest(statement=statement):self.assertFalse(G._semantics('import re\n'+statement,'brain/helper.py')['sensitive'])
