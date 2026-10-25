/* Finishes a print page in the browser, before Chrome prints it to PDF.
 *
 *  [data-pic="shell"]   -> KS.pic('shell')   (vector pictures from assets/kids.js)
 *  [data-gull="cheer"]  -> KS.gull('cheer')  (Noori, vector)
 *  .rl[data-trace="هَذَا"][data-repeat="3"]  -> the word drawn as dotted outline
 *       letters sitting on the ruled line, repeated right to left, each with a
 *       green start dot on its first stroke and a small green arrow pointing the
 *       way Arabic is written (right to left). Positions are measured from the
 *       real glyphs once the Naskh font has loaded, not guessed.
 *
 * print-book.sh runs Chrome with --virtual-time-budget so this finishes first;
 * body gets data-ready="1" at the end (check it with --dump-dom if in doubt).
 */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  each('[data-pic]', function (el) { el.innerHTML = KS.pic(el.getAttribute('data-pic'), { decorative: true, svg: true }); });
  each('[data-gull]', function (el) { el.innerHTML = KS.gull(el.getAttribute('data-gull'), { svg: true }); });   // print stays vector (KS.art)

  function mm(el) { return el.getBoundingClientRect().width / (el.offsetWidth ? el.offsetWidth : 1); }

  function trace(row) {
    var model = row.getAttribute('data-trace'), repeat = +row.getAttribute('data-repeat') || 1;
    var startOnly = row.classList.contains('start-only');
    var W = row.clientWidth, H = row.clientHeight;
    var pxPerMm = H / (row.classList.contains('short') ? 18 : 26);   // the row is 26mm tall (short: 18mm)
    var base = (row.classList.contains('short') ? 13 : 18) * pxPerMm;   // baseline, as in the CSS
    var size = 25 * pxPerMm;                      // Naskh: the letter body fills mid-line to baseline (8mm)
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'trace');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    row.appendChild(svg);
    var gap = 9 * pxPerMm, x = W - 3 * pxPerMm, n = 0;
    while (n < repeat) {
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x); t.setAttribute('y', base);
      t.setAttribute('direction', 'rtl');
      t.setAttribute('text-anchor', 'start');
      t.setAttribute('font-family', 'Noto Naskh Arabic');
      t.setAttribute('font-size', size);
      t.setAttribute('fill', startOnly ? '#C9D8DC' : 'none');
      t.setAttribute('stroke', startOnly ? 'none' : '#7E9AA2');
      t.setAttribute('stroke-width', 0.32 * pxPerMm);
      t.setAttribute('stroke-dasharray', (0.6 * pxPerMm) + ' ' + (0.7 * pxPerMm));
      t.setAttribute('stroke-linecap', 'round');
      t.setAttribute('stroke-linejoin', 'round');
      t.textContent = model;
      svg.appendChild(t);
      var w = t.getComputedTextLength();
      if (x - w < 0) { svg.removeChild(t); break; }
      // the first letter's box: the first stroke starts at its top right
      var ext;
      try { ext = t.getExtentOfChar(0); } catch (e) { ext = { x: x - w, y: base - size, width: w, height: size }; }
      var bb = t.getBBox();
      var sx = Math.min(ext.x + ext.width, x) - 0.4 * pxPerMm;
      var sy = base - 7 * pxPerMm;
      if (!startOnly) {
        var dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', sx); dot.setAttribute('cy', sy); dot.setAttribute('r', 1.3 * pxPerMm);
        dot.setAttribute('fill', '#2F9E44');
        svg.appendChild(dot);
        // the arrow: from just right of the dot, pointing left along the line
        var ay = 1.8 * pxPerMm;
        var a = document.createElementNS(NS, 'path');
        var x1 = sx + 1 * pxPerMm, x2 = sx - 7 * pxPerMm;
        a.setAttribute('d', 'M' + x1 + ' ' + ay + ' H' + x2 + ' M' + (x2 + 1.8 * pxPerMm) + ' ' + (ay - 1.4 * pxPerMm) + ' L' + x2 + ' ' + ay + ' L' + (x2 + 1.8 * pxPerMm) + ' ' + (ay + 1.4 * pxPerMm));
        a.setAttribute('stroke', '#2F9E44'); a.setAttribute('stroke-width', 0.45 * pxPerMm);
        a.setAttribute('fill', 'none'); a.setAttribute('stroke-linecap', 'round'); a.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(a);
      }
      x -= w + gap; n++;
    }
  }

  // Nothing may leave the safe area: every element inside .safe (or a cover
  // half's .hsafe) must end inside it. Recorded on <body data-overflow="…"> for
  // print-book.sh, which reads it back with Chrome --dump-dom.
  function overflow() {
    var bad = [];
    each('.safe, .hsafe', function (box, i) {
      var b = box.getBoundingClientRect();
      var sheet = box.closest('[data-key]');
      var name = (sheet && sheet.getAttribute('data-key')) || ('sheet-' + (i + 1));
      Array.prototype.forEach.call(box.querySelectorAll('*'), function (el) {
        if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return;
        if (el.closest('.trace')) return;
        var r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        // inline runs of Naskh report a content box taller and wider than the
        // line they sit in (big ascent/descent), so only blocks are measured
        if (getComputedStyle(el).display === 'inline') return;   // its block is checked instead
        if (r.bottom > b.bottom + 1 || r.top < b.top - 1 || r.left < b.left - 1 || r.right > b.right + 1) {
          bad.push(name + ':' + (el.className && el.className.baseVal === undefined ? el.className : el.tagName));
        }
      });
    });
    document.body.setAttribute('data-overflow', bad.slice(0, 20).join(' '));
  }

  function finish() {
    each('.rl[data-trace]', trace);
    overflow();
    document.body.setAttribute('data-ready', '1');
  }
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('40px "Noto Naskh Arabic"', 'هَذِهِ ة'), document.fonts.ready]).then(finish, finish);
  } else finish();
})();
