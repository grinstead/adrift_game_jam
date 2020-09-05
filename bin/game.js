'use strict';class aa{constructor(a,b,c){this.name=c;this.K=`${b}${c}`;switch(a){case "uniform":this.type=1;if("u_"!==b)throw Error(`uniform field "${this.K}" invalid, must start with u_`);break;case "in":this.type=2;if("a_"!==b)throw Error(`in field "${this.K}" invalid, must start with a_`);break;default:throw Error("Impossible");}}}function ba(a){const b=[];a.split("\n").forEach(c=>{(c=/^\s*(in|uniform)\s(?:\w+\s)*([ua]_)(\w+);/.exec(c))&&b.push(new aa(c[1],c[2],c[3]))});return b}
const ca=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);function da(a,b){a.h.uniformMatrix4fv(a.j,!1,b);a.a.push(b)}function A(a,b,c,e=0){var d=a.a;d=d.length?d[d.length-1]:ca;da(a,new Float32Array([d[0],d[1],d[2],d[3],d[4],d[5],d[6],d[7],d[8],d[9],d[10],d[11],b*d[0]+c*d[4]+e*d[8]+d[12],b*d[1]+c*d[5]+e*d[9]+d[13],b*d[2]+c*d[6]+e*d[10]+d[14],b*d[3]+c*d[7]+e*d[11]+d[15]]))}function C(a,b){const c=Math.cos(b);b=Math.sin(b);a.push(new Float32Array([c,0,b,0,0,1,0,0,-b,0,c,0,0,0,0,1]))}
class ea{constructor(a,b){this.h=a;this.j=b;this.a=[];a.uniformMatrix4fv(b,!1,ca)}pop(){return this.a.pop()}push(a){var b=this.a;0===b.length?da(this,a):(b=b[b.length-1],da(this,new Float32Array([a[0]*b[0]+a[1]*b[4]+a[2]*b[8]+a[3]*b[12],a[0]*b[1]+a[1]*b[5]+a[2]*b[9]+a[3]*b[13],a[0]*b[2]+a[1]*b[6]+a[2]*b[10]+a[3]*b[14],a[0]*b[3]+a[1]*b[7]+a[2]*b[11]+a[3]*b[15],a[4]*b[0]+a[5]*b[4]+a[6]*b[8]+a[7]*b[12],a[4]*b[1]+a[5]*b[5]+a[6]*b[9]+a[7]*b[13],a[4]*b[2]+a[5]*b[6]+a[6]*b[10]+a[7]*b[14],a[4]*b[3]+a[5]*
b[7]+a[6]*b[11]+a[7]*b[15],a[8]*b[0]+a[9]*b[4]+a[10]*b[8]+a[11]*b[12],a[8]*b[1]+a[9]*b[5]+a[10]*b[9]+a[11]*b[13],a[8]*b[2]+a[9]*b[6]+a[10]*b[10]+a[11]*b[14],a[8]*b[3]+a[9]*b[7]+a[10]*b[11]+a[11]*b[15],a[12]*b[0]+a[13]*b[4]+a[14]*b[8]+a[15]*b[12],a[12]*b[1]+a[13]*b[5]+a[14]*b[9]+a[15]*b[13],a[12]*b[2]+a[13]*b[6]+a[14]*b[10]+a[15]*b[14],a[12]*b[3]+a[13]*b[7]+a[14]*b[11]+a[15]*b[15]])))}}
class H{constructor(a,b){this.name=a.name;var c=this.h=a.h;a=this.type=a.type;switch(a){case "vertex":var e=this.h.VERTEX_SHADER;break;case "fragment":e=this.h.FRAGMENT_SHADER;break;default:throw Error(`Unrecognized shader type "${a}"`);}e=this.a=c.createShader(e);c.shaderSource(e,b);c.compileShader(e);if(!c.getShaderParameter(e,c.COMPILE_STATUS))throw b=`Failed to compile ${this.name} ${a}-shader: ${c.getShaderInfoLog(e)}`,c.deleteShader(e),Error(b);this.Pa=ba(b)}}
function fa(a,...b){const c=a.h,e=a.na;b.forEach(d=>{a.xa.push(d);c.attachShader(e,d.a)});return a}class ha{constructor(a){this.name=a.name;this.M=a.M;a=this.h=a.h;this.a=!1;this.na=a.createProgram();this.xa=[];this.D={};this.H={};this.stack=null}link(){if(this.a)return this;var a=this.h,b=this.na;a.linkProgram(b);if(!a.getProgramParameter(b,a.LINK_STATUS)){var c=`Failed to link ${this.name} program: ${a.getProgramInfoLog(b)}`;a.deleteProgram(b);throw Error(c);}this.a=!0;return this}}
function ja(a,b){var c=a.h,e=a.na;c.useProgram(e);for(var d={},k={},f=a.xa,g=0;g<f.length;g++)for(var h=f[g].Pa,l=0;l<h.length;l++){var m=h[l];1===m.type?m.K in d||(d[m.name]=c.getUniformLocation(e,m.K)):m.K in k||(k[m.name]=c.getAttribLocation(e,m.K))}a.D=d;a.H=k;if(e=a.M)if(e in a.D)a.stack=new ea(c,a.D[e]);else throw Error(`No anchor point "${e}" in program`);try{b(c,a)}finally{a.D={},a.H={},a.stack=null}}
class ka{constructor(a,b,c,e,d){this.h=a;this.name=b;this.w=c;this.i=e;this.a=d(a)}bindTexture(){this.h.bindTexture(this.h.TEXTURE_2D,this.a)}}function la(a){return(new Promise((b,c)=>{const e=new Image;e.onload=()=>void b(e);e.onerror=()=>{c(Error(`failed to load ${a.src}`))};e.mode="no-cors";e.src=a.src})).then(b=>{const c=b.naturalWidth,e=b.naturalHeight;return new ka(a.h,a.name,c,e,ma(d=>{d.texImage2D(d.TEXTURE_2D,0,d.RGBA,c,e,0,d.RGBA,d.UNSIGNED_BYTE,b)}))})}
function na(a){const b=a.width,c=a.height;return new ka(a.h,a.name,b,c,ma(e=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,b,c,0,e.RGBA,e.UNSIGNED_BYTE,a.ya,0)}))}function oa(a){return new ka(a.h,a.name,a.width,a.height,()=>a.R)}
function ma(a){return b=>{const c=b.createTexture();b.bindTexture(b.TEXTURE_2D,c);a(b);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.REPEAT);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.REPEAT);b.bindTexture(b.TEXTURE_2D,null);return c}};function I(a,b){const c=a.a.h;let e=a.j;null!=e?c.bindBuffer(c.ARRAY_BUFFER,e):(a.j=e=c.createBuffer(),c.bindBuffer(c.ARRAY_BUFFER,e),c.bufferData(c.ARRAY_BUFFER,a.J,c.STATIC_DRAW));c.activeTexture(c.TEXTURE0);a.a.bindTexture();c.uniform1i(b.D.texture,0);c.enableVertexAttribArray(b.H.texturePosition);c.vertexAttribPointer(b.H.texturePosition,2,c.FLOAT,!1,20,12);c.enableVertexAttribArray(b.H.position);c.vertexAttribPointer(b.H.position,3,c.FLOAT,!1,20,0)}
function J(a,b,c){if(!a.data.hasOwnProperty(b))throw Error(`Can not render unknown "${b}"`);b=a.data[b];a=a.a.h;const e=b.oa;a.drawArrays(a.TRIANGLE_STRIP,e[c%e.length],b.lb)}
class O{constructor(a,b){this.a=a;this.j=null;a=this.data={};const c=[];let e=0;for(const d in b){const k=b[d],f=[],g=k.length;if(0===g)throw Error("Sprite declared with 0 points");const h=k[0].length;if(0==h)throw Error("Sprite declared with list of length 5 (must be non-zero multiple of 5)");const l=h/5;for(let m=0;m<g;m++){const t=k[m];if(t.length!==h)throw Error("Sprite declared with inconsistent lengths of elements");f.push(e);c.push.apply(c,t);e+=l}a[d]={wb:this,name:d,oa:f,lb:l}}this.J=new Float32Array(c)}}
function pa(a,b){for(var c=a.G;-1!==c&&c<=b;){c=a.ab;const e=a.F+1;e===c.length?a.j===a.fb?a.G=c=-1:(a.j++,a.F=0,a.G=c=b+c[0]):(a.F=e,a.G=c=b+c[e])}}class qa{constructor(a,b,c,e){const d=a.B;this.J=a.name;this.bb=a.ea;this.a=c;this.fb="number"===typeof d?d:d?-1:0;this.aa=a.set;this.ab=b;this.F=this.j=0;this.G=e+b[0];this.Ya=a.nb}$(){const a=this.Ya;return null!=a?a[this.F]:void 0}N(a){I(this.aa,a);J(this.aa,this.a,this.F)}name(){return this.J}toString(){return`Sprite/${this.J}`}}
function ra(a){const b=a.name,c=a.A,e=a.set.data;let d=-1;a.ea.forEach(f=>{const g=e[f];if(!g)throw Error(`Sprite/${b} has non-existent mode ${f}`);if(-1===d)d=g.oa.length;else if(d!==g.oa.length)throw Error(`Sprite/${b} has inconsistent frame counts`);});if(-1===d)throw Error(`Sprite/${b} given 0 modes`);if("number"!==typeof c&&c.length!==d)throw Error(`Sprite/${b} given ${c.length} frame times for ${d} frames`);if(a.$&&a.$.length!==d)throw Error(`Sprite/${b} given ${a.$.length} frame data points for ${d} frames`);
const k="number"===typeof c?Array(d).fill(c):c;return(f,g)=>new qa(a,k,f,g)}function P({x:a=0,y:b=0,z:c=0,width:e,height:d,ja:k,ia:f,fa:g,count:h,Bb:l=0,Cb:m=0,Db:t=k,Ab:y=f,V:w=!1}){const x=[];for(let q=0;q<h;q++){const D=l+q%g*t,L=m+Math.floor(q/g)*y;x.push(sa({x:a,y:b,z:c,width:e,height:d,Na:D,La:D+k,Oa:L,Ma:L+f,V:w}))}return x}
function sa({x:a=0,y:b=0,z:c=0,width:e,height:d,depth:k=0,Na:f,Oa:g,La:h,Ma:l,V:m=!1}){m?(m=h,h=a-e):(m=f,f=h,h=-a,a=e-a);return[a,-b,-c,f,l,h,-b,-c,m,l,a,k-b,d-c,f,g,h,k-b,d-c,m,g]};function Q(a,b,c){a=a.j;null!=c?a.set(b,c):a.delete(b)}function R(a,b){b=a.j.get(b);const c=a.a;return!!b&&!!b.some(e=>(e=c.get(e))?(e.X=0,null!=e.ca):!1)}function ta(a){const b=a.j.get("showLights");if(b){const c=a.a;return b.reduce((e,d)=>(d=c.get(d))?(e+=d.X,d.X=0,e):e,0)}return 0}function Ba(a,b,c){b=R(a,b)?1:0;return(R(a,c)?1:0)-b}
class Ca{constructor(a){this.a=new Map;this.j=new Map;a.addEventListener("keydown",b=>{Da(this,b,!0)});a.addEventListener("keyup",b=>{Da(this,b,!1)});a.onblur=()=>{this.a.clear()};a.onfocus=()=>{this.a.clear()}}}function Da(a,b,c){b=b.key;a=a.a;const e=a.get(b);c?null==e?a.set(b,{ca:Date.now(),X:1}):(null==e.ca&&(e.ca=Date.now()),e.X++):null!=e&&(e.ca=null)};function Ea(a,b){const c=a.a.h,e=a.j;c.bindFramebuffer(c.FRAMEBUFFER,a.aa);c.viewport(0,0,e.w,e.i);ja(a.a,(d,k)=>{Fa(d,k,a,b)})}
class Ga{constructor(a,b,c,e){b/=4;c/=4;var d=new H({h:a,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec2 v_texturePosition;\n\nvoid main() {\n  vec4 position = u_projection * vec4(a_position, 1);\n  // float inverse = 1.f / (1.f - position.z * .2f);\n\n  // vec4 result = vec4(position.x, -inverse * position.y * (1.f - .5f * position.z), inverse * position.z, inverse * position.w);\n  // gl_Position = result;\n  gl_Position = position;\n  \n  v_texturePosition = a_texturePosition;\n}"),k=
new H({h:a,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform float u_threshold;\n\nin vec2 v_texturePosition;\nout vec4 output_color;\n\nvoid main() {\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    color.a -= u_threshold;\n    if (color.a <= u_threshold) {\n        discard;\n    }\n    output_color = color;\n}");const f=new ha({h:a,M:"projection"});fa(f,d,k).link();d=a.createTexture();a.bindTexture(a.TEXTURE_2D,d);a.texImage2D(a.TEXTURE_2D,
0,a.RGBA,b,c,0,a.RGBA,a.UNSIGNED_BYTE,null);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);k=a.createFramebuffer();a.bindFramebuffer(a.FRAMEBUFFER,k);a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,d,0);a.bindFramebuffer(a.FRAMEBUFFER,null);const g=128/e;e=na({name:"fade",width:64,height:64,h:a,ya:Ha(e)});this.a=f;this.j=oa({R:d,name:"lighting",
width:b,height:c,h:a});this.aa=k;this.J=new O(e,{main:[[g,0,-g,1,0,g,0,g,1,1,-g,0,-g,0,0,-g,0,g,0,1]]})}}function Fa(a,b,c,e){a.blendFunc(a.ONE,a.ONE);e.eb?a.clearColor(0,0,0,1):a.clearColor(0,0,0,window.a);a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT);e.ob(a,b,()=>{const d=c.J;I(d,b);const k=b.D.threshold,f=e.tb;e.mb.forEach(g=>{if(!g.v){var h=g.startTime;h=(f-h)/(g.Aa-h);a.uniform1f(k,.5*h*h);A(b.stack,g.x,g.y,g.z);J(d,"main",0);b.stack.pop()}})})}
function Ha(a){const b=new Uint8Array(16384),c=(k,f)=>{k/=a;f/=a;return k*k+f*f},e=Math.min(c(32,0),c(32,0));for(let k=0;64>k;k++)for(let f=0;64>f;f++){const g=4*(64*k+f);var d=c(f-32,k-32);const h=1-Math.sqrt(d/e);d=1E-4>=d?5:0;const l=Math.max(Math.round(255*h*h),0);b[g]=d+Math.max(Math.round(20*h),0);b[g+1]=d;b[g+2]=d;b[g+3]=l}return b};function Ia(a,b){return 0<b?Math.atan(a/b):0===b?0<a?Math.PI/2:0===a?0:-Math.PI/2:Math.atan(a/b)+Math.PI};const Ja=434/1.8,T=405/Ja;function U(a,b,c){c=c(a,b);a.state=c;c.U(b)}function Ka(a){return(a=a.s.$())?a.Ca:null}function La(a,b){a.a=b;0!==b&&(a.ha=Math.sign(b))}function V(a,b,c,e=-1===a.ha?"left":"right"){a.s=b(e,c)}class Ma{constructor(a,b){this.u=b;this.ha=1;this.a=0;this.s=a.pa("right",0);this.state={name:"unstarted",U:c=>U(this,c,Na),N:()=>{throw Error("Hero did not get processed before rendering!");}}}N(a,b){a=b.stack;A(a,this.u,0,0);this.s.N(b);a.pop()}}
function Oa(a){const b=a.l;pa(b.s,a.m);b.state.U(a)}function Pa(a,b,c){const e=c.l.state.sa;e?e(a,b,c):c.l.N(a,b)}
function Na(a,b){let c=!0;V(a,b.o.l.pa,b.m);return{name:"normal",U:e=>{const d=e.l,k=e.m;var f=e.input;if(R(f,"up"))U(d,e,Qa);else if(R(f,"attack"))U(d,e,Ra);else{f=1.2*e.va*Ba(f,"left","right");var g=d.u+f;g<e.O+T?f=e.O+T-d.u:g>e.P-T&&(f=e.P-T-d.u);La(d,f/e.va);g=-1===d.ha?"left":"right";f?(d.u+=f,c&&(c=!1,V(d,e.o.l.jb,k))):c||(c=!0,V(d,e.o.l.pa,k));e=d.s;if(g!==e.a){if(!e.bb.includes(g))throw Error(`${e} does not have mode ${g}`);e.a=g}}},sa:null}}
function Ra(a,b){V(a,b.o.l.gb,b.m);La(a,0);const c=b.o.l.Xa;Sa(b.audio,a,c[Math.floor(Math.random()*c.length)]);return{name:"attacking",U:e=>{-1===a.s.G&&U(a,e,Na)},sa:null}}function Qa(a,b){V(a,b.o.l.hb,b.m,"up");La(a,0);return{name:"climbing",U:c=>{-1===a.s.G&&U(a,c,Na)},sa:(c,e)=>{const d=e.stack;A(d,0,.75,.3*Math.min(5,a.s.F));a.N(c,e);d.pop()}}}
async function Ta(a,b){const [c,e,d,k,f]=await Promise.all([a("hero_idle","assets/Hero Breathing with axe.png"),a("hero_walk","assets/Hero Walking with axe.png"),a("hero_attack","assets/Axe Chop.png"),a("hero_climbing","assets/Climbing Up.png"),Promise.all([b("assets/Grunt1.mp3"),b("assets/Grunt2.mp3"),b("assets/Grunt3.mp3")])]);return{Xa:f,pa:W({name:"hero_idle",R:c,ka:405,ba:434,la:220,ma:434,Z:16,B:!0,A:1/12,T:[{f:388,g:104,b:385,c:170},{f:792,g:105,b:790,c:170},{f:1198,g:105,b:1195,c:169},{f:1602,
g:106,b:1600,c:170},{f:2008,g:106,b:2005,c:172},{f:388,g:539,b:385,c:604},{f:794,g:540,b:790,c:605},{f:1196,g:539,b:1196,c:604},{f:1602,g:539,b:1602,c:604},{f:2009,g:541,b:2007,c:604},{f:386,g:974,b:385,c:1036},{f:792,g:972,b:790,c:1033},{f:1198,g:974,b:1196,c:1038},{f:1602,g:972,b:1601,c:1036},{f:2010,g:974,b:2005,c:1044},{f:386,g:1406,b:385,c:1477}]}),jb:W({name:"hero_walk",R:e,ka:424,ba:444,la:258,ma:444,Z:8,B:!0,A:.125,T:[{f:408,g:110,b:404,c:166},{f:830,g:110,b:829,c:166},{f:408,g:554,b:404,
c:614},{f:830,g:554,b:829,c:614},{f:408,g:998,b:404,c:1055},{f:830,g:998,b:829,c:1055},{f:408,g:1444,b:404,c:1500},{f:830,g:1444,b:829,c:1500}]}),gb:W({name:"hero_attack",R:d,ka:644,ba:565,la:284,ma:565,Z:5,B:!1,A:1/12,T:[{f:422,g:285,b:415,c:353},{f:936,g:367,b:868,c:380},{f:1507,g:311,b:1469,c:318},{f:162,g:948,b:206,c:943},{f:1025,g:934,b:976,c:962}]}),hb:W({name:"hero_climbing_up",R:k,ka:222,ba:412,la:110,ma:412,Z:8,B:!1,A:.125,T:[{f:128,g:60,b:65,c:54},{f:329,g:155,b:277,c:148},{f:579,g:58,b:518,
c:56},{f:772,g:157,b:721,c:156},{f:95,g:575,b:65,c:567},{f:337,g:472,b:286,c:465},null,null],ua:"up",scale:1.4})}}
function W(a){var b=a.R;const c=a.ka,e=a.ba,d=a.la,k=a.ma,f=Ja/(a.scale||1),g=Math.floor(b.w/c),h={x:d/f,z:(e-k)/f,width:c/f,height:e/f,ja:c/b.w,ia:e/b.i,fa:g,count:a.Z},l=a.T&&a.T.map((t,y)=>{if(!t)return{Ca:null};const w=t.f,x=t.g;return{Ca:{x:(w-(y%g*c+d))/f,z:(Math.floor(y/g)*e+k-x)/f,angle:Ia(-(x-t.c),w-t.b)}}});let m;a.ua?(m=[a.ua],b=new O(b,{[a.ua]:P(h)})):(m=["left","right"],b=new O(b,{right:P(h),left:P({...h,V:!0})}));return ra({name:a.name,set:b,ea:m,B:a.B,A:a.A,nb:l})};function Ua(a,b){var c=376/b;const e=c/(484/b),d=c/(268/b);c/=1.25;a=b/a*c;return{kb:new Float32Array([a,0,0,0,0,0,1/1.5,(d-e)/1.5,0,c,0,0,0,0,0,(e+d)/2]),Fb:e,Eb:d,yb:a,zb:c,da:554/b*e/c-1.25,L:.3}}
async function Va(a,b){const [c,e,d,k,f]=await Promise.all([b("ladder","assets/ladder.png"),b("wall","assets/Back Wall.png"),b("floor","assets/floor.png"),b("ceiling","assets/ceiling.png"),b("wall","assets/side_wall.png")]);b=2.5*c.w/c.i;b=new O(c,{main:[sa({x:b/2,y:-.75,width:b,height:2.5,Na:0,Oa:.5,La:1,Ma:1})]});return{M:a,vb:e,Va:d,Ta:k,qb:f,cb:b}}
function Wa({vb:a,Va:b,Ta:c,qb:e,M:d},k,f){f=-f-d.L;const g=2*d.L+f+k;var h=494/a.i,l=1016/a.i,m=(l-h)*a.i/2.5*k/a.w;a=new O(a,{main:[[g,.75,2.5,m,h,g,.75,0,m,l,f,.75,2.5,0,h,f,.75,0,0,l]]});h=110/b.i;l=220/b.i;m=(l-h)*b.i/1.5*k/b.w;b=new O(b,{main:[[g,-.75,-d.da,m,1,f,-.75,-d.da,0,1,g,-.75,0,m,l,f,-.75,0,0,l,g,.75,0,m,h,f,.75,0,0,h]]});h=144/c.i;l=32/c.i;k=(l-h)*c.i/1.5*k/c.w;c=new O(c,{main:[[g,-.75,2.5+d.da,k,0,f,-.75,2.5+d.da,0,0,g,-.75,2.5,k,l,f,-.75,2.5,0,l,g,.75,2.5,k,h,f,.75,2.5,0,h]]});k=
438/e.w;h=318/e.w;l=194/e.i;m=1164/e.i;const t=84/e.w;d=[f,-.75,2.5,k,l,f,-.75,0,k,m,f+d.L,-.75,2.5,h,l,f+d.L,-.75,0,h,m,f+d.L,.75,2.5,t,414/e.i,f+d.L,.75,0,t,964/e.i];k=[];for(h=0;h<d.length;h+=5)k.push(g+(f-d[h]),d[h+1],d[h+2],d[h+3],d[h+4]);e=new O(e,{right:[k],left:[d]});return{ub:a,Ua:b,Sa:c,pb:e}};function Sa(a,b,c){const e=a.j;var d=e.get(b);d&&d.stop();a=a.a;d=a.createBufferSource();d.buffer=c;d.connect(a.destination);d.start();e.set(b,d)}function Xa(a,b){return fetch(b).then(c=>{if(!c.ok)throw Error(`failed to load ${b}`);return c.arrayBuffer()}).then(c=>a.a.decodeAudioData(c))}class Ya{constructor(){this.a=new AudioContext;this.j=new WeakMap}};function Za(a){const b=a.O,c=a.P;return{o:a.o,input:a.input,audio:a.audio,W:[],m:a.m,va:0,O:b,P:c,Ka:a.Ka,ta:a.ta,Y:Wa(a.o.Ba,c-b,b),l:a.l}};const $a=new Float32Array([-1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
async function ab(a){const [b,c,e]=await Promise.all([a("creature","assets/Enemy.png"),a("tentacle","assets/Tentacle.png"),a("creature_attack","assets/enemy_bite.png")]);var d=new O(b,{blink:P({x:.25,z:.25,width:.5,height:.5,ja:108/b.w,ia:108/b.i,fa:2,count:6,V:!0})});a=ra({name:"creature_attack",set:new O(e,{bite:P({x:.5,z:.75,width:1,height:2,ia:530/e.i,ja:278/e.w,fa:7,count:42,V:!0})}),ea:["bite"],B:!0,A:1/12});var k=Array(6).fill(.125);k[0]=4;d=ra({name:"creature_normal",set:d,ea:["blink"],B:!0,
A:k});k=[];var f=92,g=-22;const h=Math.sqrt(f*f+g*g);f/=h;g/=h;for(let l=0;29>l;l++){const m=l%5,t=Math.floor(l/5),y=[],w=(x,q)=>{const D=100*x,L=77*q-48;y.push((D*f+L*g)/h,x,(D*-g+L*f)/360,100*(m+x)/c.w,77*(t+q)/c.i)};w(1,1);w(0,1);w(1,0);w(0,0);k.push(y)}k=new O(c,{wiggle:k});return{ib:d,xb:a,sb:k}}class bb{constructor(a,b,c,e){a=a.o.za.ib("blink",a.m);this.x=this.rb=b;this.y=c;this.z=e;this.Ha=this.Ia=0;this.wa=[X(0,b,c,-1,1),X(1,b,c,-1,-1),X(2,b,c,1,1),X(3,b,c,1,-1)];this.s=a}}
function cb(a){const b=a.m;a.W.forEach(c=>{c.x=c.rb+Math.sin(b);var e=.5*Math.cos(b);pa(c.s,a.m);if(b>c.Ia){var d=c.Ha;c.Ha=(d+1)%c.wa.length;d=c.wa[d];e=c.x+.225*e+d.Za;.05<Math.abs(e-d.ga)&&(c.Ia=b+.125,d.Ga=b+.125,d.Da=d.ga,d.Ea=d.qa,d.Fa=d.ra,d.ga=e,d.qa=c.y+d.$a,d.ra=0)}})}
function db(a,b){const c=a.stack,e=b.o.za.sb,d=b.m,{x:k,z:f}={x:b.l.u,z:1.7};b.W.forEach(g=>{var h=g.x;const l=g.z;A(c,h,g.y,l);let m=k<h;h=Ia(f-l,k-h);m&&(c.push($a),h=Math.PI-h);C(c,h);g.s.N(a);c.pop();m&&c.pop();c.pop()});I(e,a);b.W.forEach(g=>{const h=g.z-.1875;g.wa.forEach(l=>{var m=g.x+l.Qa,t=g.y+l.Ra;let y=l.ga,w=l.qa,x=l.ra;var q=l.Ga;d<q&&(q=1-(q-d)/.125,y=eb(q,l.Da,m,y),w=eb(q,l.Ea,t,w),x=eb(q,l.Fa,h,x));m-=y;t-=w;q=h-x;const D=Math.sqrt(m*m+t*t+q*q);A(c,y,w,x);C(c,Ia(q,m));c.push(new Float32Array([D,
0,0,0,0,t,0,0,0,0,1,0,0,0,0,1]));J(e,"wiggle",Math.abs((Math.floor(24*d)+l.Wa)%57+1-29));c.pop();c.pop();c.pop()})})}function X(a,b,c,e,d){const k=.4*e;d=.1*d;b+=k;c+=d;return{index:a,Qa:.05*e,Ra:0,Za:k,$a:d,Ga:0,Da:b,Ea:c,Fa:0,ga:b,qa:c,ra:0,Wa:0}}function eb(a,b,c,e){return a*(a*e+(1-a)*c)+(1-a)*(a*c+(1-a)*b)};window.a=.1;function fb(a){const b=1/18/18,c=k=>Math.max(0,Math.min(255,Math.round(256*(1-b*k*k)))),e=[];for(let k=0;2>k;k++)for(let f=0;18>f;f++)for(let g=0;2>g;g++){let h;var d=void 0;let l;d=f+6*g;18>d?(h=255,d=c(d),l=255):l=d=h=0;c(f+6*g);c(f+6*g+1);for(let m=0;2>m;m++)e.push(h,d,d,l)}a=na({name:"spark",width:72,height:2,h:a,ya:new Uint8Array(e)});return new O(a,{fading:P({x:1/180,width:.04,height:2/180,ja:1/18,ia:1,fa:18,count:18})})}function gb(a,b){return a.v?b.v?0:1:b.v?-1:a.y-b.y}
window.onload=async function(){function a(){var p=Math.sin(Math.PI*(B+0)/8)/2+Math.sin(Math.PI*(B+0)/3)/8,r=Math.sin(Math.PI*(B+170)/8)/2+Math.sin(Math.PI*(B+130)/3)/8;Y=Math.asin((p-r)/100);ua=Math.cos(Y);va=Math.sin(Y);wa=(p+r)/2;Oa(v);p=Math.floor(48*B)-Math.floor(48*(B-E));for(r=0;r<p;r++){var z=2*Math.random()+1.4;let n=.1*Math.sin(2*Math.PI*Math.random());var u=Ka(M);if(!u)continue;const K=M.u+u.x*M.ha,F=u.z,S=Math.PI/4*(Math.random()-.5)+u.angle;u=z*Math.sin(S);z=z*Math.cos(S)+M.a;100<N.length&&
N.pop();N.push({v:!1,x:K,y:.01,z:F,C:z,S:n,I:u,startTime:B,Aa:B+1.5,Ja:!1})}const G=9.8*ua*E,hb=9.8*va*E,xa=1-.8*E;N.forEach(n=>{var K=n.v;if(!K&&B<n.Aa){n.x+=n.C*E;n.y+=n.S*E;n.z+=n.I*E;K=n.I;n.Ja?(n.C*=xa,n.S*=xa):(K-=G,n.C-=hb,n.I=K);if(n.x<v.O||n.x>v.P)n.v=!0;var F=n.y;if(-.75>F||.75<F){const S=0<F?.75:-.75;n.y=S+(S-F);n.S=-n.S}F=v.ta;n.z<F&&(-.01<K?(n.z=180,n.I=F,n.Ja=!0):(n.z=F-n.z,n.I=-.25*K))}else K||(n.v=!0)});N.sort(gb);cb(v)}function b(p,r,z){r.stack.push(x.kb);A(r.stack,-Math.min(Math.max(M.u,
v.O+1),v.P-1),0,-1.25);C(r.stack,Y);A(r.stack,0,0,wa);z(p,r);r.stack.pop();r.stack.pop();r.stack.pop()}function c(p,r){const z=r.stack;var u=v.Y.ub;I(u,r);J(u,"main",0);u=v.Y.Ua;I(u,r);J(u,"main",0);u=v.Y.Sa;I(u,r);J(u,"main",0);u=v.Y.pb;I(u,r);J(u,"left",0);J(u,"right",0);A(z,2,0,0);u=v.o.Ba.cb;I(u,r);J(u,"main",0);z.pop();Pa(p,r,v);db(r,v);I(ya,r);N.forEach(G=>{G.v||(A(z,G.x,G.y,G.z),C(z,(0<=G.C?Math.PI:0)+Math.atan(G.I/G.C)),J(ya,"fading",Math.floor(12*(B-G.startTime))),z.pop(),z.pop())})}function e(p,
r){p.bindFramebuffer(p.FRAMEBUFFER,null);p.viewport(0,0,y,w);p.blendFunc(p.SRC_ALPHA,p.ONE_MINUS_SRC_ALPHA);p.clearColor(0,0,0,1);p.clear(p.COLOR_BUFFER_BIT|p.DEPTH_BUFFER_BIT);p.activeTexture(p.TEXTURE1);L.j.bindTexture();p.uniform1i(r.D.lighting,1);p.activeTexture(p.TEXTURE0);b(p,r,c)}function d(){{const p=(Date.now()-ib)/1E3;v.va=E=p-v.m;v.m=B=p;Z=-1===Z?60:1/E/16+.9375*Z;k.innerHTML=`fps=${Math.round(Z)}`}window.a=Math.max(0,Math.min(1,window.a+E/4*Ba(h,"lightDown","lightUp")));ta(h)%2&&(m=!m);
!ia&&R(h,"fullscreen")&&(ia=f.requestFullscreen());a();Ea(L,{ob:b,tb:B,mb:N,eb:m});ja(D,e);requestAnimationFrame(d)}const k=document.getElementById("fps"),f=document.getElementById("canvas");var g=window.getComputedStyle(f);const h=new Ca(document.body);Q(h,"left",["a","ArrowLeft"]);Q(h,"right",["d","ArrowRight"]);Q(h,"showLights",["l"]);Q(h,"attack",["f"," "]);Q(h,"fullscreen",["u"]);Q(h,"up",["w","ArrowUp"]);Q(h,"down",["s","ArrowDown"]);Q(h,"lightUp",["y"]);Q(h,"lightDown",["h"]);var l=parseInt(g.getPropertyValue("width"),
10);g=parseInt(g.getPropertyValue("height"),10);let m=!1;const t=window.devicePixelRatio||1,y=t*l,w=t*g;f.width=y;f.height=w;const x=Ua(l,g);console.log(x);const q=f.getContext("webgl2",{antialias:!1,alpha:!1});q.enable(q.BLEND);q.enable(q.DEPTH_TEST);q.depthFunc(q.LEQUAL);l=new H({h:q,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec4 v_clipSpace;\nout vec2 v_texturePosition;\n\nvoid main() {\n    vec4 position = u_projection * vec4(a_position, 1);\n    // float inverse = 1.f / (1.f - position.z * .2f);\n\n    // vec4 result = vec4(position.x, inverse * position.y * (1.f - .5f * position.z), inverse * position.z, inverse * position.w);\n    // vec4 result = vec4(position.x * position.w, position.y, position.z, position.w);\n    vec4 result = position;\n    gl_Position = result;\n    \n    v_clipSpace = result;\n    v_texturePosition = a_texturePosition;\n}");
g=new H({h:q,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform sampler2D u_lighting;\n\nin vec2 v_texturePosition;\nin vec4 v_clipSpace;\nout vec4 output_color;\n\nvoid main() {\n    vec4 clipSpace = v_clipSpace / v_clipSpace.w; //vec4(.5f * (v_clipSpace.x + 1.f), -.5f * (v_clipSpace.y - 1.f), v_clipSpace.z, v_clipSpace.w) / v_clipSpace.w;\n    clipSpace.x = .5f * (clipSpace.x + 1.f);\n    clipSpace.y = 1.f - .5f * (1.f - clipSpace.y); // why????\n\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    if (color.a == 0.0) {\n        discard;\n    }\n\n    vec4 light = texture(u_lighting, clipSpace.xy);\n    vec3 math = min(light.xyz + color.xyz * light.a, vec3(1.f, 1.f, 1.f));\n    output_color = vec4(math, color.a);\n}");
const D=new ha({h:q,M:"projection"});fa(D,l,g).link();const L=new Ga(q,y,w,360),za=new Ya;l=(p,r)=>la({h:q,name:p,src:r});const [jb,kb,Aa]=await Promise.all([Va(x,l),ab(l),Ta(l,p=>Xa(za,p))]),M=new Ma(Aa,2),v=Za({o:{za:kb,l:Aa,Ba:jb},input:h,audio:za,m:0,O:0,P:12,Ka:2.5,ta:0,l:M}),ya=fb(q),N=[];let ib=Date.now(),B=0,Z=-1,E=0,ia=null;document.addEventListener("fullscreenchange",()=>{document.fullscreenElement||(ia=null)});v.W.push(new bb(v,M.u+2,0,.75));let Y,va,ua,wa;requestAnimationFrame(d);f.onmousemove=
()=>{}};
