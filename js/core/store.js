/* ==========================================================================
   Store · 全局状态 + localStorage 持久化
   只读约定见 BUILD-SPEC §2。页面不要直接读写 localStorage。
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'xinji_state_v1';
  var subs = [];

  function defaults() {
    return {
      gender: 'f',                 // 'f' | 'm'
      agreed: false,               // 是否已勾选用户协议
      phase: 0,
      index: 0,
      answers: [[], [], []],       // answers[phase][qIndex] = 0..4
      completed: false,
      result: null,
      unlocked: false,
      startedAt: 0,
      finishedAt: 0,
      user: { nickname: '心迹用户', joinedAt: Date.now() },
      reports: [],
      orders: [],
      activeReportId: null,
      vip: false
    };
  }

  var state = defaults();

  /* ---------- 持久化 ---------- */
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 隐私模式忽略 */ }
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return;
      var base = defaults();
      // 只接受已知字段，避免旧数据污染
      Object.keys(base).forEach(function (k) {
        if (obj[k] !== undefined && obj[k] !== null) base[k] = obj[k];
      });
      if (!Array.isArray(base.answers) || base.answers.length !== 3) base.answers = [[], [], []];
      if (!Array.isArray(base.reports)) base.reports = [];
      if (!Array.isArray(base.orders)) base.orders = [];
      if (!base.user || typeof base.user !== 'object') base.user = defaults().user;
      replaceState(base);
    } catch (e) { /* 损坏则用默认值 */ }
  }

  function replaceState(next) {
    // 保持 window.Store.state 的引用恒定，避免页面持有旧引用
    Object.keys(state).forEach(function (k) { delete state[k]; });
    Object.keys(next).forEach(function (k) { state[k] = next[k]; });
  }

  function emit(patch) {
    for (var i = 0; i < subs.length; i++) {
      try { subs[i](state, patch || {}); } catch (e) { console.error('[Store listener]', e); }
    }
    try {
      document.dispatchEvent(new CustomEvent('store:change', { detail: { state: state, patch: patch || {} } }));
    } catch (e) {}
  }

  function set(patch) {
    if (!patch) return state;
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    save();
    emit(patch);
    return state;
  }

  /* ---------- 题库辅助 ---------- */
  function phases() {
    return (window.DATA_QUESTIONS && window.DATA_QUESTIONS.phases) || [];
  }
  function phaseAt(p) { return phases()[p] || null; }

  function startTest(gender) {
    state.gender = gender === 'm' ? 'm' : 'f';
    state.phase = 0;
    state.index = 0;
    state.answers = [[], [], []];
    state.completed = false;
    state.result = null;
    state.unlocked = false;
    state.activeReportId = null;
    state.startedAt = Date.now();
    state.finishedAt = 0;
    save();
    emit({ startedAt: state.startedAt });
    return state;
  }

  function currentQuestion() {
    var ph = phaseAt(state.phase);
    if (!ph || !ph.questions) return null;
    var total = ph.questions.length;
    var idx = Math.min(Math.max(0, state.index), total - 1);
    var q = ph.questions[idx];
    if (!q) return null;
    return {
      q: q.q, a: q.a, b: q.b, dim: q.dim,
      phase: state.phase,
      index: idx,
      total: total,
      phaseLabel: ph.label || '',
      phaseTitle: ph.title || '',
      phaseIntro: ph.intro || null,
      overallTotal: phases().reduce(function (n, p2) { return n + p2.questions.length; }, 0),
      overallIndex: phases().slice(0, state.phase).reduce(function (n, p2) { return n + p2.questions.length; }, 0) + idx
    };
  }

  function isPhaseIntro() {
    var ph = phaseAt(state.phase);
    if (!ph || !ph.intro) return false;
    if (state.answers[state.phase] && state.answers[state.phase].length > 0) return false;
    if (state.index !== 0) return false;
    // 第一段不显示过渡页
    return state.phase > 0;
  }

  function answer(optIndex) {
    var ph = phaseAt(state.phase);
    if (!ph) return;
    var o = Math.max(0, Math.min(4, optIndex | 0));
    state.answers[state.phase][state.index] = o;
    state.startedAt = state.startedAt || Date.now();
    var lastPhase = state.phase === phases().length - 1;
    var lastQ = state.index >= ph.questions.length - 1;
    if (!lastQ) {
      state.index += 1;
    } else if (!lastPhase) {
      state.phase += 1;
      state.index = 0;
    } else {
      state.completed = true;
    }
    save();
    emit({ answered: { phase: state.phase, index: state.index } });
  }

  function prev() {
    if (state.completed) { state.completed = false; save(); emit({ prev: true }); return; }
    if (state.index > 0) { state.index -= 1; }
    else if (state.phase > 0) {
      state.phase -= 1;
      var ph = phaseAt(state.phase);
      state.index = Math.max(0, (ph ? ph.questions.length : 1) - 1);
      // 回到上一段最后一题时，取消其 completed
    }
    save();
    emit({ prev: true });
  }

  function totalAnswered() {
    var n = 0;
    state.answers.forEach(function (arr) { n += arr.filter(function (v) { return typeof v === 'number'; }).length; });
    return n;
  }

  function expectedTotal() {
    return phases().reduce(function (n, p) { return n + (p.questions ? p.questions.length : 0); }, 0);
  }

  // 严格完成判定：所有段的每一题都有答案
  function isComplete() {
    var ps = phases();
    if (!ps.length) return false;
    for (var pi = 0; pi < ps.length; pi++) {
      var qs = ps[pi].questions || [];
      var arr = state.answers[pi] || [];
      for (var qi = 0; qi < qs.length; qi++) {
        if (typeof arr[qi] !== 'number') return false;
      }
    }
    return true;
  }

  function hasTest() {
    return !!state.startedAt && totalAnswered() > 0;
  }

  /* ---------- 计分 ---------- */
  var DIMS = [
    { key: 'EI', left: 'E', right: 'I', name: '能量来源', leftName: '外向', rightName: '内向' },
    { key: 'SN', left: 'S', right: 'N', name: '信息获取', leftName: '实感', rightName: '直觉' },
    { key: 'TF', left: 'T', right: 'F', name: '决策方式', leftName: '思考', rightName: '情感' },
    { key: 'JP', left: 'J', right: 'P', name: '生活态度', leftName: '判断', rightName: '感知' }
  ];

  function computeResult() {
    if (state.result) return state.result;
    var buckets = {};
    DIMS.forEach(function (d) { buckets[d.key] = { left: 0, right: 0, count: 0 }; });
    var counted = 0;
    phases().forEach(function (ph, pi) {
      ph.questions.forEach(function (q, qi) {
        var v = state.answers[pi] ? state.answers[pi][qi] : undefined;
        if (typeof v !== 'number') return;
        var b = buckets[q.dim] || buckets.EI;
        // v: 0 最 A / 4 最 B。A 侧得正分，B 侧得负分，中间 2 为 0
        var aWeight = 2 - v;           // +2 .. -2
        if (aWeight >= 0) b.left += aWeight; else b.right += -aWeight;
        b.count += 1;
        counted += 1;
      });
    });

    var dims = DIMS.map(function (d) {
      var b = buckets[d.key];
      var pct = 50;
      if (b.count > 0) {
        var total = b.left + b.right;
        pct = total === 0 ? 50 : Math.round((b.left / total) * 100);
      }
      pct = Math.max(2, Math.min(98, pct));
      return {
        key: d.key, left: d.left, right: d.right,
        leftName: d.leftName, rightName: d.rightName, name: d.name,
        leftPct: pct, rightPct: 100 - pct
      };
    });

    var code = dims.map(function (d) { return d.leftPct >= 50 ? d.left : d.right; }).join('');
    var typeInfo = (window.DATA_TYPES && window.DATA_TYPES.types && window.DATA_TYPES.types[code]) || {};
    var byKey = {};
    dims.forEach(function (d) { byKey[d.key] = d; });

    function at(key, side) {
      var d = byKey[key];
      if (!d) return 50;
      return side === 'left' ? d.leftPct : d.rightPct;
    }
    var traits = [
      { name: '社交能量', value: at('EI', 'left') },
      { name: '探索欲', value: at('SN', 'right') },
      { name: '共情力', value: at('TF', 'right') },
      { name: '计划性', value: at('JP', 'left') },
      { name: '适应力', value: at('JP', 'right') },
      { name: '专注力', value: Math.max(18, Math.min(96, Math.round(100 - at('SN', 'right') * 0.55 - at('JP', 'right') * 0.35))) }
    ];

    var result = {
      code: code,
      name: typeInfo.name || code,
      en: typeInfo.en || code,
      group: typeInfo.group || 'diplomat',
      rarity: typeInfo.rarity || '4.0%',
      tagline: typeInfo.tagline || '',
      keywords: typeInfo.keywords || [],
      dims: dims,
      traits: traits,
      answered: counted,
      gender: state.gender,
      ts: Date.now()
    };
    state.result = result;
    save();
    emit({ result: result });
    return result;
  }

  function finishTest() {
    if (!state.startedAt) return null;
    // 硬校验：必须答完所有题目，防止部分作答绕过漏斗生成极端结果
    if (!isComplete()) return null;
    state.finishedAt = Date.now();
    state.completed = true;
    var r = computeResult();
    save();
    return r;
  }

  function unlockReport(free) {
    if (!isComplete()) return false;
    var r = state.result || computeResult();
    if (!r) return false;
    state.unlocked = true;
    var now = Date.now();
    var id = 'R' + now.toString(36).toUpperCase();
    var report = {
      id: id, code: r.code, name: r.name, en: r.en, rarity: r.rarity,
      tagline: r.tagline, keywords: r.keywords || [], gender: state.gender, ts: now, unlocked: true,
      answered: r.answered || totalAnswered(),
      dims: r.dims, traits: r.traits
    };
    state.reports = [report].concat(state.reports || []).slice(0, 30);
    if (!free) {
    state.orders = [{ id: 'XJ' + now.toString(36).toUpperCase(), title: 'MBTI 人格测试 · 完整报告', amount: 9.9, ts: now, status: 'paid', kind: 'report' }].concat(state.orders || []);
    }
    state.activeReportId = id;
    save();
    emit({ unlocked: true });
    return true;
  }

  function openReport(id) {
    state.activeReportId = id || null;
    save();
    emit({ activeReportId: state.activeReportId });
  }

  function currentReport() {
    if (state.activeReportId) {
      var found = (state.reports || []).find(function (r) { return r.id === state.activeReportId; });
      if (found) return found;
    }
    return state.result;
  }

  function myReports() {
    return (state.reports || []).slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }

  function addOrder(order) {
    state.orders = [order].concat(state.orders || []);
    save();
    emit({ orders: state.orders });
  }
  function setVip(on) {
    state.vip = !!on;
    save();
    emit({ vip: state.vip });
  }
  function addReport(rec) {
    state.reports = [rec].concat(state.reports || []);
    save();
    emit({ reports: state.reports });
  }

  function reset(keepUser) {
    var user = state.user;
    var next = defaults();
    if (keepUser !== false) next.user = user || defaults().user;
    replaceState(next);
    save();
    emit({ reset: true });
  }

  function on(fn) { if (typeof fn === 'function' && subs.indexOf(fn) < 0) subs.push(fn); }
  function off(fn) { var i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }

  window.Store = {
    state: state,
    DIMS: DIMS,
    init: load,
    save: save,
    get: function () { return state; },
    set: set,
    reset: reset,
    on: on,
    off: off,
    startTest: startTest,
    answer: answer,
    prev: prev,
    currentQuestion: currentQuestion,
    isPhaseIntro: isPhaseIntro,
    totalAnswered: totalAnswered,
    expectedTotal: expectedTotal,
    isComplete: isComplete,
    hasTest: hasTest,
    computeResult: computeResult,
    finishTest: finishTest,
    unlockReport: unlockReport,
    openReport: openReport,
    currentReport: currentReport,
    myReports: myReports,
    addReport: addReport,
    addOrder: addOrder,
    setVip: setVip
  };
})();
