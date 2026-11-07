"""Create browser/Apple icon formats from the unchanged NYshift vector raster."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
source=Image.open(Path(__file__).parent/'logo-512.png').convert('RGBA')
for name,size in [('favicon-16x16.png',16),('favicon-32x32.png',32),('android-chrome-192x192.png',192),('android-chrome-512x512.png',512)]:
 source.resize((size,size),Image.Resampling.LANCZOS).save(ROOT/name,optimize=True)
source.save(ROOT/'favicon.ico',format='ICO',sizes=[(16,16),(32,32),(48,48),(64,64)])
apple=Image.new('RGBA',(512,512),'#101210');apple.alpha_composite(source)
apple.convert('RGB').resize((180,180),Image.Resampling.LANCZOS).save(ROOT/'apple-touch-icon.png',optimize=True)
# Optimize the rendered previews without changing their pixels.
for p in (ROOT/'assets/social').glob('*.png'):
 with Image.open(p) as image:image.convert('RGB').save(p,optimize=True)
print('Created ICO, PNG, Apple touch and Android icons from the NYshift mark.')
