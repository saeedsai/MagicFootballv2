# Iteration 15 — actual checks (2026-10-19)

**Baseline:** Iteration 14 local commit `a5e6c9dedaa7701cab153130b4818e46475c2104`. **Source:** pinned `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`. **Original private ROM:** SHA-1 `f47c60143992c5f2e36a31c5f290900c54dc346e`; header-normalized SHA-1 `edf933eee8d6b99b7743367eda089b9850ce51ec` (exact pinned reference).

| Executed | Result |
|---|---|
| `KUNIO_ORIGINAL_ZIP=... npm test` | **243 passed / 0 failed / 0 skipped** (233 previous + 10 new) |
| Original `$D993–$D9D7` opcode and source tables | PASS against original owner ROM and pinned disassembly |
| Test-only 6502 machine-code execution vs native JS | PASS, 16 seeded RAM fixtures × 5 calls = **80 full 2 KiB RAM comparisons** |
| Offline SHA-1 vs Node crypto | PASS on 12 lengths including 262,160 bytes |
| `npm run check` | PASS |
| `npm run build` | PASS, 24 modular files + public standalone, embedded script syntax verified |
| `npm run replay:verify -- tests/fixtures/development-input-tape.json` | PASS, 240 frames, final hash `e6a26591` unchanged (development match only) |
| `tools/browser_smoke.py` | PASS desktop/mobile Chromium |
| `tools/browser_modular_smoke.py` | PASS imported ESM browser modules |
| `tools/browser_graphics_smoke.py` | PASS standalone/modular |
| `tools/browser_movement_smoke.py` | PASS standalone/modular/mobile |
| `tools/browser_verified_graphics_smoke.py` | PASS original CHR pixels standalone/modular/mobile |
| `tools/browser_chr_banking_smoke.py` | PASS standalone/modular/mobile |
| `tools/browser_ppu_transfers_smoke.py` | PASS standalone/modular/mobile |
| `tools/browser_weather_sprites_smoke.py` | PASS **new** standalone/modular/mobile; exact PRG verification, OAM init/update and mutated PRG rejection |
| Browser JavaScript page errors | 0 in all executed smoke scripts |

**Initial QA blockers resolved:** browser navigation was blocked by sandbox policy, so browser smoke used local in-memory `set_content` and verified an offline SHA-1 implementation rather than depending on unavailable secure-context WebCrypto. The isolated 6502 test interpreter initially lacked `LDY absolute` and was extended before full rerun. No failure is hidden.

**Not verified:** real NES emulator reference frame/RAM/OAM traces, actual player character sprite assembly, weather graphics/color parity, frame scheduling, original gameplay physics/AI/audio/menus/modes, physical phone/browser devices, internet deployment, remote Git push. Native weather OAM vs isolated original opcode parity on synthetic RAM is **not** original runtime frame parity. Classic Mode remains disabled. The user ROM and private CHR are excluded from source distribution.
