'use strict';
const API='https://nyshift-maplediff-registry.daring-rhino-7025.chatgpt.site';
const ROOT='/lab/maplediff/';
const $=id=>document.getElementById(id);
const state={entries:[],entry:null,after:null,before:null,cursor:null,entryCache:new Map(),snapshotCache:new Map(),busy:false};
let rows=[],snapshot={before:'',after:''},layout='unified',viewRequest=0,workerRequest=0;
let diffWorker;
try{diffWorker=new Worker(ROOT+'diff-worker.js');}catch{/* Exact diff remains available without workers. */}
function message(text,error=false){$('message').textContent=text;$('message').classList.toggle('error-note',error);}
function date(value){return new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});}
async function api(path,body){const response=await fetch(API+path,{method:body?'POST':'GET',credentials:'omit',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});let data;try{data=await response.json();}catch{throw new Error('The registry is unavailable. Please try again shortly.');}if(!response.ok)throw new Error(data.error||'The request failed.');return data;}
function busy(value){state.busy=value;$('save-url').disabled=value;$('capture-again').disabled=value;$('save-url').textContent=value?'Saving snapshot…':'Save snapshot';}
function option(select,value,label){const item=document.createElement('option');item.value=value;item.textContent=label;select.append(item);}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function entryLink(id){return ROOT+id+'/';}
function renderRegistry(){
 const container=$('registry');container.replaceChildren();$('registry-count').textContent=String(state.entries.length);
 for(const entry of state.entries){const link=document.createElement('a');link.className='registry-card';link.href=entryLink(entry.id);link.setAttribute('aria-current',String(entry.id===state.entry?.id));const title=document.createElement('h3');title.textContent=entry.title;const source=document.createElement('span');source.textContent=new URL(entry.url).hostname;const captured=document.createElement('span');captured.className='entry-date';captured.textContent='First saved '+date(entry.createdAt);link.append(title,source,captured);link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();openEntry(entry.id).catch(error=>message(error.message,true));});container.append(link);}
 $('registry-status').textContent=state.entries.length?'':'No notes saved yet. Paste an article link above to start the registry.';$('more-entries').hidden=!state.cursor;
}
async function loadRegistry(more=false){const data=await api('/v1/entries'+(more&&state.cursor?'?cursor='+encodeURIComponent(state.cursor):''));state.entries=more?[...state.entries,...data.entries.filter(e=>!state.entries.some(x=>x.id===e.id))]:data.entries;state.cursor=data.cursor;renderRegistry();}
async function getEntry(id){if(!state.entryCache.has(id))state.entryCache.set(id,await api('/v1/entries/'+id));return state.entryCache.get(id);}
async function getSnapshot(id,revision){const key=id+'/'+revision;if(!state.snapshotCache.has(key))state.snapshotCache.set(key,await api('/v1/snapshots/'+key));return state.snapshotCache.get(key);}
function revisionOptions(select,revisions,selected){select.replaceChildren();for(const r of [...revisions].reverse())option(select,r.revision,`${date(r.capturedAt)} · ${r.revision.slice(0,7)}`);if(selected&&revisions.some(r=>r.revision===selected))select.value=selected;}
async function selectBase(id,revision){$('base-revision').hidden=!id;if(!id){$('base-revision').replaceChildren();return;}const entry=await getEntry(id);if(revision&&!entry.revisions.some(r=>r.revision===revision))throw new Error('The comparison revision in this link was not found.');revisionOptions($('base-revision'),entry.revisions,revision);}
async function openEntry(id,params=new URLSearchParams(),preferredBase=null){
 const ticket=++viewRequest;
 message('Loading saved patch notes…');
 const entry=await getEntry(id);if(ticket!==viewRequest)return;
 if(!entry.revisions.length)throw new Error('This entry does not contain a saved revision. Try saving its source URL again.');
 state.entry=entry;$('saved-entry').hidden=false;$('entry-title').textContent=entry.title;$('original-source').href=entry.url;$('source-url').value=entry.url;
 const requested=params.get('to');if(requested&&!entry.revisions.some(r=>r.revision===requested))throw new Error('The revision in this link was not found. Open the saved page from the registry to see its available revisions.');
 revisionOptions($('after-revision'),entry.revisions,requested);
 const choices=[...state.entries];if(!choices.some(e=>e.id===id))choices.unshift(entry);
 $('base-entry').replaceChildren();option($('base-entry'),'','View snapshot without comparison');for(const e of choices)option($('base-entry'),e.id,e.title);
 let baseId=params.get('base')||'',baseRevision=params.get('from')||'';
 if(!baseId&&preferredBase){baseId=preferredBase.id;baseRevision=preferredBase.revision;}
 if(!baseId&&entry.revisions.length>1){const index=entry.revisions.findIndex(r=>r.revision===$('after-revision').value);if(index>0){baseId=id;baseRevision=entry.revisions[index-1].revision;}}
 if(baseId&&!choices.some(e=>e.id===baseId)){const other=await getEntry(baseId);option($('base-entry'),baseId,other.title);}
 $('base-entry').value=baseId;await selectBase(baseId,baseRevision);if(ticket!==viewRequest)return;
 renderRegistry();await showSelection();
}
function updateURL(){if(!state.entry||!state.after)return;const params=new URLSearchParams({to:state.after.revision});if(state.before){params.set('base',state.before.id);params.set('from',state.before.revision);}history.replaceState(null,'',entryLink(state.entry.id)+'?'+params);}
async function computeDiff(before,after){
 if(!diffWorker)return MapleDiff.diff(before,after);
 const request=++workerRequest;
 return new Promise((resolve,reject)=>{const worker=diffWorker;const cleanup=()=>{worker.removeEventListener('message',handler);worker.removeEventListener('error',failed);};const handler=event=>{if(event.data.request!==request)return;cleanup();event.data.error?reject(new Error(event.data.error)):resolve(event.data.rows);};const failed=event=>{event.preventDefault();cleanup();worker.terminate();diffWorker=null;try{resolve(MapleDiff.diff(before,after));}catch(error){reject(error);}};worker.addEventListener('message',handler);worker.addEventListener('error',failed);worker.postMessage({request,before,after});});
}
async function showSelection(){
 const ticket=++viewRequest;const entry=state.entry;if(!entry)return;
 $('diff').setAttribute('aria-busy','true');$('summary').textContent='Loading revision…';
 try{
  const after=await getSnapshot(entry.id,$('after-revision').value),baseId=$('base-entry').value;
  const before=baseId?await getSnapshot(baseId,$('base-revision').value):null;
  if(ticket!==viewRequest)return;
  state.after=after;state.before=before;$('entry-title').textContent=after.title;snapshot={before:before?.markdown||'',after:after.markdown};
  $('capture-info').textContent=`${entry.revisions.length} saved revision${entry.revisions.length===1?'':'s'} · Captured ${date(after.capturedAt)}`;
  $('diff-toolbar').hidden=!before;$('download').hidden=!before;$('results-title').textContent=before?'Changes between saved snapshots':'Saved snapshot';
  updateURL();
  if(before){
   $('summary').textContent='Comparing saved snapshots…';const result=await computeDiff(before.markdown,after.markdown);if(ticket!==viewRequest)return;rows=result;
   const added=rows.filter(r=>r.type==='addition').length,removed=rows.filter(r=>r.type==='deletion').length;
   $('added').textContent='+'+added;$('removed').textContent='−'+removed;$('download').disabled=added+removed===0;
   $('summary').textContent=`${added} added · ${removed} removed · ${rows.filter(r=>r.type==='context').length} unchanged lines`;render();
  }else{
   rows=[];$('added').textContent='';$('removed').textContent='';$('summary').textContent='A frozen copy of the article, converted to Markdown. Save this URL again after the publisher updates it to create another revision.';
   const pre=document.createElement('pre');pre.className='snapshot-text';pre.textContent=after.markdown;$('diff').replaceChildren(pre);
  }
  message('Snapshot loaded. This link preserves the selected revision'+(before?' and comparison.':'.'));
 }catch(error){if(ticket===viewRequest){message(error.message,true);$('summary').textContent='Unable to load this selection.';}}
 finally{if(ticket===viewRequest)$('diff').setAttribute('aria-busy','false');}
}
async function capture(url){
 if(state.busy)return;const previous=state.after;busy(true);message('Importing the article and saving a snapshot…');
 try{const saved=await api('/v1/import',{url});state.entryCache.delete(saved.id);state.snapshotCache.set(saved.id+'/'+saved.revision,saved.snapshot);await loadRegistry();await openEntry(saved.id,new URLSearchParams({to:saved.revision}),previous&&!(previous.id===saved.id&&previous.revision===saved.revision)?previous:null);message(saved.unchanged?'The extracted article matches an existing snapshot. No duplicate revision was created.':'Snapshot saved. Your permanent link is ready to copy.');$('saved-entry').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
 catch(error){message(error.message||'Import failed. Please try again.',true);}finally{busy(false);}
}
function matches(row) { return row.text.toLowerCase().includes($('search').value.toLowerCase()); }
function visible(row) { return (!$('changes-only').checked || row.type !== 'context') && matches(row); }
function cell(tr, text, className) { const td = document.createElement('td'); td.className = className; td.textContent = text ?? ''; tr.append(td); return td; }
function side(tr, row, end = false) {
  if (!row) { cell(tr, '', 'num blank'); cell(tr, '', 'sign blank'); cell(tr, '', `code blank${end ? ' side-end' : ''}`); return; }
  const type = row.type;
  cell(tr, row.old ?? row.new, `num ${type}`);
  cell(tr, type === 'addition' ? '+' : type === 'deletion' ? '−' : ' ', `sign ${type}`);
  cell(tr, row.text, `code ${type}${end ? ' side-end' : ''}`);
}
function splitRows() {
  const result = [];
  for (let i = 0; i < rows.length;) {
    if (rows[i].type === 'context') { result.push([rows[i], {...rows[i], old:null}]); i++; continue; }
    const removed = [], added = [];
    while (i < rows.length && rows[i].type !== 'context') { (rows[i].type === 'deletion' ? removed : added).push(rows[i++]); }
    for (let k = 0; k < Math.max(removed.length, added.length); k++) result.push([removed[k], added[k]]);
  }
  return result;
}
function render() {
  const container = $('diff'); container.replaceChildren();
  const filtered = rows.filter(visible);
  $('matches').textContent = $('search').value ? `${filtered.length} matching lines` : '';
  if (!filtered.length) {
    const empty = document.createElement('div'); empty.className = 'empty';
    empty.textContent = !rows.length ? 'Paste patch notes above to get started.' : !rows.some(r => r.type !== 'context') && !$('search').value ? 'No changes. Both versions contain the same lines.' : 'No lines match these filters.';
    container.append(empty); return;
  }
  const table = document.createElement('table'); table.className = `diff-table ${layout === 'split' ? 'split-table' : ''}`;
  const caption = document.createElement('caption'); caption.className = 'sr-only'; caption.textContent = layout === 'split' ? 'Original notes on the left, updated notes on the right' : 'Original and updated line numbers followed by the change'; table.append(caption);
  const colgroup = document.createElement('colgroup');
  for (const cls of layout === 'split' ? ['num','sign','code','num','sign','code'] : ['num','num','sign','code']) { const col = document.createElement('col'); if (cls !== 'code') col.className = cls; colgroup.append(col); }
  table.append(colgroup);
  const body = document.createElement('tbody');
  if (layout === 'unified') {
    for (const row of filtered.slice(0,1500)) {
      const tr = document.createElement('tr'); tr.className = row.type;
      cell(tr, row.old, 'num'); cell(tr, row.new, 'num'); cell(tr, row.type === 'addition' ? '+' : row.type === 'deletion' ? '−' : ' ', 'sign'); cell(tr, row.text, 'code'); body.append(tr);
    }
  } else {
    let shown=0; for (const [left, right] of splitRows()) {
      if (!(left && visible(left)) && !(right && visible(right))) continue;
      if(shown++>=1500)break; const tr = document.createElement('tr'); side(tr, left, true); side(tr, right); body.append(tr);
    }
  }
  table.append(body); container.append(table); if(filtered.length>1500){const note=document.createElement('div');note.className='empty';note.textContent='Showing up to 1,500 rows. Search to find any line in the full notes, or download the complete diff.';container.append(note);}
}
$('import-form').addEventListener('submit',event=>{event.preventDefault();capture($('source-url').value.trim());});
$('capture-again').addEventListener('click',()=>state.entry&&capture(state.entry.url));
$('base-entry').addEventListener('change',async()=>{try{await selectBase($('base-entry').value);await showSelection();}catch(error){message(error.message,true);}});
$('base-revision').addEventListener('change',showSelection);$('after-revision').addEventListener('change',showSelection);
for(const id of ['unified','split'])$(id).addEventListener('click',()=>{layout=id;for(const mode of ['unified','split'])$(mode).setAttribute('aria-pressed',String(mode===id));render();});
$('search').addEventListener('input',render);$('changes-only').addEventListener('change',render);
$('download-md').addEventListener('click',()=>state.after&&download(state.after.markdown+'\n',`maplestory-${state.after.revision.slice(0,7)}.md`));
$('download').addEventListener('click',()=>download(MapleDiff.exportDiff(snapshot.before,snapshot.after),'maplestory-patch-notes.diff'));
$('share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);message('Permanent link copied. Anyone with this link can open the saved snapshot and comparison.');}catch{message('Copy the page URL from your address bar to share this snapshot.');}});
$('more-entries').addEventListener('click',async()=>{try{await loadRegistry(true);}catch(error){message(error.message,true);}});
(async()=>{
 const params=new URLSearchParams(location.search),path=location.pathname.match(/\/maplediff\/([a-f0-9]{20})\/?$/),entry=params.get('entry')||path?.[1];
 try{await loadRegistry();if(entry){if(!/^[a-f0-9]{20}$/.test(entry))throw new Error('This saved-entry link is invalid.');await openEntry(entry,params);}else message('Paste a direct patch-note article link to save its first snapshot.');}
 catch(error){if(!state.entries.length){$('registry-count').textContent='Unavailable';$('registry-status').textContent='The shared registry could not be loaded. Please try again shortly.';}message(error.message,true);}
})();
