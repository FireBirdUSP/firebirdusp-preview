/* FireBirdUSP v19｜互動元件共用腳本（不依賴任何套件；沒有 JS 時內容仍完整可讀） */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 分頁切換 ──
  document.querySelectorAll('.ix-tabs').forEach(function (root) {
    var tabs = [].slice.call(root.querySelectorAll('[role=tab]'));
    var panels = [].slice.call(root.querySelectorAll('[role=tabpanel]'));
    function pick(i, focus) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      if (focus) tabs[i].focus();
      root.dispatchEvent(new CustomEvent('ix:tab', { detail: i }));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); pick((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); pick((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
    pick(0);
  });

  // ── 縮圖列左右鈕 ──
  document.querySelectorAll('.ix-rail').forEach(function (rail) {
    var track = rail.querySelector('.ix-track'), prev = rail.querySelector('[data-dir="-1"]'), next = rail.querySelector('[data-dir="1"]');
    if (!track) return;
    function upd() {
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }
    [prev, next].forEach(function (b) {
      if (!b) return;
      b.addEventListener('click', function () {
        var step = (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width : 300) + 16;
        track.scrollBy({ left: step * Number(b.dataset.dir), behavior: RM ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    rail.closest('.ix-tabs') && rail.closest('.ix-tabs').addEventListener('ix:tab', function () { setTimeout(upd, 0); });
    upd();
  });

  // ── 時間軸（點段落展開；同時只開一段） ──
  document.querySelectorAll('.ix-tl').forEach(function (tl) {
    var items = [].slice.call(tl.querySelectorAll('.ix-tl-item'));
    var bar = tl.parentNode.querySelector('.ix-bar');
    function set(it, open) {
      it.classList.toggle('open', open);
      it.querySelector('.ix-tl-btn').setAttribute('aria-expanded', open ? 'true' : 'false');
      it.querySelector('.ix-tl-body').hidden = !open;
    }
    items.forEach(function (it, i) {
      it.querySelector('.ix-tl-btn').addEventListener('click', function () {
        var was = it.classList.contains('open');
        items.forEach(function (o) { set(o, false); });
        set(it, !was);
        if (bar) [].forEach.call(bar.children, function (s, k) { s.classList.toggle('on', !was && k === i); });
      });
    });
  });

  // ── 前後對照滑桿＋標註圓點 ──
  document.querySelectorAll('.ix-cmp').forEach(function (root) {
    var stage = root.querySelector('.ix-cmp-stage'), rng = root.querySelector('input[type=range]'), box = root.querySelector('.ix-note-box');
    function setPos(v) { stage.style.setProperty('--pos', v + '%'); rng.setAttribute('aria-valuetext', v < 50 ? '偏向「調整後」' : '偏向「原本」'); }
    rng.addEventListener('input', function () { setPos(rng.value); });
    setPos(rng.value);
    root.querySelectorAll('.ix-dot').forEach(function (d) {
      d.addEventListener('click', function () {
        root.querySelectorAll('.ix-dot').forEach(function (o) { o.classList.remove('on'); });
        d.classList.add('on');
        if (box) box.textContent = d.dataset.note;
      });
    });
  });

  // ── 篩選器 ──
  document.querySelectorAll('.ix-flt').forEach(function (root) {
    var boxes = [].slice.call(root.querySelectorAll('input[type=checkbox]'));
    var core = root.querySelector('.ix-flt-core'), read = root.querySelector('.ix-flt-read'), data = JSON.parse(root.dataset.rules);
    function upd() {
      var size = 100, picked = [];
      boxes.forEach(function (b) {
        if (!b.checked) return;
        var r = data[b.value]; if (!r) return;
        picked.push(r.label);
        size = size * r.keep;
      });
      size = Math.max(size, 12);
      root.style.setProperty('--sz', size.toFixed(1) + '%');
      core.textContent = picked.length ? '' : '全部人';
      core.setAttribute('aria-label', '示意：圈住的人約占原本的 ' + Math.round(size) + '%');
      read.textContent = picked.length ? '已疊 ' + picked.length + ' 個條件：' + picked.join('、') + '。圈越小，越接近你要的那群人。' : '還沒勾條件：廣告會送給所有人。';
    }
    boxes.forEach(function (b) { b.addEventListener('change', upd); });
    upd();
  });

  // ── 手風琴＋目錄＋搜尋 ──
  document.querySelectorAll('[data-acc]').forEach(function (root) {
    var items = [].slice.call(root.querySelectorAll('details'));
    var input = document.querySelector('.ix-search'), empty = document.querySelector('.ix-empty'), count = document.querySelector('.ix-count');
    var open = document.querySelector('[data-acc-open]'), close = document.querySelector('[data-acc-close]');
    if (open) open.addEventListener('click', function () { items.forEach(function (d) { if (!d.classList.contains('ix-hide')) d.open = true; }); });
    if (close) close.addEventListener('click', function () { items.forEach(function (d) { d.open = false; }); });
    document.querySelectorAll('.ix-toc a').forEach(function (a) {
      a.addEventListener('click', function () {
        var d = document.getElementById(a.getAttribute('href').slice(1));
        if (d && d.tagName === 'DETAILS') d.open = true;
      });
    });
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t && t.tagName === 'DETAILS') t.open = true; }
    if (!input) return;
    var originals = items.map(function (d) { return d.querySelector('.ix-acc-body').innerHTML; });
    function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    input.addEventListener('input', function () {
      var q = input.value.trim(), hits = 0;
      items.forEach(function (d, i) {
        var body = d.querySelector('.ix-acc-body');
        body.innerHTML = originals[i];
        if (!q) { d.classList.remove('ix-hide'); return; }
        var txt = (d.querySelector('summary').textContent + ' ' + body.textContent).toLowerCase();
        var hit = txt.indexOf(q.toLowerCase()) > -1;
        d.classList.toggle('ix-hide', !hit);
        if (hit) {
          hits++; d.open = true;
          var re = new RegExp('(' + esc(q) + ')(?![^<]*>)', 'gi');
          body.innerHTML = body.innerHTML.replace(re, '<mark>$1</mark>');
        }
      });
      if (empty) empty.classList.toggle('show', !!q && hits === 0);
      if (count) count.textContent = q ? '找到 ' + hits + ' 段' : '';
    });
  });
})();

/* ── 指標清單＋解讀 ── */
(function () {
  document.querySelectorAll('.ix-ind').forEach(function (root) {
    var btns = [].slice.call(root.querySelectorAll('.ix-ind-btn')), items = [].slice.call(root.querySelectorAll('.ix-ind-item'));
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (o, k) { o.classList.toggle('on', k === i); o.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
        items.forEach(function (it, k) { it.hidden = k !== i; });
      });
    });
  });
})();
