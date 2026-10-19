# Iteration 13 P0 checkpoint — source-derived original CHR banking

Exact pinned `$EE7D/$EE9A` register write order and real CHR bank-address mapping now exist in native JS, tested with authenticated original PRG/CHR bytes. **No complete NES sprite or frame parity yet.** Next: source-verify palette, OAM/metasprite and animation pipeline, original RAM bank producers and call timing; acquire development-only emulator PPU/frame traces. Keep Classic disabled and Enhanced deferred. See `ORIGINAL_CHR_BANKING_TRACE.md`.

---

# Original NES fidelity gate — iteration 10 direction update

The user requires the **full original binary, all original code, features, graphics, sounds, faces, animations and gameplay**. No lookalike is accepted. Original CHR decoding is now an isolated verified tile-index pipeline; genuine palette/OAM/metasprite reconstruction and complete gameplay remain open. Do not implement Enhanced-only content or treat its playable match as original parity. See `BINARY_TO_JS_PIPELINE.md`.

# Milestone plan and gates

See `MASTER_DEVELOPMENT_PLAN.md` for the concise mirror of master-spec stages. Order: source audit → browser foundation → original core physics/AI → complete Classic features/graphics/audio → multiplatform parity gates → Enhanced content/customization/abilities/competitions → local multi → career → LAN → internet. Gates are verified requirements and test evidence, **not an overall subjective percentage**.

Current slice: Stage 0 **partial audit** and Stage 1 **native dev foundation** (not exit-gated for Classic). Source routine/function-level inventory and verified original input map are still missing. Next: obtain full original source, identify actual frame dispatcher, reverse engineer original inputs and ball update, implement one independently verified and regression-tested original behavior in isolated Classic module.


### Iteration 2 checkpoint (2026-10-19)

**Completed:** a reproducible input tape and browser replay verification vertical slice; versioned seed/mode/rules schema; checkpoints; committed golden fixture; CLI and Chromium import/export smoke; original source state-ID metadata. This supports later parity testing but **does not satisfy** the Classic frame-reference gate. Next: obtain full source checkout or extract sufficient annotated routine bodies via connector; identify the original controller read path, frame dispatcher and game-script transitions; create lawful NES reference traces; port one verified mechanic into a separate Classic simulation with original input fixtures.

### Iteration 5 checkpoint

Original goal-subscreen 03 direct byte operations (`$C699–$C71B`) are now isolated in `OriginalGoalCutscene.js` with source-boundary contracts and 10 new tests. The new goal research panel is Chromium-verified. Banked dispatch route `$C2AD` -> selector `$17` -> bank04 `$B4B2` has been traced, **not implemented**. Continue original action/movement and complete state transitions before any Classic gameplay release.

### Iteration 7 checkpoint

`$B4B2` script-bit0 → `$B850` now executes direct RAM writes on a test fixture. Source-local tests cover controller slot vs owner indexing, A/B priority, frame cadence and angle-table overread. Alternate `$B4C9` and original action execution are still unported; next milestone targets them and lawful reference parity. No Classic exit gate has been met.

## Iteration 8 update (supersedes iteration 7 pending-controller milestone)

`$B4C9–$B724` and its `$B727–$B84F` numeric lookup tables are now source-locally ported. The full `$B4B2` branch dispatcher runs four controller slots or the `$B850` possession branch on synthetic RAM. Twenty new tests (151 total) and Chromium browser QA pass. **The original action executor, movement/ball physics, Classic frame scheduler and NES reference parity remain missing.** Next P0: trace `$0479` action consumers, then obtain lawful frame-indexed original RAM snapshots. See `../NEXT_ITERATION.md`.

## Iteration 9 checkpoint

Bank06 `$AA14–$AAAB` action-to-movement-ID arbitration and metadata `$AC65–$AD40` now execute as native source-local JavaScript on synthetic RAM, with controller-selector composition and 20 tests (172 total). This is not original movement physics or a playable Classic frame; original NES reference parity remains blocked. Next P0: `$0459` movement-ID executor, original call order, and lawful reference traces. See `../NEXT_ITERATION.md` and `ORIGINAL_ACTION_ARBITRATION_TRACE.md`.

**Iteration 11 evidence:** bank06 `$AAC3/$AAC8–$AB0A` and `$AB2A–$AB51` now execute isolated source-derived native JS RAM operations, including audited metadata and ball priority table; tested in Node and Chromium. The original NES movement executor, physics, graphics, audio and full frame scheduler are **not implemented**, and original-run parity is **not verified**. P0 remains source tracing `$AD41`/`$B097`/`$9856`, lawful binary access and reference RAM traces. Do not advance any Classic completion gate.

## Iteration 14 update — source-backed PPU transfers

Ported `$EE5A` OAM DMA and `$F05F–$F0B3` palette queue with binary-opcode verification and synthetic RAM tests. Source RAM producers, actual palette/OAM frame data, metasprite layouts, animation and NES runtime frame equivalence remain unverified. Classic is disabled. See `ORIGINAL_PPU_TRANSFERS_TRACE.md`.

## Iteration 15 checkpoint — original weather OAM producer

Pinned `$D993–$DA45` weather sprite OAM init/update is native JavaScript and independently matched against execution of original 6502 PRG machine code on 80 synthetic RAM fixtures. Original user ROM import now verifies offline in the browser. This is **not** the original player metasprite pipeline or a verified NES gameplay frame. Phase 0 audit is still partial; Phase 2–6 Classic parity gates remain OPEN. Next source target is the original player OAM producer and real emulator RAM/OAM/PPU reference traces. Enhanced remains deferred.
