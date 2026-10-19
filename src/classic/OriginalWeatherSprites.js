/** Source-faithful fixed-bank $D993-$DA45 original weather-effect OAM producer.
 * Pinned upstream SHA df2c8e55e7f13e5792482527db9e7c9e4a84c6e1,
 * bank_FF.asm blob d9b5307a83f022c17deb0cec82b2bea2249c5484.
 * Table bytes are read from the user's locally supplied 128 KiB PRG image;
 * copyrighted ROM/CHR data are NOT embedded in this source.
 * This routine only produces OAM entries for one original weather effect.
 * It does not establish the actual NES frame schedule, CHR bank, palettes,
 * sprite size, gameplay rendering, or frame parity.
 */
export const ORIGINAL_WEATHER_SPRITES=Object.freeze({
 effect:0x0466, phase:0x03ae, count:12, y:0x010c, x:0x0100,
 oam:0x0200, offsetX:0x013d, clipY:0x013e,
 tableX:0xda46, tableY:0xda5e, tableTile:0xda6a,
 tableStepX:0xda52, tableStepY:0xda76,
});
function assertState(ram,prg){
 if(!(ram instanceof Uint8Array)||ram.length<0x800)throw new TypeError('Expected 2 KiB NES CPU RAM');
 if(!(prg instanceof Uint8Array)||prg.length!==0x20000)throw new TypeError('Expected authenticated original 128 KiB PRG ROM (private local input)');
}
function fixed(prg,cpuAddress){
 // Original MMC3 fixed final 16 KiB PRG bank: CPU $C000-$FFFF maps
 // physical PRG offset $1C000-$1FFFF, independent of switchable banks.
 return prg[0x1c000+cpuAddress-0xc000];
}
/** Source $D993: effect $81 initializes twelve OAM weather sprites and
 * transitions to effect $01; effect $01 updates those twelve sprites.
 * All arithmetic and compares use 6502 8-bit behavior. Other effect values
 * return without touching RAM, as the original routine does.
 * A synthetic RAM fixture is NOT a captured original-game frame.
 */
export function stepOriginalWeatherSprites(ram,prg){
 assertState(ram,prg);
 const w=ORIGINAL_WEATHER_SPRITES,mode=ram[w.effect];
 if(mode!==0x81&&mode!==0x01)return {mode:'inactive',entriesWritten:0};
 if(mode===0x81){
  ram[0x0c]=0;
  for(let i=0;i<w.count;i++){
   const o=w.oam+i*4;
   const y=fixed(prg,w.tableY+i),tile=fixed(prg,w.tableTile+i);
   const x=(fixed(prg,w.tableX+i)+ram[w.offsetX])&255;
   ram[o]=y;ram[w.y+i]=y;
   ram[o+1]=tile;ram[o+2]=1;ram[o+3]=x;ram[w.x+i]=x;
   ram[0x0c]=(i+1)&255;
  }
  ram[w.effect]=1;
  return {mode:'initialize',entriesWritten:12,effectAfter:ram[w.effect]};
 }
 // Original $D9D8-$DA1A. $03AE increments once per sprite, wraps at $0B.
 // For the first sprite the source deliberately reads RAM $010B (previous
 // sprite X); remaining sprites read RAM $0100..$010A as updated in-loop.
 for(let i=0;i<w.count;i++){
  let phase=(ram[w.phase]+1)&255;
  if(phase>=11)phase=0;
  ram[w.phase]=phase;
  let y=(ram[w.y+i]+0x40)&255;
  if(y>=0xbd)y=(y-0xbd)&255;
  ram[w.y+i]=y;
  const previousX=ram[i===0?0x010b:0x0100+i-1];
  ram[w.x+i]=(previousX+fixed(prg,w.tableStepX+i)+fixed(prg,w.tableStepY+phase))&255;
 }
 // Original $DA1A-$DA45 writes 12 consecutive OAM quadruplets.
 for(let i=0;i<w.count;i++){
  const o=w.oam+i*4;
  ram[o]=ram[w.y+i]<ram[w.clipY]?ram[w.y+i]:0xf8;
  ram[o+1]=fixed(prg,w.tableTile+i);
  ram[o+2]=0;
  ram[o+3]=ram[w.x+i];
 }
 return {mode:'update',entriesWritten:12,effectAfter:ram[w.effect],phaseAfter:ram[w.phase]};
}
