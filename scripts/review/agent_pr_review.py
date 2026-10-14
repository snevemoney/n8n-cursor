#!/usr/bin/env python3
"""Advisory agent PR review. Pulls `gh pr diff` + checks via the API (PR code is never executed), asks a cheap model
to review against the osmani-code-review-axes (correctness, tests, security, scope, wiring), writes REVIEW-<n>.md.
With --post it ALSO posts that file as a COMMENT review (never approve/request-changes). Without --post it is local only.
usage: agent_pr_review.py <pr-number> [--repo snevemoney/n8n-cursor] [--post]"""
import subprocess,sys,os,json
import urllib.request
class llm:
  @staticmethod
  def chat(m,tag,temperature=0,max_tokens=900,model='openai/gpt-4o-mini'):
    b=json.dumps({'model':model,'messages':m,'temperature':temperature,'max_tokens':max_tokens}).encode()
    r=urllib.request.Request('https://openrouter.ai/api/v1/chat/completions',b,{'Authorization':'Bearer '+os.environ['OPENROUTER_API_KEY'],'Content-Type':'application/json'})
    return json.load(urllib.request.urlopen(r,timeout=120))['choices'][0]['message']['content'].strip()
n=sys.argv[1]; repo=sys.argv[sys.argv.index('--repo')+1] if '--repo' in sys.argv else 'snevemoney/n8n-cursor'
def gh(*a,ok_codes=(0,)):
  r=subprocess.run(['gh',*a,'-R',repo],capture_output=True,text=True)
  # gh pr checks: 8 = pending, 1 = some check failed (but then it still prints the check table); 1 with no table = real error
  if r.returncode not in ok_codes or (r.returncode==1 and '\t' not in r.stdout):
    sys.exit(f"gh {a[0]} {a[1]} failed ({r.returncode}): {r.stderr.strip()[:500]}")
  return r.stdout
meta=json.loads(gh('pr','view',n,'--json','title,body,files,additions,deletions'))
LIMIT=24000; full=gh('pr','diff',n); truncated=len(full)>LIMIT; diff=full[:LIMIT]
if truncated: diff+=f"\n\n[DIFF TRUNCATED: showed {LIMIT} of {len(full)} chars; review is INCOMPLETE — say so in the verdict]"
checks=gh('pr','checks',n,ok_codes=(0,1,8))  # gh exits 1/8 when checks fail/pending
fails=[l.split('\t')[0] for l in checks.splitlines() if '\tfail\t' in l]
sysm=("You are a strict code reviewer. Review ONLY the diff. Axes: correctness, tests present/updated, security (secrets, injection, auth), "
      "scope (does it do one thing), wiring (is new code actually called). Output markdown: Verdict: APPROVE|REQUEST_CHANGES|COMMENT, then up to 8 findings "
      "as '- [axis] file:line — issue — fix'. Never invent files or lines not in the diff. If diff truncated, say so.")
rev=llm.chat([{'role':'system','content':sysm},{'role':'user','content':f"PR #{n}: {meta['title']}\n+{meta['additions']}/-{meta['deletions']} in {len(meta['files'])} files\nFailing checks: {fails or 'none'}\n\n{diff}"}],tag='g11-pr-review',temperature=0,max_tokens=900)
out=f'REVIEW-{n}.md'
import re
if truncated: rev=re.sub(r'(?im)^(\W*verdict\W*)\s*(APPROVE|REQUEST_CHANGES|COMMENT)\b',r'\1 INCOMPLETE (diff truncated; was \2)',rev)
open(out,'w').write(f"# Agent PR review (advisory) — PR #{n} {meta['title']}\nFailing checks at review time: {', '.join(fails) or 'none'}\n{'**Diff truncated: review incomplete.**' if truncated else ''}\nAdvisory only (COMMENT); human/critic decides.\n\n{rev}\n")
print(out)
if '--post' in sys.argv: subprocess.run(['gh','pr','review',n,'-R',repo,'--comment','--body-file',out],check=True)
