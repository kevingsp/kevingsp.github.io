"""Export the pinned project skills without changing their contents."""
import hashlib, json, re, zipfile
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'skills'
UPSTREAM = json.loads((ROOT / '.agents/upstream.json').read_text())
PIN = UPSTREAM['commit']
EMIL = set('animate animate-expo animation-performance animation-vocabulary apple-design ask-sonner break-ui emil-design-eng find-animation-opportunities improve-animations mobile-native pick-ui-library remove-animations review-animations write-swift'.split())
SPECIAL = {
 'stageshow': ('Benji Taylor', 'benji', 'https://github.com/benjitaylor/skills'),
 'blank-page': ('Stewdio', 'stewdio', 'https://github.com/StewdioAI/blank-page'),
 'web-design-guidelines': ('Vercel', 'vercel', 'https://github.com/vercel-labs/agent-skills'),
 'playful-design-router': ('Playful Design', 'playful', 'https://github.com/Playful-Design/router'),
}
CATEGORIES = {
 'Design': 'apple-design color defaults emil-design-eng gather icons match',
 'Motion': 'animate animate-expo animation-vocabulary avatar blank-page deconstruct find-animation-opportunities improve-animations motion remove-animations review-animations stageshow',
 'Review': 'alignment animation-performance audit break-ui frames keyboard verify viewports web-design-guidelines',
 'Workflow': 'bots copy lab playful-design-router prose prototype restraint reuse rule scope ship sketchbook',
 'Platform': 'ask-sonner mobile-native pick-ui-library write-swift',
}
TITLES = {'animate-expo':'Animate for Expo','apple-design':'Apple design','ask-sonner':'Sonner toasts','break-ui':'Break UI','emil-design-eng':'Design engineering','pick-ui-library':'Pick a UI library','playful-design-router':'Playful Design Router','write-swift':'Write Swift','web-design-guidelines':'Web interface guidelines'}
SHORT = {
 'alignment':'Measure spacing, edges, centering, and visual weight in a running page.',
 'animate':'Build purposeful web animations, from the first decision to the final frame.',
 'animate-expo':'Author native motion and gestures with Expo and Reanimated.',
 'animation-performance':'Find dropped frames and keep motion within the rendering budget.',
 'animation-vocabulary':'Find the right name for the motion you have in mind.',
 'apple-design':'Apply physical gestures, springs, materials, and typography to interfaces.',
 'ask-sonner':'Build and troubleshoot React toast notifications with Sonner.',
 'audit':'Get a ranked review across the full interface skills collection.',
 'avatar':'Turn an object into an expressive, animated character.',
 'blank-page':'Turn a one-line creative brief into a grounded motion direction.',
 'bots':'Build a portfolio for the Grok Bots you choose to share.',
 'break-ui':'Stress-test a screen with realistic worst-case data.',
 'color':'Check contrast, semantic color roles, and dark-mode palettes.',
 'copy':'Write short, clear labels and interface descriptions.',
 'deconstruct':'Break an interaction into states and a timeline you can inspect.',
 'defaults':'Establish the details that make a screen feel finished.',
 'emil-design-eng':'Review UI craft, polish, component details, and motion decisions.',
 'find-animation-opportunities':'Find the few moments where motion would actually help.',
 'frames':'Measure interaction performance and prove the improvement.',
 'gather':'Collect visual references before starting a design.',
 'icons':'Fill gaps in an icon set while keeping its existing style.',
 'improve-animations':'Audit motion and write practical implementation plans.',
 'keyboard':'Check an interface using only the keyboard.',
 'lab':'Show real components, variants, and states in one temporary workspace.',
 'match':'Recreate a reference from measured values and compare the result.',
 'mobile-native':'Polish mobile web behavior, touch targets, scrolling, and safe areas.',
 'motion':'Set consistent durations, easing, gestures, and reduced-motion behavior.',
 'pick-ui-library':'Choose a maintained library for a specific interface problem.',
 'playful-design-router':'Choose the right design skill for the task at hand.',
 'prose':'Write clear posts, case studies, and design breakdowns.',
 'prototype':'Compare several working design directions before choosing one.',
 'remove-animations':'Remove motion that makes an interface slower or harder to use.',
 'restraint':'Keep changes small, purposeful, and easy to review.',
 'reuse':'Build with the project’s existing components and conventions.',
 'review-animations':'Give motion code a focused, demanding second look.',
 'rule':'Turn a recurring correction into a clear project rule.',
 'scope':'Finish the requested work while preserving what already works.',
 'ship':'Release a change, watch the checks, and confirm it is live.',
 'sketchbook':'Explore small interaction ideas in a reusable visual workspace.',
 'stageshow':'Create believable product illustrations and animated walkthroughs.',
 'verify':'Check the running result before calling the work done.',
 'viewports':'Check responsive layouts, breakpoint edges, and enlarged text.',
 'web-design-guidelines':'Review accessibility, forms, focus, motion, and interface behavior.',
 'write-swift':'Write modern Swift with clear models and safe concurrency.',
}
OUT.mkdir(exist_ok=True)
for name in ['raw', 'licenses', 'downloads']:(OUT/name).mkdir(exist_ok=True)
entries=[]
for folder in sorted((ROOT/'.agents/skills').iterdir()):
 p=folder/'SKILL.md'
 if not p.is_file():continue
 raw=p.read_bytes();s=raw.decode('utf-8');parts=s.split('---',2)
 meta=yaml.safe_load(parts[1]);slug=folder.name
 assert re.fullmatch(r'[a-z0-9-]+',slug) and meta['name']==slug,slug
 if slug in SPECIAL:author,key,origin=SPECIAL[slug]
 elif slug in EMIL:author,key,origin='Emil Kowalski','emil','https://github.com/emilkowalski/skills'
 else:author,key,origin='Raphael Salaja','raphael','https://github.com/raphaelsalaja/skills'
 category=next(k for k,v in CATEGORIES.items() if slug in v.split())
 (OUT/'raw'/f'{slug}.txt').write_bytes(raw)
 licenses=sorted(x for x in folder.iterdir() if x.is_file() and ('license' in x.name.lower() or 'licence' in x.name.lower()))
 license_url=None
 if licenses:
  (OUT/'licenses'/f'{slug}.txt').write_bytes(licenses[0].read_bytes());license_url=f'/skills/licenses/{slug}.txt'
 files=[x for x in folder.rglob('*') if x.is_file()]
 entries.append(dict(id=slug,name=meta['name'],title=TITLES.get(slug,slug.replace('-',' ').capitalize()),description=meta['description'],summary=SHORT[slug],category=category,author=author,authorKey=key,originUrl=origin,sourceUrl=f'https://github.com/Playful-Design/router/blob/{PIN}/skills/{slug}/SKILL.md',githubUrl=f'https://github.com/kevingsp/kevingsp.github.io/blob/master/.agents/skills/{slug}/SKILL.md',filesUrl=f'https://github.com/kevingsp/kevingsp.github.io/tree/master/.agents/skills/{slug}',rawUrl=f'https://nyshift.com/skills/raw/{slug}.txt',path=f'/skills/{slug}/',licenseUrl=license_url,fileCount=len(files),bytes=sum(x.stat().st_size for x in files),sha256=hashlib.sha256(raw).hexdigest(),manual=bool(meta.get('disable-model-invocation',False)),install=f'npx skills add kevingsp/kevingsp.github.io --skill {slug}',body=parts[2].strip()))
assert len(entries)==44 and {x['id'] for x in entries}==set(UPSTREAM['skills'])
archive=OUT/'downloads'/f'nyshift-design-skills-{PIN[:7]}.zip'
archive_files=sorted(x for x in (ROOT/'.agents').rglob('*') if x.is_file())
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in archive_files:
  info=zipfile.ZipInfo(p.relative_to(ROOT).as_posix(),date_time=(2026,11,5,0,0,0));info.create_system=3;info.external_attr=p.stat().st_mode<<16;info.compress_type=zipfile.ZIP_DEFLATED
  z.writestr(info,p.read_bytes())
metadata=dict(version=1,count=len(entries),source=UPSTREAM['source'],commit=PIN,download=f'/skills/downloads/{archive.name}',archiveSha256=hashlib.sha256(archive.read_bytes()).hexdigest(),archiveFiles=len(archive_files),categories=list(CATEGORIES),skills=entries)
(Path(__file__).parent/'export.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(entries)} skills and {len(archive_files)} original files; ZIP {archive.stat().st_size:,} bytes.')
