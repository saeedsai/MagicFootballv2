#!/usr/bin/env node
/** Verify a versioned development replay file without starting a browser. */
import {readFile,stat} from 'node:fs/promises';
import {verifyReplay} from '../src/core/Replay.js';
const file=process.argv[2];
if(!file){console.error('Usage: npm run replay:verify -- path/to/replay.json');process.exitCode=2;}
else {
  try {
    if((await stat(file)).size>4_000_000)throw new Error('Replay file exceeds 4 MB');
    const replay=JSON.parse(await readFile(file,'utf8'));
    const result=verifyReplay(replay);
    console.log(JSON.stringify({status:'PASS',mode:replay.mode,rulesVersion:replay.rulesVersion,...result},null,2));
  }catch(err){console.error(`Replay verification FAILED: ${err.message}`);process.exitCode=1;}
}
