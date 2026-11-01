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
  });
})();
