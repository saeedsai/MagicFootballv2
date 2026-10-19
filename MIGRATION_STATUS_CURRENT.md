# MagicFootball v2 migration status — 2026-10-19

Canonical main commit: `11b0670c40b377612fb63e0abe9012a71b113907`.

Verified original archive SHA-256: `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`.
Original local Git HEAD: `274195e506b818fdd0957df980284aa08482735e`.

**15 of 22** original `src/` JavaScript modules have been restored with byte-identical Git blob hashes. The full 185-file tracked migration and 17 historical commits remain incomplete. The original standalone `index.html` is unchanged.

Latest remote Node CI: 73 passed, 0 failed, 0 skipped on the action/movement branch. Main branch CI is tracked separately in GitHub Actions. Local full archive suite: 237 passed, 0 failed, 6 skipped (private reference fixtures absent).

Classic Mode remains disabled pending original-game parity. No protected game assets are distributed.

See `reports/ITERATION15_FIELD_GOAL_IMPORT_2026-10-19.md`, `reports/ITERATION15_ACTION_MOVEMENT_IMPORT_2026-10-19.md`, and `docs/HANDOVER_BATCH5_2026-10-19.md`.
