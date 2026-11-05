(() => {
 'use strict';
 document.getElementById('year').textContent = new Date().getFullYear();
 const canvas = document.getElementById('field');
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 const gl = canvas.getContext('webgl', {alpha:false,antialias:false,powerPreference:'low-power'});
 if(!gl)return;
 const vertex = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
 const fragment = `precision mediump float;
 uniform vec2 size;uniform vec2 pointer;uniform float time;uniform float strength;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
 float fbm(vec2 p){float n=0.;float a=.5;for(int i=0;i<4;i++){n+=noise(p)*a;p=mat2(.8,-.6,.6,.8)*p*2.02;a*=.5;}return n;}
 void main(){
 vec2 uv=gl_FragCoord.xy/size;vec2 p=(gl_FragCoord.xy-.5*size)/size.y;
 vec2 mouse=(pointer-.5)*vec2(size.x/size.y,1.);vec2 delta=p-mouse;float distance=length(delta);
 float influence=exp(-distance*2.8)*strength;
 p+=vec2(-delta.y,delta.x)*influence*.85;
 float t=time*.055;
 float n=fbm(p*1.55+vec2(t,-t*.4));
 float field=fbm(p*2.2+vec2(n*2.,-n*1.5)+vec2(-t*.4,t));
 float bands=sin(field*43.+p.x*1.3-time*.04);
 float fine=pow(.5+.5*bands,16.);
 float broad=pow(.5+.5*sin(field*12.+p.y*1.1),3.);
 float illumination=smoothstep(-.6,.9,p.x+.4)*(.35+.65*(1.-smoothstep(-.5,.9,p.y)));
 vec3 ink=vec3(.043,.055,.047);
 vec3 moss=vec3(.17,.24,.105);vec3 light=vec3(.60,.75,.27);
 vec3 color=ink+moss*broad*.58*illumination+light*fine*.26*illumination;
 float ripple=pow(.5+.5*sin(distance*25.-time*1.8),12.)*exp(-distance*3.2)*strength;
 color+=vec3(.44,.63,.20)*(influence*.1+ripple*.15);
 float vignette=1.-.24*length(uv-.5);
 gl_FragColor=vec4(color*vignette,1.);
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw new Error('Shader unavailable');}return s;}
 let program;
 try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('WebGL unavailable');}catch{return;}
 gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
 const uniforms={};for(const key of ['size','pointer','time','strength'])uniforms[key]=gl.getUniformLocation(program,key);
 let x=.75,y=.35,targetX=x,targetY=y,energy=0,targetEnergy=0,frame=0,last=0,paused=false;
 function resize(){const ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(innerWidth*ratio);canvas.height=Math.round(innerHeight*ratio);gl.viewport(0,0,canvas.width,canvas.height);if(motion.matches)draw(0);}
 function draw(timestamp){
  frame=0;if(paused||document.hidden)return;
  if(timestamp-last<32&&!motion.matches){frame=requestAnimationFrame(draw);return;}last=timestamp;
  x+=(targetX-x)*.08;y+=(targetY-y)*.08;energy+=(targetEnergy-energy)*.045;
  gl.uniform2f(uniforms.size,canvas.width,canvas.height);gl.uniform2f(uniforms.pointer,x,y);gl.uniform1f(uniforms.time,motion.matches?0:timestamp/1000);gl.uniform1f(uniforms.strength,motion.matches?0:energy);gl.drawArrays(gl.TRIANGLES,0,6);
  if(!motion.matches)frame=requestAnimationFrame(draw);
 }
 const pointer=e=>{targetX=e.clientX/innerWidth;targetY=1-e.clientY/innerHeight;targetEnergy=1;};
 window.addEventListener('pointermove',pointer,{passive:true});document.documentElement.addEventListener('pointerleave',()=>{targetEnergy=0;});window.addEventListener('resize',resize,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else if(!frame)draw(performance.now());});
 motion.addEventListener('change',()=>{cancelAnimationFrame(frame);draw(performance.now());});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();paused=true;cancelAnimationFrame(frame);});
 resize();if(!motion.matches)frame=requestAnimationFrame(draw);
})();
