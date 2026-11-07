'use strict';
document.documentElement.classList.remove('no-js');
const status=document.getElementById('copy-status');let statusTimer;
function report(message){clearTimeout(statusTimer);status.textContent=message;status.classList.add('visible');statusTimer=setTimeout(()=>{status.classList.remove('visible');status.textContent='';},3500);}
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
 const value=button.dataset.copy;let copied=false;
 try{await navigator.clipboard.writeText(value);copied=true;}catch{
  const input=document.createElement('textarea');input.value=value;input.setAttribute('readonly','');input.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(input);input.select();try{copied=document.execCommand('copy');}catch{}input.remove();button.focus();
 }
 report(copied?'Copied to clipboard.':'Copy was blocked. Select the command or URL and copy it manually.');
 if(copied){const label=button.querySelector('span');if(label){const original=label.textContent;label.textContent='Copied';setTimeout(()=>{label.textContent=original;},1600);}}
}));
const search=document.getElementById('skill-search');
if(search){
 const author=document.getElementById('author-filter'),cards=[...document.querySelectorAll('[data-skill]')],buttons=[...document.querySelectorAll('[data-category-filter]')],count=document.getElementById('result-count'),empty=document.getElementById('empty-state');
 const allowed=new Set(buttons.map(x=>x.dataset.categoryFilter));let category='';
 function readUrl(){const q=new URLSearchParams(location.search);search.value=q.get('q')||'';author.value=[...author.options].some(x=>x.value===q.get('author'))?q.get('author'):'';category=allowed.has(q.get('category'))?q.get('category'):'';}
 function update(write=true){
  const words=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);let visible=0;
  for(const card of cards){const show=(!category||card.dataset.category===category)&&(!author.value||card.dataset.author===author.value)&&words.every(x=>card.dataset.search.includes(x));card.hidden=!show;if(show)visible++;}
  count.textContent=`${visible} ${visible===1?'skill':'skills'}${visible!==cards.length?' of '+cards.length:''}`;empty.hidden=visible!==0;
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.categoryFilter===category));
  if(write){const q=new URLSearchParams();if(search.value.trim())q.set('q',search.value.trim());if(category)q.set('category',category);if(author.value)q.set('author',author.value);const suffix=q.toString();history.replaceState(null,'',location.pathname+(suffix?'?'+suffix:'')+location.hash);}
 }
 search.addEventListener('input',()=>update());author.addEventListener('change',()=>update());buttons.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.categoryFilter;update();}));
 document.getElementById('reset-filters').addEventListener('click',()=>{search.value='';author.value='';category='';update();search.focus();});
 addEventListener('popstate',()=>{readUrl();update(false);});readUrl();update(false);
}
