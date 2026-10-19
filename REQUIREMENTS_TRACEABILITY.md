# Iteration 13 — source-derived CHR bank mapping requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-CHR-BANK-013 | Exact `$EE7D/$EE9A` original RAM→MMC3 CHR register write order | **Source-local passed** (not frame parity) | Original PRG opcode fixture, `OriginalChrBanking.js`, 8 new Node tests |
| ORIG-PPU-MAP-013 | MMC3 2 KiB/1 KiB pattern address selection from real CHR bytes | **Isolated passed** (synthetic RAM) | 3 private Chromium variants compare authentic CHR pixel values; source/hardware map |
| ORIG-SPRITE-001 | Original OAM/metasprites/face/pose/palette/animation | **Not implemented** | No original PPU/OAM frame trace |
| ORIG-RUN-001 | Original Classic gameplay execution and parity | **Not implemented** | Classic disabled; no original NES frame comparison |

---

# Original binary and graphics traceability update (iteration 12)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-BIN-001 | Exact upstream game PRG+CHR bytes | **Passed** | Header-normalized full ROM SHA-1 matches `assemble.sh`; `docs/ORIGINAL_ROM_PROVENANCE.md` |
| ORIG-CHR-001 | All source CHR tile pixels bit-exact | **Passed as raw 2bpp tile decoding**, not sprite fidelity | `src/classic/NesBinaryAssets.js`, pinned Git blob, 8192 tiles, browser QA |
| ORIG-SPRITE-001 | Original faces/poses/metasprites/palettes/animation | **Not implemented** | CHR alone is insufficient; OAM/PPU/animation work outstanding |
| ORIG-RUN-001 | Native complete Classic match/menus/physics/AI | **Not implemented** | no NES execution parity, Classic disabled |

---

# Requirements traceability — iteration 1

**Status applies only to verified scope; “Passed for enhanced-dev” never equals a passed Classic NES requirement.**

| ID | Requirement | Status | Evidence or blocker |
|---|---|---|---|
| ORIG-01 | All source routines and data regions inventoried | Partial | SOURCE_CODE_ANALYSIS.md |
| ORIG-02 | Original input/physics/AI/timing ported | Unimplemented | KI-001 |
| ORIG-03 | Original menus/teams/modes/progression | Unimplemented | KI-001 |
| ORIG-04 | Original sprite silhouette, animations, palettes | Unimplemented | KI-002 |
| ORIG-05 | Original soundtrack and DPCM triggers | Unimplemented | KI-002 |
| SYS-01 | Native headless deterministic JS sim | Passed for enhanced-dev | tests/match.test.js |
| SYS-02 | Playable keyboard browser foundation | Passed for enhanced-dev | reports/screenshots/desktop-match.png |
| INPUT-01 | Remappable keyboard | Passed for enhanced-dev | tests/input.test.js |
| INPUT-02 | Configurable gamepad | Partial | Unit checks; physical test blocked |
| INPUT-03 | Joystick + four actions, simultaneous | Partial | Input tests + emulated mobile; physical blocked |
| QA-03 | Development input recording and deterministic replay | Passed for enhanced-dev | tests/replay.test.js; replay-fixture.test.js; browser smoke; CLI |
| ORIG-06 | Source-backed original RAM/screen/game-script identifiers | Partial — constants only | OriginalStateIds.js; bank_ram.inc:1-35,160-185 |
| QA-01 | Original frame-level parity fixtures | Blocked | KI-003 |
| QA-02 | Computer/mobile physical QA | Partial | Headless Chromium desktop/mobile viewport |
| ENH-01 | Expandable teams/rosters with validation | Unimplemented | Phase 6 |
| ENH-02 | Player faces/bodies/hair customization | Unimplemented | Phase 7 |
| ENH-03 | Powers/super shots/animation enhancements | Unimplemented | Phase 8 |
| ENH-04 | Competitions, cups and leagues | Unimplemented | Phase 9 |
| MULTI-01 | Same-device multiplayer | Unimplemented | Phase 10 |
| MULTI-02 | LAN multiplayer | Unimplemented | Phase 11 |
| MULTI-03 | Internet multiplayer | Unimplemented | Phase 12 |
| CAREER-01 | Career, transfers, finances, scouting | Unimplemented | Phase 13 |
| REL-01 | Reproducible tests/docs/build versioning | Partial | Native tests+standalone+local Git |

## Iteration 3 source-backed progress (not original runtime parity)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-02A | Original controller serial read and new-press byte transform | **Source-derived isolated primitive implemented; no original runtime parity** | `src/classic/OriginalInput.js`, `tests/original-input.test.js`, `docs/ORIGINAL_CONTROLLER_TRACE.md` |
| ORIG-02B | Original two-byte RNG update | **Source-derived isolated primitive implemented; startup seed unknown** | `src/classic/OriginalRandom.js`, `tests/original-random.test.js` |
| ORIG-02C | Original frame loop and football input action mapping | **Partial trace only; unimplemented** | `$C486–$C492` call order, `docs/ORIGINAL_CONTROLLER_TRACE.md` |
| QA-04 | Browser controller research lab with regression | **Passed in Chromium desktop/mobile emulation and modular ESM** | `tools/browser_smoke.py`, `tools/browser_modular_smoke.py` |

## Iteration 4 source-derived scope (original runtime parity unverified)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-02D | Original screen and match-subscreen dispatch addresses | **4+13 source entries ported as metadata only** | `src/classic/OriginalScreenDispatch.js`; `tests/original-field-logic.test.js` |
| ORIG-02E | Original field-subscreen Start pause toggle | **Local branch implemented; no full field update or audio engine** | `src/classic/OriginalFieldLogic.js`; `docs/ORIGINAL_FIELD_TRACE.md`; Node and browser tests |
| ORIG-02F | Original pending foul flag/cutscene helper | **Local routine implemented; no original runtime trace** | `$C87B–$C89B`, tests for all 256 timer bytes |
| ORIG-02G | Kickoff-to-field transition | **Gate decision only; full transition NOT implemented** | `$C5B3–$C5C9`, `evaluateOriginalKickoffGate`, source trace |
| QA-05 | Original field research lab integration | **Passed in Chromium desktop standalone and modular ESM; mobile regression remains passed** | `tools/browser_smoke.py`, `tools/browser_modular_smoke.py` |

## Iteration 5 source-derived goal cutscene and routing

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-02H | Original goal subscreen 03 direct byte branches | **Source-derived isolated byte operations; not full scene or NES parity** | `src/classic/OriginalGoalCutscene.js`, `tests/original-goal-cutscene.test.js`, `docs/ORIGINAL_GOAL_CUTSCENE_TRACE.md` |
| ORIG-02I | Banked dispatch kickoff/player-action routing | **Addresses traced; routines unported** | `bank_FF.asm` `$C2AD/$C370`, `bank_04.asm` `$8015/$8018`, `docs/ORIGINAL_GOAL_CUTSCENE_TRACE.md` |
| QA-06 | Goal cutscene research UI and regression | **Passed in standalone desktop, mobile-emulated Chromium and modular ESM** | `tools/browser_smoke.py`, `tools/browser_modular_smoke.py`, `reports/LATEST_TEST_REPORT.md` |

## Iteration 6 source-derived controller/action mapping (NES runtime parity unverified)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-02J | Original A/B held and direction-repeat action buffer logic | **Source-local `$FAEE–$FBA8` byte logic implemented; no original runtime parity** | `OriginalActionBuffers.js`, 13 Node tests, `ORIGINAL_PLAYER_ACTION_TRACE.md` |
| ORIG-02K | Original player action selection and facing | **Entry gate and post-helper `$B8AB–$B9E2` branches implemented; actual actions NOT executed** | `OriginalPlayerAction.js`, 14 Node tests, source trace |
| ORIG-02L | Original kickoff control call dispatch | **Only `$B4B2` call schedule implemented; `$B850/$B4C9` not executed** | `scheduleOriginalKickoffControllerCalls`, Node tests |
| ORIG-02M | Original pass/shoot/tackle/dribble and ball-action parity | **Unimplemented / blocked** | Raw action IDs are not proven English football move names; original reference unavailable |
| QA-07 | Original buffer→action lab and no Enhanced regressions | **115 Node pass; Chromium standalone desktop/mobile-emulated/ESM pass; golden replay unchanged** | `reports/LATEST_TEST_REPORT.md` |

## Iteration 7 source-derived possession branch (original runtime parity unverified)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-02N | `$B4B2` script-bit0 branch `$B850` | **Source-local direct RAM writes implemented; not Classic gameplay** | `OriginalPossessionControl.js`, `docs/ORIGINAL_POSSESSION_CONTROL_TRACE.md`, 16 Node tests |
| ORIG-02O | Alternate `$B4C9` four-slot action processing | **Source-local branch implemented on synthetic RAM; NES runtime parity unverified** | `OriginalAlternateController.js`, 20 tests, new browser lab; legacy preview remains intentionally limited |
| ORIG-02P | Numeric action `$09/$0A` downstream football effects | **Unimplemented; semantics unverified** | `KNOWN_ISSUES.md`, `NEXT_ITERATION.md` |
| QA-08 | Standalone and ESM original possession lab; Enhanced regression | **131 Node PASS, desktop/mobile-emulated/ESM Chromium PASS, golden replay unchanged** | `reports/LATEST_TEST_REPORT.md`, screenshot, `e6a26591` |

## Iteration 8 source-derived alternate controller (NES runtime parity unverified)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-02Q | `$B4C9–$B724` four-controller selector and `$C07A` buffer call | **Native source-local RAM logic implemented; no original frame/football action execution** | `OriginalAlternateController.js`, `docs/ORIGINAL_ALTERNATE_CONTROLLER_TRACE.md` |
| ORIG-02R | Seven groups × four classes × twelve action IDs and `$B83D` overlap | **Source numeric lookup ported and tested; action semantics unknown** | `readOriginalAlternateActionTable`, tests for all 12 offsets and 7×4 pointers |
| ORIG-02S | `$B4B2` complete branch dispatch | **Source-local dispatcher runs either four `$B4C9` slots or one `$B850` branch on synthetic RAM** | `stepOriginalControllerDispatch`, tests and Chromium lab |
| ORIG-02T | Original action execution and full Classic game frame | **NOT IMPLEMENTED; no lawful NES reference parity** | KI-003/022; `NEXT_ITERATION.md` |
| QA-09 | Alternate controller and existing gameplay regression | **151 Node PASS, Chromium standalone/mobile-emulated/ESM PASS, replay unchanged** | `reports/LATEST_TEST_REPORT.md`, `e6a26591` |

## Iteration 9 — action-to-movement arbitration (original NES runtime parity unverified)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-02U | Original `$AA14–$AAAB` pending action arbitration, state/weather gates, movement priority | **Native source-local RAM operations implemented; not movement physics or Classic gameplay** | `src/classic/OriginalActionArbitration.js`, 21 Node tests, `docs/ORIGINAL_ACTION_ARBITRATION_TRACE.md` |
| ORIG-02V | `$AC65` pointer and `$AC69–$AD40` metadata bytes | **Source numeric lookup ported with overlap and audited bounds** | `readOriginalActionMetadata`, tests and browser lab |
| ORIG-02W | Original action ID → animation/velocity/ball interaction | **Unimplemented** | KI-024; no original frame-indexed reference |
| QA-10 | Bank04 selector → bank06 arbitration integration and Enhanced regression | **172 Node PASS; Chromium desktop/mobile-emulated/ESM PASS; replay hash unchanged** | `reports/LATEST_TEST_REPORT.md` |
| QA-11 | Full input-tape authenticity | **Gap found: state hashes do not detect state-inert edits** | KI-025, `reports/replay-inert-tamper-output.txt` |

## Iteration 10 owner directive — FULL original binary conversion, not a similar game

**Strict acceptance condition:** complete game code, PRG routines, CHR sprites/metasprites, palette/OAM/CHR-bank effects, original faces/proportions, animation, inputs/AI/physics, teams/modes/menus, sound and per-frame timing; native JS runtime, verified against the lawfully available original. **None of these overall completion gates are passed yet.** The provisional `enhanced-dev-0.1` match is not evidence of original parity.

| Requirement | Current verified implementation | Remaining blocker |
|---|---|---|
| Source ROM/CHR access/provenance | Source-pinned expected ROM SHA-1 and CHR Git blob; local input audit tool | Actual binary unavailable for comparison |
| Original CHR bitplanes | Correct generic NES 2bpp decoder, 16 B/tile, verified via synthetic fixtures | Original sprite tile data not locally inspected; no original art copied |
| Original palette/OAM/metasprite render | **Unimplemented**; neutral four-tone tile inspection only | Source PPU/OAM/palette/map extraction and original frame visual QA |
| Binary sprite/animation identities, original field/UI | **Unimplemented** | Source graphics metadata and original frame captures |
| Original code/physics/AI/modes/audio | **Incomplete**; source-local control/action research routines | Comprehensive source coverage, execution integration, NES parity |
| UI binary inspector and auditor | Implemented, Chromium synthetic-import tested, CLI digest checked | Real user-supplied binary and binary hash validation |

See `docs/BINARY_TO_JS_PIPELINE.md`, `docs/ASSEMBLY_TO_JS_MAPPING.csv`, and `reports/LATEST_TEST_REPORT.md`.

## Iteration 11 — original bank06 movement state and ball-action priority

| ID | Requirement | Status | Evidence / gate |
|---|---|---|---|
| ORIG-02X | Source `$AAC3/$AAC8–$AB0A` movement metadata → state-bit update | **Source-local native RAM logic implemented; independent NES parity NOT VERIFIED** | `OriginalMovementTransition.js:stepOriginalMovementState`, 16 shared new tests, `docs/ORIGINAL_MOVEMENT_TRANSITION_TRACE.md` |
| ORIG-02Y | Source `$AB2A–$AB51` pending ball-action priority using `$AC4D` table | **Post-weather branch implemented on synthetic RAM only** | `stepOriginalBallShotPriority`, 24 original table bytes, Node/browser tests |
| ORIG-02Z | Full `$AB0B` weather callback `$9856`, `$AD41` movement dispatcher, original movement/ball physics | **NOT IMPLEMENTED** | KI-026; needs complete source trace and NES reference run |
| QA-12 | Preserve Enhanced match and browser/CHR inspection regression | **207 Node PASS; Chromium standalone/ESM/mobile-emulated PASS; replay `e6a26591` unchanged** | `reports/LATEST_TEST_REPORT.md` |

### Iteration 14 PPU transfer traceability (supersedes older palette/OAM “unimplemented” entry only for byte-transfer mechanics)

| Original OAM DMA `$EE5A` | **Source-local implementation** `src/classic/OriginalPpuTransfers.js`; authenticated ROM opcode match, 256-byte transfer and browser test | Real game OAM buffer values, metasprite composition, orientation, animation and reference frame **not verified** |
| Original palette queue `$F05F–$F0B3` | **Source-local implementation** `stepOriginalPaletteQueue`; exact ROM opcodes, PPU register writes and mirror tests | Actual source palette data and PPU reference frames **not verified**; no original RGB palette/sprite rendering |

## Iteration 15 — source-backed original weather OAM producer

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| ORIG-OAM-WEATHER-015 | Original fixed-bank `$D993–$DA45` weather-effect OAM producer, init/update | **Isolated source opcode parity passed** | `OriginalWeatherSprites.js`; authenticated PRG; test-only 6502 differential 80 RAM comparisons; browser lab |
| ORIG-ROM-OFFLINE-015 | Offline authenticated owner ROM import, no embedded PRG | **Passed** | `OriginalRomSha1.js`; browser rejection of altered PRG; Node hash comparisons |
| ORIG-SPRITE-001 | Original player-character metasprites, palettes, animation and faces | **Not implemented** | Weather OAM is not player OAM; no reference frame |
| ORIG-RUN-001 | Complete native original NES gameplay runtime | **Not implemented** | Classic disabled; isolated source routines only |
