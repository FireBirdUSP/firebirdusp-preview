/* 做過免費差異化測驗的人，在其他頁左下角看到「回到我的測驗結果」（只讀這台瀏覽器記住的類型）。 */
(function(){
var N={shop:'🏮 深巷好店型',tool:'🧰 萬用工具箱型',people:'🤝 好人緣老闆型',puzzle:'🧩 拼圖散落型'},k;
try{k=localStorage.getItem('fb-quiz-mine')}catch(e){}
if(!k||!N[k]||document.getElementById('quiz'))return;
var s=(document.currentScript&&document.currentScript.src)||'',base=s.replace(/assets\/quiz-back\.js.*$/,'');
var a=document.createElement('a');a.className='qz-backchip';a.href=base+'start/free-test.html?r='+k;
a.innerHTML='<span aria-hidden="true">←</span> 回到我的測驗結果<b>'+N[k]+'</b>';
document.body.appendChild(a);
})();
