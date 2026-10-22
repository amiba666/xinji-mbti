/* ============================================================
 * 心迹测评 · 钻石会员（#/vip）
 * 会员 hero + 6 项权益 + 月卡/年卡 + 模拟支付 + FAQ
 * ============================================================ */
(function () {
  'use strict';

  var PLANS = [
    { key: 'month', name: '月卡', price: 19.9, unit: '30 天', per: '按月计费，随时取消', desc: '先体验一个月，随时开始', badge: '' },
    { key: 'year', name: '年卡', price: 98, unit: '365 天', per: '折合 ¥8.2 / 月', desc: '全年畅测，平均每天不到 3 毛', badge: '推荐' }
  ];

  var BENEFITS = [
    { ico: 'crown', title: '全站测评免费', desc: '站内所有测评无限次畅测' },
    { ico: 'book', title: '深度报告解锁', desc: '每次测评自动生成完整长报告' },
    { ico: 'star', title: '专属会员标识', desc: '个人主页展示钻石会员身份' },
    { ico: 'sparkle', title: '新测评抢先测', desc: '新题包上线会员优先体验' },
    { ico: 'clock', title: '报告永久保存', desc: '保存在本机，随时回看与整理' },
    { ico: 'chat', title: '专属客服通道', desc: '工作日优先响应你的问题' }
  ];

  var FAQS = [
    { q: '会员可以测试哪些内容？', a: '开通后站内全部测评均可免费参与，包含后续上新的题包。当前版本为演示站点，云端的其他测评流程暂未开放，MBTI 测评完整可测。' },
    { q: '开通后可以退款吗？', a: '会员属于虚拟服务，开通后即时生效，原则上不支持无理由退款。演示环境不会产生任何真实扣款，请放心体验。' },
    { q: '会员到期后，报告还在吗？', a: '已生成的报告永久保存在本机「我的报告」中，会员到期后仍可查阅。若需重新测试或解锁新报告，可以续费会员。' }
  ];

  var selected = 'year';
  var payOpen = false;

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

  function latestVipOrder() {
    var list = state().orders || [];
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      if (o && (o.kind === 'vip' || String(o.title || '').indexOf('钻石会员') >= 0)) return o;
    }
    return null;
  }

  function fmtNum(n) {
    if (window.UI && typeof UI.fmtNum === 'function') return UI.fmtNum(n);
    var v = Number(n) || 0;
    return v;
  }

  function fmtDate(ts) {
    if (!ts) return '';
    if (window.UI && typeof UI.fmtDate === 'function') return UI.fmtDate(ts, false);
    var d = new Date(ts);
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  function vipInfo() {
    var s = state();
    if (!s.vip) return null;
    var order = latestVipOrder();
    var expiresAt = order && Number(order.expiresAt) ? Number(order.expiresAt) : 0;
    if (expiresAt && expiresAt < Date.now()) return null;
    return {
      plan: (order && order.plan) || 'year',
      ts: (order && order.ts) || 0,
      expiresAt: expiresAt
    };
  }

  function planByKey(key) {
    for (var i = 0; i < PLANS.length; i++) if (PLANS[i].key === key) return PLANS[i];
    return PLANS[1];
  }

  function purchase(plan) {
    var now = Date.now();
    var current = vipInfo();
    var base = current && current.expiresAt > now ? current.expiresAt : now;
    var expire = new Date(base);
    if (plan.key === 'year') expire.setFullYear(expire.getFullYear() + 1);
    else expire.setDate(expire.getDate() + 30);

    var order = {
      id: 'VIP' + now,
      title: '钻石会员 · ' + plan.name,
      amount: plan.price,
      ts: now,
      status: 'paid',
      kind: 'vip',
      plan: plan.key,
      expiresAt: expire.getTime()
    };
    if (window.Store) {
      if (typeof Store.addOrder === 'function') Store.addOrder(order);
      else if (typeof Store.set === 'function') Store.set({ orders: [order].concat(state().orders || []) });
      if (typeof Store.setVip === 'function') Store.setVip(true);
      else if (typeof Store.set === 'function') Store.set({ vip: true });
    }
    if (window.UI) UI.toast('支付成功，钻石会员已开通', 'success');
    if (window.Router && Router.current && Router.current().path === '/vip') {
      render(document.getElementById('page-root'));
    }
  }

  function openPay(plan) {
    if (payOpen) return;
    var vip = vipInfo();
    var html =
      '<div class="vip-modal">' +
      '<div class="vip-modal__plan"><span>钻石会员 · ' + esc(plan.name) + '</span><b>¥' + esc(String(plan.price)) + '</b></div>' +
      '<p class="vip-modal__tip">' + (vip ? '续费后有效期将从当前到期日顺延。' : '开通后立即生效，全站测评免费。') + '</p>' +
      '<div class="vip-modal__pay"><span class="vip-modal__payico">' + plIcon('check', 15, 'currentColor') + '</span>' +
      '<span class="vip-modal__paytext"><b>微信支付</b><span>演示支付通道 · 不会真实扣款</span></span>' +
      '<span class="vip-modal__radio"><i></i></span></div>' +
      '<div class="vip-modal__pay is-dim"><span class="vip-modal__payico">' + plIcon('coin', 15, 'currentColor') + '</span>' +
      '<span class="vip-modal__paytext"><b>支付宝</b><span>演示支付通道</span></span>' +
      '<span class="vip-modal__radio"></span></div>' +
      '</div>';

    if (window.UI && typeof UI.modal === 'function') {
      payOpen = true;
      UI.modal({
        title: '确认开通钻石会员',
        html: html,
        actions: [
          { text: '取消' },
          { text: '确认支付 ¥' + plan.price, primary: true, onClick: function () { purchase(plan); } }
        ],
        onClose: function () { payOpen = false; }
      });
      return;
    }
    if (window.confirm && window.confirm('模拟支付 ¥' + plan.price + ' 开通钻石会员？')) purchase(plan);
  }

  function render(root) {
    if (!root) return;
    var vip = vipInfo();
    var plan = planByKey(selected);

    var benefitsHtml = BENEFITS.map(function (b) {
      return '<div class="vip-benefit">' +
        '<span class="vip-benefit__ico">' + plIcon(b.ico, 19, 'currentColor') + '</span>' +
        '<b>' + esc(b.title) + '</b><span>' + esc(b.desc) + '</span></div>';
    }).join('');

    var plansHtml = PLANS.map(function (p) {
      return '<button type="button" class="vip-plan' + (p.key === selected ? ' is-active' : '') + '" data-plan="' + p.key + '" role="radio" aria-checked="' + (p.key === selected ? 'true' : 'false') + '">' +
        (p.badge ? '<span class="vip-plan__badge">' + esc(p.badge) + '</span>' : '') +
        '<span class="vip-plan__name">' + esc(p.name) + '</span>' +
        '<span class="vip-plan__price"><i>¥</i>' + esc(String(p.price)) + '</span>' +
        '<span class="vip-plan__per">' + esc(p.per) + '</span>' +
        '<span class="vip-plan__desc">' + esc(p.desc) + '</span>' +
        '<span class="vip-plan__check">' + plIcon('check', 12, 'currentColor') + '</span>' +
        '</button>';
    }).join('');

    var faqHtml = FAQS.map(function (f, i) {
      return '<details class="vip-faq" ' + (i === 0 ? 'open' : '') + '>' +
        '<summary>' + esc(f.q) + '<span class="vip-faq__ico">' + plIcon('arrow', 14, 'currentColor') + '</span></summary>' +
        '<p>' + esc(f.a) + '</p>' +
        '</details>';
    }).join('');

    var buyLabel = (vip ? '续费会员' : '立即开通') + ' · ¥' + plan.price;

    root.innerHTML =
      '<div class="page vip-page has-tabbar">' +
      '<header class="vip-top">' +
      '<h1>会员中心</h1>' +
      '<span class="vip-top__en">XINJI VIP</span>' +
      '</header>' +

      '<section class="vip-hero">' +
      '<div class="vip-hero__rings" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<div class="vip-hero__head">' +
      '<span class="vip-hero__crown">' + plIcon('crown', 24, 'currentColor') + '</span>' +
      '<span class="vip-hero__status">' + (vip ? (vip.expiresAt ? '有效期至 ' + esc(fmtDate(vip.expiresAt)) : '已开通') : '尚未开通') + '</span>' +
      '</div>' +
      '<h2 class="vip-hero__title">钻石会员</h2>' +
      '<p class="vip-hero__sub">全站测评免费 · 深度报告自动解锁 · 不限次数</p>' +
      '<div class="vip-hero__stats">' +
      '<span><b>' + fmtNum(2381027) + '</b>人已开通</span><i></i>' +
      '<span><b>6</b>项专属权益</span><i></i>' +
      '<span><b>低至 ¥8.2</b>/月</span>' +
      '</div>' +
      '<button type="button" class="vip-hero__btn" data-act="scroll">查看会员权益' + plIcon('arrow', 13, 'currentColor') + '</button>' +
      '</section>' +

      '<section class="vip-sec">' +
      '<div class="vip-sec__head"><h2>会员权益</h2><span>开通即享</span></div>' +
      '<div class="vip-benefits">' + benefitsHtml + '</div>' +
      '</section>' +

      '<section class="vip-sec" data-plans>' +
      '<div class="vip-sec__head"><h2>选择套餐</h2><span>随时可续费</span></div>' +
      '<div class="vip-plans" role="radiogroup" aria-label="会员套餐">' + plansHtml + '</div>' +
      '</section>' +

      '<button type="button" class="vip-buy" data-act="buy">' + buyLabel + '</button>' +
      '<p class="vip-buy__note">' + plIcon('lock', 12, 'currentColor') + '演示环境不会产生真实扣款，会员状态仅保存在本机</p>' +

      '<section class="vip-sec vip-sec--faq">' +
      '<div class="vip-sec__head"><h2>会员说明</h2></div>' +
      '<div class="vip-faqs">' + faqHtml + '</div>' +
      '</section>' +

      '<p class="vip-foot">心迹测评 · 会员服务为原创演示内容</p>' +
      '</div>';

    var page = root.querySelector('.vip-page');
    page.addEventListener('click', function (e) {
      var t = e.target;
      var planEl = t && t.closest ? t.closest('[data-plan]') : null;
      if (planEl) {
        selected = planEl.getAttribute('data-plan') || 'year';
        var cards = page.querySelectorAll('[data-plan]');
        Array.prototype.forEach.call(cards, function (el) {
          var on = el.getAttribute('data-plan') === selected;
          el.classList.toggle('is-active', on);
          el.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        var buy = page.querySelector('[data-act="buy"]');
        if (buy) buy.textContent = (vip ? '续费会员' : '立即开通') + ' · ¥' + planByKey(selected).price;
        return;
      }
      var actEl = t && t.closest ? t.closest('[data-act]') : null;
      if (!actEl) return;
      var act = actEl.getAttribute('data-act');
      if (act === 'scroll') {
        e.preventDefault();
        var target = page.querySelector('[data-plans]');
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (act === 'buy') {
        e.preventDefault();
        openPay(planByKey(selected));
      }
    });
  }

  function destroy() {
    selected = 'year';
  }

  window.Pages = window.Pages || {};
  window.Pages.vip = {
    title: '钻石会员 · 心迹测评',
    theme: 'platform',
    tabbar: 'vip',
    render: render,
    destroy: destroy
  };
})();
