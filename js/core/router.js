/* ==========================================================================
   Router · hash 路由（#/path/:id?query）
   ========================================================================== */
(function () {
  'use strict';

  var routes = [];
  var navHandler = null;
  var current = { path: '/', params: [], query: {} };
  var started = false;

  function parseQuery(qs) {
    var q = {};
    if (!qs) return q;
    qs.split('&').forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf('=');
      var k = i < 0 ? pair : pair.slice(0, i);
      var v = i < 0 ? '' : pair.slice(i + 1);
      try { q[decodeURIComponent(k)] = decodeURIComponent(v); } catch (e) { q[k] = v; }
    });
    return q;
  }

  function parseHash(hash) {
    var h = (hash || '').replace(/^#/, '');
    if (!h) return { path: '/', query: {} };
    if (h.charAt(0) !== '/') h = '/' + h;
    var qi = h.indexOf('?');
    var path = qi < 0 ? h : h.slice(0, qi);
    var query = qi < 0 ? {} : parseQuery(h.slice(qi + 1));
    // 去掉末尾斜杠（根路径除外）
    if (path.length > 1 && path.charAt(path.length - 1) === '/') path = path.slice(0, -1);
    return { path: path, query: query };
  }

  function match(path) {
    for (var i = 0; i < routes.length; i++) {
      var r = routes[i];
      var rp = r.path === '/' ? [''] : r.path.replace(/^\//, '').split('/');
      var pp = path === '/' ? [''] : path.replace(/^\//, '').split('/');
      if (rp.length !== pp.length) continue;
      var params = [];
      var ok = true;
      for (var j = 0; j < rp.length; j++) {
        if (rp[j].charAt(0) === ':') { var raw = pp[j]; try { raw = decodeURIComponent(raw); } catch (e) {} params.push(raw); }
        else if (rp[j] !== pp[j]) { ok = false; break; }
      }
      if (ok) return { route: r, params: path === '/' ? [] : params };
    }
    return null;
  }

  function normalize(target) {
    if (!target) return '#/';
    var t = String(target);
    if (t.charAt(0) === '#') t = t.slice(1);
    if (t.charAt(0) !== '/') t = '/' + t;
    return '#' + t;
  }

  function render() {
    if (!navHandler) return;
    var parsed = parseHash(window.location.hash);
    var m = match(parsed.path);
    var path = parsed.path;
    var params = [];
    if (!m) {
      // 未匹配：回落地页
      if (path !== '/') {
        window.location.replace(normalize('/'));
        return;
      }
      return;
    }
    params = m.params;
    current = { path: path, params: params, query: parsed.query };
    try {
      navHandler(m.route, params, parsed.query, current);
    } catch (e) {
      console.error('[Router] render error', e);
    }
  }

  function go(target) {
    var h = normalize(target);
    if (window.location.hash === h) { render(); return; }
    window.location.hash = h;
  }
  function replace(target) {
    var h = normalize(target);
    if (window.location.hash === h) { render(); return; }
    try { window.location.replace(h); } catch (e) { window.location.hash = h; }
  }
  function back() {
    if (window.history.length > 1) window.history.back();
    else go('/');
  }

  function start(routeList, handler) {
    routes = routeList || [];
    navHandler = handler;
    window.addEventListener('hashchange', render);
    if (!window.location.hash) {
      try { window.history.replaceState(null, '', '#/'); } catch (e) { window.location.hash = '#/'; }
    }
    render();
    started = true;
  }

  window.Router = {
    start: start,
    go: go,
    replace: replace,
    back: back,
    current: function () { return current; },
    parseHash: parseHash,
    match: match,
    isStarted: function () { return started; }
  };
})();
