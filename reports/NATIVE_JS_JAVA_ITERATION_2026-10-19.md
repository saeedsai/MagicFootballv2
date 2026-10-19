# MagicFootball v2 — native JS + Java recovery report

**Date:** 2026-10-19. **Canonical repository:** `saeedsai/MagicFootballv2`, `main`.

## Verified archive provenance

- Uploaded source ZIP SHA-256: `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`.
- Original local baseline commit: `274195e506b818fdd0957df980284aa08482735e`.
- Original archive: **185 tracked paths, 22 files directly under `src/`, 17 historical commits**.
- Source reference pinned upstream: `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`.

## Code delivered to remote GitHub

- **11 of the archived 22 modular JS source files** transferred with original-byte Git object SHA verification. All 11 identities are checked by `tools/import-audit.mjs` in CI.
- Source domains covered: original input controller encoding/edges; action buffers; possession control; random step; screen/metadata identifiers; ROM-hash validation; iNES/CHR 2bpp decoding; original CHR/MMC3 mappings; weather OAM; OAM DMA and palette queue.
- **Java reference implementations:** source-equivalent two-byte RNG (`OriginalRandom.java`) and 2bpp CHR tile decoder (`OriginalChrDecoder.java`), both independently tested.
- Recovered original Node tests: `tests/original-random.test.js` and `tests/original-rom-sha1.test.js`. Additional synthetic source-coverage tests cover graphics, controller/possession/PPU paths, and blob integrity.
- Historical `index.html` blob stays `d051badfcb2311c0b6b66af09c9d87d32e04b534`; historical `HANDOVER.md` blob stays `d3bb3bcc0accd14babbb8a4828c6c8233460eb60`.

## Test evidence — remote GitHub Actions

Commit `b5e01d9263b3a744d8e0a877c08cbd92e5bfa132`:

| Check | Result |
|---|---|
| Node tests in canonical remote | **26 passed, 0 failed, 0 skipped** |
| Node syntax checks | Passed |
| Migration and exact-source Git blob audits | Passed; **11 verified**, 0 blob errors |
| Java RNG exhaustive two-byte input enumeration | Passed; **65,536** states |
| Java 2bpp pixel decoding exhaustive bitplane-byte pair enumeration | Passed; **65,536** patterns |
| Java workflow | Passed |
| GitHub Pages build / deployment workflow | Passed |

Evidence:
- Node workflow: https://github.com/saeedsai/MagicFootballv2/actions/runs/39251367160
- Java workflow: https://github.com/saeedsai/MagicFootballv2/actions/runs/39251367159
- Pages workflow: https://github.com/saeedsai/MagicFootballv2/actions/runs/39251366171

**Separate archive-only local tests:** 243 Node tests; 237 passed, 0 failed, 6 skipped without the private NES fixture. Archived local `npm run check` and `npm run build` passed. These are not equivalent to remote CI coverage.

## Outstanding blockers / limitations

- Remote tree contains **40 tracked file blobs as of the evidenced commit**, not the original 185-file source tree; remaining archived modules, tests, docs, tools, and original historical Git object ancestry have not all been transferred. This is an **incomplete migration**.
- Original sprite metasprite assembly, face fidelity, tile bank + palette + OAM integration, animation schedule, audio, physics, AI, menus, and frame-level verification remain incomplete.
- The currently deployable standalone HTML is the prior Iteration 15 research build, not an updated playable Classic implementation.
- **Classic Mode remains disabled.** No ROM, CHR, PRG, DPCM, copyrighted source artwork, or proprietary audio was uploaded; user-supplied locally imported original data is supported by the reconstruction pipeline.
- These tests verify isolated native routines and synthetic fixtures, not a byte-by-byte complete original NES gameplay port.

## Next safe source recovery batch

Restore the remaining 11 exact archived `src/` modules with their original Git blob SHAs and dependencies, bring in the original `tests/` and browser test suite, and migrate safe documents/tools. Preserve existing Git history, avoid forced updates and reconstruct original frame outputs with privately supplied ROM and reference snapshots before enabling Classic Mode. Java is the second native reference platform and should receive additional source-mapped routines as JS coverage expands.
