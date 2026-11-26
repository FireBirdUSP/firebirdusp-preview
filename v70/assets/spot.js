/* v64｜聚光：進場時依序亮過四項一次，停在第一項；之後跟著滑鼠／手指／鍵盤走 */
(function(){
  var c=document.getElementById('ctrl');if(!c)return;
  var btns=[].slice.call(c.querySelectorAll('button.cell')),timers=[],touched=false;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function light(i){btns.forEach(function(b,j){b.classList.toggle('lit',j===i);});}
  function stop(){timers.forEach(clearTimeout);timers=[];}
  btns.forEach(function(b,i){
    ['pointerenter','pointerdown','focus'].forEach(function(n){b.addEventListener(n,function(){touched=true;stop();light(i);});});
  });
  setTimeout(function(){
    if(touched)return;
    if(reduce){light(0);return;}
    [0,1,2,3,0].forEach(function(i,n){timers.push(setTimeout(function(){light(i);},n*900));});
  },1700);
})();
