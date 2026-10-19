/** NES iNES 1.0 / NES 2.0 binary inspection and exact 2bpp CHR decoder.
 * No emulator, CPU or original gameplay runtime is bundled.
 * NES 2.0 supports linear and exponent/multiplier PRG/CHR sizes.
 * Source provenance: original project CHR_ROM.chr is 131072 bytes at pinned commit
 * df2c8e55e7f13e5792482527db9e7c9e4a84c6e1, Git blob
 * e62db8eeaa386d65ff741847bd8d01cecdada00f.
 */
export const ORIGINAL_CHR_BYTES=131072;
export const ORIGINAL_CHR_GIT_BLOB='e62db8eeaa386d65ff741847bd8d01cecdada00f';
export const ORIGINAL_ROM_SHA1='edf933eee8d6b99b7743367eda089b9850ce51ec'; // pinned assemble.sh
export const NES_TILE_BYTES=16;
export const NES_TILE_PIXELS=64;
const MAGIC=[0x4e,0x45,0x53,0x1a];
function bytesOf(input){
 if(input instanceof Uint8Array)return input;
 if(input instanceof ArrayBuffer)return new Uint8Array(input);
 throw new TypeError('Expected a Uint8Array or ArrayBuffer of binary data');
}
export function isINes(bytes){
 const b=bytesOf(bytes);
 return b.length>=4 && MAGIC.every((x,i)=>b[i]===x);
}
/** Read iNES v1 / NES2.0 with exact program and graphics boundaries. */
export function parseINes(buffer){
 const bytes=bytesOf(buffer);
 if(bytes.length<16||!isINes(bytes))throw new Error('Expected a complete iNES header (NES\\x1A)');
 const nes2=(bytes[7]&0x0c)===0x08,trainer=!!(bytes[6]&0x04);
 function nes2Size(lo,hi,unit){
  if(hi!==0x0f)return (lo+(hi<<8))*unit;
  const value=2**(lo>>2)*(2*(lo&3)+1);
  if(!Number.isSafeInteger(value))throw new Error('NES 2.0 size exceeds safe bounds');
  return value;
 }
 const prgBytes=nes2?nes2Size(bytes[4],bytes[9]&15,16384):bytes[4]*16384;
 const chrBytes=nes2?nes2Size(bytes[5],bytes[9]>>4,8192):bytes[5]*8192;
 const offset=16+(trainer?512:0),chrOffset=offset+prgBytes;
 const required=chrOffset+chrBytes;
 if(!Number.isSafeInteger(required)||required<offset)throw new Error('NES ROM size exceeds safe bounds');
 if(bytes.length<required)throw new Error(`Truncated iNES image: requires ${required} bytes; found ${bytes.length}`);
 return Object.freeze({
  format:nes2?'NES 2.0':'iNES 1.0',mapper:(bytes[6]>>4)|(bytes[7]&0xf0)|(nes2?((bytes[8]&15)<<8):0),
  submapper:nes2?(bytes[8]>>4):0,trainer,
  prgBytes,chrBytes,prgOffset:offset,chrOffset,requiredBytes:required,
  trailingBytes:bytes.length-required,chrRam:chrBytes===0,
 });
}
/** Extract raw CHR-ROM, not a PPU framebuffer or a character sprite atlas.
 * An iNES image must contain CHR-ROM; a standalone .chr is also accepted.
 * Returns a copy, so input mutation cannot silently affect the decoded view.
 */
export function extractCHR(buffer,{raw=false}={}){
 const bytes=bytesOf(buffer);
 if(!raw&&isINes(bytes)){
  const header=parseINes(bytes);
  if(!header.chrBytes)throw new Error('Cartridge declares CHR-RAM; no embedded CHR-ROM tiles to decode');
  return {chr:bytes.slice(header.chrOffset,header.chrOffset+header.chrBytes),source:'iNES',header};
 }
 if(!raw && bytes.length>=4 && bytes[0]===0x4e && bytes[1]===0x45 && bytes[2]===0x53)
  throw new Error('Invalid or truncated NES header; explicitly select raw CHR only for a known .chr file');
 if(bytes.length===0||bytes.length%16!==0)throw new Error('Raw CHR length must be a non-zero multiple of 16 bytes');
 return {chr:bytes.slice(),source:'raw CHR',header:null};
}
/** Exact NES planar 2bpp decode: planes 0/1 are at offsets 0..7/8..15,
 * MSB is the leftmost pixel, low plane contributes bit 0, high bit 1.
 */
export function decodeTile(chrInput,tileIndex){
 const chr=bytesOf(chrInput);
 if(chr.length%16!==0)throw new RangeError('CHR byte length must be a multiple of 16');
 if(!Number.isInteger(tileIndex)||tileIndex<0||tileIndex>=chr.length/16)throw new RangeError('Tile index outside CHR data');
 const pixels=new Uint8Array(NES_TILE_PIXELS);
 const base=tileIndex*16;
 for(let y=0;y<8;y++){
  const lo=chr[base+y],hi=chr[base+8+y];
  for(let x=0;x<8;x++){
   const bit=7-x;
   pixels[y*8+x]=((lo>>bit)&1)|(((hi>>bit)&1)<<1);
  }
 }
 return pixels;
}
/** Palette is a caller-chosen RGBA table, not a claim about game PPU palettes. */
export const INSPECTION_GRAY=Object.freeze([
 Object.freeze([25,36,51,255]),Object.freeze([91,107,119,255]),
 Object.freeze([174,191,199,255]),Object.freeze([245,244,232,255]),
]);
export function colorizeTile(pixels,palette=INSPECTION_GRAY){
 if(!(pixels instanceof Uint8Array)||pixels.length!==64)throw new TypeError('Expected 64 decoded tile pixels');
 if(!Array.isArray(palette)||palette.length!==4||palette.some(p=>!Array.isArray(p)||p.length!==4||p.some(x=>!Number.isInteger(x)||x<0||x>255)))
  throw new TypeError('Expected four 4-byte RGBA palette entries');
 const out=new Uint8ClampedArray(256);
 for(let i=0;i<64;i++)out.set(palette[pixels[i]],i*4);
 return out;
}
export function chrTileCount(chr){return bytesOf(chr).length/16;}
export function inspectOriginalCHR(chr){
 const bytes=bytesOf(chr);
 if(bytes.length%16!==0)throw new Error('CHR length not tile-aligned');
 return {byteCount:bytes.length,tileCount:bytes.length/16,patternsPer8k:512,
  bankCount:Math.floor(bytes.length/8192),partialBankBytes:bytes.length%8192,expectedSourceSize:bytes.length===ORIGINAL_CHR_BYTES};
}
