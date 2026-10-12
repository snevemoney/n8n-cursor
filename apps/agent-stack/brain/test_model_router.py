import asyncio
import importlib.util
import sys
import unittest
from dataclasses import replace
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('router_profiles_test',HERE/'profiles.py')
p=importlib.util.module_from_spec(spec);sys.modules[spec.name]=p;spec.loader.exec_module(p)
spec=importlib.util.spec_from_file_location('router_browser_test',HERE.parent/'hands/browser_runtime.py')
br=importlib.util.module_from_spec(spec);sys.modules[spec.name]=br;spec.loader.exec_module(br)

class RouterTests(unittest.TestCase):
    def test_role_survives_backend_upgrade(self):
        profile=p.REGISTRY.resolve('browser.planner')
        router=p.ModelRouter()
        old=router.select(profile,'frontier.chat',[p.BackendCandidate('old','RuntimeA','frontier.chat','old-model')])
        new=router.select(profile,'frontier.chat',[p.BackendCandidate('new','RuntimeB','frontier.chat','new-model')])
        self.assertEqual((old.profile_id,old.profile_version),(new.profile_id,new.profile_version))
        self.assertNotEqual(old.runtime,new.runtime);self.assertNotEqual(old.model_id,new.model_id)
        self.assertEqual(new.reason,'configured_preference')

    def test_unknown_tool_or_backend_cannot_be_improvised(self):
        profile=p.REGISTRY.resolve('browser.planner');router=p.ModelRouter()
        with self.assertRaisesRegex(ValueError,'profile_tool_not_permitted'):
            router.select(profile,'shell',[p.BackendCandidate('shell','shell','shell')])
        with self.assertRaisesRegex(ValueError,'no_compatible_backend'):
            router.select(profile,'frontier.chat',[p.BackendCandidate('wrong','Runtime','jev.decisions')])
        with self.assertRaisesRegex(ValueError,'configured_backend_unavailable'):
            router.select(profile,'frontier.chat',[p.BackendCandidate('one','Runtime','frontier.chat')],preferred='unknown')

    def test_excluded_failed_backend_does_not_return(self):
        rows=[p.BackendCandidate(x,'Runtime','frontier.chat',x) for x in ('primary','fallback')]
        route=p.ModelRouter().select(p.REGISTRY.resolve('browser.planner'),'frontier.chat',rows,excluded=('primary',))
        self.assertEqual(route.backend_id,'fallback')

    def test_gateway_roles_choose_profiles_separately_from_model(self):
        gateway=object.__new__(br.ModelGateway);gateway.online=SimpleNamespace(OPENROUTER_PAID_FALLBACKS=('configured',));gateway.calls=[]
        with patch.dict(br.os.environ,{},clear=True):
            routes=[gateway.route(role) for role in ('planner','synthesis','escalation')]
        self.assertEqual([r.profile_id for r in routes],['browser.planner','response.synthesizer','browser.operator'])
        self.assertEqual({r.model_id for r in routes},{'configured'})
        self.assertEqual(gateway.route('jev',tool='jev.decisions').model_id,br.JEV_MODEL)
        with self.assertRaises(ValueError):gateway.route('page_requests_admin')


class ConcurrentTraceTests(unittest.IsolatedAsyncioTestCase):
    async def test_plan_attaches_to_own_call_after_another_call_finishes(self):
        gateway=object.__new__(br.ModelGateway);gateway.online=SimpleNamespace(OPENROUTER_PAID_FALLBACKS=('configured',));gateway.calls=[]
        def request(endpoint,payload,role):
            own={'role':role,'call_id':'own'};other={'role':'synthesis','call_id':'other'}
            gateway.calls.extend([own,other])
            return {'_jarvis_call':own,'choices':[{'message':{'content':'{"flows":[]}'}}]}
        gateway.request=request
        with patch.dict(br.os.environ,{},clear=True):result=await gateway.chat('Plan','planner')
        self.assertEqual(gateway.calls[0]['structured_plan'],result)
        self.assertNotIn('structured_plan',gateway.calls[1])

    async def test_fallback_annotation_cannot_land_on_concurrent_synthesis(self):
        gateway=object.__new__(br.ModelGateway);gateway.online=SimpleNamespace(OPENROUTER_PAID_FALLBACKS=('primary','fallback'));gateway.calls=[]
        def request(endpoint,payload,role):
            if payload['model']=='primary':raise TimeoutError('injected')
            own={'role':role,'call_id':'own'};other={'role':'synthesis','call_id':'other'}
            gateway.calls.extend([own,other])
            return {'_jarvis_call':own,'choices':[{'message':{'content':'{"flows":[]}'}}]}
        gateway.request=request
        with patch.dict(br.os.environ,{},clear=True):await gateway.chat('Plan','planner')
        self.assertEqual(gateway.calls[0]['configured_frontier_fallback']['to'],'fallback')
        self.assertNotIn('configured_frontier_fallback',gateway.calls[1])

if __name__=='__main__':unittest.main()
