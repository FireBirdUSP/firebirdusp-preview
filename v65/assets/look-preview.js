/* v65｜首屏圖案比稿：只給預覽挑選用，定案後移除。網址 ?icon=a|b */
(function(){
  var root=document.documentElement,q=(location.search.match(/[?&]icon=([ab])/)||[])[1],v=q;
  try{if(!v)v=localStorage.getItem('fb-icon65');}catch(e){}
  if(!/^[ab]$/.test(v||''))v='a';
  root.setAttribute('data-icon',v);
  document.addEventListener('DOMContentLoaded',function(){
    var box=document.createElement('div');box.className='look-sw';box.setAttribute('role','group');box.setAttribute('aria-label','首屏圖案預覽');
    box.appendChild(document.createTextNode('圖案'));
    ['a','b'].forEach(function(k){
      var b=document.createElement('button');b.type='button';b.textContent=k.toUpperCase();b.setAttribute('aria-pressed',String(k===v));
      b.addEventListener('click',function(){
        v=k;root.setAttribute('data-icon',k);try{localStorage.setItem('fb-icon65',k);}catch(e){}
        [].forEach.call(box.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',String(x===b));});
      });
      box.appendChild(b);
    });
    document.body.appendChild(box);
    function vis(){box.hidden=window.scrollY>140;}
    addEventListener('scroll',vis,{passive:true});vis();
  });
})();
