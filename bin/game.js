'use strict';class aa{constructor(a,b,c){this.name=c;this.s=`${b}${c}`;switch(a){case "uniform":this.type=1;if("u_"!==b)throw Error(`uniform field "${this.s}" invalid, must start with u_`);break;case "in":this.type=2;if("a_"!==b)throw Error(`in field "${this.s}" invalid, must start with a_`);break;default:throw Error("Impossible");}}}function ba(a){const b=[];a.split("\n").forEach(c=>{(c=/^\s*(in|uniform)\s(?:\w+\s)*([ua]_)(\w+);/.exec(c))&&b.push(new aa(c[1],c[2],c[3]))});return b}
const ca=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);function A(a,b){a.a.uniformMatrix4fv(a.f,!1,b);a.b.push(b)}function G(a,b,c,d=0){var e=a.b;e=e.length?e[e.length-1]:ca;A(a,new Float32Array([e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],e[11],b*e[0]+c*e[4]+d*e[8]+e[12],b*e[1]+c*e[5]+d*e[9]+e[13],b*e[2]+c*e[6]+d*e[10]+e[14],b*e[3]+c*e[7]+d*e[11]+e[15]]))}function da(a,b){const c=Math.cos(b);b=Math.sin(b);a.push(new Float32Array([c,0,b,0,0,1,0,0,-b,0,c,0,0,0,0,1]))}
class ia{constructor(a,b){this.a=a;this.f=b;this.b=[];a.uniformMatrix4fv(b,!1,ca)}pop(){return this.b.pop()}push(a){var b=this.b;0===b.length?A(this,a):(b=b[b.length-1],A(this,new Float32Array([a[0]*b[0]+a[1]*b[4]+a[2]*b[8]+a[3]*b[12],a[0]*b[1]+a[1]*b[5]+a[2]*b[9]+a[3]*b[13],a[0]*b[2]+a[1]*b[6]+a[2]*b[10]+a[3]*b[14],a[0]*b[3]+a[1]*b[7]+a[2]*b[11]+a[3]*b[15],a[4]*b[0]+a[5]*b[4]+a[6]*b[8]+a[7]*b[12],a[4]*b[1]+a[5]*b[5]+a[6]*b[9]+a[7]*b[13],a[4]*b[2]+a[5]*b[6]+a[6]*b[10]+a[7]*b[14],a[4]*b[3]+a[5]*b[7]+
a[6]*b[11]+a[7]*b[15],a[8]*b[0]+a[9]*b[4]+a[10]*b[8]+a[11]*b[12],a[8]*b[1]+a[9]*b[5]+a[10]*b[9]+a[11]*b[13],a[8]*b[2]+a[9]*b[6]+a[10]*b[10]+a[11]*b[14],a[8]*b[3]+a[9]*b[7]+a[10]*b[11]+a[11]*b[15],a[12]*b[0]+a[13]*b[4]+a[14]*b[8]+a[15]*b[12],a[12]*b[1]+a[13]*b[5]+a[14]*b[9]+a[15]*b[13],a[12]*b[2]+a[13]*b[6]+a[14]*b[10]+a[15]*b[14],a[12]*b[3]+a[13]*b[7]+a[14]*b[11]+a[15]*b[15]])))}}
class ja{constructor(a,b){this.name=a.name;var c=this.a=a.a;a=this.type=a.type;switch(a){case "vertex":var d=this.a.VERTEX_SHADER;break;case "fragment":d=this.a.FRAGMENT_SHADER;break;default:throw Error(`Unrecognized shader type "${a}"`);}d=this.b=c.createShader(d);c.shaderSource(d,b);c.compileShader(d);if(!c.getShaderParameter(d,c.COMPILE_STATUS))throw b=`Failed to compile ${this.name} ${a}-shader: ${c.getShaderInfoLog(d)}`,c.deleteShader(d),Error(b);this.ja=ba(b)}}
function ka(a,...b){const c=a.a,d=a.V;b.forEach(e=>{a.Z.push(e);c.attachShader(d,e.b)});return a}class ra{constructor(a){this.name=a.name;this.T=a.T;a=this.a=a.a;this.b=!1;this.V=a.createProgram();this.Z=[];this.l={};this.m={};this.stack=null}link(){if(this.b)return this;var a=this.a,b=this.V;a.linkProgram(b);if(!a.getProgramParameter(b,a.LINK_STATUS)){var c=`Failed to link ${this.name} program: ${a.getProgramInfoLog(b)}`;a.deleteProgram(b);throw Error(c);}this.b=!0;return this}}
function sa(a,b){var c=a.a,d=a.V;c.useProgram(d);for(var e={},h={},f=a.Z,g=0;g<f.length;g++)for(var k=f[g].ja,l=0;l<k.length;l++){var n=k[l];1===n.type?n.s in e||(e[n.name]=c.getUniformLocation(d,n.s)):n.s in h||(h[n.name]=c.getAttribLocation(d,n.s))}a.l=e;a.m=h;if(d=a.T)if(d in a.l)a.stack=new ia(c,a.l[d]);else throw Error(`No anchor point "${d}" in program`);try{b(c,a)}finally{a.l={},a.m={},a.stack=null}}
class ta{constructor(a,b,c,d,e){this.a=a;this.name=b;this.w=c;this.c=d;this.b=e(a)}bindTexture(){this.a.bindTexture(this.a.TEXTURE_2D,this.b)}}function H(a){return(new Promise((b,c)=>{const d=new Image;d.onload=()=>void b(d);d.onerror=()=>{c(Error(`failed to load ${a.src}`))};d.mode="no-cors";d.src=a.src})).then(b=>{const c=b.naturalWidth,d=b.naturalHeight;return new ta(a.a,a.name,c,d,ua(e=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,c,d,0,e.RGBA,e.UNSIGNED_BYTE,b)}))})}
function va(a){const b=a.width,c=a.height;return new ta(a.a,a.name,b,c,ua(d=>{d.texImage2D(d.TEXTURE_2D,0,d.RGBA,b,c,0,d.RGBA,d.UNSIGNED_BYTE,a.$,0)}))}function wa(a){return new ta(a.a,a.name,a.width,a.height,()=>a.ua)}
function ua(a){return b=>{const c=b.createTexture();b.bindTexture(b.TEXTURE_2D,c);a(b);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);b.bindTexture(b.TEXTURE_2D,null);return c}};function I(a,b){const c=a.b.a;let d=a.f;null!=d?c.bindBuffer(c.ARRAY_BUFFER,d):(a.f=d=c.createBuffer(),c.bindBuffer(c.ARRAY_BUFFER,d),c.bufferData(c.ARRAY_BUFFER,a.W,c.STATIC_DRAW));c.activeTexture(c.TEXTURE0);a.b.bindTexture();c.uniform1i(b.l.texture,0);c.enableVertexAttribArray(b.m.texturePosition);c.vertexAttribPointer(b.m.texturePosition,2,c.FLOAT,!1,20,12);c.enableVertexAttribArray(b.m.position);c.vertexAttribPointer(b.m.position,3,c.FLOAT,!1,20,0)}
function N(a,b,c){if(!a.data.hasOwnProperty(b))throw Error(`Can not render unknown "${b}"`);b=a.data[b];a=a.b.a;const d=b.ka;a.drawArrays(a.TRIANGLE_STRIP,d[c%d.length],b.oa)}
class O{constructor(a,b){this.b=a;this.f=null;a=this.data={};const c=[];let d=0;for(const e in b){const h=b[e],f=[],g=h.length;if(0===g)throw Error("Sprite declared with 0 points");const k=h[0].length;if(0==k)throw Error("Sprite declared with list of length 5 (must be non-zero multiple of 5)");const l=k/5;for(let n=0;n<g;n++){const v=h[n];if(v.length!==k)throw Error("Sprite declared with inconsistent lengths of elements");f.push(d);c.push.apply(c,v);d+=l}a[e]={wa:this,name:e,ka:f,oa:l}}this.W=new Float32Array(c)}}
function S({D:a=0,Ba:b=0,Ca:c=0,B:d,u:e,v:h,A:f,g,count:k,j:l=!1}){const n=d/h;h=e/h;return xa({x:a*n,y:b,z:c*h,width:n,height:h,Y:d/f.w,X:e/f.c,g,count:k,j:l})}function xa({x:a=0,y:b=0,z:c=0,width:d,height:e,Y:h,X:f,g,count:k,ya:l=0,za:n=0,Aa:v=h,xa:y=f,j:P=!1}){const r=[];for(let B=0;B<k;B++){const Q=l+B%g*v,z=n+Math.floor(B/g)*y;r.push(ya({x:a,y:b,z:c,width:d,height:e,ha:Q,fa:Q+h,ia:z,ga:z+f,j:P}))}return r}
function ya({x:a=0,y:b=0,z:c=0,width:d,height:e,ha:h,ia:f,fa:g,ga:k,j:l=!1}){l?l=g:(l=h,h=g);return[d-a,b,-c,h,k,-a,b,-c,l,k,d-a,b,e-c,h,f,-a,b,e-c,l,f]};function Z(a,b,c){a=a.f;null!=c?a.set(b,c):a.delete(b)}function Ia(a,b){b=a.f.get(b);const c=a.b;return!!b&&!!b.some(d=>(d=c.get(d))?(d.P=0,null!=d.S):!1)}function Ja(a){const b=a.f.get("showLights");if(b){const c=a.b;return b.reduce((d,e)=>(e=c.get(e))?(d+=e.P,e.P=0,d):d,0)}return 0}function Ka(a){const b=Ia(a,"left")?1:0;return(Ia(a,"right")?1:0)-b}
class La{constructor(a){this.b=new Map;this.f=new Map;a.addEventListener("keydown",b=>{Ma(this,b,!0)});a.addEventListener("keyup",b=>{Ma(this,b,!1)});a.onblur=()=>{this.b.clear()};a.onfocus=()=>{this.b.clear()}}}function Ma(a,b,c){b=b.key;a=a.b;const d=a.get(b);c?null==d?a.set(b,{S:Date.now(),P:1}):(null==d.S&&(d.S=Date.now()),d.P++):null!=d&&(d.S=null)};const Na=166/360/2;function Oa(a,b){const c=a.f.a,d=a.b;c.enable(c.BLEND);c.blendFunc(c.ONE,c.ONE);c.bindFramebuffer(c.FRAMEBUFFER,a.ma);c.viewport(0,0,d.w,d.c);sa(a.f,(e,h)=>{Pa(e,h,a,b)})}
class Qa{constructor(a,b,c,d){b/=4;c/=4;var e=new ja({a,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec2 v_texturePosition;\n\nvoid main() {\n    vec4 position = u_projection * vec4(a_position, 1);\n    float variance = 1.f / (position.z + 1.f);\n\n    vec4 result = vec4(position.x, -position.y * variance, -.5f * (position.z - 1.f) * variance, position.w * variance);\n    gl_Position = result;\n    v_texturePosition = a_texturePosition;\n}"),h=
new ja({a,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform float u_threshold;\n\nin vec2 v_texturePosition;\nout vec4 output_color;\n\nvoid main() {\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    color.a -= u_threshold;\n    if (color.a <= u_threshold) {\n        discard;\n    }\n    output_color = color;\n}");const f=new ra({a,T:"projection"});ka(f,e,h).link();e=a.createTexture();a.bindTexture(a.TEXTURE_2D,e);a.texImage2D(a.TEXTURE_2D,
0,a.RGBA,b,c,0,a.RGBA,a.UNSIGNED_BYTE,null);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);h=a.createFramebuffer();a.bindFramebuffer(a.FRAMEBUFFER,h);a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,e,0);a.bindFramebuffer(a.FRAMEBUFFER,null);const g=128/d;d=va({name:"fade",width:64,height:64,a,$:Ra(d)});this.f=f;this.b=wa({ua:e,name:"lighting",
width:b,height:c,a});this.ma=h;this.W=new O(d,{main:[[g,0,-g,1,0,g,0,g,1,1,-g,0,-g,0,0,-g,0,g,0,1]]})}}function Pa(a,b,c,d){d.na?a.clearColor(0,0,0,1):a.clearColor(0,0,0,.2);a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT);d.qa(a,b,()=>{const e=c.W;I(e,b);const h=b.l.threshold,f=d.va;d.pa.forEach(g=>{if(!g.h){var k=g.startTime;k=(f-k)/(g.ca-k);a.uniform1f(h,.5*k*k);G(b.stack,g.x,g.y,g.z);N(e,"main",0);b.stack.pop()}})})}
function Ra(a){const b=new Uint8Array(16384),c=(h,f)=>{h/=a;f/=a;return h*h+f*f},d=Math.min(c(32,0),c(32,0));for(let h=0;64>h;h++)for(let f=0;64>f;f++){const g=4*(64*h+f);var e=c(f-32,h-32);const k=1-Math.sqrt(e/d);e=1E-4>=e?5:0;const l=Math.max(Math.round(255*k*k),0);b[g]=e+Math.max(Math.round(20*k),0);b[g+1]=e;b[g+2]=e;b[g+3]=l}return b};async function Sa(a){const [b,c]=await Promise.all([a("creature","assets/Enemy.png"),a("tentacle","assets/Tentacle.png")]);a=new O(b,{blink:xa({x:.15,z:.15,width:.3,height:.3,Y:108/b.w,X:108/b.c,g:2,count:6})});var d=[],e=92,h=-22;const f=Math.sqrt(e*e+h*h);e/=f;h/=f;for(let g=0;29>g;g++){const k=g%5,l=Math.floor(g/5),n=[],v=(y,P)=>{const r=100*y,B=77*P-48;n.push((r*e+B*h)/f,y,(r*-h+B*e)/360/2,100*(k+y)/c.w,77*(l+P)/c.c)};v(1,1);v(0,1);v(1,0);v(0,0);d.push(n)}d=new O(c,{wiggle:d});return{la:a,sa:d}}
class Ta{constructor(a,b,c){this.x=this.ra=a;this.y=b;this.z=c;this.ta=[{M:-.05,N:.01,H:a-.2,I:.1,J:0,R:0},{M:.05,N:.01,H:a+.2,I:.1,J:0,R:3},{M:-.05,N:-.01,H:a-.2,I:-.1,J:0,R:7},{M:.05,N:-.01,H:a+.2,I:-.1,J:0,R:13}]}}function Ua(a){const b=a.U;a.O.forEach(c=>{c.x=c.ra+.5*Math.sin(b)})}
function Va(a,b){const c=a.stack,d=b.ea.ba.la,e=b.ea.ba.sa,h=b.U;I(d,a);b.O.forEach(f=>{G(c,f.x,f.y,f.z);f=Math.floor(8*h)%38;N(d,"blink",6>f?f:0);c.pop()});I(e,a);b.O.forEach(f=>{const g=f.z-.08;f.ta.forEach(k=>{const l=f.x+k.M-k.H,n=f.y+k.N-k.I,v=g-k.J,y=Math.sqrt(l*l+n*n+v*v);G(c,k.H,k.I,k.J);da(c,0<l?Math.atan(v/l):0===l?0<v?Math.PI/2:0===v?0:-Math.PI/2:Math.atan(v/l)+Math.PI);c.push(new Float32Array([y,0,0,0,0,n,0,0,0,0,1,0,0,0,0,1]));N(e,"wiggle",Math.abs((Math.floor(24*h)+k.R)%57+1-29));c.pop();
c.pop();c.pop()})})};const Wa=[{C:422,F:285,K:415,L:353},{C:936,F:367,K:868,L:380},{C:1507,F:311,K:1469,L:318},{C:162,F:948,K:206,L:943},{C:1025,F:934,K:976,L:962}];
function Xa(a){const b=1/18/18,c=h=>Math.max(0,Math.min(255,Math.round(256*(1-b*h*h)))),d=[];for(let h=0;2>h;h++)for(let f=0;18>f;f++)for(let g=0;2>g;g++){let k;var e=void 0;let l;e=f+6*g;18>e?(k=255,e=c(e),l=255):l=e=k=0;c(f+6*g);c(f+6*g+1);for(let n=0;2>n;n++)d.push(k,e,e,l)}a=va({name:"spark",width:72,height:2,a,$:new Uint8Array(d)});return new O(a,{fading:xa({x:1/180,width:.04,height:2/180,Y:1/18,X:1,g:18,count:18})})}function Ya(a,b){return a.h?b.h?0:1:b.h?-1:a.y-b.y}
function Za(a,b){return fetch(b).then(c=>{if(!c.ok)throw Error(`failed to load ${b}`);return c.arrayBuffer()}).then(c=>a.decodeAudioData(c))}
window.onload=async function(){function a(){var p=Math.sin(Math.PI*(w+0)/8)/2+Math.sin(Math.PI*(w+0)/3)/8,q=Math.sin(Math.PI*(w+170)/8)/2+Math.sin(Math.PI*(w+130)/3)/8;ea=Math.asin((p-q)/100);za=Math.cos(ea);Aa=Math.sin(ea);Ba=(p+q)/2;p=0;E===la&&w-J<5/R||(Ia(k,"attack")?(E=la,J=w,R=12,K&&K.stop(),q=z.createBufferSource(),q.buffer=Ca[Math.floor(Math.random()*Ca.length)],q.connect(z.destination),q.start(0)):(p=1.2*Ka(k),T=p*C,0!==T?(U+=T,V=0>T,E!==Da&&(E=Da,J=w,R=8)):E!==ma?(E=ma,J=w,R=12):null==K&&
J<w-4&&(K=z.createBufferSource(),K.buffer=$a,K.connect(z.destination),K.start(0))));q=Math.floor(48*w)-Math.floor(48*(w-C));for(let m=0;m<q;m++){let D=U+(ab-(T?.05:0))*(V?-1:1),F=.1*Math.sin(2*Math.PI*Math.random());var x=328/360,t=Math.PI/2;if(E===la){x=Math.floor(R*(w-J));t=Wa[x];D=U+(t.C-(x%3*644+284))*(V?-1:1)/360;F=-Math.abs(F);x=(565-(t.F-565*Math.floor(x/3)))/360;var L=(t.K-t.C)*(V?-1:1);t=Math.atan((t.F-t.L)/L);0<L&&(t+=Math.PI)}L=Math.PI/4*(Math.random()-.5)+t;const W=2*Math.random()+1.4;
t=W*Math.sin(L);L=W*Math.cos(L)+p;100<M.length&&M.pop();M.push({h:!1,x:D,y:0,z:x,i:L,G:F,o:t,startTime:w,ca:w+1.5,da:!1})}const bb=9.8*za*C,cb=9.8*Aa*C,Ea=1-.8*C;M.forEach(m=>{var D=m.h;if(!D&&w<m.ca){m.x+=m.i*C;m.y+=m.G*C;m.z+=m.o*C;D=m.o;m.da?(m.i*=Ea,m.G*=Ea):(D-=bb,m.i-=cb,m.o=D);const F=m.y;if(F<-Na||F>Na){const W=0<F?Na:-Na;m.y=W+(W-F);m.G=-m.G}0>m.z&&(-.01<D?(m.z=180,m.o=0,m.da=!0):(m.z=-m.z,m.o=-.25*D))}else D||(m.h=!0)});M.sort(Ya);Ua(X)}function b(p,q,x){A(q.stack,P);G(q.stack,-1.5,0,u.d/
2+u.c+.5);da(q.stack,ea);G(q.stack,0,0,Ba);x(p,q);q.stack.pop();q.stack.pop();q.stack.pop()}function c(p,q){const x=q.stack;I(Fa,q);N(Fa,"main",0);I(Ga,q);N(Ga,"main",0);G(x,U,0,0);I(E,q);N(E,V?"left":"right",Math.floor(R*(w-J)));x.pop();Va(q,X);I(Ha,q);M.forEach(t=>{t.h||(G(x,t.x,t.y,t.z),da(x,(0<=t.i?Math.PI:0)+Math.atan(t.o/t.i)),N(Ha,"fading",Math.floor(12*(w-t.startTime))),x.pop(),x.pop())})}function d(p,q){p.bindFramebuffer(p.FRAMEBUFFER,null);p.viewport(0,0,v,y);p.disable(p.BLEND);p.clearColor(0,
0,0,1);p.clear(p.COLOR_BUFFER_BIT|p.DEPTH_BUFFER_BIT);p.activeTexture(p.TEXTURE1);Q.b.bindTexture();p.uniform1i(q.l.lighting,1);p.activeTexture(p.TEXTURE0);b(p,q,c)}function e(){{const p=(Date.now()-db)/1E3;C=p-X.U;w=X.U=p;fa=-1===fa?60:1/C/16+.9375*fa;h.innerHTML=`fps=${Math.round(fa)}`}Ja(k)%2&&(n=!n);!na&&Ia(k,"fullscreen")&&(na=f.requestFullscreen());a();Oa(Q,{qa:b,va:w,pa:M,na:n});sa(B,d);requestAnimationFrame(e)}const h=document.getElementById("fps"),f=document.getElementById("canvas");var g=
window.getComputedStyle(f);const k=new La(document.body);Z(k,"left",["a","ArrowLeft"]);Z(k,"right",["d","ArrowRight"]);Z(k,"showLights",["l"]);Z(k,"attack",["f"," "]);Z(k,"fullscreen",["u"]);var l=parseInt(g.getPropertyValue("width"),10);g=parseInt(g.getPropertyValue("height"),10);let n=!1;const v=l,y=g;f.width=v;f.height=y;const P=new Float32Array([360/l,0,0,0,0,-360/g,.25,0,0,360/g,0,0,-1,-1,0,1]),r=f.getContext("webgl2",{antialias:!1,alpha:!1});r.enable(r.DEPTH_TEST);r.depthFunc(r.LEQUAL);l=new ja({a:r,
type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec4 v_clipSpace;\nout vec2 v_texturePosition;\n\nvoid main() {\n    vec4 position = u_projection * vec4(a_position, 1);\n    float variance = 1.f / (position.z + 1.f);\n\n    vec4 result = vec4(position.x, position.y * variance, -.5f * (position.z - 1.f) * variance, position.w * variance);\n    gl_Position = result;\n    \n    v_clipSpace = result;\n    v_texturePosition = a_texturePosition;\n}");
g=new ja({a:r,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform sampler2D u_lighting;\n\nin vec2 v_texturePosition;\nin vec4 v_clipSpace;\nout vec4 output_color;\n\nvoid main() {\n    vec4 clipSpace = vec4(.5f * (v_clipSpace.x + 1.f), -.5f * (v_clipSpace.y - 1.f), v_clipSpace.z, v_clipSpace.w);\n\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    if (color.a == 0.0) {\n        discard;\n    }\n\n    vec4 light = texture(u_lighting, clipSpace.xy);\n    vec3 math = min(light.xyz + color.xyz * light.a, vec3(1.f, 1.f, 1.f));\n    output_color = vec4(math, color.a);\n}");
const B=new ra({a:r,T:"projection"});ka(B,l,g).link();const Q=new Qa(r,v,y,360),z=new AudioContext,[Y,ha,oa,pa,qa,Ca,$a,eb]=await Promise.all([H({a:r,src:"assets/Back Wall.png",name:"wall"}),H({a:r,src:"assets/new floor Floor.png",name:"floor"}),H({a:r,src:"assets/Hero Breathing with axe.png",name:"idle"}),H({a:r,src:"assets/Hero Walking with axe.png",name:"walk"}),H({a:r,src:"assets/Axe Chop.png",name:"attack"}),Promise.all([Za(z,"assets/Grunt1.mp3"),Za(z,"assets/Grunt2.mp3"),Za(z,"assets/Grunt3.mp3")]),
Za(z,"assets/Theres something here.mp3"),Sa((p,q)=>H({a:r,name:p,src:q}))]);let K=null;const u={top:52/ha.c,w:ha.w/360,c:38/360,d:166/360,aa:218/ha.c},Fa=new O(Y,{main:[[Y.w/360,-u.d/2,Y.c/360,1,0,Y.w/360,-u.d/2,0,1,1,0,-u.d/2,Y.c/360,0,0,0,-u.d/2,0,0,1]]}),Ga=new O(ha,{main:[[u.w,u.d/2,-u.c,1,1,0,u.d/2,-u.c,0,1,u.w,u.d/2,0,1,u.aa,0,u.d/2,0,0,u.aa,u.w,-u.d/2,0,1,u.top,0,-u.d/2,0,0,u.top]]});l=220/405;const ab=1.125*(387/405-l),ma=new O(oa,{right:S({D:l,B:405,u:434,A:oa,v:360,g:5,count:16}),left:S({D:1-
l,B:405,u:434,A:oa,v:360,g:5,count:16,j:!0})}),Da=new O(pa,{right:S({D:258/424,B:424,u:442,A:pa,v:360,g:2,count:8}),left:S({D:1-258/424,B:424,u:442,A:pa,v:360,g:2,count:8,j:!0})}),la=new O(qa,{right:S({D:284/644,B:644,u:565,A:qa,v:360,g:3,count:5}),left:S({D:1-284/644,B:644,u:565,A:qa,v:360,g:3,count:5,j:!0})});new O(Q.b,{main:[ya({width:2,height:1,ha:0,ia:0,fa:1,ga:1})]});const X={ea:{ba:eb},O:[],U:0},Ha=Xa(r),M=[];let db=Date.now(),w=0,fa=-1,C=0,U=4,T=0,V=!1,J=0,E=ma,R=12,na=null;document.addEventListener("fullscreenchange",
()=>{document.fullscreenElement||(na=null)});X.O.push(new Ta(U+2,0,.4));let ea,Aa,za,Ba;requestAnimationFrame(e);f.onmousemove=()=>{}};
