# Iteration 13 CI build gate

`npm run build` is defined on the Iteration 12 development branch. The Node workflow currently exercises `tools/build.mjs` through a regression test but does not invoke the npm build command as a separate CI step. This remains a pending verification gap, not a completed migration or Classic Mode parity claim.

New regression test: `tests/public-build-command.test.mjs`, commit `d3d8559f6faefd06881d7495e74207c810e3199b`.

Verified remote Node CI: run 39350937558, 274 tests / 268 passed / 0 failed / 6 skipped. Java CI: run 39350937903, passed. Main integration is still blocked. The full 185-file archive is unavailable in this environment and the original 17-commit ancestry is not restored.
