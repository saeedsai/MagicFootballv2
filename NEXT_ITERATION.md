# Iteration 16 priorities — actual original player metasprites and NES frame evidence

1. Read `HANDOVER.md`, `docs/HANDOVER.md`, `docs/ORIGINAL_WEATHER_OAM_TRACE.md`, source mapping and test reports; resume latest local Git commit. Verify pinned upstream SHA `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`.
2. Trace original **player** OAM producer in bank04 around `$8100–$82C6` (RAM `$0200–$02FF`), its pointer tables, sprite priority and clipping; weather-effect OAM `$D993` is a verified separate slice, not a character substitute.
3. Port a bounded, source-backed player OAM branch and independently compare to original 6502 machine-code execution on synthetic RAM, then obtain actual original emulator RAM/OAM frame snapshots for true runtime parity.
4. Recover original CHR banks, PPUCTRL sprite-size mode, palettes, frame scheduling, animation indices, and metasprite compositions. Do not claim original RGB faces/poses from tile data alone.
5. Continue original movement, ball, AI, sound, menus, teams and all Classic modes in source order; Enhanced remains deferred. Preserve previous tests and provisional testbed.
6. Rerun private-ROM tests, build, browser smoke and replay. Exclude original ROM/PRG/CHR/audio from public source ZIP absent redistribution rights.
