const ORIGIN='https://nyshift.com';
const VERSION='1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function imageName(url){
 if(url==='/')return 'home';
 if(url==='/lab/')return 'lab';
 if(url.startsWith('/lab/maplediff/')){const entry=url.match(/^\/lab\/maplediff\/([a-f0-9]{20})\//);return entry?'patch-'+entry[1]:'maplediff';}
 const skill=url.match(/^\/skills\/([a-z0-9-]+)\/$/);return skill?'skill-'+skill[1]:url==='/skills/'?'skills':'home';
}
function socialHead({title,description,url,image,alt}){
 const page=ORIGIN+url,img=ORIGIN+(image||`/assets/social/${imageName(url)}-v${VERSION}.png`),imageAlt=alt||`${title}. ${description}`;
 const tags=[['og:site_name','NYshift'],['og:type','website'],['og:locale','en_US'],['og:title',title],['og:description',description],['og:url',page],['og:image',img],['og:image:secure_url',img],['og:image:type','image/png'],['og:image:width','1200'],['og:image:height','630'],['og:image:alt',imageAlt]];
 return `<meta name="description" content="${esc(description)}"><meta name="theme-color" content="#0b0e0c"><meta name="application-name" content="NYshift"><meta name="apple-mobile-web-app-title" content="NYshift"><link rel="canonical" href="${esc(page)}">\n`+
 tags.map(([k,v])=>`<meta property="${k}" content="${esc(v)}">`).join('\n')+'\n'+
 [['twitter:card','summary_large_image'],['twitter:title',title],['twitter:description',description],['twitter:image',img],['twitter:image:alt',imageAlt]].map(([k,v])=>`<meta name="${k}" content="${esc(v)}">`).join('\n')+'\n'+
 '<link rel="icon" href="/favicon.ico?v=nyshift-2" sizes="16x16 32x32 48x48"><link rel="icon" href="/favicon-32x32.png?v=nyshift-2" type="image/png" sizes="32x32"><link rel="icon" href="/assets/nyshift/mark.svg?v=nyshift-2" type="image/svg+xml" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=nyshift-2" sizes="180x180"><link rel="manifest" href="/site.webmanifest?v=nyshift-2">';
}
function setHead(html,page){
 let result=html.replace(/<meta\b[^>]*>/gi,tag=>/\b(?:name|property)\s*=\s*["'](?:description|theme-color|application-name|apple-mobile-web-app-title|og:[^"']+|twitter:[^"']+)["']/i.test(tag)?'':tag);
 result=result.replace(/<link\b[^>]*>/gi,tag=>/\brel\s*=\s*["'](?:canonical|icon|shortcut icon|apple-touch-icon|manifest)["']/i.test(tag)?'':tag);
 result=result.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(page.title)}</title>`);
 return result.replace(/<\/head>/i,socialHead(page)+'\n</head>');
}
module.exports={socialHead,setHead,imageName,VERSION,ORIGIN};
