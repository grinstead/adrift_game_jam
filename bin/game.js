'use strict';class da{constructor(b,a,c){this.name=c;this.s=`${a}${c}`;switch(b){case "uniform":this.type=1;if("u_"!==a)throw Error(`uniform field "${this.s}" invalid, must start with u_`);break;case "in":this.type=2;if("a_"!==a)throw Error(`in field "${this.s}" invalid, must start with a_`);break;default:throw Error("Impossible");}}}function ea(b){const a=[];b.split("\n").forEach(c=>{(c=/^\s*(in|uniform)\s(?:\w+\s)*([ua]_)(\w+);/.exec(c))&&a.push(new da(c[1],c[2],c[3]))});return a}
const pa=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);function y(b,a){b.a.uniformMatrix4fv(b.c,!1,a);b.b.push(a)}function H(b,a,c,d=0){var e=b.b;e=e.length?e[e.length-1]:pa;y(b,new Float32Array([e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],e[11],a*e[0]+c*e[4]+d*e[8]+e[12],a*e[1]+c*e[5]+d*e[9]+e[13],a*e[2]+c*e[6]+d*e[10]+e[14],a*e[3]+c*e[7]+d*e[11]+e[15]]))}
function qa(b,a){var c=Math.cos(a);a=Math.sin(a);c=new Float32Array([c,0,a,0,0,1,0,0,-a,0,c,0,0,0,0,1]);a=b.b;0===a.length?y(b,c):(a=a[a.length-1],y(b,new Float32Array([c[0]*a[0]+c[1]*a[4]+c[2]*a[8]+c[3]*a[12],c[0]*a[1]+c[1]*a[5]+c[2]*a[9]+c[3]*a[13],c[0]*a[2]+c[1]*a[6]+c[2]*a[10]+c[3]*a[14],c[0]*a[3]+c[1]*a[7]+c[2]*a[11]+c[3]*a[15],c[4]*a[0]+c[5]*a[4]+c[6]*a[8]+c[7]*a[12],c[4]*a[1]+c[5]*a[5]+c[6]*a[9]+c[7]*a[13],c[4]*a[2]+c[5]*a[6]+c[6]*a[10]+c[7]*a[14],c[4]*a[3]+c[5]*a[7]+c[6]*a[11]+c[7]*a[15],
c[8]*a[0]+c[9]*a[4]+c[10]*a[8]+c[11]*a[12],c[8]*a[1]+c[9]*a[5]+c[10]*a[9]+c[11]*a[13],c[8]*a[2]+c[9]*a[6]+c[10]*a[10]+c[11]*a[14],c[8]*a[3]+c[9]*a[7]+c[10]*a[11]+c[11]*a[15],c[12]*a[0]+c[13]*a[4]+c[14]*a[8]+c[15]*a[12],c[12]*a[1]+c[13]*a[5]+c[14]*a[9]+c[15]*a[13],c[12]*a[2]+c[13]*a[6]+c[14]*a[10]+c[15]*a[14],c[12]*a[3]+c[13]*a[7]+c[14]*a[11]+c[15]*a[15]])))}class ra{constructor(b,a){this.a=b;this.c=a;this.b=[];b.uniformMatrix4fv(a,!1,pa)}pop(){return this.b.pop()}}
class I{constructor(b,a){this.name=b.name;var c=this.a=b.a;b=this.type=b.type;switch(b){case "vertex":var d=this.a.VERTEX_SHADER;break;case "fragment":d=this.a.FRAGMENT_SHADER;break;default:throw Error(`Unrecognized shader type "${b}"`);}d=this.b=c.createShader(d);c.shaderSource(d,a);c.compileShader(d);if(!c.getShaderParameter(d,c.COMPILE_STATUS))throw a=`Failed to compile ${this.name} ${b}-shader: ${c.getShaderInfoLog(d)}`,c.deleteShader(d),Error(a);this.Z=ea(a)}}
function sa(b,...a){const c=b.a,d=b.L;a.forEach(e=>{b.P.push(e);c.attachShader(d,e.b)});return b}class ta{constructor(b){this.name=b.name;this.K=b.K;b=this.a=b.a;this.b=!1;this.L=b.createProgram();this.P=[];this.l={};this.m={};this.stack=null}link(){if(this.b)return this;var b=this.a,a=this.L;b.linkProgram(a);if(!b.getProgramParameter(a,b.LINK_STATUS)){var c=`Failed to link ${this.name} program: ${b.getProgramInfoLog(a)}`;b.deleteProgram(a);throw Error(c);}this.b=!0;return this}}
function ua(b,a){var c=b.a,d=b.L;c.useProgram(d);for(var e={},g={},h=b.P,f=0;f<h.length;f++)for(var k=h[f].Z,p=0;p<k.length;p++){var q=k[p];1===q.type?q.s in e||(e[q.name]=c.getUniformLocation(d,q.s)):q.s in g||(g[q.name]=c.getAttribLocation(d,q.s))}b.l=e;b.m=g;if(d=b.K)if(d in b.l)b.stack=new ra(c,b.l[d]);else throw Error(`No anchor point "${d}" in program`);try{a(c,b)}finally{b.l={},b.m={},b.stack=null}}
class va{constructor(b,a,c,d,e){this.a=b;this.name=a;this.w=c;this.f=d;this.b=e(b)}bindTexture(){this.a.bindTexture(this.a.TEXTURE_2D,this.b)}}function J(b){return(new Promise((a,c)=>{const d=new Image;d.onload=()=>void a(d);d.onerror=()=>{c(Error(`failed to load ${b.src}`))};d.mode="no-cors";d.src=b.src})).then(a=>{const c=a.naturalWidth,d=a.naturalHeight;return new va(b.a,b.name,c,d,wa(e=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,c,d,0,e.RGBA,e.UNSIGNED_BYTE,a)}))})}
function xa(b){const a=b.width,c=b.height;return new va(b.a,b.name,a,c,wa(d=>{d.texImage2D(d.TEXTURE_2D,0,d.RGBA,a,c,0,d.RGBA,d.UNSIGNED_BYTE,b.R,0)}))}function Ma(b){return new va(b.a,b.name,b.width,b.height,()=>b.fa)}
function wa(b){return a=>{const c=a.createTexture();a.bindTexture(a.TEXTURE_2D,c);b(a);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.NEAREST);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.NEAREST);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);a.bindTexture(a.TEXTURE_2D,null);return c}};function K(b,a){const c=b.b.a;let d=b.c;null!=d?c.bindBuffer(c.ARRAY_BUFFER,d):(b.c=d=c.createBuffer(),c.bindBuffer(c.ARRAY_BUFFER,d),c.bufferData(c.ARRAY_BUFFER,b.M,c.STATIC_DRAW));c.activeTexture(c.TEXTURE0);b.b.bindTexture();c.uniform1i(a.l.texture,0);c.enableVertexAttribArray(a.m.texturePosition);c.vertexAttribPointer(a.m.texturePosition,2,c.FLOAT,!1,20,12);c.enableVertexAttribArray(a.m.position);c.vertexAttribPointer(a.m.position,3,c.FLOAT,!1,20,0)}
function L(b,a,c){if(!b.data.hasOwnProperty(a))throw Error(`Can not render unknown "${a}"`);a=b.data[a];b=b.b.a;const d=a.$;b.drawArrays(b.TRIANGLE_STRIP,d[c%d.length],a.ca)}
class Q{constructor(b,a){this.b=b;this.c=null;b=this.data={};const c=[];let d=0;for(const e in a){const g=a[e],h=[],f=g.length;if(0===f)throw Error("Sprite declared with 0 points");const k=g[0].length;if(0==k)throw Error("Sprite declared with list of length 5 (must be non-zero multiple of 5)");const p=k/5;for(let q=0;q<f;q++){const v=g[q];if(v.length!==k)throw Error("Sprite declared with inconsistent lengths of elements");h.push(d);c.push.apply(c,v);d+=p}b[e]={ia:this,name:e,$:h,ca:p}}this.M=new Float32Array(c)}}
;function V(b,a,c){b=b.c;null!=c?b.set(a,c):b.delete(a)}function W(b,a){a=b.c.get(a);const c=b.b;return!!a&&!!a.some(d=>(d=c.get(d))?(d.I=0,null!=d.J):!1)}function Na(b){const a=b.c.get("showLights");if(a){const c=b.b;return a.reduce((d,e)=>(e=c.get(e))?(d+=e.I,e.I=0,d):d,0)}return 0}function Oa(b){const a=W(b,"left")?1:0;return(W(b,"right")?1:0)-a}
class Pa{constructor(b){this.b=new Map;this.c=new Map;b.addEventListener("keydown",a=>{Qa(this,a,!0)});b.addEventListener("keyup",a=>{Qa(this,a,!1)});b.onblur=()=>{this.b.clear()};b.onfocus=()=>{this.b.clear()}}}function Qa(b,a,c){a=a.key;b=b.b;const d=b.get(a);c?null==d?b.set(a,{J:Date.now(),I:1}):(null==d.J&&(d.J=Date.now()),d.I++):null!=d&&(d.J=null)};const X=166/360/2;function Ra(b,a){const c=b.c.a,d=b.b;c.enable(c.BLEND);c.blendFunc(c.ONE,c.ONE);c.bindFramebuffer(c.FRAMEBUFFER,b.aa);c.viewport(0,0,d.w,d.f);ua(b.c,(e,g)=>{Sa(e,g,b,a)})}
class Ta{constructor(b,a,c,d){a/=4;c/=4;var e=new I({a:b,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec2 v_texturePosition;\n\nvoid main() {\n    vec4 position = u_projection * vec4(a_position, 1);\n    float variance = 1.f / (position.z + 1.f);\n\n    vec4 result = vec4(position.x, -position.y * variance, -.5f * (position.z - 1.f) * variance, position.w * variance);\n    gl_Position = result;\n    v_texturePosition = a_texturePosition;\n}"),g=
new I({a:b,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform float u_threshold;\n\nin vec2 v_texturePosition;\nout vec4 output_color;\n\nvoid main() {\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    color.a -= u_threshold;\n    if (color.a <= u_threshold) {\n        discard;\n    }\n    output_color = color;\n}");const h=new ta({a:b,K:"projection"});sa(h,e,g).link();e=b.createTexture();b.bindTexture(b.TEXTURE_2D,e);b.texImage2D(b.TEXTURE_2D,
0,b.RGBA,a,c,0,b.RGBA,b.UNSIGNED_BYTE,null);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.LINEAR);b.texParameteri(b.TEXTURE_2D,b.ha,b.LINEAR);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);g=b.createFramebuffer();b.bindFramebuffer(b.FRAMEBUFFER,g);b.framebufferTexture2D(b.FRAMEBUFFER,b.COLOR_ATTACHMENT0,b.TEXTURE_2D,e,0);b.bindFramebuffer(b.FRAMEBUFFER,null);const f=128/d;d=xa({name:"fade",width:64,height:64,a:b,
R:Ua(d)});this.c=h;this.b=Ma({fa:e,name:"lighting",width:a,height:c,a:b});this.aa=g;this.M=new Q(d,{main:[[f,0,-f,1,0,f,0,f,1,1,-f,0,-f,0,0,-f,0,f,0,1]]})}}function Sa(b,a,c,d){d.ba?b.clearColor(0,0,0,1):b.clearColor(0,0,0,.2);b.clear(b.COLOR_BUFFER_BIT|b.DEPTH_BUFFER_BIT);d.ea(b,a,()=>{const e=c.M;K(e,a);const g=a.l.threshold,h=d.ga;d.da.forEach(f=>{if(!f.h){var k=f.startTime;k=(h-k)/(f.T-k);b.uniform1f(g,.5*k*k);H(a.stack,f.x,f.y,f.z);L(e,"main",0);a.stack.pop()}})})}
function Ua(b){const a=new Uint8Array(16384),c=(g,h)=>{g/=b;h/=b;return g*g+h*h},d=Math.min(c(32,0),c(32,0));for(let g=0;64>g;g++)for(let h=0;64>h;h++){const f=4*(64*g+h);var e=c(h-32,g-32);const k=1-Math.sqrt(e/d);e=1E-4>=e?5:0;const p=Math.max(Math.round(255*k*k),0);a[f]=e+Math.max(Math.round(20*k),0);a[f+1]=e;a[f+2]=e;a[f+3]=p}return a};const Va=[{B:422,D:285,G:415,H:353},{B:936,D:367,G:868,H:380},{B:1507,D:311,G:1469,H:318},{B:162,D:948,G:206,H:943},{B:1025,D:934,G:976,H:962}];function Y({C:b=0,ja:a=0,ka:c=0,A:d,u:e,v:g,g:h,count:f,j:k=!1}){const p=d/360,q=e/360;return Wa({x:b*p,y:a,z:c*q,width:p,height:q,O:d/g.w,N:e/g.f,g:h,count:f,j:k})}
function Wa({x:b=0,y:a=0,z:c=0,width:d,height:e,O:g,N:h,g:f,count:k,j:p=!1}){const q=[];for(let v=0;v<k;v++){const M=Math.floor(v/f),N=v%f;q.push(Xa({x:b,y:a,z:c,width:d,height:e,X:N*g,V:(N+1)*g,Y:M*h,W:(M+1)*h,j:p}))}return q}function Xa({x:b=0,y:a=0,z:c=0,width:d,height:e,X:g,Y:h,V:f,W:k,j:p=!1}){p?p=f:(p=g,g=f);return[d-b,a,-c,g,k,-b,a,-c,p,k,d-b,a,e-c,g,h,-b,a,e-c,p,h]}
function Ya(b){const a=1/18/18,c=g=>Math.max(0,Math.min(255,Math.round(256*(1-a*g*g)))),d=[];for(let g=0;2>g;g++)for(let h=0;18>h;h++)for(let f=0;2>f;f++){let k;var e=void 0;let p;e=h+6*f;18>e?(k=255,e=c(e),p=255):p=e=k=0;c(h+6*f);c(h+6*f+1);for(let q=0;2>q;q++)d.push(k,e,e,p)}b=xa({name:"spark",width:72,height:2,a:b,R:new Uint8Array(d)});return new Q(b,{fading:Wa({x:1/180,width:.04,height:2/180,O:1/18,N:1,g:18,count:18})})}function Za(b,a){return b.h?a.h?0:1:a.h?-1:b.y-a.y}
function Z(b,a){return fetch(a).then(c=>{if(!c.ok)throw Error(`failed to load ${a}`);return c.arrayBuffer()}).then(c=>b.decodeAudioData(c))}
window.onload=async function(){function b(){var l=Date.now();const n=(l-ya)/1E3;ya=l;fa=1/n/16+.9375*fa;g.innerHTML=`fps=${Math.round(fa)}`;const r=(l-$a)/1E3;l=Math.sin(Math.PI*(w+0)/8)/2+Math.sin(Math.PI*(w+0)/3)/8;var A=Math.sin(Math.PI*(w+170)/8)/2+Math.sin(Math.PI*(w+130)/3)/8;aa=Math.asin((l-A)/100);za=Math.cos(aa);Aa=Math.sin(aa);Ba=(l+A)/2;l=0;z===ha&&r-D<5/O||(W(k,"attack")?(z=ha,D=r,O=12,E&&E.stop(),A=B.createBufferSource(),A.buffer=Ca[Math.floor(Math.random()*Ca.length)],A.connect(B.destination),
A.start(0)):(l=1.2*Oa(k),R=l*n,0!==R?(ba+=R,S=0>R,z!==Da&&(z=Da,D=r,O=8)):z!==ia?(z=ia,D=r,O=12):null==E&&D<r-4&&(E=B.createBufferSource(),E.buffer=ab,E.connect(B.destination),E.start(0))));A=Math.floor(48*r)-Math.floor(48*w);for(let m=0;m<A;m++){let x=ba+(bb-(R?.05:0))*(S?-1:1),C=.1*Math.sin(2*Math.PI*Math.random());var P=328/360,u=Math.PI/2;if(z===ha){P=Math.floor(O*(r-D));u=Va[P];x=ba+(u.B-(P%3*644+284))*(S?-1:1)/360;C=-Math.abs(C);P=(565-(u.D-565*Math.floor(P/3)))/360;var F=(u.G-u.B)*(S?-1:1);
u=Math.atan((u.D-u.H)/F);0<F&&(u+=Math.PI)}F=Math.PI/4*(Math.random()-.5)+u;const T=2*Math.random()+1.4;u=T*Math.sin(F);F=T*Math.cos(F)+l;100<G.length&&G.pop();G.push({h:!1,x,y:0,z:P,i:F,F:C,o:u,startTime:r,T:r+1.5,U:!1})}const Ea=1-.8*n;G.forEach(m=>{var x=m.h;if(!x&&r<m.T){x=m.o;m.U?(m.i*=Ea,m.F*=Ea):(x-=9.8*za*n,m.i-=9.8*Aa*n,m.o=x);m.x+=m.i*n;m.y+=m.F*n;m.z+=m.o*n;const C=m.y;if(C<-X||C>X){const T=0<C?X:-X;m.y=T+(T-C);m.F=-m.F}0>m.z&&(-.01<x?(m.z=180,m.o=0,m.U=!0):(m.z=-m.z,m.o=-.25*x))}else x||
(m.h=!0)});G.sort(Za);w=r}function a(l,n,r){y(n.stack,cb);H(n.stack,-1.5,0,t.d/2+t.f+.5);qa(n.stack,aa);H(n.stack,0,0,Ba);r(l,n);n.stack.pop();n.stack.pop();n.stack.pop()}function c(l,n){K(Fa,n);L(Fa,"main",0);K(Ga,n);L(Ga,"main",0);H(n.stack,ba,0,0);K(z,n);L(z,S?"left":"right",Math.floor(O*(w-D)));n.stack.pop();K(Ha,n);G.forEach(r=>{r.h||(H(n.stack,r.x,r.y,r.z),qa(n.stack,(0<=r.i?Math.PI:0)+Math.atan(r.o/r.i)),L(Ha,"fading",Math.floor(12*(w-r.startTime))),n.stack.pop(),n.stack.pop())})}function d(l,
n){l.bindFramebuffer(l.FRAMEBUFFER,null);l.viewport(0,0,M,N);l.disable(l.BLEND);l.clearColor(0,0,0,1);l.clear(l.COLOR_BUFFER_BIT|l.DEPTH_BUFFER_BIT);l.activeTexture(l.TEXTURE1);ja.b.bindTexture();l.uniform1i(n.l.lighting,1);l.activeTexture(l.TEXTURE0);a(l,n,c);H(n.stack,Ia/180,0,(q-Ja)/180);l=Math.floor(8*w)%38;K(Ka,n);L(Ka,"blink",6>l?l:0)}function e(){Na(k)%2&&(v=!v);!ka&&W(k,"fullscreen")&&(ka=h.requestFullscreen());b();Ra(ja,{ea:a,ga:w,da:G,ba:v});ua(La,d);requestAnimationFrame(e)}const g=document.getElementById("fps"),
h=document.getElementById("canvas");var f=window.getComputedStyle(h);const k=new Pa(document.body);V(k,"left",["a","ArrowLeft"]);V(k,"right",["d","ArrowRight"]);V(k,"showLights",["l"]);V(k,"attack",["f"," "]);V(k,"fullscreen",["u"]);var p=parseInt(f.getPropertyValue("width"),10);let q=parseInt(f.getPropertyValue("height"),10),v=!1;const M=p,N=q;h.width=M;h.height=N;const cb=new Float32Array([360/p,0,0,0,0,-360/q,.25,0,0,360/q,0,0,-1,-1,0,1]);f=h.getContext("webgl2",{antialias:!1,alpha:!1});f.enable(f.DEPTH_TEST);
f.depthFunc(f.LEQUAL);p=new I({a:f,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec4 v_clipSpace;\nout vec2 v_texturePosition;\n\nvoid main() {\n    vec4 position = u_projection * vec4(a_position, 1);\n    float variance = 1.f / (position.z + 1.f);\n\n    vec4 result = vec4(position.x, position.y * variance, -.5f * (position.z - 1.f) * variance, position.w * variance);\n    gl_Position = result;\n    \n    v_clipSpace = result;\n    v_texturePosition = a_texturePosition;\n}");
const db=new I({a:f,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform sampler2D u_lighting;\n\nin vec2 v_texturePosition;\nin vec4 v_clipSpace;\nout vec4 output_color;\n\nvoid main() {\n    vec4 clipSpace = vec4(.5f * (v_clipSpace.x + 1.f), -.5f * (v_clipSpace.y - 1.f), v_clipSpace.z, v_clipSpace.w);\n\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    if (color.a == 0.0) {\n        discard;\n    }\n\n    vec4 light = texture(u_lighting, clipSpace.xy);\n    vec3 math = min(light.xyz + color.xyz * light.a, vec3(1.f, 1.f, 1.f));\n    output_color = vec4(math, color.a);\n}"),
La=new ta({a:f,K:"projection"});sa(La,p,db).link();const ja=new Ta(f,M,N,360),B=new AudioContext,[U,ca,la,ma,na,oa,Ca,ab]=await Promise.all([J({a:f,src:"assets/Back Wall.png",name:"wall"}),J({a:f,src:"assets/new floor Floor.png",name:"floor"}),J({a:f,src:"assets/Hero Breathing with axe.png",name:"idle"}),J({a:f,src:"assets/Enemy.png",name:"enemy"}),J({a:f,src:"assets/Hero Walking with axe.png",name:"walk"}),J({a:f,src:"assets/Axe Chop.png",name:"attack"}),Promise.all([Z(B,"assets/Grunt1.mp3"),Z(B,
"assets/Grunt2.mp3"),Z(B,"assets/Grunt3.mp3")]),Z(B,"assets/Theres something here.mp3")]);let E=null;const t={top:52/ca.f,w:ca.w/360,f:38/360,d:166/360,S:218/ca.f},Fa=new Q(U,{main:[[U.w/360,-t.d/2,U.f/360,1,0,U.w/360,-t.d/2,0,1,1,0,-t.d/2,U.f/360,0,0,0,-t.d/2,0,0,1]]}),Ga=new Q(ca,{main:[[t.w,t.d/2,-t.f,1,1,0,t.d/2,-t.f,0,1,t.w,t.d/2,0,1,t.S,0,t.d/2,0,0,t.S,t.w,-t.d/2,0,1,t.top,0,-t.d/2,0,0,t.top]]});p=220/405;const bb=1.125*(387/405-p),ia=new Q(la,{right:Y({C:p,A:405,u:434,v:la,g:5,count:16}),left:Y({C:1-
p,A:405,u:434,v:la,g:5,count:16,j:!0})}),Da=new Q(na,{right:Y({C:258/424,A:424,u:442,v:na,g:2,count:8}),left:Y({C:1-258/424,A:424,u:442,v:na,g:2,count:8,j:!0})}),ha=new Q(oa,{right:Y({C:284/644,A:644,u:565,v:oa,g:3,count:5}),left:Y({C:1-284/644,A:644,u:565,v:oa,g:3,count:5,j:!0})}),Ka=new Q(ma,{blink:Wa({x:.15,width:.3,height:.3,O:108/ma.w,N:108/ma.f,g:2,count:6})});new Q(ja.b,{main:[Xa({width:2,height:1,X:0,Y:0,V:1,W:1})]});const Ha=Ya(f);let Ia=0,Ja=0;const G=[];let $a=Date.now(),ya=Date.now(),
w=0,fa=0,ba=4,R=0,S=!1,D=0,z=ia,O=12,ka=null;document.addEventListener("fullscreenchange",()=>{document.fullscreenElement||(ka=null)});let aa,Aa,za,Ba;requestAnimationFrame(e);h.onmousemove=l=>{Ia=l.offsetX;Ja=l.offsetY}};
