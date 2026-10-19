/**
 * Source-local native JavaScript projection of original bank04 $B8AB-$B9E2.
 * Pinned source: cyneprepou4uk/NES-Games-Disassembly
 * commit df2c8e55e7f13e5792482527db9e7c9e4a84c6e1, bank_04.asm.
 *
 * This is NOT a complete Classic player controller. The entry path calls
 * fixed-bank $C07A (whose $FAEE target is ported separately). Supply button-buffer and
 * player-state bytes as snapshots AFTER that call. The entry gate is exposed
 * separately because it runs BEFORE $C07A. Only the action number at $0479
 * and new angle at $04B0 are written here; movement/ball effects are absent.
 * This code does not execute a ROM or 6502 instructions.
 */

const isActionByte=n=>Number.isInteger(n)&&n>=0&&n<=255;
function byte(n,name){if(!isActionByte(n))throw new TypeError(`${name} must be a byte (0..255)`);}

/** $B9E5-$B9F4: held directional nibble -> new angle (includes $FF). */
export const ORIGINAL_ACTION_ANGLES=Object.freeze([
 0xff,0x40,0xc0,0x00,0x80,0x60,0xa0,0x00,
 0x00,0x20,0xe0,0x00,0x00,0x00,0x00,0x00
]);
/** $BA05-$BA0F: lookup used by reachable $B8AB action classes 0..3. */
export const ORIGINAL_ACTION_LOOKUP=Object.freeze([
 0x0a,0x08,0x09,0x08,0x04,0x04,0x04,0x05,0x05,0x05,0x05
]);

/**
 * $B8AB-$B8BE before unported $C07A: the selected player's control
 * position must be nonnegative and its existing action byte negative.
 * selected player ID comes from $0568[controllerSlot]; this function takes
 * the dereferenced bytes, not a complete NES RAM image.
 */
export function evaluateOriginalPlayerActionEntry({controlPosition,action}){
 byte(controlPosition,'controlPosition');byte(action,'action');
 if(controlPosition&0x80)return {dispatch:false,reason:'control-position-negative'};
 if(!(action&0x80))return {dispatch:false,reason:'existing-action-nonnegative'};
 return {dispatch:true,reason:'enter-$C07A-then-$B8C3'};
}

const ACTION_FIELDS=['playerId','playerState','held','pressed','buffer20','buffer21','facing','action','angle'];
export function createOriginalPlayerActionState(options={}){
 const defaults={playerId:0,playerState:0x80,held:0,pressed:0,buffer20:0,buffer21:0,facing:0,action:0x80,angle:0xff};
 const s=Object.fromEntries(ACTION_FIELDS.map(name=>[name,options[name]??defaults[name]]));
 validateActionState(s);return s;
}
function validateActionState(s){
 if(!s||typeof s!=='object')throw new TypeError('player action state is required');
 for(const name of ACTION_FIELDS)byte(s[name],name);
 if(s.playerId>11)throw new RangeError('playerId must be 0..11 (10 field players and 2 goalkeepers)');
}

/**
 * $B8C3-$B9E2, after the UNPORTED $C07A helper has returned.
 * `buffer20`=$0570[slot], `buffer21`=$057C[slot], held=$0004[slot],
 * pressed=$0008[slot], playerState=$0486[player], facing=$04A3[player].
 * `action`=$0479[player], `angle`=$04B0[player]. The original first copies
 * $056C[slot] to $001F too, but this branch never reads $001F.
 *
 * The caller must separately evaluate the entry gate and provide genuine
 * post-helper state; this function cannot establish original frame parity.
 */
export function stepOriginalPlayerActionPostHelper(s){
 validateActionState(s);const {playerState,held,pressed,buffer20,buffer21,facing,playerId}=s;
 const classIndex=(playerState&0xb0)?1+((playerState&0x80)?0:1+((playerState&0x20)?0:1)):0;
 // $B8E5-$B910 selects one of $B9F5 pointers; reachable classes 0..3
 // all resolve to $BA05. Class 5 points to $BA10 but is unreachable here.
 const lookup=ORIGINAL_ACTION_LOOKUP;
 const setAction=(value,path)=>{s.action=value;return {path,classIndex,actionWritten:true,angleWritten:false,action:s.action,angle:s.angle};};
 const setAngle=(path,actionWritten=false)=>{
  s.angle=ORIGINAL_ACTION_ANGLES[held&0x0f];
  return {path,classIndex,actionWritten,angleWritten:true,action:s.action,angle:s.angle};
 };
 // $B913-$B919: negative player state uses new-press bits 7 and 6.
 // $B91C-$B94C: nonnegative state can force immediate 08/09/0A.
 if(!(playerState&0x80)&&(buffer20&0x80)){
  if(held&0x03){
   // Two ROLs at $B92B-$B92C: bit0 of result = original facing bit7.
   const action=((facing>>7)^(held&1))&1?0x09:0x0a;
   return setAction(action,'$B928-horizontal-facing');
  }
  return setAction(playerState&0x08?0x09:0x08,'$B93E-stationary');
 }
 // $B913: negative state uses pressed>>1 before $B94F ASL; otherwise
 // $B91C reads buffer20 directly before that ASL. Normalize to the value
 // AFTER $B94F ASL so the next two sign checks read the right bits.
 const actionBits=(playerState&0x80)?pressed:((buffer20<<1)&0xff);
 // $B94F-$B96B: first priority bit7 -> table offsets 5/6 (both $04).
 if(actionBits&0x80){
  const offset=(held&0x0c)?5:6;
  return setAction(lookup[offset],`$B952-lookup-${offset}`);
 }
 // $B96B-$B9A8: second priority bit6 -> offsets 7..10 (all $05).
 if(actionBits&0x40){
  const offset=!(held&0x0f)?7:(held&0x0c)?8:((playerId^held)&1)?10:9;
  return setAction(lookup[offset],`$B96E-lookup-${offset}`);
 }
 // $B9A8-$B9D0: negative player state skips action update.
 if(playerState&0x80)return setAngle('$B9A8-negative-state-angle-only');
 // $B9AD-$B9CD: action depends on $057C low nibble and held direction.
 if(!(buffer21&0x0f)){
  s.action=(held&0x0f)?0x06:0x01;
 }else{
  s.action=(buffer21&0x03)?0x07:0x0d;
 }
 return setAngle('$B9AD-fallback-action-and-angle',true);
}

/**
 * $B4B2-$B4C8 kickoff dispatch ONLY. Does not run $B850 or $B4C9.
 * If script bit0 set: call $B850 once; else call $B4C9 with X=0,1,2,3.
 */
export function scheduleOriginalKickoffControllerCalls(gameScript){
 byte(gameScript,'gameScript');
 if(gameScript&1)return [{address:'$B850',executed:false}];
 return Array.from({length:4},(_,slot)=>({address:'$B4C9',controllerSlot:slot,executed:false}));
}
