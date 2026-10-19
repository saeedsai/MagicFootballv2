#!/usr/bin/env node
/** Inspect a user-supplied ROM or CHR binary locally; no data is uploaded. */
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {isINes,parseINes,extractCHR,inspectOriginalCHR,ORIGINAL_ROM_SHA1,ORIGINAL_CHR_GIT_BLOB} from '../src/classic/NesBinaryAssets.js';
const filename=process.argv[2];
if(!filename){console.error('Usage: node tools/audit_nes_binary.mjs path/to/owned-game.nes|CHR_ROM.chr');process.exit(2)}
try{
 const raw=await readFile(filename),ines=isINes(raw);
 const {chr,source,header}=extractCHR(raw);
 const blobHeader=Buffer.from(`blob ${chr.length}\0`);
 const gitBlob=createHash('sha1').update(blobHeader).update(chr).digest('hex');
 const romSha1=ines?createHash('sha1').update(raw).digest('hex'):null;
 console.log(JSON.stringify({source,header,chr:inspectOriginalCHR(chr),
  reference:{upstreamCommit:'df2c8e55e7f13e5792482527db9e7c9e4a84c6e1',
  matchesPinnedCHRBlob:gitBlob===ORIGINAL_CHR_GIT_BLOB,chrGitBlob:gitBlob,
  matchesPinnedOriginalROM:romSha1===ORIGINAL_ROM_SHA1,romSHA1:romSha1},
  note:'This is exact CHR tile data validation; sprite assembly, palettes, animations and gameplay remain separate tasks.'},null,2));
}catch(error){console.error('Binary audit failed: '+error.message);process.exitCode=1}
