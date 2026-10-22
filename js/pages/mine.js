/* ============================================================
 * 心迹测评 · 我的（#/mine）
 * 用户卡 + 数据统计 + 我的报告 + 我的订单 + 功能列表
 * ============================================================ */
(function () {
  'use strict';

  var confirmOpen = false;
  var serviceOpen = false;

  function esc(v) {
    if (window.UI && typeof UI.escape === 'function') return UI.escape(v == null ? '' : v);
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function plIcon(name, size, color) {
    if (window.PL_ICON) return window.PL_ICON(name, size, color);
    if (window.UI && typeof UI.icon === 'function') return UI.icon(name, size || 20, color || 'currentColor');
    return '';
  }

  function state() {
    if (window.Store) {
      if (typeof Store.get === 'function') return Store.get() || {};
      return Store.state || {};
    }
    return {};
  }

  function fmtDate(ts, withTime) {
    if (!ts) return '';
    if (window.UI && typeof UI.fmtDate === 'function') return UI.fmtDate(ts, !!withTime);
    var d = new Date(ts);
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  function reports() {
    if (window.Store && typeof Store.myReports === 'function') {
      var list = Store.myReports();
      if (list && list.length) return list;
    }
    var s = state();
    return (s.reports || []).slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }

  function orders() {
    var s = state();
    return (s.orders || []).slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }

  function vipInfo() {
    var s = state();
    if (!s.vip) return null;
    var list = s.orders || [];
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      if (o && (o.kind === 'vip' || String(o.title || '').indexOf('钻石会员') >= 0)) {
        var expiresAt = Number(o.expiresAt) || 0;
        if (expiresAt && expiresAt < Date.now()) return null;
        return { plan: o.plan || 'year', expiresAt: expiresAt };
      }
    }
    return { plan: 'year', expiresAt: 0 };
  }

  function reportTone(code) {
    var c = String(code || '');
    var n = 0;
    for (var i = 0; i < c.length; i++) n += c.charCodeAt(i);
    return n % 4 + 1;
  }

  function reportRow(r) {
    var code = r.code || 'XJ';
    var unlocked = r.unlocked !== false;
    return '<button type="button" class="me-listrow me-report" data-act="open-report" data-id="' + esc(r.id || '') + '">' +
      '<span class="me-report__badge me-report__badge--' + reportTone(code) + '">' + esc(String(code).slice(0, 4)) + '</span>' +
      '<span class="me-rowtext">' +
      '<b>' + esc(r.name || '人格测评报告') + '</b>' +
      '<span>' + esc(fmtDate(r.ts) || '刚刚生成') + ' · ' + (r.gender === 'm' ? '男生版' : '女生版') + '</span>' +
      '</span>' +
      '<span class="me-report__tag ' + (unlocked ? 'is-ok' : 'is-lock') + '">' + (unlocked ? '已解锁' : '待解锁') + '</span>' +
      '<span class="me-rowarrow">' + plIcon('arrow', 15, 'currentColor') + '</span>' +
      '</button>';
  }

  function orderRow(o) {
    var status = o.status === 'paid' ? '已支付' : (o.status || '处理中');
    var isVip = o.kind === 'vip' || String(o.title || '').indexOf('钻石会员') >= 0;
    return '<div class="me-listrow me-order">' +
      '<span class="me-order__ico' + (isVip ? ' is-vip' : '') + '">' + plIcon(isVip ? 'crown' : 'book', 17, 'currentColor') + '</span>' +
      '<span class="me-rowtext"><b>' + esc(o.title || '测评订单') + '</b><span>' + esc(fmtDate(o.ts, true) || '刚刚') + ' · ' + esc(status) + '</span></span>' +
      '<span class="me-order__amount">¥' + esc(String(Math.round(Number(o.amount || 0) * 100) / 100)) + '</span>' +
      '</div>';
  }

  function render(root) {
    var s = state();
    var user = s.user || {};
    var list = reports();
    var orderList = orders();
    var vip = vipInfo();
    var nickname = user.nickname || '心迹用户';
    var initial = String(nickname).replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '').charAt(0) || '心';
    var joined = user.joinedAt ? ('加入于 ' + fmtDate(user.joinedAt)) : '今天加入';
    var testCount = list.length;
    var unlockedCount = list.filter(function (r) { return r.unlocked !== false; }).length;

    var reportsHtml = list.length
      ? list.map(reportRow).join('')
      : '<div class="me-empty">' +
        '<span class="me-empty__ico">' + plIcon('book', 22, 'currentColor') + '</span>' +
        '<p><b>还没有测评记录</b><span>完成一次测评，这里会保存你的专属报告</span></p>' +
        '<button type="button" class="me-empty__btn" data-go="#/">去测一次</button>' +
        '</div>';

    var ordersHtml = orderList.length
      ? orderList.map(orderRow).join('')
      : '<div class="me-empty me-empty--slim">' +
        '<span class="me-empty__ico">' + plIcon('coin', 21, 'currentColor') + '</span>' +
        '<p><b>暂无订单</b><span>解锁报告或开通会员后会显示在这里</span></p>' +
        '</div>';

    var funcs = [
      { act: 'fav', ico: 'heart', label: '我的收藏', hint: '0 个' },
      { act: 'service', ico: 'chat', label: '联系客服' },
      { go: '#/agreement', ico: 'book', label: '用户协议' },
      { go: '#/privacy', ico: 'shield', label: '隐私政策' },
      { go: '#/about', ico: 'sparkle', label: '关于我们' },
      { act: 'clear', ico: 'trash', label: '清除本地数据', danger: true }
    ].map(function (f) {
      return '<button type="button" class="me-func' + (f.danger ? ' is-danger' : '') + '" ' +
        (f.go ? 'data-go="' + esc(f.go) + '"' : 'data-act="' + esc(f.act) + '"') + '>' +
        '<span class="me-func__ico">' + plIcon(f.ico, 18, 'currentColor') + '</span>' +
        '<span class="me-func__label">' + esc(f.label) + '</span>' +
        (f.hint ? '<span class="me-func__hint">' + esc(f.hint) + '</span>' : '') +
        '<span class="me-func__arrow">' + plIcon('arrow', 15, 'currentColor') + '</span>' +
        '</button>';
    }).join('');

    root.innerHTML =
      '<div class="page me-page has-tabbar">' +
      '<header class="me-head">' +
      '<h1>我的</h1>' +
      '<span class="me-head__local">' + plIcon('lock', 12, 'currentColor') + '本地数据</span>' +
      '</header>' +

      '<section class="me-user">' +
      '<div class="me-user__glow"></div>' +
      '<span class="me-user__avatar">' + esc(initial) + '</span>' +
      '<div class="me-user__info">' +
      '<div class="me-user__name"><b>' + esc(nickname) + '</b><span class="me-user__tag">演示环境</span></div>' +
      '<p class="me-user__sub">' + esc(joined) + '</p>' +
      '</div>' +
      '<button type="button" class="me-user__login" data-act="login">登录</button>' +
      '</section>' +

      '<section class="me-stats">' +
      '<div class="me-stat"><b>' + testCount + '</b><span>测试次数</span></div>' +
      '<div class="me-stat"><b>' + unlockedCount + '</b><span>报告数</span></div>' +
      '<div class="me-stat"><b>0</b><span>收藏数</span></div>' +
      '</section>' +

      '<button type="button" class="me-vip' + (vip ? ' is-active' : '') + '" data-go="#/vip">' +
      '<span class="me-vip__ico">' + plIcon('crown', 18, 'currentColor') + '</span>' +
      '<span class="me-vip__text">' + (vip
        ? '<b>钻石会员</b><span>' + (vip.expiresAt ? '有效期至 ' + esc(fmtDate(vip.expiresAt)) : '已开通') + ' · 全站测评免费</span>'
        : '<b>开通钻石会员</b><span>全站测评免费，不限次数任意测</span>') + '</span>' +
      '<span class="me-vip__go">' + (vip ? '查看' : '去开通') + plIcon('arrow', 14, 'currentColor') + '</span>' +
      '</button>' +

      '<section class="me-sec">' +
      '<div class="me-sec__head"><h2>我的报告</h2><span>' + (list.length ? '共 ' + list.length + ' 份' : '本地保存') + '</span></div>' +
      '<div class="me-card">' + reportsHtml + '</div>' +
      '</section>' +

      '<section class="me-sec">' +
      '<div class="me-sec__head"><h2>我的订单</h2><span>' + (orderList.length ? '共 ' + orderList.length + ' 笔' : '暂无') + '</span></div>' +
      '<div class="me-card">' + ordersHtml + '</div>' +
      '</section>' +

      '<section class="me-sec">' +
      '<div class="me-sec__head"><h2>更多功能</h2></div>' +
      '<div class="me-card me-funcs">' + funcs + '</div>' +
      '</section>' +

      '<p class="me-foot">心迹测评 v1.0 · 演示环境，数据仅保存在本机</p>' +
      '</div>';

    bind(root);
  }

  function doReset() {
    if (window.Store && typeof Store.reset === 'function') Store.reset();
    if (window.UI) UI.toast('本地数据已清除', 'success');
    if (window.Router) Router.go('#/home');
  }

  function confirmReset() {
    if (confirmOpen) return;
    if (window.UI && typeof UI.confirm === 'function') {
      confirmOpen = true;
      var p = UI.confirm({
        title: '清除本地数据',
        text: '将清空本机的测试记录、报告与订单，且无法恢复。确定继续吗？',
        okText: '确认清除',
        cancelText: '再想想'
      });
      if (p && typeof p.then === 'function') {
        p.then(function (ok) {
          confirmOpen = false;
          if (ok) doReset();
        }, function () { confirmOpen = false; });
      } else {
        confirmOpen = false;
      }
      return;
    }
    if (window.confirm && window.confirm('将清空本机的测试记录、报告与订单，且无法恢复。确定继续吗？')) doReset();
  }

  function openService() {
    if (serviceOpen) return;
    if (window.UI && typeof UI.modal === 'function') {
      serviceOpen = true;
      UI.modal({
        title: '联系客服',
        html: '<div class="me-modal">' +
          '<p>这是演示站点，暂不提供实时客服。你仍可以通过以下信息了解我们的服务时间：</p>' +
          '<div class="me-modal__row"><b>邮箱</b><span>hello@xinji-demo.cn</span></div>' +
          '<div class="me-modal__row"><b>服务时间</b><span>工作日 9:00 – 21:00</span></div>' +
          '<div class="me-modal__row"><b>响应时效</b><span>演示环境不产生真实工单</span></div>' +
          '</div>',
        actions: [{ text: '知道了', primary: true }],
        onClose: function () { serviceOpen = false; }
      });
      return;
    }
    if (window.UI) UI.toast('演示环境暂不提供实时客服', 'info');
  }

  function bind(root) {
    var page = root.querySelector('.me-page');
    if (!page) return;
    page.addEventListener('click', function (e) {
      var t = e.target;
      var actEl = t && t.closest ? t.closest('[data-act]') : null;
      if (actEl) {
        var act = actEl.getAttribute('data-act');
        if (act === 'login') {
          e.preventDefault();
          if (window.UI) UI.toast('演示环境无需登录，当前为本地体验账号', 'info');
          return;
        }
        if (act === 'open-report') {
          e.preventDefault();
          var rid = actEl.getAttribute('data-id');
          if (window.Store && typeof Store.openReport === 'function' && rid) Store.openReport(rid);
          if (window.Router) Router.go('#/report');
          return;
        }
        if (act === 'fav') {
          e.preventDefault();
          if (window.UI) UI.toast('收藏夹还是空的，遇到喜欢的测评可以再来看看', 'info');
          return;
        }
        if (act === 'service') {
          e.preventDefault();
          openService();
          return;
        }
        if (act === 'clear') {
          e.preventDefault();
          confirmReset();
          return;
        }
      }
      var goEl = t && t.closest ? t.closest('[data-go]') : null;
      if (goEl) {
        e.preventDefault();
        if (window.Router) Router.go(goEl.getAttribute('data-go'));
      }
    });
  }

  window.Pages = window.Pages || {};
  window.Pages.mine = {
    title: '我的 · 心迹测评',
    theme: 'platform',
    tabbar: 'mine',
    render: render,
    destroy: function () {}
  };
})();
