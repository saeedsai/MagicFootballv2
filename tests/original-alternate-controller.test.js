import test from 'node:test';
import assert from 'node:assert/strict';
import {
 createOriginalAlternateControllerRam as make,
 stepOriginalAlternateController as step,
 stepOriginalFourControllerBranch as four,
 readOriginalAlternateActionTable as lookup,
 ORIGINAL_ALTERNATE_POINTERS as pointers,
 ORIGINAL_ALTERNATE_ANGLES as angles
} from '../src/classic/OriginalAlternateController.js';
const run=(opts={})=>{const ram=make(opts),before=ram.slice(),result=step(ram,opts.slot??0);return {ram,before,result};};

test('seven source groups, four class pointers, and 12-byte lookups preserve exact $B737-$B84F data',()=>{
 assert.equal(pointers.length,7);
 for(let group=0;group<7;group++)for(let cls=0;cls<4;cls++){
  assert.equal(pointers[group][cls]>=0xb77d,true);
  assert.equal(pointers[group][cls]<=0xb844,true);
  for(let offset=0;offset<12;offset++)assert.ok(lookup(group,cls,offset)>=0&&lookup(group,cls,offset)<=255);
 }
 assert.deepEqual(pointers[0],[0xb77d,0xb789,0xb795,0xb801]);
 assert.deepEqual(pointers[3],[0xb7e9,0xb7f5,0xb7e9,0xb801]);
 assert.deepEqual(pointers[6],[0xb83d,0xb844,0xb83d,0xb801]);
 assert.deepEqual(Array.from({length:12},(_,i)=>lookup(0,0,i)),[0x30,0x30,0x30,0x30,0x0d,0x08,0x08,0x07,0x07,0x31,0x31,0x31]);
 assert.deepEqual(Array.from({length:12},(_,i)=>lookup(6,0,i)),[0x30,0x30,0x30,0x30,0x17,0x17,0x17,0x30,0x30,0x30,0x30,0x30]);
 assert.equal(lookup(0,1,0),0xff);assert.equal(lookup(0,3,4),0xff);
 assert.equal(lookup(5,1,4),0x54);assert.equal(lookup(2,2,4),0x0a);
 assert.deepEqual(angles,[255,64,192,0,128,96,160,0,0,32,224,0,0,0,0,0]);
});

test('$B4C9 gate rejects unselected, negative control position and nonnegative action before $C07A',()=>{
 for(const [opts,reason] of [
  [{player:255},'$B4CE-negative-selected-player'],
  [{controlPosition:0x80},'$B4D4-negative-control-position'],
  [{action:0x10},'$B4D9-existing-action']
 ]){
  const {ram,before,result}=run(opts);
  assert.equal(result.reason,reason);assert.equal(result.helperInvoked,false);
  assert.equal(ram[0x0570],before[0x0570]);assert.equal(ram[0x057c],before[0x057c]);
  assert.deepEqual(result.changes,[]); // default slot 0 already saved as 0
 }
 const r=run({slot:3,player:2,action:0});
 assert.equal(r.ram[0x43],3);assert.deepEqual(r.result.changes.map(x=>x.address),[0x43]);
});

test('$C07A helper is executed for eligible player, buffers and scratch are copied',()=>{
 const {ram,result}=run({slot:2,player:3,held:0xc0,pressed:0x01,buffer580:1,buffer584:2});
 assert.equal(result.helperInvoked,true);assert.equal(result.bufferTrace.actionPath,'simultaneous-A-B');
 assert.equal(result.bufferTrace.directionPath,'quick-direction-repeat');
 assert.equal(ram[0x0570+2],0xe0);assert.equal(ram[0x057c+2],1);
 assert.equal(ram[0x001d],0xc0);assert.equal(ram[0x001e],1);
 assert.equal(ram[0x001f],0xe0);assert.equal(ram[0x0020],0xe0);assert.equal(ram[0x0021],1);
 assert.equal(ram[0x43],2);
});

test('$B505 group selection covers reachable groups 0..5, with source pointer bytes written to scratch',()=>{
 const cases=[
  [{playerState:1},0],
  [{teamPossession:[0,0x80],passDirections:[15,15],player:2,playerState:0x40},1],
  [{teamPossession:[0x80,0],passDirections:[15,15],player:2,playerState:0x40},2],
  [{teamPossession:[0x80,0],passDirections:[15,15],player:2,playerState:0},3],
  [{gameScript:0x40},3],
  [{player:10,playerState:0x40,playerFlag:0},4],
  [{player:10,playerState:0,playerFlag:0},5],
  [{player:10,playerState:0x40,playerFlag:0x80},0],
  [{owner:10,ownerFlag:0,ballState:0x40,passDirections:[15,15]},3],
  [{passDirections:[0,15],player:2},3]
 ];
 for(const [opts,expected] of cases){
  const {ram,result}=run(opts);assert.equal(result.group,expected,JSON.stringify(opts));
  assert.equal(ram[0x2e]|ram[0x2f]<<8,result.groupPtr);
  assert.equal(ram[0x2c]|ram[0x2d]<<8,result.tablePtr);
 }
 const own=run({player:2,playerState:0x40,teamPossession:[0,0x80],passDirections:[15,15]});
 assert.equal(own.result.group,1); // other team sign only
 const own2=run({player:2,playerState:0x40,teamPossession:[0x80,0],passDirections:[15,15]});
 assert.equal(own2.result.group,2); // matching team sign and state bit6
 const keeperOwner=run({player:10,owner:10,playerFlag:0x80});
 assert.equal(keeperOwner.result.group,0); // fixture must not overwrite the shared player/owner flag
});

test('$B568 group2 when team flag negative and state bit6 set; group3 when state bit6 clear',()=>{
 // Team possession sign is set and the matching team's sign is set.
 // For an even player, $052A is the matching team flag.
 const a=run({player:2,playerState:0x40,teamPossession:[0x80,0],passDirections:[15,15]});
 assert.equal(a.result.group,2);
 const b=run({player:2,playerState:0,teamPossession:[0x80,0],passDirections:[15,15]});
 assert.equal(b.result.group,3);
 const c=run({player:2,playerState:0x40,teamPossession:[0,0x80],passDirections:[15,15]});
 assert.equal(c.result.group,1);
});

test('class selection follows $B58A-$B5A3 state bits, 256-state exhaustive',()=>{
 for(let state=0;state<256;state++){
  const {ram,result}=run({playerState:state});
  const cls=!(state&0xb0)?0:state&0x80?1:state&0x20?2:3;
  assert.equal(result.classIndex,cls,`state=${state}`);
  assert.equal(ram[0x1c],cls);
  assert.equal(result.tablePtr,pointers[result.group][cls]);
 }
});

test('$B5CA negative-state active timer and new A/B edge produces raw action $45 without angle',()=>{
 const {ram,result}=run({playerState:0x80,playerTimer:2,playerMovement:0x03,pressed:0x80});
 assert.equal(result.reason,'$B5CA-negative-state-timer');assert.equal(ram[0x479+2],0x45);
 assert.equal(result.actionWritten,true);assert.equal(result.angleWritten,false);
 const b=run({playerState:0x80,playerTimer:2,playerMovement:0x58,pressed:0x80});
 assert.notEqual(b.ram[0x479+2],0x45);
});

test('$B5D6 high buffer20 picks table offset 1/0/3 with $FF fallback',()=>{
 for(const [held,offset] of [[0xcc,1],[0xc1,0],[0xc0,3]]){
  const {ram,result}=run({held});
  assert.equal(result.selectedActionOffset,offset);
  assert.equal(ram[0x479+2],0x30);assert.equal(result.angleWritten,false);
 }
 // Group 0 class 1 first four table entries are $FF, so it continues to
 // the second-stage source branch rather than storing $FF as an action.
 const b=run({playerState:0x80,pressed:0x80,held:0});
 assert.equal(b.result.selectedActionOffset,6);assert.equal(b.ram[0x479+2],0x35);
});

test('$B614 first priority chooses offset 4 for ball movement $0A and owner, else offset 6',()=>{
 const a=run({playerState:0x80,pressed:0x80,owner:2,ballMovement:0x0a});
 assert.equal(a.result.selectedActionOffset,4);assert.equal(a.ram[0x479+2],0x35);
 const b=run({playerState:0x80,pressed:0x80,owner:12,ballMovement:0x0a});
 assert.equal(b.result.selectedActionOffset,6);assert.equal(b.ram[0x479+2],0x35);
});

test('$B647 second priority uses offset 11 for movement 02, offset 7 otherwise',()=>{
 const a=run({playerState:0x80,pressed:0x40,playerMovement:2});
 assert.equal(a.result.selectedActionOffset,11);assert.equal(a.ram[0x479+2],0x34);
 const b=run({playerState:0x80,pressed:0x40,playerMovement:0});
 assert.equal(b.result.selectedActionOffset,7);assert.equal(b.ram[0x479+2],0x33);
});

test('$B696 negative state with no selected action preserves existing action and updates angle',()=>{
 const a=run({playerState:0x80,pressed:0,held:0,action:0xa2});
 assert.equal(a.result.actionWritten,false);assert.equal(a.result.angleWritten,true);
 assert.equal(a.ram[0x479+2],0xa2);assert.equal(a.ram[0x4b0+2],255);
});

test('$B6A4 movement03 special branches write $2A/$27 plus directional angle',()=>{
 for(const [held,expected] of [[1,0x2a],[4,0x27]]){
  const {ram,result}=run({held,playerMovement:3});
  assert.equal(ram[0x479+2],expected);assert.equal(ram[0x4b0+2],angles[held&15]);
  assert.equal(result.angleWritten,true);
 }
});

test('$B6C3 state8 branches select $24/$25/$1D or angle only',()=>{
 const cases=[[0x48,0x24],[0x18,0x25],[0x08,0x1d]];
 for(const [state,expected] of cases){
  const {ram,result}=run({playerState:state,pressed:4,buffer580:4,buffer584:1});
  assert.equal(ram[0x479+2],expected);assert.equal(result.angleWritten,true);
 }
 const b=run({playerState:8,pressed:0});
 assert.equal(b.result.actionWritten,false);assert.equal(b.ram[0x479+2],0x80);
});

test('$B6E6 fallback: $01 no direction, $20 held direction, $21 quick-repeat',()=>{
 const a=run();assert.equal(a.ram[0x479+2],1);
 const b=run({held:1});assert.equal(b.ram[0x479+2],0x20);assert.equal(b.ram[0x4b0+2],0x40);
 const c=run({pressed:1,buffer580:1,buffer584:1});assert.equal(c.ram[0x479+2],0x21);
});

test('$B4B2 script-bit0 clear executes four slots, restores slot index and leaves others gated',()=>{
 const ram=make({slot:0,player:2});
 const r=four(ram);
 assert.equal(r.implemented,true);assert.equal(r.calls.length,4);
 assert.equal(r.calls[0].helperInvoked,true);
 assert.ok(r.calls.slice(1).every(c=>c.reason==='$B4CE-negative-selected-player'));
 assert.equal(ram[0x43],3);assert.equal(ram[0x479+2],1);
 ram[0x5c]=1;
 const blocked=four(ram);assert.equal(blocked.implemented,false);assert.equal(blocked.calls.length,0);
});

test('source-derived selector is deterministic for 2048 varied RAM fixtures',()=>{
 let seed=0x97531;
 for(let i=0;i<2048;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const opts={slot:seed&3,player:(seed>>>2)%12,playerState:(seed>>>8)&255,
   held:(seed>>>16)&255,pressed:(seed>>>24)&255,teamPossession:[seed&255,(seed>>>8)&255],
   passDirections:[(seed>>>16)&255,(seed>>>24)&255],owner:(seed>>>12)%13,ballState:(seed>>>4)&255,
   playerTimer:(seed>>>20)&255,playerMovement:(seed>>>13)&255,buffer580:(seed>>>11)&255,buffer584:(seed>>>19)&255};
  const a=make(opts),b=a.slice();assert.deepEqual(step(a,opts.slot),step(b,opts.slot));assert.deepEqual(a,b);
 }
});

test('invalid input rejects before mutation and lookup bounds are guarded',()=>{
 for(const [args,pattern] of [[{slot:4},/slot/],[{held:-1},/held/],[{pressed:256},/pressed/],[{player:1.1},/player/],[{teamPossession:[0]},/2 bytes/]])
  assert.throws(()=>make(args),pattern);
 assert.throws(()=>step(new Uint8Array(8),0),/RAM/);
 const ram=make(),before=ram.slice();assert.throws(()=>step(ram,4),/slot/);assert.deepEqual(ram,before);
 for(const args of [[7,0,0],[0,4,0],[0,0,12]])assert.throws(()=>lookup(...args),/must be/);
});

test('all twelve table offsets can be selected by distinct source branch conditions',()=>{
 const fixtures=[
  [{held:0xc1},0],
  [{held:0xc4},1],
  [{held:0xc0,playerState:8},2],
  [{held:0xc0},3],
  [{playerState:0x80,pressed:0x80,owner:2,ballMovement:10},4],
  [{playerState:0x80,pressed:0x80,held:4},5],
  [{playerState:0x80,pressed:0x80},6],
  [{playerState:0x80,pressed:0x40},7],
  [{playerState:0x80,pressed:0x40,held:4},8],
  [{playerState:0x80,pressed:0x40,held:2},9],
  [{playerState:0x80,pressed:0x40,held:1},10],
  [{playerState:0x80,pressed:0x40,playerMovement:2},11]
 ];
 for(const [opts,offset] of fixtures){
  const {result,ram}=run(opts);
  assert.equal(result.selectedActionOffset,offset,`offset ${offset}: ${JSON.stringify(opts)}`);
  assert.equal(ram[0x479+2],lookup(result.group,result.classIndex,offset));
  assert.equal(result.angleWritten,false);
 }
});

test('four-slot controller loop processes multiple eligible players independently in slot order',()=>{
 const ram=make({slot:0,player:2,playerState:0x80,pressed:0x80});
 ram[0x0568+1]=3;ram[0x0650+3]=0;ram[0x0479+3]=0x80;
 ram[0x0486+3]=0x80;ram[0x0008+1]=0x40;
 const result=four(ram);
 assert.equal(result.calls[0].selectedActionOffset,6);
 assert.equal(result.calls[1].selectedActionOffset,7);
 assert.equal(ram[0x479+2],0x35);assert.equal(ram[0x479+3],0x33);
 assert.equal(result.calls[2].helperInvoked,false);assert.equal(result.calls[3].helperInvoked,false);
 assert.equal(ram[0x43],3);
});

test('full $B4B2 branch dispatcher chooses native possession branch or four-controller selector',async()=>{
 const {stepOriginalControllerDispatch}=await import('../src/classic/OriginalAlternateController.js');
 const ram=make({playerState:0x80,pressed:0x80});
 const a=stepOriginalControllerDispatch(ram);
 assert.equal(a.dispatch,'$B4C9');assert.equal(a.calls.length,4);assert.equal(ram[0x479+2],0x35);
 const other=make({gameScript:1,player:2,owner:2,pressed:0x80});
 const b=stepOriginalControllerDispatch(other);
 assert.equal(b.dispatch,'$B850');assert.equal(b.branch,'$B87E-A-new-press');
 assert.equal(other[0x479],0x0a);
});
