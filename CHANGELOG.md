# v0.13.0 — source-derived original MMC3 CHR bank switching (2026-10-19)

- Audited pinned `bank_FF.asm` `$EE7D/$EE9A` and matched the two complete routine byte sequences in owner-supplied original PRG.
- Added native MMC3 CHR register writes and source-selected 1 KiB/2 KiB PPU tile mapping; browser inspector renders authentic user-provided CHR patterns at synthetic banked PPU addresses.
- Added 8 Node tests (224 total), private authentic-CHR browser smoke (desktop/modular/mobile), updated source mapping, status and handover. No original game frame/sprite/physics parity claim. Classic remains disabled; private original binary not committed.

---

# v0.12.0 — authenticated original ROM import and exact CHR graphics (2026-10-19)

- Verified owner-supplied ROM normalized to pinned full original binary SHA-1; differences confined to two NES header bytes.
- Added real NES 2.0 header support, CRC-checked ZIP cartridge import, private CHR extract, per-bank reference manifest, owner-private offline authentic tile viewer and full atlas montage.
- Added original input binary + browser QA, 216 passing Node tests, no development replay changes. No NES runtime/character sprite parity claimed; Classic remains disabled.
- Private graphics excluded from public Git/source build; no ROM execution or 6502 emulator in runtime.

---

# Changelog

## 0.1.0 — 2026-10-18, iteration 1

- Pinned upstream disassembly SHA and inspected bank entrypoints, RAM mapping, build pipeline and asset/movie manifest using GitHub tools.
- Created early CSV/JSON traceability and legal/provenance notes; recorded missing full source/parity.
- Implemented native enhanced development football match, Canvas renderer, menu and responsive controls.
- Added headless match and input tests, desktop/mobile-emulated Chromium smoke tests and standalone HTML build.
- Fixed keeper possession deadlock, handled localStorage-denied origins, and documented limitations.
- Original Classic Mode remains intentionally disabled.


## 0.2.0 — 2026-10-19

- Added deterministic input tape recorder and playback with versioned metadata, mode isolation and checksum validation.
- Added browser replay download/import controls, headless CLI verifier and committed golden fixture.
- Added immutable source-verified original RAM/screen/game-script identifiers without claiming Classic mechanics.
- Expanded regression and Chromium browser smoke suites; retained existing development gameplay.
- Archived the obsolete one-shot iteration-1 documentation generator to avoid accidental overwrites of maintained reports.

## 0.3.0 — 2026-10-19, iteration 3

- Traced original main-loop input/RNG call order, stable controller reads, serial bit layout and edge calculation in fixed bank FF at pinned upstream SHA.
- Ported original controller and two-byte RNG primitives to native JavaScript under `src/classic/`.
- Added original-controller research lab on home screen, without unlocking unverified Classic Mode.
- Added 15 automated unit tests and standalone/mobile/modular browser smoke coverage; unchanged development replay fixture.
- Expanded source traceability and documented original reference parity, hardware and legal limitations.

## 0.4.0 — 2026-10-19, iteration 4

- Re-inspected pinned fixed-bank source, mapping four screen and thirteen match subscreen jump-table entries.
- Ported field-subscreen Start/new-press pause toggle and original audio command arguments (without implementing original audio playback).
- Ported source-local foul/cutscene flag update and kickoff gate branch (not the full transition).
- Expanded isolated original controller lab with interactive pause and kickoff-state research.
- Added 17 Node tests (including exhaustive 256-byte Start masks and 256-value timer cases) and new standalone/ESM Chromium regression checks.
- Kept Classic locked, existing Enhanced rules unchanged and replay fixture unmodified.

## 0.5.0 — 2026-10-19, iteration 5

- Re-inspected original fixed-bank goal subscreen 03 and banked dispatch table at pinned upstream SHA.
- Ported direct RAM writes/branch conditions for goal tile-update flags, timer, camera target, Start/Select skip and brightness-complete reset at explicit pre/post external-call boundaries.
- Added browser goal cutscene research panel; all original external calls are logged as **unexecuted**, not simulated.
- Added 10 automated tests (88 total), including exhaustive 256-byte mask/brightness cases, timer thresholds, invalid-input guards and multi-step trace.
- Extended desktop/mobile/modular Chromium smoke checks, rebuilt offline standalone and preserved the unchanged `enhanced-dev-0.1` golden replay checksum `e6a26591`.
- Traced kickoff dispatcher selector `$17` to bank04 `$B4B2`, plus source-commented player action and shot/super routing; those target routines remain unported.
- Classic Mode remains disabled; no original asset copying, remote deployment or runtime parity claim.

## 0.6.0 — 2026-10-19, iteration 6

- Inspected original bank04 `$B4B2–$B4C8` and `$B8AB–$BA1A` plus fixed-bank `$C07A/$FAEE–$FBAA` at pinned upstream SHA.
- Ported source-local A/B hold-delay and direction-repeat buffers; ported post-helper player action/angle branch and entry gate; exposed kickoff call schedule without executing it.
- Added interactive original player-action and buffer lab; retained disabled Classic and unchanged Enhanced gameplay/replay.
- Added 27 new Node tests (115 total) and expanded Chromium desktop/mobile/ESM regression. Documented original runtime parity and downstream action execution blockers.

## 0.7.0 — 2026-10-19, iteration 7

- Re-read pinned bank04 source and ported `$B850–$B8AA` direct possession-controller branch to isolated byte-addressed native JavaScript; script-bit0 `$B4B2` route now executes this branch only.
- Preserved source-specific matched controller-slot action writes and fourth angle-index opcode read; alternate `$B4C9` remains explicitly blocked.
- Added 16 Node tests, a browser research panel and desktop/mobile-emulated/ESM smoke coverage; 131 tests pass, original NES runtime parity not verified.
- Fixed a standalone bundle duplicate-identifier issue discovered in this iteration; build now parses flattened JS before emitting HTML. No original assets, ROM or emulator included; Enhanced replay remains unchanged.

## 0.8.0 — 2026-10-19, iteration 8

- Inspected pinned bank04 `$B4C9–$B724` and `$B727–$B84F` disassembly via GitHub connector.
- Added native four-controller action selector, source group/class pointer tables and `$B83D` overlap; integrated existing native `$FAEE` button-buffer helper.
- Added full source-local `$B4B2` branch dispatcher and independent interactive browser research panel. Classic Mode remains disabled.
- Added 20 tests (151 total); all prior regression tests, replay checksum, desktop/mobile-emulated/ESM browser QA and 13 HTTP checks pass.
- Updated source traceability, plan, known issues, architecture, status, test reports and handover. No remote push/deployment.

## v0.9.0 — iteration 9 (2026-10-19)

- Added `src/classic/OriginalActionArbitration.js`, `tests/original-action-arbitration.test.js` (21 cases), and `docs/ORIGINAL_ACTION_ARBITRATION_TRACE.md`.
- Added a browser action arbitration panel and controller→arbitration research chain, updated standalone bundling and source traceability.
- Verified 172 Node tests, desktop/mobile-emulated/ESM Chromium, local HTTP 14/14, and golden replay unchanged.
- Identified KI-025: state-only replay checksums do not authenticate state-inert input changes. No change to Enhanced replay format this iteration.
- Classic Mode still disabled; no NES runtime parity, original football physics or remote deployment.

## 0.10.0 — original NES binary graphics foundation (2026-10-19)

- Shifted primary project direction explicitly to faithful original binary reverse engineering; development match is a separate provisional testbed only.
- Implemented native iNES v1 header/trainer/CHR extraction, exact planar 2bpp tile decode, neutral RGBA inspection palette, and source-pin Git blob/original ROM SHA-1 audit CLI.
- Added browser **Original NES Binary Graphics Inspector** with local `.nes`/`.chr` import, 256-tile pages, single-tile zoom, and optional WebCrypto source provenance check. No binary data is uploaded or bundled.
- Added 19 Node synthetic-binary tests and standalone/ESM Chromium graphics smoke; preserved prior gameplay replay and all 172 earlier tests.
- Fixed a too-broad browser test locator (`canvas` to `#field`) exposed by adding graphics canvases.
- Documented all missing original graphic composition, palettes, audio, features, gameplay parity and licensing requirements without claiming success.

## 0.11.0 — Iteration 11, original bank06 state/ball-action branch research

- Source-derived `$AAC3/$AAC8–$AB0A` movement metadata → player-state byte recomputation, including exact 6502 bit masking, signed Z-high threshold, scratch writes and 8-bit ASL indexing.
- Source-derived `$AB2A–$AB51` pending ball-action low-nibble priority branch and 24-byte `$AC4D` table; **not** the unported weather callback or physical action execution.
- 16 new synthetic RAM tests, new browser research panel and standalone/modular/mobile-emulated smoke checks; unchanged Enhanced development match/replay.
- Original graphics, full original frame logic and independent NES reference parity remain unavailable. Classic remains disabled.

## 0.14.0 — Iteration 14 original PPU transfer source port (2026-10-19)

- Ported fixed-bank `$EE5A` 256-byte OAM DMA and `$F05F–$F0B3` palette queue from pinned original disassembly with authenticated ROM opcode checks.
- Added NES palette address mirroring, 6-bit palette-index storage, PPUCTRL address increment and source zero-count 256-byte transfer behavior; invalid infinite-loop queue count rejected.
- Added browser PPU transfer lab and 9 Node tests; fixed standalone HTML string replacement-token corruption with final embedded-script parse gate.
- Classic remains disabled; no original NES PPU/OAM reference frame or assembled original sprites yet.
