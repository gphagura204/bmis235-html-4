/* =====================================================================
   learn.js · One File, Every Page
   Teaches ONE beginner concept: the stylesheet.
   Plain JavaScript, no libraries, no build step.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
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

  /* ---------- tabs ---------- */
  var tabs = $all('.tabs [role="tab"]');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (o) {
        o.setAttribute('aria-selected', o === t);
        $('#' + o.getAttribute('aria-controls')).hidden = o !== t;
      });
    });
  });
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
     SEE: one stylesheet, four pages
     ===================================================================== */
  var PAGES = [
    { file: 'index.html', h: 'Home', p: 'Three cities I want to visit.' },
    { file: 'london.html', h: 'London', p: 'Big Ben and Tower Bridge.' },
    { file: 'new-york.html', h: 'New York', p: 'Times Square, all night.' },
    { file: 'tokyo.html', h: 'Tokyo', p: 'Shibuya Crossing and the Skytree.' }
  ];
  var CHOICES = [
    { v: 'ok', label: 'Has the link line ✓', status: '✓ Connected to styles.css, so it gets the look.' },
    { v: 'none', label: 'No link line', status: '✗ Not connected, so the browser shows its plain default look.' },
    { v: 'typo', label: 'Typo: href="style.css"', status: '✗ "style.css" doesn\'t exist (the file is styles.css, with an s). Not connected.' },
    { v: 'norel', label: 'Missing rel="stylesheet"', status: '✗ Without rel="stylesheet" the browser doesn\'t know it\'s a stylesheet, so it ignores it.' }
  ];
  $('#minis').innerHTML = PAGES.map(function (pg, i) {
    return '<div class="mini linked" data-i="' + i + '">' +
      '<div class="bar">' + pg.file + '</div>' +
      '<div class="page"><h4>' + pg.h + '</h4><p>' + pg.p + '</p><a href="#" tabindex="-1">Email me</a></div>' +
      '<select aria-label="Link line on ' + pg.file + '">' + CHOICES.map(function (c) {
        return '<option value="' + c.v + '">' + esc(c.label) + '</option>';
      }).join('') + '</select>' +
      '<div class="status">' + CHOICES[0].status + '</div></div>';
  }).join('');
  $all('.mini select').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var m = sel.closest('.mini');
      var c = CHOICES.filter(function (x) { return x.v === sel.value; })[0];
      m.classList.toggle('linked', c.v === 'ok');
      m.classList.toggle('broken', c.v !== 'ok');
      $('.status', m).textContent = c.status;
    });
  });

  function updateSheet() {
    var bg = $('#ssBg').value, col = $('#ssColor').value, font = $('#ssFont').value, acc = $('#ssAccent').value;
    var box = $('#minis');
    box.style.setProperty('--ss-bg', bg);
    box.style.setProperty('--ss-color', col);
    box.style.setProperty('--ss-font', font);
    box.style.setProperty('--ss-accent', acc);
    $('#ssCode').textContent =
      '/* every connected page gets these */\n' +
      'body {\n  background-color: ' + bg + ';\n  color: ' + col + ';\n  font-family: ' + font.split(',')[0].replace(/'/g, '"') + ';\n}\n' +
      'h1 { border-bottom: 3px solid ' + acc + '; }\n' +
      'a  { color: ' + acc + '; }';
    $all('.mini.linked').forEach(function (m) { m.classList.remove('flash'); void m.offsetWidth; m.classList.add('flash'); });
  }
  ['#ssBg', '#ssColor', '#ssFont', '#ssAccent'].forEach(function (s) { $(s).addEventListener('change', updateSheet); });
  updateSheet();

  /* =====================================================================
     PRACTICE: fix the plain page
     ===================================================================== */
  var GAP = '@@GAP@@';
  var ROUNDS = [
    {
      file: 'tokyo.html',
      prompt: 'This page looks plain. Its head is missing something. What should go in the empty spot?',
      code: '<head>\n<meta charset="utf-8">\n<title>Tokyo</title>\n' + GAP + '\n</head>',
      opts: [
        { t: '<link rel="stylesheet" href="styles.css">', ok: true, why: 'That\'s the link line. It tells the browser "use styles.css for this page."' },
        { t: '<title>styles.css</title>', why: 'The title is just the name shown on the browser tab. It doesn\'t load anything.' },
        { t: '<a href="styles.css">Styles</a>', why: '<a> makes a clickable link for visitors. It doesn\'t style the page.' },
        { t: 'styles.css', why: 'Typing just the file name puts the words "styles.css" on the page. The browser needs the full link line.' }
      ]
    },
    {
      file: 'london.html',
      prompt: 'This page HAS a link line, but it still looks plain. The real file is called styles.css. What\'s the fix?',
      code: '<head>\n<title>London</title>\n<link rel="stylesheet" href="@@BAD@@style.css@@/BAD@@">\n</head>',
      opts: [
        { t: 'Change it to href="styles.css"', ok: true, why: 'The name in href has to match the real file exactly. It was missing the "s".' },
        { t: 'Change it to href="Styles.css"', why: 'Capital letters count. Styles.css and styles.css are different names to a web server.' },
        { t: 'Change it to href="styles.html"', why: 'The stylesheet ends in .css, not .html.' },
        { t: 'Delete the line', why: 'Then the page has no connection at all. Fix the spelling instead.' }
      ]
    },
    {
      file: 'new-york.html',
      prompt: 'The file name is right this time, but the page is still plain. What\'s missing?',
      code: '<head>\n<title>New York</title>\n<link @@BAD@@href="styles.css"@@/BAD@@>\n</head>',
      opts: [
        { t: 'Add rel="stylesheet" so it reads <link rel="stylesheet" href="styles.css">', ok: true, why: 'rel="stylesheet" tells the browser what kind of file this is. Without it, the browser doesn\'t use the file for styling.' },
        { t: 'Add a <title>', why: 'The page already has a title, and a title doesn\'t affect styling anyway.' },
        { t: 'Rename the file to styles.css.css', why: 'The file name was already right. Renaming it would break it.' },
        { t: 'Move the line to the very bottom of the page', why: 'Where it sits isn\'t the problem. It\'s missing rel="stylesheet".' }
      ]
    },
    {
      file: 'index.html',
      prompt: 'Someone tried to load the stylesheet with a <style> tag. The page is plain. What\'s the fix?',
      code: '<head>\n<title>Home</title>\n@@BAD@@<style href="styles.css"></style>@@/BAD@@\n</head>',
      opts: [
        { t: 'Replace it with <link rel="stylesheet" href="styles.css">', ok: true, why: 'To load a separate .css file you need the <link> line. A <style> tag can only hold CSS typed directly inside it. It can\'t load a file.' },
        { t: 'Change it to <style src="styles.css"></style>', why: '<style> can\'t load a file with src either. Use the <link> line.' },
        { t: 'Change it to <a href="styles.css"></a>', why: '<a> is a clickable link for visitors, not a way to load styles.' },
        { t: 'Leave it, the browser will figure it out', why: 'It won\'t. The page stays plain until it has a real link line.' }
      ]
    }
  ];
  var game = { r: 0, score: 0, tried: false };
  function preview(file, styled) {
    var name = file.replace('.html', '').replace('-', ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    if (name === 'Index') name = 'Home';
    $('#fixPreview').innerHTML = '<div class="bar">' + esc(file) + (styled ? ' · styles.css loaded ✓' : ' · no styles') + '</div>' +
      '<div class="pg' + (styled ? ' styled' : '') + '"><h4>' + esc(name) + '</h4><p>Welcome to my travel site.</p><a href="#" tabindex="-1">Email me</a></div>';
  }
  function renderRound() {
    var R = ROUNDS[game.r];
    game.tried = false;
    $('#fixRound').textContent = 'Page ' + (game.r + 1) + ' of ' + ROUNDS.length;
    $('#fixScore').textContent = 'Score: ' + game.score;
    $('#fixPrompt').textContent = R.prompt;
    $('#fixCode').innerHTML = esc(R.code)
      .replace(GAP, '<span class="gap">▢ ??? something goes here</span>')
      .replace('@@BAD@@', '<span class="bad">').replace('@@/BAD@@', '</span>');
    preview(R.file, false);
    $('#fixOptions').innerHTML = shuffle(R.opts.map(function (o, i) { return i; })).map(function (i) {
      return '<button class="opt" data-i="' + i + '"><code>' + esc(R.opts[i].t) + '</code></button>';
    }).join('');
    $('#fixFeedback').innerHTML = '';
    $('#fixNext').hidden = true;
  }
  $('#fixOptions').addEventListener('click', function (e) {
    var b = e.target.closest('.opt');
    if (!b || b.disabled) return;
    var R = ROUNDS[game.r], o = R.opts[+b.getAttribute('data-i')];
    if (o.ok) {
      if (!game.tried) game.score++;
      game.tried = true;
      b.classList.add('right');
      $all('.opt', $('#fixOptions')).forEach(function (x) { x.disabled = true; });
      preview(R.file, true);
      $('#fixFeedback').innerHTML = '<div class="box good"><strong>Fixed! The page has its look now.</strong> ' + esc(o.why) + '</div>';
      $('#fixScore').textContent = 'Score: ' + game.score;
      $('#fixNext').hidden = false;
      $('#fixNext').textContent = game.r < ROUNDS.length - 1 ? 'Next page →' : 'Play again ↺';
    } else {
      game.tried = true; // only a first-try answer scores
      b.classList.add('wrong');
      b.disabled = true;
      $('#fixFeedback').innerHTML = '<div class="box bad"><strong>Not quite.</strong> ' + esc(o.why) + ' Try another.</div>';
    }
  });
  $('#fixNext').addEventListener('click', function () {
    if (game.r < ROUNDS.length - 1) game.r++;
    else { game.r = 0; game.score = 0; }
    renderRound();
  });
  renderRound();

  /* =====================================================================
     PRACTICE: quick quiz
     ===================================================================== */
  var QUIZ = [
    { q: 'Where does the look of your website (colors, fonts) live?', opts: ['In styles.css', 'In index.html only', 'Typed separately into every page', 'In the img folder'], a: 0, why: 'The look goes in one file, styles.css, so you only have to change it in one place.' },
    { q: 'You change the background color in styles.css. Which pages change?', opts: ['Every page that has the link line', 'Only the home page', 'None until you edit each page', 'Only the page you have open'], a: 0, why: 'Every page that links to styles.css uses it, so they all change together.' },
    { q: 'Which line connects a page to styles.css?', opts: ['<link rel="stylesheet" href="styles.css">', '<style>styles.css</style>', '<a href="styles.css">', '<css>styles.css</css>'], a: 0, why: 'The <link> line with rel="stylesheet" and href="styles.css" is the one that connects them.' },
    { q: 'One page looks plain: white background, black text, blue underlined links. The other pages look fine. What\'s most likely wrong?', opts: ['That page\'s link line is missing or has a typo', 'styles.css got deleted', 'The internet is down', 'The page has too many pictures'], a: 0, why: 'If styles.css were broken, every page would look plain. Only one plain page means that page isn\'t connected.' },
    { q: 'Where does the link line go?', opts: ['In the <head>, near the top of the page', 'At the very bottom, after </html>', 'Inside styles.css', 'Inside the <h1> heading'], a: 0, why: 'The <head> holds information about the page that visitors don\'t see, like the title and the link to the stylesheet.' },
    { q: 'In <link rel="stylesheet" href="styles.css">, what does href="styles.css" do?', opts: ['Says which file to use', 'Picks the background color', 'Says that it\'s a stylesheet', 'Sets the page title'], a: 0, why: 'href is the file name. rel="stylesheet" is the part that says what kind of file it is.' }
  ];
  var quiz = { list: [], i: 0, score: 0 };
  function startQuiz() { quiz.list = shuffle(QUIZ); quiz.i = 0; quiz.score = 0; renderQuiz(); }
  function renderQuiz() {
    var box = $('#quizBox');
    if (quiz.i >= quiz.list.length) {
      box.innerHTML = '<p class="q">Done! You got ' + quiz.score + ' out of ' + quiz.list.length + '.</p>' +
        '<p>' + (quiz.score === quiz.list.length ? 'Perfect. You\'ve got it.' : 'Go back to "See it" and try breaking a page\'s link line. Then try the quiz again.') + '</p>' +
        '<button class="btn" id="quizAgain">Try again</button>';
      $('#quizAgain').addEventListener('click', startQuiz);
      return;
    }
    var item = quiz.list[quiz.i];
    box.innerHTML = '<div class="meta"><span>Question ' + (quiz.i + 1) + ' of ' + quiz.list.length + '</span><span>Score: ' + quiz.score + '</span></div>' +
      '<p class="q">' + esc(item.q) + '</p><div class="options">' +
      shuffle(item.opts.map(function (o, idx) { return idx; })).map(function (idx) {
        return '<button class="opt" data-idx="' + idx + '">' + esc(item.opts[idx]) + '</button>';
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
     LISTEN: NotebookLM notes + instructions
     ===================================================================== */
  var PRESETS = [
    'What is a stylesheet, and why use one?',
    'Why does one of my pages look plain white?',
    'What does each part of the link line mean?',
    'How does changing one file change every page?'
  ];
  var NOTES = [
    'Beginner notes: THE STYLESHEET (BMIS 235)',
    '',
    'THE BIG IDEA',
    'A website is made of pages. Each page is its own file, like index.html (the home page) or tokyo.html.',
    'The look of the site (colors, fonts, sizes) goes in ONE separate file called styles.css. This file is called a stylesheet.',
    'Each page has one line near the top that connects it to the stylesheet:',
    '<link rel="stylesheet" href="styles.css">',
    'Change something in styles.css once, and every page with that line changes. That is why sites use a stylesheet: one place to control the whole look.',
    '',
    'THE PARTS OF THE LINK LINE',
    '- <link ...> connects the page to another file.',
    '- rel="stylesheet" tells the browser "this file is a stylesheet."',
    '- href="styles.css" tells the browser which file. The name must match the real file exactly, including capital letters.',
    '- The line goes in the <head>, the top section of the page that visitors do not see.',
    '',
    'WHAT A PAGE LOOKS LIKE WITHOUT IT',
    'If a page is not connected, the browser shows its plain default look: white background, black text in a Times-style font, and blue underlined links.',
    'If only one page looks plain, that page is the problem, not styles.css.',
    '',
    'COMMON MISTAKES',
    '- Forgetting the link line on a page.',
    '- A typo in the file name, like href="style.css" when the file is styles.css.',
    '- Leaving out rel="stylesheet".',
    '- Using <style href="styles.css">. A <style> tag cannot load a file; use the <link> line.',
    '- Using <a href="styles.css">. That makes a clickable link for visitors; it does not style the page.'
  ].join('\n');
  function buildListen() {
    var q = $('#listenInput').value.trim() || PRESETS[0];
    $('#listenSource').value = NOTES;
    $('#listenPrompt').value =
      'Make a short audio explainer for someone who is completely new to coding and has only made a basic web page or two.\n\n' +
      'Their question: "' + q + '"\n\n' +
      'Answer using ONLY the notes:\n' +
      '1. Start with the big idea in one plain sentence.\n' +
      '2. Use one everyday comparison and stick with it: a sports team with one uniform design. Change the uniform design once, and every player wearing the team\'s jersey looks different. A player who never got the jersey looks plain.\n' +
      '3. Read the link line slowly, part by part, and explain each part in simple words.\n' +
      '4. Explain what a page looks like when it is not connected, and the most common mistakes.\n' +
      '5. End with 3 easy questions, pausing before each answer.\n\n' +
      'Keep it under 6 minutes. Use simple words, explain any technical word the first time you say it, and keep it friendly.';
  }
  $('#listenPresets').innerHTML = PRESETS.map(function (p) { return '<button type="button">' + esc(p) + '</button>'; }).join('');
  $('#listenPresets').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    $('#listenInput').value = b.textContent;
    buildListen();
  });
  $('#listenInput').placeholder = PRESETS[0];
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
