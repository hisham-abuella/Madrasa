/* ============================================================================
   write.js — «كَيْفَ أَكْتُبُ؟» How do I write it? (games/write.html)
   Classic script, no modules (works from file://). Needs ../assets/kids.js (KS) and
   strokes.js (window.STROKES, generated from strokes.json by build-strokes.js).

   Watch: the item's strokes are revealed one by one (stroke-dashoffset, ~1.5–2.5 s per
          body stroke, 0.6 s pause), each with a numbered green start dot and an arrow;
          Noori says the step. Replay · next step (step-by-step) · slower / normal / faster.
          Reduced motion: every stroke shown at once, numbered.
   Write: the child redraws each stroke, in order, on a canvas over the faint model.
          Pointer Events (finger, Apple Pencil with pressure, mouse), touch-action none,
          touches ignored while a pen is active. A stroke passes when it starts near the
          start dot, goes the same way, and stays close to / covers the model line
          (generous; the tolerance grows after each try). Pass → green, next dot. Miss →
          the stroke fades, a hint, that stroke is shown again. After 3 tries Noori helps.
          No timer, never "wrong"; stars + confetti at the end of the item.
   Deep link: write.html?item=<id> (ids in strokes.json), e.g. ?item=taa-final
   ========================================================================= */
(function () {
  'use strict';
  var KS = window.KS, DATA = window.STROKES;
  if (!KS || !DATA) return;
  var NS = 'http://www.w3.org/2000/svg';
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function still() { return mq.matches; }

  // sound is OFF until the family turns it on (the speaker button); an explicit saved choice wins
  try { if (localStorage.getItem('nawras-mute') === null) KS.muted = true; } catch (e) { KS.muted = true; }

  function $(id) { return document.getElementById(id); }
  var game = $('game'), svg = $('svg'), ink = $('ink'), stage = $('stage'), bubble = $('bubble');
  var sayEl = $('say'), sayEn = $('sayEn'), stepNo = $('stepNo'), noori = $('noori');
  var ctx = ink.getContext('2d');
  var arNum = KS.arNum || function (n) { return String(n); };

  var W = { body: 16, dot: 20, mark: 10 };          // model stroke widths (viewBox units)
  var VB_Y = 38, VB_H = 252;                          // shown band of the 300-high model
  var LEVELS = DATA.levels;
  var lv = 0, it = 0, item = null, mode = 'watch', speed = 1;
  var vb = { x: 0, w: 300, y: 38, h: 252 };
  var S = [];                                         // per stroke: {def, len, pts, ghost, ink, mk}
  var doneItems = {};                                 // this visit only (nothing is stored)

  /* ── helpers ───────────────────────────────────────────────────────── */
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function tok(name, fb) { return getComputedStyle(game).getPropertyValue(name).trim() || fb; }
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function setNoori(mood) {
    if (noori.getAttribute('data-now') === mood) return;
    noori.setAttribute('data-now', mood);
    noori.innerHTML = KS.gull(mood, { label: 'نُورِي — Noori' });
  }
  function say(stroke, prefix) {
    stepNo.textContent = (prefix ? prefix + ' · ' : '') + 'الْخُطْوَةُ ' + arNum(stroke + 1) + ' مِنْ ' + arNum(S.length);
    sayEl.textContent = S[stroke].def.say;
    sayEn.textContent = 'Step ' + (stroke + 1) + ' of ' + S.length + ' — ' + S[stroke].def.en;
    bubble.classList.remove('is-hint', 'is-good');
  }
  function sayText(ar, en, cls) {
    sayEl.textContent = ar; sayEn.textContent = en;
    bubble.classList.remove('is-hint', 'is-good');
    if (cls) bubble.classList.add(cls);
  }
  function speakNow() { if (!KS.muted) KS.speak(sayEl.textContent); }

  /* ── chooser: levels + items ───────────────────────────────────────── */
  function buildLevels() {
    var box = $('levels');
    box.innerHTML = LEVELS.map(function (L, i) {
      return '<button type="button" data-level="' + i + '" aria-pressed="' + (i === lv) + '">' + L.ar + '<span class="en">Level ' + L.id + ' · ' + L.en + '</span></button>';
    }).join('');
    box.onclick = function (e) {
      var b = e.target.closest('[data-level]'); if (!b) return;
      lv = +b.getAttribute('data-level'); it = 0; KS.sfx('pop');
      buildLevels(); load();
    };
  }
  function buildItems() {
    var box = $('items');
    box.innerHTML = LEVELS[lv].items.map(function (x, i) {
      return '<button type="button" class="wg-item" data-item="' + i + '" aria-current="' + (i === it) + '" aria-label="' + x.name + ' — ' + x.en + (doneItems[x.id] ? ' ✓' : '') + '">' +
        x.label + (doneItems[x.id] ? '<span class="wg-got">' + KS.star(true) + '</span>' : '') + '</button>';
    }).join('');
    box.onclick = function (e) {
      var b = e.target.closest('[data-item]'); if (!b) return;
      it = +b.getAttribute('data-item'); KS.sfx('pop'); load();
    };
  }

  /* ── render the model for the current item ─────────────────────────── */
  function render() {
    item = LEVELS[lv].items[it];
    svg.innerHTML = '';
    var guide = el('g', { 'class': 'guide' }, svg);
    var gGhost = el('g', { 'class': 'ghost' }, svg);
    var gInk = el('g', { 'class': 'ink' }, svg);
    var gMk = el('g', { 'class': 'mks' }, svg);
    S = item.strokes.map(function (d) {
      var w = W[d.kind] || 16;
      var g = el('path', { d: d.d, 'stroke-width': w }, gGhost);
      var p = el('path', { d: d.d, 'stroke-width': w, 'class': d.kind === 'mark' ? 'is-mark' : '' }, gInk);
      var len = g.getTotalLength();
      p.style.strokeDasharray = len + ' ' + (len + 40);
      p.style.strokeDashoffset = len + 1;
      var n = Math.max(12, Math.round(len / 4)), pts = [];
      for (var i = 0; i <= n; i++) { var q = g.getPointAtLength(len * i / n); pts.push({ x: q.x, y: q.y }); }
      return { def: d, len: len, pts: pts, ghost: g, ink: p };
    });
    // number badges: just before each start dot, off the line, then pushed apart so no two badges,
    // no badge and start dot, and no badge and model line overlap (a leader joins a badge pushed far)
    var B = S.map(function (s) {
      var x0 = s.def.start[0], y0 = s.def.start[1];
      if (s.def.kind === 'dot' || s.len < 8) return { x: x0 + 18, y: y0 - 18, sx: x0, sy: y0 };
      var q = s.ghost.getPointAtLength(Math.min(8, s.len)), ux = q.x - x0, uy = q.y - y0, ul = Math.sqrt(ux * ux + uy * uy) || 1;
      return { x: x0 - ux / ul * 22, y: y0 - uy / ul * 22, sx: x0, sy: y0 };
    });
    // greedy: each badge tries 24 angles × 3 distances around its start dot and keeps the freest spot
    var placed = [];
    B.forEach(function (b, i) {
      var pref = Math.atan2(b.y - b.sy, b.x - b.sx), best = null, bestCost = 1e9;
      for (var r = 22; r <= 40; r += 9) for (var k = 0; k < 24; k++) {
        var ang = pref + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.PI / 12;
        var cx = b.sx + Math.cos(ang) * r, cy = b.sy + Math.sin(ang) * r, cost = (r - 22) * 0.6 + Math.ceil(k / 2) * 0.8;
        S.forEach(function (s2) { var m = 12 + (W[s2.def.kind] || 16) / 2 + 3; s2.pts.forEach(function (p) { var d = Math.sqrt((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy)); if (d < m) cost += (m - d) * 3; }); });
        placed.forEach(function (o) { var d = Math.sqrt((o.x - cx) * (o.x - cx) + (o.y - cy) * (o.y - cy)); if (d < 28) cost += (28 - d) * 6; });
        B.forEach(function (o, j) { if (j === i) return; var d = Math.sqrt((o.sx - cx) * (o.sx - cx) + (o.sy - cy) * (o.sy - cy)); if (d < 22) cost += (22 - d) * 6; });
        if (cost < bestCost) { bestCost = cost; best = [cx, cy]; }
      }
      b.x = best[0]; b.y = best[1]; placed.push(b);
    });
    // viewBox: centre the item (at least 300 wide so a lone alif is not squeezed); top and bottom grow to fit badges
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    S.forEach(function (s) { var b = s.ghost.getBBox(), h = (W[s.def.kind] || 16) / 2; x0 = Math.min(x0, b.x - h); x1 = Math.max(x1, b.x + b.width + h); y0 = Math.min(y0, b.y - h); y1 = Math.max(y1, b.y + b.height + h); });
    B.forEach(function (b) { x0 = Math.min(x0, b.x - 14); x1 = Math.max(x1, b.x + 14); y0 = Math.min(y0, b.y - 14); y1 = Math.max(y1, b.y + 14); });
    vb.w = Math.max(300, x1 - x0 + 60); vb.x = (x0 + x1) / 2 - vb.w / 2;
    vb.y = Math.min(VB_Y, y0 - 12); vb.h = Math.max(VB_Y + VB_H, y1 + 12) - vb.y;
    svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h);
    stage.style.setProperty('--ar', (vb.w / vb.h).toFixed(4));
    el('line', { 'class': 'g-mid', x1: vb.x + 10, x2: vb.x + vb.w - 10, y1: DATA.midline, y2: DATA.midline }, guide);
    el('line', { 'class': 'g-base', x1: vb.x + 10, x2: vb.x + vb.w - 10, y1: DATA.baseline, y2: DATA.baseline }, guide);
    // numbered start dot + direction arrow for every stroke
    S.forEach(function (s, i) {
      var mk = el('g', { 'class': 'mk', opacity: 0 }, gMk);
      if (s.def.kind === 'body') {              // harakat and dots are too short for an arrow: it would hide them
        var at = Math.min(s.len * 0.42, 46);
        var a = s.ghost.getPointAtLength(Math.max(0, at - 4)), b = s.ghost.getPointAtLength(Math.min(s.len, at + 4));
        var tx = b.x - a.x, ty = b.y - a.y, tl = Math.sqrt(tx * tx + ty * ty) || 1; tx /= tl; ty /= tl;
        var cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, nx = -ty, ny = tx;
        el('path', { 'class': 'arr', d: 'M' + (cx + tx * 11) + ' ' + (cy + ty * 11) + ' L' + (cx - tx * 7 + nx * 9) + ' ' + (cy - ty * 7 + ny * 9) + ' L' + (cx - tx * 7 - nx * 9) + ' ' + (cy - ty * 7 - ny * 9) + ' Z' }, mk);
      }
      var bd = B[i];
      if (Math.sqrt(Math.pow(bd.x - bd.sx, 2) + Math.pow(bd.y - bd.sy, 2)) > 26) el('line', { 'class': 'lead', x1: bd.sx, y1: bd.sy, x2: bd.x, y2: bd.y }, mk);
      el('circle', { 'class': 'dot', cx: bd.sx, cy: bd.sy, r: 8 }, mk);
      el('circle', { 'class': 'badge', cx: bd.x, cy: bd.y, r: 12 }, mk);
      var t = el('text', { x: bd.x, y: bd.y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, mk);
      t.textContent = arNum(i + 1);
      s.mk = mk;
    });
    $('item-name').textContent = item.label;
    $('item-name').setAttribute('lang', 'ar');
    svg.setAttribute('aria-label', item.name + ' — ' + item.en);
    sizeCanvas();
  }
  function showInk(i, on, cls) {
    var s = S[i];
    s.ink.style.strokeDashoffset = on ? 0 : s.len + 1;
    s.ink.classList.toggle('is-help', cls === 'help');
  }
  function mark(i, state) {             // state: '' (hidden) | 'now' | 'past' | 'all'
    var m = S[i].mk;
    m.setAttribute('opacity', state ? 1 : 0);
    m.classList.toggle('is-now', state === 'now');
    m.classList.toggle('is-past', state === 'past');
  }

  /* ── WATCH ─────────────────────────────────────────────────────────── */
  var A = { raf: 0, i: -1, last: -1, phase: '', t0: 0, stepMode: false, running: false, onEnd: null, only: -1 };
  function durOf(s) {
    var k = s.def.kind;
    var sec = k === 'dot' ? 0.8 : k === 'mark' ? 1.1 : Math.min(2.5, Math.max(1.5, s.len / 130));
    return sec * 1000 / speed;
  }
  function stopAnim() { cancelAnimationFrame(A.raf); A.raf = 0; A.running = false; A.only = -1; A.onEnd = null; }
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function beginStroke(i, ts) {
    A.i = i; A.phase = 'draw'; A.t0 = ts;
    for (var k = 0; k < i; k++) mark(k, 'past');
    mark(i, 'now');
    say(i); speakNow();
  }
  function tick(ts) {
    var s = S[A.i];
    if (A.phase === 'draw') {
      var p = Math.min(1, (ts - A.t0) / durOf(s));
      s.ink.style.strokeDashoffset = (s.len + 1) * (1 - ease(p));
      if (p >= 1) {
        s.ink.style.strokeDashoffset = 0;
        if (A.only < 0) A.last = A.i;
        if (A.only > -1) { var cb = A.onEnd; A.running = false; A.raf = 0; if (cb) cb(); return; }
        if (A.stepMode) { A.running = false; A.raf = 0; mark(A.i, 'past'); stepEndMsg(); return; }
        A.phase = 'pause'; A.t0 = ts;
      }
    } else if (A.phase === 'pause') {
      if (ts - A.t0 >= 600 / speed) {
        if (A.i + 1 >= S.length) { A.running = false; A.raf = 0; watchDone(); return; }
        beginStroke(A.i + 1, ts);
      }
    }
    A.raf = requestAnimationFrame(tick);
  }
  function resetInk() { A.last = -1; S.forEach(function (s, i) { showInk(i, false); mark(i, ''); }); }
  function play(fromI) {
    stopAnim();
    if (still()) { showAll(); return; }
    resetInk();
    A.running = true;
    A.raf = requestAnimationFrame(function (ts) { beginStroke(fromI, ts); A.raf = requestAnimationFrame(tick); });
  }
  function showAll() {                  // reduced motion (and the end state of watch): everything at once, numbered
    stopAnim();
    S.forEach(function (s, i) { showInk(i, true); mark(i, 'all'); });
    A.i = S.length - 1;
    stepNo.textContent = 'الْخُطَوَاتُ ' + arNum(1) + '–' + arNum(S.length);
    sayEl.textContent = S[0].def.say;
    sayEn.textContent = 'All ' + S.length + ' steps are numbered. Step 1 — ' + S[0].def.en + ' Tap “Next step” to hear each one.';
    bubble.classList.remove('is-hint', 'is-good');
    A.i = -1;
  }
  function stepEndMsg() {
    if (A.i + 1 >= S.length) watchDone();
    else { stepNo.textContent += ' · اِضْغَطْ «خُطْوَةً خُطْوَةً»'; }
  }
  function watchDone() {
    A.last = S.length - 1;
    for (var k = 0; k < S.length; k++) mark(k, 'all');
    stepNo.textContent = 'الْخُطَوَاتُ ' + arNum(1) + '–' + arNum(S.length);
    sayText('الْآنَ دَوْرُكَ! اِضْغَطْ «اُكْتُبْ».', 'Now it’s your turn! Tap “Write”.', 'is-good');
    var w = document.querySelector('[data-mode="write"]');
    w.classList.remove('is-nudge'); void w.offsetWidth; if (!still()) w.classList.add('is-nudge');
  }
  function nextStep() {                 // step-by-step: one stroke per tap
    if (mode !== 'watch') return;
    if (still()) {                      // static: highlight the step and read it
      A.i = (A.i + 1) % S.length;
      S.forEach(function (s, k) { mark(k, k === A.i ? 'now' : 'past'); });
      say(A.i); speakNow(); return;
    }
    A.stepMode = true;
    if (A.running) return;              // the stroke being drawn finishes, then it waits
    var from = A.last + 1;
    if (from >= S.length) { from = 0; resetInk(); }
    A.running = true;
    A.raf = requestAnimationFrame(function (ts) { beginStroke(from, ts); A.raf = requestAnimationFrame(tick); });
  }
  function replayOne(i, cb) {           // write mode: show this one stroke again
    stopAnim();
    if (still()) { S[i].ink.style.strokeDashoffset = 0; if (cb) cb(); return; }
    S[i].ink.style.strokeDashoffset = S[i].len + 1;
    A.only = i; A.i = i; A.phase = 'draw'; A.running = true; A.onEnd = cb;
    A.raf = requestAnimationFrame(function (ts) { A.t0 = ts; A.raf = requestAnimationFrame(tick); });
  }

  /* ── WRITE ─────────────────────────────────────────────────────────── */
  var Wr = { i: 0, tries: 0, lines: [], cur: null, finished: false, penUntil: 0, hintTimer: 0, fadeRaf: 0 };
  var dpr = 1, scale = 1;
  function sizeCanvas() {
    var r = stage.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    ink.width = Math.round(r.width * dpr); ink.height = Math.round(r.height * dpr);
    scale = r.width / vb.w;
    paint();
  }
  function paint() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ink.width, ink.height);
    var k = dpr * scale;
    ctx.setTransform(k, 0, 0, k, -vb.x * k, -vb.y * k);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var cInk = tok('--ink', '#123'), cGood = tok('--good', '#2F9E44');
    Wr.lines.forEach(function (L) {
      ctx.globalAlpha = L.alpha == null ? 1 : L.alpha;
      ctx.strokeStyle = ctx.fillStyle = L.state === 'good' ? cGood : cInk;
      var p = L.pts;
      if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0].x, p[0].y, p[0].w / 2 + 2, 0, Math.PI * 2); ctx.fill(); return; }
      for (var i = 1; i < p.length; i++) {
        ctx.lineWidth = (p[i - 1].w + p[i].w) / 2;
        ctx.beginPath(); ctx.moveTo(p[i - 1].x, p[i - 1].y); ctx.lineTo(p[i].x, p[i].y); ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  }
  function pt(e) {
    var r = ink.getBoundingClientRect(), f = vb.w / r.width;
    var w = e.pointerType === 'pen' && e.pressure > 0 ? 13 * (0.55 + e.pressure * 0.9) : 13;
    return { x: vb.x + (e.clientX - r.left) * f, y: vb.y + (e.clientY - r.top) * f, w: w };
  }
  function writeStart() {
    stopAnim(); clearTimeout(Wr.hintTimer); cancelAnimationFrame(Wr.fadeRaf);
    Wr.i = 0; Wr.tries = 0; Wr.lines = []; Wr.cur = null; Wr.finished = false; Wr.busy = false;
    $('done').hidden = true; $('reward').innerHTML = '';
    S.forEach(function (s, i) { showInk(i, false); mark(i, ''); });
    stage.setAttribute('data-step', '0'); stage.removeAttribute('data-done');
    paint();
    nextPrompt('');
  }
  function nextPrompt(prefix) {
    S.forEach(function (s, i) { if (i !== Wr.i) mark(i, ''); });
    mark(Wr.i, 'now');
    stage.setAttribute('data-step', String(Wr.i));
    say(Wr.i, prefix); speakNow();
    setNoori('happy');
  }
  ink.addEventListener('pointerdown', function (e) {
    if (mode !== 'write' || Wr.finished || Wr.busy) return;
    if (e.pointerType === 'pen') Wr.penUntil = Date.now() + 1500;
    else if (e.pointerType === 'touch' && Date.now() < Wr.penUntil) return;    // palm while the pen is busy
    if (Wr.cur || e.button > 0) return;                                          // one finger at a time
    e.preventDefault();
    try { ink.setPointerCapture(e.pointerId); } catch (x) {}
    // the child starts writing: stop any replay, hide the shown model stroke
    if (A.only > -1 || A.running) stopAnim();
    clearTimeout(Wr.hintTimer);
    S.forEach(function (s, i) { if (!s.helped) showInk(i, false); });
    Wr.cur = { id: e.pointerId, pts: [pt(e)], state: 'draw' };
    Wr.lines.push(Wr.cur);
    paint();
  });
  ink.addEventListener('pointermove', function (e) {
    var c = Wr.cur; if (!c || e.pointerId !== c.id) return;
    if (e.pointerType === 'pen') Wr.penUntil = Date.now() + 1500;
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    if (!evs || !evs.length) evs = [e];
    evs.forEach(function (ev) { c.pts.push(pt(ev)); });
    paint();
  });
  function up(e) {
    var c = Wr.cur; if (!c || e.pointerId !== c.id) return;
    Wr.cur = null;
    if (e.type === 'pointercancel') { Wr.lines.pop(); paint(); return; }
    judge(c);
  }
  ink.addEventListener('pointerup', up);
  ink.addEventListener('pointercancel', up);

  /* gentle check of one stroke → { ok, why: 'start'|'dir'|'path'|'end' } */
  function check(user, s, tol) {
    var M = s.pts, k = s.def.kind;
    // resample the child's line every ~3 units
    var U = [user[0]];
    for (var i = 1; i < user.length; i++) { if (dist(user[i], U[U.length - 1]) >= 3) U.push(user[i]); }
    if (k === 'dot') {
      var cx = 0, cy = 0; M.forEach(function (p) { cx += p.x; cy += p.y; });
      var c = { x: cx / M.length, y: cy / M.length }, ux = 0, uy = 0;
      U.forEach(function (p) { ux += p.x; uy += p.y; });
      var uc = { x: ux / U.length, y: uy / U.length }, ext = 0;
      U.forEach(function (p) { ext = Math.max(ext, dist(p, uc)); });
      if (dist(uc, c) > 34 * tol) return { ok: false, why: 'start' };
      if (ext > 60 * tol) return { ok: false, why: 'dot' };
      return { ok: true };
    }
    if (dist(U[0], M[0]) > 40 * tol) return { ok: false, why: 'start' };
    var near = 28 * tol;
    function nearest(p) { var b = 1e9; for (var j = 0; j < M.length; j++) { var d = dist(p, M[j]); if (d < b) b = d; } return b; }
    var onLine = 0; U.forEach(function (p) { if (nearest(p) <= near) onLine++; });
    var covered = 0, lastCovered = -1;
    M.forEach(function (m, j) { for (var q = 0; q < U.length; q++) { if (dist(m, U[q]) <= near) { covered++; lastCovered = j; return; } } });
    if (onLine / U.length < 0.7) return { ok: false, why: 'path' };
    // direction: walk along the model as the child's line goes; prefer moving forward
    var prev = 0, fwd = 0, cnt = 0;
    for (var u = 0; u < U.length; u += 2) {
      var best = 1e9, j2, dd = [];
      for (j2 = 0; j2 < M.length; j2++) { dd[j2] = dist(U[u], M[j2]); if (dd[j2] < best) best = dd[j2]; }
      if (best > near) continue;
      var pick = -1, cost = 1e9;
      for (j2 = 0; j2 < M.length; j2++) {
        if (dd[j2] > best + 12) continue;
        var c2 = j2 >= prev ? j2 - prev : (prev - j2) * 3;
        if (c2 < cost) { cost = c2; pick = j2; }
      }
      cnt++; if (pick >= prev - 3) fwd++;
      prev = pick;
    }
    if (cnt > 3 && fwd / cnt < 0.75) return { ok: false, why: 'dir' };
    if (covered / M.length < 0.7) return { ok: false, why: lastCovered < M.length * 0.75 ? 'end' : 'path' };
    return { ok: true };
  }
  var HINTS = {
    start: ['اِبْدَأْ مِنَ النُّقْطَةِ الْخَضْرَاءِ.', 'Start at the green dot.'],
    dir:   ['اِتَّبِعِ السَّهْمَ.', 'Follow the arrow.'],
    path:  ['اِمْشِ عَلَى الْخَطِّ الْخَفِيفِ.', 'Walk along the light line.'],
    end:   ['اِسْتَمِرَّ حَتَّى آخِرِ الْخَطِّ.', 'Keep going to the end of the line.'],
    dot:   ['نُقْطَةٌ صَغِيرَةٌ فَقَطْ، هُنَا.', 'Just a little dot, right here.']
  };
  var PRAISE = [['رَائِعٌ!', 'Great!'], ['جَمِيلٌ!', 'Lovely!'], ['مُمْتَازٌ!', 'Excellent!']];
  function judge(line) {
    var s = S[Wr.i];
    var tol = Math.min(1.6, 1 + 0.2 * Wr.tries);
    var r = check(line.pts, s, tol);
    if (r.ok) {
      line.state = 'good'; paint();
      KS.sfx('pop');
      advance(PRAISE[Wr.i % PRAISE.length]);
      return;
    }
    Wr.tries++;
    fade(line);
    if (Wr.tries >= 3) { help(); return; }
    var h = HINTS[r.why] || HINTS.path;
    setNoori('think');
    stepNo.textContent = 'لِنَنْظُرْ مَعًا مَرَّةً أُخْرَى · الْخُطْوَةُ ' + arNum(Wr.i + 1) + ' مِنْ ' + arNum(S.length);
    sayText(h[0], 'Let’s look again together. ' + h[1], 'is-hint');
    speakNow();
    var i = Wr.i;
    replayOne(i, function () { Wr.hintTimer = setTimeout(function () { if (Wr.i === i && !Wr.cur) showInk(i, false); }, still() ? 2600 : 900); });
  }
  function fade(line) {
    if (still()) { Wr.lines.splice(Wr.lines.indexOf(line), 1); paint(); return; }
    var t0 = performance.now();
    line.state = 'fade';
    (function f(ts) {
      var p = Math.min(1, ((ts || performance.now()) - t0) / 550);
      line.alpha = 1 - p; paint();
      if (p < 1) Wr.fadeRaf = requestAnimationFrame(f);
      else { var x = Wr.lines.indexOf(line); if (x > -1) Wr.lines.splice(x, 1); paint(); }
    })(t0);
  }
  function help() {                     // third try: Noori draws this step, the child carries on
    var i = Wr.i;
    S[i].helped = true;
    setNoori('happy');
    sayText('سَأُسَاعِدُكَ فِي هَذِهِ الْخُطْوَةِ.', 'I’ll help you with this step.', 'is-good');
    Wr.busy = true;
    S[i].ink.classList.add('is-help');
    replayOne(i, function () {
      Wr.hintTimer = setTimeout(function () { Wr.busy = false; advance(['هَيَّا نُكْمِلُ!', 'Let’s carry on!']); }, still() ? 1200 : 500);
    });
  }
  function advance(praise) {
    mark(Wr.i, '');
    Wr.i++; Wr.tries = 0;
    if (Wr.i >= S.length) { finish(); return; }
    nextPrompt(praise[0]);
    sayEn.textContent = praise[1] + ' ' + sayEn.textContent;
  }
  function finish() {
    Wr.finished = true;
    stage.setAttribute('data-done', '1');
    doneItems[item.id] = true;
    buildItems();
    $('doneStars').innerHTML = KS.star(true) + KS.star(true) + KS.star(true);
    setNoori('cheer');
    stepNo.textContent = '';
    sayText('عَمَلٌ رَائِعٌ!', 'Great work! You wrote it, step by step.', 'is-good');
    KS.sfx('good'); KS.confetti(40);
    var n = nextOf();
    var b = $('nextItem'), nx = LEVELS[n[0]].items[n[1]];
    b.innerHTML = (n[0] === 0 && n[1] === 0 ? 'مِنَ الْبِدَايَةِ <span class="en">Start again from ا</span>'
      : (LEVELS[n[0]].id === 3 ? 'الْكَلِمَةُ التَّالِيَةُ' : 'الْحَرْفُ التَّالِي') + ' «' + nx.label + '» <span class="en">Next</span>');
    $('done').hidden = false;
    setTimeout(function () { try { b.focus({ preventScroll: true }); } catch (e) {} }, 50);
  }
  function nextOf() {
    if (it + 1 < LEVELS[lv].items.length) return [lv, it + 1];
    if (lv + 1 < LEVELS.length) return [lv + 1, 0];
    return [0, 0];
  }

  /* ── modes + controls ──────────────────────────────────────────────── */
  function setMode(m) {
    mode = m;
    game.classList.toggle('is-write', m === 'write');
    var bs = document.querySelectorAll('[data-mode]');
    for (var i = 0; i < bs.length; i++) { bs[i].setAttribute('aria-pressed', String(bs[i].getAttribute('data-mode') === m)); bs[i].classList.remove('is-nudge'); }
    $('ctlWatch').hidden = m !== 'watch';
    $('ctlWrite').hidden = m !== 'write';
    $('done').hidden = true; $('reward').innerHTML = '';
    S.forEach(function (s) { s.helped = false; s.ink.classList.remove('is-help'); });
    if (m === 'write') {
      sizeCanvas(); writeStart();
      var r = stage.getBoundingClientRect();     // phones: bring the whole writing area on screen
      if (r.bottom > window.innerHeight || r.top < 0) try { stage.scrollIntoView({ block: 'center', behavior: still() ? 'auto' : 'smooth' }); } catch (e) {}
    }
    else { Wr.lines = []; paint(); setNoori('happy'); A.stepMode = false; play(0); }
  }
  function load() {
    stopAnim(); clearTimeout(Wr.hintTimer);
    buildItems();
    render();
    setMode('watch');
  }
  document.querySelector('.wg-modes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]'); if (!b) return;
    KS.sfx('pop'); setMode(b.getAttribute('data-mode'));
  });
  $('replay').addEventListener('click', function () { A.stepMode = false; setNoori('happy'); play(0); });
  $('stepBtn').addEventListener('click', nextStep);
  document.querySelector('.wg-speed').addEventListener('click', function (e) {
    var b = e.target.closest('[data-speed]'); if (!b) return;
    speed = +b.getAttribute('data-speed');
    var bs = this.querySelectorAll('[data-speed]');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', String(bs[i] === b));
  });
  $('showStep').addEventListener('click', function () {
    if (Wr.finished) return;
    var i = Wr.i; say(i); speakNow();
    replayOne(i, function () { Wr.hintTimer = setTimeout(function () { if (Wr.i === i && !Wr.cur) showInk(i, false); }, still() ? 2600 : 900); });
  });
  $('restart').addEventListener('click', function () { S.forEach(function (s) { s.helped = false; s.ink.classList.remove('is-help'); }); writeStart(); });
  $('again').addEventListener('click', function () { setMode('write'); });
  $('nextItem').addEventListener('click', function () {
    var n = nextOf(); var lvChanged = n[0] !== lv;
    lv = n[0]; it = n[1];
    if (lvChanged) buildLevels();
    load();
    try { $('stage').scrollIntoView({ block: 'nearest', behavior: still() ? 'auto' : 'smooth' }); } catch (e) {}
  });
  $('listenStep').innerHTML = KS.ICON_SPEAK; $('listenWord').innerHTML = KS.ICON_SPEAK;
  $('listenStep').addEventListener('click', function () { KS.speak(sayEl.textContent, this); });
  $('listenWord').addEventListener('click', function () { KS.speak(item.say, this); });

  if ('ResizeObserver' in window) new ResizeObserver(sizeCanvas).observe(stage);
  else window.addEventListener('resize', sizeCanvas);
  document.addEventListener('ks:theme', paint);
  if (mq.addEventListener) mq.addEventListener('change', function () { if (mode === 'watch') play(0); });

  // deep link ?item=<id>
  try {
    var want = (/[?&]item=([^&]+)/.exec(location.search) || [])[1];
    if (want) LEVELS.forEach(function (L, a) { L.items.forEach(function (x, b) { if (x.id === decodeURIComponent(want)) { lv = a; it = b; } }); });
  } catch (e) {}
  setNoori('happy');
  buildLevels();
  load();
})();
