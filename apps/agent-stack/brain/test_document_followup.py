import importlib.util
import json
import sys
from pathlib import Path

spec=importlib.util.spec_from_file_location('document_followup_pipeline',Path(__file__).with_name('pipeline.py'))
pipe=importlib.util.module_from_spec(spec);sys.modules[spec.name]=pipe;spec.loader.exec_module(pipe)

def test_selected_read_reaches_followup_model_in_real_pipeline(tmp_path):
    path=tmp_path/'Plan.md';path.write_text('Overview\nThe conclusion is to build the prototype before hiring.')
    hive=tmp_path/'hive'
    first=pipe.apply_pipeline(f'read "{path}"',hive=hive,gen=pipe.begin_turn(hive),retrieve_roots=[],talk_fn=lambda *a,**k: (_ for _ in ()).throw(AssertionError('read must use file hand')))
    bus=json.loads((hive/'bus/state.json').read_text())
    assert bus['document_context']['text'] == path.read_text()
    briefs=[]
    def model(utterance,brief,*args,**kwargs):
        briefs.append(brief)
        return {'ok':True,'wire':'openrouter','spoken':json.dumps({'tool':'converse','args':{},'speak':'Build the prototype before hiring, from Plan.md.'})}
    result=pipe.apply_pipeline('What is the conclusion?',hive=hive,gen=pipe.begin_turn(hive),retrieve_roots=[],talk_fn=model)
    assert briefs and 'build the prototype before hiring' in briefs[0]
    assert 'untrusted data' in briefs[0] and 'Plan.md' in briefs[0]
    assert 'prototype' in result['spoken']

def test_unrelated_question_does_not_inherit_selected_document(tmp_path):
    path=tmp_path/'Plan.md';path.write_text('Unique private document marker')
    hive=tmp_path/'hive'
    pipe.apply_pipeline(f'read "{path}"',hive=hive,gen=pipe.begin_turn(hive),retrieve_roots=[],talk_fn=lambda *a,**k: None)
    briefs=[]
    def model(utterance,brief,*a,**k):
        briefs.append(brief);return {'ok':True,'wire':'openrouter','spoken':json.dumps({'tool':'converse','speak':'An ordinary general answer.'})}
    pipe.apply_pipeline('Why is the sky blue?',hive=hive,gen=pipe.begin_turn(hive),retrieve_roots=[],talk_fn=model)
    assert briefs and 'Follow-up document context' not in briefs[0]

def test_changed_source_never_supplies_old_text(tmp_path):
    path=tmp_path/'Plan.md';path.write_text('Original selected text')
    hive=tmp_path/'hive'
    pipe.apply_pipeline(f'read "{path}"',hive=hive,gen=pipe.begin_turn(hive),retrieve_roots=[],talk_fn=lambda *a,**k: None)
    path.write_text('Different current source')
    briefs=[]
    def model(utterance,brief,*a,**k):
        briefs.append(brief);return {'ok':True,'wire':'openrouter','spoken':json.dumps({'tool':'converse','speak':'The source changed; please read it again.'})}
    pipe.apply_pipeline('Summarize it',hive=hive,gen=pipe.begin_turn(hive),retrieve_roots=[],talk_fn=model)
    assert briefs and 'source changed since it was read' in briefs[0]
    assert 'Follow-up document context' not in briefs[0]
