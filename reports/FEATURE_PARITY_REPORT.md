# Original feature parity — iteration 6

**NOT ESTABLISHED.** Classic Mode is intentionally disabled. The source-local native JavaScript research now includes the original controller sampling/edges, RNG, dispatch addresses, pause/foul/kickoff and goal-cutscene byte branches, plus the fixed-bank action buffers and bank04 raw action/angle selection. **These do not execute original football actions, movement, ball physics, AI, original teams/menus, graphics or audio.** The numeric action IDs `$04/$05` are not verified shoot/pass labels. No original NES runtime input/RAM/frame reference comparison has been run. The playable `enhanced-dev-0.1` is an independent development ruleset. See `../CURRENT_STATUS.md`, `../docs/ORIGINAL_PLAYER_ACTION_TRACE.md`, and `LATEST_TEST_REPORT.md`.

## Iteration 7 scope

No original NES gameplay parity gate has passed. Source-derived `$B850` direct RAM writes are tested in isolation; no NES runtime trace, action execution, original graphics or audio is verified. Classic remains disabled.
