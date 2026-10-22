/* ==========================================================================
   app.js · 启动、路由注册、tabbar、页面生命周期
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('page-root');
  var tabbarEl = document.getElementById('tabbar');
  var device = document.getElementById('device');
  var currentPage = null;
  var currentKey = null;

  var DEFAULT_TITLE = '心迹测评 · 专业心理测评';

  var TABS = [
    { key: 'home', path: '#/home', label: '首页', icon: 'home' },
    { key: 'category', path: '#/category', label: '分类', icon: 'category' },
    { key: 'vip', path: '#/vip', label: '会员', icon: 'crown' },
    { key: 'mine', path: '#/mine', label: '我的', icon: 'mine' }
  ];

  var ROUTES = [
    { path: '/', page: 'entry' },
    /* 原站广告落地路径别名，便于直接访问 /#/chooseGendera */
    { path: '/chooseGendera', page: 'entry' },
    { path: '/chooseGender', page: 'entry' },
    { path: '/chooseGender2', page: 'entry' },
    { path: '/exam', page: 'exam' },
    { path: '/analyzing', page: 'analyzing' },
    { path: '/unlock', page: 'paywall' },
    { path: '/report', page: 'report' },
    { path: '/home', page: 'home' },
    { path: '/category', page: 'category' },
    { path: '/detail/:id', page: 'detail' },
    { path: '/detail', page: 'detail' },
    { path: '/search', page: 'search' },
    { path: '/mine', page: 'mine' },
    { path: '/vip', page: 'vip' },
    { path: '/types', page: 'typeDetail' },
    { path: '/type/:code', page: 'typeDetail' },
    { path: '/type', page: 'typeDetail' },
    { path: '/about', page: 'doc' },
    { path: '/agreement', page: 'doc' },
    { path: '/privacy', page: 'doc' }
  ];

  function pages() { return window.Pages || {}; }

  function renderTabbar(activeKey) {
    if (!tabbarEl) return;
    if (!activeKey) { tabbarEl.hidden = true; tabbarEl.innerHTML = ''; return; }
    tabbarEl.hidden = false;
    tabbarEl.innerHTML = TABS.map(function (t) {
      var active = t.key === activeKey;
      return '<button type="button" class="tabbar__item' + (active ? ' is-active' : '') + '" data-tab="' + t.key + '" data-path="' + t.path + '" aria-label="' + t.label + '"' + (active ? ' aria-current="page"' : '') + '>' +
        window.UI.icon(t.icon, 23) +
        '<span>' + t.label + '</span>' +
        '</button>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var item = e.target && e.target.closest ? e.target.closest('.tabbar__item') : null;
    if (!item) return;
    var path = item.getAttribute('data-path');
    if (path) {
      e.preventDefault();
      window.Router.go(path);
    }
  });

  function scrollToTop() {
    try {
      if (window.innerWidth >= 900 && device) device.scrollTop = 0;
      else window.scrollTo(0, 0);
    } catch (e) { window.scrollTo(0, 0); }
  }

  function navigate(route, params, query) {
    var page = pages()[route.page];
    if (!page) {
      console.warn('[app] 页面未注册：', route.page);
      if (window.location.hash !== '#/') window.location.replace('#/');
      return;
    }

    // 同一个页面对象再次进入时（例如 #/types 与 #/type/xx 共用 typeDetail），也要重建
    if (currentPage && typeof currentPage.destroy === 'function') {
      try { currentPage.destroy(); } catch (e) { console.error('[destroy]', e); }
    }
    if (currentPage && typeof currentPage.unmount === 'function') {
      try { currentPage.unmount(); } catch (e) {}
    }
    currentPage = page;
    currentKey = route.path;

    // 主题
    var theme = page.theme || 'platform';
    document.body.setAttribute('data-theme', theme);

    // tabbar
    renderTabbar(page.tabbar || null);

    // 页面主体
    root.className = 'page-root';
    root.innerHTML = '';
    root.removeAttribute('data-page');
    root.setAttribute('data-page', route.page);

    // 标题
    document.title = page.title || DEFAULT_TITLE;

    try {
      page.render(root, params || [], query || {});
    } catch (e) {
      console.error('[app] 页面渲染失败：', route.page, e);
      root.innerHTML = '<div class="page"><div class="empty"><div class="empty__title">页面加载失败</div>' +
        '<div class="empty__desc">请刷新页面重试，或返回首页继续体验。</div>' +
        '<button class="btn btn--primary" type="button" onclick="location.hash=\'#/\'">回到首页</button></div></div>';
    }

    scrollToTop();

    // 页面根是否带 tabbar 留白
    var pageEl = root.firstElementChild;
    if (pageEl && page.tabbar) pageEl.classList.add('has-tabbar');
  }

  /* 暴露给页面模块的便捷方法 */
  window.App = {
    PRODUCTS: window.DATA_PRODUCTS,
    QUESTIONS: window.DATA_QUESTIONS,
    TYPES: window.DATA_TYPES,
    routes: ROUTES,
    go: function (p) { window.Router.go(p); },
    back: function () { window.Router.back(); },
    gotoDetail: function (id) { window.Router.go('#/detail/' + encodeURIComponent(id)); },
    gotoReport: function () { window.Router.go('#/report'); },
    startTest: function (gender) {
      window.Store.startTest(gender || 'f');
      window.Router.go('#/exam');
    },
    activeTab: function () {
      var t = TABS.filter(function (x) { return x.key === (currentPage && currentPage.tabbar); })[0];
      return t ? t.key : null;
    },
    refreshTabbar: function () {
      renderTabbar(currentPage && currentPage.tabbar);
    },
    icons: function (n, s, c) { return window.UI.icon(n, s, c); }
  };

  /* 启动 */
  function boot() {
    if (window.Store && typeof window.Store.init === 'function') window.Store.init();
    // 页面对象可能在测试环境缺失，占位避免崩溃
    ['entry', 'exam', 'analyzing', 'paywall', 'report', 'typeDetail', 'home', 'category', 'detail', 'search', 'mine', 'vip', 'doc'].forEach(function (k) {
      if (!window.Pages[k]) {
        window.Pages[k] = {
          title: DEFAULT_TITLE,
          theme: 'platform',
          render: function (r, params) {
            r.innerHTML = '<div class="page"><div class="appbar"><button class="appbar__back" type="button" onclick="history.back()">' +
              window.UI.icon('back', 22) + '</button><div class="appbar__title">' + k + '</div></div>' +
              window.UI.emptyState({ title: '模块加载中', desc: '页面模块尚未就绪（' + k + '）。' }) + '</div>';
          }
        };
        console.warn('[app] 缺少页面模块：', k);
      }
    });
    window.Router.start(ROUTES, navigate);
    // 从后台回到前台时，若 tabbar 状态过期则刷新
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && currentPage && currentPage.tabbar) renderTabbar(currentPage.tabbar);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
