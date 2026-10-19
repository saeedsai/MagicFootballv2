# Original NES action-to-movement arbitration — iteration 9

**Pinned upstream:** `cyneprepou4uk/NES-Games-Disassembly` at `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`. **Source inspected directly:** `Kunio-kun no Nekketsu Soccer League/bank_06.asm` CPU `$AA14–$AABC`, lines approximately 6940–7085; metadata pointer `$AC65–$AC68` and bytes `$AC69–$AD40`, lines approximately 7295–7530. The source was read through the GitHub connector. `bank_ram.inc` lines 1312+ explicitly name `$0479` as player action number, and `$0459` as movement number in `bank_05.asm:$811E–$8165` initialization.

**Implemented:** `src/classic/OriginalActionArbitration.js` (`stepOriginalActionArbitration`, `readOriginalActionMetadata`, fixture builder). Pure native JavaScript operating on a 2 KiB synthetic RAM snapshot. **This is not a complete action executor**: no movement animation, collision, velocity, ball possession, shot physics, AI, or frame scheduling is executed. Original NES frame-level parity remains unverified.

## Source-to-JavaScript mapping

| NES location | Verified source operation | JavaScript | Limitation |
|---|---|---|---|
| `$AA14/$AA19–$AA23` | Choose metadata pointer `$AC87` or `$AC69`; store in scratch `$002C/$002D`. | `tableVariant`, RAM pointer bytes. | Caller selection/context not yet mapped. |
| `$AA25–$AA44` | Weather effect low 7 bits == 1, state nonnegative, skill bit 0 clear and surface ID 1 or 2 forces action `$06`. | Conditional write `$0479+player`. | No weather simulation. |
| `$AA47–$AA55` | Ignore negative action; require negative movement byte for processing. | Two early gates. | Action sign is not an English move name. |
| `$AA55–$AA72` | Test state bit6 against action metadata bit6, and state bit5 against metadata bit5. Rejected action is consumed. | Flag gates. | Exact source byte semantics only. |
| `$AA75–$AA92` | If state negative, require metadata bit7 before comparison. Otherwise compare immediately. | Negative-state flag gate. | No original runtime trace. |
| `$AA7A–$AA8A` | Read movement metadata priority and action metadata priority; if current priority is nonzero and >= candidate, retain movement. | Priority comparison. | Table values not interpreted as gameplay attributes. |
| `$AA94–$AAA9` | When accepted, replace movement with pending action unless movement low 7 bits already equal action; clear pending action to `$FF` on both accept and reject. | RAM writes `$0459`, `$0479`. | No movement executor/physics. |
| `$AAAC–$AABC` | Read the first/second bytes of two-byte metadata entries. | `readOriginalActionMetadata`. | Source tables bounded to audited region. |

The metadata pointer table is `$AC65: .word $AC87, $AC69`. The `$AC69` table has 30 bytes before `$AC87`, so lookup for action index >=15 naturally **crosses into the `$AC87` table**. The port preserves this contiguous read rather than inventing padding. Only source bytes `$AC69–$AD40` are embedded; an out-of-audited-range lookup throws rather than returning fabricated metadata. Table 0 supports IDs 0–92, table 1 IDs 0–107 within the audited range. **No football semantics have been assigned to any numeric ID.**

## Verification

- 21 new automated tests (`tests/original-action-arbitration.test.js`) cover pointer values, selected source table bytes, independently computed pinned-source FNV-1a `842d899c` for all 216 metadata bytes, deliberate table overlap, weather override, sign/state gates, priority accept/reject/tie, ready/not-ready behavior, invalid bytes and unsupported table reads, unrelated RAM preservation, and bank04 selector → bank06 arbitrator composition.
- Total **172 Node tests passed / 0 failed**, including all 151 previous tests.
- Chromium desktop standalone, 844×390 mobile emulation, and modular ESM exercise the new research panel and a controller→arbitration chain. No JavaScript page errors.
- Development replay unchanged: 240 frames, tick 235, hash `e6a26591`.
- **No lawful original-game reference execution or RAM trace was available**, so none of these source-derived tests proves NES gameplay equivalence.

## Newly observed separate QA limitation

The development replay validator hashes simulated state at checkpoints, **not the complete input tape**. A modification to the first frame's `dx` that does not alter the resulting state still passes verification; a gameplay-changing modification across frames 80–199 fails at frame 120. Record this as KI-025. State-drift detection works, but the current validator does not guarantee input-file authenticity; a future versioned replay schema needs an explicit input-content digest if that guarantee is required.

## Next source targets

1. Trace the call sites of `$AA14/$AA19` and when action arbitration runs relative to `$B4B2` and per-object updates.
2. Trace movement-ID consumers (`$0459`) and the action-to-animation/velocity/ball effect pipeline, starting from `bank_06.asm:$AACA+`, `$AD41+` and the relevant bank dispatches.
3. Build lawful frame-indexed original RAM fixtures and compare `$0479/$0459/$0486/$0466/$04F1/$0130` before and after the original routine.
4. Preserve Classic Mode disabled until the real native gameplay loop and parity tests exist. Never substitute development-match physics as original behavior.
