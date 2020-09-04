'use strict';class aa{constructor(a,b,c){this.name=c;this.u=`${b}${c}`;switch(a){case "uniform":this.type=1;if("u_"!==b)throw Error(`uniform field "${this.u}" invalid, must start with u_`);break;case "in":this.type=2;if("a_"!==b)throw Error(`in field "${this.u}" invalid, must start with a_`);break;default:throw Error("Impossible");}}}function ba(a){const b=[];a.split("\n").forEach(c=>{(c=/^\s*(in|uniform)\s(?:\w+\s)*([ua]_)(\w+);/.exec(c))&&b.push(new aa(c[1],c[2],c[3]))});return b}
const ca=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);function da(a,b){a.a.uniformMatrix4fv(a.c,!1,b);a.b.push(b)}function B(a,b,c,e=0){var d=a.b;d=d.length?d[d.length-1]:ca;da(a,new Float32Array([d[0],d[1],d[2],d[3],d[4],d[5],d[6],d[7],d[8],d[9],d[10],d[11],b*d[0]+c*d[4]+e*d[8]+d[12],b*d[1]+c*d[5]+e*d[9]+d[13],b*d[2]+c*d[6]+e*d[10]+d[14],b*d[3]+c*d[7]+e*d[11]+d[15]]))}function ja(a,b){const c=Math.cos(b);b=Math.sin(b);a.push(new Float32Array([c,0,b,0,0,1,0,0,-b,0,c,0,0,0,0,1]))}
class ka{constructor(a,b){this.a=a;this.c=b;this.b=[];a.uniformMatrix4fv(b,!1,ca)}pop(){return this.b.pop()}push(a){var b=this.b;0===b.length?da(this,a):(b=b[b.length-1],da(this,new Float32Array([a[0]*b[0]+a[1]*b[4]+a[2]*b[8]+a[3]*b[12],a[0]*b[1]+a[1]*b[5]+a[2]*b[9]+a[3]*b[13],a[0]*b[2]+a[1]*b[6]+a[2]*b[10]+a[3]*b[14],a[0]*b[3]+a[1]*b[7]+a[2]*b[11]+a[3]*b[15],a[4]*b[0]+a[5]*b[4]+a[6]*b[8]+a[7]*b[12],a[4]*b[1]+a[5]*b[5]+a[6]*b[9]+a[7]*b[13],a[4]*b[2]+a[5]*b[6]+a[6]*b[10]+a[7]*b[14],a[4]*b[3]+a[5]*
b[7]+a[6]*b[11]+a[7]*b[15],a[8]*b[0]+a[9]*b[4]+a[10]*b[8]+a[11]*b[12],a[8]*b[1]+a[9]*b[5]+a[10]*b[9]+a[11]*b[13],a[8]*b[2]+a[9]*b[6]+a[10]*b[10]+a[11]*b[14],a[8]*b[3]+a[9]*b[7]+a[10]*b[11]+a[11]*b[15],a[12]*b[0]+a[13]*b[4]+a[14]*b[8]+a[15]*b[12],a[12]*b[1]+a[13]*b[5]+a[14]*b[9]+a[15]*b[13],a[12]*b[2]+a[13]*b[6]+a[14]*b[10]+a[15]*b[14],a[12]*b[3]+a[13]*b[7]+a[14]*b[11]+a[15]*b[15]])))}}
class la{constructor(a,b){this.name=a.name;var c=this.a=a.a;a=this.type=a.type;switch(a){case "vertex":var e=this.a.VERTEX_SHADER;break;case "fragment":e=this.a.FRAGMENT_SHADER;break;default:throw Error(`Unrecognized shader type "${a}"`);}e=this.b=c.createShader(e);c.shaderSource(e,b);c.compileShader(e);if(!c.getShaderParameter(e,c.COMPILE_STATUS))throw b=`Failed to compile ${this.name} ${a}-shader: ${c.getShaderInfoLog(e)}`,c.deleteShader(e),Error(b);this.ta=ba(b)}}
function ma(a,...b){const c=a.a,e=a.S;b.forEach(d=>{a.$.push(d);c.attachShader(e,d.b)});return a}class na{constructor(a){this.name=a.name;this.R=a.R;a=this.a=a.a;this.b=!1;this.S=a.createProgram();this.$=[];this.m={};this.o={};this.stack=null}link(){if(this.b)return this;var a=this.a,b=this.S;a.linkProgram(b);if(!a.getProgramParameter(b,a.LINK_STATUS)){var c=`Failed to link ${this.name} program: ${a.getProgramInfoLog(b)}`;a.deleteProgram(b);throw Error(c);}this.b=!0;return this}}
function va(a,b){var c=a.a,e=a.S;c.useProgram(e);for(var d={},g={},h=a.$,f=0;f<h.length;f++)for(var k=h[f].ta,l=0;l<k.length;l++){var n=k[l];1===n.type?n.u in d||(d[n.name]=c.getUniformLocation(e,n.u)):n.u in g||(g[n.name]=c.getAttribLocation(e,n.u))}a.m=d;a.o=g;if(e=a.R)if(e in a.m)a.stack=new ka(c,a.m[e]);else throw Error(`No anchor point "${e}" in program`);try{b(c,a)}finally{a.m={},a.o={},a.stack=null}}
class wa{constructor(a,b,c,e,d){this.a=a;this.name=b;this.w=c;this.f=e;this.b=d(a)}bindTexture(){this.a.bindTexture(this.a.TEXTURE_2D,this.b)}}function F(a){return(new Promise((b,c)=>{const e=new Image;e.onload=()=>void b(e);e.onerror=()=>{c(Error(`failed to load ${a.src}`))};e.mode="no-cors";e.src=a.src})).then(b=>{const c=b.naturalWidth,e=b.naturalHeight;return new wa(a.a,a.name,c,e,xa(d=>{d.texImage2D(d.TEXTURE_2D,0,d.RGBA,c,e,0,d.RGBA,d.UNSIGNED_BYTE,b)}))})}
function ya(a){const b=a.width,c=a.height;return new wa(a.a,a.name,b,c,xa(e=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,b,c,0,e.RGBA,e.UNSIGNED_BYTE,a.aa,0)}))}function za(a){return new wa(a.a,a.name,a.width,a.height,()=>a.Ka)}
function xa(a){return b=>{const c=b.createTexture();b.bindTexture(b.TEXTURE_2D,c);a(b);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);b.bindTexture(b.TEXTURE_2D,null);return c}};function G(a,b){const c=a.b.a;let e=a.c;null!=e?c.bindBuffer(c.ARRAY_BUFFER,e):(a.c=e=c.createBuffer(),c.bindBuffer(c.ARRAY_BUFFER,e),c.bufferData(c.ARRAY_BUFFER,a.j,c.STATIC_DRAW));c.activeTexture(c.TEXTURE0);a.b.bindTexture();c.uniform1i(b.m.texture,0);c.enableVertexAttribArray(b.o.texturePosition);c.vertexAttribPointer(b.o.texturePosition,2,c.FLOAT,!1,20,12);c.enableVertexAttribArray(b.o.position);c.vertexAttribPointer(b.o.position,3,c.FLOAT,!1,20,0)}
function J(a,b,c){if(!a.data.hasOwnProperty(b))throw Error(`Can not render unknown "${b}"`);b=a.data[b];a=a.b.a;const e=b.T;a.drawArrays(a.TRIANGLE_STRIP,e[c%e.length],b.Da)}
class K{constructor(a,b){this.b=a;this.c=null;a=this.data={};const c=[];let e=0;for(const d in b){const g=b[d],h=[],f=g.length;if(0===f)throw Error("Sprite declared with 0 points");const k=g[0].length;if(0==k)throw Error("Sprite declared with list of length 5 (must be non-zero multiple of 5)");const l=k/5;for(let n=0;n<f;n++){const r=g[n];if(r.length!==k)throw Error("Sprite declared with inconsistent lengths of elements");h.push(e);c.push.apply(c,r);e+=l}a[d]={Ma:this,name:d,T:h,Da:l}}this.j=new Float32Array(c)}}
function Aa(a,b,c){if(!a.za.includes(b))throw Error(`${a} does not have mode ${b}`);a.c=0;a.b=b;a.j=0;a.I=Ba(a,0,c)}function Ca(a,b,c){const e=a.b;if(null==e)throw Error(`${a} tried rendering while inactive`);let d=a.j;const g=a.I;-1!==g&&g<=c&&(++d===a.ea.length&&(d=0,a.c++),a.j=d,a.I=Ba(a,d,c));G(a.fa,b);J(a.fa,e,d)}
class Da{constructor(a,b){const c=a.ga;this.Ba=a.name;this.za=a.U;this.b=null;this.Ea="number"===typeof c?c:c?-1:0;this.fa=a.set;this.ea=b;this.c=0;this.I=this.j=-1}toString(){return`Sprite/${this.Ba}`}}function Ba(a,b,c){const e=a.ea;return b+1===e.length&&a.c===a.Ea?-1:c+e[b]}
function Ea(a){const b=a.name,c=a.da,e=a.set.data;let d=-1;a.U.forEach(h=>{const f=e[h];if(!f)throw Error(`Sprite/${b} has non-existent mode ${h}`);if(-1===d)d=f.T.length;else if(d!==f.T.length)throw Error(`Sprite/${b} has inconsistent frame counts`);});if(-1===d)throw Error(`Sprite/${b} given 0 modes`);if("number"!==typeof c&&c.length!==d)throw Error(`Sprite/${b} given ${c.length} frame times for ${d} frames`);const g="number"===typeof c?Array(d).fill(c):c;return()=>new Da(a,g)}
function Q({F:a=0,Ra:b=0,Sa:c=0,C:e,v:d,A:g,B:h,g:f,count:k,l=!1}){const n=e/g;g=d/g;return Fa({x:a*n,y:b,z:c*g,width:n,height:g,Z:e/h.w,Y:d/h.f,g:f,count:k,l})}function Fa({x:a=0,y:b=0,z:c=0,width:e,height:d,Z:g,Y:h,g:f,count:k,Oa:l=0,Pa:n=0,Qa:r=g,Na:y=h,l:t=!1}){const C=[];for(let z=0;z<k;z++){const W=l+z%f*r,w=n+Math.floor(z/f)*y;C.push(Ga({x:a,y:b,z:c,width:e,height:d,ra:W,pa:W+g,sa:w,qa:w+h,l:t}))}return C}
function Ga({x:a=0,y:b=0,z:c=0,width:e,height:d,ra:g,sa:h,pa:f,qa:k,l=!1}){l?l=f:(l=g,g=f);return[e-a,b,-c,g,k,-a,b,-c,l,k,e-a,b,d-c,g,h,-a,b,d-c,l,h]};function R(a,b,c){a=a.c;null!=c?a.set(b,c):a.delete(b)}function Ha(a,b){b=a.c.get(b);const c=a.b;return!!b&&!!b.some(e=>(e=c.get(e))?(e.N=0,null!=e.O):!1)}function Sa(a){const b=a.c.get("showLights");if(b){const c=a.b;return b.reduce((e,d)=>(d=c.get(d))?(e+=d.N,d.N=0,e):e,0)}return 0}function Ta(a,b,c){b=Ha(a,b)?1:0;return(Ha(a,c)?1:0)-b}
class Ua{constructor(a){this.b=new Map;this.c=new Map;a.addEventListener("keydown",b=>{Va(this,b,!0)});a.addEventListener("keyup",b=>{Va(this,b,!1)});a.onblur=()=>{this.b.clear()};a.onfocus=()=>{this.b.clear()}}}function Va(a,b,c){b=b.key;a=a.b;const e=a.get(b);c?null==e?a.set(b,{O:Date.now(),N:1}):(null==e.O&&(e.O=Date.now()),e.N++):null!=e&&(e.O=null)};function Wa(a,b){const c=a.c.a,e=a.b;c.enable(c.BLEND);c.blendFunc(c.ONE,c.ONE);c.bindFramebuffer(c.FRAMEBUFFER,a.I);c.viewport(0,0,e.w,e.f);va(a.c,(d,g)=>{Xa(d,g,a,b)})}
class Ya{constructor(a,b,c,e){b/=4;c/=4;var d=new la({a,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec2 v_texturePosition;\n\nvoid main() {\n  vec4 position = u_projection * vec4(a_position, 1);\n  // float inverse = 1.f / (1.f - position.z * .2f);\n\n  // vec4 result = vec4(position.x, -inverse * position.y * (1.f - .5f * position.z), inverse * position.z, inverse * position.w);\n  // gl_Position = result;\n  gl_Position = position;\n  \n  v_texturePosition = a_texturePosition;\n}"),g=
new la({a,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform float u_threshold;\n\nin vec2 v_texturePosition;\nout vec4 output_color;\n\nvoid main() {\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    color.a -= u_threshold;\n    if (color.a <= u_threshold) {\n        discard;\n    }\n    output_color = color;\n}");const h=new na({a,R:"projection"});ma(h,d,g).link();d=a.createTexture();a.bindTexture(a.TEXTURE_2D,d);a.texImage2D(a.TEXTURE_2D,
0,a.RGBA,b,c,0,a.RGBA,a.UNSIGNED_BYTE,null);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);g=a.createFramebuffer();a.bindFramebuffer(a.FRAMEBUFFER,g);a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,d,0);a.bindFramebuffer(a.FRAMEBUFFER,null);const f=128/e;e=ya({name:"fade",width:64,height:64,a,aa:Za(e)});this.c=h;this.b=za({Ka:d,name:"lighting",
width:b,height:c,a});this.I=g;this.j=new K(e,{main:[[f,0,-f,1,0,f,0,f,1,1,-f,0,-f,0,0,-f,0,f,0,1]]})}}function Xa(a,b,c,e){e.Aa?a.clearColor(0,0,0,1):a.clearColor(0,0,0,.2);a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT);e.Ga(a,b,()=>{const d=c.j;G(d,b);const g=b.m.threshold,h=e.La;e.Fa.forEach(f=>{if(!f.h){var k=f.startTime;k=(h-k)/(f.ca-k);a.uniform1f(g,.5*k*k);B(b.stack,f.x,f.y,f.z);J(d,"main",0);b.stack.pop()}})})}
function Za(a){const b=new Uint8Array(16384),c=(g,h)=>{g/=a;h/=a;return g*g+h*h},e=Math.min(c(32,0),c(32,0));for(let g=0;64>g;g++)for(let h=0;64>h;h++){const f=4*(64*g+h);var d=c(h-32,g-32);const k=1-Math.sqrt(d/e);d=1E-4>=d?5:0;const l=Math.max(Math.round(255*k*k),0);b[f]=d+Math.max(Math.round(20*k),0);b[f+1]=d;b[f+2]=d;b[f+3]=l}return b};const $a=.15*.75;
async function ab(a){const [b,c]=await Promise.all([a("creature","assets/Enemy.png"),a("tentacle","assets/Tentacle.png")]);a=new K(b,{blink:Fa({x:.15,z:.15,width:.3,height:.3,Z:108/b.w,Y:108/b.f,g:2,count:6})});var e=Array(6).fill(.125);e[0]=4;a=Ea({name:"creature_normal",set:a,U:["blink"],ga:!0,da:e});e=[];var d=92,g=-22;const h=Math.sqrt(d*d+g*g);d/=h;g/=h;for(let f=0;29>f;f++){const k=f%5,l=Math.floor(f/5),n=[],r=(y,t)=>{const C=100*y,z=77*t-48;n.push((C*d+z*g)/h,y,(C*-g+z*d)/360/2,100*(k+y)/c.w,
77*(l+t)/c.f)};r(1,1);r(0,1);r(1,0);r(0,0);e.push(n)}e=new K(c,{wiggle:e});return{Ca:a,Ja:e}}class bb{constructor(a,b,c,e){const d=a.oa.ba.Ca();Aa(d,"blink",a.J);this.x=this.Ia=b;this.y=c;this.z=e;this.la=this.ma=0;this.X=[cb(0,b,c,-1,1),cb(1,b,c,-1,-1),cb(2,b,c,1,1),cb(3,b,c,1,-1)];this.Ha=d}}
function db(a){const b=a.J;a.M.forEach(c=>{c.x=c.Ia+.5*Math.sin(b);var e=.5*Math.cos(b);if(b>c.ma){var d=c.la;c.la=(d+1)%c.X.length;d=c.X[d];e=c.x+.225*e+d.xa;.05<Math.abs(e-d.P)&&(c.ma=b+.125,d.ka=b+.125,d.ha=d.P,d.ia=d.V,d.ja=d.W,d.P=e,d.V=c.y+d.ya,d.W=0)}})}
function eb(a,b){const c=a.stack,e=b.oa.ba.Ja,d=b.J;b.M.forEach(g=>{B(c,g.x,g.y,g.z);Ca(g.Ha,a,d);c.pop()});G(e,a);b.M.forEach(g=>{const h=g.z-$a;g.X.forEach(f=>{var k=g.x+f.ua,l=g.y+f.va;let n=f.P,r=f.V,y=f.W;var t=f.ka;d<t&&(t=1-(t-d)/.125,n=fb(t,f.ha,k,n),r=fb(t,f.ia,l,r),y=fb(t,f.ja,h,y));k-=n;l-=r;t=h-y;const C=Math.sqrt(k*k+l*l+t*t);B(c,n,r,y);ja(c,0<k?Math.atan(t/k):0===k?0<t?Math.PI/2:0===t?0:-Math.PI/2:Math.atan(t/k)+Math.PI);c.push(new Float32Array([C,0,0,0,0,l,0,0,0,0,1,0,0,0,0,1]));J(e,
"wiggle",Math.abs((Math.floor(24*d)+f.wa)%57+1-29));c.pop();c.pop();c.pop()})})}function cb(a,b,c,e,d){const g=.2*e;d=.1*d;b+=g;c+=d;return{index:a,ua:.05*e,va:0,xa:g,ya:d,ka:0,ha:b,ia:c,ja:0,P:b,V:c,W:0,wa:0}}function fb(a,b,c,e){return a*(a*e+(1-a)*c)+(1-a)*(a*c+(1-a)*b)};const gb=[{D:422,G:285,K:415,L:353},{D:936,G:367,K:868,L:380},{D:1507,G:311,K:1469,L:318},{D:162,G:948,K:206,L:943},{D:1025,G:934,K:976,L:962}];
function hb(a){const b=1/18/18,c=g=>Math.max(0,Math.min(255,Math.round(256*(1-b*g*g)))),e=[];for(let g=0;2>g;g++)for(let h=0;18>h;h++)for(let f=0;2>f;f++){let k;var d=void 0;let l;d=h+6*f;18>d?(k=255,d=c(d),l=255):l=d=k=0;c(h+6*f);c(h+6*f+1);for(let n=0;2>n;n++)e.push(k,d,d,l)}a=ya({name:"spark",width:72,height:2,a,aa:new Uint8Array(e)});return new K(a,{fading:Fa({x:1/180,width:.04,height:2/180,Z:1/18,Y:1,g:18,count:18})})}function ib(a,b){return a.h?b.h?0:1:b.h?-1:a.y-b.y}
function jb(a,b){return fetch(b).then(c=>{if(!c.ok)throw Error(`failed to load ${b}`);return c.arrayBuffer()}).then(c=>a.decodeAudioData(c))}
window.onload=async function(){function a(){var q=Math.sin(Math.PI*(u+0)/8)/2+Math.sin(Math.PI*(u+0)/3)/8,p=Math.sin(Math.PI*(u+170)/8)/2+Math.sin(Math.PI*(u+130)/3)/8;ea=Math.asin((q-p)/100);Ia=Math.cos(ea);Ja=Math.sin(ea);Ka=(q+p)/2;q=0;A===oa&&u-L<5/S||(Ha(k,"attack")?(A=oa,L=u,S=12,M&&M.stop(),p=H.createBufferSource(),p.buffer=La[Math.floor(Math.random()*La.length)],p.connect(H.destination),p.start(0)):(q=1.2*Ta(k,"left","right"),X=q*D,0!==X?(T+=X,N=0>X,A!==pa&&(A=pa,L=u,S=8)):A!==fa?(A=fa,L=
u,S=12,Aa(fa,N?"left":"right",u)):null==M&&L<u-4&&(M=H.createBufferSource(),M.buffer=kb,M.connect(H.destination),M.start(0))));p=Math.floor(48*u)-Math.floor(48*(u-D));for(let m=0;m<p;m++){let E=T+(lb-(X?.05:0))*(N?-1:1),I=.1*Math.sin(2*Math.PI*Math.random());var x=328/360,v=Math.PI/2;if(A===oa){x=Math.floor(S*(u-L));v=gb[x];E=T+(v.D-(x%3*644+284))*(N?-1:1)/360;I=-Math.abs(I);x=(565-(v.G-565*Math.floor(x/3)))/360;var O=(v.K-v.D)*(N?-1:1);v=Math.atan((v.G-v.L)/O);0<O&&(v+=Math.PI)}O=Math.PI/4*(Math.random()-
.5)+v;const Y=2*Math.random()+1.4;v=Y*Math.sin(O);O=Y*Math.cos(O)+q;100<P.length&&P.pop();P.push({h:!1,x:E,y:0,z:x,i:O,H:I,s:v,startTime:u,ca:u+1.5,na:!1})}const mb=9.8*Ia*D,nb=9.8*Ja*D,Ma=1-.8*D;P.forEach(m=>{var E=m.h;if(!E&&u<m.ca){m.x+=m.i*D;m.y+=m.H*D;m.z+=m.s*D;E=m.s;m.na?(m.i*=Ma,m.H*=Ma):(E-=mb,m.i-=nb,m.s=E);const I=m.y;if(-.5>I||.5<I){const Y=0<I?.5:-.5;m.y=Y+(Y-I);m.H=-m.H}0>m.z&&(-.01<E?(m.z=180,m.s=0,m.na=!0):(m.z=-m.z,m.s=-.25*E))}else E||(m.h=!0)});P.sort(ib);db(U)}function b(q,p,x){p.stack.push(W);
B(p.stack,-T,0,-C);ja(p.stack,ea);B(p.stack,0,0,Ka);x(q,p);p.stack.pop();p.stack.pop();p.stack.pop()}function c(q,p){const x=p.stack;G(Na,p);J(Na,"main",0);G(Oa,p);J(Oa,"main",0);G(Pa,p);J(Pa,"main",0);B(x,T,0,0);A===fa?(A.b=N?"left":"right",Ca(A,p,u)):(G(A,p),J(A,N?"left":"right",Math.floor(S*(u-L))));x.pop();eb(p,U);G(Qa,p);P.forEach(v=>{v.h||(B(x,v.x,v.y,v.z),ja(x,(0<=v.i?Math.PI:0)+Math.atan(v.s/v.i)),J(Qa,"fading",Math.floor(12*(u-v.startTime))),x.pop(),x.pop())})}function e(q,p){q.bindFramebuffer(q.FRAMEBUFFER,
null);q.viewport(0,0,y,t);q.disable(q.BLEND);q.clearColor(0,0,0,1);q.clear(q.COLOR_BUFFER_BIT|q.DEPTH_BUFFER_BIT);q.activeTexture(q.TEXTURE1);qa.b.bindTexture();q.uniform1i(p.m.lighting,1);q.activeTexture(q.TEXTURE0);b(q,p,c)}function d(){{const q=(Date.now()-ob)/1E3;D=q-U.J;u=U.J=q;ha=-1===ha?60:1/D/16+.9375*ha;g.innerHTML=`fps=${Math.round(ha)}`}Sa(k)%2&&(n=!n);!ra&&Ha(k,"fullscreen")&&(ra=h.requestFullscreen());C+=D*Ta(k,"down","up");window.cameraZ=C;a();Wa(qa,{Ga:b,La:u,Fa:P,Aa:n});va(Ra,e);requestAnimationFrame(d)}
const g=document.getElementById("fps"),h=document.getElementById("canvas");var f=window.getComputedStyle(h);const k=new Ua(document.body);R(k,"left",["a","ArrowLeft"]);R(k,"right",["d","ArrowRight"]);R(k,"showLights",["l"]);R(k,"attack",["f"," "]);R(k,"fullscreen",["u"]);R(k,"up",["w","ArrowUp"]);R(k,"down",["s","ArrowDown"]);var l=parseInt(f.getPropertyValue("width"),10);f=parseInt(f.getPropertyValue("height"),10);let n=!1;var r=window.devicePixelRatio||1;const y=r*l,t=r*f;h.width=y;h.height=t;let C=
1.25;r=376/f;var z=r/(484/f);f=r/(268/f);const W=new Float32Array([360/l,0,0,0,0,0,1,f-z,0,r/1.25,0,0,0,0,0,(z+f)/2]);console.log(W);const w=h.getContext("webgl2",{antialias:!1,alpha:!1});w.enable(w.DEPTH_TEST);w.depthFunc(w.LEQUAL);l=new la({a:w,type:"vertex"},"#version 300 es\nin vec3 a_position;\nin vec2 a_texturePosition;\n\nuniform mat4 u_projection;\n\nout vec4 v_clipSpace;\nout vec2 v_texturePosition;\n\nvoid main() {\n    vec4 position = u_projection * vec4(a_position, 1);\n    // float inverse = 1.f / (1.f - position.z * .2f);\n\n    // vec4 result = vec4(position.x, inverse * position.y * (1.f - .5f * position.z), inverse * position.z, inverse * position.w);\n    // vec4 result = vec4(position.x * position.w, position.y, position.z, position.w);\n    vec4 result = position;\n    gl_Position = result;\n    \n    v_clipSpace = result;\n    v_texturePosition = a_texturePosition;\n}");
f=new la({a:w,type:"fragment"},"#version 300 es\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform sampler2D u_lighting;\n\nin vec2 v_texturePosition;\nin vec4 v_clipSpace;\nout vec4 output_color;\n\nvoid main() {\n    vec4 clipSpace = v_clipSpace / v_clipSpace.w; //vec4(.5f * (v_clipSpace.x + 1.f), -.5f * (v_clipSpace.y - 1.f), v_clipSpace.z, v_clipSpace.w) / v_clipSpace.w;\n    clipSpace.x = .5f * (clipSpace.x + 1.f);\n    clipSpace.y = 1.f - .5f * (1.f - clipSpace.y); // why????\n\n    vec4 color = texture(u_texture, v_texturePosition.st);\n    if (color.a == 0.0) {\n        discard;\n    }\n\n    vec4 light = texture(u_lighting, clipSpace.xy);\n    vec3 math = min(light.xyz + color.xyz * light.a, vec3(1.f, 1.f, 1.f));\n    output_color = vec4(math, color.a);\n}");
const Ra=new na({a:w,R:"projection"});ma(Ra,l,f).link();const qa=new Ya(w,y,t,360),H=new AudioContext;l=(q,p)=>F({a:w,name:q,src:p});const [Z,ia,sa,ta,ua,La,kb,pb,V]=await Promise.all([F({a:w,src:"assets/Back Wall.png",name:"wall"}),F({a:w,src:"assets/floor.png",name:"floor"}),F({a:w,src:"assets/Hero Breathing with axe.png",name:"idle"}),F({a:w,src:"assets/Hero Walking with axe.png",name:"walk"}),F({a:w,src:"assets/Axe Chop.png",name:"attack"}),Promise.all([jb(H,"assets/Grunt1.mp3"),jb(H,"assets/Grunt2.mp3"),
jb(H,"assets/Grunt3.mp3")]),jb(H,"assets/Theres something here.mp3"),ab(l),l("ceiling","assets/ceiling.png")]);let M=null;f=222/ia.f;r=ia.w/360;l=70/360;z=442/ia.f;f/=2;r*=2;z/=2;const Na=new K(Z,{main:[[Z.w/360,.5,Z.f/360,1,0,Z.w/360,.5,0,1,1,0,.5,Z.f/360,0,0,0,.5,0,0,1]]}),Oa=new K(ia,{main:[[r,-.5,-l,1,1,0,-.5,-l,0,1,r,-.5,0,1,z,0,-.5,0,0,z,r,.5,0,1,f,0,.5,0,0,f]]});f=V.w/360;f*=2;const Pa=new K(V,{main:[[f,-.5,2.5+l,1,0,0,-.5,2.5+l,0,0,f,-.5,2.5,1,31/V.f,0,-.5,2.5,0,31/V.f,f,.5,2.5,1,133/V.f,
0,.5,2.5,0,133/V.f]]});l=220/405;const lb=1.125*(387/405-l);l=new K(sa,{right:Q({F:l,C:405,v:434,B:sa,A:360,g:5,count:16}),left:Q({F:1-l,C:405,v:434,B:sa,A:360,g:5,count:16,l:!0})});const fa=Ea({name:"character_idle",set:l,U:["left","right"],ga:!0,da:1/12})(),pa=new K(ta,{right:Q({F:258/424,C:424,v:444,B:ta,A:360,g:2,count:8}),left:Q({F:1-258/424,C:424,v:444,B:ta,A:360,g:2,count:8,l:!0})}),oa=new K(ua,{right:Q({F:284/644,C:644,v:565,B:ua,A:360,g:3,count:5}),left:Q({F:1-284/644,C:644,v:565,B:ua,A:360,
g:3,count:5,l:!0})});new K(qa.b,{main:[Ga({width:2,height:1,ra:0,sa:0,pa:1,qa:1})]});const U={oa:{ba:pb},M:[],J:0},Qa=hb(w),P=[];let ob=Date.now(),u=0,ha=-1,D=0,T=4,X=0,N=!1,L=0,A=pa,S=12,ra=null;document.addEventListener("fullscreenchange",()=>{document.fullscreenElement||(ra=null)});U.M.push(new bb(U,T+2,0,.4));let ea,Ja,Ia,Ka;requestAnimationFrame(d);h.onmousemove=()=>{}};
