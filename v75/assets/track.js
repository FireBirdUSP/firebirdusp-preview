/* v75｜來源與路徑追蹤：只有使用者同意「分析」Cookie 才會送出。
 *
 * ⚠️ 現況：FB_GA_ID 還是空的 → 目前一筆資料都沒有在收。填上 GA4 測量 ID（G-XXXXXXXX）才開始記。
 * 檢查方式：任何頁面網址加 ?trackdebug，畫面左下角會列出每個事件和「有沒有送出」。
 *
 * 來源代碼：網址加 ?s=代碼。新增代碼就加在下面這張表，並同步改 docs/官網追蹤碼對照表.md。
 * ⛔ 任何事件都不帶訪客打的名字。 */
(function () {
  window.FB_GA_ID = window.FB_GA_ID || '';
  var SRC = {
    f1: { source: 'friend_share', medium: 'line_mobile', campaign: 'name_play' },
    f2: { source: 'friend_share', medium: 'copy_text', campaign: 'name_play' },
    f3: { source: 'friend_share', medium: 'line_desktop', campaign: 'name_play' },
    ln: { source: 'line_oa', medium: 'message', campaign: 'name_play' },
    lm: { source: 'line_oa', medium: 'rich_menu', campaign: 'always' },
    ig: { source: 'instagram', medium: 'social', campaign: 'name_play' },
    fb: { source: 'facebook', medium: 'social', campaign: 'name_play' },
    bni: { source: 'bni', medium: 'in_person', campaign: 'name_play' }
  };
  var KEY = 'fb-src', Q = [], gaLoaded = false, panel = null;
  window.dataLayer = window.dataLayer || [];
  var debug = /[?&]trackdebug/.test(location.search);
  function ok() { return !!(window.fbConsent && window.fbConsent.has && window.fbConsent.has('analytics')); }

  /* 來源：網址有 ?s= 用網址的；沒有就沿用這次瀏覽（分頁開著期間）記住的那一個 */
  var hit = location.search.match(/[?&]s=([a-z0-9]{1,8})(?=&|$)/), code = hit && SRC[hit[1]] ? hit[1] : '';
  if (!code) { try { code = sessionStorage.getItem(KEY) || ''; } catch (e) {} }
  if (!SRC[code]) code = '';
  function remember() { if (code && ok()) { try { sessionStorage.setItem(KEY, code); } catch (e) {} } }
  window.fbSource = function () { return code || 'none'; };

  /* 網址 # 後面可能帶著名字，永遠不送出去 */
  function cleanUrl() { return location.origin + location.pathname + location.search; }
  function loadGA() {
    if (gaLoaded || !window.FB_GA_ID) return; gaLoaded = true;
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.FB_GA_ID; document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    var cfg = { page_location: cleanUrl() }, m = SRC[code];
    if (m) { cfg.campaign_source = m.source; cfg.campaign_medium = m.medium; cfg.campaign_name = m.campaign; }
    window.gtag('config', window.FB_GA_ID, cfg);
  }
  function note(name, p, state) {
    if (!debug) return;
    try { console.log('[fbTrack]', name, state, p); } catch (e) {}
    if (!panel) {
      panel = document.createElement('div');
      panel.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;width:min(340px,calc(100vw - 16px));max-height:40vh;overflow:auto;padding:8px 10px;border-radius:10px;background:#fff;color:#2C0637;border:2px solid #D6336C;font:12px/1.55 "Microsoft JhengHei",monospace';
      panel.innerHTML = '<b>追蹤檢查｜' + (window.FB_GA_ID ? 'GA4：' + window.FB_GA_ID : '⚠️ 還沒填 GA4 測量 ID，事件不會被收走') + '</b>';
      document.body.appendChild(panel);
    }
    var row = document.createElement('div');
    row.textContent = name + '｜來源 ' + p.src + (p.label ? '｜' + p.label : '') + '｜' + state;
    panel.appendChild(row);
  }
  function send(name, p) {
    loadGA();
    var e = { event: name }; for (var k in p) e[k] = p[k];
    if (window.gtag) window.gtag('event', name, p); else window.dataLayer.push(e);
  }
  window.fbTrack = function (name, props) {
    var p = {}, k; for (k in (props || {})) p[k] = props[k];
    p.page = p.page || location.pathname; p.src = window.fbSource();
    if (ok()) { remember(); send(name, p); note(name, p, window.FB_GA_ID ? '已送出' : '已排好，但沒有 GA4 ID'); return; }
    /* 還沒選 Cookie：先放在記憶體，按同意才送；關掉頁面就丟掉 */
    if (!(window.fbConsent && window.fbConsent.get && window.fbConsent.get()) && Q.length < 40) { Q.push([name, p]); note(name, p, '等待 Cookie 同意'); return; }
    note(name, p, '未同意分析 Cookie，不送出');
  };
  document.addEventListener('fb:consent', function (ev) {
    var q = Q; Q = [];
    if (!(ev.detail && ev.detail.analytics)) return;
    remember(); q.forEach(function (x) { send(x[0], x[1]); note(x[0], x[1], '同意後補送'); });
  });
  document.addEventListener('click', function (ev) {
    if (!ev.target.closest) return;
    var t = ev.target.closest('[data-track]');
    if (t) window.fbTrack(t.getAttribute('data-track'), { label: t.getAttribute('data-label') || (t.textContent || '').trim().slice(0, 30) });
    /* 所有「加 LINE」連結統一記一筆 line_click，漏斗才算得完整。分享用的 line.me/R/share 不算 */
    var a = ev.target.closest('a[href*="line.me/R/ti/p"]');
    if (a) window.fbTrack('line_click', { label: ((t && t.getAttribute('data-label')) || (a.textContent || '').trim()).slice(0, 30) });
  }, true);
  /* 進站紀錄。等整頁腳本都載完（Cookie 同意功能在後面那支），回訪的人才不會漏記 */
  function land() { window.fbTrack('land', { label: hit && SRC[hit[1]] ? '帶代碼進站' : '一般進站' }); }
  if (document.readyState === 'complete') land(); else document.addEventListener('DOMContentLoaded', land);
})();
