'use strict';class ba{constructor(b,a,c){this.name=c;this.o=`${a}${c}`;switch(b){case "uniform":this.type=1;if("u_"!==a)throw Error(`uniform field "${this.o}" invalid, must start with u_`);break;case "in":this.type=2;if("a_"!==a)throw Error(`in field "${this.o}" invalid, must start with a_`);break;default:throw Error("Impossible");}}}function ca(b){const a=[];b.split("\n").forEach(c=>{(c=/^\s*(in|uniform)\s(?:\w+\s)*([ua]_)(\w+);/.exec(c))&&a.push(new ba(c[1],c[2],c[3]))});return a}
const da=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);function x(b,a){b.a.uniformMatrix4fv(b.c,!1,a);b.b.push(a)}function y(b,a,c,d=0){var e=b.b;e=e.length?e[e.length-1]:da;x(b,new Float32Array([e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],e[11],a*e[0]+c*e[4]+d*e[8]+e[12],a*e[1]+c*e[5]+d*e[9]+e[13],a*e[2]+c*e[6]+d*e[10]+e[14],a*e[3]+c*e[7]+d*e[11]+e[15]]))}
function ea(b,a){var c=Math.cos(a);a=Math.sin(a);c=new Float32Array([c,0,a,0,0,1,0,0,-a,0,c,0,0,0,0,1]);a=b.b;0===a.length?x(b,c):(a=a[a.length-1],x(b,new Float32Array([c[0]*a[0]+c[1]*a[4]+c[2]*a[8]+c[3]*a[12],c[0]*a[1]+c[1]*a[5]+c[2]*a[9]+c[3]*a[13],c[0]*a[2]+c[1]*a[6]+c[2]*a[10]+c[3]*a[14],c[0]*a[3]+c[1]*a[7]+c[2]*a[11]+c[3]*a[15],c[4]*a[0]+c[5]*a[4]+c[6]*a[8]+c[7]*a[12],c[4]*a[1]+c[5]*a[5]+c[6]*a[9]+c[7]*a[13],c[4]*a[2]+c[5]*a[6]+c[6]*a[10]+c[7]*a[14],c[4]*a[3]+c[5]*a[7]+c[6]*a[11]+c[7]*a[15],
c[8]*a[0]+c[9]*a[4]+c[10]*a[8]+c[11]*a[12],c[8]*a[1]+c[9]*a[5]+c[10]*a[9]+c[11]*a[13],c[8]*a[2]+c[9]*a[6]+c[10]*a[10]+c[11]*a[14],c[8]*a[3]+c[9]*a[7]+c[10]*a[11]+c[11]*a[15],c[12]*a[0]+c[13]*a[4]+c[14]*a[8]+c[15]*a[12],c[12]*a[1]+c[13]*a[5]+c[14]*a[9]+c[15]*a[13],c[12]*a[2]+c[13]*a[6]+c[14]*a[10]+c[15]*a[14],c[12]*a[3]+c[13]*a[7]+c[14]*a[11]+c[15]*a[15]])))}class fa{constructor(b,a){this.a=b;this.c=a;this.b=[];b.uniformMatrix4fv(a,!1,da)}pop(){return this.b.pop()}}
class z{constructor(b,a){this.name=b.name;var c=this.a=b.a;b=this.type=b.type;switch(b){case "vertex":var d=this.a.VERTEX_SHADER;break;case "fragment":d=this.a.FRAGMENT_SHADER;break;default:throw Error(`Unrecognized shader type "${b}"`);}d=this.b=c.createShader(d);c.shaderSource(d,a);c.compileShader(d);if(!c.getShaderParameter(d,c.COMPILE_STATUS))throw a=`Failed to compile ${this.name} ${b}-shader: ${c.getShaderInfoLog(d)}`,c.deleteShader(d),Error(a);this.V=ca(a)}}
function ha(b,...a){const c=b.a,d=b.H;a.forEach(e=>{b.L.push(e);c.attachShader(d,e.b)});return b}class ia{constructor(b){this.name=b.name;this.C=b.C;b=this.a=b.a;this.b=!1;this.H=b.createProgram();this.L=[];this.j={};this.l={};this.stack=null}link(){if(this.b)return this;var b=this.a,a=this.H;b.linkProgram(a);if(!b.getProgramParameter(a,b.LINK_STATUS)){var c=`Failed to link ${this.name} program: ${b.getProgramInfoLog(a)}`;b.deleteProgram(a);throw Error(c);}this.b=!0;return this}}
function ja(b,a){var c=b.a,d=b.H;c.useProgram(d);for(var e={},g={},h=b.L,f=0;f<h.length;f++)for(var n=h[f].V,p=0;p<n.length;p++){var q=n[p];1===q.type?q.o in e||(e[q.name]=c.getUniformLocation(d,q.o)):q.o in g||(g[q.name]=c.getAttribLocation(d,q.o))}b.j=e;b.l=g;if(d=b.C)if(d in b.j)b.stack=new fa(c,b.j[d]);else throw Error(`No anchor point "${d}" in program`);try{a(c,b)}finally{b.j={},b.l={},b.stack=null}}
class B{constructor(b,a,c,d,e){this.a=b;this.name=a;this.w=c;this.f=d;this.b=e(b)}bindTexture(){this.a.bindTexture(this.a.TEXTURE_2D,this.b)}}function G(b){return(new Promise((a,c)=>{const d=new Image;d.onload=()=>void a(d);d.onerror=()=>{c(Error(`failed to load ${b.src}`))};d.mode="no-cors";d.src=b.src})).then(a=>{const c=a.naturalWidth,d=a.naturalHeight;return new B(b.a,b.name,c,d,ka(e=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,c,d,0,e.RGBA,e.UNSIGNED_BYTE,a)}))})}
function la(b){const a=b.width,c=b.height;return new B(b.a,b.name,a,c,ka(d=>{d.texImage2D(d.TEXTURE_2D,0,d.RGBA,a,c,0,d.RGBA,d.UNSIGNED_BYTE,b.M,0)}))}function Aa(b){return new B(b.a,b.name,b.width,b.height,()=>b.ba)}
function ka(b){return a=>{const c=a.createTexture();a.bindTexture(a.TEXTURE_2D,c);b(a);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.NEAREST);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.NEAREST);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);a.bindTexture(a.TEXTURE_2D,null);return c}};function I(b,a){const c=b.b.a;let d=b.c;null!=d?c.bindBuffer(c.ARRAY_BUFFER,d):(b.c=d=c.createBuffer(),c.bindBuffer(c.ARRAY_BUFFER,d),c.bufferData(c.ARRAY_BUFFER,b.I,c.STATIC_DRAW));c.activeTexture(c.TEXTURE0);b.b.bindTexture();c.uniform1i(a.j.texture,0);c.enableVertexAttribArray(a.l.texturePosition);c.vertexAttribPointer(a.l.texturePosition,2,c.FLOAT,!1,20,12);c.enableVertexAttribArray(a.l.position);c.vertexAttribPointer(a.l.position,3,c.FLOAT,!1,20,0)}
function J(b,a,c){if(!b.data.hasOwnProperty(a))throw Error(`Can not render unknown "${a}"`);a=b.data[a];b=b.b.a;const d=a.W;b.drawArrays(b.TRIANGLE_STRIP,d[c%d.length],a.Z)}
class K{constructor(b,a){this.b=b;this.c=null;b=this.data={};const c=[];let d=0;for(const e in a){const g=a[e],h=[],f=g.length;if(0===f)throw Error("Sprite declared with 0 points");const n=g[0].length;if(0==n)throw Error("Sprite declared with list of length 5 (must be non-zero multiple of 5)");const p=n/5;for(let q=0;q<f;q++){const u=g[q];if(u.length!==n)throw Error("Sprite declared with inconsistent lengths of elements");h.push(d);c.push.apply(c,u);d+=p}b[e]={ea:this,name:e,W:h,Z:p}}this.I=new Float32Array(c)}}
;function L(b,a,c){b=b.c;null!=c?b.set(a,c):b.delete(a)}function Ba(b,a){a=b.c.get(a);const c=b.b;return!!a&&!!a.some(d=>(d=c.get(d))?(d.v=0,null!=d.B):!1)}function Ca(b){const a=b.c.get("showLights");if(a){const c=b.b;return a.reduce((d,e)=>(e=c.get(e))?(d+=e.v,e.v=0,d):d,0)}return 0}function Da(b){const a=Ba(b,"left")?1:0;return(Ba(b,"right")?1:0)-a}
class Ea{constructor(b){this.b=new Map;this.c=new Map;b.addEventListener("keydown",a=>{Fa(this,a,!0)});b.addEventListener("keyup",a=>{Fa(this,a,!1)});b.onblur=()=>{this.b.clear()};b.onfocus=()=>{this.b.clear()}}}function Fa(b,a,c){a=a.key;b=b.b;const d=b.get(a);c?null==d?b.set(a,{B:Date.now(),v:1}):(null==d.B&&(d.B=Date.now()),d.v++):null!=d&&(d.B=null)};const S=166/360/2;function Ga(b,a){const c=b.c.a,d=b.b;c.enable(c.BLEND);c.blendFunc(c.ONE,c.ONE);c.bindFramebuffer(c.FRAMEBUFFER,b.X);c.viewport(0,0,d.w,d.f);ja(b.c,(e,g)=>{Ha(e,g,b,a)})}
class Ia{constructor(b,a,c,d){a/=4;c/=4;var e=new z({a:b,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec2 v_texturePosition;\n\nvoid main() {\n    vec4 position = u_projection * vec4(a_position, 1);\n    float variance = 1.f / (position.z + 1.f);\n\n    vec4 result = vec4(position.x, -position.y * variance, -.5f * (position.z - 1.f) * variance, position.w * variance);\n    gl_Position = result;\n    v_texturePosition = a_texturePosition;\n}"),g=
new z({a:b,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform float u_threshold;\n\nin vec2 v_texturePosition;\nout vec4 output_color;\n\nvoid main() {\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    color.a -= u_threshold;\n    if (color.a <= u_threshold) {\n        discard;\n    }\n    output_color = color;\n}");const h=new ia({a:b,C:"projection"});ha(h,e,g).link();e=b.createTexture();b.bindTexture(b.TEXTURE_2D,e);b.texImage2D(b.TEXTURE_2D,
0,b.RGBA,a,c,0,b.RGBA,b.UNSIGNED_BYTE,null);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.LINEAR);b.texParameteri(b.TEXTURE_2D,b.da,b.LINEAR);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);g=b.createFramebuffer();b.bindFramebuffer(b.FRAMEBUFFER,g);b.framebufferTexture2D(b.FRAMEBUFFER,b.COLOR_ATTACHMENT0,b.TEXTURE_2D,e,0);b.bindFramebuffer(b.FRAMEBUFFER,null);const f=128/d;d=la({name:"fade",width:64,height:64,a:b,
M:Ja(d)});this.c=h;this.b=Aa({ba:e,name:"lighting",width:a,height:c,a:b});this.X=g;this.I=new K(d,{main:[[f,0,-f,1,0,f,0,f,1,1,-f,0,-f,0,0,-f,0,f,0,1]]})}}function Ha(b,a,c,d){d.Y?b.clearColor(0,0,0,1):b.clearColor(0,0,0,.2);b.clear(b.COLOR_BUFFER_BIT|b.DEPTH_BUFFER_BIT);d.aa(b,a,()=>{const e=c.I;I(e,a);const g=a.j.threshold,h=d.ca;d.$.forEach(f=>{if(!f.h){var n=f.startTime;n=(h-n)/(f.O-n);b.uniform1f(g,.5*n*n);y(a.stack,f.x,f.y,f.z);J(e,"main",0);a.stack.pop()}})})}
function Ja(b){const a=new Uint8Array(16384),c=(g,h)=>{g/=b;h/=b;return g*g+h*h},d=Math.min(c(32,0),c(32,0));for(let g=0;64>g;g++)for(let h=0;64>h;h++){const f=4*(64*g+h);var e=c(h-32,g-32);const n=1-Math.sqrt(e/d);e=1E-4>=e?5:0;const p=Math.max(Math.round(255*n*n),0);a[f]=e+Math.max(Math.round(20*n),0);a[f+1]=e;a[f+2]=e;a[f+3]=p}return a};function T({G:b=0,fa:a=0,ga:c=0,F:d,A:e,D:g,g:h,count:f,s:n=!1}){const p=d/360,q=e/360;return U({x:b*p,y:a,z:c*q,width:p,height:q,K:d/g.w,J:e/g.f,g:h,count:f,s:n})}function U({x:b=0,y:a=0,z:c=0,width:d,height:e,K:g,J:h,g:f,count:n,s:p=!1}){const q=[];for(let u=0;u<n;u++){const C=Math.floor(u/f),D=u%f;q.push(Ka({x:b,y:a,z:c,width:d,height:e,T:D*g,R:(D+1)*g,U:C*h,S:(C+1)*h,s:p}))}return q}
function Ka({x:b=0,y:a=0,z:c=0,width:d,height:e,T:g,U:h,R:f,S:n,s:p=!1}){p?p=f:(p=g,g=f);return[d-b,a,-c,g,n,-b,a,-c,p,n,d-b,a,e-c,g,h,-b,a,e-c,p,h]}
function La(b){const a=1/18/18,c=g=>Math.max(0,Math.min(255,Math.round(256*(1-a*g*g)))),d=[];for(let g=0;2>g;g++)for(let h=0;18>h;h++)for(let f=0;2>f;f++){let n;var e=void 0;let p;e=h+6*f;18>e?(n=255,e=c(e),p=255):p=e=n=0;c(h+6*f);c(h+6*f+1);for(let q=0;2>q;q++)d.push(n,e,e,p)}b=la({name:"spark",width:72,height:2,a:b,M:new Uint8Array(d)});return new K(b,{fading:U({x:1/180,width:.04,height:2/180,K:1/18,J:1,g:18,count:18})})}function Ma(b,a){return b.h?a.h?0:1:a.h?-1:b.y-a.y}
window.onload=async function(){function b(){var l=Date.now();const m=(l-ma)/1E3;ma=l;V=1/m/16+.9375*V;g.innerHTML=`fps=${Math.round(V)}`;const t=(l-Na)/1E3;l=Math.sin(Math.PI*(v+0)/8)/2+Math.sin(Math.PI*(v+0)/3)/8;var M=Math.sin(Math.PI*(v+170)/8)/2+Math.sin(Math.PI*(v+130)/3)/8;N=Math.asin((l-M)/100);na=Math.cos(N);oa=Math.sin(N);pa=(l+M)/2;l=1.2*Da(n);E=l*m;0!==E&&(W+=E,O=0>E);M=Math.floor(48*t)-Math.floor(48*v);for(let k=0;k<M;k++){var P=Math.PI/4*(Math.random()-.5)+Math.PI/2;const w=2*Math.random()+
1.4,F=W+(Oa-(E?.05:0))*(O?-1:1),Q=328/360,Pa=w*Math.sin(P);P=w*Math.cos(P)+l;100<A.length&&A.pop();A.push({h:!1,x:F,y:0,z:Q,i:P,u:.1*Math.sin(2*Math.PI*Math.random()),m:Pa,startTime:t,O:t+1.5,P:!1})}const qa=1-.8*m;A.forEach(k=>{var w=k.h;if(!w&&t<k.O){w=k.m;k.P?(k.i*=qa,k.u*=qa):(w-=9.8*na*m,k.i-=9.8*oa*m,k.m=w);k.x+=k.i*m;k.y+=k.u*m;k.z+=k.m*m;const F=k.y;if(F<-S||F>S){const Q=0<F?S:-S;k.y=Q+(Q-F);k.u=-k.u}0>k.z&&(-.01<w?(k.z=180,k.m=0,k.P=!0):(k.z=-k.z,k.m=-.25*w))}else w||(k.h=!0)});A.sort(Ma);
v=t}function a(l,m,t){x(m.stack,Qa);y(m.stack,-1.5,0,r.d/2+r.f+.5);ea(m.stack,N);y(m.stack,0,0,pa);t(l,m);m.stack.pop();m.stack.pop();m.stack.pop()}function c(l,m){I(ra,m);J(ra,"main",0);I(sa,m);J(sa,"main",0);y(m.stack,W,0,0);0===E?(I(ta,m),J(ta,O?"left":"right",Math.floor(12*v))):(I(ua,m),J(ua,O?"left":"right",Math.floor(8*v)));m.stack.pop();I(va,m);A.forEach(t=>{t.h||(y(m.stack,t.x,t.y,t.z),ea(m.stack,(0<=t.i?Math.PI:0)+Math.atan(t.m/t.i)),J(va,"fading",Math.floor(12*(v-t.startTime))),m.stack.pop(),
m.stack.pop())})}function d(l,m){l.bindFramebuffer(l.FRAMEBUFFER,null);l.viewport(0,0,C,D);l.disable(l.BLEND);l.clearColor(0,0,0,1);l.clear(l.COLOR_BUFFER_BIT|l.DEPTH_BUFFER_BIT);l.activeTexture(l.TEXTURE1);X.b.bindTexture();l.uniform1i(m.j.lighting,1);l.activeTexture(l.TEXTURE0);a(l,m,c);y(m.stack,wa/180,0,(q-xa)/180);l=Math.floor(8*v)%38;I(ya,m);J(ya,"blink",6>l?l:0)}function e(){Ca(n)%2&&(u=!u);b();Ga(X,{aa:a,ca:v,$:A,Y:u});ja(za,d);requestAnimationFrame(e)}const g=document.getElementById("fps"),
h=document.getElementById("canvas");var f=window.getComputedStyle(h);const n=new Ea(document.body);L(n,"left",["a","ArrowLeft"]);L(n,"right",["d","ArrowRight"]);L(n,"showLights",["l"]);var p=parseInt(f.getPropertyValue("width"),10);let q=parseInt(f.getPropertyValue("height"),10),u=!1;const C=p,D=q;h.width=C;h.height=D;const Qa=new Float32Array([360/p,0,0,0,0,-360/q,.25,0,0,360/q,0,0,-1,-1,0,1]);f=h.getContext("webgl2",{antialias:!1,alpha:!1});f.enable(f.DEPTH_TEST);f.depthFunc(f.LEQUAL);p=new z({a:f,
type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec4 v_clipSpace;\nout vec2 v_texturePosition;\n\nvoid main() {\n    vec4 position = u_projection * vec4(a_position, 1);\n    float variance = 1.f / (position.z + 1.f);\n\n    vec4 result = vec4(position.x, position.y * variance, -.5f * (position.z - 1.f) * variance, position.w * variance);\n    gl_Position = result;\n    \n    v_clipSpace = result;\n    v_texturePosition = a_texturePosition;\n}");
const Ra=new z({a:f,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform sampler2D u_lighting;\n\nin vec2 v_texturePosition;\nin vec4 v_clipSpace;\nout vec4 output_color;\n\nvoid main() {\n    vec4 clipSpace = vec4(.5f * (v_clipSpace.x + 1.f), -.5f * (v_clipSpace.y - 1.f), v_clipSpace.z, v_clipSpace.w);\n\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    if (color.a == 0.0) {\n        discard;\n    }\n\n    vec4 light = texture(u_lighting, clipSpace.xy);\n    output_color = vec4(\n      min(1.f, light.x + color.x * light.a),\n      min(1.f, light.y + color.y * light.a),\n      min(1.f, light.z + color.z * light.a),\n      color.a\n    );\n}"),
za=new ia({a:f,C:"projection"});ha(za,p,Ra).link();const X=new Ia(f,C,D,360),[H,R,Y,Z,aa]=await Promise.all([G({a:f,src:"assets/Back Wall.png",name:"wall"}),G({a:f,src:"assets/new floor Floor.png",name:"floor"}),G({a:f,src:"assets/Hero Breathing with axe.png",name:"idle"}),G({a:f,src:"assets/Enemy.png",name:"enemy"}),G({a:f,src:"assets/Hero Walking with axe.png",name:"walk"})]),r={top:52/R.f,w:R.w/360,f:38/360,d:166/360,N:218/R.f},ra=new K(H,{main:[[H.w/360,-r.d/2,H.f/360,1,0,H.w/360,-r.d/2,0,1,1,
0,-r.d/2,H.f/360,0,0,0,-r.d/2,0,0,1]]}),sa=new K(R,{main:[[r.w,r.d/2,-r.f,1,1,0,r.d/2,-r.f,0,1,r.w,r.d/2,0,1,r.N,0,r.d/2,0,0,r.N,r.w,-r.d/2,0,1,r.top,0,-r.d/2,0,0,r.top]]});p=220/405;const Oa=1.125*(387/405-p),ta=new K(Y,{right:T({G:p,F:405,A:434,D:Y,g:5,count:16}),left:T({G:1-p,F:405,A:434,D:Y,g:5,count:16,s:!0})}),ua=new K(aa,{right:T({G:258/424,F:424,A:442,D:aa,g:2,count:8}),left:T({G:1-258/424,F:424,A:442,D:aa,g:2,count:8,s:!0})}),ya=new K(Z,{blink:U({x:.15,width:.3,height:.3,K:108/Z.w,J:108/
Z.f,g:2,count:6})});new K(X.b,{main:[Ka({width:2,height:1,T:0,U:0,R:1,S:1})]});const va=La(f);let wa=0,xa=0;const A=[];let Na=Date.now(),ma=Date.now(),v=0,V=0,W=4,E=0,O=!1,N,oa,na,pa;requestAnimationFrame(e);h.onmousemove=l=>{wa=l.offsetX;xa=l.offsetY}};
