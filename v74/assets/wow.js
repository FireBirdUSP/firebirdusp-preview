/* v74｜首屏「打上你的名字，看它被看見」：幾千顆一樣的光點聚成訪客的名字。
 * 名字只在瀏覽器裡畫出來：不送出、不儲存、不進追蹤。 */
(function () {
  var stage = document.querySelector('.stage.wow'), cv = document.getElementById('wow');
  if (!stage || !cv || !cv.getContext) return;
  var ctx = cv.getContext('2d'), box = stage.querySelector('.w-box');
  var l1 = stage.querySelector('.w-l1'), l3 = stage.querySelector('.w-l3'), h1 = document.getElementById('hero-title');
  var input = document.getElementById('w-name'), go = document.getElementById('w-go'), live = document.getElementById('live');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = innerWidth <= 700, DPR = Math.min(window.devicePixelRatio || 1, 2);
  var N = small ? 1500 : 2800, W = 0, H = 0, R = { x: 0, y: 0, w: 0, h: 0 };
  var word = '被看見', P = [], rings = [], embers = [], sweep = -1, t = 0, running = false, visible = true, formed = false;
  var ptr = { x: -999, y: -999, on: 0 }, paused = false;
  var FONT = '"Noto Sans TC","Microsoft JhengHei",sans-serif';

  function sprite(core, glow) {
    var c = document.createElement('canvas'); c.width = c.height = 32; var g = c.getContext('2d');
    var r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, core); r.addColorStop(.28, core); r.addColorStop(.45, glow); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 32, 32); return c;
  }
  var SP = [sprite('#FFFBE6', 'rgba(255,226,74,.45)'), sprite('#FFE24A', 'rgba(255,196,20,.42)'),
            sprite('#FFC247', 'rgba(255,140,40,.40)'), sprite('#FF8FC0', 'rgba(255,46,116,.40)'),
            sprite('#FFFFFF', 'rgba(255,190,230,.25)')];

  for (var i = 0; i < N; i++) P.push({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, on: false, wait: 0, c: 4, s: 1, ph: Math.random() * 6.28 });

  function measure() {
    var s = stage.getBoundingClientRect(), b = box.getBoundingClientRect();
    return { W: Math.round(s.width), H: Math.round(s.height), x: b.left - s.left, y: b.top - s.top, w: b.width, h: b.height };
  }
  function resize() {
    var m = measure(); if (!m.w || !m.h) return false;
    var changed = m.W !== W || m.H !== H || Math.abs(m.x - R.x) > 1 || Math.abs(m.y - R.y) > 1 || Math.abs(m.w - R.w) > 1 || Math.abs(m.h - R.h) > 1;
    if (!changed) return false;
    W = m.W; H = m.H; R = { x: m.x, y: m.y, w: m.w, h: m.h };
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return true;
  }

  /* 名字上限 12 個字（中文、英文都算一個）。輸入框屬性放寬到 24，讓注音組字時不會被卡住，組完再裁 */
  var MAXC = 12;
  function clip(s) { return Array.from(s).slice(0, MAXC).join(''); }
  /* 可以斷行的位置：空格 > 中文字之間 > 英文接大寫縮寫（FireBird｜USP）> 其他大小寫交界；英文單字不從中間拆 */
  function split(text, g) {
    var c = Array.from(text), best = null;
    if (c.length < 5) return null;
    g.font = '900 100px ' + FONT;
    for (var i = 1; i < c.length; i++) {
      var p = c[i - 1], n = c[i], rank = 9;
      if (p === ' ' || n === ' ') rank = 0;
      else if (p.charCodeAt(0) > 255 || n.charCodeAt(0) > 255) rank = 1;
      else if (/[a-z0-9]/.test(p) && /[A-Z]/.test(n)) rank = /[A-Z]/.test(c[i + 1] || '') ? 2 : 3;
      if (rank === 9) continue;
      var two = [c.slice(0, i).join('').trim(), c.slice(i).join('').trim()];
      if (!two[0] || !two[1]) continue;
      var wide = Math.max(g.measureText(two[0]).width, g.measureText(two[1]).width);
      if (!best || rank < best.rank || (rank === best.rank && wide < best.wide)) best = { rank: rank, wide: wide, two: two };
    }
    return best && best.two;
  }

  /* 禁用詞檢查（清單在 assets/blocklist.js） */
  function blocked(s) {
    var B = window.FB_BLOCK; if (!B) return false;
    var spaced = String(s).normalize('NFKC').toLowerCase().replace(/[\u200b-\u200f\ufeff]/g, '');
    var tight = spaced.replace(/[\s!-\/:-@\[-`{-~。、，．・·！？（）「」『』【】～＿－—…]+/g, '');
    if (B.zh.some(function (w) { return tight.indexOf(w) >= 0; }) || B.any.some(function (w) { return tight.indexOf(w) >= 0; })) return true;
    var words = spaced.split(/[^a-z0-9]+/);
    return B.word.some(function (w) { return words.indexOf(w) >= 0 || tight === w; });
  }
  var REFUSE = '這個詞不適合放上舞台，換一個品牌名或姓名試試。';
  function warn(msg) { var e = stage.querySelector('.w-err'); if (!e) return; e.textContent = msg || ''; e.hidden = !msg; }
  function reset0() {
    stage.classList.remove('named', 'gift'); l1.textContent = '讓個人或品牌，'; l3.textContent = '打上你的名字，換你被看見';
    h1.setAttribute('aria-label', '讓個人或品牌，被看見。'); go.textContent = '讓它被看見'; show('被看見', false);
  }

  /* 把文字轉成目標點；名字長就分兩行，字才夠大 */
  function sample(text, area, count) {
    var A = area || R, n = count || N;
    var w = Math.max(10, Math.round(A.w)), h = Math.max(10, Math.round(A.h));
    var o = document.createElement('canvas'); o.width = w; o.height = h; var g = o.getContext('2d', { willReadFrequently: true });
    function fit(lines) {
      var size = Math.floor(h / lines.length * .96); g.font = '900 ' + size + 'px ' + FONT;
      var widest = Math.max.apply(null, lines.map(function (s) { return g.measureText(s).width; }));
      if (widest > w * .96) size = Math.floor(size * w * .96 / widest);
      return size;
    }
    var lines = [text], size = fit(lines), two = split(text, g);
    /* 分兩行能讓字大一成以上才分行 */
    if (two) { var s2 = fit(two); if (s2 > size * 1.08) { lines = two; size = s2; } }
    g.font = '900 ' + size + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000';
    lines.forEach(function (s, i) { g.fillText(s, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.06 + size * .04); });
    var d = g.getImageData(0, 0, w, h).data, filled = 0, x, y;
    for (y = 0; y < h; y += 2) for (x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 140) filled += 4;
    var step = Math.max(size < 62 ? 1.7 : 2.4, Math.sqrt(filled / (n * .9))), pts = [], row = 0;
    for (var fy = step / 2; fy < h; fy += step, row++) for (var fx = (row % 2 ? step : step / 2); fx < w; fx += step) {
      if (d[((fy | 0) * w + (fx | 0)) * 4 + 3] > 140) pts.push([A.x + fx, A.y + fy, fx / w]);
    }
    for (var i = pts.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, k = pts[i]; pts[i] = pts[j]; pts[j] = k; }
    return { pts: pts, step: step, size: size };
  }

  function setWord(text, burst) {
    word = text; var s = sample(text), pts = s.pts, cx = R.x + R.w / 2, cy = R.y + R.h / 2;
    var base = Math.max(.65, s.step * (s.size < 62 ? .40 : .56));
    for (var i = 0; i < N; i++) {
      var p = P[i];
      if (i < pts.length) {
        p.on = true; p.tx = pts[i][0]; p.ty = pts[i][1];
        var u = pts[i][2] + (Math.random() - .5) * .22; p.c = u < .16 ? 0 : u < .52 ? 1 : u < .74 ? 2 : 3;
        if (Math.random() < .05) p.c = 0;
        p.s = base * (.8 + Math.random() * .5);
      } else { p.on = false; p.c = 4; p.s = .5 + Math.random() * 1.5; }
      if (burst) {
        var a = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - .5) * .9, f = 5 + Math.random() * (small ? 12 : 20);
        p.vx += Math.cos(a) * f; p.vy += Math.sin(a) * f; p.wait = 8 + Math.random() * 22 | 0;
      }
      if (reduce && p.on) { p.x = p.tx; p.y = p.ty; p.vx = p.vy = 0; }
    }
    formed = true;
    if (burst) { rings.push({ x: cx, y: cy, r: 10, a: 1 }); sweep = -26;
      for (var e = 0; e < (small ? 40 : 90); e++) embers.push({ x: cx + (Math.random() - .5) * R.w * .8, y: cy + (Math.random() - .5) * R.h * .5,
        vx: (Math.random() - .5) * 3, vy: -1 - Math.random() * 4.5, a: 1, s: 1 + Math.random() * 3, c: Math.random() * 4 | 0 }); }
    if (reduce) draw();
  }

  function step() {
    t++;
    var RR = small ? 62 : 96;
    for (var i = 0; i < N; i++) {
      var p = P[i];
      if (p.on && p.wait <= 0) {
        var jx = Math.sin(t * .045 + p.ph) * .7, jy = Math.cos(t * .052 + p.ph) * .7;
        p.vx = (p.vx + (p.tx + jx - p.x) * .052) * .80; p.vy = (p.vy + (p.ty + jy - p.y) * .052) * .80;
      } else {
        if (p.wait > 0) p.wait--;
        p.vx = p.vx * .94 + Math.sin(t * .008 + p.ph) * .035; p.vy = p.vy * .94 + Math.cos(t * .011 + p.ph * 1.7) * .03 - .006;
      }
      var dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
      if (ptr.on > 0 && d2 < RR * RR) { var d = Math.sqrt(d2) || 1, push = (1 - d / RR) * 5.2; p.vx += dx / d * push; p.vy += dy / d * push; }
      p.x += p.vx; p.y += p.vy;
      if (!p.on) { if (p.x < -10) p.x = W + 8; if (p.x > W + 10) p.x = -8; if (p.y < -10) p.y = H + 8; if (p.y > H + 10) p.y = -8; }
    }
    if (ptr.on > 0 && ptr.on < 90) ptr.on--;
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
    var cx = R.x + R.w / 2, cy = R.y + R.h / 2;
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R.w * .62);
    var pulse = .30 + Math.sin(t * .03) * .05;
    g.addColorStop(0, 'rgba(255,110,170,' + pulse + ')'); g.addColorStop(1, 'rgba(255,110,170,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    /* 從上方打下來的兩道柔光 */
    for (var b = 0; b < 2; b++) {
      var sway = Math.sin(t * .006 + b * 2.4) * W * .12, ox = W * (b ? .86 : .14);
      var lg = ctx.createLinearGradient(ox, 0, cx + sway, cy + R.h);
      lg.addColorStop(0, 'rgba(255,225,245,.20)'); lg.addColorStop(1, 'rgba(255,225,245,0)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(ox - 8, -10); ctx.lineTo(ox + 8, -10);
      ctx.lineTo(cx + sway + R.w * .16, cy + R.h * .8); ctx.lineTo(cx + sway - R.w * .16, cy + R.h * .8); ctx.closePath(); ctx.fill();
    }
    for (var i = 0; i < N; i++) {
      var p = P[i], s = p.s * (p.on ? 2.35 : 2.4);
      if (p.on && sweep >= 0) { var sx = R.x + R.w * (sweep / 55); if (Math.abs(p.x - sx) < R.w * .07) s *= 1.9; }
      ctx.globalAlpha = p.on ? (p.wait > 0 ? .75 : 1) : .20 + .22 * Math.abs(Math.sin(t * .02 + p.ph));
      ctx.drawImage(SP[p.c], p.x - s, p.y - s, s * 2, s * 2);
    }
    for (var e = embers.length - 1; e >= 0; e--) {
      var m = embers[e]; m.x += m.vx; m.y += m.vy; m.vy += .035; m.a -= .012;
      if (m.a <= 0) { embers.splice(e, 1); continue; }
      ctx.globalAlpha = m.a; var z = m.s * 4; ctx.drawImage(SP[m.c], m.x - z, m.y - z, z * 2, z * 2);
    }
    for (var r = rings.length - 1; r >= 0; r--) {
      var o = rings[r]; o.r += small ? 14 : 24; o.a -= .028; if (o.a <= 0) { rings.splice(r, 1); continue; }
      ctx.globalAlpha = o.a * .7; ctx.strokeStyle = '#FFE9A8'; ctx.lineWidth = 2 + o.a * 6;
      ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r, o.r * .55, 0, 0, 6.2832); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (sweep < 90 && sweep > -90) { sweep++; if (sweep > 55) sweep = -100; }
  }

  function loop() {
    if (!running) return;
    if (visible && !paused && !document.hidden && !stage.classList.contains('detail')) {
      if (t % 20 === 0 && formed && resize()) setWord(word, false);
      step(); draw();
    }
    requestAnimationFrame(loop);
  }

  function pointer(e) {
    var s = stage.getBoundingClientRect(); ptr.x = e.clientX - s.left; ptr.y = e.clientY - s.top;
    ptr.on = e.pointerType === 'mouse' ? 999 : 45;
  }
  stage.addEventListener('pointermove', pointer, { passive: true });
  stage.addEventListener('pointerdown', pointer, { passive: true });
  stage.addEventListener('pointerleave', function () { ptr.on = 0; }, { passive: true });
  stage.addEventListener('touchmove', function (e) { var q = e.touches[0]; if (q) pointer({ clientX: q.clientX, clientY: q.clientY, pointerType: 'touch' }); }, { passive: true });

  function fontsFor(text, cb) {
    var done = false, run = function () { if (!done) { done = true; cb(); } };
    if (document.fonts && document.fonts.load) document.fonts.load('900 100px "Noto Sans TC"', text).then(run, run);
    setTimeout(run, 900);
  }
  function show(text, burst) {
    fontsFor(text, function () { if (resize() || !formed) {} setWord(text, burst); });
  }
  function submit() {
    var v = clip((input.value || '').trim()); if (!v) { input.focus(); return; }
    if (blocked(v)) { reset0(); warn(REFUSE); input.select(); return; }
    warn(''); stage.classList.remove('gift');
    input.blur(); stage.classList.add('named');
    l1.textContent = '讓'; l3.textContent = '被看見。'; h1.setAttribute('aria-label', '讓' + v + '被看見。');
    go.textContent = '再亮一次';
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(function () { show(v, true); }, small ? 260 : 20);
    if (live) { live.textContent = ''; setTimeout(function () { live.textContent = '讓' + v + '被看見'; }, 60); }
  }
  var timer = 0, composing = false;
  function preview() {
    if (clip(input.value) !== input.value) input.value = clip(input.value);
    clearTimeout(timer); timer = setTimeout(function () {
      var v = (input.value || '').trim(); go.textContent = '讓它被看見';
      if (v && blocked(v)) { reset0(); warn(REFUSE); return; }
      warn(''); stage.classList.remove('gift');
      if (v) { stage.classList.add('named'); l1.textContent = '讓'; l3.textContent = '被看見。'; show(v, false); }
      else { stage.classList.remove('named'); l1.textContent = '讓個人或品牌，'; l3.textContent = '打上你的名字，換你被看見'; show('被看見', false); }
    }, 320);
  }
  input.addEventListener('compositionstart', function () { composing = true; });
  input.addEventListener('compositionend', function () { composing = false; preview(); });
  input.addEventListener('input', function () { if (!composing) preview(); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing && !composing) { e.preventDefault(); clearTimeout(timer); submit(); } });
  go.addEventListener('click', function () { clearTimeout(timer); submit(); });

  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: .02 }).observe(stage);
  addEventListener('resize', function () { setTimeout(function () { if (formed && resize()) setWord(word, false); }, 160); });

  /* ───── v71｜存成圖片分享：整張圖在訪客自己的裝置上畫，名字不會傳出去 ───── */
  var shareBtn = document.getElementById('w-share'), modal = null, shareUrl = '', shareFile = null, making = false;
  var shareText = shareBtn && shareBtn.querySelector('span'), errBox = stage.querySelector('.w-err');
  var logo = new Image(); logo.src = 'assets/logo_white_sm.png';
  var lineQr = new Image(); lineQr.src = 'assets/line-add-qr.png';

  function paintCard(name) {
    var cw = 1080, ch = 1350, c = document.createElement('canvas'); c.width = cw; c.height = ch; var g = c.getContext('2d'), i;
    var bg = g.createRadialGradient(540, 560, 0, 540, 560, 900);
    bg.addColorStop(0, '#861862'); bg.addColorStop(.45, '#580D50'); bg.addColorStop(1, '#22042B');
    g.fillStyle = bg; g.fillRect(0, 0, cw, ch);
    g.globalCompositeOperation = 'lighter';
    [[90, 1], [990, -1]].forEach(function (b) {
      var lg = g.createLinearGradient(b[0], 0, 540, 860); lg.addColorStop(0, 'rgba(255,225,245,.17)'); lg.addColorStop(1, 'rgba(255,225,245,0)');
      g.fillStyle = lg; g.beginPath(); g.moveTo(b[0] - 12, -10); g.lineTo(b[0] + 12, -10); g.lineTo(540 + b[1] * 330, 860); g.lineTo(540 - b[1] * 20, 860); g.closePath(); g.fill();
    });
    var halo = g.createRadialGradient(540, 600, 0, 540, 600, 620);
    halo.addColorStop(0, 'rgba(255,110,170,.14)'); halo.addColorStop(1, 'rgba(255,110,170,0)'); g.fillStyle = halo; g.fillRect(0, 0, cw, ch);
    for (i = 0; i < 420; i++) { var z = 3 + Math.random() * 7; g.globalAlpha = .12 + Math.random() * .45; g.drawImage(SP[4], Math.random() * cw - z, Math.random() * ch - z, z * 2, z * 2); }
    /* 名字用一般疊色畫，顆粒才保有金色與桃紅；疊亮模式會整片變白 */
    var area = { x: 50, y: 345, w: 980, h: 500 }, s = sample(name, area, 4200);
    g.globalCompositeOperation = 'source-over';
    for (i = 0; i < s.pts.length; i++) {
      var p = s.pts[i], u = p[2] + (Math.random() - .5) * .22, k = u < .08 ? 0 : u < .56 ? 1 : u < .76 ? 2 : 3;
      if (Math.random() < .07) k = 0;
      var r = s.step * (.95 + Math.random() * .55); g.globalAlpha = 1; g.drawImage(SP[k], p[0] - r, p[1] - r, r * 2, r * 2);
    }
    g.globalCompositeOperation = 'lighter';
    for (i = 0; i < 90; i++) { var e = 4 + Math.random() * 12; g.globalAlpha = .25 + Math.random() * .6;
      g.drawImage(SP[Math.random() * 4 | 0], 90 + Math.random() * 900 - e, 300 + Math.random() * 640 - e, e * 2, e * 2); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(30,0,40,.75)'; g.shadowBlur = 24;
    g.fillStyle = '#FFE3EF'; g.font = '900 96px ' + FONT; g.fillText('讓', 540, 235);
    g.fillStyle = '#FFE24A'; g.font = '900 150px ' + FONT; g.fillText('被看見。', 560, 985);
    g.shadowBlur = 0;
    if (!lineQr.complete || !lineQr.naturalWidth) throw new Error('qr');
    var qx = 822, qy = 1138, qs = 178, qr = 16;
    g.fillStyle = '#FFE9F3'; g.beginPath(); g.moveTo(qx + qr, qy); g.arcTo(qx + qs, qy, qx + qs, qy + qs, qr); g.arcTo(qx + qs, qy + qs, qx, qy + qs, qr);
    g.arcTo(qx, qy + qs, qx, qy, qr); g.arcTo(qx, qy, qx + qs, qy, qr); g.closePath(); g.fill();
    g.imageSmoothingEnabled = false; g.drawImage(lineQr, qx + 5, qy + 5, qs - 10, qs - 10); g.imageSmoothingEnabled = true;
    g.textAlign = 'left';
    if (logo.complete && logo.naturalWidth) {
      /* LOGO 染成火鳥漸層（深底上用亮一階的桃紅到珊瑚） */
      var lw = 220, lh = Math.round(lw * logo.naturalHeight / logo.naturalWidth), tc = document.createElement('canvas'); tc.width = lw; tc.height = lh;
      var tg = tc.getContext('2d'); tg.drawImage(logo, 0, 0, lw, lh); tg.globalCompositeOperation = 'source-in';
      var lgr = tg.createLinearGradient(0, 0, lw, lh); lgr.addColorStop(0, '#FF4F9A'); lgr.addColorStop(.55, '#FF5C84'); lgr.addColorStop(1, '#FF8A72');
      tg.fillStyle = lgr; tg.fillRect(0, 0, lw, lh); g.drawImage(tc, 80, 1088);
    } else { g.fillStyle = '#FF5C84'; g.font = '900 44px ' + FONT; g.fillText('FireBirdUSP', 80, 1135); }
    g.fillStyle = '#FFD6E8'; g.font = '700 30px ' + FONT; g.fillText('陪品牌找出客戶選你的理由', 80, 1224);
    g.fillStyle = '#FFE24A'; g.font = '900 36px ' + FONT; g.fillText('掃我加 LINE，免費測官網', 80, 1270);
    g.fillStyle = '#FF9CC4'; g.font = '700 28px ' + FONT; g.fillText('精準差異化行銷｜@firebirdusp', 80, 1314);
    g.textAlign = 'center';
    return c;
  }

  /* ───── v73｜分享：圖片（含 LINE QR）＋邀請文字＋遊玩連結。全在訪客裝置上完成 ───── */
  var LINE_ADD = 'https://line.me/R/ti/p/%40firebirdusp';
  var UA = navigator.userAgent, MOBILE = /Android|iPhone|iPad|iPod/i.test(UA) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(UA));
  var IOS = MOBILE && !/Android/i.test(UA);
  var shareCanvas = null, invite = '';

  function playUrl() { return location.origin + location.pathname.replace(/index\.html$/, ''); }
  /* 名字放在網址 # 後面：這一段不會送到任何伺服器，朋友點開時由他的瀏覽器讀出來 */
  function packName(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unpackName(s) { try { return decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))); } catch (e) { return ''; } }
  function nameUrl(name) { return playUrl() + '#n=' + packName(name); }
  var PLAY_LABEL = '▶ 點開看它亮起來，換你打名字玩：';
  function inviteBody(name) {
    return [
      '我讓「' + name + '」被看見了！',
      '',
      '▶ 免費測你的官網，搜尋和 AI 找不找得到你？',
      '加 LINE @firebirdusp：' + LINE_ADD,
      '',
      'FireBirdUSP｜精準差異化行銷',
      '陪品牌找出客戶選你的理由，再決定錢花在哪。'
    ].join('\n');
  }
  function inviteText(name) { return inviteBody(name) + '\n\n' + PLAY_LABEL + '\n' + nameUrl(name); }
  function copyText(text) {
    function old() {
      var t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} t.remove();
      return ok ? Promise.resolve() : Promise.reject(new Error('copy'));
    }
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).catch(old);
    return old();
  }
  function say2(msg) { var s = modal.querySelector('.w-status'); s.textContent = msg; s.hidden = !msg; }

  function closeShare() {
    if (!modal) return; paused = false; modal.hidden = true; document.documentElement.classList.remove('w-lock');
    if (shareBtn) shareBtn.focus({ preventScroll: true });
  }
  function buildModal() {
    modal = document.createElement('div'); modal.className = 'w-modal ' + (MOBILE ? 'is-m' : 'is-d'); modal.hidden = true;
    var acts = MOBILE
      ? '<a class="w-line line" target="_blank" rel="noopener">傳到 LINE（文字＋連結）</a><button type="button" class="w-send main">分享圖片＋文字</button><button type="button" class="w-text">複製邀請文字</button><a class="w-dl">下載圖片</a>'
      : '<a class="w-line line" target="_blank" rel="noopener">傳到 LINE（文字＋連結）</a><button type="button" class="w-copy main">複製圖片</button><button type="button" class="w-text">複製邀請文字</button><a class="w-dl">下載圖片</a>';
    var tip = MOBILE
      ? '綠色按鈕一次送出文字和連結，朋友點開會看到這個名字亮起來。要附圖再按「分享圖片＋文字」；LINE 分享圖片時常只帶圖，文字已幫你複製好，貼上即可。'
      : '綠色按鈕一次送出文字和連結，朋友點開會看到這個名字亮起來。要附圖：按「複製圖片」，到聊天室按 Ctrl＋V。';
    modal.innerHTML = '<div class="w-card" role="dialog" aria-modal="true" aria-label="分享給朋友"><button type="button" class="w-x" aria-label="關閉">×</button>'
      + '<img alt=""><div class="w-acts">' + acts + '</div><p class="w-status" role="status" aria-live="polite" hidden></p>'
      + '<label class="w-msg"><span>搭配的邀請文字（含遊玩連結）</span><textarea readonly rows="4"></textarea></label>'
      + '<p class="w-tip">' + tip + '<br>圖片在你的裝置上產生，名字不會傳到我們這裡。</p></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('.w-x')) { closeShare(); return; }
      var b = e.target.closest('.w-send,.w-copy,.w-text'); if (!b) return;
      if (b.classList.contains('w-text')) {
        copyText(invite).then(function () { say2('邀請文字複製好了，到聊天室貼上就能傳。'); },
          function () { say2('沒有複製成功，請在下面的文字框長按或框選後複製。'); });
      } else if (b.classList.contains('w-copy')) {
        try {
          var png = toFileBlob(shareCanvas.toDataURL('image/png'), 'image/png');
          navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]).then(
            function () { say2('圖片複製好了，到 LINE 聊天室按 Ctrl＋V 貼上。'); },
            function () { say2('這個瀏覽器不讓網頁複製圖片，請改按「下載圖片」。'); });
        } catch (err) { say2('這個瀏覽器不能直接複製圖片，請改按「下載圖片」。'); }
      } else {
        copyText(invite).then(function () { say2('邀請文字已複製，傳完圖片後貼上就好。'); }, function () {});
        var data = { files: [shareFile], text: invite };
        if (!navigator.canShare || !navigator.canShare({ files: [shareFile] })) { say2('這支手機不支援直接分享圖片，請長按圖片儲存，再到 LINE 傳送。'); return; }
        navigator.share(data).catch(function (err) { if (err && err.name !== 'AbortError') say2('分享沒有成功，請長按圖片儲存，再到 LINE 傳送。'); });
      }
    });
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { closeShare(); return; }
      if (e.key !== 'Tab') return;
      var f = [].filter.call(modal.querySelectorAll('button,a,textarea'), function (x) { return !x.hidden; }), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  /* data URL 轉檔案。不用 toBlob：瀏覽器會把它排到「有空檔」才做，光點動畫跑著時可能等很久 */
  function toFileBlob(url, type) {
    var raw = atob(url.split(',')[1]), buf = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
    return new Blob([buf], { type: type || 'image/jpeg' });
  }
  function shareState(busy) {
    making = busy;
    if (busy) shareBtn.setAttribute('aria-busy', 'true'); else shareBtn.removeAttribute('aria-busy');
    if (shareText) shareText.textContent = busy ? '圖片製作中…' : '存成圖片分享';
  }
  function openShare() {
    var name = clip((input.value || '').trim()); if (!name) { input.focus(); return; }
    if (blocked(name)) { reset0(); warn(REFUSE); return; }
    if (making) return; shareState(true); paused = true; if (errBox) errBox.hidden = true;
    fontsFor(name + '讓被看見。陪品牌找出客戶選你的理由掃我加免費測官網', function () {
      /* 先讓按鈕上的「製作中」畫出來，再開始畫圖 */
      setTimeout(function () {
        try {
          shareCanvas = paintCard(name);
          var blob = toFileBlob(shareCanvas.toDataURL('image/jpeg', .92));
          if (!modal) buildModal();
          if (shareUrl) URL.revokeObjectURL(shareUrl);
          shareUrl = URL.createObjectURL(blob);
          var file = '讓' + name.replace(/[\\\/:*?"<>|]/g, '') + '被看見.jpg';
          try { shareFile = new File([blob], file, { type: 'image/jpeg' }); } catch (err) { shareFile = null; }
          invite = inviteText(name);
          var img = modal.querySelector('img'); img.src = shareUrl; img.alt = '讓' + name + '被看見';
          var dl = modal.querySelector('.w-dl'); dl.href = shareUrl; dl.setAttribute('download', file);
          /* 電腦版的 LINE 分享頁會自己把網址接在文字後面，所以文字裡不再放一次，免得出現兩個一樣的連結 */
          modal.querySelector('.w-line').href = MOBILE
            ? 'https://line.me/R/share?text=' + encodeURIComponent(invite)
            : 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(nameUrl(name)) + '&text=' + encodeURIComponent(inviteBody(name) + '\n\n' + PLAY_LABEL);
          modal.querySelector('textarea').value = invite; say2('');
          var send = modal.querySelector('.w-send'); if (send) send.hidden = !shareFile;
          modal.hidden = false; document.documentElement.classList.add('w-lock'); modal.querySelector('.w-card').scrollTop = 0;
          modal.querySelector('.w-line').focus({ preventScroll: true });
          /* 圖片先幫他存好。iPhone 的網頁不能直接存進相簿，改提示長按 */
          if (IOS) say2('iPhone：長按上面的圖片，選「加入照片」就存好了。');
          else {
            try { var auto = document.createElement('a'); auto.href = shareUrl; auto.download = file; document.body.appendChild(auto); auto.click(); auto.remove();
              say2('圖片已幫你存到下載資料夾；沒看到的話按「下載圖片」。'); } catch (err) { say2('按「下載圖片」就能存起來。'); }
          }
        } catch (err) {
          paused = false;
          if (errBox) { errBox.textContent = '圖片沒有做出來，請再按一次；還是不行的話，直接截圖也可以。'; errBox.hidden = false; }
        }
        shareState(false);
      }, 60);
    });
  }
  if (shareBtn) shareBtn.addEventListener('click', openShare);

  /* 朋友傳來的連結：#n=名字。讀完就把它從網址拿掉，避免進到瀏覽紀錄分析 */
  var gm = location.hash.match(/[#&]n=([A-Za-z0-9_-]{1,120})/), gift = gm ? clip(unpackName(gm[1]).trim()) : '';
  if (gm) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  if (gift && !blocked(gift)) setTimeout(function () {
    if (input.value) return;
    stage.classList.add('named', 'gift'); l1.textContent = '讓'; l3.textContent = '被看見。'; h1.setAttribute('aria-label', '讓' + gift + '被看見。');
    input.placeholder = '換你！打上你的名字';
    var n = stage.querySelector('.w-note'); if (n) n.textContent = '這是朋友傳給你看的，換你打上名字玩';
    show(gift, true);
  }, reduce ? 50 : 2300);

  /* 進場：先是一整片一樣的光點，再聚成字、爆亮一次 */
  resize();
  for (i = 0; i < N; i++) { P[i].x = Math.random() * W; P[i].y = Math.random() * H; P[i].s = .6 + Math.random() * 1.4; }
  running = !reduce; if (running) requestAnimationFrame(loop);
  setTimeout(function () { show(word, false); }, reduce ? 0 : 700);
  setTimeout(function () { if (!stage.classList.contains('named') && !reduce) { rings.push({ x: R.x + R.w / 2, y: R.y + R.h / 2, r: 10, a: 1 }); sweep = 0; } }, 2100);
})();
