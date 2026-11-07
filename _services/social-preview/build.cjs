const fs=require('node:fs'),path=require('node:path');
const {setHead,imageName,VERSION}=require('./head.cjs');
const root=path.resolve(__dirname,'../..');
const registry=JSON.parse(fs.readFileSync(path.join(root,'skills/registry.json'),'utf8'));
const saved=JSON.parse(fs.readFileSync(path.join(__dirname,'saved-entries.json'),'utf8')).entries;
const pages=[
 {url:'/',file:'index.html',title:'NYshift | Ideas after hours',description:'Ideas after hours. Things worth making. Follow the process, explore The Lab, and find something useful to try.',heading:'NYshift',summary:'Ideas after hours.\nThings worth making.',label:'IDEAS · EXPERIMENTS · PROCESS',kind:'home'},
 {url:'/lab/',file:'lab/index.html',title:'The Lab | NYshift',description:'Tools, experiments, and prototypes from NYshift. Try MapleDiff, explore the skills library, and see what is taking shape.',heading:'The Lab.',summary:'Small ideas. Useful things.',label:'TOOLS & EXPERIMENTS',kind:'lab'},
 {url:'/lab/maplediff/',file:'lab/maplediff/index.html',title:'MapleDiff | Saved MapleStory patch notes',description:'Save MapleStory patch notes from a link, keep permanent snapshots, and compare revisions with clear additions and removals. No account needed.',heading:'MapleDiff',summary:'MapleStory notes,\nwith a history.',label:'PATCH NOTES · SAVED SNAPSHOTS · DIFFS',kind:'maplediff'},
 {url:'/lab/maplediff/demo/',file:'lab/maplediff/demo/index.html',title:'MapleDiff walkthrough | NYshift',description:'See how MapleDiff saves a patch-note link, compares revisions, and creates a permanent link. An illustrated product walkthrough.',heading:'MapleDiff',summary:'Save. Compare. Share.',label:'AN ILLUSTRATED WALKTHROUGH',kind:'maplediff'},
 {url:'/skills/',file:'skills/index.html',title:'Skills | NYshift',description:'44 design skills to read, download, or install. Browse the collection, copy an install command, and keep the original files and references.',heading:'The skills shelf.',summary:'44 design workflows.\nReady when you are.',label:'READ · INSTALL · KEEP',kind:'skills'},
 {url:'/404.html',file:'404.html',title:'Find your next shift | NYshift',description:'Explore NYshift: ideas after hours, useful experiments in The Lab, MapleDiff, and a library of design skills.',heading:'NYshift',summary:'Ideas after hours.\nThings worth making.',label:'EXPLORE THE LAB',kind:'home'},
];
for(const s of registry.skills)pages.push({url:s.path,file:s.path.slice(1)+'index.html',title:s.title+' | NYshift',description:s.summary,heading:s.title,summary:s.summary,label:s.category.toUpperCase()+' / DESIGN SKILL',kind:'skill',category:s.category,author:s.author});
for(const entry of saved){
 if(!/^[a-f0-9]{20}$/.test(entry.id))throw Error('Invalid saved-entry id');
 const file=`lab/maplediff/${entry.id}/index.html`,target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,fs.readFileSync(path.join(root,'lab/maplediff/index.html'),'utf8'));
 pages.push({url:`/lab/maplediff/${entry.id}/`,file,title:entry.title+' | MapleDiff',description:'Saved MapleStory patch notes in MapleDiff. Read the captured article, compare revisions, and download its Markdown.',heading:entry.title.replace(/^\[Updated[^\]]+\]\s*/,''),summary:'Saved patch notes.\nA history you can compare.',label:'MAPLEDIFF / SAVED PATCH NOTES',kind:'patch',source:entry.url});
}
for(const page of pages){
 const file=path.join(root,page.file);fs.writeFileSync(file,setHead(fs.readFileSync(file,'utf8'),page));
 page.image=`/assets/social/${imageName(page.url)}-v${VERSION}.png`;
}
// Keep retired routes branded while retaining their existing redirects and canonical targets.
for(const [file,url] of [['tools/index.html','/lab/'],['tools/vibe-coded/index.html','/lab/'],['tools/vibe-coded/maplestory-patch-diff/index.html','/lab/maplediff/']]){
 const page=pages.find(p=>p.url===url);const target=path.join(root,file);if(fs.existsSync(target))fs.writeFileSync(target,setHead(fs.readFileSync(target,'utf8'),page));
}
const cards=[...new Map(pages.filter(p=>p.url!=='/404.html'&&p.url!=='/lab/maplediff/demo/').map(p=>[p.image,p])).values()];
fs.writeFileSync(path.join(__dirname,'manifest.json'),JSON.stringify({pages,cards},null,2)+'\n');
fs.writeFileSync(path.join(root,'site.webmanifest'),JSON.stringify({name:'NYshift',short_name:'NYshift',start_url:'/',display:'browser',background_color:'#0b0e0c',theme_color:'#0b0e0c',icons:[{src:'/android-chrome-192x192.png?v=nyshift-2',sizes:'192x192',type:'image/png'},{src:'/android-chrome-512x512.png?v=nyshift-2',sizes:'512x512',type:'image/png'}]},null,2)+'\n');
console.log(`Prepared server-readable metadata for ${pages.length} pages and ${cards.length} share cards.`);
