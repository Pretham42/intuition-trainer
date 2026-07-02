/* Intuition Trainer — UI logic. No dependencies. */

(function () {
  "use strict";

  const STORAGE_KEY = "intuition-trainer-progress-v1";
  const listEl = document.getElementById("problemList");
  const filtersEl = document.getElementById("categoryFilters");
  const emptyNote = document.getElementById("emptyNote");
  const solvedCountEl = document.getElementById("solvedCount");
  const totalCountEl = document.getElementById("totalCount");
  const resetBtn = document.getElementById("resetProgress");

  let state = loadState();
  let activeCategory = "All";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { solved: {} };
    } catch (e) {
      return { solved: {} };
    }
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage may be unavailable (e.g. file:// in some browsers) — degrade silently */
    }
  }

  function categories() {
    const set = new Set(PROBLEMS.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }

  function updateProgressBadge() {
    const solved = Object.keys(state.solved).filter((id) => state.solved[id]).length;
    solvedCountEl.textContent = solved;
    totalCountEl.textContent = PROBLEMS.length;
  }

  function renderFilters() {
    filtersEl.innerHTML = "";
    categories().forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (cat === activeCategory ? " active" : "");
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderFilters();
        renderProblems();
      });
      filtersEl.appendChild(btn);
    });
  }

  function makeReveal(kind, label, innerHTML) {
    const wrap = document.createElement("div");
    wrap.className = "reveal " + kind;
    const lab = document.createElement("div");
    lab.className = "reveal-label";
    lab.textContent = label;
    const content = document.createElement("div");
    content.className = "reveal-content";
    content.innerHTML = innerHTML;
    wrap.appendChild(lab);
    wrap.appendChild(content);
    return wrap;
  }

  function renderCard(p) {
    const card = document.createElement("article");
    card.className = "card" + (state.solved[p.id] ? " solved" : "");
    card.id = "problem-" + p.id;

    // Head
    const head = document.createElement("div");
    head.className = "card-head";
    const titles = document.createElement("div");
    titles.className = "card-titles";
    const h2 = document.createElement("h2");
    h2.textContent = p.title;
    const tags = document.createElement("div");
    tags.className = "tags";
    tags.innerHTML =
      `<span class="tag cat">${p.category}</span>` +
      `<span class="tag diff-${p.difficulty}">${p.difficulty}</span>`;
    titles.appendChild(h2);
    titles.appendChild(tags);
    head.appendChild(titles);

    const check = document.createElement("div");
    check.className = "solved-check";
    check.textContent = state.solved[p.id] ? "✓" : "";
    head.appendChild(check);
    card.appendChild(head);

    // Body
    const body = document.createElement("div");
    body.className = "card-body";

    const prompt = document.createElement("div");
    prompt.className = "prompt";
    prompt.innerHTML = p.prompt;
    body.appendChild(prompt);

    if (p.diagram) {
      const dia = document.createElement("div");
      dia.className = "diagram";
      dia.innerHTML = p.diagram;
      body.appendChild(dia);
    }

    // Reveal container (hints/solution/takeaway get appended here)
    const revealZone = document.createElement("div");

    // Actions
    const actions = document.createElement("div");
    actions.className = "actions";

    const hints = p.hints || [];
    let hintsShown = 0;

    const hintBtn = document.createElement("button");
    hintBtn.className = "btn";
    const hintCounter = document.createElement("span");
    hintCounter.className = "hint-counter";

    function updateHintUI() {
      if (hints.length === 0) {
        hintBtn.style.display = "none";
        return;
      }
      hintCounter.textContent = `${hintsShown} / ${hints.length} hints`;
      if (hintsShown >= hints.length) {
        hintBtn.disabled = true;
        hintBtn.textContent = "No more hints";
      } else {
        hintBtn.textContent = hintsShown === 0 ? "Show a hint" : "Next hint";
      }
    }

    hintBtn.addEventListener("click", () => {
      if (hintsShown >= hints.length) return;
      const h = hints[hintsShown];
      hintsShown += 1;
      revealZone.appendChild(
        makeReveal("hint", `Hint ${hintsShown}`, escapeToHtml(h))
      );
      updateHintUI();
    });

    let solutionShown = false;
    const solveBtn = document.createElement("button");
    solveBtn.className = "btn primary";
    solveBtn.textContent = "Reveal solution";
    solveBtn.addEventListener("click", () => {
      if (solutionShown) return;
      solutionShown = true;
      solveBtn.disabled = true;

      revealZone.appendChild(makeReveal("solution", "Solution", p.solution));

      // The signature feature: the question you could have asked yourself.
      const takeawayHtml =
        `<p class="probe">“${escapeText(p.probe)}”</p>` +
        `<p class="lesson">${p.lesson}</p>`;
      revealZone.appendChild(
        makeReveal("takeaway", "The question you could have asked yourself", takeawayHtml)
      );

      // Offer to mark solved
      markBtn.style.display = "";
    });

    const markBtn = document.createElement("button");
    markBtn.className = "btn solve";
    markBtn.style.display = state.solved[p.id] ? "" : "none";
    function updateMarkBtn() {
      markBtn.textContent = state.solved[p.id] ? "✓ Solved (undo)" : "Mark as solved";
    }
    updateMarkBtn();
    markBtn.addEventListener("click", () => {
      state.solved[p.id] = !state.solved[p.id];
      saveState();
      updateProgressBadge();
      card.classList.toggle("solved", !!state.solved[p.id]);
      check.textContent = state.solved[p.id] ? "✓" : "";
      updateMarkBtn();
    });

    actions.appendChild(hintBtn);
    actions.appendChild(hintCounter);
    actions.appendChild(solveBtn);
    actions.appendChild(markBtn);
    updateHintUI();

    body.appendChild(actions);
    body.appendChild(revealZone);
    card.appendChild(body);
    return card;
  }

  // Hints are plain text; escape then allow inline <code> written literally as backticks.
  function escapeToHtml(text) {
    return escapeText(text).replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function escapeText(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function renderProblems() {
    listEl.innerHTML = "";
    const filtered = PROBLEMS.filter(
      (p) => activeCategory === "All" || p.category === activeCategory
    );
    if (filtered.length === 0) {
      emptyNote.hidden = false;
      return;
    }
    emptyNote.hidden = true;
    filtered.forEach((p) => listEl.appendChild(renderCard(p)));
  }

  resetBtn.addEventListener("click", () => {
    if (!confirm("Clear all saved progress?")) return;
    state = { solved: {} };
    saveState();
    updateProgressBadge();
    renderProblems();
  });

  // Init
  renderFilters();
  renderProblems();
  updateProgressBadge();
})();
