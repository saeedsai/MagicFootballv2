# Iteration 15 source recovery — field/goal batch 4 (2026-10-19)

## Provenance
- Canonical repository: `saeedsai/MagicFootballv2`.
- Source archive: `Kunio_Soccer_Iteration_15_Source.zip`; independently verified SHA-256 `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`.
- ZIP CRC check: passed, 1,067 entries.
- Original local Git HEAD: `274195e506b818fdd0957df980284aa08482735e`; 185 tracked files, 17 historical commits.
- Remote `main` starting commit: `c4522fe152ae646ad361bc7ea509f338e8f80bb9` (tree `938316e119f5395eaa3051bce4d3eb869623d0ad`).

## Imported source and tests
- `src/classic/OriginalFieldLogic.js`: Git blob `d5523e4624f5e3d3a9f6cc2e0aaec3b145c63d63`.
- `src/classic/OriginalGoalCutscene.js`: Git blob `1c3afe80899eb6205a52d0ef44341b6a11f13f3a`.
- `tests/original-field-logic.test.js`: Git blob `c17856c45518144a913816129a33523006e75b8b` (17 cases).
- `tests/original-goal-cutscene.test.js`: Git blob `253762cc5e11af725b77dddd4529b07cb5102a51` (10 cases).

## Local validation (full archive, not remote)
- `npm test`: 243 total; 237 passed, 0 failed, 6 skipped (original private NES ROM fixture not available).
- `npm run check`: passed.
- `npm run build`: passed (24 modular files).
- Remote CI: verify after push; do not assume the local suite ran on remote.

## Status and blockers
- Exactly 13 of 22 original `src/` JavaScript modules imported if the new tree commit is published and blob-verified.
- Full 185-file migration and original 17-commit history restoration: **NOT complete**.
- Classic Mode disabled. No original game-frame parity, audio parity or original sprite assembly verified.
- No copyrighted original ROM/CHR/PRG/DPCM/audio or derived character art published.
