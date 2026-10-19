import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyRestoredSources, ARCHIVED_SOURCE_BLOBS } from '../tools/import-audit.mjs';

test('every restored original JS blob is byte-identical to uploaded Iteration 15 Git',()=>{
 const result=verifyRestoredSources();
 assert.deepEqual(result.errors,[]);
 assert.equal(result.verified.length,Object.keys(ARCHIVED_SOURCE_BLOBS).length);
 assert.equal(result.complete,false);
 assert.equal(result.archivedSourceFiles,22);
});
