/* v63｜首屏版型比稿：只給預覽挑選用，定案後移除切換鈕。網址 ?look=a|b|c */
(function(){
  var root=document.documentElement,q=(location.search.match(/[?&]look=([abc])/)||[])[1],v=q;
  try{if(!v)v=localStorage.getItem('fb-look63');}catch(e){}
  if(!/^[abc]$/.test(v||''))v='a';
  root.setAttribute('data-look',v);
  document.addEventListener('DOMContentLoaded',function(){
    var box=document.createElement('div');box.className='look-sw';box.setAttribute('role','group');box.setAttribute('aria-label','首屏版型預覽');
    box.appendChild(document.createTextNode('版型'));
    ['a','b','c'].forEach(function(k){
      var b=document.createElement('button');b.type='button';b.textContent=k.toUpperCase();b.setAttribute('aria-pressed',String(k===v));
      b.addEventListener('click',function(){
        v=k;root.setAttribute('data-look',k);try{localStorage.setItem('fb-look63',k);}catch(e){}
        [].forEach.call(box.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',String(x===b));});
        document.dispatchEvent(new Event('fb-look'));
      });
      box.appendChild(b);
    });
    document.body.appendChild(box);
    function vis(){box.hidden=window.scrollY>140;}
    addEventListener('scroll',vis,{passive:true});vis();
  });
})();
