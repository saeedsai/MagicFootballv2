/**
 * Source-local native port of bank_04.asm $B850-$B8AA, selected by $B4B2
 * when game-script $005C bit 0 is set.
 * Upstream cyneprepou4uk/NES-Games-Disassembly @
 * df2c8e55e7f13e5792482527db9e7c9e4a84c6e1 (bank_04.asm:13290-13334).
 *
 * The RAM image models CPU $0000-$07FF bytes only. It is NOT an NES emulator;
 * the code executes source-derived branch semantics directly in JavaScript.
 * This routine alone does not implement original football actions, the
 * alternate $B4C9 path, frame sequencing or original-runtime parity.
 */
const POSSESSION_RAM_SIZE=0x800;
const possessionByte=(value,name)=>{if(!Number.isInteger(value)||value<0||value>255)throw new TypeError(`${name} must be an unsigned byte`);return value;};
const possessionArray=(value,count,name)=>{if(!Array.isArray(value)||value.length!==count)throw new TypeError(`${name} must have ${count} bytes`);return value.map((v,i)=>possessionByte(v,`${name}[${i}]`));};
function validateRam(ram){if(!(ram instanceof Uint8Array)||ram.length<POSSESSION_RAM_SIZE)throw new TypeError('RAM must be a Uint8Array of at least $0800 bytes');}

/**
 * $B8A8-$B8AB. The source declares three table bytes; a fourth index reads
 * $B8AB's first instruction byte ($86, STX zero-page), NOT a fourth .byte.
 * Preserving this is essential for a byte-faithful, source-local projection.
 */
export const ORIGINAL_POSSESSION_ANGLE_BYTES=Object.freeze([0x00,0x80,0x00,0x86]);
export const ORIGINAL_POSSESSION_RAM=Object.freeze({
 SCRIPT:0x005c,FRAME:0x0300,ACTION:0x0479,OWNER:0x04d6,SELECTED:0x0568,
 CONTROL:0x0650,ANGLE:0x04b0,FLAG:0x067e,HELD:0x0004,PRESSED:0x0008
});

/** Create a small, explicit RAM fixture; all values are arbitrary test seeds. */
export function createOriginalPossessionRam({
 gameScript=1,frame=0,owner=2,controlPositions=[0,0],
 selectedPlayers=[2,0xff,0xff,0xff],held=[0,0,0,0],pressed=[0x80,0,0,0],
 initialAction=0x80,initialAngle=0xff,initialFlag=0
}={}){
 const control=possessionArray(controlPositions,2,'controlPositions');
 const selected=possessionArray(selectedPlayers,4,'selectedPlayers');
 const hold=possessionArray(held,4,'held');const press=possessionArray(pressed,4,'pressed');
 for(const [k,v] of Object.entries({gameScript,frame,owner,initialAction,initialAngle,initialFlag}))possessionByte(v,k);
 const ram=new Uint8Array(POSSESSION_RAM_SIZE);
 ram[0x005c]=gameScript;ram[0x0300]=frame;ram[0x04d6]=owner;
 control.forEach((v,i)=>ram[0x0650+i]=v);
 selected.forEach((v,i)=>ram[0x0568+i]=v);
 hold.forEach((v,i)=>ram[0x0004+i]=v);
 press.forEach((v,i)=>ram[0x0008+i]=v);
 ram[0x0479+owner]=initialAction;ram[0x04b0+owner]=initialAngle;ram[0x067e+owner]=initialFlag;
 return ram;
}

/**
 * Port $B850-$B8A7. Mutates ONLY the bytes written by the assembly branch.
 * Crucial: matched A/B writes action[controllerSlot], not action[ballOwner].
 * Fallback writes action[ballOwner] and flag[ballOwner] every 32 frames.
 * Does not claim to know what numeric actions $09/$0A mean in gameplay.
 */
export function stepOriginalPossessionControl(ram){
 validateRam(ram);
 const owner=ram[0x04d6];
 const writes=[];
 const put=(address,value)=>{ram[address]=value;writes.push({address,value});};
 const result=(branch,controllerSlot=null)=>({source:'bank04:$B850-$B8A7',branch,controllerSlot,owner,writes});
 if(!((ram[0x0650]&ram[0x0651])&0x80)){
  for(let slot=0;slot<4;slot++){
   if(ram[0x0568+slot]!==owner)continue;
   const pressed=ram[0x0008+slot];
   if(pressed&0x80){put(0x0479+slot,0x0a);return result('$B87E-A-new-press',slot);}
   if(pressed&0x40){put(0x0479+slot,0x09);return result('$B882-B-new-press',slot);}
   // The $B885 test deliberately uses channel zero, not the matched slot.
   if(ram[0x0008]&0x30){put(0x0479+slot,0x0a);return result('$B885-channel-zero-Start-Select',slot);}
   const tableIndex=(ram[0x0004+slot]>>2)&3;
   put(0x04b0+owner,ORIGINAL_POSSESSION_ANGLE_BYTES[tableIndex]);
   return {...result('$B88B-held-angle',slot),tableIndex};
  }
 }
 // $B867: the fallback is gated by the low five bits of frame counter.
 if(ram[0x0300]&0x1f)return result('$B867-frame-not-multiple-of-32');
 put(0x067e+owner,owner|0x12);
 put(0x0479+owner,0x0a);
 return result('$B86E-fallback-every-32-frames');
}

/**
 * Only execute the verified script-bit0 branch of $B4B2. The four $B4C9
 * controller calls are deliberately left unexecuted, not approximated.
 */
export function stepOriginalScriptBit0ControlBranch(ram){
 validateRam(ram);
 if(!(ram[0x005c]&1))return {
  dispatch:'$B4C9',implemented:false,
  pendingCalls:[0,1,2,3].map(controllerSlot=>({address:'$B4C9',controllerSlot,executed:false})),
  reason:'The alternate four-slot $B4C9 controller routine is not ported.'
 };
 return {dispatch:'$B850',implemented:true,...stepOriginalPossessionControl(ram)};
}
