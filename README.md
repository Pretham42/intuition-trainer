# Intuition Trainer

A dependency-free static site that trains problem-solving *intuition*, not answer recall.
It has two modes:

- **Puzzles** — each gives you the problem, two escalating hints, and a full
  solution, then the key feature: **the question you could have asked yourself** to reach
  the answer, plus the transferable lesson behind it. 65 problems and counting, each with escalating hints that guide without giving away the answer.
- **Discovery Tracks** — guided lessons that lead you to *rediscover* a core concept
  yourself. Each follows a **lecture + problem-solving** rhythm (see [`FRAMEWORK.md`](FRAMEWORK.md)):
  every step opens with a short *Concept* brief (the tool you need), then a *Your turn*
  challenge you work out, escalating hints, a full work-through, and a one-line **insight**.
  Each track carries an *overview* (goal, prerequisites, objectives, time) and ends with
  *checkpoints* (active-recall self-tests). Steps can also carry **interactive figures** you drag to explore and **multiple-choice checks** with instant feedback that gate progress — a Brilliant.com-style learn-by-doing loop (see `interactives.js` / `track-extras.js`). Current tracks: Rediscovering Backpropagation,
  Loss Functions, Gradient Descent & the Learning Rate, Attention, Molecular Dynamics,
  Dynamic Programming, Big-O, Entropy & Information, and Diffusion Models.

Problems span the areas that matter for AI / CS / computational-biology interviews:
algorithms & data structures, probability, ML/AI conceptual reasoning, quantitative
biology, estimation (Fermi), logic, and game theory.

A floating **Scratchpad** whiteboard (pen, eraser, colors, undo, clear, download) lets you
work out problems directly on the page; it saves to `localStorage` and survives refresh.

## Run it locally

No build step. Either open `index.html` directly, or serve it (recommended, so
`localStorage` progress works reliably):

```bash
cd intuition-trainer
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repo and push the contents of this folder.
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick `main` and `/ (root)`.
3. Your site goes live at `https://<username>.github.io/<repo>/`.

(If you push only the `intuition-trainer` subfolder's contents to the repo root, Pages
serves `index.html` automatically. Otherwise set the Pages source to the subfolder.)

## Add your own problems

Everything lives in `problems.js`. Append an object to the `PROBLEMS` array:

```js
{
  id: "unique-slug",
  title: "Short name",
  category: "Algorithms",          // also drives the filter chips
  difficulty: "Easy",              // "Easy" | "Medium" | "Hard"
  prompt: `<p>The question, as HTML.</p>`,
  diagram: `<svg ...>...</svg>`,    // optional inline SVG
  hints: ["a first nudge toward the reframing", "a sharper nudge — but NOT the answer"], // keep the solution out of the hints
  solution: `<p>Full worked answer, HTML.</p>`,
  probe: "The single question you could have asked yourself.",
  lesson: "The transferable takeaway / pattern."
}
```

In hint strings, wrap inline code in backticks (`` `like this` ``) — the app renders
them as `<code>`. `prompt`, `solution`, and `lesson` accept raw HTML.

## Add your own discovery tracks

Tracks live in `tracks.js`. Append an object to the `TRACKS` array:

```js
{
  id: "unique-slug",
  title: "Rediscovering X",
  category: "ML / AI",           // or Algorithms, etc.
  difficulty: "Core",
  blurb: "One-line summary for the track card.",
  overview: { goal: `...`, prerequisites: `...`, objectives: [`...`], time: `25–35 min` },
  intro: `<p>Motivating hook shown before step 1 (HTML).</p>`,
  steps: [
    {
      title: "Short step name",
      brief: `<p>The mini-lecture: the ONE tool this step needs (not the answer).</p>`,
      challenge: `<p>The question that makes them derive the next piece (HTML).</p>`,
      diagram: `<svg ...>...</svg>`,   // optional
      hints: ["a nudge", "a sharper nudge"],   // optional, 1–3
      reveal: `<p>The full work-through for this step (HTML).</p>`,
      insight: "The one-sentence transferable takeaway."
    }
    // ...more steps
  ],
  synthesis: `<p>'Here's what you rebuilt, and it IS the concept' (HTML).</p>`,
  checkpoints: [ { q: "recall question", a: `<p>answer (HTML)</p>` } ],
  connects: `<p>Optional: links to related tracks/puzzles (HTML).</p>`
}

See `FRAMEWORK.md` for the full lecture+problem design the tracks follow.
```

Steps reveal progressively — the next step only appears after the learner works through
the current one — which is what preserves the "rediscovery" feel. Track and puzzle
progress are both saved in `localStorage`.

## Files

- `index.html` — page shell (two views: Puzzles and Discovery Tracks)
- `style.css` — styling (dark theme, responsive)
- `problems.js` — the puzzle bank (edit this to add puzzles)
- `tracks.js` — the discovery-track bank (edit this to add tracks)
- `interactives.js` — manipulable figures (sliders + live SVG/canvas) for tracks
- `track-extras.js` — per-step interactive + multiple-choice-check assignments
- `whiteboard.js` — the floating Scratchpad (self-contained)
- `FRAMEWORK.md` — the lecture+problem design every track follows
- `app.js` — rendering, view switching, filters, progressive hints/steps, `localStorage` progress
