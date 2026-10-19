# Iteration 15 archive recovery — 2026-10-19

Status: **archive recovered locally; remote modular migration NOT complete**.

- Archive: `Kunio_Soccer_Iteration_15_Source.zip`
- Verified SHA-256: `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`
- Recovered local Git HEAD: `274195e506b818fdd0957df980284aa08482735e`
- Original Git-tracked files: **185** (including `dist/`, reports, tools, tests and documentation).
- Top-level tracked inventory: `src/` 22; `tests/` 22; `tools/` 18; `docs/` 32; `reports/` 47; `dist/` 26; root files 18.
- Local Node tests: **243 total, 237 passed, 0 failed, 6 skipped** (private ROM unavailable).
- Local `npm run check`: passed.
- Local `npm run build`: passed.

**Do not confuse local archive verification with remote migration.** This report records recovered provenance only; the modular source files and original Git history still need to be transferred through a verified GitHub write path. Avoid using the previous audit's arbitrary `sourceCount >= 100` threshold as an authoritative completion test: the authentic archive has only 22 files directly under `src/`. A trustworthy migration gate must compare a complete path/blob manifest from the recovered Git tree, account for intentional exclusions, and verify the remote blobs individually.

The existing `main` tree, standalone HTML, and Classic Mode disabled gate must be preserved. No protected original ROM/CHR/PRG/DPCM/audio or derived character art may be uploaded publicly without rights. The provisional match is not verified Classic Mode.
