/*! 心迹测评 · 付费墙 | window.Pages.paywall */
(function () {
  'use strict';

  var PRICE = 9.9;
  var ORIGIN = 29.9;
  var COUNTDOWN_KEY = 'xinji_pay_deadline_v1';
  var COUNTDOWN_MS = 15 * 60 * 1000;
  var UNLOCK_BASE = 2381027;

  var timer = null;
  var successEl = null;
  var buyLocked = false;

  function esc(s) { return window.UI.escape(s == null ? '' : s); }
  function infoOf(code) {
    var all = (window.DATA_TYPES && window.DATA_TYPES.types) || {};
    return all[code] || null;
  }
  function groupOf(key) {
    var groups = (window.DATA_TYPES && window.DATA_TYPES.groups) || [];
    for (var i = 0; i < groups.length; i++) if (groups[i].key === key) return groups[i];
    return groups[0] || { name: '人格', color: '#88619a' };
  }

  /* 从一段长文本里取前 n 句 */
  function firstSentences(text, n) {
    var parts = String(text || '').split('。');
    var out = [];
    for (var i = 0; i < parts.length && out.length < n; i++) {
      var s = parts[i].trim();
      if (s) out.push(s + '。');
    }
    return out.join('');
  }

  function dimsHtml(dims) {
    if (!dims || !dims.length) return '';
    return dims.map(function (d) {
      var left = Math.max(2, Math.min(98, Math.round(Number(d.leftPct) || 50)));
      var domLeft = left >= 50;
      return '' +
        '<div class="pay-dim' + (domLeft ? ' is-left' : '') + '">' +
          '<div class="pay-dim__top">' +
            '<span class="pay-dim__letter">' + esc(d.left || '') + '</span>' +
            '<span class="pay-dim__pct">' + left + '%</span>' +
            '<span class="pay-dim__pct pay-dim__pct--r">' + (100 - left) + '%</span>' +
            '<span class="pay-dim__letter">' + esc(d.right || '') + '</span>' +
          '</div>' +
          '<div class="pay-dim__track"><i style="width:' + left + '%"></i></div>' +
        '</div>';
    }).join('');
  }

  function benefitsHtml() {
    var items = [
      { icon: 'book', t: '完整 10 个板块', d: '性格概述、爱情、职业、人际、成长建议全部解锁' },
      { icon: 'target', t: '四维 + 六维图表', d: '倾向条与特质雷达逐项拆解，看见你的能量结构' },
      { icon: 'sparkle', t: '优势与盲点清单', d: '4 项核心天赋 + 3 个需要留意的惯性' },
      { icon: 'shield', t: '永久保存', d: '报告长期可查，随时回看，也能分享给朋友' }
    ];
    return items.map(function (it) {
      return '<li class="pay-benefit">' +
        '<span class="pay-benefit__ic">' + window.UI.icon(it.icon, 18) + '</span>' +
        '<span class="pay-benefit__txt"><b>' + esc(it.t) + '</b><em>' + esc(it.d) + '</em></span>' +
        '</li>';
    }).join('');
  }

  function previewHtml(info, result) {
    var blocks = [];
    if (info) {
      blocks.push(
        '<div class="pay-pv-block">' +
          '<div class="pay-pv-label">性格概述</div>' +
          '<p>' + esc(firstSentences(info.summary, 2)) + '</p>' +
        '</div>'
      );
      var adv = (info.strengths || []).slice(0, 2).map(function (s) {
        return '<li><b>' + esc(s.t) + '</b>' + esc(firstSentences(s.d, 1)) + '</li>';
      }).join('');
      if (adv) {
        blocks.push(
          '<div class="pay-pv-block">' +
            '<div class="pay-pv-label">核心优势</div>' +
            '<ul class="pay-pv-list">' + adv + '</ul>' +
          '</div>'
        );
      }
      if (info.love) {
        blocks.push(
          '<div class="pay-pv-block">' +
            '<div class="pay-pv-label">爱情与亲密关系</div>' +
            '<p class="pay-pv-quote">「' + esc(info.love.lead) + '」</p>' +
            '<p>' + esc(firstSentences(info.love.desc, 2)) + '</p>' +
          '</div>'
        );
      }
      if (info.career) {
        blocks.push(
          '<div class="pay-pv-block">' +
            '<div class="pay-pv-label">职业与发展</div>' +
            '<p>' + esc(firstSentences(info.career.desc, 1)) + '</p>' +
          '</div>'
        );
      }
      if (info.social) {
        blocks.push(
          '<div class="pay-pv-block">' +
            '<div class="pay-pv-label">人际与社交</div>' +
            '<p>' + esc(firstSentences(info.social.desc, 1)) + '</p>' +
          '</div>'
        );
      }
    } else {
      var d = (result && result.dims) || [];
      blocks.push(
        '<div class="pay-pv-block">' +
          '<div class="pay-pv-label">性格概述</div>' +
          '<p>你的四维倾向已完成计算：' +
            d.map(function (x) {
              var l = Math.round(Number(x.leftPct) || 50);
              return (l >= 50 ? x.left : x.right) + ' 偏 ' + (l >= 50 ? l : 100 - l) + '%';
            }).join('，') + '。完整内容将在解锁后展开。</p>' +
        '</div>'
      );
    }
    return blocks.join('');
  }

  function startCountdown(root) {
    var el = root.querySelector('[data-countdown]');
    if (!el) return;
    function readDeadline() {
      var now = Date.now();
      var v = 0;
      try { v = Number(sessionStorage.getItem(COUNTDOWN_KEY)) || 0; } catch (e) { v = 0; }
      if (!v || v - now > COUNTDOWN_MS || v < now - COUNTDOWN_MS) {
        v = now + COUNTDOWN_MS;
        try { sessionStorage.setItem(COUNTDOWN_KEY, String(v)); } catch (e) {}
      }
      return v;
    }
    var deadline = readDeadline();
    function fmt(ms) {
      var total = Math.max(0, Math.floor(ms / 1000));
      var m = Math.floor(total / 60);
      var s = total % 60;
      return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }
    function tick() {
      var left = deadline - Date.now();
      if (left <= 0) {
        el.textContent = '活动已结束';
        el.classList.add('is-end');
        var wrap = el.closest('.pay-count');
        if (wrap) wrap.classList.add('is-end');
        if (timer) { clearInterval(timer); timer = null; }
        return;
      }
      el.textContent = fmt(left);
    }
    tick();
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 1000);
  }

  function showSuccess() {
    var el = document.createElement('div');
    el.className = 'pay-success';
    el.innerHTML =
      '<div class="pay-success__card">' +
        '<span class="pay-success__ring">' + window.UI.icon('check', 34) + '</span>' +
        '<div class="pay-success__title">解锁成功</div>' +
        '<div class="pay-success__desc">正在为你展开完整的十六型人格报告…</div>' +
      '</div>';
    document.body.appendChild(el);
    successEl = el;
    requestAnimationFrame(function () { el.classList.add('is-in'); });
  }

  function removeSuccess() {
    if (successEl) {
      if (successEl.parentNode) successEl.parentNode.removeChild(successEl);
      successEl = null;
    }
  }

  function openPayModal() {
    if (buyLocked) return;
    var method = 'wechat';
    var html =
      '<div class="pay-methods" role="radiogroup" aria-label="支付方式">' +
        '<button type="button" class="pay-method is-on" data-method="wechat" role="radio" aria-checked="true">' +
          '<span class="pay-method__ic pay-method__ic--wx">' + window.UI.icon('wechat', 22) + '</span>' +
          '<span class="pay-method__name">微信支付</span>' +
          '<span class="pay-method__radio"></span>' +
        '</button>' +
        '<button type="button" class="pay-method" data-method="alipay" role="radio" aria-checked="false">' +
          '<span class="pay-method__ic pay-method__ic--ali">' + window.UI.icon('alipay', 22) + '</span>' +
          '<span class="pay-method__name">支付宝</span>' +
          '<span class="pay-method__radio"></span>' +
        '</button>' +
      '</div>' +
      '<div class="pay-summary">' +
        '<div><span>十六型人格 · 完整报告</span><small>原价 ¥' + ORIGIN + '</small></div>' +
        '<b>¥' + PRICE + '</b>' +
      '</div>' +
      '<p class="pay-demo-note">演示环境：模拟支付，不会产生真实扣款，也不会收集账户信息。</p>';

    var m = window.UI.modal({
      title: '选择支付方式',
      html: html,
      dismissible: true,
      actions: [
        { text: '再想想', onClick: function () {} },
        {
          text: '确认支付 ¥' + PRICE,
          primary: true,
          onClick: function () {
            payAndUnlock(method);
          }
        }
      ]
    });

    if (m && m.body) {
      m.body.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-method]') : null;
        if (!btn) return;
        method = btn.getAttribute('data-method') || 'wechat';
        var list = m.body.querySelectorAll('[data-method]');
        for (var i = 0; i < list.length; i++) {
          var on = list[i] === btn;
          list[i].classList.toggle('is-on', on);
          list[i].setAttribute('aria-checked', on ? 'true' : 'false');
        }
        window.UI.haptic(6);
      });
    }
  }

  function payAndUnlock(method) {
    if (buyLocked) return;
    buyLocked = true;
    var store = window.Store;
    var ok = false;
    try { ok = store.unlockReport(); } catch (e) { ok = false; }
    if (!ok) {
      buyLocked = false;
      window.UI.toast('支付未完成，请稍后再试', 'error');
      return;
    }
    window.UI.haptic(12);
    showSuccess();
    setTimeout(function () {
      removeSuccess();
      buyLocked = false;
      window.Router.replace('#/report');
    }, 1150);
  }

  window.Pages = window.Pages || {};
  window.Pages.paywall = {
    title: '解锁你的完整报告 · 心迹测评',
    theme: 'platform',
    tabbar: null,

    render: function (root) {
      var store = window.Store;
      var state = store.state;

      if (state.unlocked) {
        window.Router.replace('#/report');
        return;
      }
      var result = state.result;
      if (!result || !result.code) {
        window.Router.replace('#/');
        return;
      }

      var info = infoOf(result.code);
      var group = groupOf((info && info.group) || result.group);
      var name = (info && info.name) || result.name || result.code;
      var en = (info && info.en) || result.en || '';
      var rarity = (info && info.rarity) || result.rarity || '';
      var tagline = (info && info.tagline) || result.tagline || '';
      var rarityNum = parseFloat(rarity) || 4;
      var code = String(result.code || '').toUpperCase();
      var isMember = !!(state.vip);

      root.innerHTML =
        '<div class="page pay-page">' +
          '<header class="pay-hero" style="--pay-group:' + esc(group.color) + '">' +
            '<span class="pay-hero__orb pay-hero__orb--a" aria-hidden="true"></span>' +
            '<span class="pay-hero__orb pay-hero__orb--b" aria-hidden="true"></span>' +
            '<button type="button" class="pay-hero__back" data-back aria-label="返回上一页">' + window.UI.icon('back', 20) + '</button>' +
            '<div class="pay-hero__eyebrow"><i class="pay-dot"></i>你的十六型人格报告已生成</div>' +
            '<div class="pay-hero__code">' + esc(code) + '</div>' +
            '<h1 class="pay-hero__name">' + esc(name) + '<span>' + esc(en) + '</span></h1>' +
            '<p class="pay-hero__tagline">' + esc(tagline) + '</p>' +
            '<div class="pay-hero__pills">' +
              '<span class="pay-pill">' + esc(group.name) + '组</span>' +
              '<span class="pay-pill">人群占比 ' + esc(rarity) + '</span>' +
              '<span class="pay-pill pay-pill--warm">' + (state.gender === 'm' ? '男生版' : '女生版') + '</span>' +
            '</div>' +
            '<div class="pay-dims">' + dimsHtml(result.dims) + '</div>' +
          '</header>' +

          '<div class="pay-body">' +
            '<section class="card pay-preview" aria-label="报告预览">' +
              '<div class="pay-preview__head">' +
                '<span class="tag">报告预览</span>' +
                '<h2 class="pay-preview__title">' + esc(name) + '专属深度报告</h2>' +
                '<p class="pay-preview__sub">你的四维能量分布：' + esc(code.split('').join(' · ')) + '</p>' +
              '</div>' +
              '<div class="pay-preview__stage">' +
                '<div class="pay-preview__body">' + previewHtml(info, result) + '</div>' +
                '<div class="pay-preview__veil" aria-hidden="true"></div>' +
                '<div class="pay-preview__note">' +
                  '<span class="pay-preview__more">以下内容解锁后可见</span>' +
                  '<span class="pay-preview__lock">' + window.UI.icon('lock', 18) + '解锁后查看完整 10 个板块</span>' +
                '</div>' +
              '</div>' +
              '<div class="pay-preview__foot">' +
                '<span class="pay-preview__count"><b>10</b> 个板块</span>' +
                '<span class="pay-preview__sep"></span>' +
                '<span class="pay-preview__count"><b>' + rarityNum + '</b>% 人群同款</span>' +
                '<span class="pay-preview__sep"></span>' +
                '<span class="pay-preview__count"><b>6</b> 维特质图表</span>' +
              '</div>' +
            '</section>' +

            '<section class="card pay-price" aria-label="价格与权益">' +
              '<div class="pay-price__top">' +
                '<div class="pay-price__left">' +
                  '<div class="pay-price__label">限时特惠</div>' +
                  '<div class="pay-price__amount">' +
                    '<span class="pay-price__cur">¥</span><span class="pay-price__now">' + PRICE + '</span>' +
                    '<span class="pay-price__old">原价 ¥' + ORIGIN + '</span>' +
                  '</div>' +
                  '<div class="pay-price__once">一次购买 · 永久查看</div>' +
                '</div>' +
                '<div class="pay-count">' +
                  '<div class="pay-count__label">' + window.UI.icon('clock', 13) + '优惠倒计时</div>' +
                  '<div class="pay-count__time" data-countdown>15:00</div>' +
                '</div>' +
              '</div>' +
              '<ul class="pay-benefits">' + benefitsHtml() + '</ul>' +
            '</section>' +

            '<section class="pay-cta" aria-label="解锁报告">' +
              '<button type="button" class="btn btn--primary btn--lg btn--block pay-cta__main" data-buy>' +
                '<span>' + window.UI.icon(isMember ? 'crown' : 'unlock', 20) + '</span>' +
                '<span>' + (isMember ? '会员免费 · 解锁完整报告' : '解锁我的个人报告') + '</span>' +
                (isMember ? '<em>会员权益</em>' : '<em>¥' + PRICE + '</em>') +
              '</button>' +
              '<div class="pay-social">' +
                '<span class="pay-social__avatars" aria-hidden="true">' +
                  '<i>心</i><i>迹</i><i>测</i><i>评</i>' +
                '</span>' +
                '<span class="pay-social__text">已有 <b class="num">' + window.UI.fmtNum(UNLOCK_BASE) + '</b> 人解锁完整报告</span>' +
              '</div>' +
              '<button type="button" class="pay-vip" data-vip>' +
                '<span>' + window.UI.icon('crown', 18) + '开通会员，全站测评免费</span>' +
                window.UI.icon('chevron-right', 16) +
              '</button>' +
              '<p class="pay-safe">' + window.UI.icon('shield', 13) + '演示环境 · 模拟支付，不会产生真实扣款</p>' +
            '</section>' +

            '<footer class="pay-foot">' +
              '<p>报告内容基于你的答题倾向生成，用于自我了解与参考，不构成医学或心理学诊断。</p>' +
              '<p class="pay-foot__brand">心迹测评 · 16 Personalities</p>' +
            '</footer>' +
          '</div>' +
        '</div>';

      /* 事件 */
      var back = root.querySelector('[data-back]');
      if (back) {
        back.addEventListener('click', function () {
          if (window.history.length > 1) window.Router.back();
          else window.Router.go('#/');
        });
      }
      var buy = root.querySelector('[data-buy]');
      if (buy) {
        buy.addEventListener('click', function () {
          window.UI.haptic(8);
          if (isMember) {
            // 会员权益：全站测评免费，直接解锁，不产生订单
            var ok = false;
            try { ok = window.Store.unlockReport(true); } catch (e) { ok = false; }
            if (ok) {
              window.UI.toast('钻石会员权益已生效，报告已解锁', 'success');
              setTimeout(function () { window.Router.go('#/report'); }, 500);
            } else {
              window.UI.toast('解锁失败，请重试', 'error');
            }
            return;
          }
          openPayModal();
        });
      }
      var vip = root.querySelector('[data-vip]');
      if (vip) {
        vip.addEventListener('click', function () { window.Router.go('#/vip'); });
      }

      startCountdown(root);
    },

    destroy: function () {
      if (timer) { clearInterval(timer); timer = null; }
      buyLocked = false;
      removeSuccess();
    }
  };
})();
