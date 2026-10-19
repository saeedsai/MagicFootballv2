/**
 * Native ports of SMALL, source-confirmed NES match-state routines.
 * Pinned source: bank_FF.asm at df2c8e55e7f13e5792482527db9e7c9e4a84c6e1.
 * $C615-$C63A: Start new-press toggles game-script pause bit.
 * $C87B-$C89B: pending foul bit and cutscene timer update.
 * $C5B3-$C5C9: kickoff-to-field BRANCH ONLY (not the full transition).
 * This does NOT implement the original full field update, audio engine,
 * state initialization, game physics, or frame-level NES parity.
 */
import {NES_BUTTONS} from './OriginalInput.js';

const isFieldByte=n=>Number.isInteger(n)&&n>=0&&n<=255;
const assertByte=(n,name)=>{if(!isFieldByte(n))throw new TypeError(`${name} must be a byte (0..255)`);};
export const ORIGINAL_FIELD_FLAGS=Object.freeze({PAUSED:0x80,FOUL_PENDING:0x20,BALL_HIGH:0x80,BALL_AIR:0x40});

/** Research state: byte fields are RAM values, NOT a complete NES memory image. */
export function createOriginalFieldResearchState({gameScript=0,musicId=0,ram06fd=0,ballState=0,cutsceneTimer=0,formationVariant=0}={}){
 const fields={gameScript,musicId,ram06fd,ballState,cutsceneTimer,formationVariant};
 for(const [name,value] of Object.entries(fields))assertByte(value,name);
 return fields;
}
function validateField(s){
 if(!s||typeof s!=='object')throw new TypeError('field state is required');
 for(const name of ['gameScript','musicId','ram06fd','ballState','cutsceneTimer','formationVariant'])assertByte(s[name],name);
}

/**
 * CPU $C615-$C63A, field subscreen 02 only.
 * $0008 bit $10 (NEW Start press) XORs $005C with $80.
 * Enter pause: $06FD=0; original calls audio dispatcher $C2E4 with A=0 then A=$2D.
 * Leave pause: original calls audio dispatcher $C2E4 with A=$055A music ID.
 * Commands are logged as BYTES, not played: audio engine has not been ported.
 * The following paused/active frame routines are not part of this function.
 */
export function stepOriginalFieldPause(s,pressed0){
 validateField(s);assertByte(pressed0,'pressed0');
 if(!(pressed0&NES_BUTTONS.START))return {changed:false,paused:!!(s.gameScript&0x80),audioCommands:[]};
 s.gameScript^=0x80;
 if(s.gameScript&0x80){s.ram06fd=0;return {changed:true,paused:true,audioCommands:[0,0x2d]};}
 return {changed:true,paused:false,audioCommands:[s.musicId]};
}

/**
 * Complete local $C87B-$C89B branch: if bit $20 set, clear it and reset
 * formation/timer when ball flags $C0 are nonzero, or when INC timer sets N.
 * Otherwise INC timer (8-bit wrap) and leave the pending bit in place.
 * The original $C5B9 call site invokes this conditionally during kickoff.
 */
export function stepOriginalFoulFlag(s){
 validateField(s);
 if(!(s.gameScript&0x20))return {hadPending:false,cleared:false,timerIncremented:false};
 let incremented=false;
 if(!(s.ballState&0xc0)){
  s.cutsceneTimer=(s.cutsceneTimer+1)&0xff;
  incremented=true;
  if(!(s.cutsceneTimer&0x80))return {hadPending:true,cleared:false,timerIncremented:true};
 }
 s.gameScript&=0xdf;
 s.formationVariant=0;
 s.cutsceneTimer=0;
 return {hadPending:true,cleared:true,timerIncremented:incremented};
}

/**
 * Kickoff gate at $C58F-$C5C9. Inputs are POST-$C2AD values; that routine
 * and brightness/music side effects have NOT been ported.
 * When foul is pending, the caller must run stepOriginalFoulFlag first.
 * If it clears, the original skips the ball-bit-$40 check. Otherwise the
 * original stays in kickoff. If no foul was pending, bit $40 holds kickoff.
 * Returns a BRANCH decision only: downstream transition writes/calls are absent.
 */
export function evaluateOriginalKickoffGate({brightnessFlag,gameScript,ballState}, {foulWasPending=false}={}){
 for(const [name,value] of Object.entries({brightnessFlag,gameScript,ballState}))assertByte(value,name);
 if(typeof foulWasPending!=='boolean')throw new TypeError('foulWasPending must be boolean');
 if(!(brightnessFlag&0x80))return {advance:false,reason:'await-brightness'};
 if(gameScript&0x20)return {advance:false,reason:'await-foul-clear'};
 if(!foulWasPending&&(ballState&0x40))return {advance:false,reason:'await-ball-flag'};
 return {advance:true,reason:'gate-open; transition side effects not implemented'};
}
