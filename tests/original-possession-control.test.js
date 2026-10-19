import test from 'node:test';
import assert from 'node:assert/strict';
import {createOriginalPossessionRam as make,stepOriginalPossessionControl as step,stepOriginalScriptBit0ControlBranch as dispatch,ORIGINAL_POSSESSION_ANGLE_BYTES as ANGLES} from '../src/classic/OriginalPossessionControl.js';

const run=(options={})=>{const ram=make(options),before=ram.slice(),result=step(ram);return {ram,before,result};};
const changed=({ram,before})=>Array.from(ram.keys()).filter(i=>ram[i]!==before[i]);

test('$B850 A edge writes action $0A at the controller slot, NOT the owner index',()=>{
 const r=run({owner:7,selectedPlayers:[255,255,7,255],pressed:[0,0,0x80,0]});
 assert.equal(r.ram[0x479+2],10);assert.equal(r.ram[0x479+7],128);
 assert.deepEqual(changed(r),[0x479+2]);assert.equal(r.result.controllerSlot,2);
});
test('B edge writes $09, with A taking priority on simultaneous A+B',()=>{
 for(const [press,want] of [[0x40,9],[0xc0,10]]){
  const r=run({pressed:[press,0,0,0]});
  assert.equal(r.ram[0x479],want);assert.equal(r.result.writes.length,1);
 }
});
test('channel zero Start/Select edges affect matched owner in slot three',()=>{
 for(const mask of [0x10,0x20,0x30]){
  const r=run({owner:6,selectedPlayers:[255,255,255,6],pressed:[mask,0,0,0]});
  assert.equal(r.ram[0x479+3],10);assert.equal(r.ram[0x479+6],128);
  assert.equal(r.result.branch,'$B885-channel-zero-Start-Select');
 }
});
test('channel zero Start/Select do not override a matched B edge',()=>{
 const r=run({owner:7,selectedPlayers:[255,7,255,255],pressed:[0x30,0x40,0,0]});
 assert.equal(r.ram[0x479+1],9);
});
test('$B88B held bits 2/3 index exact original table, including code-byte $86 overread',()=>{
 assert.deepEqual(ANGLES,[0,128,0,134]);
 for(let i=0;i<4;i++){
  const r=run({owner:5,selectedPlayers:[255,5,255,255],pressed:[0,0,0,0],held:[0,i<<2,0,0]});
  assert.equal(r.ram[0x4b0+5],ANGLES[i]);assert.equal(r.result.tableIndex,i);
  assert.deepEqual(changed(r),[0x4b0+5]);
 }
});
test('first matching controller slot wins, even when a later slot has an A edge',()=>{
 const r=run({owner:5,selectedPlayers:[5,5,255,255],pressed:[0,0x80,0,0],held:[4,0,0,0]});
 assert.equal(r.result.controllerSlot,0);assert.equal(r.ram[0x4b0+5],0x80);
 assert.equal(r.ram[0x479+1],0);
});
test('both control positions negative bypass matching and use frame-gated fallback',()=>{
 const r=run({owner:2,controlPositions:[0x80,0xff],pressed:[0x80,0,0,0],frame:0});
 assert.equal(r.result.branch,'$B86E-fallback-every-32-frames');
 assert.equal(r.ram[0x67e+2],0x12);assert.equal(r.ram[0x479+2],10);
 assert.deepEqual(changed(r),[0x479+2,0x67e+2]);
});
test('only one control position negative does not bypass matching',()=>{
 const r=run({controlPositions:[0x80,0],pressed:[0x80,0,0,0]});
 assert.equal(r.result.branch,'$B87E-A-new-press');
});
test('no match on non-multiple-of-32 frame leaves RAM completely unchanged',()=>{
 for(const frame of [1,31,33,255]){
  const r=run({frame,owner:5,selectedPlayers:[0,1,2,3]});
  assert.deepEqual(changed(r),[]);assert.equal(r.result.writes.length,0);
 }
});
test('no match on frames 0,32,64,224 writes owner OR $12 and action $0A',()=>{
 for(const frame of [0,32,64,224]){
  const r=run({frame,owner:9,selectedPlayers:[0,1,2,3]});
  assert.equal(r.ram[0x67e+9],0x1b);assert.equal(r.ram[0x479+9],10);
 }
});
test('owner $FF indexes raw CPU RAM, not an assumed 12-player array',()=>{
 const r=run({owner:255,frame:0,selectedPlayers:[0,1,2,3]});
 assert.equal(r.ram[0x67e+255],255);assert.equal(r.ram[0x479+255],10);
 assert.deepEqual(changed(r),[0x479+255,0x67e+255]);
});
test('bit0 of game script selects $B850; alternate $B4C9 path stays explicitly blocked',()=>{
 const a=make({gameScript:1});const result=dispatch(a);
 assert.equal(result.implemented,true);assert.equal(result.dispatch,'$B850');
 const b=make({gameScript:0});const before=b.slice(),blocked=dispatch(b);
 assert.equal(blocked.implemented,false);assert.equal(blocked.pendingCalls.length,4);
 assert.ok(blocked.pendingCalls.every(c=>!c.executed));assert.deepEqual(b,before);
});
test('script bit0 branch is selected even if other game-script bits are set',()=>{
 const ram=make({gameScript:0x81});assert.equal(dispatch(ram).implemented,true);
});
test('invalid RAM and invalid fixture bytes rejected before writes',()=>{
 assert.throws(()=>step(new Uint8Array(0x100)),/RAM/);
 assert.throws(()=>dispatch([]),/RAM/);
 assert.throws(()=>make({pressed:[0]}),/pressed/);
 assert.throws(()=>make({owner:-1}),/owner/);
 assert.throws(()=>make({held:[0,0,0,256]}),/held/);
});
test('all 256 pressed byte combinations follow A, B, channel-zero special, angle priority',()=>{
 for(let press=0;press<256;press++){
  const r=run({owner:6,selectedPlayers:[255,6,255,255],pressed:[0,press,0,0],held:[0,4,0,0]});
  const action=press&0x80?10:press&0x40?9:null;
  if(action!==null){assert.equal(r.ram[0x479+1],action);assert.equal(r.ram[0x4b0+6],255);}
  else {assert.equal(r.ram[0x4b0+6],128);assert.equal(r.ram[0x479+1],0);}
 }
});
test('deterministic 4096-call source-local tape and exact writes',()=>{
 function tape(){let hash=2166136261>>>0;for(let i=0;i<4096;i++){
  const r=run({frame:i&255,owner:(i>>3)&15,selectedPlayers:[0,1,2,3],
   pressed:[i&255,(i>>2)&255,(i>>4)&255,(i>>5)&255],held:[(i>>1)&255,(i>>3)&255,(i>>5)&255,(i>>7)&255]});
  for(const {address,value} of r.result.writes){hash=Math.imul(hash^address,16777619)>>>0;hash=Math.imul(hash^value,16777619)>>>0;}
  assert.deepEqual(changed(r).sort((a,b)=>a-b),r.result.writes.filter(w=>r.before[w.address]!==w.value).map(w=>w.address).sort((a,b)=>a-b));
 }return hash;}
 assert.equal(tape(),tape());
});
