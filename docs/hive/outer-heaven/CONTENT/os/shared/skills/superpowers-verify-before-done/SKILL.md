---
name: Superpowers verify before done
description: >-
  Use before claiming complete/fixed/passing — fresh verification evidence required; remaps obra/superpowers verification-before-completion to verify-then-done + check-forge-done.
---
# Superpowers verify before done

Source: obra/superpowers `verification-before-completion` (MIT).

## When
About to claim done, fixed, green, or ready to PR/merge.

## Do
1. Iron law: no completion claim without fresh verification evidence from this run.
2. Run the named check (`harness-ci.sh`, tests, click path). Paste exit code / path.
3. Forge-done: implement→critic + Watchdog critic. `check-forge-done.py --slice-id …` exit 0 after critic closes.
4. Pair verify-then-done. Looks good without a click = fail for sites.

## Don't
Self-PASS. Claim Stage 5 as license to ship live `/`. Skip evidence.
