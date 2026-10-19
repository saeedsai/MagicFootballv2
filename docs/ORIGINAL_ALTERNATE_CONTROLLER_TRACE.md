# Original NES four-controller action selector — iteration 8

**Pinned disassembly:** `cyneprepou4uk/NES-Games-Disassembly` at `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`, `Kunio-kun no Nekketsu Soccer League/bank_04.asm`, lines **12670–13289**, CPU `$B4C9–$B724`, tables `$B727–$B84F`. Direct excerpts inspected using the GitHub connector, not inferred from the development match. Helper `$C07A` targets previously ported `$FAEE–$FBA8` in `OriginalActionBuffers.js`.

**Implementation:** `src/classic/OriginalAlternateController.js`, native byte operations on a 2 KiB `Uint8Array` RAM snapshot. This is neither a ROM interpreter nor a NES emulator. `stepOriginalControllerDispatch` now chooses the original `$B4B2` branches: script bit 0 clear → four `$B4C9` calls, script bit 0 set → one `$B850` call. The earlier, deliberately limited `stepOriginalScriptBit0ControlBranch` preview is retained for backwards compatibility and continues to report its own alternate calls as unexecuted; use the **new** full dispatcher for both branches. Neither dispatch is connected to the actual original game frame update.

## Source-derived branch map

| CPU source | Native operation | Verified scope |
|---|---|---|
| `$B4C9–$B4DE` | Save slot `$0043`; gate on `$0568+slot` selected player, `$0650+player` control sign and `$0479+player` existing action sign. | Direct byte gate; skipped slots never call buffer helper. |
| `$B4E0–$B504` | Invoke `$C07A`/`$FAEE` for slot; copy `$0004/$0008/$056C/$0570/$057C` to `$001D–$0021`. | Existing native buffer helper, now actually called by selector. |
| `$B505–$B578` | Classify from `$005C` bit6, `$0486` state, player index, owner `$04D6`, ball `$0492`, flags `$067C`, team flags `$052A/B`, pass directions `$067A/B`. | Six reachable group indices 0–5 observed in this branch; group 6 data exists but no reachable branch identified. |
| `$B578–$B5AE` | First pointer from `$B737` (seven groups); second pointer from four-class tables `$B745–$B77C`; write `$002E/F`, `$002C/D`. | 7×4 pointers stored as source address constants. |
| `$B5B0–$B614` | Negative-state timer/movement/new-press override `$45`; otherwise high action-buffer bit tests select table offsets 0–3. | Preserves `$FF` as negative sentinel, not a football action. |
| `$B614–$B647` | First ASL/sign gate; owner/ball movement `$0A` and held-direction tests select offsets 4–6. | Preserves the accumulator value on failed table lookups. |
| `$B647–$B696` | Second ASL/sign gate; player movement `$02`, direction, and parity tests select offsets 7–11. | All 12 offsets exercised in automated tests. |
| `$B696–$B724` | Negative state can update angle only; nonnegative fallback writes raw `$2A/$27/$24/$25/$1D/$21/$20/$01` depending on movement, state and quick-repeat buffer. | Writes `$0479+player`, sometimes `$04B0+player` via `$B727` angle lookup; no action effects executed. |

### Table provenance and quirks

The source group order is `$B745`, `$B74D`, `$B755`, `$B75D`, `$B76D`, `$B765`, `$B775`. Notice **group 4 points to `$B76D` and group 5 to `$B765`**, not monotonically ordered. Each group selects four pointer addresses; each pointer indexes 12 action bytes. `$B83D` declares only **seven** bytes before `$B844`; its 12-byte indexed lookup continues into the next table. The implementation preserves this overlap by laying out the source bytes contiguously, rather than padding or synthesizing five missing bytes.

Action numbers such as `$35`, `$33`, `$30`, `$45`, `$24`, `$2A` are **uninterpreted original numeric IDs**. Neither their football meaning nor the routines that consume `$0479` have been verified. No new actions were wired into the playable development match. The full Classic mode remains disabled.

### Test and browser evidence

- `tests/original-alternate-controller.test.js`: **20 new passing tests** including exact pointer/data values, all 12 offsets, 256 player-state classes, 2,048 deterministic varied fixtures, 4-slot multi-player ordering, source gate rejections, byte validation, helper integration and both script-bit0 branches.
- `tools/browser_smoke.py` and `tools/browser_modular_smoke.py`: desktop standalone, mobile-landscape Chromium emulation, modular ESM, raw action/table lab interaction and rejection of out-of-range input; no JS page errors.
- `reports/LATEST_TEST_REPORT.md`: full **151/151 Node** regression, replay fixture `e6a26591`, negative replay rejection, HTTP checks.

### Remaining verification and risks

1. **P0 original execution parity:** No lawful NES frame-indexed RAM trace is available. Unit tests compare source-derived expected branches, not live original-game execution.
2. **P0 action executor:** Identify every consumer of `$0479` and movement/ball state writes; map raw action IDs to actual animation/physics only after source evidence.
3. **P0 frame ordering:** Confirm when `$B4B2` is invoked relative to input sampling, per-player updates, ball physics and state transitions. The lab executes a selected routine on a synthetic fixture, not a real frame.
4. **P1 reference assets:** Original graphics/audio redistribution rights remain unresolved; no ROM, CHR or DPCM bytes included.
5. **P1 hardware/browser matrix:** Physical gamepad, phone, Safari/Firefox/Edge not tested.
