# Wake word gate implementation

## Selected behavior

This implements the wake word behavior observed in the saved video record `K_cha25S4Qo`: Jarvis ignores side conversation while asleep, wakes on `hey jarvis`, `ok jarvis`, or `okay jarvis`, and accepts the next command for eight seconds.

The implementation is independent behavior work. No upstream source was copied because the reviewed publisher repository had no confirmed reuse license.

## Code

- `apps/agent-stack/brain/wake_word.py` contains the pure wake gate.
- `apps/agent-stack/brain/test_wake_word.py` contains the behavior tests.
- The caller supplies time, so expiry tests are deterministic.
- The command after the wake phrase keeps its original case, paths, punctuation, and arithmetic.

## Verified test

Run on 14 October 2026:

```text
python3 -m unittest discover -s apps/agent-stack/brain -p test_wake_word.py -v
Ran 8 tests in 0.001s
OK
```

The checks cover side conversation while asleep, wake-only turns, verbatim follow-up commands, expiry, invalid windows, paths, case, punctuation, arithmetic, prefix removal, and false wake-word prefixes.

## ArtCraft demonstration

DesignCraft native source and PNG preview:

- `Jarvis Wake Word Verification.designcraft`
- `Jarvis Wake Word Verification.png`

Both are in `ArtCraft Studio/00 Private/Projects/Jarvis/JARVIS-FULL-COMPLETION-20261014/`. The native document was reopened and rendered after saving; all seven text stories had no overset.

## Remaining live check

The pure gate and ArtCraft explanation are verified. A full source match still requires wiring the gate to the real Orb microphone, observing the sleep and wake state, confirming ignored side conversation, and measuring the user-visible end state. This document does not claim that live microphone match.
