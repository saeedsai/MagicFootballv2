/**
 * Native, source-local reconstruction of bank_04.asm $B4C9-$B724 and
 * its $B727-$B84F lookup data. Upstream pinned commit:
 * df2c8e55e7f13e5792482527db9e7c9e4a84c6e1.
 *
 * Operates on a byte-addressed $0000-$07FF RAM snapshot. The fixed-bank
 * $C07A -> $FAEE button-buffer helper is invoked via its native JS port.
 * No NES interpreter, ROM, original game loop or football action executor.
 * Original runtime/frame parity remains UNVERIFIED.
 */
import {createOriginalActionBufferState,stepOriginalActionBuffers} from './OriginalActionBuffers.js';
import {stepOriginalPossessionControl} from './OriginalPossessionControl.js';

const alternateRAMSize=0x800;
const alternateByte=(value,name)=>{if(!Number.isInteger(value)||value<0||value>255)throw new TypeError(`${name} must be an unsigned byte`);return value;};
const alternateRAM=ram=>{if(!(ram instanceof Uint8Array)||ram.length<alternateRAMSize)throw new TypeError('RAM must contain at least $0800 bytes');};
const alternateNegative=value=>(value&0x80)!==0;

/** Source pointers: $B737 -> group, $B745-$B77C -> state class. */
export const ORIGINAL_ALTERNATE_POINTERS=Object.freeze([
 Object.freeze([0xb77d,0xb789,0xb795,0xb801]),
 Object.freeze([0xb7d1,0xb7dd,0xb7c5,0xb801]),
 Object.freeze([0xb7ad,0xb7b9,0xb7a1,0xb801]),
 Object.freeze([0xb7e9,0xb7f5,0xb7e9,0xb801]),
 Object.freeze([0xb831,0xb7b9,0xb831,0xb801]),
 Object.freeze([0xb80d,0xb819,0xb825,0xb801]),
 Object.freeze([0xb83d,0xb844,0xb83d,0xb801])
]);
/** $B727-$B736, indexed by the low nibble of the controller's held buttons. */
export const ORIGINAL_ALTERNATE_ANGLES=Object.freeze([
 0xff,0x40,0xc0,0,0x80,0x60,0xa0,0,0,0x20,0xe0,0,0,0,0,0
]);

// Literal bytes from bank04 $B77D-$B84F. Entries at $B83D-$B843 are
// deliberately only seven bytes: the 12-byte lookup crosses into $B844.
const alternateChunks=Object.freeze([
 [0xb77d,[0x30,0x30,0x30,0x30,0x0d,0x08,0x08,0x07,0x07,0x31,0x31,0x31]],
 [0xb789,[0xff,0xff,0xff,0xff,0x35,0x35,0x35,0x33,0x34,0x32,0x34,0x34]],
 [0xb795,[0x44,0x44,0x44,0x44,0x08,0x08,0x08,0x07,0x07,0x07,0x07,0x07]],
 [0xb7a1,[0x44,0x44,0x44,0x44,0x0a,0x0a,0x0a,0x09,0x09,0x09,0x09,0x09]],
 [0xb7ad,[0x10,0x30,0x30,0x0e,0x0d,0x0a,0x0a,0x09,0x09,0x09,0x09,0x09]],
 [0xb7b9,[0xff,0xff,0xff,0xff,0x39,0x39,0x39,0x37,0x38,0x46,0x38,0x38]],
 [0xb7c5,[0x44,0x44,0x44,0x44,0x23,0x23,0x23,0x22,0x22,0x22,0x22,0x19]],
 [0xb7d1,[0x30,0x30,0x30,0x30,0x23,0x23,0x23,0x22,0x22,0x22,0x22,0x19]],
 [0xb7dd,[0xff,0xff,0xff,0xff,0x42,0x42,0x42,0x3b,0x3b,0x3b,0x3b,0x3b]],
 [0xb7e9,[0x30,0x30,0x30,0x30,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11]],
 [0xb7f5,[0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30]],
 [0xb801,[0x10,0x30,0x30,0x30,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff]],
 [0xb80d,[0x52,0x3e,0x52,0x52,0x22,0x29,0x22,0x22,0x28,0x41,0x41,0x41]],
 [0xb819,[0xff,0xff,0xff,0xff,0x54,0x54,0x54,0x54,0x54,0x54,0x54,0x54]],
 [0xb825,[0x52,0x3e,0x52,0x52,0x22,0x29,0x22,0x22,0x28,0x41,0x41,0x41]],
 [0xb831,[0x30,0x30,0x30,0x30,0x0a,0x0a,0x0a,0x09,0x09,0x09,0x09,0x09]],
 [0xb83d,[0x30,0x30,0x30,0x30,0x17,0x17,0x17]],
 [0xb844,[0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30,0x30]]
]);
const alternateTableBytes=new Uint8Array(0xb850-0xb77d);
for(const [address,bytes] of alternateChunks)alternateTableBytes.set(bytes,address-0xb77d);
export function readOriginalAlternateActionTable(group,classIndex,offset){
 if(!Number.isInteger(group)||group<0||group>6)throw new RangeError('group must be 0..6');
 if(!Number.isInteger(classIndex)||classIndex<0||classIndex>3)throw new RangeError('classIndex must be 0..3');
 if(!Number.isInteger(offset)||offset<0||offset>11)throw new RangeError('offset must be 0..11');
 const address=ORIGINAL_ALTERNATE_POINTERS[group][classIndex]+offset;
 return alternateTableBytes[address-0xb77d];
}

/** Construct an independent, arbitrary synthetic fixture, NOT a real NES save. */
export function createOriginalAlternateControllerRam({
 slot=0,player=2,gameScript=0,controlPosition=0,playerState=0,action=0x80,
 held=0,pressed=0,owner=0x0c,ballState=0,ballMovement=0,playerMovement=0,
 playerTimer=0,playerFlag=0,ownerFlag=null,teamPossession=[0,0],passDirections=[0x0f,0x0f],
 buffer56c=0,buffer570=0,buffer574=0,buffer578=0,buffer57c=0,buffer580=0,buffer584=0
}={}){
 if(!Number.isInteger(slot)||slot<0||slot>3)throw new RangeError('slot must be 0..3');
 for(const [key,value] of Object.entries({player,gameScript,controlPosition,playerState,action,held,pressed,owner,ballState,ballMovement,playerMovement,playerTimer,playerFlag,buffer56c,buffer570,buffer574,buffer578,buffer57c,buffer580,buffer584}))alternateByte(value,key);
 if(ownerFlag!==null)alternateByte(ownerFlag,'ownerFlag');
 for(const [key,values] of Object.entries({teamPossession,passDirections})){
  if(!Array.isArray(values)||values.length!==2)throw new TypeError(`${key} must have 2 bytes`);
  values.forEach((v,i)=>alternateByte(v,`${key}[${i}]`));
 }
 const ram=new Uint8Array(alternateRAMSize);
 ram.fill(0xff,0x0568,0x056c);
 ram[0x0568+slot]=player;ram[0x0650+player]=controlPosition;ram[0x0479+player]=action;
 ram[0x0486+player]=playerState;ram[0x0004+slot]=held;ram[0x0008+slot]=pressed;
 ram[0x005c]=gameScript;ram[0x04d6]=owner;ram[0x0492]=ballState;
 ram[0x0465]=ballMovement;ram[0x0459+player]=playerMovement;
 ram[0x04bd+player]=playerTimer;ram[0x067c+player]=playerFlag;
 if(ownerFlag!==null)ram[0x067c+owner]=ownerFlag;ram[0x052a]=teamPossession[0];ram[0x052b]=teamPossession[1];
 ram[0x067a]=passDirections[0];ram[0x067b]=passDirections[1];
 for(const [address,value] of [[0x056c,buffer56c],[0x0570,buffer570],[0x0574,buffer574],[0x0578,buffer578],[0x057c,buffer57c],[0x0580,buffer580],[0x0584,buffer584]])ram[address+slot]=value;
 return ram;
}

/** $B4C9-$B724: one controller slot, with $C07A native buffer update. */
export function stepOriginalAlternateController(ram,slot){
 alternateRAM(ram);
 if(!Number.isInteger(slot)||slot<0||slot>3)throw new RangeError('slot must be 0..3');
 const before=ram.slice();ram[0x0043]=slot; // $B4C9 STX $43, even when gate fails
 const player=ram[0x0568+slot];
 const finish=(reason,extras={})=>({source:'bank04:$B4C9-$B724',slot,player,reason,
  changes:Array.from(ram.keys()).filter(i=>ram[i]!==before[i]).map(address=>({address,before:before[address],after:ram[address]})),...extras});
 if(alternateNegative(player))return finish('$B4CE-negative-selected-player',{helperInvoked:false});
 if(alternateNegative(ram[0x0650+player]))return finish('$B4D4-negative-control-position',{helperInvoked:false});
 if(!alternateNegative(ram[0x0479+player]))return finish('$B4D9-existing-action',{helperInvoked:false});
 const buffers=createOriginalActionBufferState({
  held:ram[0x0004+slot],pressed:ram[0x0008+slot],
  buffer56c:ram[0x056c+slot],buffer570:ram[0x0570+slot],buffer574:ram[0x0574+slot],
  buffer578:ram[0x0578+slot],buffer57c:ram[0x057c+slot],buffer580:ram[0x0580+slot],buffer584:ram[0x0584+slot]
 });
 const bufferTrace=stepOriginalActionBuffers(buffers); // $C07A -> $FAEE
 for(const [address,key] of [[0x056c,'buffer56c'],[0x0570,'buffer570'],[0x0574,'buffer574'],[0x0578,'buffer578'],[0x057c,'buffer57c'],[0x0580,'buffer580'],[0x0584,'buffer584']])ram[address+slot]=buffers[key];
 const held=ram[0x0004+slot],pressed=ram[0x0008+slot];
 for(const [address,value] of [[0x001d,held],[0x001e,pressed],[0x001f,buffers.buffer56c],[0x0020,buffers.buffer570],[0x0021,buffers.buffer57c]])ram[address]=value;
 const state=ram[0x0486+player];
 let group=0;
 if(ram[0x005c]&0x40)group=3;
 else if(state&1)group=0;
 else if(player>=0x0a){
  if(!alternateNegative(ram[0x067c+player]))group=state&0x40?4:5;
 }else{
  const owner=ram[0x04d6];
  const specialOwner=owner>=0x0a&&(ram[0x0492]&0x40)&&!alternateNegative(ram[0x067c+owner]);
  if(specialOwner||((ram[0x067a+(player&1)]&0x0f)!==0x0f))group=3;
  else if(alternateNegative(ram[0x052a]|ram[0x052b])){
   group=1;
   if(alternateNegative(ram[0x052a+(player&1)])){
    group=2;
    if(!(state&0x40))group=3;
   }
  }
 }
 ram[0x001c]=group;
 // $B578-$B5AE: two successive 16-bit pointer dereferences.
 const groupPtr=[0xb745,0xb74d,0xb755,0xb75d,0xb76d,0xb765,0xb775][group];
 ram[0x002e]=groupPtr&255;ram[0x002f]=groupPtr>>8;
 const classIndex=(state&0xb0)?1+(state&0x80?0:1+(state&0x20?0:1)):0;
 ram[0x001c]=classIndex;
 const tablePtr=ORIGINAL_ALTERNATE_POINTERS[group][classIndex];
 ram[0x002c]=tablePtr&255;ram[0x002d]=tablePtr>>8;
 const common={helperInvoked:true,bufferTrace,group,classIndex,groupPtr,tablePtr};
 const action=(value,reason,offset=null,withAngle=false)=>{
  ram[0x0479+player]=value;
  if(withAngle)ram[0x04b0+player]=ORIGINAL_ALTERNATE_ANGLES[held&15];
  return finish(reason,{...common,actionWritten:true,angleWritten:withAngle,actionValue:value,selectedActionOffset:offset});
 };
 const angleOnly=reason=>{ram[0x04b0+player]=ORIGINAL_ALTERNATE_ANGLES[held&15];return finish(reason,{...common,actionWritten:false,angleWritten:true});};
 const table=(offset,reason)=>{
  const value=readOriginalAlternateActionTable(group,classIndex,offset);
  return value<0x80?action(value,reason,offset):null;
 };
 let acc;
 if(state&0x80){
  if(ram[0x04bd+player]&&((ram[0x0459+player]&0x7f)!==0x58)&&(pressed&0xc0))
   return action(0x45,'$B5CA-negative-state-timer');
  acc=pressed>>1; // $B5CF LSR
 }else{
  acc=buffers.buffer570;
  if(acc&0x80){
   if(held&0x0c){const r=table(1,'$B5E4-table-1');if(r)return r;}
   if(held&0x03){const r=table(0,'$B5F4-table-0');if(r)return r;}
   if(state&0x08){const r=table(2,'$B604-table-2');if(r)return r;}
   const r=table(3,'$B60D-table-3');if(r)return r;
   acc=readOriginalAlternateActionTable(group,classIndex,3); // BMI $B614 retains A
  }
 }
 acc=(acc<<1)&255; // $B614 ASL, first sign gate
 if(acc&0x80){
  if((ram[0x0465]&0x7f)===0x0a&&player===ram[0x04d6]){
   const r=table(4,'$B627-table-4');if(r)return r;
  }
  if(held&0x0c){const r=table(5,'$B637-table-5');if(r)return r;}
  const r=table(6,'$B640-table-6');if(r)return r;
  acc=readOriginalAlternateActionTable(group,classIndex,6); // BMI $B647 retains A
 }
 acc=(acc<<1)&255; // $B647 ASL, second sign gate
 if(acc&0x80){
  if((ram[0x0459+player]&0x7f)===0x02){const r=table(11,'$B655-table-11');if(r)return r;}
  if(!(held&0x0f)){const r=table(7,'$B665-table-7');if(r)return r;}
  if(held&0x0c){const r=table(8,'$B675-table-8');if(r)return r;}
  if(!((player^held)&1)){const r=table(9,'$B686-table-9');if(r)return r;}
  const r=table(10,'$B68F-table-10');if(r)return r;
 }
 if(state&0x80)return angleOnly('$B696-negative-state-angle');
 if((ram[0x0459+player]&0x7f)===3){
  if(held&3)return action(0x2a,'$B6B7-movement-3-held-low',null,true);
  if(held&0x0c)return action(0x27,'$B6B2-movement-3-held-high',null,true);
 }
 if(state&8){
  if((state&0x50)&&(buffers.buffer57c&0x0c))return action(state&0x10?0x25:0x24,'$B6C3-state8-buffer21',null,true);
  if(buffers.buffer57c&0x0f)return action(0x1d,'$B6FE-state8-buffer21',null,true);
  return angleOnly('$B6FE-state8-no-buffer21');
 }
 if(buffers.buffer57c&0x0f)return action(0x21,'$B70A-direction-repeat',null,true);
 if(held&0x0f)return action(0x20,'$B6F9-held-direction',null,true);
 return action(0x01,'$B6F4-no-direction',null,true);
}

/** $B4B2: execute four $B4C9 calls in source order when script bit0 clear. */
export function stepOriginalFourControllerBranch(ram){
 alternateRAM(ram);
 if(ram[0x005c]&1)return {implemented:false,reason:'script bit0 selects separate $B850 branch',calls:[]};
 return {implemented:true,calls:[0,1,2,3].map(slot=>stepOriginalAlternateController(ram,slot))};
}

/** Complete $B4B2 dispatch between the two separately ported source branches.
 * Does NOT run the game's caller, action executor, or frame update loop.
 */
export function stepOriginalControllerDispatch(ram){
 alternateRAM(ram);
 if(ram[0x005c]&1)return {dispatch:'$B850',implemented:true,...stepOriginalPossessionControl(ram)};
 return {dispatch:'$B4C9',...stepOriginalFourControllerBranch(ram)};
}
