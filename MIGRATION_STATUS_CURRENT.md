# MagicFootball v2 migration status — 2026-10-19

Canonical main commit: `11b0670c40b377612fb63e0abe9012a71b113907`.

Verified original archive SHA-256: `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`.
Original local Git HEAD: `274195e506b818fdd0957df980284aa08482735e`.

**15 of 22** original `src/` JavaScript modules have been restored with byte-identical Git blob hashes. The full 185-file tracked migration and 17 historical commits remain incomplete. The original standalone `index.html` is unchanged.

Latest remote Node CI: 73 passed, 0 failed, 0 skipped on the action/movement branch. Main branch CI is tracked separately in GitHub Actions. Local full archive suite: 237 passed, 0 failed, 6 skipped (private reference fixtures absent).

Classic Mode remains disabled pending original-game parity. No protected game assets are distributed.

See `reports/ITERATION15_FIELD_GOAL_IMPORT_2026-10-19.md`, `reports/ITERATION15_ACTION_MOVEMENT_IMPORT_2026-10-19.md`, and `docs/HANDOVER_BATCH5_2026-10-19.md`.


## 2026-10-19 verified archive source import (feature branch)

Archive `Kunio_Soccer_Iteration_15_Source.zip` independently passed SHA-256 `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63` and ZIP CRC checks. Local original Git HEAD: `274195e506b818fdd0957df980284aa08482735e` (185 tracked paths, 17 original commits). The source restoration branch `source/iteration15-archive-bulk-20261019` points to `b0af6cf644381af524c413da018b369e8ab176d0`, based on canonical main `c0b8bc7b4bb159e5bd36fbaf84486c3275247396`. GitHub's remote tree contains all **22/22 original src/ JS files with Git blob hashes identical to local baseline**. 106/185 archived tracked paths match byte-for-byte, four tracked paths differ intentionally (README.md, index.html standalone, package.json bootstrap, .gitignore), and 75 tracked paths are still missing, largely dist outputs, test logs and screenshots, plus several tools and documents. Therefore the complete 185-file migration and 17-commit history are **NOT complete**. The main branch has NOT been advanced; ref-update and pull-request creation were blocked by connected-app safety checks. No protected original ROM/CHR/PRG/DPCM/audio or derived original art was published.

GitHub Actions on the restoration branch: Node 266 total / 260 pass / 0 fail / 6 skipped; Java original-routine CI passed. Local full archived source: 243 total / 237 pass / 0 fail / 6 skipped; `npm run check` and `npm run build` passed locally, but remote build is **not** claimed (archived `tools/build.mjs` still missing). The six skipped Node tests need a locally authorized original ROM. Classic Mode remains disabled and no original NES frame-level parity is claimed. Prioritize safely merging the branch into main, restoring missing tooling and traceability, then addressing original game fidelity.
