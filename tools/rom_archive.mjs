/** Bounded, single-cartridge ZIP reader for privately supplied NES dumps.
 * No extraction to disk, no use of filenames as filesystem paths.
 */
import {inflateRawSync} from 'node:zlib';
import {extractCHR,inspectOriginalCHR,ORIGINAL_CHR_BYTES,ORIGINAL_CHR_GIT_BLOB,ORIGINAL_ROM_SHA1} from '../src/classic/NesBinaryAssets.js';
import {createHash} from 'node:crypto';
export const MAX_ROM_BYTES=4*1024*1024;
export function crc32(bytes){
 let c=0xffffffff;
 for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^(0xedb88320&-(c&1));}
 return (c^0xffffffff)>>>0;
}
function fail(message){throw new Error(`NES ZIP: ${message}`)}
function inBounds(buf,start,size){return start>=0&&size>=0&&start+size<=buf.length;}
/** A ZIP with exactly one .nes entry is accepted. Stored and deflated methods.
 * ZIP64, encrypted archives, split disks, nested archive entries and bombs are refused.
 */
export function readNesFromZip(bytes){
 const b=Buffer.from(bytes);
 if(b.length<22)fail('archive truncated');
 let eocd=-1;
 for(let p=b.length-22;p>=Math.max(0,b.length-65557);p--){if(b.readUInt32LE(p)===0x06054b50&&inBounds(b,p,22+b.readUInt16LE(p+20))){eocd=p;break;}}
 if(eocd<0)fail('end-of-central-directory record not found');
 if(b.readUInt16LE(eocd+4)||b.readUInt16LE(eocd+6))fail('split archives not supported');
 const count=b.readUInt16LE(eocd+10),centralSize=b.readUInt32LE(eocd+12),centralOffset=b.readUInt32LE(eocd+16);
 if(count<1||count>100||!inBounds(b,centralOffset,centralSize))fail('invalid or oversized central directory');
 let cursor=centralOffset;const cartridges=[];
 for(let i=0;i<count;i++){
  if(!inBounds(b,cursor,46)||b.readUInt32LE(cursor)!==0x02014b50)fail('invalid central directory entry');
  const flags=b.readUInt16LE(cursor+8),method=b.readUInt16LE(cursor+10),checksum=b.readUInt32LE(cursor+16),compressed=b.readUInt32LE(cursor+20),uncompressed=b.readUInt32LE(cursor+24);
  const nameLen=b.readUInt16LE(cursor+28),extraLen=b.readUInt16LE(cursor+30),commentLen=b.readUInt16LE(cursor+32),local=b.readUInt32LE(cursor+42);
  const total=46+nameLen+extraLen+commentLen;
  if(!inBounds(b,cursor,total))fail('central directory entry truncated');
  const name=b.subarray(cursor+46,cursor+46+nameLen).toString('utf8');cursor+=total;
  if(!/\.nes$/i.test(name))continue;
  if(flags&1)fail('encrypted cartridge not supported');
  if(compressed>MAX_ROM_BYTES||uncompressed>MAX_ROM_BYTES)fail('cartridge larger than safety limit');
  if(![0,8].includes(method)||[compressed,uncompressed,local].includes(0xffffffff))fail('compression or ZIP64 unsupported');
  if(!inBounds(b,local,30)||b.readUInt32LE(local)!==0x04034b50)fail('invalid local file header');
  const dataOffset=local+30+b.readUInt16LE(local+26)+b.readUInt16LE(local+28);
  if(!inBounds(b,dataOffset,compressed))fail('compressed cartridge truncated');
  const raw=b.subarray(dataOffset,dataOffset+compressed);
  const rom=method===0?Buffer.from(raw):inflateRawSync(raw,{maxOutputLength:MAX_ROM_BYTES});
  if(rom.length!==uncompressed||crc32(rom)!==checksum)fail('cartridge decompressed size or CRC-32 mismatch');
  cartridges.push({rom,name});
 }
 if(cartridges.length!==1)fail(`expected exactly one .nes entry; found ${cartridges.length}`);
 return cartridges[0];
}
/** Pinned assembly header matches upstream header.bin Git blob d12a10b... .
 * The user-supplied dump is NES2.0: only byte 7 (08 vs 00) and byte 15 (03 vs 00) differ.
 * Hashing header-normalized data proves the full PRG + CHR against the assembly output.
 */
export const REFERENCE_HEADER=Buffer.from('4e45531a081040000000000000000000','hex');
export function inspectOriginalRom(rom){
 const {chr,header}=extractCHR(rom);
 if(!header)throw new Error('Expected a complete iNES ROM, not a raw CHR file');
 const gitBlob=createHash('sha1').update(`blob ${chr.length}\0`).update(chr).digest('hex');
 const sha1=createHash('sha1').update(rom).digest('hex');
 const normalized=Buffer.concat([REFERENCE_HEADER,Buffer.from(rom).subarray(16)]);
 const normalizedSHA1=createHash('sha1').update(normalized).digest('hex');
 const matchesReferenceBinary=normalizedSHA1===ORIGINAL_ROM_SHA1;
 const differences=[];for(let i=0;i<16;i++)if(rom[i]!==REFERENCE_HEADER[i])differences.push(i);
 return {romSHA1:sha1,normalizedSHA1,matchesReferenceBinary,headerDifferences:matchesReferenceBinary?differences:[],
  chrGitBlob:gitBlob,chrMatchesPinned:chr.length===ORIGINAL_CHR_BYTES&&gitBlob===ORIGINAL_CHR_GIT_BLOB,
  header,graphics:inspectOriginalCHR(chr),chr};
}
