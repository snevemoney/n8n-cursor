#!/usr/bin/env python3
"""Local agent PR review (read-only). Pulls `gh pr diff` + checks, asks a cheap model to review against the
osmani-code-review-axes (correctness, tests, security, scope, wiring), writes REVIEW-<n>.md locally.
It does NOT post to GitHub. Posting as a PR review is proposal P11 (needs Evens's yes).
usage: pr_review.py <pr-number> [--repo snevemoney/n8n-cursor]"""
import subprocess,sys,os,json
import urllib.request
class llm:
  @staticmethod
  def chat(m,tag,temperature=0,max_tokens=900,model='openai/gpt-4o-mini'):
    b=json.dumps({'model':model,'messages':m,'temperature':temperature,'max_tokens':max_tokens}).encode()
    r=urllib.request.Request('https://openrouter.ai/api/v1/chat/completions',b,{'Authorization':'Bearer '+os.environ['OPENROUTER_API_KEY'],'Content-Type':'application/json'})
    return json.load(urllib.request.urlopen(r,timeout=120))['choices'][0]['message']['content'].strip()
n=sys.argv[1]; repo=sys.argv[sys.argv.index('--repo')+1] if '--repo' in sys.argv else 'snevemoney/n8n-cursor'
gh=lambda *a: subprocess.run(['gh',*a,'-R',repo],capture_output=True,text=True).stdout
meta=json.loads(gh('pr','view',n,'--json','title,body,files,additions,deletions'))
diff=gh('pr','diff',n)[:24000]; checks=gh('pr','checks',n)
fails=[l.split('\t')[0] for l in checks.splitlines() if '\tfail\t' in l]
sysm=("You are a strict code reviewer. Review ONLY the diff. Axes: correctness, tests present/updated, security (secrets, injection, auth), "
      "scope (does it do one thing), wiring (is new code actually called). Output markdown: Verdict: APPROVE|REQUEST_CHANGES|COMMENT, then up to 8 findings "
      "as '- [axis] file:line — issue — fix'. Never invent files or lines not in the diff. If diff truncated, say so.")
rev=llm.chat([{'role':'system','content':sysm},{'role':'user','content':f"PR #{n}: {meta['title']}\n+{meta['additions']}/-{meta['deletions']} in {len(meta['files'])} files\nFailing checks: {fails or 'none'}\n\n{diff}"}],tag='g11-pr-review',temperature=0,max_tokens=900)
out=f'REVIEW-{n}.md'
open(out,'w').write(f"# Local agent review — PR #{n} {meta['title']}\nFailing checks at review time: {', '.join(fails) or 'none'}\nNOT posted to GitHub (advisory; human/critic decides).\n\n{rev}\n")
print(out)
if '--post' in sys.argv: subprocess.run(['gh','pr','review',n,'-R',repo,'--comment','--body-file',out],check=True)
