"""Summarize recorded browser evidence without treating final success as step accuracy."""
import argparse
import json
import math
import hashlib
import statistics
from pathlib import Path

def percentile(values, fraction):
    if not values:return None
    ordered=sorted(values);index=(len(ordered)-1)*fraction
    low=math.floor(index);high=math.ceil(index)
    return ordered[low]+(ordered[high]-ordered[low])*(index-low)

def summarize(document, labels=None):
    if 'runs' in document:
        runs=[summarize(run,labels) | {'mode':run.get('mode')} for run in document['runs']]
        by_mode={}
        for mode in sorted({r['mode'] for r in runs}):
            selected=[r for r in runs if r['mode']==mode]
            by_mode[mode]={'runs':len(selected),'mean_duration_seconds':statistics.mean(r['duration_seconds'] for r in selected),
                'mean_model_cost':statistics.mean(r['model_cost'] for r in selected),'verified_flows':sum(r['verified_flows'] for r in selected),
                'flows':sum(r['flows'] for r in selected),'actions':sum(r['actions'] for r in selected)}
        return {'source_hash':document.get('source_hash'),'runs':runs,'by_mode':by_mode,'setup_exclusions':document.get('shared_setup_excluded')}
    if isinstance(document.get('result'),dict):
        outer=document
        document=outer['result'] | {'source_hash':outer.get('source_hash')}
        if 'trace' not in document and 'trace' in outer:document['trace']=outer['trace']

    calls=document.get('calls',[]);trace=document.get('trace',[]);results=document.get('results',[])
    required=[row for row in results if row.get('excluded_by_operator') is not True]
    jev=[c for c in calls if c.get('role')=='jev']
    frontier=[c for c in calls if c.get('role') in ('planner','planner_repair','replan','replanning','escalation','frontier_baseline','synthesis')]
    latency=[c['latency'] for c in jev if isinstance(c.get('latency'),(int,float))]
    recoveries=[e for e in trace if e.get('event','').startswith('recovery.')]
    decisions=[e for e in trace if e.get('event')=='jev.decision']
    wrong_targets=[e for e in recoveries if 'invented_target' in str(e.get('reason',''))]
    stale=[e for e in recoveries if 'stale' in str(e.get('reason',''))]
    escalations=[e for e in trace if e.get('event')=='escalation']
    active=set();maximum=0
    for event in sorted(trace,key=lambda e:e.get('time',0)):
        if event.get('event')=='flow.started':active.add(event.get('flow_id'));maximum=max(maximum,len(active))
        elif event.get('event')=='flow.completed':active.discard(event.get('flow_id'))
    population=[]
    for event in decisions:
        decision=event.get('decision',{})
        label=(labels or {}).get((decision.get('observation_id'),decision.get('decision_id')))
        if label:
            if label['chosen_operation']!=decision.get('operation') or label['chosen_target']!=decision.get('target_id'):raise ValueError('label does not match recorded decision')
            population.append(label)
    operation=[r['operation_correct'] for r in population if type(r.get('operation_correct')) is bool]
    targets=[r['target_correct'] for r in population if type(r.get('target_correct')) is bool and r['chosen_target']!='none']
    step_events=[event for event in trace if event.get('event') in ('jev.decision','frontier.decision')]
    steps={(event.get('flow_id'),event.get('decision',{}).get('observation_id')) for event in step_events}
    frontier_steps={(event.get('flow_id'),event.get('decision',{}).get('observation_id')) for event in step_events
        if event.get('event')=='frontier.decision' or event.get('decision',{}).get('pack_version','').startswith('frontier')}
    retry_count=lambda row:row.get('revision_budget',{}).get('used_retries',row.get('retries'))
    first_pass_known=all(not r.get('verified') or retry_count(r) is not None for r in results)
    first_pass=sum(r.get('verified') is True and retry_count(r)==0 and not r.get('prior_attempts') and not r.get('prior_revisions') for r in results)
    recovery_flows=[r for r in results if (retry_count(r) or 0)>0 or r.get('prior_attempts')]
    identity_checks=[event.get('proof',{})['page_identity_verified'] for event in trace
        if event.get('event') in ('verification.pass','verification.fail') and type(event.get('proof',{}).get('page_identity_verified')) is bool]
    rescues=document.get('human_interventions')
    if rescues is None and results and all('human_interventions' in r for r in results):rescues=max(r['human_interventions'] for r in results)
    return {'source_hash':document.get('source_hash'),'flows':len(results),
        'verified_flows':sum(r.get('verified') is True for r in results),
        'required_flow_count':len(required),
        'skipped_flow_count':len(results)-len(required),
        'required_verified_flow_count':sum(r.get('verified') is True for r in required),
        'required_completion_rate':sum(r.get('verified') is True for r in required)/len(required) if required else None,
        'verified_completion_rate_scope':'All returned flows, including explicit operator skips; required_completion_rate reports current non-skipped scope.',
        'verified_completion_rate':sum(r.get('verified') is True for r in results)/len(results) if results else None,
        'first_pass_verified_flows':first_pass if first_pass_known else None,
        'first_pass_completion_rate':first_pass/len(results) if results and first_pass_known else None,
        'recovery_flow_count':len(recovery_flows),
        'recovery_success_rate':sum(r.get('verified') is True for r in recovery_flows)/len(recovery_flows) if recovery_flows else None,
        'actions':sum(len(r.get('actions',[])) for r in results),
        'action_attempts':sum(r['action_attempts'] for r in results) if results and all('action_attempts' in r for r in results) else None,
        'duration_seconds':document.get('duration'),
        'jev_calls':len(jev),'frontier_calls':len(frontier),'model_calls':len(calls),
        'model_cost':sum((c.get('usage') or {}).get('cost',0) or 0 for c in calls),
        'jev_latency_p50':percentile(latency,.5),'jev_latency_p95':percentile(latency,.95),
        'jev_cost':sum((c.get('usage') or {}).get('cost',0) or 0 for c in jev),
        'model_latency_sum':sum(c.get('latency',0) or 0 for c in calls),
        'invalid_target_rejections':len(wrong_targets),'stale_rejections':len(stale),
        'invalid_target_rate':len(wrong_targets)/len(step_events) if step_events else None,
        'invalid_target_rate_scope':'Rejected target proposals per recorded model decision; Jev and frontier proposals on the same observation count separately.',
        'frontier_step_calls':sum(c.get('role') in ('escalation','frontier_baseline') for c in calls),
        'decision_step_count':len(steps),
        'frontier_call_avoidance':(len(steps)-len(frontier_steps))/len(steps) if steps else None,
        'frontier_call_avoidance_scope':'Fraction of observed decision steps with no frontier decision; planner and synthesis excluded.',
        'wrong_page_verifications':len(identity_checks)-sum(identity_checks),
        'page_identity_check_count':len(identity_checks),
        'wrong_page_rate':(len(identity_checks)-sum(identity_checks))/len(identity_checks) if identity_checks else None,
        'wrong_page_rate_scope':'Independent URL/domain/path/query identity mismatches, not inferred from other failed DOM checks.',
        'escalations':len(escalations),'escalation_rate':len(escalations)/len(decisions) if decisions else None,
        'browser_restarts':sum(e.get('event')=='recovery.browser_restart' for e in recoveries),
        'no_progress_escalations':sum(e.get('reason')=='no_progress' for e in escalations),
        'max_concurrent_flows_observed':maximum if trace else None,
        'operation_accuracy':sum(operation)/len(operation) if operation else None,
        'target_accuracy':sum(targets)/len(targets) if targets else None,
        'wrong_target_rate':(len(targets)-sum(targets))/len(targets) if targets else None,
        'operation_label_count':len(operation),'element_target_label_count':len(targets),
        'decision_label_coverage':len(population)/len(decisions) if decisions else None,
        'accuracy_limitation':'Requires independently labeled operation and target judgments for each observed state. Flow success does not establish decision accuracy.',
        'human_rescues':rescues,
        'cost_complete':all('cost' in (c.get('usage') or {}) for c in calls) if calls else None,
        'user_steering_events':sum(e.get('event')=='mission.steering' for e in trace)}

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('evidence',nargs='+',type=Path)
    parser.add_argument('--labels',type=Path,help='Independent state-specific labels bound to the evidence SHA256')
    args=parser.parse_args();label_document=json.loads(args.labels.read_text()) if args.labels else None
    output={};bound=False
    for path in args.evidence:
        raw=path.read_bytes();labels=None
        if label_document and hashlib.sha256(raw).hexdigest()==label_document['sources']['benchmark_sha256']:
            bound=True;labels={(r['observation_id'],r['decision_id']):r for r in label_document['labels']}
        output[str(path)]=summarize(json.loads(raw),labels)
    if label_document and not bound:raise ValueError('Independent labels do not bind any supplied evidence file')
    print(json.dumps(output,indent=2))

if __name__=='__main__':main()
