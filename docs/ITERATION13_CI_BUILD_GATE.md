# Iteration 13 CI build gate

`npm run build` is defined on the Iteration 12 development branch. The Node workflow currently exercises `tools/build.mjs` through a regression test but does not invoke the npm build command as a separate CI step. This is a pending verification gap, not a completed migration or Classic Mode parity claim.
