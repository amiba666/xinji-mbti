/* ==========================================================================
   UI · 公共组件与工具（toast / modal / confirm / icons / 格式化 / 事件委托）
   ========================================================================== */
(function () {
  'use strict';

  var toastRoot = null;
  var modalRoot = null;
  var lockCount = 0;
  var prevOverflow = '';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 数字 / 日期 ---------- */
  function fmtNum(n) {
    n = Number(n) || 0;
    if (n < 10000) return String(Math.round(n));
    var w = n / 10000;
    var s = w >= 100 ? String(Math.round(w)) : String(Math.round(w * 10) / 10);
    return s.replace(/\.0$/, '') + 'w';
  }
  function fmtPrice(n) {
    n = Number(n) || 0;
    return n % 1 === 0 ? String(n) : n.toFixed(1);
  }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtDate(ts, withTime) {
    if (!ts) return '';
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    var s = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    if (withTime) s += ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    return s;
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return pad2(m) + ':' + pad2(s);
  }
  function relativeTime(ts) {
    var diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
    if (diff < 86400000 * 7) return Math.floor(diff / 86400000) + ' 天前';
    return fmtDate(ts);
  }

  /* ---------- 图标（线性 24x24） ---------- */
  var ICONS = {
    home: '<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.8Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    category: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    vip: '<path d="M12 2.6 15 9l6.5.9-4.7 4.5 1.1 6.4L12 17.6 6.1 20.8l1.1-6.4L2.5 9.9 9 9l3-6.4Z"/>',
    crown: '<path d="M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8Z"/><path d="M5 19h14"/>',
    mine: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c1.4-3.7 4.2-5.6 7.5-5.6s6.1 1.9 7.5 5.6"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c1.4-3.7 4.2-5.6 7.5-5.6s6.1 1.9 7.5 5.6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
    back: '<path d="M15 5 8 12l7 7"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    'chevron-right': '<path d="m9 5 7 7-7 7"/>',
    'chevron-down': '<path d="m5 9 7 7 7-7"/>',
    check: '<path d="m4 12.5 5 5L20 6.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.8 7.3-4.4M8.3 13.2l7.3 4.4"/>',
    download: '<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
    lock: '<rect x="4.5" y="10" width="15" height="10.5" rx="2.6"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
    unlock: '<rect x="4.5" y="10" width="15" height="10.5" rx="2.6"/><path d="M8 10V7.5a4 4 0 0 1 7.5-2"/>',
    star: '<path d="m12 3 2.8 5.9 6.2.8-4.6 4.3 1.2 6.3L12 17.2 6.4 20.3l1.2-6.3L3 9.7l6.2-.8L12 3Z"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.6 2.9 7.9 7 9.5 4.1-1.6 7-4.9 7-9.5V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    camera: '<path d="M4 8.5h3l1.5-2h7L17 8.5h3a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.4"/>',
    settings: '<circle cx="12" cy="12" r="3.1"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8L4.2 7A2 2 0 1 1 7 4.2l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
    trash: '<path d="M4 7h16"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l.8 12.2A1.8 1.8 0 0 0 9.1 21h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7"/><path d="M10 11v6M14 11v6"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    heart: '<path d="M12 20.3S3.8 15.4 3.8 9.6A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.2 3.2c0 5.8-8.2 10.7-8.2 10.7Z"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.3 6.3 2.6 2.6M15.1 15.1l2.6 2.6M17.7 6.3l-2.6 2.6M8.9 15.1l-2.6 2.6"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.4M12 7.8v.2"/>',
    fire: '<path d="M12 21c3.9 0 6.5-2.5 6.5-6.1 0-4.6-4.4-6.4-4.4-10.4-2.2.9-3.3 2.9-3.3 4.6-1-.5-1.6-1.6-1.7-2.9C6.9 8 5.5 10.3 5.5 13.4 5.5 17.9 8 21 12 21Z"/>',
    gift: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/><path d="M12 8v13"/><path d="M12 8S10.8 3.5 8 3.5A2.3 2.3 0 0 0 8 8h4ZM12 8s1.2-4.5 4-4.5A2.3 2.3 0 0 1 16 8h-4Z"/>',
    compass: '<circle cx="12" cy="12" r="8.6"/><path d="m15.2 8.8-1.9 5.1-5.1 1.9 1.9-5.1 5.1-1.9Z"/>',
    smile: '<circle cx="12" cy="12" r="8.6"/><path d="M8.6 14.2a4 4 0 0 0 6.8 0"/><path d="M9.2 9.6v.2M14.8 9.6v.2"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
    book: '<path d="M4 4.8h6.2A2.8 2.8 0 0 1 13 7.6V20a2.2 2.2 0 0 0-2.2-2.2H4V4.8Z"/><path d="M20 4.8h-6.2A2.8 2.8 0 0 0 11 7.6V20a2.2 2.2 0 0 1 2.2-2.2H20V4.8Z"/>',
    wechat: '<path d="M9.2 4C5.8 4 3 6.3 3 9.2c0 1.6.9 3 2.3 3.9L4.8 15l2.1-1.1c.7.2 1.4.3 2.3.3h.6"/><path d="M12 19.6c0-2.9 2.7-5.2 6-5.2s6 2.3 6 5.2c0 1.5-.8 2.8-2.1 3.7l.4 1.7-1.9-1a7.7 7.7 0 0 1-2.4.4c-3.3 0-6-2.3-6-4.8Z"/>',
    alipay: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M7 9h10M12 6.5V9M9.5 12.2c2.6 2.8 5.2 4.6 8.4 5.6M6.5 16.8c2.3-1 4.2-2.5 5.6-4.4"/>',
    play: '<path d="M8 5.5v13l11-6.5-11-6.5Z"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 4.5V11h-6.5"/>',
    edit: '<path d="m4.5 19.5 1-4.2L16.3 4.5a2.2 2.2 0 0 1 3.2 3.2L8.7 18.5l-4.2 1Z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>',
    leaf: '<path d="M20 4C10 4 4.5 9.2 4.5 15.5c0 2.4 1 4.2 1 4.2S9 20 13.5 17C18 14 20 9 20 4Z"/><path d="M5.5 19.5C8 14 12 10 18 7"/>',
    question: '<circle cx="12" cy="12" r="8.6"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.9v.3"/><path d="M12 17v.2"/>',
    brain: '<path d="M12 5.2a3.1 3.1 0 0 0-5.6 1.9 3.2 3.2 0 0 0-2 5.4A3.3 3.3 0 0 0 6 18.2a3 3 0 0 0 6 .3V5.2Z"/><path d="M12 5.2a3.1 3.1 0 0 1 5.6 1.9 3.2 3.2 0 0 1 2 5.4 3.3 3.3 0 0 1-1.6 5.7 3 3 0 0 1-6 .3V5.2Z"/>',
    briefcase: '<rect x="3" y="7.5" width="18" height="12.5" rx="2.4"/><path d="M9 7.5V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8v1.7"/><path d="M3 12.6h18"/>',
    users: '<circle cx="9" cy="9" r="3.2"/><path d="M3.4 19.4c.8-3 3-4.6 5.6-4.6s4.8 1.6 5.6 4.6"/><path d="M16 6.2a3 3 0 0 1 0 5.8"/><path d="M17.2 15.2c2 .5 3.3 2 3.9 4.2"/>',
    flame: '<path d="M12 21c3.9 0 6.5-2.5 6.5-6.1 0-4.6-4.4-6.4-4.4-10.4-2.2.9-3.3 2.9-3.3 4.6-1-.5-1.6-1.6-1.7-2.9C6.9 8 5.5 10.3 5.5 13.4 5.5 17.9 8 21 12 21Z"/>',
    coin: '<ellipse cx="12" cy="7" rx="7" ry="3.2"/><path d="M5 7v5c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2V7"/><path d="M5 12v5c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2v-5"/>',
    quote: '<path d="M9.4 6.5C6.6 7.8 5 10 5 12.8c0 2.6 1.5 4.4 3.7 4.4 1.9 0 3.3-1.3 3.3-3.2 0-1.8-1.2-3-2.9-3-.3 0-.7 0-1 .1.3-1.4 1.4-2.6 3-3.4l-1.7-1.2Z"/><path d="M18.4 6.5C15.6 7.8 14 10 14 12.8c0 2.6 1.5 4.4 3.7 4.4 1.9 0 3.3-1.3 3.3-3.2 0-1.8-1.2-3-2.9-3-.3 0-.7 0-1 .1.3-1.4 1.4-2.6 3-3.4l-1.7-1.2Z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M8 13h.2M12 13h.2M16 13h.2M8 16.6h.2M12 16.6h.2"/>',
    'chevron-left': '<path d="m15 5-7 7 7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    'arrow-up': '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
    location: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.4"/><path d="m4 7 8 6 8-6"/>',
    phone: '<path d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 4 1.5v3A2.5 2.5 0 0 1 17.4 20C10 19.4 4.6 14 4 6.6A2.5 2.5 0 0 1 6.5 3.5Z"/>'
  };

  function icon(name, size, color, strokeWidth) {
    var d = ICONS[name] || ICONS.info;
    var s = size || 20;
    var sw = strokeWidth || 1.7;
    var fillIcons = { heart: 1, star: 1, vip: 1, crown: 1, fire: 1, play: 1, leaf: 0 };
    var isFill = fillIcons[name] === 1;
    var style = 'width:' + s + 'px;height:' + s + 'px;display:inline-flex;flex:none;' + (color ? 'color:' + color : '');
    return '<svg class="ico" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true" style="' + style + '" ' +
      'fill="' + (isFill ? 'currentColor' : 'none') + '" stroke="' + (isFill ? 'none' : 'currentColor') + '" ' +
      'stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  /* ---------- toast ---------- */
  function ensureToastRoot() {
    if (!toastRoot) toastRoot = document.getElementById('toast-root');
    if (!toastRoot) {
      toastRoot = document.createElement('div');
      toastRoot.id = 'toast-root';
      toastRoot.className = 'toast-root';
      document.body.appendChild(toastRoot);
    }
    return toastRoot;
  }
  function toast(msg, type, duration) {
    var root = ensureToastRoot();
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    var ic = type === 'success' ? icon('check', 16) : type === 'error' ? icon('info', 16) : '';
    el.innerHTML = (ic ? '<span style="display:inline-flex">' + ic + '</span>' : '') + '<span>' + escapeHtml(msg) + '</span>';
    root.appendChild(el);
    var t = setTimeout(function () {
      el.classList.add('is-out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 240);
    }, duration || 2000);
    el.addEventListener('click', function () { clearTimeout(t); el.classList.add('is-out'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 200); });
    // 最多同时 3 条
    while (root.children.length > 3) root.removeChild(root.firstChild);
    return el;
  }

  /* ---------- 滚动锁 ---------- */
  function lockScroll(on) {
    if (on) {
      if (lockCount === 0) {
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
      lockCount++;
    } else {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.style.overflow = prevOverflow;
    }
  }

  /* ---------- modal / sheet ---------- */
  var openStack = [];

  function openModal(opts) {
    opts = opts || {};
    if (!modalRoot) modalRoot = document.getElementById('modal-root');
    modalRoot.classList.add('has-modal');

    var mask = document.createElement('div');
    mask.className = 'mask';
    var box;
    if (opts.sheet) {
      box = document.createElement('div');
      box.className = 'sheet';
      box.innerHTML = '<div class="sheet__grab"></div>' +
        (opts.title ? '<div class="sheet__title">' + escapeHtml(opts.title) + '</div>' : '') +
        '<div class="sheet__body" data-sheet-body>' + (opts.html || '') + '</div>';
    } else {
      box = document.createElement('div');
      box.className = 'modal';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.innerHTML =
        (opts.dismissible === false ? '' : '<button class="modal__close" type="button" aria-label="关闭">' + icon('close', 18) + '</button>') +
        '<div class="modal__body">' +
          (opts.title ? '<div class="modal__title">' + escapeHtml(opts.title) + '</div>' : '') +
          (opts.text ? '<div class="modal__text">' + escapeHtml(opts.text) + '</div>' : '') +
          (opts.html ? '<div class="modal__html">' + opts.html + '</div>' : '') +
        '</div>' +
        (opts.actions && opts.actions.length ? '<div class="modal__actions"></div>' : '');
    }

    var escHandler = null;
    var api = {
      el: box,
      close: function () { close(null); },
      body: null
    };
    function close(result) {
      var idx = openStack.indexOf(api);
      if (idx >= 0) openStack.splice(idx, 1);
      mask.classList.remove('is-in');
      box.classList.remove('is-in');
      lockScroll(false);
      setTimeout(function () {
        if (mask.parentNode) mask.parentNode.removeChild(mask);
        if (box.parentNode) box.parentNode.removeChild(box);
        if (openStack.length === 0) modalRoot.classList.remove('has-modal');
      }, 260);
      if (escHandler) document.removeEventListener('keydown', escHandler);
      if (opts.onClose) opts.onClose(result);
    }

    if (opts.actions && opts.actions.length && !opts.sheet) {
      var actionsEl = box.querySelector('.modal__actions');
      opts.actions.forEach(function (a) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn ' + (a.primary ? (a.green ? 'btn--green' : 'btn--primary') : 'btn--ghost');
        b.textContent = a.text;
        if (a.className) b.className += ' ' + a.className;
        b.addEventListener('click', function () {
          var r = a.onClick ? a.onClick(api) : undefined;
          if (r === false) return;
          if (a.keepOpen) return;
          close(a.value !== undefined ? a.value : true);
        });
        actionsEl.appendChild(b);
      });
    }

    var dismissible = opts.dismissible !== false;
    mask.addEventListener('click', function () { if (dismissible) close(null); });
    if (!opts.sheet) {
      var closeBtn = box.querySelector('.modal__close');
      if (closeBtn) closeBtn.addEventListener('click', function () { close(null); });
    }
    escHandler = function (e) { if (e.key === 'Escape' && dismissible) close(null); };
    document.addEventListener('keydown', escHandler);

    modalRoot.appendChild(mask);
    modalRoot.appendChild(box);
    lockScroll(true);
    api.body = box.querySelector('.modal__body') || box.querySelector('[data-sheet-body]');
    openStack.push(api);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { mask.classList.add('is-in'); box.classList.add('is-in'); });
    });
    return api;
  }

  function confirm(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var settled = false;
      var m = openModal({
        title: opts.title || '提示',
        text: opts.text || '',
        html: opts.html || '',
        dismissible: opts.dismissible !== false,
        actions: [
          { text: opts.cancelText || '取消', onClick: function () { settled = true; resolve(false); } },
          { text: opts.okText || '确定', primary: true, onClick: function () { settled = true; resolve(true); } }
        ],
        onClose: function () { if (!settled) resolve(false); }
      });
      return m;
    });
  }

  /* ---------- 事件委托 ---------- */
  function on(root, selector, eventName, handler, opts2) {
    if (!root) return function () {};
    var fn = function (e) {
      var target = e.target;
      var matches = target && target.closest ? target.closest(selector) : null;
      if (matches && root.contains(matches)) handler.call(matches, e, matches);
    };
    root.addEventListener(eventName, fn, opts2 || false);
    return function () { root.removeEventListener(eventName, fn, opts2 || false); };
  }

  /* ---------- 动效工具 ---------- */
  function haptic(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {}
  }
  function countUp(el, from, to, ms, fmt) {
    if (!el) return;
    var start = performance.now();
    var dur = ms || 700;
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = from + (to - from) * eased;
      el.textContent = fmt ? fmt(v) : String(Math.round(v));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms || 200);
    };
  }
  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last < (ms || 200)) return;
      last = now;
      fn.apply(this, arguments);
    };
  }
  function raf(fn) { return requestAnimationFrame(fn); }
  function scrollTop(el) { if (el && el.scrollTo) el.scrollTo({ top: 0, behavior: 'smooth' }); else window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function emptyState(opts) {
    opts = opts || {};
    return '<div class="empty">' +
      '<div class="empty__art">' + (opts.art || '<svg viewBox="0 0 120 120" width="96" height="96" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="60" cy="60" r="38" stroke-dasharray="3 7"/><path d="M48 62c3 5 7 7 12 7s9-2 12-7"/><circle cx="46" cy="48" r="3" fill="currentColor"/><circle cx="74" cy="48" r="3" fill="currentColor"/></svg>') + '</div>' +
      '<div class="empty__title">' + escapeHtml(opts.title || '这里还是空的') + '</div>' +
      (opts.desc ? '<div class="empty__desc">' + escapeHtml(opts.desc) + '</div>' : '') +
      (opts.action ? '<button class="btn btn--primary" type="button">' + escapeHtml(opts.action) + '</button>' : '') +
      '</div>';
  }

  window.UI = {
    $: $, $all: $all,
    escape: escapeHtml, esc: escapeHtml,
    fmtNum: fmtNum, fmtPrice: fmtPrice, fmtDate: fmtDate, fmtTime: fmtTime, relativeTime: relativeTime,
    icon: icon, icons: ICONS,
    toast: toast,
    modal: openModal, confirm: confirm,
    lockScroll: lockScroll,
    locking: lockScroll,
    on: on,
    haptic: haptic, countUp: countUp, debounce: debounce, throttle: throttle,
    scrollTop: scrollTop,
    emptyState: emptyState,
    pad2: pad2
  };
})();
