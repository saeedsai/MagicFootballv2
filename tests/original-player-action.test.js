import test from 'node:test';
import assert from 'node:assert/strict';
import {
 ORIGINAL_ACTION_ANGLES as ANGLES,ORIGINAL_ACTION_LOOKUP as ACTIONS,
 evaluateOriginalPlayerActionEntry as entry,
 createOriginalPlayerActionState as fresh,
 stepOriginalPlayerActionPostHelper as step,
 scheduleOriginalKickoffControllerCalls as kickoff
} from '../src/classic/OriginalPlayerAction.js';

test('bank04 $B8AB entry gate checks control position sign then existing action sign',()=>{
 for(let controlPosition=0;controlPosition<256;controlPosition++){
  for(const action of [0,1,0x7f,0x80,0xff]){
   const result=entry({controlPosition,action});
   assert.equal(result.dispatch,!(controlPosition&0x80)&&!!(action&0x80));
   assert.equal(result.reason,controlPosition&0x80?'control-position-negative':action&0x80?'enter-$C07A-then-$B8C3':'existing-action-nonnegative');
  }
 }
});

test('original $B9E5 16-entry angle table and $BA05 action table are exact bytes',()=>{
 assert.deepEqual(ANGLES,[255,64,192,0,128,96,160,0,0,32,224,0,0,0,0,0]);
 assert.deepEqual(ACTIONS,[10,8,9,8,4,4,4,5,5,5,5]);
 assert.equal(Object.isFrozen(ANGLES),true);assert.equal(Object.isFrozen(ACTIONS),true);
});

test('negative player state: A new press selects action $04 without altering angle',()=>{
 for(let held=0;held<256;held++){
  const s=fresh({playerState:0x80,pressed:0x80,held,angle:0x37});
  const r=step(s);assert.equal(s.action,4);assert.equal(s.angle,0x37);
  assert.equal(r.actionWritten,true);assert.equal(r.angleWritten,false);
  assert.equal(r.path,`$B952-lookup-${held&0x0c?5:6}`);
 }
});

test('negative player state: B new press selects $05; A takes priority over B',()=>{
 for(let held=0;held<256;held++){
  for(const pressed of [0x40,0xc0,0xff]){
   const s=fresh({playerState:0x80,held,pressed,angle:0x55});const r=step(s);
   assert.equal(s.action,pressed&0x80?4:5);
   assert.equal(s.angle,0x55);assert.equal(r.angleWritten,false);
  }
 }
});

test('negative state with no A/B press retains action, updates angle from held nibble',()=>{
 for(let held=0;held<256;held++){
  for(const pressed of [0,1,2,4,8,0x10,0x20,0x3f]){
   const s=fresh({playerState:0xa0,held,pressed,action:0xe3,angle:0x33});const r=step(s);
   assert.equal(s.action,0xe3);assert.equal(s.angle,ANGLES[held&0x0f]);
   assert.equal(r.actionWritten,false);assert.equal(r.angleWritten,true);
  }
 }
});

test('nonnegative state buffer20 sign + horizontal held produces action $09/$0A via facing sign XOR direction',()=>{
 for(const facing of [0,1,0x7f,0x80,0xff]){
  for(let held=1;held<256;held+=2){
   const s=fresh({playerState:0,buffer20:0x80,held,facing,angle:0x11});const r=step(s);
   assert.equal(s.action,((facing>>7)^(held&1))&1?9:10);
   assert.equal(s.angle,0x11);assert.equal(r.angleWritten,false);
  }
 }
});

test('nonnegative state buffer20 sign + no horizontal held selects $08 or $09 from player state bit3',()=>{
 for(const state of [0,0x08,0x10,0x20,0x28,0x40,0x48,0x7f]){
  for(const held of [0,4,8,12,0x20,0x80]){
   const s=fresh({playerState:state,buffer20:0x80,held});const r=step(s);
   assert.equal(s.action,state&8?9:8);assert.equal(r.path,'$B93E-stationary');
  }
 }
});

test('nonnegative state buffer20 bit6 selects $04; bit5 selects $05',()=>{
 for(let held=0;held<256;held++){
  for(const [buffer20,action] of [[0x40,4],[0x60,4],[0x20,5],[0x3f,5]]){
   const s=fresh({playerState:0,buffer20,held,angle:0x42});const r=step(s);
   assert.equal(s.action,action);assert.equal(s.angle,0x42);
   assert.equal(r.angleWritten,false);
  }
 }
});

test('nonnegative fallback buffer21 low nibble and held direction choose $01/$06/$0D/$07',()=>{
 for(let held=0;held<256;held++){
  for(const buffer21 of [0,0x10,0x04,0x08,0x0c,0x01,0x02,0x03,0xff]){
   const s=fresh({playerState:0,held,buffer20:0,buffer21,angle:0x11});const r=step(s);
   const expected=!(buffer21&15)?(held&15?6:1):buffer21&3?7:13;
   assert.equal(s.action,expected,`held=${held} buffer21=${buffer21}`);
   assert.equal(s.angle,ANGLES[held&15]);assert.equal(r.actionWritten,true);assert.equal(r.angleWritten,true);
  }
 }
});

test('action class calculation respects state bits $B0 and is independent of table values',()=>{
 for(let playerState=0;playerState<256;playerState++){
  const s=fresh({playerState,held:1,buffer20:0,pressed:0});const r=step(s);
  const expected=(playerState&0xb0)?1+(playerState&0x80?0:1+(playerState&0x20?0:1)):0;
  assert.equal(r.classIndex,expected,`state ${playerState}`);
  assert.ok(expected>=0&&expected<=3);
 }
});

test('post-helper result is deterministic across cloned snapshots and changes only action/angle',()=>{
 for(let n=0;n<1000;n++){
  const s=fresh({playerId:n%12,playerState:(n*37)&255,held:(n*61)&255,pressed:(n*23)&255,buffer20:(n*97)&255,buffer21:(n*53)&255,facing:(n*17)&255,action:(n*3)&255,angle:(n*11)&255});
  const before=structuredClone(s),copy=structuredClone(s),r1=step(s),r2=step(copy);
  assert.deepEqual(s,copy);assert.deepEqual(r1,r2);
  for(const k of ['playerId','playerState','held','pressed','buffer20','buffer21','facing'])assert.equal(s[k],before[k]);
 }
});

test('invalid byte/ID and invalid gate input are rejected without modifying snapshots',()=>{
 assert.throws(()=>fresh({playerId:12}),/0\.\.11/);
 assert.throws(()=>fresh({buffer20:256}),/byte/);
 assert.throws(()=>fresh({playerState:NaN}),/byte/);
 assert.throws(()=>entry({controlPosition:-1,action:0x80}),/byte/);
 assert.throws(()=>entry({controlPosition:0,action:1.5}),/byte/);
 const s=fresh({pressed:0x80});const before=structuredClone(s);
 s.buffer21=Infinity;
 assert.throws(()=>step(s),/byte/);
 assert.deepEqual({...s,buffer21:before.buffer21},before);
});

test('kickoff $B4B2 schedules one $B850 call when script bit0 set, else four $B4C9 calls',()=>{
 for(let script=0;script<256;script++){
  const calls=kickoff(script);
  if(script&1)assert.deepEqual(calls,[{address:'$B850',executed:false}]);
  else assert.deepEqual(calls,[0,1,2,3].map(controllerSlot=>({address:'$B4C9',controllerSlot,executed:false})));
 }
 assert.throws(()=>kickoff(256),/byte/);
});

test('controller new-press edges integrate into post-helper action branch (without Classic runtime)',async()=>{
 const {createOriginalControllerState,encodeOriginalSerialRead,stepOriginalControllerInput,NES_BUTTONS}=await import('../src/classic/OriginalInput.js');
 const c=createOriginalControllerState();const sample=held=>stepOriginalControllerInput(c,()=>encodeOriginalSerialRead([held,0,0,0]));
 sample(0);const a=sample(NES_BUTTONS.A);
 const s=fresh({playerState:0x80,held:a.held[0],pressed:a.pressed[0]});
 assert.equal(step(s).action,4);
 const held=sample(NES_BUTTONS.A);
 const next=fresh({playerState:0x80,held:held.held[0],pressed:held.pressed[0],action:0xe0});
 const result=step(next);assert.equal(next.action,0xe0);assert.equal(result.angleWritten,true);
});
