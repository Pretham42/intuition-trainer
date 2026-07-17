/*
 * Intuition Trainer — interactive figures for Discovery Tracks (Brilliant-style).
 * Each entry INTERACTIVES[key](container) builds a manipulable figure with sliders
 * that update an SVG/canvas and a live readout. Referenced from track-extras.js.
 */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  function sv(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function txt(x, y, s, attrs) {
    const e = sv("text", Object.assign({ x: x, y: y }, attrs || {}));
    e.textContent = s;
    return e;
  }
  function fig(root) {
    const f = document.createElement("div");
    f.className = "iv-fig";
    root.appendChild(f);
    const svg = sv("svg", { viewBox: "0 0 460 180", "font-family": "monospace", "font-size": "12" });
    f.appendChild(svg);
    return svg;
  }
  function controls(root) {
    const c = document.createElement("div");
    c.className = "iv-controls";
    root.appendChild(c);
    return c;
  }
  function note(root) {
    const n = document.createElement("div");
    n.className = "iv-note";
    root.appendChild(n);
    return n;
  }
  function slider(parent, label, min, max, step, value, fmt, onInput) {
    const row = document.createElement("div");
    row.className = "iv-ctrl";
    const name = document.createElement("div");
    name.className = "iv-name";
    name.innerHTML = label;
    const range = document.createElement("input");
    range.type = "range";
    range.className = "iv-range";
    range.min = min; range.max = max; range.step = step; range.value = value;
    const val = document.createElement("div");
    val.className = "iv-val";
    function run() {
      const v = parseFloat(range.value);
      val.textContent = fmt(v);
      onInput(v);
    }
    range.addEventListener("input", run);
    row.appendChild(name); row.appendChild(range); row.appendChild(val);
    parent.appendChild(row);
    run();
    return range;
  }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function fmtNum(x) {
    if (!isFinite(x)) return "∞";
    if (x >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3)) return x.toExponential(1);
    if (x >= 1000) return Math.round(x).toLocaleString();
    return (Math.round(x * 100) / 100).toString();
  }

  const I = {};

  /* ---- Backprop: the chain rule ---- */
  I["chain-rule"] = function (root) {
    const svg = fig(root);
    // static nodes
    [["x", 55], ["y", 210], ["z", 375]].forEach(([lab, x]) => {
      svg.appendChild(sv("circle", { cx: x, cy: 60, r: 22, fill: "#182233", stroke: "#24314a" }));
      svg.appendChild(txt(x, 65, lab, { fill: "#e7ecf5", "text-anchor": "middle", "font-size": "14" }));
    });
    [[77, 188, "× 3"], [232, 353, "( )²"]].forEach(([x1, x2, lab]) => {
      const ln = sv("line", { x1: x1, y1: 60, x2: x2, y2: 60, stroke: "#6ea8fe", "stroke-width": "1.5" });
      svg.appendChild(ln);
      svg.appendChild(txt((x1 + x2) / 2, 48, lab, { fill: "#9fb0c9", "text-anchor": "middle", "font-size": "11" }));
    });
    const dyn = sv("g", {}); svg.appendChild(dyn);
    const n = note(root);
    const c = controls(root);
    function render(x) {
      clear(dyn);
      const y = 3 * x, z = y * y, dzdx = 18 * x;
      dyn.appendChild(txt(55, 100, "x=" + x.toFixed(1), { fill: "#7ef0c0", "text-anchor": "middle" }));
      dyn.appendChild(txt(210, 100, "y=" + y.toFixed(1), { fill: "#7ef0c0", "text-anchor": "middle" }));
      dyn.appendChild(txt(375, 100, "z=" + z.toFixed(1), { fill: "#7ef0c0", "text-anchor": "middle" }));
      n.innerHTML = "A nudge in <b>x</b> is scaled by the local rate <b>3</b> (to move y), then by <b>2y = " +
        (2 * y).toFixed(1) + "</b> (to move z). The rates <em>multiply</em>: <b>dz/dx = 3 × 2y = " +
        dzdx.toFixed(1) + "</b>.";
    }
    slider(c, "input <b>x</b>", -3, 3, 0.1, 1.5, (v) => v.toFixed(1), render);
  };

  /* ---- Gradient descent: the learning-rate bowl ---- */
  I["learning-rate-bowl"] = function (root) {
    const svg = fig(root);
    const X0 = 230, SCALE = 46; // w -> x
    const xw = (w) => X0 + w * SCALE;
    const yL = (L) => 158 - Math.min(L, 8) / 8 * 140; // L -> y
    // bowl curve L = 0.5 w^2
    let d = "";
    for (let w = -4.2; w <= 4.2; w += 0.1) d += (d ? "L" : "M") + xw(w).toFixed(1) + " " + yL(0.5 * w * w).toFixed(1) + " ";
    svg.appendChild(sv("path", { d: d, fill: "none", stroke: "#24314a", "stroke-width": "1.5" }));
    svg.appendChild(sv("line", { x1: X0, y1: 12, x2: X0, y2: 162, stroke: "#1c2740", "stroke-dasharray": "3 3" }));
    svg.appendChild(txt(X0, 176, "minimum", { fill: "#6c7d99", "text-anchor": "middle", "font-size": "11" }));
    const dyn = sv("g", {}); svg.appendChild(dyn);
    const n = note(root);
    const c = controls(root);
    function render(eta) {
      clear(dyn);
      let w = 3.6, pts = [];
      for (let k = 0; k < 12; k++) { pts.push(w); w = (1 - eta) * w; if (Math.abs(w) > 6) { pts.push(w > 0 ? 6 : -6); break; } }
      // trajectory
      let pd = "";
      pts.forEach((wk, k) => {
        const cw = Math.max(-4.2, Math.min(4.2, wk));
        pd += (pd ? "L" : "M") + xw(cw).toFixed(1) + " " + yL(0.5 * cw * cw).toFixed(1) + " ";
      });
      const color = eta < 2 ? "#7ef0c0" : "#ff8f8f";
      dyn.appendChild(sv("path", { d: pd, fill: "none", stroke: color, "stroke-width": "1", opacity: "0.5" }));
      pts.forEach((wk, k) => {
        const cw = Math.max(-4.2, Math.min(4.2, wk));
        dyn.appendChild(sv("circle", { cx: xw(cw), cy: yL(0.5 * cw * cw), r: 3.4, fill: color, opacity: (0.4 + 0.6 * k / pts.length).toFixed(2) }));
      });
      let verdict;
      if (eta < 1) verdict = "<span class='good'>converges smoothly</span> (0 &lt; η &lt; 1)";
      else if (eta < 2) verdict = "<span class='warn'>converges, oscillating</span> (1 &lt; η &lt; 2)";
      else if (eta < 2.05) verdict = "<span class='warn'>bounces forever</span> (η = 2)";
      else verdict = "<span class='bad'>diverges — blows up</span> (η &gt; 2)";
      n.innerHTML = "With curvature a = 1, each step multiplies w by (1 − η). Result: " + verdict +
        ". The stability limit is <b>η &lt; 2/a</b>.";
    }
    slider(c, "rate <b>η</b>", 0.1, 3, 0.05, 0.6, (v) => v.toFixed(2), render);
  };

  /* ---- Attention / loss: softmax with a temperature ---- */
  I["softmax-temperature"] = function (root) {
    const svg = fig(root);
    const logits = [2.0, 1.2, 0.4, -0.4];
    const bx = [70, 165, 260, 355], bw = 60;
    svg.appendChild(sv("line", { x1: 40, y1: 150, x2: 430, y2: 150, stroke: "#24314a" }));
    const dyn = sv("g", {}); svg.appendChild(dyn);
    const n = note(root);
    const c = controls(root);
    function render(T) {
      clear(dyn);
      const ex = logits.map((l) => Math.exp(l / T));
      const s = ex.reduce((a, b) => a + b, 0);
      const p = ex.map((e) => e / s);
      p.forEach((pi, i) => {
        const h = pi * 120;
        dyn.appendChild(sv("rect", { x: bx[i], y: 150 - h, width: bw, height: h, fill: "#6ea8fe", rx: "3", opacity: "0.85" }));
        dyn.appendChild(txt(bx[i] + bw / 2, 148 - h - 4, (pi * 100).toFixed(0) + "%", { fill: "#7ef0c0", "text-anchor": "middle", "font-size": "11" }));
        dyn.appendChild(txt(bx[i] + bw / 2, 165, "logit " + logits[i].toFixed(1), { fill: "#9fb0c9", "text-anchor": "middle", "font-size": "10" }));
      });
      let d;
      if (T < 0.6) d = "<span class='warn'>peaked</span> — nearly all weight on the top logit (a soft argmax)";
      else if (T > 1.8) d = "<span class='warn'>flat</span> — weights spread toward uniform";
      else d = "<span class='good'>balanced</span>";
      n.innerHTML = "Softmax turns logits into weights that sum to 1. Low temperature = " + d +
        ". Dividing logits by a large value (like √d) has the same flattening effect.";
    }
    slider(c, "temp <b>T</b>", 0.2, 3, 0.05, 1, (v) => v.toFixed(2), render);
  };

  /* ---- Loss functions: sigmoid + cross-entropy gradient ---- */
  I["sigmoid-crossentropy"] = function (root) {
    const svg = fig(root);
    const xz = (z) => 40 + (z + 6) / 12 * 390;
    const yp = (p) => 150 - p * 130;
    let d = "";
    for (let z = -6; z <= 6; z += 0.2) d += (d ? "L" : "M") + xz(z).toFixed(1) + " " + yp(1 / (1 + Math.exp(-z))).toFixed(1) + " ";
    svg.appendChild(sv("path", { d: d, fill: "none", stroke: "#24314a", "stroke-width": "1.5" }));
    svg.appendChild(sv("line", { x1: 40, y1: 150, x2: 430, y2: 150, stroke: "#1c2740" }));
    svg.appendChild(txt(44, 28, "p = σ(z)", { fill: "#9fb0c9", "font-size": "11" }));
    const dyn = sv("g", {}); svg.appendChild(dyn);
    const n = note(root);
    const c = controls(root);
    function render(z) {
      clear(dyn);
      const p = 1 / (1 + Math.exp(-z)), grad = p - 1; // y = 1
      dyn.appendChild(sv("circle", { cx: xz(z), cy: yp(p), r: 4.5, fill: "#7ef0c0" }));
      dyn.appendChild(sv("line", { x1: xz(z), y1: yp(p), x2: xz(z), y2: 150, stroke: "#7ef0c0", "stroke-dasharray": "2 2", opacity: "0.5" }));
      let d2;
      if (z < -2) d2 = "<span class='bad'>confidently WRONG</span> — big gradient, fast correction";
      else if (z > 2) d2 = "<span class='good'>confidently right</span> — gradient ≈ 0";
      else d2 = "unsure";
      n.innerHTML = "True label y = 1. Prediction <b>p = " + p.toFixed(3) + "</b>. Cross-entropy gradient <b>dL/dz = p − y = " +
        grad.toFixed(3) + "</b>. Here you are " + d2 + ". (MSE would give a vanishing gradient when confidently wrong.)";
    }
    slider(c, "logit <b>z</b>", -6, 6, 0.1, -3, (v) => v.toFixed(1), render);
  };

  /* ---- Molecular dynamics: the Lennard-Jones potential ---- */
  I["lennard-jones"] = function (root) {
    const svg = fig(root);
    const U = (r) => 4 * (Math.pow(1 / r, 12) - Math.pow(1 / r, 6));
    const F = (r) => 48 * Math.pow(1 / r, 13) - 24 * Math.pow(1 / r, 7); // -dU/dr
    const xr = (r) => 40 + (r - 0.95) / (2.6 - 0.95) * 390;
    const yu = (u) => 100 - Math.max(-1.3, Math.min(3, u)) / 4.3 * 120;
    let d = "";
    for (let r = 0.97; r <= 2.6; r += 0.02) d += (d ? "L" : "M") + xr(r).toFixed(1) + " " + yu(U(r)).toFixed(1) + " ";
    svg.appendChild(sv("path", { d: d, fill: "none", stroke: "#24314a", "stroke-width": "1.6" }));
    svg.appendChild(sv("line", { x1: 40, y1: yu(0), x2: 430, y2: yu(0), stroke: "#1c2740", "stroke-dasharray": "4 4" }));
    svg.appendChild(txt(434, yu(0) - 3, "U=0", { fill: "#6c7d99", "text-anchor": "end", "font-size": "10" }));
    svg.appendChild(txt(44, 24, "U(r)", { fill: "#9fb0c9", "font-size": "11" }));
    const dyn = sv("g", {}); svg.appendChild(dyn);
    const n = note(root);
    const c = controls(root);
    function render(r) {
      clear(dyn);
      const u = U(r), f = F(r);
      dyn.appendChild(sv("circle", { cx: xr(r), cy: yu(u), r: 4.5, fill: "#ffcf7a" }));
      let dir;
      if (f > 0.05) dir = "<span class='bad'>repelling</span> — pushed apart";
      else if (f < -0.05) dir = "<span class='good'>attracting</span> — pulled together";
      else dir = "<span class='warn'>balanced</span> — at the energy minimum (r ≈ 1.12)";
      n.innerHTML = "Separation <b>r = " + r.toFixed(2) + "</b> → energy <b>U = " + u.toFixed(2) +
        "</b>. Force F = −dU/dr = <b>" + f.toFixed(2) + "</b>, so the atoms are " + dir + ".";
    }
    slider(c, "distance <b>r</b>", 0.95, 2.6, 0.01, 1.6, (v) => v.toFixed(2), render);
  };

  /* ---- Entropy: how a distribution's entropy changes ---- */
  I["entropy-bars"] = function (root) {
    const svg = fig(root);
    const bx = [70, 165, 260, 355], bw = 60;
    svg.appendChild(sv("line", { x1: 40, y1: 150, x2: 430, y2: 150, stroke: "#24314a" }));
    const dyn = sv("g", {}); svg.appendChild(dyn);
    const n = note(root);
    const c = controls(root);
    function render(p1) {
      clear(dyn);
      const rest = (1 - p1) / 3;
      const p = [p1, rest, rest, rest];
      let H = 0;
      p.forEach((pi) => { if (pi > 0) H -= pi * Math.log2(pi); });
      p.forEach((pi, i) => {
        const h = pi * 120;
        dyn.appendChild(sv("rect", { x: bx[i], y: 150 - h, width: bw, height: h, fill: i === 0 ? "#ffcf7a" : "#6ea8fe", rx: "3", opacity: "0.85" }));
        dyn.appendChild(txt(bx[i] + bw / 2, 145 - h, (pi * 100).toFixed(0) + "%", { fill: "#7ef0c0", "text-anchor": "middle", "font-size": "11" }));
      });
      const uniform = Math.abs(p1 - 0.25) < 0.02;
      n.innerHTML = "Entropy <b>H = −Σ pᵢ log₂ pᵢ = " + H.toFixed(3) + " bits</b>. " +
        (uniform ? "<span class='good'>Uniform → maximum entropy (2 bits) — most uncertain.</span>"
                 : "Skewing the distribution <em>lowers</em> H — a peaked distribution is more predictable, so it carries fewer bits.");
    }
    slider(c, "P(outcome 1)", 0.02, 0.94, 0.02, 0.25, (v) => (v * 100).toFixed(0) + "%", render);
  };

  /* ---- Big-O: growth rates ---- */
  I["big-o-growth"] = function (root) {
    const n = note(root);
    const c = controls(root);
    function render(e) {
      const N = Math.round(Math.pow(10, e));
      const logn = Math.log2(N), nlogn = N * logn, n2 = N * N;
      n.innerHTML =
        "<div style='display:grid;grid-template-columns:auto 1fr;gap:4px 16px;font-family:var(--mono);font-size:13px'>" +
        "<span>n</span><b>" + N.toLocaleString() + "</b>" +
        "<span>log₂ n</span><b class='good'>" + fmtNum(logn) + "</b>" +
        "<span>n · log₂ n</span><b>" + fmtNum(nlogn) + "</b>" +
        "<span>n²</span><b class='bad'>" + fmtNum(n2) + "</b>" +
        "</div><div style='margin-top:8px'>At n = " + N.toLocaleString() +
        ", n² is <b>" + fmtNum(n2 / Math.max(nlogn, 1)) + "×</b> the work of n·log n. The <em>class</em> dominates.</div>";
    }
    slider(c, "size <b>n</b> = 10^", 0, 6, 0.1, 4, (v) => "10^" + v.toFixed(1), render);
  };

  /* ---- Dynamic programming: naive vs memoized cost ---- */
  I["dp-cost"] = function (root) {
    const n = note(root);
    const c = controls(root);
    const memo = [0, 1];
    function fib(k) { for (let i = 2; i <= k; i++) memo[i] = memo[i - 1] + memo[i - 2]; return memo[k]; }
    function render(k) {
      const calls = 2 * fib(k + 1) - 1; // naive fib(k) call count
      n.innerHTML = "Computing F(" + k + "): " +
        "<br>naive recursion → <b class='bad'>" + fmtNum(calls) + "</b> calls (exponential)" +
        "<br>with memoization → <b class='good'>" + k + "</b> subproblems (linear)" +
        "<br>speedup ≈ <b>" + fmtNum(calls / Math.max(k, 1)) + "×</b> — all from not recomputing.";
    }
    slider(c, "<b>n</b>", 1, 40, 1, 20, (v) => v.toFixed(0), render);
  };

  /* ---- Diffusion: adding noise to data ---- */
  I["diffusion-noise"] = function (root) {
    const f = document.createElement("div");
    f.className = "iv-fig";
    root.appendChild(f);
    const cv = document.createElement("canvas");
    cv.width = 260; cv.height = 150;
    cv.style.width = "260px"; cv.style.maxWidth = "100%"; cv.style.borderRadius = "8px";
    f.appendChild(cv);
    const ctx = cv.getContext("2d");
    // build the clean image once
    const clean = document.createElement("canvas");
    clean.width = 260; clean.height = 150;
    const cc = clean.getContext("2d");
    cc.fillStyle = "#0b1a2b"; cc.fillRect(0, 0, 260, 150);
    cc.fillStyle = "#7ef0c0"; cc.beginPath(); cc.arc(130, 75, 46, 0, Math.PI * 2); cc.fill();
    cc.fillStyle = "#0b1a2b";
    cc.beginPath(); cc.arc(114, 64, 7, 0, Math.PI * 2); cc.fill();
    cc.beginPath(); cc.arc(146, 64, 7, 0, Math.PI * 2); cc.fill();
    cc.strokeStyle = "#0b1a2b"; cc.lineWidth = 5; cc.beginPath(); cc.arc(130, 82, 22, 0.15 * Math.PI, 0.85 * Math.PI); cc.stroke();
    const base = cc.getImageData(0, 0, 260, 150);
    const n = note(root);
    const c = controls(root);
    function render(t) {
      const img = ctx.createImageData(260, 150);
      const b = base.data, d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        for (let ch = 0; ch < 3; ch++) {
          const noise = Math.random() * 255;
          d[i + ch] = b[i + ch] * (1 - t) + noise * t;
        }
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      let s;
      if (t < 0.15) s = "<span class='good'>clean data</span>";
      else if (t > 0.85) s = "<span class='bad'>almost pure noise</span>";
      else s = "<span class='warn'>partially noised</span>";
      n.innerHTML = "Noise level <b>t = " + t.toFixed(2) + "</b> → " + s +
        ". The forward process walks left→right; the model learns to walk it <em>backward</em>, one small step at a time.";
    }
    slider(c, "noise <b>t</b>", 0, 1, 0.02, 0.3, (v) => v.toFixed(2), render);
  };

  window.INTERACTIVES = I;
})();
