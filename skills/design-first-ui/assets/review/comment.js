/* review-kit 1.4.0 — the same file in every project; change it in the modem-stack skill, never in a project.
   Review comments for mockup pages. No dependencies, one file.
   <script src="../_review/comment.js" data-cases="cases.html"></script>   on every mockup page
   <script src="../_review/comment.js" data-mode="inbox"></script>         on the checklist page (API only, no bar)
   <script src="http://127.0.0.1:<port>/_review/comment.js" data-round="<qa run>" data-app></script>
                                                                          on the real app, dev only (QA round): a page is a
                                                                          route (location.pathname), the inbox is the server
                                                                          the script came from; nothing at all under automation

   The owner switches on "เขียนความเห็น", clicks any part of the page (or the whole page) and types.
   Comments live in localStorage (key review.comments.<round>) and are posted to the review server
   (review_server.py -> <round>/review/inbox.json), which is the file the agent reads.
   Hidden under ?clean and inside iframes whose parent does not run this tool (compare cells, screenshots).
   Inside the reviewer's phone iframe it runs without a bar and follows the parent's mode.
   Look: light surface, the page's own font, accent and ink taken from the page's :root tokens
   (--review-accent | --color-primary | --primary | --blue, and --review-ink | --color-text | --navy | --ink)
   or from data-accent / data-ink on the script tag. The bar folds to one small button and can be dragged
   anywhere by its grip (both remembered per browser). Everything lives in a shadow root: page CSS cannot
   restyle it and its CSS cannot leak into the page. */
(function () {
  'use strict';
  var S = document.currentScript || { dataset: {} };
  var Q = new URLSearchParams(location.search);
  var seg = location.pathname.split('/').filter(Boolean);
  var ROUND = S.dataset.round || (seg.length > 1 ? seg[seg.length - 2] : 'round');
  var PAGE = /\.html?$/.test(seg[seg.length - 1] || '') ? seg[seg.length - 1] : 'index.html';
  var KEY = 'review.comments.' + ROUND, CASE_KEY = 'review.lastCase.' + ROUND;
  var INBOX_ONLY = S.dataset.mode === 'inbox';
  var APP = S.dataset.app !== undefined && S.dataset.app !== '0';
  if (APP && navigator.webdriver && S.dataset.sync !== 'force') return;
  var RV = ['rvround', 'rvcase', 'rvc'];
  function cleanSearch() { var q = new URLSearchParams(location.search); RV.forEach(function (k) { q.delete(k); }); var t = q.toString(); return t ? '?' + t : ''; }
  function PG() { return APP ? location.pathname : PAGE; }
  if (APP) { try { if (Q.get('rvcase')) sessionStorage.setItem('review.case', Q.get('rvcase')); } catch (e) { /* ignore */ } }
  var IN_FRAME = window.self !== window.top;
  var parentTool = null;
  if (IN_FRAME) { try { parentTool = window.parent.ReviewTool || null; } catch (e) { parentTool = null; } }
  if (Q.has('clean') && !INBOX_ONLY) return;
  if (IN_FRAME && !(parentTool && parentTool.ui)) return;
  var CHILD = IN_FRAME;

  /* ---------- storage + inbox ---------- */
  var SRC; try { SRC = new URL(S.src, location.href); } catch (e) { SRC = location; }
  var port = +SRC.port || 80;
  var endpoints = S.dataset.inbox ? [S.dataset.inbox] : [SRC.origin + '/__review/' + ROUND, SRC.protocol + '//' + SRC.hostname + ':' + (port + 2) + '/__review/' + ROUND];
  var GOOD_KEY = 'review.inbox', good = null, status = 'unknown', onStatus = [], onChange = [], timers = {};
  /* scripted browsers (tests, screenshots) never talk to the inbox unless the tag says data-sync="force" */
  var NO_SYNC = !!navigator.webdriver && S.dataset.sync !== 'force';
  try { var g0 = localStorage.getItem(GOOD_KEY); if (g0 && endpoints.indexOf(g0) > 0) { endpoints.splice(endpoints.indexOf(g0), 1); endpoints.unshift(g0); } } catch (e) { /* ignore */ }
  function setStatus(s) { if (s !== status) { status = s; onStatus.forEach(function (f) { f(s); }); } }
  function call(method, body) {
    if (NO_SYNC) { setStatus('off'); return Promise.resolve(null); }
    var list = good ? [good] : endpoints.slice(), i = 0;
    function next() {
      if (i >= list.length) { good = null; setStatus('off'); return Promise.resolve(null); }
      var u = list[i++];
      return fetch(u, { method: method, cache: 'no-store', headers: body ? { 'Content-Type': 'text/plain;charset=utf-8' } : undefined, body: body ? JSON.stringify(body) : undefined })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j && j.review === 1) { good = u; try { localStorage.setItem(GOOD_KEY, u); } catch (e) { /* ignore */ } setStatus('on'); return j; } return next(); }, next);
    }
    return next();
  }
  function push(kind, data) { clearTimeout(timers[kind]); timers[kind] = setTimeout(function () { call('POST', { kind: kind, data: data }); }, 500); }
  function all() { try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function store(list, quiet) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private window */ } if (!quiet) push('comments', list); changed(); }
  function changed() { onChange.forEach(function (f) { f(); }); }
  window.addEventListener('storage', function (e) { if (e.key === KEY) changed(); });
  function pull() {
    return call('GET').then(function (j) {
      if (!j) return null;
      var local = all(), byId = {}, dirty = false;
      (j.comments || []).forEach(function (c) { byId[c.id] = c; });
      if (!local.length && (j.comments || []).length) { local = j.comments; dirty = true; }
      local.forEach(function (c) { var s = byId[c.id]; if (s) ['status', 'reply'].forEach(function (k) { if (s[k] !== undefined && s[k] !== c[k]) { c[k] = s[k]; dirty = true; } }); });
      if (dirty) store(local, true);
      var same = local.length === (j.comments || []).length && local.every(function (c) { return byId[c.id] && byId[c.id].note === c.note; });
      if (!same) push('comments', local);
      return j;
    });
  }

  var api = window.ReviewTool = {
    round: ROUND, page: PG(), ui: !INBOX_ONLY && !CHILD, mode: false,
    comments: all, save: store, push: push, pull: pull,
    status: function () { return status; },
    onStatus: function (f) { onStatus.push(f); }, onChange: function (f) { onChange.push(f); },
    setLastCase: function (id, href) { try { localStorage.setItem(CASE_KEY, JSON.stringify({ id: id, href: href, ts: Date.now() })); } catch (e) { /* ignore */ } },
    setMode: function () {}
  };
  if (INBOX_ONLY) {
    /* the checklist page shows what the inbox holds (comments made on another origin, e.g. the real app, never reach this
       page's localStorage) merged with what this browser has */
    var remote = [], seen = '';
    api.comments = function () {
      var local = all(), ids = {}; local.forEach(function (c) { ids[c.id] = 1; });
      return remote.filter(function (c) { return !ids[c.id]; }).concat(local).sort(function (a, b) { return String(a.ts) < String(b.ts) ? -1 : 1; });
    };
    var poll = function () { call('GET').then(function (j) { if (!j) return; remote = j.comments || []; var k = JSON.stringify(remote); if (k !== seen) { seen = k; changed(); } }); };
    poll(); setInterval(function () { if (!document.hidden) poll(); }, 5000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });
    return;
  }

  /* ---------- helpers ---------- */
  function stateId() { if (APP) return cleanSearch() + location.hash; try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return location.hash.slice(1); } }
  function txt(el, n) { return ((el && (el.innerText || el.textContent)) || '').replace(/\s+/g, ' ').trim().slice(0, n || 40); }
  function mine(t) { return !!(t && t.closest && t.closest('#rvc')); }
  function chrome(t) { return !!(t && t.closest && t.closest('[data-review]')); }
  function norm(t) {
    if (!t || t.nodeType !== 1) return document.body;
    var svg = t.closest('svg');
    if (svg) { var b = svg.closest('button, a, [role=button]'); return b || svg; }
    return t;
  }
  function what(el) {
    if (!el || el === document.body || el === document.documentElement) return 'ทั้งหน้า';
    var tag = el.tagName.toLowerCase(), role = el.getAttribute('role') || '';
    var al = el.getAttribute('aria-label') || el.getAttribute('title') || '', t = txt(el, 40);
    if (tag === 'button' || tag === 'a' || role === 'button' || role === 'tab' || role === 'switch') return 'ปุ่ม "' + (t || al || tag) + '"';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return 'ช่อง "' + (al || el.placeholder || el.name || tag) + '"';
    if (role === 'dialog') return 'กล่อง "' + (al || txt(el.querySelector('h1, h2, h3'), 40) || t) + '"';
    if (tag === 'svg' || tag === 'img') return 'ไอคอน' + (al ? ' "' + al + '"' : '');
    return t ? '"' + t + '"' : (al ? '"' + al + '"' : tag + (el.classList[0] ? '.' + el.classList[0] : ''));
  }
  function comp(el) {
    if (!el || !el.closest) return '';
    var d = el.closest('[role=dialog]'); if (d && d !== el) return what(d);
    var a = el.parentElement && el.parentElement.closest('[aria-label]');
    return a ? '"' + a.getAttribute('aria-label') + '"' : '';
  }
  function path(el) {
    var out = [];
    for (var e = el; e && e.nodeType === 1 && e !== document.body && out.length < 12; e = e.parentElement) {
      if (e.id && /^[A-Za-z][\w-]*$/.test(e.id) && document.querySelectorAll('#' + e.id).length === 1) { out.unshift('#' + e.id); break; }
      var s = e.tagName.toLowerCase();
      var cls = [].filter.call(e.classList, function (c) { return /^[A-Za-z_][\w-]*$/.test(c); }).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      var sib = e.parentElement ? [].filter.call(e.parentElement.children, function (x) { return x.tagName === e.tagName; }) : [];
      if (sib.length > 1) s += ':nth-of-type(' + (sib.indexOf(e) + 1) + ')';
      out.unshift(s);
    }
    return out.join(' > ');
  }
  function find(sel) { if (!sel) return null; try { return document.querySelector(sel); } catch (e) { return null; } }
  function shown(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lastCase() { try { var c = JSON.parse(localStorage.getItem(CASE_KEY) || 'null'); if (c && Date.now() - c.ts < 3 * 3600e3 && String(c.href).split(/[?#]/)[0] === PAGE) return c.id; if (APP) return sessionStorage.getItem('review.case') || ''; } catch (e) { /* ignore */ } return ''; }
  function pageList() { var pg = PG(); return all().filter(function (c) { return c.page === pg; }); }
  function narrow(w) { return w < 600; }

  /* ---------- UI ---------- */
  function tok(names, fb) { try { var cs = getComputedStyle(document.documentElement); for (var i = 0; i < names.length; i++) { var v = cs.getPropertyValue(names[i]).trim(); if (v) return v; } } catch (e) { /* ignore */ } return fb; }
  var ACCENT = S.dataset.accent || tok(['--review-accent', '--color-primary', '--primary', '--blue'], '#2563EB');
  var INK = S.dataset.ink || tok(['--review-ink', '--color-text', '--navy', '--ink'], '#0F172A');
  var SH = '0 2px 6px rgba(15,23,42,.08),0 18px 40px -14px rgba(15,23,42,.30)';
  var css = ':host{all:initial;position:fixed;left:0;top:0;width:0;height:0;z-index:2147483000;display:block;cursor:auto!important;--rv-bg:#fff;--rv-line:#D3DEEC;--rv-muted:#55637C;--rv-soft:#EFF4FB;font-family:var(--rv-font);font-size:14.5px;line-height:1.5;font-weight:400;color:var(--rv-i);text-align:left}' +
    '@supports (background:color-mix(in srgb,red 10%,#fff)){:host{--rv-soft:color-mix(in srgb,var(--rv-a) 9%,#fff)}}' +
    '*{box-sizing:border-box}[hidden]{display:none!important}button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;margin:0}' +
    'button:focus-visible,a:focus-visible,textarea:focus-visible{outline:3px solid var(--rv-a);outline-offset:2px}' +
    'svg{flex:none;width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.bar{position:fixed;z-index:2147483000;display:flex;align-items:center;gap:4px;padding:6px;border-radius:16px;background:var(--rv-bg);border:1px solid var(--rv-line);box-shadow:' + SH + '}' +
    '.bar button{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:10px;font-weight:600;white-space:nowrap}.bar button:hover{background:var(--rv-soft)}' +
    '.bar button[aria-pressed=true]{background:var(--rv-a);color:#fff}.bar button.ic{padding:0;width:44px;justify-content:center;color:var(--rv-muted)}.bar button.grip{width:32px;cursor:grab;touch-action:none}:host(.drag),:host(.drag) *{cursor:grabbing!important;user-select:none}' +
    '.bar b,.fab b{min-width:22px;height:22px;padding:0 7px;border-radius:11px;background:var(--rv-soft);color:var(--rv-a);font-size:13px;line-height:22px;text-align:center;font-variant-numeric:tabular-nums}' +
    '.dot{flex:none;width:10px;height:10px;border-radius:50%;background:#94A3B8;margin:0 8px 0 6px}.dot.on{background:#16A34A}' +
    '.fab{position:fixed;z-index:2147483000;touch-action:none;display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:16px;background:var(--rv-bg);border:1px solid var(--rv-line);color:var(--rv-a);box-shadow:' + SH + '}' +
    '.fab:hover{background:var(--rv-soft)}.fab b{position:absolute;right:-6px;top:-6px;background:var(--rv-a);color:#fff}' +
    ':host(.min) .bar,:host(.min) .hint,:host(.min) .list,:host(.min) .pins,:host(.min) .hl,:host(:not(.min)) .fab{display:none}' +
    '.hint{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 16px);padding:6px 6px 6px 16px;border-radius:16px;background:var(--rv-bg);border:1px solid var(--rv-line);box-shadow:' + SH + ';white-space:nowrap;font-weight:600}' +
    '.hint button{min-height:40px;padding:0 16px;border-radius:10px;background:var(--rv-a);color:#fff;font-weight:600}' +
    '.hl{position:fixed;z-index:2147482990;pointer-events:none;border:2px solid var(--rv-a);border-radius:6px;background:rgba(37,99,235,.08);box-shadow:0 0 0 2px rgba(255,255,255,.9)}' +
    '.pin{position:fixed;z-index:2147482995;min-width:24px;height:24px;padding:0 6px;border-radius:12px 12px 12px 2px;background:var(--rv-i);color:#fff;font-size:12.5px;font-weight:700;line-height:24px;text-align:center;box-shadow:0 0 0 2px #fff,0 2px 8px rgba(15,23,42,.4);transform:translate(-8px,-14px)}' +
    '.pin.done{background:#15803D}' +
    '.box{position:fixed;z-index:2147483001;width:340px;max-width:calc(100vw - 16px);padding:12px;border-radius:14px;background:var(--rv-bg);border:1px solid var(--rv-line);box-shadow:' + SH + '}' +
    '.box .w{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px}.box .w div{flex:1;min-width:0;font-weight:600;overflow-wrap:anywhere}' +
    '.box .w small{display:block;font-size:12px;font-weight:400;color:var(--rv-muted)}' +
    '.box textarea{display:block;width:100%;min-height:84px;padding:8px 10px;border-radius:10px;border:1px solid var(--rv-line);background:#fff;color:#1E293B;font-family:inherit;font-size:16px;line-height:1.5;resize:vertical}' +
    '.box .f{display:flex;gap:6px;justify-content:flex-end;margin-top:8px}.box button{min-height:40px;padding:0 14px;border-radius:10px;font-weight:600;white-space:nowrap}' +
    '.box [data-a=up]{background:var(--rv-soft);color:var(--rv-a)}.box [data-a=cancel]{box-shadow:inset 0 0 0 1px var(--rv-line)}.box [data-a=cancel]:hover{background:var(--rv-soft)}' +
    '.box button.ok{background:var(--rv-a);color:#fff}.box button.del{margin-right:auto;color:#B91C1C}' +
    '.reply{margin:8px 0 0;padding:8px 10px;border-radius:10px;background:#DCFCE7;color:#15803D}' +
    '.list{position:fixed;z-index:2147483000;width:360px;max-width:calc(100vw - 32px);max-height:min(60vh,520px);overflow:auto;padding:8px;border-radius:14px;background:var(--rv-bg);border:1px solid var(--rv-line);box-shadow:' + SH + '}' +
    '.list .it{display:flex;gap:10px;width:100%;padding:10px 8px;border-radius:10px;text-align:left}.list .it:hover{background:var(--rv-soft)}' +
    '.list .num{flex:none;min-width:24px;height:24px;border-radius:12px;background:var(--rv-i);color:#fff;font-size:12.5px;font-weight:700;line-height:24px;text-align:center}.list .num.done{background:#15803D}' +
    '.list .it span{flex:1;min-width:0;overflow-wrap:anywhere}.list .it small{display:block;color:var(--rv-muted);font-size:12px}' +
    '.list .row{display:flex;flex-wrap:wrap;gap:6px;padding:8px}.list .row button,.list .row a{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--rv-line);color:var(--rv-i);font-weight:600;text-decoration:none}' +
    '.list .row button:hover,.list .row a:hover{background:var(--rv-soft)}.list p{margin:0;padding:4px 8px 8px;color:var(--rv-muted);font-size:12.5px}' +
    '@media (max-width:520px){.box{left:8px!important;right:8px;top:auto!important;bottom:8px;width:auto}.hint{display:none}.bar .lg{display:none}.bar button{padding:0 12px}}' +
    '@media (max-width:380px){.bar{gap:2px;padding:4px}.dot{display:none}.bar button.grip{width:28px}.bar [aria-pressed=true] .ml{display:none}}' +
    'a{cursor:pointer}textarea{cursor:text}';
  var docCss = 'html.rvc-on,html.rvc-on *{cursor:crosshair!important}';
  var IC = {
    pen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 8h8M8 12h5"/></svg>',
    fold: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>',
    grip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="3"/></svg>'
  };
  var MIN_KEY = 'review.bar';
  var POS_KEY = 'review.pos', pos = null, dragged = false;
  function posLoad() { try { var v = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); if (v && isFinite(v.l) && isFinite(v.b)) return v; } catch (e) { /* ignore */ } return innerWidth <= 520 ? { l: 8, b: 76 } : { l: 16, b: 16 }; }
  function posApply() {
    [bar, fab].forEach(function (el) {
      if (!el) return;
      var w = el.offsetWidth || 44, h = el.offsetHeight || 44;
      el.style.left = Math.max(4, Math.min(pos.l, innerWidth - w - 4)) + 'px'; el.style.bottom = Math.max(4, Math.min(pos.b, innerHeight - h - 4)) + 'px';
    });
    if (listEl && bar) {
      var r = bar.getBoundingClientRect(), up = r.top > innerHeight - r.bottom;
      listEl.style.left = Math.max(8, Math.min(r.left, innerWidth - listEl.offsetWidth - 8)) + 'px';
      listEl.style.maxHeight = Math.max(160, Math.min(520, (up ? r.top : innerHeight - r.bottom) - 20)) + 'px';
      if (up) { listEl.style.bottom = innerHeight - r.top + 8 + 'px'; listEl.style.top = 'auto'; } else { listEl.style.top = r.bottom + 8 + 'px'; listEl.style.bottom = 'auto'; }
    }
  }
  function dragStart(e, el) {
    if (e.button) return;
    var r = el.getBoundingClientRect(), sx = e.clientX, sy = e.clientY, l0 = r.left, b0 = innerHeight - r.bottom, on = false;
    try { el.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    function mv(ev) {
      if (!on && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 6) return;
      on = true; dragged = true; root.classList.add('drag'); closeList();
      pos = { l: Math.round(l0 + ev.clientX - sx), b: Math.round(b0 - (ev.clientY - sy)) }; posApply();
    }
    function up() {
      el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      root.classList.remove('drag');
      if (on) { var q = el.getBoundingClientRect(); pos = { l: Math.round(q.left), b: Math.round(innerHeight - q.bottom) }; try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch (x) { /* ignore */ } }
      setTimeout(function () { dragged = false; }, 0);
    }
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  function minPref() { try { var v = localStorage.getItem(MIN_KEY); if (v) return v === 'min'; } catch (e) { /* ignore */ } return innerWidth <= 520; }
  var root = document.createElement('div'); root.id = 'rvc'; root.setAttribute('data-review', '');
  var sh = root.attachShadow ? root.attachShadow({ mode: 'open' }) : root;
  sh.innerHTML = '<style>' + css + '</style><div class="hl" hidden></div><div class="pins"></div>';
  var hl = sh.querySelector('.hl'), pinsEl = sh.querySelector('.pins');
  var bar = null, fab = null, hint = null, listEl = null, box = null, cur = null, trail = [];
  function mount() {
    var ds = document.createElement('style'); ds.setAttribute('data-review', ''); ds.textContent = docCss; document.head.appendChild(ds);
    document.body.appendChild(root);
    /* all:initial on the host cuts inheritance, so font and colours are handed in as variables */
    root.style.setProperty('--rv-a', ACCENT); root.style.setProperty('--rv-i', INK);
    root.style.setProperty('--rv-font', getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif');
    if (!CHILD) {
      bar = document.createElement('div'); bar.className = 'bar'; sh.appendChild(bar);
      fab = document.createElement('button'); fab.type = 'button'; fab.className = 'fab'; fab.setAttribute('data-a', 'unfold'); sh.appendChild(fab);
      pos = posLoad();
      sh.addEventListener('pointerdown', function (e) { var g = e.target.closest('.grip, .fab'); if (g) dragStart(e, g.classList.contains('fab') ? fab : bar); });
      setMin(minPref(), true);
      try { if (window.ResizeObserver) new ResizeObserver(function () { if (!root.classList.contains('drag')) posApply(); }).observe(bar); if (document.fonts && document.fonts.ready) document.fonts.ready.then(posApply); } catch (e) { /* ignore */ }
      hint = document.createElement('div'); hint.className = 'hint'; hint.hidden = true;
      hint.innerHTML = '<span>กดส่วนที่อยากให้แก้</span><button type="button" class="ok" data-a="off">เสร็จ</button>';
      sh.appendChild(hint);
    }
    render();
    var want = Q.get('rvc');
    if (want && !CHILD) {
      Q.delete('rvc'); if (!APP) try { history.replaceState(null, '', location.pathname + (Q.toString() ? '?' + Q.toString() : '') + location.hash); } catch (e) { /* ignore */ }
      setTimeout(function () { if (api.min) setMin(false, true); var c = all().filter(function (x) { return x.id === want; })[0], el = c && find(c.sel); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' }); setTimeout(function () { edit(want); }, 250); }, 700);
    }
    if (CHILD) { if (parentTool.min) setMin(true, true); if (parentTool.mode) setMode(true, true); }
    pull();
  }
  function render() {
    var list = pageList();
    if (bar) {
      bar.innerHTML = '<button type="button" class="ic grip" aria-label="ลากเพื่อย้ายแถบความเห็น" title="ลากเพื่อย้าย">' + IC.grip + '</button>' +
        '<button type="button" data-a="mode" aria-pressed="' + api.mode + '">' + IC.pen + '<span class="ml">เขียนความเห็น</span></button>' +
        (api.mode ? '<button type="button" data-a="page">ทั้งหน้า</button>' : '') +
        '<button type="button" data-a="list" aria-expanded="' + !!listEl + '" aria-label="ความเห็นหน้านี้ ' + list.length + '"><span class="lg">ความเห็นหน้านี้ </span><b>' + list.length + '</b></button>' +
        '<span class="dot' + (status === 'on' ? ' on' : '') + '" title="' + (status === 'on' ? 'ส่งถึง Claude อัตโนมัติ' : 'ยังส่งอัตโนมัติไม่ได้ เก็บไว้ในเบราว์เซอร์นี้') + '"></span>' +
        '<button type="button" class="ic" data-a="fold" aria-label="พับแถบความเห็น" title="พับแถบความเห็น">' + IC.fold + '</button>';
      fab.innerHTML = IC.pen + (list.length ? '<b>' + list.length + '</b>' : '');
      fab.setAttribute('aria-label', 'เปิดแถบความเห็น · ความเห็นหน้านี้ ' + list.length);
      fab.title = 'เปิดแถบความเห็น (ลากเพื่อย้ายได้)';
      posApply();
      hint.hidden = !api.mode || !!box;
    }
    if (listEl) drawList();
    pins();
  }
  function pins() {
    var st = stateId(), h = '';
    pageList().forEach(function (c, i) { if (c.sel && (c.state || '') === st && narrow(c.vw) === narrow(innerWidth)) h += '<button type="button" class="pin' + (c.status === 'done' ? ' done' : '') + '" data-pin="' + esc(c.id) + '" aria-label="ความเห็นที่ ' + (i + 1) + '" hidden>' + (i + 1) + '</button>'; });
    pinsEl.innerHTML = h; place();
  }
  function place() {
    var ps = pinsEl.children; if (!ps.length && !(box && cur && cur.el)) return;
    var list = all();
    for (var i = 0; i < ps.length; i++) {
      var c = list.filter(function (x) { return x.id === ps[i].dataset.pin; })[0], el = c && find(c.sel);
      if (shown(el)) { var r = el.getBoundingClientRect(); ps[i].style.left = Math.max(10, r.left) + 'px'; ps[i].style.top = Math.max(16, r.top) + 'px'; ps[i].hidden = false; } else ps[i].hidden = true;
    }
    if (box && cur && cur.el) frame(cur.el);
  }
  function frame(el) {
    if (!el || el === document.body || !el.getBoundingClientRect) { hl.hidden = true; return; }
    var r = el.getBoundingClientRect();
    hl.style.left = r.left - 2 + 'px'; hl.style.top = r.top - 2 + 'px'; hl.style.width = r.width + 4 + 'px'; hl.style.height = r.height + 4 + 'px'; hl.hidden = false;
  }
  function setMode(on, fromParent) {
    api.mode = !!on;
    document.documentElement.classList.toggle('rvc-on', api.mode);
    if (!api.mode) { closeBox(); hl.hidden = true; }
    if (!fromParent) [].forEach.call(document.querySelectorAll('iframe'), function (f) { try { var t = f.contentWindow.ReviewTool; if (t && t !== api) t.setMode(api.mode, true); } catch (e) { /* other origin */ } });
    render();
  }
  api.setMode = setMode;
  function setMin(on, quiet) {
    api.min = !!on; root.classList.toggle('min', api.min);
    if (api.min) { if (api.mode) setMode(false); closeBox(); closeList(); }
    if (!quiet) { try { localStorage.setItem(MIN_KEY, api.min ? 'min' : 'open'); } catch (e) { /* ignore */ } }
    if (!CHILD) [].forEach.call(document.querySelectorAll('iframe'), function (f) { try { var t = f.contentWindow.ReviewTool; if (t && t !== api) t.setMin(api.min, true); } catch (e) { /* other origin */ } });
    if (!api.min) pins();
    if (pos) posApply();
  }
  api.setMin = setMin; api.min = false;

  function closeBox() { if (box) { box.remove(); box = null; cur = null; hl.hidden = true; if (hint) hint.hidden = !api.mode; } }
  function openBox(o) {
    closeBox(); closeList();
    cur = o; var c = o.c, el = o.el;
    box = document.createElement('div'); box.className = 'box'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'เขียนความเห็น');
    box.innerHTML = '<div class="w"><div><small>ความเห็นที่</small><span data-w></span></div>' + (!c && el ? '<button type="button" data-a="up">เลือกส่วนที่ใหญ่ขึ้น</button>' : '') + '</div>' +
      '<textarea aria-label="ความเห็น" placeholder="อยากให้แก้อะไร"></textarea>' +
      (c && c.reply ? '<p class="reply">' + esc(c.reply) + '</p>' : '') +
      '<div class="f">' + (c ? '<button type="button" class="del" data-a="del">ลบ</button>' : '') + '<button type="button" data-a="cancel">ยกเลิก</button><button type="button" class="ok" data-a="save">บันทึก</button></div>';
    sh.appendChild(box);
    box.querySelector('textarea').value = c ? c.note : '';
    label(); position();
    if (hint) hint.hidden = true;
    box.querySelector('textarea').focus();
  }
  function label() { box.querySelector('[data-w]').textContent = cur.c ? cur.c.what : what(cur.el); frame(cur.el); }
  function position() {
    if (innerWidth <= 520) return;
    var el = cur.el, w = 340, bh = box.offsetHeight || 190, x, y;
    if (el && el !== document.body && shown(el)) {
      var r = el.getBoundingClientRect();
      x = Math.min(Math.max(8, r.left), innerWidth - w - 8);
      y = r.bottom + 10 + bh <= innerHeight ? r.bottom + 10 : (r.top - 10 - bh >= 8 ? r.top - 10 - bh : Math.max(8, innerHeight - bh - 8));
      if (r.height > innerHeight * 0.6) { y = 72; x = Math.max(8, Math.min(r.right - w - 16, innerWidth - w - 8)); }
    } else { x = (innerWidth - w) / 2; y = 72; }
    box.style.left = x + 'px'; box.style.top = y + 'px';
  }
  function save() {
    var note = box.querySelector('textarea').value.trim(), list = all(), c = cur.c, el = cur.el;
    if (!note) { box.querySelector('textarea').focus(); return; }
    if (c) { list.forEach(function (x) { if (x.id === c.id) { x.note = note; x.edited = new Date().toISOString(); if (x.status === 'done') delete x.status; } }); }
    else {
      var whole = !el || el === document.body, r = whole ? null : el.getBoundingClientRect();
      list.push({
        id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), page: PG(), state: stateId(), url: APP ? location.origin + location.pathname + cleanSearch() + location.hash : PAGE + location.search + location.hash,
        vw: innerWidth, vh: innerHeight, sel: whole ? '' : path(el), what: what(el), comp: whole ? '' : comp(el), text: whole ? '' : txt(el, 120),
        rect: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null,
        trail: trail.slice(-6), 'case': lastCase(), who: S.dataset.who ? txt(document.querySelector(S.dataset.who), 60) : '', app: APP ? 1 : 0, note: note, ts: new Date().toISOString()
      });
    }
    closeBox(); store(list);
  }
  function del() { var id = cur.c.id; closeBox(); store(all().filter(function (x) { return x.id !== id; })); }

  function closeList() { if (listEl) { listEl.remove(); listEl = null; if (bar) render(); } }
  function drawList() {
    var list = pageList(), st = stateId();
    listEl.innerHTML = '<div class="row"><button type="button" data-a="page">เขียนความเห็นทั้งหน้านี้</button>' + (S.dataset.cases ? '<a href="' + esc(S.dataset.cases) + '">รายการตรวจ</a>' : '') + '</div>' +
      (list.length ? list.map(function (c, i) {
        return '<button type="button" class="it" data-edit="' + esc(c.id) + '"><b class="num' + (c.status === 'done' ? ' done' : '') + '">' + (i + 1) + '</b><span>' + esc(c.note) +
          '<small>' + esc(c.what) + ((c.state || '') !== st ? ' · อยู่อีกสถานะของหน้านี้' : '') + (narrow(c.vw) ? ' · จอมือถือ' : '') + (c.status === 'done' ? ' · แก้แล้ว' : '') + '</small></span></button>';
      }).join('') : '<p>ยังไม่มีความเห็นในหน้านี้</p>') +
      '<p>' + (status === 'on' ? 'ความเห็นส่งถึง Claude อัตโนมัติ' : 'ยังส่งอัตโนมัติไม่ได้ ความเห็นเก็บไว้ในเบราว์เซอร์นี้ ใช้ปุ่มคัดลอกผลในรายการตรวจ') + '</p>';
    if (pos) posApply();
  }
  function edit(id) {
    var c = all().filter(function (x) { return x.id === id; })[0]; if (!c) return;
    var go = function () { openBox({ c: c, el: find(c.sel) }); };
    if ((c.state || '') !== stateId()) { location.hash = c.state || ''; setTimeout(go, 500); } else go();
  }

  /* ---------- events (window capture: before the page's own handlers) ---------- */
  sh.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a], [data-pin], [data-edit]'); if (!b) return;
    if (dragged) return;
    if (b.dataset.pin) return edit(b.dataset.pin);
    if (b.dataset.edit) return edit(b.dataset.edit);
    var a = b.dataset.a;
    if (a === 'mode') setMode(!api.mode);
    else if (a === 'fold') setMin(true);
    else if (a === 'unfold') setMin(false);
    else if (a === 'off') setMode(false);
    else if (a === 'page') openBox({ el: document.body });
    else if (a === 'list') { if (listEl) closeList(); else { listEl = document.createElement('div'); listEl.className = 'list'; sh.appendChild(listEl); render(); } }
    else if (a === 'up') { var p = cur.el && cur.el.parentElement; if (p && p !== document.documentElement) { cur.el = p; label(); position(); } }
    else if (a === 'cancel') closeBox();
    else if (a === 'save') save();
    else if (a === 'del') del();
  });
  window.addEventListener('click', function (e) {
    if (mine(e.target)) return;
    if (listEl) closeList();
    if (chrome(e.target)) return;
    if (!api.mode) { var w = what(norm(e.target)); if (w !== 'ทั้งหน้า') { trail.push(w); if (trail.length > 12) trail.shift(); } return; }
    e.preventDefault(); e.stopImmediatePropagation();
    openBox({ el: norm(e.target) });
  }, true);
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'dblclick', 'contextmenu'].forEach(function (t) {
    window.addEventListener(t, function (e) { if (api.mode && !mine(e.target) && !chrome(e.target)) e.stopImmediatePropagation(); }, true);
  });
  window.addEventListener('mousemove', function (e) { if (!api.mode || box) return; if (mine(e.target) || chrome(e.target)) { hl.hidden = true; return; } frame(norm(e.target)); }, true);
  window.addEventListener('keydown', function (e) {
    if (box) {
      if (e.key === 'Escape') { e.preventDefault(); closeBox(); }
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); }
      e.stopImmediatePropagation(); return;
    }
    if (api.mode && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (CHILD) { try { window.parent.ReviewTool.setMode(false); } catch (x) { setMode(false); } } else setMode(false); }
  }, true);
  window.addEventListener('focusin', function (e) { if (box && mine(e.target)) e.stopImmediatePropagation(); }, true);
  window.addEventListener('hashchange', function () { trail = []; closeBox(); setTimeout(pins, 350); });
  window.addEventListener('scroll', place, true);
  window.addEventListener('resize', function () { pins(); if (pos) posApply(); });
  var lastHref = location.href;
  setInterval(function () { if (APP && location.href !== lastHref) { lastHref = location.href; trail = []; closeBox(); render(); } place(); }, 400);
  onChange.push(render); onStatus.push(render);
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
