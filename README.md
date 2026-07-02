# Intuition Trainer

A dependency-free static site that trains problem-solving *intuition*, not answer recall.
Each problem gives you the puzzle, up to three escalating hints, and a full solution —
then the key feature: **the question you could have asked yourself** to reach the answer,
plus the transferable lesson behind it.

Problems span the areas that matter for AI / CS / computational-biology interviews:
algorithms & data structures, probability, ML/AI conceptual reasoning, quantitative
biology, estimation (Fermi), and classic logic puzzles.

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
  hints: ["first nudge", "sharper", "almost the answer"],  // 1–3
  solution: `<p>Full worked answer, HTML.</p>`,
  probe: "The single question you could have asked yourself.",
  lesson: "The transferable takeaway / pattern."
}
```

In hint strings, wrap inline code in backticks (`` `like this` ``) — the app renders
them as `<code>`. `prompt`, `solution`, and `lesson` accept raw HTML.

## Files

- `index.html` — page shell
- `style.css` — styling (dark theme, responsive)
- `problems.js` — the problem bank (edit this to add content)
- `app.js` — rendering, filters, progressive hints, progress in `localStorage`
