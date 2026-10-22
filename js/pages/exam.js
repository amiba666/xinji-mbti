/* ============================================================
 * 心迹测评 · 答题页 #/exam
 * window.Pages.exam
 * 依赖：window.Store / window.UI / window.Router / window.App.QUESTIONS
 * ============================================================ */
(function () {
  'use strict';

  window.Pages = window.Pages || {};

  var LIVE_BASE = 6642071;   // 最近30天测试人数基准
  var ADVANCE_MS = 200;      // 选中高亮后自动进入下一题
  var LOCK_MS = 250;         // 连点节流

  /* 答题过程中轮播的 MBTI 小知识（原创） */
  var TIPS = [
    '四个维度不是四个标签，而是四组偏好。每个人都同时用到两端，只是更习惯其中一边。',
    'MBTI 描述的是偏好，不是能力。它说明你更愿意怎么做，而不是你一定能做到什么。',
    '同一种类型的人，行为也可能相差很远。类型只解释你的倾向，并不决定你每一次选择。',
    '人格不是一次定型的结果。经历、环境，还有刻意的练习，都会让偏好慢慢发生移动。',
    '测试只是自我观察的入口。真正了解自己，还得靠长期的生活经验，和一次次的复盘。'
  ];

  /* ---------- 小工具 ---------- */
  function cur() {
    var s = window.Store;
    if (!s) return {};
    if (typeof s.get === 'function') {
      try { return s.get() || {}; } catch (e) { /* noop */ }
    }
    return s.state || {};
  }

  function bank() {
    if (window.App && window.App.QUESTIONS) return window.App.QUESTIONS;
    return window.DATA_QUESTIONS || null;
  }

  function phases() {
    var d = bank();
    return d && d.phases && d.phases.length ? d.phases : [];
  }

  function esc(v) {
    if (window.UI && typeof window.UI.escape === 'function') return window.UI.escape(v);
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function goRoute(path) {
    var r = window.Router;
    if (r && typeof r.go === 'function') { r.go(path); return; }
    window.location.hash = String(path).replace(/^#/, '');
  }

  function toast(msg) {
    if (window.UI && typeof window.UI.toast === 'function') window.UI.toast(msg);
  }

  function iconSvg(name, size) {
    if (window.UI && typeof window.UI.icon === 'function') {
      try {
        var s = window.UI.icon(name, size);
        if (s) return s;
      } catch (e) { /* noop */ }
    }
    return '';
  }

  /* ---------- 原创插画：隐藏人格（山野同行） ---------- */
  function artScene() {
    var s = [];
    s.push('<svg class="exam-art" viewBox="0 0 320 200" role="img" aria-label="山野中并肩同行的两个人">');
    s.push('<defs>');
    s.push('<linearGradient id="examSkyA" x1="0" y1="0" x2="0" y2="1">');
    s.push('<stop offset="0" stop-color="#e6f8ef"/><stop offset="1" stop-color="#fbfefc"/></linearGradient>');
    s.push('<radialGradient id="examHaloA" cx="0.5" cy="0.5" r="0.5">');
    s.push('<stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>');
    s.push('</defs>');
    s.push('<rect width="320" height="200" fill="url(#examSkyA)"/>');
    s.push('<circle cx="246" cy="46" r="48" fill="url(#examHaloA)"/>');
    s.push('<circle cx="246" cy="46" r="13.5" fill="#ffffff"/>');
    s.push('<circle cx="246" cy="46" r="13.5" fill="none" stroke="#c6ebd8" stroke-width="1.2"/>');
    s.push('<circle cx="66" cy="34" r="1.6" fill="#0a8c50" opacity=".35"/>');
    s.push('<circle cx="104" cy="58" r="1.2" fill="#88619a" opacity=".35"/>');
    s.push('<circle cx="196" cy="26" r="1.4" fill="#12b76a" opacity=".4"/>');
    s.push('<circle cx="292" cy="88" r="1.2" fill="#0a8c50" opacity=".3"/>');
    s.push('<g fill="#ffffff" opacity=".78"><ellipse cx="54" cy="58" rx="23" ry="6.6"/><ellipse cx="71" cy="51" rx="15" ry="6.6"/></g>');
    s.push('<g fill="#ffffff" opacity=".7"><ellipse cx="212" cy="34" rx="18" ry="5.6"/><ellipse cx="225" cy="29" rx="11" ry="5"/></g>');
    s.push('<path d="M0 128 L46 88 L86 118 L120 92 L166 124 L222 100 L268 124 L320 104 L320 200 L0 200 Z" fill="#def4e8"/>');
    s.push('<path d="M0 146 L54 112 L96 140 L142 114 L196 146 L250 120 L320 140 L320 200 L0 200 Z" fill="#cbeedb"/>');
    s.push('<path d="M0 172 Q78 152 156 168 T320 160 L320 200 L0 200 Z" fill="#b6e6cc"/>');
    s.push('<path d="M0 186 Q92 170 176 182 T320 176 L320 200 L0 200 Z" fill="#a2dcbc"/>');
    s.push('<path d="M150 200 Q150 180 172 172 Q192 165 196 154" fill="none" stroke="#f6fdf9" stroke-width="13" stroke-linecap="round"/>');
    s.push('<path d="M150 200 Q150 180 172 172 Q192 165 196 154" fill="none" stroke="#cdeedd" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>');
    s.push('<g>');
    s.push('<rect x="214" y="138" width="30" height="24" rx="2" fill="#f6fdf9" stroke="#bfe9d2" stroke-width="1.4"/>');
    s.push('<path d="M208 139 L229 121 L250 139 Z" fill="#12b76a"/>');
    s.push('<rect x="225" y="149" width="8" height="13" rx="1" fill="#0a8c50" opacity=".55"/>');
    s.push('<rect x="217" y="145" width="5" height="5" rx="1" fill="#bfe9d2"/>');
    s.push('<rect x="240" y="145" width="5" height="5" rx="1" fill="#bfe9d2"/>');
    s.push('</g>');
    s.push('<g>');
    s.push('<rect x="50" y="148" width="5" height="22" rx="2" fill="#8b9c92"/>');
    s.push('<path d="M53 112 L30 149 L76 149 Z" fill="#3ecf90"/>');
    s.push('<path d="M53 100 L34 131 L72 131 Z" fill="#12b76a"/>');
    s.push('<path d="M53 90 L39 115 L67 115 Z" fill="#0a8c50" opacity=".85"/>');
    s.push('</g>');
    s.push('<g>');
    s.push('<rect x="270" y="158" width="4" height="16" rx="2" fill="#8b9c92"/>');
    s.push('<path d="M272 136 L257 161 L287 161 Z" fill="#3ecf90"/>');
    s.push('<path d="M272 126 L260 147 L284 147 Z" fill="#12b76a"/>');
    s.push('</g>');
    s.push('<g>');
    s.push('<circle cx="164" cy="142" r="6" fill="#ffe3d3"/>');
    s.push('<path d="M154 150 h20 l3 22 h-26 z" fill="#0a8c50"/>');
    s.push('<path d="M158 172 l-2 10 M170 172 l2 10" stroke="#0a8c50" stroke-width="2.6" stroke-linecap="round"/>');
    s.push('</g>');
    s.push('<g>');
    s.push('<circle cx="188" cy="147" r="5.6" fill="#ffe3d3"/>');
    s.push('<path d="M179 155 h18 l2.6 20 h-23.2 z" fill="#88619a"/>');
    s.push('<path d="M182 175 l-1.8 9 M194 175 l1.8 9" stroke="#88619a" stroke-width="2.4" stroke-linecap="round"/>');
    s.push('</g>');
    s.push('<path d="M104 88 q4 -5 8 0 q4 -5 8 0" fill="none" stroke="#0a8c50" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>');
    s.push('<path d="M128 76 q3 -3.6 6 0 q3 -3.6 6 0" fill="none" stroke="#0a8c50" stroke-width="1.2" stroke-linecap="round" opacity=".38"/>');
    s.push('<path d="M16 180 q28 -10 56 0" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".7"/>');
    s.push('<path d="M246 178 q24 -8 46 0" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".6"/>');
    s.push('</svg>');
    return s.join('');
  }

  /* ---------- 原创插画：人格校准（平衡几何） ---------- */
  function artScale() {
    var s = [];
    s.push('<svg class="exam-art" viewBox="0 0 320 200" role="img" aria-label="两端平衡的几何构图">');
    s.push('<defs>');
    s.push('<linearGradient id="examSkyB" x1="0" y1="0" x2="0" y2="1">');
    s.push('<stop offset="0" stop-color="#eefaf4"/><stop offset="1" stop-color="#fbfefc"/></linearGradient>');
    s.push('<radialGradient id="examHaloB" cx="0.5" cy="0.5" r="0.5">');
    s.push('<stop offset="0" stop-color="#ffffff" stop-opacity=".92"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>');
    s.push('<linearGradient id="examOrbG" x1="0" y1="0" x2="1" y2="1">');
    s.push('<stop offset="0" stop-color="#5fd39a"/><stop offset="1" stop-color="#0a8c50"/></linearGradient>');
    s.push('<linearGradient id="examOrbP" x1="0" y1="0" x2="1" y2="1">');
    s.push('<stop offset="0" stop-color="#b79ac6"/><stop offset="1" stop-color="#88619a"/></linearGradient>');
    s.push('</defs>');
    s.push('<rect width="320" height="200" fill="url(#examSkyB)"/>');
    s.push('<circle cx="160" cy="92" r="92" fill="url(#examHaloB)"/>');
    s.push('<circle cx="160" cy="92" r="74" fill="none" stroke="#d9f2e3" stroke-width="1.2"/>');
    s.push('<circle cx="160" cy="92" r="64" fill="none" stroke="#d9f2e3" stroke-width="1.2" stroke-dasharray="4 9"/>');
    s.push('<circle cx="160" cy="92" r="54" fill="none" stroke="#e9f7ef" stroke-width="1"/>');
    s.push('<path d="M0 152 L64 118 L112 148 L160 120 L216 154 L272 126 L320 148 L320 200 L0 200 Z" fill="#e2f6ea"/>');
    s.push('<path d="M0 166 L70 136 L120 162 L178 134 L232 164 L284 140 L320 158 L320 200 L0 200 Z" fill="#cfefdd"/>');
    s.push('<path d="M0 182 Q90 166 178 180 T320 174 L320 200 L0 200 Z" fill="#b8e5ca"/>');
    s.push('<path d="M24 100 H296" stroke="#bfe9d2" stroke-width="1" stroke-dasharray="2 8"/>');
    s.push('<path d="M160 24 V56" stroke="#bfe9d2" stroke-width="1.2" stroke-dasharray="2 6"/>');
    s.push('<path d="M88 92 H232" stroke="#0a8c50" stroke-width="4" stroke-linecap="round"/>');
    s.push('<path d="M160 92 V170" stroke="#0a8c50" stroke-width="4" stroke-linecap="round"/>');
    s.push('<path d="M126 174 H194" stroke="#0a8c50" stroke-width="5" stroke-linecap="round"/>');
    s.push('<circle cx="160" cy="92" r="7" fill="#12b76a"/><circle cx="160" cy="92" r="2.6" fill="#ffffff"/>');
    s.push('<circle cx="88" cy="70" r="20" fill="none" stroke="#bfe9d2" stroke-width="1.2" stroke-dasharray="3 5"/>');
    s.push('<circle cx="88" cy="70" r="13" fill="url(#examOrbG)"/>');
    s.push('<circle cx="84" cy="65" r="3.4" fill="#ffffff" opacity=".72"/>');
    s.push('<path d="M88 84 V92" stroke="#12b76a" stroke-width="2" stroke-linecap="round" opacity=".8"/>');
    s.push('<circle cx="232" cy="70" r="20" fill="none" stroke="#e6dcef" stroke-width="1.2" stroke-dasharray="3 5"/>');
    s.push('<circle cx="232" cy="70" r="13" fill="url(#examOrbP)"/>');
    s.push('<circle cx="228" cy="65" r="3.4" fill="#ffffff" opacity=".72"/>');
    s.push('<path d="M232 84 V92" stroke="#88619a" stroke-width="2" stroke-linecap="round" opacity=".8"/>');
    s.push('<path d="M264 42 l5 9 -5 9 -5 -9 z" fill="#12b76a" opacity=".5"/>');
    s.push('<path d="M56 116 l4 7.5 -4 7.5 -4 -7.5 z" fill="#88619a" opacity=".45"/>');
    s.push('<circle cx="286" cy="106" r="2.4" fill="#12b76a" opacity=".45"/>');
    s.push('<circle cx="42" cy="62" r="2" fill="#88619a" opacity=".4"/>');
    s.push('<circle cx="204" cy="38" r="1.8" fill="#0a8c50" opacity=".35"/>');
    s.push('<path d="M134 178 v-4.5 M144 178 v-4.5 M154 178 v-4.5 M166 178 v-4.5 M176 178 v-4.5 M186 178 v-4.5" stroke="#0a8c50" stroke-width="1.4" stroke-linecap="round" opacity=".32"/>');
    s.push('</svg>');
    return s.join('');
  }

  /* ============================================================ */
  var page = {
    title: 'MBTI 人格测试 2026 · 心迹测评',
    theme: 'green',
    tabbar: null,

    /* ---------- 生命周期 ---------- */
    render: function (root) {
      this.cleanup();
      this.root = root;
      this.alive = true;
      this.busy = false;
      this.live = 0;
      this.advTimer = 0;
      this.lockTimer = 0;
      this.liveTimer = 0;
      this.toastTimer = 0;
      this.dismissedPhase = -1;
      this.onIntro = false;

      if (!phases().length) {
        root.innerHTML = '<div class="exam-page"><section class="exam-guide">' +
          '<h2 class="exam-guide__title">题库没有加载出来</h2>' +
          '<p class="exam-guide__desc">请检查网络后刷新页面再试一次。</p></section></div>';
        return;
      }

      if (!cur().startedAt) { this.mountGuide(); return; }
      this.mountTest();

      var answered = this.answeredCount();
      var grand = this.grandTotal();
      if (answered > 0 && answered < grand) {
        var self = this;
        this.toastTimer = setTimeout(function () {
          if (self.alive) toast('已恢复上次的答题进度');
        }, 300);
      }
    },

    destroy: function () {
      this.cleanup();
      this.root = null;
    },

    cleanup: function () {
      this.alive = false;
      if (this.liveTimer) { clearTimeout(this.liveTimer); clearInterval(this.liveTimer); this.liveTimer = 0; }
      if (this.advTimer) { clearTimeout(this.advTimer); this.advTimer = 0; }
      if (this.lockTimer) { clearTimeout(this.lockTimer); this.lockTimer = 0; }
      if (this.toastTimer) { clearTimeout(this.toastTimer); this.toastTimer = 0; }
      if (this.onClick && this.root) {
        try { this.root.removeEventListener('click', this.onClick); } catch (e) { /* noop */ }
      }
      if (this.onKey) {
        try { window.removeEventListener('keydown', this.onKey); } catch (e) { /* noop */ }
      }
      this.onClick = null;
      this.onKey = null;
      this.busy = false;
      this.onIntro = false;
      this.dismissedPhase = -1;
    },

    /* ---------- 头部 / 人数 ---------- */
    headHtml: function () {
      var d = bank() || {};
      var base = (d.intro && Number(d.intro.recentTested)) || LIVE_BASE;
      return '<header class="exam-head">' +
        '<h1 class="exam-head__title">MBTI 人格测试 2026</h1>' +
        '<p class="exam-head__live">最近30天测试：<b id="examLive">' + base + '</b>人</p>' +
        '</header>';
    },

    startLive: function () {
      var self = this;
      var d = bank() || {};
      var base = (d.intro && Number(d.intro.recentTested)) || LIVE_BASE;
      this.live = base;
      var paint = function () {
        var el = self.root && self.root.querySelector('#examLive');
        if (el) el.textContent = String(self.live);
      };
      paint();
      var tick = function () {
        if (!self.alive) return;
        self.live += 1 + Math.floor(Math.random() * 3);   // 小幅随机递增，更像真实数据
        paint();
        self.liveTimer = setTimeout(tick, 2000 + Math.floor(Math.random() * 2000));
      };
      this.liveTimer = setTimeout(tick, 2200 + Math.floor(Math.random() * 1600));
    },

    /* ---------- 未开始：引导卡 ---------- */
    mountGuide: function () {
      var d = bank() || {};
      var intro = d.intro || {};
      var total = this.grandTotal();
      var bullets = (intro.bullets || []).map(function (t) {
        return '<li class="exam-guide__li"><i class="exam-guide__tick" aria-hidden="true"></i><span>' + esc(t) + '</span></li>';
      }).join('');

      this.root.innerHTML = '<div class="exam-page">' +
        this.headHtml() +
        '<section class="exam-guide">' +
          '<p class="exam-guide__kicker">MBTI · ' + total + ' 题 · 约 6 分钟</p>' +
          '<h2 class="exam-guide__title">' + esc(intro.title || 'MBTI 人格测试') + '</h2>' +
          '<p class="exam-guide__desc">' + esc(intro.desc || '') + '</p>' +
          '<ul class="exam-guide__list">' + bullets + '</ul>' +
          '<button type="button" class="btn btn--green btn--block btn--lg press exam-guide__start" data-act="start">开始测试</button>' +
          '<p class="exam-guide__hint">答案没有对错，凭第一反应选择就好</p>' +
        '</section>' +
        this.noteHtml() +
        '</div>';

      this.startLive();
      this.bind();
    },

    /* ---------- 测试主体 ---------- */
    mountTest: function () {
      this.root.innerHTML = '<div class="exam-page">' +
        this.headHtml() +
        '<div class="exam-progress">' +
          '<div class="exam-progress__row">' +
            '<span class="exam-progress__num"><b id="examCur">1</b><i class="exam-progress__slash">/</i><em id="examAll">' + this.grandTotal() + '</em></span>' +
            '<span class="exam-progress__track" role="progressbar" aria-label="答题进度" aria-valuemin="0" aria-valuemax="' + this.grandTotal() + '" aria-valuenow="1"><i class="exam-progress__fill" id="examFill"></i></span>' +
            '<span class="exam-progress__tag" id="examTag" hidden></span>' +
          '</div>' +
        '</div>' +
        '<div class="exam-body" id="examBody"></div>' +
        '<footer class="exam-foot">' +
          '<button type="button" class="btn btn--ghost exam-prev press" id="examPrev">上一题</button>' +
          '<button type="button" class="btn btn--green exam-done press" id="examDone" hidden>查看结果</button>' +
        '</footer>' +
        this.noteHtml() +
        '</div>';

      this.startLive();
      this.bind();
      this.paint();
    },

    noteHtml: function () {
      var d = bank() || {};
      var notice = (d.intro && d.intro.notice) || '本测试用于自我了解，不构成任何医学诊断或心理治疗建议。';
      return '<p class="exam-note">' + esc(notice) + '</p>';
    },

    bind: function () {
      var self = this;
      this.onClick = function (e) { self.handleClick(e); };
      this.onKey = function (e) { self.handleKey(e); };
      this.root.addEventListener('click', this.onClick);
      window.addEventListener('keydown', this.onKey);
    },

    /* ---------- 位置计算 ---------- */
    grandTotal: function () {
      var ph = phases();
      var n = 0;
      for (var i = 0; i < ph.length; i++) n += (ph[i].total || (ph[i].questions || []).length);
      return n;
    },

    offset: function (phaseNum) {
      var ph = phases();
      var n = 0;
      for (var i = 0; i < phaseNum && i < ph.length; i++) n += (ph[i].total || (ph[i].questions || []).length);
      return n;
    },

    answeredCount: function () {
      var s = cur();
      var a = s.answers || [];
      var n = 0;
      for (var i = 0; i < a.length; i++) n += (a[i] || []).length;
      return n;
    },

    pos: function () {
      var ph = phases();
      var s = cur();
      var p = parseInt(s.phase, 10);
      if (isNaN(p) || p < 0) p = 0;
      if (p > ph.length - 1) p = ph.length - 1;
      var phase = ph[p];
      var total = phase.total || (phase.questions || []).length;
      var i = parseInt(s.index, 10);
      if (isNaN(i) || i < 0) i = 0;
      if (i > total - 1) i = total - 1;
      return { phase: p, index: i, total: total };
    },

    /* ---------- 渲染 ---------- */
    paint: function () {
      if (!this.alive || !this.root) return;
      var ph = phases();
      if (!ph.length) return;
      var intro = this.introPhaseNow();
      if (intro > 0 && ph[intro]) {
        this.showIntro(intro);
        return;
      }
      this.showQuestion(this.pos());
    },

    /* 当前是否处于段间过渡页（用 Store.isPhaseIntro 判定，刷新也能恢复） */
    introPhaseNow: function () {
      var ph = phases();
      var s = cur();
      var p = parseInt(s.phase, 10);
      if (isNaN(p) || p <= 0 || p > ph.length - 1) return 0;
      if (this.dismissedPhase === p) return 0;
      if (window.Store && typeof window.Store.isPhaseIntro === 'function') {
        try { return window.Store.isPhaseIntro() ? p : 0; } catch (e) { return 0; }
      }
      var answered = (s.answers && s.answers[p]) || [];
      if (answered.length > 0) return 0;
      var idx = parseInt(s.index, 10);
      return (isNaN(idx) || idx === 0) ? p : 0;
    },

    setProgress: function (n, total, tag, showTag) {
      var c = this.root.querySelector('#examCur');
      var a = this.root.querySelector('#examAll');
      var f = this.root.querySelector('#examFill');
      var t = this.root.querySelector('#examTag');
      var track = this.root.querySelector('.exam-progress__track');
      if (c) c.textContent = String(n);
      if (a) a.textContent = String(total);
      if (f) f.style.width = Math.max(0, Math.min(100, (n / total) * 100)) + '%';
      if (track) {
        track.setAttribute('aria-valuenow', String(n));
        track.setAttribute('aria-valuemax', String(total));
        track.setAttribute('aria-valuetext', '已进行到第 ' + n + ' 题，共 ' + total + ' 题');
      }
      if (t) {
        if (showTag && tag) { t.hidden = false; t.textContent = tag; }
        else { t.hidden = true; t.textContent = ''; }
      }
    },

    showQuestion: function (p) {
      this.onIntro = false;
      var ph = phases();
      var phase = ph[p.phase];
      if (!phase) return;
      var q = (phase.questions || [])[p.index];
      if (!q) return;

      var s = cur();
      var answers = s.answers || [];
      var mine = (answers[p.phase] || [])[p.index];
      var picked = (typeof mine === 'number') ? mine : -1;

      var overall = this.offset(p.phase) + p.index + 1;
      var grand = this.grandTotal();
      this.setProgress(overall, grand, phase.label || '', p.phase > 0);

      var isFinalQ = p.phase === ph.length - 1 && p.index === (phase.total - 1);
      var canFinish = isFinalQ && (!!s.completed || picked >= 0);

      var dots = '';
      for (var i = 0; i < 5; i++) {
        dots += '<button type="button" class="exam-dot exam-dot--' + (i + 1) + (picked === i ? ' is-on' : '') +
          '" data-opt="' + i + '" aria-label="倾向程度 ' + (i + 1) + '">' +
          '<span class="exam-dot__ring"><span class="exam-dot__core" aria-hidden="true"></span></span></button>';
      }

      var body = this.root.querySelector('#examBody');
      if (!body) return;
      body.innerHTML = '<div class="exam-question">' +
        '<p class="exam-q">' + esc(q.q) + '</p>' +
        '<div class="exam-opts">' +
          '<button type="button" class="exam-opt exam-opt--a' + (picked >= 0 && picked <= 1 ? ' is-on' : '') + '" data-opt="0">' +
            '<span class="exam-opt__badge">A</span>' +
            '<span class="exam-opt__txt">' + esc(q.a) + '</span>' +
            '<span class="exam-opt__check" aria-hidden="true"></span>' +
          '</button>' +
          '<button type="button" class="exam-opt exam-opt--b' + (picked >= 3 ? ' is-on' : '') + '" data-opt="4">' +
            '<span class="exam-opt__badge">B</span>' +
            '<span class="exam-opt__txt">' + esc(q.b) + '</span>' +
            '<span class="exam-opt__check" aria-hidden="true"></span>' +
          '</button>' +
        '</div>' +
        '<div class="exam-scale" role="group" aria-label="选择倾向程度">' + dots + '</div>' +
        '<div class="exam-scale__ends" aria-hidden="true"><span>A</span><span>B</span></div>' +
        '</div>' +
        '<p class="exam-hint">凭第一反应选择就好<span class="exam-hint__kbd">，键盘 A / B 或 1~5 也能作答，← 返回上一题</span></p>' +
        '<div class="exam-tipcard exam-anim">' +
          '<p class="exam-tipcard__head">' + iconSvg('brain', 15) + '<span>MBTI 小知识</span></p>' +
          '<p class="exam-tipcard__txt">' + esc(TIPS[(overall - 1) % TIPS.length]) + '</p>' +
        '</div>';

      var node = body.querySelector('.exam-question');
      if (node) {
        node.classList.remove('exam-anim');
        void node.offsetWidth;
        node.classList.add('exam-anim');
      }

      var prev = this.root.querySelector('#examPrev');
      if (prev) prev.disabled = (p.phase === 0 && p.index === 0);
      var done = this.root.querySelector('#examDone');
      if (done) {
        done.hidden = !canFinish;
        done.setAttribute('aria-hidden', canFinish ? 'false' : 'true');
      }
      var foot = this.root.querySelector('.exam-foot');
      if (foot) foot.classList.remove('is-intro');
    },

    showIntro: function (phaseNum) {
      this.onIntro = true;
      var ph = phases();
      var phase = ph[phaseNum];
      if (!phase) return;
      var it = phase.intro || {};
      var answered = this.offset(phaseNum);
      var grand = this.grandTotal();
      this.setProgress(Math.max(answered, 1), grand, phase.label || phase.title || '', true);

      var body = this.root.querySelector('#examBody');
      if (!body) return;
      body.innerHTML = '<div class="exam-intro">' +
        '<div class="exam-intro__art">' + (it.art === 'scale' ? artScale() : artScene()) + '</div>' +
        '<h2 class="exam-intro__title">' + esc(it.title || phase.title || '') + '</h2>' +
        '<p class="exam-intro__desc">' + esc(it.desc || '') + '</p>' +
        '<button type="button" class="exam-intro__cta press" data-act="continue">' + esc(it.button || '好的，继续测试') + '</button>' +
        '<p class="exam-intro__meta">第 ' + (phaseNum + 1) + ' 段 · 共 ' + (phase.total || (phase.questions || []).length) + ' 题</p>' +
        '</div>';

      var node = body.querySelector('.exam-intro');
      if (node) {
        node.classList.remove('exam-anim');
        void node.offsetWidth;
        node.classList.add('exam-anim');
      }

      var prev = this.root.querySelector('#examPrev');
      if (prev) prev.disabled = false;
      var done = this.root.querySelector('#examDone');
      if (done) { done.hidden = true; done.setAttribute('aria-hidden', 'true'); }
      var foot = this.root.querySelector('.exam-foot');
      if (foot) foot.classList.add('is-intro');
    },

    /* ---------- 作答 ---------- */
    mark: function (v) {
      var body = this.root && this.root.querySelector('#examBody');
      if (!body) return;
      var dots = body.querySelectorAll('.exam-dot');
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('is-on', i === v);
      }
      var a = body.querySelector('.exam-opt--a');
      var b = body.querySelector('.exam-opt--b');
      if (a) a.classList.toggle('is-on', v <= 1);
      if (b) b.classList.toggle('is-on', v >= 3);
    },

    pick: function (v) {
      if (!this.alive || this.busy) return;
      if (typeof v !== 'number' || v < 0 || v > 4) return;
      if (this.onIntro) return;
      var ph = phases();
      var p = this.pos();
      var phase = ph[p.phase];
      if (!phase) return;

      this.busy = true;
      this.mark(v);
      if (window.UI && typeof window.UI.haptic === 'function') {
        try { window.UI.haptic(); } catch (e) { /* noop */ }
      }
      if (window.Store && typeof window.Store.answer === 'function') {
        try { window.Store.answer(v); } catch (err) {
          if (window.console && console.warn) console.warn('[exam] 记录答案失败', err);
        }
      }

      var self = this;
      this.advTimer = setTimeout(function () {
        if (!self.alive) return;
        self.paint();
      }, ADVANCE_MS);
      this.lockTimer = setTimeout(function () {
        self.busy = false;
      }, LOCK_MS);
    },

    goPrev: function () {
      if (!this.alive) return;
      if (this.onIntro) { this.prevStep(); return; }
      var p = this.pos();
      if (p.phase === 0 && p.index === 0) return;   // 仅全卷第一题禁用
      this.prevStep();
    },

    prevStep: function () {
      if (this.advTimer) { clearTimeout(this.advTimer); this.advTimer = 0; }
      if (this.lockTimer) { clearTimeout(this.lockTimer); this.lockTimer = 0; }
      this.busy = false;
      if (window.Store && typeof window.Store.prev === 'function') {
        try {
          // 末题完成态：Store.prev() 第一次只清除 completed，需要再退一步
          if (cur().completed) window.Store.prev();
          window.Store.prev();
        } catch (e) { /* noop */ }
      }
      this.paint();
    },

    continueTest: function () {
      if (!this.alive || !this.onIntro) return;
      var s = cur();
      var phaseNum = parseInt(s.phase, 10);
      if (isNaN(phaseNum) || phaseNum < 1) { this.paint(); return; }
      this.dismissedPhase = phaseNum;
      var ph = phases();
      if (phaseNum > 0 && ph[phaseNum]) {
        if (parseInt(s.index, 10) !== 0) {
          if (window.Store && typeof window.Store.set === 'function') {
            try { window.Store.set({ phase: phaseNum, index: 0 }); } catch (e) { /* noop */ }
          }
        }
      }
      this.paint();
    },

    startTest: function () {
      var s = cur();
      var gender = s.gender === 'm' ? 'm' : 'f';
      if (window.Store && typeof window.Store.startTest === 'function') {
        try { window.Store.startTest(gender); } catch (e) { /* noop */ }
      }
      this.render(this.root);
    },

    finish: function () {
      if (!this.alive) return;
      var ph = phases();
      if (!ph.length) return;
      var s = cur();
      var answers = s.answers || [];
      var lastPhase = ph.length - 1;
      var lastTotal = ph[lastPhase].total || (ph[lastPhase].questions || []).length;
      var lastAns = (answers[lastPhase] || [])[lastTotal - 1];
      var complete = (s.completed === true) ||
        (typeof lastAns === 'number' && this.answeredCount() >= this.grandTotal());
      if (!complete) {
        toast('请先完成全部题目');
        return;
      }
      this.busy = true;
      if (window.Store && typeof window.Store.finishTest === 'function') {
        try { window.Store.finishTest(); } catch (e) { /* noop */ }
      }
      goRoute('#/analyzing');
    },

    /* ---------- 事件 ---------- */
    handleClick: function (e) {
      if (!this.alive) return;
      var t = e.target;
      if (!t || typeof t.closest !== 'function') return;

      var actEl = t.closest('[data-act]');
      if (actEl) {
        var act = actEl.getAttribute('data-act');
        if (act === 'start') { this.startTest(); return; }
        if (act === 'continue') { this.continueTest(); return; }
      }
      var dot = t.closest('.exam-dot');
      if (dot) {
        this.pick(parseInt(dot.getAttribute('data-opt'), 10));
        return;
      }
      var opt = t.closest('.exam-opt');
      if (opt) {
        this.pick(parseInt(opt.getAttribute('data-opt'), 10));
        return;
      }
      if (t.closest('#examPrev')) { this.goPrev(); return; }
      if (t.closest('#examDone')) { this.finish(); return; }
    },

    handleKey: function (e) {
      if (!this.alive || !this.root) return;
      var tag = e.target && e.target.tagName;
      if (tag && /^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!this.root.querySelector('#examBody')) return;

      if (this.onIntro) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.continueTest();
        }
        return;
      }
      if (!cur().startedAt) return;

      var k = e.key;
      if (k === 'a' || k === 'A' || k === '1') { e.preventDefault(); this.pick(0); }
      else if (k === 'b' || k === 'B' || k === '5') { e.preventDefault(); this.pick(4); }
      else if (k === '2' || k === '3' || k === '4') { e.preventDefault(); this.pick(parseInt(k, 10) - 1); }
      else if (k === 'ArrowLeft') { e.preventDefault(); this.goPrev(); }
    }
  };

  window.Pages.exam = page;
})();
