# Current remote handover — 2026-10-19, batch 1

Canonical repository: `saeedsai/MagicFootballv2`, branch `main`.

Recovered archive SHA-256 `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`; recovered local Git `274195e506b818fdd0957df980284aa08482735e`, 185 tracked files, 17 historical commits. The original `HANDOVER.md` remains byte-identical to the archive and documents the historical Iteration 15 state. The new work is tracked here.

Batch 1: 4 exact JS source modules; 2 exact archived Node test files; isolated native Java RNG port and its exhaustive test. JS source Git blob hashes have been compared against original local Git hashes. No ROM/CHR/PRG/audio or derived original sprite art has been published.

Local recovered source: Node 243 total, 237 pass, 0 fail, 6 skip; `npm run check` and `npm run build` pass. Java reference: 65,536 initial states exhaustively tested (passed locally). Remote CI for this increment must be checked separately.

Next: import more archived modular sources and tests, with authenticated Git blob comparisons; prioritize original MMC3/PPU/CHR/palette/OAM modules; restore full source tree and verified history where possible. Do not unlock Classic Mode or claim original-game frame parity. Keep provisional enhanced match separate. Current deployment is an Iteration 15 standalone checkpoint, not fully reconstructed Classic Mode.

## 2026-10-19 original graphics / Java batch 2

A further **three exact archived original-source JavaScript modules** have been pushed and verified via GitHub blob SHA: `src/classic/NesBinaryAssets.js` (`694627443c015cd12e57fe4be5c32a78aea46c2d`), `src/classic/OriginalChrBanking.js` (`669acc786b5b957731f7b1ad0dea26bf4e172d1d`), and `src/classic/OriginalWeatherSprites.js` (`1e2fd245ccce2725398be2434df6fbdbd5d8c3a1`). The three new synthetic Node tests cover iNES/CHR bitplanes, mapper inversion, and OAM initialisation; they do not establish frame parity. Native Java `OriginalChrDecoder` mirrors the 2bpp tile decode using locally provided CHR bytes, exhaustively tested for all 65,536 possible pairs of tile-row bitplanes. This raises the **exact archived JS-source count on the remote to 7 of 22**, not a full migration. `tools/import-audit.mjs` checks exact restored blob identities independently of arbitrary total-file thresholds.

No original CHR/ROM/graphics/audio bytes are committed. Classic Mode remains disabled; original 17-commit Git history and most 185 tracked files still await remote migration.
