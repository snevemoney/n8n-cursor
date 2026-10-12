import asyncio
import importlib.util
import json
from pathlib import Path
import sys
import unittest
import unittest.mock
from dataclasses import replace, asdict

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('tested_browser_runtime', HERE/'browser_runtime.py')
br = importlib.util.module_from_spec(spec); sys.modules[spec.name] = br; spec.loader.exec_module(br)


def flow(**changes):
    return replace(br.BrowserFlow('a','m','Read price','https://example.com/',('example.com',),('Price visible',),
        {'kind':'dom','checks':[{'selector':'#price','text_contains':'$20'}]},inputs={'origin':'YUL'}), **changes)


def observation(**changes):
    return replace(br.Observation('o','https://example.com/','Test','Price page',
        ({'id':'e1','name':'Open pricing','role':'link','href':'/pricing','visible':True,'disabled':False},), 'fingerprint',0), **changes)


def decision(**changes):
    return replace(br.ReflexDecision('o','CLICK','e1',.99,0,readonly_probability=1), **changes)


class Gateway:
    def __init__(self): self.calls=[]; self.response=None
    def request(self, endpoint, payload, role):
        self.calls.append(role)
        if self.response is not None: return self.response
        if role == 'jev_policy': return {'answers':{'readonly':{'type':'noul','noul':1}}}
        return {'id':'real-shaped','answers':{k:{'type':'choice','choice':v,'confidence':.99,'probabilities':{v:1}} for k,v in
            [('operation','CLICK'),('target','e1'),('input_key','none')]} | {'readonly':{'type':'noul','noul':1}},'usage':{'cost':.0001}}
    async def chat(self,prompt,role,model=None):
        self.calls.append(role)
        return {'operation':'WAIT','target_id':'none','text':'Generated copy'}


class Contracts(unittest.TestCase):
    def test_schema_and_verifier_required(self):
        self.assertEqual(br.BrowserFlow.from_dict(asdict(flow())).flow_id,'a')
        for changes in [{'stop_conditions':[]},{'action_budget':True},{'retry_budget':-1},
                        {'time_budget':float('nan')},{'verification_recipe':{'kind':'dom','checks':[]}},
                        {'starting_route':'https://evil.com/'},{'inputs':{'q':42}}]:
            with self.subTest(changes=changes), self.assertRaises((ValueError,TypeError)):
                br.BrowserFlow.from_dict(asdict(flow()) | changes)

    def test_domain_boundary_and_credentials(self):
        for url in ['file:///etc/passwd','https://example.com.evil.com/','https://a@example.com/',
                    'http://127.0.0.1/','http://localhost/']:
            self.assertFalse(br.allowed_url(url,('example.com','localhost','127.0.0.1')))
        self.assertTrue(br.allowed_url('http://127.0.0.1/',('127.0.0.1',),local=True))

    def test_dependency_validation(self):
        compiler=br.BrowserFlowCompiler()
        for rows in [[asdict(flow()),asdict(flow())], [asdict(flow(dependencies=('absent',)))],
                     [asdict(flow(dependencies=('b',))),asdict(flow(flow_id='b',dependencies=('a',)))]]:
            with self.assertRaises(ValueError): compiler.compile(rows,'m')

    def test_stale_observation_and_steering_revision(self):
        for d in [decision(observation_id='old'),decision(revision=1)]:
            with self.assertRaisesRegex(ValueError,'stale'): br.validate_decision(d,observation(),flow())

    def test_flow_forbidden_operation_cannot_be_overridden(self):
        for policy in (True,False):
            with self.assertRaisesRegex(ValueError,'forbidden_operation'):
                br.validate_decision(decision(),observation(),flow(forbidden_actions=('CLICK',)),policy=policy)

    def test_invented_target_rejected(self):
        with self.assertRaisesRegex(ValueError,'invented'): br.validate_decision(decision(target_id='e999'),observation(),flow())

    def test_operation_and_target_consistency(self):
        for d in [decision(operation='SEND'),decision(operation='STOP_CANDIDATE'),decision(target_id='none'),decision(confidence=float('nan'))]:
            with self.assertRaises(ValueError): br.validate_decision(d,observation(),flow())

    def test_policy_is_independent_of_confidence(self):
        for d,o in [(decision(readonly_probability=.98),observation(candidates=({'id':'e1','name':'Search','role':'button','visible':True},))),
                    (decision(),observation(candidates=({'id':'e1','name':'Pay now','visible':True},))),
                    (decision(),observation(candidates=({'id':'e1','name':'Search','visible':False},)))]:
            with self.assertRaisesRegex(ValueError,'policy'): br.validate_decision(d,o,flow())

    def test_navigation_link_guard_does_not_relax_button_or_dangerous_href(self):
        link = {'id':'e1','name':'Open pricing','role':'link','href':'/pricing','visible':True}
        br.validate_decision(decision(readonly_probability=.95),observation(candidates=(link,)),flow())
        for changes in [{'role':'button'},{'href':'https://evil.com/pricing'}, {'href':'/delete-account'}]:
            with self.assertRaises(ValueError):
                br.validate_decision(decision(readonly_probability=.95),observation(candidates=(link | changes,)),flow())

    def test_credential_and_unknown_input_blocked(self):
        with self.assertRaises(ValueError):
            br.validate_decision(decision(operation='INPUT',input_key='origin'),
                observation(candidates=({'id':'e1','name':'Email','visible':True,'type':'password'},)),flow())
        with self.assertRaisesRegex(ValueError,'trusted_text'):
            br.validate_decision(decision(operation='INPUT',input_key='invented'),observation(url='http://127.0.0.1/'),flow())


class AsyncContracts(unittest.IsolatedAsyncioTestCase):
    async def test_jev_single_pack_operation_and_target(self):
        gateway=Gateway();runtime=br.BrowserReflexRuntime(gateway)
        d=await runtime.decide(observation(),flow(),[])
        self.assertEqual((d.operation,d.target_id),('CLICK','e1'));self.assertEqual(gateway.calls,['jev'])
        pack=runtime.payload(observation(),flow(),[])
        self.assertEqual(set(pack['questions']),{'operation','target','input_key','readonly'})
        self.assertEqual(set(pack['questions']['target']['criteria']),{'none','e1'})

    async def test_malformed_jev_does_not_become_action(self):
        gateway=Gateway();gateway.response={'answers':{'operation':{'type':'choice','choice':'SEND'}}}
        with self.assertRaises(ValueError): await br.BrowserReflexRuntime(gateway).decide(observation(),flow(),[])

    async def test_literal_bypasses_generation(self):
        gateway=Gateway();source=br.TextSource(gateway)
        self.assertEqual(await source.resolve(decision(input_key='origin'),flow()),('YUL','deterministic'))
        self.assertEqual(gateway.calls,[])

    async def test_generation_only_when_explicit_and_configured(self):
        import os
        gateway=Gateway();source=br.TextSource(gateway)
        with self.assertRaises(ValueError): await source.resolve(decision(input_key='generate'),flow())
        with unittest.mock.patch.dict(os.environ,{'JARVIS_BROWSER_TEXT_MODEL':'test-small'}):
            self.assertEqual(await source.resolve(decision(input_key='generate'),flow(text_generation_policy='small_model')),('Generated copy','small_model'))
        self.assertEqual(gateway.calls,['text'])

    async def test_generation_selects_existing_small_fallback_without_frontier(self):
        import os
        from types import SimpleNamespace
        calls=[]
        class Model:
            online=SimpleNamespace(openrouter_model=lambda:'unavailable-mini',OPENROUTER_FALLBACKS=('configured-small',),OPENROUTER_PAID_FALLBACKS=('large-frontier',))
            async def chat(self,prompt,role,model):calls.append(model);return {'text':'Hello'}
        with unittest.mock.patch.dict(os.environ):
            os.environ.pop('JARVIS_BROWSER_TEXT_MODEL',None)
            result=await br.TextSource(Model()).resolve(decision(input_key='generate'),flow(text_generation_policy='small_model'))
        self.assertEqual(result,('Hello','small_model'));self.assertEqual(calls,['configured-small'])

    async def test_unavailable_mini_records_configured_fallback_truthfully(self):
        import os,urllib.error
        from types import SimpleNamespace
        calls=[]
        class Model:
            online=SimpleNamespace(openrouter_model=lambda:'configured-mini',OPENROUTER_PAID_FALLBACKS=('configured-frontier','configured-text-fallback'))
            async def chat(self,prompt,role,model):
                calls.append(model)
                if model=='configured-mini':raise urllib.error.HTTPError('https://example.com',404,'missing',{},None)
                return {'text':'Hello'}
        with unittest.mock.patch.dict(os.environ):
            os.environ.pop('JARVIS_BROWSER_TEXT_MODEL',None)
            result=await br.TextSource(Model()).resolve(decision(input_key='generate'),flow(text_generation_policy='small_model'))
        self.assertEqual(result,('Hello','configured_text_fallback'))
        self.assertEqual(calls,['configured-mini','configured-text-fallback'])

    async def test_preflight_changed_dom_emits_zero_actions(self):
        driver=br.BrowserUseDriver(flow());driver.current=observation();calls=[]
        async def fresh():return observation(fingerprint='changed')
        async def dispatch(e):calls.append(e)
        driver.observe=fresh;driver.dispatch=dispatch
        with self.assertRaisesRegex(ValueError,'stale_observation'):await driver.execute(decision(),observation())
        self.assertEqual(calls,[])

    async def test_steering_after_preflight_emits_zero_actions(self):
        driver=br.BrowserUseDriver(flow());driver.current=observation()
        async def fresh():return observation()
        driver.observe=fresh
        with self.assertRaisesRegex(ValueError,'steering_invalidated'):
            await driver.execute(decision(),observation(),still_current=lambda:False)

    async def test_empty_verifier_evidence_fails_closed(self):
        class Page:
            async def evaluate(self,*args):return json.dumps({'url':'https://example.com/','checks':[]})
        class Session:
            async def get_current_page(self):return Page()
        driver=br.BrowserUseDriver(flow(),session=Session())
        self.assertFalse((await br.BrowserVerifier().verify(driver,flow()))['verified'])

    async def test_verifier_uses_fresh_page_not_stop_judgment(self):
        class Page:
            async def evaluate(self,*args):
                return json.dumps({'url':'https://example.com/','checks':[{'exists':True,'visible':True,'text':'$19','value':None,'selector':'#price'}]})
        class Session:
            async def get_current_page(self):return Page()
        driver=br.BrowserUseDriver(flow(),session=Session())
        self.assertFalse((await br.BrowserVerifier().verify(driver,flow()))['verified'])


class FixtureDriver:
    active=0;peak=0;closed=0;actions=[]
    def __init__(self,f,local=False):self.flow=f;self.local=local;self.step=0;self.started=False
    async def start(self):
        self.started=True;type(self).active+=1;type(self).peak=max(type(self).peak,type(self).active);await asyncio.sleep(.01)
    async def observe(self):
        return observation(url='http://127.0.0.1/',observation_id=self.flow.flow_id+str(self.step),fingerprint=self.flow.flow_id+str(self.step))
    async def execute(self,d,o,**kw):
        if not kw['still_current']():raise ValueError('steering_invalidated')
        self.step+=1;type(self).actions.append(self.flow.flow_id);await asyncio.sleep(.01)
        return {'action_id':self.flow.flow_id+str(self.step),'operation':d.operation}
    async def close(self):
        if self.started:type(self).active-=1
        type(self).closed+=1


class Runner(unittest.IsolatedAsyncioTestCase):
    def runtime(self, operation='STOP_CANDIDATE', proof=True):
        class Verifier:
            async def verify(self,d,f):return {'verified':proof,'evidence':'independent fixture'}
        r=br.BrowserRuntime(Gateway(),driver_factory=FixtureDriver,verifier=Verifier())
        async def decide(o,f,h):
            return decision(observation_id=o.observation_id,operation=operation,target_id='none' if operation=='STOP_CANDIDATE' else 'e1')
        r.reflex.decide=decide
        return r

    async def test_false_stop_never_success(self):
        result=await self.runtime(proof=False).run_flow(flow(retry_budget=1))
        self.assertFalse(result['verified']);self.assertEqual(result['terminal_reason'],'verifier_disagreement')

    async def test_budget_bounded_and_driver_closed(self):
        before=FixtureDriver.closed
        result=await self.runtime(operation='CLICK').run_flow(flow(action_budget=2))
        self.assertFalse(result['verified']);self.assertEqual(len(result['actions']),2)
        self.assertEqual(FixtureDriver.closed,before+1)

    async def test_last_allowed_action_can_still_be_independently_verified(self):
        r=self.runtime();operations=iter(('CLICK','STOP_CANDIDATE'))
        async def decide(o,f,h):
            op=next(operations)
            return decision(observation_id=o.observation_id,operation=op,target_id='e1' if op=='CLICK' else 'none')
        r.reflex.decide=decide
        result=await r.run_flow(flow(action_budget=1))
        self.assertTrue(result['verified'])
        self.assertEqual(result['action_attempts'],1)
        self.assertEqual(len(result['actions']),1)

    async def test_lost_receipt_still_consumes_action_budget(self):
        class LostReceipt(FixtureDriver):
            emissions=0
            async def execute(self,*a,**k):
                type(self).emissions+=1
                raise RuntimeError('receipt lost after emission')
        r=self.runtime(operation='CLICK');r.driver_factory=LostReceipt
        result=await r.run_flow(flow(action_budget=1,retry_budget=3))
        self.assertEqual(LostReceipt.emissions,1)
        self.assertEqual(result['action_attempts'],1)
        self.assertEqual(result['actions'],[])
        self.assertFalse(result['verified'])

    async def test_terminal_retry_reuses_unchanged_results(self):
        r=self.runtime();seen=[];control={}
        async def run(f,*args):
            seen.append(f.flow_id)
            return {'flow_id':f.flow_id,'verified':True,'status':'VERIFIED','revision':f.revision,'terminal_reason':'proven'}
        async def cancellation_aware_run(f,*args):
            row=await run(f,*args)
            if f.flow_id in control.get('cancel_flows',[]):row.update(status='CANCELLED',verified=False)
            return row
        r.run_flow=cancellation_aware_run
        await r.run([flow(),flow(flow_id='b')],control=lambda:control)
        await r.run([flow(),flow(flow_id='b')],control=lambda:control)
        self.assertEqual(seen,['a','b'])
        control['cancel_flows']=['a']
        await r.run([flow(),flow(flow_id='b')],control=lambda:control)
        self.assertEqual(seen,['a','b'])

    async def test_parallel_sessions_and_results_isolated(self):
        FixtureDriver.peak=0
        result=await self.runtime().run([flow(),flow(flow_id='b'),flow(flow_id='c')],concurrency=2)
        self.assertEqual(FixtureDriver.peak,2);self.assertTrue(all(r['verified'] for r in result))
        self.assertEqual(len({r['flow_id'] for r in result}),3)

    async def test_new_steering_during_cached_retry_refreshes_affected_flow(self):
        control={};seen=[]
        class Model(Gateway):
            async def chat(self,prompt,*args):
                payload=json.loads(prompt[prompt.index('{"flow": {',prompt.index('Do not broaden')):])
                return {'flow':payload['flow']}
        r=self.runtime();r.gateway=Model()
        async def run(f,*args):
            seen.append((f.flow_id,f.revision))
            if f.flow_id=='b' and f.revision==1:
                control['flow_updates']['a']={'revision':1,'constraints':'New a instruction'}
            return {'flow_id':f.flow_id,'verified':True,'status':'VERIFIED','revision':f.revision,'terminal_reason':'proven','actions':[]}
        r.run_flow=run
        await r.run([flow(),flow(flow_id='b')],control=lambda:control)
        control['flow_updates']={'b':{'revision':1,'constraints':'New b instruction'}}
        results=await r.run([flow(),flow(flow_id='b')],control=lambda:control)
        self.assertTrue(all(row['verified'] for row in results))
        self.assertEqual({row['flow_id']:row['revision'] for row in results},{'a':1,'b':1})
        self.assertEqual(seen.count(('a',1)),1)

    async def test_cancel_before_start_emits_no_startup_side_effect(self):
        class Driver(FixtureDriver):
            starts=0
            async def start(self):type(self).starts+=1
            async def close(self):pass
        r=self.runtime();r.driver_factory=Driver
        result=await r.run_flow(flow(),control=lambda:{'cancel':True})
        self.assertEqual(Driver.starts,0);self.assertFalse(result['verified'])

    async def test_low_confidence_routes_to_frontier_before_policy(self):
        r=self.runtime(operation='CLICK')
        async def decide(o,f,h):return decision(observation_id=o.observation_id,confidence=.5,readonly_probability=.98)
        r.reflex.decide=decide
        result=await r.run_flow(flow(action_budget=1))
        self.assertIn('escalation',r.gateway.calls);self.assertFalse(result['verified'])

    async def test_slow_observation_and_decision_cannot_dispatch_after_deadline(self):
        class SlowDriver(FixtureDriver):
            emissions=0
            async def observe(self):
                await asyncio.sleep(.55)
                return await super().observe()
            async def execute(self,*a,**k):
                type(self).emissions+=1
                return await super().execute(*a,**k)
        r=self.runtime(operation='CLICK');r.driver_factory=SlowDriver
        original=r.reflex.decide
        async def slow_decision(*args):
            await asyncio.sleep(.55)
            return await original(*args)
        r.reflex.decide=slow_decision
        result=await r.run_flow(flow(time_budget=1))
        self.assertEqual(SlowDriver.emissions,0)
        self.assertFalse(result['verified'])
        self.assertEqual(result['terminal_reason'],'time_budget')

    async def test_cancel_before_decision(self):
        result=await self.runtime().run_flow(flow(),control=lambda:{'cancel':True})
        self.assertEqual(result['status'],'CANCELLED');self.assertEqual(result['decisions'],[])

    async def test_amend_then_skip_does_not_invalidate_unaffected_result(self):
        control={'cancel_flows':['a'],'flow_updates':{'a':{'revision':1,'constraints':'Amended then skipped'}}}
        r=self.runtime()
        results=await r.run([flow(),flow(flow_id='b')],control=lambda:control)
        self.assertEqual(results[0]['status'],'CANCELLED')
        self.assertTrue(results[1]['verified'])
        self.assertNotEqual(results[1]['terminal_reason'],'steering_revision_budget')
        self.assertNotIn('replanning',r.gateway.calls)

    async def test_skip_preserves_other_flow(self):
        result=await self.runtime().run([flow(),flow(flow_id='b')],control=lambda:{'cancel_flows':['a']})
        self.assertFalse(result[0]['verified']);self.assertTrue(result[1]['verified'])

    async def test_no_progress_cannot_loop_forever(self):
        r=self.runtime(operation='CLICK')
        class Stuck(FixtureDriver):
            async def observe(self):return observation(url='http://127.0.0.1/',observation_id=str(self.step))
        r.driver_factory=Stuck
        result=await r.run_flow(flow())
        self.assertEqual(result['status'],'ESCALATED');self.assertLess(len(result['actions']),flow().action_budget)
        self.assertIn('escalation',r.gateway.calls)

    async def test_failed_verification_is_supplied_to_frontier_recovery(self):
        r=self.runtime();steps=iter(['STOP_CANDIDATE','CLICK','STOP_CANDIDATE']);proofs=iter([False,True]);feedback=[]
        async def decide(o,f,h):
            op=next(steps)
            return decision(observation_id=o.observation_id,operation=op,target_id='e1' if op=='CLICK' else 'none',confidence=.1 if op=='CLICK' else .99)
        async def verify(d,f):return {'verified':next(proofs),'evidence':{'actual':'wrong state'}}
        async def recover(o,f,reason,verification_feedback=None):
            feedback.append(verification_feedback)
            return decision(observation_id=o.observation_id)
        r.reflex.decide=decide;r.verifier.verify=verify;r.frontier_decision=recover
        result=await r.run_flow(flow())
        self.assertTrue(result['verified']);self.assertEqual(len(result['actions']),1)
        self.assertEqual(feedback,[{'verified':False,'evidence':{'actual':'wrong state'}}])

    async def test_failed_dependency_does_not_start(self):
        before=FixtureDriver.closed
        result=await self.runtime(proof=False).run([flow(retry_budget=0),flow(flow_id='b',dependencies=('a',))])
        self.assertEqual(result[1]['terminal_reason'],'dependency_not_verified');self.assertEqual(FixtureDriver.closed,before+1)


class PersistentRevisionBudgets(unittest.IsolatedAsyncioTestCase):
    def model(self):
        class Model(Gateway):
            repairs=0
            async def chat(self,prompt,*args):
                if prompt.startswith('Repair only'):
                    self.repairs+=1
                    payload=json.loads(prompt[prompt.index('{"original_user_objective"'):])
                else:
                    payload=json.loads(prompt[prompt.index('{"flow": {',prompt.index('Do not broaden')):])
                return {'flow':payload['flow']}
        return Model()

    async def test_skipping_completed_flow_preserves_verified_evidence(self):
        control={};calls=[];r=br.BrowserRuntime(self.model())
        async def run(f,*args):
            calls.append(f.flow_id)
            return {'flow_id':f.flow_id,'verified':True,'status':'VERIFIED','terminal_reason':'proven','actions':[{'action_id':'one'}],
                'action_attempts':1,'retries':0,'evidence':{'verified':True,'proof':'independent recorded state'}}
        r.run_flow=run
        first=(await r.run([flow(action_budget=1)],control=lambda:control))[0]
        control['cancel_flows']=['a']
        second=(await r.run([flow(action_budget=1)],control=lambda:control))[0]
        self.assertTrue(second['verified']);self.assertTrue(second['excluded_by_operator'])
        self.assertEqual(second['evidence'],first['evidence'])
        self.assertEqual(second['actions'],first['actions'])
        self.assertEqual(calls,['a'])

    async def test_amend_then_skip_completed_flow_preserves_prior_proof(self):
        control={};calls=[];r=br.BrowserRuntime(self.model())
        async def run(f,*args):
            calls.append(f.flow_id)
            return {'flow_id':f.flow_id,'verified':True,'status':'VERIFIED','terminal_reason':'proven','actions':[],
                'retries':0,'evidence':{'revision':f.revision,'proof':'recorded'}}
        r.run_flow=run
        first=await r.run([flow(),flow(flow_id='b')],control=lambda:control)
        control.update(cancel_flows=['a'],flow_updates={'a':{'revision':1,'constraints':'Amended then skipped'}})
        second=await r.run([flow(),flow(flow_id='b')],control=lambda:control)
        self.assertTrue(second[0]['excluded_by_operator'])
        self.assertEqual(second[0]['evidence'],first[0]['evidence'])
        self.assertTrue(second[1]['verified']);self.assertEqual(calls,['a','b'])

    async def test_dependency_refresh_cannot_renew_exhausted_action_budget(self):
        control={};seen=[];r=br.BrowserRuntime(self.model())
        async def run(f,*args):
            seen.append((f.flow_id,f.revision))
            return {'flow_id':f.flow_id,'verified':True,'status':'VERIFIED','terminal_reason':'proven','actions':[{'action_id':str(len(seen))}],'action_attempts':1,'retries':0}
        r.run_flow=run
        flows=[flow(),flow(flow_id='b',dependencies=('a',),action_budget=1)]
        await r.run(flows,control=lambda:control)
        control['flow_updates']={'a':{'revision':1,'constraints':'New upstream result'}}
        results=await r.run(flows,control=lambda:control)
        downstream=next(row for row in results if row['flow_id']=='b')
        self.assertFalse(downstream['verified'])
        self.assertEqual(downstream['terminal_reason'],'revision_budget_exhausted')
        self.assertEqual(seen.count(('b',0)),1)
        self.assertEqual(downstream['revision_budget']['used_actions'],1)

    async def test_skip_after_budget_exhaustion_settles_without_dispatch(self):
        control={};seen=[];r=br.BrowserRuntime(self.model())
        async def run(f,*args):
            seen.append(f.flow_id)
            return {'flow_id':f.flow_id,'verified':False,'status':'FAILED','terminal_reason':'budget_exhausted',
                'actions':[{'action_id':'one'}],'action_attempts':1,'retries':0}
        r.run_flow=run
        await r.run([flow(action_budget=1)],control=lambda:control)
        control['cancel_flows']=['a']
        results=await r.run([flow(action_budget=1)],control=lambda:control)
        self.assertEqual(results[0]['status'],'CANCELLED')
        self.assertEqual(results[0]['terminal_reason'],'user_steering')
        self.assertEqual(seen,['a'])
        self.assertEqual(results[0]['action_attempts'],0)

    async def test_dependency_refresh_does_not_grant_second_autonomous_replan(self):
        control={};calls={};model=self.model();r=br.BrowserRuntime(model,mission_objective='Read price')
        async def run(f,*args):
            calls[f.flow_id]=calls.get(f.flow_id,0)+1
            failure=f.flow_id=='b' and calls['b'] in (1,3)
            return {'flow_id':f.flow_id,'verified':not failure,'status':'FAILED' if failure else 'VERIFIED',
                'terminal_reason':'verification_replan_required' if failure else 'proven',
                'actions':[],'action_attempts':0,'retries':1 if failure else 0}
        r.run_flow=run
        flows=[flow(),flow(flow_id='b',dependencies=('a',),retry_budget=6)]
        await r.run(flows,control=lambda:control)
        self.assertEqual(model.repairs,1)
        control['flow_updates']={'a':{'revision':1,'constraints':'New upstream result'}}
        results=await r.run(flows,control=lambda:control)
        downstream=next(row for row in results if row['flow_id']=='b')
        self.assertFalse(downstream['verified']);self.assertEqual(calls['b'],3)
        self.assertEqual(model.repairs,1)
        self.assertEqual(downstream['revision_budget']['autonomous_replans_used'],1)

    async def test_dependency_refresh_cannot_renew_expired_time_budget(self):
        from types import SimpleNamespace
        control={};seen=[];clock=[0];r=br.BrowserRuntime(self.model())
        async def run(f,*args):
            seen.append(f.flow_id)
            return {'flow_id':f.flow_id,'verified':True,'status':'VERIFIED','terminal_reason':'proven','actions':[]}
        r.run_flow=run
        flows=[flow(),flow(flow_id='b',dependencies=('a',),time_budget=1)]
        with unittest.mock.patch.object(br,'time',SimpleNamespace(monotonic=lambda:clock[0],time=lambda:clock[0])):
            await r.run(flows,control=lambda:control)
            clock[0]=2
            control['flow_updates']={'a':{'revision':1,'constraints':'New upstream result'}}
            results=await r.run(flows,control=lambda:control)
        self.assertEqual(seen.count('b'),1)
        self.assertEqual(results[1]['terminal_reason'],'revision_budget_exhausted')


class PlannerInputs(unittest.IsolatedAsyncioTestCase):
    async def test_missing_known_search_input_requires_plan_repair(self):
        base=flow(inputs={},verification_recipe={'kind':'dom','checks':[{'selector':'#q','value_equals':'Boston Bruins'}]})
        class Model(Gateway):
            async def chat(self,prompt,role,*args):
                self.calls.append(role)
                return {'flows':[asdict(base)|({'inputs':{'query':'Boston Bruins'}} if role=='planner_repair' else {})]}
        gateway=Model()
        planned=await br.BrowserPlanner(gateway).plan('Search Boston Bruins','m',domains=('example.com',))
        self.assertEqual(gateway.calls,['planner','planner_repair'])
        self.assertEqual(planned[0].inputs,{'query':'Boston Bruins'})


class FrontierAvailability(unittest.IsolatedAsyncioTestCase):
    async def test_planner_timeout_uses_one_existing_frontier_fallback(self):
        from types import SimpleNamespace
        gateway=object.__new__(br.ModelGateway);gateway.calls=[]
        gateway.online=SimpleNamespace(OPENROUTER_PAID_FALLBACKS=('primary','existing-fallback'))
        models=[]
        def request(endpoint,payload,role):
            call={'role':role};models.append(payload['model']);gateway.calls.append(call)
            if payload['model']=='primary':raise TimeoutError('model_request_wall')
            return {'choices':[{'message':{'content':'{"flows":[]}'}}], '_jarvis_call':call}
        gateway.request=request
        with unittest.mock.patch.dict(br.os.environ,{},clear=True):
            result=await gateway.chat('Plan flows','planner')
        self.assertEqual(models,['primary','existing-fallback'])
        self.assertEqual(result,{'flows':[]})
        self.assertEqual(gateway.calls[-1]['configured_frontier_fallback']['to'],'existing-fallback')

    async def test_explicit_model_does_not_silently_change_on_timeout(self):
        from types import SimpleNamespace
        gateway=object.__new__(br.ModelGateway);gateway.calls=[]
        gateway.online=SimpleNamespace(OPENROUTER_PAID_FALLBACKS=('primary','existing-fallback'))
        gateway.request=lambda *args:(_ for _ in ()).throw(TimeoutError('timeout'))
        with self.assertRaises(TimeoutError):await gateway.chat('Plan','planner',model='explicit')


class AutonomousReplan(unittest.IsolatedAsyncioTestCase):
    async def test_replan_preserves_success_predicates_and_remaining_budgets(self):
        base=flow(retry_budget=3,action_budget=4);seen=[]
        class Model(Gateway):
            async def chat(self,prompt,role,model=None):
                self.calls.append(role)
                return {'flow':asdict(replace(base,starting_route='https://example.com/pricing'))}
        runtime=br.BrowserRuntime(Model(),mission_objective='Read monthly price');
        async def run(f,*args):
            seen.append(f)
            return {'flow_id':f.flow_id,'verified':len(seen)==2,'status':'VERIFIED' if len(seen)==2 else 'FAILED','terminal_reason':'postcondition_proven' if len(seen)==2 else 'verification_replan_required','retries':0 if len(seen)==2 else 1,'actions':[{'action_id':str(len(seen))}]}
        runtime.run_flow=run
        result=(await runtime.run([base]))[0]
        self.assertTrue(result['verified']);self.assertEqual(len(seen),2)
        self.assertEqual(seen[1].verification_recipe,base.verification_recipe)
        self.assertEqual(seen[1].stop_conditions,base.stop_conditions)
        self.assertEqual(seen[1].action_budget,3);self.assertEqual(seen[1].retry_budget,1)
        self.assertLessEqual(seen[1].time_budget,base.time_budget)
        self.assertEqual([a['action_id'] for a in result['actions']],['1','2'])
        self.assertEqual(result['retries'],2)

    async def test_amended_authority_survives_autonomous_recovery(self):
        base=flow(retry_budget=3,action_budget=5);control={};seen=[]
        amended=replace(base,revision=1,constraints=('Operator added constraint',),inputs={'origin':'YYZ'},
            forbidden_actions=base.forbidden_actions+('CLICK',),text_generation_policy='small_model',expected_output='Annual price')
        class Model(Gateway):
            async def chat(self,prompt,role,model=None):
                # The autonomous proposal deliberately tries to restore obsolete authority.
                return {'flow':asdict(amended if len(seen)==1 else base)}
        runtime=br.BrowserRuntime(Model(),mission_objective='Read price')
        async def run(f,*args):
            seen.append(f)
            if len(seen)==1:
                control['flow_updates']={'a':{'revision':1,'constraints':'Annual price'}}
            return {'flow_id':'a','verified':len(seen)==3,'status':'VERIFIED' if len(seen)==3 else 'FAILED',
                'terminal_reason':'user_steering' if len(seen)==1 else 'verification_replan_required',
                'actions':[],'retries':1 if len(seen)==2 else 0}
        runtime.run_flow=run
        result=(await runtime.run([base],control=lambda:control))[0]
        self.assertTrue(result['verified']);self.assertEqual(len(seen),3)
        for field in ('constraints','inputs','forbidden_actions','text_generation_policy','expected_output'):
            self.assertEqual(getattr(seen[2],field),getattr(amended,field),field)

    async def test_failed_dispatches_leave_no_autonomous_action_budget(self):
        base=flow(action_budget=1,retry_budget=3);seen=[]
        runtime=br.BrowserRuntime(Gateway(),mission_objective='Read price')
        async def run(f,*args):
            seen.append(f)
            return {'flow_id':'a','verified':False,'status':'FAILED','terminal_reason':'verification_replan_required',
                'action_attempts':1,'actions':[],'retries':1}
        runtime.run_flow=run
        result=(await runtime.run([base]))[0]
        self.assertFalse(result['verified']);self.assertEqual(len(seen),1)
        self.assertEqual(runtime.gateway.calls,[])

    async def test_second_operator_amendment_uses_current_authority(self):
        base=flow();control={};prompts=[];seen=[]
        class Model(Gateway):
            async def chat(self,prompt,*args):
                payload=json.loads(prompt[prompt.index('{"flow": {',prompt.index('Do not broaden')):]);row=payload['flow'];prompts.append(row)
                if len(prompts)==1:
                    row['inputs']={'origin':'YYZ'};row['forbidden_actions'].append('CLICK');row['constraints']=['Operator prohibits CLICK']
                row['expected_output']='Annual price' if len(prompts)==2 else 'Monthly price'
                return {'flow':row}
        runtime=br.BrowserRuntime(Model())
        async def run(f,*args):
            seen.append(f)
            return {'flow_id':'a','verified':True,'status':'VERIFIED','revision':f.revision,'terminal_reason':'proven','actions':[]}
        runtime.run_flow=run
        control['flow_updates']={'a':{'revision':1,'constraints':'Origin YYZ; prohibit CLICK'}}
        await runtime.run([base],control=lambda:control)
        control['flow_updates']['a']={'revision':2,'constraints':'Also annual price'}
        await runtime.run([base],control=lambda:control)
        self.assertEqual(prompts[1]['revision'],1)
        self.assertEqual(prompts[1]['inputs'],{'origin':'YYZ'})
        self.assertIn('CLICK',seen[-1].forbidden_actions)
        self.assertEqual(seen[-1].constraints,('Operator prohibits CLICK',))

    async def test_replan_cannot_weaken_recipe_or_escape_domain(self):
        base=flow(retry_budget=3)
        for changes in [{'verification_recipe':{'kind':'dom','checks':[{'selector':'body','exists':True}]}},{'starting_route':'https://evil.com/'}]:
            seen=[]
            class Model(Gateway):
                async def chat(self,*args):return {'flow':asdict(base)|changes}
            runtime=br.BrowserRuntime(Model(),mission_objective='Read monthly price')
            async def run(f,*args):
                seen.append(f);return {'flow_id':f.flow_id,'verified':False,'status':'FAILED','terminal_reason':'verification_replan_required','retries':1,'actions':[]}
            runtime.run_flow=run
            result=(await runtime.run([base]))[0]
            self.assertFalse(result['verified']);self.assertEqual(len(seen),1);self.assertIn('replan_error',result)

    async def test_replan_does_not_round_up_expired_remaining_time(self):
        from types import SimpleNamespace
        base=flow(time_budget=10,retry_budget=3);clock=[0];seen=[]
        class Model(Gateway):
            async def chat(self,*args):
                clock[0]=9.5
                return {'flow':asdict(base)}
        runtime=br.BrowserRuntime(Model(),mission_objective='Read price')
        async def run(f,*args):
            seen.append(f)
            return {'flow_id':'a','verified':False,'status':'FAILED','terminal_reason':'verification_replan_required','retries':1,'actions':[]}
        runtime.run_flow=run
        with unittest.mock.patch.object(br,'time',SimpleNamespace(monotonic=lambda:clock[0],time=lambda:clock[0])):
            result=(await runtime.run([base]))[0]
        self.assertEqual(len(seen),1)
        self.assertEqual(result['replan_error'],'replan_time_budget')

    async def test_cancellation_during_replan_prevents_second_browser_start(self):
        base=flow(retry_budget=3);control={}
        class Model(Gateway):
            async def chat(self,*args):control['cancel']=True;return {'flow':asdict(base)}
        class Verifier:
            async def verify(self,*args):return {'verified':False}
        class Driver(FixtureDriver):
            starts=0
            async def start(self):type(self).starts+=1;await super().start()
        runtime=br.BrowserRuntime(Model(),mission_objective='Read monthly price',driver_factory=Driver,verifier=Verifier())
        async def stop(o,f,h):return decision(observation_id=o.observation_id,operation='STOP_CANDIDATE',target_id='none')
        runtime.reflex.decide=stop
        result=(await runtime.run([base],control=lambda:control))[0]
        self.assertFalse(result['verified']);self.assertEqual(result['status'],'CANCELLED');self.assertEqual(Driver.starts,1)


class FixtureMissionRuntime:
    """Independent receipt fixture for delivery/steering ownership tests."""
    def __init__(self,*args,**kwargs):
        self.verification_receipts={};self.authoritative_flows={}
    def verified_result(self, task_id, flows, revision=0):
        spec=replace(next(f for f in flows if f.flow_id==task_id),revision=revision)
        proof={'verified':True,'verifier_id':'fixture-'+task_id+'-'+str(revision),
               'evidence':{'checks':[{'selector':'#price','text':'$20'}]}}
        self.authoritative_flows[task_id]=spec
        self.verification_receipts[(spec.mission_id,task_id,revision)]=br.mission_contract().verification_receipt(spec,proof)
        return {'flow_id':task_id,'revision':revision,'status':'VERIFIED','verified':True,
                'terminal_reason':'postcondition_proven','evidence':proof}


class MissionTerminalFence(unittest.IsolatedAsyncioTestCase):
    def root(self, tmp):
        root=Path(tmp)/'browser-missions'/('a'*32);root.mkdir(parents=True)
        br.write_json(root/'request.json', {'mission_id':'a'*32,'objective':'Read price','flows':[asdict(flow())]})
        br.write_json(root/'state.json', {'mission_id':'a'*32,'flows':[]})
        br.write_json(root/'control.json', {'revision':0,'cancel':False,'cancel_flows':[]})
        return root

    async def test_cancel_during_synthesis_cannot_commit_verified_answer(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            root=self.root(tmp)
            class Runtime(FixtureMissionRuntime):
                async def run(self,*a,**k):return [self.verified_result('a',a[0])]
            class Model:
                calls=[]
                async def chat(self,*a,**k):
                    br.BrowserMissionHandle(Path(tmp)).steer('a'*32,cancel=True)
                    return {'spoken':'Old verified answer'}
            with unittest.mock.patch.object(br,'BrowserRuntime',Runtime), unittest.mock.patch.object(br,'ModelGateway',Model):
                out=await br.execute_mission(root)
            self.assertFalse(out['verified']);self.assertEqual(out['status'],'CANCELLED')
            self.assertNotEqual(out['spoken'],'Old verified answer')
            with self.assertRaisesRegex(ValueError,'mission_already_complete'):
                br.BrowserMissionHandle(Path(tmp)).steer('a'*32,constraints='Use annual price')

    async def test_amend_during_synthesis_reexecutes_before_terminal(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            root=self.root(tmp);calls=[]
            class Runtime(FixtureMissionRuntime):
                async def run(self,*a,**k):
                    rev=k['control']().get('revision',0);calls.append(rev)
                    return [self.verified_result('a',a[0],rev)]
            class Model:
                calls=[]
                async def chat(self,*a,**k):
                    if calls==[0]:br.BrowserMissionHandle(Path(tmp)).steer('a'*32,constraints='Use annual price')
                    return {'spoken':'Answer revision '+str(calls[-1])}
            with unittest.mock.patch.object(br,'BrowserRuntime',Runtime), unittest.mock.patch.object(br,'ModelGateway',Model):
                out=await br.execute_mission(root)
                replay=await br.execute_mission(root)
            self.assertEqual(calls,[0,1]);self.assertEqual(out['spoken'],'Answer revision 1')
            self.assertEqual(replay['terminal_commit_id'],out['terminal_commit_id'])

    async def test_steering_handled_during_run_does_not_rerun_for_synthesis(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            root=self.root(tmp);runs=[]
            class Runtime(FixtureMissionRuntime):
                async def run(self,*a,**k):
                    runs.append(1)
                    br.BrowserMissionHandle(Path(tmp)).steer('a'*32,constraints='Annual price')
                    return [self.verified_result('a',a[0],1)]
            class Model:
                calls=[]
                async def chat(self,*a,**k):return {'spoken':'Annual price verified'}
            with unittest.mock.patch.object(br,'BrowserRuntime',Runtime),unittest.mock.patch.object(br,'ModelGateway',Model):
                result=await br.execute_mission(root)
            self.assertTrue(result['verified']);self.assertEqual(len(runs),1)

    async def test_selective_skip_completes_only_remaining_required_results(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            root=self.root(tmp);request=br.read_json(root/'request.json');request['flows'].append(asdict(flow(flow_id='b')));br.write_json(root/'request.json',request)
            br.write_json(root/'control.json',{'cancel':False,'cancel_flows':['a']})
            prompts=[]
            class Runtime(FixtureMissionRuntime):
                async def run(self,*a,**k):return [
                    {'flow_id':'a','status':'CANCELLED','verified':False,'terminal_reason':'user_steering'},
                    self.verified_result('b',a[0])]
            class Model:
                calls=[]
                async def chat(self,prompt,*a,**k):prompts.append(prompt);return {'spoken':'Remaining result verified; a skipped as requested.'}
            with unittest.mock.patch.object(br,'BrowserRuntime',Runtime),unittest.mock.patch.object(br,'ModelGateway',Model):
                out=await br.execute_mission(root)
            self.assertTrue(out['verified']);self.assertEqual(out['status'],'VERIFIED')
            self.assertEqual(out['required_flow_ids'],['b']);self.assertEqual(out['skipped_flow_ids'],['a'])
            payload=json.loads(prompts[0][prompts[0].index('{"objective"'):])
            self.assertEqual(payload['failures'],[])
            self.assertEqual([row['flow_id'] for row in payload['verified_results']],['b'])

    async def test_skipping_all_flows_never_creates_verified_empty_success(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            root=self.root(tmp);br.write_json(root/'control.json',{'cancel':False,'cancel_flows':['a']})
            class Runtime(FixtureMissionRuntime):
                async def run(self,*a,**k):return [{'flow_id':'a','status':'CANCELLED','verified':False,'terminal_reason':'user_steering'}]
            class Model:
                calls=[]
                async def chat(self,*a,**k):raise AssertionError('All skipped work requires no model synthesis')
            with unittest.mock.patch.object(br,'BrowserRuntime',Runtime),unittest.mock.patch.object(br,'ModelGateway',Model):out=await br.execute_mission(root)
            self.assertFalse(out['verified']);self.assertEqual(out['status'],'CANCELLED')
            self.assertEqual(out['terminal_reason'],'all_flows_skipped')

    async def test_existing_worker_lock_prevents_duplicate_execution(self):
        import tempfile,fcntl
        with tempfile.TemporaryDirectory() as tmp:
            root=self.root(tmp)
            with (root/'worker.lock').open('a') as lock:
                fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
                with unittest.mock.patch.object(br,'ModelGateway') as gateway:
                    out=await br.execute_mission(root)
                self.assertEqual(out['status'],'ALREADY_RUNNING');gateway.assert_not_called()

class ExtendedVerification(unittest.IsolatedAsyncioTestCase):
    async def test_artifact_requires_session_tracked_file_and_exact_hash(self):
        import tempfile, hashlib
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'report.csv';path.write_text('plan,price\nMonthly,20\n')
            driver=SimpleNamespace(session=SimpleNamespace(browser_profile=SimpleNamespace(downloads_path=tmp),downloaded_files=[]))
            f=flow(verification_recipe={'kind':'artifact','files':[{'filename':'report.csv','sha256':hashlib.sha256(path.read_bytes()).hexdigest()}]})
            verifier=br.BrowserVerifier()
            self.assertFalse((await verifier.verify(driver,f))['verified'])
            driver.session.downloaded_files=[str(path)]
            self.assertTrue((await verifier.verify(driver,f))['verified'])
            driver.initial_downloads={str(path.absolute())}
            self.assertFalse((await verifier.verify(driver,f))['verified'])
            driver.initial_downloads=set()
            path.write_text('wrong price')
            self.assertEqual((await verifier.verify(driver,f))['reason'],'artifact_hash_mismatch')
            link=Path(tmp)/'linked.csv';link.symlink_to(path)
            driver.session.downloaded_files=[str(link)]
            f=replace(f,verification_recipe={'kind':'artifact','files':[{'filename':'linked.csv'}]})
            self.assertFalse((await verifier.verify(driver,f))['verified'])

    async def test_late_watchdog_discovery_cannot_verify_preexisting_download(self):
        import tempfile
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as tmp:
            old=Path(tmp)/'report.csv';old.write_text('price,20')
            session=SimpleNamespace(browser_profile=SimpleNamespace(downloads_path=tmp),downloaded_files=[])
            f=flow(verification_recipe={'kind':'artifact','files':[{'filename':'report.csv'}]})
            driver=br.BrowserUseDriver(f,session=session)
            driver.capture_download_baseline()
            session.downloaded_files.append(str(old))
            self.assertFalse((await br.BrowserVerifier().verify(driver,f))['verified'])

    async def test_recovery_drivers_use_distinct_artifact_directories(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            runtime=br.BrowserRuntime(Gateway(),artifact_root=tmp)
            first=runtime.driver_factory(flow());second=runtime.driver_factory(flow())
            self.assertNotEqual(first.artifact_dir,second.artifact_dir)
            self.assertEqual(first.artifact_dir.parent,second.artifact_dir.parent)

    async def test_download_abort_needs_new_tracked_expected_file(self):
        import tempfile
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'report.csv';path.write_text('price,20')
            f=flow(verification_recipe={'kind':'artifact','files':[{'filename':'report.csv'}]})
            class Driver(br.BrowserUseDriver):
                async def observe(self):return observation()
                async def dispatch(self,event):
                    self.session.downloaded_files.append(str(path))
                    raise RuntimeError('Navigation failed: net::ERR_ABORTED')
            session=SimpleNamespace(downloaded_files=[])
            driver=Driver(f,session=session);driver.current=observation()
            driver.events=SimpleNamespace(NavigateToUrlEvent=lambda **kw:kw)
            receipt=await driver.execute(decision(),observation())
            self.assertTrue(receipt['result']['download_navigation_aborted'])
            self.assertIsNone(driver.current)
            driver.current=observation()
            with unittest.mock.patch.object(br.asyncio,'sleep',new=unittest.mock.AsyncMock()):
                with self.assertRaisesRegex(RuntimeError,'ERR_ABORTED'):
                    await driver.execute(decision(),observation())

    def test_recipes_reject_unchecked_predicates_and_path_escape(self):
        for recipe in ({'kind':'artifact','files':[{'filename':'../report.csv'}]},
                       {'kind':'artifact','files':[{'filename':'a','sha256':'bad'}]},
                       {'kind':'artifact','files':[{'filename':'a','sha256':''}]},
                       {'kind':'provider','url':'https://example.com/api','checks':[{'path':'price','equals':20,'exists':False}]},
                       {'kind':'provider','url':'https://example.com/api','checks':[{'path':'price','greater_than':2}]},
                       {'kind':'dom','checks':[{'selector':'#price','text_contains':'20','unchecked':True}]}):
            with self.subTest(recipe=recipe),self.assertRaises(ValueError):br.validate_recipe(recipe)
        with self.assertRaises(ValueError):
            br.BrowserFlow.from_dict(asdict(flow(verification_recipe={'kind':'provider','url':'https://evil.com/api','checks':[{'path':'price','equals':20}]})))

    def test_tabs_require_correct_current_candidate_type(self):
        for op,role in [('OPEN_TAB','button'),('SWITCH_TAB','link')]:
            with self.assertRaises(ValueError):br.validate_decision(decision(operation=op),observation(candidates=({'id':'e1','name':'Pricing','role':role,'href':'/pricing','visible':True},)),flow())
        tab={'id':'t:live','name':'Overview','role':'tab','href':'https://example.com/','visible':True}
        br.validate_decision(decision(operation='SWITCH_TAB',target_id='t:live'),observation(candidates=(tab,)),flow())
        with self.assertRaisesRegex(ValueError,'element_target_required'):
            br.validate_decision(decision(operation='CLICK',target_id='t:live'),observation(candidates=(tab,)),flow())
        with self.assertRaisesRegex(ValueError,'browser_tab_target_required'):
            br.validate_decision(decision(operation='SWITCH_TAB',target_id='e1'),observation(candidates=(tab | {'id':'e1'},)),flow())
        with self.assertRaisesRegex(ValueError,'invented_target'):
            br.validate_decision(decision(operation='SWITCH_TAB',target_id='t:closed'),observation(candidates=(tab,)),flow())

    async def test_provider_redirect_resolves_and_pins_each_hop(self):
        from types import SimpleNamespace
        addresses={'example.com':'93.184.216.34','redirect.example.com':'127.0.0.1'}
        connects=[];requests=[]
        class Response:
            status=302
            def getheader(self,key):return 'https://redirect.example.com/api'
        class Connection:
            def __init__(self,host,port,timeout):self.host=host
            def request(self,*args,**kwargs):self.connect();requests.append((args,kwargs))
            def getresponse(self):return Response()
            def close(self):pass
        context=SimpleNamespace(wrap_socket=lambda sock,server_hostname:sock)
        def resolve(host,port,**kwargs):return [(2,1,6,'',(addresses[host],port))]
        def connect(address,**kwargs):connects.append(address);return SimpleNamespace(shutdown=lambda how:None)
        f=flow(allowed_domains=('example.com','redirect.example.com'),verification_recipe={'kind':'provider','url':'https://example.com/api','checks':[{'path':'price','equals':20}]})
        with unittest.mock.patch('socket.getaddrinfo',side_effect=resolve),unittest.mock.patch('socket.create_connection',side_effect=connect),unittest.mock.patch('ssl.create_default_context',return_value=context),unittest.mock.patch('http.client.HTTPConnection',Connection):
            out=await br.BrowserVerifier().verify(SimpleNamespace(local=False),f)
        self.assertFalse(out['verified']);self.assertEqual(connects,[('93.184.216.34',443)])
        self.assertEqual(requests[0][1]['headers'],{'Accept':'application/json'})
        Response.status=200
        for body,expected in [(b'{"ready":1}',True),(b'{"ready":{"flag":0}}',{'flag':False})]:
            Response.read=lambda self,n:body
            f=replace(f,verification_recipe={'kind':'provider','url':'https://example.com/api','checks':[{'path':'ready','equals':expected}]})
            with unittest.mock.patch('socket.getaddrinfo',side_effect=resolve),unittest.mock.patch('socket.create_connection',side_effect=connect),unittest.mock.patch('ssl.create_default_context',return_value=context),unittest.mock.patch('http.client.HTTPConnection',Connection):
                out=await br.BrowserVerifier().verify(SimpleNamespace(local=False),f)
            self.assertFalse(out['verified'])

    def test_explicit_prohibition_does_not_request_external_action(self):
        self.assertFalse(br.unsafe_mission_intent('Read pricing. Do not log in. Never purchase.'))
        self.assertTrue(br.unsafe_mission_intent('Do not log in. Buy the plan.'))
        self.assertTrue(br.unsafe_mission_intent('Log in and read pricing.'))

    async def test_provider_cancellation_closes_detached_response(self):
        import threading
        from types import SimpleNamespace
        reading=threading.Event();released=threading.Event();closed=[]
        class Response:
            status=200
            def read(self,n):reading.set();released.wait(3);return b'{"price":20}'
            def close(self):closed.append(True);released.set()
        class Connection:
            sock=None
            def __init__(self,*args,**kwargs):pass
            def request(self,*args,**kwargs):pass
            def getresponse(self):return Response()
            def close(self):pass
        f=flow(verification_recipe={'kind':'provider','url':'https://example.com/api','checks':[{'path':'price','equals':20}]})
        with unittest.mock.patch('socket.getaddrinfo',return_value=[(2,1,6,'',('93.184.216.34',443))]),unittest.mock.patch('http.client.HTTPConnection',Connection):
            task=asyncio.create_task(br.BrowserVerifier().verify(SimpleNamespace(local=False),f))
            self.assertTrue(await asyncio.to_thread(reading.wait,2))
            task.cancel()
            with self.assertRaises(asyncio.CancelledError):await task
        self.assertTrue(closed);self.assertTrue(released.is_set())

    def test_flow_success_is_not_decision_accuracy(self):
        label=br.outcome_label({'event':'flow.completed','result':{'verified':True,'status':'VERIFIED'}})
        self.assertEqual(label['label'],'flow_success');self.assertEqual(label['decision_quality'],'unknown')
        label=br.outcome_label({'event':'recovery.started','reason':'stale_observation'})
        self.assertEqual(label['decision_quality'],'stale_decision');self.assertIsNone(label['flow_outcome'])

    def test_url_encoding_equivalence_preserves_parameter_values(self):
        self.assertTrue(br.equivalent_url('https://example.com/?q=Boston+Bruins','https://example.com/?q=Boston%20Bruins'))
        self.assertFalse(br.equivalent_url('https://example.com/?q=Boston','https://example.com/?q=Other'))




class SynthesisEvidenceBoundary(unittest.IsolatedAsyncioTestCase):
    def test_only_verified_findings_enter_synthesis(self):
        row={'flow_id':'books','revision':1,'verified':True,'evidence':{'text':'Mystery'},'actions':[{'target':'irrelevant'}],'decisions':[{'untrusted_model_reason':'do something else'}],'prior_revisions':[{'evidence':'Travel'}]}
        self.assertEqual(br.synthesis_verified_result(row),{'flow_id':'books','revision':1,'evidence':{'text':'Mystery'}})
        with self.assertRaises(ValueError):br.synthesis_verified_result(row|{'verified':False})

    async def test_truncated_valid_json_cannot_be_accepted(self):
        gateway=object.__new__(br.ModelGateway);gateway.calls=[]
        from types import SimpleNamespace
        gateway.online=SimpleNamespace(OPENROUTER_PAID_FALLBACKS=('existing-frontier',))
        gateway.request=lambda *args:{'choices':[{'finish_reason':'length','message':{'content':'{"spoken":"Incomplete"}'}}]}
        with self.assertRaisesRegex(ValueError,'model_response_incomplete'):
            await gateway.chat('Summarize verified findings','synthesis')


class ProgressLedger(unittest.TestCase):
    def test_required_counts_exclude_skipped_and_stale_revisions(self):
        state={'status':'RUNNING','flows':[{'flow_id':fid} for fid in ('a','b','c')], 'progress':{'a':{'flow_id':'a','status':'VERIFIED','verified':True,'revision':0},'b':{'flow_id':'b','status':'VERIFIED','verified':True,'revision':0},'c':{'flow_id':'c','status':'CANCELLED','verified':False}}}
        line=br.browser_progress_line(state,{'cancel_flows':['c'],'flow_updates':{'b':{'revision':1}}})
        self.assertEqual(line,'1 of 2 required browser flows are verified; 1 have finished. The mission is running. 1 flow was skipped.')
    def test_terminal_failures_are_finished_not_verified(self):
        state={'status':'PARTIAL','flows':[{'flow_id':'a'},{'flow_id':'b'}], 'results':[{'flow_id':'a','status':'VERIFIED','verified':True},{'flow_id':'b','status':'FAILED','verified':False}]}
        self.assertIn('1 of 2 required browser flows are verified; 2 have finished',br.browser_progress_line(state,{}))
    def test_planning_and_all_skipped_do_not_claim_zero_required_success(self):
        self.assertEqual(br.browser_progress_line({'status':'PLANNING'},{}),'The browser mission is planning its workflows.')
        self.assertEqual(br.browser_progress_line({'status':'CANCELLED','flows':[{'flow_id':'a'}]},{'cancel_flows':['a']}),'All 1 browser flows were skipped.')


class ProgressRevisionMerge(unittest.TestCase):
    def test_fresh_progress_replaces_superseded_results(self):
        state={'status':'RUNNING','flows':[{'flow_id':'a'},{'flow_id':'b'}], 'results':[{'flow_id':'a','revision':0,'status':'VERIFIED','verified':True},{'flow_id':'b','revision':0,'status':'VERIFIED','verified':True}], 'progress':{'a':{'flow_id':'a','revision':1,'status':'VERIFIED','verified':True}}}
        self.assertIn('2 of 2 required browser flows are verified; 2 have finished',br.browser_progress_line(state,{'flow_updates':{'a':{'revision':1}}}))
        state['progress']['a'].update(status='RUNNING',verified=False)
        self.assertIn('1 of 2 required browser flows are verified; 1 have finished',br.browser_progress_line(state,{'flow_updates':{'a':{'revision':1}}}))
    def test_older_progress_cannot_overwrite_newer_results(self):
        state={'status':'VERIFIED','flows':[{'flow_id':'a'}], 'results':[{'flow_id':'a','revision':1,'status':'VERIFIED','verified':True}], 'progress':{'a':{'flow_id':'a','revision':0,'status':'RUNNING','verified':False}}}
        self.assertIn('1 of 1 required browser flows are verified; 1 have finished',br.browser_progress_line(state,{}))

if __name__ == '__main__':
    import unittest.mock
    unittest.main()


class MissionReceiptIntegration(unittest.IsolatedAsyncioTestCase):
    async def test_actor_claim_does_not_enter_success_state_or_verified_synthesis(self):
        import tempfile
        prompts=[]
        with tempfile.TemporaryDirectory() as tmp:
            root=MissionTerminalFence.root(self,tmp)
            class Runtime(FixtureMissionRuntime):
                async def run(self,*a,**k):
                    return [{'flow_id':'a','verified':True,'terminal_reason':'actor_says_done'}]
            class Model:
                calls=[]
                async def chat(self,prompt,*a,**k):prompts.append(prompt);return {'spoken':'Everything succeeded and is complete.'}
            with unittest.mock.patch.object(br,'BrowserRuntime',Runtime),unittest.mock.patch.object(br,'ModelGateway',Model):
                result=await br.execute_mission(root)
            self.assertFalse(result['verified']);self.assertEqual(result['status'],'PARTIAL')
            self.assertFalse(result['results'][0]['verified'])
            self.assertNotIn('Everything succeeded',result['spoken'])
            self.assertIn('couldn’t verify',result['spoken'])
            payload=json.loads(prompts[0][prompts[0].index('{"objective"'):])
            self.assertEqual(payload['verified_results'],[])
            self.assertEqual(payload['failures'][0]['reason'],'independent_verifier_receipt_missing')

    async def test_missing_planned_flow_blocks_terminal_success(self):
        import tempfile
        prompts=[]
        with tempfile.TemporaryDirectory() as tmp:
            root=MissionTerminalFence.root(self,tmp)
            request=br.read_json(root/'request.json');request['flows'].append(asdict(flow(flow_id='b')))
            br.write_json(root/'request.json',request)
            class Runtime(FixtureMissionRuntime):
                async def run(self,*a,**k):return [self.verified_result('a',a[0])]
            class Model:
                calls=[]
                async def chat(self,prompt,*a,**k):prompts.append(prompt);return {'spoken':'One result is verified; b is missing.'}
            with unittest.mock.patch.object(br,'BrowserRuntime',Runtime),unittest.mock.patch.object(br,'ModelGateway',Model):
                result=await br.execute_mission(root)
            self.assertFalse(result['verified']);self.assertEqual(result['required_flow_ids'],['a','b'])
            payload=json.loads(prompts[0][prompts[0].index('{"objective"'):])
            self.assertEqual(payload['failures'][0]['reason'],'required_worker_result_missing')
            self.assertEqual(payload['failures'][0]['flow_id'],'b')
