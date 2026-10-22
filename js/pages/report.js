/*! 心迹测评 · 完整报告 | window.Pages.report */
(function () {
  'use strict';

  var SHARE_W = 750;
  var SHARE_H = 1180;
  var FONT = '"PingFang SC","HarmonyOS Sans SC","Microsoft YaHei",system-ui,-apple-system,sans-serif';

  var scrollHandler = null;
  var deviceEl = null;
  var modalRef = null;

  function esc(s) { return window.UI.escape(s == null ? '' : s); }
  function ic(name, size) { return window.UI.icon(name, size || 20); }
  function types() { return (window.DATA_TYPES && window.DATA_TYPES.types) || {}; }
  function groups() { return (window.DATA_TYPES && window.DATA_TYPES.groups) || []; }

  function groupOf(key) {
    var list = groups();
    for (var i = 0; i < list.length; i++) if (list[i].key === key) return list[i];
    return list[0] || { name: '人格', color: '#88619a' };
  }

  function tokenStyle(name, fallback) {
    try {
      var v = window.getComputedStyle(document.body).getPropertyValue(name);
      v = (v || '').trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  function paragraphs(text, per) {
    per = per || 2;
    var parts = String(text || '').split('。');
    var sentences = [];
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].trim();
      if (s) sentences.push(s + '。');
    }
    if (!sentences.length) return [];
    var out = [];
    for (var j = 0; j < sentences.length; j += per) out.push(sentences.slice(j, j + per).join(''));
    return out;
  }

  function rarityPhrase(rarity) {
    var n = parseFloat(rarity);
    if (!isFinite(n)) return '这是人群中的少数派';
    if (n <= 2) return '非常稀有的类型，人群中难得一见';
    if (n <= 5) return '相对少见的类型，自带辨识度';
    if (n <= 9) return '不算常见的类型，有自己的节奏';
    return '人数较多的类型，身边常常能遇到同类';
  }

  var SIDE_NAME = { E: '外向', I: '内向', S: '实感', N: '直觉', T: '思考', F: '情感', J: '判断', P: '感知' };

  function dimsSentence(dims) {
    var arr = dims || [];
    if (!arr.length) return '';
    var parts = [];
    var most = null;
    for (var i = 0; i < arr.length; i++) {
      var d = arr[i];
      var left = Math.round(Number(d.leftPct) || 50);
      var isLeft = left >= 50;
      var letter = isLeft ? d.left : d.right;
      var pct = isLeft ? left : 100 - left;
      var name = SIDE_NAME[letter] || '';
      parts.push(letter + (name ? ' ' + name : '') + ' ' + pct + '%');
      if (!most || pct > most.pct) most = { letter: letter, pct: pct };
    }
    return '你的四维分布是 ' + parts.join(' · ') + '；其中最鲜明的是 ' + most.letter + '（' + most.pct + '%）。';
  }

  function traitsSentence(traits) {
    var arr = (traits || []).slice();
    if (!arr.length) return '';
    arr.sort(function (a, b) { return (Number(b.value) || 0) - (Number(a.value) || 0); });
    var hi = arr[0];
    var lo = arr[arr.length - 1];
    return '六项特质里，你的「' + hi.name + '」最突出（' + hi.value + '），「' + lo.name + '」相对靠后（' + lo.value + '）——前者是你最舒服的状态，后者是值得刻意补上的功课。';
  }

  function heroHtml(rep, info, group, dateStr, answered) {
    var rarity = rep.rarity || (info && info.rarity) || '';
    var answeredNum = Number(answered) || 0;
    var keywords = (info && info.keywords) || rep.keywords || [];
    var keywordHtml = keywords.length
      ? '<div class="rp-hero__keywords">' + keywords.map(function (k) {
          return '<span class="rp-kw">' + esc(k) + '</span>';
        }).join('') + '</div>'
      : '';
    var answeredHtml = answeredNum ? '<span class="rp-hero__dot">·</span>基于 ' + answeredNum + ' 道题作答' : '';

    return '' +
      '<header class="rp-hero" style="--rp-group:' + esc(group.color) + '">' +
        '<span class="rp-hero__orb rp-hero__orb--a" aria-hidden="true"></span>' +
        '<span class="rp-hero__orb rp-hero__orb--b" aria-hidden="true"></span>' +
        '<div class="rp-hero__top">' +
          '<button type="button" class="rp-hero__back" data-back aria-label="返回上一页">' + ic('back', 20) + '</button>' +
          '<span class="rp-hero__brand">心迹测评 <i>16 型人格报告</i></span>' +
          '<button type="button" class="rp-hero__act" data-goto-types aria-label="十六型图鉴">' + ic('grid', 20) + '</button>' +
        '</div>' +
        '<div class="rp-hero__main">' +
          '<div class="rp-hero__info">' +
            '<div class="rp-hero__no">01 · ' + esc(group.name) + '组 · 心迹人格档案</div>' +
            '<div class="rp-hero__code">' + esc(rep.code) + '</div>' +
            '<h1 class="rp-hero__name">' + esc(rep.name) + '<span>' + esc(rep.en || (info && info.en) || '') + '</span></h1>' +
            '<p class="rp-hero__tagline">' + esc(rep.tagline || (info && info.tagline) || '') + '</p>' +
            keywordHtml +
          '</div>' +
          '<div class="rp-hero__rarity">' +
            '<div class="rp-hero__donut" data-donut></div>' +
            '<div class="rp-hero__rarity-note">' + esc(rarityPhrase(rarity)) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="rp-hero__foot">' +
          '<span>' + ic('calendar', 13) + '生成于 ' + esc(dateStr) + '</span>' +
          answeredHtml +
        '</div>' +
      '</header>';
  }

  function sectionHead(no, title, sub) {
    return '' +
      '<div class="rp-sec__head">' +
        '<span class="rp-sec__no">' + no + '</span>' +
        '<div class="rp-sec__headtxt">' +
          '<h2 class="rp-sec__title">' + title + '</h2>' +
          (sub ? '<p class="rp-sec__sub">' + sub + '</p>' : '') +
        '</div>' +
      '</div>';
  }

  function advHtml(info) {
    var icons = ['sparkle', 'target', 'compass', 'flame'];
    return '<div class="rp-adv-list">' + (info.strengths || []).map(function (s, i) {
      return '' +
        '<article class="rp-adv">' +
          '<span class="rp-adv__ic">' + ic(icons[i % icons.length], 19) + '</span>' +
          '<div class="rp-adv__txt">' +
            '<h3 class="rp-adv__t">' + esc(s.t) + '</h3>' +
            '<p class="rp-adv__d">' + esc(s.d) + '</p>' +
          '</div>' +
        '</article>';
    }).join('') + '</div>';
  }

  function watchHtml(info) {
    var icons = ['info', 'moon', 'question'];
    return '<div class="rp-watch-list">' + (info.blindspots || []).map(function (s, i) {
      return '' +
        '<article class="rp-watch">' +
          '<span class="rp-watch__ic">' + ic(icons[i % icons.length], 18) + '</span>' +
          '<div class="rp-watch__txt">' +
            '<h3 class="rp-watch__t">' + esc(s.t) + '</h3>' +
            '<p class="rp-watch__d">' + esc(s.d) + '</p>' +
          '</div>' +
        '</article>';
    }).join('') + '</div>';
  }

  function famousHtml(info, group) {
    return '<div class="rp-famous-list">' + (info.famous || []).map(function (f, i) {
      var initial = String(f.name || '').charAt(0);
      return '' +
        '<div class="rp-famous">' +
          '<span class="rp-famous__av' + (i % 2 ? ' rp-famous__av--alt' : '') + '" style="--rp-group:' + esc(group.color) + '">' + esc(initial) + '</span>' +
          '<div class="rp-famous__txt">' +
            '<b class="rp-famous__name">' + esc(f.name) + '</b>' +
            '<p class="rp-famous__desc">' + esc(f.desc) + '</p>' +
          '</div>' +
        '</div>';
    }).join('') + '</div>';
  }

  function matchHtml(info) {
    function badges(codes, kind) {
      return (codes || []).map(function (code) {
        var t = types()[code] || {};
        return '<button type="button" class="rp-match__badge rp-match__badge--' + kind + '" data-type="' + esc(code) + '">' +
          '<b>' + esc(code) + '</b><span>' + esc(t.name || '') + '</span>' +
          ic('chevron-right', 14) +
        '</button>';
      }).join('');
    }
    var match = info.match || { best: [], challenge: [] };
    return '' +
      '<div class="rp-match">' +
        '<div class="rp-match__col">' +
          '<div class="rp-match__label">' + ic('heart', 14) + '最佳匹配</div>' +
          '<div class="rp-match__list">' + badges(match.best, 'best') + '</div>' +
          '<p class="rp-match__tip">你们的能量互补，相处时不需要太费力。</p>' +
        '</div>' +
        '<div class="rp-match__col">' +
          '<div class="rp-match__label">' + ic('info', 14) + '需要留意</div>' +
          '<div class="rp-match__list">' + badges(match.challenge, 'watch') + '</div>' +
          '<p class="rp-match__tip">不是不能相处，只是需要更多耐心和理解。</p>' +
        '</div>' +
      '</div>';
  }

  function loveHtml(info) {
    var love = info.love || {};
    var tips = (love.tips || []).map(function (tip, i) {
      return '<li class="rp-tip"><span class="rp-tip__no">' + (i + 1) + '</span><p>' + esc(tip) + '</p></li>';
    }).join('');
    return '' +
      '<div class="card rp-card rp-love">' +
        '<p class="rp-quote">' + ic('quote', 18) + '<span>' + esc(love.lead || '') + '</span></p>' +
        '<p class="rp-para">' + esc(love.desc || '') + '</p>' +
        (tips ? '<div class="rp-subhead">' + ic('heart', 15) + '相处建议</div><ol class="rp-tips">' + tips + '</ol>' : '') +
      '</div>';
  }

  function careerHtml(info) {
    var c = info.career || {};
    var roles = (c.roles || []).map(function (r) { return '<span class="rp-role">' + esc(r) + '</span>'; }).join('');
    return '' +
      '<div class="card rp-card rp-career">' +
        '<p class="rp-quote">' + ic('quote', 18) + '<span>' + esc(c.lead || '') + '</span></p>' +
        '<p class="rp-para">' + esc(c.desc || '') + '</p>' +
        (roles ? '<div class="rp-subhead">' + ic('briefcase', 15) + '适合的方向</div><div class="rp-roles">' + roles + '</div>' : '') +
        (c.advice ? '<div class="rp-advice"><span>' + ic('sparkle', 16) + '</span><p>' + esc(c.advice) + '</p></div>' : '') +
      '</div>';
  }

  function growthHtml(info) {
    return '<ol class="rp-steps">' + (info.growth || []).map(function (s, i) {
      return '' +
        '<li class="rp-step">' +
          '<span class="rp-step__no">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
          '<div class="rp-step__txt">' +
            '<h3 class="rp-step__t">' + esc(s.t) + '</h3>' +
            '<p class="rp-step__d">' + esc(s.d) + '</p>' +
          '</div>' +
        '</li>';
    }).join('') + '</ol>';
  }

  function buildHtml(rep, info, group, dateStr, answered) {
    var answeredNum = Number(answered) || 0;
    var summaryParas = paragraphs(info.summary, 2).map(function (p) {
      return '<p class="rp-para">' + esc(p) + '</p>';
    }).join('');

    return '' +
      '<div class="page rp-page">' +
        heroHtml(rep, info, group, dateStr, answeredNum) +
        '<main class="rp-main">' +

          '<section class="rp-sec">' +
            sectionHead('02', '四维人格倾向', '四个维度决定你和世界相处的方式') +
            '<div class="card rp-card">' +
              '<div class="rp-chart rp-chart--bipolar" data-bipolar></div>' +
            '</div>' +
            '<p class="rp-note">' + ic('compass', 14) + '<span>' + esc(dimsSentence(rep.dims)) + '</span></p>' +
          '</section>' +

          '<section class="rp-sec">' +
            sectionHead('03', '人格特质雷达', '六项特质构成你的能量形状') +
            '<div class="card rp-card rp-radar-card">' +
              '<div class="rp-chart rp-chart--radar" data-radar></div>' +
              '<p class="rp-radar-note">' + esc(traitsSentence(rep.traits)) + '</p>' +
            '</div>' +
          '</section>' +

          '<section class="rp-sec">' +
            sectionHead('04', '性格概述', '你是怎样运转的') +
            '<div class="card rp-card rp-summary">' +
              summaryParas +
              '<p class="rp-motto">' + ic('quote', 16) + '<span>' + esc(info.motto || '') + '</span></p>' +
            '</div>' +
          '</section>' +

          '<section class="rp-sec">' +
            sectionHead('05', '核心优势与潜在盲点', '把天赋用在刀刃上，也看见自己的惯性') +
            '<div class="rp-subhead rp-subhead--top">' + ic('sparkle', 15) + '核心优势 <em>4 项</em></div>' +
            advHtml(info) +
            '<div class="rp-subhead">' + ic('shield', 15) + '潜在盲点 <em>3 项</em></div>' +
            watchHtml(info) +
          '</section>' +

          '<section class="rp-sec">' +
            sectionHead('06', '爱情与亲密关系', '你在关系里的样子') +
            loveHtml(info) +
          '</section>' +

          '<section class="rp-sec">' +
            sectionHead('07', '职业与发展', '什么样的工作会让你发光') +
            careerHtml(info) +
          '</section>' +

          '<section class="rp-sec">' +
            sectionHead('08', '人际与社交', '你如何与人群相处') +
            '<div class="card rp-card rp-social">' +
              '<p class="rp-para">' + esc((info.social && info.social.desc) || '') + '</p>' +
            '</div>' +
          '</section>' +

          '<section class="rp-sec">' +
            sectionHead('09', '成长建议', '三条可以立刻开始的练习') +
            growthHtml(info) +
          '</section>' +

          '<section class="rp-sec">' +
            sectionHead('10', '同类名人与类型匹配', '他们身上有你的影子') +
            '<div class="rp-mini-label">同类名人示例 · 仅作性格形象参考，非真实关联背书</div>' +
            famousHtml(info, group) +
            matchHtml(info) +
          '</section>' +

          '<section class="rp-sec rp-sec--end">' +
            '<div class="rp-end">' +
              '<span class="rp-end__mark">' + esc(rep.code) + '</span>' +
              '<p class="rp-end__line">' + esc(info.motto || '') + '</p>' +
              '<p class="rp-end__desc">报告到这里就结束了。它不是标签，而是一面镜子——照见你擅长的，也照见你还可以松一松的地方。</p>' +
              '<button type="button" class="btn btn--ghost btn--sm" data-goto-types>' + ic('grid', 15) + '浏览十六型人格图鉴</button>' +
            '</div>' +
            '<footer class="rp-foot">' +
              '<p>本报告基于你 ' + answeredNum + ' 道题的作答倾向生成，用于自我了解与参考，不构成医学或心理学诊断。</p>' +
              '<p class="rp-foot__brand">心迹测评 · 16 Personalities</p>' +
            '</footer>' +
          '</section>' +

        '</main>' +

        '<button type="button" class="rp-top" data-top aria-label="回到顶部">' + ic('arrow-up', 20) + '</button>' +

        '<nav class="rp-actions" aria-label="报告操作">' +
          '<button type="button" class="rp-actions__btn" data-act="save">' +
            '<span class="rp-actions__ic">' + ic('download', 20) + '</span><span>保存图片</span>' +
          '</button>' +
          '<button type="button" class="rp-actions__btn" data-act="share">' +
            '<span class="rp-actions__ic">' + ic('share', 20) + '</span><span>分享好友</span>' +
          '</button>' +
          '<button type="button" class="rp-actions__btn" data-act="retest">' +
            '<span class="rp-actions__ic">' + ic('refresh', 20) + '</span><span>重新测试</span>' +
          '</button>' +
          '<button type="button" class="rp-actions__btn rp-actions__btn--main" data-act="mine">' +
            '<span class="rp-actions__ic">' + ic('mine', 20) + '</span><span>我的报告</span>' +
          '</button>' +
        '</nav>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ *
   * Canvas 分享卡（750 × 1180）
   * ------------------------------------------------------------------ */
  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.arc(x + w - rr, y + rr, rr, -Math.PI / 2, 0);
    ctx.lineTo(x + w, y + h - rr);
    ctx.arc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2);
    ctx.lineTo(x + rr, y + h);
    ctx.arc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + rr);
    ctx.arc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    maxLines = maxLines || 2;
    var chars = String(text || '').split('');
    var lines = [];
    var line = '';
    for (var i = 0; i < chars.length; i++) {
      var test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = chars[i];
        if (lines.length === maxLines) break;
      } else {
        line = test;
      }
    }
    if (lines.length < maxLines && line) lines.push(line);
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], x, y + j * lineHeight);
    }
    return lines.length;
  }

  function drawShareCard(rep, info, group) {
    var W = SHARE_W;
    var H = SHARE_H;
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var brand = tokenStyle('--c-brand', '#ff5d7d');
    var brand2 = tokenStyle('--c-brand-2', '#ff8a63');
    var gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, brand);
    gradient.addColorStop(0.55, brand2);
    gradient.addColorStop(1, brand);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // 装饰圆
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(W - 30, -40, 300, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-60, H - 120, 260, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.06;
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 330, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 顶部品牌
    ctx.fillStyle = 'rgba(255,255,255,.96)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 36px ' + FONT;
    ctx.fillText('心迹测评', 64, 108);
    ctx.font = '500 20px ' + FONT;
    ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.fillText('XINJI · 16 PERSONALITIES', 64, 142);

    // 右上：类型组
    ctx.textAlign = 'right';
    ctx.font = '600 22px ' + FONT;
    ctx.fillStyle = 'rgba(255,255,255,.86)';
    ctx.fillText(group.name + '组 · ' + (info.name || rep.name), W - 64, 108);
    ctx.font = '500 19px ' + FONT;
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillText('人群占比 ' + (rep.rarity || info.rarity || ''), W - 64, 142);

    // 类型代码
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 190px ' + FONT;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '10px';
    ctx.fillText(rep.code, W / 2, 400);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

    // 中文名 + 英文名
    ctx.font = '700 60px ' + FONT;
    ctx.fillText(info.name || rep.name, W / 2, 500);
    ctx.font = '500 26px ' + FONT;
    ctx.fillStyle = 'rgba(255,255,255,.78)';
    ctx.fillText(info.en || rep.en || '', W / 2, 548);

    // tagline
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.font = '500 30px ' + FONT;
    wrapText(ctx, rep.tagline || info.tagline || '', W / 2, 620, W - 150, 44, 2);

    // 关键词
    var keywords = info.keywords || [];
    if (keywords.length) {
      ctx.font = '500 22px ' + FONT;
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.fillText(keywords.join(' · '), W / 2, 726);
    }

    // 四维条
    var dims = rep.dims || [];
    var barX = 96;
    var barW = W - barX * 2;
    var startY = 786;
    ctx.textAlign = 'left';
    for (var i = 0; i < dims.length && i < 4; i++) {
      var d = dims[i];
      var leftPct = Math.max(2, Math.min(98, Math.round(Number(d.leftPct) || 50)));
      var y = startY + i * 62;
      ctx.font = '600 22px ' + FONT;
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.textAlign = 'left';
      ctx.fillText(d.left + ' ' + leftPct + '%', barX, y);
      ctx.textAlign = 'right';
      ctx.fillText((100 - leftPct) + '% ' + d.right, barX + barW, y);

      // 轨道
      ctx.fillStyle = 'rgba(255,255,255,.24)';
      roundRect(ctx, barX, y + 14, barW, 12, 6);
      ctx.fill();
      // 左段
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, barX, y + 14, Math.max(14, barW * (leftPct / 100)), 12, 6);
      ctx.fill();
      // 右段
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      var rw = Math.max(14, barW * ((100 - leftPct) / 100));
      roundRect(ctx, barX + barW - rw, y + 14, rw, 12, 6);
      ctx.fill();
    }

    // 分割线
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.fillRect(96, 1040, W - 192, 1.5);

    // 底部说明（不做二维码图形，避免被误认为可扫码）
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.font = '600 26px ' + FONT;
    ctx.fillText('长按保存 · 分享给朋友', 96, 1090);
    ctx.font = '500 19px ' + FONT;
    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.fillText('示例分享卡 · 不可扫码 · 心迹测评 XINJI', 96, 1128);

    // 右下角品牌字标
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '700 22px ' + FONT;
    ctx.fillText('心迹测评', W - 96, 1090);
    ctx.font = '600 13px ' + FONT;
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fillText('16 PERSONALITIES', W - 96, 1114);

    try { return canvas.toDataURL('image/png'); } catch (e) { return null; }
  }

  function openShotModal(dataUrl, rep, info) {
    var html =
      '<div class="rp-shot">' +
        '<div class="rp-shot__frame">' +
          '<img class="rp-shot__img" alt="' + esc(rep.code + ' ' + rep.name) + ' 人格报告分享卡">' +
        '</div>' +
        '<p class="rp-shot__hint">长按图片保存到相册；桌面端点击下方按钮下载。</p>' +
      '</div>';

    var m = window.UI.modal({
      title: '你的专属分享卡',
      html: html,
      actions: [
        { text: '关闭' },
        {
          text: '保存图片',
          primary: true,
          onClick: function () {
            downloadDataUrl(dataUrl, '心迹测评-' + rep.code + '-' + (info.name || rep.name) + '.png');
            window.UI.toast('已保存分享卡', 'success');
          }
        }
      ]
    });
    if (!m) return;
    modalRef = m;
    var img = m.body ? m.body.querySelector('.rp-shot__img') : null;
    if (img) {
      img.src = dataUrl;
      img.addEventListener('load', function () { img.classList.add('is-loaded'); });
    }
    // 图片本身也可点击下载
    if (img) {
      img.addEventListener('click', function () {
        downloadDataUrl(dataUrl, '心迹测评-' + rep.code + '-' + (info.name || rep.name) + '.png');
        window.UI.toast('已保存分享卡', 'success');
      });
    }
  }

  function downloadDataUrl(dataUrl, filename) {
    try {
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename || 'xiji-report.png';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 80);
    } catch (e) {
      window.UI.toast('当前浏览器不支持直接下载，请长按图片保存', 'error');
    }
  }

  /* ------------------------------------------------------------------ *
   * 事件
   * ------------------------------------------------------------------ */
  function bind(root, rep, info) {
    var pageEl = root.querySelector('.rp-page') || root;
    var back = root.querySelector('[data-back]');
    if (back) {
      back.addEventListener('click', function () {
        if (window.history.length > 1) window.Router.back();
        else window.Router.go('#/mine');
      });
    }
    // 事件委托绑在本次渲染出的 .rp-page 上（随 DOM 一起销毁，避免重复进入页面时叠加监听）
    pageEl.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      var typeBtn = t.closest('[data-type]');
      if (typeBtn) {
        window.Router.go('#/type/' + encodeURIComponent(typeBtn.getAttribute('data-type')));
        return;
      }
      if (t.closest('[data-goto-types]')) {
        window.Router.go('#/types');
        return;
      }
      if (t.closest('[data-top]')) {
        scrollToTopSmooth();
        return;
      }
      var act = t.closest('[data-act]');
      if (!act) return;
      var kind = act.getAttribute('data-act');
      window.UI.haptic(6);
      if (kind === 'save') {
        var url = drawShareCard(rep, info, groupOf(info.group));
        if (!url) { window.UI.toast('分享卡生成失败，请稍后再试', 'error'); return; }
        openShotModal(url, rep, info);
      } else if (kind === 'share') {
        doShare(rep);
      } else if (kind === 'retest') {
        window.UI.confirm({
          title: '重新测试',
          text: '将重新开始答题。本次报告会保留在「我的报告」里，之后仍可回看。',
          okText: '重新开始',
          cancelText: '再想想'
        }).then(function (ok) {
          if (!ok) return;
          window.Store.startTest(window.Store.state.gender || 'f');
          window.Router.go('#/exam');
        });
      } else if (kind === 'mine') {
        window.Router.go('#/mine');
      }
    });
  }

  function doShare(rep) {
    var base = window.location.href.split('#')[0];
    var url = base + '#/report';
    var shareText = '我的十六型人格是 ' + rep.code + '「' + rep.name + '」：' + (rep.tagline || '') + ' —— 你也来测测看？';
    function manual() {
      openShareModal(url, shareText, rep);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText + ' ' + url).then(function () {
        window.UI.toast('分享文案与链接已复制，去粘贴给朋友吧', 'success');
      }).catch(manual);
    } else {
      manual();
    }
  }

  function openShareModal(url, text, rep) {
    var m = window.UI.modal({
      title: '分享给好友',
      html:
        '<div class="rp-share">' +
          '<p class="rp-share__lead">把这份 ' + esc(rep.code) + '「' + esc(rep.name) + '」报告分享出去：</p>' +
          '<div class="rp-share__box"><span>' + esc(text) + '</span></div>' +
          '<div class="rp-share__link"><input class="rp-share__input" readonly value="' + esc(url) + '" aria-label="报告链接"></div>' +
          '<p class="rp-share__hint">浏览器未授予剪贴板权限，可长按上方链接或文本手动复制。</p>' +
        '</div>',
      actions: [
        { text: '关闭' },
        {
          text: '复制链接',
          primary: true,
          onClick: function () {
            var input = m.body ? m.body.querySelector('.rp-share__input') : null;
            if (input) {
              input.focus();
              input.select();
              try {
                var ok = document.execCommand && document.execCommand('copy');
                if (ok) {
                  window.UI.toast('链接已复制', 'success');
                  return;
                }
              } catch (e) {}
            }
            window.UI.toast('请长按链接手动复制', 'info');
          }
        }
      ]
    });
  }

  function scrollToTopSmooth() {
    var dev = document.getElementById('device');
    if (window.innerWidth >= 900 && dev) {
      try { dev.scrollTo({ top: 0, behavior: 'smooth' }); return; } catch (e) { dev.scrollTop = 0; return; }
    }
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function currentScrollTop() {
    var top = window.pageYOffset || document.documentElement.scrollTop || 0;
    var dev = document.getElementById('device');
    if (dev && window.innerWidth >= 900) top = Math.max(top, dev.scrollTop || 0);
    return top;
  }

  function bindScroll(root) {
    var btn = root.querySelector('[data-top]');
    if (!btn) return;
    var shown = false;
    var update = function () {
      var on = currentScrollTop() > 460;
      if (on !== shown) {
        shown = on;
        btn.classList.toggle('is-on', on);
      }
    };
    var throttled = window.UI.throttle ? window.UI.throttle(update, 120) : update;
    window.addEventListener('scroll', throttled, { passive: true });
    deviceEl = document.getElementById('device');
    if (deviceEl) deviceEl.addEventListener('scroll', throttled, { passive: true });
    scrollHandler = throttled;
    update();
  }

  function unbindScroll() {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      if (deviceEl) deviceEl.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
    deviceEl = null;
  }

  /* ------------------------------------------------------------------ *
   * 页面
   * ------------------------------------------------------------------ */
  window.Pages = window.Pages || {};
  window.Pages.report = {
    title: '我的人格报告 · 心迹测评',
    theme: 'platform',
    tabbar: null,

    render: function (root) {
      var store = window.Store;
      var state = store.state;
      var rep = store.currentReport ? store.currentReport() : state.result;

      if (!rep || !rep.code) {
        window.Router.replace('#/');
        return;
      }
      var unlocked = !!state.unlocked || !!rep.unlocked;
      if (!unlocked) {
        window.Router.replace('#/unlock');
        return;
      }

      var info = types()[rep.code];
      if (!info) {
        root.innerHTML =
          '<div class="page rp-page"><div class="rp-empty">' +
            window.UI.emptyState({
              title: '暂时找不到这个类型的内容',
              desc: '你的报告类型为 ' + esc(rep.code) + '，可以先去十六型人格图鉴里看看其他类型。',
              action: '浏览十六型人格图鉴'
            }) +
          '</div></div>';
        var emptyBtn = root.querySelector('.empty .btn');
        if (emptyBtn) emptyBtn.addEventListener('click', function () { window.Router.go('#/types'); });
        return;
      }

      var group = groupOf(info.group);
      var ts = rep.ts || state.finishedAt || (state.result && state.result.ts) || Date.now();
      var dateStr = window.UI.fmtDate(ts, true);
      var answered = Number(rep.answered) || (state.result && Number(state.result.answered)) || (store.totalAnswered ? store.totalAnswered() : 0) || 0;

      root.innerHTML = buildHtml(rep, info, group, dateStr, answered);

      // 图表
      var bipolarEl = root.querySelector('[data-bipolar]');
      if (bipolarEl && window.Charts) {
        window.Charts.bipolar(bipolarEl, rep.dims || [], { label: '四维人格倾向' });
      }
      var radarEl = root.querySelector('[data-radar]');
      if (radarEl && window.Charts) {
        window.Charts.radar(radarEl, rep.traits || [], { label: '人格特质雷达图' });
      }
      var donutEl = root.querySelector('[data-donut]');
      if (donutEl && window.Charts) {
        var rarityNum = parseFloat(rep.rarity || info.rarity) || 0;
        window.Charts.donut(donutEl, rarityNum, {
          decimals: 1,
          caption: '人群占比',
          label: '该人格类型在人群中的占比'
        });
      }

      bind(root, rep, info);
      bindScroll(root);
      window.scrollTo(0, 0);
    },

    destroy: function () {
      unbindScroll();
      if (modalRef) { try { modalRef.close(); } catch (e) {} modalRef = null; }
    }
  };
})();
