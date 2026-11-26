/* 官網聯絡頁：櫻花樹 → LINE QR 動畫（改自 100-todo/drafts/animation-tests/2026-10-21_火鳥櫻樹QR動畫測試_v1.html）。
   QR 內容＝https://line.me/R/ti/p/%40firebirdusp；無 WebGL 或舊瀏覽器時，保留靜態圖。 */
(function(){
"use strict";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────── 火鳥色盤 ───────── */
const PALETTES = [
  {key:"fire",   name:"火鳥漸層", sw:"linear-gradient(135deg,#B2489E,#D6336C 55%,#E3496F)", stops:["#B2489E","#D6336C","#E3496F"], qr:"#D6336C"},
  {key:"purple", name:"紫桃",     sw:"#B2489E", stops:["#8E3A87","#B2489E","#D07BC0"], qr:"#B2489E"},
  {key:"rose",   name:"桃紅",     sw:"#D6336C", stops:["#C2275F","#D6336C","#EE6A98"], qr:"#D6336C"},
  {key:"coral",  name:"珊瑚紅",   sw:"#E3496F", stops:["#D9435F","#E3496F","#FF8A8A"], qr:"#E3496F"},
  {key:"hot",    name:"亮桃紅",   sw:"#FF3399", stops:["#E0207F","#FF3399","#FF7BBE"], qr:"#E0207F"},
  {key:"white",  name:"白",       sw:"#F6E6EE", stops:["#F3DCE8","#FFFFFF","#EBCFDD"], qr:"#B2489E"},
];
let pal = PALETTES[0];
const CREAM = new THREE.Color("#FFF1F6");
const col = h => new THREE.Color(h);
function sampleStops(stops,g){ // g 0..1
  g=Math.min(1,Math.max(0,g)); const n=stops.length-1, f=g*n, i=Math.min(n-1,Math.floor(f));
  return col(stops[i]).lerp(col(stops[i+1]), f-i);
}

/* ───────── 小工具 ───────── */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rnd = mulberry32(20261021);
const hash3=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s)};
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const easeOutBack=t=>{const c1=1.4,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};

/* ───────── three 場景 ───────── */
const VERIFY=/[?&]verify=1/.test(location.search);
const stage=document.getElementById("sakuraQr");
if(!stage)return;
const fallbackImg=stage.querySelector("img");
const hintEl=document.getElementById("sqHint");
const cv=document.createElement("canvas");cv.setAttribute("aria-hidden","true");stage.insertBefore(cv,stage.firstChild);
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:VERIFY});}
catch(e){cv.remove();return;}   /* 沒有 WebGL：留著原本的靜態櫻花 QR 圖 */
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.setClearColor(0x000000,0);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,1,0.1,200);
scene.add(new THREE.HemisphereLight(0xffffff,0xf3c9dc,0.78));
const sun=new THREE.DirectionalLight(0xffffff,0.42); sun.position.set(6,12,8); scene.add(sun);

const U={uTime:{value:0},uDissolve:{value:0},uBloom:{value:0.93},uSway:{value:0.45}};
function patch(mat){
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader
      .replace("#include <common>",`#include <common>
        attribute float aRand; uniform float uTime,uDissolve,uBloom,uSway;`)
      .replace("#include <begin_vertex>",`
        vec3 transformed=vec3(position);
        vec3 ip=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);
        float vis=1.0-smoothstep(uBloom-0.04,uBloom,aRand);
        float d=smoothstep(aRand*0.5,aRand*0.5+0.45,uDissolve);
        transformed*=vis*(1.0-d);
        float h=clamp(ip.y/11.0,0.0,1.0);
        transformed.x+=(sin(uTime*1.4+ip.y*0.6+ip.z*0.4)+0.5*sin(uTime*2.3+ip.x))*0.07*uSway*h*h;
        transformed.z+=cos(uTime*1.1+ip.y*0.5+ip.x*0.3)*0.05*uSway*h*h;
        transformed+=normalize(vec3(ip.x,0.55,ip.z))*d*(0.8+aRand*3.2);`);
  };
  return mat;
}

/* ───────── 樹（體素） ───────── */
const VT=0.26, VC=0.36;
const treeGroup=new THREE.Group(); scene.add(treeGroup);
let trunkMesh, canopyMesh, canopyMeta=[];

function buildTree(){
  const trunk=new Map();
  const addT=(x,y,z)=>{const k=Math.round(x/VT)+","+Math.round(y/VT)+","+Math.round(z/VT);if(!trunk.has(k))trunk.set(k,[Math.round(x/VT)*VT,Math.round(y/VT)*VT,Math.round(z/VT)*VT])};
  const blob=(cx,cy,cz,r)=>{const n=Math.ceil(r/VT);for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++)for(let c=-n;c<=n;c++){const x=a*VT,y=b*VT,z=c*VT;if(x*x+y*y+z*z<=r*r)addT(cx+x,cy+y,cz+z)}};
  const P=t=>[0.55*Math.sin(t*3.2)*t,t*7.4,0.38*Math.cos(t*2.6-0.5)*t];
  for(let i=0;i<=80;i++){const t=i/80,p=P(t),r=0.88*Math.pow(1-t,0.8)+0.17+0.75*Math.exp(-t*9);blob(p[0],p[1],p[2],r)}
  for(let k=0;k<6;k++){const a=k*1.05+0.3;for(let i=0;i<=22;i++){const s=i/22;blob(Math.cos(a)*s*2.2,0.7*(1-s)+0.05,Math.sin(a)*s*2.2,0.42*(1-s)+0.14)}}
  const ends=[];
  for(let k=0;k<7;k++){
    const t0=0.6+0.055*k,p0=P(t0),a=k*2.4+0.5,len=2.6+rnd()*1.6;
    let x=p0[0],y=p0[1],z=p0[2];
    for(let i=0;i<=26;i++){const s=i/26;const dx=Math.cos(a)*len*s,dz=Math.sin(a)*len*s,dy=len*0.6*s+0.5*s*s;blob(p0[0]+dx,p0[1]+dy,p0[2]+dz,0.3*(1-s)+0.1);x=p0[0]+dx;y=p0[1]+dy;z=p0[2]+dz}
    ends.push([x,y,z]);
  }
  const top=P(1);
  const clusters=[{c:[top[0],top[1]+2.3,top[2]],r:2.6,sy:0.85}];
  ends.forEach(e=>clusters.push({c:[e[0]*1.1,e[1]+1.0,e[2]*1.1],r:1.7+rnd()*0.6,sy:0.8}));
  for(let i=0;i<13;i++){const a=i*0.98+0.4,rr=1.6+(i%3)*1.3;clusters.push({c:[Math.cos(a)*rr,7.0+rnd()*2.8+(i%3==0?0.6:0),Math.sin(a)*rr],r:2.0+rnd()*0.9,sy:0.8})}

  const can=new Map();
  clusters.forEach(cl=>{
    const R=cl.r*1.25,n=Math.ceil(R/VC);
    for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++)for(let c=-n;c<=n;c++){
      const x=cl.c[0]+a*VC,y=cl.c[1]+b*VC,z=cl.c[2]+c*VC;
      const ix=Math.round(x/VC),iy=Math.round(y/VC),iz=Math.round(z/VC);
      const dx=a*VC,dy=b*VC/cl.sy,dz=c*VC;
      const lump=1+0.16*Math.sin(ix*0.7+iy*0.5)*Math.sin(iz*0.6+iy*0.4)+0.1*(hash3(ix,iy,iz)-0.5);
      const q=Math.sqrt(dx*dx+dy*dy+dz*dz)/(cl.r*lump);
      if(q>1)continue; if(q<0.55&&hash3(ix+3,iy,iz)>0.12)continue;
      const k=ix+","+iy+","+iz; if(!can.has(k))can.set(k,[ix*VC,iy*VC,iz*VC]);
    }
  });

  // 樹幹
  if(trunkMesh){treeGroup.remove(trunkMesh);trunkMesh.geometry.dispose()}
  const tArr=[...trunk.values()];
  const tg=new THREE.BoxGeometry(VT,VT,VT);
  tg.setAttribute("aRand",new THREE.InstancedBufferAttribute(new Float32Array(tArr.map(p=>0.15+0.5*clamp(p[1]/8,0,1))),1));
  trunkMesh=new THREE.InstancedMesh(tg,patch(new THREE.MeshLambertMaterial({color:0xffffff})),tArr.length);
  const m=new THREE.Matrix4(),c=new THREE.Color();
  tArr.forEach((p,i)=>{m.setPosition(p[0],p[1],p[2]);trunkMesh.setMatrixAt(i,m);
    const sh=hash3(p[0]*5,p[1]*5,p[2]*5);c.set("#4A1F33").lerp(col("#86405C"),clamp(0.15+0.5*sh+0.2*(p[1]/6),0,1));trunkMesh.setColorAt(i,c)});
  trunkMesh.frustumCulled=false; treeGroup.add(trunkMesh);

  // 樹冠
  if(canopyMesh){treeGroup.remove(canopyMesh);canopyMesh.geometry.dispose()}
  const cArr=[...can.values()];
  const cg=new THREE.BoxGeometry(VC*0.97,VC*0.97,VC*0.97);
  cg.setAttribute("aRand",new THREE.InstancedBufferAttribute(new Float32Array(cArr.map(()=>rnd())),1));
  canopyMesh=new THREE.InstancedMesh(cg,patch(new THREE.MeshLambertMaterial({color:0xffffff})),cArr.length);
  canopyMeta=cArr.map(p=>{
    const t=clamp((p[1]-6)/6,0,1),n=hash3(p[0]*2.1,p[1]*2.1,p[2]*2.1);
    const blotch=Math.sin(p[0]*0.9+1)*Math.sin(p[2]*0.8)*Math.sin(p[1]*0.7);
    return {g:clamp(0.1+0.6*n+0.35*(1-t)+0.1*Math.sin(p[0]+p[2]),0,1),hl:blotch>0.02?clamp(0.35+(blotch-0.02)*3,0.35,0.95):0,n};
  });
  cArr.forEach((p,i)=>{m.setPosition(p[0],p[1],p[2]);canopyMesh.setMatrixAt(i,m)});
  canopyMesh.frustumCulled=false; treeGroup.add(canopyMesh);
  recolor();
  console.log("trunk voxels",tArr.length,"canopy voxels",cArr.length);
}
function recolor(){
  if(!canopyMesh)return;
  const c=new THREE.Color();
  canopyMeta.forEach((o,i)=>{c.copy(sampleStops(pal.stops,o.g)).lerp(CREAM,pal.key==="white"?0:0.16);if(o.hl)c.lerp(pal.key==="white"?col("#FFFFFF"):CREAM,o.hl);canopyMesh.setColorAt(i,c)});
  canopyMesh.instanceColor.needsUpdate=true;
  petalColors();
  if(qrReady)updateCubeColors(true);
}

/* ───────── 地台 + QR 方塊 ───────── */
const CELL=0.5;
const platGroup=new THREE.Group(); scene.add(platGroup);
let tileMesh,cubeMesh,cubes=[],qrN=0,qrReady=false,viewV=0;

function currentText(){return "https://line.me/R/ti/p/%40firebirdusp"}
function buildQR(){
  let qr;
  try{
    qrcode.stringToBytes=qrcode.stringToBytesFuncs["UTF-8"];
    qr=qrcode(0,"M");qr.addData(currentText());qr.make();
  }catch(e){toast("網址太長，QR 產不出來");return}
  qrN=qr.getModuleCount();
  const W=qrN+4,off=-(W*CELL)/2+CELL/2;
  if(tileMesh){platGroup.remove(tileMesh);tileMesh.geometry.dispose()}
  if(cubeMesh){platGroup.remove(cubeMesh);cubeMesh.geometry.dispose()}
  const tg=new THREE.BoxGeometry(CELL*0.93,0.55,CELL*0.93);tg.translate(0,-0.275,0);
  tileMesh=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({color:0xffffff}),W*W);
  const m=new THREE.Matrix4(),c=new THREE.Color();
  for(let i=0;i<W;i++)for(let j=0;j<W;j++){
    m.setPosition(off+i*CELL,0,off+j*CELL);tileMesh.setMatrixAt(i*W+j,m);
    c.set("#FCF1F5").lerp(col("#F4DCE7"),hash3(i,j,1)*0.55);tileMesh.setColorAt(i*W+j,c);
  }
  platGroup.add(tileMesh);
  const cg=new THREE.BoxGeometry(CELL*0.9,1,CELL*0.9);cg.translate(0,0.5,0);
  cubes=[];
  for(let i=0;i<qrN;i++)for(let j=0;j<qrN;j++)if(qr.isDark(j,i)){
    const x=off+(i+2)*CELL,z=off+(j+2)*CELL;
    cubes.push({x,z,d:Math.hypot(i-qrN/2+.5,j-qrN/2+.5)/(qrN*0.72),r:hash3(i,j,9)});
  }
  cubeMesh=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({color:0xffffff}),cubes.length);
  cubeMesh.frustumCulled=false;platGroup.add(cubeMesh);
  qrReady=true;updateCubes();updateCubeColors(true);
}
const _m=new THREE.Matrix4(),_p=new THREE.Vector3(),_s=new THREE.Vector3(),_q=new THREE.Quaternion(),_c=new THREE.Color(),_faint=new THREE.Color(),_strong=new THREE.Color();
function updateCubes(){
  if(!cubeMesh)return;
  cubes.forEach((o,i)=>{
    const p=clamp((viewV-0.30-o.d*0.34)/0.32,0,1),e=p>0?easeOutBack(p):0;
    const h=0.07+0.5*Math.max(0,e);
    _p.set(o.x,0,o.z);_s.set(1,h,1);_m.compose(_p,_q,_s);cubeMesh.setMatrixAt(i,_m);
  });
  cubeMesh.instanceMatrix.needsUpdate=true;
}
function updateCubeColors(force){
  if(!cubeMesh)return;
  _strong.set(pal.qr);_faint.set(pal.qr).lerp(col("#FCF1F5"),0.78);
  cubes.forEach((o,i)=>{
    const p=clamp((viewV-0.30-o.d*0.34)/0.32,0,1);
    _c.copy(_faint).lerp(_strong,p);
    if(p>0.99)_c.offsetHSL(0,0,(o.r-0.5)*0.05);
    cubeMesh.setColorAt(i,_c);
  });
  cubeMesh.instanceColor.needsUpdate=true;
}

/* ───────── 柔影 ───────── */
(function(){
  const c=document.createElement("canvas");c.width=c.height=128;const g=c.getContext("2d");
  const gr=g.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,"rgba(150,60,100,.55)");gr.addColorStop(1,"rgba(150,60,100,0)");
  g.fillStyle=gr;g.fillRect(0,0,128,128);
  window.__shadow=new THREE.Mesh(new THREE.PlaneGeometry(15,15),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
  __shadow.rotation.x=-Math.PI/2;__shadow.position.set(-2.4,0.03,-1.2);scene.add(__shadow);
})();

/* ───────── 花瓣 ───────── */
const NP=340;
const pPos=new Float32Array(NP*3),pCol=new Float32Array(NP*3),pVel=[];
const petalGeo=new THREE.BufferGeometry();
petalGeo.setAttribute("position",new THREE.BufferAttribute(pPos,3));
petalGeo.setAttribute("color",new THREE.BufferAttribute(pCol,3));
const petalTex=(function(){
  const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d");
  g.translate(32,32);g.rotate(-0.6);g.fillStyle="#fff";g.beginPath();g.ellipse(0,0,26,14,0,0,7);g.fill();
  return new THREE.CanvasTexture(c);
})();
const petals=new THREE.Points(petalGeo,new THREE.PointsMaterial({size:0.42,map:petalTex,vertexColors:true,transparent:true,alphaTest:0.2,depthWrite:false,sizeAttenuation:true}));
petals.frustumCulled=false;scene.add(petals);
function respawn(i,initial){
  const wide=smooth(0.2,0.7,viewV);
  const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*(4.6+wide*5.5);
  pPos[i*3]=Math.cos(a)*r;pPos[i*3+2]=Math.sin(a)*r;
  pPos[i*3+1]=initial?rnd()*11:7+rnd()*4;
  pVel[i]={f:0.45+rnd()*0.55,ph:rnd()*6.28,sp:0.6+rnd()*1.2};
}
for(let i=0;i<NP;i++)respawn(i,true);
function petalColors(){
  for(let i=0;i<NP;i++){const c=rnd()<0.28?CREAM.clone():sampleStops(pal.stops,rnd());if(pal.key==="white")c.lerp(col("#E8B7CF"),rnd()*0.5);pCol[i*3]=c.r;pCol[i*3+1]=c.g;pCol[i*3+2]=c.b}
  petalGeo.attributes.color.needsUpdate=true;
}

/* ───────── 模式 ───────── */
const MODES={
  spring:{bloom:0.93,sway:0.45,wind:0.15,petals:130,fall:1.0},
  bloom: {bloom:1.00,sway:0.55,wind:0.20,petals:260,fall:0.85},
  breeze:{bloom:0.95,sway:1.6, wind:2.1, petals:230,fall:1.1},
};
let mode="spring",tgt=MODES.spring;
const cur={bloom:0.93,sway:0.45,wind:0.15,petals:130};
/* ───────── 互動：點一下 樹 ↔ QR（進頁自動綻放到 QR，之後可再點） ───────── */
function toast(){}
let viewTarget=0,touched=false;
function setHint(){if(hintEl)hintEl.textContent=viewTarget?"點一下，回到櫻花樹":"點一下，看 QR code"}
function toggleView(){
  touched=true;
  viewTarget=viewTarget?0:1;
  setHint();
  if(reduce){viewV=viewTarget}
}
stage.addEventListener("click",toggleView);
let px=0,pxT=0;
stage.addEventListener("pointermove",e=>{const r=stage.getBoundingClientRect();pxT=((e.clientX-r.left)/r.width-0.5)*2});
let visible=true;
if("IntersectionObserver" in window){new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(stage)}

/* ───────── 版面與鏡頭 ───────── */
let aspect=1;
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;
  renderer.setSize(w,h,false);aspect=w/h;camera.aspect=aspect;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);resize();
const fitDist=S=>{const t=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));return (S/2)/t/Math.min(1,aspect)};
const tmpA=new THREE.Vector3(),tmpB=new THREE.Vector3(),look=new THREE.Vector3(),up=new THREE.Vector3();

/* ───────── 主迴圈 ───────── */
buildTree();buildQR();
if(reduce){viewTarget=1;viewV=1;}
setHint();
setTimeout(()=>{if(!touched&&!reduce){viewTarget=1;setHint()}},2200);
const clock=new THREE.Clock();
let sinceCube=0;
let shown=false;
function frame(){
  if(!visible){clock.getDelta();requestAnimationFrame(frame);return}
  const dt=Math.min(clock.getDelta(),0.05),t=clock.elapsedTime;
  // 視圖進度
  const dir=Math.sign(viewTarget-viewV);
  if(dir){viewV+=dir*dt/1.9;if((viewTarget-viewV)*dir<0)viewV=viewTarget}
  const changing=dir!==0;
  // 模式平滑
  const k=1-Math.exp(-dt*3);
  cur.bloom+=(tgt.bloom-cur.bloom)*k;cur.sway+=(tgt.sway-cur.sway)*k;cur.wind+=(tgt.wind-cur.wind)*k;cur.petals+=(tgt.petals-cur.petals)*k;
  U.uTime.value=t;U.uBloom.value=cur.bloom;U.uSway.value=reduce?0.1:cur.sway;
  const diss=clamp(viewV/0.6,0,1);U.uDissolve.value=diss;
  treeGroup.visible=diss<1;
  __shadow.material.opacity=1-diss;
  if(changing||sinceCube===0){updateCubes();updateCubeColors();}
  sinceCube=1;
  // 花瓣
  const n=Math.round(cur.petals*(1+0.35*smooth(0.1,0.6,viewV)));
  petalGeo.setDrawRange(0,Math.min(NP,n));
  const burst=smooth(0.0,0.35,viewV)*(1-smooth(0.5,1.0,viewV));
  for(let i=0;i<NP;i++){
    const v=pVel[i];
    pPos[i*3+1]-=v.f*dt*(1.0-0.45*smooth(0.5,1,viewV));
    pPos[i*3]+=(Math.sin(t*1.3*v.sp+v.ph)*0.35+cur.wind*v.sp)*dt;
    pPos[i*3+2]+=Math.cos(t*0.9*v.sp+v.ph)*0.3*dt;
    if(burst>0.01){const x=pPos[i*3],z=pPos[i*3+2],l=Math.hypot(x,z)+0.01;pPos[i*3]+=x/l*dt*burst*2.0;pPos[i*3+2]+=z/l*dt*burst*2.0}
    if(pPos[i*3+1]<0.05||Math.abs(pPos[i*3])>13||Math.abs(pPos[i*3+2])>13)respawn(i,false);
    if(cur.wind>0.8&&pPos[i*3]>10)pPos[i*3]-=20;
  }
  petalGeo.attributes.position.needsUpdate=true;
  petals.material.size=0.42*(1+0.15*Math.sin(t*3));
  // 鏡頭
  px+=(pxT-px)*(1-Math.exp(-dt*3));
  const c=smooth(0.05,0.9,viewV),az=Math.PI/4+px*0.35*(1-c);
  const dT=fitDist(25),elev=0.36;
  tmpA.set(Math.sin(az)*Math.cos(elev),Math.sin(elev),Math.cos(az)*Math.cos(elev)).multiplyScalar(dT);
  tmpA.y+=5.6;
  const qS=(qrN+4)*CELL*1.42;
  tmpB.set(0,fitDist(qS),0.001);
  camera.position.lerpVectors(tmpA,tmpB,c);
  look.set(0,5.6*(1-c),0);
  up.set(0,1-c,-c).normalize();camera.up.copy(up);
  camera.lookAt(look);
  renderer.render(scene,camera);
  if(!shown){shown=true;if(fallbackImg)fallbackImg.style.display="none";stage.classList.add("on")}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// 供驗證用
window.__fb={setView:v=>{viewTarget=v;viewV=v;},get v(){return viewV}};
})();
