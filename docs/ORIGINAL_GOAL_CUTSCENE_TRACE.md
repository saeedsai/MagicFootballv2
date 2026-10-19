# Original NES goal cutscene — direct RAM operations (iteration 5)

**Pinned source:** `cyneprepou4uk/NES-Games-Disassembly` at `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`, `Kunio-kun no Nekketsu Soccer League/bank_FF.asm`, source lines **1410–1498** (CPU `$C699–$C71B`). Exact line numbering is from the pinned GitHub reader. Source URL: https://github.com/cyneprepou4uk/NES-Games-Disassembly/blob/df2c8e55e7f13e5792482527db9e7c9e4a84c6e1/Kunio-kun%20no%20Nekketsu%20Soccer%20League/bank_FF.asm

**Scope:** `src/classic/OriginalGoalCutscene.js` ports only the *direct byte writes and conditional branches* at known boundaries. It does **not** run a goal scene in the original game. The 12 external routines between the initial tile flag and timer branches are not ported, nor are the calls after those branches. The browser research lab supplies snapshots as if those dependencies had returned. Runtime parity against an executing NES has **not** been measured.

## Source-derived direct writes

| CPU source location | Read / write | Source-derived rule | JS API |
|---|---|---|---|
| `$C699–$C69E` | `$05AB` screen tile-update flags | `flags &= $CF`, clearing bits 4 and 5 | `prepareOriginalGoalCutsceneFrame` |
| `$C6C5–$C6D9` | `$05E2` timer, `$005C` game script, `$04D6` ball owner, `$03AD` camera | When timer >= `$20` and game-script bit `$02` set, camera object = `(ballOwner & $0F) | $40` | `stepOriginalGoalCutscenePostUpdates` |
| `$C6DC–$C6ED` | `$05E2`, new-press `$0008` | If timer < `$40`, Start/Select new press mask `$30` skips; otherwise timer increments modulo 256 | same |
| `$C6F0–$C706` | `$05E2`, `$0466` weather effect | If timer is `$40..$FE`, or new Start/Select press below `$40`, call **unported** `$D047`, call audio dispatcher `$C2E4` with `$00`, set timer `$FF` and weather effect `$00`; timer `$FF` is a latch | same |
| `$C706–$C71B` | brightness `$05B2`, `$005C`, `$05E2` | After **unported** `$D073`, only brightness bits `$C0` together trigger **unported** `$C91A` then zero game script and timer | same |

## External calls and boundary contract

The entry path executes `$DE0B`, `$DE47`, `$CAEE`, `$C2AD`, `$C24E`, `$C271`, banked `$BD6A`, `$C2A3`, `$C285`, `$F3A5`, `$C29E`, `$C299` **between** the tile-mask and timer logic. `prepareOriginalGoalCutsceneFrame` returns these twelve call addresses for provenance; **it does not execute them**. The caller must supply state **after** those calls before using `stepOriginalGoalCutscenePostUpdates`. The latter logs unexecuted calls to `$D047`, `$C2E4` (audio command 00), `$D073`, and `$C91A` in source order. Its `brightnessFlag` input must be the value after `$D073` (the routine is not implemented). This two-stage API avoids pretending an entire Classic frame is reconstructed.

The source jump table maps match subscreen 03 to `$C699`; the lab never invokes the original dispatcher. The code does not access a ROM, run a CPU emulator, decode original sprites, or change the `enhanced-dev-0.1` match/replay logic.

## Independent tests and limitations

`tests/original-goal-cutscene.test.js` checks all 256 tile flag values, all 256 new-press masks, all 256 brightness values, timer `$00/$1F/$20/$3F/$40/$FE/$FF`, all automatic-finish timer values, camera retarget cases, call order, invalid-input atomicity and multi-step progression. Browser tests exercise timer increment, camera, skip, brightness, reset in standalone Chromium, mobile landscape emulation and modular ESM. **These are JavaScript branch tests, not NES reference frame comparisons.** Real original frame/RAM traces, the complete goal sequence and its dependencies remain blockers.

## New bank-dispatch trace for kickoff/action work

Pinned `bank_FF.asm` `$C2AD–$C2B1` loads banked-dispatch selector `$17` and jumps to `$C344`. `tbl_C370` at `$C39E` maps selector `$17` to bank 04 entry `ofs_028_0x010025_17` (`bank_04.asm` `$8015`), which jumps to `$B4B2`. **The logic at `$B4B2` is not yet analyzed**, so this is a routing finding, not a port of `$C2AD`.

Other banked dispatch selectors identified in `tbl_C370` (not yet semantically ported): `$0F` -> bank 04 `$8018` -> `$B8AB` (individual player button-action calculation); `$20` -> bank 04 `$801B` -> `$BDE3` (shot animation); `$21` -> bank 04 `$801E` -> `$BA1B` (super attempt); `$22` -> bank 04 `$8021` -> `$BB1E` (shot initial physics); `$23` -> bank 04 `$8024` -> `$BBEC` (super initial physics); `$24` -> bank 04 `$8012` -> `$BCE3` (next super). Labels/descriptions come from comments in the fixed-bank dispatch table; actual gameplay semantics and button masks still require full routine analysis. **Do not infer pass/shoot mapping from the labels alone.**
