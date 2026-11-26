/* v29｜事件追蹤：只有使用者同意「分析」Cookie 才會送出。
 * 用法：任何元素加 data-track="事件名" 與 data-label="說明"，點擊時自動記錄；程式內可呼叫 fbTrack(name, props)。
 * 事件寫進 window.dataLayer（GTM / GA4 都能接）。要直接用 GA4：把下面 FB_GA_ID 填成測量 ID（G-XXXXXXXX）。
 * 網址加 ?trackdebug 可在主控台看到事件（不受同意限制，只為了檢查）。 */
(function () {
  window.dataLayer = window.dataLayer || [];
  window.FB_GA_ID = window.FB_GA_ID || '';
  var debug = /[?&]trackdebug/.test(location.search), gaLoaded = false;
  function ok() { return !!(window.fbConsent && window.fbConsent.has && window.fbConsent.has('analytics')); }
  function loadGA() {
    if (gaLoaded || !window.FB_GA_ID) return; gaLoaded = true;
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.FB_GA_ID; document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); }; window.gtag('js', new Date()); window.gtag('config', window.FB_GA_ID);
  }
  window.fbTrack = function (name, props) {
    var p = props || {}; p.page = p.page || location.pathname;
    if (debug) try { console.log('[fbTrack]', name, p); } catch (e) {}
    if (!ok()) return;
    loadGA();
    var e = { event: name }; for (var k in p) e[k] = p[k];
    window.dataLayer.push(e);
    if (window.gtag) window.gtag('event', name, p);
  };
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-track]') : null;
    if (t) window.fbTrack(t.getAttribute('data-track'), { label: t.getAttribute('data-label') || (t.textContent || '').trim().slice(0, 30) });
  });
})();
