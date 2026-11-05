importScripts('./diff.js');
self.onmessage=({data})=>{try{self.postMessage({request:data.request,rows:MapleDiff.diff(data.before,data.after)});}catch(error){self.postMessage({request:data.request,error:error.message});}};
