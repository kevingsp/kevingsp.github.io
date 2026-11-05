import {importArticle,readLimited} from './extract.js';
const APP='https://nyshift.com/lab/maplediff/';
const json=(value,status=200,headers={})=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const idPattern=/^[a-f0-9]{20}$/;
export async function digest(value){const bytes=new TextEncoder().encode(value);return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
async function getJSON(bucket,key){const obj=await bucket.get(key);return obj?obj.json():null;}
async function revisions(bucket,id){
 const listed=await bucket.list({prefix:`snapshots/${id}/`,limit:1000,include:['customMetadata']});
 return listed.objects.map(o=>JSON.parse(o.customMetadata.summary)).sort((a,b)=>a.capturedAt.localeCompare(b.capturedAt)||a.revision.localeCompare(b.revision));
}
async function throttle(request,bucket){
 const address=request.headers.get('CF-Connecting-IP')||request.headers.get('oai-authenticated-user-id')||'shared';
 const key=`rate/${(await digest(address)).slice(0,24)}`;
 const current=await bucket.get(key),now=Date.now();
 if(current&&(await current.json()).until>now)return false;
 const result=await bucket.put(key,JSON.stringify({until:now+10000}),{onlyIf:current?{etagMatches:current.etag}:{etagDoesNotMatch:'*'}});
 return result!==null;
}
export default {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('Origin');
  const allowed=new Set(['https://nyshift.com','https://www.nyshift.com',url.origin]);
  if(env.DEV_ORIGIN)allowed.add(env.DEV_ORIGIN);
  const cors=origin&&allowed.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'}:{};
  const reply=(data,status=200)=>json(data,status,cors);
  if(request.method==='OPTIONS')return origin&&allowed.has(origin)?new Response(null,{status:204,headers:cors}):reply({error:'Origin not allowed.'},403);
  if(url.pathname==='/')return reply({name:'MapleDiff Registry',app:APP,storage:Boolean(env.BUCKET)});
  if(url.pathname==='/health')return reply({ok:Boolean(env.BUCKET),version:1});
  if(!env.BUCKET)return reply({error:'Snapshot storage is not configured.'},503);
  try{
   if(request.method==='GET'&&url.pathname==='/v1/entries'){
    const listed=await env.BUCKET.list({prefix:'registry/',limit:100,cursor:url.searchParams.get('cursor')||undefined,include:['customMetadata']});
    const entries=listed.objects.map(o=>JSON.parse(o.customMetadata.summary)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    return reply({entries,cursor:listed.truncated?listed.cursor:null});
   }
   const entryMatch=url.pathname.match(/^\/v1\/entries\/([a-f0-9]{20})$/);
   if(request.method==='GET'&&entryMatch){
    const entry=await getJSON(env.BUCKET,`registry/${entryMatch[1]}.json`);
    if(!entry)return reply({error:'This saved entry was not found.'},404);
    return reply({...entry,revisions:await revisions(env.BUCKET,entry.id)});
   }
   const snapshotMatch=url.pathname.match(/^\/v1\/snapshots\/([a-f0-9]{20})\/([a-f0-9]{20})$/);
   if(request.method==='GET'&&snapshotMatch){
    const snapshot=await getJSON(env.BUCKET,`snapshots/${snapshotMatch[1]}/${snapshotMatch[2]}.json`);
    return snapshot?reply(snapshot):reply({error:'This snapshot was not found.'},404);
   }
   if(request.method==='POST'&&url.pathname==='/v1/import'){
    if(!origin||!allowed.has(origin))return reply({error:'Please save snapshots from MapleDiff.'},403);
    if(!(request.headers.get('Content-Type')||'').includes('application/json'))return reply({error:'Expected a JSON request.'},415);
    const body=await readLimited(new Response(request.body),3000);if(body.length>3000)return reply({error:'The import request is too large.'},413);
    let data;try{data=JSON.parse(body);}catch{return reply({error:'Invalid JSON request.'},400);}
    if(typeof data.url!=='string'||data.url.length>2000)return reply({error:'Enter a patch-note article URL.'},400);
    if(!await throttle(request,env.BUCKET))return reply({error:'Please wait 10 seconds before saving another snapshot.'},429);
    const article=await importArticle(data.url,env.TEST_FETCH||fetch);
    const id=(await digest(article.url)).slice(0,20),hash=await digest(article.markdown),revision=hash.slice(0,20);
    const existing=await getJSON(env.BUCKET,`snapshots/${id}/${revision}.json`);
    if(existing)return reply({id,revision,unchanged:true,snapshot:existing,permalink:APP+id+'/?to='+revision});
    const revs=await revisions(env.BUCKET,id);
    if(revs.length>=1000)return reply({error:'This entry has reached its 1,000-revision limit.'},409);
    const capturedAt=new Date().toISOString();
    const snapshot={...article,id,revision,hash,capturedAt};
    const summary={id,revision,title:article.title,url:article.url,capturedAt,hash};
    const entry={id,title:article.title,url:article.url,createdAt:capturedAt};
    // Conditional writes make snapshots immutable and prevent duplicate concurrent captures.
    const saved=await env.BUCKET.put(`snapshots/${id}/${revision}.json`,JSON.stringify(snapshot),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'},customMetadata:{summary:JSON.stringify(summary)}});
    await env.BUCKET.put(`registry/${id}.json`,JSON.stringify(entry),{onlyIf:{etagDoesNotMatch:'*'},customMetadata:{summary:JSON.stringify(entry)}});
    return reply({id,revision,unchanged:saved===null,snapshot:saved?snapshot:await getJSON(env.BUCKET,`snapshots/${id}/${revision}.json`),permalink:APP+id+'/?to='+revision},saved?201:200);
   }
   return reply({error:'Not found.'},404);
  }catch(error){console.error('MapleDiff:',error.message);return reply({error:error.message?.startsWith('The')||error.message?.startsWith('Use')||error.message?.startsWith('Enter')||error.message?.startsWith('This')||error.message?.startsWith('No article')||error.message?.startsWith('Too many')?error.message:'Import failed. The publisher may be unavailable or block automated access. No snapshot was saved.'},422);}
 }
};
