import importlib.util
import sys
import unittest
from dataclasses import asdict, replace
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('tested_profiles', HERE/'profiles.py')
p = importlib.util.module_from_spec(spec);sys.modules[spec.name] = p;spec.loader.exec_module(p)


class AuthorityTests(unittest.TestCase):
    def setUp(self):
        self.authority = p.AuthorityEnvelope.browser_read('mission', ('example.com',))

    def test_authority_survives_serialization(self):
        self.assertEqual(p.AuthorityEnvelope.from_dict(asdict(self.authority), 'mission'), self.authority)

    def test_scope_and_hard_action_cannot_be_granted_by_capability(self):
        for operation in p.HARD_ACTIONS:
            self.assertEqual(self.authority.decide(operation, 'browser.read'), 'BLOCK')
        self.assertEqual(self.authority.decide('CLICK', 'browser.read', ('evil.com',)), 'BLOCK')
        self.assertEqual(self.authority.decide('CLICK', 'software.build', ('example.com',)), 'BLOCK')

    def test_autonomy_and_approval_are_enforced(self):
        for mode in ('ANSWER_ONLY', 'DELEGATE_ONLY'):
            self.assertEqual(replace(self.authority, autonomy_level=mode).decide('CLICK','browser.read'), 'BLOCK')
        restricted = replace(self.authority, approval_required_actions=('CLICK',))
        self.assertEqual(restricted.decide('CLICK', 'browser.read'), 'REQUIRE_APPROVAL')
        self.assertEqual(self.authority.decide('CLICK','browser.read', ('example.com',)), 'AUTO_EXECUTE')

    def test_malformed_or_cross_mission_authority_rejected(self):
        for changed in ({'mission_id':'other'}, {'allowed_actions':'CLICK'}, {'autonomy_level':'unbounded'}):
            with self.assertRaises(ValueError):
                p.AuthorityEnvelope.from_dict(asdict(self.authority) | changed,'mission')

    def test_profile_versions_do_not_contain_models(self):
        profile = p.REGISTRY.resolve('browser.operator',1)
        self.assertNotIn('model', asdict(profile))
        with self.assertRaises(ValueError):p.REGISTRY.resolve('browser.operator',99)
        with self.assertRaises(ValueError):p.ProfileRegistry([profile,profile])


class RuntimeAuthorityTests(unittest.IsolatedAsyncioTestCase):
    async def test_denied_authority_never_constructs_driver(self):
        spec = importlib.util.spec_from_file_location('profile_browser_test', HERE.parent/'hands/browser_runtime.py')
        br = importlib.util.module_from_spec(spec);sys.modules[spec.name]=br;spec.loader.exec_module(br)
        flow = br.BrowserFlow('a','mission','Read price','https://example.com',('example.com',),('price',),
                              {'kind':'dom','checks':[{'selector':'#price','exists':True}]})
        starts=[]
        def driver(*args, **kwargs):starts.append(1);raise AssertionError('must not execute')
        for mode in ('ANSWER_ONLY','DELEGATE_ONLY'):
            authority=replace(p.AuthorityEnvelope.browser_read('mission'),autonomy_level=mode)
            result=await br.BrowserRuntime(object(),driver_factory=driver,authority=authority).run_flow(flow)
            self.assertFalse(result['verified']);self.assertEqual(result['terminal_reason'],'authority_denied')
            self.assertEqual(result['profile_id'],'browser.operator')
        for authority in (p.AuthorityEnvelope.browser_read('wrong'),p.AuthorityEnvelope.browser_read('mission',('evil.com',))):
            result=await br.BrowserRuntime(object(),driver_factory=driver,authority=authority).run_flow(flow)
            self.assertEqual(result['status'],'BLOCKED')
        self.assertEqual(starts,[])

class RuntimeActionGateTests(unittest.IsolatedAsyncioTestCase):
    async def test_action_approval_gate_runs_before_execute(self):
        spec=importlib.util.spec_from_file_location('profile_gate_browser',HERE.parent/'hands/browser_runtime.py')
        br=importlib.util.module_from_spec(spec);sys.modules[spec.name]=br;spec.loader.exec_module(br)
        flow=br.BrowserFlow('a','mission','Read price','http://127.0.0.1/',('127.0.0.1',),('price',),
                           {'kind':'dom','checks':[{'selector':'#price','exists':True}]})
        actions=[]
        class Driver:
            def __init__(self,*a,**k):pass
            async def start(self):pass
            async def close(self):pass
            async def observe(self):
                return br.Observation('o','http://127.0.0.1/','price','price',
                    ({'id':'e1','name':'Read price','role':'button','visible':True},),'fingerprint',0)
            async def execute(self,*a,**k):actions.append(1);raise AssertionError('approval required')
        authority=replace(p.AuthorityEnvelope.browser_read('mission'),approval_required_actions=('CLICK',))
        runtime=br.BrowserRuntime(object(),driver_factory=Driver,authority=authority,local=True)
        async def decide(observation,flow,history):return br.ReflexDecision('o','CLICK','e1',1,0)
        runtime.reflex.decide=decide
        result=await runtime.run_flow(flow)
        self.assertFalse(result['verified']);self.assertEqual(result['terminal_reason'],'authority_require_approval')
        self.assertEqual(actions,[]);self.assertEqual(result['action_attempts'],0)

if __name__ == '__main__':unittest.main()
