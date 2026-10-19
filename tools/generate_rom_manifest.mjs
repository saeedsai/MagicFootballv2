#!/usr/bin/env node
/** Emit hashed original bank inventory WITHOUT copying protected binary bytes. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readNesFromZip,inspectOriginalRom} from './rom_archive.mjs';
const file=process.argv[2],output=process.argv[3]||'docs/ORIGINAL_ROM_BANK_MANIFEST.json';
if(!file){console.error('Usage: node tools/generate_rom_manifest.mjs original.zip|original.nes [output.json]');process.exit(2)}
const raw=await readFile(file),rom=/\.zip$/i.test(file)?readNesFromZip(raw).rom:raw;
const inspect=inspectOriginalRom(rom);
if(!inspect.matchesReferenceBinary)throw new Error('Full binary does not match pinned original SHA-1 after reference header normalization');
const hash=x=>createHash('sha256').update(x).digest('hex');
const {header}=inspect;
const list=(offset,total,chunk,kind)=>Array.from({length:total/chunk},(_,i)=>({
 id:`${kind}-${String(i).padStart(2,'0')}`,index:i,offsetInFile:offset+i*chunk,
 length:chunk,sha256:hash(rom.subarray(offset+i*chunk,offset+(i+1)*chunk)),
 ...(kind==='CHR'?{tileStart:i*(chunk/16),tileCount:chunk/16}:{})
}));
const payload={schemaVersion:1,source:'Owner-supplied original NES dump',upstreamCommit:'df2c8e55e7f13e5792482527db9e7c9e4a84c6e1',
 originalDumpSHA1:inspect.romSHA1,originalHeaderFormat:header.format,canonicalHeaderSHA1:inspect.normalizedSHA1,
 upstreamReferenceBinaryVerified:inspect.matchesReferenceBinary,normalizedHeaderByteOffsets:inspect.headerDifferences,
 graphicsGitBlobSHA1:inspect.chrGitBlob,graphicsSourceMatch:inspect.chrMatchesPinned,
 mapper:header.mapper,prgBanks:list(header.prgOffset,header.prgBytes,16384,'PRG'),chrBanks:list(header.chrOffset,header.chrBytes,8192,'CHR'),
 disclaimer:'Byte hashes and addresses only; no ROM data. Full NES frame, PPU bank selection, original palette and metasprite animation still unimplemented.'};
await writeFile(output,JSON.stringify(payload,null,2)+'\n');
console.log('ROM manifest: '+payload.prgBanks.length+' PRG banks, '+payload.chrBanks.length+' CHR banks, no original bytes saved; '+output);
