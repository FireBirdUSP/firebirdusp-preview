/* FireBirdUSP v24｜全站工具：站內搜尋＋Cookie 設定（不依賴任何套件）
 * 搜尋：讀 assets/search-index.json（由 build.js 產生），比對標題與內文
 * Cookie：第一次進站顯示提示；選擇存在 localStorage「fb-consent」（necessary 永遠開、analytics、ads）
 *   ⚠️ 目前網站沒有安裝任何分析或廣告追蹤；之後要裝，請在 window.fbConsent.has('analytics') 為 true 時才載入 */
(function () {
  var me = document.currentScript, ROOT = me ? me.src.replace(/assets\/site-tools\.js.*$/, '') : '';
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ── 站內搜尋 ── */
  // v34：範例改成可點的關鍵字，每一個都會帶到主力產品頁（拿掉「退費」）；點擊會記錄 search_sample 事件
  var SAMPLES = ['AI 點名測驗', '被比價', '沒人介紹', 'BNI'];
  var HINT = '<p class="st-hint">不知道從哪裡找？點一個試試：</p><div class="st-chips">' + SAMPLES.map(function (s) { return '<button type="button" class="st-chip" data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>';
  // v34：同分時主力產品頁排前面（只在同分時有作用，不會蓋過標題命中）
  var PRI = { 'start/free-test.html': .3, 'start/diagnosis.html': .25, 'services/converter.html': .2 };
  var ov, input, res, idx = null, lastFocus = null;
  function build() {
    ov = document.createElement('div'); ov.className = 'st-ov'; ov.hidden = true;
    ov.innerHTML = '<div class="st-box" role="dialog" aria-modal="true" aria-label="搜尋網站"><div class="st-in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" placeholder="搜尋服務、案例、常見問題…" aria-label="搜尋網站" autocomplete="off"><button type="button" class="st-x">關閉</button></div><div class="st-res" aria-live="polite">' + HINT + '</div></div>';
    document.body.appendChild(ov);
    input = ov.querySelector('input'); res = ov.querySelector('.st-res');
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.st-x').addEventListener('click', close);
    input.addEventListener('input', run);
    res.addEventListener('click', function (e) { var b = e.target.closest('.st-chip'); if (!b) return; input.value = b.getAttribute('data-q'); run(); input.focus(); if (window.fbTrack) window.fbTrack('search_sample', { label: input.value }); });
  }
  function open() {
    if (!ov) build(); lastFocus = document.activeElement; ov.hidden = false; input.value = ''; input.focus(); run();
    if (!idx) fetch(ROOT + 'assets/search-index.json').then(function (r) { return r.json(); }).then(function (j) { idx = j; run(); }).catch(function () { res.innerHTML = '<p class="st-hint">搜尋暫時無法使用，請改用上方選單。</p>'; });
  }
  function close() { ov.hidden = true; if (lastFocus) lastFocus.focus(); }
  function run() {
    var q = input.value.trim();
    if (!q) { res.innerHTML = HINT; return; }
    if (!idx) { res.innerHTML = '<p class="st-hint">讀取中…</p>'; return; }
    var words = q.split(/\s+/).filter(Boolean), out = [];
    idx.forEach(function (p) {
      var hay = p.t + ' ' + p.x, score = 0, ok = words.every(function (w) { var i = hay.indexOf(w); if (i < 0) return false; score += (p.t.indexOf(w) >= 0 ? 10 : 1); return true; });
      if (!ok) return;
      score += PRI[p.u] || 0;
      var at = p.x.indexOf(words[0]), from = Math.max(0, at - 30), snip = (from ? '…' : '') + p.x.slice(from, from + 90) + '…';
      out.push({ p: p, s: score, snip: snip });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    if (!out.length) { res.innerHTML = '<p class="st-hint">找不到「' + esc(q) + '」，換個說法試試，或直接加 LINE 問我們。</p>'; return; }
    var re = new RegExp('(' + words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'g');
    res.innerHTML = out.slice(0, 12).map(function (o) { return '<a href="' + ROOT + o.p.u + '"><b>' + esc(o.p.t).replace(re, '<mark>$1</mark>') + '</b><span>' + esc(o.snip).replace(re, '<mark>$1</mark>') + '</span></a>'; }).join('');
  }
  document.addEventListener('click', function (e) { if (e.target.closest('[data-site-search]')) { e.preventDefault(); open(); } });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ov && !ov.hidden) close();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
  });

  /* ── Cookie 設定 ── */
  var KEY = 'fb-consent';
  function get() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(a, d) { var v = { necessary: true, analytics: !!a, ads: !!d, at: new Date().toISOString() }; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} hide(); document.dispatchEvent(new CustomEvent('fb:consent', { detail: v })); }
  window.fbConsent = { get: get, has: function (k) { var v = get(); return !!(v && v[k]); }, open: function () { show(true); } };
  var ck;
  function show(detail) {
    if (!ck) { ck = document.createElement('div'); ck.className = 'st-ck'; ck.setAttribute('role', 'dialog'); ck.setAttribute('aria-label', 'Cookie 設定'); document.body.appendChild(ck); }
    var v = get() || { analytics: false, ads: false };
    ck.innerHTML = '<p><b>我們使用 Cookie</b>　必要的 Cookie 讓網站正常運作；分析與廣告 Cookie 只會在你同意後才啟用，不同意也不影響瀏覽。詳見<a href="' + ROOT + 'cookies.html">《Cookie 政策》</a>。</p>' +
      (detail ? '<div class="st-ckset"><label><input type="checkbox" checked disabled><span><b>必要</b><small>網站運作、記住你的選擇，無法關閉</small></span></label><label><input type="checkbox" data-k="analytics"' + (v.analytics ? ' checked' : '') + '><span><b>分析</b><small>了解大家怎麼使用網站，讓內容更好找</small></span></label><label><input type="checkbox" data-k="ads"' + (v.ads ? ' checked' : '') + '><span><b>廣告</b><small>衡量廣告成效，讓你看到比較相關的內容</small></span></label></div>' : '') +
      '<div class="row">' + (detail ? '<button type="button" class="st-btn" data-ck="saveSel">儲存我的選擇</button>' : '<button type="button" class="st-btn" data-ck="detail">自訂設定</button><button type="button" class="st-btn" data-ck="min">只用必要的</button>') + '<button type="button" class="st-btn pri" data-ck="all">全部接受</button></div>';
    ck.hidden = false;
  }
  function hide() { if (ck) ck.hidden = true; }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ck]');
    if (b) { var a = b.dataset.ck;
      if (a === 'all') save(true, true); else if (a === 'min') save(false, false); else if (a === 'detail') show(true);
      else if (a === 'saveSel') save(ck.querySelector('[data-k=analytics]').checked, ck.querySelector('[data-k=ads]').checked); return; }
    if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); show(true); }
  });
  function boot() { if (!get()) show(false); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

/* ── v35：浮動「加 LINE，測我的官網」按鈕 ──
   捲過頁首區塊才出現；捲到頁尾收尾區塊（#cta-end 或最後的 .band）就收起來，不重複擋畫面 */
(function () {
  var f = document.querySelector('.cta-float'); if (!f) return;
  var hero = document.querySelector('.ph'), bands = document.querySelectorAll('.band'),
      end = document.getElementById('cta-end') || bands[bands.length - 1];
  if (!hero) { f.classList.add('on'); return; }
  // 用捲動位置判斷（只量兩個元素，很輕）：頁首區塊整個捲出畫面才出現；收尾區塊頂端進入畫面就收起
  function upd() {
    var heroOut = hero.getBoundingClientRect().bottom < 0;
    var endIn = end ? end.getBoundingClientRect().top < window.innerHeight : false;
    f.classList.toggle('on', heroOut && !endIn);
  }
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  upd();
})();

/* v53｜LINE 加好友：電腦＝站內 QR 視窗（關閉就回原頁，不跳去 LINE 的灰底頁）；手機＝直接開 LINE。按鈕加上 @帳號 */
(function () {
  var ID = '@863kwdcv', URL = 'https://lin.ee/9EwP040';
  var tag = document.querySelector('script[src*="site-tools.js"]');
  var base = tag ? tag.src.replace(/site-tools\.js.*$/, '') : 'assets/';
  var QR = base + 'line-qr-official.jpg';
  var mqDesk = window.matchMedia('(min-width:701px) and (hover:hover) and (pointer:fine)');
  var css = document.createElement('style');
  css.textContent =
    '.line-id{display:inline-block;margin-left:2px;padding:2px 9px;border-radius:999px;background:rgba(255,255,255,.24);font-size:.82em;font-weight:700;letter-spacing:.02em}' +
    '.lm{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(80,14,60,.5);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '.lm.on{display:flex;animation:lmin .25s ease both}' +
    '.lm-card{position:relative;width:min(400px,100%);background:#fff;border-radius:24px;overflow:hidden;text-align:center;padding:0 28px 26px;box-shadow:0 30px 80px rgba(70,8,50,.4);font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif;color:#5C4F58}' +
    '.lm-bar{height:6px;margin:0 -28px 22px;background:linear-gradient(135deg,#B2489E,#D6336C 55%,#E3496F)}' +
    '.lm-x{position:absolute;top:14px;right:14px;width:40px;height:40px;border:0;border-radius:50%;background:#FDF3F8;color:#B3265F;font-size:24px;line-height:1;cursor:pointer}' +
    '.lm-x:hover{background:#FFE3F0}' +
    '.lm h2{margin:0 0 4px;font-size:21px;font-weight:900;color:#B3265F}' +
    '.lm p{margin:0 0 14px;font-size:14.5px;line-height:1.6}' +
    '.lm-qr{display:block;width:210px;height:210px;margin:0 auto 14px;border-radius:14px;border:1px solid #E7C8DC}' +
    '.lm-id{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:14px}' +
    '.lm-id b{font-size:20px;color:#5C4F58;letter-spacing:.02em}' +
    '.lm-copy{height:34px;padding:0 14px;border:1.5px solid #D6336C;border-radius:999px;background:#fff;color:#D6336C;font:700 14px inherit;cursor:pointer}' +
    '.lm-copy:hover{background:#FFF0F6}' +
    '.lm-go{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 24px;border-radius:999px;background:#FF3399;color:#fff;font-weight:900;font-size:16px;text-decoration:none}' +
    '.lm-go:hover{background:#E62B87}' +
    '@keyframes lmin{from{opacity:0}to{opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){.lm.on{animation:none}}';
  document.head.appendChild(css);

  var box = document.createElement('div');
  box.className = 'lm'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', '加入 LINE 官方帳號');
  box.innerHTML =
    '<div class="lm-card"><div class="lm-bar"></div>' +
    '<button type="button" class="lm-x" aria-label="關閉">×</button>' +
    '<h2>掃描 QR，加入官方帳號</h2><p>用手機的 LINE 掃描，就能直接和我們聊。</p>' +
    '<img class="lm-qr" src="' + QR + '" alt="FireBirdUSP LINE 官方帳號 QR code">' +
    '<div class="lm-id"><b>' + ID + '</b><button type="button" class="lm-copy">複製帳號</button></div>' +
    '<a class="lm-go" href="' + URL + '" target="_blank" rel="noopener">在電腦版 LINE 開啟</a></div>';
  document.body.appendChild(box);
  var last = null, copyBtn = box.querySelector('.lm-copy');
  function open(from) { last = from || null; box.classList.add('on'); box.querySelector('.lm-x').focus(); }
  function close() { box.classList.remove('on'); if (last && last.focus) last.focus(); }
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  box.querySelector('.lm-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('on')) close(); });
  copyBtn.addEventListener('click', function () {
    function done() { copyBtn.textContent = '已複製'; setTimeout(function () { copyBtn.textContent = '複製帳號'; }, 1600); }
    if (navigator.clipboard) { navigator.clipboard.writeText(ID).then(done, done); } else { done(); }
  });

  function isLine(a) { return a && a.getAttribute && (/lin\.ee\/9EwP040/.test(a.getAttribute('href') || '') || a.classList.contains('js-line')) && !a.classList.contains('lm-go'); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!isLine(a) || !mqDesk.matches || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); open(a);
  });
  [].forEach.call(document.querySelectorAll('a.line-btn, a.cta.js-line'), function (a) {
    if (a.closest('.top') || a.querySelector('.line-id')) return;
    var s = document.createElement('span'); s.className = 'line-id'; s.textContent = ID; a.appendChild(s);
  });
})();
