/* Intuition Trainer — UI logic. No dependencies. */

(function () {
  "use strict";

  const STORAGE_KEY = "intuition-trainer-progress-v1";

  // Puzzle DOM
  const listEl = document.getElementById("problemList");
  const filtersEl = document.getElementById("categoryFilters");
  const emptyNote = document.getElementById("emptyNote");
  const solvedCountEl = document.getElementById("solvedCount");
  const totalCountEl = document.getElementById("totalCount");
  const resetBtn = document.getElementById("resetProgress");

  // View DOM
  const viewTabs = document.getElementById("viewTabs");
  const puzzlesView = document.getElementById("puzzlesView");
  const tracksView = document.getElementById("tracksView");
  const introPuzzles = document.getElementById("introPuzzles");
  const introTracks = document.getElementById("introTracks");

  // Tracks DOM
  const trackListEl = document.getElementById("trackList");
  const trackDetailEl = document.getElementById("trackDetail");

  let state = loadState();
  let activeCategory = "All";

  function loadState() {
    let s;
    try {
      s = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      s = {};
    }
    if (!s.solved) s.solved = {};
    if (!s.tracks) s.tracks = {}; // { trackId: { revealed: n, done: bool } }
    return s;
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage may be unavailable; degrade silently */
    }
  }

  /* ---------- shared helpers ---------- */

  function escapeText(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  // Plain text with `backtick` code spans -> HTML.
  function escapeToHtml(text) {
    return escapeText(text).replace(/`([^`]+)`/g, "<code>$1</code>");
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

  // Multiple-choice checkpoint with instant feedback (Brilliant-style).
  function renderQuiz(qz, onSolved) {
    const box = document.createElement("div");
    box.className = "quiz";
    const q = document.createElement("div");
    q.className = "quiz-q";
    q.innerHTML = `<span class="quiz-tag">Check</span>` + (qz.question || "");
    box.appendChild(q);
    const opts = document.createElement("div");
    opts.className = "quiz-opts";
    const fb = document.createElement("div");
    fb.className = "quiz-feedback";
    fb.hidden = true;
    let solved = false;
    (qz.options || []).forEach((opt) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt";
      b.innerHTML = opt.text;
      b.addEventListener("click", () => {
        if (solved) return;
        if (opt.correct) {
          solved = true;
          b.classList.add("correct");
          opts.querySelectorAll(".quiz-opt").forEach((x) => (x.disabled = true));
          fb.className = "quiz-feedback ok";
          fb.innerHTML =
            `<strong>Correct.</strong> ` + (opt.feedback ? opt.feedback + " " : "") + (qz.explain || "");
          fb.hidden = false;
          if (onSolved) onSolved();
        } else {
          b.classList.add("wrong");
          b.disabled = true;
          fb.className = "quiz-feedback no";
          fb.innerHTML = `<strong>Not quite.</strong> ` + (opt.feedback || "Try another.");
          fb.hidden = false;
        }
      });
      opts.appendChild(b);
    });
    box.appendChild(opts);
    box.appendChild(fb);
    return box;
  }

  /* ================= PUZZLES ================= */

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

  function renderCard(p) {
    const card = document.createElement("article");
    card.className = "card" + (state.solved[p.id] ? " solved" : "");
    card.id = "problem-" + p.id;

    const head = document.createElement("div");
    head.className = "card-head";
    const titles = document.createElement("div");
    titles.className = "card-titles";
    const h2 = document.createElement("h2");
    h2.textContent = p.title;
    const tags = document.createElement("div");
    tags.className = "tags";
    tags.innerHTML =
      `<span class="tag cat">${escapeText(p.category)}</span>` +
      `<span class="tag diff-${p.difficulty}">${escapeText(p.difficulty)}</span>`;
    titles.appendChild(h2);
    titles.appendChild(tags);
    head.appendChild(titles);

    const check = document.createElement("div");
    check.className = "solved-check";
    check.textContent = state.solved[p.id] ? "✓" : "";
    head.appendChild(check);
    card.appendChild(head);

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

    const revealZone = document.createElement("div");
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
      revealZone.appendChild(makeReveal("hint", `Hint ${hintsShown}`, escapeToHtml(h)));
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
      const takeawayHtml =
        `<p class="probe">“${escapeText(p.probe)}”</p>` +
        `<p class="lesson">${p.lesson}</p>`;
      revealZone.appendChild(
        makeReveal("takeaway", "The question you could have asked yourself", takeawayHtml)
      );
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

  /* ================= DISCOVERY TRACKS ================= */

  function trackProgress(track) {
    const t = state.tracks[track.id] || {};
    return { revealed: t.revealed || 0, done: !!t.done };
  }
  function setTrackProgress(track, revealed, done) {
    state.tracks[track.id] = { revealed: revealed, done: done };
    saveState();
  }

  function renderTrackList() {
    trackDetailEl.hidden = true;
    trackDetailEl.innerHTML = "";
    trackListEl.hidden = false;
    trackListEl.innerHTML = "";

    if (typeof TRACKS === "undefined" || !TRACKS.length) {
      trackListEl.innerHTML = `<p class="empty-note">No tracks yet.</p>`;
      return;
    }

    TRACKS.forEach((track) => {
      const prog = trackProgress(track);
      const total = track.steps.length;
      const card = document.createElement("article");
      card.className = "card track-card" + (prog.done ? " solved" : "");

      let statusLabel, btnLabel;
      if (prog.done) {
        statusLabel = "✓ Completed";
        btnLabel = "Review";
      } else if (prog.revealed > 0) {
        statusLabel = `${prog.revealed} / ${total} steps`;
        btnLabel = "Resume";
      } else {
        statusLabel = `${total} steps`;
        btnLabel = "Start track";
      }

      card.innerHTML =
        `<div class="card-head">
           <div class="card-titles">
             <h2>${escapeText(track.title)}</h2>
             <div class="tags">
               <span class="tag cat">${escapeText(track.category)}</span>
               <span class="tag diff-Core">${escapeText(track.difficulty || "Core")}</span>
               <span class="tag track-status">${statusLabel}</span>
             </div>
           </div>
           <div class="solved-check">${prog.done ? "✓" : ""}</div>
         </div>`;

      const body = document.createElement("div");
      body.className = "card-body";
      const blurb = document.createElement("p");
      blurb.className = "prompt";
      blurb.textContent = track.blurb;
      body.appendChild(blurb);

      const actions = document.createElement("div");
      actions.className = "actions";
      const startBtn = document.createElement("button");
      startBtn.className = "btn primary";
      startBtn.textContent = btnLabel;
      startBtn.addEventListener("click", () => openTrack(track));
      actions.appendChild(startBtn);
      body.appendChild(actions);

      card.appendChild(body);
      trackListEl.appendChild(card);
    });
  }

  function openTrack(track) {
    trackListEl.hidden = true;
    trackDetailEl.hidden = false;
    trackDetailEl.innerHTML = "";
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Back link
    const back = document.createElement("button");
    back.className = "btn ghost back-btn";
    back.textContent = "← All tracks";
    back.addEventListener("click", renderTrackList);
    trackDetailEl.appendChild(back);

    // Header card
    const header = document.createElement("div");
    header.className = "track-header";
    const ov = track.overview;
    const overviewHtml = ov
      ? `<div class="track-overview">
           ${ov.goal ? `<div class="ov-row"><span class="ov-label">Goal</span><span class="ov-val">${ov.goal}</span></div>` : ""}
           ${ov.prerequisites ? `<div class="ov-row"><span class="ov-label">Prereqs</span><span class="ov-val">${ov.prerequisites}</span></div>` : ""}
           ${ov.time ? `<div class="ov-row"><span class="ov-label">Time</span><span class="ov-val">${escapeText(ov.time)}</span></div>` : ""}
           ${ov.objectives && ov.objectives.length
             ? `<div class="ov-obj"><span class="ov-label">By the end you can</span><ul>${ov.objectives.map((o) => `<li>${o}</li>`).join("")}</ul></div>`
             : ""}
         </div>`
      : "";
    header.innerHTML =
      `<h2>${escapeText(track.title)}</h2>
       <div class="tags">
         <span class="tag cat">${escapeText(track.category)}</span>
         <span class="tag diff-Core">${escapeText(track.difficulty || "Core")}</span>
       </div>
       <div class="track-intro">${track.intro}</div>` + overviewHtml;
    trackDetailEl.appendChild(header);

    // Progress dots
    const dots = document.createElement("div");
    dots.className = "step-dots";
    track.steps.forEach((_, i) => {
      const d = document.createElement("span");
      d.className = "step-dot";
      d.dataset.index = String(i);
      dots.appendChild(d);
    });
    trackDetailEl.appendChild(dots);

    // Steps container
    const stepsWrap = document.createElement("div");
    stepsWrap.className = "steps-wrap";
    trackDetailEl.appendChild(stepsWrap);

    const synthWrap = document.createElement("div");
    trackDetailEl.appendChild(synthWrap);

    const prog = trackProgress(track);
    let revealed = prog.revealed; // number of steps already revealed

    function refreshDots(current) {
      dots.querySelectorAll(".step-dot").forEach((d, i) => {
        d.classList.toggle("done", i < revealed);
        d.classList.toggle("current", i === current);
      });
    }

    function showSynthesis() {
      if (synthWrap.querySelector(".track-synthesis")) return;
      const s = document.createElement("div");
      s.className = "track-synthesis";
      const badge = document.createElement("div");
      badge.className = "synthesis-badge";
      badge.textContent = "What you just rediscovered";
      const content = document.createElement("div");
      content.className = "synthesis-content";
      content.innerHTML = track.synthesis + (track.connects ? track.connects : "");
      s.appendChild(badge);
      s.appendChild(content);
      synthWrap.appendChild(s);

      if (track.checkpoints && track.checkpoints.length) {
        const cp = document.createElement("div");
        cp.className = "checkpoints";
        const cpBadge = document.createElement("div");
        cpBadge.className = "checkpoints-badge";
        cpBadge.textContent = "Check yourself · retrieval practice";
        cp.appendChild(cpBadge);
        const cpBody = document.createElement("div");
        cpBody.className = "checkpoints-body";
        track.checkpoints.forEach((c, idx) => {
          const item = document.createElement("div");
          item.className = "checkpoint";
          const q = document.createElement("div");
          q.className = "check-q";
          q.innerHTML = `<strong>Q${idx + 1}.</strong> ${c.q}`;
          const btn = document.createElement("button");
          btn.className = "btn";
          btn.textContent = "Show answer";
          const a = document.createElement("div");
          a.className = "check-a";
          a.hidden = true;
          a.innerHTML = c.a;
          btn.addEventListener("click", () => {
            a.hidden = false;
            btn.disabled = true;
          });
          item.appendChild(q);
          item.appendChild(btn);
          item.appendChild(a);
          cpBody.appendChild(item);
        });
        cp.appendChild(cpBody);
        synthWrap.appendChild(cp);
      }

      revealed = track.steps.length;
      setTrackProgress(track, revealed, true);
      refreshDots(-1);
    }

    // Render one step. mode: "revealed" (already done) or "active" (interactive)
    function renderStep(i, mode) {
      const step = track.steps[i];
      const extras =
        (window.TRACK_EXTRAS && TRACK_EXTRAS[track.id] && TRACK_EXTRAS[track.id].steps &&
          TRACK_EXTRAS[track.id].steps[i]) || {};
      const quizzes = extras.quizzes || (extras.quiz ? [extras.quiz] : []);

      const el = document.createElement("div");
      el.className = "step-card";
      el.id = "step-" + track.id + "-" + i;

      const head = document.createElement("div");
      head.className = "step-head";
      head.innerHTML =
        `<span class="step-num">Step ${i + 1}</span>` +
        `<span class="step-title">${escapeText(step.title)}</span>`;
      el.appendChild(head);

      if (step.brief) {
        const brief = document.createElement("div");
        brief.className = "step-brief";
        brief.innerHTML =
          `<div class="brief-label">Concept</div>` +
          `<div class="brief-body">${step.brief}</div>`;
        el.appendChild(brief);
      }

      // Interactive figure (Brilliant-style manipulable diagram)
      if (extras.interactive && window.INTERACTIVES && INTERACTIVES[extras.interactive]) {
        const fig = document.createElement("div");
        fig.className = "interactive";
        try { INTERACTIVES[extras.interactive](fig); }
        catch (e) { fig.innerHTML = ""; }
        if (fig.childNodes.length) el.appendChild(fig);
      }

      if (step.challenge || step.prompt) {
        const chLabel = document.createElement("div");
        chLabel.className = "challenge-label";
        chLabel.textContent = "Your turn";
        el.appendChild(chLabel);
        const prompt = document.createElement("div");
        prompt.className = "prompt";
        prompt.innerHTML = step.challenge || step.prompt || "";
        el.appendChild(prompt);
      }

      if (step.diagram) {
        const dia = document.createElement("div");
        dia.className = "diagram";
        dia.innerHTML = step.diagram;
        el.appendChild(dia);
      }

      const revealZone = document.createElement("div");

      function doReveal() {
        if (step.reveal) {
          revealZone.appendChild(makeReveal("solution", "Work it through", step.reveal));
        }
        const discovered = document.createElement("div");
        discovered.className = "discovered";
        const dlab = document.createElement("div");
        dlab.className = "discovered-label";
        dlab.textContent = "What you discovered";
        const dtext = document.createElement("div");
        dtext.className = "discovered-text";
        dtext.textContent = step.insight || step.discovered || "";
        discovered.appendChild(dlab);
        discovered.appendChild(dtext);
        revealZone.appendChild(discovered);
      }

      if (mode === "revealed") {
        doReveal();
        el.appendChild(revealZone);
        return el;
      }

      // ----- active mode -----
      let quizzesLeft = quizzes.length;
      if (quizzes.length) {
        const qWrap = document.createElement("div");
        qWrap.className = "quiz-wrap";
        quizzes.forEach((qz) => {
          qWrap.appendChild(renderQuiz(qz, () => {
            quizzesLeft -= 1;
            updateGate();
          }));
        });
        el.appendChild(qWrap);
      }

      const actions = document.createElement("div");
      actions.className = "actions";

      const hints = step.hints || (step.hint ? [step.hint] : []);
      if (hints.length) {
        let shown = 0;
        const hintBtn = document.createElement("button");
        hintBtn.className = "btn";
        hintBtn.textContent = "Show a hint";
        hintBtn.addEventListener("click", () => {
          if (shown >= hints.length) return;
          revealZone.appendChild(
            makeReveal("hint", `Hint ${shown + 1}`, escapeToHtml(hints[shown]))
          );
          shown += 1;
          if (shown >= hints.length) {
            hintBtn.disabled = true;
            hintBtn.textContent = "No more hints";
          } else {
            hintBtn.textContent = "Next hint";
          }
        });
        actions.appendChild(hintBtn);
      }

      const revealBtn = document.createElement("button");
      revealBtn.className = "btn primary";
      revealBtn.textContent = step.reveal ? "Work it through" : "Continue";
      const gateNote = document.createElement("span");
      gateNote.className = "gate-note";
      gateNote.textContent = "Answer the check above to continue";

      function updateGate() {
        const locked = quizzesLeft > 0;
        revealBtn.disabled = locked;
        gateNote.style.display = locked ? "" : "none";
      }
      updateGate();

      revealBtn.addEventListener("click", () => {
        if (revealBtn.disabled) return;
        revealBtn.disabled = true;
        gateNote.style.display = "none";
        doReveal();
        if (i + 1 > revealed) {
          revealed = i + 1;
          setTrackProgress(track, revealed, revealed >= track.steps.length);
        }
        if (i + 1 < track.steps.length) {
          const next = renderStep(i + 1, "active");
          stepsWrap.appendChild(next);
          refreshDots(i + 1);
          next.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          showSynthesis();
          synthWrap.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      actions.appendChild(revealBtn);
      actions.appendChild(gateNote);
      el.appendChild(revealZone);
      el.appendChild(actions);
      return el;
    }

    // Build initial state based on saved progress.
    const startActive = Math.min(revealed, track.steps.length - 1);
    for (let i = 0; i < startActive; i++) {
      stepsWrap.appendChild(renderStep(i, "revealed"));
    }
    if (revealed >= track.steps.length) {
      // fully done: show all revealed + synthesis
      stepsWrap.appendChild(renderStep(track.steps.length - 1, "revealed"));
      refreshDots(-1);
      showSynthesis();
    } else {
      stepsWrap.appendChild(renderStep(startActive, "active"));
      refreshDots(startActive);
    }
  }

  /* ================= VIEW SWITCHING ================= */

  function switchView(view) {
    const puzzles = view === "puzzles";
    puzzlesView.hidden = !puzzles;
    tracksView.hidden = puzzles;
    introPuzzles.hidden = !puzzles;
    introTracks.hidden = puzzles;
    viewTabs.querySelectorAll(".view-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.view === view);
    });
    if (!puzzles) renderTrackList();
  }

  viewTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-tab");
    if (btn) switchView(btn.dataset.view);
  });

  resetBtn.addEventListener("click", () => {
    if (!confirm("Clear all saved progress (puzzles and tracks)?")) return;
    state = { solved: {}, tracks: {} };
    saveState();
    updateProgressBadge();
    renderProblems();
  });

  /* ---------- init ---------- */
  renderFilters();
  renderProblems();
  updateProgressBadge();
  switchView("puzzles");
})();
