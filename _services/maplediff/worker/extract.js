import {parse, parseFragment} from 'parse5';
const skip = new Set(['script','style','noscript','nav','footer','header','form','button','iframe','svg','canvas','aside']);
const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value || '';
const children=node=>node.childNodes || [];
function find(node, predicate) {if(predicate(node))return node;for(const child of children(node)){const result=find(child,predicate);if(result)return result;}return null;}
function text(node) {if(node.nodeName==='#text')return node.value; if(skip.has(node.tagName))return '';return children(node).map(text).join('');}
function safeLink(value, source) {try{const url=new URL(value,source);return /^https?:$/.test(url.protocol)?url.href:'';}catch{return '';}}
function convert(node, source, depth=0) {
 if(depth>80)return '';
 if(node.nodeName==='#text')return node.value.replace(/\s+/g,' ');
 const tag=node.tagName;
 if(skip.has(tag)||attr(node,'aria-hidden')==='true'||node.attrs?.some(a=>a.name==='hidden'))return '';
 const inner=()=>children(node).map(n=>convert(n,source,depth+1)).join('');
 if(/^h[1-6]$/.test(tag))return '\n\n'+'#'.repeat(Number(tag[1]))+' '+inner().trim()+'\n\n';
 if(tag==='br')return '\n';
 if(tag==='li')return '\n- '+inner().trim()+'\n';
 if(tag==='a'){const label=inner().trim(),href=safeLink(attr(node,'href'),source);return href&&label?`[${label.replace(/[\[\]]/g,'')}](${href.replace(/\)/g,'%29')})`:label;}
 if(tag==='img'){const label=attr(node,'alt').trim(),src=safeLink(attr(node,'src'),source);return label&&src?`\n![${label.replace(/[\[\]]/g,'')}](${src.replace(/\)/g,'%29')})\n`:'';}
 if(tag==='pre')return '\n\n```\n'+text(node).trim()+'\n```\n\n';
 if(tag==='tr')return '\n| '+children(node).filter(n=>['td','th'].includes(n.tagName)).map(n=>convert(n,source,depth+1).trim().replace(/\|/g,'\\|').replace(/\n/g,' ')).join(' | ')+' |\n';
 if(tag==='td'||tag==='th')return inner();
 if(tag==='strong'||tag==='b')return '**'+inner().trim()+'**';
 if(tag==='em'||tag==='i')return '*'+inner().trim()+'*';
 const value=inner();
 return ['p','div','section','article','main','ul','ol','table','blockquote','hr'].includes(tag)?'\n\n'+value.trim()+'\n\n':value;
}
export function extract(html,source,explicitTitle='',fragment=false) {
 const dom=fragment?parseFragment(html):parse(html);
 const title=explicitTitle || text(find(dom,n=>n.tagName==='h1')||find(dom,n=>n.tagName==='title')||{childNodes:[]}).trim() || 'Untitled patch notes';
 const article=fragment?dom:find(dom,n=>n.tagName==='article')||find(dom,n=>/(?:^|\s)(?:entry-content|news-content|news-detail-content|article-content)(?:\s|$)/.test(attr(n,'class')))||find(dom,n=>n.tagName==='main')||find(dom,n=>n.tagName==='body');
 if(!article)throw new Error('No article was found at this URL. Please use a direct patch-note article link.');
 let markdown=convert(article,source).replace(/\u00a0/g,' ').replace(/ +\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
 if(markdown.replace(/\s/g,'').length<120)throw new Error('The page did not contain enough article text. It may require JavaScript or block automated imports.');
 if(!markdown.startsWith('# '))markdown='# '+title+'\n\n'+markdown;
 if(markdown.length>300000||markdown.split('\n').length>8000)throw new Error('This article exceeds the snapshot limit (300,000 characters or 8,000 lines).');
 return {title:title.slice(0,250),markdown};
}
export function validateURL(input) {
 let u;try{u=new URL(input);}catch{throw new Error('Enter a valid patch-note URL.');}
 if(u.protocol!=='https:'||u.username||u.password||u.port)throw new Error('Use an HTTPS article URL without credentials or a custom port.');
 const host=u.hostname.toLowerCase();
 const allowed=(host==='www.nexon.com'&&/^\/maplestory\/(?:news\/[^/]+|general-post)\/\d+(?:\/|$)/.test(u.pathname)) || (['maplestory.nexon.net','www.maplestory.nexon.net'].includes(host)&&/^\/news\//.test(u.pathname)) || (['orangemushroom.net','www.orangemushroom.net'].includes(host)&&/^\/\d{4}\/\d{2}\/\d{2}\//.test(u.pathname)) || (['maplesea.com','www.maplesea.com'].includes(host)&&/^\/updates\/view\//.test(u.pathname)) || (host==='maplestory.nexon.com'&&/^\/News\//i.test(u.pathname));
 if(!allowed)throw new Error('Use a direct MapleStory article from Nexon (GMS/KMS), MapleSEA, or Orange Mushroom. Other sources are not supported yet.');
 u.hash='';u.search='';u.pathname=u.pathname.replace(/\/$/,'');
 return u;
}
export async function readLimited(response,max=2000000) {
 if(!response.ok)throw new Error(`The source returned HTTP ${response.status}. No snapshot was saved.`);
 if(Number(response.headers.get('content-length'))>max)throw new Error('The source response is too large.');
 if(!response.body)return '';
 const reader=response.body.getReader();let size=0;const chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error('The source response is too large.');chunks.push(value);}}finally{await reader.cancel();}
 const all=new Uint8Array(size);let pos=0;for(const chunk of chunks){all.set(chunk,pos);pos+=chunk.length;}return new TextDecoder().decode(all);
}
export async function importArticle(input,fetcher=fetch) {
 let source=validateURL(input);
 // Modern GMS is a client-rendered app. Its public CMS supplies the article body.
 const match=source.hostname==='www.nexon.com'&&source.pathname.match(/^\/maplestory\/(?:news\/[^/]+|general-post)\/(\d+)(?:\/|$)/);
 if(match){
  const kind=source.pathname.includes('/general-post/')?'general-posts':'news';
  const api=`https://g.nexonstatic.com/maplestory/cms/v1/${kind}/${match[1]}`;
  const response=await fetcher(api,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json'}});
  const data=JSON.parse(await readLimited(response));
  if(typeof data.body!=='string'||!data.name)throw new Error('The publisher did not return a readable article. No snapshot was saved.');
  return {...extract(data.body.replace(/(["'])\/media\//g,'$1https://g.nexonstatic.com/media/'),source.href,data.name,true),url:source.href,publishedAt:data.liveDate||null,extractor:'nexon-cms-v1'};
 }
 for(let redirects=0;redirects<4;redirects++){
  const response=await fetcher(source.href,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{Accept:'text/html','User-Agent':'MapleDiff/1.0 (+https://nyshift.com/lab/maplediff/)'}});
  if(response.status>=300&&response.status<400){source=validateURL(new URL(response.headers.get('location'),source).href);continue;}
  if(!(response.headers.get('content-type')||'').includes('text/html'))throw new Error('This URL did not return an HTML article.');
  return {...extract(await readLimited(response),source.href),url:source.href,publishedAt:null,extractor:'article-html-v1'};
 }
 throw new Error('Too many redirects. Use the final article URL.');
}
