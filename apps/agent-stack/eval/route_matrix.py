#!/usr/bin/env python3
"""Generated routing matrix: thousands of owner phrasings, each with the result it must get. Offline, no model.

Same router the live turn uses (brain.pipeline.model_free_route), same gate idea as eval_probes.py: a case that
passes in route_matrix_baseline.json and stops passing is a regression (exit 1). New passes are improvements.

Families cover every deterministic hand plus the two things that must never misfire:
  - expect=<tool>   the hand that must answer
  - expect=hard     a hard step (send / pay / deploy / merge / push / delete / book / buy / publish): is_hard_step is
                    true and no acting hand is picked
  - expect=model    chit-chat / open questions: no hand fires (the model answers)
  - expect=grant / revoke   the open-access switch (permissions.grant_split / is_revoke)

What a PASS means: the phrasing reaches the right hand (or none). It is NOT proof the hand did the right thing on
the Mac; the live probe and owner assignments cover outcomes.

  python3 eval/route_matrix.py                 # summary per family, exit 1 on regression
  python3 eval/route_matrix.py --failures 40   # also print up to 40 failing phrasings
  python3 eval/route_matrix.py --write-baseline
  python3 eval/route_matrix.py --export-live out.json   # read-only families only, for face/orb_probe.py --matrix
"""
from __future__ import annotations

import hashlib
import itertools
import json
import os
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
BASELINE = HERE / "route_matrix_baseline.json"

LEADS = ["", "jarvis, ", "hey jarvis, ", "can you ", "could you please ", "please ", "I need you to ", "would you "]
TAILS = ["", " please", " for me", "?"]
QUESTION_LEADS = ["", "jarvis, ", "hey jarvis, ", "so "]
QUESTION_TAILS = ["", "?"]

APPS = ["Notes", "Safari", "Spotify", "Final Cut Pro", "Visual Studio Code", "Calendar", "Mail", "Messages",
        "Preview", "Terminal", "Finder", "Slack", "Cursor", "Obsidian", "Photos", "Music"]
REPOS = ["browser-use/browser-use", "microsoft/markitdown", "openai/whisper", "unclecode/crawl4ai", "coderamp-labs/gitingest",
         "anthropics/claude-code", "langchain-ai/langgraph", "ollama/ollama", "remotion-dev/remotion", "n8n-io/n8n"]
TOPICS = ["AI", "machine learning", "marketing", "python", "finance", "design", "history", "psychology", "startups", "nursing"]
SEARCH_TOPICS = ["headless obsidian", "pdf to markdown", "speech to text", "web scraping", "video editing",
                 "browser automation", "local llms", "invoice parsing", "screen recording", "voice cloning"]
TOOLS = ["ffmpeg", "yt-dlp", "ripgrep", "jq", "pandoc", "imagemagick", "gh", "uv", "node", "tesseract"]
FILES = ["notes.md", "README.md", "todo.txt", "config.json", "plan.yaml", "app.py", "draft.md", "report.txt"]
CONTROLS = ["save button", "share menu", "export option", "settings icon", "search bar", "send button"]
CLICK_GOALS = ["export a pdf", "change the font", "share this file", "turn on dark mode", "add a bookmark"]
QUERIES = ["the latest stable Python release", "Bitcoin price today", "who won the game last night", "Toronto weather",
           "best mechanical keyboards", "Claude Code release notes", "how to bake sourdough", "NVIDIA earnings",
           "the Quebec nursing exam date", "n8n self hosting"]
FACTS = ["my favourite colour is teal", "the dentist is on Friday", "my car is a Civic", "Normand prefers email",
         "the launch is next Tuesday", "I take my coffee black"]
PEOPLE = ["Normand", "my accountant", "the client", "Sarah", "the team"]


def _fam(name, expect, templates, slots=None, *, question=False, live_safe=False):
    return {"family": name, "expect": expect, "templates": templates, "slots": slots or {},
            "question": question, "live_safe": live_safe}


FAMILIES = [
    _fam("apps_open", "apps", ["open {app}", "launch {app}", "start {app}", "fire up {app}", "bring up {app}",
                                "switch to {app}", "open the {app} app"], {"app": APPS}),
    _fam("apps_quit", "apps", ["quit {app}", "close {app}", "quit the {app} app"], {"app": APPS}),
    _fam("repo_look", "repo", ["look at the repo {r}", "check out github.com/{r}", "tell me about the github repo {r}",
                               "show me the repo {r}", "review the repo {r}", "look into https://github.com/{r}"],
         {"r": REPOS}, live_safe=True),
    _fam("repo_install", "repo", ["install the github repo {r}", "clone {r} from github", "install https://github.com/{r}",
                                  "set up the repo {r}", "download the repo {r}"], {"r": REPOS}),
    _fam("repo_search", "repo", ["find a github repo for {t}", "search for repos about {t}", "find me a repository for {t}",
                                 "any repos for {t}", "look for a github repo that does {t}"], {"t": SEARCH_TOPICS}, live_safe=True),
    _fam("tool_install", "repo", ["install {tool}", "install {tool} with brew", "install {tool} using pip",
                                  "install the tool {tool}"], {"tool": TOOLS}),
    _fam("capability_arrow", "capability", ["don't you have a red arrow you can use", "do you have a red arrow",
                                            "do you have a pointer", "can you point at things", "are you able to use a red arrow",
                                            "is there a red arrow you can use", "can't you use the red arrow",
                                            "do you have an arrow you can show me"], question=True, live_safe=True),
    _fam("capability_self_code", "capability", ["could you change your code so you can give yourself access",
                                                "can you change your own code", "could you edit your own code",
                                                "can you update yourself", "could you give yourself access",
                                                "can you improve yourself", "can you rewrite your rules",
                                                "can you give yourself more permissions", "could you patch yourself"],
         question=True, live_safe=True),
    _fam("capability_fix_it", "capability", ["can you fix it", "could you fix that", "will you fix this now",
                                             "can you sort that out", "could you repair it", "can you fix it yourself"],
         question=True, live_safe=True),
    _fam("book_find", "workspace_read", ["{v} {k} about {t}", "{v} {k} on {t} on my mac", "{v} {k} related to {t}"],
         {"v": ["find", "show", "list", "search for", "open", "get", "pull up"],
          "k": ["books", "a book", "pdfs", "ebooks", "epubs"], "t": TOPICS}, live_safe=True),
    _fam("repos_list", "workspace_read", ["what repos do you have installed", "which repos are on my mac",
                                          "what repositories are installed locally", "what repos do you have",
                                          "list the repos on this machine", "which repos are installed on this mac"],
         question=True, live_safe=True),
    _fam("git_context", "workspace_read", ["what repo are you in", "which branch are you on", "what branch is this",
                                           "show git status", "are there any uncommitted changes", "what is the commit head"],
         question=True, live_safe=True),
    _fam("file_read", "workspace_read", ["read {f}", "open {f}", "show me {f}", "cat {f}", "read the file {f}"],
         {"f": FILES}, live_safe=True),
    _fam("folder_list", "workspace_read", ["list the files in my {d} folder", "show the files in {d}",
                                           "list my {d} folder contents"], {"d": ["Downloads", "Desktop", "Documents"]},
         live_safe=True),
    _fam("pointer", "pointer", ["point to the {c}", "where do I click to {g}", "where is the {c}"],
         {"c": CONTROLS, "g": CLICK_GOALS}),
    _fam("web_search", "web_search", ["search the web for {q}", "look up {q} online", "google {q}",
                                      "search online for {q}", "search the internet for {q}"], {"q": QUERIES}, live_safe=True),
    _fam("screen", "screen_see", ["take a screenshot of my screen", "what's on my screen", "look at my screen",
                                  "describe my screen", "what am I looking at on my screen"], question=True),
    _fam("remember", "memory", ["remember that {fact}", "note that {fact}", "don't forget that {fact}"], {"fact": FACTS}),
    _fam("hard_steps", "hard", ["send the email to {p}", "pay the invoice from {p}", "deploy the site to production",
                                "merge the pull request", "push to main", "delete {f}", "book a table for two tonight",
                                "publish the post", "buy a new keyboard", "transfer $500 to {p}", "send {p} a text",
                                "wire the payment to {p}", "force push to main", "rm -rf the build folder"],
         {"p": PEOPLE, "f": FILES}),
    _fam("hard_near_miss", "not_hard", ["how do I deploy the site to production", "don't push to main",
                                         "never merge the pull request without me", "what would it cost to buy a new keyboard",
                                         "explain how to wire the payment", "I already deployed the site", "read deploy.md",
                                         "did you delete notes.md", "should I merge the pull request", "what does rm -rf do",
                                         "how do push notifications work", "what's the difference between merge and rebase"],
         question=True),
    _fam("chit_chat", "model", ["how are you", "tell me a joke", "good morning", "thanks", "what do you think about {t}",
                                "explain {t} to me", "why is the sky blue", "what should I eat tonight",
                                "give me a pep talk", "summarize our plan for today"], {"t": TOPICS}, question=True),
    _fam("grant", "grant", ["permission granted", "I give you permission", "you have my permission", "access granted",
                            "permission granted, find books about {t}", "I allow you to do this"], {"t": TOPICS},
         question=True),
    _fam("revoke", "revoke", ["lock it down", "revoke access", "permission revoked", "lock it down now"], question=True),
]


def _fill(template: str, slots: dict) -> list[str]:
    keys = [k for k in slots if "{" + k + "}" in template]
    if not keys:
        return [template]
    return [template.format(**dict(zip(keys, combo))) for combo in itertools.product(*(slots[k] for k in keys))]


def cases(families=None) -> list[dict]:
    out, seen = [], set()
    for fam in families or FAMILIES:
        leads, tails = (QUESTION_LEADS, QUESTION_TAILS) if fam["question"] else (LEADS, TAILS)
        for tpl in fam["templates"]:
            for core in _fill(tpl, fam["slots"]):
                for lead, tail in itertools.product(leads, tails):
                    said = (lead + core + tail).strip()
                    if said[:1].islower() and not lead:
                        said = said[0].upper() + said[1:]
                    key = said.lower()
                    if key in seen:
                        continue
                    seen.add(key)
                    out.append({"id": hashlib.sha1(f"{fam['family']}|{said}".encode()).hexdigest()[:12],
                                "family": fam["family"], "say": said, "expect": fam["expect"], "live_safe": fam["live_safe"]})
    return out


def _env():
    os.environ.setdefault("JARVIS_MODE_FILE", str(Path(tempfile.mkdtemp()) / "mode.json"))  # never the owner's real switch
    os.environ.setdefault("JARVIS_TURN_LOG", "0")
    os.environ.setdefault("JARVIS_JEV_LIVE", "0")


def _pipeline():
    _env()
    from brain import pipeline
    apps = pipeline._apps_hand()
    fake = {n: Path(f"/Applications/{n}.app") for n in APPS}
    apps._bundles = lambda: dict(fake)  # offline: the apps that exist on a typical Mac, so resolve() can answer
    return pipeline


ACTING = {"apps", "repo", "agent_tools", "code_run", "mcp_call", "desk_dispatch", "browser_mission", "safari_see",
          "pointer_click", "loop", "workbench", "drafts", "multistep"}


def judge(case: dict, P) -> tuple[bool, str]:
    said, want = case["say"], case["expect"]
    if want in ("grant", "revoke"):
        perm = P._permissions_hand()
        got = "grant" if perm.grant_split(said)[0] else "revoke" if perm.is_revoke(said) else "none"
        return got == want, got
    pick = P.model_free_route(said)
    got = (pick or {}).get("tool") or "model"
    if want == "not_hard":
        hard = bool(P.is_hard_step(said))
        return not hard, "hard" if hard else "not-hard"
    if want == "hard":
        hard = bool(P.is_hard_step(said))
        return hard and got not in ACTING, ("hard" if hard else "not-hard") + ":" + got
    return got == want, got


def run(families=None) -> dict:
    P = _pipeline()
    rows = []
    for c in cases(families):
        ok, got = judge(c, P)
        rows.append({**c, "got": got, "pass": ok})
    fams: dict[str, dict] = {}
    for r in rows:
        f = fams.setdefault(r["family"], {"total": 0, "passed": 0, "expect": r["expect"]})
        f["total"] += 1; f["passed"] += r["pass"]
    return {"total": len(rows), "passed": sum(r["pass"] for r in rows), "families": fams, "rows": rows}


def compare(d: dict, baseline: dict | None = None) -> dict:
    base = baseline if baseline is not None else (json.loads(BASELINE.read_text()) if BASELINE.exists() else {"passing": []})
    was = set(base.get("passing") or [])
    now = {r["id"] for r in d["rows"] if r["pass"]}
    present = {r["id"] for r in d["rows"]}
    return {"regressions": sorted((was & present) - now), "improvements": sorted(now - was)}


def main(argv=None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    d = run()
    if "--export-live" in argv:
        dest = Path(argv[argv.index("--export-live") + 1])
        live = [{"say": r["say"], "tool": r["expect"], "family": r["family"]} for r in d["rows"]
                if r["live_safe"] and r["pass"] and r["expect"] not in ("hard", "model", "grant", "revoke")]
        dest.write_text(json.dumps(live, indent=1) + "\n")
        print(f"exported {len(live)} read-only, currently-routing phrasings to {dest}")
    if "--write-baseline" in argv:
        BASELINE.write_text(json.dumps({"passing": sorted(r["id"] for r in d["rows"] if r["pass"]),
                                        "passed": d["passed"], "total": d["total"]}, indent=0) + "\n")
    rep = compare(d)
    print(f"route matrix: {d['passed']}/{d['total']} pass · regressions={len(rep['regressions'])} · "
          f"improvements={len(rep['improvements'])}")
    for name, f in d["families"].items():
        pct = 100 * f["passed"] / max(1, f["total"])
        print(f"  {name:<22} expect={f['expect']:<15} {f['passed']:>5}/{f['total']:<5} {pct:5.1f}%")
    if "--failures" in argv:
        n = int(argv[argv.index("--failures") + 1])
        for r in [r for r in d["rows"] if not r["pass"]][:n]:
            print(f"  FAIL {r['family']:<20} want={r['expect']:<14} got={r['got']:<18} {r['say']}")
    if rep["regressions"]:
        by_id = {r["id"]: r for r in d["rows"]}
        for i in rep["regressions"][:20]:
            r = by_id[i]; print(f"  REGRESSION {r['family']}: {r['say']!r} want={r['expect']} got={r['got']}")
    return 1 if rep["regressions"] else 0


if __name__ == "__main__":
    sys.exit(main())
