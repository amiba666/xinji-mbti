/* ============================================================
 * 心迹测评 · 搜索页（#/search）
 * 自动聚焦 + 热门关键词 + 实时过滤 + 空态 + 清空
 * ============================================================ */
(function () {
  'use strict';

  var HOT_KEYS = ['MBTI', '人格', '恋爱', '情商', '压力', '职业', '依恋', '价值观'];

  function hotKeys() {
    var src = (window.App && App.PRODUCTS) || window.DATA_PRODUCTS || null;
    var list = (src && src.hotKeywords) || [];
    return list.length ? list : HOT_KEYS;
  }

  var focusTimer = null;

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

  function products() {
    var src = (window.App && App.PRODUCTS) || window.DATA_PRODUCTS || null;
    return (src && src.items) || [];
  }

  function highlight(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    var safeQ = esc(q);
    var idx = safe.toLowerCase().indexOf(safeQ.toLowerCase());
    if (idx < 0) return safe;
    return safe.slice(0, idx) + '<mark class="pl-mark">' + safe.slice(idx, idx + safeQ.length) + '</mark>' + safe.slice(idx + safeQ.length);
  }

  function matches(item, q) {
    if (!q) return false;
    var lq = q.toLowerCase();
    var hay = [item.title || '', item.sub || '', (item.tags || []).join(' '), item.desc || '']
      .join(' ').toLowerCase();
    return hay.indexOf(lq) >= 0;
  }

  function byHot(list) {
    return list.slice().sort(function (a, b) {
      return (Number(b.count) || 0) - (Number(a.count) || 0);
    });
  }

  function resultRow(item, q) {
    var price = priceText(item.price);
    var tags = (item.tags || []).slice(0, 3).map(function (t) {
      return '<span class="pl-result__tag">' + esc(t) + '</span>';
    }).join('');
    return '<button type="button" class="pl-result" data-go="#/detail/' + encodeURIComponent(item.id) + '">' +
      '<span class="pl-result__cover"' + coverStyle(item) + '>' + glyph(item, 26) + '</span>' +
      '<span class="pl-result__body">' +
      '<span class="pl-result__title">' + highlight(item.title, q) + '</span>' +
      '<span class="pl-result__sub">' + esc(item.sub || '') + '</span>' +
      '<span class="pl-result__tags">' + tags + '</span>' +
      '<span class="pl-result__meta"><b class="' + (price === '免费' ? 'is-free' : '') + '">' + (price === '免费' ? '免费' : '¥' + esc(price)) + '</b>' +
      '<span>' + fmtNum(item.count) + '人测过</span></span>' +
      '</span>' +
      '<span class="pl-result__arrow">' + plIcon('arrow', 16, 'currentColor') + '</span>' +
      '</button>';
  }

  function render(root) {
    if (focusTimer) { clearTimeout(focusTimer); focusTimer = null; }
    var items = products();

    var keysHtml = hotKeys().map(function (k) {
      return '<button type="button" class="pl-key" data-key="' + esc(k) + '">' + esc(k) + '</button>';
    }).join('');

    root.innerHTML =
      '<div class="page pl-search">' +
      '<header class="pl-search__nav">' +
      '<button type="button" class="pl-search__back" data-act="back" aria-label="返回">' + plIcon('back', 21, 'currentColor') + '</button>' +
      '<form class="pl-search__form" data-form role="search">' +
      '<span class="pl-search__ico">' + plIcon('search', 17, 'currentColor') + '</span>' +
      '<input type="search" class="pl-search__input" data-input placeholder="搜索测评、人格、情感" autocomplete="off" enterkeyhint="search" aria-label="搜索测评">' +
      '<button type="button" class="pl-search__clear" data-act="clear" aria-label="清空搜索" hidden>' + plIcon('close', 14, 'currentColor') + '</button>' +
      '</form>' +
      '</header>' +
      '<div class="pl-search__body">' +
      '<section class="pl-search__hot">' +
      '<div class="pl-search__label">热门搜索</div>' +
      '<div class="pl-search__keys">' + keysHtml + '</div>' +
      '</section>' +
      '<section class="pl-search__panel">' +
      '<div class="pl-search__count" data-count></div>' +
      '<div class="pl-results" data-results></div>' +
      '<div class="pl-empty pl-search__empty" data-empty hidden>' +
      '<span class="pl-empty__art">' + plIcon('search', 27, 'currentColor') + '</span>' +
      '<p class="pl-empty__title" data-empty-title>没有找到相关测评</p>' +
      '<p class="pl-empty__sub">换个关键词试试，或看看下面的热门搜索</p>' +
      '<button type="button" class="pl-empty__btn" data-act="reset">清空搜索</button>' +
      '</div>' +
      '</section>' +
      '</div>' +
      '</div>';

    var input = root.querySelector('[data-input]');
    var form = root.querySelector('[data-form]');
    var clearBtn = root.querySelector('[data-act="clear"]');
    var countEl = root.querySelector('[data-count]');
    var resultsEl = root.querySelector('[data-results]');
    var emptyEl = root.querySelector('[data-empty]');
    var emptyTitle = root.querySelector('[data-empty-title]');

    function paint() {
      var q = String(input.value || '').trim();
      var found = q ? items.filter(function (item) { return matches(item, q); }) : byHot(items).slice(0, 4);
      clearBtn.hidden = !input.value;
      if (!q) {
        if (countEl) countEl.textContent = '大家都在测';
        if (emptyEl) emptyEl.hidden = true;
        resultsEl.hidden = false;
        resultsEl.innerHTML = found.map(function (item) { return resultRow(item, ''); }).join('');
        return;
      }
      if (countEl) countEl.textContent = '找到 ' + found.length + ' 个相关测评';
      if (!found.length) {
        resultsEl.hidden = true;
        resultsEl.innerHTML = '';
        if (emptyEl) emptyEl.hidden = false;
        if (emptyTitle) emptyTitle.textContent = '没有找到“' + q + '”相关的测评';
      } else {
        if (emptyEl) emptyEl.hidden = true;
        resultsEl.hidden = false;
        resultsEl.innerHTML = found.map(function (item) { return resultRow(item, q); }).join('');
      }
    }

    function setQuery(q) {
      input.value = q;
      paint();
    }

    input.addEventListener('input', paint);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var q = input.value.trim();
        if (!q) { if (window.UI) UI.toast('输入关键词，找到更适合你的测评', 'info'); return; }
        var n = items.filter(function (item) { return matches(item, q); }).length;
        if (window.UI) {
          UI.haptic && UI.haptic();
          UI.toast(n ? '为你找到 ' + n + ' 个相关测评' : '没有匹配的测评，换个关键词试试', n ? 'success' : 'info');
        }
      }
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    var page = root.querySelector('.pl-search');
    page.addEventListener('click', function (e) {
      var t = e.target;
      var keyEl = t && t.closest ? t.closest('[data-key]') : null;
      if (keyEl) {
        setQuery(keyEl.getAttribute('data-key') || '');
        return;
      }
      var actEl = t && t.closest ? t.closest('[data-act]') : null;
      if (actEl) {
        var act = actEl.getAttribute('data-act');
        if (act === 'clear' || act === 'reset') {
          e.preventDefault();
          setQuery('');
          try { input.focus({ preventScroll: true }); } catch (err) { input.focus(); }
          return;
        }
        if (act === 'back') {
          e.preventDefault();
          if (window.Router) {
            if (window.history && history.length > 1) Router.back();
            else Router.go('#/home');
          }
          return;
        }
      }
      var goEl = t && t.closest ? t.closest('[data-go]') : null;
      if (goEl) {
        e.preventDefault();
        if (window.Router) Router.go(goEl.getAttribute('data-go'));
      }
    });

    paint();
    // 移动端进入页面不主动聚焦，避免键盘遮挡「热门搜索」；桌面端仍自动聚焦。
    if (window.innerWidth >= 768) {
      focusTimer = setTimeout(function () {
        focusTimer = null;
        try { input.focus({ preventScroll: true }); } catch (err) { input.focus(); }
      }, 120);
    }
  }

  function destroy() {
    if (focusTimer) { clearTimeout(focusTimer); focusTimer = null; }
  }

  window.Pages = window.Pages || {};
  window.Pages.search = {
    title: '搜索 · 心迹测评',
    theme: 'platform',
    tabbar: null,
    render: render,
    destroy: destroy
  };
})();
