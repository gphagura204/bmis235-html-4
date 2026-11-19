# HTML-4: One File, Every Page
**By:** Nihal (gphagura)
**Live site:** YOUR LIVE LINK (the `.pages.dev` link from Cloudflare)

## My path
Path 3. TODO: why you picked it, in your own words (one or two sentences).

## By hand vs by AI
**I made:** The brand the tool uses (navy/off-white/gold colors and Bungee font) comes from my HTML-3 travel site, which I built by hand and which lives separately in my `bmis235-html-3` repo. I decided to focus on one concept (the stylesheet) and pushed for it to be simpler and beginner-friendly. TODO: add anything else you did yourself.

**AI made:** Claude Code (on claude.ai, connected to this GitHub repo) wrote the learning tool: `index.html`, `learn.css` and `learn.js`. That covers the "big idea" explainer, the "one stylesheet, four pages" demo, the "fix the plain page" game, the quiz and the NotebookLM prompt builder. Its first two versions were too complicated (six concepts, then a deep dive on folder paths, plus a story I found silly). I had it cut down to one beginner concept, the stylesheet, and rewritten in plain words for someone brand new to coding. It also added `wrangler.jsonc`/`.assetsignore` for Cloudflare.

**I checked it by:** TODO: describe what you actually did. Ideas:
- Compared the tool with my own HTML-3 site: my pages really do use `<link rel="stylesheet" href="styles.css">`, and removing it from one page made that page plain.
- Played all 4 rounds of "fix the plain page" and read every explanation, looking for anything wrong.
- Took the quiz and checked each "why" against the HTML-3 lesson.
- Opened the live site on my phone.
- Note: Claude also ran an automated browser test of every mode before I saw it, but that only proves the code runs. It doesn't prove the explanations are correct.

## Path 3 only
**Concept it teaches:** The stylesheet (HTML-3): the look of a site lives in one file, `styles.css`, and each page connects to it with `<link rel="stylesheet" href="styles.css">` in its `<head>`. Change `styles.css` once and every connected page changes; a page with a missing or misspelled link line shows up plain.

**Built for how I learn because:** TODO: which modes work for you (See / Practice / Listen) and why, in your own words.

**Tested by:** (classmate's first name) **What I changed:** TODO: after the classmate test, say what they struggled with and what you changed. Full notes are in `FEEDBACK.md`.
