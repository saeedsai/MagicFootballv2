# MagicFootball v2 — remote Iteration 15 archive restoration audit (2026-10-19)

## Source provenance
- Canonical remote: saeedsai/MagicFootballv2.
- Source ZIP SHA-256: aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63 (verified by local hashlib; ZIP CRC passed).
- Local Git HEAD: 274195e506b818fdd0957df980284aa08482735e; 185 tracked paths; 17 historical commits.
- Pinned upstream disassembly: df2c8e55e7f13e5792482527db9e7c9e4a84c6e1.
- Parent main: c0b8bc7b4bb159e5bd36fbaf84486c3275247396; parent tree bde08e9e7d347fe31131e63b268572cc6cec5fb7.
- Restoration branch: source/iteration15-archive-bulk-20261019; source commit b0af6cf644381af524c413da018b369e8ab176d0; tree 06609c4b4d39c51f6e4a48282bc021dc651599d7.

## Remote verification
GitHub tree was fetched and compared with the local Git HEAD object IDs: 22/22 original src/ JS files byte-identical. Of the 185 original tracked paths, 106 exactly match, 4 differ (README.md, index.html, package.json, .gitignore), and 75 are absent. Remote tree has 136 files, including newer bootstrap CI/docs/Java additions that were not in the original archive. Do NOT confuse 136 with 136/185 migrated.

Missing tracked files include original dist/ generated outputs, historical logs and screenshots (excluded intentionally to avoid publishing protected imagery or redundant generated content), plus tools/archive/write_docs_iteration1.py, tools/audit_nes_binary.mjs, tools/browser_smoke.py, tools/browser_verified_graphics_smoke.py, tools/browser_weather_sprites_smoke.py, tools/build.mjs, docs/ORIGINAL_ROM_PROVENANCE.md and duplicate Kunio_Soccer_Complete_Master_Development_Prompt.md. Original 17-commit Git history has not been imported; it must be reviewed for protected binary objects before publishing any history archive.

## Test evidence
- Local original ZIP: npm test 243 total, 237 passed, 0 failed, 6 skipped; npm run check passed; npm run build passed.
- Remote branch Node workflow: https://github.com/saeedsai/MagicFootballv2/actions/runs/39275752788 — 266 total, 260 passed, 0 failed, 6 skipped; check and import/migration audits succeeded.
- Remote branch Java workflow: https://github.com/saeedsai/MagicFootballv2/actions/runs/39275752871 — passed.
- Remote build not run because archived tools/build.mjs remains missing. Reference NES frame-level parity not run.

## Merge / release blockers
The GitHub connector created blobs, trees, commits and new branches, but requests to advance main or open a pull request were rejected by safety checks. This branch is **not merged into main**. Retry only with a fresh main SHA and a non-force update/PR; never replace the existing main tree or claim a merge until verified. Classic Mode remains disabled; provisional match is not Classic. No original protected ROM/CHR/PRG/DPCM/audio or derived character art was published.
