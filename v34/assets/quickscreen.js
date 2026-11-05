/* v34（2026-11-05）：整個對齊規格書第十節（免費層／付費層分界，以此為準）。
 * 免費層＝快篩分數＋三面向燈號、差異化五維＋每維一句判讀、階段標籤、AI 讀完怎麼介紹你（附一行說明：依官網文字的 AI 摘要，不是 ChatGPT 等平台實際回答客人的內容）、
 *   AI 讀不出的最多 3 件事、缺口數、最大缺口、最大機會、用詞提醒（只提醒不展開）。
 * 付費層只列名稱、不放假內容：候選亮點與定位句（含換人測試）、逐項缺口與依據、怎麼補與先後順序、5 家 AI 問答實測。
 * 拿掉（免費版做不到或不給）：5 家 AI 問答快照、讀其他通路／廣告檔案庫／落地頁／同場景對手、說法對照與換人測試、關鍵字排名、最大三個缺口。
 * 正本：firebirdusp-agent/100-todo/drafts/work-docs/2026-11-02_免費快篩_零成本架構_規格_v1.md 第十節；示範頁：同資料夾 2026-11-05_官網AI點名測驗_完整結果_lizumu1111_AI版_v1.html
 * v30｜免費快篩（嵌入式完整範例；v34 起對外改名「官網 AI 點名測驗」）：選一個虛構店家 → 掃描動畫 → 結果。
 * ⚠️ 範例，不是真的在掃使用者的網站（真的掃描需要後端）。按鈕與分享都會記錄事件，見 track.js。 */
(function () {
  var root = document.getElementById('qs-demo'); if (!root) return;
  var LINE = 'https://lin.ee/9EwP040';
  var DIMS = ['品牌亮點', '行銷亮點', '被看見', '被記得', '被選擇'];
  var FACETS = ['官網結構', '追蹤數據', '內容與通路'];
  var LAMP = { g: '良好', y: '要注意', r: '先補這裡' };
  var LOCKED = ['候選亮點與定位句（含換人測試）', '逐項缺口與依據', '怎麼補與先後順序', '5 家 AI 問答實測'];
  // f：三面向燈號［燈色, 缺口數］；dm／rd：五維分數與一句判讀；st：階段標籤＋一句說明；sum：AI 摘要；cant：AI 讀不出的事（最多 3 件）
  var D = [
    { n: '小農選物店', t: '電商・選物', url: 'xiaonong-demo.example.tw', q: 62, f: [['y', 3], ['r', 2], ['y', 2]],
      dm: [78, 60, 45, 35, 58],
      rd: ['堅持用台灣小農原料、手工小批生產，是同行少有的堅持；但只寫在「關於我們」最下面。',
        '商品、價格、運費都清楚；送禮方案與成分說明放在圖片裡，客人搜不到。',
        '38 款商品中有 26 款的成分與容量只在圖片裡，搜尋與 AI 都讀不到。',
        '首頁第一句「用心手作，每一口都是幸福」，換成別家也成立，客人很難複述。',
        '有退換貨說明與顧客回饋；缺少「和一般堅果塔差在哪」。'],
      st: ['有料，還沒被說成一句話', '原料與做法是真的好，下一步是讓客人一句話講得出你。'],
      sum: '小農選物店是販售手作堅果塔與台灣小農食材禮盒的網路商店，主打手工小批生產。',
      cant: ['保存方式與期限：商品頁沒有文字說明', '出貨時間：下單後幾天出貨，首頁與商品頁都沒寫', '和一般堅果塔差在哪：原料來源只在圖片裡'],
      gap: '38 款商品中，有 26 款的成分與容量只放在圖片裡，搜尋與 AI 都讀不到。',
      opp: '把「台灣小農原料＋手工小批」寫成首頁第一句話，讓客人一句話就講得出你。',
      warn: '商品頁的「零添加」，建議確認是否有檢驗或標示依據。' },
    { n: '康寧牙醫診所', t: '診所・在地服務', url: 'kangning-dental.example.tw', q: 68, f: [['g', 1], ['y', 2], ['y', 2]],
      dm: [62, 55, 70, 42, 50],
      rd: ['兒童牙科與舒眠治療都有，但沒有說清楚最擅長哪一塊。',
        '療程項目列得完整，但只有圖片，沒有文字說明與費用區間。',
        '標題、描述、地址與電話都齊全，搜尋與地圖的基礎很好。',
        '首頁第一句「專業、親切、無痛治療」，附近每家診所都能這樣說。',
        '有醫師學經歷；缺少看診流程與第一次來要準備什麼。'],
      st: ['找得到，還沒被記住', '搜尋的基礎好，下一步是讓家長說得出你跟附近診所的差別。'],
      sum: '康寧牙醫診所是位於新竹的牙醫診所，提供一般牙科、兒童牙科與植牙等療程。',
      cant: ['兒童牙科的特色：有這個項目，但沒寫跟別家差在哪', '怎麼預約：要不要預約、怎麼預約，首頁沒寫', '費用：沒有任何費用區間或健保說明'],
      gap: '療程說明只有圖片，搜尋與 AI 讀不到任何文字。',
      opp: '把兒童牙科的做法寫成首頁第一句話，讓家長一搜就想到你。',
      warn: '首頁的「無痛治療」，建議確認是否符合醫療廣告規範。' },
    { n: '林顧問工作室', t: '專業顧問・個人品牌', url: 'lin-consult.example.tw', q: 52, f: [['y', 3], ['r', 3], ['r', 3]],
      dm: [60, 40, 35, 30, 45],
      rd: ['有十年實戰經驗與自己的方法，但沒有一句話說清楚。',
        '服務項目寫得很籠統，客人看不出該找哪一項、怎麼計費。',
        '標題只有「首頁」，描述欄空白，搜尋與 AI 很難判斷你在做什麼。',
        '首頁第一句「專注中小企業的行銷顧問」，換成別的顧問也成立。',
        '有合作過的企業名稱；缺少案例前後對照與客戶回饋。'],
      st: ['有實力，還沒被看見', '經驗是真的，下一步是讓搜尋與 AI 讀得懂你在做什麼。'],
      sum: '林顧問工作室提供中小企業行銷顧問服務，內容包含行銷規劃與教育訓練。',
      cant: ['幫誰解決什麼問題：服務對象與成果都沒寫清楚', '怎麼合作：一次性諮詢還是長期顧問，官網沒寫', '做過什麼：案例只有企業名稱，沒有前後對照'],
      gap: '官網沒有說清楚你幫誰解決什麼問題，第一次來的人看完還是不知道該不該找你。',
      opp: '把一個代表案例整理成「誰、卡在哪、做了什麼、變多少」，放在首頁第一屏。',
      warn: '' }
  ];
  var STEPS = ['讀取官網首頁與 4 個頁面', '檢查標題、描述與網站結構', '測試 13 種 AI 爬蟲讀不讀得到', '偵測追蹤碼與聯絡資訊', 'AI 讀官網文字，判讀差異化五維', '算出快篩分數與五維分數'];
  var cur = 0, busy = false, seen = false;
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function T(n, p) { if (window.fbTrack) window.fbTrack(n, p); }
  function avg(a) { var s = 0; a.forEach(function (x) { s += x; }); return Math.round(s / a.length); }

  function radar(labels, vals, cls) {
    var n = vals.length, cx = 140, cy = 98, R = 62, i, ang, o = '<svg viewBox="0 0 280 200" class="qw-radar" role="img" aria-label="雷達圖示意">';
    [1, .5].forEach(function (k) { var p = []; for (i = 0; i < n; i++) { ang = -Math.PI / 2 + i * 2 * Math.PI / n; p.push((cx + R * k * Math.cos(ang)).toFixed(1) + ',' + (cy + R * k * Math.sin(ang)).toFixed(1)); } o += '<polygon points="' + p.join(' ') + '" fill="none" stroke="#C9D8F2" stroke-width="1.2"/>'; });
    var dp = []; for (i = 0; i < n; i++) { ang = -Math.PI / 2 + i * 2 * Math.PI / n; var r = R * vals[i] / 100; dp.push((cx + r * Math.cos(ang)).toFixed(1) + ',' + (cy + r * Math.sin(ang)).toFixed(1));
      o += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R * Math.cos(ang)).toFixed(1) + '" y2="' + (cy + R * Math.sin(ang)).toFixed(1) + '" stroke="#DCE6F8"/>';
      var lx = cx + (R + 15) * Math.cos(ang), ly = cy + (R + 15) * Math.sin(ang) + 3, an = Math.abs(Math.cos(ang)) < .3 ? 'middle' : (Math.cos(ang) > 0 ? 'start' : 'end');
      o += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" font-size="9.5" fill="#5C4F58" text-anchor="' + an + '">' + labels[i] + '</text>'; }
    o += '<polygon class="' + cls + '" points="' + dp.join(' ') + '" fill="#2B63D6" fill-opacity=".28" stroke="#2B63D6" stroke-width="2.5" stroke-linejoin="round" style="transform-origin:140px 98px;transform:scale(0);transition:transform 1s ease"/></svg>';
    return o;
  }
  function ring(v, big, small, cls) {
    return '<div class="qw-ringbox"><svg viewBox="0 0 120 120" width="118" height="118" role="img" aria-label="' + big + ' ' + v + ' 分"><circle cx="60" cy="60" r="52" fill="none" stroke="#DCE8FF" stroke-width="12"/><circle class="' + cls + '" cx="60" cy="60" r="52" fill="none" stroke="#4C93FF" stroke-width="12" stroke-linecap="round" stroke-dasharray="0 326.7" transform="rotate(-90 60 60)" style="transition:stroke-dasharray 1.1s ease" data-v="' + v + '"/><text class="qw-num" data-v="' + v + '" x="60" y="69" text-anchor="middle" font-size="30" font-weight="800" fill="#1F4FA8">0</text></svg><div><b>' + big + '</b><p>' + small + '</p></div></div>';
  }

  root.innerHTML =
    '<p class="qw-t">選一個範例，看測驗長什麼樣</p>' +
    '<div class="qw-pick" role="group" aria-label="選一個範例店家">' + D.map(function (d, i) { return '<button type="button" class="qw-chip' + (i ? '' : ' on') + '" data-i="' + i + '"><b>' + d.n + '</b><span>' + d.t + '</span></button>'; }).join('') + '</div>' +
    '<div class="qw-inputbox" aria-hidden="true"><span>貼上你的官網連結</span><b class="qw-url"></b></div>' +
    '<div class="qw-run"><button type="button" class="cta qw-go" data-track="qs_start_demo" data-label="開始測驗範例">開始測驗</button><span class="qw-hint">不用填問卷。示範用的是虛構店家</span></div>' +
    '<div class="qw-scan" hidden><ul class="qw-steps"></ul><div class="qw-bar"><i></i></div></div>' +
    '<div class="qw-result" hidden></div>' +
    '<div class="qw-actions" hidden>' +
    '<a class="cta line-btn qw-line" href="' + LINE + '" target="_blank" rel="noopener" data-track="qs_cta_line" data-label="測我的官網">加 LINE，測我的官網</a>' +
    '<a class="cta ghost qw-share" target="_blank" rel="noopener" data-track="qs_share_line" data-label="分享到 LINE">分享到 LINE</a>' +
    '<button type="button" class="cta ghost qw-copy" data-track="qs_share_copy" data-label="複製連結">複製連結</button>' +
    '<a class="qw-full" href="#full-report" data-track="qs_see_full" data-label="看完整報告長怎樣">看完整報告長怎樣 ↓</a></div>';

  var $ = function (s) { return root.querySelector(s); };
  var scan = $('.qw-scan'), steps = $('.qw-steps'), bar = $('.qw-bar i'), res = $('.qw-result'), act = $('.qw-actions'), go = $('.qw-go'), urlEl = $('.qw-url');
  $('.qw-share').href = 'https://line.me/R/msg/text/?' + encodeURIComponent('我看了一個免費的官網 AI 點名測驗範例，蠻有意思：' + location.href.split('#')[0]);
  [].forEach.call(root.querySelectorAll('.qw-chip'), function (b) {
    b.addEventListener('click', function () {
      if (busy) return; cur = +b.getAttribute('data-i'); urlEl.textContent = D[cur].url;
      [].forEach.call(root.querySelectorAll('.qw-chip'), function (x) { x.classList.toggle('on', x === b); });
      scan.hidden = true; res.hidden = true; act.hidden = true; T('qs_pick_demo', { label: D[cur].n });
    });
  });
  urlEl.textContent = D[0].url;
  $('.qw-copy').addEventListener('click', function () {
    var b = this, u = location.href.split('#')[0];
    function done() { b.textContent = '已複製'; setTimeout(function () { b.textContent = '複製連結'; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done, done); else done();
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting && !seen) { seen = true; T('qs_demo_view', { label: 'widget' }); o.disconnect(); } }, { threshold: .4 }).observe(root);

  function result(d) {
    var five = avg(d.dm), gaps = d.f.reduce(function (s, x) { return s + x[1]; }, 0);
    var lamps = '<div class="fr-lights qw-lamps">' + FACETS.map(function (a, i) { return '<span class="' + d.f[i][0] + '" title="' + LAMP[d.f[i][0]] + '">' + a + '｜缺 ' + d.f[i][1] + '</span>'; }).join('') + '</div>';
    var dims = DIMS.map(function (a, i) {
      return '<div class="qw-dimr"><div class="qw-dim"><b>' + a + '</b><div class="tr"><i class="' + (d.dm[i] <= 40 ? 'low' : '') + '" data-w="' + d.dm[i] + '"></i></div><b>' + d.dm[i] + '</b></div><p>' + esc(d.rd[i]) + '</p></div>';
    }).join('');
    res.innerHTML =
      '<h4 class="qw-h"><span class="qw-rib">免費結果</span>' + esc(d.n) + '｜' + esc(d.url) + '</h4>' +
      '<div class="qw-grid">' +
        '<div class="qw-box">' + ring(d.q, '快篩分數', '找得到、看得懂（自動檢查 22 項）', 'qw-ring') + lamps +
          '<div class="qw-gapnum"><b class="qw-cnt" data-v="' + gaps + '">0</b><span>個缺口（三個面向加起來）</span></div></div>' +
        '<div class="qw-box">' + ring(five, '差異化五維', '記得住、會被選（AI 自動分析）', 'qw-ring2') +
          '<p class="qw-stage"><b>目前階段：' + esc(d.st[0]) + '</b><span>' + esc(d.st[1]) + '</span></p></div>' +
      '</div>' +
      '<div class="qw-box"><b>AI 讀完你的官網，會這樣介紹你</b><blockquote class="qw-quote">「' + esc(d.sum) + '」</blockquote>' +
        '<b>AI 讀完還是回答不出的 ' + d.cant.length + ' 件事</b><ol class="qw-cant">' + d.cant.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol>' +
        '<small class="qw-note">依你的官網文字由 AI 摘要，不是 ChatGPT 等 AI 平台實際回答客人的內容；那要看付費診斷的 5 家 AI 問答實測。</small></div>' +
      '<div class="qw-box"><b>差異化五維｜每一維一句判讀</b>' + radar(DIMS, d.dm, 'qw-rad2') + dims + '</div>' +
      '<div class="qw-two qw-pair"><div class="qw-foc"><b>最大缺口</b><span>' + esc(d.gap) + '</span></div><div class="qw-str"><b>最大機會</b><span>' + esc(d.opp) + '</span></div></div>' +
      (d.warn ? '<p class="qw-warn"><b>用詞提醒</b><span>' + esc(d.warn) + '</span></p>' : '') +
      '<div class="qw-locks"><b>🔒 付費診斷才有</b><ul>' + LOCKED.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    res.hidden = false;
    requestAnimationFrame(function () {
      [].forEach.call(res.querySelectorAll('circle[data-v]'), function (c) { c.setAttribute('stroke-dasharray', (326.7 * (+c.getAttribute('data-v')) / 100).toFixed(1) + ' 326.7'); });
      [].forEach.call(res.querySelectorAll('.qw-radar polygon[style]'), function (p) { p.style.transform = 'scale(1)'; });
      [].forEach.call(res.querySelectorAll('.qw-dim i'), function (i) { i.style.width = i.getAttribute('data-w') + '%'; });
    });
    var t0 = null, nums = [].slice.call(res.querySelectorAll('.qw-num,.qw-cnt'));
    function tick(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1100); nums.forEach(function (n) { n.textContent = Math.round(+n.getAttribute('data-v') * k); }); if (k < 1) requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  }
  go.addEventListener('click', function () {
    if (busy) return; busy = true; go.disabled = true; res.hidden = true; act.hidden = true;
    var d = D[cur];
    steps.innerHTML = STEPS.map(function (s) { return '<li>' + s + '</li>'; }).join(''); scan.hidden = false; bar.style.width = '0%';
    var lis = [].slice.call(steps.children), i = 0;
    (function next() {
      if (i > 0) lis[i - 1].className = 'ok';
      bar.style.width = Math.round(i / lis.length * 100) + '%';
      if (i < lis.length) { lis[i].className = 'run'; i++; setTimeout(next, 420); return; }
      bar.style.width = '100%'; busy = false; go.disabled = false; go.textContent = '再看一個範例'; result(d); act.hidden = false; T('qs_demo_done', { label: d.n });
    })();
  });
})();
