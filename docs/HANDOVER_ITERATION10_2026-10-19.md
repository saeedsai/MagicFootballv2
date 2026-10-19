# MagicFootball v2 — Iteration 10 handover (2026-10-19)

Canonical repository: saeedsai/MagicFootballv2. Base main at start: 5369ea02b58df30a63f195d9cc4eb5f479bfac3f. Previous audited feature branch: b7763e623a40b117197801bbe93b9f06429c98f5.

## Restored source and build
- `modular.html` is the exact original Iteration 15 modular HTML (Git blob `ad09958a166c4ae5802b9f58c23fdf88e77d9e4e`).
- Root `index.html` remains the exact standalone checkpoint (Git blob `d051badfcb2311c0b6b66af09c9d87d32e04b534`).
- `tools/build.mjs` is a NEW public-only adaptation of the archived builder. It copies the 22 modular source files and produces `dist/index.html` and `dist/standalone.html`, without modifying root `index.html`. It does not embed or distribute private CHR/ROM data.
- `tests/modular-build-integrity.test.mjs` asserts byte-exact output hashes and preservation of root index.

## Validation
Recovered archive SHA-256: aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63. ZIP CRC passed. Local staged source tests: 239 passed, 0 failed, 6 skipped (245 total). Syntax and build passed. Generated standalone and modular Git blobs match the pinned hashes above. These are LOCAL results; check remote CI separately.

## Remaining blockers
The 185 tracked-file migration is incomplete; 17 original Git commits are documented but not restored as Git ancestry. The new public builder is not a byte-identical copy of the archived original builder. Classic Mode remains DISABLED; original frame parity is unverified. No copyrighted original ROM/CHR/PRG/DPCM/audio or extracted character artwork may be uploaded. Merge into main only via safe non-forced fast-forward after checking current main.
