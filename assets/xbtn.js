/* 展開式聯絡按鈕：滑鼠滑過或點一下展開成一排圖示。參考 KokonutUI Social Button（MIT，@dorianbaffier）。純 JS、無相依。 */
(function(){
"use strict";
var IC={
 chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
 line:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.5 5.8-3.4 7.9-5.9C21.3 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8z"/></svg>',
 mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
 tel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
 share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
 fb:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"/></svg>',
 link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>'};
var toastEl;
function toast(t){
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='xtoast';toastEl.setAttribute('role','status');document.body.appendChild(toastEl)}
  toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){toastEl.classList.remove('show')},1600);
}
function copyText(s,msg){
  try{navigator.clipboard.writeText(s).then(function(){toast(msg||'已複製')},function(){toast('這個瀏覽器不能自動複製，請手動複製網址')})}
  catch(e){toast('這個瀏覽器不能自動複製，請手動複製網址')}
}
function copyUrl(){copyText(location.href,'已複製這頁網址')}
var PRESETS={
  contact:{label:'聯絡我們',icon:IC.chat,items:[
    {label:'加 LINE 聊聊',icon:IC.line,cls:'xline',href:'#line'},
    {label:'寄信給我們',icon:IC.mail,href:'mailto:hello@firebirdusp.com'},
    {label:'來電　02-2345-0080',icon:IC.tel,href:'tel:0223450080'},
    {label:'複製這頁網址',icon:IC.link,fn:copyUrl}]}
};
function mount(el,cap,given){
  var cfg=given||PRESETS[el.getAttribute('data-xbtn')];if(!cfg)return;
  el.innerHTML='<button class="xtrig" type="button" aria-expanded="false">'+cfg.icon+'<span>'+cfg.label+'</span></button><div class="xrow" inert style="grid-template-columns:repeat('+cfg.items.length+',minmax(0,1fr))"></div>';
  var trig=el.querySelector('.xtrig'),row=el.querySelector('.xrow'),open=false,hv=null;
  cfg.items.forEach(function(it,i){
    var a=document.createElement(it.href?'a':'button');
    a.className='xit '+(it.cls||'');a.style.setProperty('--i',i);a.setAttribute('aria-label',it.label);
    if(it.href){a.href=it.href;if(/^http/.test(it.href)){a.target='_blank';a.rel='noopener'}}else a.type='button';
    a.innerHTML=it.icon;
    if(it.fn)a.addEventListener('click',function(e){e.preventDefault();it.fn()});
    var show=function(){if(cap)cap.textContent=it.label},hide=function(){if(cap)cap.textContent=''};
    a.addEventListener('pointerenter',show);a.addEventListener('focus',show);a.addEventListener('pointerleave',hide);a.addEventListener('blur',hide);
    row.appendChild(a);
  });
  function set(v){open=v;el.classList.toggle('open',v);trig.setAttribute('aria-expanded',v);row.inert=!v;trig.tabIndex=v?-1:0;if(!v&&cap)cap.textContent=''}
  el.addEventListener('pointerenter',function(e){if(e.pointerType!=='mouse')return;clearTimeout(hv);hv=setTimeout(function(){set(true)},100)});
  el.addEventListener('pointerleave',function(e){if(e.pointerType!=='mouse')return;clearTimeout(hv);if(!el.contains(document.activeElement))set(false)});
  trig.addEventListener('click',function(){set(true);var f=row.querySelector('a,button');if(f)f.focus({preventScroll:true})});
  el.addEventListener('keydown',function(e){if(e.key==='Escape'&&open){set(false);trig.focus()}});
  el.addEventListener('focusout',function(e){if(!el.contains(e.relatedTarget)&&!el.matches(':hover'))set(false)});
  document.addEventListener('pointerdown',function(e){if(open&&!el.contains(e.target))set(false)});
}
/* v8：開放給其他頁用（免費亮點測驗的「分享我的結果」） */
window.XBTN={mount:mount,IC:IC,copy:copyText};
document.querySelectorAll('[data-xbtn]').forEach(function(el){mount(el,el.parentNode.querySelector('.xcap'))});
})();
