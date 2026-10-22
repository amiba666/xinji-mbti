/*! 心迹测评 · 纯 SVG 图表渲染器 | window.Charts
 * 无依赖、无 canvas、矢量自适应容器宽度。
 * 对外：Charts.radar(el, traits, opts) / Charts.bipolar(el, dims, opts) / Charts.donut(el, pct, opts)
 */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var raf = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : function (fn) { return setTimeout(function () { fn(Date.now()); }, 16); };
  var reduceMotion = false;
  try {
    reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { reduceMotion = false; }

  var seq = 0;

  function mk(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k) && attrs[k] != null) {
          node.setAttribute(k, attrs[k]);
        }
      }
    }
    return node;
  }

  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  /** 从 CSS 令牌读取颜色，取不到时用兜底值（仅兜底，不作为设计色值使用） */
  function token(el, name, fallback) {
    try {
      var v = window.getComputedStyle(el).getPropertyValue(name);
      v = (v || '').trim();
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function runAnim(el, ms, step, done) {
    if (reduceMotion) { step(1); if (done) done(); return; }
    var start = 0;
    function frame(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / ms);
      if (!el.isConnected) return; // 页面已切走，自动停止
      step(easeOutCubic(t));
      if (t < 1) raf(frame); else if (done) done();
    }
    raf(frame);
  }

  function baseSvg(el, viewW, viewH, label) {
    var svg = mk('svg', {
      viewBox: '0 0 ' + viewW + ' ' + viewH,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
      'aria-label': label || '图表'
    });
    svg.setAttribute('class', 'cht-svg');
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.overflow = 'visible';
    el.appendChild(svg);
    return svg;
  }

 function textNode(parent, x, y, str, opts) {
    opts = opts || {};
    var t = mk('text', {
      x: x,
      y: y,
      'text-anchor': opts.anchor || 'middle',
      'dominant-baseline': opts.baseline || 'middle',
      'font-size': opts.size || 12,
      'font-weight': opts.weight || 400,
      'letter-spacing': opts.spacing || 0,
      fill: opts.fill || 'currentColor'
    });
    if (opts.className) t.setAttribute('class', opts.className);
    t.textContent = str;
    parent.appendChild(t);
    return t;
  }

  /* ------------------------------------------------------------------ *
   * 雷达图：网格 3 层 + 轴线 + 轴标签 + 渐变填充多边形 + 进入动画
   * ------------------------------------------------------------------ */
  function radar(el, traits, opts) {
    if (!el) return null;
    opts = opts || {};
    if (!traits || !traits.length) { clear(el); return null; }

    clear(el);
    var W = 360;
    var H = 316;
    var cx = W / 2;
    var cy = 156;
    var R = 100;
    var n = traits.length;
    var color = opts.color || token(el, '--c-brand', '#ff5d7d');
    var color2 = opts.color2 || token(el, '--c-brand-2', '#ff8a63');
    var ink = token(el, '--ink-2', '#49564f');
    var muted = token(el, '--muted', '#8b968f');
    var gridColor = token(el, '--line', '#edf1ee');
    var id = 'chtRadar' + (++seq);

    var svg = baseSvg(el, W, H, opts.label || '人格特质雷达图');
    var defs = mk('defs');
    var grad = mk('linearGradient', { id: id, x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    grad.appendChild(mk('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': '.55' }));
    grad.appendChild(mk('stop', { offset: '100%', 'stop-color': color2, 'stop-opacity': '.22' }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    function point(i, radius) {
      var a = -Math.PI / 2 + (Math.PI * 2 * i) / n;
      return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
    }
    function polyPoints(radius, scale) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var p = point(i, radius);
        pts.push([
          (cx + (p.x - cx) * scale).toFixed(2),
          (cy + (p.y - cy) * scale).toFixed(2)
        ].join(','));
      }
      return pts.join(' ');
    }

    var gridG = mk('g');
    svg.appendChild(gridG);
    var rings = [];
    for (var layer = 1; layer <= 3; layer++) {
      var ring = mk('polygon', {
        points: polyPoints((R * layer) / 3, 1),
        fill: layer === 3 ? 'none' : 'none',
        stroke: gridColor,
        'stroke-width': layer === 3 ? 1.4 : 1
      });
      ring.style.opacity = '0';
      ring.style.transition = 'opacity .45s ease ' + (layer * 70) + 'ms';
      gridG.appendChild(ring);
      rings.push(ring);
    }
    for (var ai = 0; ai < n; ai++) {
      var end = point(ai, R);
      var axis = mk('line', {
        x1: cx, y1: cy, x2: end.x.toFixed(2), y2: end.y.toFixed(2),
        stroke: gridColor, 'stroke-width': 1
      });
      axis.style.opacity = '0';
      axis.style.transition = 'opacity .45s ease 120ms';
      gridG.appendChild(axis);
      rings.push(axis);
    }

    // 轴标签
    for (var ti = 0; ti < n; ti++) {
      var tp = point(ti, R + 20);
      var c = Math.cos(-Math.PI / 2 + (Math.PI * 2 * ti) / n);
      var s = Math.sin(-Math.PI / 2 + (Math.PI * 2 * ti) / n);
      var anchor = c > 0.26 ? 'start' : (c < -0.26 ? 'end' : 'middle');
      var dy = s > 0.6 ? 4 : (s < -0.6 ? -4 : 0);
      var label = textNode(gridG, tp.x, tp.y + dy, String(traits[ti].name || ''), {
        size: 12, fill: ink, weight: 500, anchor: anchor
      });
      label.style.opacity = '0';
      label.style.transition = 'opacity .5s ease ' + (180 + ti * 40) + 'ms';
      rings.push(label);
    }

    var shape = mk('g');
    svg.appendChild(shape);
    var dataPoly = mk('polygon', {
      points: polyPoints(R, 0.06),
      fill: 'url(#' + id + ')',
      stroke: color,
      'stroke-width': 2,
      'stroke-linejoin': 'round'
    });
    dataPoly.style.opacity = '0';
    dataPoly.style.transition = 'opacity .35s ease 120ms';
    dataPoly.style.filter = reduceMotion ? 'none' : 'drop-shadow(0 6px 10px rgba(0,0,0,.06))';
    shape.appendChild(dataPoly);

    var dots = [];
    for (var di = 0; di < n; di++) {
      var d = mk('circle', { cx: cx, cy: cy, r: 0, fill: '#fff', stroke: color, 'stroke-width': 2 });
      d.style.opacity = '0';
      shape.appendChild(d);
      dots.push(d);
    }

    var vals = [];
    for (var vi = 0; vi < n; vi++) {
      var raw = Number(traits[vi].value);
      if (!isFinite(raw)) raw = 0;
      vals.push(Math.max(4, Math.min(100, raw)));
    }

    function drawAt(scale) {
      for (var i = 0; i < n; i++) {
        var radius = (R * vals[i]) / 100;
        var p = point(i, radius);
        var x = cx + (p.x - cx) * scale;
        var y = cy + (p.y - cy) * scale;
        var r = 3.4 * scale;
        dots[i].setAttribute('cx', x.toFixed(2));
        dots[i].setAttribute('cy', y.toFixed(2));
        dots[i].setAttribute('r', r.toFixed(2));
      }
      // 多边形顶点按当前进度插值
      var pts = [];
      for (var j = 0; j < n; j++) {
        var rr = (R * vals[j]) / 100;
        var q = point(j, rr);
        pts.push([(cx + (q.x - cx) * scale).toFixed(2), (cy + (q.y - cy) * scale).toFixed(2)].join(','));
      }
      dataPoly.setAttribute('points', pts.join(' '));
    }

    // 触发网格淡入
    raf(function () {
      for (var i = 0; i < rings.length; i++) rings[i].style.opacity = '1';
    });

    runAnim(el, 760, function (t) {
      var scale = 0.06 + 0.94 * t;
      drawAt(scale);
      dataPoly.style.opacity = String(Math.min(1, t * 1.6));
      for (var i = 0; i < dots.length; i++) dots[i].style.opacity = String(Math.min(1, t * 1.8));
    }, function () {
      drawAt(1);
      dataPoly.style.opacity = '1';
      for (var i = 0; i < dots.length; i++) dots[i].style.opacity = '1';
    });

    return { svg: svg, redraw: function () { drawAt(1); } };
  }

  /* ------------------------------------------------------------------ *
   * 双向条：左右百分比，从中轴向两侧生长
   * ------------------------------------------------------------------ */
  function bipolar(el, dims, opts) {
    if (!el) return null;
    opts = opts || {};
    if (!dims || !dims.length) { clear(el); return null; }

    clear(el);
    var W = 360;
    var rowH = 66;
    var padT = 6;
    var H = padT * 2 + dims.length * rowH;
    var leftColor = opts.leftColor || token(el, '--c-green', '#12b76a');
    var rightColor = opts.rightColor || token(el, '--c-purple', '#88619a');
    var trackColor = token(el, '--line', '#edf1ee');
    var ink = token(el, '--ink', '#1d2b24');
    var muted = token(el, '--muted', '#8b968f');
    var x0 = 14;
    var x1 = W - 14;
    var cx = W / 2;

    var svg = baseSvg(el, W, H, opts.label || '四维人格倾向');

    var rows = [];
    for (var i = 0; i < dims.length; i++) {
      var dim = dims[i] || {};
      var y = padT + i * rowH;
      var pctL = Number(dim.leftPct);
      if (!isFinite(pctL)) pctL = 50;
      pctL = Math.max(2, Math.min(98, Math.round(pctL)));
      var pctR = 100 - pctL;
      var leftWin = pctL >= 50;
      var leftLetter = dim.left || 'A';
      var rightLetter = dim.right || 'B';

      var g = mk('g');
      svg.appendChild(g);

      // 顶部：左字母 + 左百分比 /（中缝）/ 右百分比 + 右字母
      var lLetter = textNode(g, x0, y + 12, leftLetter, {
        size: 13, weight: leftWin ? 700 : 500, fill: leftWin ? leftColor : muted,
        anchor: 'start'
      });
      var lPct = textNode(g, x0 + 15, y + 12, pctL + '%', {
        size: 12, weight: 600, fill: leftWin ? ink : muted,
        anchor: 'start'
      });
      var rPct = textNode(g, x1 - 15, y + 12, pctR + '%', {
        size: 12, weight: 600, fill: leftWin ? muted : ink,
        anchor: 'end'
      });
      var rLetter = textNode(g, x1, y + 12, rightLetter, {
        size: 13, weight: leftWin ? 500 : 700, fill: leftWin ? muted : rightColor,
        anchor: 'end'
      });

      // 轨道
      var track = mk('rect', {
        x: x0, y: y + 26, width: x1 - x0, height: 10, rx: 5, ry: 5, fill: trackColor
      });
      g.appendChild(track);

      // 左段从左侧生长、右段从右侧生长，在分割点相遇
      var totalW = x1 - x0;
      var splitL = (totalW * pctL) / 100;
      var splitR = totalW - splitL;
      var leftSeg = mk('rect', {
        x: x0, y: y + 26, width: 0, height: 10, rx: 5, ry: 5, fill: leftColor
      });
      var rightSeg = mk('rect', {
        x: x1, y: y + 26, width: 0, height: 10, rx: 5, ry: 5, fill: rightColor
      });
      g.appendChild(leftSeg);
      g.appendChild(rightSeg);

      // 倾向词
      var descStr = dim.desc || ((dim.leftName && dim.rightName)
        ? dim.leftName + ' / ' + dim.rightName
        : (leftLetter + ' / ' + rightLetter));
      textNode(g, cx, y + 50, descStr, { size: 10.5, fill: muted });

      rows.push({
        pctL: pctL, pctR: pctR, splitL: splitL, splitR: splitR, totalW: totalW,
        leftSeg: leftSeg, rightSeg: rightSeg, lPct: lPct, rPct: rPct,
        lLetter: lLetter, rLetter: rLetter, leftWin: leftWin,
        leftColor: leftColor, rightColor: rightColor, muted: muted, ink: ink
      });
    }

    runAnim(el, 820, function (t) {
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        r.leftSeg.setAttribute('x', x0);
        r.leftSeg.setAttribute('width', (r.splitL * t).toFixed(2));
        r.rightSeg.setAttribute('x', (x1 - r.splitR * t).toFixed(2));
        r.rightSeg.setAttribute('width', (r.splitR * t).toFixed(2));
      }
    }, function () {
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        r.leftSeg.setAttribute('x', x0);
        r.leftSeg.setAttribute('width', r.splitL.toFixed(2));
        r.rightSeg.setAttribute('x', (x1 - r.splitR).toFixed(2));
        r.rightSeg.setAttribute('width', r.splitR.toFixed(2));
      }
    });

    return { svg: svg };
  }

  /* ------------------------------------------------------------------ *
   * 环形图：稀有度 / 占比，百分比数字居中，描边进度动画
   * ------------------------------------------------------------------ */
  function donut(el, pct, opts) {
    if (!el) return null;
    opts = opts || {};
    var value = Number(pct);
    if (!isFinite(value)) value = 0;
    value = Math.max(0, Math.min(100, value));

    clear(el);
    var W = 168;
    var H = 168;
    var cx = 84;
    var cy = 84;
    var r = 62;
    var sw = opts.stroke || 11;
    var color = opts.color || token(el, '--c-brand', '#ff5d7d');
    var color2 = opts.color2 || token(el, '--c-brand-2', '#ff8a63');
    var trackColor = opts.trackColor || token(el, '--line', '#edf1ee');
    var ink = token(el, '--ink', '#1d2b24');
    var muted = token(el, '--muted', '#8b968f');
    var id = 'chtDonut' + (++seq);
    var circ = 2 * Math.PI * r;

    var svg = baseSvg(el, W, H, opts.label || '环形占比图');
    var defs = mk('defs');
    var grad = mk('linearGradient', { id: id, x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    grad.appendChild(mk('stop', { offset: '0%', 'stop-color': color }));
    grad.appendChild(mk('stop', { offset: '100%', 'stop-color': color2 }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    svg.appendChild(mk('circle', {
      cx: cx, cy: cy, r: r, fill: 'none', stroke: trackColor, 'stroke-width': sw
    }));

    var arc = mk('circle', {
      cx: cx, cy: cy, r: r, fill: 'none',
      stroke: 'url(#' + id + ')',
      'stroke-width': sw,
      'stroke-linecap': 'round',
      'stroke-dasharray': circ.toFixed(2),
      'stroke-dashoffset': circ.toFixed(2),
      transform: 'rotate(-90 ' + cx + ' ' + cy + ')'
    });
    svg.appendChild(arc);

    var showPct = opts.showPct !== false;
    var numText = showPct
      ? textNode(svg, cx, cy - 6, '0', { size: 30, weight: 700, fill: ink, anchor: 'middle' })
      : null;
    if (numText) numText.style.letterSpacing = '-1px';
    var pctSign = showPct
      ? textNode(svg, cx, cy + 20, '%', { size: 12, weight: 600, fill: muted })
      : null;
    if (pctSign) pctSign.style.opacity = '0';
    var caption = opts.caption
      ? textNode(svg, cx, cy + 40, opts.caption, { size: 10.5, fill: muted })
      : null;
    if (caption) caption.style.opacity = '0';

    var decimals = typeof opts.decimals === 'number' ? opts.decimals : 0;
    function fmt(v) {
      return decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
    }

    runAnim(el, 980, function (t) {
      var dash = circ * (1 - (value / 100) * t);
      arc.setAttribute('stroke-dashoffset', dash.toFixed(2));
      if (numText) numText.textContent = fmt(value * t);
      if (pctSign) pctSign.style.opacity = String(Math.min(1, t * 2));
      if (caption) caption.style.opacity = String(Math.min(1, t * 2));
    }, function () {
      arc.setAttribute('stroke-dashoffset', (circ * (1 - value / 100)).toFixed(2));
      if (numText) numText.textContent = fmt(value);
    });

    return { svg: svg };
  }

  window.Charts = {
    radar: radar,
    bipolar: bipolar,
    donut: donut,
    _token: token
  };
})();
