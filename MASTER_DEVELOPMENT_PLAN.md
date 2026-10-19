# Iteration 13 checkpoint — source-faithful original CHR bank switching (not sprite parity)

Phase 0/source audit advances through pinned fixed-bank `$EE7D/$EE9A`, with byte-identical ROM evidence and a native MMC3 CHR bank-address map. Private browser can now display the original CHR patterns at their source-selected PPU tile addresses using **synthetic RAM**, not original frame snapshots. Phase 2–6 Classic acceptance gates remain **OPEN**: authentic palette/OAM/metasprites, animation, physics, AI, audio, teams and menus remain unported; original frame parity untested. Next P0: trace `$05B8–$05BD` producers and original palette/OAM upload, create reference PPU/RAM traces, then port original gameplay. Enhanced expansion stays deferred.

---

# Iteration 12 milestone — original reference ROM is authenticated

Owner-supplied NES 2.0 dump and pinned disassembly's original assembled binary **are identical outside header bytes 7 and 15** (normalized whole-ROM SHA-1 matches). Source-verified raw CHR decoding of **8192 original tiles** runs in the private, offline HTML inspector. Added per-bank fingerprints and secure single-ROM ZIP importer. **This is not a Classic release**; priority is still original PPU sprite composition, animation/palette reconstruction and native original game logic with independent NES frame parity. All subsequent roadmap phases remain unchanged; no Enhanced feature additions until faithful Classic.

---

# Directional correction — source binary and complete Classic fidelity first

The project owner explicitly requires full original binary reverse engineering: **all actual original code, features, graphics, UI, animations, physics, AI, sound and assets**, not a similar game. The provisional playable development match is a separate testbed and **must never** be treated as progress toward gameplay parity. Next milestones: lawful binary acquisition/provenance check; PPU/CHR/OAM/palette/metasprite extraction and sprite image comparisons; complete assembly inventory; original action-ID and movement executor; source-faithful Classic main loop; original features; reference parity. Enhanced Mode scope is deferred until Classic is verified. Iteration 10 begins the first exact binary CHR decoder and inspector. Track unimplemented parts instead of marking them complete.

# Master development plan — mirror of owner spec

Primary spec: user-uploaded `Kunio_Soccer_Complete_Master_Development_Prompt.md` (supplied in conversation; not redistributed here). **Plan is additive and incremental.** No original parity can be assumed.

| Phase | Scope | Current state | Gate |
|---|---|---|---|
| 0 | Audit all source and legal provenance | Partial | Every routine/data region traced |
| 1 | Browser renderer and headless JS engine | Partial — playable dev foundation | Actual desktop and mobile QA |
| 2–4 | Complete original physics/AI/menus/assets/audio | Unimplemented | Reference parity and complete Classic content |
| 5–6 | Control profiles, Classic QA | Partial input system, unverified original mapping | Physical keyboard/pad/touch QA |
| 7–9 | Enhanced teams/customization/abilities/cups | Not started | Versioned content and tested interactions |
| 10–12 | Same-device/LAN/internet multiplayer | Not started | Two independent clients and authority QA |
| 13–14 | Career and polishing | Not started | Complete seasons/saves, QA |

No original requirement removed. See `REQUIREMENTS_TRACEABILITY.md` and `docs/ASSEMBLY_TO_JS_MAPPING.csv`.


**Iteration 2:** deterministic development input replay and strict mode/rules checks implemented as a foundation for future reference parity; the first source-confirmed Classic metadata constants are isolated. Stage 0 remains partial; original frame dispatcher/physics still unported. Next gate is **source-derived Classic behavior plus lawful frame-reference verification**, not more speculative physics.

**Iteration 3 progress (2026-10-19):** Phase 1 reverse engineering has concrete routine-level findings: controller serial sampling `$EE06`, stable reread/edge logic `$EDCD`, RNG `$EE35`, and their main-loop call order. These exact small routines are implemented and tested in isolated `src/classic/` modules with a browser research lab. The next acceptance gate remains lawful original-game frame/RAM reference parity, original action mapping and actual Classic match behavior. Classic Mode is **not** playable.

**Iteration 4 progress (2026-10-19):** Phase 1 source audit now includes exact screen/subscreen dispatcher tables, original field-screen Start pause bit and audio-command arguments, original foul helper, and kickoff branch. Isolated source-derived JavaScript and browser research UI are tested. Phase 2–6 acceptance gates **remain open**: no original football movement, ball physics, AI, gameplay loop, menu, asset/audio parity or original frame-level reference has been established. Next priority: trace and implement original action/movement and complete kickoff transition with legal NES reference fixtures.

**Iteration 5 progress (2026-10-19):** Phase 1 reverse engineering now includes the original goal subscreen 03 `$C699–$C71B` direct-write cutscene branches and the bank04 destination of the kickoff dispatch selector `$17`. Ten new Node tests (88 total) plus desktop/mobile/modular Chromium smoke cover the isolated timer/camera/skip/brightness logic. **The original match loop, goal cutscene dependencies, kickoff transition and NES runtime parity remain unimplemented.** No phase acceptance gate has been declared complete. Next P0: trace bank04 `$B4B2` kickoff helper, `$B8AB` individual player action routine and acquire lawful original RAM/input snapshots.

## Iteration 6 checkpoint — original controller-to-action research (v0.6.0)

**Phase 1 (reverse engineering) advances, but is not complete.** Traced and source-locally ported fixed-bank `$FAEE–$FBA8` button-buffer logic and bank04 `$B8AB–$B9E2` action/angle branch selection, plus `$B4B2` call schedule. Verified through 27 new Node tests and Chromium research lab. **Original runtime frame parity is still blocked** and the numeric action IDs have not been mapped to actual football move execution. The complete original Classic game remains unplayable. **Phase 2–6 gates remain open**, and all Enhanced roadmap phases remain unchanged. Next phase-1 priority: trace the action executor and remaining `$B4C9/$B850` call chain; obtain lawful frame-indexed reference RAM snapshots. See `docs/ORIGINAL_PLAYER_ACTION_TRACE.md` and `NEXT_ITERATION.md`.

## Iteration 7 checkpoint — source-local original script-bit0 controller branch (v0.7.0)

Phase 1 progresses: bank04 `$B850–$B8AA` and the `$B4B2` script-bit0 dispatch now execute direct, source-derived RAM operations in isolated JavaScript. The four `$B4C9` alternate calls remain explicitly **unexecuted**. Source quirks (matched slot vs owner action write and table overread at index 3) are preserved, not corrected speculatively. 16 new tests, 131 total, and Chromium/ESM checks pass. The original game **cannot yet be played in Classic Mode**; no NES runtime equivalence is claimed. All 14 roadmap phases and their gates remain unchanged. Next priority is `$B4C9` and actual action execution plus lawful frame-level reference traces. See `docs/ORIGINAL_POSSESSION_CONTROL_TRACE.md`.

## Iteration 8 checkpoint — both original controller selector branches (v0.8.0)

Phase 1 source audit advanced: bank04 `$B4C9–$B724` and seven-group/four-class/twelve-entry lookup data are source-locally ported; the full `$B4B2` branch dispatcher can now execute either the four-slot `$B4C9` path or the script-bit0 `$B850` path on synthetic RAM. `$C07A/$FAEE` native buffer processing is invoked. 20 new tests, 151 total, Chromium standalone/mobile-emulated/ESM QA pass. **This is not a Classic gameplay loop, does not run the original action executor, and has no NES reference-frame parity.** Phase 2–6 gates remain open; Enhanced phases unchanged. Next P0: trace `$0479` action consumers and original player/ball movement, then obtain lawful frame-indexed reference traces. See `docs/ORIGINAL_ALTERNATE_CONTROLLER_TRACE.md`.

## Iteration 9 checkpoint — source-local action-to-movement arbitration (v0.9.0)

Phase 1 source audit advances: bank06 `$AA14–$AAAB` consumes pending action IDs `$0479`, applies source weather/state/metadata gates and conditionally replaces movement IDs `$0459`; the `$AC69–$AD40` metadata bytes are ported with contiguous table overlap. This allows a **synthetic controller-selector → action arbitration chain**, but not a true Classic game frame, original movement physics, animation, ball effects or original NES parity. Twenty-one new tests bring the total to 172. Desktop/mobile-emulated/modular Chromium and development replay pass. The replay checker has a documented input-authenticity limitation (KI-025). Next priority: trace movement-ID consumers and real original per-frame ordering; obtain lawful NES RAM references. All phase 2–14 gates remain open.

**Iteration 11 progress (2026-10-19):** Original bank06 movement-state bit update `$AAC3/$AAC8–$AB0A` and the pending ball-action priority branch `$AB2A–$AB51` are implemented as native, source-derived RAM operations with strict audited-table boundaries and browser/unit tests. **Neither player/ball physics nor complete original frame execution is present; no original graphics, NES runtime parity, or Phase 1 completion is claimed.** All 14 phases and acceptance gates remain unchanged. See `docs/ORIGINAL_MOVEMENT_TRANSITION_TRACE.md`.

## Iteration 14 checkpoint — original palette/OAM transfer branch (Phase 1 research)

Verified fixed-bank `$EE5A` and `$F05F` opcode sequences against owner ROM; ported native PPU register effects, 256-byte OAM DMA and palette queue with NES palette mirroring. Nine new tests, Chromium research UI and regression suites passed. **Not** a sprite renderer, real NES palette, reference-frame parity or Classic Mode unlock. All 14 phase acceptance gates remain unchanged; next P0 original sprite composition and real PPU/RAM reference traces.

## Iteration 15 verified slice

Original fixed-bank weather-effect sprite OAM producer `$D993–$DA45` is reconstructed in native JavaScript using the original authenticated PRG tables; 80 randomized synthetic-RAM comparisons against independent execution of original 6502 opcodes pass. This is NOT the player sprite pipeline or original NES runtime frame parity. Offline owner-ROM verification and browser OAM inspector are tested; original gameplay/graphics/AI/audio gates remain open. Next P0: original player metasprites and NES reference-frame fixtures.
