# Iteration 13 mapping: fixed-bank original MMC3 CHR writes

`SRC-043`: pinned `bank_FF.asm` `$EE7D–$EE99` reads `$05BC/$05BD` and writes MMC3 R0/R1, mirrored through `$004E`. `SRC-044`: `$EE9A–$EED2` reads `$05B8–$05BB` and writes R2–R5. `SRC-045`: MMC3 CHR register semantics resolve source-selected 1 KiB PPU banks to authenticated original 128 KiB CHR tile indices. Native destination: `src/classic/OriginalChrBanking.js`; tests: `tests/original-chr-banking.test.js` and `tools/browser_chr_banking_smoke.py`. The actual original frame bank values and timing, palette/OAM/metasprites and original sprite rendering are **NOT VERIFIED**. Details in `ORIGINAL_CHR_BANKING_TRACE.md`.

---

# Binary graphics mapping — Iteration 10

`CHR_ROM.chr` (`131072 B`, upstream Git blob `e62db8eeaa386d65ff741847bd8d01cecdada00f`) → `src/classic/NesBinaryAssets.js:decodeTile` / `extractCHR` / `inspectOriginalCHR`; tests `tests/nes-binary-assets.test.js` and `tools/browser_graphics_smoke.py` use **synthetic fixture data**, not authentic graphic captures. Status **Partial / decoded tiles only**. Original palette, OAM/metasprite construction, CHR switching and animation source code mapping remain **NOT ANALYZED**, no conversion or original parity claim.

# Assembly-to-JavaScript mapping

**Early inventory, not a complete routine-level trace.** Every row in [`ASSEMBLY_TO_JS_MAPPING.csv`](ASSEMBLY_TO_JS_MAPPING.csv) has its evidence, proposed destination and status. The eight banks have not yet been analyzed end-to-end. “Partial” describes traceability or independent engineering scaffolding, **never verified original parity**.

| Source IDs | Main findings | Remaining work |
|---|---|---|
| SRC-001–004 | Object slot constants, input buffers and gameplay state variables identified in upstream source | Reconstruct their consumers, bit layout and timing |
| SRC-005–012 | Bank dispatch exports inspected | Classify all functions, data regions, reset/NMI and cross-bank graph |
| SRC-013–014,018 | Build preparation and assembly inputs inventoried | Reproduce build only if legally permitted and useful for parity |
| SRC-015–017 | CHR/audio binaries and reference movies identified | Obtain permissions and legal fixtures; decode art/audio and establish visual/test evidence |

## Iteration 2 traceability addition

`SRC-019` records original screen and match-script **identifiers** from `bank_ram.inc:160-185` in `src/classic/OriginalStateIds.js` and checks values in `tests/replay.test.js`. This is not a port of state transitions. Input-frame replay (`src/core/Replay.js`) is independent infrastructure, not an original ASM mapping.

## Iteration 3: source-derived code, not just metadata

`SRC-020–022` trace the fixed-bank main-loop call order, controller serial-read and rising-edge transform, and two-byte RNG update to `src/classic/OriginalInput.js` and `src/classic/OriginalRandom.js`. Exact CPU addresses and bounded-retry deviation are documented in [`ORIGINAL_CONTROLLER_TRACE.md`](ORIGINAL_CONTROLLER_TRACE.md). These are independently tested Classic **primitives**, not a working Classic football match and not reference-runtime parity. The old `SRC-002` row remains a record of the provisional Enhanced input adapter, not this original port.

## Iteration 6: controller action buffer and player action selection

`SRC-030–032` map original `$B4B2` kickoff call schedule, bank04 `$B8AB–$B9E2` entry gate and post-helper action/angle selection, and fixed-bank `$C07A → $FAEE–$FBA8` controller action buffer logic. These are source-local JavaScript ports and an unexecuted call schedule, **not** a running original Classic match. The internal action IDs are numeric and their football semantics are not yet established. Detailed source addresses, RAM fields and limitations: [`ORIGINAL_PLAYER_ACTION_TRACE.md`](ORIGINAL_PLAYER_ACTION_TRACE.md).

## Iteration 7 — original script-bit0 possession branch

`SRC-033` maps `$B850–$B8AA` to `OriginalPossessionControl.js`: source-local RAM writes for matched controller A/B, channel-zero Start/Select, held-angle table and 32-frame fallback. `SRC-034` maps `$B4B2` script bit0 to an executable `$B850` path and explicitly blocked four-slot `$B4C9` path. `SRC-035` records the unported `$B4C9–$B724` table-driven action routine as the next trace target. See [`ORIGINAL_POSSESSION_CONTROL_TRACE.md`](ORIGINAL_POSSESSION_CONTROL_TRACE.md). No original runtime parity.

## Iteration 8 superseding mapping

`SRC-035` now maps `$B4C9–$B724` to `OriginalAlternateController.js` with the `$FAEE` helper, seven group/four class pointer selection and raw action/angle RAM writes. `SRC-036` maps the executable two-branch `$B4B2` dispatcher; `SRC-037` maps `$B727–$B84F` lookup data, including the `$B83D/$B844` overlap. The older limited `$B850` preview still reports four unexecuted calls **only within that preview**; the new dispatcher executes them. See `ORIGINAL_ALTERNATE_CONTROLLER_TRACE.md`. Original NES runtime parity and action execution remain unverified.

### Iteration 9 — bank06 action arbitration (source-local only)
Pinned bank_06.asm `$AA14–$AAAB` and metadata `$AC65–$AD40` were inspected and ported into `src/classic/OriginalActionArbitration.js`. It can consume a pending `$0479` action and conditionally replace `$0459` movement on synthetic RAM, preserving weather and state gates and metadata-table overlap. See `docs/ORIGINAL_ACTION_ARBITRATION_TRACE.md`. This **does not** execute original movement, ball physics, animations or a Classic frame; original NES runtime parity remains blocked.

### Iteration 15 source mapping

`bank_FF.asm` pinned `$D993–$DA45` and five weather OAM tables `$DA46/$DA52/$DA5E/$DA6A/$DA76` → `src/classic/OriginalWeatherSprites.js` (actual source weather-effect OAM producer). Authenticated original PRG is read from the user's private `.nes`, not embedded. Native JS matches original isolated 6502 opcode execution on 80 synthetic RAM fixtures; no NES frame parity. Details in `ORIGINAL_WEATHER_OAM_TRACE.md`.
