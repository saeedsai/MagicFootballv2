# Iteration 15 source recovery — action/movement batch 5 (2026-10-19)

Canonical repository: `saeedsai/MagicFootballv2`. Verified source ZIP SHA-256: `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`. Archived baseline Git HEAD: `274195e506b818fdd0957df980284aa08482735e`.

## Imported
- `src/classic/OriginalActionArbitration.js` exact Git blob `83837771af46a070ea9ba0b7a718d9382e41b918`.
- `src/classic/OriginalMovementTransition.js` exact Git blob `f18e2484fee9421ddfffa94fae8abbfc8216f067`.
- `tests/original-movement-transition.test.js` exact archived blob `37e837dedbcfe5038a53ef164c9973ddb0593260` (16 tests).
- `tests/action-arbitration-import.test.mjs` new synthetic test blob `f0d6dcad1728e3cb65bc79109a7d7f815326de03` (4 tests).

## Verification
Local isolated action/movement tests: 20 passed, 0 failed, 0 skipped. Archived full project: 243 total, 237 passed, 0 failed, 6 skipped (private ROM fixtures unavailable); syntax check and build passed. Remote CI must be inspected after publishing.

After this batch, exact original JavaScript source modules on remote should be 15 of 22. The original 185-file tracked tree and 17 local historical commits are **NOT migrated**. Archived full action-arbitration tests still depend on missing `OriginalAlternateController.js`. Original graphics, audio, frame-level physics and NES parity remain unverified. Classic Mode remains disabled; provisional match remains separate. No ROM/CHR/PRG/DPCM/audio or derived character art is published.
