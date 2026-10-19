# Original NES script-bit0 possession-control branch — iteration 7

**Pinned source:** `cyneprepou4uk/NES-Games-Disassembly`, commit `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`, `Kunio-kun no Nekketsu Soccer League/bank_04.asm`, source lines 12650–12666 and 13290–13334, CPU `$B4B2–$B4C8` and `$B850–$B8AA`.

**Scope:** native JavaScript execution of **one** original controller branch, on an explicit 2 KiB byte-addressed NES CPU RAM fixture. This is **not** a 6502 interpreter, an emulator, an original-game frame update, or original-runtime parity. The full Classic match remains disabled.

## Source-to-native branch map

| Source CPU address | Source-observed operation | Native branch / RAM write |
|---|---|---|
| `$B4B2–$B4BB` | If script `$005C & $01`, call `$B850` once and return. | `stepOriginalScriptBit0ControlBranch` invokes the port. |
| `$B4BE–$B4C8` | Otherwise call `$B4C9` for slots 0–3. | Returns four **unexecuted** calls; does not mutate RAM. |
| `$B850–$B856` | `AND` of control-position bytes `$0650` and `$0651`; branch to fallback when both sign bits set. | Exact bitwise sign gate; no invented boolean control mode. |
| `$B858–$B865` | Scan selected-player bytes `$0568 + slot` for a match to ball-owner byte `$04D6`. | First match in slots 0–3 wins. |
| `$B87E–$B882` | New A press `$0008 + slot` bit `$80` writes action `$0A`; else new B press bit `$40` writes `$09`. | Writes **`$0479 + controllerSlot`**, not `$0479 + ballOwner`. This distinction is source-derived and intentional. |
| `$B885–$B889` | New Start/Select mask `$30` is read from **channel zero** `$0008`, regardless of matched slot. | Writes action `$0A` at matched controller-slot index. |
| `$B88B–$B89B` | With no above press, held slot buttons shifted right twice and masked `$03` index angle table `$B8A8`. | Writes `$04B0 + ballOwner`; table indexes 0,1,2 read `$00,$80,$00`. **Index 3 reads `$86`, the first opcode byte at `$B8AB`, because the declared table has only 3 bytes.** This is an observed out-of-table read, not a designed fourth entry. |
| `$B867–$B86C` | If no matched slot (or both control positions negative), return unless frame byte `$0300 & $1F` is zero. | 32-frame cadence; no write on other frames. |
| `$B86E–$B87B`, `$B8A2–$B8A7` | Set `$067E + owner` to `owner OR $12`, then `$0479 + owner` to `$0A`. | Two direct RAM writes, including byte index arithmetic; no guessed gameplay semantics. |

The numeric action values `$09/$0A` have **not** been proven to represent specific football moves; no animation, movement, ball, AI or audio action execution is implemented. The source's use of controller slot for the matched action write may appear unusual; do **not** silently change it to owner index. The fourth angle lookup at `$B8AB` crosses the table boundary and is recorded explicitly for future original-run verification.

## Implementation and tests

- `src/classic/OriginalPossessionControl.js`: `createOriginalPossessionRam` fixture builder; `stepOriginalPossessionControl` direct branch port; `stepOriginalScriptBit0ControlBranch` safe, explicitly blocked alternate path. Inputs are unsigned bytes; RAM must be a `Uint8Array` with at least `$0800` bytes.
- `tests/original-possession-control.test.js`: 16 tests for A/B priority, channel-zero Start/Select, first matching slot, control-position sign, 32-frame cadence, `$FF` owner address arithmetic, index-3 opcode read, 256 press masks, 4096-call deterministic tape, invalid input, and blocked `$B4C9` path.
- `index.html` / `src/main.js`: interactive research form for script, owner, frame, matched slot, button masks and control-position bytes; trace shows actual RAM addresses/values. The panel is separate from the Enhanced match and never starts Classic Mode.
- `tools/build.mjs`: validates concatenated standalone JavaScript syntax with `vm.Script`, preventing a duplicate-declaration failure discovered while integrating the new module.

**Validation boundary:** Unit tests check a source-derived model against independently encoded expected branch outcomes; Chromium verifies UI and module loading. **No** frame-indexed original NES RAM trace, original ROM execution, sprite/audio parity or actual Classic football match was tested. Original source/CHR/DPCM/ROM binaries are not redistributed.

## Next work

Port `$B4C9–$B724` carefully, including the `$B737` seven-group → four-class → twelve-entry pointer tables, `$C07A` buffer side effects, and the caller's exact RAM order. Do not integrate with an original Classic match until actual action consumers, frame ordering and original-reference parity are established. Investigate the `$B8A8` index-3 overread with an original-run RAM trace.
