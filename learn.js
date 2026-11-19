/* =====================================================================
   learn.js · Path Finder
   Teaches ONE concept: how a link finds a file (relative paths).
   Plain JavaScript, no libraries, no build step.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- tiny helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* =====================================================================
     THE EXAMPLE SITE: every mode uses this same folder structure
     ===================================================================== */
  var FILES = [
    'index.html', 'styles.css',
    'img/home.png', 'img/london.png', 'img/tokyo.png', 'img/kyoto.png',
    'pages/london.html', 'pages/tokyo.html', 'pages/japan/kyoto.html'
  ];
  var FOLDERS = ['', 'img', 'pages', 'pages/japan'];

  function dirOf(page) { return page.indexOf('/') === -1 ? '' : page.slice(0, page.lastIndexOf('/')); }
  function depthOf(page) { var d = dirOf(page); return d ? d.split('/').length : 0; }
  function where(folder) { return folder ? 'my-site/' + folder + '/' : 'my-site/ (the top folder)'; }
  function ciFind(list, p) {
    var l = p.toLowerCase();
    for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === l) return list[i];
    return null;
  }
  // Uses the browser's own URL rules, so the answer matches what a real browser does.
  function resolveFrom(page, ref) {
    try {
      var u = new URL(ref, 'https://my-site.test/' + page);
      if (u.host !== 'my-site.test') return { external: true };
      return { path: decodeURIComponent(u.pathname.replace(/^\//, '')) };
    } catch (e) { return { bad: true }; }
  }
  function upCount(ref) { return (ref.replace(/\\/g, '/').match(/(^|\/)\.\.(?=\/|$)/g) || []).length; }

  /* =====================================================================
     TABS + SUBTABS
     ===================================================================== */
  var tabs = $all('.tabs [role="tab"]');
  function showTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    store('pf-tab', tab.id);
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { showTab(t); }); });
  var savedTab = store('pf-tab');
  if (savedTab && $('#' + savedTab)) showTab($('#' + savedTab));

  $all('.subtabs').forEach(function (bar) {
    var btns = $all('.sub', bar);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (o) {
          o.classList.toggle('active', o === b);
          $('#' + o.getAttribute('data-sub')).hidden = o !== b;
        });
      });
    });
  });

  /* =====================================================================
     SEE A: watch a link find a file
     ===================================================================== */
  var TREE = [
    { id: '/', label: 'my-site/', depth: 0 },
    { id: 'index.html', label: 'index.html', depth: 1 },
    { id: 'styles.css', label: 'styles.css', depth: 1 },
    { id: 'img/', label: 'img/', depth: 1 },
    { id: 'img/home.png', label: 'home.png', depth: 2 },
    { id: 'img/london.png', label: 'london.png', depth: 2 },
    { id: 'img/tokyo.png', label: 'tokyo.png', depth: 2 },
    { id: 'img/kyoto.png', label: 'kyoto.png', depth: 2 },
    { id: 'pages/', label: 'pages/', depth: 1 },
    { id: 'pages/london.html', label: 'london.html', depth: 2 },
    { id: 'pages/tokyo.html', label: 'tokyo.html', depth: 2 },
    { id: 'pages/japan/', label: 'japan/', depth: 2 },
    { id: 'pages/japan/kyoto.html', label: 'kyoto.html', depth: 3 }
  ];
  var PRESETS = {
    'index.html': ['img/tokyo.png', 'pages/london.html', 'pages/japan/kyoto.html', 'london.html', 'Img/tokyo.png', 'images/tokyo.png', 'www.google.com', 'https://www.gonzaga.edu'],
    'pages/london.html': ['tokyo.html', '../styles.css', 'styles.css', '../index.html', 'index.html', '../img/london.png', 'img/london.png', 'japan/kyoto.html'],
    'pages/japan/kyoto.html': ['../../styles.css', '../styles.css', '../london.html', '../../img/kyoto.png', '../img/kyoto.png', '../../index.html']
  };
  function folderId(f) { return f === '' ? '/' : f + '/'; }
  function joinPath(folder, name) { return folder ? folder + '/' + name : name; }

  function walk(start, href) {
    var steps = [];
    function add(node, cls, type, msg) { steps.push({ node: node, cls: cls, type: type, msg: msg }); }
    var h = href.trim();

    if (!h) { add(null, '', 'err', 'An empty path points back at the page you\'re already on.'); return steps; }
    if (/^https?:\/\//i.test(h) || h.indexOf('//') === 0) {
      add(null, '', 'ok', 'This starts with https:// so it\'s a full (absolute) address. The browser leaves your site and asks that server directly. No folder walking at all.');
      return steps;
    }
    if (/^mailto:/i.test(h)) { add(null, '', 'ok', 'mailto: isn\'t a file. It opens the visitor\'s email app.'); return steps; }
    if (h.charAt(0) === '#') { add(null, '', 'ok', 'A # link jumps to a spot on the same page.'); return steps; }

    if (/^www\./i.test(h)) {
      add(null, '', 'note', 'No https:// in front! The browser doesn\'t know "www" is special, so it treats "' + h.split('/')[0] + '" as a FILE NAME in the current folder.');
    }
    if (h.indexOf('\\') !== -1) {
      add(null, '', 'note', 'Backslashes \\ are for Windows folders. Web paths use forward slashes /. Browsers usually swap them for you, but don\'t rely on it.');
      h = h.replace(/\\/g, '/');
    }
    h = h.split('#')[0].split('?')[0];
    if (h.indexOf(' ') !== -1 || h.indexOf('%20') !== -1) {
      add(null, '', 'note', 'Spaces are sent as %20. It can work, but hyphens (new-york.html) are much safer.');
    }
    try { h = decodeURIComponent(h); } catch (e) { /* leave as typed */ }

    var cur;
    if (h.charAt(0) === '/') {
      cur = '';
      add('/', 'visit', '', 'A leading / means "start at the top folder of the website", no matter where this page is. (Works on a live server, but not when you double-click the file on your computer.)');
      h = h.slice(1);
    } else {
      cur = dirOf(start);
      add(folderId(cur), 'visit', '', 'Start where the current page lives: ' + where(cur) + '.');
    }

    var segs = h.split('/');
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i], last = i === segs.length - 1;
      if (seg === '' && !last) continue;
      if (seg === '' && last) {
        add(folderId(cur), 'miss', 'err', 'Ending in / asks for the folder itself. The server looks for an index.html inside it, and there isn\'t one here → 404.');
        return steps;
      }
      if (seg === '.') { add(folderId(cur), 'visit', '', './ means "this same folder". Stay put.'); continue; }
      if (seg === '..') {
        if (cur === '') {
          add('/', 'visit', 'note', '../ means go up, but we\'re already at the top. A browser can\'t climb above the website, so it just stays here. This extra ../ is a mistake that happens to be harmless.');
        } else {
          cur = dirOf(cur);
          add(folderId(cur), 'visit', '', '../ → go UP one folder. Now in ' + where(cur) + '.');
        }
        continue;
      }
      var candidate = joinPath(cur, seg);
      if (!last) {
        if (FOLDERS.indexOf(candidate) !== -1) {
          cur = candidate;
          add(folderId(cur), 'visit', '', seg + '/ → go DOWN into the ' + seg + ' folder.');
          continue;
        }
        var ciF = ciFind(FOLDERS, candidate);
        if (ciF) add(folderId(cur), 'miss', 'err', 'Looking for a folder named "' + seg + '"… the real one is "' + ciF.split('/').pop() + '". Capital letters don\'t match, so a live web server says 404. (Your laptop might let it slide, which is why this bug only shows up online.)');
        else add(folderId(cur), 'miss', 'err', 'There\'s no folder called "' + seg + '" inside ' + where(cur) + '. Dead end → 404 Not Found.');
        return steps;
      }
      if (FILES.indexOf(candidate) !== -1) {
        add(candidate, 'found', 'ok', 'Found it ✓ The browser loads my-site/' + candidate + '.');
        return steps;
      }
      if (FOLDERS.indexOf(candidate) !== -1) {
        add(folderId(candidate), 'miss', 'err', '"' + seg + '" is a folder, not a file, and there\'s no index.html inside it → 404.');
        return steps;
      }
      var ci = ciFind(FILES, candidate);
      if (ci) {
        add(ci, 'miss', 'err', 'Almost! The real file is "' + ci.split('/').pop() + '" but the path says "' + seg + '". A live web server treats those as different names → 404, even if it worked on your laptop.');
        return steps;
      }
      var elsewhere = FILES.filter(function (f) { return f.split('/').pop().toLowerCase() === seg.toLowerCase(); });
      add(folderId(cur), 'miss', 'err', 'No "' + seg + '" in ' + where(cur) + ' → 404 Not Found.' +
        (elsewhere.length ? ' The file does exist at my-site/' + elsewhere[0] + '. The directions just didn\'t lead there from where this page is.' : ''));
      return steps;
    }
    return steps;
  }

  var walkTimer = null;
  function renderTree(start) {
    $('#pathTree').innerHTML = TREE.map(function (n) {
      var icon = n.id.slice(-1) === '/' ? '📁 ' : (n.id.slice(-4) === '.png' ? '🖼️ ' : '📄 ');
      return '<div class="node' + (n.id === start ? ' here' : '') + '" data-id="' + esc(n.id) + '" style="padding-left:' + (8 + n.depth * 18) + 'px">' +
        icon + esc(n.label) + (n.id === start ? '<span class="tag">← you are here</span>' : '') + '</div>';
    }).join('');
  }
  function renderPresets(start) {
    $('#pathPresets').innerHTML = PRESETS[start].map(function (p) {
      return '<button type="button" data-href="' + esc(p) + '">' + esc(p) + '</button>';
    }).join('');
  }
  function runWalk() {
    clearTimeout(walkTimer);
    var start = $('#pathStart').value;
    renderTree(start);
    var log = $('#pathLog');
    log.innerHTML = '';
    var steps = walk(start, $('#pathHref').value);
    var i = 0;
    (function next() {
      if (i >= steps.length) return;
      var s = steps[i++];
      if (s.node) {
        $all('.node.visit', $('#pathTree')).forEach(function (n) { n.classList.remove('visit'); });
        var el = $('.node[data-id="' + s.node.replace(/"/g, '') + '"]', $('#pathTree'));
        if (el) el.classList.add(s.cls);
      }
      var li = document.createElement('li');
      li.className = s.type;
      li.textContent = s.msg;
      log.appendChild(li);
      walkTimer = setTimeout(next, 950);
    })();
  }
  $('#pathGo').addEventListener('click', runWalk);
  $('#pathHref').addEventListener('keydown', function (e) { if (e.key === 'Enter') runWalk(); });
  $('#pathStart').addEventListener('change', function () {
    var s = $('#pathStart').value;
    renderPresets(s);
    $('#pathHref').value = PRESETS[s][0];
    renderTree(s);
    $('#pathLog').innerHTML = '';
  });
  $('#pathPresets').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    $('#pathHref').value = b.getAttribute('data-href');
    runWalk();
  });
  renderPresets('index.html');
  renderTree('index.html');

  /* =====================================================================
     SEE B: one stylesheet, four folders
     ===================================================================== */
  var MINI_PAGES = [
    { file: 'index.html', h: 'Home', p: 'Three cities I want to visit.' },
    { file: 'pages/london.html', h: 'London', p: 'Big Ben and Tower Bridge.' },
    { file: 'pages/tokyo.html', h: 'Tokyo', p: 'Shibuya Crossing at night.' },
    { file: 'pages/japan/kyoto.html', h: 'Kyoto', p: 'Temples and tea houses.' }
  ];
  function judgeSheet(page, ref) {
    var r = ref.trim();
    if (!r) return { ok: false, msg: 'Empty href, so no stylesheet → browser defaults.' };
    var res = resolveFrom(page, r);
    if (res.external) return { ok: false, msg: 'That leaves your site. styles.css lives in my-site/.' };
    if (res.bad) return { ok: false, msg: 'Not a valid path.' };
    if (res.path === 'styles.css') {
      if (r.indexOf('\\') !== -1) return { ok: true, msg: '✓ Found my-site/styles.css, but only because the browser swapped your \\ for /. Write / yourself.' };
      if (r.charAt(0) === '/') return { ok: true, msg: '✓ Works on the live site (a leading / starts at the top folder). It breaks if you double-click the file on your computer, so ../ is safer for this class.' };
      if (upCount(r) > depthOf(page)) return { ok: true, msg: '✓ Works, but with one ../ too many: the browser can\'t go above the top folder, so it stopped there. Use exactly one ../ per folder level.' };
      return { ok: true, msg: '✓ Found my-site/styles.css and applied it.' };
    }
    var ci = ciFind(FILES, res.path);
    if (ci === 'styles.css') return { ok: false, msg: '✗ Looked for my-site/' + res.path + '. Capital letters don\'t match styles.css → 404 on a live server.' };
    return { ok: false, msg: '✗ Looked for my-site/' + res.path + ', which isn\'t there → browser defaults.' };
  }
  function renderMinis() {
    $('#minis').innerHTML = MINI_PAGES.map(function (pg, i) {
      return '<div class="mini" data-i="' + i + '">' +
        '<div class="where">' + esc('my-site/' + pg.file) + '</div>' +
        '<label class="pathrow"><span>&lt;link rel="stylesheet" href="</span>' +
        '<input type="text" value="styles.css" spellcheck="false" autocapitalize="off" aria-label="Stylesheet path for ' + esc(pg.file) + '"><span>"&gt;</span></label>' +
        '<div class="page"><h4>' + pg.h + '</h4><p>' + pg.p + '</p><a href="#" tabindex="-1">Back to home</a></div>' +
        '<div class="status"></div></div>';
    }).join('');
    $all('.mini input').forEach(function (inp) { inp.addEventListener('input', updateMinis); });
    updateMinis();
  }
  function updateMinis() {
    var allOk = true;
    $all('.mini').forEach(function (m) {
      var pg = MINI_PAGES[+m.getAttribute('data-i')];
      var j = judgeSheet(pg.file, $('input', m).value);
      m.classList.toggle('linked', j.ok);
      m.classList.toggle('broken', !j.ok);
      $('.status', m).textContent = j.msg;
      if (!j.ok) allOk = false;
    });
    $('#sheetDone').innerHTML = allOk
      ? '<div class="box good"><strong>All four styled.</strong> Same file, four different sets of directions: <code>styles.css</code>, <code>../styles.css</code>, <code>../styles.css</code>, <code>../../styles.css</code>. One <code>../</code> for every folder you need to climb.</div>'
      : '';
  }
  renderMinis();

  /* =====================================================================
     PRACTICE: BROKEN-MENU DEBUGGER
     ===================================================================== */
  var DEBUG_ROUNDS = [
    {
      page: 'index.html',
      intro: 'This menu is on <code>index.html</code> in the <strong>top folder</strong>. Four bugs. Fix the code, then press <em>Check my menu</em>.',
      code: '<nav>\n  <a href="index.html"><img src="img/home" alt="Home"></a>\n  <a href="london.html"><img src="img/london.png" alt="London"></a>\n  <a href="pages/Tokyo.html"><img src="img/tokyo.png" alt="Tokyo"></a>\n  <a href="pages/japan/kyoto.html"><img src="images/kyoto.png" alt="Kyoto"></a>\n</nav>',
      hints: ['Every file name needs its full ending, like .png or .html.', 'Look at the site map: which folder is london.html in?', 'Compare every capital letter with the site map.', 'What is the image folder actually called?']
    },
    {
      page: 'pages/london.html',
      intro: 'Same menu, but now it\'s on <code>pages/london.html</code>, <strong>one folder down</strong>. Every path starts from <code>pages/</code>. Three bugs.',
      code: '<nav>\n  <a href="index.html"><img src="img/home.png" alt="Home"></a>\n  <a href="london.html"><img src="../img/london.png" alt="London"></a>\n  <a href="pages/tokyo.html"><img src="../img/tokyo.png" alt="Tokyo"></a>\n  <a href="japan/kyoto.html"><img src="../img/kyoto.png" alt="Kyoto"></a>\n</nav>',
      hints: ['index.html is not in pages/. How do you go up one folder?', 'The Home image is not in pages/ either. Compare it with the London image.', 'You\'re already inside pages/. Does tokyo.html need "pages/" in front?']
    },
    {
      page: 'pages/japan/kyoto.html',
      intro: 'Now it\'s on <code>pages/japan/kyoto.html</code>, <strong>two folders down</strong>. To reach the top folder you have to climb twice. Three bugs.',
      code: '<nav>\n  <a href="../index.html"><img src="../../img/home.png" alt="Home"></a>\n  <a href="../London.html"><img src="../../img/london.png" alt="London"></a>\n  <a href="../tokyo.html"><img src="../img/tokyo.png" alt="Tokyo"></a>\n  <a href="kyoto.html"><img src="../../img/kyoto.png" alt="Kyoto"></a>\n</nav>',
      hints: ['One ../ from japan/ only gets you to pages/. Where is index.html?', 'Check the capital letters on the London link.', 'The Tokyo image climbs only once. Compare it with the other images.']
    }
  ];
  var dbg = { r: 0, hint: 0 };
  function loadDebug() {
    var R = DEBUG_ROUNDS[dbg.r];
    dbg.hint = 0;
    $('#debugIntro').innerHTML = '<strong>Menu ' + (dbg.r + 1) + ' of ' + DEBUG_ROUNDS.length + '.</strong> ' + R.intro;
    $('#debugFiles').textContent = 'This menu lives in: my-site/' + R.page + '\nStarting folder: ' + where(dirOf(R.page)) + '\n(Use the site map at the top of the page.)';
    $('#debugCode').value = R.code;
    $('#debugResults').innerHTML = '<li>Press <strong>Check my menu</strong> to see where the browser looks for each file.</li>';
  }
  function checkRef(page, ref) {
    if (/[<>"]/.test(ref) || /\s(src|alt|href)=/.test(ref)) return { ok: false, msg: '<code>' + esc(ref) + '</code>: a quote is missing, so it swallowed the code after it.' };
    var res = resolveFrom(page, ref);
    if (res.external) return { ok: false, msg: '<code>' + esc(ref) + '</code> leaves the site. Menu links should point at your own pages.' };
    if (res.bad) return { ok: false, msg: '<code>' + esc(ref) + '</code> isn\'t a valid path.' };
    var p = res.path;
    if (FILES.indexOf(p) !== -1) {
      if (upCount(ref) > depthOf(page)) return { ok: true, path: p, warn: 'Works, but has one ../ too many (the browser stopped at the top folder).' };
      return { ok: true, path: p };
    }
    var looked = 'looks for <code>my-site/' + esc(p) + '</code>';
    var ci = ciFind(FILES, p);
    if (ci) return { ok: false, msg: '<code>' + esc(ref) + '</code> ' + looked + ', but the real file is <code>my-site/' + esc(ci) + '</code>. Capital letters must match exactly.' };
    var ext = ['.html', '.png'].filter(function (x) { return FILES.indexOf(p + x) !== -1; })[0];
    if (ext) return { ok: false, msg: '<code>' + esc(ref) + '</code> is missing the <code>' + ext + '</code> ending. A file name has to be complete.' };
    var name = p.split('/').pop();
    var other = FILES.filter(function (f) { return f.split('/').pop().toLowerCase() === name.toLowerCase(); })[0];
    if (other) return { ok: false, msg: '<code>' + esc(ref) + '</code> ' + looked + ' (starting from ' + where(dirOf(page)) + '), but the file is at <code>my-site/' + esc(other) + '</code>. Fix the directions.' };
    return { ok: false, msg: '<code>' + esc(ref) + '</code> ' + looked + '. Nothing there → 404.' };
  }
  function checkDebug() {
    var R = DEBUG_ROUNDS[dbg.r];
    var code = $('#debugCode').value;
    var out = [], allOk = true;
    var opens = (code.match(/<a[\s>]/gi) || []).length, closes = (code.match(/<\/a\s*>/gi) || []).length;
    if (opens !== closes) {
      out.push('<li class="err">You have ' + opens + ' <code>&lt;a&gt;</code> tags but ' + closes + ' <code>&lt;/a&gt;</code> tags. Every link needs its own closing tag.</li>');
      allOk = false;
    }
    var doc = new DOMParser().parseFromString('<!doctype html><body>' + code, 'text/html');
    var anchors = $all('a', doc), pages = [];
    anchors.forEach(function (a, i) {
      var msgs = [], ok = true;
      var href = a.getAttribute('href');
      if (href === null) { ok = false; msgs.push('This link has no <code>href</code>, so it goes nowhere.'); }
      else {
        var r = checkRef(R.page, href);
        if (!r.ok) { ok = false; msgs.push(r.msg); }
        else if (!/\.html$/.test(r.path)) { ok = false; msgs.push('<code>' + esc(href) + '</code> is a file, but not a page. Menu links go to .html files.'); }
        else { msgs.push('link → my-site/' + esc(r.path) + ' ✓' + (r.warn ? ' (' + r.warn + ')' : '')); pages.push(r.path); }
      }
      var img = a.querySelector('img');
      if (!img || img.getAttribute('src') === null) { ok = false; msgs.push('There\'s no image with a <code>src</code> in this link.'); }
      else {
        var ri = checkRef(R.page, img.getAttribute('src'));
        if (!ri.ok) { ok = false; msgs.push('Image: ' + ri.msg); }
        else msgs.push('image → my-site/' + esc(ri.path) + ' ✓' + (ri.warn ? ' (' + ri.warn + ')' : ''));
      }
      if (!ok) allOk = false;
      out.push('<li class="' + (ok ? 'ok' : 'err') + '"><strong>Link ' + (i + 1) + ':</strong> ' + msgs.join('<br>') + '</li>');
    });
    if (anchors.length !== 4) { allOk = false; out.push('<li class="err">The browser sees ' + anchors.length + ' links, not 4.</li>'); }
    var unique = pages.filter(function (p, i) { return pages.indexOf(p) === i; });
    if (allOk && unique.length !== 4) { allOk = false; out.push('<li class="err">Two links go to the same page. Each button should go somewhere different.</li>'); }
    if (allOk) out.unshift('<li class="win">🎉 Every link and image is found. Menu fixed!' + (dbg.r < DEBUG_ROUNDS.length - 1 ? ' Try the next one, a folder deeper.' : ' You fixed all three.') + '</li>');
    $('#debugResults').innerHTML = out.join('');
  }
  $('#debugCheck').addEventListener('click', checkDebug);
  $('#debugReset').addEventListener('click', loadDebug);
  $('#debugNext').addEventListener('click', function () { dbg.r = (dbg.r + 1) % DEBUG_ROUNDS.length; loadDebug(); });
  $('#debugHint').addEventListener('click', function () {
    var R = DEBUG_ROUNDS[dbg.r];
    var n = dbg.hint % R.hints.length;
    dbg.hint++;
    var li = document.createElement('li');
    li.innerHTML = '💡 <strong>Hint ' + (n + 1) + ':</strong> ' + esc(R.hints[n]);
    $('#debugResults').insertBefore(li, $('#debugResults').firstChild);
  });
  loadDebug();

  /* =====================================================================
     PRACTICE: FIND THE MISSING LINK LINE
     ===================================================================== */
  var GAP = '@@GAP@@';
  var MISS_ROUNDS = [
    {
      page: 'pages/london.html',
      prompt: 'This page was just moved into pages/ and now shows up unstyled. Which stylesheet line fixes it?',
      code: '<head>\n<meta charset="utf-8">\n<title>London</title>\n' + GAP + '\n</head>',
      opts: [
        { t: '<link rel="stylesheet" href="../styles.css">', ok: true, why: 'The page is in pages/, and styles.css is one folder up. ../ climbs there first.' },
        { t: '<link rel="stylesheet" href="styles.css">', why: 'This worked before the move. Now it starts from pages/.' },
        { t: '<link rel="stylesheet" href="pages/styles.css">', why: 'You\'re already inside pages/, so this goes looking for a pages/ folder inside pages/.' },
        { t: '<link rel="stylesheet" href=".../styles.css">', why: 'Three dots isn\'t a thing. Each ../ is exactly two dots and climbs one folder.' }
      ]
    },
    {
      page: 'index.html',
      prompt: 'The menu on index.html is missing its Tokyo button. Which line completes it?',
      code: '<nav>\n  <a href="index.html"><img src="img/home.png" alt="Home"></a>\n  <a href="pages/london.html"><img src="img/london.png" alt="London"></a>\n  ' + GAP + '\n</nav>',
      opts: [
        { t: '<a href="pages/tokyo.html"><img src="img/tokyo.png" alt="Tokyo"></a>', ok: true, why: 'From the top folder: down into pages/ for the page, down into img/ for the picture.' },
        { t: '<a href="tokyo.html"><img src="img/tokyo.png" alt="Tokyo"></a>', why: 'tokyo.html isn\'t in the top folder.' },
        { t: '<a href="pages/tokyo.html"><img src="pages/img/tokyo.png" alt="Tokyo"></a>', why: 'The link is right, but the image isn\'t in pages/. img/ is in the top folder.' },
        { t: '<a href="Pages/Tokyo.html"><img src="img/tokyo.png" alt="Tokyo"></a>', why: 'Capital letters. The folder is pages and the file is tokyo.html.' }
      ]
    },
    {
      page: 'pages/tokyo.html',
      prompt: 'On pages/tokyo.html, the Home button is missing. Which line is right?',
      code: '<nav>\n  ' + GAP + '\n  <a href="london.html"><img src="../img/london.png" alt="London"></a>\n</nav>',
      opts: [
        { t: '<a href="../index.html"><img src="../img/home.png" alt="Home"></a>', ok: true, why: 'Both index.html and img/ are one folder up from pages/, so both need ../.' },
        { t: '<a href="index.html"><img src="../img/home.png" alt="Home"></a>', why: 'The image is right, but the link stays inside pages/.' },
        { t: '<a href="../index.html"><img src="img/home.png" alt="Home"></a>', why: 'The link is right, but the image looks for an img/ folder inside pages/.' },
        { t: '<a href="pages/index.html"><img src="../img/home.png" alt="Home"></a>', why: 'From pages/, this goes looking for pages/pages/index.html.' }
      ]
    },
    {
      page: 'pages/japan/kyoto.html',
      prompt: 'This page is TWO folders down: pages/japan/kyoto.html. Which stylesheet line reaches styles.css?',
      code: '<head>\n<title>Kyoto</title>\n' + GAP + '\n</head>',
      opts: [
        { t: '<link rel="stylesheet" href="../../styles.css">', ok: true, why: 'japan/ → up to pages/ → up to my-site/. Two folders, two ../.' },
        { t: '<link rel="stylesheet" href="../styles.css">', why: 'One ../ only climbs from japan/ to pages/.' },
        { t: '<link rel="stylesheet" href="styles.css">', why: 'That looks right next to kyoto.html, inside japan/.' },
        { t: '<link rel="stylesheet" href="../../css/styles.css">', why: 'You reached the top folder, then went into a css/ folder this site doesn\'t have.' }
      ]
    },
    {
      page: 'pages/london.html',
      prompt: 'The London page needs its photo. Which line shows it?',
      code: '<h1>London</h1>\n' + GAP + '\n<p>Big Ben and Tower Bridge.</p>',
      opts: [
        { t: '<img src="../img/london.png" alt="London">', ok: true, why: 'Up out of pages/, down into img/, then the exact file name.' },
        { t: '<img src="img/london.png" alt="London">', why: 'That works from index.html, but not from inside pages/.' },
        { t: '<img src="../img/London.png" alt="London">', why: 'Right folders, wrong capital L. It might show on your laptop and break online.' },
        { t: '<img src="../images/london.png" alt="London">', why: 'The folder is called img, not images.' }
      ]
    }
  ];
  // Works out, with the browser's own URL rules, where a wrong answer actually sends the browser.
  function lookedFor(page, line) {
    var refs = [], m, re = /(href|src)="([^"]*)"/g;
    while ((m = re.exec(line))) refs.push(m[2]);
    for (var i = 0; i < refs.length; i++) {
      var r = resolveFrom(page, refs[i]);
      if (r.path !== undefined && FILES.indexOf(r.path) === -1) return 'The browser looked for my-site/' + r.path + ', which isn\'t there.';
    }
    return '';
  }
  var miss = { r: 0, score: 0, answered: false };
  function renderMiss() {
    var R = MISS_ROUNDS[miss.r];
    miss.answered = false;
    $('#missRound').textContent = 'Round ' + (miss.r + 1) + ' of ' + MISS_ROUNDS.length + ' · on my-site/' + R.page;
    $('#missScore').textContent = 'Score: ' + miss.score;
    $('#missPrompt').textContent = R.prompt;
    $('#missCode').innerHTML = '<span class="dim">&lt;!-- my-site/' + esc(R.page) + ' --&gt;</span>\n' +
      esc(R.code).replace(GAP, '<span class="gap">▢ ??? which line goes here?</span>');
    $('#missOptions').innerHTML = shuffle(R.opts.map(function (o, i) { return i; })).map(function (i) {
      return '<button class="opt" data-i="' + i + '"><code>' + esc(R.opts[i].t) + '</code></button>';
    }).join('');
    $('#missFeedback').innerHTML = '';
    $('#missNext').hidden = true;
  }
  $('#missOptions').addEventListener('click', function (e) {
    var b = e.target.closest('.opt');
    if (!b || b.disabled) return;
    var R = MISS_ROUNDS[miss.r], o = R.opts[+b.getAttribute('data-i')];
    if (o.ok) {
      if (!miss.answered) miss.score++;
      miss.answered = true;
      b.classList.add('right');
      $all('.opt', $('#missOptions')).forEach(function (x) { x.disabled = true; });
      $('#missFeedback').innerHTML = '<div class="box good"><strong>Yes!</strong> ' + esc(o.why) + '</div>';
      $('#missScore').textContent = 'Score: ' + miss.score;
      $('#missNext').hidden = false;
      $('#missNext').textContent = miss.r < MISS_ROUNDS.length - 1 ? 'Next round →' : 'Play again ↺';
    } else {
      miss.answered = true; // only a first-try answer scores
      b.classList.add('wrong');
      b.disabled = true;
      $('#missFeedback').innerHTML = '<div class="box bad"><strong>Not that one.</strong> ' + esc(o.why) + ' ' + esc(lookedFor(R.page, o.t)) + ' Try another.</div>';
    }
  });
  $('#missNext').addEventListener('click', function () {
    if (miss.r < MISS_ROUNDS.length - 1) miss.r++;
    else { miss.r = 0; miss.score = 0; }
    renderMiss();
  });
  renderMiss();

  /* =====================================================================
     PRACTICE: QUIZ (all about paths, all using the example site)
     ===================================================================== */
  var QUIZ = [
    { q: 'You\'re on index.html. Which src shows tokyo.png?', opts: ['img/tokyo.png', '../img/tokyo.png', 'tokyo.png', 'pages/img/tokyo.png'], a: 0, why: 'index.html is in the top folder, and img/ is right there. Go down into img/.' },
    { q: 'You\'re on pages/london.html. Which href reaches styles.css?', opts: ['styles.css', '../styles.css', 'pages/styles.css', '/pages/styles.css'], a: 1, why: 'styles.css is one folder up from pages/, so climb once with ../.' },
    { q: 'You\'re on pages/london.html. Which href goes to the Tokyo page?', opts: ['pages/tokyo.html', '../tokyo.html', 'tokyo.html', 'img/tokyo.html'], a: 2, why: 'tokyo.html is in the same folder as london.html. No climbing needed.' },
    { q: 'You\'re on pages/japan/kyoto.html. Which href reaches styles.css?', opts: ['../styles.css', '../../styles.css', 'styles.css', 'japan/styles.css'], a: 1, why: 'Two folders down means two ../: japan/ → pages/ → my-site/.' },
    { q: 'On pages/london.html the code says src="img/london.png". Where does the browser look?', opts: ['my-site/img/london.png', 'my-site/pages/img/london.png', 'Everywhere until it finds it', 'my-site/london.png'], a: 1, why: 'Paths start from the page\'s own folder (pages/), so it looks for an img/ folder inside pages/. There isn\'t one, so the image breaks.' },
    { q: 'What does ../ mean?', opts: ['Go into a folder called ..', 'Go up one folder', 'Go to the top folder', 'Go back to the previous page'], a: 1, why: 'Each ../ climbs exactly one folder. To climb two, write ../../.' },
    { q: 'Your image works on your laptop but is broken on the live site. The file is tokyo.png and the code says Tokyo.png. Why?', opts: ['The internet is slow', 'Live web servers treat capital letters as different', 'PNG files don\'t work online', 'You need https://'], a: 1, why: 'Windows and Mac usually ignore capitals; web servers don\'t. Tokyo.png and tokyo.png are different names online.' },
    { q: 'You\'re on index.html. Which href goes to the Kyoto page?', opts: ['kyoto.html', 'japan/kyoto.html', 'pages/japan/kyoto.html', '../../kyoto.html'], a: 2, why: 'From the top folder: down into pages/, down into japan/, then the file.' },
    { q: 'You\'re on pages/japan/kyoto.html. Which href goes to the London page?', opts: ['london.html', '../london.html', '../../london.html', 'pages/london.html'], a: 1, why: 'london.html is in pages/, one folder up from japan/.' },
    { q: 'What happens with href="www.google.com"?', opts: ['It opens Google', 'The browser looks for a file named www.google.com in your folder', 'It searches Google', 'It opens a new tab'], a: 1, why: 'Without https:// it\'s just a relative path, a file name in the current folder. Use https://www.google.com.' },
    { q: 'You move london.html from the top folder into pages/. Which of its paths need to change?', opts: ['None, paths don\'t care where the page is', 'Only the ones pointing to files outside pages/ (like styles.css and img/)', 'All of them, every single path', 'Only the <title>'], a: 1, why: 'Paths are directions from the page\'s folder. Anything outside pages/ now needs ../ in front. Links to files inside pages/ still work.' },
    { q: 'Which slash do web paths use?', opts: ['\\ (backslash)', '/ (forward slash)', 'Either, always', '| (pipe)'], a: 1, why: 'Always forward slashes. Backslashes are for Windows folders; browsers may swap them, but don\'t count on it.' }
  ];
  var quiz = { list: [], i: 0, score: 0 };
  function startQuiz() { quiz.list = shuffle(QUIZ); quiz.i = 0; quiz.score = 0; renderQuiz(); }
  function renderQuiz() {
    var box = $('#quizBox');
    if (quiz.i >= quiz.list.length) {
      var pct = Math.round(quiz.score / quiz.list.length * 100);
      box.innerHTML = '<p class="q">Done! ' + quiz.score + ' / ' + quiz.list.length + ' (' + pct + '%)</p>' +
        '<p>' + (pct === 100 ? 'Perfect. You can read any path on this site.' : 'For the ones you missed, go to See → Watch a link find a file and type the path in. Watching the walk usually makes it click.') + '</p>' +
        '<button class="btn" id="quizAgain">Try again</button>';
      $('#quizAgain').addEventListener('click', startQuiz);
      return;
    }
    var item = quiz.list[quiz.i];
    box.innerHTML = '<div class="meta"><span>Question ' + (quiz.i + 1) + ' of ' + quiz.list.length + '</span><span>Score: ' + quiz.score + '</span></div>' +
      '<p class="q">' + esc(item.q) + '</p>' +
      '<div class="options">' + shuffle(item.opts.map(function (o, idx) { return idx; })).map(function (idx) {
        return '<button class="opt" data-idx="' + idx + '"><code>' + esc(item.opts[idx]) + '</code></button>';
      }).join('') + '</div><div class="feedback"></div>';
    $all('.opt', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var right = +b.getAttribute('data-idx') === item.a;
        if (right) quiz.score++;
        $all('.opt', box).forEach(function (o) {
          o.disabled = true;
          if (+o.getAttribute('data-idx') === item.a) o.classList.add('right');
        });
        if (!right) b.classList.add('wrong');
        $('.feedback', box).innerHTML = '<div class="box ' + (right ? 'good' : 'bad') + '"><strong>' + (right ? 'Correct!' : 'Not quite.') + '</strong> ' + esc(item.why) + '</div>' +
          '<button class="btn" id="quizNext">' + (quiz.i + 1 < quiz.list.length ? 'Next question →' : 'See my score') + '</button>';
        $('#quizNext').addEventListener('click', function () { quiz.i++; renderQuiz(); });
        $('#quizNext').focus();
      });
    });
  }
  startQuiz();

  /* =====================================================================
     STORY: the night before it's due
     ===================================================================== */
  function renderStory() {
    var you = esc($('#storyName').value.trim() || 'You');
    var f = esc($('#storyFriend').value.trim() || 'Maya');
    function pause(q, answer) {
      return '<div class="pause"><p>⏸ ' + q + '</p><button class="btn small reveal">Show the answer</button><div class="answer" hidden>' + answer + '</div></div>';
    }
    $('#storyOut').innerHTML =
      '<h3>The Night Before It\'s Due</h3><p class="cast">' + you + ', who built the site · ' + f + ', who has broken this exact thing before</p>' +

      '<div class="scene"><p>10:40 p.m. The assignment is due at midnight and ' + you + '\'s travel site works: a home page, a London page, a Tokyo page, an image menu, one <code>styles.css</code>. Then ' + you + ' decides the top folder looks messy and drags <code>london.html</code> and <code>tokyo.html</code> into a new folder called <code>pages/</code>.</p></div>' +

      '<div class="scene"><h4>Scene 1 · Everything goes plain</h4>' +
      '<p>' + you + ' opens the London page. The navy background is gone: white page, black Times New Roman, and every menu picture is a broken-image icon. Nothing in <code>styles.css</code> changed. The head still says:</p>' +
      '<pre class="code">' + esc('<link rel="stylesheet" href="styles.css">') + '</pre>' +
      '<p>' + you + ' calls ' + f + '. ' + f + ' asks one question: <em>"When the browser reads that line, which folder is it standing in?"</em></p>' +
      pause('What should that line say now?',
        '<pre class="code">' + esc('<link rel="stylesheet" href="../styles.css">') + '</pre>' +
        '<p>The browser starts from the folder the page is in, which is now <code>pages/</code>. <code>styles.css</code> means "right here in pages/", and it isn\'t there. <code>../</code> climbs up to <code>my-site/</code> first. The menu pictures broke for the same reason, so <code>img/home.png</code> becomes <code>../img/home.png</code>.</p>') +
      '</div>' +

      '<div class="scene"><h4>Scene 2 · The Home button 404s</h4>' +
      '<p>Styled again. ' + you + ' clicks Home on the London page and gets <strong>404 Not Found</strong>. The menu was copy-pasted from <code>index.html</code>:</p>' +
      '<pre class="code">' + esc('<a href="index.html"><img src="../img/home.png" alt="Home"></a>\n<a href="london.html"><img src="../img/london.png" alt="London"></a>') + '</pre>' +
      '<p>"But the London button works," ' + you + ' says. "Same kind of link."</p>' +
      pause('Why does Home break while London works?',
        '<p>From <code>pages/</code>, <code>index.html</code> means <code>pages/index.html</code>, which doesn\'t exist, so it needs <code>../index.html</code>. <code>london.html</code> works because London really is in <code>pages/</code>, the same folder. The lesson: a menu you paste into a page in a different folder needs every path checked again.</p>') +
      '</div>' +

      '<div class="scene"><h4>Scene 3 · "Works on my laptop"</h4>' +
      '<p>11:52. Everything works. ' + you + ' pushes to GitHub, Cloudflare deploys, and the link goes to ' + f + '. Reply: <em>"Your Tokyo picture is broken."</em> On ' + you + '\'s laptop it shows up fine. The code and the real file:</p>' +
      '<pre class="code">' + esc('<img src="../img/Tokyo.png" alt="Tokyo">') + '\n<span class="dim">my-site/img/tokyo.png   ← the actual file</span></pre>' +
      pause('Why does it work on the laptop but not online?',
        '<p>Windows and Mac usually ignore capital letters, so <code>Tokyo.png</code> finds <code>tokyo.png</code>. The server hosting the live site doesn\'t: to it those are two different names, and only one exists. Fix: <code>../img/tokyo.png</code>. Habit: name every file in lowercase, with hyphens instead of spaces.</p>') +
      '</div>' +

      '<div class="scene"><p>11:58. Submitted. ' + you + ' writes ' + f + '\'s rule on a sticky note:</p>' +
      '<div class="moral"><strong>Before you type a path, say where you\'re standing.</strong><ul><li>Same folder: just the file name.</li><li>Going down: <code>folder/</code></li><li>Going up: <code>../</code> (one per folder)</li><li>Spell it exactly, capitals included.</li></ul></div></div>';
    $all('.reveal', $('#storyOut')).forEach(function (b) {
      b.addEventListener('click', function () { b.nextElementSibling.hidden = false; b.remove(); });
    });
  }
  ['#storyName', '#storyFriend'].forEach(function (s) { $(s).addEventListener('input', renderStory); });
  renderStory();

  /* =====================================================================
     LISTEN: NotebookLM source notes + customize prompt
     ===================================================================== */
  var LISTEN_PRESETS = [
    'What does ../ mean, and when do I need it?',
    'Why does my page look unstyled after I moved it into a folder?',
    'Why do my images work on my laptop but break online?',
    'What\'s the difference between a relative path and a full https:// link?'
  ];
  var SOURCE_NOTES = [
    'BMIS 235 study notes: HOW A LINK FINDS A FILE (relative paths)',
    '',
    'THE IDEA',
    'Every href="" (links, stylesheet) and src="" (images) is a set of directions. A relative path is directions that start from the folder the current page is in. The same path means a different file depending on where the page lives.',
    '',
    'THE EXAMPLE SITE',
    'my-site/ contains: index.html, styles.css, an img/ folder (home.png, london.png, tokyo.png, kyoto.png), and a pages/ folder (london.html, tokyo.html, and a japan/ folder with kyoto.html).',
    '',
    'THE RULES',
    '- Same folder: just the file name. From pages/london.html, href="tokyo.html" finds pages/tokyo.html.',
    '- Going down: folder name, then a forward slash. From index.html, src="img/tokyo.png" goes into img/ and finds tokyo.png.',
    '- Going up: ../ climbs one folder. From pages/london.html, href="../styles.css" climbs to my-site/ and finds styles.css.',
    '- Two folders down needs two climbs: from pages/japan/kyoto.html, href="../../styles.css".',
    '- Spelling and capital letters must match exactly. Live web servers treat Tokyo.png and tokyo.png as different files. Windows and Mac laptops usually do not, which is why a path can work on your computer and break online.',
    '- Use forward slashes /, never Windows backslashes.',
    '- A full address starting with https:// is an absolute URL: it skips the directions and goes straight to that website. Without https://, "www.google.com" is treated as a file name in your own folder.',
    '',
    'WORKED EXAMPLES',
    '1. On index.html, the London link is href="pages/london.html" (down into pages/).',
    '2. On pages/london.html, the Home link is href="../index.html" (up one).',
    '3. On pages/london.html, src="img/london.png" breaks: the browser looks for pages/img/london.png, which does not exist. The fix is src="../img/london.png".',
    '4. On pages/japan/kyoto.html, the London link is href="../london.html" (up one, to pages/).',
    '',
    'COMMON MISTAKES',
    '- Moving a page into a folder and not adding ../ to its stylesheet, image and menu paths. The page shows up unstyled with broken pictures.',
    '- Copy-pasting a menu from a page in one folder into a page in another folder without fixing the paths.',
    '- Capital letters that do not match the real file name.',
    '- The wrong folder name, like images/ when the folder is really img/.',
    '- Leaving off the ending: tokyo instead of tokyo.html, or img/home instead of img/home.png.',
    '',
    'HOW TO DEBUG A BROKEN PATH',
    '1. Say out loud which folder the current page is in.',
    '2. Follow the path one piece at a time: each folder/ goes down, each ../ goes up.',
    '3. Check that the file is really where you ended up, with exactly that spelling.'
  ].join('\n');

  function buildListen() {
    var q = $('#listenInput').value.trim() || LISTEN_PRESETS[0];
    $('#listenSource').value = SOURCE_NOTES;
    $('#listenPrompt').value =
      'Make an audio explainer for a beginner in an intro college web course (BMIS 235) who writes HTML by hand and has never programmed before.\n\n' +
      'The listener\'s question: "' + q + '"\n\n' +
      'Answer it using ONLY the source notes:\n' +
      '1. Open with the one-sentence idea: a relative path is directions that start from the folder the current page is in.\n' +
      '2. Use one analogy and stick with it: giving someone directions inside a building. "Down the hall into the img room" or "upstairs one floor" only make sense once you know which room they are standing in.\n' +
      '3. Use the example site from the notes. Describe its folders slowly, then walk through the worked examples that fit the question. Say every path out loud piece by piece ("dot dot slash, then styles dot css").\n' +
      '4. Cover the common mistakes that relate to the question and how to spot each one.\n' +
      '5. End with a 3-question spoken quiz using the example site, pausing before each answer.\n\n' +
      'Keep it under 8 minutes, friendly and concrete. Define jargon the first time you use it. Don\'t bring in anything not in the notes.';
  }
  $('#listenPresets').innerHTML = LISTEN_PRESETS.map(function (p) {
    return '<button type="button">' + esc(p) + '</button>';
  }).join('');
  $('#listenPresets').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    $('#listenInput').value = b.textContent;
    buildListen();
  });
  $('#listenInput').placeholder = LISTEN_PRESETS[0];
  $('#listenInput').addEventListener('input', buildListen);
  buildListen();
  $all('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var ta = $('#' + b.getAttribute('data-copy'));
      var done = function () { var old = b.textContent; b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = old; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); document.execCommand('copy'); done(); });
      } else { ta.select(); document.execCommand('copy'); done(); }
    });
  });
})();
