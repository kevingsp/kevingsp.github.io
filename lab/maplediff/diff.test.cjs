const {strict:assert} = require('node:assert');
const {diff, lines, exportDiff} = require('./diff.js');
function verify(a,b) {
  const result=diff(a,b);
  assert.deepEqual(result.filter(r=>r.type!=='addition').map(r=>r.text),lines(a));
  assert.deepEqual(result.filter(r=>r.type!=='deletion').map(r=>r.text),lines(b));
  let old=0,next=0;
  for(const r of result){if(r.old!==null)assert.equal(r.old,++old);if(r.new!==null)assert.equal(r.new,++next);}
  return result;
}
for(const [a,b] of [['',''],['','new'],['old',''],['same','same'],['a\r\nb\r\n','a\nb\n'],['a\na\nb','a\nb\na'],['before\n\nend','after\n\nend'],['中文\n🍁','中文\n🍄'],['<script>alert(1)</script>','<img onerror=alert(1)>']]) verify(a,b);
assert.equal(diff('x','y').filter(r=>r.type==='addition').length,1);
assert.throws(()=>diff('x\n'.repeat(2001),''),/2,000/);
assert.throws(()=>diff('x'.repeat(200001),''),/200,000/);
assert.equal(exportDiff('same','same'),'');
assert.equal(exportDiff('x','y'),'--- original-patch-notes.txt\n+++ updated-patch-notes.txt\n@@ -1,1 +1,1 @@\n-x\n+y\n');
let seed=42;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/2**32;}
for(let i=0;i<300;i++){const make=()=>Array.from({length:Math.floor(random()*25)},()=>String(Math.floor(random()*6))).join('\n');verify(make(),make());}
verify('a\n'.repeat(2000),'b\n'.repeat(2000));
console.log('Diff checks passed: reconstruction, line numbers, repeats, Unicode, limits, normalization, export, 300 randomized pairs.');
