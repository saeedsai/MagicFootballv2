import test from 'node:test';
import assert from 'node:assert/strict';
import {
 NES_BUTTONS as B,decodeOriginalSerialRead,encodeOriginalSerialRead,
 createOriginalControllerState,updateOriginalControllerEdges,stepOriginalControllerInput
} from '../src/classic/OriginalInput.js';
const sample=raw=>encodeOriginalSerialRead(raw);
const stable=raw=>()=>sample(raw);
test('original source-derived button order: first A is bit 7, last Right bit 0',()=>{
 const p16=[1,0,0,0,0,0,0,1],p17=[0,1,0,0,0,0,1,0];
 assert.deepEqual(decodeOriginalSerialRead({port4016:p16,port4017:p17}),[0x81,0x42,0,0]);
 assert.deepEqual(Object.values(B),[128,64,32,16,8,4,2,1]);
});
test('4016 bit 1 maps to third channel and 4017 bit 1 to fourth',()=>{
 const p16=[2,0,0,0,0,0,0,2],p17=[0,0,0,0,0,0,0,2];
 assert.deepEqual(decodeOriginalSerialRead({port4016:p16,port4017:p17}),[0,0,0x81,1]);
});
test('serial read discards unrelated high bits, retaining low two bits',()=>{
 const p16=Array(8).fill(0xfc),p17=Array(8).fill(0xfd);
 assert.deepEqual(decodeOriginalSerialRead({port4016:p16,port4017:p17}),[0,0xff,0,0]);
});
test('all 4 channels and all 8 buttons survive inverse serial adapter',()=>{
 const raw=[0xff,0x55,0xaa,0x19];
 assert.deepEqual(decodeOriginalSerialRead(sample(raw)),raw);
});
test('rising edges occur once, while hold repeats each frame',()=>{
 const s=createOriginalControllerState();
 assert.deepEqual(stepOriginalControllerInput(s,stable([B.A,0,0,0])),{
  held:[B.A,0,0,0],pressed:[B.A,0,0,0],attempts:2,raw:[B.A,0,0,0]});
 assert.deepEqual(stepOriginalControllerInput(s,stable([B.A,0,0,0])).pressed,[0,0,0,0]);
 assert.deepEqual(stepOriginalControllerInput(s,stable([B.A|B.B,0,0,0])).pressed,[B.B,0,0,0]);
 assert.deepEqual(stepOriginalControllerInput(s,stable([B.B,0,0,0])).pressed,[0,0,0,0]);
 assert.deepEqual(stepOriginalControllerInput(s,stable([B.A|B.B,0,0,0])).pressed,[B.A,0,0,0]);
 assert.equal(s.samples,5);
});
test('release clears hold but is not a new press; simultaneous inputs are independent',()=>{
 const s=createOriginalControllerState();
 stepOriginalControllerInput(s,stable([B.A|B.RIGHT,B.B,B.START,B.UP]));
 assert.deepEqual(s.pressed,[129,64,16,8]);
 stepOriginalControllerInput(s,stable([0,0,0,0]));
 assert.deepEqual(s.held,[0,0,0,0]);assert.deepEqual(s.pressed,[0,0,0,0]);
});
test('unstable first read is discarded, stable repeated read accepted',()=>{
 const s=createOriginalControllerState();
 const sequence=[[B.A,0,0,0],[B.B,0,0,0],[B.B,0,0,0]];
 const result=stepOriginalControllerInput(s,i=>sample(sequence[i]));
 assert.equal(result.attempts,3);assert.deepEqual(s.pressed,[B.B,0,0,0]);
});
test('unstable reads fail atomically instead of blocking browser',()=>{
 const s=createOriginalControllerState();updateOriginalControllerEdges(s,[B.A,0,0,0]);
 const before=structuredClone(s);
 assert.throws(()=>stepOriginalControllerInput(s,i=>sample([i%2?B.B:B.A,0,0,0]),{maxAttempts:4}),/stabilize/);
 assert.deepEqual(s,before);
});
test('invalid sample and state values are rejected',()=>{
 const s=createOriginalControllerState();
 assert.throws(()=>decodeOriginalSerialRead({port4016:[0],port4017:[0]}),/eight/);
 assert.throws(()=>decodeOriginalSerialRead({port4016:Array(8).fill(0),port4017:Array(8).fill(-1)}),/eight/);
 assert.throws(()=>encodeOriginalSerialRead([256,0,0,0]),/8-bit/);
 assert.throws(()=>updateOriginalControllerEdges(s,[0,0,0]),/four/);
 assert.throws(()=>updateOriginalControllerEdges({...s,pressed:[0]},[0,0,0,0]),/four/);
 assert.throws(()=>updateOriginalControllerEdges({...s,samples:-1},[0,0,0,0]),/counter/);
 assert.throws(()=>stepOriginalControllerInput(s,stable([0,0,0,0]),{maxAttempts:1}),/maxAttempts/);
 assert.deepEqual(s,createOriginalControllerState());
});
test('edge equation matches independently computed truth table for all 256 values',()=>{
 const s=createOriginalControllerState();
 for(let old=0;old<=255;old++){
  s.held[0]=old;
  for(let next=0;next<=255;next++){
   s.held[0]=old;
   updateOriginalControllerEdges(s,[next,0,0,0]);
   assert.equal(s.pressed[0],next&(~old&255));
   assert.equal(s.held[0],next);
  }
 }
});
