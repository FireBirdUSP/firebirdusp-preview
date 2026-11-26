/* v59｜風格定調台：選色號與方向，預覽即時換，產生一張定調單 */
(function () {
  var root = document.getElementById('styler'); if (!root) return;
  var mock = root.querySelector('.mock'), out = root.querySelector('.ssum ul');
  var state = { color: '#FF355E', t: 'glass', d: 'air', r: 'round', m: 'live' };
  function onColor(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 165 ? '#241620' : '#FFFFFF';
  }
  function label(k) { var b = root.querySelector('[data-k="' + k + '"][data-v="' + state[k] + '"]'); return b ? b.textContent.trim() : ''; }
  var rows = [['主色', null], ['氣質', 't'], ['版面', 'd'], ['圓角', 'r'], ['互動', 'm']];
  function render(replay) {
    mock.style.setProperty('--c', state.color);
    mock.style.setProperty('--on', onColor(state.color));
    mock.className = 'mock t-' + state.t + ' d-' + state.d + ' r-' + state.r + (state.m === 'live' ? ' m-live' : '');
    if (replay) { [].forEach.call(mock.querySelectorAll('.chart i'), function (i) { i.style.animation = 'none'; void i.offsetWidth; i.style.animation = ''; }); }
    out.innerHTML = '';
    rows.forEach(function (row) {
      var li = document.createElement('li'), b = document.createElement('b');
      b.textContent = row[0]; li.appendChild(b);
      li.appendChild(document.createTextNode(row[1] ? label(row[1]) : state.color.toUpperCase()));
      out.appendChild(li);
    });
    [].forEach.call(root.querySelectorAll('button[data-k]'), function (x) { x.setAttribute('aria-pressed', String(state[x.dataset.k] === x.dataset.v)); });
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]');
    if (b) { state[b.dataset.k] = b.dataset.v; render(true); return; }
    var c = e.target.closest('.ssum button');
    if (c) {
      var text = '我的風格定調單：' + [].map.call(out.children, function (li) { return li.firstChild.textContent + ' ' + li.lastChild.textContent; }).join('｜');
      var done = function () { c.textContent = '已複製，貼到 LINE 給我們'; setTimeout(function () { c.textContent = '複製定調單'; }, 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
    }
  });
  var own = root.querySelector('input[type=color]');
  own.addEventListener('input', function () { state.color = own.value; render(false); });
  render(false);
})();
