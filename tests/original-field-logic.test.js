import test from 'node:test';
import assert from 'node:assert/strict';
import {NES_BUTTONS as B,createOriginalControllerState,encodeOriginalSerialRead,stepOriginalControllerInput} from '../src/classic/OriginalInput.js';
import {createOriginalFieldResearchState,stepOriginalFieldPause,stepOriginalFoulFlag,evaluateOriginalKickoffGate} from '../src/classic/OriginalFieldLogic.js';
import {ORIGINAL_SCREEN_HANDLERS,ORIGINAL_MATCH_SUBSCREEN_HANDLERS,resolveOriginalScreenHandler,resolveOriginalMatchSubscreenHandler} from '../src/classic/OriginalScreenDispatch.js';
const fresh=createOriginalFieldResearchState;

test('source screen dispatch maps all four $C4A3 entries exactly',()=>{
 assert.deepEqual(ORIGINAL_SCREEN_HANDLERS,[0xc4ab,0xc4b1,0xc4b7,0xc4bd]);
 for(let i=0;i<4;i++)assert.equal(resolveOriginalScreenHandler(i),ORIGINAL_SCREEN_HANDLERS[i]);
});
test('source match subscreen dispatch maps all thirteen $C51F entries exactly',()=>{
 assert.deepEqual(ORIGINAL_MATCH_SUBSCREEN_HANDLERS,[0xc539,0xc57d,0xc615,0xc699,0xc71e,0xc77d,0xc7d0,0xc743,0xc77d,0xc75d,0xc777,0xc743,0xc77d]);
 for(let i=0;i<13;i++)assert.equal(resolveOriginalMatchSubscreenHandler(i),ORIGINAL_MATCH_SUBSCREEN_HANDLERS[i]);
});
test('out-of-range original screen table lookups fail safely rather than read unknown memory',()=>{
 for(const x of [-1,4,NaN,0.2,'1',256])assert.throws(()=>resolveOriginalScreenHandler(x),RangeError);
 for(const x of [-1,13,NaN,1.3,'2'])assert.throws(()=>resolveOriginalMatchSubscreenHandler(x),RangeError);
});
test('source field subscreen is original CPU $C615',()=>assert.equal(resolveOriginalMatchSubscreenHandler(2),0xc615));
test('field Start new-press toggles pause bit, preserving all other script flags',()=>{
 const s=fresh({gameScript:0x22,musicId:0x19,ram06fd:0xab});
 assert.deepEqual(stepOriginalFieldPause(s,B.START),{changed:true,paused:true,audioCommands:[0,0x2d]});
 assert.equal(s.gameScript,0xa2);assert.equal(s.ram06fd,0);
 assert.deepEqual(stepOriginalFieldPause(s,B.START),{changed:true,paused:false,audioCommands:[0x19]});
 assert.equal(s.gameScript,0x22);
});
test('non-Start new-press does not pause, even with held Start elsewhere',()=>{
 const s=fresh({gameScript:0x80,ram06fd:0x55});
 assert.deepEqual(stepOriginalFieldPause(s,B.A|B.B),{changed:false,paused:true,audioCommands:[]});
 assert.equal(s.ram06fd,0x55);
});
test('serial controller press edges prevent pause retrigger on held Start',()=>{
 const c=createOriginalControllerState(),s=fresh({musicId:0x34});
 const scan=raw=>stepOriginalControllerInput(c,()=>encodeOriginalSerialRead([raw,0,0,0]));
 scan(B.START);assert.equal(stepOriginalFieldPause(s,c.pressed[0]).paused,true);
 scan(B.START);assert.equal(stepOriginalFieldPause(s,c.pressed[0]).changed,false);
 scan(0);assert.equal(stepOriginalFieldPause(s,c.pressed[0]).changed,false);
 scan(B.START);assert.deepEqual(stepOriginalFieldPause(s,c.pressed[0]),{changed:true,paused:false,audioCommands:[0x34]});
});
test('Start on controller channel 2 is not read by source $C615 controller 1 logic',()=>{
 const c=createOriginalControllerState(),s=fresh();
 stepOriginalControllerInput(c,()=>encodeOriginalSerialRead([0,B.START,0,0]));
 assert.deepEqual(c.pressed,[0,B.START,0,0]);
 assert.equal(stepOriginalFieldPause(s,c.pressed[0]).changed,false);
});
test('foul bit absent makes $C87B a no-op',()=>{
 const s=fresh({gameScript:0x80,ballState:0xc0,cutsceneTimer:0x7f,formationVariant:0x17});
 const before=structuredClone(s);
 assert.deepEqual(stepOriginalFoulFlag(s),{hadPending:false,cleared:false,timerIncremented:false});
 assert.deepEqual(s,before);
});
test('foul pending and ball high flags cause immediate clear and reset',()=>{
 for(const ballState of [0x40,0x80,0xc0]){
  const s=fresh({gameScript:0xa1,ballState,cutsceneTimer:4,formationVariant:0x77});
  assert.deepEqual(stepOriginalFoulFlag(s),{hadPending:true,cleared:true,timerIncremented:false});
  assert.equal(s.gameScript,0x81);assert.equal(s.cutsceneTimer,0);assert.equal(s.formationVariant,0);
 }
});
test('foul pending and no ball flags increments 8-bit cutscene timer',()=>{
 const s=fresh({gameScript:0x20,cutsceneTimer:0x7e,formationVariant:3});
 assert.deepEqual(stepOriginalFoulFlag(s),{hadPending:true,cleared:false,timerIncremented:true});
 assert.equal(s.cutsceneTimer,0x7f);assert.equal(s.gameScript,0x20);assert.equal(s.formationVariant,3);
 assert.deepEqual(stepOriginalFoulFlag(s),{hadPending:true,cleared:true,timerIncremented:true});
 assert.equal(s.cutsceneTimer,0);assert.equal(s.gameScript,0);assert.equal(s.formationVariant,0);
});
test('foul cutscene timer wraps 0xff to 0 without clearing pending bit',()=>{
 const s=fresh({gameScript:0x20,cutsceneTimer:0xff});
 assert.equal(stepOriginalFoulFlag(s).cleared,false);
 assert.equal(s.cutsceneTimer,0);assert.equal(s.gameScript,0x20);
});
test('kickoff gate waits for brightness, foul resolution or ball bit $40',()=>{
 assert.equal(evaluateOriginalKickoffGate({brightnessFlag:0,gameScript:0,ballState:0}).reason,'await-brightness');
 assert.equal(evaluateOriginalKickoffGate({brightnessFlag:0x80,gameScript:0x20,ballState:0}).reason,'await-foul-clear');
 assert.equal(evaluateOriginalKickoffGate({brightnessFlag:0x80,gameScript:0,ballState:0x40}).reason,'await-ball-flag');
 assert.equal(evaluateOriginalKickoffGate({brightnessFlag:0x80,gameScript:0,ballState:0x80}).advance,true);
 assert.equal(evaluateOriginalKickoffGate({brightnessFlag:0x80,gameScript:0,ballState:0x40},{foulWasPending:true}).advance,true);
});
test('kickoff source call-site: cleared foul bypasses ball bit6 test',()=>{
 const s=fresh({gameScript:0x20,ballState:0x40,cutsceneTimer:0x05});
 const result=stepOriginalFoulFlag(s);
 assert.equal(result.cleared,true);
 assert.equal(evaluateOriginalKickoffGate({brightnessFlag:0x80,...s},{foulWasPending:result.hadPending}).advance,true);
});
test('field research helpers validate bytes before mutating any state',()=>{
 assert.throws(()=>fresh({gameScript:-1}),/byte/);
 assert.throws(()=>fresh({musicId:256}),/byte/);
 const s=fresh();const before=structuredClone(s);
 assert.throws(()=>stepOriginalFieldPause(s,256),/byte/);
 assert.throws(()=>stepOriginalFoulFlag({...s,cutsceneTimer:0x100}),/byte/);
 assert.throws(()=>evaluateOriginalKickoffGate({brightnessFlag:0x80,gameScript:-1,ballState:0}),/byte/);
 assert.deepEqual(s,before);
});
test('exhaustive all 256 pressed-byte masks toggle only on source Start bit $10',()=>{
 for(let pressed0=0;pressed0<256;pressed0++){
  const s=fresh({gameScript:0x01,musicId:0x37,ram06fd:0x9a});
  const result=stepOriginalFieldPause(s,pressed0);
  const shouldToggle=!!(pressed0&0x10);
  assert.equal(result.changed,shouldToggle,`press mask ${pressed0}`);
  assert.equal(s.gameScript,shouldToggle?0x81:0x01);
  assert.equal(s.ram06fd,shouldToggle?0:0x9a);
 }
});
test('exhaustive foul timer sign behavior for all 256 starting values',()=>{
 for(let initial=0;initial<256;initial++){
  const s=fresh({gameScript:0x20,ballState:0,cutsceneTimer:initial,formationVariant:0x3e});
  const result=stepOriginalFoulFlag(s);
  const after=(initial+1)&0xff;
  const shouldClear=!!(after&0x80);
  assert.equal(result.cleared,shouldClear,`timer ${initial}`);
  assert.equal(s.gameScript,shouldClear?0:0x20);
  assert.equal(s.cutsceneTimer,shouldClear?0:after);
  assert.equal(s.formationVariant,shouldClear?0:0x3e);
 }
});
