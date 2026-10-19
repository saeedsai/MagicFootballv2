/** Original Kunio Soccer MMC3 CHR bank register writes and 1 KiB PPU mapping.
 * Original fixed bank bank_FF.asm, pinned SHA df2c8e55e7f13e5792482527db9e7c9e4a84c6e1:
 *   $EE7D-$EE99: RAM $05BC/$05BD -> MMC3 R0/R1 ($8000/$8001)
 *   $EE9A-$EED2: RAM $05B8-$05BB -> MMC3 R2-R5 ($8000/$8001)
 *   $004E mirrors the last $8000 register selection in both routines.
 * This is a source-local bank-register/CHR-address port, NOT PPU rendering,
 * character sprite composition, palette extraction, or NES frame parity.
 */
export const MMC3_CHR_KIB = 1024;
export const MMC3_PATTERN_BYTES = 8192;
const BG_RAM = 0x05bc, SPR_RAM = 0x05b8, SELECT_SHADOW = 0x004e;

export function createOriginalChrMapper() {
 return {bankSelect:0, registers:new Uint8Array(8)};
}
function checkByte(n, name){
 if(!Number.isInteger(n)||n<0||n>255)throw new RangeError(`${name} must be an 8-bit value`);
}
function checkMapper(mapper){
 if(!mapper||!(mapper.registers instanceof Uint8Array)||mapper.registers.length!==8||!Number.isInteger(mapper.bankSelect))
  throw new TypeError('Expected an MMC3 CHR register state');
}
/** Mapper 4 $8000 (even) selects target register + CHR inversion bit;
 * $8001 (odd) writes selected register. Other MMC3 addresses are outside this slice.
 */
export function writeOriginalMmc3Chr(mapper,address,value){
 checkMapper(mapper);checkByte(value,'MMC3 data');
 if(address===0x8000){mapper.bankSelect=value;return;}
 if(address===0x8001){
  const r=mapper.bankSelect&7;
  if(r>5)throw new RangeError('MMC3 PRG registers R6/R7 are outside this CHR-only slice');
  mapper.registers[r]=r<2?(value&0xfe):value;
  return;
 }
 throw new RangeError('Only $8000 and $8001 MMC3 bank-register writes are supported');
}
function checkRam(ram){
 if(!(ram instanceof Uint8Array)||ram.length<=BG_RAM+1)
  throw new TypeError('Expected a Uint8Array containing original RAM through $05BD');
}
function sourceRegisterWrite(ram,mapper,r,value,trace){
 // LDA #r / STA $004E / STA $8000 / LDA $05B8.. / STA $8001.
 ram[SELECT_SHADOW]=r;
 writeOriginalMmc3Chr(mapper,0x8000,r);
 writeOriginalMmc3Chr(mapper,0x8001,value);
 trace.push([0x8000,r],[0x8001,value]);
}
/** Exact register-write order of fixed-bank sub_EE7D; does not invoke it per frame. */
export function stepOriginalBackgroundChrBanks(ram,mapper){
 checkRam(ram);checkMapper(mapper);
 const trace=[];
 sourceRegisterWrite(ram,mapper,0,ram[BG_RAM],trace);
 sourceRegisterWrite(ram,mapper,1,ram[BG_RAM+1],trace);
 return trace;
}
/** Exact register-write order of fixed-bank sub_EE9A; does not invoke it per frame. */
export function stepOriginalSpriteChrBanks(ram,mapper){
 checkRam(ram);checkMapper(mapper);
 const trace=[];
 for(let i=0;i<4;i++)sourceRegisterWrite(ram,mapper,i+2,ram[SPR_RAM+i],trace);
 return trace;
}
/** Resolve PPU $0000-$1FFF to the physical 1 KiB CHR-ROM bank. MMC3
 * register 0/1 select aligned 2 KiB pairs; bit 7 of $8000 swaps the halves.
 * This original ROM has 128 physical 1 KiB banks; bank numbers wrap by ROM size.
 */
export function resolveOriginalChrBank(mapper,ppuAddress,chrBytes){
 checkMapper(mapper);
 if(!Number.isInteger(ppuAddress)||ppuAddress<0||ppuAddress>=MMC3_PATTERN_BYTES)
  throw new RangeError('PPU CHR address must be $0000-$1FFF');
 if(!Number.isInteger(chrBytes)||chrBytes<MMC3_CHR_KIB||chrBytes%MMC3_CHR_KIB)
  throw new RangeError('CHR ROM must be a nonzero multiple of 1 KiB');
 const slot=ppuAddress>>10, invert=!!(mapper.bankSelect&0x80),r=mapper.registers;
 const mapping=invert
  ?[r[2],r[3],r[4],r[5],r[0],r[0]+1,r[1],r[1]+1]
  :[r[0],r[0]+1,r[1],r[1]+1,r[2],r[3],r[4],r[5]];
 return mapping[slot]%(chrBytes/MMC3_CHR_KIB);
}
/** Convert a live 8x8 PPU tile address to the matching original CHR_ROM tile index.
 * This does not apply sprite attribute palettes, flips, OAM, or PPUCTRL settings.
 */
export function originalPpuTileToChrIndex(mapper,ppuTileIndex,chrBytes){
 if(!Number.isInteger(ppuTileIndex)||ppuTileIndex<0||ppuTileIndex>=512)
  throw new RangeError('PPU pattern tile index must be 0..511');
 const addr=ppuTileIndex*16;
 return resolveOriginalChrBank(mapper,addr,chrBytes)*64+(ppuTileIndex%64);
}
