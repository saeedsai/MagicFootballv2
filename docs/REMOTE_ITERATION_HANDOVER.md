# Remote handover — 2026-10-19

**Canonical repository:** saeedsai/MagicFootballv2, main. **Full source migration: BLOCKED / INCOMPLETE.**

The verified Iteration 15 standalone, historical handover, specification, weather trace and earlier test report remain intact. The modular 185-file JavaScript source tree, source tests and historical Git objects have **not** been imported. The required archive `Kunio_Soccer_Iteration_15_Source.zip` (SHA-256 `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`) was not found in the current execution's mounted files or file library. The different archived original game binary must not be used as a substitute.

This increment adds `tools/migration-audit.mjs` and six unit tests. The CI audit checks Git-tracked asset extensions, the exact byte-identical standalone HTML blob before source import, the pinned upstream SHA, the disabled Classic Mode marker, and false claims of a completed migration. It reports source presence only as a *candidate*, never as a verified full migration.

**Next action:** obtain the exact archive, verify its SHA-256, enumerate all 185 tracked files and provenance, import safe modular code/tests/docs to a branch based on the latest main tree, preserve historical ancestry separately, review diff, execute full test/build/browser checks, then merge without force-push. No original ROM, CHR, PRG, DPCM, music or derived art should be published without rights. Classic Mode stays disabled pending frame-level evidence.

The six audit unit tests are new; historical 243-test results are from the separate local Iteration 15 checkout, not the incomplete remote. See `MIGRATION_STATUS.md`.

## 2026-10-19 original-source restoration: verified batch 1

The exact uploaded archive (SHA-256 `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`) and local Git commit `274195e506b818fdd0957df980284aa08482735e` have been verified. Batch 1 restores four byte-identical modular JavaScript sources (`OriginalRandom`, `OriginalStateIds`, `OriginalScreenDispatch`, `OriginalRomSha1`) and two original Node test files; GitHub blob SHA values equal the archived Git object hashes. A separately developed Java port of the isolated original RNG and exhaustive 65,536-state regression test are included. The complete 185-file tree and original 17-commit history remain NOT migrated. The archived 237-pass/6-skip local suite is not a remote CI claim; CI covers only migrated tests. Classic Mode remains disabled, and no original asset bytes were uploaded.

## 2026-10-19 original graphics / Java batch 2

A further **three exact archived original-source JavaScript modules** have been pushed and verified via GitHub blob SHA: `src/classic/NesBinaryAssets.js` (`694627443c015cd12e57fe4be5c32a78aea46c2d`), `src/classic/OriginalChrBanking.js` (`669acc786b5b957731f7b1ad0dea26bf4e172d1d`), and `src/classic/OriginalWeatherSprites.js` (`1e2fd245ccce2725398be2434df6fbdbd5d8c3a1`). The three new synthetic Node tests cover iNES/CHR bitplanes, mapper inversion, and OAM initialisation; they do not establish frame parity. Native Java `OriginalChrDecoder` mirrors the 2bpp tile decode using locally provided CHR bytes, exhaustively tested for all 65,536 possible pairs of tile-row bitplanes. This raises the **exact archived JS-source count on the remote to 7 of 22**, not a full migration. `tools/import-audit.mjs` checks exact restored blob identities independently of arbitrary total-file thresholds.

No original CHR/ROM/graphics/audio bytes are committed. Classic Mode remains disabled; original 17-commit Git history and most 185 tracked files still await remote migration.
