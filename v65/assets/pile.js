/* 重力膠囊：官網精準廣告頁 A 區塊用。物理引擎改寫自 KokonutUI Shape Hero（MIT，作者 @dorianbaffier）。純 JS、無相依。 */
(function(){
"use strict";

/* ---- 膠囊剛體小引擎（改寫自 KokonutUI Shape Hero，MIT）---- */
const STEP=1/120,GRAVITY=2600,ITER=16,FRICTION=.5,REST=.22,BOUNCE=140,SLOP=.4,CORR=.3,
MAXV=3200,MAXW=18,SLEEPV=9,SLEEPN=40,RESTV=30,REACH=.28;

const ends=b=>{ if(!b.half) return [[b.x,b.y]];
  const c=Math.cos(b.a)*b.half,s=Math.sin(b.a)*b.half;
  return [[b.x-c,b.y-s],[b.x+c,b.y+s]]; };
const closest=(p,seg)=>{ const a=seg[0],b=seg[1]||a,dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;
  const t=l===0?0:Math.min(Math.max(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l,0),1);
  return [a[0]+dx*t,a[1]+dy*t]; };
const mk=(a,b,nx,ny,px,py,depth)=>({a,b,nx,ny,rax:px-a.x,ray:py-a.y,rbx:b?px-b.x:0,rby:b?py-b.y:0,depth,correct:true,target:0,kn:0,kt:0,jn:0,jt:0});

function collidePair(a,b,out){
  const reach=a.r+b.r,sa=ends(a),sb=ends(b),found=[];
  const test=(p,q,fromB)=>{
    const dx=fromB?q[0]-p[0]:p[0]-q[0], dy=fromB?q[1]-p[1]:p[1]-q[1];
    const d=Math.hypot(dx,dy); if(d>=reach+.5) return;
    const nx=d>1e-6?dx/d:0, ny=d>1e-6?dy/d:-1;
    const [ax,ay]=fromB?q:p;
    found.push(mk(a,b,nx,ny,ax-nx*(a.r-(reach-d)/2),ay-ny*(a.r-(reach-d)/2),reach-d));
  };
  for(const p of sa) test(p,closest(p,sb),false);
  for(const p of sb) test(p,closest(p,sa),true);
  if(!found.length){ const p=closest([b.x,b.y],sa); test(p,closest(p,sb),false); }
  let deep=null;
  for(const c of found){ c.correct=false; if(!deep||c.depth>deep.depth) deep=c; out.push(c); }
  if(deep) deep.correct=true;
}
function collideWalls(b,W,H,out){
  let deep=null;
  const add=c=>{ c.correct=false; if(!deep||c.depth>deep.depth) deep=c; out.push(c); };
  for(const [x,y] of ends(b)){
    if(y+b.r-H>-.5) add(mk(b,null,0,-1,x,H,y+b.r-H));
    if(b.r-x>-.5) add(mk(b,null,1,0,0,y,b.r-x));
    if(x+b.r-W>-.5) add(mk(b,null,-1,0,W,y,x+b.r-W));
  }
  if(deep) deep.correct=true;
}
function relV(c){ const {a,b}=c;
  let vx=a.vx-a.w*c.ray, vy=a.vy+a.w*c.rax;
  if(b){ vx-=b.vx-b.w*c.rby; vy-=b.vy+b.w*c.rbx; }
  return [vx,vy]; }
function impulse(c,jx,jy){ const {a,b}=c;
  a.vx+=jx*a.invMass; a.vy+=jy*a.invMass; a.w+=a.invI*(c.rax*jy-c.ray*jx);
  if(b){ b.vx-=jx*b.invMass; b.vy-=jy*b.invMass; b.w-=b.invI*(c.rbx*jy-c.rby*jx); } }
function effMass(c,nx,ny){ const {a,b}=c; const ra=c.rax*ny-c.ray*nx;
  let k=a.invMass+a.invI*ra*ra;
  if(b){ const rb=c.rbx*ny-c.rby*nx; k+=b.invMass+b.invI*rb*rb; } return k; }
function prepare(c){
  c.kn=effMass(c,c.nx,c.ny); c.kt=effMass(c,-c.ny,c.nx);
  const [vx,vy]=relV(c), vn=vx*c.nx+vy*c.ny;
  c.target=c.depth<0?c.depth/STEP:(vn<-BOUNCE?-REST*vn:0);
}
function solve(c){
  let [vx,vy]=relV(c); const vn=vx*c.nx+vy*c.ny;
  const jn=Math.max(c.jn+(c.target-vn)/c.kn,0), dn=jn-c.jn; c.jn=jn;
  impulse(c,c.nx*dn,c.ny*dn);
  [vx,vy]=relV(c); const tx=-c.ny,ty=c.nx, lim=FRICTION*c.jn;
  const jt=Math.min(Math.max(c.jt-(vx*tx+vy*ty)/c.kt,-lim),lim), dt=jt-c.jt; c.jt=jt;
  impulse(c,tx*dt,ty*dt);
}
function correct(c){
  if(!c.correct||c.depth<=SLOP) return;
  const {a,b}=c, total=a.invMass+(b?b.invMass:0), push=((c.depth-SLOP)*CORR)/total;
  a.x+=c.nx*push*a.invMass; a.y+=c.ny*push*a.invMass;
  if(b){ b.x-=c.nx*push*b.invMass; b.y-=c.ny*push*b.invMass; }
}
function applyDrag(d){
  const b=d.body, cos=Math.cos(b.a), sin=Math.sin(b.a);
  const rx=d.lx*cos-d.ly*sin, ry=d.lx*sin+d.ly*cos;
  const h=mk(b,null,0,0,b.x+rx,b.y+ry,0);
  const [vx]=relV(h);
  impulse(h,(((d.tx-b.x-rx)/STEP)*REACH-vx)/effMass(h,1,0),0);
  const [,vy]=relV(h);
  impulse(h,0,(((d.ty-b.y-ry)/STEP)*REACH-vy)/effMass(h,0,1));
  b.w*=.96;
}
function step(w){
  const {bodies,width,height,drag}=w;
  for(const b of bodies){ b.vy+=GRAVITY*STEP; b.vx*=.999; b.w*=.995; }
  if(drag) applyDrag(drag);
  const cs=[];
  for(let i=0;i<bodies.length;i++){
    collideWalls(bodies[i],width,height,cs);
    for(let j=i+1;j<bodies.length;j++){
      const a=bodies[i],b=bodies[j], near=a.half+a.r+b.half+b.r;
      if(Math.abs(a.x-b.x)<near&&Math.abs(a.y-b.y)<near) collidePair(a,b,cs);
    }
  }
  for(const c of cs) prepare(c);
  for(let k=0;k<ITER;k++) for(const c of cs) solve(c);
  let fastest=0;
  for(const b of bodies){
    const sp=Math.hypot(b.vx,b.vy);
    if(sp>MAXV){ b.vx*=MAXV/sp; b.vy*=MAXV/sp; }
    b.w=Math.min(Math.max(b.w,-MAXW),MAXW);
    if(b!==(drag&&drag.body)&&Math.hypot(b.vx,b.vy)+Math.abs(b.w)*b.r<RESTV){ b.vx*=.8;b.vy*=.8;b.w*=.8; }
    b.x+=b.vx*STEP; b.y+=b.vy*STEP; b.a+=b.w*STEP;
    fastest=Math.max(fastest,Math.hypot(b.vx,b.vy)+Math.abs(b.w)*(b.half+b.r));
  }
  for(const c of cs) correct(c);
  w.still=fastest<SLEEPV&&!drag?w.still+1:0;
  return w.still>SLEEPN;
}
const render=bs=>{ for(const b of bs) b.el.style.transform=`translate3d(${(b.x-b.width/2).toFixed(2)}px,${(b.y-b.height/2).toFixed(2)}px,0) rotate(${b.a.toFixed(4)}rad)`; };
const scatter=n=>(Math.sin(n*12.9898)*43758.5453)%1;

function createBodies(els,W,H,fill){
  const bodies=[]; let area=0;
  els.forEach((el,i)=>{
    const w=el.offsetWidth,h=el.offsetHeight;
    if(area+w*h>W*H*fill){ el.style.visibility='hidden'; return; }
    area+=w*h;
    const mass=w*h/1000;
    bodies.push({x:W*(.2+.6*Math.abs(scatter(i+1))),y:-h-i*64,a:scatter(i+7)*.9,
      vx:scatter(i+3)*120,vy:0,w:scatter(i+5)*2,half:Math.max(w-h,0)/2,r:Math.min(w,h)/2,
      invMass:1/mass,invI:12/(mass*(w*w+h*h)),width:w,height:h,el});
    el.style.visibility='visible';
  });
  return bodies;
}
function hitTest(bs,x,y){
  for(let i=bs.length-1;i>=0;i--){ const b=bs[i],q=closest([x,y],ends(b));
    if(Math.hypot(x-q[0],y-q[1])<=b.r) return b; }
  return null;
}

/* ---- 掛到頁面上的 .gp-stage ---- */
function mountPile(stage){
  const fill=parseFloat(stage.dataset.fill)||.6;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els=[...stage.querySelectorAll('.gp-shape')];
  stage.classList.add('gp-live');
  const world={bodies:[],width:stage.clientWidth,height:stage.clientHeight,drag:null,still:0};
  let raf=0,last=0,carry=0,started=false,visible=false;
  const loop=now=>{ raf=0; carry+=Math.min((now-last)/1000,.05); last=now;
    let asleep=false; while(carry>=STEP){ asleep=step(world); carry-=STEP; }
    render(world.bodies); if(!asleep&&visible) raf=requestAnimationFrame(loop); };
  const wake=()=>{ world.still=0; if(!raf&&started&&visible){ last=performance.now(); raf=requestAnimationFrame(loop);} };
  const begin=()=>{ if(started) return; started=true;
    world.width=stage.clientWidth; world.height=stage.clientHeight;
    world.bodies=createBodies(els,world.width,world.height,fill);
    if(reduce){ let n=0; while(n<2400&&!step(world)) n++; render(world.bodies); return; }
    render(world.bodies); wake(); };
  const io=new IntersectionObserver(([e])=>{ visible=e.isIntersecting&&!document.hidden;
    if(visible){ (document.fonts?document.fonts.ready:Promise.resolve()).then(begin); wake(); } },{threshold:.3});
  io.observe(stage);
  document.addEventListener('visibilitychange',()=>{ visible=!document.hidden; wake(); });
  new ResizeObserver(()=>{ world.width=stage.clientWidth; world.height=stage.clientHeight; wake(); }).observe(stage);
  const local=e=>{ const r=stage.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top]; };
  stage.addEventListener('pointerdown',e=>{
    // 手機觸控不抓取，免得手指一碰到膠囊頁面就捲不動
    if(!started||world.drag||e.button!==0||e.pointerType==='touch') return;
    const [x,y]=local(e), b=hitTest(world.bodies,x,y); if(!b) return;
    e.preventDefault();
    const dx=x-b.x,dy=y-b.y,cos=Math.cos(-b.a),sin=Math.sin(-b.a);
    world.drag={body:b,lx:dx*cos-dy*sin,ly:dx*sin+dy*cos,tx:x,ty:y,id:e.pointerId};
    stage.setPointerCapture(e.pointerId); stage.dataset.dragging=''; wake(); });
  stage.addEventListener('pointermove',e=>{ if(world.drag&&world.drag.id===e.pointerId){ [world.drag.tx,world.drag.ty]=local(e); wake(); } });
  const up=e=>{ if(world.drag&&world.drag.id===e.pointerId){ world.drag=null; delete stage.dataset.dragging; wake(); } };
  stage.addEventListener('pointerup',up); stage.addEventListener('pointercancel',up);
  const btn=stage.parentNode.querySelector('.gp-replay');
  if(btn) btn.addEventListener('click',()=>{ world.drag=null; started=false; world.bodies=[]; els.forEach(el=>{el.style.visibility='hidden';el.style.transform='';}); begin(); });
  // 保險：IntersectionObserver 沒回報時，1 秒後若舞台已有尺寸就照樣開始
  setTimeout(()=>{ if(!started&&stage.clientWidth>0&&!document.hidden){ visible=true; begin(); wake(); } },1000);
}
document.querySelectorAll('.gp-stage').forEach(mountPile);
})();
