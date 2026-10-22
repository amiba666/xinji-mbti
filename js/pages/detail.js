/* ============================================================
 * 心迹测评 · 测评详情（#/detail/:id）
 * 大封面 + 数据 + 介绍 + 你将获得 + 用户评价 + 吸底 CTA
 * ============================================================ */
(function () {
  'use strict';

  function esc(v) {
    if (window.UI && typeof UI.escape === 'function') return UI.escape(v == null ? '' : v);
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtNum(n) {
    if (window.UI && typeof UI.fmtNum === 'function') return UI.fmtNum(n);
    n = Number(n) || 0;
    if (n >= 10000) {
      var v = n / 10000;
      return (v >= 100 ? Math.round(v) : Math.round(v * 10) / 10) + 'w';
    }
    return String(n);
  }

  function priceText(p) {
    var n = Number(p);
    if (!isFinite(n) || n <= 0) return '免费';
    return String(Math.round(n * 100) / 100);
  }

  function priceNum(p) {
    var n = Number(p);
    return isFinite(n) ? n : 0;
  }

  function plIcon(name, size, color) {
    if (window.PL_ICON) return window.PL_ICON(name, size, color);
    if (window.UI && typeof UI.icon === 'function') return UI.icon(name, size || 20, color || 'currentColor');
    return '';
  }

  function glyph(item, size) {
    if (window.PL_GLYPH) return window.PL_GLYPH(item, size);
    return '<b class="pl-glyph-text">' + esc(String((item && item.title) || '心').charAt(0)) + '</b>';
  }

  function coverStyle(item) {
    var t = item && item.theme;
    if (t && t.length >= 2) return ' style="--cover-1:' + esc(t[0]) + ';--cover-2:' + esc(t[1]) + '"';
    return '';
  }

  function allProducts() {
    var src = (window.App && App.PRODUCTS) || window.DATA_PRODUCTS || null;
    return (src && src.items) || [];
  }

  function findItem(id) {
    if (id == null) return null;
    var key = String(id).toLowerCase();
    var list = allProducts();
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id).toLowerCase() === key) return list[i];
    }
    return null;
  }

  function catTone(item) {
    var raw = [item.cat || '', item.title || '', item.sub || ''].concat(item.tags || []).join(' ');
    if (/爱情|婚恋|恋爱|情感|亲密/.test(raw)) return 'love';
    if (/心理|情绪|焦虑|抑郁|压力|睡眠/.test(raw)) return 'mind';
    if (/职场|职业|工作|人际|沟通/.test(raw)) return 'career';
    if (/家庭|亲子|原生|父母|婚姻/.test(raw)) return 'family';
    if (/能力|智力|潜质|天赋|优势/.test(raw)) return 'ability';
    if (/价值|三观|意义/.test(raw)) return 'value';
    if (/人格|性格|MBTI|内向|外向/.test(raw)) return 'personality';
    if (/免费/.test(raw)) return 'free';
    return 'default';
  }

  var CAT_DESC = {
    love: '亲密关系里的很多困惑，往往不是「爱不爱」，而是我们如何表达需要、如何处理分歧。这份测评从依恋风格、沟通方式与关系边界三个角度出发，帮你看清自己在关系中的惯性反应，也看见可以调整的空间。',
    mind: '情绪不是需要被消灭的问题，而是身体发来的信号。这份测评会陪你梳理近期的压力来源、情绪波动模式，以及真正对你有效的自我照顾方式。没有评判，只有更清晰的认识。',
    personality: '人格不是一张贴在身上的标签，而是一套你习惯使用的「应对世界的工具」。这份测评从四个维度拆解你的偏好组合，给出更立体的描述与可落地的成长建议。',
    career: '工作里的疲惫，有时来自能力不匹配，有时来自价值感缺失。这份测评从兴趣、优势与协作风格出发，帮你梳理更适合自己的方向，以及下一步可以尝试的小行动。',
    family: '原生家庭留下的影响，会悄悄写进我们成年后的相处方式。这份测评不评判过去，只帮你看见模式如何形成，并找到更自由的回应方式。',
    ability: '能力不是单一分数。这份测评从思维、执行、学习与创造四个层面描绘你的能力组合，指出可以进一步放大的长板，也提醒容易消耗你的场景。',
    value: '价值观决定了你在关键时刻如何选择。这份测评帮助你厘清真正重要的东西，减少内耗，让决定更接近你想要的自己。',
    free: '这是一份轻量的自我探索测评，用较短的题目捕捉你此刻的状态与偏好，适合第一次接触心理测评的你。',
    default: '这份测评由心迹测评团队原创编制，题目贴近日常情境，结果以可读的报告呈现，帮助你把模糊的「感觉」翻译成可以行动的线索。'
  };

  var GAINS = [
    { ico: 'check', title: '完整测评报告', desc: '维度倾向 + 特质解读，一次性看清' },
    { ico: 'star', title: '专属成长建议', desc: '结合你的结果，给出可执行的小行动' },
    { ico: 'sparkle', title: '深度类型解析', desc: '优势、盲点与相处方式，拒绝贴标签' },
    { ico: 'clock', title: '随时回看', desc: '报告保存在「我的报告」永久可查' }
  ];

  var REVIEWS = [
    { nick: '晚风不晚', text: '题目不拖沓，做完大概几分钟，结果比我想象的更贴近日常状态。最有共鸣的是关于「需要独处充电」的那段。', days: 3, stars: 5 },
    { nick: '橘子汽水', text: '不是那种套模板的结论，报告里有几处描述很具体，我截图发给了朋友，她看完说也想去测一次。', days: 8, stars: 5 },
    { nick: '山止川行', text: '本来只是随手点开，结果认真答完了。建议部分没有说教感，给的两三个小练习我准备这周试试。', days: 14, stars: 4 },
    { nick: '一颗青柠', text: '界面舒服，题目用词很日常，不会让人有被审视的感觉。结果页的维度百分比做得很直观。', days: 21, stars: 5 },
    { nick: '雾岛听风', text: '最近状态有点乱，做完之后心里反而松了一口气。原来那些反应是可以被描述、被理解的。', days: 26, stars: 5 },
    { nick: '木木夕', text: '拉上室友一起做的，我们俩结果完全不一样，对照着看彼此的差异特别有意思。', days: 31, stars: 4 }
  ];

  function hash(str) {
    var h = 0;
    str = String(str || 'xinji');
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function pickReviews(item) {
    var h = hash(item.id + item.title);
    var out = [];
    for (var i = 0; i < 3; i++) out.push(REVIEWS[(h + i * 2) % REVIEWS.length]);
    return out;
  }

  function stars(n) {
    var svg = '';
    for (var i = 0; i < 5; i++) {
      var filled = i < n;
      svg += '<svg width="12" height="12" viewBox="0 0 24 24" fill="' + (filled ? 'currentColor' : 'none') +
        '" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.6l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.9-5.3 2.9 1-6L3.4 9.9l6-.9z"/></svg>';
    }
    return svg;
  }

  function dateText(days) {
    var ts = Date.now() - days * 86400000;
    if (window.UI && typeof UI.fmtDate === 'function') return UI.fmtDate(ts);
    return days + ' 天前';
  }

  function back() {
    if (window.Router) {
      if (window.history && history.length > 1) Router.back();
      else Router.go('#/category');
    }
  }

  function copyByExecCommand(url) {
    var ta = null;
    try {
      ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', 'readonly');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (err) {
      if (ta && ta.parentNode) ta.parentNode.removeChild(ta);
      return false;
    }
  }

  function share() {
    var url = window.location.href;
    var done = function (ok) {
      if (!window.UI) return;
      if (ok) UI.toast('链接已复制，分享给朋友吧', 'success');
      else UI.toast('复制失败，可长按地址栏复制页面链接', 'info');
    };
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(copyByExecCommand(url)); });
      return;
    }
    done(copyByExecCommand(url));
  }

  function renderEmpty(root) {
    root.innerHTML =
      '<div class="page det-page det-page--empty">' +
      '<header class="det-simplebar">' +
      '<button type="button" class="det-nav__btn det-nav__btn--dark" data-act="back" aria-label="返回">' + plIcon('back', 20, 'currentColor') + '</button>' +
      '<span class="det-simplebar__title">测评详情</span>' +
      '<span class="det-simplebar__hold"></span>' +
      '</header>' +
      '<div class="pl-empty">' +
      '<span class="pl-empty__art">' + plIcon('search', 28, 'currentColor') + '</span>' +
      '<p class="pl-empty__title">这份测评不存在或已下架</p>' +
      '<p class="pl-empty__sub">去分类页看看其他测评吧</p>' +
      '<button type="button" class="pl-empty__btn" data-go="#/category">返回分类</button>' +
      '</div>' +
      '</div>';

    var page = root.querySelector('.det-page--empty');
    page.addEventListener('click', function (e) {
      var t = e.target;
      var backEl = t && t.closest ? t.closest('[data-act="back"]') : null;
      if (backEl) { e.preventDefault(); back(); return; }
      var goEl = t && t.closest ? t.closest('[data-go]') : null;
      if (goEl) { e.preventDefault(); if (window.Router) Router.go(goEl.getAttribute('data-go')); }
    });
  }

  function render(root, params) {
    var id = '';
    if (params && params.length) id = params[0];
    else if (typeof params === 'string') id = params;
    if (!id && window.Router && Router.current) {
      var cur = Router.current();
      id = (cur && cur.params && cur.params[0]) || (cur && cur.query && cur.query.id) || '';
    }
    var item = findItem(id);
    if (!item) { renderEmpty(root); return; }

    var tone = catTone(item);
    var price = priceText(item.price);
    var origin = (price !== '免费' && Number(item.origin) > Number(item.price) && Number(item.origin) > 0)
      ? '<span class="det-cta__origin">¥' + esc(String(Math.round(Number(item.origin) * 100) / 100)) + '</span>' : '';
    var reviews = pickReviews(item);
    var badges = '';
    if (item.vip) badges += '<span class="det-hero__badge det-hero__badge--vip">VIP 专享</span>';
    if (item.hot) badges += '<span class="det-hero__badge det-hero__badge--hot">HOT 热卖</span>';
    var tags = (item.tags || []).map(function (t) {
      return '<span class="det-hero__tag">' + esc(t) + '</span>';
    }).join('');
    var desc = item.desc || CAT_DESC[tone] || CAT_DESC.default;
    var audience = item.audience
      ? '<p class="det-intro__audience"><b>适合人群</b>' + esc(item.audience) + '</p>' : '';

    var reviewsHtml = reviews.map(function (r, i) {
      return '<article class="det-review">' +
        '<span class="det-review__avatar det-review__avatar--' + (i % 3 + 1) + '">' + esc(r.nick.charAt(0)) + '</span>' +
        '<div class="det-review__body">' +
        '<div class="det-review__head"><b>' + esc(r.nick) + '</b><span class="det-review__tested">已测</span>' +
        '<span class="det-review__stars">' + stars(r.stars) + '</span></div>' +
        '<p class="det-review__text">' + esc(r.text) + '</p>' +
        '<span class="det-review__date">' + esc(dateText(r.days)) + '</span>' +
        '</div>' +
        '</article>';
    }).join('');

    var gainsHtml = GAINS.map(function (g, gi) {
      var gainDesc = (item.youGet && item.youGet[gi]) ? item.youGet[gi] : g.desc;
      return '<div class="det-gain">' +
        '<span class="det-gain__ico">' + plIcon(g.ico, 19, 'currentColor') + '</span>' +
        '<b>' + esc(g.title) + '</b><span>' + esc(gainDesc) + '</span></div>';
    }).join('');

    root.innerHTML =
      '<div class="page det-page det-page--cta">' +
      '<header class="det-hero"' + coverStyle(item) + '>' +
      '<div class="det-hero__art" aria-hidden="true">' +
      '<span></span><span></span><span></span>' +
      '</div>' +
      '<div class="det-nav">' +
      '<button type="button" class="det-nav__btn" data-act="back" aria-label="返回">' + plIcon('back', 20, 'currentColor') + '</button>' +
      '<span class="det-nav__title">测评详情</span>' +
      '<button type="button" class="det-nav__btn" data-act="share" aria-label="分享">' + plIcon('share', 18, 'currentColor') + '</button>' +
      '</div>' +
      '<div class="det-hero__badges">' + badges + '</div>' +
      '<span class="det-hero__glyph">' + glyph(item, 40) + '</span>' +
      '<h1 class="det-hero__title">' + esc(item.title) + '</h1>' +
      '<p class="det-hero__sub">' + esc(item.sub || '一次认真的自我探索') + '</p>' +
      '<div class="det-hero__tags">' + tags + '</div>' +
      '</header>' +

      '<main class="det-main">' +
      '<section class="det-stats">' +
      '<div class="det-stat"><b>' + fmtNum(item.count) + '</b><span>人已测过</span></div>' +
      '<div class="det-stat"><b>' + esc(String(item.questionCount || 40)) + ' 题</b><span>题目数量</span></div>' +
      '<div class="det-stat"><b>' + esc(item.duration || '约 6 分钟') + '</b><span>大约用时</span></div>' +
      '<div class="det-stat"><b class="' + (price === '免费' ? 'is-free' : '') + '">' + (price === '免费' ? '免费' : '¥' + esc(price)) + '</b><span>测评价格</span></div>' +
      '</section>' +

      '<section class="det-card det-intro">' +
      '<h2 class="det-h2"><i></i>测评介绍</h2>' +
      '<p class="det-intro__text">' + esc(desc) + '</p>' +
      audience +
      '<div class="det-intro__notice">' + plIcon('shield', 15, 'currentColor') + '<span>本测评为自我探索工具，不提供医学诊断；请按第一直觉作答。</span></div>' +
      '</section>' +

      '<section class="det-card det-gains">' +
      '<h2 class="det-h2"><i></i>你将获得</h2>' +
      '<div class="det-gain-grid">' + gainsHtml + '</div>' +
      '</section>' +

      '<section class="det-card det-reviews">' +
      '<div class="det-h2row"><h2 class="det-h2"><i></i>用户评价</h2><span class="det-score">4.9 <em>/ 5</em></span></div>' +
      reviewsHtml +
      '</section>' +

      '<p class="det-note">心迹测评 · 内容与评价均为原创演示素材</p>' +
      '</main>' +

      '<div class="det-cta">' +
      '<div class="det-cta__price"><span class="det-cta__label">' + (price === '免费' ? '限时免费' : '限时价') + '</span>' +
      '<b>' + (price === '免费' ? '免费' : '¥' + esc(price)) + '</b>' + origin + '</div>' +
      '<button type="button" class="det-cta__btn" data-act="start">开始测试</button>' +
      '</div>' +
      '</div>';

    document.title = item.title + ' · 心迹测评';

    var page = root.querySelector('.det-page--cta');
    page.addEventListener('click', function (e) {
      var t = e.target;
      var actEl = t && t.closest ? t.closest('[data-act]') : null;
      if (actEl) {
        var act = actEl.getAttribute('data-act');
        if (act === 'back') { e.preventDefault(); back(); return; }
        if (act === 'share') { e.preventDefault(); share(); return; }
        if (act === 'start') { e.preventDefault(); start(item); return; }
      }
      var goEl = t && t.closest ? t.closest('[data-go]') : null;
      if (goEl) { e.preventDefault(); if (window.Router) Router.go(goEl.getAttribute('data-go')); }
    });
  }

  function start(item) {
    var route = String(item.route || '');
    var norm = route.replace(/^#/, '');
    if (norm === '/' || norm === '/exam') {
      if (window.Router) Router.go(route.charAt(0) === '#' ? route : '#' + route);
      return;
    }
    if (!route && String(item.id).toLowerCase() === 'mbti') {
      if (window.Router) Router.go('#/exam');
      return;
    }
    if (window.UI) UI.toast('演示站仅开放 MBTI 测评，其他测评敬请期待', 'info');
  }

  window.Pages = window.Pages || {};
  window.Pages.detail = {
    title: '测评详情 · 心迹测评',
    theme: 'platform',
    tabbar: null,
    render: render,
    destroy: function () {
      document.title = '心迹测评 · 专业心理测评';
    }
  };
})();
