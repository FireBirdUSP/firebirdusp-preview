/* FireBirdUSP v24｜全站工具：站內搜尋＋Cookie 設定（不依賴任何套件）
 * 搜尋：讀 assets/search-index.json（由 build.js 產生），比對標題與內文
 * Cookie：第一次進站顯示提示；選擇存在 localStorage「fb-consent」（necessary 永遠開、analytics、ads）
 *   ⚠️ 目前網站沒有安裝任何分析或廣告追蹤；之後要裝，請在 window.fbConsent.has('analytics') 為 true 時才載入 */
(function () {
  var me = document.currentScript, ROOT = me ? me.src.replace(/assets\/site-tools\.js.*$/, '') : '';
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ── 站內搜尋 ── */
  var ov, input, res, idx = null, lastFocus = null;
  function build() {
    ov = document.createElement('div'); ov.className = 'st-ov'; ov.hidden = true;
    ov.innerHTML = '<div class="st-box" role="dialog" aria-modal="true" aria-label="搜尋網站"><div class="st-in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" placeholder="搜尋服務、案例、常見問題…" aria-label="搜尋網站" autocomplete="off"><button type="button" class="st-x">關閉</button></div><div class="st-res" aria-live="polite"><p class="st-hint">輸入關鍵字，例如：診斷、廣告、引薦、退費</p></div></div>';
    document.body.appendChild(ov);
    input = ov.querySelector('input'); res = ov.querySelector('.st-res');
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.st-x').addEventListener('click', close);
    input.addEventListener('input', run);
  }
  function open() {
    if (!ov) build(); lastFocus = document.activeElement; ov.hidden = false; input.value = ''; input.focus(); run();
    if (!idx) fetch(ROOT + 'assets/search-index.json').then(function (r) { return r.json(); }).then(function (j) { idx = j; run(); }).catch(function () { res.innerHTML = '<p class="st-hint">搜尋暫時無法使用，請改用上方選單。</p>'; });
  }
  function close() { ov.hidden = true; if (lastFocus) lastFocus.focus(); }
  function run() {
    var q = input.value.trim();
    if (!q) { res.innerHTML = '<p class="st-hint">輸入關鍵字，例如：診斷、廣告、引薦、退費</p>'; return; }
    if (!idx) { res.innerHTML = '<p class="st-hint">讀取中…</p>'; return; }
    var words = q.split(/\s+/).filter(Boolean), out = [];
    idx.forEach(function (p) {
      var hay = p.t + ' ' + p.x, score = 0, ok = words.every(function (w) { var i = hay.indexOf(w); if (i < 0) return false; score += (p.t.indexOf(w) >= 0 ? 10 : 1); return true; });
      if (!ok) return;
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
