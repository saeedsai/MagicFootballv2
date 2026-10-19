import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {Script} from 'node:vm';
// Public-only build. The original archived modular entrypoint is separate
// from the existing deployed standalone index.html, which is never modified.
const root=new URL('../',import.meta.url),out=new URL('../dist/',import.meta.url);
const order='core/Match core/Replay classic/OriginalStateIds classic/OriginalInput classic/OriginalRandom classic/OriginalFieldLogic classic/OriginalScreenDispatch classic/OriginalGoalCutscene classic/OriginalPlayerAction classic/OriginalActionBuffers classic/OriginalPossessionControl classic/OriginalAlternateController classic/OriginalActionArbitration classic/OriginalMovementTransition classic/NesBinaryAssets classic/OriginalChrBanking classic/OriginalPpuTransfers classic/OriginalWeatherSprites classic/OriginalRomSha1 input/InputManager rendering/Renderer main'.split(' ').map(x=>'src/'+x+'.js');
await mkdir(out,{recursive:true});
for(const f of ['modular.html','styles.css',...order]){
 await mkdir(new URL(f.slice(0,f.lastIndexOf('/')+1),out),{recursive:true});
 await copyFile(new URL(f,root),new URL(f,out));
}
await copyFile(new URL('modular.html',root),new URL('index.html',out));
const html=await readFile(new URL('modular.html',root),'utf8');
const css=await readFile(new URL('styles.css',root),'utf8');
let js='';
for(const f of order){const s=await readFile(new URL(f,root),'utf8');js+='\n// SOURCE: '+f+'\n'+s.replace(/^import .*?;\s*$/gm,'').replace(/^export /gm,'')+'\n';}
new Script(js,{filename:'standalone-bundle.js'});
const standalone=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+css+'</style>')
 .replace('<script type="module" src="./src/main.js"></script>',()=>'<script>window.__kunioLocalCHRBase64=null;window.__kunioLocalCHRVerified=false;\n'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
const match=standalone.match(/<script>([\s\S]*?)<\/script>/);
if(!match)throw new Error('standalone script missing');
new Script(match[1],{filename:'standalone.html'});
await writeFile(new URL('standalone.html',out),standalone);
await writeFile(new URL('BUILD_INFO.json',out),JSON.stringify({classicParity:'NOT VERIFIED',privateOriginalChrIncluded:false,files:order},null,2));
console.log('Built public modular and standalone outputs');
