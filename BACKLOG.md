# Iteration 13 P0 backlog — authentic Classic graphics and behavior

1. Source-trace and runtime-verify all writes to `$05B8–$05BD`, calls to `$EE7D/$EE9A`, MMC3 CHR inversion and PPUCTRL sprite/background selection.
2. Port original OAM/metasprite generation, tile palettes, animation and actual character compositions; establish original NES screenshot/RAM fixtures.
3. Reconstruct complete original movement/ball/AI/frame loop and menus/teams/audio; do not unlock Classic or prioritize Enhanced until original parity is established.

---

# Updated P0 — actual original binary now verified

Original 128 KiB PRG + 128 KiB CHR are **verified**. Continue exact original OAM/meta-tile extraction, palette and CHR bank switching, animation, field/UI scenes, binary/source routine mapping, native source-faithful football, audio and reference-trace parity. Owner-private graphics inspector/CHR atlas is available; DO NOT use the provisional development match as a substitute Classic game.

---

# Owner's updated P0: full original binary-faithful reconstruction

Complete original bank-by-bank code+data inventory, verify lawful ROM/CHR SHA, recover original CHR tile bank switching, metasprite and palette/OAM placements, animation frame compositions, original menus/teams/audio, input→action→movement→ball/AI sequence, frame-indexed NES runtime comparison. Avoid expanding lookalike gameplay. Exact raw-CHR pixel decode (without sprite compositions) landed in iteration 10.

# Prioritized backlog

1. P0: lawful full original source, bank/routine inventory, exact fixed-bank reset/frame dispatcher, input data model and all gameplay state transitions.
2. P0: authoritative original reference-run fixture and frame-by-frame comparisons; clarify licensing and asset distribution permissions.
3. P0: independent ClassicRules and state model; port actual original input/timing and initial verified action; regression fixture.
4. P1: original physics/ball/AI/goalkeepers/menus and gameplay modes from source; original CHR palette/OAM and sound pipelines.
5. P1: physical Safari/Chrome mobile, keyboard, gamepads and multi-touch testing, plus automated visual golden screenshots.
6. P2: robust content schemas/import/export and Enhanced custom team/player database.
7. P2: character customization, appearance compatibility renderer, new abilities/animations, competitions.
8. P3: local multiplayer, persistent career slice, LAN authority, internet service (dependency-gated).


## Iteration 2 follow-up

- [ ] Obtain source routine-level coverage and identify NES controller polling, bit masks and frame update order.
- [ ] Generate lawful original input/RAM frame fixtures and verify source-derived Classic state transitions.
- [ ] Port one original mechanic into an isolated Classic engine with golden parity tests.
- [ ] Add replay seek/timeline and optional compressed input tapes (Enhanced only; defer behind Classic parity).
- [ ] Run replay verification across Firefox/Safari and physical mobile/gamepad hardware.

## Iteration 3 status and next priorities

- [x] Source-trace and port original serial controller read, stable sample and press/hold bit masks as isolated primitives.
- [x] Source-trace and port original two-byte RNG update as isolated primitive.
- [x] Provide an interactive original controller research lab without misrepresenting Classic Mode.
- [ ] Trace exact original controller-to-football action mapping and per-frame game-script dispatcher; add isolated native Classic input action adapter only when source verified.
- [ ] Obtain lawful original execution with frame-indexed RAM snapshots; verify input/RNG bytes against actual NES reference traces.
- [ ] Identify and port the original player movement and ball update routines with objective parity fixtures.

## Iteration 4 checkpoint

- [x] Trace original four-entry screen and thirteen-entry match subscreen jump tables.
- [x] Identify first original football action mapping: Start new press on channel 1 toggles pause bit in field subscreen 02; port and test.
- [x] Port original foul/cutscene helper and isolate kickoff gate decision with tests.
- [ ] Complete original kickoff-to-field transition (`sub_C2AD`, `sub_D01F`, `sub_D0D5`, palette/status writes), with frame/RAM reference.
- [ ] Trace original field action masks for pass, shoot, dribble, tackle and player selection through gameplay banks.
- [ ] Obtain lawful NES execution traces to compare original pause/foul/transition RAM at identical frame indices.

## Iteration 6 checkpoint and outstanding priorities

- [x] Decode and port original bank04 `$B8AB–$B9E2` post-helper action/angle selector with verified tables and entry gate (isolated research, no original-runtime parity).
- [x] Decode and port fixed-bank `$C07A → $FAEE–$FBA8` controller A/B delay and direction quick-repeat buffers.
- [x] Decode `$B4B2` kickoff call schedule (no execution of `$B850/$B4C9`).
- [x] Add 27 automated tests and browser research UI for helper→action chain.
- [ ] **P0:** trace downstream executor of `$0479` numeric action IDs, movement and ball consequences; no inferred move labels.
- [ ] **P0:** trace/port `$B4C9/$B850` and full per-player assignment/call order, then establish headless Classic loop with reference parity.
- [ ] **P0:** obtain lawful original frame-indexed controller/RAM fixture for `$056C/$0570/$057C/$0479/$04B0` and verify against NES execution.
- [ ] **P1:** finish original kickoff/goal scene dependencies and full physics/AI/graphics/audio port.

## Priority update after iteration 7

**P0:** complete source-derived `$B4C9–$B724` four-controller routine and `$B737` pointer/action tables; then locate actual consumers of `$0479` action IDs and their movement/ball side effects. Reconcile matched-slot vs ball-owner indexing and `$B8A8` index-3 opcode overread with lawful original NES RAM/frame traces. **P0 blocker:** no reference execution fixture. **P1:** preserve independent Enhanced rules, expand browser/device QA only after Classic source work. No Enhanced features moved ahead of Classic acceptance gates.

## Priority update after iteration 8

- [x] Source-locally port `$B4C9–$B724`, its seven group/four class pointers and raw action table, including `$B83D/$B844` overlap.
- [x] Invoke existing native `$FAEE` buffer helper and dispatch four controller slots on an isolated RAM fixture.
- [x] Add browser research UI and 20 tests for all twelve action offsets, source gate and four-slot ordering.
- [ ] **P0:** trace original `$0479` action executor, player movement, ball physics and animation consumers; avoid unverified move names.
- [ ] **P0:** establish actual original per-frame call order and compare RAM outputs against lawful NES execution traces.
- [ ] **P0:** implement a source-verified native Classic gameplay loop, with parity tests before unlocking Classic.
- [ ] **P1:** complete original kickoff, goal, AI, graphics and sound after legal/source gates.

## Priority update after iteration 9

- [x] Locate original `$0479` consumer at bank06 `$AA14–$AAAB` and port action→movement-ID arbitration, source flags/priority and metadata table overlap with 20 tests.
- [x] Compose original bank04 controller selector with bank06 arbitrator on a synthetic RAM fixture; keep Classic disabled.
- [ ] **P0:** trace original `$0459` movement-ID executor (`bank_06.asm:$AACA+`, `$AD41+` and callers) and its velocity/animation/ball side effects. Port one independently verified mechanic at a time.
- [ ] **P0:** map exact original call order for `$B4B2`, `$AA14/$AA19` and movement/ball updates; obtain lawful original frame-indexed RAM traces.
- [ ] **P0:** integrate source-backed Classic frame coordinator only when the required dependencies and reference tests exist.
- [ ] **P1:** add a versioned input-content digest to Enhanced replay files if input authenticity is required; existing state checks only detect simulation divergence (KI-025).
- [ ] **P1:** clear original art/audio distribution rights, perform physical device/gamepad QA, and continue full Classic modes/graphics/AI/audio parity work.

## After iteration 14 — binary-faithful next steps

- [x] Authenticate and port fixed-bank `$EE5A` OAM DMA and `$F05F–$F0B3` palette queue, add synthetic fixture browser and opcode tests.
- [ ] **P0** Trace OAM source RAM `$0200–$02FF` writers and animation/metasprite tables; extract real sprite tile/flip/priority/position compositions, not invented graphics.
- [ ] **P0** Trace palette RAM `$06D9–$06FB` producers and actual NES PPU frame palette values; verify with emulator-derived PPU/OAM/RAM snapshots.
- [ ] **P0** Reconstruct real NES frame ordering and movement/ball physics; keep Classic disabled until independently compared.
- [ ] **P1** Determine rights for any public distribution of copied game assets; local original import remains private.

## Iteration 15 update

- [x] Source-trace and port first real original OAM producer (`$D993–$DA45` weather sprites), independently differential-tested against original 6502 opcodes on synthetic RAM.
- [x] Verify original PRG import offline without bundling original assets; browser negative tamper checks.
- [ ] **P0** Source-trace original **player** OAM/metasprite builder (bank04 `$8100+`), pointer tables, animation frames, source CHR and palette registers.
- [ ] **P0** Obtain actual original NES emulator RAM/OAM/PPU/frame fixtures; synthetic isolated opcode tests do not prove runtime frame parity.
