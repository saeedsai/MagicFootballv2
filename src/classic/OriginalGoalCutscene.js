/**
 * Source-derived, isolated RAM projection for the original goal subscreen 03.
 * Pinned upstream: bank_FF.asm, df2c8e55e7f13e5792482527db9e7c9e4a84c6e1
 *   $C699-$C69E: entry flag mask (BEFORE 12 external routines)
 *   $C6C5-$C706: camera/timer/skip branch (AFTER those routines)
 *   $C709-$C71B: brightness gate (AFTER unported $D073)
 *
 * NOT a complete Classic frame: external routines and their side effects
 * are NOT simulated, including $D047, $D073, $C91A and the audio dispatcher.
 * Caller must provide byte state as observed at the indicated boundaries.
 * No ROM, 6502 interpreter or original graphics/audio are used.
 */
import {NES_BUTTONS} from './OriginalInput.js';
const GOAL_BYTE = n => Number.isInteger(n) && n >= 0 && n <= 255;
const FIELDS = ['tileUpdateFlag','cutsceneTimer','gameScript','ballOwner','cameraObject','weatherEffect','brightnessFlag'];
function assertGoalByte(n,name){if(!GOAL_BYTE(n))throw new TypeError(`${name} must be a byte (0..255)`);}
function validateGoal(s){
 if(!s || typeof s !== 'object')throw new TypeError('cutscene state is required');
 for(const field of FIELDS)assertGoalByte(s[field],field);
}
export const ORIGINAL_GOAL_PRE_UPDATE_CALLS=Object.freeze([
 '$DE0B','$DE47','$CAEE','$C2AD','$C24E','$C271','$BD6A (banked)',
 '$C2A3','$C285','$F3A5','$C29E','$C299'
]);
export function createOriginalGoalCutsceneState(options={}){
 const state=Object.fromEntries(FIELDS.map(name=>[name,options[name]??0]));
 validateGoal(state);
 return state;
}
/** CPU $C699-$C6A1: clear $05AB bits $30, then return the unported call list. */
export function prepareOriginalGoalCutsceneFrame(s){
 validateGoal(s);
 s.tileUpdateFlag &= 0xcf;
 return {pendingExternalCalls:[...ORIGINAL_GOAL_PRE_UPDATE_CALLS],nextBoundary:'$C6C5'};
}
/**
 * Direct byte writes from $C6C5-$C71B. `s` is a snapshot AFTER all 12
 * entry routines and `brightnessFlag` is the value AFTER $D073.
 * This intentionally does not execute the external calls returned below.
 */
export function stepOriginalGoalCutscenePostUpdates(s,pressed0){
 validateGoal(s);assertGoalByte(pressed0,'pressed0');
 const externalCalls=[];
 let cameraRetargeted=false,skipTriggered=false,brightnessComplete=false,timerIncremented=false;
 // $C6C5-$C6DC: camera target changes only after timer >= $20 and bit1 set.
 if(s.cutsceneTimer>=0x20 && (s.gameScript&0x02)){
  s.cameraObject=(s.ballOwner&0x0f)|0x40;
  cameraRetargeted=true;
 }
 // $C6DC-$C706: below $40, Start/Select new press ($30) skips the scene.
 // At $40..$FE it finishes automatically; at $FF it stays latched.
 if(s.cutsceneTimer<0x40){
  if(pressed0&(NES_BUTTONS.START|NES_BUTTONS.SELECT))skipTriggered=true;
  else {s.cutsceneTimer=(s.cutsceneTimer+1)&0xff;timerIncremented=true;}
 }else if(s.cutsceneTimer!==0xff)skipTriggered=true;
 if(skipTriggered){
  externalCalls.push({address:'$D047',executed:false});
  externalCalls.push({address:'$C2E4',argument:0,executed:false});
  s.cutsceneTimer=0xff;
  s.weatherEffect=0;
 }
 // $C706: this routine is ALWAYS called. Its side effects are unknown.
 externalCalls.push({address:'$D073',executed:false});
 // $C709-$C71B: both bits $80 and $40 required to call $C91A and reset.
 if((s.brightnessFlag&0xc0)===0xc0){
  brightnessComplete=true;
  externalCalls.push({address:'$C91A',executed:false});
  s.gameScript=0;
  s.cutsceneTimer=0;
 }
 return {cameraRetargeted,skipTriggered,timerIncremented,brightnessComplete,externalCalls};
}
