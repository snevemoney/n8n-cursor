"""Evens 2026-10-15 10:25: 'way too restrictive' — default reach like Claude Code/Codex/Cursor. Exact phrases from his log:
'What repos do you have installed', "Don't you have a red arrow you can use", 'Can you open a book on my Mac about AI',
'Could you change your code so you can give yourself access', 'can you fix it now?', 'Continue my saved-video build.'"""
import importlib.util,json,os,sys,tempfile,unittest
from pathlib import Path
STACK=Path(__file__).resolve().parents[1]
def load(name,rel):
    spec=importlib.util.spec_from_file_location(name,STACK/rel);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
class OpenByDefault(unittest.TestCase):
    def setUp(self):
        self.tmp=Path(tempfile.mkdtemp());os.environ['JARVIS_MODE_FILE']=str(self.tmp/'mode.json');self.P=load('perm_obd','hands/permissions.py')
    def tearDown(self):os.environ.pop('JARVIS_MODE_FILE',None)
    def test_on_without_grant_and_no_expiry(self):
        self.assertTrue(self.P.open_access())
        (self.tmp/'mode.json').write_text(json.dumps({'open_access':False}))  # the 04:17 closed file must not close it
        self.assertTrue(self.P.open_access())
        (self.tmp/'mode.json').write_text(json.dumps({'open_access':True,'expires':'2000-01-01T00:00:00'}))
        self.assertTrue(self.P.open_access())
    def test_owner_revoke_still_closes(self):
        self.P.set_open_access(False);self.assertFalse(self.P.open_access())
        self.P.set_open_access(True);self.assertTrue(self.P.open_access())
    def test_secrets_stay_secret(self):
        self.assertTrue(self.P.is_secret_path(str(Path.home()/'.ssh/id_ed25519')))
class CapabilityLine(unittest.TestCase):
    SRC=(STACK/'brain/pipeline.py').read_text()
    def test_states_real_abilities(self):
        for phrase in ('red arrow','open any file or book','list repos across his home','You CAN change your own code',
                       'run shell commands','install repos','Access is on by '):
            self.assertIn(phrase,self.SRC)
    def test_no_restriction_claims(self):
        for bad in ("(lasts one hour)","capabilities are fixed","say so rather than claiming to open one in an app"):
            self.assertNotIn(bad,self.SRC)
    def test_confirms_kept_only_for_consequential(self):
        self.assertIn('if tool in {"screen_see", "repo"} and _open_access():',self.SRC)
        for kept in ('merge','push','delete','send','post','purchase'):self.assertIn(kept,self.SRC[self.SRC.index('OPEN_CLI_HARD = re.compile('):][:300])
if __name__=='__main__':unittest.main()
