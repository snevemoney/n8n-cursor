#!/usr/bin/env python3
"""Check source flag identifiers against the canonical registry; no policy evaluation."""
import json
import subprocess
import sys
from pathlib import Path


def check(root: Path) -> int:
    schema = json.loads((root / 'contracts/flags.schema.json').read_text())
    known = set(schema['properties'])
    scan = subprocess.run(['rg', '-n', '-o', r'\b(?:NEXT_PUBLIC_)?FF_[A-Za-z0-9_]+', 'apps', 'packages', '--type', 'ts', '--type', 'js'], cwd=root, text=True, capture_output=True)
    if scan.returncode not in (0, 1):
        print(scan.stderr, file=sys.stderr)
        return 2
    unknown = []
    for line in scan.stdout.splitlines():
        location, token = line.rsplit(':', 1)
        name = token.removeprefix('NEXT_PUBLIC_').removeprefix('FF_')
        if name not in known:
            unknown.append(f'{location}: {token}')
    if unknown:
        print('Unknown flags:\n' + '\n'.join(unknown), file=sys.stderr)
        return 1
    print('All scanned flag identifiers exist in the registry.')
    return 0


if __name__ == '__main__':
    raise SystemExit(check(Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[3]))
