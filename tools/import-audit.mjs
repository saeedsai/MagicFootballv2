import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const ARCHIVED_SOURCE_BLOBS=Object.freeze({
 'src/classic/OriginalRandom.js':'e61eb50841f0b840cd7395a21efe85f81af77b31',
 'src/classic/OriginalStateIds.js':'24ea110a2da25b237603c8771a9d461aac8a03cf',
 'src/classic/OriginalScreenDispatch.js':'5eccd144e5869fcc2e9cad50be1eaf00b8a52acf',
 'src/classic/OriginalRomSha1.js':'6153a5c4caf10a09a8f0992e934a1263b6560b97',
 'src/classic/NesBinaryAssets.js':'694627443c015cd12e57fe4be5c32a78aea46c2d',
 'src/classic/OriginalChrBanking.js':'669acc786b5b957731f7b1ad0dea26bf4e172d1d',
 'src/classic/OriginalWeatherSprites.js':'1e2fd245ccce2725398be2434df6fbdbd5d8c3a1',
 'src/classic/OriginalPpuTransfers.js':'29edb93b67d4ca93991fa79781f197c81bcb2a0d',
 'src/classic/OriginalActionBuffers.js':'ae9f2e48b17fba5846796656ceeb9e16b1a45abf',
 'src/classic/OriginalInput.js':'aa991f4cfbc83e13321bf96b852020d35f51db8f',
 'src/classic/OriginalPossessionControl.js':'d56920ac60d4832cece81f37881a37efdbcee5b0',
 'src/classic/OriginalFieldLogic.js':'d5523e4624f5e3d3a9f6cc2e0aaec3b145c63d63',
 'src/classic/OriginalGoalCutscene.js':'1c3afe80899eb6205a52d0ef44341b6a11f13f3a'
});
export const archivedGitBlob = content => createHash('sha1').update('blob '+content.length+'\0').update(content).digest('hex');
export function verifyRestoredSources(root=fileURLToPath(new URL('..',import.meta.url))){
 const verified=[], errors=[];
 for(const [path,expected] of Object.entries(ARCHIVED_SOURCE_BLOBS)){
  try{
   const bytes=readFileSync(root+'/'+path), actual=archivedGitBlob(bytes);
   if(actual===expected)verified.push(path);
   else errors.push(path+': expected '+expected+', got '+actual);
  }catch(e){errors.push(path+': '+e.message);}
 }
 return {verified,expectedSourceFiles:Object.keys(ARCHIVED_SOURCE_BLOBS).length,archivedSourceFiles:22,totalArchivedFiles:185,complete:false,errors};
}
if(process.argv[1] && fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const result=verifyRestoredSources();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.errors.length)process.exitCode=1;
}
