import test from 'node:test';
import assert from 'node:assert/strict';
import {
 ORIGINAL_ACTION_METADATA_BASES,readOriginalActionMetadata,
 createOriginalActionArbitrationRam,stepOriginalActionArbitration
} from '../src/classic/OriginalActionArbitration.js';
import {createOriginalAlternateControllerRam,stepOriginalControllerDispatch} from '../src/classic/OriginalAlternateController.js';

const run=(fixture={},variant=0)=>{
 const player=fixture.player??2,ram=createOriginalActionArbitrationRam(fixture);
 return {ram,result:stepOriginalActionArbitration(ram,player,{tableVariant:variant})};
};

test('source $AC65 pointer bytes select $AC87/$AC69 metadata tables',()=>{
 assert.deepEqual(ORIGINAL_ACTION_METADATA_BASES,[0xac87,0xac69]);
 assert.deepEqual(readOriginalActionMetadata(0,0),{address:0xac87,flags:0,priority:0});
 assert.deepEqual(readOriginalActionMetadata(0,1),{address:0xac69,flags:0,priority:0});
});
test('audited bank06 metadata bytes include exact action IDs, flags and priority',()=>{
 for(const [id,flags,priority] of [
  [1,0x24,0],[2,0x04,3],[3,0x24,3],[4,0x24,15],
  [7,0x20,4],[9,0x60,4],[11,0x64,1],[13,0x04,8],
  [16,0x40,4],[20,0x01,2],[21,0,15],[23,0,5],
  [92,0xa0,5]
 ]){
  const m=readOriginalActionMetadata(id);
  assert.equal(m.flags,flags,`id $${id.toString(16)} flags`);
  assert.equal(m.priority,priority,`id $${id.toString(16)} priority`);
 }
});
test('all 216 audited metadata bytes match independent pinned-source FNV-1a checksum',()=>{
 // Calculated independently from bank_06.asm:7295-7525 at pinned upstream SHA.
 let hash=2166136261>>>0;
 for(let action=0;action<108;action++){
  const {flags,priority}=readOriginalActionMetadata(action,1);
  hash=Math.imul(hash^flags,16777619)>>>0;
  hash=Math.imul(hash^priority,16777619)>>>0;
 }
 assert.equal(hash.toString(16).padStart(8,'0'),'842d899c');
});
test('alternate $AC69 table overlaps $AC87 after action 14 (no invented padding)',()=>{
 assert.deepEqual(readOriginalActionMetadata(15,1),readOriginalActionMetadata(0,0));
 assert.deepEqual(readOriginalActionMetadata(16,1),readOriginalActionMetadata(1,0));
 assert.deepEqual(readOriginalActionMetadata(1,1),{address:0xac6b,flags:0x24,priority:0});
});
test('negative pending action exits after setting source table pointer',()=>{
 const {ram,result}=run({action:0xff,movement:0x80});
 assert.equal(result.reason,'$AA4A-no-pending-action');
 assert.equal(ram[0x479+2],0xff);assert.equal(ram[0x459+2],0x80);
 assert.equal(ram[0x2c]|ram[0x2d]<<8,0xac87);
});
test('positive movement gate keeps pending action unconsumed',()=>{
 const {ram,result}=run({action:9,movement:2});
 assert.equal(result.reason,'$AA50-movement-not-ready');
 assert.equal(ram[0x479+2],9);assert.equal(ram[0x459+2],2);
});
test('weather effect $01 forces action $06 when eligible (source $AA25-$AA44)',()=>{
 const {ram,result}=run({action:0xff,movement:0x80,weather:0x81,skill:2,surface:2});
 assert.equal(result.forcedWeatherAction,true);
 assert.equal(result.actionBefore,0xff);
 assert.equal(ram[0x459+2],6);assert.equal(ram[0x479+2],0xff);
});
test('weather override is gated by state sign, skill bit0, and surface 1..2',()=>{
 for(const opts of [{playerState:0x80},{skill:3},{surface:0},{surface:3},{weather:2}]){
  const {ram,result}=run({action:0xff,movement:0x80,weather:1,skill:2,surface:1,...opts});
  assert.equal(result.forcedWeatherAction,false,JSON.stringify(opts));
  assert.equal(ram[0x479+2],0xff);
 }
});
test('source $AA5F consumes action with flag6 when state bit6 is clear',()=>{
 const {ram,result}=run({action:9,movement:0x80,playerState:0}); // flags $60
 assert.equal(result.reason,'$AA5F-action-flag6-gate');
 assert.equal(ram[0x479+2],0xff);assert.equal(ram[0x459+2],0x80);
});
test('source $AA70 consumes action lacking flag5 when state bit5 is set',()=>{
 const {ram,result}=run({action:2,movement:0x80,playerState:0x20}); // flags $04
 assert.equal(result.reason,'$AA70-state-flag5-gate');
 assert.equal(ram[0x459+2],0x80);
});
test('source $AA90 negative state rejects action without metadata bit7',()=>{
 const {ram,result}=run({action:4,movement:0x80,playerState:0x80});
 assert.equal(result.reason,'$AA90-negative-state-flag7-gate');
 assert.equal(ram[0x479+2],0xff);assert.equal(ram[0x459+2],0x80);
});
test('source $AA84 priority tie keeps movement and consumes pending action',()=>{
 const {ram,result}=run({action:4,movement:0x84,playerState:0});
 assert.equal(result.reason,'$AA84-existing-movement-priority');
 assert.equal(ram[0x459+2],0x84);assert.equal(ram[0x479+2],0xff);
});
test('source $AA84 lower priority action is discarded',()=>{
 const {ram,result}=run({action:2,movement:0x84,playerState:0});
 assert.equal(result.reason,'$AA84-existing-movement-priority');
 assert.equal(ram[0x459+2],0x84);
});
test('source $AA94 higher priority action replaces movement and clears pending action',()=>{
 const {ram,result}=run({action:4,movement:0x82,playerState:0});
 assert.equal(result.reason,'$AA94-accepted-action');
 assert.equal(ram[0x459+2],4);assert.equal(ram[0x479+2],0xff);
});
test('source $AA94 priority zero movement allows action and equality does not rewrite movement',()=>{
 const a=run({action:4,movement:0x80});
 assert.equal(a.result.reason,'$AA94-accepted-action');assert.equal(a.ram[0x459+2],4);
 const b=run({action:0,movement:0x80});
 assert.equal(b.result.reason,'$AA94-accepted-action');assert.equal(b.ram[0x459+2],0x80);
});
test('negative state with action metadata bit7 can accept action $35',()=>{
 const {ram,result}=run({action:0x35,movement:0x80,playerState:0x80});
 assert.equal(result.reason,'$AA94-accepted-action');
 assert.equal(ram[0x459+2],0x35);assert.equal(ram[0x479+2],0xff);
});
test('variant 1 has distinct flags, uses $AC69 pointer and can accept low IDs',()=>{
 const {ram,result}=run({action:1,movement:0x80,playerState:0},1);
 assert.equal(result.reason,'$AA94-accepted-action');
 assert.equal(ram[0x2c]|ram[0x2d]<<8,0xac69);
 assert.equal(result.actionMeta.flags,0x24);assert.equal(ram[0x459+2],1);
});
test('out-of-range action metadata is not fabricated or silently read as zero',()=>{
 assert.throws(()=>readOriginalActionMetadata(93,0),/outside audited/);
 assert.throws(()=>readOriginalActionMetadata(108,1),/outside audited/);
 assert.throws(()=>readOriginalActionMetadata(-1),/unsigned byte/);
 assert.throws(()=>readOriginalActionMetadata(1,2),/tableVariant/);
 assert.throws(()=>stepOriginalActionArbitration(new Uint8Array(12),2),/RAM/);
 assert.throws(()=>stepOriginalActionArbitration(new Uint8Array(2048),12),/player/);
});
test('no action metadata lookup for blocked movement gate even when pending ID is unaudited',()=>{
 const {ram,result}=run({action:0x7f,movement:0});
 assert.equal(result.reason,'$AA50-movement-not-ready');assert.equal(ram[0x479+2],0x7f);
});
test('selector→arbitrator integration transfers pending $35 into movement on a synthetic RAM fixture',()=>{
 const ram=createOriginalAlternateControllerRam({player:2,playerState:0x80,playerMovement:0x80,pressed:0x80});
 const selector=stepOriginalControllerDispatch(ram);
 assert.equal(selector.dispatch,'$B4C9');assert.equal(ram[0x479+2],0x35);
 const arbitration=stepOriginalActionArbitration(ram,2);
 assert.equal(arbitration.reason,'$AA94-accepted-action');
 assert.equal(ram[0x459+2],0x35);assert.equal(ram[0x479+2],0xff);
});
test('arbitration never mutates Enhanced match state or unrelated RAM regions',()=>{
 const ram=createOriginalActionArbitrationRam({player:5,action:4,movement:0x82});
 ram[0x300]=0x91;ram[0x320]=0x83;ram[0x4d6]=12;
 const trace=stepOriginalActionArbitration(ram,5);
 assert.equal(ram[0x300],0x91);assert.equal(ram[0x320],0x83);assert.equal(ram[0x4d6],12);
 assert.ok(trace.writes.every(x=>[0x2c,0x2d,0x479+5,0x459+5].includes(x.address)));
});
