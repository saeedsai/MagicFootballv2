import test from 'node:test';
import assert from 'node:assert/strict';
import {createOriginalActionBufferState as fresh,stepOriginalActionBuffers as step} from '../src/classic/OriginalActionBuffers.js';
import {createOriginalPlayerActionState,stepOriginalPlayerActionPostHelper} from '../src/classic/OriginalPlayerAction.js';

test('$FAEE no held A/B and no pending hold clears action buffers, then $FB5F runs',()=>{
 const s=fresh({held:0x0f,pressed:0,buffer56c:0x40,buffer570:0x40,buffer574:0,buffer578:22,buffer57c:0xff});
 const r=step(s);
 assert.equal(r.actionPath,'no-action-hold');assert.equal(s.buffer56c,0);assert.equal(s.buffer570,0);
 assert.equal(s.buffer578,0);assert.equal(s.buffer57c,0);assert.equal(s.buffer584,1);
});

test('$FAEE A held is delayed until the third consecutive frame, then only edge once',()=>{
 const s=fresh({held:0x80,pressed:0x80});
 assert.equal(step(s).actionPath,'new-action-hold');
 assert.equal(s.buffer574,0x40);assert.equal(s.buffer570,0);
 s.pressed=0;assert.equal(step(s).actionPath,'held-action-delay-pending');
 assert.equal(s.buffer578,1);assert.equal(s.buffer570,0);
 assert.equal(step(s).actionPath,'held-action-delay-complete');
 assert.equal(s.buffer578,2);assert.equal(s.buffer570,0x40);assert.equal(s.buffer56c,0x40);
 step(s);assert.equal(s.buffer570,0);assert.equal(s.buffer578,3);
 s.held=0;step(s);assert.equal(s.buffer574,0);assert.equal(s.buffer570,0);
 step(s);assert.equal(s.buffer56c,0);
});

test('$FAEE B held maps to $20 and A+B simultaneous sets $80 special bit',()=>{
 const b=fresh({held:0x40});step(b);step(b);step(b);
 assert.equal(b.buffer570,0x20);
 const both=fresh({held:0xc0});const r=step(both);
 assert.equal(r.actionPath,'simultaneous-A-B');
 assert.equal(both.buffer56c,0xe0);assert.equal(both.buffer570,0xe0);
 step(both);assert.equal(both.buffer570,0);
});

test('$FAEE pending held byte is emitted once when A/B released before delay',()=>{
 const s=fresh({held:0x80});step(s);
 s.held=0;const r=step(s);
 assert.equal(r.actionPath,'released-pending-action');
 assert.equal(s.buffer570,0x40);assert.equal(s.buffer56c,0x40);
 step(s);assert.equal(s.buffer570,0);assert.equal(s.buffer56c,0);
});

test('$FAEE counter increments as a byte; wraps at 255 before 2 threshold',()=>{
 const s=fresh({held:0x80,buffer574:0x40,buffer578:0xff,buffer570:0x11});
 const r=step(s);assert.equal(r.actionPath,'held-action-delay-pending');
 assert.equal(s.buffer578,0);assert.equal(s.buffer570,0x11);
});

test('$FB5F first directional press stores low nibble and resets directional timer',()=>{
 for(let pressed=1;pressed<16;pressed++){
  const s=fresh({pressed,buffer580:0xa0,buffer584:0x40,buffer57c:0xff});
  const r=step(s);assert.equal(r.directionPath,'new-direction-edge');
  assert.equal(s.buffer580,0xa0|pressed);assert.equal(s.buffer584,0);assert.equal(s.buffer57c,0);
 }
});

test('$FB5F rapid same-direction repeat (<6 frames) writes $057C',()=>{
 const s=fresh({pressed:1});step(s);
 s.pressed=0;for(let i=0;i<5;i++)step(s);
 s.pressed=1;const r=step(s);
 assert.equal(r.directionPath,'quick-direction-repeat');
 assert.equal(s.buffer57c,1);assert.equal(s.buffer584,5);
 s.pressed=0;step(s);assert.equal(s.buffer57c,0);
 s.pressed=1;assert.equal(step(s).directionPath,'new-direction-edge');
 assert.equal(s.buffer57c,0);assert.equal(s.buffer584,0);
});

test('$FB5F new different direction is not a quick repeat',()=>{
 const s=fresh({pressed:1});step(s);
 s.pressed=2;const r=step(s);
 assert.equal(r.directionPath,'new-direction-edge');
 assert.equal(s.buffer580,2);assert.equal(s.buffer57c,0);
});

test('$FB5F direction timer increments and saturates at $7F',()=>{
 for(let initial=0;initial<256;initial++){
  const s=fresh({buffer584:initial});step(s);
  const expected=((initial+1)&255)&0x80?0x7f:(initial+1)&255;
  assert.equal(s.buffer584,expected,`initial=${initial}`);
 }
 const s=fresh({buffer584:0x7f});step(s);assert.equal(s.buffer584,0x7f);
});

test('$FB5F quick repeat intersects new direction bits with previously recorded direction bits',()=>{
 for(let old=0;old<16;old++){
  for(let press=1;press<16;press++){
   const s=fresh({pressed:press,buffer580:0xf0|old,buffer584:5});
   const r=step(s),repeat=old&press;
   assert.equal(s.buffer57c,repeat);
   assert.equal(r.directionPath,repeat?'quick-direction-repeat':'new-direction-edge');
   assert.equal(s.buffer580,repeat?0xf0|old:0xf0|press);
  }
 }
});

test('full $FAEE buffer + $B8AB post-helper action chain produces source action $04',()=>{
 const buffers=fresh({held:0x80,pressed:0x80});step(buffers);
 buffers.pressed=0;step(buffers);step(buffers);
 const player=createOriginalPlayerActionState({playerState:0,held:buffers.held,pressed:buffers.pressed,buffer20:buffers.buffer570,buffer21:buffers.buffer57c});
 const r=stepOriginalPlayerActionPostHelper(player);
 assert.equal(player.action,4);assert.equal(r.actionWritten,true);
 // Repeated right-direction press within the window produces buffer21=1,
 // which selects action $07 in the nonnegative-state fallback branch.
 buffers.held=0;buffers.pressed=1;step(buffers);
 buffers.pressed=0;step(buffers);
 buffers.pressed=1;step(buffers);
 assert.equal(buffers.buffer57c,1);
 const second=createOriginalPlayerActionState({playerState:0,held:0,buffer20:buffers.buffer570,buffer21:buffers.buffer57c});
 stepOriginalPlayerActionPostHelper(second);assert.equal(second.action,7);
});

test('invalid buffer state rejected before any mutation',()=>{
 assert.throws(()=>fresh({buffer584:256}),/byte/);
 const s=fresh({held:0x80,buffer574:0x40});s.pressed=-1;
 const before=structuredClone(s);
 assert.throws(()=>step(s),/byte/);assert.deepEqual(s,before);
});

test('source buffer routine deterministic for randomized 4000-frame input tape',()=>{
 const a=fresh(),b=fresh();let seed=0x12345678;
 for(let i=0;i<4000;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  a.held=b.held=seed&0xff;a.pressed=b.pressed=(seed>>>8)&0xff;
  assert.deepEqual(step(a),step(b));assert.deepEqual(a,b);
 }
});
