/* v63｜聚光燈：進場時光依序掃過四項一次，停在第一項；之後跟著滑鼠／手指／鍵盤走 */
(function(){
  var c=document.getElementById('ctrl');if(!c)return;
  var btns=[].slice.call(c.querySelectorAll('button.cell')),timers=[],touched=false;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function look(){return document.documentElement.getAttribute('data-look');}
  function light(i){btns.forEach(function(b,j){b.classList.toggle('lit',j===i);});}
  function stop(){timers.forEach(clearTimeout);timers=[];}
  function sweep(){
    stop();if(look()!=='a'){light(-1);return;}
    if(reduce){light(0);return;}
    [0,1,2,3,0].forEach(function(i,n){timers.push(setTimeout(function(){light(i);},n*850));});
  }
  btns.forEach(function(b,i){
    ['pointerenter','pointerdown','focus'].forEach(function(n){b.addEventListener(n,function(){touched=true;stop();light(i);});});
  });
  c.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&look()!=='a')light(-1);});
  document.addEventListener('fb-look',function(){touched=false;sweep();});
  setTimeout(function(){if(!touched)sweep();},1700);
})();
