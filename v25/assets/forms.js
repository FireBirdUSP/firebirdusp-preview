/* FireBirdUSP v24｜預約諮詢、問題與建議表單
 * 官網是靜態頁，沒有後端：填完整理成一段訊息，由訪客按「用 LINE 傳送」（複製＋開啟官方 LINE）或「用 Email 寄出」送出。
 * ⚠️ 畫面一定要講清楚「按下按鈕送出，我們才收到」，不可以讓人以為已經送出（ALWAYS 01） */
(function () {
  var LINE = 'https://lin.ee/9EwP040', MAIL = 'hello@firebirdusp.com';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function val(f, n) { var el = f.elements[n]; if (!el) return ''; if (el.length && !el.tagName) { return [].filter.call(el, function (x) { return x.checked; }).map(function (x) { return x.value; }).join('、'); } return (el.value || '').trim(); }

  $$('form[data-form]').forEach(function (f) {
    var kind = f.dataset.form, out = $('#' + f.dataset.out), err = $('.err', f), rank = [];

    /* 依選擇顯示對應欄位 */
    function sync() {
      $$('[data-show]', f).forEach(function (box) {
        var p = box.dataset.show.split('='), cur = val(f, p[0]);
        var on = p[1].split('|').some(function (v) { return cur.indexOf(v) >= 0; });
        box.hidden = !on; $$('input,select,textarea', box).forEach(function (i) { i.disabled = !on; });
      });
    }
    f.addEventListener('change', sync); sync();

    /* 排序：最多 3 項，先點的＝最重要 */
    var rbox = $('.rank', f), sug = $('.sug', f);
    function paint() {
      $$('.rk', rbox).forEach(function (b) { var i = rank.indexOf(b.dataset.v); b.setAttribute('aria-pressed', i >= 0 ? 'true' : 'false'); $('.n', b).textContent = i >= 0 ? (i + 1) : ''; });
      if (sug) { var top = rank[0] && $('.rk[data-v="' + rank[0] + '"]', rbox);
        if (top) { sug.hidden = false; $('b', sug).textContent = top.dataset.svc;
          $$('input[name=svc]', f).forEach(function (c) { if (!c.dataset.touched) c.checked = c.value === top.dataset.svc; }); }
        else sug.hidden = true; }
    }
    if (rbox) {
      rbox.addEventListener('click', function (e) { var b = e.target.closest('.rk'); if (!b) return; var v = b.dataset.v, i = rank.indexOf(v);
        if (i >= 0) rank.splice(i, 1); else if (rank.length < 3) rank.push(v); else { err.textContent = '最多選 3 項；想換的話，先點一下已選的取消。'; return; }
        err.textContent = ''; paint(); });
      $$('input[name=svc]', f).forEach(function (c) { c.addEventListener('change', function () { c.dataset.touched = '1'; }); });
      paint();
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault(); err.textContent = '';
      var miss = $$('[data-req]', f).filter(function (q) { if (q.closest('[hidden]')) return false; var n = q.dataset.req; return n === 'rank' ? !rank.length : !val(f, n); });
      if (miss.length) { err.textContent = '還有 ' + miss.length + ' 題必填：' + miss.map(function (q) { return q.dataset.label; }).join('、'); miss[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      if (!f.elements.agree.checked) { err.textContent = '請勾選同意隱私權政策，我們才能與你聯絡。'; return; }
      var L = [];
      if (kind === 'booking') {
        L.push('【預約諮詢｜FireBirdUSP 官網】', '');
        L.push('稱呼：' + val(f, 'name'), '品牌／公司：' + val(f, 'brand'), '行業：' + val(f, 'industry'), '手機：' + val(f, 'phone'));
        var how = val(f, 'how'); L.push('希望的聯絡方式：' + how + (how === 'LINE' ? '（LINE ID：' + val(f, 'lineid') + '）' : how === 'Email' ? '（' + val(f, 'email') + '）' : ''));
        var bni = val(f, 'bni'); L.push('BNI／商會：' + bni + (val(f, 'bniname') ? '（' + val(f, 'bniname') + '）' : ''));
        L.push('', '最想先解決（依重要性）：'); rank.forEach(function (v, i) { L.push('  ' + (i + 1) + '. ' + v); });
        if (val(f, 'svc')) L.push('想先了解的服務：' + val(f, 'svc'));
        [['site', '官網／社群'], ['role', '角色'], ['buyer', '客戶主要是'], ['from', '客戶怎麼找到他'], ['when', '方便聯絡時段'], ['note', '補充']].forEach(function (p) { if (val(f, p[0])) L.push(p[1] + '：' + val(f, p[0])); });
      } else {
        L.push('【問題與建議｜FireBirdUSP 官網】', '', '類型：' + val(f, 'type'), '內容：', val(f, 'body'), '', '回覆方式：' + (val(f, 'reply') || '（未留，匿名）'));
      }
      var text = L.join('\n'), subj = kind === 'booking' ? '預約諮詢｜' + val(f, 'brand') + '｜' + val(f, 'name') : '問題與建議｜' + val(f, 'type');
      $('pre', out).textContent = text;
      $('.mail', out).href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
      $('.line', out).href = LINE; $('.line', out).dataset.text = text;
      out.hidden = false; out.scrollIntoView({ block: 'start', behavior: 'smooth' }); $('.line', out).focus({ preventScroll: true });
    });

    if (out) {
      $('.line', out).addEventListener('click', function () { var t = this.dataset.text, tip = $('.tip', out);
        try { navigator.clipboard.writeText(t).then(function () { tip.textContent = '已複製訊息，請在 LINE 對話框貼上並送出。'; }, function () { tip.textContent = '請先複製上面的訊息，再到 LINE 貼上送出。'; }); } catch (x) { tip.textContent = '請先複製上面的訊息，再到 LINE 貼上送出。'; } });
      $('.copy', out).addEventListener('click', function () { var t = $('pre', out).textContent, tip = $('.tip', out);
        try { navigator.clipboard.writeText(t).then(function () { tip.textContent = '已複製。'; }, function () { tip.textContent = '請手動選取上面的文字複製。'; }); } catch (x) { tip.textContent = '請手動選取上面的文字複製。'; } });
      $('.edit', out).addEventListener('click', function () { out.hidden = true; f.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
    }
  });
})();
