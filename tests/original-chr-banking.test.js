import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {decodeTile} from '../src/classic/NesBinaryAssets.js';
import {
 createOriginalChrMapper,writeOriginalMmc3Chr,stepOriginalBackgroundChrBanks,
 stepOriginalSpriteChrBanks,resolveOriginalChrBank,originalPpuTileToChrIndex,
} from '../src/classic/OriginalChrBanking.js';
const ram=()=>new Uint8Array(0x600);

test('bank FF $EE7D background register writes preserve CPU order, shadow, and even alignment',()=>{
 const m=createOriginalChrMapper(),r=ram();r[0x5bc]=13;r[0x5bd]=27;
 assert.deepEqual(stepOriginalBackgroundChrBanks(r,m),[[0x8000,0],[0x8001,13],[0x8000,1],[0x8001,27]]);
 assert.equal(r[0x4e],1);assert.equal(m.bankSelect,1);
 assert.deepEqual(Array.from(m.registers.slice(0,2)),[12,26]);
 assert.deepEqual(Array.from({length:4},(_,i)=>resolveOriginalChrBank(m,i*1024,131072)),[12,13,26,27]);
});
test('bank FF $EE9A sprite register writes preserve CPU order and all four 1 KiB banks',()=>{
 const m=createOriginalChrMapper(),r=ram();r.set([5,11,63,127],0x5b8);
 assert.deepEqual(stepOriginalSpriteChrBanks(r,m),[
  [0x8000,2],[0x8001,5],[0x8000,3],[0x8001,11],
  [0x8000,4],[0x8001,63],[0x8000,5],[0x8001,127],
 ]);
 assert.equal(r[0x4e],5);assert.equal(m.bankSelect,5);
 assert.deepEqual(Array.from({length:4},(_,i)=>resolveOriginalChrBank(m,0x1000+i*1024,131072)),[5,11,63,127]);
});
test('both source routines preserve separate RAM byte values; $8001 masks only 2 KiB registers',()=>{
 const m=createOriginalChrMapper(),r=ram();r.set([0xff,0xfe,0x80,0x7f],0x5b8);r.set([0xff,0x7f],0x5bc);
 stepOriginalBackgroundChrBanks(r,m);stepOriginalSpriteChrBanks(r,m);
 assert.deepEqual(Array.from(m.registers.slice(0,6)),[254,126,255,254,128,127]);
 assert.deepEqual(Array.from(r.slice(0x5b8,0x5be)),[255,254,128,127,255,127]);
});
test('MMC3 CHR inversion remaps 1 KiB slots, but does not alter the source register bytes',()=>{
 const m=createOriginalChrMapper();
 for(let i=0;i<6;i++){writeOriginalMmc3Chr(m,0x8000,i);writeOriginalMmc3Chr(m,0x8001,2*i+4);}
 const standard=Array.from({length:8},(_,i)=>resolveOriginalChrBank(m,i*1024,131072));
 assert.deepEqual(standard,[4,5,6,7,8,10,12,14]);
 writeOriginalMmc3Chr(m,0x8000,0x80);
 assert.deepEqual(Array.from({length:8},(_,i)=>resolveOriginalChrBank(m,i*1024,131072)),[8,10,12,14,4,5,6,7]);
 assert.deepEqual(Array.from(m.registers.slice(0,6)),[4,6,8,10,12,14]);
});
test('high CHR register bank values mirror into original 128 KiB CHR ROM',()=>{
 const m=createOriginalChrMapper();writeOriginalMmc3Chr(m,0x8000,2);writeOriginalMmc3Chr(m,0x8001,0xff);
 assert.equal(resolveOriginalChrBank(m,0x1000,131072),127);
 assert.equal(resolveOriginalChrBank(m,0x1000,8192),7);
});
test('PPU tile mapping is byte-exact through both 1 KiB and 2 KiB registers',()=>{
 const chr=new Uint8Array(131072);for(let i=0;i<chr.length;i++)chr[i]=(i*31+(i>>7))&255;
 const m=createOriginalChrMapper(),r=ram();r.set([0,15,127,9],0x5b8);r.set([17,99],0x5bc);
 stepOriginalBackgroundChrBanks(r,m);stepOriginalSpriteChrBanks(r,m);
 for(const ppuTile of [0,63,64,127,128,191,192,255,256,319,320,383,384,447,448,511]){
  const raw=originalPpuTileToChrIndex(m,ppuTile,chr.length);
  const bank=resolveOriginalChrBank(m,ppuTile*16,chr.length);
  assert.equal(raw,bank*64+ppuTile%64);
  assert.deepEqual(decodeTile(chr,raw),decodeTile(chr,bank*64+ppuTile%64));
 }
});
test('invalid RAM, registers, CHR length and PPU addresses are rejected',()=>{
 const m=createOriginalChrMapper();
 assert.throws(()=>stepOriginalBackgroundChrBanks(new Uint8Array(16),m),TypeError);
 assert.throws(()=>stepOriginalSpriteChrBanks(ram(),{}),TypeError);
 assert.throws(()=>writeOriginalMmc3Chr(m,0x8002,4),RangeError);
 assert.throws(()=>writeOriginalMmc3Chr(m,0x8000,256),RangeError);
 writeOriginalMmc3Chr(m,0x8000,6);
 assert.throws(()=>writeOriginalMmc3Chr(m,0x8001,1),/PRG registers/);
 for(const a of [-1,8192,8193,0.5])assert.throws(()=>resolveOriginalChrBank(m,a,131072),RangeError);
 for(const n of [511.5,512,-1])assert.throws(()=>originalPpuTileToChrIndex(m,n,131072),RangeError);
 assert.throws(()=>resolveOriginalChrBank(m,0,512),RangeError);
});
test('owner-provided source ROM contains exact $EE7D and $EE9A opcodes (when fixture provided)',async t=>{
 const path=process.env.KUNIO_ORIGINAL_ZIP;
 if(!path){t.skip('Set KUNIO_ORIGINAL_ZIP for authenticated original PRG fixture');return;}
 const {readNesFromZip}=await import('../tools/rom_archive.mjs');
 const {rom:bytes}=readNesFromZip(await readFile(path));
 // Fixed bank CPU $C000-$FFFF corresponds to ROM file $1C010-$2000F.
 const bg='a9008d4e008d0080adbc058d0180a9018d4e008d0080adbd058d018060';
 const sp='a9028d4e008d0080adb8058d0180a9038d4e008d0080adb9058d0180a9048d4e008d0080adba058d0180a9058d4e008d0080adbb058d018060';
 assert.equal(Buffer.from(bytes.subarray(0x1ee8d,0x1ee8d+bg.length/2)).toString('hex'),bg);
 assert.equal(Buffer.from(bytes.subarray(0x1eeaa,0x1eeaa+sp.length/2)).toString('hex'),sp);
});
