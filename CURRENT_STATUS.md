# Current status — iteration 13 (v0.13.0)

**New source-local CHR bank mapping:** exact fixed-bank `$EE7D/$EE9A` RAM→MMC3 writes, 1 KiB/2 KiB CHR address selection, browser original-CHR pattern-table inspector, verified against owner ROM PRG bytes and real CHR pixels. 224 Node tests passed; browser and development replay regressions passed. **Classic gameplay, assembled sprites, palette, animation and NES frame parity are NOT verified or implemented.** Original user ROM remains local and excluded from public release. See `docs/ORIGINAL_CHR_BANKING_TRACE.md`.

---

# Current status — iteration 12 (v0.12.0)

**Binary identity breakthrough:** owner-supplied `.nes` ZIP matches *all original PRG/CHR bytes* after changing only modern NES 2.0 header bytes 7 and 15 to the pinned iNES header; normalized complete-ROM SHA-1 `edf933eee8d6b99b7743367eda089b9850ce51ec`. 128 KiB original CHR matches the pinned Git blob exactly; 8192 authentic tiles can be inspected in a private offline browser build. This is source/data identity, **not original game runtime or composed sprite fidelity**. 216 tests pass; Classic Mode remains disabled. See `docs/ORIGINAL_ROM_PROVENANCE.md`.

---

# Current verified status — iteration 10 (v0.10.0)

**Owner directive:** full original NES reverse engineering **from the binary and assembly**, **all original art/features/code**. A similar-looking game is unacceptable. The existing `enhanced-dev-0.1` match is solely an engineering fixture, not original conversion.

**New:** native iNES v1/CHR binary parser and exact planar 2bpp pixel-index decoder; local original-graphics inspector loads externally supplied ROM/CHR (nothing uploaded), pages through tiles, and checks source Git blob SHA-1 where supported. Audit CLI checks pinned CHR blob and original ROM SHA-1. No authentic original CHR/ROM bytes are in this deliverable; no original sprites or original palette composition have yet been verified. See `docs/BINARY_TO_JS_PIPELINE.md`.

**Classic Mode remains disabled**. No original end-to-end gameplay parity or original composed sprites, and full ASM/asset coverage is still pending. Prior development engine retained untouched. Source pinned: `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`.

# Current status — iteration 9 (2026-10-19)

**Version:** `0.9.0`; **original source pinned:** `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`.

**Classic Mode: INCOMPLETE / DISABLED.** Bank04 controller selectors (`$B4C9` and `$B850`) and their action buffers are already implemented on synthetic 2 KiB RAM. **New this iteration:** bank06 `$AA14–$AAAB` pending action arbitration uses original `$AC69/$AC87` metadata to conditionally transfer action ID `$0479` into movement ID `$0459` and clear the pending action to `$FF`. A browser research lab can chain the two native ports on a synthetic RAM fixture. **This does not execute movement physics, animation, ball interaction, AI, a full Classic frame, or prove NES runtime parity.**

**Enhanced development match:** The provisional football game remains playable. `src/core/Match.js`, `src/core/Replay.js`, and the 240-frame golden replay fixture are unchanged. Golden replay final hash `e6a26591` (tick 235).

**QA:** **172 Node tests passed / 0 failed / 0 skipped** (151 previous + 21 new). Syntax, modular and standalone builds pass. Desktop Chromium, 844×390 mobile landscape emulation, modular ESM, **14/14 HTTP GET**, golden replay, and a gameplay-changing tampered replay rejection passed with zero browser JS errors. **New limitation:** a state-inert first-frame input edit passes the existing state-only checksum validator (KI-025). No original NES RAM parity, physical phone/gamepad or Safari/Firefox/Edge tests were performed.

**Blockers:** lawful original NES frame-indexed RAM reference, original movement-ID executor and frame ordering, original graphics/audio distribution permissions, and full original gameplay systems. No remote GitHub deployment or push. Next: trace movement-ID consumers (`bank_06.asm:$AACA+`, `$AD41+`) and original per-frame action→movement→ball execution.

## Iteration 11 (v0.11.0) — movement-state and ball-action branch audit

The pinned bank06 `$AAC3/$AAC8–$AB0A` state-bit recomputation and `$AB2A–$AB51` pending ball-action priority branch now have **native JavaScript, source-local** implementations. Both use exact audited original metadata/table bytes and synthetic RAM fixtures; unsupported reads are rejected. The new browser research panel exposes both. **These are not original movement physics, ball trajectories, metasprite graphics, a complete Classic frame, or independent NES parity.** The unverified development match remains separate; no original binary/graphics/audio are packaged. See `docs/ORIGINAL_MOVEMENT_TRANSITION_TRACE.md`, `reports/LATEST_TEST_REPORT.md`.

## Iteration 14 (v0.14.0) — original PPU palette and OAM DMA transfer routines

**Classic Mode remains INCOMPLETE / DISABLED.** Original fixed-bank `$EE5A` OAM DMA and `$F05F–$F0B3` PPU palette queue are now source-derived native JS with verified opcode bytes against the owner ROM. This only transfers synthetic RAM bytes to OAM/palette-index memory in a research state; **original sprite poses, palette contents, animation, frame timing and NES runtime parity remain unverified**. Enhanced development match remains isolated and unchanged. 233/233 Node tests pass with original ZIP, seven Chromium smoke scripts pass, replay `e6a26591` unchanged. Details in `docs/ORIGINAL_PPU_TRANSFERS_TRACE.md` and `reports/LATEST_TEST_REPORT.md`.
