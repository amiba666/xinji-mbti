/* ============================================================
 * 心迹测评 · 报告生成动画 #/analyzing
 * window.Pages.analyzing
 * 依赖：window.Store / window.UI / window.Router
 * ============================================================ */
(function () {
  'use strict';

  window.Pages = window.Pages || {};

  var RUN_MS = 5000;        // 总时长：约 5 秒后进入付费墙
  var TAB_MS = 1250;        // 每个 tab 的推进节奏
  var BAR_STEP = 260;       // 同一 tab 内 4 条进度条的错峰间隔

  var TYPES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

  var TABS = [
    {
      key: 'personality',
      name: '性格类型',
      items: [
        '正在分析你的能量来源与内外向倾向',
        '正在比对你的认知方式与信息偏好',
        '正在定位你的性格优势与潜在盲点',
        '正在综合评估你的 MBTI 人格类型'
      ]
    },
    {
      key: 'love',
      name: '爱情分析',
      items: [
        '正在解析你在亲密关系里的表达方式',
        '正在推演你真正需要的情感回应',
        '正在评估你的安全感与亲密边界',
        '正在生成属于你的相处建议'
      ]
    },
    {
      key: 'career',
      name: '职业性格',
      items: [
        '正在分析你的天赋能力与工作风格',
        '正在匹配适合你的职场环境与节奏',
        '正在识别你的优势区间与压力来源',
        '正在挑选与你契合的职业方向'
      ]
    }
  ];

  /* ---------- 工具 ---------- */
  function cur() {
    var s = window.Store;
    if (!s) return {};
    if (typeof s.get === 'function') {
      try { return s.get() || {}; } catch (e) { /* noop */ }
    }
    return s.state || {};
  }

  function esc(v) {
    if (window.UI && typeof window.UI.escape === 'function') return window.UI.escape(v);
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function replaceRoute(path) {
    var r = window.Router;
    if (r && typeof r.replace === 'function') { r.replace(path); return; }
    if (r && typeof r.go === 'function') { r.go(path); return; }
    window.location.hash = String(path).replace(/^#/, '');
  }

  function answeredCount(s) {
    var a = (s && s.answers) || [];
    var n = 0;
    for (var i = 0; i < a.length; i++) n += (a[i] || []).length;
    return n;
  }

  function toast(msg) {
    if (window.UI && typeof window.UI.toast === 'function') window.UI.toast(msg);
  }

  function expectedTotal() {
    var st = window.Store;
    if (st && typeof st.expectedTotal === 'function') {
      try {
        var t = Number(st.expectedTotal());
        if (t > 0) return t;
      } catch (e) { /* noop */ }
    }
    var d = (window.App && window.App.QUESTIONS) || window.DATA_QUESTIONS || null;
    var ph = (d && d.phases) || [];
    var n = 0;
    for (var i = 0; i < ph.length; i++) n += (ph[i].total || (ph[i].questions || []).length);
    return n;
  }

  /* 是否已完整答完 42 题：优先用 Store.isComplete()，否则本地兜底 */
  function isComplete() {
    var st = window.Store;
    if (st && typeof st.isComplete === 'function') {
      try { return !!st.isComplete(); } catch (e) { /* noop */ }
    }
    var s = cur();
    if (s.completed === true) return true;
    var total = expectedTotal();
    return total > 0 && answeredCount(s) >= total;
  }

  function hasStarted(s) {
    if (s && s.startedAt) return true;
    return answeredCount(s) > 0;
  }

  /* ---------- 原创 16 型圆环 ---------- */
  function tone(code) {
    var a = code.charAt(1);
    var b = code.charAt(2);
    if (a === 'N') {
      return b === 'T' ? { fill: '#ecdff3', ink: '#5c3d72' } : { fill: '#d9f3e5', ink: '#0a6b41' };
    }
    return b === 'J' ? { fill: '#dbe9f7', ink: '#215f96' } : { fill: '#fdeacd', ink: '#8a5c0b' };
  }

  function polar(cx, cy, r, ang) {
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  }

  function round(v) { return Math.round(v * 100) / 100; }

  function sectorPath(cx, cy, r0, r1, a0, a1) {
    var p0 = polar(cx, cy, r1, a0);
    var p1 = polar(cx, cy, r1, a1);
    var p2 = polar(cx, cy, r0, a1);
    var p3 = polar(cx, cy, r0, a0);
    var large = (a1 - a0) > Math.PI ? 1 : 0;
    return 'M' + round(p0[0]) + ' ' + round(p0[1]) +
      ' A' + r1 + ' ' + r1 + ' 0 ' + large + ' 1 ' + round(p1[0]) + ' ' + round(p1[1]) +
      ' L' + round(p2[0]) + ' ' + round(p2[1]) +
      ' A' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + round(p3[0]) + ' ' + round(p3[1]) + ' Z';
  }

  function ringSvg() {
    var cx = 100;
    var cy = 100;
    var r0 = 61;
    var r1 = 94;
    var rMid = (r0 + r1) / 2;
    var seg = (Math.PI * 2) / TYPES.length;
    var start = -Math.PI / 2;
    var pad = 0.018;
    var out = [];

    out.push('<svg class="an-ring__svg" viewBox="0 0 200 200" role="img" aria-label="16 型人格圆环示意">');
    out.push('<circle cx="100" cy="100" r="97" fill="none" stroke="#ffd0da" stroke-width="1.6"/>');
    out.push('<g class="an-ring__spin">');

    TYPES.forEach(function (code, i) {
      var t = tone(code);
      var a0 = start + i * seg + pad;
      var a1 = start + (i + 1) * seg - pad;
      out.push('<path d="' + sectorPath(cx, cy, r0, r1, a0, a1) + '" fill="' + t.fill + '"/>');
      var mid = start + (i + 0.5) * seg;
      var p = polar(cx, cy, rMid, mid);
      out.push('<text x="' + round(p[0]) + '" y="' + round(p[1]) +
        '" text-anchor="middle" dominant-baseline="central" font-size="8" font-weight="700" fill="' +
        t.ink + '" letter-spacing="0.2">' + code + '</text>');
    });

    out.push('</g>');
    out.push('<circle cx="100" cy="100" r="55" fill="#ffffff"/>');
    out.push('<circle cx="100" cy="100" r="55" fill="none" stroke="#ffd0da" stroke-width="2"/>');
    out.push('<text x="100" y="96" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="800" fill="#1d2b24" letter-spacing="1">MBTI</text>');
    out.push('<text x="100" y="114" text-anchor="middle" dominant-baseline="central" font-size="8" font-weight="600" fill="#8b968f" letter-spacing="1.4">16 型人格</text>');
    out.push('</svg>');
    return out.join('');
  }

  /* ============================================================ */
  var page = {
    title: '报告生成中 · 心迹测评',
    theme: 'platform',
    tabbar: null,

    render: function (root) {
      this.cleanup();
      this.root = root;
      this.alive = true;
      this.redirected = false;
      this.timers = [];
      var self = this;

      /* ---------- 准入校验：没答完 42 题不允许生成报告 ---------- */
      var gate = cur();
      if (!hasStarted(gate)) { replaceRoute('#/'); return; }
      if (!isComplete()) {
        toast('请先完成全部题目');
        replaceRoute('#/exam');
        return;
      }
      if (!gate.result) {
        if (window.Store && typeof window.Store.finishTest === 'function') {
          try { window.Store.finishTest(); } catch (e) { /* noop */ }
        }
        if (!cur().result) {
          toast('报告生成失败，请重新完成测试');
          replaceRoute('#/exam');
          return;
        }
      }

      var tabsHtml = TABS.map(function (t, i) {
        return '<span class="an-tab' + (i === 0 ? ' is-active' : '') + '" data-tab="' + i + '">' + esc(t.name) + '</span>';
      }).join('');

      var answered = answeredCount(cur());
      var subText = answered > 0
        ? '已完成 ' + answered + ' 道题目的数据解析'
        : '正在整理你的作答数据，请稍候';

      root.innerHTML = '<div class="an-page">' +
        '<header class="an-head">' +
          '<div class="an-head__glow" aria-hidden="true"></div>' +
          '<div class="an-ring">' + ringSvg() + '</div>' +
          '<h1 class="an-title">你的专属 MBTI 人格报告正在生成…</h1>' +
          '<p class="an-sub">' + esc(subText) + '</p>' +
        '</header>' +
        '<section class="an-card">' +
          '<div class="an-tabs">' + tabsHtml + '</div>' +
          '<div class="an-list" id="anList"></div>' +
        '</section>' +
        '<p class="an-tip"><i class="an-tip__dot" aria-hidden="true"></i>正在匹配 16 型人格数据库，请稍候</p>' +
        '<p class="an-note">报告生成后，可随时在「我的 · 我的报告」中查看</p>' +
        '</div>';

      this.runTab(0);

      this.finishTimer = setTimeout(function () {
        if (self.alive) self.finish();
      }, RUN_MS);
    },

    destroy: function () {
      this.cleanup();
      this.root = null;
    },

    cleanup: function () {
      this.alive = false;
      if (this.timers && this.timers.length) {
        for (var i = 0; i < this.timers.length; i++) {
          clearTimeout(this.timers[i]);
          clearInterval(this.timers[i]);
        }
      }
      this.timers = [];
      if (this.finishTimer) { clearTimeout(this.finishTimer); clearInterval(this.finishTimer); this.finishTimer = 0; }
    },

    runTab: function (i) {
      if (!this.alive || !this.root) return;
      if (i >= TABS.length) return;
      var self = this;
      var root = this.root;

      var tabs = root.querySelectorAll('.an-tab');
      for (var k = 0; k < tabs.length; k++) {
        tabs[k].classList.toggle('is-active', k === i);
      }

      var list = root.querySelector('#anList');
      if (!list) return;
      var items = TABS[i].items.slice(0, 4);
      list.innerHTML = items.map(function (t) {
        return '<div class="an-item">' +
          '<p class="an-item__txt">' + esc(t) + '</p>' +
          '<span class="an-item__track"><i class="an-item__fill"></i></span>' +
          '</div>';
      }).join('');

      var fills = list.querySelectorAll('.an-item__fill');
      list.classList.remove('is-in');
      void list.offsetWidth;
      list.classList.add('is-in');
      var raf = function () {
        if (!self.alive) return;
        for (var j = 0; j < fills.length; j++) {
          fills[j].style.transitionDelay = (j * BAR_STEP) + 'ms';
          fills[j].style.width = '100%';
        }
      };
      if (window.requestAnimationFrame) window.requestAnimationFrame(raf);
      else setTimeout(raf, 16);

      if (i + 1 < TABS.length) {
        this.timers.push(setTimeout(function () { self.runTab(i + 1); }, TAB_MS));
      }
    },

    finish: function () {
      if (!this.alive || this.redirected) return;
      this.redirected = true;
      if (!isComplete()) {
        toast('请先完成全部题目');
        replaceRoute('#/exam');
        return;
      }
      var s = cur();
      if (!s.result) {
        if (window.Store && typeof window.Store.finishTest === 'function') {
          try { window.Store.finishTest(); } catch (e) { /* noop */ }
        }
        if (!cur().result) { replaceRoute('#/exam'); return; }
      }
      replaceRoute('#/unlock');
    }
  };

  window.Pages.analyzing = page;
})();
