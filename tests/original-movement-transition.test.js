import test from 'node:test';
import assert from 'node:assert/strict';
import {ORIGINAL_BALL_MOVEMENT_FLAGS,stepOriginalMovementState,stepOriginalBallShotPriority} from '../src/classic/OriginalMovementTransition.js';
import {createOriginalActionArbitrationRam,stepOriginalActionArbitration,readOriginalActionMetadata} from '../src/classic/OriginalActionArbitration.js';
const ram=()=>new Uint8Array(0x800);

test('original $AC4D-$AC64 contains 24 source-audited ball state bytes',()=>{
 assert.deepEqual(ORIGINAL_BALL_MOVEMENT_FLAGS,[0,0,64,64,128,132,128,0,0,192,128,0,0,128,128,72,72,80,80,64,192,192,132,0]);
});
test('$AAC8 zero movement selects $AC87 and writes original scratch pointer',()=>{
 const m=ram();m[0x459+2]=0x80;m[0x486+2]=0xff;
 const trace=stepOriginalMovementState(m,2);
 assert.equal(trace.metadataAddress,0xac87);
 assert.equal(m[0x2c]|m[0x2d]<<8,0xac87);
 assert.equal(m[0x486+2],0x08); // table flags zero, old bit3 retained
 assert.equal(m[0x1d],0x08);
});
test('$AAC3 variant selects $AC69 without copying unrelated bytes',()=>{
 const m=ram();m[0x459+4]=1;m[0x486+4]=0x20;m[0x501]=0x7c;
 const trace=stepOriginalMovementState(m,4,{tableVariant:1});
 assert.equal(trace.metadataAddress,0xac6b);
 assert.equal(m[0x2c]|m[0x2d]<<8,0xac69);
 assert.equal(m[0x486+4],0); // source flags 0x24, bit3 was clear, bit5 not preserved
 assert.equal(m[0x501],0x7c);
});
test('metadata flag bit2 clears old state bit3 via source AND/ASL/EOR',()=>{
 const m=ram();m[0x459]=2;m[0x486]=0x08; // variant 0 flags $04
 stepOriginalMovementState(m,0);
 assert.equal(m[0x1d],0);assert.equal(m[0x486],0);
});
test('metadata bits 7, 3, 0 propagate through $AB01 mask $89',()=>{
 const m=ram();m[0x459]=23; // look up flags without inventing movement name
 m[0x486]=0xff;
 const expected=readOriginalActionMetadata(23).flags;
 stepOriginalMovementState(m,0);
 assert.equal(m[0x486],(expected&0x89)|(((expected&4)?0:8)));
});
test('negative Z_hi and Z_lo < $F8 adds airborne state bit $20',()=>{
 for(const [hi,lo,expected] of [[0x80,0xf7,0x20],[0xff,0,0x20],[0x80,0xf8,0],[0x7f,0,0]]){
  const m=ram();m[0x399+3]=hi;m[0x386+3]=lo;
  stepOriginalMovementState(m,3);
  assert.equal(m[0x486+3]&0x20,expected,`${hi},${lo}`);
 }
});
test('ASL movement byte wraps 8 bits (high bit discarded)',()=>{
 const a=ram(),b=ram();a[0x459+1]=0x80;b[0x459+1]=0;
 stepOriginalMovementState(a,1);stepOriginalMovementState(b,1);
 assert.equal(a[0x486+1],b[0x486+1]);
});
test('out-of-audited metadata read rejects before mutating RAM',()=>{
 const m=ram();m[0x459+2]=0x7f;const before=m.slice();
 assert.throws(()=>stepOriginalMovementState(m,2),/outside audited source/);
 assert.deepEqual(m,before);
});
test('invalid RAM, player and variant fail without source state changes',()=>{
 assert.throws(()=>stepOriginalMovementState(new Uint8Array(3),0),/RAM/);
 assert.throws(()=>stepOriginalMovementState(ram(),12),/slot/);
 assert.throws(()=>stepOriginalMovementState(ram(),0,{tableVariant:2}),/tableVariant/);
 assert.throws(()=>stepOriginalBallShotPriority(ram(),-1),/slot/);
});
test('$AB2D negative pending shot returns without writes',()=>{
 const m=ram();m[0x485]=0xff;m[0x459+2]=0x84;m[0x1c]=0x35;
 const trace=stepOriginalBallShotPriority(m,2);
 assert.equal(trace.reason,'$AB2D-negative-pending-shot');
 assert.equal(m[0x485],0xff);assert.equal(m[0x459+2],0x84);assert.equal(m[0x1c],0x35);
});
test('$AB46 accepts pending shot when current state low nibble is lower',()=>{
 const m=ram();m[0x485]=5;m[0x492]=0x82;m[0x459+1]=0x80;
 const trace=stepOriginalBallShotPriority(m,1);
 assert.equal(trace.reason,'$AB46-shot-movement-selected');
 assert.equal(m[0x459+1],5);assert.equal(m[0x1c],4);assert.equal(m[0x485],0xff);
});
test('$AB46 accepts equal low-nibble priority',()=>{
 const m=ram();m[0x485]=5;m[0x492]=0x44;
 assert.equal(stepOriginalBallShotPriority(m,0).reason,'$AB46-shot-movement-selected');
});
test('$AB4C rejects lower pending priority but always consumes shot',()=>{
 const m=ram();m[0x485]=5;m[0x492]=0x95;m[0x459+2]=0x81;
 const trace=stepOriginalBallShotPriority(m,2);
 assert.equal(trace.reason,'$AB4C-shot-movement-rejected');
 assert.equal(m[0x459+2],0x81);assert.equal(m[0x485],0xff);assert.equal(m[0x1c],4);
});
test('ball priority compares low nibbles, not sign or high bits',()=>{
 const m=ram();m[0x485]=15;m[0x492]=0xf7;
 stepOriginalBallShotPriority(m,0);
 assert.equal(m[0x459],15);assert.equal(m[0x1c],8);
});
test('shot indices outside audited $AC4D bytes refuse guessed ROM overread',()=>{
 const m=ram();m[0x485]=24;const before=m.slice();
 assert.throws(()=>stepOriginalBallShotPriority(m,0),/outside audited/);
 assert.deepEqual(m,before);
});
test('synthetic action arbitration -> movement-state -> shot-priority chain preserves source byte semantics',()=>{
 const m=createOriginalActionArbitrationRam({player:2,action:0x35,movement:0x80,playerState:0x80});
 const arb=stepOriginalActionArbitration(m,2);
 assert.equal(arb.reason,'$AA94-accepted-action');
 const movement=stepOriginalMovementState(m,2);
 assert.equal(movement.movement,0x35);
 m[0x485]=5;m[0x492]=0;
 const shot=stepOriginalBallShotPriority(m,2);
 assert.equal(shot.reason,'$AB46-shot-movement-selected');
 assert.equal(m[0x459+2],5);
 // This chain is a synthetic ordering demonstration, NOT a verified NES frame.
});
