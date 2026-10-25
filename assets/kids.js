/* ============================================================================
   kids.js — shared behaviour for «نَوْرَس» Nawras (classic script, no modules)
   ----------------------------------------------------------------------------
   Exposes window.KS:
     KS.THEMES                      ['pacific','andalus','fanous','kurrasa','mosaic','mihrab']
     KS.setTheme(name, persist)     apply a theme (persist=true also saves it)
     KS.gull(mood, opts)            → SVG markup string of Noori the seagull
                                      mood: 'happy' | 'wave' | 'fly' | 'think' | 'cheer' | 'sleep'
                                      opts: { label: 'aria label', cls: 'extra classes' }
     KS.cheer(el)                   make a gull (or the gull inside el) do a happy flap+hop
     KS.speak(text, btn?)           Arabic speechSynthesis, rate .85; fails silently
     KS.sfx('good'|'bad'|'pop')     soft WebAudio tones (respects KS.muted)
     KS.mute(bool?)                 get/set mute (saved in localStorage)
     KS.confetti(n?)                burst of themed confetti
     KS.ta(word)                    → HTML with the trailing ة wrapped in <span class="ta">,
                                      ZWJ on both sides of the split so letters stay joined
     KS.star(on)                    → SVG markup of a 5-point star (for .stars)
     KS.writePad(el, {model, lines}) handwriting canvas (see its block below)
     URL ?theme=<id>&art=svg|img and postMessage({nawras:'theme', id}) / ({nawras:'art', mode})
                                    switch theme / artwork for this view only (not saved).
     KS.art(mode?)                  get/set the artwork mode: 'ill' (رُسُومٌ مُلَوَّنَةٌ, generated
                                      pictures in assets/art/, the default) or 'svg' (رُسُومٌ
                                      بَسِيطَةٌ, the inline drawings). Saved in localStorage
                                      'nawras-art'; <html data-art="svg|ill"> mirrors it.
                                      In 'ill' mode KS.gull / KS.pic return an <img>; if the file
                                      is missing the <img> swaps itself back to the SVG (onerror).
                                      Pass {svg:true} to KS.gull / KS.pic to always get the SVG.
                                      <html data-art-fixed data-art="svg"> pins a page (print).
                                      Static page art: .ill-only (shown in 'ill'), .svg-only
                                      (hidden in 'ill' unless its [data-art-slot] got .art-miss).
   Auto-wiring on DOMContentLoaded:
     [data-gull="mood"]             filled with KS.gull(mood)
     [data-say="text"]              click → KS.speak(text)
     [data-ta]                      textContent re-rendered through KS.ta
     [data-words]                   word-by-word entrance (reduced motion: instant)
     [data-writepad]                KS.writePad (data-model="ة|هَذِهِ" data-lines="2")
     [data-reveal]                  fade-up when scrolled into view (stagger with style="--i:n")
     theme picker                   into [data-picker-slot] if present, otherwise floating

   Theme rules:
     - <html data-theme="x" data-theme-fixed> (mockups): the page always OPENS in its
       own theme; the picker lets you try others for this view (and remembers the
       choice for non-fixed pages such as lessons).
     - Pages without data-theme-fixed use the saved theme. To avoid a flash, put this
       inline in <head>:
       <script>try{var t=localStorage.getItem('nawras-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
   ========================================================================= */
(function () {
  'use strict';

  var KS = window.KS || {};
  var THEMES = ['pacific', 'andalus', 'fanous', 'kurrasa', 'mosaic', 'mihrab'];
  var NAMES = {
    pacific: ['الْمُحِيطُ', 'Pacific'],
    andalus: ['الْأَنْدَلُسُ', 'Andalus'],
    fanous:  ['الْفَانُوسُ', 'Fanous'],
    kurrasa: ['الْكُرَّاسَةُ', 'Kurrasa'],
    mosaic:  ['الْفُسَيْفِسَاءُ', 'Mosaic'],
    mihrab:  ['الْمِحْرَابُ', 'Mihrab']
  };
  var KEY = 'nawras-theme';
  var MUTE_KEY = 'nawras-mute';
  var ART_KEY = 'nawras-art';
  var root = document.documentElement;
  root.classList.add('ks-js');

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ── artwork mode (illustrated pictures ↔ simple SVG) ───────────────── */
  // assets/art/ sits next to this script, wherever the page is (lessons/, book/books/ …)
  var ART_BASE = (function () {
    try { var src = document.currentScript && document.currentScript.src; if (src) return src.replace(/kids\.js(\?.*)?$/, 'art/'); } catch (e) {}
    return 'assets/art/';
  })();
  if (!root.hasAttribute('data-art-fixed')) root.setAttribute('data-art', store(ART_KEY) === 'svg' ? 'svg' : 'ill');
  // ?theme=<id> / ?art=svg|img (e.g. the owners' deck embedding a page): applied for this view only, never saved
  var QS = {};
  try { location.search.replace(/^\?/, '').split('&').forEach(function (kv) { var a = kv.split('='); if (a[0]) QS[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || ''); }); } catch (e) {}
  function artParam(v) { return v === 'svg' ? 'svg' : (v === 'img' || v === 'ill') ? 'ill' : null; }
  if (artParam(QS.art) && !root.hasAttribute('data-art-fixed')) root.setAttribute('data-art', artParam(QS.art));
  function artMode() { return root.getAttribute('data-art') === 'svg' ? 'svg' : 'ill'; }
  function setArt(m, persist) {
    m = m === 'svg' ? 'svg' : 'ill';
    if (root.hasAttribute('data-art-fixed')) return artMode();
    root.setAttribute('data-art', m);
    if (persist !== false) store(ART_KEY, m);
    var bs = document.querySelectorAll('[data-set-art]');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', String(bs[i].getAttribute('data-set-art') === m));
    refreshArt();
    try { document.dispatchEvent(new CustomEvent('ks:art', { detail: m })); } catch (e) {}
    return m;
  }
  // re-draw every picture KS made, in the current mode (keeps label / decorative / mood)
  function refreshArt() {
    var i, el, g = document.querySelectorAll('.gull[data-mood]:not([data-svg])');
    for (i = 0; i < g.length; i++) {
      el = g[i];
      el.outerHTML = gull(el.getAttribute('data-mood'), { label: el.getAttribute('aria-label') || el.getAttribute('alt') || undefined, cls: el.getAttribute('data-cls') || '' });
    }
    if (!KS.pic) return;
    var p = document.querySelectorAll('.pic[data-pic-name]:not([data-svg])');
    for (i = 0; i < p.length; i++) {
      el = p[i];
      el.outerHTML = KS.pic(el.getAttribute('data-pic-name'), { label: el.getAttribute('aria-label') || el.getAttribute('alt') || undefined, decorative: el.getAttribute('aria-hidden') === 'true', cls: el.getAttribute('data-cls') || '' });
    }
  }
  // <img onerror> → the same picture as SVG (it keeps following the switch afterwards)
  function artFallback(img) {
    try {
      var lab = img.getAttribute('alt') || undefined, cls = img.getAttribute('data-cls') || '', h;
      if (img.hasAttribute('data-mood')) h = gull(img.getAttribute('data-mood'), { label: lab, cls: cls, svg: true });
      else if (img.hasAttribute('data-pic-name') && KS.pic) h = KS.pic(img.getAttribute('data-pic-name'), { label: lab, decorative: img.getAttribute('aria-hidden') === 'true', cls: cls, svg: true });
      if (h) img.outerHTML = h.replace(' data-svg', '');
    } catch (e) {}
  }
  KS.art = function (m) { return m === undefined ? artMode() : setArt(m, true); };
  KS.artBase = ART_BASE;
  KS.artFallback = artFallback;
  KS.refreshArt = refreshArt;

  /* ── themes ─────────────────────────────────────────────────────────── */
  function current() { return root.getAttribute('data-theme') || 'pacific'; }
  function setTheme(t, persist) {
    if (THEMES.indexOf(t) < 0) return;
    root.setAttribute('data-theme', t);
    if (persist) store(KEY, t);
    var sw = document.querySelectorAll('.ks-swatch');
    for (var i = 0; i < sw.length; i++) sw[i].setAttribute('aria-pressed', String(sw[i].getAttribute('data-set-theme') === t));
    try { document.dispatchEvent(new CustomEvent('ks:theme', { detail: t })); } catch (e) {}
  }
  if (!root.hasAttribute('data-theme-fixed')) {
    var saved = store(KEY);
    if (saved && THEMES.indexOf(saved) > -1) root.setAttribute('data-theme', saved);
  }
  if (THEMES.indexOf(QS.theme) > -1) root.setAttribute('data-theme', QS.theme);   // overrides the page's own theme, not saved
  // a parent page (the owners' deck) can switch an embedded page:
  //   postMessage({nawras:'theme', id:'fanous'}) · postMessage({nawras:'art', mode:'svg'|'img'})
  // anything else is ignored; nothing is saved to localStorage.
  window.addEventListener('message', function (e) {
    var d = e && e.data;
    if (!d || typeof d !== 'object') return;
    if (d.nawras === 'theme' && THEMES.indexOf(d.id) > -1) setTheme(d.id, false);
    else if (d.nawras === 'art' && artParam(d.mode)) setArt(artParam(d.mode), false);
  });

  var ICON_PALETTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.3" fill="currentColor"/><circle cx="10.5" cy="7.2" r="1.3" fill="currentColor"/><circle cx="15" cy="7.5" r="1.3" fill="currentColor"/></svg>';
  var ICON_SOUND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
  var ICON_MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  var ICON_SPEAK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
  KS.ICON_SPEAK = ICON_SPEAK;

  function buildPicker() {
    var wrap = document.createElement('div');
    wrap.className = 'ks-picker';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Theme · السِّمَةُ');
    var html = '<span class="ks-picker__label">Try a theme · جَرِّبْ سِمَةً</span>';
    for (var i = 0; i < THEMES.length; i++) {
      var t = THEMES[i];
      html += '<button type="button" class="ks-swatch" data-set-theme="' + t + '" aria-pressed="' + (t === current()) + '" title="' + NAMES[t][1] + ' · ' + NAMES[t][0] + '"><span class="sr-only">' + NAMES[t][1] + '</span></button>';
    }
    if (!root.hasAttribute('data-art-fixed')) {
      var am = artMode();
      html += '<div class="ks-art" role="group" aria-label="الرُّسُومُ — Artwork">' +
        '<span class="ks-picker__label">Artwork · الرُّسُومُ</span>' +
        '<button type="button" class="ks-art__btn" data-set-art="svg" aria-pressed="' + (am === 'svg') + '">رُسُومٌ بَسِيطَةٌ<span class="en">Simple</span></button>' +
        '<button type="button" class="ks-art__btn" data-set-art="ill" aria-pressed="' + (am === 'ill') + '">رُسُومٌ مُلَوَّنَةٌ<span class="en">Illustrated</span></button>' +
      '</div>';
    }
    wrap.innerHTML = html;
    wrap.addEventListener('click', function (e) {
      var a = e.target.closest('[data-set-art]');
      if (a) { setArt(a.getAttribute('data-set-art'), true); sfx('pop'); return; }
      var b = e.target.closest('[data-set-theme]');
      if (!b) return;
      setTheme(b.getAttribute('data-set-theme'), true);
      sfx('pop');
    });
    return wrap;
  }

  function mountPicker() {
    if (document.querySelector('.ks-picker') || root.hasAttribute('data-no-picker')) return;
    try { if (window.top !== window.self) return; } catch (e) { return; }   // no picker inside preview iframes
    var slot = document.querySelector('[data-picker-slot]');
    if (slot) { slot.appendChild(buildPicker()); return; }
    var fab = document.createElement('div');
    fab.className = 'ks-fab';
    fab.innerHTML =
      '<div class="ks-fab__row">' +
        '<button type="button" class="ks-fab__toggle" aria-expanded="false" aria-label="Themes">' + ICON_PALETTE + '</button>' +
        '<button type="button" class="ks-fab__mute" aria-pressed="false" aria-label="Sound on/off">' + ICON_SOUND + '</button>' +
      '</div>';
    var picker = buildPicker();
    picker.hidden = true;
    fab.appendChild(picker);
    var tog = fab.querySelector('.ks-fab__toggle');
    tog.addEventListener('click', function () {
      picker.hidden = !picker.hidden;
      tog.setAttribute('aria-expanded', String(!picker.hidden));
    });
    var mb = fab.querySelector('.ks-fab__mute');
    function paintMute() { mb.innerHTML = KS.muted ? ICON_MUTED : ICON_SOUND; mb.setAttribute('aria-pressed', String(KS.muted)); }
    mb.addEventListener('click', function () { mute(!KS.muted); paintMute(); if (!KS.muted) sfx('pop'); });
    paintMute();
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !picker.hidden) { picker.hidden = true; tog.setAttribute('aria-expanded', 'false'); } });
    document.body.appendChild(fab);
  }

  /* ── Noori the seagull ──────────────────────────────────────────────── */
  var gullN = 0;
  function gull(mood, opts) {
    if (['happy', 'wave', 'fly', 'think', 'cheer', 'sleep'].indexOf(mood) < 0) mood = 'happy';
    opts = opts || {};
    var label = esc(opts.label || 'نُورِي — Noori the seagull');
    var extra = opts.cls ? esc(String(opts.cls)) : '';
    var keep = ' data-mood="' + mood + '"' + (extra ? ' data-cls="' + extra + '"' : '') + (opts.svg ? ' data-svg' : '');
    if (!opts.svg && artMode() === 'ill') {
      gullN++;
      return '<img class="gull gull--img is-' + mood + (extra ? ' ' + extra : '') + '" src="' + ART_BASE + 'noori/' + mood + '.webp" alt="' + label + '"' + keep +
        ' data-gull-id="' + gullN + '" decoding="async" draggable="false" style="object-fit:contain" onerror="KS.artFallback(this)">';
    }
    var sleep = mood === 'sleep';
    var think = mood === 'think';
    var px = think ? 1.6 : 0, py = think ? -2 : 0;   // pupils look up when thinking
    gullN++;
    var eyes = sleep
      ? '<path class="g-line" fill="none" d="M40 51 q6 5 12 0 M68 51 q6 5 12 0"/>'
      : '<circle class="g-eye" cx="' + (46 + px) + '" cy="' + (50 + py) + '" r="7"/>' +
        '<circle class="g-eye" cx="' + (74 + px) + '" cy="' + (50 + py) + '" r="7"/>' +
        '<circle fill="#fff" cx="' + (48.6 + px) + '" cy="' + (47.4 + py) + '" r="2.6"/>' +
        '<circle fill="#fff" cx="' + (76.6 + px) + '" cy="' + (47.4 + py) + '" r="2.6"/>' +
        '<circle fill="#fff" opacity=".7" cx="' + (44 + px) + '" cy="' + (53 + py) + '" r="1.2"/>' +
        '<circle fill="#fff" opacity=".7" cx="' + (72 + px) + '" cy="' + (53 + py) + '" r="1.2"/>';
    var wingL =
      '<g class="gull-wing-l">' +
        '<path class="g-wing g-line" d="M34 60 C18 62 9 80 12 98 C24 97 34 88 38 76 Z"/>' +
        '<path class="g-tip" d="M12.6 96.6 C11 90 11.5 85 13.6 80 C16 87 19 91 23.5 94.4 C19.8 96 16 96.8 12.6 96.6Z"/>' +
      '</g>';
    var wingR =
      '<g class="gull-wing-r">' +
        '<path class="g-wing g-line" d="M86 60 C102 62 111 80 108 98 C96 97 86 88 82 76 Z"/>' +
        '<path class="g-tip" d="M107.4 96.6 C109 90 108.5 85 106.4 80 C104 87 101 91 96.5 94.4 C100.2 96 104 96.8 107.4 96.6Z"/>' +
      '</g>';
    return '' +
      '<svg class="gull is-' + mood + (extra ? ' ' + extra : '') + '" viewBox="0 0 120 120" role="img" aria-label="' + label + '"' + keep + ' data-gull-id="' + gullN + '">' +
        '<ellipse class="g-shadow" cx="60" cy="114" rx="26" ry="4"/>' +
        '<path class="g-feet g-line" d="M49 103 l-7 9 h14 z M71 103 l-7 9 h14 z"/>' +
        wingL + wingR +
        '<g class="gull-head">' +
          '<path class="g-body g-line" d="M60 16 C86 16 98 40 97 66 C96 94 80 108 60 108 C40 108 24 94 23 66 C22 40 34 16 60 16 Z"/>' +
          '<path class="g-body g-line" d="M56 18 C52 9 58 4 66 6 C61 8.5 61 13 63 17.5"/>' +
          '<ellipse class="g-belly" cx="60" cy="88" rx="23" ry="15"/>' +
          '<path class="g-scarf g-line" d="M29 72 C45 82 75 82 91 72 L92 81 C75 92 45 92 28 81 Z"/>' +
          '<path class="g-scarf g-line" d="M74 85 L84 101 L75 100 L69 87 Z"/>' +
          '<ellipse class="g-cheek" cx="37" cy="61" rx="6" ry="3.6"/>' +
          '<ellipse class="g-cheek" cx="83" cy="61" rx="6" ry="3.6"/>' +
          '<g class="gull-eyes">' + eyes + '</g>' +
          '<path class="g-beak g-line" d="M51 58 Q60 53.5 69 58 Q64.5 70 60 71.5 Q55.5 70 51 58 Z"/>' +
          '<circle class="g-dot" cx="63.2" cy="64" r="1.7"/>' +
        '</g>' +
      '</svg>';
  }

  function cheer(el) {
    var g = el && (el.classList && el.classList.contains('gull') ? el : el.querySelector && el.querySelector('.gull'));
    if (!g) return;
    g.classList.remove('is-happy'); void g.getBoundingClientRect(); g.classList.add('is-happy');
    setTimeout(function () { g.classList.remove('is-happy'); }, 1400);
  }

  /* ── speech ─────────────────────────────────────────────────────────── */
  var arVoice = null;
  function pickVoice() {
    try {
      var vs = window.speechSynthesis.getVoices() || [];
      for (var i = 0; i < vs.length; i++) if (/^ar/i.test(vs[i].lang)) { arVoice = vs[i]; return; }
    } catch (e) {}
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    try { window.speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {}
  }
  function speak(text, btn) {
    try {
      if (!('speechSynthesis' in window) || !text) return;
      var s = window.speechSynthesis;
      s.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = (arVoice && arVoice.lang) || 'ar-SA';
      if (arVoice) u.voice = arVoice;
      u.rate = 0.85;
      if (btn) {
        btn.classList.add('is-speaking');
        var done = function () { btn.classList.remove('is-speaking'); };
        u.onend = done; u.onerror = done;
        setTimeout(done, 6000);
      }
      s.speak(u);
    } catch (e) { /* fail silently */ }
  }

  /* ── sound effects (soft sine tones only) ───────────────────────────── */
  KS.muted = store(MUTE_KEY) === '1';
  function mute(v) {
    if (typeof v === 'boolean') { KS.muted = v; store(MUTE_KEY, v ? '1' : '0'); }
    return KS.muted;
  }
  var actx = null;
  function tone(freq, start, dur, vol, type) {
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, actx.currentTime + start);
    g.gain.setValueAtTime(0.0001, actx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol, actx.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + start + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(actx.currentTime + start); o.stop(actx.currentTime + start + dur + 0.05);
  }
  function sfx(kind) {
    if (KS.muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      if (kind === 'good') { tone(660, 0, .18, .12); tone(880, .1, .22, .12); tone(1175, .2, .3, .1); }
      else if (kind === 'bad') { tone(330, 0, .22, .08, 'triangle'); tone(262, .14, .28, .07, 'triangle'); }
      else { tone(740, 0, .09, .07); }
    } catch (e) { /* no audio: fine */ }
  }

  /* ── confetti ───────────────────────────────────────────────────────── */
  function confetti(n) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    n = n || 70;
    var cs = getComputedStyle(root);
    var cols = ['--c1', '--c2', '--c3', '--c4'].map(function (v) { return cs.getPropertyValue(v).trim() || '#FFC94A'; });
    var box = document.createElement('div');
    box.className = 'confetti';
    var html = '';
    for (var i = 0; i < n; i++) {
      var left = Math.random() * 100;
      html += '<i style="left:' + left.toFixed(1) + '%;background:' + cols[i % cols.length] +
        ';--x:' + ((Math.random() - .5) * 240).toFixed(0) + 'px;--r:' + (Math.random() * 900 - 450).toFixed(0) +
        'deg;--d:' + (1.3 + Math.random() * 1.2).toFixed(2) + 's;animation-delay:' + (Math.random() * .35).toFixed(2) + 's;' +
        (i % 3 === 0 ? 'border-radius:50%;width:12px;height:12px;' : '') + '"></i>';
    }
    box.innerHTML = html;
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 3200);
  }

  /* ── ta marbuta highlight ───────────────────────────────────────────── */
  // ZWJ (U+200D) on both sides of the split keeps the letter before ة joined to it.
  function ta(word) {
    word = String(word || '');
    var m = word.match(/^(.*[^\s])(ة[ً-ْٰ]*)(\s*)$/);
    if (!m) return esc(word);
    return esc(m[1]) + '‍<span class="ta">‍' + esc(m[2]) + '</span>' + m[3];
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function star(on) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="' + (on ? 'star-on' : 'star-off') + '" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
  }


  /* ── writing pad (KS.writePad) ──────────────────────────────────────────
     KS.writePad(el, { model: 'هَذِهِ' | ['ة','هَذَا'], lines: 2, lineHeight: 140 })
     Canvas + Pointer Events: finger, mouse or Apple Pencil (pressure → width).
     touch-action:none so the page does not scroll; touches are ignored while a
     pen is in use (palm rejection). Arabic lines: solid baseline + dotted mid-line,
     faint dotted Naskh model word to trace from the right, green start dot.
     Tools: 3 colours, eraser, undo, clear, show/hide model, save PNG, «انْتَهَيْتُ».
     No grading — «انتهيت» always praises with stars.
     Auto-wired: <div data-writepad data-model="ة|هَذِهِ" data-lines="2"></div>
     Returns { el, clear(), undo(), toPNG(), redraw() }. */
  var I = {
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
    clear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    eraser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 20h12M5.5 14.5l8-8a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L12 18H8.5z"/><path d="M9 11l5 5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>',
    done: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>'
  };
  var PEN_TOKENS = ['--ink', '--masc-text', '--fem-text'];
  var PEN_NAMES = [['أَسْوَدُ', 'dark'], ['أَزْرَقُ', 'blue'], ['أَحْمَرُ', 'red']];

  function writePad(el, opts) {
    if (!el || el.__pad) return el && el.__pad;
    opts = opts || {};
    var models = opts.model == null ? [] : (Array.isArray(opts.model) ? opts.model : String(opts.model).split('|'));
    models = models.map(function (m) { return m.trim(); }).filter(Boolean);
    var nLines = Math.max(opts.lines || 1, models.length || 1);
    var LH = opts.lineHeight || 140;
    var strokes = [], cur = null, penTok = 0, erasing = false, showModel = true, penUntil = 0;

    el.classList.add('wp');
    el.innerHTML =
      '<div class="wp-tools" role="toolbar" aria-label="أَدَوَاتُ الْكِتَابَةِ — writing tools">' +
        '<div class="wp-group">' + PEN_TOKENS.map(function (t, i) {
          return '<button type="button" class="wp-pen" data-pen="' + i + '" aria-pressed="' + (i === 0) + '" style="--pen:var(' + t + ')" aria-label="' + PEN_NAMES[i][0] + ' — ' + PEN_NAMES[i][1] + ' pen"><i></i></button>';
        }).join('') +
        '<button type="button" class="wp-btn" data-act="eraser" aria-pressed="false" aria-label="مِمْحَاةٌ — eraser">' + I.eraser + '</button></div>' +
        '<div class="wp-group">' +
        '<button type="button" class="wp-btn" data-act="undo" aria-label="تَرَاجُعٌ — undo">' + I.undo + '</button>' +
        '<button type="button" class="wp-btn" data-act="clear" aria-label="امْسَحِ الْكُلَّ — clear">' + I.clear + '</button>' +
        (models.length ? '<button type="button" class="wp-btn" data-act="model" aria-pressed="true" aria-label="النَّمُوذَجُ — show / hide model">' + I.eye + '</button>' : '') +
        '<button type="button" class="wp-btn" data-act="save" aria-label="احْفَظْ صُورَةً — save as PNG">' + I.save + '</button></div>' +
        '<button type="button" class="btn btn--sm wp-done" data-act="done">' + I.done + ' انْتَهَيْتُ <span class="en">I finished</span></button>' +
      '</div>' +
      '<div class="wp-stage" style="height:' + (nLines * LH) + 'px">' +
        '<canvas class="wp-guide" aria-hidden="true"></canvas>' +
        '<canvas class="wp-ink" role="img" aria-label="لَوْحُ الْكِتَابَةِ — writing area: write with your finger, pen or mouse"></canvas>' +
        '<div class="wp-reward" aria-hidden="true"></div>' +
      '</div>' +
      '<p class="wp-msg" aria-live="polite"></p>';

    var stage = el.querySelector('.wp-stage');
    var guide = el.querySelector('.wp-guide'), ink = el.querySelector('.wp-ink');
    var g = guide.getContext('2d'), c = ink.getContext('2d');
    var msg = el.querySelector('.wp-msg'), reward = el.querySelector('.wp-reward');
    var W = 0, H = 0, dpr = 1;

    function tok(name, fb) { return getComputedStyle(el).getPropertyValue(name).trim() || fb; }
    function size() {
      var r = stage.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 3);
      [guide, ink].forEach(function (cv) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); });
      redraw();
    }
    function drawGuide(ctx, withModel) {
      ctx.save();
      ctx.clearRect(0, 0, W, H);
      var lineC = tok('--masc', '#4C7DE0'), inkC = tok('--ink2', '#555');
      for (var i = 0; i < nLines; i++) {
        var top = i * LH, base = top + LH * 0.72, mid = top + LH * 0.42;
        ctx.globalAlpha = .55; ctx.strokeStyle = lineC; ctx.lineWidth = 2; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(12, base); ctx.lineTo(W - 12, base); ctx.stroke();
        ctx.globalAlpha = .45; ctx.lineWidth = 1.5; ctx.setLineDash([3, 7]);
        ctx.beginPath(); ctx.moveTo(12, mid); ctx.lineTo(W - 12, mid); ctx.stroke();
        var m = models[i];
        if (m && withModel) {
          var fs = Math.round(LH * 0.5);
          ctx.font = '700 ' + fs + 'px "Noto Naskh Arabic", "Amiri", "Geeza Pro", serif';
          ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
          var x = W - 36;
          ctx.setLineDash([]); ctx.globalAlpha = .1; ctx.fillStyle = inkC; ctx.fillText(m, x, base);
          ctx.globalAlpha = .55; ctx.setLineDash([2, 5]); ctx.lineWidth = 1.6; ctx.strokeStyle = inkC; ctx.strokeText(m, x, base);
          // green start dot: Arabic starts on the right
          ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.fillStyle = tok('--good', '#2F9E44');
          ctx.beginPath(); ctx.arc(x + 12, base - fs * 0.38, 7, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    }
    function paintStroke(ctx, s) {
      ctx.save();
      ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.erase ? '#000' : tok(PEN_TOKENS[s.pen], '#222');
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var p = s.pts;
      if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0].x, p[0].y, p[0].w / 2, 0, Math.PI * 2); ctx.fill(); }
      for (var i = 1; i < p.length; i++) {
        ctx.lineWidth = (p[i - 1].w + p[i].w) / 2;
        ctx.beginPath(); ctx.moveTo(p[i - 1].x, p[i - 1].y); ctx.lineTo(p[i].x, p[i].y); ctx.stroke();
      }
      ctx.restore();
    }
    function redraw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawGuide(g, showModel);
      c.clearRect(0, 0, W, H);
      strokes.forEach(function (s) { paintStroke(c, s); });
    }
    function pt(e) {
      var r = ink.getBoundingClientRect();
      var base = erasing ? 26 : 5;
      var w = e.pointerType === 'pen' && e.pressure > 0 ? base * (0.45 + e.pressure * 1.3) : base;
      return { x: e.clientX - r.left, y: e.clientY - r.top, w: w };
    }
    ink.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'pen') penUntil = Date.now() + 1500;
      else if (e.pointerType === 'touch' && Date.now() < penUntil) return;   // palm while pen active
      if (e.button > 0) return;
      e.preventDefault();
      try { ink.setPointerCapture(e.pointerId); } catch (x) {}
      cur = { pen: penTok, erase: erasing, pts: [pt(e)], id: e.pointerId };
      strokes.push(cur);
      paintStroke(c, cur);
      reward.innerHTML = ''; msg.textContent = '';
    });
    ink.addEventListener('pointermove', function (e) {
      if (!cur || e.pointerId !== cur.id) return;
      if (e.pointerType === 'pen') penUntil = Date.now() + 1500;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      if (!evs.length) evs = [e];
      var start = cur.pts.length - 1;
      evs.forEach(function (ev) { cur.pts.push(pt(ev)); });
      paintStroke(c, { pen: cur.pen, erase: cur.erase, pts: cur.pts.slice(start) });
    });
    function end(e) { if (cur && e.pointerId === cur.id) cur = null; }
    ink.addEventListener('pointerup', end);
    ink.addEventListener('pointercancel', end);

    function toPNG() {
      var out = document.createElement('canvas');
      out.width = guide.width; out.height = guide.height;
      var o = out.getContext('2d');
      o.fillStyle = '#FFFFFF'; o.fillRect(0, 0, out.width, out.height);
      o.drawImage(guide, 0, 0); o.drawImage(ink, 0, 0);
      return out.toDataURL('image/png');
    }
    el.querySelector('.wp-tools').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var pens = el.querySelectorAll('.wp-pen'), er = el.querySelector('[data-act="eraser"]');
      if (b.hasAttribute('data-pen')) {
        penTok = +b.getAttribute('data-pen'); erasing = false;
        for (var i = 0; i < pens.length; i++) pens[i].setAttribute('aria-pressed', String(pens[i] === b));
        er.setAttribute('aria-pressed', 'false'); stage.classList.remove('is-erasing');
        sfx('pop'); return;
      }
      var act = b.getAttribute('data-act');
      if (act === 'eraser') { erasing = !erasing; b.setAttribute('aria-pressed', String(erasing)); stage.classList.toggle('is-erasing', erasing); }
      else if (act === 'undo') { strokes.pop(); redraw(); }
      else if (act === 'clear') { strokes = []; reward.innerHTML = ''; msg.textContent = ''; redraw(); }
      else if (act === 'model') { showModel = !showModel; b.setAttribute('aria-pressed', String(showModel)); redraw(); }
      else if (act === 'save') {
        var a = document.createElement('a'); a.href = toPNG(); a.download = 'nawras-writing.png';
        document.body.appendChild(a); a.click(); a.remove();
      } else if (act === 'done') {
        if (!strokes.length) { msg.innerHTML = 'جَرِّبْ أَنْ تَكْتُبَ أَوَّلًا <span class="en">Have a go first!</span>'; return; }
        reward.innerHTML = star(true) + star(true) + star(true);
        msg.innerHTML = 'عَمَلٌ رَائِعٌ! <span class="en">Great work!</span>';
        sfx('good'); confetti(40);
        var gl = document.querySelector('.gull'); if (gl) cheer(gl);
      }
    });

    if ('ResizeObserver' in window) new ResizeObserver(function () { size(); }).observe(stage);
    else window.addEventListener('resize', size);
    document.addEventListener('ks:theme', function () { redraw(); });
    if (document.fonts && document.fonts.load) {
      document.fonts.load('700 40px "Noto Naskh Arabic"').then(redraw, function () {});
    }
    size();
    el.__pad = { el: el, clear: function () { strokes = []; redraw(); }, undo: function () { strokes.pop(); redraw(); }, toPNG: toPNG, redraw: redraw };
    return el.__pad;
  }

  /* ── auto-wiring ────────────────────────────────────────────────────── */
  function wire() {
    var i, els;
    els = document.querySelectorAll('[data-gull]');
    for (i = 0; i < els.length; i++) {
      if (els[i].querySelector('.gull')) continue;
      els[i].innerHTML = gull(els[i].getAttribute('data-gull') || 'happy', { label: els[i].getAttribute('data-gull-label') || undefined, svg: !!els[i].closest('.logo, [data-art-svg]') });
    }
    els = document.querySelectorAll('[data-ta]');
    for (i = 0; i < els.length; i++) els[i].innerHTML = ta(els[i].textContent);
    // word-by-word reveal: split on spaces only (never inside an Arabic word)
    els = document.querySelectorAll('[data-words]');
    for (i = 0; i < els.length; i++) {
      var ws = els[i].textContent.trim().split(/\s+/);
      els[i].setAttribute('aria-label', els[i].textContent.trim());
      els[i].innerHTML = ws.map(function (w, k) { return '<span class="ks-w" aria-hidden="true" style="--wi:' + k + '">' + esc(w) + '</span>'; }).join(' ');
    }
    els = document.querySelectorAll('[data-say]');
    for (i = 0; i < els.length; i++) {
      if (!els[i].innerHTML.trim()) els[i].innerHTML = ICON_SPEAK;
      if (!els[i].getAttribute('aria-label')) els[i].setAttribute('aria-label', 'اِسْتَمِعْ — Listen');
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-say]');
      if (b) { speak(b.getAttribute('data-say'), b); return; }
      var g = e.target.closest && e.target.closest('.gull');
      if (g) { cheer(g); sfx('pop'); }
    });

    els = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      for (i = 0; i < els.length; i++) io.observe(els[i]);
    } else {
      for (i = 0; i < els.length; i++) els[i].classList.add('is-in');
    }
    els = document.querySelectorAll('[data-writepad]');
    for (i = 0; i < els.length; i++) {
      writePad(els[i], { model: els[i].getAttribute('data-model') || '', lines: +els[i].getAttribute('data-lines') || 1, lineHeight: +els[i].getAttribute('data-line-height') || undefined });
    }
    mountPicker();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();

  KS.THEMES = THEMES;
  KS.THEME_NAMES = NAMES;
  KS.setTheme = setTheme;
  KS.theme = current;
  KS.gull = gull;
  KS.cheer = cheer;
  KS.speak = speak;
  KS.sfx = sfx;
  KS.mute = mute;
  KS.confetti = confetti;
  KS.ta = ta;
  KS.star = star;
  KS.writePad = writePad;
  window.KS = KS;
})();


/* ============================================================================
   LESSONS — shared lesson components (added for lessons/: article, story,
   presentation). Extends window.KS; classic script, no modules.
     KS.pic(name, {label, cls, decorative, svg})  → markup of a picture-book drawing:
         the generated picture (<img>, assets/art/pic/<name>.webp) in illustrated
         mode, the inline SVG in simple mode or with {svg:true} (see KS.art)
         people: boy girl teacher-m teacher-f student-m student-f mother
         animals: cat cat-f   objects: book door house moon sun star fish tree
         rose apple boat sea shell palm pen
         Children are drawn modest and friendly (long sleeves, long dress, hijab).
     KS.PIC_NAMES                 list of names above
     KS.quiz(el, questions, opts) knowledge check (Wireless101 .qz pattern):
         options shuffled on every render, answer locks, explanation always
         shown, gentle feedback (never "wrong!"), a star per right answer.
         question = { q:'html', say:'text for speech', en:'English', pic:'cat-f',
                      options:[{ h:'هَذِهِ', ok:true }, { h:'هَذَا' }],
                      why:'Arabic explanation html', whyEn:'English' }
         opts = { onDone(right, total), gull:true }
         Returns { restart() }.
     KS.arNum(n)                  → Arabic-Indic digits
   Auto-wiring: [data-pic="name"] is filled with KS.pic(name).
   ========================================================================= */
(function () {
  'use strict';
  var KS = window.KS;
  if (!KS) return;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); }

  /* ── picture library ──────────────────────────────────────────────── */
  var LABELS = {
    'boy': 'وَلَدٌ — a boy', 'girl': 'بِنْتٌ — a girl',
    'teacher-m': 'مُعَلِّمٌ — a teacher (man)', 'teacher-f': 'مُعَلِّمَةٌ — a teacher (woman)',
    'student-m': 'طَالِبٌ — a student (boy)', 'student-f': 'طَالِبَةٌ — a student (girl)',
    'mother': 'أُمٌّ — a mother', 'cat': 'قِطٌّ — a cat (male)', 'cat-f': 'قِطَّةٌ — a cat (female)',
    'book': 'كِتَابٌ — a book', 'door': 'بَابٌ — a door', 'house': 'بَيْتٌ — a house',
    'moon': 'قَمَرٌ — a moon', 'sun': 'شَمْسٌ — the sun', 'star': 'نَجْمَةٌ — a star',
    'fish': 'سَمَكَةٌ — a fish', 'tree': 'شَجَرَةٌ — a tree', 'rose': 'وَرْدَةٌ — a rose',
    'apple': 'تُفَّاحَةٌ — an apple', 'boat': 'قَارِبٌ — a boat', 'sea': 'بَحْرٌ — the sea',
    'shell': 'صَدَفَةٌ — a seashell', 'palm': 'نَخْلَةٌ — a palm tree', 'pen': 'قَلَمٌ — a pencil'
  };
  var CLOTH = { 'f-masc': 'var(--masc)', 'f-fem': 'var(--fem)', 'f-brand': 'var(--brand)', 'f-leaf': '#4CAF6A', 'f-blue': '#4C7DE0', 'f-coral': '#FF8A6B' };

  function face(fy, o) {
    var s = '<circle class="f-ink" cx="54" cy="' + fy + '" r="2.7"/><circle class="f-ink" cx="66" cy="' + fy + '" r="2.7"/>' +
      '<circle class="f-white" cx="55" cy="' + (fy - 1) + '" r=".9"/><circle class="f-white" cx="67" cy="' + (fy - 1) + '" r=".9"/>' +
      '<ellipse class="f-cheek" cx="49" cy="' + (fy + 6) + '" rx="3.6" ry="2.2"/><ellipse class="f-cheek" cx="71" cy="' + (fy + 6) + '" rx="3.6" ry="2.2"/>' +
      '<path class="kt" d="M54.5 ' + (fy + 7) + 'Q60 ' + (fy + 12) + ' 65.5 ' + (fy + 7) + '"/>';
    if (o.glasses) s += '<circle class="kt" cx="54" cy="' + fy + '" r="5.6" style="stroke-width:1.6"/><circle class="kt" cx="66" cy="' + fy + '" r="5.6" style="stroke-width:1.6"/><path class="kt" d="M59.6 ' + fy + 'h.8" style="stroke-width:1.6"/>';
    return s;
  }
  function arm(x0, y0, x1, y1, col, sk) {
    var cx = (x0 + x1) / 2 + (x1 < 60 ? -3 : 3);
    var d = 'M' + x0 + ' ' + y0 + 'Q' + cx + ' ' + ((y0 + y1) / 2) + ' ' + x1 + ' ' + y1;
    return '<path d="' + d + '" fill="none" stroke-linecap="round" style="stroke:var(--gull-line);stroke-width:13.5"/>' +
      '<path d="' + d + '" fill="none" stroke-linecap="round" style="stroke:' + col + ';stroke-width:9"/>' +
      '<circle class="' + sk + ' k" cx="' + x1 + '" cy="' + (y1 + 3) + '" r="5" style="stroke-width:2"/>';
  }
  function person(o) {
    var f = o.g === 'f', ad = !!o.adult;
    var hy = ad ? 36 : 46, hr = ad ? 18 : 21, sh = ad ? 60 : 72, hip = ad ? 110 : 116, ft = 152;
    var sk = 'f-skin' + (o.skin || 1), cl = o.cloth || (f ? 'f-fem' : 'f-masc'), col = CLOTH[cl] || 'var(--masc)';
    var s = '<ellipse class="f-ink" cx="60" cy="155" rx="30" ry="3.5" opacity=".12"/>';
    if (o.bag) s += '<rect class="f-accent k" x="70" y="' + (sh + 3) + '" width="24" height="40" rx="8"/>';
    s += '<ellipse class="f-ink" cx="50" cy="' + (ft - 3) + '" rx="9.5" ry="4.8"/><ellipse class="f-ink" cx="70" cy="' + (ft - 3) + '" rx="9.5" ry="4.8"/>';
    if (f) {
      s += '<path class="' + cl + ' k" d="M45 ' + (sh + 4) + 'Q45 ' + sh + ' 54 ' + sh + 'H66Q75 ' + sh + ' 75 ' + (sh + 4) + 'L86 ' + (ft - 6) + 'Q60 ' + (ft - 2) + ' 34 ' + (ft - 6) + 'Z"/>';
    } else {
      s += '<path class="f-trouser k" d="M45 ' + (hip - 6) + 'L44 ' + (ft - 5) + 'H58.5L60 ' + (hip + 6) + 'L61.5 ' + (ft - 5) + 'H76L75 ' + (hip - 6) + 'Z"/>';
      s += '<path class="' + cl + ' k" d="M43 ' + (sh + 5) + 'Q43 ' + sh + ' 53 ' + sh + 'H67Q77 ' + sh + ' 77 ' + (sh + 5) + 'L80 ' + hip + 'H40Z"/>';
      s += '<path class="kt" d="M60 ' + (sh + 2) + 'V' + (sh + 14) + '" style="opacity:.5"/>';
    }
    if (o.bag) s += '<path class="kt" d="M50 ' + (sh + 1) + 'V' + (sh + 26) + 'M70 ' + (sh + 1) + 'V' + (sh + 26) + '" style="stroke-width:3;opacity:.75"/>';
    s += arm(46, sh + 6, 36, hip - 14, col, sk);
    if (o.book) {
      s += '<rect class="f-blue k" x="74" y="' + (hip - 34) + '" width="22" height="26" rx="3"/><path class="kt" d="M78 ' + (hip - 34) + 'V' + (hip - 8) + '" style="stroke:#fff;opacity:.8"/>';
    }
    s += arm(74, sh + 6, 84, hip - 14, col, sk);
    s += '<rect class="' + sk + '" x="55" y="' + (hy + hr - 6) + '" width="10" height="' + (sh - hy - hr + 8) + '"/>';
    if (f) {
      var hc = o.hijab || 'f-hijab';
      s += '<path class="' + hc + ' k" d="M' + (60 - hr - 6) + ' ' + (hy + 4) + 'C' + (60 - hr - 6) + ' ' + (hy - hr - 10) + ' ' + (60 + hr + 6) + ' ' + (hy - hr - 10) + ' ' + (60 + hr + 6) + ' ' + (hy + 4) +
        'C' + (60 + hr + 6) + ' ' + (hy + hr) + ' ' + (60 + hr + 12) + ' ' + (sh + 6) + ' ' + (60 + hr + 9) + ' ' + (sh + 14) +
        'Q60 ' + (sh + 24) + ' ' + (60 - hr - 9) + ' ' + (sh + 14) +
        'C' + (60 - hr - 12) + ' ' + (sh + 6) + ' ' + (60 - hr - 6) + ' ' + (hy + hr) + ' ' + (60 - hr - 6) + ' ' + (hy + 4) + 'Z"/>';
      s += '<ellipse class="' + sk + ' k" cx="60" cy="' + (hy + 3) + '" rx="' + (hr - 4) + '" ry="' + (hr - 2) + '"/>';
      s += face(hy + 2, o);
    } else {
      s += '<circle class="' + sk + ' k" cx="' + (60 - hr) + '" cy="' + (hy + 3) + '" r="5"/><circle class="' + sk + ' k" cx="' + (60 + hr) + '" cy="' + (hy + 3) + '" r="5"/>';
      s += '<circle class="' + sk + ' k" cx="60" cy="' + hy + '" r="' + hr + '"/>';
      s += '<path class="f-hair" d="M' + (60 - hr - .5) + ' ' + (hy - 1) + 'C' + (60 - hr) + ' ' + (hy - hr - 7) + ' ' + (60 + hr) + ' ' + (hy - hr - 7) + ' ' + (60 + hr + .5) + ' ' + (hy - 1) +
        'C' + (60 + hr - 3) + ' ' + (hy - hr + 5) + ' ' + (60 + 6) + ' ' + (hy - hr + 3) + ' 60 ' + (hy - hr + 8) +
        'C' + (60 - 7) + ' ' + (hy - hr + 3) + ' ' + (60 - hr + 3) + ' ' + (hy - hr + 6) + ' ' + (60 - hr - .5) + ' ' + (hy - 1) + 'Z"/>';
      s += face(hy + 1, o);
    }
    return { vb: '0 0 120 160', body: s };
  }

  function catPic(bow) {
    var s =
      '<ellipse class="f-ink" cx="60" cy="112" rx="34" ry="3.5" opacity=".12"/>' +
      '<path class="f-cat k" d="M84 104C108 102 112 74 100 63C96 60 91 63 94 67C102 77 99 92 82 94Z"/>' +
      '<path class="f-cat k" d="M38 42L35 14L58 31Z"/><path class="f-cat k" d="M82 42L85 14L62 31Z"/>' +
      '<path class="f-pink" d="M41 35L39.5 22L51 31Z"/><path class="f-pink" d="M79 35L80.5 22L69 31Z"/>' +
      '<path class="f-cat k" d="M36 108C30 82 40 66 60 66C80 66 90 82 84 108Z"/>' +
      '<ellipse class="f-cat2" cx="60" cy="92" rx="13" ry="13"/>' +
      '<ellipse class="f-cat2 k" cx="49" cy="108" rx="8.5" ry="5"/><ellipse class="f-cat2 k" cx="71" cy="108" rx="8.5" ry="5"/>' +
      '<ellipse class="f-cat k" cx="60" cy="49" rx="26" ry="22"/>' +
      '<path class="kt" d="M54 29v6M60 28v7M66 29v6" style="opacity:.6"/>' +
      '<ellipse class="f-ink" cx="50" cy="48" rx="3.3" ry="4.2"/><ellipse class="f-ink" cx="70" cy="48" rx="3.3" ry="4.2"/>' +
      '<circle class="f-white" cx="51" cy="46.5" r="1.2"/><circle class="f-white" cx="71" cy="46.5" r="1.2"/>' +
      '<path class="f-pink k" d="M56.5 55.5h7l-3.5 4z" style="stroke-width:1.4"/>' +
      '<path class="kt" d="M60 59.5q-3 4-6.5 1M60 59.5q3 4 6.5 1" style="stroke-width:1.6"/>' +
      '<path class="kt" d="M43 56H29M43 60l-13 3.5M77 56h14M77 60l13 3.5" style="stroke-width:1.3;opacity:.8"/>';
    if (bow) s +=
      '<path class="kt" d="M46.5 43l-2.5-3M50 42.5V39M53.5 43l2.5-3M66.5 43l-2.5-3M70 42.5V39M73.5 43l2.5-3" style="stroke-width:1.4"/>' +
      '<path class="f-fem k" d="M76 30L64 22L65.5 38Z"/><path class="f-fem k" d="M76 30L88 22L86.5 38Z"/><circle class="f-fem k" cx="76" cy="30" r="4"/>';
    return { vb: '0 0 120 120', body: s };
  }

  function rays(cx, cy, r0, r1, n) {
    var d = '';
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2;
      d += 'M' + (cx + Math.cos(a) * r0).toFixed(1) + ' ' + (cy + Math.sin(a) * r0).toFixed(1) + 'L' + (cx + Math.cos(a) * r1).toFixed(1) + ' ' + (cy + Math.sin(a) * r1).toFixed(1);
    }
    return d;
  }
  function starPts(cx, cy, R, r) {
    var p = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
      p.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1));
    }
    return p.join(' ');
  }
  var smile = function (cx, cy) {
    return '<circle class="f-ink" cx="' + (cx - 7) + '" cy="' + cy + '" r="2.6"/><circle class="f-ink" cx="' + (cx + 7) + '" cy="' + cy + '" r="2.6"/>' +
      '<path class="kt" d="M' + (cx - 6) + ' ' + (cy + 8) + 'q6 5 12 0"/>';
  };

  var OBJ = {
    book: '<path class="f-blue k" d="M60 40C48 32 28 32 10 36V100C28 96 48 96 60 102C72 96 92 96 110 100V36C92 32 72 32 60 40Z"/>' +
      '<path class="f-cream k" d="M60 36C48 27 30 27 16 31V93C30 89 48 89 60 97ZM60 36C72 27 90 27 104 31V93C90 89 72 89 60 97Z"/>' +
      '<path class="kt" d="M24 44q14-3 28 2M24 56q14-3 28 2M24 68q14-3 28 2M68 46q14-5 28-2M68 58q14-5 28-2M68 70q14-5 28-2" style="opacity:.35"/>',
    door: '<rect class="f-sand k" x="20" y="10" width="80" height="100" rx="6"/>' +
      '<path class="f-wood k" d="M32 108V50A28 28 0 0 1 88 50V108Z"/>' +
      '<path class="kt" d="M60 22V108M40 62h12v34H40zM68 62h12v34H68z" style="opacity:.55"/>' +
      '<circle class="f-gold k" cx="54" cy="80" r="3.2"/><circle class="f-gold k" cx="66" cy="80" r="3.2"/>' +
      '<rect class="f-grey k" x="22" y="106" width="76" height="8" rx="3"/>',
    house: '<path class="f-cream k" d="M24 56H96V108H24Z"/><path class="f-red k" d="M14 60L60 20L106 60Z"/>' +
      '<path class="f-wood k" d="M50 108V88A10 10 0 0 1 70 88V108Z"/>' +
      '<rect class="f-sky k" x="31" y="68" width="14" height="14" rx="2"/><rect class="f-sky k" x="75" y="68" width="14" height="14" rx="2"/>' +
      '<path class="kt" d="M38 68v14M31 75h14M82 68v14M75 75h14" style="stroke-width:1.4"/>',
    moon: '<path class="f-sun k" d="M70 12A48 48 0 1 0 106 86A38 38 0 1 1 70 12Z"/>' +
      '<path class="kt" d="M38 54q4 4 8 0M44 72q6 5 12 0"/><ellipse class="f-cheek" cx="36" cy="64" rx="4" ry="2.5"/>' +
      '<path class="f-sun2 k" d="M96 30l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" style="stroke-width:1.5"/>',
    sun: '<path class="kt" d="' + rays(60, 60, 36, 52, 12) + '" style="stroke:#F0A020;stroke-width:6"/>' +
      '<circle class="f-sun k" cx="60" cy="60" r="30"/>' + smile(60, 56) +
      '<ellipse class="f-cheek" cx="45" cy="64" rx="4" ry="2.5"/><ellipse class="f-cheek" cx="75" cy="64" rx="4" ry="2.5"/>',
    star: '<polygon class="f-sun k" points="' + starPts(60, 62, 50, 22) + '"/>' + smile(60, 62),
    fish: '<path class="f-coral k" d="M84 60L108 40L103 60L108 80Z"/>' +
      '<path class="f-coral k" d="M12 60C28 30 72 30 88 60C72 90 28 90 12 60Z"/>' +
      '<path class="f-sun k" d="M44 40Q56 26 68 40Z"/><path class="f-sun k" d="M50 80Q58 90 66 80Z"/>' +
      '<path class="kt" d="M62 40Q68 60 62 80M74 44Q79 60 74 76" style="opacity:.5"/>' +
      '<circle class="f-white k" cx="31" cy="55" r="6.5" style="stroke-width:1.8"/><circle class="f-ink" cx="30" cy="55" r="3.2"/>' +
      '<path class="kt" d="M17 65q5 3 10 0"/>' +
      '<circle class="kt" cx="10" cy="40" r="3" style="stroke:#2C9BB0"/><circle class="kt" cx="4" cy="28" r="2" style="stroke:#2C9BB0"/>',
    tree: '<path class="f-wood k" d="M53 112L55 66H65L67 112Z"/>' +
      '<circle class="f-leaf k" cx="40" cy="62" r="22"/><circle class="f-leaf k" cx="80" cy="62" r="22"/><circle class="f-leaf k" cx="60" cy="40" r="28"/>' +
      '<circle class="f-leaf" cx="40" cy="62" r="20.6"/><circle class="f-leaf" cx="80" cy="62" r="20.6"/><circle class="f-leaf" cx="60" cy="40" r="26.6"/>' +
      '<path class="kt" d="M52 30q6-6 14-2M36 58q4-5 10-3M76 56q5-4 10-1" style="stroke:#2F8F4E;stroke-width:2.5"/>' +
      '<ellipse class="f-ink" cx="60" cy="113" rx="30" ry="3" opacity=".12"/>',
    rose: '<path d="M60 112V60" fill="none" style="stroke:#2F8F4E;stroke-width:5;stroke-linecap:round"/>' +
      '<path class="f-leaf k" d="M60 92C44 90 38 78 40 72C52 72 60 80 60 92Z"/><path class="f-leaf k" d="M60 84C76 82 82 70 80 64C68 64 60 72 60 84Z"/>' +
      '<path class="f-red k" d="M36 38C36 20 48 14 60 21C72 14 84 20 84 38C84 54 74 64 60 64C46 64 36 54 36 38Z"/>' +
      '<path class="kt" d="M60 28C51 28 49 41 58 43C66 45 68 35 62 33M46 34q2 16 14 20q12-4 14-20" style="opacity:.7"/>',
    apple: '<path d="M60 36Q60 24 67 15" fill="none" style="stroke:#8E5B33;stroke-width:4.5;stroke-linecap:round"/>' +
      '<path class="f-leaf k" d="M63 26C70 14 84 15 87 19C81 28 71 30 63 26Z"/>' +
      '<path class="f-red k" d="M60 37C46 26 20 32 20 60C20 88 42 108 60 99C78 108 100 88 100 60C100 32 74 26 60 37Z"/>' +
      '<ellipse class="f-white" cx="38" cy="54" rx="6" ry="10" opacity=".55" transform="rotate(20 38 54)"/>',
    boat: '<path d="M60 76V16" fill="none" style="stroke:#8E5B33;stroke-width:3.5;stroke-linecap:round"/>' +
      '<path class="f-white k" d="M63 18L98 70H63Z"/><path class="f-accent k" d="M57 28L28 70H57Z"/>' +
      '<path class="f-wood k" d="M14 76H106L92 100H28Z"/><path class="kt" d="M24 86H96" style="opacity:.5"/>' +
      '<path class="kt" d="M6 108q9-6 18 0t18 0t18 0t18 0t18 0t18 0" style="stroke:#2C9BB0;stroke-width:3"/>',
    sea: '<circle class="f-sun k" cx="88" cy="28" r="13"/>' +
      '<path class="f-sea2 k" d="M6 62q14-12 27 0t27 0t27 0t27 0V110H6Z"/>' +
      '<path class="f-sea k" d="M6 82q14-12 27 0t27 0t27 0t27 0V110H6Z"/>' +
      '<path class="kt" d="M18 96q8-5 16 0M62 100q8-5 16 0" style="stroke:#fff;opacity:.7"/>',
    shell: '<path class="f-shell2 k" d="M48 100h24l-4 10h-16z"/>' +
      '<path class="f-shell k" d="M60 104L20 56Q24 36 36 42Q42 24 54 33Q60 20 66 33Q78 24 84 42Q96 36 100 56Z"/>' +
      '<path class="kt" d="M60 104L36 44M60 104L48 36M60 104V30M60 104L72 36M60 104L84 44M60 104L28 52M60 104L92 52" style="opacity:.45;stroke-width:1.6"/>',
    palm: '<path d="M54 114C56 92 60 70 66 48" fill="none" style="stroke:var(--gull-line);stroke-width:13;stroke-linecap:round"/>' +
      '<path d="M54 114C56 92 60 70 66 48" fill="none" style="stroke:#B9824F;stroke-width:8.5;stroke-linecap:round"/>' +
      '<path class="kt" d="M55 100h7M57 86h7M60 72h7M63 58h6" style="opacity:.5"/>' +
      '<path class="f-leaf k" d="M66 46C52 30 30 30 14 44C34 38 50 40 66 46Z"/>' +
      '<path class="f-leaf k" d="M66 46C62 26 46 12 28 12C44 22 56 32 66 46Z"/>' +
      '<path class="f-leaf k" d="M66 46C72 26 88 14 104 14C90 24 78 34 66 46Z"/>' +
      '<path class="f-leaf k" d="M66 46C82 34 100 36 112 48C96 44 82 44 66 46Z"/>' +
      '<path class="f-leaf2 k" d="M66 46C58 52 50 66 50 78C56 64 62 56 66 46Z"/>' +
      '<circle class="f-wood2 k" cx="62" cy="52" r="5"/><circle class="f-wood2 k" cx="71" cy="53" r="5"/>',
    pen: '<g transform="rotate(-35 60 60)"><rect class="f-pink k" x="12" y="50" width="14" height="20" rx="4"/>' +
      '<rect class="f-grey k" x="24" y="50" width="8" height="20"/><rect class="f-sun k" x="32" y="50" width="54" height="20"/>' +
      '<path class="kt" d="M32 60H86" style="opacity:.35"/>' +
      '<path class="f-cream k" d="M86 50L106 60L86 70Z"/><path class="f-ink" d="M99 56.5L106 60L99 63.5Z"/></g>'
  };

  function pic(name, opts) {
    opts = opts || {};
    var p;
    switch (name) {
      case 'boy': p = person({ g: 'm', skin: 2 }); break;
      case 'girl': p = person({ g: 'f', skin: 1 }); break;
      case 'teacher-m': p = person({ g: 'm', adult: true, skin: 3, cloth: 'f-brand', glasses: true, book: true }); break;
      case 'teacher-f': p = person({ g: 'f', adult: true, skin: 3, cloth: 'f-fem', hijab: 'f-hijab2', glasses: true, book: true }); break;
      case 'student-m': p = person({ g: 'm', skin: 1, bag: true }); break;
      case 'student-f': p = person({ g: 'f', skin: 2, bag: true }); break;
      case 'mother': p = person({ g: 'f', adult: true, skin: 2, cloth: 'f-leaf', hijab: 'f-hijab2' }); break;
      case 'cat': p = catPic(false); break;
      case 'cat-f': p = catPic(true); break;
      default:
        if (!OBJ[name]) return '';
        p = { vb: '0 0 120 120', body: OBJ[name] };
    }
    var label = esc(opts.label || LABELS[name] || name);
    var cls = opts.cls ? esc(opts.cls) : '';
    var keep = ' data-pic-name="' + name + '"' + (cls ? ' data-cls="' + cls + '"' : '') + (opts.svg ? ' data-svg' : '');
    if (!opts.svg && KS.art && KS.art() === 'ill') {
      return '<img class="pic pic--img pic--' + name + (cls ? ' ' + cls : '') + '" src="' + KS.artBase + 'pic/' + name + '.webp"' +
        (opts.decorative ? ' alt="" aria-hidden="true"' : ' alt="' + label + '"') + keep +
        ' decoding="async" draggable="false" style="object-fit:contain" onerror="KS.artFallback(this)">';
    }
    return '<svg class="pic pic--' + name + (cls ? ' ' + cls : '') + '" viewBox="' + p.vb + '" ' +
      (opts.decorative ? 'aria-hidden="true"' : 'role="img" aria-label="' + label + '"') + keep + '>' + p.body + '</svg>';
  }

  /* ── knowledge check ──────────────────────────────────────────────── */
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var RIGHT = [['أَحْسَنْتَ!', 'Well done!'], ['رَائِعٌ!', 'Great!'], ['مُمْتَازٌ!', 'Excellent!']];

  function quiz(el, qs, opts) {
    if (!el || !qs || !qs.length) return null;
    opts = opts || {};
    var n = qs.length, i = 0, results = [], locked = false;
    el.classList.add('qz');
    el.innerHTML =
      '<div class="qz-head">' +
        '<p class="qz-count"></p>' +
        '<div class="progress qz-track" aria-hidden="true"><i></i></div>' +
        '<span class="stars qz-stars" role="img"></span>' +
      '</div>' +
      '<div class="qz-body">' +
        '<div class="qz-q"><div class="qz-pic" aria-hidden="true"></div>' +
          '<div class="qz-qtext"><p class="qz-question word" tabindex="-1"></p><p class="en qz-question-en"></p></div>' +
          '<button type="button" class="say qz-say" aria-label="اِسْتَمِعْ — Listen">' + (KS.ICON_SPEAK || '') + '</button></div>' +
        '<div class="qz-options" role="group" aria-label="اخْتَرِ الْجَوَابَ — choose an answer"></div>' +
        '<div class="qz-feedback" role="status" aria-live="polite"><p class="qz-verdict"></p><p class="qz-why"></p><p class="en qz-why-en"></p></div>' +
      '</div>' +
      '<div class="qz-results" tabindex="-1" hidden>' +
        (opts.gull === false ? '' : '<div class="qz-gull"></div>') +
        '<p class="qz-final word"></p><p class="stars qz-final-stars" aria-hidden="true"></p><p class="en qz-final-en"></p>' +
      '</div>' +
      '<div class="qz-actions">' +
        '<button type="button" class="btn btn--ghost qz-restart" hidden>مِنْ جَدِيدٍ <span class="en">Play again</span></button>' +
        '<button type="button" class="btn qz-next" hidden></button>' +
      '</div>';
    var $ = function (s) { return el.querySelector(s); };
    var head = $('.qz-head'), body = $('.qz-body'), res = $('.qz-results');
    var opWrap = $('.qz-options'), next = $('.qz-next'), again = $('.qz-restart');

    function paintStars() {
      var h = '';
      for (var k = 0; k < n; k++) h += KS.star(results[k] === true);
      var st = $('.qz-stars');
      st.innerHTML = h;
      var got = results.filter(function (r) { return r === true; }).length;
      st.setAttribute('aria-label', arNum(got) + ' / ' + arNum(n) + ' — ' + got + ' of ' + n + ' stars');
    }
    function render() {
      var q = qs[i];
      locked = false;
      $('.qz-count').innerHTML = 'سُؤَالٌ ' + arNum(i + 1) + ' مِنْ ' + arNum(n) + ' <span class="en">Question ' + (i + 1) + ' of ' + n + '</span>';
      $('.qz-track > i').style.width = (i / n * 100) + '%';
      $('.qz-pic').innerHTML = q.pic ? pic(q.pic, { decorative: true }) : '';
      $('.qz-question').innerHTML = q.q;
      $('.qz-question-en').textContent = q.en || '';
      var sb = $('.qz-say');
      if (q.say) { sb.hidden = false; sb.setAttribute('data-say', q.say); } else { sb.hidden = true; sb.removeAttribute('data-say'); }
      opWrap.innerHTML = shuffle(q.options).map(function (o) {
        return '<button type="button" class="qz-opt"' + (o.ok ? ' data-ok="1"' : '') + '>' + o.h + '</button>';
      }).join('');
      $('.qz-verdict').textContent = ''; $('.qz-verdict').className = 'qz-verdict';
      $('.qz-why').innerHTML = ''; $('.qz-why-en').textContent = '';
      next.hidden = true;
      paintStars();
    }
    function answer(b) {
      if (locked) return;
      locked = true;
      var q = qs[i], ok = b.hasAttribute('data-ok');
      results[i] = ok;
      var all = opWrap.querySelectorAll('.qz-opt');
      for (var k = 0; k < all.length; k++) {
        all[k].disabled = true;
        if (all[k].hasAttribute('data-ok')) all[k].classList.add('is-good');
      }
      var v = $('.qz-verdict');
      if (ok) {
        var r = RIGHT[Math.floor(Math.random() * RIGHT.length)];
        v.innerHTML = r[0] + ' <span class="en">' + r[1] + '</span>';
        v.className = 'qz-verdict good';
        KS.sfx('good');
        var g = el.closest('section, .s, body').querySelector('.gull');
        if (g) KS.cheer(g);
      } else {
        b.classList.add('is-bad');
        v.innerHTML = 'لَا بَأْسَ، نَتَعَلَّمُ مَعًا! <span class="en">Nice try — let’s learn it together.</span>';
        v.className = 'qz-verdict soft';
        KS.sfx('bad');
      }
      $('.qz-why').innerHTML = q.why || '';
      $('.qz-why-en').textContent = q.whyEn || '';
      next.innerHTML = i < n - 1 ? 'السُّؤَالُ التَّالِي <span class="en">Next question</span>' : 'النَّتِيجَةُ <span class="en">See my stars</span>';
      next.hidden = false;
      paintStars();
      try { next.focus({ preventScroll: true }); } catch (e) { next.focus(); }
    }
    function finish() {
      var got = results.filter(function (r) { return r === true; }).length;
      head.hidden = true; body.hidden = true; next.hidden = true;
      res.hidden = false; again.hidden = false;
      var gw = $('.qz-gull'); if (gw) gw.innerHTML = KS.gull(got === n ? 'cheer' : 'happy');
      var h = ''; for (var k = 0; k < n; k++) h += KS.star(k < got);
      $('.qz-final-stars').innerHTML = h;
      $('.qz-final').innerHTML = got === n ? 'مُمْتَازٌ! كُلُّ الْأَجْوِبَةِ صَحِيحَةٌ' : (got * 2 >= n ? 'أَحْسَنْتَ! أَنْتَ تَتَعَلَّمُ بِسُرْعَةٍ' : 'أَحْسَنْتَ الْمُحَاوَلَةَ! لِنَتَدَرَّبْ مَعًا');
      $('.qz-final-en').textContent = 'You got ' + got + ' of ' + n + ' — ' + (got === n ? 'every answer right!' : got * 2 >= n ? 'great learning!' : 'good try — let’s practise together.');
      KS.sfx('good');
      if (got * 2 >= n) KS.confetti(got === n ? 80 : 40);
      try { res.focus({ preventScroll: true }); } catch (e) {}
      if (typeof opts.onDone === 'function') opts.onDone(got, n);
    }
    function restart() {
      i = 0; results = [];
      head.hidden = false; body.hidden = false; res.hidden = true; again.hidden = true;
      render();
    }
    opWrap.addEventListener('click', function (e) { var b = e.target.closest('.qz-opt'); if (b) answer(b); });
    next.addEventListener('click', function () {
      i++;
      if (i < n) { render(); try { $('.qz-question').focus({ preventScroll: true }); } catch (e) {} }
      else finish();
    });
    again.addEventListener('click', function () { restart(); KS.sfx('pop'); });
    render();
    return { restart: restart };
  }

  function wirePics() {
    var els = document.querySelectorAll('[data-pic]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].querySelector('.pic')) continue;
      els[i].innerHTML = pic(els[i].getAttribute('data-pic'), { label: els[i].getAttribute('data-pic-label') || undefined, decorative: els[i].hasAttribute('data-pic-decorative') });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wirePics);
  else wirePics();

  KS.pic = pic;
  KS.PIC_NAMES = Object.keys(LABELS);
  KS.quiz = quiz;
  KS.arNum = arNum;
})();
/* ═══ end LESSONS block ═══════════════════════════════════════════════════ */
