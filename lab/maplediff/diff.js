/* Exact line diff using Hirschberg LCS with linear memory. */
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
    if (before.length > 300000 || after.length > 300000) throw new Error('Please keep each version under 300,000 characters.');
    const a = lines(before), b = lines(after), n = a.length, m = b.length;
    if (n > 8000 || m > 8000) throw new Error('Please keep each version under 8,000 lines.');
    // Hirschberg LCS: exact matches with linear rather than quadratic memory.
    function scores(a0,a1,b0,b1,reverse=false) {
      const count=b1-b0; let prev=new Uint16Array(count+1),curr=new Uint16Array(count+1);
      for(let step=0;step<a1-a0;step++) {
        const av=a[reverse?a1-1-step:a0+step]; curr[0]=0;
        for(let j=1;j<=count;j++)curr[j]=av===b[reverse?b1-j:b0+j-1]?prev[j-1]+1:Math.max(prev[j],curr[j-1]);
        [prev,curr]=[curr,prev];
      }
      return prev;
    }
    const pairs=[];
    function find(a0,a1,b0,b1) {
      while(a0<a1&&b0<b1&&a[a0]===b[b0])pairs.push([a0++,b0++]);
      let suffix=0;while(a0<a1-suffix&&b0<b1-suffix&&a[a1-1-suffix]===b[b1-1-suffix])suffix++;
      const ae=a1-suffix,be=b1-suffix;
      if(a0<ae&&b0<be) {
        if(ae-a0===1){for(let j=b0;j<be;j++)if(a[a0]===b[j]){pairs.push([a0,j]);break;}}
        else {
          const mid=(a0+ae)>>1;
          let left=scores(a0,mid,b0,be),right=scores(mid,ae,b0,be,true),split=0,best=-1;
          for(let j=0;j<=be-b0;j++){const value=left[j]+right[be-b0-j];if(value>best){best=value;split=j;}}
          left=null;right=null;find(a0,mid,b0,b0+split);find(mid,ae,b0+split,be);
        }
      }
      for(let k=suffix;k>0;k--)pairs.push([a1-k,b1-k]);
    }
    find(0,n,0,m);
    const rows=[];let i=0,j=0;
    function until(ai,bj){while(i<ai)rows.push({type:'deletion',text:a[i],old:++i,new:null});while(j<bj)rows.push({type:'addition',text:b[j],old:null,new:++j});}
    for(const [ai,bj] of pairs){until(ai,bj);rows.push({type:'context',text:a[i],old:++i,new:++j});}
    until(n,m);
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
