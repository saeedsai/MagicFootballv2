# Iteration 9 — archive verification and binary-audit regression

Date: 2026-10-19. Canonical repository: saeedsai/MagicFootballv2.

The original Iteration 15 ZIP was recovered from the user's Library. Its SHA-256 is
`aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`.
All ZIP CRC checks passed. Its local Git HEAD is
`274195e506b818fdd0957df980284aa08482735e`, with 185 tracked
paths and 17 original commits.

At the start of this iteration, main was
`5369ea02b58df30a63f195d9cc4eb5f479bfac3f`.
All 22 original source JavaScript modules were present on main and
the original standalone index.html Git blob remained
`d051badfcb2311c0b6b66af09c9d87d32e04b534`.
The full 185-file migration and original Git ancestry remain incomplete.

This increment adds synthetic, asset-free CLI regression tests for the
byte-identical restored NES binary audit tool. Four local cases passed:
pinned source blob, missing argument, synthetic one-tile CHR, and malformed CHR.
These tests do not establish original NES frame parity.

The original modular HTML can be reconstructed exactly from the existing
standalone by replacing the single inline style element with
`<link rel="stylesheet" href="./styles.css">` and the single inline script
element with `<script type="module" src="./src/main.js"></script>`.
Local reconstruction verified Git blob
`ad09958a166c4ae5802b9f58c23fdf88e77d9e4e`.
The existing original stylesheet has blob
`f37e291e2bb60974b0fed4be3f0044920227a808`.
A locally tested adapted public build reproduced the pinned standalone byte-for-byte.
The modular entrypoint and adapted build are NOT counted as remotely migrated
unless a separate GitHub commit and remote file audit confirms them.

No protected ROM, CHR, PRG, DPCM, audio, or original sprite art is included.
Classic Mode remains disabled. All reported remote CI results must be
checked against the actual commit SHA; local tests are not remote CI evidence.

Remote branch CI: Node.js 271 tests / 265 passed / 0 failed / 6 skipped; Java checks passed.
Evidence: https://github.com/saeedsai/MagicFootballv2/actions/runs/39316929779
and https://github.com/saeedsai/MagicFootballv2/actions/runs/39316929715.
