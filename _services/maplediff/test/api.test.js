import {test} from 'node:test';import assert from 'node:assert/strict';
import worker from '../worker/source.js';import {extract,validateURL,importArticle} from '../worker/extract.js';
const url='https://www.nexon.com/maplestory/news/update/44597/test-patch';
const content='<h2>Class changes</h2><p>'+('Hero damage increased. Bishop duration increased. ').repeat(5)+'</p><table><tr><th>Skill</th><th>Damage</th></tr><tr><td>Slash</td><td>350%</td></tr></table>';
class Bucket {
 data=new Map();seq=0;
 async get(key){const o=this.data.get(key);return o?{etag:o.etag,json:async()=>JSON.parse(o.value)}:null;}
 async put(key,value,options={}){const current=this.data.get(key),condition=options.onlyIf;if(condition?.etagDoesNotMatch==='*'&&current)return null;if(condition?.etagMatches&&current?.etag!==condition.etagMatches)return null;const entry={value,etag:String(++this.seq),customMetadata:options.customMetadata};this.data.set(key,entry);return entry;}
 async list(options){return {objects:[...this.data.entries()].filter(([k])=>k.startsWith(options.prefix)).map(([key,o])=>({key,customMetadata:o.customMetadata})),truncated:false};}
}
const req=(path,method='GET',body,origin='https://nyshift.com',ip='test')=>new Request('https://registry.test'+path,{method,headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':ip},...(body?{body:JSON.stringify(body)}:{})});
test('rejects private URLs, unapproved sources, credentials, ports and redirects to them',async()=>{for(const value of ['http://localhost/a','https://127.0.0.1/a','https://www.nexon.com.evil.test/maplestory/news/x','https://u:p@www.nexon.com/maplestory/news/x','https://www.nexon.com:444/maplestory/news/x','https://www.nexon.com/maplestory/news/update'])assert.throws(()=>validateURL(value));await assert.rejects(()=>importArticle('https://orangemushroom.net/2026/11/01/test',async()=>new Response('',{status:302,headers:{location:'https://127.0.0.1/private'}})));});
test('extracts article headings, links, entities and table cells while discarding scripts and navigation',()=>{const result=extract(`<nav>Ignore nav</nav><article><h1>Hero &amp; Bishop</h1>${content}<a href="/patch">Link</a><script>alert(1)</script></article>`,'https://orangemushroom.net/2026/11/01/test');assert.match(result.markdown,/# Hero & Bishop/);assert.match(result.markdown,/\| Slash \| 350% \|/);assert.match(result.markdown,/\[Link\]\(https:\/\/orangemushroom.net\/patch\)/);assert.doesNotMatch(result.markdown,/Ignore nav|alert/);});
test('immutable snapshots, unchanged imports, registry and revision retrieval, no sign-in',async()=>{const bucket=new Bucket();let body=content;const env={BUCKET:bucket,TEST_FETCH:async (u,options)=>{assert.equal(options.redirect,'manual');assert.equal(u,'https://g.nexonstatic.com/maplestory/cms/v1/news/44597');return Response.json({name:'Patch notes',body,liveDate:'2026-11-01'});}};
 const first=await worker.fetch(req('/v1/import','POST',{url},undefined,'a'),env);assert.equal(first.status,201);const saved=await first.json();assert.ok(saved.id&&saved.revision);assert.equal(saved.snapshot.markdown.includes('350%'),true);
 const duplicate=await worker.fetch(req('/v1/import','POST',{url},undefined,'b'),env);assert.equal((await duplicate.json()).unchanged,true);
 body=content.replace('350%','400%');const newer=await worker.fetch(req('/v1/import','POST',{url},undefined,'c'),env);const next=await newer.json();assert.equal(next.id,saved.id);assert.notEqual(next.revision,saved.revision);
 const old=await (await worker.fetch(req(`/v1/snapshots/${saved.id}/${saved.revision}`),env)).json();assert.equal(old.markdown.includes('350%'),true);
 const entry=await (await worker.fetch(req(`/v1/entries/${saved.id}`),env)).json();assert.equal(entry.revisions.length,2);
 const registry=await (await worker.fetch(req('/v1/entries'),env)).json();assert.equal(registry.entries.length,1);
 assert.equal((await worker.fetch(req('/v1/import','POST',{url},undefined,'c'),env)).status,429);
 assert.equal((await worker.fetch(req('/v1/import','POST',{url},'https://evil.test'),env)).status,403);
 assert.equal((await worker.fetch(req('/v1/snapshots/00000000000000000000/00000000000000000000'),env)).status,404);
});
test('failed publisher imports do not create registry records',async()=>{const env={BUCKET:new Bucket(),TEST_FETCH:async()=>new Response('no',{status:500})};assert.equal((await worker.fetch(req('/v1/import','POST',{url}),env)).status,422);assert.equal((await (await worker.fetch(req('/v1/entries'),env)).json()).entries.length,0);});
