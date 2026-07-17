# Rediscovery Track Framework

The design principle for every Discovery Track: **a lesson that alternates teaching
and doing.** A short mini-lecture hands you exactly the one tool you need; then a
challenge makes you use it to derive the next piece yourself. You never passively
read a formula — you rebuild it, guided, and a self-test at the end proves you can
reconstruct it.

This is "lecture + problem-solving combined": exposition (so you're never stuck for
lack of a definition) fused with active derivation (so you actually learn it).

## Why this works (the learning science, briefly)

- **Generation effect / productive struggle** — deriving an answer yourself encodes it
  far better than reading it. That's the *challenge*.
- **Worked-example effect** — but struggling with zero guidance is inefficient. A short
  *brief* + a full *work-through* supplies the scaffold. We interleave the two.
- **Retrieval practice** — the *checkpoints* at the end force recall, which is what makes
  memory durable.
- **Advance organizers** — the *overview* (goal, prereqs, objectives) primes the learner
  and lets them self-assess readiness.

## Track anatomy

| Part | Purpose |
|------|---------|
| **overview** | goal, prerequisites, objectives, time — so the learner knows the destination and whether they're ready |
| **intro / hook** | a concrete thing you *can't yet* explain — the motivation |
| **steps** (5–8) | each a micro-lesson (see below) |
| **synthesis** | "what you rediscovered" — names the concept you just rebuilt |
| **checkpoints** (2–3) | active-recall questions that test the learning |
| **connects** | links to related tracks and puzzles |

## Step anatomy — the lecture → problem loop

Every step follows the same rhythm:

1. **Brief (the lecture)** — 2–4 sentences: the context, definition, or single tool this
   step needs. It *teaches*, but must **not** give away the challenge's answer.
2. **Challenge (the problem)** — one concrete question to work out using the brief.
3. **Hints** — 1–3 escalating scaffolds (optional).
4. **Work-through (the reveal)** — the full derivation/solution, correct and checkable.
5. **Insight** — one portable sentence: *what you discovered* (an idea, not a restatement
   of the answer).

## Authoring rules

- The brief teaches the *tool*; the challenge applies it. Keep the answer out of the brief —
  it must come from the learner plus the reveal.
- Every reveal must be verifiably correct. Show the actual math/derivation; prefer numbers
  the learner can check by hand.
- The insight is a transferable principle, phrased so it applies beyond this problem.
- End every track able to *reconstruct* the concept — and prove it with the checkpoints.
- Cross-link tracks and puzzles by name to build a web, not a list.

## Data schema (`tracks.js`)

```js
{
  id, title, category, difficulty, blurb,
  overview: {
    goal: "one sentence: what you'll be able to do",
    prerequisites: "what to know first (or 'None — start here')",
    objectives: ["by the end you can …", "…"],   // 3–5
    time: "25–35 min"
  },
  intro: `<p>motivating hook…</p>`,
  steps: [
    {
      title: "short title",
      brief: `<p>the mini-lecture — teaches the tool, not the answer</p>`,
      challenge: `<p>the concrete question to attempt</p>`,
      diagram: `<svg…>`,          // optional
      hints: ["nudge", "sharper"], // 1–3, optional
      reveal: `<p>full worked derivation</p>`,
      insight: "one-sentence transferable takeaway"
    }
  ],
  synthesis: `<p>what you rebuilt, named</p>`,
  checkpoints: [ { q: "recall question", a: `<p>answer</p>` } ],
  connects: `<p>links to related tracks/puzzles</p>`
}
```

The renderer (`app.js`) is backward-compatible: a step may still use `prompt`/`hint`/
`discovered` instead of `challenge`/`hints`/`insight`, and `overview`/`brief`/`checkpoints`
are optional. But new and refactored tracks should use the full schema above.

## Interactive figures & multiple-choice checks (Brilliant-style)

Beyond the base step, two enhancements make a track *learn-by-doing*. They live in
separate files and are merged in at render time, so `tracks.js` stays clean:

- **Interactive figures** (`interactives.js`) — `INTERACTIVES[key](container)` builds a
  manipulable SVG/canvas with sliders and a live readout (e.g. drag η on a loss bowl and
  watch it converge or diverge). Attach one to a step via `track-extras.js`.
- **Multiple-choice checks** (`track-extras.js`) — a `quiz` with options that grade
  instantly: wrong answers show feedback and let you retry; the correct answer unlocks the
  explanation and the "Continue" button. Progression is **gated** on answering, so the
  learner commits to an answer before moving on.

```js
// track-extras.js — keyed by track id → step index
TRACK_EXTRAS = {
  "gradient-descent": { steps: {
    3: {
      interactive: "learning-rate-bowl",     // key in interactives.js
      quiz: {
        question: `…`,
        options: [ { text:`…`, correct:true, feedback:`…` }, … ],
        explain: `…`
      }
    }
  }}
};
```

Author interactives to *illustrate the exact idea* of their step, and MCQs to force the
one inference that matters — not trivia.
