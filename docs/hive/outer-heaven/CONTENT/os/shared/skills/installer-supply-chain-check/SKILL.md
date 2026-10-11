---
name: installer-supply-chain-check
description: >-
  Use before running any downloaded installer, binary, or utility on the box or a
  user machine, especially hardware/system utilities from vendor sites, or when a
  "trusted download site hijacked" report surfaces. Verify hash/signature against
  an independent publication first. Anti-triggers: package-manager installs with
  signed repos already verified; leisure.
---
# Check the installer before you run it

## Why
Trusted vendor download pages get hijacked. Three independent September 2026 reports covered the cpuid.com CPU-Z/HWMonitor compromise, and the posts also mention FileZilla (x:2042530099006681248, x:2042483067655262461, x:2042440111795651013; incident details UNVERIFIED here). A familiar domain is not proof.

## Steps
1. Get the expected SHA-256 or signature from a second channel: the vendor's GitHub release SUMS file, its signed release notes, or a package manager. Don't trust a hash printed next to the download button on the same page.
2. Download into a scratch folder, then run `python3 verify_download.py <file> <SHA256SUMS>`. Exit 0 means it matches. Anything else means don't run it.
3. If the vendor publishes a signature (GPG/minisign/Authenticode), verify that too.
4. If there is a live compromise report for the vendor, wait for the vendor's all-clear even if the hash matches, because the published hash may be compromised as well.
5. Keep agent boxes free of browser-stored passwords and long-lived tokens, so a bad installer finds nothing to steal (see tool-permission-not-prompt).
6. Never pipe a remote script into a shell (`curl … | sh`) without reading it first. The awesome-skill-import-gate static check flags this pattern.

## Proof
`verify_download.py` was checked against a matching and a tampered file (packet signals-2mo-backlog-20261010/recreations/supply_chain.proof.json).

## Scripted gate (2026-10-11, TOP100 #68)
`./gate.py owner/repo[@tag|sha] ...` → PASS/REVIEW/HOLD per repo (licence, archived, last push, pinned ref, npm install hooks); exit 1 on any HOLD. Read-only. Verified 2026-10-11: OpenMontage HOLD (AGPL), paperclip/orca REVIEW (install hooks), claude-mem REVIEW (unpinned) — same as the manual REPOS_TESTED verdicts.
