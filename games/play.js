/* ============================================================================
   play.js — the picture games for «نَوْرَس» Nawras (classic script, no modules)
   ----------------------------------------------------------------------------
   One file, four pages, picked by <main data-game="…">:
     sort    سَلَّةُ هَذَا · سَلَّةُ هَذِهِ   two baskets, the fence words بِنْتٌ / أُمٌّ / شَمْسٌ mixed in (S-046)
     listen  اِسْمَعْ وَاخْتَرْ             Noori says a word, the child taps هَذَا or هَذِهِ (S-047)
     build   أَبْنِي جُمْلَةً               هَذَا|هَذِهِ + noun (+ صَغِيرٌ|صَغِيرَةٌ) under a picture (S-045)
     start   the pre-reader start screen (kids.html): tap once to hear, again to open (S-050)
   Kid rules: audio first (KS.speak: word clip → device voice → word bubble), no timer, nothing
   lost — a wrong tap shakes gently, Noori gives a hint, after two tries the answer glows. Praise is
   plural (أَحْسَنْتُمْ) so it fits every child. Pictures from KS.pic only; sounds are KS.sfx tones.
   ========================================================================= */
(function () {
  'use strict';
  var main = document.querySelector('[data-game]');
  if (!main || !window.KS) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function shake(el) { el.classList.remove('anim-shake'); void el.offsetWidth; el.classList.add('anim-shake'); }
  // speech only after the child has touched the page (browsers block sound before that)
  var unlocked = false;
  ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, function () { unlocked = true; }, { once: true, capture: true }); });
  function say(text, btn) { if (unlocked) KS.speak(text, btn); }

  /* ── the word bank: picture → [word, m|f, fence (feminine with no ة), English] ── */
  var W = {
    'boy': ['وَلَدٌ', 'm', 0, 'a boy'], 'cat': ['قِطٌّ', 'm', 0, 'a cat (he)'], 'book': ['كِتَابٌ', 'm', 0, 'a book'],
    'door': ['بَابٌ', 'm', 0, 'a door'], 'house': ['بَيْتٌ', 'm', 0, 'a house'], 'moon': ['قَمَرٌ', 'm', 0, 'the moon'],
    'boat': ['قَارِبٌ', 'm', 0, 'a boat'], 'sea': ['بَحْرٌ', 'm', 0, 'the sea'], 'pen': ['قَلَمٌ', 'm', 0, 'a pencil'],
    'teacher-m': ['مُعَلِّمٌ', 'm', 0, 'a teacher (man)'], 'student-m': ['طَالِبٌ', 'm', 0, 'a student (boy)'],
    'girl': ['بِنْتٌ', 'f', 1, 'a girl'], 'mother': ['أُمٌّ', 'f', 1, 'a mother'], 'sun': ['شَمْسٌ', 'f', 1, 'the sun'],
    'cat-f': ['قِطَّةٌ', 'f', 0, 'a cat (she)'], 'fish': ['سَمَكَةٌ', 'f', 0, 'a fish'], 'tree': ['شَجَرَةٌ', 'f', 0, 'a tree'],
    'rose': ['وَرْدَةٌ', 'f', 0, 'a rose'], 'apple': ['تُفَّاحَةٌ', 'f', 0, 'an apple'], 'shell': ['صَدَفَةٌ', 'f', 0, 'a seashell'],
    'palm': ['نَخْلَةٌ', 'f', 0, 'a palm tree'], 'star': ['نَجْمَةٌ', 'f', 0, 'a star'],
    'teacher-f': ['مُعَلِّمَةٌ', 'f', 0, 'a teacher (woman)'], 'student-f': ['طَالِبَةٌ', 'f', 0, 'a student (girl)']
  };
  var DEM = { m: 'هَذَا', f: 'هَذِهِ' }, DEM_EN = { m: 'this (masculine)', f: 'this (feminine)' };
  var keys = Object.keys(W);
  var MASC = keys.filter(function (k) { return W[k][1] === 'm'; });
  var TA = keys.filter(function (k) { return W[k][1] === 'f' && !W[k][2]; });
  var FENCE = keys.filter(function (k) { return W[k][2]; });
  function word(k) { return W[k][1] === 'f' && !W[k][2] ? KS.ta(W[k][0]) : esc(W[k][0]); }
  function demHtml(g) { return '<span class="dem-' + g + '">' + DEM[g] + '</span>'; }
  function sentence(k) { return DEM[W[k][1]] + ' ' + W[k][0]; }
  // a mix: n masculine words, n2 words with ة, and the fence words, shuffled
  function mix(nm, nta, nfence) { return shuffle(shuffle(MASC).slice(0, nm).concat(shuffle(TA).slice(0, nta), shuffle(FENCE).slice(0, nfence))); }

  var PRAISE = [['أَحْسَنْتُمْ!', 'Well done!'], ['رَائِعٌ!', 'Great!'], ['مُمْتَازٌ!', 'Excellent!'], ['بَارَكَ اللَّهُ فِيكُمْ!', 'May Allah bless you!']];
  var praiseN = 0;
  function praise() { return PRAISE[praiseN++ % PRAISE.length]; }
  // a gentle clue first (look / listen), never "wrong"
  function clue(k, how) {
    var w = W[k];
    if (w[2]) return ['اِنْتَبِهْ! بَعْضُ الْكَلِمَاتِ بِلَا ة، وَنَقُولُ مَعَهَا: هَذِهِ.', 'Careful! Some words have no ة, and we still say هَذِهِ.'];
    if (how === 'listen') return ['اِسْمَعْ آخِرَ الْكَلِمَةِ مَرَّةً أُخْرَى…', 'Listen to the end of the word again…'];
    return w[1] === 'f' ? ['اُنْظُرْ إِلَى آخِرِ الْكَلِمَةِ: هَلْ تَرَى ة؟', 'Look at the end of the word. Do you see the little shell ة?']
      : ['اُنْظُرْ إِلَى آخِرِ الْكَلِمَةِ: لَيْسَ فِيهَا ة.', 'Look at the end of the word: there is no ة.'];
  }
  function modelLine(k) { return ['نَقُولُ: ' + sentence(k) + '.', 'We say: ' + DEM[W[k][1]] + ' ' + W[k][0] + ' — ' + W[k][3] + '.']; }

  /* ── shared page parts ── */
  var bubble = $('#bubble'), sayEl = $('#say'), sayEn = $('#sayEn'), noori = $('#noori');
  var listenCoach = $('#listenCoach');
  function coach(line, kind, speakIt) {
    if (!bubble) return;
    sayEl.innerHTML = line[0]; sayEn.textContent = line[1];
    bubble.className = 'bubble pl-bubble' + (kind ? ' is-' + kind : '');
    if (listenCoach) listenCoach.setAttribute('data-say', sayEl.textContent);
    if (speakIt) say(sayEl.textContent, listenCoach);
  }
  if (noori) noori.innerHTML = KS.gull('happy', { label: 'نُورِي — Noori' });
  function cheer() { var g = noori && $('.gull', noori); if (g) KS.cheer(g); }
  function progress(el, n, got) { if (!el) return; var h = ''; for (var i = 0; i < n; i++) h += KS.star(i < got); el.innerHTML = h; el.setAttribute('aria-label', 'النُّجُومُ: ' + got + ' / ' + n + ' — stars'); }
  function done(msg, n) {
    var d = $('#done'); if (!d) return;
    $('.pl-done__gull', d).innerHTML = KS.gull('cheer', { label: 'نُورِي يَفْرَحُ — Noori cheering' });
    $('.pl-done__msg', d).innerHTML = msg[0] + ' <span class="en" lang="en">' + esc(msg[1]) + '</span>';
    var st = $('.stars', d); if (st) { var h = ''; for (var i = 0; i < n; i++) h += KS.star(true); st.innerHTML = h; st.hidden = !n; }
    var stk = $('.pl-done__sticker', d); stk.innerHTML = ''; stk.__st = false; stk.removeAttribute('data-sticker'); KS.sticker(stk);
    d.hidden = false;
    KS.sfx('good'); KS.confetti(70);
    say(msg[0]);
    try { d.focus({ preventScroll: true }); d.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
  }
  function hideDone() { var d = $('#done'); if (d) d.hidden = true; }
  var againBtn = $('#again');

  /* ── 1 · two baskets ───────────────────────────────────────────────── */
  function sortGame() {
    var card = $('#card'), pic = $('#cardPic'), wEl = $('#cardWord'), sayBtn = $('#cardSay');
    var bm = $('#basket-m'), bf = $('#basket-f'), items, i, misses, busy;
    function show() {
      var k = items[i];
      misses = 0; busy = false;
      pic.innerHTML = KS.pic(k, { decorative: true });
      wEl.innerHTML = word(k);
      sayBtn.setAttribute('data-say', W[k][0]);
      sayBtn.setAttribute('aria-label', KS.sayLabel(W[k][0]) + ': ' + W[k][3]);
      card.setAttribute('aria-label', W[k][0] + ' — ' + W[k][3] + ' (' + (i + 1) + ' / ' + items.length + ')');
      card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
      [bm, bf].forEach(function (b) { b.classList.remove('is-glow'); });
      coach(i === 0 ? ['فِي أَيِّ سَلَّةٍ نَضَعُ الصُّورَةَ؟ سَلَّةُ هَذَا أَمْ سَلَّةُ هَذِهِ؟', 'Which basket? Tap the هَذَا basket or the هَذِهِ basket.']
        : ['وَهَذِهِ الصُّورَةُ؟', 'And this picture?']);
      say(W[k][0], sayBtn);
    }
    function pick(g, b) {
      if (busy) return;
      var k = items[i];
      if (W[k][1] === g) {
        busy = true;
        var s = document.createElement('span'); s.innerHTML = KS.pic(k, { decorative: true }); s.title = W[k][0];
        $('.pl-basket__in', b).appendChild(s);
        b.setAttribute('aria-label', b.getAttribute('data-label') + ' (' + $('.pl-basket__in', b).children.length + ')');
        KS.sfx('good'); cheer();
        var p = praise();
        coach([p[0] + ' ' + demHtml(g) + ' ' + word(k) + '.', p[1] + ' ' + DEM[g] + ' ' + W[k][0] + ' — ' + W[k][3] + '.'], 'good');
        say(sentence(k), sayBtn);
        setTimeout(function () { i++; if (i < items.length) show(); else finish(); }, 2000);
        return;
      }
      misses++;
      KS.sfx('bad'); shake(card);
      if (misses === 1) coach(clue(k, 'look'), 'hint', true);
      else { coach(modelLine(k), 'hint', true); (W[k][1] === 'm' ? bm : bf).classList.add('is-glow'); }
    }
    function finish() {
      coach(['السَّلَّتَانِ مُمْتَلِئَتَانِ!', 'Both baskets are full!'], 'good');
      done(['أَحْسَنْتُمْ! وَضَعْتُمْ كُلَّ صُورَةٍ فِي سَلَّتِهَا.', 'Well done! Every picture is in its basket.'], 0);
    }
    function start() {
      items = mix(4, 3, 3); i = 0; hideDone();
      [bm, bf].forEach(function (b) { $('.pl-basket__in', b).innerHTML = ''; b.setAttribute('aria-label', b.getAttribute('data-label')); });
      show();
    }
    bm.addEventListener('click', function () { pick('m', bm); });
    // arrow keys hop between the two baskets (keyboard / switch users)
    [bm, bf].forEach(function (b) { b.addEventListener('keydown', function (e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) > -1) { e.preventDefault(); (b === bm ? bf : bm).focus(); }
    }); });
    bf.addEventListener('click', function () { pick('f', bf); });
    if (againBtn) againBtn.addEventListener('click', function () { KS.sfx('pop'); start(); try { card.scrollIntoView({ block: 'center' }); } catch (e) {} });
    start();
  }

  /* ── 2 · listen and choose ─────────────────────────────────────────── */
  function listenGame() {
    var card = $('#card'), pic = $('#cardPic'), wEl = $('#cardWord'), hear = $('#hear');
    var cm = $('#choice-m'), cf = $('#choice-f'), next = $('#next'), prog = $('#progress');
    var items, i, misses, got;
    function hearIt() { KS.speak(W[items[i]][0], hear); }
    function show() {
      var k = items[i];
      misses = 0;
      card.classList.add('is-hidden');
      pic.innerHTML = KS.pic(k, { decorative: true }); wEl.innerHTML = word(k);
      card.setAttribute('aria-label', 'صُورَةٌ مَخْفِيَّةٌ — hidden picture (' + (i + 1) + ' / ' + items.length + ')');
      [cm, cf].forEach(function (b) { b.disabled = false; b.classList.remove('is-glow'); });
      next.hidden = true;
      coach(i === 0 ? ['اِسْمَعْ نُورِي، ثُمَّ اخْتَرْ: هَذَا أَمْ هَذِهِ؟', 'Listen to Noori, then choose: هَذَا or هَذِهِ?'] : ['اِسْمَعْ… هَذَا أَمْ هَذِهِ؟', 'Listen… هَذَا or هَذِهِ?']);
      if (unlocked) hearIt();
    }
    function reveal() { card.classList.remove('is-hidden'); card.setAttribute('aria-label', W[items[i]][0] + ' — ' + W[items[i]][3]); }
    function pick(g, b) {
      var k = items[i];
      if (W[k][1] === g) {
        reveal(); got++; progress(prog, items.length, got);
        [cm, cf].forEach(function (x) { x.disabled = true; x.classList.remove('is-glow'); });
        KS.sfx('good'); cheer();
        var p = praise();
        coach([p[0] + ' ' + demHtml(g) + ' ' + word(k) + '.', p[1] + ' ' + DEM[g] + ' ' + W[k][0] + ' — ' + W[k][3] + '.'], 'good');
        say(sentence(k), hear);
        next.innerHTML = i < items.length - 1 ? 'الْكَلِمَةُ التَّالِيَةُ <span class="en" lang="en">Next word</span>' : 'النُّجُومُ <span class="en" lang="en">See my stars</span>';
        next.hidden = false;
        try { next.focus({ preventScroll: true }); } catch (e) {}
        return;
      }
      misses++;
      KS.sfx('bad'); shake(b);
      if (misses === 1) { coach(clue(k, 'listen'), 'hint'); setTimeout(hearIt, 700); }
      else if (misses === 2) { reveal(); coach(clue(k, 'look'), 'hint', true); }
      else { coach(modelLine(k), 'hint', true); (W[k][1] === 'm' ? cm : cf).classList.add('is-glow'); }
    }
    function start() { items = mix(3, 3, 2); i = 0; got = 0; hideDone(); progress(prog, items.length, 0); show(); }
    hear.addEventListener('click', hearIt);
    cm.addEventListener('click', function () { pick('m', cm); });
    cf.addEventListener('click', function () { pick('f', cf); });
    next.addEventListener('click', function () {
      i++;
      if (i < items.length) { show(); try { hear.focus({ preventScroll: true }); } catch (e) {} }
      else { next.hidden = true; done(['أَحْسَنْتُمْ! سَمِعْتُمْ كُلَّ الْكَلِمَاتِ.', 'Well done! You listened to every word — every star is yours.'], items.length); }
    });
    if (againBtn) againBtn.addEventListener('click', function () { KS.sfx('pop'); start(); try { card.scrollIntoView({ block: 'center' }); } catch (e) {} });
    start();
  }

  /* ── 3 · build a sentence ──────────────────────────────────────────── */
  var ADJ = { m: 'صَغِيرٌ', f: 'صَغِيرَةٌ' };
  // the picture, the other noun offered, and whether the adjective step is on
  var ROUNDS = [['cat-f', 'cat'], ['book', 'pen'], ['teacher-f', 'teacher-m'], ['sun', 'moon'],
                ['boat', 'sea', 1], ['fish', 'tree', 1], ['girl', 'boy', 1], ['house', 'door', 1]];
  function buildGame() {
    var card = $('#card'), pic = $('#cardPic'), wEl = $('#cardWord'), sayBtn = $('#cardSay');
    var strip = $('#strip'), tiles = $('#tiles'), next = $('#next'), prog = $('#progress');
    var r, k, g, step, steps, misses, got, slots;
    function stepTiles() {
      var kind = steps[step], opts;
      if (kind === 'dem') opts = shuffle([['m', DEM.m, demHtml('m'), DEM_EN.m], ['f', DEM.f, demHtml('f'), DEM_EN.f]]);
      else if (kind === 'noun') opts = shuffle([[k, W[k][0], word(k), W[k][3]], [ROUNDS[r][1], W[ROUNDS[r][1]][0], word(ROUNDS[r][1]), W[ROUNDS[r][1]][3]]]);
      else opts = shuffle([['m', ADJ.m, esc(ADJ.m), 'small (masculine)'], ['f', ADJ.f, KS.ta(ADJ.f), 'small (feminine)']]);
      tiles.innerHTML = opts.map(function (o) {
        var cls = kind === 'noun' ? '' : ' pl-tile--' + o[0];
        return '<button type="button" class="pl-tile' + cls + '" data-v="' + esc(o[0]) + '" data-w="' + esc(o[1]) + '" aria-label="' + esc(o[1] + ' — ' + o[3]) + '">' + o[2] + '</button>';
      }).join('');
      slots.forEach(function (s, n) { s.classList.toggle('is-now', n === step); });
      misses = 0;
    }
    function show() {
      var R = ROUNDS[r]; k = R[0]; g = W[k][1];
      steps = R[2] ? ['dem', 'noun', 'adj'] : ['dem', 'noun']; step = 0;
      pic.innerHTML = KS.pic(k, { decorative: true }); wEl.innerHTML = ''; wEl.hidden = true;
      sayBtn.setAttribute('data-say', W[k][0]); sayBtn.setAttribute('aria-label', KS.sayLabel(W[k][0]) + ': ' + W[k][3]);
      card.setAttribute('aria-label', W[k][3] + ' (' + (r + 1) + ' / ' + ROUNDS.length + ')');
      card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
      strip.classList.remove('is-done');
      strip.innerHTML = steps.map(function () { return '<span class="pl-slot" aria-hidden="true">…</span>'; }).join('');
      slots = Array.prototype.slice.call(strip.children);
      strip.setAttribute('aria-label', 'الْجُمْلَةُ — the sentence: …');
      next.hidden = true;
      stepTiles();
      coach(R[2] ? ['اِبْنِ جُمْلَةً طَوِيلَةً: هَذَا أَوْ هَذِهِ، ثُمَّ الْكَلِمَةُ، ثُمَّ صَغِيرٌ أَوْ صَغِيرَةٌ.', 'A longer sentence: هَذَا or هَذِهِ, then the word, then “small”.']
        : (r === 0 ? ['اِبْنِ جُمْلَةً تَحْتَ الصُّورَةِ: اخْتَرْ هَذَا أَوْ هَذِهِ، ثُمَّ الْكَلِمَةَ.', 'Build a sentence for the picture: choose هَذَا or هَذِهِ, then the word.']
          : ['جُمْلَةٌ جَدِيدَةٌ: هَذَا أَمْ هَذِهِ؟', 'A new sentence: هَذَا or هَذِهِ?']));
      say(W[k][0], sayBtn);
    }
    function right(t) {
      var kind = steps[step], s = slots[step];
      s.innerHTML = kind === 'dem' ? demHtml(g) : kind === 'noun' ? word(k) : (g === 'f' ? KS.ta(ADJ.f) : esc(ADJ.m));
      s.classList.remove('is-now'); s.classList.add('is-set');
      strip.setAttribute('aria-label', 'الْجُمْلَةُ — the sentence: ' + slots.map(function (x) { return x.textContent; }).join(' '));
      KS.sfx('good');
      step++;
      if (step < steps.length) { stepTiles(); coach(['رَائِعٌ! وَالْآنَ…', 'Great! Now the next tile…']); say(t.getAttribute('data-w')); try { $('.pl-tile', tiles).focus({ preventScroll: true }); } catch (e) {} return; }
      // the whole sentence: Noori reads it back
      tiles.innerHTML = ''; strip.classList.add('is-done');
      wEl.innerHTML = word(k); wEl.hidden = false;
      got++; progress(prog, ROUNDS.length, got); cheer();
      var full = sentence(k) + (steps.length > 2 ? ' ' + ADJ[g] : ''), p = praise();
      coach([p[0] + ' ' + full + '.', p[1] + ' Noori reads your sentence.'], 'good');
      say(full, sayBtn);
      next.innerHTML = r < ROUNDS.length - 1 ? 'الصُّورَةُ التَّالِيَةُ <span class="en" lang="en">Next picture</span>' : 'النُّجُومُ <span class="en" lang="en">See my stars</span>';
      next.hidden = false;
      try { next.focus({ preventScroll: true }); } catch (e) {}
    }
    function miss(t) {
      var kind = steps[step], alt = ROUNDS[r][1];
      misses++;
      KS.sfx('bad'); shake(t);
      var h;
      if (kind === 'dem') h = misses === 1 ? clue(k, 'listen') : modelLine(k);
      else if (kind === 'noun') h = (k === alt + '-f' || k.replace(/-f$/, '-m') === alt)     // قِطٌّ / قِطَّةٌ, مُعَلِّمٌ / مُعَلِّمَةٌ
        ? ['قُلْنَا هَذِهِ، فَالْكَلِمَةُ فِيهَا ة.', 'We said هَذِهِ, so the word has the little shell ة.']
        : ['اِسْمَعِ الْكَلِمَةَ، وَانْظُرْ إِلَى الصُّورَةِ.', 'Listen to the word and look at the picture.'];
      else h = g === 'f' ? ['قُلْنَا هَذِهِ، فَالصِّفَةُ فِيهَا ة أَيْضًا.', 'We said هَذِهِ, so “small” takes the ة too: صَغِيرَةٌ.'] : ['قُلْنَا هَذَا، فَالصِّفَةُ بِلَا ة.', 'We said هَذَا, so “small” has no ة: صَغِيرٌ.'];
      coach(h, 'hint', true);
      if (kind === 'noun' && misses === 1) setTimeout(function () { say(W[k][0], sayBtn); }, 1600);
      if (misses >= 2) {
        Array.prototype.forEach.call(tiles.children, function (b) {
          var ok = kind === 'dem' ? b.getAttribute('data-v') === g : kind === 'noun' ? b.getAttribute('data-v') === k : b.getAttribute('data-v') === g;
          b.classList.toggle('is-glow', ok);
        });
      }
    }
    tiles.addEventListener('click', function (e) {
      var t = e.target.closest('.pl-tile'); if (!t) return;
      var kind = steps[step], v = t.getAttribute('data-v');
      var ok = kind === 'noun' ? v === k : v === g;
      if (ok) right(t); else miss(t);
    });
    next.addEventListener('click', function () {
      r++;
      if (r < ROUNDS.length) { show(); try { $('.pl-tile', tiles).focus({ preventScroll: true }); } catch (e) {} }
      else { next.hidden = true; done(['أَحْسَنْتُمْ! بَنَيْتُمْ كُلَّ الْجُمَلِ.', 'Well done! You built every sentence — every star is yours.'], ROUNDS.length); }
    });
    function start() {   // short sentences first, then the longer ones; a new order each time
      ROUNDS = shuffle(ROUNDS.filter(function (x) { return !x[2]; })).concat(shuffle(ROUNDS.filter(function (x) { return x[2]; })));
      r = 0; got = 0; hideDone(); progress(prog, ROUNDS.length, 0); show();
    }
    if (againBtn) againBtn.addEventListener('click', function () { KS.sfx('pop'); start(); try { card.scrollIntoView({ block: 'center' }); } catch (e) {} });
    start();
  }

  /* ── 4 · the pre-reader start screen: tap once = Noori says it, tap again = open ── */
  function startScreen() {
    var picked = null;
    Array.prototype.forEach.call(document.querySelectorAll('.ks-go'), function (a) {
      var p = a.querySelector('[data-pic-name]'); if (p) p.setAttribute('aria-hidden', 'true');
      a.addEventListener('click', function (e) {
        if (picked === a) return;                     // second tap: follow the link
        e.preventDefault();
        if (picked) picked.classList.remove('is-picked');
        picked = a; a.classList.add('is-picked');
        KS.speak(a.getAttribute('data-name'), a);
        KS.sfx('pop');
        var g = noori && $('.gull', noori); if (g) KS.cheer(g);
      });
    });
    var hello = $('#hello');
    if (hello) hello.addEventListener('click', function () { KS.speak(hello.getAttribute('data-name'), hello); });
  }

  if (main.getAttribute('data-game') === 'sort') sortGame();
  else if (main.getAttribute('data-game') === 'listen') listenGame();
  else if (main.getAttribute('data-game') === 'build') buildGame();
  else if (main.getAttribute('data-game') === 'start') startScreen();
})();
