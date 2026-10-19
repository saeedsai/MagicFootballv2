# Source-derived Classic controller and random primitives — iteration 3

## Provenance and scope

Pinned upstream commit: `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`.

Source: `Kunio-kun no Nekketsu Soccer League/bank_FF.asm` at
https://github.com/cyneprepou4uk/NES-Games-Disassembly/blob/df2c8e55e7f13e5792482527db9e7c9e4a84c6e1/Kunio-kun%20no%20Nekketsu%20Soccer%20League/bank_FF.asm
and `bank_ram.inc` at
https://github.com/cyneprepou4uk/NES-Games-Disassembly/blob/df2c8e55e7f13e5792482527db9e7c9e4a84c6e1/Kunio-kun%20no%20Nekketsu%20Soccer%20League/bank_ram.inc

These are source-verified *local primitives*, not an original-game execution trace or NES gameplay parity. Source was read directly through GitHub connector. No copyrighted original ROM/CHR/DPCM bytes were copied into the project.

## Trace: fixed-bank main-loop ordering

| Upstream file:line | CPU address | Observed action | Native destination |
|---|---|---|---|
| `bank_FF.asm:1129–1136` | `$C486` | `INC` byte at `ram_frm_cnt` ($0300), then `JSR sub_C28A` | Frame counter and intervening routine not yet ported |
| `bank_FF.asm:1136` | `$C48C` | `JSR sub_EE35` | `src/classic/OriginalRandom.js:stepOriginalRandom` |
| `bank_FF.asm:1137` | `$C48F` | `JSR sub_EDCD` | `src/classic/OriginalInput.js:stepOriginalControllerInput` |
| `bank_FF.asm:1138–1144` | `$C492` | screen-ID based dispatch via `tbl_C4A3` | Not yet ported |

This establishes the relative order of these calls in the main loop, **not** a complete original frame timeline or proof of 60 Hz gameplay updates.

## Trace: original controller serial read

- `bank_ram.inc:13–25`: `ram_btn_hold = $0004` and `ram_btn_press = $0008` (four contiguous bytes each).
- `bank_FF.asm:8400–8422`, CPU `$EE06–$EE27`: strobe `$4016`; eight serial reads each from `$4016` and `$4017`. First `LSR` carries bit 0 into a `ROL` of channels 0/1, second `LSR` carries bit 1 into a `ROL` of channels 2/3. Eight `ROL`s place the first read in bit 7 and last read in bit 0.
- Button mask representation in those bytes: A `$80`, B `$40`, Select `$20`, Start `$10`, Up `$08`, Down `$04`, Left `$02`, Right `$01`. This is derived from the eight serial reads and shifts, **not** the original football action mapping.
- `bank_FF.asm:8362–8395`, CPU `$EDCD–$EDF5`: the active controller routine performs repeated reads and accepts a stable four-byte snapshot when consecutive reads match. Its loop has no explicit bounded retry.
- `bank_FF.asm:8396–8410`, CPU `$EDF7–$EE05`: for each of four bytes, compute `newPress = newHeld & (newHeld XOR oldHeld)`, then update `held = newHeld`.
- Native implementation: `decodeOriginalSerialRead`, `encodeOriginalSerialRead` (research adapter), `updateOriginalControllerEdges`, `stepOriginalControllerInput` in `src/classic/OriginalInput.js`.
- **Intentional browser safeguard:** native scanner throws after eight unstable attempts by default, without mutating the previous held/press state. The original assembly loops until stable, so this is a documented divergence for abnormal serial input only.

**Open questions:** exact NES accessory / multitap configuration, which of four logical channels are physically populated, NES controller-to-player assignments, how each button affects gameplay, and hardware sample timing. These cannot be inferred from the bit buffer alone.

## Trace: original two-byte RNG update

- `bank_ram.inc:118`: `ram_рандом = $0045`; the routine uses bytes `$0045` and `$0046`.
- `bank_FF.asm:8429–8456`, CPU `$EE35–$EE59`: compute carry from XOR of bit 1 of the two bytes, rotate byte `$0045` right with that carry, rotate byte `$0046` right with carry from old bit 0 of `$0045`, return the new byte `$0045`.
- Native implementation: `src/classic/OriginalRandom.js` (`createOriginalRandomState`, `stepOriginalRandom`). The controller lab advances this RNG **before** each controller scan to match the relative call order at `$C48C` / `$C48F`.
- **Unverified:** actual seed initialization, other callers, the RNG's relationship to gameplay randomness, and full original sequences from an authorized reference execution. The lab uses **arbitrary seed `$12,$34`** strictly for visualization.

## Independent tests and parity boundary

`tests/original-input.test.js`: serial order and bit channels, high-bit isolation, four-channel adapter, held/new-press transitions, releases, stable reread, bounded failure, malformed input, exhaustive 256×256 rising-edge truth table. `tests/original-random.test.js`: hand-computed byte vectors, feedback, carry propagation, zero state, validation, state-domain checks. `tools/browser_smoke.py` and `tools/browser_modular_smoke.py`: real Chromium UI exercise of the controller research lab and regression of the development match.

**Verification level:** JS algorithm matches inspected assembly operations at the cited addresses, supported by independent expected-value tests. **NOT verified:** actual original-game input/RAM snapshots, full Classic game loop, physics, art, sound, hardware behavior, or Classic playable mode. `tests/fixtures/development-input-tape.json` is a provisional development simulation tape, not an original reference.

## Iteration 4 follow-up

The first original gameplay action was traced: in match subscreen 02 (`bank_FF.asm` `$C615–$C63A`), `ram_btn_press` channel 1 Start bit `$10` toggles game-script pause bit `$80`. See `ORIGINAL_FIELD_TRACE.md` for the source-backed implementation, audio-command arguments, foul helper and kickoff gate. Other gameplay action mappings remain unverified.

## Iteration 7 follow-up

The source-local `$B850` controller branch now consumes the original raw `pressed` and `held` bytes in an isolated 2 KiB RAM fixture. This does not establish original frame sequencing or NES runtime parity. See `ORIGINAL_POSSESSION_CONTROL_TRACE.md`.
