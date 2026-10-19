/**
 * Source-confirmed identifiers ONLY, not a Classic simulation implementation.
 * Verified against pinned upstream bank_ram.inc and bank_val.inc on 2026-10-19.
 * Comments in the disassembly document values; their runtime semantics remain
 * unverified until control flow and reference frame traces are reconstructed.
 */
export const SOURCE_SHA='df2c8e55e7f13e5792482527db9e7c9e4a84c6e1';
export const ORIGINAL_RAM=Object.freeze({
  BUTTON_HOLD:0x0004,BUTTON_PRESS:0x0008,
  SCREEN:0x0058,SCREEN_SUBTYPE:0x0059,GAME_SCRIPT:0x005c
});
export const ORIGINAL_OBJECT_SLOTS=Object.freeze({
  FIRST_FIELD_PLAYER:0x00,LAST_FIELD_PLAYER:0x09,
  FIRST_KEEPER:0x0a,LAST_KEEPER:0x0b,BALL:0x0c,WEATHER:0x0d
});
export const ORIGINAL_SCREEN=Object.freeze({MATCH:0x00,INTRO:0x01,MENU:0x02,CUP:0x03});
export const ORIGINAL_MATCH_SUBSCREEN=Object.freeze({KICKOFF:0x01,FIELD:0x02,GOAL:0x03,OUT:0x06});
export const ORIGINAL_GAME_SCRIPT=Object.freeze({
  NORMAL:0x00,KICKOFF:0x01,FOUL:0x20,TIME_EXPIRED:0x40,
  GOAL:0x42,OUT:0x44,CORNER_OR_GOAL_KICK:0x48,PENALTIES:0x60,PAUSE:0x80
});
