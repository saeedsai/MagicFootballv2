import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stepOriginalWeatherSprites,ORIGINAL_WEATHER_SPRITES as W} from '../src/classic/OriginalWeatherSprites.js';
import {readNesFromZip,inspectOriginalRom} from '../tools/rom_archive.mjs';
import {parseINes} from '../src/classic/NesBinaryAssets.js';
const hex=b=>Buffer.from(b).toString('hex');
const prgFixture=()=>{
 const prg=new Uint8Array(0x20000);
 const set=(addr,arr)=>prg.set(arr,0x1c000+addr-0xc000);
 set(0xda46,[8,8,13,8,8,8,3,8,13,8,13,8]);
 set(0xda52,[0,0,5,251,0,0,251,5,5,251,5,251]);
 set(0xda5e,[0,8,8,16,24,32,32,40,40,48,48,56]);
 set(0xda6a,[224,240,241,226,242,228,227,244,245,229,230,246]);
 set(0xda76,[1,1,1,1,1,255,255,255,255,255,0]);
 return prg;
};
const fixture=()=>({ram:new Uint8Array(0x800),prg:prgFixture()});
test('original $D993 effect $81 writes 12 exact OAM quadruplets and changes state to $01',()=>{
 const {ram,prg}=fixture();ram[W.effect]=0x81;ram[W.offsetX]=0x20;
 const r=stepOriginalWeatherSprites(ram,prg);
 assert.deepEqual(r,{mode:'initialize',entriesWritten:12,effectAfter:1});
 assert.deepEqual([...ram.slice(0x200,0x210)], [0,224,1,40,8,240,1,40,8,241,1,45,16,226,1,40]);
 assert.deepEqual([...ram.slice(0x20+0x200,0x20+0x210)], [40,245,1,45,48,229,1,40,48,230,1,45,56,246,1,40]);
 assert.equal(ram[0x0c],12);assert.equal(ram[0x100],40);assert.equal(ram[0x10b],40);
 assert.equal(ram[W.phase],0);
});
test('original effect $01 uses previous sprite X, 11-step phase cycle, clipping and tile attributes',()=>{
 const {ram,prg}=fixture();ram[W.effect]=0x81;ram[W.offsetX]=0x20;
 stepOriginalWeatherSprites(ram,prg);
 ram[W.clipY]=0x50;
 const r=stepOriginalWeatherSprites(ram,prg);
 assert.deepEqual(r,{mode:'update',entriesWritten:12,effectAfter:1,phaseAfter:1});
 assert.deepEqual([...ram.slice(0x200,0x20c)],[64,224,0,41,72,240,0,42,72,241,0,48]);
 assert.equal(ram[0x200+11*4],0xf8); // last Y=56+64=120 clipped
 assert.equal(ram[0x200+11*4+1],246);
 assert.equal(ram[0x200+11*4+2],0);
 assert.equal(ram[0x0c],12); // update does not touch initialization loop index
});
test('source update $D9F2 wraps Y by $BD and 6502 byte arithmetic wraps X',()=>{
 const {ram,prg}=fixture();ram[W.effect]=1;ram[W.phase]=10;ram[W.clipY]=255;
 ram[0x10b]=255;ram[0x10c]=0x80;ram[0x100]=240;
 const r=stepOriginalWeatherSprites(ram,prg);
 assert.equal(r.mode,'update');assert.equal(ram[0x10c],(0x80+0x40-0xbd)&255);
 assert.equal(ram[0x100],(255+0+1)&255);
 assert.equal(ram[W.phase],0); // 12 increments from phase 10 modulo 11
});
test('inactive weather state does not mutate RAM, including effect $00 and $80',()=>{
 const {ram,prg}=fixture();for(const mode of [0,0x80,0xff]){
  ram[W.effect]=mode;const before=ram.slice();
  assert.deepEqual(stepOriginalWeatherSprites(ram,prg),{mode:'inactive',entriesWritten:0});
  assert.deepEqual(ram,before);
 }
});
test('source routine preserves unrelated RAM, including unused OAM slots',()=>{
 const {ram,prg}=fixture();ram.fill(0x66);ram[W.effect]=0x81;
 const before=ram.slice();stepOriginalWeatherSprites(ram,prg);
 for(let i=0;i<0x800;i++){
  const changed=i===0x0c||i===W.effect||(i>=0x100&&i<0x118)||(i>=0x200&&i<0x230);
  if(!changed)assert.equal(ram[i],before[i],`unexpected RAM change at $${i.toString(16)}`);
 }
});
test('invalid CPU RAM or PRG is rejected; private ROM bytes are never bundled in source',()=>{
 assert.throws(()=>stepOriginalWeatherSprites(new Uint8Array(2),prgFixture()),TypeError);
 assert.throws(()=>stepOriginalWeatherSprites(new Uint8Array(0x800),new Uint8Array(0x10000)),TypeError);
});
test('source $D993-$D9D7 opcodes and source tables match authenticated original ROM',async t=>{
 if(!process.env.KUNIO_ORIGINAL_ZIP){t.skip('Private owner ROM required for binary parity fixture');return;}
 const {rom}=readNesFromZip(await readFile(process.env.KUNIO_ORIGINAL_ZIP));
 const inspection=inspectOriginalRom(rom);assert.equal(inspection.matchesReferenceBinary,true);
 const h=parseINes(rom);const prg=rom.subarray(h.prgOffset,h.prgOffset+h.prgBytes);
 assert.equal(hex(rom.subarray(0x1d9a3,0x1d9e8)),
 'ad6604c981f005c901f03a60a900850ca50ca80a0aaab95eda9d0002990c01b96ada9d0102a9019d0202b946da186d3d019d0302990001e60ca50cc90cd0d1a9018d660460');
 assert.deepEqual([...prg.subarray(0x1c000+0xda5e-0xc000,0x1c000+0xda5e-0xc000+12)],
 [0,8,8,16,24,32,32,40,40,48,48,56]);
 const {ram}=fixture();ram[W.effect]=0x81;ram[W.offsetX]=0x20;
 const synthetic=ram.slice(),actual=ram.slice();
 stepOriginalWeatherSprites(synthetic,prgFixture());stepOriginalWeatherSprites(actual,prg);
 assert.deepEqual(actual,synthetic);
 actual[W.clipY]=synthetic[W.clipY]=0x50;
 for(let frame=0;frame<12;frame++){
  stepOriginalWeatherSprites(actual,prg);stepOriginalWeatherSprites(synthetic,prgFixture());
  assert.deepEqual(actual,synthetic,`PRG table mismatch at synthetic weather step ${frame}`);
 }
});

test('native JS weather producer matches execution of ORIGINAL 6502 machine code on randomized RAM fixtures',async t=>{
 if(!process.env.KUNIO_ORIGINAL_ZIP){t.skip('Private original ROM required for independent opcode execution');return;}
 const {executeOriginalWeather6502}=await import('./helpers/execute-weather-6502.mjs');
 const {rom}=readNesFromZip(await readFile(process.env.KUNIO_ORIGINAL_ZIP));
 assert.equal(inspectOriginalRom(rom).matchesReferenceBinary,true);
 const h=parseINes(rom),prg=rom.subarray(h.prgOffset,h.prgOffset+h.prgBytes);
 let seed=0x1234;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed>>>16)&255;};
 for(let trial=0;trial<16;trial++){
  const ram=Uint8Array.from({length:0x800},random);
  ram[W.effect]=0x81;ram[W.offsetX]=random();ram[W.clipY]=random();
  for(let frame=0;frame<5;frame++){
   const actual=ram.slice(),reference=executeOriginalWeather6502(prg,ram);
   stepOriginalWeatherSprites(actual,prg);
   assert.deepEqual(actual,reference.ram,`trial ${trial}, frame ${frame}, source RTS $${reference.pc.toString(16)}`);
   ram.set(actual);
  }
 }
});
