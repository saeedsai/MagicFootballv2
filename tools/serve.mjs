import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname),port=Number(process.env.PORT||4173);
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.chr':'application/octet-stream'};
createServer(async(req,res)=>{try{
 const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=resolve(root,'.'+(route==='/'?'/index.html':route));
 if(file!==root&&!file.startsWith(root+sep))throw Object.assign(new Error('forbidden'),{status:403});
 if(!['.js','.html','.css','.json','.svg','.chr'].includes(extname(file)))throw Object.assign(new Error('forbidden'),{status:403});
 const data=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]+'; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(data);
 }catch(e){res.statusCode=e.status||404;res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`Kunio Soccer dev: http://localhost:${port}`));
