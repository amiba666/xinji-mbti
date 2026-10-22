/* ============================================================
 * 心迹测评 · 文档页（#/about、#/agreement、#/privacy）
 * 三页共用一套原创排版与可读条款
 * ============================================================ */
(function () {
  'use strict';

  var UPDATED = '2026 年 10 月 1 日';

  var META = {
    about: {
      title: '关于我们',
      kicker: 'ABOUT XINJI',
      lead: '心迹测评是一个为中文用户打造的心理测评与自我探索平台。我们相信，认识自己不是给自己贴标签，而是获得更多选择的自由。',
      chips: ['原创内容', '本地保存', '体验优先'],
      sections: [
        {
          h: '我们是谁',
          ps: [
            '心迹测评由一支小规模的独立团队发起，成员来自心理测量、内容策划与前端工程三个方向。我们希望把专业测评中「可理解、可行动」的部分，翻译成更轻、更友好的日常体验。',
            '目前站点提供人格、情感、心理健康、职场与能力等方向的测评内容。每一个题目、每一段解读，都由团队重新撰写与校对，不使用来源不明的题库或未经授权的素材。'
          ]
        },
        {
          h: '我们如何做内容',
          ps: [
            '一份测评上线前，会经历题目设计、内部试答、表述打磨与结果校对四个步骤。我们尽量避免绝对化、诊断式的措辞，把结论写成可以被讨论、被修正的描述。',
            '测评结果不是判决书。它更像一面整理过的镜子：帮你看清当下的偏好与惯性，也提醒你，人有变化的余地。如果你正经历持续的情绪困扰，请优先寻求专业心理或医疗帮助。'
          ]
        },
        {
          h: '数据如何保存',
          ps: [
            '当前版本是纯前端演示站点。你的作答记录、报告与订单只保存在本机浏览器的本地存储中，不会上传到服务器，也不会用于广告或画像。',
            '你可以随时在「我的 - 清除本地数据」中删除全部记录。清除后无法恢复，但也不会影响你重新开始一次测评。'
          ]
        },
        {
          h: '联系我们',
          ps: [
            '如果你对内容有建议、发现表述错误，或希望合作，可以写信到 hello@xinji-demo.cn。工作日 9:00 – 21:00 我们会尽量回复。',
            '演示站点不设真实客服与工单系统，页面中的价格、订单与会员状态均为交互演示，不产生任何真实交易。'
          ]
        }
      ]
    },

    agreement: {
      title: '用户协议',
      kicker: 'TERMS OF SERVICE',
      lead: '欢迎使用心迹测评。在开始使用前，请花几分钟阅读本协议。继续使用本站服务，即表示你已理解并同意以下约定。',
      chips: ['服务说明', '本地数据', '结果性质'],
      sections: [
        {
          h: '服务说明',
          ps: [
            '心迹测评提供心理测评、结果解读与相关内容浏览服务。当前版本为演示站点，部分功能（包括支付、登录、客服与部分测评流程）仅作交互演示，不构成真实商业服务。',
            '我们可能根据运营与体验需要调整页面结构、测评内容或功能入口，调整后的内容以页面实际展示为准。'
          ]
        },
        {
          h: '账号与本地数据',
          ps: [
            '演示环境无需注册账号，页面默认使用「心迹用户」作为体验身份。你的测评记录、报告与订单保存在本机浏览器中，不与其他设备同步。',
            '请勿在公共设备上保存包含个人隐私的测评结果。你也可以随时通过「清除本地数据」删除本机记录。'
          ]
        },
        {
          h: '测评结果的性质',
          ps: [
            '本站所有测评结果仅用于自我探索与娱乐参考，不构成心理诊断、医学建议或专业咨询意见，也不能替代医生、心理咨询师的面诊与评估。',
            '如果你或身边的人正处于危机状态，请及时联系当地心理援助热线或医疗机构，不要仅依赖线上测评结果。'
          ]
        },
        {
          h: '付费与会员服务',
          ps: [
            '页面展示的测评价格、会员套餐与订单信息均为演示数据，演示环境不会发起真实支付，也不会产生扣款。',
            '在真实服务场景中，虚拟内容与会员权益一经开通通常不支持无理由退款；具体规则应以实际购买页面的说明为准。'
          ]
        },
        {
          h: '用户行为规范',
          ps: [
            '你同意以合法、友善的方式使用本站，不进行恶意攻击、批量抓取、逆向破解或干扰服务正常运行的行为。',
            '本站原创的题目、文案、图形与界面设计受法律保护。未经许可，请勿将其用于商业转载、二次售卖或冒充官方发布。'
          ]
        },
        {
          h: '协议变更与免责',
          ps: [
            '我们可能根据功能变化更新本协议。更新后的协议会在本页发布，并标注更新日期。继续使用即视为接受更新内容。',
            '因设备、浏览器、网络或不可抗力导致的服务中断、数据丢失，本站将在合理范围内协助排查，但不承担超出法律规定范围的赔偿责任。'
          ]
        }
      ]
    },

    privacy: {
      title: '隐私政策',
      kicker: 'PRIVACY POLICY',
      lead: '我们尽量少收集、不过度使用。下面用尽量直白的语言说明：在心迹测评，你的信息会被如何对待。',
      chips: ['不追踪', '不上传', '可删除'],
      sections: [
        {
          h: '我们收集哪些信息',
          ps: [
            '演示站点不要求注册，也不收集手机号、身份证件或精确位置。你在测评中提交的选项、生成的报告、订单记录，仅保存在本机浏览器。',
            '为了完成页面交互，我们会在本地记录少量偏好信息（例如最近一次的测评进度），这些信息不会离开你的设备。'
          ]
        },
        {
          h: '信息如何存储',
          ps: [
            '所有记录使用浏览器本地存储保存，存储位置由你的浏览器管理。更换设备、清理浏览器缓存或使用无痕模式，都可能导致记录丢失。',
            '本演示站点不设后端账号体系，因此不存在「云端同步」；请勿将其作为正式的心理档案使用。'
          ]
        },
        {
          h: '信息的使用目的',
          ps: [
            '本地数据仅用于向你展示测评进度、历史报告与订单状态，帮助你连贯地完成一次自我探索。',
            '我们不会将你的作答内容用于广告投放、用户画像、模型训练或任何商业分析。'
          ]
        },
        {
          h: '第三方与共享',
          ps: [
            '本站不接入第三方统计、广告或社交 SDK，不向任何第三方共享、出售或转让你的测评记录。',
            '页面中的外链（如有）会跳转至第三方站点，其隐私实践由对应站点负责，请在访问前自行判断。'
          ]
        },
        {
          h: '你的权利',
          ps: [
            '你可以随时查看本机保存的报告与订单，也可以在「我的」页面一键清除全部本地数据。清除后记录无法恢复。',
            '如果你对数据处理方式有疑问，可以通过 hello@xinji-demo.cn 与我们联系，我们会在合理时间内答复。'
          ]
        },
        {
          h: '未成年人保护',
          ps: [
            '若你未满 18 周岁，请在监护人指导下使用本站测评，并避免填写任何真实身份信息。',
            '未成年人如遇情绪困扰，应优先向监护人、学校心理老师或专业机构求助，线上测评不能替代必要的支持与干预。'
          ]
        }
      ]
    }
  };

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

  function resolveKind(params, third) {
    var cand = null;
    if (third && META[third]) return third;
    if (params && typeof params === 'string') cand = params;
    else if (params && params.length) cand = params[0];
    if (META[cand]) return cand;
    var path = '';
    if (window.Router && typeof Router.current === 'function') {
      var cur = Router.current();
      path = (cur && cur.path) || '';
    }
    if (!path && typeof location !== 'undefined') path = String(location.hash || '').replace(/^#/, '');
    path = String(path).replace(/^\/+/, '').split('/')[0].split('?')[0];
    return META[path] ? path : 'about';
  }

  function back() {
    if (window.Router) {
      if (window.history && history.length > 1) Router.back();
      else Router.go('#/home');
    }
  }

  function render(root, params, third) {
    var kind = resolveKind(params, third);
    var meta = META[kind];

    var sectionsHtml = meta.sections.map(function (sec, i) {
      return '<section class="doc-sec">' +
        '<h3 class="doc-sec__title"><span>' + String(i + 1).padStart(2, '0') + '</span>' + esc(sec.h) + '</h3>' +
        sec.ps.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
        '</section>';
    }).join('');

    var chipsHtml = (meta.chips || []).map(function (c) {
      return '<span class="doc-chip">' + esc(c) + '</span>';
    }).join('');

    root.innerHTML =
      '<div class="page doc-page">' +
      '<header class="doc-bar">' +
      '<button type="button" class="doc-bar__back" data-act="back" aria-label="返回">' + plIcon('back', 20, 'currentColor') + '</button>' +
      '<h1 class="doc-bar__title">' + esc(meta.title) + '</h1>' +
      '<span class="doc-bar__hold"></span>' +
      '</header>' +
      '<main class="doc-body">' +
      '<section class="doc-hero">' +
      '<span class="doc-hero__logo">' + plIcon('heart', 24, 'currentColor') + '</span>' +
      '<span class="doc-hero__kicker">' + esc(meta.kicker) + '</span>' +
      '<h2 class="doc-hero__title">' + esc(meta.title) + '</h2>' +
      '<p class="doc-hero__lead">' + esc(meta.lead) + '</p>' +
      '<div class="doc-hero__chips">' + chipsHtml + '</div>' +
      '</section>' +
      '<article class="doc-article">' + sectionsHtml + '</article>' +
      '<p class="doc-updated">更新日期：' + esc(UPDATED) + '</p>' +
      '<p class="doc-note">演示站点：本页内容仅用于展示排版与阅读体验，不构成真实法律文件。</p>' +
      '</main>' +
      (kind === 'agreement' ? '<div class="doc-agree-bar"><button type="button" class="btn btn--green btn--lg btn--block" data-act="agree">我已阅读并同意，返回继续</button></div>' : '') +
      '</div>';

    var page = root.querySelector('.doc-page');
    page.addEventListener('click', function (e) {
      var t = e.target;
      var el = t && t.closest ? t.closest('[data-act="back"]') : null;
      if (el) {
        e.preventDefault();
        back();
        return;
      }
      if (t && t.closest && t.closest('[data-act="agree"]')) {
        e.preventDefault();
        try { window.Store.set({ agreed: true }); } catch (err) {}
        if (window.UI) window.UI.toast('已同意协议，继续测试', 'success');
        setTimeout(function () { back(); }, 350);
      }
    });

    document.title = meta.title + ' · 心迹测评';
  }

  window.Pages = window.Pages || {};
  window.Pages.doc = {
    title: '关于我们 · 心迹测评',
    theme: 'plain',
    tabbar: null,
    render: render,
    destroy: function () {}
  };
})();
