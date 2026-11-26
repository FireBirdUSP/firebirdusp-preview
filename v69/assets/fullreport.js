/* v30｜完整報告範例：分頁切換（只換顯示，不載入任何資料） */
(function () {
  [].forEach.call(document.querySelectorAll('.fr'), function (fr) {
    var tabs = fr.querySelectorAll('.frt button'), ps = fr.querySelectorAll('.frp');
    [].forEach.call(tabs, function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-t');
        [].forEach.call(tabs, function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        [].forEach.call(ps, function (p) { p.hidden = p.getAttribute('data-p') !== t; });
      });
    });
    /* v37：每個分頁底部加「下一個」按鈕（最後一頁不加） */
    [].forEach.call(ps, function (p, i) {
      if (i >= ps.length - 1) return;
      var n = document.createElement('button');
      n.type = 'button'; n.className = 'fr-next';
      n.setAttribute('data-track', 'fr_next'); n.setAttribute('data-label', '下一個');
      n.textContent = '看下一個：' + tabs[i + 1].textContent.replace(/^\d+/, '') + ' →';
      n.addEventListener('click', function () { tabs[i + 1].click(); var tl = fr.querySelector('.fr-hint'); if (tl && tl.scrollIntoView) tl.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
      p.appendChild(n);
    });
  });
})();

/* v57：差異化優化示範的戰場切換 */
(function () {
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.bf-tabs button'); if (!b) return;
    var box = b.closest('.frp'), i = b.getAttribute('data-bf');
    [].forEach.call(box.querySelectorAll('.bf-tabs button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    [].forEach.call(box.querySelectorAll('.bf-panel'), function (p) { p.hidden = p.getAttribute('data-bfp') !== i; });
  });
})();
