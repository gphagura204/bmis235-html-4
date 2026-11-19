# HTML-4: Path Finder
**By:** Nihal (gphagura)
**Live site:** YOUR LIVE LINK (the `.pages.dev` link from Cloudflare)

## My path
Path 3. TODO: why you picked it, in your own words (one or two sentences).

## By hand vs by AI
**I made:** The brand the Field Guide uses (navy/off-white/gold colors and Bungee font) comes from my HTML-3 travel site, which I built by hand and which lives separately in my `bmis235-html-3` repo. I picked the six concepts the tool covers and the four learning modes. TODO: add anything else you did yourself.

**AI made:** Claude Code (on claude.ai, connected to this GitHub repo) wrote the learning tool: `index.html`, `learn.css` and `learn.js`. That covers the path-walking animation, the "one stylesheet, four folders" demo, the story, the broken-menu debugger, the missing-link-line game, the quiz and the NotebookLM prompt builder. A first version tried to cover six concepts; I had it narrowed to one concept (paths) and the stories rewritten because they were too silly to teach well. It also added `wrangler.jsonc`/`.assetsignore` for Cloudflare.

**I checked it by:** TODO: describe what you actually did. Ideas:
- Followed every path in "A link finding a file" myself and predicted the result before pressing play. Did the 404s happen where I expected?
- Checked the cascade demo against my notes: later rule wins on a tie, class beats element, inline beats the stylesheet, inheritance loses to a direct rule.
- Solved all 3 broken menus and all 5 missing-line rounds myself, and read every explanation looking for anything that was wrong.
- Took every quiz question and checked the "why" text against the HTML-1 to HTML-3 lessons.
- Opened the live site on my phone.
- Note: Claude also ran an automated browser test of every mode before I saw it, but that only proves the code runs. It doesn't prove the explanations are correct.

## Path 3 only
**Concept it teaches:** How a link finds a file: relative paths in `href=""` and `src=""` (same folder, `folder/` to go down, `../` to go up, exact spelling and capitals). It is the HTML-3 skill behind working menus, images that load, and pages that pick up `styles.css`. Every mode uses the same example site so the paths stay consistent.

**Built for how I learn because:** TODO: which mode works for you (Listen / See / Story / Practice) and why.

**Tested by:** (classmate's first name) **What I changed:** TODO: after the classmate test, say what they struggled with and what you changed. Full notes are in `FEEDBACK.md`.
