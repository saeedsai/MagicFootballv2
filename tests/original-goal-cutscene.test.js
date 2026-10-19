import test from 'node:test';
import assert from 'node:assert/strict';
import {NES_BUTTONS as B} from '../src/classic/OriginalInput.js';
import {ORIGINAL_GOAL_PRE_UPDATE_CALLS,createOriginalGoalCutsceneState as fresh,prepareOriginalGoalCutsceneFrame as begin,stepOriginalGoalCutscenePostUpdates as step} from '../src/classic/OriginalGoalCutscene.js';

test('goal subscreen $C699 masks tile update bits 4/5 and lists all 12 unported calls',()=>{
 const s=fresh({tileUpdateFlag:0xff,cutsceneTimer:12});
 const r=begin(s);
 assert.equal(s.tileUpdateFlag,0xcf);
 assert.equal(s.cutsceneTimer,12);
 assert.equal(r.nextBoundary,'$C6C5');
 assert.deepEqual(r.pendingExternalCalls,ORIGINAL_GOAL_PRE_UPDATE_CALLS);
 assert.equal(r.pendingExternalCalls.length,12);
});
test('source tile flag mask covers every byte value without changing other fields',()=>{
 for(let flag=0;flag<256;flag++){
  const s=fresh({tileUpdateFlag:flag,gameScript:0x42,cutsceneTimer:0x3f});
  begin(s);assert.equal(s.tileUpdateFlag,flag&0xcf);
  assert.equal(s.gameScript,0x42);assert.equal(s.cutsceneTimer,0x3f);
 }
});
test('cutscene timer increments at $00 and $3F with no skip input, not at $FF',()=>{
 for(const [timer,next] of [[0,1],[0x1f,0x20],[0x3f,0x40],[0xff,0xff]]){
  const s=fresh({cutsceneTimer:timer});const r=step(s,0);
  assert.equal(s.cutsceneTimer,next);assert.equal(r.skipTriggered,false);
  assert.equal(r.timerIncremented,timer<0x40);
  assert.deepEqual(r.externalCalls,[{address:'$D073',executed:false}]);
 }
});
test('new Start or Select press skips cutscene below $40, but A/B/directions do not',()=>{
 for(let mask=0;mask<256;mask++){
  const s=fresh({cutsceneTimer:0x12,weatherEffect:0x99});const r=step(s,mask);
  const shouldSkip=!!(mask&0x30);
  assert.equal(r.skipTriggered,shouldSkip,`mask ${mask}`);
  assert.equal(s.cutsceneTimer,shouldSkip?0xff:0x13,`mask ${mask}`);
  assert.equal(s.weatherEffect,shouldSkip?0:0x99);
  assert.equal(r.externalCalls.some(x=>x.address==='$C2E4'),shouldSkip);
 }
});
test('timer $40..$FE automatically finishes; $FF is an inert latch',()=>{
 for(let timer=0x40;timer<=0xff;timer++){
  const s=fresh({cutsceneTimer:timer,weatherEffect:0x35});const r=step(s,B.START);
  const shouldSkip=timer!==0xff;
  assert.equal(r.skipTriggered,shouldSkip,`timer ${timer}`);
  assert.equal(s.cutsceneTimer,0xff);
  assert.equal(s.weatherEffect,shouldSkip?0:0x35);
 }
});
test('camera retarget requires timer >=$20 AND script bit $02',()=>{
 for(const timer of [0x1f,0x20,0x3f,0x40,0xff]){
  for(const script of [0,1,2,3,0x42,0xff]){
   const s=fresh({cutsceneTimer:timer,gameScript:script,ballOwner:0xab,cameraObject:0xe2});
   const r=step(s,0);const expected=timer>=0x20&&!!(script&2);
   assert.equal(r.cameraRetargeted,expected,`${timer}/${script}`);
   assert.equal(s.cameraObject,expected?0x4b:0xe2);
  }
 }
});
test('source brightness gate requires BOTH $80 and $40, clears script/timer only then',()=>{
 for(let brightness=0;brightness<256;brightness++){
  const s=fresh({brightnessFlag:brightness,cutsceneTimer:0x12,gameScript:0x42});
  const r=step(s,0);const ready=(brightness&0xc0)===0xc0;
  assert.equal(r.brightnessComplete,ready,`brightness ${brightness}`);
  assert.equal(s.gameScript,ready?0:0x42);
  assert.equal(s.cutsceneTimer,ready?0:0x13);
  assert.equal(r.externalCalls.some(x=>x.address==='$C91A'),ready);
 }
});
test('source call order on manual skip and completed brightness gate',()=>{
 const s=fresh({cutsceneTimer:0x12,gameScript:0x42,brightnessFlag:0xc0,weatherEffect:8});
 const r=step(s,B.SELECT);
 assert.deepEqual(r.externalCalls,[
  {address:'$D047',executed:false},
  {address:'$C2E4',argument:0,executed:false},
  {address:'$D073',executed:false},
  {address:'$C91A',executed:false}
 ]);
 assert.equal(s.cutsceneTimer,0);assert.equal(s.gameScript,0);assert.equal(s.weatherEffect,0);
});
test('invalid byte state/press rejected atomically',()=>{
 assert.throws(()=>fresh({cutsceneTimer:256}),/byte/);
 const s=fresh({cutsceneTimer:3,tileUpdateFlag:0xff});const before=structuredClone(s);
 assert.throws(()=>step(s,-1),/byte/);
 assert.throws(()=>step({...s,gameScript:NaN},0),/byte/);
 assert.throws(()=>begin({...s,brightnessFlag:1.5}),/byte/);
 assert.deepEqual(s,before);
});
test('research phases can be called repeatedly without any external game simulation',()=>{
 const s=fresh({tileUpdateFlag:0xff,cutsceneTimer:0x3e,gameScript:0x42,ballOwner:0x1a});
 begin(s);const first=step(s,0);
 assert.equal(s.tileUpdateFlag,0xcf);assert.equal(s.cutsceneTimer,0x3f);
 assert.equal(first.cameraRetargeted,true);assert.equal(s.cameraObject,0x4a);
 begin(s);step(s,0);assert.equal(s.cutsceneTimer,0x40);
 begin(s);const third=step(s,0);
 assert.equal(third.skipTriggered,true);assert.equal(s.cutsceneTimer,0xff);
 assert.equal(s.gameScript,0x42); // full state transition needs brightness and unported dependencies
});
