/* v30｜免費快篩（嵌入式完整範例）：選一個虛構店家 → 掃描動畫 → 快篩 A（基本盤）＋快篩 B（差異化）。
 * ⚠️ 範例，不是真的在掃使用者的網站（真的掃描需要後端）。按鈕與分享都會記錄事件，見 track.js。 */
(function () {
  var root = document.getElementById('qs-demo'); if (!root) return;
  var LINE = 'https://lin.ee/9EwP040';
  var AREAS = ['官網結構', '商品與服務資料', 'AI 可見度', '搜尋與關鍵字', '追蹤與數據', '通路一致性', '社群與內容', '公司與聯絡資訊'];
  var DIMS = ['品牌亮點', '被看見', '被理解', '被記得', '被選擇'];
  var AIS = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Copilot'];
  var PILL = { ok: '提到', part: '描述不完整', miss: '未提到', na: '資料不足' };
  var D = [
    { n: '小農選物店', t: '電商・選物', scan: '讀取官網（17 頁、38 款商品）', ar: [70, 38, 45, 60, 72, 55, 80, 66], gaps: 7,
      g: [['38 款商品中，有 26 款的成分與容量只放在圖片裡', 'AI 與搜尋引擎讀不到，客人也不能搜尋或複製。', '依據：官網商品頁原始碼與圖片比對'], ['官網、蝦皮、momo 有 7 款價格不同'], ['追蹤碼只到位 3／5 項']],
      q: '「推薦台北做手作堅果塔的品牌」', ai: ['ok', 'part', 'miss', 'miss', 'na'],
      t1: [['3／5', '追蹤碼到位'], ['4 項', 'SEO 基本功缺漏'], ['6／20', '關鍵字前 20 沒出現'], ['3 項', 'AI 搜尋就緒缺漏']],
      dm: [78, 55, 60, 35, 50], stuck: ['被記得（35）', '各地方的自我介紹還沒統一。'], strong: ['品牌亮點（78）', '有一段同行講不了的堅持。'],
      v: [['官網首頁', '用心手作，每一口都是幸福'], ['粉專簡介', '來自小農的好味道'], ['蝦皮商店', '嚴選台灣在地食材']], vn: 13,
      t2: [['3／8', '廣告落地頁承接得好'], ['2 條', '導外連結走不通或有問題'], ['4 家', '同場景對手'], ['21／38', '商品化到位']] },
    { n: '康寧牙醫診所', t: '診所・在地服務', scan: '讀取官網（9 頁、12 項療程）', ar: [74, 66, 52, 70, 60, 48, 64, 78], gaps: 5,
      g: [['Google 商家與官網的診療時間不同', '客人臨時查詢時，會看到兩種答案。', '依據：Google 商家頁與官網頁面比對'], ['官網沒有各項療程的文字說明，只有圖片'], ['追蹤碼只到位 2／5 項']],
      q: '「推薦新竹的兒童牙科診所」', ai: ['ok', 'ok', 'part', 'miss', 'na'],
      t1: [['2／5', '追蹤碼到位'], ['3 項', 'SEO 基本功缺漏'], ['8／20', '關鍵字前 20 沒出現'], ['2 項', 'AI 搜尋就緒缺漏']],
      dm: [70, 70, 50, 42, 45], stuck: ['被記得（42）', '客人說不出你跟別家差在哪。'], strong: ['被看見（70）', '地圖與評價的基礎很好。'],
      v: [['官網首頁', '專業、親切、無痛治療'], ['Google 商家', '新竹在地二十年牙醫'], ['粉專簡介', '讓每個人都能笑得自在']], vn: 9,
      t2: [['2／6', '廣告落地頁承接得好'], ['1 條', '導外連結走不通或有問題'], ['5 家', '同場景對手'], ['5／9', '服務項目化到位']] },
    { n: '林顧問工作室', t: '專業顧問・個人品牌', scan: '讀取官網（6 頁）與 LinkedIn', ar: [58, 40, 35, 52, 44, 38, 66, 60], gaps: 9,
      g: [['官網沒有說清楚你幫誰解決什麼問題', '第一次來的人，看完還是不知道該不該找你。', '依據：官網首頁與服務頁的文字比對'], ['案例沒有被整理成別人能轉述的說法'], ['LinkedIn 與官網的自我介紹不同']],
      q: '「推薦做中小企業行銷的顧問」', ai: ['miss', 'miss', 'part', 'miss', 'na'],
      t1: [['1／5', '追蹤碼到位'], ['6 項', 'SEO 基本功缺漏'], ['14／20', '關鍵字前 20 沒出現'], ['5 項', 'AI 搜尋就緒缺漏']],
      dm: [60, 40, 45, 30, 35], stuck: ['被記得（30）', '案例沒被整理成別人能轉述的說法。'], strong: ['品牌亮點（60）', '有實戰經驗與自己的方法。'],
      v: [['官網首頁', '專注中小企業的行銷顧問'], ['LinkedIn', '幫企業找到成長的下一步'], ['粉專簡介', '讓行銷更簡單']], vn: 7,
      t2: [['0／3', '廣告落地頁承接得好'], ['1 條', '導外連結走不通或有問題'], ['3 家', '同場景對手'], ['2／4', '服務化到位']] }
  ];
  var STEPS = ['讀取官網與粉專', '讀取其他通路與公開資料', '偵測追蹤碼，並翻廣告檔案庫', '點進廣告與導外連結的落地頁', '比對各處價格、名稱、第一句話', '找同場景對手並比較', '用 AI 問答測試是否被提到', '計算地基與差異化分數'];
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
  function teasers(a) { return '<div class="qw-teasers">' + a.map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div>'; }
  var LOCK = '<div class="qw-lockrow" aria-hidden="true"><i></i><i></i></div>';

  root.innerHTML =
    '<p class="qw-t">選一個範例，看快篩長什麼樣</p>' +
    '<div class="qw-pick" role="group" aria-label="選一個範例店家">' + D.map(function (d, i) { return '<button type="button" class="qw-chip' + (i ? '' : ' on') + '" data-i="' + i + '"><b>' + d.n + '</b><span>' + d.t + '</span></button>'; }).join('') + '</div>' +
    '<div class="qw-inputbox" aria-hidden="true"><span>貼上一個連結（官網或粉專擇一）</span><b class="qw-url">hesui-demo.example.tw</b></div>' +
    '<div class="qw-run"><button type="button" class="cta qw-go" data-track="qs_start_demo" data-label="開始快篩範例">開始快篩</button><span class="qw-hint">約一分鐘，不用填問卷。示範用的是虛構店家</span></div>' +
    '<div class="qw-scan" hidden><ul class="qw-steps"></ul><div class="qw-bar"><i></i></div></div>' +
    '<div class="qw-result" hidden></div>' +
    '<div class="qw-actions" hidden>' +
    '<a class="cta line-btn qw-line" href="' + LINE + '" target="_blank" rel="noopener" data-track="qs_cta_line" data-label="快篩我的網站">加 LINE，快篩我的網站</a>' +
    '<a class="cta ghost qw-share" target="_blank" rel="noopener" data-track="qs_share_line" data-label="分享到 LINE">分享到 LINE</a>' +
    '<button type="button" class="cta ghost qw-copy" data-track="qs_share_copy" data-label="複製連結">複製連結</button>' +
    '<a class="qw-full" href="#full-report" data-track="qs_see_full" data-label="看完整報告長怎樣">看完整報告長怎樣 ↓</a></div>';

  var $ = function (s) { return root.querySelector(s); };
  var scan = $('.qw-scan'), steps = $('.qw-steps'), bar = $('.qw-bar i'), res = $('.qw-result'), act = $('.qw-actions'), go = $('.qw-go'), urlEl = $('.qw-url');
  var URLS = ['xiaonong-demo.example.tw', 'kangning-dental.example.tw', 'lin-consult.example.tw'];
  $('.qw-share').href = 'https://line.me/R/msg/text/?' + encodeURIComponent('我看了一個免費的品牌快篩範例，蠻有意思：' + location.href.split('#')[0]);
  [].forEach.call(root.querySelectorAll('.qw-chip'), function (b) {
    b.addEventListener('click', function () {
      if (busy) return; cur = +b.getAttribute('data-i'); urlEl.textContent = URLS[cur];
      [].forEach.call(root.querySelectorAll('.qw-chip'), function (x) { x.classList.toggle('on', x === b); });
      scan.hidden = true; res.hidden = true; act.hidden = true; T('qs_pick_demo', { label: D[cur].n });
    });
  });
  urlEl.textContent = URLS[0];
  $('.qw-copy').addEventListener('click', function () {
    var b = this, u = location.href.split('#')[0];
    function done() { b.textContent = '已複製'; setTimeout(function () { b.textContent = '複製連結'; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done, done); else done();
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting && !seen) { seen = true; T('qs_demo_view', { label: 'widget' }); o.disconnect(); } }, { threshold: .4 }).observe(root);

  function result(d) {
    var base = avg(d.ar), tot = avg(d.dm), sw = false;
    var gh = d.g.map(function (g, i) {
      return '<div class="qw-gap' + (i ? ' lk' : '') + '"><h5>' + (i + 1) + '. ' + esc(g[0]) + '</h5>' + (i ? LOCK + '<small>代表什麼、依據與補法，在完整報告</small>' : '<p>' + esc(g[1]) + '</p><small>' + esc(g[2]) + '</small>') + '</div>';
    }).join('');
    var ai = '<table class="qw-tbl"><thead><tr>' + AIS.map(function (a) { return '<th>' + a + '</th>'; }).join('') + '</tr></thead><tbody><tr>' + d.ai.map(function (v) { return '<td><span class="pl ' + v + '">' + PILL[v] + '</span></td>'; }).join('') + '</tr></tbody></table>';
    var bars = AREAS.map(function (a, i) { return '<div class="qw-dim"><b>' + a + '</b><div class="tr"><i class="' + (d.ar[i] <= 40 ? 'low' : '') + '" data-w="' + d.ar[i] + '"></i></div><b>' + d.ar[i] + '</b></div>'; }).join('');
    var vh = d.v.map(function (x) { return '<li><span>' + x[0] + '</span>「' + esc(x[1]) + '」</li>'; }).join('');
    res.innerHTML =
      '<h4 class="qw-h"><span class="qw-rib">地基</span>快篩 A：基本盤（查不查得到、看不看得懂）</h4>' +
      '<div class="qw-grid"><div class="qw-box">' + radar(AREAS.map(function (a) { return a.length > 6 ? a.slice(0, 5) : a; }), d.ar, 'qw-rad') + '</div>' +
      '<div class="qw-box">' + ring(base, '基本盤完整度', '八個面向的平均', 'qw-ring') + bars + '</div></div>' +
      '<div class="qw-box"><div class="qw-gapnum"><b class="qw-cnt" data-v="' + d.gaps + '">0</b><span>個缺口（「缺」與「部分」都算）</span></div><p class="qw-sub">先看最大的三個：</p>' + gh + '</div>' +
      '<div class="qw-box"><b>AI 問答快照（問 1 題，看 5 家 AI）</b><p class="qw-sub">' + esc(d.q) + '（示意；每次回答會不同）</p>' + ai + '<small class="qw-note">另外 2 題（介紹你、與同行比較）與原因，在完整報告。</small></div>' + teasers(d.t1) +
      '<h4 class="qw-h"><span class="qw-rib d">差異化</span>快篩 B：別人說不說得出你不一樣</h4>' +
      '<div class="qw-grid"><div class="qw-box">' + radar(DIMS, d.dm, 'qw-rad2') + '</div>' +
      '<div class="qw-box">' + ring(tot, '亮點完成度', '五個面向的概況', 'qw-ring2') + '<div class="qw-two"><div class="qw-foc"><b>卡點：' + d.stuck[0] + '</b><span>' + esc(d.stuck[1]) + '</span></div><div class="qw-str"><b>強項：' + d.strong[0] + '</b><span>' + esc(d.strong[1]) + '</span></div></div></div></div>' +
      '<div class="qw-box"><b>說法對照：' + d.vn + ' 個地方，' + d.vn + ' 種第一句話（先看 3 個）</b><ul class="qw-voices">' + vh + '</ul>' +
      '<button type="button" class="cta ghost qw-swap" data-track="qs_swap_test" data-label="換人測試">換人測試：把「' + esc(d.n) + '」換成同行 →</button><div class="qw-swapbox" aria-live="polite">「<mark>' + esc(d.n) + '</mark>：' + esc(d.v[0][1]) + '」</div><small class="qw-note">其餘 ' + (d.vn - 3) + ' 個地方、說法重疊度與卡在哪，在完整報告。</small></div>' + teasers(d.t2) +
      '<p class="qw-lock">🔒 完整報告才會告訴你：每個缺口的依據、先做哪一件、30 天規劃與完成標準。</p>';
    res.hidden = false;
    var sw2 = res.querySelector('.qw-swap'), box = res.querySelector('.qw-swapbox');
    sw2.addEventListener('click', function () {
      sw = !sw;
      box.innerHTML = sw ? '「<mark>同行 A</mark>：' + esc(d.v[0][1]) + '」<br><small>這句話一樣成立。</small>' : '「<mark>' + esc(d.n) + '</mark>：' + esc(d.v[0][1]) + '」';
      sw2.textContent = sw ? '換回「' + d.n + '」' : '換人測試：把「' + d.n + '」換成同行 →';
    });
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
    var d = D[cur], list = STEPS.slice(); list[0] = d.scan;
    steps.innerHTML = list.map(function (s) { return '<li>' + s + '</li>'; }).join(''); scan.hidden = false; bar.style.width = '0%';
    var lis = [].slice.call(steps.children), i = 0;
    (function next() {
      if (i > 0) lis[i - 1].className = 'ok';
      bar.style.width = Math.round(i / lis.length * 100) + '%';
      if (i < lis.length) { lis[i].className = 'run'; i++; setTimeout(next, 420); return; }
      bar.style.width = '100%'; busy = false; go.disabled = false; go.textContent = '再看一個範例'; result(d); act.hidden = false; T('qs_demo_done', { label: d.n });
    })();
  });
})();
