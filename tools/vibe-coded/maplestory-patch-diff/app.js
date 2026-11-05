'use strict';
const $ = id => document.getElementById(id);
const demoBefore = `# MapleStory — Demo patch notes
Illustrative content, not official patch information.

## Class adjustments
Hero — Raging Blow
Damage: 320% per hit.
Targets: 8 enemies.

Bishop — Holy Symbol
EXP bonus: 50%.
Duration: 180 seconds.

## Boss updates
Practice mode available for Normal Lotus.
Weekly entry limit: 1 clear.

## Quality of life
Storage has 128 slots.
Event rewards must be claimed on each character.

## Events
Maple Picnic ends on Sunday.
Daily coin cap: 200.`;
const demoAfter = `# MapleStory — Demo patch notes
Illustrative content, not official patch information.

## Class adjustments
Hero — Raging Blow
Damage: 350% per hit.
Targets: 8 enemies.

Bishop — Holy Symbol
EXP bonus: 50%.
Duration: 240 seconds.

## Boss updates
Practice mode available for Normal and Hard Lotus.
Weekly entry limit: 1 clear.
Practice mode no longer consumes buff items.

## Quality of life
Storage has 160 slots.
Event rewards can be claimed through the account menu.

## Events
Daily coin cap: 200.
A new weekend coin bonus has been added.`;
const key = 'kgs-maplediff-v1';
let rows = [], snapshot = {before:'', after:''}, layout = 'unified', isDemo = true;
function message(text) { $('message').textContent = text; }
function save() {
  try { localStorage.setItem(key, JSON.stringify({before:$('before').value, after:$('after').value, isDemo})); return true; }
  catch { return false; }
}
function compare() {
  try {
    snapshot = {before:$('before').value, after:$('after').value};
    rows = MapleDiff.diff(snapshot.before, snapshot.after);
    const added = rows.filter(r => r.type === 'addition').length;
    const removed = rows.filter(r => r.type === 'deletion').length;
    $('added').textContent = `+${added}`; $('removed').textContent = `−${removed}`;
    $('summary').textContent = `${added} added · ${removed} removed · ${rows.filter(r => r.type === 'context').length} unchanged lines`;
    $('demo-badge').hidden = !isDemo;
    $('download').disabled = added + removed === 0;
    $('results').hidden = false;
    const saved = save();
    message(isDemo ? 'Demo content only — these are invented changes. Paste real notes to compare them.' : saved ? 'Compared. Draft saved on this device. Line endings and the final newline are normalized.' : 'Compared. Browser storage is unavailable; this draft will not persist after reload.');
    render();
  } catch (error) { message(error.message); $('results').hidden = true; }
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
    for (const row of filtered) {
      const tr = document.createElement('tr'); tr.className = row.type;
      cell(tr, row.old, 'num'); cell(tr, row.new, 'num'); cell(tr, row.type === 'addition' ? '+' : row.type === 'deletion' ? '−' : ' ', 'sign'); cell(tr, row.text, 'code'); body.append(tr);
    }
  } else {
    for (const [left, right] of splitRows()) {
      if (!(left && visible(left)) && !(right && visible(right))) continue;
      const tr = document.createElement('tr'); side(tr, left, true); side(tr, right); body.append(tr);
    }
  }
  table.append(body); container.append(table);
}
$('compare').addEventListener('click', compare);
$('swap').addEventListener('click', () => { const old = $('before').value; $('before').value = $('after').value; $('after').value = old; compare(); });
$('example').addEventListener('click', () => { if (($('before').value || $('after').value) && !isDemo && !window.confirm('Replace your current draft with demo notes?')) return; $('before').value = demoBefore; $('after').value = demoAfter; isDemo = true; compare(); });
$('clear').addEventListener('click', () => { if (($('before').value || $('after').value) && !window.confirm('Clear both patch-note drafts saved on this device?')) return; $('before').value = ''; $('after').value = ''; isDemo = false; $('search').value = ''; compare(); $('before').focus(); });
for (const id of ['before','after']) $(id).addEventListener('input', () => { isDemo = false; save(); message('Draft changed. Select “Compare changes” to refresh the diff.'); });
for (const id of ['unified','split']) $(id).addEventListener('click', () => { layout = id; for (const mode of ['unified','split']) $(mode).setAttribute('aria-pressed', String(mode === layout)); render(); });
$('search').addEventListener('input', render); $('changes-only').addEventListener('change', render);
$('download').addEventListener('click', () => {
  const blob = new Blob([MapleDiff.exportDiff(snapshot.before, snapshot.after)], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'maplestory-patch-notes.diff'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
let draft;
try { draft = JSON.parse(localStorage.getItem(key)); } catch { /* Storage may be disabled. */ }
if (draft && typeof draft.before === 'string' && typeof draft.after === 'string' && draft.before.length <= 200000 && draft.after.length <= 200000) { $('before').value = draft.before; $('after').value = draft.after; isDemo = draft.isDemo === true; }
else { $('before').value = demoBefore; $('after').value = demoAfter; }
compare();
