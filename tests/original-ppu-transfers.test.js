import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createOriginalPpuTransferState,stepOriginalOamDma,stepOriginalPaletteQueue,originalPaletteIndex,PALETTE_QUEUE} from '../src/classic/OriginalPpuTransfers.js';
const setup=()=>({ram:new Uint8Array(0x800),ppu:createOriginalPpuTransferState()});
const palette=(ram,{hi=0x3f,lo=0,count=32,ctrl=0,mask=0,bytes=[]}={})=>{
 ram[0x6d9]=hi;ram[0x6da]=lo;ram[0x6db]=count;ram[0x4c]=ctrl;ram[0x692]=mask;ram.set(bytes,0x6dc);
};
test('source $EE5A copies exactly 256 OAM bytes and preserves source RAM',()=>{
 const {ram,ppu}=setup();for(let i=0;i<256;i++)ram[0x200+i]=(i*7+1)&255;
 const before=ram.slice();assert.deepEqual(stepOriginalOamDma(ram,ppu),{page:2,bytesCopied:256,oamAddress:0});
 assert.deepEqual(ppu.oam,ram.slice(0x200,0x300));assert.deepEqual(ram,before);
 assert.deepEqual(ppu.registerTrace,[[0x2003,0],[0x4014,2]]);
});
test('source $F05F skip gate leaves RAM and PPU unchanged',()=>{
 const {ram,ppu}=setup();palette(ram,{hi:0xff,count:12});const before=ram.slice();
 assert.deepEqual(stepOriginalPaletteQueue(ram,ppu),{skipped:true,reason:'negative queue high byte',bytesWritten:0});
 assert.deepEqual(ram,before);assert.equal(ppu.registerTrace.length,0);
});
test('source $F05F writes 32 palette bytes, updates ctrl shadow, and restores PPU address',()=>{
 const {ram,ppu}=setup();const bytes=Array.from({length:32},(_,i)=>i+0x40);
 palette(ram,{count:32,ctrl:0xff,mask:0,bytes});
 const result=stepOriginalPaletteQueue(ram,ppu);
 assert.deepEqual(result,{skipped:false,bytesWritten:32,ppuCtrl:0xfb,finalAddress:0,restoredAddress:true});
 assert.equal(ram[0x4c],0xfb);assert.equal(ram[0x692],0);assert.equal(ram[0x6d9],0xff);
 assert.deepEqual(ppu.registerTrace.slice(0,4),[[0x2000,0xfb],[0x2002,null],[0x2006,0x3f],[0x2006,0]]);
 assert.equal(ppu.dataTrace.length,32);assert.deepEqual(ppu.dataTrace.map(x=>x.address),Array.from({length:32},(_,i)=>0x3f00+i));
 assert.deepEqual(ppu.registerTrace.slice(-4),[[0x2006,0x3f],[0x2006,0],[0x2006,0],[0x2006,0]]);
 assert.equal(ppu.palette[0],0x10);assert.equal(ppu.palette[4],0x14);assert.equal(ppu.palette[0x10],0);
});
test('palette mirrors universal colors and palette bytes are six-bit values',()=>{
 for(const [address,index] of [[0x3f00,0],[0x3f10,0],[0x3f14,4],[0x3f18,8],[0x3f1c,12],[0x3f20,0],[0x3fff,31],[0x3f0f,15],[0x2000,null]])assert.equal(originalPaletteIndex(address),index);
 const {ram,ppu}=setup();palette(ram,{lo:0x10,count:1,bytes:[0xff]});stepOriginalPaletteQueue(ram,ppu);
 assert.equal(ppu.palette[0],0x3f);assert.equal(ppu.dataTrace[0].paletteIndex,0);
});
test('PPUCTRL bit 2 determines $2007 increment 1 or 32; nonpalette transfers are logged only',()=>{
 const {ram,ppu}=setup();palette(ram,{hi:0x20,lo:0x10,count:3,ctrl:0,mask:4,bytes:[0x11,0x22,0x33]});
 const r=stepOriginalPaletteQueue(ram,ppu);assert.equal(r.restoredAddress,false);
 assert.deepEqual(ppu.dataTrace.map(x=>x.address),[0x2010,0x2030,0x2050]);assert.equal(r.finalAddress,0x2070);
 assert.equal(ppu.palette.reduce((a,b)=>a+b,0),0);
});
test('zero queue count is 256 transfers due to 8-bit DEY underflow',()=>{
 const {ram,ppu}=setup();palette(ram,{count:0,bytes:[0x20]});
 assert.equal(stepOriginalPaletteQueue(ram,ppu).bytesWritten,256);assert.equal(ppu.dataTrace.length,256);
 assert.equal(ppu.dataTrace.at(-1).address,0x3fff);
});
test('invalid source palette count >= $21 is blocked rather than hanging',()=>{
 for(const count of [33,128,255]){const {ram,ppu}=setup();palette(ram,{count});assert.throws(()=>stepOriginalPaletteQueue(ram,ppu),/never terminates/);assert.equal(ppu.dataTrace.length,0);}
});
test('malformed CPU RAM, PPU state and address are rejected',()=>{
 assert.throws(()=>stepOriginalPaletteQueue(new Uint8Array(10),createOriginalPpuTransferState()),TypeError);
 assert.throws(()=>stepOriginalOamDma(new Uint8Array(0x800),{}),TypeError);
 assert.throws(()=>originalPaletteIndex(0x4000),RangeError);
});
test('owner ROM contains exact $EE5A and $F05F-$F0B3 opcodes',async t=>{
 if(!process.env.KUNIO_ORIGINAL_ZIP){t.skip('Set KUNIO_ORIGINAL_ZIP for owner-provided ROM binary');return;}
 const {readNesFromZip}=await import('../tools/rom_archive.mjs');
 const {rom}=readNesFromZip(await readFile(process.env.KUNIO_ORIGINAL_ZIP));
 assert.equal(Buffer.from(rom.subarray(0x1ee6a,0x1ee75)).toString('hex'),'a9008d0320a9028d144060');
 // Disassembled $F05F-$F0B3 fixed-bank routine (ROM file offset = CPU address + $10010).
 const hex='add906304fa54c29fb0d9206854c8d0020a9008d9206ad0220add9068d0620adda068d0620acdb06c021b0e5a200bddc068d0720e888d0f6add906c93fd010a93f8d0620a9008d06208d06208d0620a9ff8dd90660';
 assert.equal(Buffer.from(rom.subarray(0x1f06f,0x1f06f+hex.length/2)).toString('hex'),hex);
});
