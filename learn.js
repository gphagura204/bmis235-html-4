/* =====================================================================
   learn.js · HTML Field Guide
   Everything is plain JavaScript, no libraries, no build step.
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
     CONCEPTS: the facts every mode is built from.
     Written by hand and checked against how browsers actually behave.
     ===================================================================== */
  var CONCEPTS = {
    tags: {
      name: 'Tags & elements',
      question: 'What is an HTML tag, and why do most of them come in pairs?',
      summary: 'A tag is a label in angle brackets that tells the browser what a piece of content is. Most tags come in pairs: an opening tag like <p> and a closing tag like </p> (the closing one has a slash). The opening tag, the content, and the closing tag together make one element.',
      facts: [
        'Opening tag: <p>. Closing tag: </p>. The slash is the only difference.',
        'Opening tag + content + closing tag = an element. <p>Hello</p> is one paragraph element.',
        'Attributes add extra info and always go inside the OPENING tag: <a href="tokyo.html">.',
        'Some elements are empty (void) and have no closing tag: <img>, <br>, <meta>, <link>. They carry everything in attributes.',
        'Tags nest like boxes. Close the inner one before the outer one: <b><i>hi</i></b>.',
        'Browsers ignore tags they do not recognize, so a typo like <pp> silently does nothing.'
      ],
      mistakes: [
        'Forgetting the closing tag: an unclosed <h1> can make everything after it giant-heading text.',
        'Overlapping tags: <b><i>hi</b></i> closes in the wrong order.',
        'Putting an attribute on the closing tag: </a href="...">. Attributes only go on the opening tag.',
        'Missing the slash: writing <p> where you meant </p> starts a new paragraph instead of ending one.'
      ],
      analogy: 'tags are like the two halves of a sandwich bun: the content is the filling, and the opening and closing tags hold it together',
      code: '<p>Welcome to my <b>travel</b> site!</p>\n<img src="img/tokyo.png" alt="Tokyo">'
    },
    headbody: {
      name: 'Head vs body',
      question: 'What goes in the <head> of a page, what goes in the <body>, and why does it matter?',
      summary: 'Every page has one <head> and one <body>, both inside <html>, head first. The <head> holds information ABOUT the page that visitors do not see on the page itself: the <title> shown on the browser tab, <meta charset="utf-8">, and the <link> to the stylesheet. The <body> holds everything visitors see: headings, paragraphs, images, links, the menu.',
      facts: [
        'Order: <!DOCTYPE html>, then <html>, then <head>…</head>, then <body>…</body>, then </html>.',
        '<title> text appears on the browser tab and in bookmarks, not on the page.',
        '<meta charset="utf-8"> tells the browser which character set to use, so symbols display correctly.',
        '<link rel="stylesheet" href="styles.css"> belongs in the head: it is information about the page.',
        'Everything a visitor sees (h1, p, img, nav, a, footer) goes in the body.',
        'There is exactly one head and one body per page.'
      ],
      mistakes: [
        'Putting visible content like <h1> in the head. Browsers quietly move it into the body, but the code is wrong and confusing.',
        'Writing a second <body> for a new section. Use more elements inside the one body instead.',
        'Forgetting the <title>, so the browser tab just shows the file name.'
      ],
      analogy: 'a page is like a house: the head is the attic full of paperwork (the address, the name on the mailbox, the tailor\'s phone number) and the body is the living room where guests actually go',
      code: '<html>\n<head>\n  <title>Tokyo</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Tokyo</h1>\n</body>\n</html>'
    },
    links: {
      name: 'Links',
      question: 'How does an <a> link work, and what does href mean?',
      summary: 'A link is an <a> (anchor) element. Its href attribute (hypertext reference) says WHERE to go. Whatever sits between <a> and </a>, text or an image, is what people click. A menu is just several links, each wrapping an image.',
      facts: [
        'Pattern: <a href="destination">what people click</a>.',
        'Link to a page on your own site with a path: href="tokyo.html".',
        'Link to another website with the full address including https://: href="https://www.gonzaga.edu".',
        'href="mailto:you@example.com" opens an email instead of a page.',
        'A link can wrap an image: <a href="tokyo.html"><img src="img/tokyo.png" alt="Tokyo"></a>. That is how an image menu works.',
        '<a> is for links people click. <link> is a different element that sits in the head and connects resources like the stylesheet.'
      ],
      mistakes: [
        'Leaving off https:// for another site: href="www.google.com" is treated as a FILE named www.google.com in your folder, so it breaks.',
        'Forgetting </a>: the link keeps going and swallows text after it.',
        'Typing herf instead of href: the browser ignores the unknown attribute and the link goes nowhere.',
        'Mixing up <a> (clickable) and <link> (head-only connection to a file).'
      ],
      analogy: 'a link is like a courier: the href is the address on the package, and the text between the tags is the sign the courier holds up so people know what they will get',
      code: '<a href="tokyo.html">Visit Tokyo</a>\n<a href="https://www.gonzaga.edu">Gonzaga</a>\n<a href="mailto:me@zagmail.gonzaga.edu">Email me</a>'
    },
    paths: {
      name: 'Paths',
      question: 'How does a relative path like img/tokyo.png or ../styles.css find the right file?',
      summary: 'A relative path is directions that start from the folder the current page is in. tokyo.html means "in this same folder". img/tokyo.png means "go into the img folder, then find tokyo.png". ../styles.css means "go up one folder, then find styles.css". A full URL starting with https:// is an absolute address and skips the directions entirely.',
      facts: [
        'Same folder: href="tokyo.html".',
        'Down into a folder: src="img/tokyo.png". Each / steps into a folder.',
        'Up one folder: href="../styles.css". Each ../ climbs up one level.',
        'Paths always use forward slashes /, never Windows backslashes \\.',
        'Web servers (like the ones that host your live site) treat Tokyo.png and tokyo.png as DIFFERENT files. Your laptop often does not, which is why a link can work on your computer and break online.',
        'Spaces in file names turn into %20 in the address. They can work, but hyphens like new-york.html are safer.',
        'A path starting with / (like /styles.css) starts at the top folder of the website. It works on a live server but not when you double-click a file on your computer.'
      ],
      mistakes: [
        'Moving a page into a folder and not adding ../ to its stylesheet and image paths.',
        'Capital letters that do not match the real file name exactly.',
        'Wrong folder name: images/ when the folder is really img/.',
        'Forgetting the file extension: tokyo instead of tokyo.html.'
      ],
      analogy: 'a relative path is like giving directions from where you are standing: "go down the hall into the img room" or "go upstairs one floor", so the same directions mean different things depending on which room you start in',
      code: 'From index.html:          img/tokyo.png\nFrom pages/london.html:   ../img/tokyo.png\nUp one folder:            ../styles.css'
    },
    stylesheet: {
      name: 'The stylesheet',
      question: 'How does one styles.css file style every page of a website?',
      summary: 'A stylesheet is a separate file, usually styles.css, full of CSS rules. Each page connects to it with one line in its head: <link rel="stylesheet" href="styles.css">. Because every page points at the same file, changing one rule in styles.css changes every connected page at once.',
      facts: [
        'The connecting line: <link rel="stylesheet" href="styles.css">, placed in the <head>.',
        'rel="stylesheet" says what kind of file it is; href says where it is (a path, so ../ rules apply).',
        'A CSS rule is: selector { property: value; }. Example: h1 { color: navy; }.',
        'One file, many pages: change it once and every connected page updates. That is your brand.',
        'A page whose link line is missing or has the wrong path falls back to browser defaults: white background, black serif text, blue underlined links.',
        'A missing or extra curly brace can break the rules that come after it.'
      ],
      mistakes: [
        'Typo in the file name: href="style.css" when the file is styles.css.',
        'Forgetting rel="stylesheet", so the browser never applies the file.',
        'Using <style src="styles.css">. A <style> tag holds CSS typed inside it; it cannot load a file.',
        'A stray } or a missing ; in styles.css, which can make the browser skip the next rule.'
      ],
      analogy: 'a stylesheet is like one tailor who dresses every page on the site: each page sends the tailor a note (the link line), and when the tailor changes the uniform, everyone who sent a note gets the new look',
      code: '/* styles.css */\nbody {\n  background-color: #06224f;\n  color: #ebe9df;\n}\nh1 { border-bottom: 3px solid #d4a359; }'
    },
    cascade: {
      name: 'The cascade',
      question: 'When two CSS rules disagree about the same element, which one wins?',
      summary: 'The cascade is how the browser decides which rule wins when several rules style the same thing. The simple version: a more specific selector wins (an id beats a class, a class beats a plain element). If two rules are equally specific, the one that comes LATER wins. An inline style="" written on the tag itself beats stylesheet rules. And some properties, like color and font-family, are inherited from the parent element when no rule targets the element directly.',
      facts: [
        'Bottom layer: the browser\'s own default styles (black text, blue links, Times-style font).',
        'Equal specificity → the rule that comes later in the CSS wins.',
        'More specific wins regardless of order: #id beats .class beats element (like p).',
        'An inline style="color: red" on the tag beats rules from the stylesheet.',
        'Inheritance: color and font-family flow down from body to the elements inside it, but only when no rule targets that element directly.',
        '(Extra: !important can override this order. Use it rarely, it makes CSS hard to debug.)'
      ],
      mistakes: [
        'Adding a new rule at the top of styles.css and wondering why an older rule further down still wins.',
        'Styling body { color: navy } and expecting it to beat a p { color: black } rule. A direct rule beats inheritance.',
        'Thinking "the last rule always wins". A more specific selector earlier in the file still beats a plain one later.'
      ],
      analogy: 'the cascade is like a referee settling an argument: the most specific instruction wins, and if two are equally specific, whoever spoke last wins',
      code: 'p { color: navy; }        /* loses: same specificity, earlier */\np { color: green; }       /* wins over the first p rule */\n.note { color: purple; }  /* beats both p rules: a class is more specific */'
    }
  };
  var ORDER = ['tags', 'headbody', 'links', 'paths', 'stylesheet', 'cascade'];

  var KEYWORDS = {
    tags: ['tag', 'element', 'bracket', 'closing', 'opening', 'nest', 'attribute', 'void', 'img', '<p'],
    headbody: ['head', 'body', 'title', 'meta', 'charset', 'doctype', 'html structure', 'skeleton'],
    links: ['link', 'href', 'anchor', '<a', 'mailto', 'menu', 'nav', 'click', 'url', 'https'],
    paths: ['path', 'folder', '../', '..', 'relative', 'absolute', 'directory', 'src', '404', 'case', 'not found', 'broken image'],
    stylesheet: ['css', 'stylesheet', 'styles.css', 'style', 'rel', 'brand', 'font', 'colour', 'color', 'rule', 'selector'],
    cascade: ['cascade', 'specific', 'specificity', 'inherit', 'override', 'wins', 'win', 'priority', 'important', 'conflict', 'order']
  };
  function matchConcept(text) {
    var t = text.toLowerCase(), best = null, bestScore = 0;
    ORDER.forEach(function (id) {
      var score = 0;
      KEYWORDS[id].forEach(function (k) { if (t.indexOf(k) !== -1) score += k.length > 3 ? 2 : 1; });
      if (score > bestScore) { bestScore = score; best = id; }
    });
    return best;
  }

  /* =====================================================================
     STATE: which concept is picked
     ===================================================================== */
  var current = store('fg-concept');
  if (!CONCEPTS[current]) current = 'paths';
  var listeners = [];
  function onConcept(fn) { listeners.push(fn); }
  function setConcept(id) {
    current = id;
    store('fg-concept', id);
    renderChips();
    listeners.forEach(function (fn) { fn(id); });
  }

  function renderChips() {
    var box = $('#conceptChips');
    box.innerHTML = ORDER.map(function (id) {
      return '<button class="chip" role="radio" aria-checked="' + (id === current) + '" data-id="' + id + '">' + esc(CONCEPTS[id].name) + '</button>';
    }).join('');
    var c = CONCEPTS[current];
    $('#conceptCard').innerHTML =
      '<h3>' + esc(c.name) + '</h3><p>' + esc(c.summary) + '</p><pre class="code">' + esc(c.code) + '</pre>';
  }
  $('#conceptChips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (b) setConcept(b.getAttribute('data-id'));
  });

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
    store('fg-tab', tab.id);
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { showTab(t); }); });
  var savedTab = store('fg-tab');
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
  // concept → jump to the most relevant "See" demo
  var SEE_FOR = { tags: 'see-path', headbody: 'see-sheet', links: 'see-path', paths: 'see-path', stylesheet: 'see-sheet', cascade: 'see-cascade' };
  onConcept(function (id) {
    var btn = $('.sub[data-sub="' + SEE_FOR[id] + '"]');
    if (btn) btn.click();
  });

  /* =====================================================================
     LISTEN: NotebookLM source notes + customize prompt
     ===================================================================== */
  function buildListen() {
    var text = $('#listenInput').value.trim();
    var id = text ? matchConcept(text) : current;
    var matchMsg = $('#listenMatch');
    var source, prompt, focus;

    if (text && id) matchMsg.textContent = 'Matched your question to: ' + CONCEPTS[id].name;
    else if (text && !id) matchMsg.textContent = 'Couldn\'t match that to one concept, so the notes cover all six basics.';
    else matchMsg.textContent = 'Using the concept picked above: ' + CONCEPTS[id].name;

    function notesFor(cid) {
      var c = CONCEPTS[cid];
      return 'TOPIC: ' + c.name + '\n\n' + c.summary +
        '\n\nKEY FACTS\n- ' + c.facts.join('\n- ') +
        '\n\nCOMMON BEGINNER MISTAKES\n- ' + c.mistakes.join('\n- ') +
        '\n\nEXAMPLE CODE\n' + c.code;
    }

    if (id) {
      var c = CONCEPTS[id];
      focus = text || c.question;
      source = 'BMIS 235 study notes: HTML & CSS basics\n\n' + notesFor(id);
      prompt =
        'Make an audio explainer for a beginner in an intro college web course (BMIS 235) who builds web pages by hand in a code editor and has never programmed before.\n\n' +
        'The listener\'s question: "' + focus + '"\n\n' +
        'Explain "' + c.name + '" using ONLY the facts in the source notes:\n' +
        '1. Open with a one-sentence plain-English definition.\n' +
        '2. Use this analogy and stick with it: ' + c.analogy + '.\n' +
        '3. Read the example code aloud slowly, naming every symbol (angle bracket, slash, equals sign, quote marks, curly brace) so it makes sense without seeing it.\n' +
        '4. Walk through each common mistake: what it looks like and how to spot it.\n' +
        '5. End with a 3-question spoken quiz, pausing before each answer.\n\n' +
        'Keep it under 8 minutes, friendly and concrete. Define any jargon the first time you use it. Do not bring in JavaScript, frameworks, or anything not in the source.';
    } else {
      focus = text;
      source = 'BMIS 235 study notes: HTML & CSS basics\n\n' + ORDER.map(notesFor).join('\n\n----------\n\n');
      prompt =
        'Make an audio explainer for a beginner in an intro college web course (BMIS 235) who builds web pages by hand in a code editor.\n\n' +
        'The listener\'s question: "' + focus + '"\n\n' +
        'Answer it using ONLY the facts in the source notes. Find the section that fits the question best, define the idea in one plain sentence, give one everyday analogy, read any example code aloud naming every symbol, cover the common mistakes, and end with a 3-question spoken quiz. ' +
        'If the notes do not answer the question, say so honestly instead of guessing. Keep it under 8 minutes and define all jargon.';
    }
    $('#listenSource').value = source;
    $('#listenPrompt').value = prompt;
  }
  $('#listenInput').addEventListener('input', buildListen);
  onConcept(function () { $('#listenInput').value = ''; buildListen(); });
  $all('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var ta = $('#' + b.getAttribute('data-copy'));
      var done = function () { var old = b.textContent; b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = old; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); document.execCommand('copy'); done(); });
      } else { ta.select(); document.execCommand('copy'); done(); }
    });
  });

  /* =====================================================================
     SEE A: a link finding a file (path walker)
     ===================================================================== */
  var SITE_FILES = ['index.html', 'about.html', 'styles.css', 'img/logo.png', 'img/london.png', 'pages/london.html', 'pages/tokyo.html'];
  var SITE_FOLDERS = ['', 'img', 'pages'];
  var TREE = [
    { id: '/', label: 'my-site/', depth: 0 },
    { id: 'img/', label: 'img/', depth: 1 },
    { id: 'img/logo.png', label: 'logo.png', depth: 2 },
    { id: 'img/london.png', label: 'london.png', depth: 2 },
    { id: 'pages/', label: 'pages/', depth: 1 },
    { id: 'pages/london.html', label: 'london.html', depth: 2 },
    { id: 'pages/tokyo.html', label: 'tokyo.html', depth: 2 },
    { id: 'index.html', label: 'index.html', depth: 1 },
    { id: 'about.html', label: 'about.html', depth: 1 },
    { id: 'styles.css', label: 'styles.css', depth: 1 }
  ];
  var PRESETS = {
    'index.html': ['about.html', 'img/london.png', 'pages/tokyo.html', 'tokyo.html', 'Img/london.png', 'images/london.png', 'www.google.com', 'https://www.gonzaga.edu', 'img\\logo.png'],
    'pages/london.html': ['tokyo.html', 'styles.css', '../styles.css', '../img/london.png', 'img/london.png', '../index.html', '/styles.css', '../../styles.css']
  };
  function folderId(f) { return f === '' ? '/' : f + '/'; }
  function joinPath(folder, name) { return folder ? folder + '/' + name : name; }
  function ciFind(list, p) {
    var l = p.toLowerCase();
    for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === l) return list[i];
    return null;
  }

  function walk(start, href) {
    var steps = [];
    function add(node, cls, type, msg) { steps.push({ node: node, cls: cls, type: type, msg: msg }); }
    var h = href.trim();
    var startDir = start.indexOf('/') === -1 ? '' : start.slice(0, start.lastIndexOf('/'));

    if (!h) { add(null, '', 'err', 'An empty href points back at the page you\'re already on.'); return steps; }
    if (/^https?:\/\//i.test(h) || h.indexOf('//') === 0) {
      add(null, '', 'ok', 'This starts with https:// so it\'s a full (absolute) address. The browser leaves your site and asks that server directly. No folder walking needed.');
      return steps;
    }
    if (/^mailto:/i.test(h)) { add(null, '', 'ok', 'mailto: doesn\'t go to a file at all: it opens the visitor\'s email app with that address filled in.'); return steps; }
    if (h.charAt(0) === '#') { add(null, '', 'ok', 'A # link jumps to a spot on the same page (an element with that id).'); return steps; }
    if (/^[a-z][a-z0-9+.-]*:/i.test(h)) { add(null, '', 'note', 'That starts with a scheme ("' + h.split(':')[0] + ':"), so the browser does not treat it as a path on your site.'); return steps; }

    if (/^www\./i.test(h)) {
      add(null, '', 'note', 'Careful: no https:// in front! The browser doesn\'t know "www" is special. It treats "' + h.split('/')[0] + '" as a FILE NAME in the current folder.');
    }
    if (h.indexOf('\\') !== -1) {
      add(null, '', 'note', 'Backslashes \\ are for Windows file paths. URLs use forward slashes /. Browsers usually quietly swap them, so this may work, but write / so you never depend on that.');
      h = h.replace(/\\/g, '/');
    }
    h = h.split('#')[0].split('?')[0];
    if (h.indexOf(' ') !== -1 || h.indexOf('%20') !== -1) {
      add(null, '', 'note', 'Spaces get sent as %20 in the address. It can work, but hyphens (new-york.html) are much safer.');
    }
    try { h = decodeURIComponent(h); } catch (e) { /* leave as typed */ }

    var cur;
    if (h.charAt(0) === '/') {
      cur = '';
      add('/', 'visit', '', 'A leading / means "start at the very top folder of the website", no matter which page you\'re on. (This works on a live server, not when you double-click a file.)');
      h = h.slice(1);
    } else {
      cur = startDir;
      add(folderId(cur), 'visit', '', 'Start in the folder that holds ' + start + ': ' + (cur ? 'my-site/' + cur + '/' : 'my-site/ (the top folder)') + '.');
    }

    var segs = h.split('/');
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i], last = i === segs.length - 1;
      if (seg === '' && !last) continue;
      if (seg === '' && last) {
        add(folderId(cur), 'miss', 'err', 'Ending in / asks for the folder itself. A server would look for index.html inside it, and there isn\'t one here → 404 Not Found.');
        return steps;
      }
      if (seg === '.') { add(folderId(cur), 'visit', '', './ means "this same folder". Stay put.'); continue; }
      if (seg === '..') {
        if (cur === '') {
          add('/', 'visit', 'note', '../ means "go up one folder", but we\'re already at the top. On a web server you can\'t climb above the site, so the browser just stays at the top folder.');
        } else {
          cur = cur.indexOf('/') === -1 ? '' : cur.slice(0, cur.lastIndexOf('/'));
          add(folderId(cur), 'visit', '', '../ means "go UP one folder" → now in ' + (cur ? 'my-site/' + cur + '/' : 'my-site/ (the top folder)') + '.');
        }
        continue;
      }
      var candidate = joinPath(cur, seg);
      if (!last) {
        if (SITE_FOLDERS.indexOf(candidate) !== -1) {
          cur = candidate;
          add(folderId(cur), 'visit', '', 'Go DOWN into the folder ' + seg + '/.');
          continue;
        }
        var ciF = ciFind(SITE_FOLDERS, candidate);
        if (ciF) {
          add(folderId(cur), 'miss', 'err', 'Looking for a folder named "' + seg + '/"… there\'s "' + ciF.split('/').pop() + '/" but the capital letters don\'t match. Live web servers are case-sensitive → 404. (It might work on your laptop, which is why this bug only shows up online.)');
        } else {
          add(folderId(cur), 'miss', 'err', 'There\'s no folder called "' + seg + '/" inside ' + (cur ? 'my-site/' + cur + '/' : 'my-site/') + '. Dead end → 404 Not Found.');
        }
        return steps;
      }
      // last segment = the file we want
      if (SITE_FILES.indexOf(candidate) !== -1) {
        add(candidate, 'found', 'ok', 'Found ' + seg + ' ✓ The browser loads my-site/' + candidate + '.');
        return steps;
      }
      if (SITE_FOLDERS.indexOf(candidate) !== -1) {
        add(folderId(candidate), 'miss', 'err', '"' + seg + '" is a folder, not a file, and there\'s no index.html inside it → 404.');
        return steps;
      }
      var ci = ciFind(SITE_FILES, candidate);
      if (ci) {
        add(ci, 'miss', 'err', 'Almost! The file is "' + ci.split('/').pop() + '" but you asked for "' + seg + '". Live web servers are case-sensitive, so this is a 404 online even if it worked on your laptop.');
        return steps;
      }
      if (SITE_FILES.indexOf(candidate + '.html') !== -1) {
        add(candidate + '.html', 'miss', 'err', 'There\'s a "' + seg + '.html" here but you left off .html. Always write the full file name.');
        return steps;
      }
      var elsewhere = SITE_FILES.filter(function (f) { return f.split('/').pop().toLowerCase() === seg.toLowerCase(); });
      add(folderId(cur), 'miss', 'err', 'No file called "' + seg + '" in ' + (cur ? 'my-site/' + cur + '/' : 'my-site/') + ' → 404 Not Found.' +
        (elsewhere.length ? ' (There IS one at my-site/' + elsewhere[0] + '. The path needs to lead there from where you started.)' : ''));
      return steps;
    }
    return steps;
  }

  var walkTimer = null;
  function renderTree(start) {
    $('#pathTree').innerHTML = TREE.map(function (n) {
      var icon = n.id.slice(-1) === '/' ? '📁 ' : (n.id.slice(-4) === '.png' ? '🖼️ ' : '📄 ');
      return '<div class="node' + (n.id === start ? ' here' : '') + '" data-id="' + esc(n.id) + '" style="padding-left:' + (8 + n.depth * 20) + 'px">' +
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
     SEE B: one stylesheet, four pages
     ===================================================================== */
  var MINI_PAGES = [
    { file: 'index.html', h: 'Home', p: 'Three cities I want to visit.' },
    { file: 'london.html', h: 'London', p: 'Big Ben and Tower Bridge.' },
    { file: 'new-york.html', h: 'New York', p: 'Times Square, all night.' },
    { file: 'tokyo.html', h: 'Tokyo', p: 'Shibuya Crossing and the Skytree.' }
  ];
  var LINK_CHOICES = [
    { v: 'ok', label: '<link rel="stylesheet" href="styles.css">', status: '✓ found styles.css and applied it' },
    { v: 'typo', label: '<link rel="stylesheet" href="style.css">', status: '✗ style.css doesn\'t exist (missing "s") → browser defaults' },
    { v: 'norel', label: '<link href="styles.css">', status: '✗ no rel="stylesheet", so the browser never applies it → defaults' },
    { v: 'none', label: '(no link line)', status: '✗ never asked for a stylesheet → browser defaults' }
  ];
  function renderMinis() {
    $('#minis').innerHTML = MINI_PAGES.map(function (pg, i) {
      return '<div class="mini linked" data-i="' + i + '">' +
        '<div class="cable"><span class="pulse"></span></div>' +
        '<div class="headline"><label style="display:flex;flex-direction:column;gap:2px;width:100%"><span>' + pg.file + ' &lt;head&gt;:</span>' +
        '<select aria-label="Link line in ' + pg.file + '">' + LINK_CHOICES.map(function (c) {
          return '<option value="' + c.v + '">' + esc(c.label) + '</option>';
        }).join('') + '</select></label></div>' +
        '<div class="page"><h4>' + pg.h + '</h4><p>' + pg.p + '</p><a href="#" tabindex="-1">Email me</a></div>' +
        '<div class="status">' + LINK_CHOICES[0].status + '</div></div>';
    }).join('');
    $all('.mini select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var m = sel.closest('.mini');
        var c = LINK_CHOICES.filter(function (x) { return x.v === sel.value; })[0];
        m.classList.toggle('linked', c.v === 'ok');
        m.classList.toggle('broken', c.v !== 'ok');
        $('.status', m).textContent = c.status;
        flash();
      });
    });
  }
  function updateSheet() {
    var bg = $('#ssBg').value, col = $('#ssColor').value, font = $('#ssFont').value, acc = $('#ssAccent').value;
    var m = $('#minis');
    m.style.setProperty('--ss-bg', bg);
    m.style.setProperty('--ss-color', col);
    m.style.setProperty('--ss-font', font);
    m.style.setProperty('--ss-accent', acc);
    var fontLabel = $('#ssFont').selectedOptions[0].textContent;
    $('#ssCode').innerHTML = esc(
      'body {\n  background-color: ' + bg + ';\n  color: ' + col + ';\n  font-family: ' + fontLabel + ';\n}\nh1 { border-bottom: 3px solid ' + acc + '; }\na  { color: ' + acc + '; }');
    flash();
  }
  function flash() {
    $all('.mini.linked').forEach(function (m) {
      m.classList.remove('flash'); void m.offsetWidth; m.classList.add('flash');
    });
  }
  renderMinis();
  ['#ssBg', '#ssColor', '#ssFont', '#ssAccent'].forEach(function (s) { $(s).addEventListener('change', updateSheet); });
  updateSheet();

  /* =====================================================================
     SEE C: cascade referee (the real browser computes the winner)
     ===================================================================== */
  var CRULES = [
    { id: 'body', where: 'styles.css · line 1', code: 'body { color: darkorange; }', css: '.fakebody { color: darkorange; }', rgb: 'rgb(255, 140, 0)', sw: 'darkorange', on: true },
    { id: 'p1', where: 'styles.css · line 4', code: 'p { color: navy; }', css: 'p { color: navy; }', rgb: 'rgb(0, 0, 128)', sw: 'navy', on: true },
    { id: 'cls', where: 'styles.css · line 7', code: '.note { color: purple; }', css: '.note { color: purple; }', rgb: 'rgb(128, 0, 128)', sw: 'purple', on: false },
    { id: 'p2', where: 'styles.css · line 12 (later in the file)', code: 'p { color: green; }', css: 'p { color: green; }', rgb: 'rgb(0, 128, 0)', sw: 'green', on: true },
    { id: 'inline', where: 'written on the tag itself (inline)', code: '<p class="note" style="color: crimson">', rgb: 'rgb(220, 20, 60)', sw: 'crimson', on: false }
  ];
  var host = $('#cascadeHost');
  var shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : null;

  function renderRules() {
    $('#cascadeRules').innerHTML = '<div class="rule" style="cursor:default"><span>🔒</span><span><span class="where">browser default (always there)</span><code>text color: black</code><span class="sw" style="background:black"></span></span></div>' +
      CRULES.map(function (r) {
        return '<label class="rule" data-id="' + r.id + '"><input type="checkbox"' + (r.on ? ' checked' : '') + '>' +
          '<span><span class="where">' + esc(r.where) + '</span><code>' + esc(r.code) + '</code><span class="sw" style="background:' + r.sw + '"></span></span></label>';
      }).join('');
    $all('#cascadeRules input').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = cb.closest('.rule').getAttribute('data-id');
        CRULES.forEach(function (r) { if (r.id === id) r.on = cb.checked; });
        referee();
      });
    });
  }
  function isOn(id) { return CRULES.some(function (r) { return r.id === id && r.on; }); }
  function referee() {
    if (!shadow) { $('#cascadeVerdict').textContent = 'Your browser is too old for this demo.'; return; }
    var css = CRULES.filter(function (r) { return r.on && r.css; }).map(function (r) { return r.css; }).join('\n');
    var inline = isOn('inline') ? ' style="color: crimson"' : '';
    shadow.innerHTML =
      '<style>:host{all:initial;display:block}.fakebody{padding:14px 16px;font:18px/1.5 Georgia,serif;background:#fff}' +
      '.lbl{font:12px/1 monospace;color:#888;margin-bottom:6px}' + css + '</style>' +
      '<div class="fakebody"><div class="lbl">&lt;body&gt;</div>Some text sitting directly in the body.' +
      '<p class="note"' + inline + '>And this is &lt;p class="note"&gt;. What color am I?</p></div>';
    var p = shadow.querySelector('p');
    var got = getComputedStyle(p).color;
    var winner = null;
    CRULES.forEach(function (r) { if (r.rgb === got) winner = r.id; });

    $all('#cascadeRules .rule').forEach(function (el) { el.classList.toggle('winner', el.getAttribute('data-id') === winner); });
    var why;
    if (winner === 'inline') why = '<strong>Inline style wins.</strong> A style="" written right on the tag beats every rule in the stylesheet.';
    else if (winner === 'cls') why = '<strong>.note wins.</strong> A class selector is more specific than a plain p selector, so it wins' + (isOn('p2') ? ', <em>even though</em> p { color: green } comes later in the file.' : '.');
    else if (winner === 'p2') why = isOn('p1') ? '<strong>The later p rule wins.</strong> Both p rules are equally specific, so the one further down the file wins. Swap their order and navy would win.' : '<strong>p { color: green } wins.</strong> It\'s the only rule that targets &lt;p&gt; directly.';
    else if (winner === 'p1') why = '<strong>p { color: navy } wins.</strong> It\'s the only rule that targets &lt;p&gt; directly' + (isOn('body') ? ', and a direct rule always beats a color inherited from body.' : '.');
    else if (winner === 'body') why = '<strong>Inherited from body.</strong> No rule targets &lt;p&gt; directly, so it inherits its parent\'s color. Turn on any p rule and inheritance loses.';
    else why = '<strong>Browser default.</strong> No rules apply, so you see the browser\'s built-in black text.';
    $('#cascadeVerdict').innerHTML = why + '<br><small>Computed by your browser: <code>' + esc(got) + '</code></small>';
  }
  renderRules();
  referee();

  /* =====================================================================
     STORY
     ===================================================================== */
  var STORIES = {
    tags: function (you, site) {
      return '<h3>The Bracket Twins</h3><p class="cast">Starring Open &lt;p&gt;, Close &lt;/p&gt;, Solo the &lt;img&gt;, and ' + you + '</p>' +
        '<p>' + you + ' is building a ' + site + ' website, and the first two characters to move in are twins: <b>Open</b> and <b>Close</b>. Open always arrives first and looks like <code>&lt;p&gt;</code>. Close always arrives last and looks almost the same, except Close carries a slash: <code>&lt;/p&gt;</code>. Whatever stands between them, "Welcome to my ' + site + ' site!", is under their protection. The twins plus the words make one thing together: a paragraph <em>element</em>.</p>' +
        '<p>One night ' + you + ' typed <code>&lt;h1&gt;My ' + site + ' Page</code> and forgot to invite Close. Open waited, and waited, and with no Close to say "stop here", the browser decided the heading just… kept going. Every paragraph after it showed up giant. ' + you + ' added <code>&lt;/h1&gt;</code> and everything shrank back to normal.</p>' +
        '<p>Next door live Bea <code>&lt;b&gt;</code> and Ike <code>&lt;i&gt;</code>, who like to nest: <code>&lt;b&gt;&lt;i&gt;wow&lt;/i&gt;&lt;/b&gt;</code>. They have one house rule: <em>whoever came in last leaves first</em>, like boxes inside boxes. Writing <code>&lt;b&gt;&lt;i&gt;wow&lt;/b&gt;&lt;/i&gt;</code> is like trying to close the big box while the small one is still sticking out.</p>' +
        '<p>Then there\'s <b>Solo</b>, the <code>&lt;img&gt;</code> tag. Solo has no twin and never needs a closing tag. Instead, Solo carries everything in a backpack of attributes: <code>src="img/tokyo.png"</code> for where the picture lives and <code>alt="Tokyo"</code> for what to say if it can\'t be seen. Attributes always ride in the <em>opening</em> tag, never the closing one.</p>' +
        '<div class="moral"><strong>The moral</strong><ul><li>Most tags come in pairs; the closing one has a slash.</li><li>Close the inner tag before the outer one.</li><li>Empty elements like &lt;img&gt;, &lt;br&gt;, &lt;link&gt;, &lt;meta&gt; have no closing tag.</li><li>Attributes go in the opening tag.</li></ul></div>';
    },
    headbody: function (you, site) {
      return '<h3>The House With Two Floors</h3><p class="cast">Starring Hedda the Head, Bodhi the Body, Butler Browser, and ' + you + '</p>' +
        '<p>Every page ' + you + ' builds for the ' + site + ' site is a little house with two floors inside its walls, <code>&lt;html&gt;</code>. Upstairs, in the attic, lives <b>Hedda the Head</b>. Downstairs, in the living room, lives <b>Bodhi the Body</b>.</p>' +
        '<p>Hedda handles paperwork guests never see. She keeps the nameplate for the browser tab (<code>&lt;title&gt;</code>), the note about which alphabet the house uses (<code>&lt;meta charset="utf-8"&gt;</code>), and the phone number of the tailor who dresses the whole house (<code>&lt;link rel="stylesheet" href="styles.css"&gt;</code>). None of it shows up on the page, but the house falls apart without it.</p>' +
        '<p>Bodhi handles the guests. Everything a visitor actually looks at lives downstairs: the big <code>&lt;h1&gt;</code> sign, the <code>&lt;nav&gt;</code> menu, the photos, the paragraphs about ' + site + '.</p>' +
        '<p>One day ' + you + ' accidentally carried an <code>&lt;h1&gt;</code> up to the attic. <b>Butler Browser</b>, who is very polite and very fussy, sighed and quietly carried it back downstairs so guests could see it. The page looked fine, but ' + you + '\'s blueprint was still wrong, and the next person reading the code would be confused. So ' + you + ' moved it to the body properly.</p>' +
        '<div class="moral"><strong>The moral</strong><ul><li>One &lt;head&gt; then one &lt;body&gt;, both inside &lt;html&gt;.</li><li>Head = information about the page (title, meta, stylesheet link).</li><li>Body = everything visitors see.</li></ul></div>';
    },
    links: function (you, site) {
      return '<h3>Ana the Courier</h3><p class="cast">Starring Ana the &lt;a&gt;nchor, her address label href, and ' + you + '</p>' +
        '<p>On ' + you + '\'s ' + site + ' site, <b>Ana</b> is the courier. Her full name is <code>&lt;a&gt;</code>, short for <em>anchor</em>. She holds up a sign so visitors know where she goes (that\'s whatever sits between <code>&lt;a&gt;</code> and <code>&lt;/a&gt;</code>), and she carries an address label called <b>href</b>.</p>' +
        '<p><code>&lt;a href="tokyo.html"&gt;Visit Tokyo&lt;/a&gt;</code>: the sign says "Visit Tokyo"; the label says tokyo.html. When someone clicks the sign, Ana runs to that file. For the menu, ' + you + ' gave Ana a picture to hold instead of words: <code>&lt;a href="tokyo.html"&gt;&lt;img src="img/tokyo.png" alt="Tokyo"&gt;&lt;/a&gt;</code>.</p>' +
        '<p>Then ' + you + ' asked Ana to deliver to <code>href="www.google.com"</code>. Ana looked at the label, saw no <code>https://</code>, and did exactly what she was told: she searched the current folder for a <em>file</em> named "www.google.com". There wasn\'t one. 404. With <code>https://www.google.com</code> she\'d have known to leave the site entirely.</p>' +
        '<p>Ana has a cousin, <b>Link</b> (<code>&lt;link&gt;</code>), who people mix her up with. Link never gets clicked. He lives in the head and quietly fetches the stylesheet. Ana is for people; Link is for the browser.</p>' +
        '<div class="moral"><strong>The moral</strong><ul><li>&lt;a href="where"&gt;what people click&lt;/a&gt;</li><li>Other websites need the full https:// address.</li><li>Always close with &lt;/a&gt; or the link swallows what follows.</li></ul></div>';
    },
    paths: function (you, site) {
      return '<h3>Directions From Where You Stand</h3><p class="cast">Starring Ana the courier, the Strict Doorman, and ' + you + '</p>' +
        '<p>Ana the courier never gets a map of ' + you + '\'s ' + site + ' site. She only gets <em>directions</em>, and directions always start from the room she\'s standing in: the folder of the current page.</p>' +
        '<p>From <code>index.html</code> in the top folder, <code>img/tokyo.png</code> means "walk into the img room, grab tokyo.png." Easy. But then ' + you + ' moved London\'s page into a <code>pages/</code> folder. Ana, now standing in pages/, read the same directions, walked looking for <code>pages/img/</code>, and found nothing. The photo broke.</p>' +
        '<p>The fix was two dots and a slash: <code>../img/tokyo.png</code>. <code>../</code> means "go upstairs one floor first." From pages/, Ana climbs up to the top folder, then walks into img/, and there\'s the photo.</p>' +
        '<p>Last came the <b>Strict Doorman</b>, the web server. On ' + you + '\'s laptop, a sleepy doorman let <code>Tokyo.png</code> in even though the file was <code>tokyo.png</code>. But once the site went live, the Strict Doorman checked every capital letter: "Tokyo.png? Nobody here by that name." 404. ' + you + ' learned to match file names <em>exactly</em>, and to use hyphens instead of spaces.</p>' +
        '<div class="moral"><strong>The moral</strong><ul><li>Relative paths start from the current page\'s folder.</li><li>folder/file goes down; ../ goes up one.</li><li>Match capital letters exactly. Use / not \\.</li></ul></div>';
    },
    stylesheet: function (you, site) {
      return '<h3>One Tailor, Four Pages</h3><p class="cast">Starring Taylor the stylesheet, four pages, and ' + you + '</p>' +
        '<p>' + you + '\'s ' + site + ' site has four pages, and they all want to look like they belong to the same brand. So they hire one tailor, <b>Taylor</b>, who lives in a file called <code>styles.css</code>.</p>' +
        '<p>Each page sends Taylor a note from its head: <code>&lt;link rel="stylesheet" href="styles.css"&gt;</code>. The <code>rel</code> part says "this is a stylesheet"; the <code>href</code> part says where Taylor lives. Taylor reads rules like <code>body { background-color: navy; }</code> and dresses every page that sent a note.</p>' +
        '<p>The magic happened when ' + you + ' changed one line, navy to plum. Four pages changed at once. No editing four files, just one.</p>' +
        '<p>Except the Tokyo page. It showed up in plain white, black Times New Roman, blue underlined links: the browser\'s pajamas. ' + you + ' looked at its head: <code>href="style.css"</code>. One missing "s". The note went to an address where nobody lived, so Tokyo never got dressed. One letter fixed, and Tokyo matched the rest.</p>' +
        '<div class="moral"><strong>The moral</strong><ul><li>One styles.css, linked from every page\'s head.</li><li>Change it once, every linked page changes.</li><li>Unstyled page? Check the link line: spelling, path, rel="stylesheet".</li></ul></div>';
    },
    cascade: function (you, site) {
      return '<h3>The Argument About Color</h3><p class="cast">Starring Pip the paragraph, a crowd of rules, Judge Cascade, and ' + you + '</p>' +
        '<p>On the ' + site + ' site, a little paragraph named <b>Pip</b> (<code>&lt;p class="note"&gt;</code>) just wants to know what color to be. Everyone has an opinion.</p>' +
        '<p>The Browser shrugs: "Black. That\'s the default." Pip\'s parent, Body, calls down: "Wear orange like me!" That\'s <em>inheritance</em>, and Pip would happily listen, <em>if nobody else spoke to Pip directly</em>. But <code>p { color: navy; }</code> does, and further down the file <code>p { color: green; }</code> speaks up too.</p>' +
        '<p><b>Judge Cascade</b> bangs the gavel. "Rule one: a direct order beats an inherited one, so Body loses. Rule two: navy and green are equally specific, so whoever spoke <em>last</em> wins. Green."</p>' +
        '<p>Then <code>.note { color: purple; }</code> stands up, and it had spoken <em>before</em> green. Doesn\'t matter. "A class is more specific than a plain p," says the Judge. "Purple." Finally ' + you + ' writes <code>style="color: crimson"</code> right on Pip\'s tag. The Judge doesn\'t even look up: "Inline beats the stylesheet. Crimson. Case closed."</p>' +
        '<div class="moral"><strong>The moral</strong><ul><li>Direct rules beat inherited ones.</li><li>More specific wins (id &gt; class &gt; element).</li><li>Tie in specificity? Later wins.</li><li>Inline style="" beats stylesheet rules.</li></ul></div>';
    }
  };
  function renderStory() {
    var you = esc($('#storyName').value.trim() || 'You');
    var site = esc($('#storySite').value.trim() || 'travel');
    $('#storyOut').innerHTML = STORIES[current](you, site);
  }
  ['#storyName', '#storySite'].forEach(function (s) { $(s).addEventListener('input', renderStory); });
  onConcept(renderStory);

  /* =====================================================================
     PRACTICE: QUIZ
     ===================================================================== */
  var QUIZ = [
    { c: 'tags', q: 'Which of these is a CLOSING tag?', opts: ['<p>', '</p>', '<p/>', '<\\p>'], a: 1, why: 'Closing tags start with a forward slash right after the angle bracket: </p>.' },
    { c: 'tags', q: 'Which element does NOT get a closing tag?', opts: ['<h1>', '<a>', '<img>', '<p>'], a: 2, why: '<img> is an empty (void) element. Everything it needs, src and alt, goes in attributes.' },
    { c: 'tags', q: 'Which line nests tags correctly?', opts: ['<b><i>hi</b></i>', '<b><i>hi</i></b>', '<b>hi<i></b></i>', '</b><i>hi</i><b>'], a: 1, why: 'Last opened, first closed: <i> opened inside <b>, so </i> must come before </b>.' },
    { c: 'tags', q: 'Where do attributes like href and src go?', opts: ['In the closing tag', 'In the opening tag', 'Between the tags', 'In the stylesheet'], a: 1, why: 'Attributes always go inside the opening tag: <a href="tokyo.html">.' },
    { c: 'headbody', q: 'Where does the text inside <title> show up?', opts: ['As the big heading on the page', 'On the browser tab', 'In the footer', 'Nowhere'], a: 1, why: '<title> lives in the head. Its text appears on the browser tab and in bookmarks, not on the page.' },
    { c: 'headbody', q: 'Which of these belongs in the <body>?', opts: ['<title>', '<meta charset="utf-8">', '<nav>', '<link rel="stylesheet" href="styles.css">'], a: 2, why: 'The menu is something visitors see, so <nav> goes in the body. The others are information about the page and go in the head.' },
    { c: 'headbody', q: 'How many <body> elements should one page have?', opts: ['One', 'One per section', 'Two: one for the menu, one for content', 'As many as you like'], a: 0, why: 'Exactly one head and one body per page. Use other elements (nav, h1, p, div) for sections.' },
    { c: 'links', q: 'What does href do in <a href="tokyo.html">Tokyo</a>?', opts: ['Sets the link text', 'Says where the link goes', 'Makes it blue', 'Loads a stylesheet'], a: 1, why: 'href (hypertext reference) is the destination. The text between the tags is what people click.' },
    { c: 'links', q: 'You want to link to Google. Which href works?', opts: ['www.google.com', 'google', 'https://www.google.com', 'google.html'], a: 2, why: 'Without https:// the browser treats "www.google.com" as a file in your own folder.' },
    { c: 'links', q: 'Which element makes something people can CLICK?', opts: ['<link>', '<a>', '<href>', '<nav>'], a: 1, why: '<a> is the clickable link. <link> is a head-only element that connects files like the stylesheet. <nav> just groups links.' },
    { c: 'paths', q: 'You\'re on pages/london.html. styles.css is in the top folder. Which href reaches it?', opts: ['styles.css', '../styles.css', 'pages/styles.css', '/pages/styles.css'], a: 1, why: '../ climbs from pages/ up to the top folder, where styles.css lives.' },
    { c: 'paths', q: 'Your link works on your laptop but breaks online. The file is tokyo.png, the code says Tokyo.png. Why?', opts: ['The internet is slow', 'Web servers are case-sensitive', 'PNG files don\'t work online', 'You need https://'], a: 1, why: 'Live web servers treat Tokyo.png and tokyo.png as different files. Laptops often don\'t, which hides the bug.' },
    { c: 'paths', q: 'From index.html, what does src="img/home.png" mean?', opts: ['Go up a folder, find home.png', 'Go into the img folder, find home.png', 'Download home.png from the internet', 'Find a file named img/home.png anywhere'], a: 1, why: 'Each name followed by / steps DOWN into that folder, starting from the current page\'s folder.' },
    { c: 'stylesheet', q: 'Which line connects a page to styles.css?', opts: ['<style src="styles.css">', '<link rel="stylesheet" href="styles.css">', '<a href="styles.css">', '<css>styles.css</css>'], a: 1, why: 'rel="stylesheet" says what kind of file; href says where. <style> can\'t load files and <a> just makes a clickable link.' },
    { c: 'stylesheet', q: 'One page shows white background, black Times text, blue underlined links. The others look branded. Most likely cause?', opts: ['That page\'s link line is missing or has a wrong path', 'styles.css is broken', 'The browser is outdated', 'The page has too much text'], a: 0, why: 'If styles.css were broken, every page would break. One plain page means that page isn\'t connected: check spelling, path, and rel.' },
    { c: 'stylesheet', q: 'In h1 { color: navy; }, what is "h1"?', opts: ['The property', 'The value', 'The selector', 'The stylesheet'], a: 2, why: 'selector { property: value; }. The selector picks which elements the rule styles.' },
    { c: 'cascade', q: 'styles.css has p { color: navy; } and further down p { color: green; }. Paragraphs are…', opts: ['Navy', 'Green', 'Black', 'A mix'], a: 1, why: 'Equally specific, so the rule that comes later wins.' },
    { c: 'cascade', q: '.note { color: purple; } comes BEFORE p { color: green; }. What color is <p class="note">?', opts: ['Green, it\'s later', 'Purple, a class is more specific', 'Black', 'Whatever body is'], a: 1, why: 'Specificity is checked before order. A class beats a plain element selector even if it comes earlier.' },
    { c: 'cascade', q: 'body { color: orange; } and p { color: navy; }. What color are the paragraphs?', opts: ['Orange, body is the parent', 'Navy', 'Black', 'Orange in some, navy in others'], a: 1, why: 'Inheritance only fills in when no rule targets the element directly. p { color: navy } targets it directly, so it wins.' }
  ];
  var quiz = { list: [], i: 0, score: 0 };
  function startQuiz() {
    var all = $('#quizAll').checked;
    quiz.list = shuffle(QUIZ.filter(function (q) { return all || q.c === current; }));
    quiz.i = 0; quiz.score = 0;
    renderQuiz();
  }
  function renderQuiz() {
    var box = $('#quizBox');
    if (quiz.i >= quiz.list.length) {
      var pct = Math.round(quiz.score / quiz.list.length * 100);
      box.innerHTML = '<p class="q">Done! ' + quiz.score + ' / ' + quiz.list.length + ' (' + pct + '%)</p>' +
        '<p>' + (pct === 100 ? 'Perfect. Try another concept, or check "mix in every concept".' : 'Re-read the concept card above, or try Story mode for the ones you missed, then go again.') + '</p>' +
        '<button class="btn" id="quizAgain">Try again</button>';
      $('#quizAgain').addEventListener('click', startQuiz);
      return;
    }
    var item = quiz.list[quiz.i];
    var order = shuffle(item.opts.map(function (o, idx) { return idx; }));
    box.innerHTML = '<div class="meta"><span>Question ' + (quiz.i + 1) + ' of ' + quiz.list.length + ' · ' + esc(CONCEPTS[item.c].name) + '</span><span>Score: ' + quiz.score + '</span></div>' +
      '<p class="q">' + esc(item.q) + '</p>' +
      '<div class="options">' + order.map(function (idx) {
        return '<button class="opt" data-idx="' + idx + '"><code>' + esc(item.opts[idx]) + '</code></button>';
      }).join('') + '</div><div class="feedback"></div>';
    $all('.opt', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var pick = +b.getAttribute('data-idx'), right = pick === item.a;
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
  $('#quizAll').addEventListener('change', startQuiz);
  onConcept(startQuiz);

  /* =====================================================================
     PRACTICE: BROKEN-MENU DEBUGGER
     ===================================================================== */
  var DEBUG_ROUNDS = [
    {
      page: 'index.html',
      intro: 'This menu is on <code>index.html</code> in the top folder. Four links, four bugs. Fix the code, then press <em>Check my menu</em>.',
      files: ['index.html', 'london.html', 'new-york.html', 'tokyo.html', 'img/home.png', 'img/london.png', 'img/new-york.png', 'img/tokyo.png'],
      code: '<nav>\n  <a href="index.html"><img src="img/home.png" alt="Home"></a>\n  <a href="London.html"><img src="img/london.png" alt="London"></a>\n  <a href="new-york.html"><img src="images/new-york.png" alt="New York"></a>\n  <a herf="tokyo.html"><img src="img/tokyo.png" alt="Tokyo">\n</nav>',
      hints: ['Compare every capital letter with the file list.', 'What is the image folder actually called?', 'Read each attribute name slowly, letter by letter.', 'Count the <a> tags and the </a> tags.']
    },
    {
      page: 'pages/london.html',
      intro: 'Now the menu is on <code>pages/london.html</code>, a page <strong>inside a folder</strong>. Everything else is one level up, or right next door. Four bugs again.',
      files: ['index.html', 'styles.css', 'img/home.png', 'img/london.png', 'img/new-york.png', 'img/tokyo.png', 'pages/london.html', 'pages/new-york.html', 'pages/tokyo.html'],
      code: '<nav>\n  <a href="index.html"><img src="../img/home.png" alt="Home"></a>\n  <a href="london.html"><img src="img/london.png" alt="London"></a>\n  <a href="new-york"><img src="../img/new-york.png" alt="New York"></a>\n  <a href="tokyo.html"><img src="../img/tokyo.png"></a>\n</nav>',
      hints: ['index.html is not in pages/. How do you go up a folder?', 'The images are not in pages/ either.', 'Is "new-york" the full file name?', 'Every image should say what it is, for people who can\'t see it.']
    },
    {
      page: 'index.html',
      intro: 'Back on <code>index.html</code>. These bugs are sneaky: quotes, a typo, a space, and a slash.',
      files: ['index.html', 'london.html', 'new-york.html', 'tokyo.html', 'img/home.png', 'img/london.png', 'img/new-york.png', 'img/tokyo.png'],
      code: '<nav>\n  <a href="index.html><img src="img/home.png" alt="Home"></a>\n  <a href="london.html"><img scr="img/london.png" alt="London"></a>\n  <a href="new york.html"><img src="img/new-york.png" alt="New York"></a>\n  <a href="tokyo.html"><img src="img/tokyo.png" alt="Tokyo"><a>\n</nav>',
      hints: ['Every opening quote needs a closing quote.', 'src, not scr.', 'Space or hyphen? Check the file list.', 'Look at the very last tag on the Tokyo line.']
    }
  ];
  var dbg = { r: 0, hint: 0 };
  function fileTreeText(files) {
    var top = files.filter(function (f) { return f.indexOf('/') === -1; });
    var folders = {};
    files.forEach(function (f) { if (f.indexOf('/') !== -1) { var d = f.split('/')[0]; (folders[d] = folders[d] || []).push(f.split('/')[1]); } });
    var out = 'Files on the server:\nmy-site/\n';
    Object.keys(folders).forEach(function (d) {
      out += '  ' + d + '/\n';
      folders[d].forEach(function (f) { out += '    ' + f + '\n'; });
    });
    top.forEach(function (f) { out += '  ' + f + '\n'; });
    return out;
  }
  function loadDebug() {
    var R = DEBUG_ROUNDS[dbg.r];
    dbg.hint = 0;
    $('#debugIntro').innerHTML = '<strong>Menu ' + (dbg.r + 1) + ' of ' + DEBUG_ROUNDS.length + '.</strong> ' + R.intro;
    $('#debugFiles').textContent = fileTreeText(R.files) + '\nThis menu lives in: ' + R.page;
    $('#debugCode').value = R.code;
    $('#debugResults').innerHTML = '<li>Press <strong>Check my menu</strong> to see what the browser does with each link.</li>';
  }
  function resolveFrom(page, ref) {
    try {
      var u = new URL(ref, 'https://my-site.test/' + page);
      if (u.host !== 'my-site.test') return { external: true };
      return { path: decodeURIComponent(u.pathname.replace(/^\//, '')) };
    } catch (e) { return { bad: true }; }
  }
  function checkRef(R, ref, kind) {
    // returns {ok:bool, msg}
    if (/[<>"]/.test(ref) || /\s(src|alt|href)=/.test(ref)) {
      return { ok: false, msg: 'The ' + kind + ' is <code>' + esc(ref) + '</code>. A quote is missing, so it swallowed the code after it.' };
    }
    var res = resolveFrom(R.page, ref);
    if (res.external) return { ok: false, msg: '<code>' + esc(ref) + '</code> leaves the site. Menu links should point at your own pages.' };
    if (res.bad) return { ok: false, msg: '<code>' + esc(ref) + '</code> isn\'t a valid address.' };
    var p = res.path;
    if (R.files.indexOf(p) !== -1) return { ok: true, path: p };
    var ci = ciFind(R.files, p);
    if (ci) return { ok: false, msg: '<code>' + esc(ref) + '</code> → my-site/' + esc(p) + ' doesn\'t exist, but <code>' + esc(ci) + '</code> does. Capital letters must match: live servers are case-sensitive.' };
    if (R.files.indexOf(p + '.html') !== -1) return { ok: false, msg: '<code>' + esc(ref) + '</code> is missing <code>.html</code>. (Some hosts guess it for you, but opening the file on your computer won\'t. Always write it.)' };
    if (ref.indexOf(' ') !== -1) {
      var hy = p.replace(/ /g, '-');
      if (R.files.indexOf(hy) !== -1) return { ok: false, msg: '<code>' + esc(ref) + '</code> has a space, but the real file is <code>' + esc(hy) + '</code> with a hyphen.' };
    }
    var name = p.split('/').pop();
    var other = R.files.filter(function (f) { return f.split('/').pop() === name; })[0];
    var where = R.page.indexOf('/') === -1 ? 'the top folder' : R.page.split('/')[0] + '/';
    if (other) return { ok: false, msg: '<code>' + esc(ref) + '</code> looks for my-site/' + esc(p) + ' (starting from ' + where + '), but the file is at my-site/' + esc(other) + '. Fix the path.' };
    return { ok: false, msg: '<code>' + esc(ref) + '</code> → my-site/' + esc(p) + ': no such file. 404.' };
  }
  function checkDebug() {
    var R = DEBUG_ROUNDS[dbg.r];
    var code = $('#debugCode').value;
    var out = [], allOk = true;
    var opens = (code.match(/<a[\s>]/gi) || []).length, closes = (code.match(/<\/a\s*>/gi) || []).length;
    if (!/<nav[\s>]/i.test(code) || !/<\/nav\s*>/i.test(code)) { out.push('<li class="err">The menu should be wrapped in <code>&lt;nav&gt;</code> … <code>&lt;/nav&gt;</code>.</li>'); allOk = false; }
    if (opens !== closes) {
      out.push('<li class="err">You have <strong>' + opens + '</strong> opening <code>&lt;a&gt;</code> tags but <strong>' + closes + '</strong> closing <code>&lt;/a&gt;</code> tags. Every link needs its own <code>&lt;/a&gt;</code>, or it swallows everything after it. (Is a slash missing?)</li>');
      allOk = false;
    }
    var doc = new DOMParser().parseFromString('<!doctype html><body>' + code, 'text/html');
    var anchors = $all('a', doc), pages = [];
    anchors.forEach(function (a, i) {
      var label = 'Link ' + (i + 1);
      var msgs = [], ok = true;
      var href = a.getAttribute('href');
      if (href === null) {
        ok = false;
        if (a.hasAttribute('herf')) msgs.push('<code>herf</code> is a typo, so the browser ignores it and this link has no destination. It should be <code>href</code>.');
        else if (!a.querySelector('img') && !a.textContent.trim()) msgs.push('An empty <code>&lt;a&gt;</code> with no href. That\'s usually a closing tag missing its slash: <code>&lt;a&gt;</code> instead of <code>&lt;/a&gt;</code>.');
        else msgs.push('This <code>&lt;a&gt;</code> has no <code>href</code>, so it goes nowhere.');
      } else {
        var r = checkRef(R, href, 'href');
        if (!r.ok) { ok = false; msgs.push(r.msg); }
        else if (!/\.html$/.test(r.path)) { ok = false; msgs.push('<code>' + esc(href) + '</code> exists but isn\'t a page. Menu links should go to .html files.'); }
        else { msgs.push('goes to my-site/' + esc(r.path) + ' ✓'); pages.push(r.path); }
      }
      var img = a.querySelector('img');
      if (!img) {
        if (href !== null) { ok = false; msgs.push('There\'s no image inside this link.'); }
      } else {
        var src = img.getAttribute('src');
        if (src === null) {
          ok = false;
          msgs.push(img.hasAttribute('scr') ? '<code>scr</code> is a typo for <code>src</code>, so the image has no source and shows broken.' : 'The image has no <code>src</code>.');
        } else {
          var ri = checkRef(R, src, 'src');
          if (!ri.ok) { ok = false; msgs.push('Image: ' + ri.msg); }
          else msgs.push('image my-site/' + esc(ri.path) + ' ✓');
        }
        var alt = img.getAttribute('alt');
        if (!alt || !alt.trim()) { ok = false; msgs.push('The image is missing <code>alt</code> text. Screen readers would just say "link", and if the image fails there\'s nothing to click.'); }
      }
      if (!ok) allOk = false;
      out.push('<li class="' + (ok ? 'ok' : 'err') + '"><strong>' + label + ':</strong> ' + msgs.join(' ') + '</li>');
    });
    if (anchors.length !== 4) { allOk = false; out.push('<li class="err">The browser sees <strong>' + anchors.length + '</strong> links, not 4. Check your &lt;a&gt; and &lt;/a&gt; tags.</li>'); }
    var unique = pages.filter(function (p, i) { return pages.indexOf(p) === i; });
    if (allOk && unique.length !== 4) { allOk = false; out.push('<li class="err">Two links go to the same page. Each button should go somewhere different.</li>'); }
    if (allOk) out.unshift('<li class="win">🎉 Every link and image works. That menu is fixed!' + (dbg.r < DEBUG_ROUNDS.length - 1 ? ' Try the next menu.' : ' You finished all three.') + '</li>');
    $('#debugResults').innerHTML = out.join('');
  }
  $('#debugCheck').addEventListener('click', checkDebug);
  $('#debugReset').addEventListener('click', loadDebug);
  $('#debugNext').addEventListener('click', function () { dbg.r = (dbg.r + 1) % DEBUG_ROUNDS.length; loadDebug(); });
  $('#debugHint').addEventListener('click', function () {
    var R = DEBUG_ROUNDS[dbg.r];
    var h = R.hints[dbg.hint % R.hints.length];
    dbg.hint++;
    var li = document.createElement('li');
    li.innerHTML = '💡 <strong>Hint ' + ((dbg.hint - 1) % R.hints.length + 1) + ':</strong> ' + esc(h);
    $('#debugResults').insertBefore(li, $('#debugResults').firstChild);
  });
  loadDebug();

  /* =====================================================================
     PRACTICE: FIND THE MISSING LINE
     ===================================================================== */
  var GAP = '@@GAP@@';
  var MISS_ROUNDS = [
    {
      prompt: 'This page should match the rest of the site, but it shows up plain white in Times New Roman. Which line is missing from the head?',
      file: 'index.html', kind: 'css',
      code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Home</title>\n' + GAP + '\n</head>\n<body>\n<h1>Home</h1>\n...',
      opts: [
        { t: '<link rel="stylesheet" href="styles.css">', ok: true, why: 'rel="stylesheet" says what kind of file it is, href says where it is. The page is dressed!' },
        { t: '<link href="styles.css">', why: 'Close, but without rel="stylesheet" the browser doesn\'t know the file is a stylesheet, so it never applies it.' },
        { t: '<style src="styles.css">', why: '<style> holds CSS typed directly inside it. It can\'t load a file, and it has no src attribute.' },
        { t: '<a href="styles.css">', why: '<a> makes a clickable link for people. Clicking it would just show the raw CSS. It doesn\'t style the page.' }
      ]
    },
    {
      prompt: 'This page lives inside a folder: pages/tokyo.html. styles.css is in the top folder. Which link line works?',
      file: 'pages/tokyo.html', kind: 'css',
      tree: 'my-site/\n  styles.css\n  index.html\n  pages/\n    tokyo.html   ← this page',
      code: '<head>\n<meta charset="utf-8">\n<title>Tokyo</title>\n' + GAP + '\n</head>',
      opts: [
        { t: '<link rel="stylesheet" href="../styles.css">', ok: true, why: '../ climbs from pages/ up to the top folder, where styles.css lives.' },
        { t: '<link rel="stylesheet" href="styles.css">', why: 'That looks for pages/styles.css, starting from the page\'s own folder. Nothing there.' },
        { t: '<link rel="stylesheet" href="pages/styles.css">', why: 'Starting from pages/, that looks for pages/pages/styles.css. Way off.' },
        { t: '<link rel="stylesheet" href="..\\styles.css">', why: 'Right idea, wrong slash. URLs use forward slashes /. Some browsers quietly fix \\, but don\'t count on it.' }
      ]
    },
    {
      prompt: 'Where does the stylesheet link line belong?',
      file: 'tokyo.html', kind: 'css',
      code: '① \n<!DOCTYPE html>\n<html>\n<head>\n<title>Tokyo</title>\n② \n</head>\n<body>\n③ \n<h1>Tokyo</h1>\n</body>\n</html>\n④ ',
      opts: [
        { t: 'Spot ② (inside <head>)', ok: true, why: 'The head holds information about the page, and the stylesheet link is exactly that. It loads before the body, so the page never flashes unstyled.' },
        { t: 'Spot ③ (top of <body>)', why: 'Browsers will often still apply it from here, but it belongs in the head. The body is for what visitors see, and loading CSS late can make the page flash unstyled.' },
        { t: 'Spot ① (before <!DOCTYPE>)', why: 'Nothing goes before <!DOCTYPE html>. It must be the very first line.' },
        { t: 'Spot ④ (after </html>)', why: 'That\'s outside the document entirely. Everything belongs inside <html>.' }
      ]
    },
    {
      prompt: 'This designer keeps CSS in its own folder. The page is index.html in the top folder. Which line is right?',
      file: 'index.html', kind: 'css',
      tree: 'my-site/\n  index.html   ← this page\n  css/\n    main.css',
      code: '<head>\n<title>Home</title>\n' + GAP + '\n</head>',
      opts: [
        { t: '<link rel="stylesheet" href="css/main.css">', ok: true, why: 'Down into css/, then main.css. The file doesn\'t have to be called styles.css; the path just has to match.' },
        { t: '<link rel="stylesheet" href="main.css">', why: 'That looks for main.css next to index.html, but it\'s inside the css/ folder.' },
        { t: '<link rel="stylesheet" href="css/styles.css">', why: 'Right folder, wrong file name. This site\'s file is main.css.' },
        { t: '<link rel="stylesheet" href="css/">', why: 'That points at a folder, not a file. The browser needs the exact file.' }
      ]
    },
    {
      prompt: 'The Tokyo button is missing from the menu. Which line completes it?',
      file: 'index.html', kind: 'nav',
      code: '<nav>\n  <a href="index.html"><img src="img/home.png" alt="Home"></a>\n  <a href="london.html"><img src="img/london.png" alt="London"></a>\n  <a href="new-york.html"><img src="img/new-york.png" alt="New York"></a>\n  ' + GAP + '\n</nav>',
      opts: [
        { t: '<a href="tokyo.html"><img src="img/tokyo.png" alt="Tokyo"></a>', ok: true, why: 'Same pattern as the other three: <a href> around an <img src alt>, closed with </a>.' },
        { t: '<a src="tokyo.html"><img href="img/tokyo.png" alt="Tokyo"></a>', why: 'The attributes are swapped. Links use href; images use src.' },
        { t: '<link href="tokyo.html"><img src="img/tokyo.png" alt="Tokyo">', why: '<link> lives in the head and isn\'t clickable. Menu buttons need <a>.' },
        { t: '<a href="tokyo.html"><img src="img/tokyo.png" alt="Tokyo">', why: 'Missing </a>. The link would keep going and swallow whatever comes after it.' }
      ]
    }
  ];
  var miss = { r: 0, score: 0, answered: false, order: [] };
  function renderMissPreview(solved) {
    var R = MISS_ROUNDS[miss.r];
    var styled = R.kind === 'nav' || solved;
    var body;
    if (R.kind === 'nav') {
      body = '<h4>Home</h4><span class="navchip">Home</span><span class="navchip">London</span><span class="navchip">New York</span>' +
        (solved ? '<span class="navchip">Tokyo</span>' : '<span class="navchip missing">? missing</span>');
    } else {
      body = '<h4>' + (R.file.indexOf('tokyo') !== -1 ? 'Tokyo' : 'Home') + '</h4><p>Welcome to my travel site.</p><a href="#" tabindex="-1">Email me</a>';
    }
    $('#missPreview').innerHTML = '<div class="bar">' + esc(R.file) + (R.kind === 'css' ? (solved ? ' · styles loaded ✓' : ' · no stylesheet') : '') + '</div>' +
      '<div class="pg' + (styled ? ' styled' : '') + '">' + body + '</div>';
  }
  function renderMiss() {
    var R = MISS_ROUNDS[miss.r];
    miss.answered = false;
    $('#missRound').textContent = 'Round ' + (miss.r + 1) + ' of ' + MISS_ROUNDS.length;
    $('#missScore').textContent = 'Score: ' + miss.score;
    $('#missPrompt').textContent = R.prompt;
    var codeHtml = esc(R.code).replace(GAP, '<span class="gap">▢ ??? which line goes here?</span>');
    $('#missCode').innerHTML = (R.tree ? '<span class="dim">' + esc(R.tree) + '</span>\n\n' : '') + codeHtml;
    renderMissPreview(false);
    miss.order = shuffle(R.opts.map(function (o, i) { return i; }));
    $('#missOptions').innerHTML = miss.order.map(function (i) {
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
      renderMissPreview(true);
      $('#missFeedback').innerHTML = '<div class="box good"><strong>Yes!</strong> ' + esc(o.why) + '</div>';
      $('#missScore').textContent = 'Score: ' + miss.score;
      $('#missNext').hidden = false;
      $('#missNext').textContent = miss.r < MISS_ROUNDS.length - 1 ? 'Next round →' : 'Play again ↺';
    } else {
      miss.answered = true; // first try only counts for points
      b.classList.add('wrong');
      b.disabled = true;
      $('#missFeedback').innerHTML = '<div class="box bad"><strong>Not that one.</strong> ' + esc(o.why) + ' Try another.</div>';
    }
  });
  $('#missNext').addEventListener('click', function () {
    if (miss.r < MISS_ROUNDS.length - 1) miss.r++;
    else { miss.r = 0; miss.score = 0; }
    renderMiss();
  });
  renderMiss();

  /* ---------- start ---------- */
  setConcept(current);
})();
