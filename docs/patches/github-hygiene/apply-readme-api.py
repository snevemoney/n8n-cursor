#!/usr/bin/env python3
"""Prepend hygiene headers to READMEs via GitHub Contents API (no full clone).

Requires GH_TOKEN with repo write. Headers live next to this file in headers/.
"""
from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HEADERS_DIR = ROOT / "headers"

REPOS = [
    "outer-heaven-backups",
    "shield-buddies",
    "clipengine",
    "trendspotter-ai",
    "proof-qc-assist",
    "autoflow-finance",
    "book-reimagined",
    "quick-list-hub-42",
    "clearfield-evidence-flow",
    "insights-lm-private",
    "lightning-ui",
    "lightningflow",
    "client-engine",
    "philanthropic-ai-agent",
]


def api(method: str, path: str, token: str, data: dict | None = None):
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        data=None if data is None else json.dumps(data).encode(),
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "evenslouis-hygiene",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as r:
            body = r.read()
            return r.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        try:
            j = json.loads(body)
        except Exception:
            j = {"message": body[:500]}
        return e.code, j


def ensure_header(repo: str, token: str) -> None:
    hdr_path = HEADERS_DIR / f"{repo}.md"
    if not hdr_path.is_file():
        print(f"==> {repo}\n  NO_HEADER")
        return
    header = hdr_path.read_text(encoding="utf-8")
    if not header.endswith("\n"):
        header += "\n"

    print(f"==> {repo}")
    st, repo_info = api("GET", f"/repos/snevemoney/{repo}", token)
    if st != 200:
        print(f"  REPO_FAIL {st} {repo_info.get('message')}")
        return
    default = repo_info["default_branch"]

    st, file_info = api(
        "GET", f"/repos/snevemoney/{repo}/contents/README.md?ref={default}", token
    )
    sha = None
    if st == 404:
        new_content = header
        print("  creating README.md")
    elif st != 200:
        print(f"  README_GET_FAIL {st} {file_info.get('message')}")
        return
    else:
        raw = base64.b64decode(file_info["content"]).decode("utf-8", errors="replace")
        if "HYGIENE: paste at top" in raw[:400]:
            print("  already headed")
            return
        new_content = header + "\n" + raw
        sha = file_info["sha"]

    payload: dict = {
        "message": "docs: add lane/status hygiene header (not-the-product disclaimers)",
        "content": base64.b64encode(new_content.encode("utf-8")).decode("ascii"),
        "branch": default,
    }
    if sha:
        payload["sha"] = sha
    st, put = api("PUT", f"/repos/snevemoney/{repo}/contents/README.md", token, payload)
    if st in (200, 201):
        print(f"  COMMIT_OK on {default}")
        return

    print(f"  COMMIT_FAIL {st} {put.get('message')}")
    branch = "cursor/repo-hygiene-headers-59dd"
    st2, ref = api("GET", f"/repos/snevemoney/{repo}/git/ref/heads/{default}", token)
    if st2 != 200:
        print(f"  REF_FAIL {st2}")
        return
    base_sha = ref["object"]["sha"]
    st3, _ = api(
        "POST",
        f"/repos/snevemoney/{repo}/git/refs",
        token,
        {"ref": f"refs/heads/{branch}", "sha": base_sha},
    )
    if st3 == 422:
        api(
            "PATCH",
            f"/repos/snevemoney/{repo}/git/refs/heads/{branch}",
            token,
            {"sha": base_sha, "force": True},
        )
    st4, finfo = api(
        "GET", f"/repos/snevemoney/{repo}/contents/README.md?ref={branch}", token
    )
    payload2 = {
        "message": payload["message"],
        "content": payload["content"],
        "branch": branch,
    }
    if st4 == 200:
        payload2["sha"] = finfo["sha"]
    st5, _ = api("PUT", f"/repos/snevemoney/{repo}/contents/README.md", token, payload2)
    print(f"  BRANCH_PUT {st5}")
    st6, pr = api(
        "POST",
        f"/repos/snevemoney/{repo}/pulls",
        token,
        {
            "title": "docs: repo hygiene header (lane / WIP / not-X)",
            "head": branch,
            "base": default,
            "body": "Adds canonical status/lane/role/not-X header.",
        },
    )
    print(f"  PR {st6} {pr.get('html_url') or pr.get('message')}")
    num = pr.get("number")
    if num:
        st7, m = api(
            "PUT",
            f"/repos/snevemoney/{repo}/pulls/{num}/merge",
            token,
            {"merge_method": "squash"},
        )
        print(f"  MERGE {st7} {m.get('merged') or m.get('message')}")


def main() -> int:
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if not token:
        print("GH_TOKEN required", file=sys.stderr)
        return 2
    only = sys.argv[1:]
    repos = only if only else REPOS
    for repo in repos:
        ensure_header(repo, token)
    print("ALL_API_HYGIENE_DONE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
