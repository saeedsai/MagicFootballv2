/** Original fixed-bank PPU transfer routines, pinned upstream
 * df2c8e55e7f13e5792482527db9e7c9e4a84c6e1, bank_FF.asm:
 *   $EE5A-$EE64 OAM DMA from CPU page $02;
 *   $F05F-$F0B3 palette update queue (continuation of NMI PPU updates).
 * Source-local register and byte semantics only; no NES frame schedule,
 * metasprite interpretation, accurate RGB palette or sprite rasterizer.
 */
export const PALETTE_QUEUE = Object.freeze({hi:0x06d9,lo:0x06da,count:0x06db,data:0x06dc,ctrl:0x004c,ctrlMask:0x0692});
function assertRam(ram){if(!(ram instanceof Uint8Array)||ram.length<0x0800)throw new TypeError('Expected NES 2 KiB CPU RAM fixture');}
export function createOriginalPpuTransferState(){
 return {ctrl:0,addr:0,addrLatch:0,addrHigh:0,oamAddr:0,oam:new Uint8Array(256),palette:new Uint8Array(32),registerTrace:[],dataTrace:[]};
}
function assertPpu(ppu){if(!ppu||!(ppu.oam instanceof Uint8Array)||ppu.oam.length!==256||!(ppu.palette instanceof Uint8Array)||ppu.palette.length!==32||!Array.isArray(ppu.registerTrace)||!Array.isArray(ppu.dataTrace))throw new TypeError('Expected original PPU transfer state');}
function writeReg(ppu,address,value){ppu.registerTrace.push([address,value]);}
function readStatus(ppu){ppu.addrLatch=0;ppu.registerTrace.push([0x2002,null]);}
function writeAddress(ppu,value){
 writeReg(ppu,0x2006,value);
 if(!ppu.addrLatch){ppu.addrHigh=value&0x3f;ppu.addrLatch=1;}
 else{ppu.addr=((ppu.addrHigh<<8)|value)&0x3fff;ppu.addrLatch=0;}
}
/** NES palette mirrors: $3F10/$3F14/$3F18/$3F1C alias universal BG entries.
 * This routine tracks only palette bytes, not CHR/nametable writes.
 */
export function originalPaletteIndex(ppuAddress){
 if(!Number.isInteger(ppuAddress)||ppuAddress<0||ppuAddress>0x3fff)throw new RangeError('PPU address must be 0..$3FFF');
 if(ppuAddress<0x3f00)return null;
 const index=ppuAddress&31;
 return (index&0x13)===0x10?index-0x10:index;
}
function writeData(ppu,value){
 const address=ppu.addr,idx=originalPaletteIndex(address);
 if(idx!==null)ppu.palette[idx]=value&0x3f; // PPU palette memory stores 6-bit indices
 writeReg(ppu,0x2007,value);
 ppu.dataTrace.push({address,value,paletteIndex:idx});
 ppu.addr=(ppu.addr+(ppu.ctrl&0x04?32:1))&0x3fff;
}
/** Exact $EE5A: STA $2003 = 0; STA $4014 = $02; RTS.
 * RAM page $0200-$02FF is transferred to OAM in its original byte order.
 * Does not infer tile grouping or original sprite animation.
 */
export function stepOriginalOamDma(ram,ppu){
 assertRam(ram);assertPpu(ppu);
 ppu.oamAddr=0;writeReg(ppu,0x2003,0);
 writeReg(ppu,0x4014,2);
 ppu.oam.set(ram.subarray(0x0200,0x0300));
 return {page:2,bytesCopied:256,oamAddress:0};
}
/** Exact fixed-bank $F05F-$F0B3 palette buffer branch. No emulator.
 * If high bit of $06D9 is set, routine returns immediately. Otherwise
 * the code updates PPUCTRL bit 2, resets PPUADDR latch by reading PPUSTATUS,
 * writes queued data to $2007, restores $2006 to $0000 if high byte=$3F,
 * and sets $06D9=$FF. A zero byte count means 256 writes (8-bit DEY loop).
 * Counts >= $21 loop forever in the original; this JS research port rejects
 * them rather than hanging the browser, without claiming parity for that case.
 */
export function stepOriginalPaletteQueue(ram,ppu){
 assertRam(ram);assertPpu(ppu);
 const q=PALETTE_QUEUE,hi=ram[q.hi],count=ram[q.count];
 if(hi&0x80)return {skipped:true,reason:'negative queue high byte',bytesWritten:0};
 if(count>=0x21)throw new RangeError('Original $F070 retry loop never terminates for palette count >= $21');
 const ctrl=((ram[q.ctrl]&0xfb)|ram[q.ctrlMask])&0xff;
 ram[q.ctrl]=ctrl;ppu.ctrl=ctrl;writeReg(ppu,0x2000,ctrl);
 ram[q.ctrlMask]=0;
 readStatus(ppu);writeAddress(ppu,hi);writeAddress(ppu,ram[q.lo]);
 const n=count===0?256:count;
 for(let i=0;i<n;i++)writeData(ppu,ram[(q.data+i)&0x7ff]);
 if(hi===0x3f){
  writeAddress(ppu,0x3f);writeAddress(ppu,0);
  writeAddress(ppu,0);writeAddress(ppu,0);
 }
 ram[q.hi]=0xff;
 return {skipped:false,bytesWritten:n,ppuCtrl:ctrl,finalAddress:ppu.addr,restoredAddress:hi===0x3f};
}
