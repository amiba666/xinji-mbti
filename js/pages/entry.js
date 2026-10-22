/* ==========================================================================
   落地页 · #/   （绿色 MBTI 主题）
   ========================================================================== */
(function () {
  'use strict';

  var GENDERS = [
    { key: 'm', name: '男生版', img: 'assets/gender-m.svg', count: 210239, hot: false, desc: '以男性视角校准的表达方式' },
    { key: 'f', name: '女生版', img: 'assets/gender-f.svg', count: 331693, hot: true, desc: '以女性视角校准的表达方式' }
  ];

  var FAQS = [
    { q: '这是什么测试？准确吗？', a: '这是基于荣格心理类型理论与 MBTI 框架改编的自评量表，共 42 道情境题。它衡量的是你在四个维度上的倾向强度，而不是给你贴标签。请按第一反应作答，结果会更接近真实的你。' },
    { q: '为什么要分男生版和女生版？', a: '同一句描述在男性和女性成长语境中的理解可能不同。两个版本题目结构一致，只对部分措辞与社会期待做了适配，帮助你更顺畅地代入。' },
    { q: '测试结果会被别人看到吗？', a: '不会。你的作答仅保存在当前设备的浏览器本地（localStorage），用于生成你看到的报告；清除浏览器数据或点击「我的 - 清除本地数据」即可删除。本演示站不上传任何答题数据。' },
    { q: '需要付费吗？', a: '测试本身免费。基础结果（人格类型与四维倾向）免费查看，完整报告包含优势、盲点、亲密关系、职业发展等章节，可选择单份解锁。演示站使用模拟支付，不会产生真实扣款。' },
    { q: '结果可以重新测吗？', a: '可以。人格状态会随阶段变化，建议间隔一段时间再测。报告页与「我的」页面都提供「重新测试」入口。' }
  ];

  var state = { gender: 'f', agreed: false, faqOpen: 0 };

  function preferredGender() {
    try {
      var g = window.Store && window.Store.get && window.Store.get().gender;
      return g === 'm' ? 'm' : 'f';
    } catch (e) { return 'f'; }
  }

  function cardHtml(g, active) {
    return '' +
      '<button type="button" class="land-card' + (active ? ' is-active' : '') + '" data-gender="' + g.key + '" role="radio" aria-checked="' + (active ? 'true' : 'false') + '">' +
        '<span class="land-card__check" aria-hidden="true">' + window.UI.icon('check', 14, '#fff', 3) + '</span>' +
        '<span class="land-card__art"><img src="' + g.img + '" alt="' + g.name + '形象插画" draggable="false"></span>' +
        '<span class="land-card__name">' + g.name + '</span>' +
        '<span class="land-card__desc">' + g.desc + '</span>' +
        '<span class="land-card__meta">' +
          '<span class="land-card__meta-label">近30天</span>' +
          '<span class="land-card__meta-num">' + window.UI.fmtNum(g.count) + '人测试</span>' +
          (g.hot ? '<span class="land-hot">' + window.UI.icon('fire', 10, '#fff', 2) + 'HOT</span>' : '') +
        '</span>' +
      '</button>';
  }

  function render(root) {
    var u = window.UI;
    state.gender = preferredGender();
    try { state.agreed = !!(window.Store && window.Store.get().agreed); } catch (e) { state.agreed = false; }
    var p = window.App.PRODUCTS;
    var mbti = (p && p.items.filter(function (i) { return i.id === 'mbti'; })[0]) || {};

    root.innerHTML = '' +
    '<div class="page land">' +
      /* ---------- 顶部 ---------- */
      '<div class="land-bg" aria-hidden="true">' +
        '<span class="land-bg__ring land-bg__ring--1"></span>' +
        '<span class="land-bg__ring land-bg__ring--2"></span>' +
        '<span class="land-bg__leaf land-bg__leaf--1"></span>' +
        '<span class="land-bg__leaf land-bg__leaf--2"></span>' +
      '</div>' +

      '<header class="land-head">' +
        '<div class="land-brand">' +
          '<img src="assets/logo.svg" alt="" class="land-brand__mark">' +
          '<span class="land-brand__name">心迹测评</span>' +
          '<span class="land-brand__sub">16 型人格 · 中文版</span>' +
        '</div>' +
        '<a class="land-head__btn" href="#/types">' + u.icon('grid', 15) + '<span>16 型图鉴</span></a>' +
      '</header>' +

      /* ---------- Hero ---------- */
      '<section class="land-hero">' +
        '<div class="land-eyebrow"><span class="land-eyebrow__dot"></span>2026 年新题库 · 已更新</div>' +
        '<h1 class="land-title">心迹官方<span class="land-title__hl">MBTI</span>测试</h1>' +
        '<div class="land-title-line"><i></i><span>目前使用广泛的 MBTI 测试</span><i></i></div>' +
      '</section>' +

      /* ---------- 性别选择 ---------- */
      '<section class="land-gender" role="radiogroup" aria-label="选择测试版本">' +
        '<div class="land-gender__grid">' +
          cardHtml(GENDERS[0], state.gender === 'm') + cardHtml(GENDERS[1], state.gender !== 'm') +
        '</div>' +
        '<p class="land-gender__hint">' + u.icon('info', 13) + '<span>请选择与你更贴近的版本，题目措辞会随之微调</span></p>' +
      '</section>' +

      /* ---------- CTA ---------- */
      '<section class="land-cta">' +
        '<button type="button" class="land-btn" id="land-start">' +
          '<span>开始测试</span>' +
          '<span class="land-btn__arrow">' + u.icon('arrow', 20) + '</span>' +
        '</button>' +
        '<div class="land-agree" id="land-agree-row">' +
          '<button type="button" class="land-check' + (state.agreed ? ' is-on' : '') + '" id="land-agree-box" role="checkbox" aria-checked="' + (state.agreed ? 'true' : 'false') + '" aria-labelledby="land-agree-text">' +
            u.icon('check', 12, '#fff', 3) +
          '</button>' +
          '<span class="land-agree__text" id="land-agree-text">我已阅读并同意 <a href="#/agreement" data-doc="agreement">《用户协议》</a> 和 <a href="#/privacy" data-doc="privacy">《隐私政策》</a></span>' +
        '</div>' +
        '<p class="land-agree__hint" id="land-agree-hint" hidden>请先勾选左侧圆圈，再点「开始测试」</p>' +
        '<div class="land-cta__meta">' +
          '<span>' + u.icon('shield', 14) + '本地计算 · 不上传答案</span>' +
          '<span class="land-cta__sep"></span>' +
          '<span>' + u.icon('clock', 14) + '约 6 分钟</span>' +
          '<span class="land-cta__sep"></span>' +
          '<span>' + u.icon('user', 14) + '已有 ' + u.fmtNum(331693) + ' 人参与</span>' +
        '</div>' +
      '</section>' +

      /* ---------- 介绍 ---------- */
      '<section class="land-section land-intro">' +
        '<div class="land-card-wrap">' +
          '<span class="land-ribbon">2026 全新版</span>' +
          '<h2 class="land-h2"><span class="land-h2__deco">全新版介绍</span></h2>' +
          '<p class="land-p">MBTI 性格理论始于心理学家荣格的心理类型学说，后由 Katharine Cook Briggs 与 Isabel Briggs Myers 深入研究并发展成型，如今已被翻译成数十种语言，是全球使用最广泛的人格类型工具之一。</p>' +
          '<p class="land-p">每年有数百万人通过它重新认识自己：为什么你在人群中容易疲惫，为什么你总在细节与可能之间摇摆，为什么同样的沟通方式在别人那里有效、在你这里却行不通。</p>' +
          '<p class="land-p">本版本为 2026 年全新整理的题库，从 <b>能量来源</b>、<b>信息获取</b>、<b>决策方式</b>、<b>生活态度</b> 四个维度展开，并在核心题之后追加「隐藏人格」与「人格校准」两段，帮助你更稳定地落在自己真实的位置上。</p>' +
          '<div class="land-dim-grid">' +
            dimCard('E / I', '能量来源', '你从哪里获得能量') +
            dimCard('S / N', '信息获取', '你如何理解世界') +
            dimCard('T / F', '决策方式', '你依据什么做决定') +
            dimCard('J / P', '生活态度', '你如何安排生活') +
          '</div>' +
        '</div>' +
      '</section>' +

      /* ---------- 四大优势 ---------- */
      '<section class="land-section">' +
        '<h2 class="land-h2"><span class="land-h2__deco">四大优势</span></h2>' +
        '<p class="land-sub">从题库设计到报告呈现，每一步都为「更懂你」服务</p>' +
        '<div class="land-adv">' +
          adv('book', '原创情境题库', '42 道生活化情境题，避免生硬术语，按第一反应作答即可。') +
          adv('target', '四维建模', '分别刻画能量、信息、决策与节奏，给出倾向强度而非简单贴标签。') +
          adv('sparkle', '可视化报告', '四维倾向条、人格雷达与分层解读，读起来像一本小杂志。') +
          adv('shield', '隐私优先', '所有计算在本地完成，答案不上传，随时可一键清除。') +
        '</div>' +
      '</section>' +

      /* ---------- 流程 ---------- */
      '<section class="land-section">' +
        '<h2 class="land-h2"><span class="land-h2__deco">测评流程</span></h2>' +
        '<div class="land-steps">' +
          step(1, '选择版本', '按当下的自己选择男生版或女生版') +
          step(2, '完成 42 题', '三段式作答，中途可返回修改') +
          step(3, '查看报告', '类型、维度与完整解读一键生成') +
        '</div>' +
      '</section>' +

      /* ---------- 适合谁 ---------- */
      '<section class="land-section">' +
        '<h2 class="land-h2"><span class="land-h2__deco">适合这样的你</span></h2>' +
        '<ul class="land-fit">' +
          fit('总在关系里重复同一种困扰，想知道为什么') +
          fit('面对选择容易内耗，想更清楚自己的偏好') +
          fit('好奇自己在人群中的位置，但不想要娱乐化的标签') +
          fit('希望把「我是谁」变成可以落地的成长方向') +
        '</ul>' +
      '</section>' +

      /* ---------- FAQ ---------- */
      '<section class="land-section">' +
        '<h2 class="land-h2"><span class="land-h2__deco">常见问题</span></h2>' +
        '<div class="land-faq" id="land-faq">' +
          FAQS.map(function (f, i) {
            return '<div class="land-faq__item' + (i === 0 ? ' is-open' : '') + '" data-faq="' + i + '">' +
              '<button type="button" class="land-faq__q"><span>' + u.escape(f.q) + '</span><i>' + u.icon('chevron-down', 16) + '</i></button>' +
              '<div class="land-faq__a"><div class="land-faq__a-inner">' + u.escape(f.a) + '</div></div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>' +

      /* ---------- 页脚 ---------- */
      '<footer class="land-foot">' +
        '<div class="land-foot__brand"><img src="assets/logo.svg" alt=""><span>心迹测评</span></div>' +
        '<p class="land-foot__note">本测评为自我探索工具，结果不构成心理诊断或医疗建议。如你正经历持续的情绪困扰，请寻求专业心理帮助。</p>' +
        '<div class="land-foot__links">' +
          '<a href="#/about">关于我们</a><i></i><a href="#/agreement">用户协议</a><i></i><a href="#/privacy">隐私政策</a><i></i><a href="#/types">16 型图鉴</a>' +
        '</div>' +
        '<p class="land-foot__copy">© 2026 心迹测评 · 演示站点（复刻练习项目）</p>' +
      '</footer>' +

      /* ---------- 吸底 CTA ---------- */
      '<div class="land-sticky" id="land-sticky">' +
        '<div class="land-sticky__info"><b>MBTI 人格测试</b><span>42 题 · 约 6 分钟</span></div>' +
        '<button type="button" class="btn btn--primary land-sticky__btn" id="land-start-sticky">开始测试</button>' +
      '</div>' +
    '</div>';

    bind(root);
  }

  function dimCard(code, name, desc) {
    return '<div class="land-dim"><b>' + code + '</b><span>' + name + '</span><i>' + desc + '</i></div>';
  }
  function adv(icon, title, desc) {
    return '<div class="land-adv__item">' +
      '<span class="land-adv__icon">' + window.UI.icon(icon, 22) + '</span>' +
      '<div><b>' + title + '</b><p>' + desc + '</p></div>' +
    '</div>';
  }
  function step(n, title, desc) {
    return '<div class="land-step"><span class="land-step__n">0' + n + '</span><div><b>' + title + '</b><p>' + desc + '</p></div></div>';
  }
  function fit(text) {
    return '<li>' + window.UI.icon('check', 14) + '<span>' + text + '</span></li>';
  }

  function bind(root) {
    var u = window.UI;
    /* 事件全部委托到「本次渲染」的页面根节点，页面销毁即失效，避免重复绑定 */
    var page = root.querySelector('.land') || root;
    var sticky = page.querySelector('#land-sticky');

    /* 性别切换 */
    u.on(page, '.land-card', 'click', function (e, el) {
      var g = el.getAttribute('data-gender');
      if (!g || state.gender === g) return;
      state.gender = g;
      try { window.Store.set({ gender: g }); } catch (e) {}
      u.haptic();
      page.querySelectorAll('.land-card').forEach(function (c) {
        var on = c.getAttribute('data-gender') === g;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-checked', on ? 'true' : 'false');
      });
    });

    /* 同意协议：整行可点（含圆点以外的文字区域） */
    function toggleAgree(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      state.agreed = !state.agreed;
      try { window.Store.set({ agreed: state.agreed }); } catch (err) {}
      var box = page.querySelector('#land-agree-box');
      if (box) {
        box.classList.toggle('is-on', state.agreed);
        box.setAttribute('aria-checked', state.agreed ? 'true' : 'false');
      }
      var row = page.querySelector('#land-agree-row');
      if (row) row.classList.remove('is-warn');
      var hint = page.querySelector('#land-agree-hint');
      if (hint) hint.hidden = state.agreed;
      u.haptic(6);
    }
    u.on(page, '#land-agree-row', 'click', function (e) {
      // 点击协议链接时不切换勾选
      if (e.target && e.target.closest && e.target.closest('a')) return;
      toggleAgree(e);
    });
    var agreeBox = page.querySelector('#land-agree-box');
    if (agreeBox) {
      agreeBox.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAgree(e); }
      });
    }
    /* 协议链接不被整行点击吞掉 */
    u.on(page, 'a[data-doc]', 'click', function (e) {
      e.stopPropagation();
    });

    /* 开始测试：未勾选协议时不再直接跳走（避免用户卡在协议页），
       而是高亮协议行 + 弹窗一键「同意并开始」 */
    function warnAgree() {
      var row = page.querySelector('#land-agree-row');
      var hint = page.querySelector('#land-agree-hint');
      if (row) {
        row.classList.remove('is-warn');
        void row.offsetWidth;
        row.classList.add('is-warn');
        try { row.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
      }
      if (hint) hint.hidden = false;
      u.haptic(20);
      u.modal({
        title: '开始前先确认一下',
        text: '本测试需要你已阅读并同意《用户协议》和《隐私政策》。',
        actions: [
          {
            text: '先看看协议',
            onClick: function () { window.Router.go('#/agreement'); }
          },
          {
            text: '同意并开始',
            primary: true,
            onClick: function () {
              state.agreed = true;
              try { window.Store.set({ agreed: true }); } catch (e) {}
              var box = page.querySelector('#land-agree-box');
              if (box) { box.classList.add('is-on'); box.setAttribute('aria-checked', 'true'); }
              if (hint) hint.hidden = true;
              if (row) row.classList.remove('is-warn');
              start();
            }
          }
        ]
      });
    }

    function start() {
      if (!state.agreed) {
        warnAgree();
        return;
      }
      window.Store.set({ gender: state.gender });
      window.Store.startTest(state.gender);
      window.Router.go('#/exam');
    }
    var b1 = page.querySelector('#land-start');
    var b2 = page.querySelector('#land-start-sticky');
    if (b1) b1.addEventListener('click', start);
    if (b2) b2.addEventListener('click', start);

    /* FAQ 手风琴 */
    u.on(page, '.land-faq__item', 'click', function (e, el) {
      var items = page.querySelectorAll('.land-faq__item');
      var isOpen = el.classList.contains('is-open');
      items.forEach(function (it) {
        it.classList.remove('is-open');
        var a = it.querySelector('.land-faq__a');
        if (a) a.style.maxHeight = '0px';
      });
      if (!isOpen) {
        el.classList.add('is-open');
        var a2 = el.querySelector('.land-faq__a');
        if (a2) a2.style.maxHeight = a2.scrollHeight + 20 + 'px';
      }
    });
    /* 初始展开第一项 */
    var firstA = page.querySelector('.land-faq__item.is-open .land-faq__a');
    if (firstA) requestAnimationFrame(function () { firstA.style.maxHeight = firstA.scrollHeight + 20 + 'px'; });

    /* 吸底条显隐 */
    function onScroll() {
      if (!sticky) return;
      var y = window.innerWidth >= 900 ? (document.getElementById('device') || {}).scrollTop || 0 : window.scrollY || 0;
      sticky.classList.toggle('is-show', y > 520);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    var dev = document.getElementById('device');
    if (dev) dev.addEventListener('scroll', onScroll, { passive: true });
    bind._dev = dev;
    bind._onScroll = onScroll;
    onScroll();
  }

  window.Pages.entry = {
    title: '心迹测评 · 官方 MBTI 人格测试 2026',
    theme: 'green',
    tabbar: null,
    render: render,
    destroy: function () {
      if (bind._onScroll) {
        window.removeEventListener('scroll', bind._onScroll);
        if (bind._dev) bind._dev.removeEventListener('scroll', bind._onScroll);
        bind._onScroll = null;
      }
    }
  };
})();
