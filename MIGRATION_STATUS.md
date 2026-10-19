# Migration status — 2026-10-19

**Target:** https://github.com/saeedsai/MagicFootballv2 (public; user-authorized writable repository).

## Successfully pushed and verified

- `index.html` is the original, byte-identical standalone **Iteration 15** browser research build; remote Git blob SHA `d051badfcb2311c0b6b66af09c9d87d32e04b534`.
- `HANDOVER.md` is byte-identical to the previous Iteration 15 handover, blob `d3bb3bcc0accd14babbb8a4828c6c8233460eb60`.
- `reports/LATEST_TEST_REPORT.md` preserves the exact earlier iteration's test evidence, blob `2fff73bc02de82c91290021c429496ff76e7cadf`.
- `docs/ORIGINAL_WEATHER_OAM_TRACE.md` is byte-identical to the original trace, blob `4f4787e54cabecafe8f84c305d6d9c70845c56bd`.
- `docs/MASTER_SPECIFICATION.md` is byte-identical to the original master prompt, blob `dc99ab162f66fdff026f0e677723a2fc0ab37b18`.

## Remaining blocker — complete source migration

The Iteration 15 source ZIP, `Kunio_Soccer_Iteration_15_Source.zip` (SHA-256 `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`), contains the authoritative **modular JavaScript source tree, 185 locally Git-tracked files, tests, history, and documents**. That complete modular tree and its existing Git history are **not yet present in this GitHub repository**. The API-only bridge available during repository initialization could transfer readable conversation attachments but could not directly import raw bytes from the ZIP or push the old Git object database. No complete migration is claimed.

The local project baseline is Git commit `274195e506b818fdd0957df980284aa08482735e`. In the present execution environment, `npm test` **ran 243 tests, 237 passed, 0 failed, 6 skipped** because the private original NES ROM fixture was not imported. `npm run check` and `npm run build` passed. These are tests against the locally extracted **full source**, not tests against this incomplete GitHub checkout. Earlier report with 243/243 success required the authenticated owner ROM.

The standalone HTML does contain bundled native JS implementation code and the research UI; it is **not** an editable substitute for the modular source tree or the original NES itself.

## Migration completion criteria

1. Copy all non-protected original tracked source files, tests, source manifest, traceability records and reports from the last verified ZIP into this repository.
2. Restore `.gitignore` because the export ZIP omitted it, and exclude originals and private screenshots.
3. Add the full project without overwriting new target documentation unintentionally.
4. Run full tests with and without a locally authorized ROM; document skips honestly.
5. Commit and push to a branch, review the migration diff, then merge into `main` without force-pushing or removing existing work.
6. Verify new GitHub files and mark this migration complete only then.

## Non-negotiable fidelity status

**Classic Mode is disabled and incomplete.** The standalone match is a provisional development testbed. Original game behavior, art assembly, audio, AI, physics, and menus remain unverified and incomplete.

The public repository excludes the original NES ROM, extracted CHR/PRG/audio and private reference sprites. The original owner's local ROM import workflow may be used privately; this does not grant permission to republish protected assets.

## 2026-10-19 remote audit increment

The full 185-file modular tree and local Git history are still **not migrated**: the exact source ZIP was unavailable in this run's mounted files and Library. Six new unit tests and a Git-tracked-path migration audit have been prepared for remote CI. The audit protects the byte-identical Iteration 15 standalone and the disabled Classic Mode gate, rejects protected binary files, and never claims that a source-file count proves full migration. See `docs/REMOTE_ITERATION_HANDOVER.md`. This is a guardrail increment, **not** an original-game conversion or a completed source migration.

## 2026-10-19 original-source restoration: verified batch 1

The exact uploaded archive (SHA-256 `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`) and local Git commit `274195e506b818fdd0957df980284aa08482735e` have been verified. Batch 1 restores four byte-identical modular JavaScript sources (`OriginalRandom`, `OriginalStateIds`, `OriginalScreenDispatch`, `OriginalRomSha1`) and two original Node test files; GitHub blob SHA values equal the archived Git object hashes. A separately developed Java port of the isolated original RNG and exhaustive 65,536-state regression test are included. The complete 185-file tree and original 17-commit history remain NOT migrated. The archived 237-pass/6-skip local suite is not a remote CI claim; CI covers only migrated tests. Classic Mode remains disabled, and no original asset bytes were uploaded.

## 2026-10-19 original graphics / Java batch 2

A further **three exact archived original-source JavaScript modules** have been pushed and verified via GitHub blob SHA: `src/classic/NesBinaryAssets.js` (`694627443c015cd12e57fe4be5c32a78aea46c2d`), `src/classic/OriginalChrBanking.js` (`669acc786b5b957731f7b1ad0dea26bf4e172d1d`), and `src/classic/OriginalWeatherSprites.js` (`1e2fd245ccce2725398be2434df6fbdbd5d8c3a1`). The three new synthetic Node tests cover iNES/CHR bitplanes, mapper inversion, and OAM initialisation; they do not establish frame parity. Native Java `OriginalChrDecoder` mirrors the 2bpp tile decode using locally provided CHR bytes, exhaustively tested for all 65,536 possible pairs of tile-row bitplanes. This raises the **exact archived JS-source count on the remote to 7 of 22**, not a full migration. `tools/import-audit.mjs` checks exact restored blob identities independently of arbitrary total-file thresholds.

No original CHR/ROM/graphics/audio bytes are committed. Classic Mode remains disabled; original 17-commit Git history and most 185 tracked files still await remote migration.
