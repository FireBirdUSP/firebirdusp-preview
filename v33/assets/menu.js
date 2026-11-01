/* v9｜手機選單開關＋回到頂端鈕（全站共用，首頁也載入） */
(function(){
var h=document.querySelector('.top'),b=document.querySelector('.menu-btn');
function close(){if(!h)return;h.classList.remove('menu-open');if(b){b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','開啟選單')}}
if(h&&b){
  b.addEventListener('click',function(e){e.stopPropagation();var o=h.classList.toggle('menu-open');b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'關閉選單':'開啟選單')});
  h.querySelectorAll('.nav a').forEach(function(a){a.addEventListener('click',close)});
  document.addEventListener('click',function(e){if(h.classList.contains('menu-open')&&!h.contains(e.target))close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  window.addEventListener('resize',function(){if(innerWidth>900)close()});
}
var t=document.createElement('button');t.type='button';t.className='to-top';t.setAttribute('aria-label','回到頂端');t.textContent='\u2191';document.body.appendChild(t);
function onS(){t.classList.toggle('show',window.scrollY>600)}
addEventListener('scroll',onS,{passive:true});onS();
t.addEventListener('click',function(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
})();
