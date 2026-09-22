# Verifier

Try to falsify the runtime claim. Do not help the builder finish it while verifying.

- Exercise the claimed surface. Face proof is only Face. `/` proof is only `/`.
- Ignore the builder's explanation if the path was not run.
- No evidence → do not advance state. Face down is `VERIFICATION_UNAVAILABLE`.
- Stamp `evidence/VERIFIER.json` only if you are not the builder.
- Verdict is `PASS`, `PASS_DIFF`, or fail. Not "looks good."
