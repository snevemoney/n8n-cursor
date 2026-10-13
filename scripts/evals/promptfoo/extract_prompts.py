#!/usr/bin/env python3
"""Regenerate prompt files from their production source so the gate can't go false-green on a stale snapshot.
jarvis.json      <- SYS in apps/agent-stack/brain/online.py (string-literal constant, read via ast; not imported/executed)
n8n-support.json <- system message of apps/n8n-cursor/workflows/webhooks/support-agent-webhook.json (and the imported copy must match)
watchdog/researcher are desk prompts with no repo source: snapshots, checked by hand.
--check: exit 1 if a prompt file differs from its source (drift), without writing."""
import ast, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
def jarvis_sys():
    tree = ast.parse(open(os.path.join(ROOT, 'apps/agent-stack/brain/online.py'), encoding='utf-8').read())
    for n in tree.body:
        if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'SYS' for t in n.targets):
            return ast.literal_eval(n.value)
    sys.exit('SYS not found in online.py')
def n8n_sys(rel):
    def walk(o):
        if isinstance(o, dict):
            if o.get('role') == 'system' and isinstance(o.get('content'), str): yield o['content']
            for v in o.values(): yield from walk(v)
        elif isinstance(o, list):
            for v in o: yield from walk(v)
    found = list(walk(json.load(open(os.path.join(ROOT, rel), encoding='utf-8'))))
    if len(found) != 1: sys.exit(f'{rel}: expected 1 system message, found {len(found)}')
    return found[0]
def main():
    check = '--check' in sys.argv; drift = []
    a = n8n_sys('apps/n8n-cursor/workflows/webhooks/support-agent-webhook.json')
    if a != n8n_sys('apps/n8n-cursor/workflows/imported/support-agent-webhook_clean.json'): drift.append('n8n workflow copies differ')
    for name, src in (('jarvis', jarvis_sys()), ('n8n-support', a)):
        p = os.path.join(HERE, 'prompts', f'{name}.json'); msgs = json.load(open(p, encoding='utf-8'))
        if msgs[0]['content'] != src:
            drift.append(f'{name}.json differs from source')
            if not check: msgs[0]['content'] = src; json.dump(msgs, open(p, 'w', encoding='utf-8'), indent=1); print(f'refreshed {name}.json')
    if check and drift: print('DRIFT: ' + '; '.join(drift)); return 1
    if drift and any('copies differ' in d for d in drift): print('DRIFT: ' + drift[0]); return 1
    print('prompts match source'); return 0
if __name__ == '__main__': sys.exit(main())
