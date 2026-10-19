# Verified iteration 12 features — original binary identity / CHR decoding only

- Exact owner-uploaded ROM identified as NES 2.0 mapper 4, 128 KiB PRG and CHR; normalized original whole-ROM SHA-1 matches pinned original assembly output.
- Original 128 KiB CHR Git blob identity verified; all 8192 real 8×8 tiles visualized in original data layout using neutral 2bpp inspection tones (NOT composed colored original sprites).
- Private/standard offline build separation, ZIP import validation, full per-bank SHA-256 provenance manifest and additional original-binary and browser tests.
- 216 automated tests passing with private reference, original-viewer Chromium smoke desktop/mobile, older development replay unchanged. **Original NES gameplay parity remains UNIMPLEMENTED.**

---

# Verified iteration 10 features (not original NES sprite or gameplay parity)

- Header bounds/trainer extraction, raw 2bpp tile decoding and neutral index inspection, local ROM/CHR file browser upload, CLI ROM/CHR hash audit, exact pixel-index browser smoke using synthetic fixture. Previous provisional match and native reverse-engineered action modules preserved. **Original sprite composition and original NES runtime parity NOT implemented or tested.**

# Completed features (enhanced development ruleset only)

- Headless deterministic seeded match state and pure tick progression.
- 12 simulated athletes: 10 outfield slots and 2 keepers.
- Two-side pursuit/support AI, keeper movement and clearance, player auto-selection and switching.
- Move, sprint, shoot, pass, contest/tackle; ball drag, rebounds, possession, goal reset, match clock, pause/full time.
- Canvas 2D field, procedural schematic players, HUD and responsive app UI.
- Keyboard remapping with duplicate rejection and persistence where permitted; gamepad mapping; four configurable touch action buttons + analog touch joystick; concurrent touch state.
- Generated modular distribution and offline standalone HTML without third-party runtime packages.
- Node tests and Chromium/Playwright smoke evidence.

No original Classic behavior, art, animation or music is marked complete.

## Iteration 2 (2026-10-19)

- Source-backed Classic metadata: original RAM/object/screen/game-script identifiers (no behavior port).
- Versioned deterministic development input recording, checksum checkpoints and playback verification.
- Browser Save Replay / Load Replay JSON, playback pause/resume, strict mode/rules validation.
- Offline replay verification CLI and committed 240-frame golden fixture.
- Node replay/fixture regression tests and Chromium replay import/export/incompatible-mode smoke.

## Iteration 3 — source-derived Classic primitives (not Classic gameplay)

- Native 4-channel serial controller decoder, stable consecutive reads and held/new-press bitmasks traced to upstream fixed-bank assembly.
- Native original two-byte random update, isolated from provisional Enhanced RNG.
- Interactive, touch-compatible original-controller research lab with arbitrary seed and scan-by-scan readout; development match unaffected.
- Ten new original-input tests and five original-RNG tests, plus desktop/mobile/ESM browser regression checks.

## Iteration 4 — source-derived match-state fragments (NOT a Classic match)

- Native original screen and match-subscreen jump table address lookup (four and thirteen entries), with safe invalid-index guards; no original handlers executed.
- Source-derived field-subscreen Start new-press → pause toggle and byte-level audio dispatcher command trace (actual audio engine unported).
- Source-derived foul/cutscene timer flag helper, and kickoff exit branch decision only; full kickoff state transition remains unported.
- Research lab integration plus 17 Node tests and standalone/modular browser tests; existing Enhanced development match and replay rules unchanged.

## Iteration 5 — source-derived goal subscreen research (not a Classic match)

- Implemented isolated `OriginalGoalCutscene.js` with tile flag `$05AB` mask, camera selection `$03AD`, cutscene timer `$05E2`, new Start/Select press `$0008` skip branch, weather `$0466` reset and brightness `$05B2` completion condition. The source's external dependencies are listed but **not executed**.
- Added goal-cutscene research controls and test instrumentation to the existing browser lab.
- Added ten tests (total 88) and desktop/mobile/modular browser checks.
- Preserved the existing independent development match and replay checksum. **This does not implement original goal animations, actual match scoring, NES reference parity or Classic Mode.**

## Iteration 6 (2026-10-19) — original action research only

- Source-derived native byte port of fixed-bank `$FAEE–$FBA8` A/B held delay, edge buffers and directional quick-repeat detection, with explicit persistent RAM-byte state.
- Source-derived original bank04 `$B8AB–$B9E2` player action/angle branch selector, entry gate and lookup tables; kickoff `$B4B2` call schedule as metadata only.
- Browser research panel that can step buffer state and trace action byte/angle outcomes without modifying the playable Enhanced development match.
- 27 new automated tests (115 total) and Chromium standalone/mobile-emulated/ESM smoke; original runtime parity **not** established.

No original football action execution, original art, full Classic game or sound is complete.

## Iteration 7 (2026-10-19) — isolated script-bit0 possession branch, NOT a Classic match

- Ported bank04 `$B850–$B8AA` byte-level control branch to native JavaScript on a 2 KiB RAM fixture; source-backed owner/controller-slot indexing, A/B press priority, channel-zero Start/Select check, held angle and 32-frame fallback.
- Executed only the verified `$B4B2` script-bit0 branch; the four-slot `$B4C9` alternative remains blocked and does not write RAM.
- Added an interactive browser research panel and 16 new Node tests (131 total). Standalone build now fails early on duplicate top-level declarations, a bug caught during this iteration.
- Existing Enhanced development match and replay code/fixture remain unchanged. Original runtime parity and Classic gameplay are still unverified/incomplete.

## Iteration 8 (2026-10-19) — native original alternate controller selector (NOT Classic gameplay)

- Ported source-local bank04 `$B4C9–$B724` selected-player gates, `$C07A/$FAEE` buffer invocation, seven group × four class pointer dereference, 12-entry numeric action tables and action/angle RAM writes; preserved `$B83D` table overlap.
- Added a full source-derived `$B4B2` dispatcher that executes either four controller-slot selectors or one `$B850` possession branch on an isolated RAM fixture.
- Added browser selector research panel and 20 new Node tests (151 total), desktop/mobile-emulated/ESM Chromium checks.
- No original action execution, movement/ball physics, NES runtime parity, sprites/audio or playable Classic Mode; Enhanced development match and replay unchanged.

## Iteration 9 — isolated action arbitration, NOT football execution

- Source-derived native bank06 `$AA14–$AAAB` action-to-movement arbitration: metadata flags, priority, weather override, action-consumption and conditional movement-ID replacement on synthetic RAM.
- Preserved source `$AC69/$AC87` overlapping metadata tables without assigning speculative football action names.
- Added controller→arbitrator browser research chain, 21 Node tests (172 total), desktop/mobile-emulated/ESM Chromium verification. Enhanced development match and golden replay fixture unchanged.
- **Not implemented:** original movement executor, ball physics, animation, frame loop or NES runtime parity. Detected state-only replay checksum authenticity limitation (KI-025).
