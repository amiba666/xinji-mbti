/* ============================================================
 * 心迹测评 · 平台首页（#/home）
 * 原创重制：品牌、banner、商品卡、文案均为本项目原创。
 * 依赖：window.Store / UI / Router / App（不直接读写 localStorage）
 * ============================================================ */
(function () {
  'use strict';

  /* ---------------- 扩展线条图标（补 UI.icons，缺失时兜底） ---------------- */
  var ICONS = {
    heart: '<path d="M12 20.2C7.4 17 3.5 13.6 3.5 9.4A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.5 3c0 4.2-3.9 7.6-8.5 10.8z"/>',
    pulse: '<path d="M3 12h4l2-5 3.2 10 2.1-5H21"/>',
    brain: '<path d="M12 5.2a3.2 3.2 0 0 0-5.6 2A3 3 0 0 0 4.6 12a3 3 0 0 0 1.8 5.4A3 3 0 0 0 12 19V5.2z"/><path d="M12 5.2a3.2 3.2 0 0 1 5.6 2 3 3 0 0 1 1.8 4.8 3 3 0 0 1-1.8 5.4A3 3 0 0 1 12 19V5.2z"/><path d="M8.2 9.8c1-.3 1.9 0 2.5.7M15.8 9.8c-1-.3-1.9 0-2.5.7"/>',
    compass: '<circle cx="12" cy="12" r="8.6"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>',
    users: '<circle cx="9" cy="8.2" r="3.1"/><path d="M3.6 19.2c0-2.9 2.4-5.2 5.4-5.2s5.4 2.3 5.4 5.2"/><path d="M16 5.6a3.1 3.1 0 0 1 0 5.4"/><path d="M17.3 14.4c1.9.6 3.1 2.2 3.1 4.2"/>',
    sparkle: '<path d="M12 3.5l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7z"/><path d="M19 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    moon: '<path d="M20.2 14.8A8.3 8.3 0 0 1 9.2 3.8a8.3 8.3 0 1 0 11 11z"/>',
    flame: '<path d="M12 3.5c2.8 3.8 4.8 6 4.8 9a4.8 4.8 0 0 1-9.6 0c0-1.8.7-3.2 1.9-4.5.2 1.4.8 2.4 1.8 3 .1-2.6.5-5.1 1.1-7.5z"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9l3 4 3-4M12 13v4M9.8 15h4.4"/>',
    gem: '<path d="M6.2 4h11.6L21 9l-9 11L3 9z"/><path d="M3 9h18M9 4l-2.4 5L12 20l5.4-11L15 4"/>',
    gift: '<rect x="3.6" y="8.6" width="16.8" height="4" rx="1.4"/><path d="M5.2 12.6V20h13.6v-7.4M12 8.6V20"/><path d="M12 8.6C10.6 5.6 9.2 4 7.6 4 6.2 4 5.4 5 5.4 6.2c0 1.4 1.6 2.4 6.6 2.4z"/><path d="M12 8.6C13.4 5.6 14.8 4 16.4 4c1.4 0 2.2 1 2.2 2.2 0 1.4-1.6 2.4-6.6 2.4z"/>',
    grid: '<rect x="4" y="4" width="6.4" height="6.4" rx="1.8"/><rect x="13.6" y="4" width="6.4" height="6.4" rx="1.8"/><rect x="4" y="13.6" width="6.4" height="6.4" rx="1.8"/><rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.8"/>',
    calendar: '<rect x="3.6" y="5.2" width="16.8" height="15" rx="2.6"/><path d="M8 3.4v3.6M16 3.4v3.6M3.6 10h16.8"/><path d="M8 14h2M14 14h2M8 17.2h2M14 17.2h2"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2"/>',
    leaf: '<path d="M20 4.4C10.6 4.4 4.4 8.2 4.4 15c0 3 2 4.8 4.8 4.8 6.8 0 10.8-6.2 10.8-15.4z"/><path d="M5.2 19c3.4-4.4 6.8-7.2 11.4-9.2"/>',
    quote: '<path d="M9.5 6.5H5v6h4.5v6H5"/><path d="M20 6.5h-4.5v6H20v6h-4.5"/>',
    eye: '<path d="M2.8 12S6.4 5.6 12 5.6 21.2 12 21.2 12 17.6 18.4 12 18.4 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>',
    chat: '<path d="M4.2 5.6h15.6v10.2h-9.6L4.2 20z"/><path d="M8.2 10h7.6"/>',
    book: '<path d="M4.4 5.4A2.4 2.4 0 0 1 6.8 3H20v18H6.8a2.4 2.4 0 0 1-2.4-2.4z"/><path d="M4.4 17.4h15.2"/>',
    mask: '<path d="M4.2 5.5h15.6v6.2c0 4-3.6 7.3-8 7.3s-8-3.3-8-7.3z"/><path d="M8.5 10.3h.01M15.5 10.3h.01M9.2 14.4c1.7 1.3 4 1.3 5.6 0"/>'
  };
  window.PL_ICONS = window.PL_ICONS || ICONS;

  /* ---------------- 基础工具 ---------------- */
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

  /* 图标：优先复用 UI.icon，保证全站线条一致；缺失时使用本地兜底字典 */
  function plIcon(name, size, color) {
    size = size || 20;
    color = color || 'currentColor';
    if (window.UI && UI.icons && UI.icons[name] && typeof UI.icon === 'function') {
      return UI.icon(name, size, color);
    }
    var body = (window.PL_ICONS || {})[name] || (window.PL_ICONS || {}).sparkle || '';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' +
      color + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      body + '</svg>';
  }
  window.PL_ICON = plIcon;

  /* 商品封面图形：有语义图标用图标，否则用标题首字做字形构图 */
  function glyph(item, size) {
    item = item || {};
    size = size || 28;
    var name = item.icon;
    var known = name && ((window.UI && UI.icons && UI.icons[name]) || (window.PL_ICONS && window.PL_ICONS[name]));
    if (known) return plIcon(name, size, 'currentColor');
    var ch = String(item.title || '心').replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '').charAt(0) || '心';
    return '<b class="pl-glyph-text" style="font-size:' + Math.round(size * 0.8) + 'px">' + esc(ch) + '</b>';
  }
  window.PL_GLYPH = glyph;

  /* ---------------- 数据 ---------------- */
  function products() {
    var src = (window.App && App.PRODUCTS) || window.DATA_PRODUCTS || null;
    return (src && src.items) || [];
  }
  function categories() {
    var src = (window.App && App.PRODUCTS) || window.DATA_PRODUCTS || null;
    return (src && src.categories) || [];
  }
  function findByWord(word, fallback) {
    var list = categories();
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c && c.key !== 'all' && String(c.name || '').indexOf(word) >= 0) return c.key;
    }
    return fallback;
  }
  function catLink(key) {
    return '#/category?cat=' + encodeURIComponent(key);
  }
  function detailLink(item) {
    return '#/detail/' + encodeURIComponent(item.id);
  }
  function coverStyle(item) {
    var t = item && item.theme;
    if (t && t.length >= 2) {
      return ' style="--cover-1:' + esc(t[0]) + ';--cover-2:' + esc(t[1]) + '"';
    }
    return '';
  }
  function badge(item) {
    if (item.vip) return '<span class="home-card__badge home-card__badge--vip">VIP</span>';
    if (item.hot) return '<span class="home-card__badge home-card__badge--hot">HOT</span>';
    return '';
  }

  /* ---------------- Banner ---------------- */
  var bannerTimer = null;
  var bannerRun = 0;

  function stopBanner() {
    bannerRun++;
    if (bannerTimer) {
      clearInterval(bannerTimer);
      bannerTimer = null;
    }
  }

  function slideArt(kind) {
    if (kind === 'ring') {
      var dots = '';
      for (var i = 0; i < 12; i++) {
        var a = (Math.PI * 2 / 12) * i;
        var x = 118 + Math.cos(a) * 54;
        var y = 96 + Math.sin(a) * 54;
        dots += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (i % 3 === 0 ? 2.6 : 1.6) + '" fill="rgba(255,255,255,.55)"/>';
      }
      return '<svg class="home-slide__art" viewBox="0 0 240 200" aria-hidden="true">' +
        '<circle cx="118" cy="96" r="72" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.2"/>' +
        '<circle cx="118" cy="96" r="54" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1"/>' +
        '<circle cx="118" cy="96" r="30" fill="rgba(255,255,255,.10)"/>' + dots +
        '<path d="M118 40v-14M118 166v-10" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>' +
        '</svg>';
    }
    if (kind === 'spark') {
      return '<svg class="home-slide__art" viewBox="0 0 240 200" aria-hidden="true">' +
        '<path d="M170 22l5 14 14 5-14 5-5 14-5-14-14-5 14-5z" fill="rgba(255,255,255,.4)"/>' +
        '<path d="M62 132l3.4 9.6 9.6 3.4-9.6 3.4L62 158l-3.4-9.6L49 145l9.6-3.4z" fill="rgba(255,255,255,.3)"/>' +
        '<circle cx="196" cy="128" r="26" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.2"/>' +
        '<circle cx="196" cy="128" r="15" fill="rgba(255,255,255,.12)"/>' +
        '<path d="M22 34c22 0 34 14 34 34" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="1.2"/>' +
        '</svg>';
    }
    return '<svg class="home-slide__art" viewBox="0 0 240 200" aria-hidden="true">' +
      '<circle cx="172" cy="62" r="63" fill="rgba(255,255,255,.08)"/>' +
      '<circle cx="172" cy="62" r="44" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="1.2"/>' +
      '<path d="M136 82l11-31 25 18 25-18 11 31z" fill="rgba(255,255,255,.26)"/>' +
      '<path d="M136 82h72" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle cx="147" cy="46" r="3.2" fill="rgba(255,255,255,.55)"/>' +
      '<circle cx="197" cy="46" r="3.2" fill="rgba(255,255,255,.55)"/>' +
      '<path d="M58 150c20-13 40-13 58 0" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/>' +
      '<circle cx="46" cy="48" r="9" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/>' +
      '</svg>';
  }

  function initBanner(root) {
    var viewport = root.querySelector('[data-banner-viewport]');
    var track = root.querySelector('[data-banner-track]');
    if (!viewport || !track) return;
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-banner-dot]'));
    var counter = root.querySelector('[data-banner-count]');
    var total = track.children.length;
    if (total < 1) return;
    var idx = 0;
    var startX = 0;
    var startY = 0;
    var dragging = false;
    var moved = false;
    var suppressUntil = 0;
    var run = bannerRun;

    function paint() {
      track.style.transition = 'transform .42s cubic-bezier(.22,.8,.3,1)';
      track.style.transform = 'translate3d(' + (-idx * 100) + '%,0,0)';
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
      if (counter) counter.textContent = (idx + 1) + ' / ' + total;
    }

    function go(n) {
      idx = ((n % total) + total) % total;
      paint();
    }

    function startAuto() {
      stopBanner();
      run = bannerRun;
      if (total > 1) {
        bannerTimer = setInterval(function () {
          if (run !== bannerRun) return;
          go(idx + 1);
        }, 4000);
      }
    }

    function endDrag(ev) {
      if (!dragging) return;
      dragging = false;
      var dx = (ev && typeof ev.clientX === 'number') ? ev.clientX - startX : 0;
      var threshold = Math.min(64, viewport.clientWidth * 0.16);
      if (Math.abs(dx) > threshold) {
        go(idx + (dx < 0 ? 1 : -1));
        moved = true;
      } else {
        paint();
      }
      if (moved) suppressUntil = Date.now() + 380;
      startAuto();
    }

    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      stopBanner();
      track.style.transition = 'none';
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        moved = true;
        // 仅在确认横向拖动后才捕获指针，避免普通点击被重定向到轮播容器
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      }
      if (!moved) return;
      track.style.transform = 'translate3d(calc(' + (-idx * 100) + '% + ' + dx + 'px),0,0)';
    });

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('pointerleave', function (e) {
      if (dragging && e.buttons === 0) endDrag(e);
    });
    viewport.addEventListener('click', function (e) {
      if (Date.now() < suppressUntil) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        var n = Number(d.getAttribute('data-banner-dot')) || 0;
        go(n);
        startAuto();
      });
    });

    paint();
    startAuto();
  }

  /* ---------------- 首页渲染 ---------------- */
  function render(root) {
    stopBanner();
    var items = products();
    var cats = categories();

    var qFree = findByWord('免费', 'free');
    var qLove = findByWord('爱情', 'love');
    var qMind = findByWord('心理', 'mental');

    var mbti = null;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (String(it.id).toLowerCase() === 'mbti' || String(it.title || '').toUpperCase().indexOf('MBTI') >= 0) { mbti = it; break; }
    }
    var mbtiLink = mbti ? detailLink(mbti) : '#/category';

    var hot = items.filter(function (x) { return x && x.hot; }).slice(0, 3);
    if (hot.length < 3) {
      items.forEach(function (x) {
        if (hot.length < 3 && hot.indexOf(x) < 0) hot.push(x);
      });
    }
    var newIds = hot.slice();
    var fresh = items.filter(function (x) { return x.isNew === true && newIds.indexOf(x) < 0; }).slice(0, 4);
    if (!fresh.length) {
      fresh = [];
      items.forEach(function (x) {
        if (fresh.length < 4 && newIds.indexOf(x) < 0 && fresh.indexOf(x) < 0) fresh.push(x);
      });
    }
    var used = hot.concat(fresh);
    var curated = items.filter(function (x) { return used.indexOf(x) < 0; })
      .sort(function (a, b) { return (Number(b.count) || 0) - (Number(a.count) || 0); })
      .slice(0, 3);

    var slides = [
      { cls: 'is-vip', eyebrow: 'XINJI VIP', title: '成为钻石会员', sub: '全站测评免费 · 不限次数任意测', cta: '了解详情', go: '#/vip', art: 'crown' },
      { cls: 'is-mbti', eyebrow: '2026 新题库', title: 'MBTI 2026', sub: '42 道原创题目，看见人格的隐藏面', cta: '去测一测', go: mbtiLink, art: 'ring' },
      { cls: 'is-gift', eyebrow: 'NEW USER', title: '新人专属礼包', sub: '3 张测评体验券，开启自我探索', cta: '立即领取', act: 'gift', art: 'spark' }
    ];

    var slideHtml = slides.map(function (s, si) {
      var cta = s.act
        ? '<button type="button" class="home-slide__cta" data-act="' + s.act + '">' + esc(s.cta) + plIcon('arrow', 14, 'currentColor') + '</button>'
        : '<button type="button" class="home-slide__cta" data-go="' + esc(s.go) + '">' + esc(s.cta) + plIcon('arrow', 14, 'currentColor') + '</button>';
      return '<article class="home-slide home-slide--' + s.cls + '" role="group" aria-roledescription="slide" aria-label="' + (si + 1) + ' / ' + slides.length + '">' +
        slideArt(s.art) +
        '<span class="home-slide__eyebrow">' + esc(s.eyebrow) + '</span>' +
        '<h2 class="home-slide__title">' + esc(s.title) + '</h2>' +
        '<p class="home-slide__sub">' + esc(s.sub) + '</p>' +
        cta +
        '</article>';
    }).join('');

    var dotsHtml = slides.map(function (s, si) {
      return '<button type="button" class="home-dot' + (si === 0 ? ' is-active' : '') + '" data-banner-dot="' + si + '" aria-label="切换到第 ' + (si + 1) + ' 张活动"></button>';
    }).join('');

    var quick = [
      { label: '免费测试', ico: 'star', go: catLink(qFree) },
      { label: '爱情婚姻', ico: 'heart', go: catLink(qLove) },
      { label: '心理健康', ico: 'pulse', go: catLink(qMind) },
      { label: '更多分类', ico: 'grid', go: '#/category' }
    ].map(function (q, qi) {
      return '<button type="button" class="home-quick__item" data-go="' + esc(q.go) + '">' +
        '<span class="home-quick__ico home-quick__ico--' + (qi + 1) + '">' + plIcon(q.ico, 23, 'currentColor') + '</span>' +
        '<span class="home-quick__label">' + esc(q.label) + '</span>' +
        '</button>';
    }).join('');

    function hotCard(item) {
      return '<button type="button" class="home-card" data-go="' + esc(detailLink(item)) + '">' +
        '<span class="home-card__cover"' + coverStyle(item) + '>' +
        badge(item) +
        '<span class="home-card__glyph">' + glyph(item, 26) + '</span>' +
        '<span class="home-card__count">' + plIcon('heart', 10, 'currentColor') + fmtNum(item.count) + '人测过</span>' +
        '</span>' +
        '<span class="home-card__title">' + esc(item.title) + '</span>' +
        '</button>';
    }

    function newCard(item) {
      return '<button type="button" class="home-new" data-go="' + esc(detailLink(item)) + '">' +
        '<span class="home-new__cover"' + coverStyle(item) + '>' +
        '<span class="home-new__deco"></span>' +
        '<span class="home-new__tag">NEW</span>' +
        '<span class="home-new__glyph">' + glyph(item, 34) + '</span>' +
        '<span class="home-new__text"><span class="home-new__meta">' + fmtNum(item.count) + ' 人测过</span><b>' + esc(item.title) + '</b><i>' + esc(item.sub || '') + '</i></span>' +
        '</span>' +
        '</button>';
    }

    function curatedRow(item) {
      return '<button type="button" class="home-row" data-go="' + esc(detailLink(item)) + '">' +
        '<span class="home-row__text">' +
        '<span class="home-row__title">' + esc(item.title) + '</span>' +
        '<span class="home-row__sub">' + esc(item.sub || '') + '</span>' +
        '<span class="home-row__meta">' + plIcon('heart', 11, 'currentColor') + fmtNum(item.count) + '人测过 · ' + esc(item.duration || '约 6 分钟') + '</span>' +
        '</span>' +
        '<span class="home-row__cover"' + coverStyle(item) + '>' + glyph(item, 28) + '</span>' +
        '</button>';
    }

    var html =
      '<div class="page home-page has-tabbar">' +
      '<header class="home-top">' +
      '<div class="home-brand">' +
      '<span class="home-brand__logo">' + plIcon('heart', 21, 'currentColor') + '</span>' +
      '<span class="home-brand__text"><strong>心迹测评</strong><em>专业心理测评</em></span>' +
      '</div>' +
      '<button type="button" class="home-search" data-go="#/search" aria-label="搜索测评">' +
      plIcon('search', 16, 'currentColor') + '<span>搜索测评 / 关键词</span>' +
      '</button>' +
      '</header>' +

      '<section class="home-banner" aria-label="精选活动">' +
      '<div class="home-banner__viewport" data-banner-viewport>' +
      '<div class="home-banner__track" data-banner-track>' + slideHtml + '</div>' +
      '<span class="home-banner__counter" data-banner-count>1 / ' + slides.length + '</span>' +
      '</div>' +
      '<div class="home-banner__dots">' + dotsHtml + '</div>' +
      '</section>' +

      '<section class="home-quick" aria-label="快捷分类">' + quick + '</section>' +

      (hot.length ?
        '<section class="home-sec">' +
        '<div class="home-sec__head"><h2 class="home-sec__title">热卖爆款</h2><span class="home-sec__badge home-sec__badge--hot">HOT</span>' +
        '<button type="button" class="home-sec__more" data-go="#/category">全部' + plIcon('arrow', 13, 'currentColor') + '</button></div>' +
        '<p class="home-sec__sub">不容错过的精彩测评</p>' +
        '<div class="home-grid home-grid--3">' + hot.map(hotCard).join('') + '</div>' +
        '</section>' : '') +

      (fresh.length ?
        '<section class="home-sec">' +
        '<div class="home-sec__head"><h2 class="home-sec__title">新品首发</h2><span class="home-sec__badge home-sec__badge--new">NEW</span>' +
        '<button type="button" class="home-sec__more" data-go="#/category">全部' + plIcon('arrow', 13, 'currentColor') + '</button></div>' +
        '<p class="home-sec__sub">用新的视角遇见更好的自己</p>' +
        '<div class="home-grid home-grid--2">' + fresh.map(newCard).join('') + '</div>' +
        '</section>' : '') +

      (curated.length ?
        '<section class="home-sec">' +
        '<div class="home-sec__head"><h2 class="home-sec__title">精选推荐</h2></div>' +
        '<p class="home-sec__sub">每日一测，在轻松的体验中更懂自己</p>' +
        '<div class="home-rows">' + curated.map(curatedRow).join('') + '</div>' +
        '</section>' : '') +

      (!items.length ?
        '<div class="pl-empty"><span class="pl-empty__art">' + plIcon('search', 26, 'currentColor') + '</span>' +
        '<p class="pl-empty__title">测评内容正在准备中</p><p class="pl-empty__sub">稍后再来看看吧</p></div>' : '') +

      '<footer class="home-foot">' +
      '<p>心迹测评 · 专业心理测评演示站</p>' +
      '<p>测评结果仅供自我探索参考，不作为医学诊断依据</p>' +
      '</footer>' +
      '</div>';

    root.innerHTML = html;
    bind(root);
    initBanner(root);
  }

  function bind(root) {
    var page = root.querySelector('.home-page');
    if (!page) return;
    page.addEventListener('click', function (e) {
      var t = e.target;
      var el = t && t.closest ? (t.closest('[data-go]') || t.closest('[data-act]')) : null;
      if (!el) return;
      var go = el.getAttribute('data-go');
      if (go) {
        e.preventDefault();
        if (window.Router) Router.go(go);
        return;
      }
      var act = el.getAttribute('data-act');
      if (act === 'gift') {
        e.preventDefault();
        if (window.UI) UI.toast('新人礼包已放入账户，演示环境无需登录', 'success');
      }
    });
  }

  function destroy() {
    stopBanner();
  }

  window.Pages = window.Pages || {};
  window.Pages.home = {
    title: '心迹测评 · 专业心理测评',
    theme: 'platform',
    tabbar: 'home',
    render: render,
    destroy: destroy
  };
})();
