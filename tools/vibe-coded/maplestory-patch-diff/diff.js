/* Exact line diff using longest common subsequence. Bounded to 4M cells. */
(function (root) {
  'use strict';
  function lines(text) {
    if (text === '') return [];
    const normalized = text.replace(/\r\n?/g, '\n');
    const result = normalized.split('\n');
    if (normalized.endsWith('\n')) result.pop();
    return result;
  }
  function diff(before, after) {
    if (before.length > 200000 || after.length > 200000) throw new Error('Please keep each version under 200,000 characters.');
    const a = lines(before), b = lines(after), n = a.length, m = b.length;
    if (n > 2000 || m > 2000) throw new Error('Please keep each version under 2,000 lines. Compare one section at a time for longer notes.');
    const width = m + 1, table = new Uint16Array((n + 1) * width);
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
      table[i * width + j] = a[i] === b[j] ? 1 + table[(i + 1) * width + j + 1] : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
    const rows = []; let i = 0, j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && a[i] === b[j]) { rows.push({type:'context', text:a[i], old:++i, new:++j}); }
      else if (i < n && (j === m || table[(i + 1) * width + j] >= table[i * width + j + 1])) { rows.push({type:'deletion', text:a[i], old:++i, new:null}); }
      else { rows.push({type:'addition', text:b[j], old:null, new:++j}); }
    }
    return rows;
  }
  function exportDiff(before, after) {
    const rows = diff(before, after);
    if (!rows.some(r => r.type !== 'context')) return '';
    const a = lines(before).length, b = lines(after).length;
    let output = `--- original-patch-notes.txt\n+++ updated-patch-notes.txt\n@@ -${a ? 1 : 0},${a} +${b ? 1 : 0},${b} @@\n`;
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      output += (row.type === 'addition' ? '+' : row.type === 'deletion' ? '-' : ' ') + row.text + '\n';

    }
    return output;
  }
  const api = {lines, diff, exportDiff};
  if (typeof module !== 'undefined') module.exports = api;
  else root.MapleDiff = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
