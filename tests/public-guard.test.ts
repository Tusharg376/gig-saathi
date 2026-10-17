import test from 'node:test';
import assert from 'node:assert/strict';
import { guardPublicRequest } from '../lib/kaam/public-guard';
const url='https://gig-saathi.example/api/assistant';
test('public reads bypass AI request limits', async()=>{
  assert.equal(await guardPublicRequest(new Request(url),{AI_RATE_LIMITER:{limit:async()=>{throw new Error('should not run');}}}),null);
});
test('public API rejects foreign origins before calling a limiter', async()=>{
  const result=await guardPublicRequest(new Request(url,{method:'POST',headers:{Origin:'https://other.example'}}),{});
  assert.equal(result?.status,403);
});
test('public API rejects oversized uploads', async()=>{
  const result=await guardPublicRequest(new Request(url,{method:'POST',headers:{'Content-Length':String(13*1024*1024)}}),{});
  assert.equal(result?.status,413);
});
test('rate-limited requests return retry guidance without reaching the app', async()=>{
  let key='';const result=await guardPublicRequest(new Request(url,{method:'POST',headers:{'CF-Connecting-IP':'192.0.2.1'}}),{AI_RATE_LIMITER:{limit:async input=>{key=input.key;return {success:false};}}});
  assert.equal(key,'gig-saathi:192.0.2.1');assert.equal(result?.status,429);assert.equal(result?.headers.get('Retry-After'),'60');
});
test('same-origin request continues when within limit', async()=>{
  const result=await guardPublicRequest(new Request(url,{method:'POST',headers:{Origin:'https://gig-saathi.example'}}),{AI_RATE_LIMITER:{limit:async()=>({success:true})}});
  assert.equal(result,null);
});
