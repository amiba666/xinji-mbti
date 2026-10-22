/* ============================================================
 * 心迹测评 · 分类页（#/category）
 * 分类 chips 吸附 + 排序（热度/价格/最新）+ 2 列商品列表
 * ============================================================ */
(function () {
  'use strict';

  var FALLBACK_CATS = [
    { key: 'all', name: '全部' },
    { key: 'free', name: '免费测试' },
    { key: 'love', name: '爱情婚姻' },
    { key: 'mental', name: '心理健康' },
    { key: 'personality', name: '人格个性' },
    { key: 'career', name: '职场人际' },
    { key: 'family', name: '家庭情感' },
    { key: 'ability', name: '能力潜质' },
    { key: 'values', name: '价值观' }
  ];

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

  function allCategories() {
    var src = (window.App && App.PRODUCTS) || window.DATA_PRODUCTS || null;
    var list = (src && src.categories) || [];
    if (!list.length) return FALLBACK_CATS;
    if (!list.some(function (c) { return c && c.key === 'all'; })) {
      return [{ key: 'all', name: '全部' }].concat(list);
    }
    return list;
  }

  function normalizeCat(cat, list) {
    if (!cat) return 'all';
    var found = list.some(function (c) { return c && c.key === cat; });
    return found ? cat : 'all';
  }

  function matchCat(item, cat) {
    if (cat === 'all') return true;
    if (item.cat === cat) return true;
    if (cat === 'free' && (priceNum(item.price) === 0 || item.free)) return true;
    return false;
  }

  function sortItems(list, sort, original) {
    var arr = list.slice();
    if (sort === 'price') {
      arr.sort(function (a, b) {
        var pa = priceNum(a.price);
        var pb = priceNum(b.price);
        if (pa === pb) return (Number(b.count) || 0) - (Number(a.count) || 0);
        return pa - pb;
      });
      return arr;
    }
    if (sort === 'new') {
      var hasTs = arr.some(function (x) { return Number(x.ts || x.createdAt || 0) > 0; });
      if (hasTs) {
        arr.sort(function (a, b) { return (Number(b.ts || b.createdAt || 0)) - (Number(a.ts || a.createdAt || 0)); });
      } else {
        var weight = function (x) { return (x.isNew || x.new) ? 1 : 0; };
        arr.sort(function (a, b) {
          var d = weight(b) - weight(a);
          if (d) return d;
          return original.indexOf(a) - original.indexOf(b);
        });
      }
      return arr;
    }
    arr.sort(function (a, b) {
      var d = (Number(b.count) || 0) - (Number(a.count) || 0);
      if (d) return d;
      return original.indexOf(a) - original.indexOf(b);
    });
    return arr;
  }

  function card(item) {
    var badges = '';
    if (item.vip) badges += '<span class="cat-card__badge cat-card__badge--vip">VIP</span>';
    if (item.hot) badges += '<span class="cat-card__badge cat-card__badge--hot">HOT</span>';
    var price = priceText(item.price);
    var origin = (price !== '免费' && Number(item.origin) > Number(item.price) && Number(item.origin) > 0)
      ? '<span class="cat-card__origin">¥' + esc(String(Math.round(Number(item.origin) * 100) / 100)) + '</span>' : '';
    return '<button type="button" class="cat-card" data-go="#/detail/' + encodeURIComponent(item.id) + '">' +
      '<span class="cat-card__cover"' + coverStyle(item) + '>' +
      badges +
      '<span class="cat-card__glyph">' + glyph(item, 30) + '</span>' +
      '<span class="cat-card__count">' + plIcon('heart', 10, 'currentColor') + fmtNum(item.count) + '人测过</span>' +
      '</span>' +
      '<span class="cat-card__body">' +
      '<span class="cat-card__title">' + esc(item.title) + '</span>' +
      '<span class="cat-card__sub">' + esc(item.sub || '') + '</span>' +
      '<span class="cat-card__foot">' +
      '<span class="cat-card__price' + (price === '免费' ? ' is-free' : '') + '">' + (price === '免费' ? '免费' : '¥' + esc(price)) + '</span>' +
      origin +
      '</span>' +
      '</span>' +
      '</button>';
  }

  function render(root) {
    var items = allProducts();
    var cats = allCategories();
    var cur = (window.Router && Router.current) ? Router.current() : { query: {} };
    var queryCat = cur && cur.query ? cur.query.cat : '';
    var querySort = cur && cur.query ? cur.query.sort : '';
    var state = {
      cat: normalizeCat(queryCat, cats),
      sort: ['hot', 'price', 'new'].indexOf(querySort) >= 0 ? querySort : 'hot'
    };

    var chips = cats.map(function (c) {
      if (!c || c.key == null) return '';
      return '<button type="button" class="chip cat-chip' + (c.key === state.cat ? ' is-active' : '') + '" data-cat="' + esc(c.key) + '" role="tab" aria-selected="' + (c.key === state.cat ? 'true' : 'false') + '">' + esc(c.name) + '</button>';
    }).join('');

    var html =
      '<div class="page cat-page has-tabbar">' +
      '<header class="cat-head">' +
      '<div class="cat-head__text"><h1>测评分类</h1><p>按主题，找到此刻最需要的答案</p></div>' +
      '<button type="button" class="cat-head__search" data-go="#/search" aria-label="搜索测评">' + plIcon('search', 19, 'currentColor') + '</button>' +
      '</header>' +
      '<div class="cat-sticky">' +
      '<div class="cat-chips" role="tablist" aria-label="测评分类">' + chips + '</div>' +
      '<div class="cat-toolbar">' +
      '<span class="cat-count" data-count></span>' +
      '<div class="cat-sorts" role="group" aria-label="排序方式">' +
      '<button type="button" class="cat-sort is-active" data-sort="hot">热度</button>' +
      '<button type="button" class="cat-sort" data-sort="price">价格</button>' +
      '<button type="button" class="cat-sort" data-sort="new">最新</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="cat-list" data-list></div>' +
      '<div class="pl-empty cat-empty" data-empty hidden>' +
      '<span class="pl-empty__art">' + plIcon('search', 26, 'currentColor') + '</span>' +
      '<p class="pl-empty__title">这个分类暂时还没有测评</p>' +
      '<p class="pl-empty__sub">换个分类，或看看全部测评</p>' +
      '<button type="button" class="pl-empty__btn" data-act="reset">查看全部测评</button>' +
      '</div>' +
      '<p class="cat-foot">心迹测评 · 全部内容为原创演示数据</p>' +
      '</div>';

    root.innerHTML = html;

    var listEl = root.querySelector('[data-list]');
    var emptyEl = root.querySelector('[data-empty]');
    var countEl = root.querySelector('[data-count]');
    var chipEls = Array.prototype.slice.call(root.querySelectorAll('[data-cat]'));
    var sortEls = Array.prototype.slice.call(root.querySelectorAll('[data-sort]'));
    var chipsEl = root.querySelector('.cat-chips');

    // 同步筛选状态到地址栏（不触发 hashchange），从详情返回/刷新后仍保留筛选
    function syncHash() {
      try {
        var hash = '#/category?cat=' + encodeURIComponent(state.cat) +
          (state.sort !== 'hot' ? '&sort=' + encodeURIComponent(state.sort) : '');
        if (history.replaceState) history.replaceState(null, '', hash);
      } catch (err) { /* noop */ }
    }

    // 右侧渐隐只在可横向滚动且未到末尾时出现
    function syncChipsMask() {
      if (!chipsEl) return;
      var max = chipsEl.scrollWidth - chipsEl.clientWidth;
      var scrollable = max > 4;
      chipsEl.classList.toggle('is-scrollable', scrollable);
      chipsEl.classList.toggle('is-end', scrollable && chipsEl.scrollLeft >= max - 4);
    }

    if (chipsEl) chipsEl.addEventListener('scroll', syncChipsMask, { passive: true });

    function paint() {
      var filtered = items.filter(function (item) { return matchCat(item, state.cat); });
      var sorted = sortItems(filtered, state.sort, items);
      chipEls.forEach(function (el) {
        var on = el.getAttribute('data-cat') === state.cat;
        el.classList.toggle('is-active', on);
        el.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      sortEls.forEach(function (el) {
        el.classList.toggle('is-active', el.getAttribute('data-sort') === state.sort);
      });
      if (countEl) countEl.textContent = '共 ' + sorted.length + ' 个测评';
      if (!sorted.length) {
        listEl.innerHTML = '';
        listEl.hidden = true;
        emptyEl.hidden = false;
      } else {
        listEl.hidden = false;
        emptyEl.hidden = true;
        listEl.innerHTML = sorted.map(card).join('');
      }
      syncChipsMask();
    }

    var page = root.querySelector('.cat-page');
    if (page) page.addEventListener('click', function (e) {
      var t = e.target;
      var catEl = t && t.closest ? t.closest('[data-cat]') : null;
      if (catEl) {
        state.cat = catEl.getAttribute('data-cat') || 'all';
        paint();
        syncHash();
        return;
      }
      var sortEl = t && t.closest ? t.closest('[data-sort]') : null;
      if (sortEl) {
        state.sort = sortEl.getAttribute('data-sort') || 'hot';
        paint();
        syncHash();
        return;
      }
      var resetEl = t && t.closest ? t.closest('[data-act="reset"]') : null;
      if (resetEl) {
        state.cat = 'all';
        state.sort = 'hot';
        paint();
        syncHash();
        return;
      }
      var goEl = t && t.closest ? t.closest('[data-go]') : null;
      if (goEl) {
        e.preventDefault();
        if (window.Router) Router.go(goEl.getAttribute('data-go'));
      }
    });

    paint();
    syncChipsMask();
  }

  window.Pages = window.Pages || {};
  window.Pages.category = {
    title: '测评分类 · 心迹测评',
    theme: 'platform',
    tabbar: 'category',
    render: render,
    destroy: function () {}
  };
})();
