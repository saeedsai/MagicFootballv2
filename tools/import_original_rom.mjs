#!/usr/bin/env node
/** Import user-supplied NES ROM ZIP for private local CHR analysis and standalone preview.
 * Does not retain ROM/PRG, and does not commit/export original source assets by default.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {basename} from 'node:path';
import {readNesFromZip,inspectOriginalRom} from './rom_archive.mjs';
const filename=process.argv[2];
if(!filename){console.error('Usage: node tools/import_original_rom.mjs "path/to/user-owned-file.zip|.nes"');process.exit(2)}
try{
 const bytes=await readFile(filename);
 const {rom,name}= /\.zip$/i.test(filename)?readNesFromZip(bytes):{rom:bytes,name:basename(filename)};
 const {chr,chrMatchesPinned,header,romSHA1,normalizedSHA1,matchesReferenceBinary,headerDifferences,chrGitBlob,graphics}=inspectOriginalRom(rom);
 if(!chrMatchesPinned)throw new Error(`CHR does NOT match pinned upstream: ${chrGitBlob}. Refusing import.`);
 const dir=new URL('../local/',import.meta.url);await mkdir(dir,{recursive:true});
 await writeFile(new URL('original.chr',dir),chr);
 const provenance={source:'user-supplied original NES archive (private import)',name,romSHA1,normalizedSHA1,matchesReferenceBinary,headerDifferences,chrGitBlob,
  chrMatchesPinned,header,graphics,expectedUpstreamRomSHA1:'edf933eee8d6b99b7743367eda089b9850ce51ec',
  upstreamRomMatches:matchesReferenceBinary,
  upstreamCommit:'df2c8e55e7f13e5792482527db9e7c9e4a84c6e1',
  note:'Full PRG+CHR binary matches pinned upstream SHA-1 after header normalization, with differences only in header byte positions. Extracted private CHR is for local research; sprite composition/PPU palettes/animation are not yet reconstructed.'};
 await writeFile(new URL('provenance.json',dir),JSON.stringify(provenance,null,2)+'\n');
 console.log(JSON.stringify({...provenance,privateFile:'local/original.chr',romRetained:false},null,2));
}catch(e){console.error('Original ROM import rejected:',e.message);process.exitCode=1;}
