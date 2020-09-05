'use strict';class aa{constructor(a,b,c){this.name=c;this.G=`${b}${c}`;switch(a){case "uniform":this.type=1;if("u_"!==b)throw Error(`uniform field "${this.G}" invalid, must start with u_`);break;case "in":this.type=2;if("a_"!==b)throw Error(`in field "${this.G}" invalid, must start with a_`);break;default:throw Error("Impossible");}}}function ba(a){const b=[];a.split("\n").forEach(c=>{(c=/^\s*(in|uniform)\s(?:\w+\s)*([ua]_)(\w+);/.exec(c))&&b.push(new aa(c[1],c[2],c[3]))});return b}
const ja=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);function ka(a,b){a.b.uniformMatrix4fv(a.i,!1,b);a.a.push(b)}function G(a,b,c,e=0){var d=a.a;d=d.length?d[d.length-1]:ja;ka(a,new Float32Array([d[0],d[1],d[2],d[3],d[4],d[5],d[6],d[7],d[8],d[9],d[10],d[11],b*d[0]+c*d[4]+e*d[8]+d[12],b*d[1]+c*d[5]+e*d[9]+d[13],b*d[2]+c*d[6]+e*d[10]+d[14],b*d[3]+c*d[7]+e*d[11]+d[15]]))}function H(a,b){const c=Math.cos(b);b=Math.sin(b);a.push(new Float32Array([c,0,b,0,0,1,0,0,-b,0,c,0,0,0,0,1]))}
class la{constructor(a,b){this.b=a;this.i=b;this.a=[];a.uniformMatrix4fv(b,!1,ja)}pop(){return this.a.pop()}push(a){var b=this.a;0===b.length?ka(this,a):(b=b[b.length-1],ka(this,new Float32Array([a[0]*b[0]+a[1]*b[4]+a[2]*b[8]+a[3]*b[12],a[0]*b[1]+a[1]*b[5]+a[2]*b[9]+a[3]*b[13],a[0]*b[2]+a[1]*b[6]+a[2]*b[10]+a[3]*b[14],a[0]*b[3]+a[1]*b[7]+a[2]*b[11]+a[3]*b[15],a[4]*b[0]+a[5]*b[4]+a[6]*b[8]+a[7]*b[12],a[4]*b[1]+a[5]*b[5]+a[6]*b[9]+a[7]*b[13],a[4]*b[2]+a[5]*b[6]+a[6]*b[10]+a[7]*b[14],a[4]*b[3]+a[5]*
b[7]+a[6]*b[11]+a[7]*b[15],a[8]*b[0]+a[9]*b[4]+a[10]*b[8]+a[11]*b[12],a[8]*b[1]+a[9]*b[5]+a[10]*b[9]+a[11]*b[13],a[8]*b[2]+a[9]*b[6]+a[10]*b[10]+a[11]*b[14],a[8]*b[3]+a[9]*b[7]+a[10]*b[11]+a[11]*b[15],a[12]*b[0]+a[13]*b[4]+a[14]*b[8]+a[15]*b[12],a[12]*b[1]+a[13]*b[5]+a[14]*b[9]+a[15]*b[13],a[12]*b[2]+a[13]*b[6]+a[14]*b[10]+a[15]*b[14],a[12]*b[3]+a[13]*b[7]+a[14]*b[11]+a[15]*b[15]])))}}
class M{constructor(a,b){this.name=a.name;var c=this.b=a.b;a=this.type=a.type;switch(a){case "vertex":var e=this.b.VERTEX_SHADER;break;case "fragment":e=this.b.FRAGMENT_SHADER;break;default:throw Error(`Unrecognized shader type "${a}"`);}e=this.a=c.createShader(e);c.shaderSource(e,b);c.compileShader(e);if(!c.getShaderParameter(e,c.COMPILE_STATUS))throw b=`Failed to compile ${this.name} ${a}-shader: ${c.getShaderInfoLog(e)}`,c.deleteShader(e),Error(b);this.Aa=ba(b)}}
function ma(a,...b){const c=a.b,e=a.ba;b.forEach(d=>{a.ma.push(d);c.attachShader(e,d.a)});return a}class na{constructor(a){this.name=a.name;this.X=a.X;a=this.b=a.b;this.a=!1;this.ba=a.createProgram();this.ma=[];this.A={};this.C={};this.stack=null}link(){if(this.a)return this;var a=this.b,b=this.ba;a.linkProgram(b);if(!a.getProgramParameter(b,a.LINK_STATUS)){var c=`Failed to link ${this.name} program: ${a.getProgramInfoLog(b)}`;a.deleteProgram(b);throw Error(c);}this.a=!0;return this}}
function oa(a,b){var c=a.b,e=a.ba;c.useProgram(e);for(var d={},g={},l=a.ma,f=0;f<l.length;f++)for(var h=l[f].Aa,k=0;k<h.length;k++){var p=h[k];1===p.type?p.G in d||(d[p.name]=c.getUniformLocation(e,p.G)):p.G in g||(g[p.name]=c.getAttribLocation(e,p.G))}a.A=d;a.C=g;if(e=a.X)if(e in a.A)a.stack=new la(c,a.A[e]);else throw Error(`No anchor point "${e}" in program`);try{b(c,a)}finally{a.A={},a.C={},a.stack=null}}
class pa{constructor(a,b,c,e,d){this.b=a;this.name=b;this.w=c;this.j=e;this.a=d(a)}bindTexture(){this.b.bindTexture(this.b.TEXTURE_2D,this.a)}}function ta(a){return(new Promise((b,c)=>{const e=new Image;e.onload=()=>void b(e);e.onerror=()=>{c(Error(`failed to load ${a.src}`))};e.mode="no-cors";e.src=a.src})).then(b=>{const c=b.naturalWidth,e=b.naturalHeight;return new pa(a.b,a.name,c,e,ua(d=>{d.texImage2D(d.TEXTURE_2D,0,d.RGBA,c,e,0,d.RGBA,d.UNSIGNED_BYTE,b)}))})}
function va(a){const b=a.width,c=a.height;return new pa(a.b,a.name,b,c,ua(e=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,b,c,0,e.RGBA,e.UNSIGNED_BYTE,a.na,0)}))}function wa(a){return new pa(a.b,a.name,a.width,a.height,()=>a.L)}
function ua(a){return b=>{const c=b.createTexture();b.bindTexture(b.TEXTURE_2D,c);a(b);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);b.bindTexture(b.TEXTURE_2D,null);return c}};function N(a,b){const c=a.a.b;let e=a.i;null!=e?c.bindBuffer(c.ARRAY_BUFFER,e):(a.i=e=c.createBuffer(),c.bindBuffer(c.ARRAY_BUFFER,e),c.bufferData(c.ARRAY_BUFFER,a.F,c.STATIC_DRAW));c.activeTexture(c.TEXTURE0);a.a.bindTexture();c.uniform1i(b.A.texture,0);c.enableVertexAttribArray(b.C.texturePosition);c.vertexAttribPointer(b.C.texturePosition,2,c.FLOAT,!1,20,12);c.enableVertexAttribArray(b.C.position);c.vertexAttribPointer(b.C.position,3,c.FLOAT,!1,20,0)}
function O(a,b,c){if(!a.data.hasOwnProperty(b))throw Error(`Can not render unknown "${b}"`);b=a.data[b];a=a.a.b;const e=b.ca;a.drawArrays(a.TRIANGLE_STRIP,e[c%e.length],b.Pa)}
class R{constructor(a,b){this.a=a;this.i=null;a=this.data={};const c=[];let e=0;for(const d in b){const g=b[d],l=[],f=g.length;if(0===f)throw Error("Sprite declared with 0 points");const h=g[0].length;if(0==h)throw Error("Sprite declared with list of length 5 (must be non-zero multiple of 5)");const k=h/5;for(let p=0;p<f;p++){const r=g[p];if(r.length!==h)throw Error("Sprite declared with inconsistent lengths of elements");l.push(e);c.push.apply(c,r);e+=k}a[d]={bb:this,name:d,ca:l,Pa:k}}this.F=new Float32Array(c)}}
function xa(a,b){for(var c=a.B;-1!==c&&c<=b;){c=a.F;const e=a.a+1;e===c.length?a.i===a.Ma?a.B=c=-1:(a.i++,a.a=0,a.B=c=b+c[0]):(a.a=e,a.B=c=b+c[e])}}function U(a,b,c){if(!a.Ka.includes(b))throw Error(`${a} does not have mode ${b}`);a.i=0;a.aa=b;a.a=0;a.B=c+a.F[0]}function ya(a,b){const c=a.aa;if(null==c)throw Error(`${a} tried rendering while inactive`);N(a.qa,b);O(a.qa,c,a.a)}
class za{constructor(a,b){const c=a.v;this.R=a.name;this.Ka=a.U;this.aa=null;this.Ma="number"===typeof c?c:c?-1:0;this.qa=a.set;this.F=b;this.i=0;this.B=this.a=-1;this.Ja=a.Ra}P(){const a=this.Ja;return null!=a?a[this.a]:void 0}name(){return this.R}toString(){return`Sprite/${this.R}`}}
function Aa(a){const b=a.name,c=a.u,e=a.set.data;let d=-1;a.U.forEach(l=>{const f=e[l];if(!f)throw Error(`Sprite/${b} has non-existent mode ${l}`);if(-1===d)d=f.ca.length;else if(d!==f.ca.length)throw Error(`Sprite/${b} has inconsistent frame counts`);});if(-1===d)throw Error(`Sprite/${b} given 0 modes`);if("number"!==typeof c&&c.length!==d)throw Error(`Sprite/${b} given ${c.length} frame times for ${d} frames`);if(a.P&&a.P.length!==d)throw Error(`Sprite/${b} given ${a.P.length} frame data points for ${d} frames`);
const g="number"===typeof c?Array(d).fill(c):c;return()=>new za(a,g)}function W({x:a=0,y:b=0,z:c=0,width:e,height:d,$:g,Z:l,V:f,count:h,gb:k=0,hb:p=0,ib:r=g,fb:x=l,K:v=!1}){const y=[];for(let t=0;t<h;t++){const u=k+t%f*r,J=p+Math.floor(t/f)*x;y.push(Ba({x:a,y:b,z:c,width:e,height:d,Xa:u,Va:u+g,Ya:J,Wa:J+l,K:v}))}return y}function Ba({x:a=0,y:b=0,z:c=0,width:e,height:d,Xa:g,Ya:l,Va:f,Wa:h,K:k=!1}){k?(k=f,f=a-e):(k=g,g=f,f=-a,a=e-a);return[a,b,-c,g,h,f,b,-c,k,h,a,b,d-c,g,l,f,b,d-c,k,l]};function X(a,b,c){a=a.i;null!=c?a.set(b,c):a.delete(b)}function Y(a,b){b=a.i.get(b);const c=a.a;return!!b&&!!b.some(e=>(e=c.get(e))?(e.N=0,null!=e.S):!1)}function Ca(a){const b=a.i.get("showLights");if(b){const c=a.a;return b.reduce((e,d)=>(d=c.get(d))?(e+=d.N,d.N=0,e):e,0)}return 0}function Oa(a,b,c){b=Y(a,b)?1:0;return(Y(a,c)?1:0)-b}
class Pa{constructor(a){this.a=new Map;this.i=new Map;a.addEventListener("keydown",b=>{Qa(this,b,!0)});a.addEventListener("keyup",b=>{Qa(this,b,!1)});a.onblur=()=>{this.a.clear()};a.onfocus=()=>{this.a.clear()}}}function Qa(a,b,c){b=b.key;a=a.a;const e=a.get(b);c?null==e?a.set(b,{S:Date.now(),N:1}):(null==e.S&&(e.S=Date.now()),e.N++):null!=e&&(e.S=null)};function Ra(a,b){const c=a.a.b,e=a.i;c.enable(c.BLEND);c.blendFunc(c.ONE,c.ONE);c.bindFramebuffer(c.FRAMEBUFFER,a.R);c.viewport(0,0,e.w,e.j);oa(a.a,(d,g)=>{Sa(d,g,a,b)})}
class Ta{constructor(a,b,c,e){b/=4;c/=4;var d=new M({b:a,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec2 v_texturePosition;\n\nvoid main() {\n  vec4 position = u_projection * vec4(a_position, 1);\n  // float inverse = 1.f / (1.f - position.z * .2f);\n\n  // vec4 result = vec4(position.x, -inverse * position.y * (1.f - .5f * position.z), inverse * position.z, inverse * position.w);\n  // gl_Position = result;\n  gl_Position = position;\n  \n  v_texturePosition = a_texturePosition;\n}"),g=
new M({b:a,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform float u_threshold;\n\nin vec2 v_texturePosition;\nout vec4 output_color;\n\nvoid main() {\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    color.a -= u_threshold;\n    if (color.a <= u_threshold) {\n        discard;\n    }\n    output_color = color;\n}");const l=new na({b:a,X:"projection"});ma(l,d,g).link();d=a.createTexture();a.bindTexture(a.TEXTURE_2D,d);a.texImage2D(a.TEXTURE_2D,
0,a.RGBA,b,c,0,a.RGBA,a.UNSIGNED_BYTE,null);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);g=a.createFramebuffer();a.bindFramebuffer(a.FRAMEBUFFER,g);a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,d,0);a.bindFramebuffer(a.FRAMEBUFFER,null);const f=128/e;e=va({name:"fade",width:64,height:64,b:a,na:Ua(e)});this.a=l;this.i=wa({L:d,name:"lighting",
width:b,height:c,b:a});this.R=g;this.F=new R(e,{main:[[f,0,-f,1,0,f,0,f,1,1,-f,0,-f,0,0,-f,0,f,0,1]]})}}function Sa(a,b,c,e){e.La?a.clearColor(0,0,0,1):a.clearColor(0,0,0,window.a);a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT);e.Sa(a,b,()=>{const d=c.F;N(d,b);const g=b.A.threshold,l=e.Za;e.Qa.forEach(f=>{if(!f.m){var h=f.startTime;h=(l-h)/(f.pa-h);a.uniform1f(g,.5*h*h);G(b.stack,f.x,f.y,f.z);O(d,"main",0);b.stack.pop()}})})}
function Ua(a){const b=new Uint8Array(16384),c=(g,l)=>{g/=a;l/=a;return g*g+l*l},e=Math.min(c(32,0),c(32,0));for(let g=0;64>g;g++)for(let l=0;64>l;l++){const f=4*(64*g+l);var d=c(l-32,g-32);const h=1-Math.sqrt(d/e);d=1E-4>=d?5:0;const k=Math.max(Math.round(255*h*h),0);b[f]=d+Math.max(Math.round(20*h),0);b[f+1]=d;b[f+2]=d;b[f+3]=k}return b};function Va(a,b){return 0<b?Math.atan(a/b):0===b?0<a?Math.PI/2:0===a?0:-Math.PI/2:Math.atan(a/b)+Math.PI};const Z=434/1.8;class Wa{constructor(a){this.l=a}}
async function Xa(a){const [b,c,e]=await Promise.all([a("hero_idle","assets/Hero Breathing with axe.png"),a("hero_walk","assets/Hero Walking with axe.png"),a("hero_attack","assets/Axe Chop.png")]);a=Ya({name:"hero_idle",L:b,ja:405,ea:434,ka:220,la:434,da:16,v:!0,u:1/12,O:[{g:388,h:104,c:385,f:170},{g:792,h:105,c:790,f:170},{g:1198,h:105,c:1195,f:169},{g:1602,h:106,c:1600,f:170},{g:2008,h:106,c:2005,f:172},{g:388,h:539,c:385,f:604},{g:794,h:540,c:790,f:605},{g:1196,h:539,c:1196,f:604},{g:1602,h:539,
c:1602,f:604},{g:2009,h:541,c:2007,f:604},{g:386,h:974,c:385,f:1036},{g:792,h:972,c:790,f:1033},{g:1198,h:974,c:1196,f:1038},{g:1602,h:972,c:1601,f:1036},{g:2010,h:974,c:2005,f:1044},{g:386,h:1406,c:385,f:1477}]})();const d=Ya({name:"hero_walk",L:c,ja:424,ea:444,ka:258,la:444,da:8,v:!0,u:.125,O:[{g:408,h:110,c:404,f:166},{g:830,h:110,c:829,f:166},{g:408,h:554,c:404,f:614},{g:830,h:554,c:829,f:614},{g:408,h:998,c:404,f:1055},{g:830,h:998,c:829,f:1055},{g:408,h:1444,c:404,f:1500},{g:830,h:1444,c:829,
f:1500}]})(),g=Ya({name:"hero_attack",L:e,ja:644,ea:565,ka:284,la:565,da:5,v:!1,u:1/12,O:[{g:422,h:285,c:415,f:353},{g:936,h:367,c:868,f:380},{g:1507,h:311,c:1469,f:318},{g:162,h:948,c:206,f:943},{g:1025,h:934,c:976,f:962}]})();return{Ia:a,$a:d,Ba:g}}
function Ya(a){var b=a.L;const c=a.ja,e=a.ea,d=a.ka,g=a.la,l=Math.floor(b.w/c),f={x:d/Z,z:(e-g)/Z,width:c/Z,height:e/Z,$:c/b.w,Z:e/b.j,V:l,count:a.da},h=a.O&&a.O.map(({g:k,h:p,c:r,f:x},v)=>({Ea:{x:(k-(v%l*c+d))/Z,z:(Math.floor(v/l)*e+g-p)/Z,angle:Va(-(p-x),k-r)}}));b=new R(b,{right:W(f),left:W({...f,K:!0})});return Aa({name:a.name,set:b,U:["left","right"],v:a.v,u:a.u,Ra:h})};function Za(a,b){var c=376/b;const e=c/(484/b),d=c/(268/b);c/=1.25;return{Oa:new Float32Array([b/a*c,0,0,0,0,0,1,d-e,0,c,0,0,0,0,0,(e+d)/2]),kb:e,jb:d}}async function $a(a){[a]=await Promise.all([a("wall","assets/Back Wall.png"),a("floor","assets/floor.png")]);const b=648/a.j;return{ab:new R(a,{main:[[20,.5,2.5,1,b,20,.5,0,1,1,0,.5,2.5,0,b,0,.5,0,0,1]]})}};function ab(a){return{Y:a.Y,M:[],o:a.o,H:a.H,I:a.I,ya:a.ya,ha:a.ha,T:a.T}};const bb=new Float32Array([-1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
async function cb(a){const [b,c,e]=await Promise.all([a("creature","assets/Enemy.png"),a("tentacle","assets/Tentacle.png"),a("creature_attack","assets/enemy_bite.png")]);var d=new R(b,{blink:W({x:.25,z:.25,width:.5,height:.5,$:108/b.w,Z:108/b.j,V:2,count:6,K:!0})});a=Aa({name:"creature_attack",set:new R(e,{bite:W({x:.5,z:.75,width:1,height:2,Z:530/e.j,$:278/e.w,V:7,count:42,K:!0})}),U:["bite"],v:!0,u:1/12});var g=Array(6).fill(.125);g[0]=4;d=Aa({name:"creature_normal",set:d,U:["blink"],v:!0,u:g});
g=[];var l=92,f=-22;const h=Math.sqrt(l*l+f*f);l/=h;f/=h;for(let k=0;29>k;k++){const p=k%5,r=Math.floor(k/5),x=[],v=(y,t)=>{const u=100*y,J=77*t-48;x.push((u*l+J*f)/h,y,(u*-f+J*l)/360,100*(p+y)/c.w,77*(r+t)/c.j)};v(1,1);v(0,1);v(1,0);v(0,0);g.push(x)}g=new R(c,{wiggle:g});return{Na:d,eb:a,Ua:g}}class db{constructor(a,b,c,e){const d=a.Y.oa.Na();U(d,"blink",a.o);this.x=this.Ta=b;this.y=c;this.z=e;this.va=this.wa=0;this.ia=[eb(0,b,c,-1,1),eb(1,b,c,-1,-1),eb(2,b,c,1,1),eb(3,b,c,1,-1)];this.za=d}}
function fb(a){const b=a.o;a.M.forEach(c=>{c.x=c.Ta+Math.sin(b);var e=.5*Math.cos(b);xa(c.za,a.o);if(b>c.wa){var d=c.va;c.va=(d+1)%c.ia.length;d=c.ia[d];e=c.x+.225*e+d.Ga;.05<Math.abs(e-d.W)&&(c.wa=b+.125,d.ua=b+.125,d.ra=d.W,d.sa=d.fa,d.ta=d.ga,d.W=e,d.fa=c.y+d.Ha,d.ga=0)}})}
function gb(a,b){const c=a.stack,e=b.Y.oa.Ua,d=b.o,{x:g,z:l}={x:b.T.l,z:1.7};b.M.forEach(f=>{var h=f.x;const k=f.z;G(c,h,f.y,k);let p=g<h;h=Va(l-k,g-h);p&&(c.push(bb),h=Math.PI-h);H(c,h);ya(f.za,a);c.pop();p&&c.pop();c.pop()});N(e,a);b.M.forEach(f=>{const h=f.z-.1875;f.ia.forEach(k=>{var p=f.x+k.Ca,r=f.y+k.Da;let x=k.W,v=k.fa,y=k.ga;var t=k.ua;d<t&&(t=1-(t-d)/.125,x=hb(t,k.ra,p,x),v=hb(t,k.sa,r,v),y=hb(t,k.ta,h,y));p-=x;r-=v;t=h-y;const u=Math.sqrt(p*p+r*r+t*t);G(c,x,v,y);H(c,Va(t,p));c.push(new Float32Array([u,
0,0,0,0,r,0,0,0,0,1,0,0,0,0,1]));O(e,"wiggle",Math.abs((Math.floor(24*d)+k.Fa)%57+1-29));c.pop();c.pop();c.pop()})})}function eb(a,b,c,e,d){const g=.4*e;d=.1*d;b+=g;c+=d;return{index:a,Ca:.05*e,Da:0,Ga:g,Ha:d,ua:0,ra:b,sa:c,ta:0,W:b,fa:c,ga:0,Fa:0}}function hb(a,b,c,e){return a*(a*e+(1-a)*c)+(1-a)*(a*c+(1-a)*b)};window.a=.1;function ib(a){const b=1/18/18,c=g=>Math.max(0,Math.min(255,Math.round(256*(1-b*g*g)))),e=[];for(let g=0;2>g;g++)for(let l=0;18>l;l++)for(let f=0;2>f;f++){let h;var d=void 0;let k;d=l+6*f;18>d?(h=255,d=c(d),k=255):k=d=h=0;c(l+6*f);c(l+6*f+1);for(let p=0;2>p;p++)e.push(h,d,d,k)}a=va({name:"spark",width:72,height:2,b:a,na:new Uint8Array(e)});return new R(a,{fading:W({x:1/180,width:.04,height:2/180,$:1/18,Z:1,V:18,count:18})})}function jb(a,b){return a.m?b.m?0:1:b.m?-1:a.y-b.y}
function kb(a,b){return fetch(b).then(c=>{if(!c.ok)throw Error(`failed to load ${b}`);return c.arrayBuffer()}).then(c=>a.decodeAudioData(c))}
window.onload=async function(){function a(){var m=Math.sin(Math.PI*(w+0)/8)/2+Math.sin(Math.PI*(w+0)/3)/8,q=Math.sin(Math.PI*(w+170)/8)/2+Math.sin(Math.PI*(w+130)/3)/8;ca=Math.asin((m-q)/100);Da=Math.cos(ca);Ea=Math.sin(ca);Fa=(m+q)/2;if(E!==da||-1===da.B)Y(h,"attack")?(E=da,U(da,"right",w),P&&P.stop(),m=K.createBufferSource(),m.buffer=Ga[Math.floor(Math.random()*Ga.length)],m.connect(K.destination),m.start(0)):(L=1.2*A*Oa(h,"left","right"),m=F.l+L,m<z.H+1.125?L=z.H+1.125-F.l:m>z.I-1.125&&(L=z.I-
1.125-F.l),0!==L?(F.l+=L,V=0>L,E!==ea&&(E=ea,U(ea,V?"left":"right",w))):E!==qa?(E=qa,U(qa,V?"left":"right",w)):null==P&&0<w-4&&(P=K.createBufferSource(),P.buffer=lb,P.connect(K.destination),P.start(0)));xa(E,w);m=Math.floor(48*w)-Math.floor(48*(w-A));for(q=0;q<m;q++){var B=2*Math.random()+1.4;let n=.1*Math.sin(2*Math.PI*Math.random());var C=E.P(),S=C&&C.Ea;if(!S)continue;C=F.l+S.x*(V?-1:1);const I=S.z,D=Math.PI/4*(Math.random()-.5)+S.angle;S=B*Math.sin(D);B=B*Math.cos(D)+L/A;100<Q.length&&Q.pop();
Q.push({m:!1,x:C,y:.01,z:I,s:B,J:n,D:S,startTime:w,pa:w+1.5,xa:!1})}const mb=9.8*Da*A,nb=9.8*Ea*A,Ha=1-.8*A;Q.forEach(n=>{var I=n.m;if(!I&&w<n.pa){n.x+=n.s*A;n.y+=n.J*A;n.z+=n.D*A;I=n.D;n.xa?(n.s*=Ha,n.J*=Ha):(I-=mb,n.s-=nb,n.D=I);if(n.x<z.H||n.x>z.I)n.m=!0;var D=n.y;if(-.5>D||.5<D){const Ia=0<D?.5:-.5;n.y=Ia+(Ia-D);n.J=-n.J}D=z.ha;n.z<D&&(-.01<I?(n.z=180,n.D=D,n.xa=!0):(n.z=D-n.z,n.D=-.25*I))}else I||(n.m=!0)});Q.sort(jb);fb(z)}function b(m,q,B){q.stack.push(t.Oa);G(q.stack,-Math.min(Math.max(F.l,
z.H+2),z.I-2),0,-y);H(q.stack,ca);G(q.stack,0,0,Fa);B(m,q);q.stack.pop();q.stack.pop();q.stack.pop()}function c(m,q){const B=q.stack;m=Ja.ab;N(m,q);O(m,"main",0);N(Ka,q);O(Ka,"main",0);N(La,q);O(La,"main",0);G(B,F.l,0,0);E.aa=V?"left":"right";ya(E,q);B.pop();gb(q,z);N(Ma,q);Q.forEach(C=>{C.m||(G(B,C.x,C.y,C.z),H(B,(0<=C.s?Math.PI:0)+Math.atan(C.D/C.s)),O(Ma,"fading",Math.floor(12*(w-C.startTime))),B.pop(),B.pop())})}function e(m,q){m.bindFramebuffer(m.FRAMEBUFFER,null);m.viewport(0,0,x,v);m.disable(m.BLEND);
m.clearColor(0,0,0,1);m.clear(m.COLOR_BUFFER_BIT|m.DEPTH_BUFFER_BIT);m.activeTexture(m.TEXTURE1);Na.i.bindTexture();m.uniform1i(q.A.lighting,1);m.activeTexture(m.TEXTURE0);b(m,q,c)}function d(){{const m=(Date.now()-ob)/1E3;A=m-z.o;w=z.o=m;fa=-1===fa?60:1/A/16+.9375*fa;g.innerHTML=`fps=${Math.round(fa)}`}window.a=Math.max(0,Math.min(1,window.a+A/4*Oa(h,"lightDown","lightUp")));Ca(h)%2&&(p=!p);!ra&&Y(h,"fullscreen")&&(ra=l.requestFullscreen());y+=A*Oa(h,"down","up");window.cameraZ=y;a();Ra(Na,{Sa:b,
Za:w,Qa:Q,La:p});oa(J,e);requestAnimationFrame(d)}const g=document.getElementById("fps"),l=document.getElementById("canvas");var f=window.getComputedStyle(l);const h=new Pa(document.body);X(h,"left",["a","ArrowLeft"]);X(h,"right",["d","ArrowRight"]);X(h,"showLights",["l"]);X(h,"attack",["f"," "]);X(h,"fullscreen",["u"]);X(h,"up",["w","ArrowUp"]);X(h,"down",["s","ArrowDown"]);X(h,"lightUp",["y"]);X(h,"lightDown",["h"]);var k=parseInt(f.getPropertyValue("width"),10);f=parseInt(f.getPropertyValue("height"),
10);let p=!1;var r=window.devicePixelRatio||1;const x=r*k,v=r*f;l.width=x;l.height=v;let y=1.25;const t=Za(k,f);console.log(t);const u=l.getContext("webgl2",{antialias:!1,alpha:!1});u.enable(u.DEPTH_TEST);u.depthFunc(u.LEQUAL);k=new M({b:u,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec4 v_clipSpace;\nout vec2 v_texturePosition;\n\nvoid main() {\n    vec4 position = u_projection * vec4(a_position, 1);\n    // float inverse = 1.f / (1.f - position.z * .2f);\n\n    // vec4 result = vec4(position.x, inverse * position.y * (1.f - .5f * position.z), inverse * position.z, inverse * position.w);\n    // vec4 result = vec4(position.x * position.w, position.y, position.z, position.w);\n    vec4 result = position;\n    gl_Position = result;\n    \n    v_clipSpace = result;\n    v_texturePosition = a_texturePosition;\n}");
f=new M({b:u,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform sampler2D u_lighting;\n\nin vec2 v_texturePosition;\nin vec4 v_clipSpace;\nout vec4 output_color;\n\nvoid main() {\n    vec4 clipSpace = v_clipSpace / v_clipSpace.w; //vec4(.5f * (v_clipSpace.x + 1.f), -.5f * (v_clipSpace.y - 1.f), v_clipSpace.z, v_clipSpace.w) / v_clipSpace.w;\n    clipSpace.x = .5f * (clipSpace.x + 1.f);\n    clipSpace.y = 1.f - .5f * (1.f - clipSpace.y); // why????\n\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    if (color.a == 0.0) {\n        discard;\n    }\n\n    vec4 light = texture(u_lighting, clipSpace.xy);\n    vec3 math = min(light.xyz + color.xyz * light.a, vec3(1.f, 1.f, 1.f));\n    output_color = vec4(math, color.a);\n}");
const J=new na({b:u,X:"projection"});ma(J,k,f).link();const Na=new Ta(u,x,v,360),K=new AudioContext;k=(m,q)=>ta({b:u,name:m,src:q});const [Ja,ha,Ga,lb,pb,T,ia]=await Promise.all([$a(k),ta({b:u,src:"assets/floor.png",name:"floor"}),Promise.all([kb(K,"assets/Grunt1.mp3"),kb(K,"assets/Grunt2.mp3"),kb(K,"assets/Grunt3.mp3")]),kb(K,"assets/Theres something here.mp3"),cb(k),k("ceiling","assets/ceiling.png"),Xa(k)]);let P=null;f=220/ha.j;r=ha.w/360;k=70/360;var sa=442/ha.j;f/=2;r*=2;sa/=2;const Ka=new R(ha,
{main:[[r,-.5,-k,1,1,0,-.5,-k,0,1,r,-.5,0,1,sa,0,-.5,0,0,sa,r,.5,0,1,f,0,.5,0,0,f]]});f=T.w/360;f*=2;const La=new R(T,{main:[[f,-.5,2.5+k,1,0,0,-.5,2.5+k,0,0,f,-.5,2.5,1,31/T.j,0,-.5,2.5,0,31/T.j,f,.5,2.5,1,144/T.j,0,.5,2.5,0,144/T.j]]}),qa=ia.Ia,ea=ia.$a,da=ia.Ba,F=new Wa(4),z=ab({Y:{oa:pb,T:ia,cb:Ja},o:0,H:0,I:12,ya:2.5,ha:0,T:F}),Ma=ib(u),Q=[];let ob=Date.now(),w=0,fa=-1,A=0,L=0,V=!1,E=ea,ra=null;document.addEventListener("fullscreenchange",()=>{document.fullscreenElement||(ra=null)});z.M.push(new db(z,
F.l+2,0,.75));let ca,Ea,Da,Fa;requestAnimationFrame(d);l.onmousemove=()=>{}};
