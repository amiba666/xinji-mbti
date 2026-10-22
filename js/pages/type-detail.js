/*! 心迹测评 · 十六型人格图鉴（列表 + 详情） | window.Pages.typeDetail */
(function () {
  'use strict';

  var CODES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

  function esc(s) { return window.UI.escape(s == null ? '' : s); }
  function ic(name, size) { return window.UI.icon(name, size || 20); }
  function types() { return (window.DATA_TYPES && window.DATA_TYPES.types) || {}; }
  function groupList() { return (window.DATA_TYPES && window.DATA_TYPES.groups) || []; }

  function groupOf(key) {
    var list = groupList();
    for (var i = 0; i < list.length; i++) if (list[i].key === key) return list[i];
    return list[0] || { key: key, name: '人格', color: '#88619a', desc: '' };
  }

  function myCode() {
    var s = window.Store && window.Store.state;
    return (s && s.result && s.result.code) || '';
  }

  function hasReport() {
    var s = window.Store && window.Store.state;
    if (!s) return false;
    if (s.unlocked) return true;
    return !!(s.result && s.result.code);
  }

  function backFrom(root, fallback) {
    var btn = root.querySelector('[data-back]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (window.history.length > 1) window.Router.back();
      else window.Router.go(fallback || '#/');
    });
  }

  function bindMine(root) {
    var btn = root.querySelector('[data-mine]');
    if (!btn) return;
    btn.addEventListener('click', function () { window.Router.go('#/mine'); });
  }

  /* ------------------------------------------------------------------ *
   * 列表：#/types
   * ------------------------------------------------------------------ */
  function listHtml() {
    var all = types();
    var groups = groupList();
    var mine = myCode();

    var chips = '<button type="button" class="chip chip--brand chip--active tp-chip" data-group="all" role="tab" aria-selected="true">' +
      '全部<em>16</em></button>' + groups.map(function (g) {
        var count = CODES.filter(function (c) { return all[c] && all[c].group === g.key; }).length;
        return '<button type="button" class="chip tp-chip" data-group="' + esc(g.key) + '" role="tab" aria-selected="false" style="--tp-c:' + esc(g.color) + '">' +
          esc(g.name) + '<em>' + count + '</em></button>';
      }).join('');

    var cards = CODES.map(function (code, i) {
      var t = all[code];
      if (!t) return '';
      var g = groupOf(t.group);
      var isMine = mine === code;
      return '' +
        '<button type="button" class="tp-card' + (isMine ? ' is-mine' : '') + '" data-code="' + esc(code) + '" data-group="' + esc(t.group) + '" style="--tp-c:' + esc(g.color) + '" aria-label="' + esc(code + ' ' + t.name) + '">' +
          (isMine ? '<span class="tp-card__mine">你的类型</span>' : '') +
          '<span class="tp-card__code">' + esc(code) + '</span>' +
          '<span class="tp-card__name">' + esc(t.name) + '</span>' +
          '<span class="tp-card__en">' + esc(t.en) + '</span>' +
          '<span class="tp-card__tag">' + esc(t.tagline) + '</span>' +
          '<span class="tp-card__foot">' +
            '<span class="tp-card__rarity">' + esc(t.rarity) + '</span>' +
            '<span class="tp-card__go">' + ic('arrow', 14) + '</span>' +
          '</span>' +
        '</button>';
    }).join('');

    var groupStrips = groups.map(function (g) {
      return '<div class="tp-groupintro" data-group-intro="' + esc(g.key) + '" style="--tp-c:' + esc(g.color) + '">' +
        '<span class="tp-groupintro__dot"></span>' +
        '<div><b>' + esc(g.name) + '</b><p>' + esc(g.desc) + '</p></div>' +
      '</div>';
    }).join('');

    return '' +
      '<div class="page tp-page">' +
        '<div class="appbar tp-appbar">' +
          '<button type="button" class="appbar__back" data-back aria-label="返回">' + ic('back', 22) + '</button>' +
          '<div class="appbar__title">十六型人格图鉴</div>' +
          '<div class="appbar__right"><button type="button" class="appbar__action" data-mine aria-label="我的报告">' + ic('mine', 21) + '</button></div>' +
        '</div>' +

        '<header class="tp-hero">' +
          '<div class="tp-hero__eyebrow">16 PERSONALITIES · 心迹测评</div>' +
          '<h1 class="tp-hero__title">十六型人格图鉴</h1>' +
          '<p class="tp-hero__desc">' + esc((window.DATA_TYPES && window.DATA_TYPES.meta && window.DATA_TYPES.meta.desc) || '') + '</p>' +
          '<div class="tp-hero__stats">' +
            '<span><b>4</b>大族群</span><i></i><span><b>16</b>种类型</span><i></i><span><b>10</b>个报告板块</span>' +
          '</div>' +
        '</header>' +

        '<div class="tp-filterwrap">' +
          '<div class="tp-filter" role="tablist" aria-label="按族群筛选">' + chips + '</div>' +
        '</div>' +

        '<div class="tp-body">' +
          '<div class="tp-grid" data-grid>' + cards + '</div>' +
          '<div class="tp-empty hide" data-empty>' + window.UI.emptyState({ title: '这个族群还没有内容', desc: '换个筛选看看其他类型吧。' }) + '</div>' +

          '<div class="tp-groups" data-groups>' + groupStrips + '</div>' +

          '<section class="tp-cta">' +
            '<div class="tp-cta__txt">' +
              '<b>还不知道自己是哪一型？</b>' +
              '<p>用 42 道题，看看你的四维倾向与六项特质。</p>' +
            '</div>' +
            '<button type="button" class="btn btn--primary tp-cta__btn" data-start>开始测试</button>' +
          '</section>' +

          '<footer class="tp-foot">' +
            '<p>人格类型不是标签，而是一种理解自己的语言。同一类型的人，也会活出完全不同的样子。</p>' +
            '<p class="tp-foot__brand">心迹测评 · 16 Personalities</p>' +
          '</footer>' +
        '</div>' +
      '</div>';
  }

  function renderList(root) {
    root.innerHTML = listHtml();
    backFrom(root, '#/');
    bindMine(root);

    var grid = root.querySelector('[data-grid]');
    var emptyEl = root.querySelector('[data-empty]');
    var groupIntros = root.querySelectorAll('[data-group-intro]');
    var startBtn = root.querySelector('[data-start]');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        var st = window.Store.state;
        if (st.result && st.result.code) window.Router.go('#/report');
        else window.Router.go('#/');
      });
    }

    function applyFilter(key) {
      if (!grid) return;
      var shown = 0;
      var cards = grid.querySelectorAll('.tp-card');
      for (var i = 0; i < cards.length; i++) {
        var on = key === 'all' || cards[i].getAttribute('data-group') === key;
        cards[i].classList.toggle('is-hide', !on);
        if (on) {
          shown++;
          cards[i].classList.remove('tp-card--in');
          void cards[i].offsetWidth;
          cards[i].classList.add('tp-card--in');
        }
      }
      if (emptyEl) emptyEl.classList.toggle('hide', shown > 0);
      for (var j = 0; j < groupIntros.length; j++) {
        groupIntros[j].classList.toggle('hide', !(key === 'all' || groupIntros[j].getAttribute('data-group-intro') === key));
      }
    }

    var chips = root.querySelectorAll('.tp-chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function () {
        var key = this.getAttribute('data-group');
        for (var k = 0; k < chips.length; k++) {
          var active = chips[k] === this;
          chips[k].classList.toggle('chip--active', active);
          chips[k].setAttribute('aria-selected', active ? 'true' : 'false');
        }
        window.UI.haptic(5);
        applyFilter(key);
      });
    }

    grid.addEventListener('click', function (e) {
      var card = e.target && e.target.closest ? e.target.closest('[data-code]') : null;
      if (!card) return;
      window.Router.go('#/type/' + encodeURIComponent(card.getAttribute('data-code')));
    });
  }

  /* ------------------------------------------------------------------ *
   * 详情：#/type/:code
   * ------------------------------------------------------------------ */
  function detailHtml(code, t) {
    var g = groupOf(t.group);
    var all = types();
    var mine = myCode();
    var isMine = mine === code;

    function strengths() {
      var icons = ['sparkle', 'target', 'compass', 'flame'];
      return (t.strengths || []).map(function (s, i) {
        return '<article class="tp-item tp-item--adv">' +
          '<span class="tp-item__ic">' + ic(icons[i % icons.length], 18) + '</span>' +
          '<div class="tp-item__txt"><h3>' + esc(s.t) + '</h3><p>' + esc(s.d) + '</p></div>' +
        '</article>';
      }).join('');
    }
    function watches() {
      var icons = ['info', 'moon', 'question'];
      return (t.blindspots || []).map(function (s, i) {
        return '<article class="tp-item tp-item--watch">' +
          '<span class="tp-item__ic">' + ic(icons[i % icons.length], 18) + '</span>' +
          '<div class="tp-item__txt"><h3>' + esc(s.t) + '</h3><p>' + esc(s.d) + '</p></div>' +
        '</article>';
      }).join('');
    }
    function matchBadges(codes, kind) {
      return (codes || []).map(function (c) {
        var other = all[c] || {};
        return '<button type="button" class="tp-badge tp-badge--' + kind + '" data-jump="' + esc(c) + '">' +
          '<b>' + esc(c) + '</b><span>' + esc(other.name || '') + '</span>' + ic('chevron-right', 13) +
        '</button>';
      }).join('');
    }

    var keywords = (t.keywords || []).map(function (k) { return '<span class="tp-kw">' + esc(k) + '</span>'; }).join('');
    var roles = ((t.career && t.career.roles) || []).map(function (r) { return '<span class="tp-role">' + esc(r) + '</span>'; }).join('');

    return '' +
      '<div class="page tp-page tp-page--detail" style="--tp-c:' + esc(g.color) + '">' +
        '<div class="appbar tp-appbar tp-appbar--float">' +
          '<button type="button" class="appbar__back" data-back aria-label="返回">' + ic('back', 22) + '</button>' +
          '<div class="appbar__title">' + esc(code + ' · ' + t.name) + '</div>' +
          '<div class="appbar__right"><button type="button" class="appbar__action" data-mine aria-label="我的报告">' + ic('mine', 21) + '</button></div>' +
        '</div>' +

        '<header class="tp-detail-hero">' +
          '<span class="tp-detail-hero__orb" aria-hidden="true"></span>' +
          '<div class="tp-detail-hero__top">' +
            '<span class="tp-detail-hero__group"><i></i>' + esc(g.name) + '组</span>' +
            '<span class="tp-detail-hero__rarity">人群占比 ' + esc(t.rarity) + '</span>' +
          '</div>' +
          '<div class="tp-detail-hero__code">' + esc(code) + '</div>' +
          '<h1 class="tp-detail-hero__name">' + esc(t.name) + '<span>' + esc(t.en) + '</span></h1>' +
          '<p class="tp-detail-hero__tagline">' + esc(t.tagline) + '</p>' +
          '<div class="tp-detail-hero__kw">' + keywords + '</div>' +
          (isMine ? '<div class="tp-detail-hero__mine">' + ic('check', 13) + '这正是你的类型</div>' : '') +
        '</header>' +

        '<main class="tp-detail-body">' +
          '<section class="tp-sec">' +
            '<div class="card card--pad tp-cardbox">' +
              '<div class="tp-sec__label">' + ic('quote', 15) + '性格概述</div>' +
              '<p class="tp-para">' + esc(t.summary) + '</p>' +
              '<p class="tp-motto">「' + esc(t.motto) + '」</p>' +
            '</div>' +
          '</section>' +

          '<section class="tp-sec">' +
            '<div class="tp-sec__label">' + ic('sparkle', 15) + '核心优势<em>4 项</em></div>' +
            '<div class="tp-list">' + strengths() + '</div>' +
            '<div class="tp-sec__label">' + ic('shield', 15) + '潜在盲点<em>3 项</em></div>' +
            '<div class="tp-list">' + watches() + '</div>' +
          '</section>' +

          '<section class="tp-sec">' +
            '<div class="card card--pad tp-cardbox">' +
              '<div class="tp-sec__label">' + ic('heart', 15) + '爱情与亲密关系</div>' +
              '<p class="tp-quote">' + esc((t.love && t.love.lead) || '') + '</p>' +
              '<p class="tp-para">' + esc((t.love && t.love.desc) || '') + '</p>' +
              '<div class="tp-divider"></div>' +
              '<div class="tp-sec__label">' + ic('briefcase', 15) + '职业与发展</div>' +
              '<p class="tp-quote">' + esc((t.career && t.career.lead) || '') + '</p>' +
              '<p class="tp-para">' + esc((t.career && t.career.desc) || '') + '</p>' +
              (roles ? '<div class="tp-roles">' + roles + '</div>' : '') +
            '</div>' +
          '</section>' +

          '<section class="tp-sec">' +
            '<div class="tp-sec__label">' + ic('users', 15) + '人际与社交</div>' +
            '<div class="card card--pad tp-cardbox"><p class="tp-para">' + esc((t.social && t.social.desc) || '') + '</p></div>' +
          '</section>' +

          '<section class="tp-sec">' +
            '<div class="tp-sec__label">' + ic('share', 15) + '类型匹配</div>' +
            '<div class="card card--pad tp-cardbox tp-matchbox">' +
              '<div class="tp-match__row">' +
                '<span class="tp-match__k">' + ic('heart', 14) + '最佳匹配</span>' +
                '<div class="tp-match__list">' + matchBadges(t.match && t.match.best, 'best') + '</div>' +
              '</div>' +
              '<div class="tp-match__row">' +
                '<span class="tp-match__k">' + ic('info', 14) + '需要留意</span>' +
                '<div class="tp-match__list">' + matchBadges(t.match && t.match.challenge, 'watch') + '</div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          '<section class="tp-sec tp-sec--cta">' +
            '<div class="tp-detail-cta">' +
              (mine
                ? '<button type="button" class="btn btn--primary btn--lg btn--block" data-report>' + ic('book', 18) + '查看我的完整报告</button>'
                : '<button type="button" class="btn btn--primary btn--lg btn--block" data-test>' + ic('compass', 18) + '测一测我是哪一型</button>') +
              '<div class="tp-detail-cta__row">' +
                (mine
                  ? '<button type="button" class="btn btn--ghost btn--block" data-retest>再测一次</button>'
                  : '<button type="button" class="btn btn--ghost btn--block" data-all>查看全部类型</button>') +
              '</div>' +
            '</div>' +
            '<footer class="tp-foot">' +
              '<p>内容基于 ' + esc(code) + ' 类型的普遍倾向整理，仅供自我探索参考，请勿用于评价他人。</p>' +
              '<p class="tp-foot__brand">心迹测评 · 16 Personalities</p>' +
            '</footer>' +
          '</section>' +
        '</main>' +
      '</div>';
  }

  function renderDetail(root, code) {
    var t = types()[String(code || '').toUpperCase()];
    var upper = String(code || '').toUpperCase();
    if (!t) {
      root.innerHTML =
        '<div class="page tp-page">' +
          '<div class="appbar tp-appbar">' +
            '<button type="button" class="appbar__back" data-back aria-label="返回">' + ic('back', 22) + '</button>' +
            '<div class="appbar__title">类型不存在</div>' +
            '<div class="appbar__right"></div>' +
          '</div>' +
          '<div class="tp-sec">' + window.UI.emptyState({
            title: '没有找到「' + esc(upper || '未知') + '」这个类型',
            desc: '可以回到图鉴，看看十六种人格里哪一种更像你。',
            action: '浏览十六型人格图鉴'
          }) + '</div>' +
        '</div>';
      backFrom(root, '#/types');
      var b = root.querySelector('.empty .btn');
      if (b) b.addEventListener('click', function () { window.Router.go('#/types'); });
      return;
    }

    root.innerHTML = detailHtml(upper, t);
    backFrom(root, '#/types');
    bindMine(root);

    var pageEl = root.querySelector('.tp-page--detail') || root;
    pageEl.addEventListener('click', function (e) {
      var t2 = e.target;
      if (!t2 || !t2.closest) return;
      var jump = t2.closest('[data-jump]');
      if (jump) {
        window.Router.go('#/type/' + encodeURIComponent(jump.getAttribute('data-jump')));
        return;
      }
      if (t2.closest('[data-report]')) {
        window.Router.go('#/report');
        return;
      }
      if (t2.closest('[data-all]')) {
        window.Router.go('#/types');
        return;
      }
      if (t2.closest('[data-retest]')) {
        window.Router.go('#/');
        return;
      }
      if (t2.closest('[data-test]')) {
        var st = window.Store.state;
        if (st.result && st.result.code) {
          window.Router.go(st.unlocked ? '#/report' : '#/unlock');
        } else {
          window.Router.go('#/');
        }
      }
    });
  }

  window.Pages = window.Pages || {};
  window.Pages.typeDetail = {
    title: '十六型人格图鉴 · 心迹测评',
    theme: 'platform',
    tabbar: null,

    render: function (root, params) {
      var code = params && params[0];
      if (code) {
        this.title = '十六型人格图鉴 · 心迹测评';
        document.title = String(code).toUpperCase() + ' 型人格 · 心迹测评';
        renderDetail(root, code);
      } else {
        this.title = '十六型人格图鉴 · 心迹测评';
        document.title = this.title;
        renderList(root);
      }
    },

    destroy: function () {}
  };
})();
