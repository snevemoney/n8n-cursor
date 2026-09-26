#!/usr/bin/env bash
# Credential scan used by `pnpm run scan-secrets`.
# Exits 0 only after the scan finishes with no new findings.
# A missing gitleaks binary does not skip the check.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if ! command -v python3 >/dev/null 2>&1; then
  echo "scan-secrets: python3 is required to scan"
  exit 1
fi

python3 - "$@" <<'PY'
import re
import subprocess
import sys

PATTERNS = (
    ("aws_access_key", re.compile(r"(?<![A-Z0-9])AKIA[0-9A-Z]{16}(?![A-Z0-9])")),
    ("private_key", re.compile(r"-----BEGIN (?:RSA |OPENSSH |EC |DSA |PGP )?PRIVATE KEY-----")),
    ("github_pat", re.compile(r"(?<![A-Za-z0-9])(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,})")),
    ("slack_token", re.compile(r"(?<![A-Za-z0-9])xox[baprs]-[0-9A-Za-z-]{10,}")),
    ("stripe_live", re.compile(r"(?<![A-Za-z0-9])(?:sk|rk)_live_[0-9A-Za-z]{8,}")),
    ("openai", re.compile(r"(?<![A-Za-z0-9])sk-(?:proj-[A-Za-z0-9_-]{20,}|[A-Za-z0-9]{16,})")),
    ("google_api", re.compile(r"(?<![A-Za-z0-9])AIza[0-9A-Za-z_-]{35}")),
    ("supabase_secret", re.compile(r"(?<![A-Za-z0-9])sb_secret_[A-Za-z0-9_-]{16,}")),
    ("slack_webhook", re.compile(r"https://hooks\.slack\.com/services/[A-Z0-9]+/[A-Z0-9]+/[A-Za-z0-9]+")),
)

# Path counts already in the tree. Values stay out of this file.
# A higher count on one of these paths fails. Any other path fails at 1.
KNOWN_FINDING_COUNTS = {
    ".env.monitoring": 1,
    ".env.monitoring.backup": 1,
    "apps/scorpion/.env.local.backup": 1,
    "scripts/setup-supabase-complete.mjs": 1,
    "scripts/setup-supabase-direct.mjs": 1,
    "scripts/setup-supabase-schema.mjs": 1,
    "scripts/setup/setup-supabase-db.mjs": 1,
    "scripts/setup/setup-supabase-simple.mjs": 1,
    "scripts/setup/setup-zep-mcp.sh": 1,
}

PLACEHOLDER = re.compile(
    r"example|placeholder|changeme|xxxx+|dummy|redacted|your[-_ ]",
    re.IGNORECASE,
)


def skip_path(path: str) -> bool:
    if "node_modules/" in path or path.startswith("node_modules/"):
        return True
    if path.endswith((".md", ".example", ".sample")):
        return True
    if path.startswith(("env-templates/", ".scorpion/")):
        return True
    if "/fixtures/" in path or path.startswith("fixtures/"):
        return True
    return False


def findings_in(text: str):
    found = []
    for lineno, line in enumerate(text.splitlines(), 1):
        for name, pattern in PATTERNS:
            for match in pattern.finditer(line):
                value = match.group(0)
                if name == "stripe_live":
                    body = re.sub(r"^(?:sk|rk)_live_", "", value)
                    if body.isdigit() and len(body) <= 16:
                        continue
                if PLACEHOLDER.search(value):
                    continue
                found.append((name, lineno))
    return found


def main() -> int:
    try:
        listed = subprocess.check_output(["git", "ls-files", "-z"])
    except subprocess.CalledProcessError as exc:
        print(f"scan-secrets: git ls-files failed ({exc.returncode})", file=sys.stderr)
        return exc.returncode or 1

    scanned = 0
    failures = []
    for raw in listed.split(b"\0"):
        if not raw:
            continue
        path = raw.decode("utf-8", "surrogateescape")
        if skip_path(path):
            continue
        try:
            with open(path, "rb") as handle:
                blob = handle.read()
        except OSError as exc:
            print(f"scan-secrets: cannot read {path}: {exc}", file=sys.stderr)
            return 1
        if b"\0" in blob[:4096]:
            continue
        scanned += 1
        hits = findings_in(blob.decode("utf-8", "replace"))
        allowed = KNOWN_FINDING_COUNTS.get(path, 0)
        if len(hits) > allowed:
            extra = hits[allowed:]
            failures.append((path, len(hits), allowed, extra))

    if failures:
        print("scan-secrets: credential patterns found")
        for path, count, allowed, extra in failures:
            print(f"  {path}: {count} finding(s), allowed {allowed}")
            for name, lineno in extra:
                print(f"    {name} at line {lineno}")
        return 1

    print(f"scan-secrets: no new credential patterns ({scanned} files)")
    return 0


sys.exit(main())
PY
