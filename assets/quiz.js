/* 免費亮點測驗（v8，2026-10-16）：8 個情境題 → 四種類型。純前端、不存任何資料。
   題目正本：firebirdusp-agent/100-todo/drafts/work-docs/2026-10-16_免費亮點測驗_題目v2.md（改題目先改正本）
   分享：結果網址帶 ?r=類型，朋友點開直接看到結果卡＋「我也來測」。分享按鈕用 xbtn.js（KokonutUI Social Button 風格）。 */
(function(){
"use strict";
var Q=[
 ['如果你的品牌是一間店，現在最像——',[
  '巷子裡的好店：吃過的都說好吃，但路過的人不知道裡面在賣什麼',
  '百貨公司的專櫃：什麼都有，客人逛一圈還是說不出你家的招牌',
  '熟客很多的老店：大家都認識老闆，但很少帶新朋友來',
  '剛裝潢好的店：門面很新，但招牌、菜單、外送平台寫的不太一樣']],
 ['客人在 LINE 群組推薦你，最可能打出哪一句？',[
  '「欸他真的很厲害，可是我也說不上來厲害在哪」',
  '「他們什麼都可以做，你問問看」',
  '「我跟老闆很熟，報我的名字」',
  '「你搜尋一下，應該找得到……吧？」']],
 ['陌生人第一次 Google 你的名字，前三個結果最可能是？',[
  '幾乎找不到，或是好幾年前的資料',
  '官網，但看完還是不知道你最擅長什麼',
  '朋友或合作夥伴的貼文提到你',
  '官網、粉專、某個平台，三個地方寫的介紹都不一樣']],
 ['你上一場一對一（或認識新朋友的聊天）結束時，對方最後一句話是？',[
  '「你們做得真好，有機會再合作」',
  '「所以你主要是做哪一塊？」',
  '「好啊，我回去想想有誰適合介紹給你」——然後就沒有然後了',
  '「你有網站嗎？我回去看看」']],
 ['被客人拿去跟同行比價時，你心裡最常的 OS 是？',[
  '「便宜的那家根本不是同一個等級」',
  '「我們服務比較完整啊，怎麼他看不出來」',
  '「如果是朋友介紹來的，就不會這樣比了」',
  '「我好像也沒跟他講清楚，我們到底差在哪」']],
 ['明天廣告預算突然多出一倍，你的第一個念頭？',[
  '「太好了，終於可以讓更多人知道我們」',
  '「先等等，我還不確定廣告要講什麼」',
  '「還是把錢花在人脈和活動上比較實在」',
  '「我的網站跟粉專先整理一下，不然客人點進來會跑掉」']],
 ['哪一句最像你的口頭禪？',[
  '「我們的客人用過都說好」',
  '「這個我們也可以做」',
  '「做生意還是要靠人脈」',
  '「等我有空再來好好整理」']],
 ['你最想被誰「主動找上門」？',[
  '還不認識你、但正在找這種服務的人',
  '願意為品質多付錢、不只比價的人',
  '能一次帶來很多生意的合作夥伴',
  '看完你的資料，就決定要找你的人']]
];
/* 選項 A／B／C／D 對應的類型（內部用）；同票時依 D → C → B → A */
var KEYS=['shop','tool','people','puzzle'], TIE=[3,2,1,0];
var R={
 shop:{emoji:'🏮',name:'深巷好店型',c:'#17B6C8',
  head:'你的東西很好，只是你要的人還沒走進這條巷子。',
  good:'口碑是真的。用過的人會回來，這是很多品牌花錢都買不到的。',
  todo:'寫下你最好的三個客人，他們「在找到你之前」都在做什麼、去哪裡、搜尋什麼。那就是你下一批客人會出現的地方。',
  next:'精準廣告投放：依真實行為，把你送到這群人面前。',href:'../services/ads.html'},
 tool:{emoji:'🧰',name:'萬用工具箱型',c:'#FFC83D',
  head:'你什麼都做得好，所以客人反而記不住你最擅長哪一個。',
  good:'能力很完整，客人找你很安心。',
  todo:'問最近一個成交的客人：「你當初為什麼選我們？」把他的原話記下來——那句話通常比你自己寫的介紹更有力。',
  next:'行銷亮點打造：找出客人選你的理由，把它放大成你的招牌。',href:'../services/highlight.html'},
 people:{emoji:'🤝',name:'好人緣老闆型',c:'#E5293F',
  head:'大家都喜歡你，只是聊完不知道怎麼幫你。',
  good:'人脈是你最大的資產，很多人願意幫你。',
  todo:'下次一對一前，先想好一句話：「我最想被介紹給＿＿＿，因為我能幫他＿＿＿。」說得出這句，對方才知道要找誰。',
  next:'商會引薦力打造：每一場一對一，讓你要的引薦對象有感。BNI 夥伴歡迎直接約一對一。',href:'../services/converter.html'},
 puzzle:{emoji:'🧩',name:'拼圖散落型',c:'#4C93FF',
  head:'你的拼圖都在，只是散在不同地方，客人拼不出完整的你。',
  good:'該有的都有了——網站、社群、名片，很多人連這些都還沒有。',
  todo:'把官網首頁、粉專簡介、名片背面放在一起看：這三個地方，講的是同一件事嗎？',
  next:'品牌亮點診斷：實際讀你所有對外素材，告訴你現在少了什麼、先補哪裡。NT$ 600 起（未稅）',href:'diagnosis.html'}
};
var root=document.getElementById('quiz');if(!root)return;
/* 記住「這是我自己測的」：只存在這台瀏覽器（不送出、不含個人資料）。分享出去的連結，朋友打開看到的是「朋友的結果」 */
var MK='fb-quiz-mine';
function mine(){try{return localStorage.getItem(MK)}catch(e){return null}}
function setMine(k){try{if(k)localStorage.setItem(MK,k);else localStorage.removeItem(MK)}catch(e){}}
var ans=[],idx=0;
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var LETTER='ABCD';

function intro(){
  root.innerHTML='<div class="qz-card qz-intro"><p class="qz-kick">FREE CHECK・2 分鐘</p><h2>你的品牌，是哪一種「好店」？</h2>'+
   '<p>8 個畫面，選最像你的那一個。測完拿一個<b>你今天就能做的小改變</b>。不用留任何資料。</p>'+
   '<button class="cta" type="button" id="qz-go">開始測驗</button></div>';
  document.getElementById('qz-go').onclick=function(){ans=[];idx=0;ask()};
}
function ask(){
  var q=Q[idx],pct=Math.round(idx/Q.length*100);
  root.innerHTML='<div class="qz-card"><div class="qz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+Q.length+'" aria-valuenow="'+idx+'"><i style="width:'+pct+'%"></i></div>'+
   '<p class="qz-step">第 '+(idx+1)+' 題／共 '+Q.length+' 題</p><h2 class="qz-q" tabindex="-1">'+esc(q[0])+'</h2><ol class="qz-opts">'+
   q[1].map(function(t,i){return '<li><button type="button" data-i="'+i+'"'+(ans[idx]===i?' class="on"':'')+'><span class="qz-l">'+LETTER[i]+'</span><span>'+esc(t)+'</span></button></li>'}).join('')+
   '</ol>'+(idx?'<button type="button" class="qz-back">← 上一題</button>':'')+'</div>';
  root.querySelector('.qz-q').focus({preventScroll:true});
  [].forEach.call(root.querySelectorAll('.qz-opts button'),function(b){b.onclick=function(){
    ans[idx]=+b.dataset.i;b.classList.add('on');
    setTimeout(function(){idx++;if(idx<Q.length)ask();else done()},180);}});
  var bk=root.querySelector('.qz-back');if(bk)bk.onclick=function(){idx--;ask()};
}
function pick(){
  var n=[0,0,0,0];ans.forEach(function(a){n[a]++});
  var best=TIE[0];TIE.forEach(function(i){if(n[i]>n[best])best=i});
  return KEYS[best];
}
function shareUrl(k){return location.origin+location.pathname+'?r='+k}
function shareText(k){var r=R[k];return '我測出來是 '+r.emoji+r.name+'：'+r.head+' 你也來測測看你的品牌是哪一種「好店」？'}
function done(){var k=pick();setMine(k);try{history.replaceState(null,'','?r='+k)}catch(e){}show(k,false)}
function show(k,friend){
  var r=R[k];
  root.innerHTML='<div class="qz-card qz-res" style="--rc:'+r.c+'">'+
   (friend?'<p class="qz-kick">朋友的測驗結果</p>':'<p class="qz-kick">你的類型</p>')+
   '<div class="qz-type"><span class="qz-emo" aria-hidden="true">'+r.emoji+'</span><h2>'+r.name+'</h2></div>'+
   '<p class="qz-head">'+esc(r.head)+'</p>'+
   '<dl class="qz-dl"><dt>你的強項</dt><dd>'+esc(r.good)+'</dd><dt>今天就能做的一件小事</dt><dd>'+esc(r.todo)+'</dd><dt>想再往前一步</dt><dd><a href="'+r.href+'">'+esc(r.next)+'</a></dd></dl>'+
   '<div class="qz-act">'+(friend?'<button class="cta" type="button" id="qz-again">我也來測</button>':
     '<span class="xb" id="qz-share"></span><span class="xcap" id="qz-cap" aria-live="polite"></span><button type="button" class="qz-redo" id="qz-again">再測一次</button>')+'</div></div>';
  document.getElementById('qz-again').onclick=function(){if(!friend)setMine(null);try{history.replaceState(null,'',location.pathname)}catch(e){}ans=[];idx=0;ask()};
  if(!friend&&window.XBTN){
    var u=shareUrl(k),t=shareText(k),I=window.XBTN.IC;
    window.XBTN.mount(document.getElementById('qz-share'),document.getElementById('qz-cap'),{label:'分享我的結果',icon:I.share,items:[
      {label:'用 LINE 分享給朋友',icon:I.line,cls:'xline',href:'https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(u)+'&text='+encodeURIComponent(t)},
      {label:'分享到 Facebook',icon:I.fb,href:'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(u)},
      {label:'複製結果連結',icon:I.link,fn:function(){window.XBTN.copy(u,'已複製結果連結，貼給朋友就能看')}},
      {label:'傳給 FireBirdUSP 聊聊',icon:I.chat,href:'../contact.html#line'}]});
  }
  if(!friend)root.scrollIntoView({behavior:'smooth',block:'start'});
}
var m=/[?&]r=(shop|tool|people|puzzle)\b/.exec(location.search);
if(m)show(m[1],mine()!==m[1]);       /* 網址的類型＝我自己測的 → 我的結果；不是 → 朋友的結果 */
else if(mine()&&R[mine()]){try{history.replaceState(null,'','?r='+mine())}catch(e){}show(mine(),false)}
else intro();
})();
