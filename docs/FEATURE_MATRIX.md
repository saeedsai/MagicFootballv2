# Iteration 10 (binary-first) additions

| Feature | Status | Evidence |
|---|---|---|
| Source-pin CHR provenance / ROM SHA-1 expected reference | **Metadata from upstream, binary bytes not obtained** | `docs/BINARY_TO_JS_PIPELINE.md`, audit CLI |
| Native iNES v1 extraction/trainer handling/CHR tile decoding | **Implemented, independently tested on synthetic fixtures** | `NesBinaryAssets.js`, `tests/nes-binary-assets.test.js` |
| Local ROM/CHR import and original tile inspector | **Implemented and Chromium-verified on synthetic fixtures** | `index.html`, `src/main.js`, `tools/browser_graphics_smoke.py` |
| Original CHR import, exact palettes, metasprites, animation, graphics comparisons | **Blocked / not yet implemented** | No original ROM/CHR bytes, original OAM/PPU port or legal redistribution approval |
| Complete original code and features | **Unimplemented; existing source routines partial** | `REQUIREMENTS_TRACEABILITY.md`; Classic disabled |

# Feature matrix

| Feature | Status | Evidence |
|---|---|---|
| Original repository pinned | Passed | GitHub ref returned exact SHA in `SOURCE_CODE_ANALYSIS.md` |
| Source top-level inventory | Partial | `SOURCE_MANIFEST.json` (binary content not downloaded) |
| Original function-level traceability | Not analyzed | `ASSEMBLY_TO_JS_MAPPING.csv` early anchors only |
| Native fixed-step, headless dev match | Passed | Node deterministic tests; Chromium smoke |
| Provisional movement, shooting, passing, tackling | Passed | Node unit tests and browser match test |
| Basic provisional AI and GK clearance | Passed | Node test incl 10k-frame smoke |
| Keyboard settings | Passed | Unit + headless Chromium |
| Gamepad input mapping | Partial | Unit-tested mapping, physical controller not tested |
| Four touchscreen actions | Partial | Unit + simultaneous 2-contact Chromium emulation smoke; real device not tested |
| Versioned deterministic development input replay | Passed | 18 new Node tests including committed golden fixture, Chromium export/import/checksum smoke |
| Source-confirmed original screen/game-script constants | Passed as identifier metadata only | `OriginalStateIds.js`; `bank_ram.inc:160-185`; Node test |
| Original Classic game menus, AI, physics, rosters | Unimplemented | Parity blocked without full audit |
| Original CHR, animation, palettes, sound | Unimplemented | Assets not imported; rights unverified |
| Physical iOS/Android phone testing | Blocked | No devices in environment |
| Enhanced data, career, networking | Unimplemented | Future scope |

## Iteration 3 additions

| Feature | Status | Evidence |
|---|---|---|
| Source-derived four-channel NES serial controller sampler and rising-edge transform | Implemented as isolated Classic primitive; original runtime parity **unverified** | `src/classic/OriginalInput.js`, `tests/original-input.test.js`, `docs/ORIGINAL_CONTROLLER_TRACE.md` |
| Source-derived original two-byte RNG update | Implemented as isolated Classic primitive; startup seed **unknown** | `src/classic/OriginalRandom.js`, `tests/original-random.test.js` |
| Interactive controller research lab, no gameplay claims | Browser-verified in standalone and modular ESM; mobile-emulated | `index.html`, `src/main.js`, `tools/browser_smoke.py`, `tools/browser_modular_smoke.py` |

## Iteration 4 additions

| Feature | Status | Evidence |
|---|---|---|
| Screen and match-subscreen jump-table lookup | Source-verified address metadata only; no handlers executed | `OriginalScreenDispatch.js`; 4+13 entry tests |
| Field Start/new-press pause toggle | Source-derived isolated branch; no complete Classic loop | `OriginalFieldLogic.js`; 256 mask tests; browser lab |
| Foul/cutscene flag helper | Source-derived local routine; NES runtime parity unverified | `OriginalFieldLogic.js`; 256 timer tests |
| Kickoff exit gate | Source-derived branch decision only; downstream transition unported | `evaluateOriginalKickoffGate`; Node/Chromium |

## Iteration 5 additions

| Feature | Status | Evidence |
|---|---|---|
| Goal subscreen 03 tile/timer/camera/skip/brightness direct byte writes | Source-derived isolated research; NES runtime parity unverified | `OriginalGoalCutscene.js`, 10 new Node tests, browser research panel |
| Goal cutscene external routines, original animations and sound | **Unimplemented** | 12 pre-timer calls plus `$D047/$D073/$C91A/$C2E4` are not executed |
| Kickoff `$C2AD` bank dispatch target | Address routing traced only, not implemented | `docs/ORIGINAL_GOAL_CUTSCENE_TRACE.md` |

## Iteration 6 additions

| Feature | Status | Evidence |
|---|---|---|
| Original fixed-bank A/B action-delay and direction-repeat buffer helper | **Source-local port; NES runtime parity unverified** | `OriginalActionBuffers.js`, 13 Node tests, Chromium lab |
| Original bank04 player-action/angle selection | **Entry and post-helper branch port; actual action effects unimplemented** | `OriginalPlayerAction.js`, 14 Node tests, Chromium lab |
| Original kickoff controller dispatch | **Call schedule only, no calls executed** | `$B4B2` trace, Node tests |
| Full original player action/ball physics and source parity | **Unimplemented** | KI-019; no original runtime reference |

## Iteration 7 additions

| Feature | Status | Evidence |
|---|---|---|
| Original script-bit0 `$B850` controller branch | **Source-local RAM operations implemented; NES runtime parity unverified** | `OriginalPossessionControl.js`, 16 tests, Chromium research UI |
| Original `$B4C9` alternate branch | **Unimplemented, explicitly blocked** | `stepOriginalScriptBit0ControlBranch`, `NEXT_ITERATION.md` |
| Build duplicate-declaration protection | **Implemented and build/Chromium-verified** | `tools/build.mjs` `vm.Script` guard |
| Original Classic football match | **Not playable** | No full action executor, physics, assets or reference parity |

## Iteration 9 additions

| Feature | Status | Evidence |
|---|---|---|
| Original bank06 pending action → movement ID arbitration | **Source-local RAM operations implemented; original runtime parity unverified** | `OriginalActionArbitration.js`, 21 Node tests, Chromium research lab |
| Metadata tables `$AC69/$AC87` with overlap | **Numeric bytes implemented; no move names inferred** | `readOriginalActionMetadata` and source trace |
| Original movement/ball/animation executor | **Unimplemented** | KI-024 |
| Replay input authenticity | **Known gap** | KI-025; state-inert edit passes existing state-only checks |

**Iteration 15:** Original weather-effect OAM initialization/update `$D993–$DA45` — isolated source opcode parity PASS; original player metasprites, graphics composition and NES runtime frame parity NOT IMPLEMENTED. Offline original PRG hash verification PASS. Classic Mode DISABLED.
