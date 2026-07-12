/*
 * Intuition Trainer — Scratchpad whiteboard.
 * Self-contained: a floating button toggles a draggable canvas you can draw on
 * while solving a problem. Pen / eraser / colors / sizes / undo / clear / download.
 * Persists to localStorage (survives refresh) but degrades gracefully if it can't.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "intuition-trainer-whiteboard-v1";
  const COLORS = ["#111318", "#2b6cff", "#e5484d", "#2ea043", "#f59e0b"];
  const SIZES = { S: 4, M: 9, L: 18 };
  const W = 1400, H = 920; // backing-store resolution (displayed scaled down)

  let panel, canvas, ctx, fab;
  let drawing = false, curColor = COLORS[0], curSize = SIZES.M, eraser = false;
  let last = null;
  const undoStack = [];

  function init() {
    buildFab();
    buildPanel();
    restore();
  }

  function buildFab() {
    fab = document.createElement("button");
    fab.className = "wb-fab";
    fab.type = "button";
    fab.title = "Open scratchpad";
    fab.setAttribute("aria-label", "Open scratchpad");
    fab.innerHTML = "&#9998;"; // pencil
    fab.addEventListener("click", togglePanel);
    document.body.appendChild(fab);
  }

  function buildPanel() {
    panel = document.createElement("div");
    panel.className = "wb-panel";
    panel.hidden = true;

    // Header (drag handle)
    const header = document.createElement("div");
    header.className = "wb-header";
    header.innerHTML = `<span class="wb-title">&#9998; Scratchpad</span>`;
    const close = document.createElement("button");
    close.className = "wb-x";
    close.type = "button";
    close.title = "Close";
    close.innerHTML = "&times;";
    close.addEventListener("click", togglePanel);
    header.appendChild(close);
    panel.appendChild(header);
    enableDrag(header);

    // Toolbar
    const bar = document.createElement("div");
    bar.className = "wb-toolbar";

    const penBtn = toolButton("&#9998;", "Pen", () => setEraser(false));
    const eraseBtn = toolButton("&#9647;", "Eraser", () => setEraser(true));
    penBtn.classList.add("active");

    function refreshMode() {
      penBtn.classList.toggle("active", !eraser);
      eraseBtn.classList.toggle("active", eraser);
    }
    penBtn._refresh = eraseBtn._refresh = refreshMode;

    bar.appendChild(penBtn);
    bar.appendChild(eraseBtn);
    bar.appendChild(sep());

    // color swatches
    const swatches = [];
    COLORS.forEach((c) => {
      const sw = document.createElement("button");
      sw.className = "wb-swatch";
      sw.type = "button";
      sw.style.background = c;
      sw.title = "Color";
      if (c === curColor) sw.classList.add("active");
      sw.addEventListener("click", () => {
        curColor = c;
        setEraser(false);
        swatches.forEach((s) => s.classList.toggle("active", s === sw));
      });
      swatches.push(sw);
      bar.appendChild(sw);
    });
    bar.appendChild(sep());

    // sizes
    const sizeBtns = [];
    Object.keys(SIZES).forEach((label) => {
      const b = document.createElement("button");
      b.className = "wb-tool wb-size";
      b.type = "button";
      b.textContent = label;
      b.title = label + " brush";
      if (SIZES[label] === curSize) b.classList.add("active");
      b.addEventListener("click", () => {
        curSize = SIZES[label];
        sizeBtns.forEach((s) => s.classList.toggle("active", s === b));
      });
      sizeBtns.push(b);
      bar.appendChild(b);
    });
    bar.appendChild(sep());

    bar.appendChild(toolButton("&#8630;", "Undo", undo));
    bar.appendChild(toolButton("&#128465;", "Clear", clearAll));
    bar.appendChild(toolButton("&#11123;", "Download PNG", download));

    // store mode refresher
    panel._penBtn = penBtn;
    panel._eraseBtn = eraseBtn;
    panel.appendChild(bar);

    // Canvas
    const wrap = document.createElement("div");
    wrap.className = "wb-canvas-wrap";
    canvas = document.createElement("canvas");
    canvas.className = "wb-canvas";
    canvas.width = W;
    canvas.height = H;
    wrap.appendChild(canvas);
    panel.appendChild(wrap);

    ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    fillWhite();

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    document.body.appendChild(panel);
  }

  function toolButton(html, title, onClick) {
    const b = document.createElement("button");
    b.className = "wb-tool";
    b.type = "button";
    b.innerHTML = html;
    b.title = title;
    b.addEventListener("click", onClick);
    return b;
  }
  function sep() {
    const s = document.createElement("span");
    s.className = "wb-sep";
    return s;
  }

  function setEraser(on) {
    eraser = on;
    if (panel._penBtn._refresh) panel._penBtn._refresh();
  }

  function togglePanel() {
    panel.hidden = !panel.hidden;
    fab.classList.toggle("active", !panel.hidden);
  }

  // ---- coordinate mapping (handles CSS scaling + DPR uniformly) ----
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height)
    };
  }

  function onDown(e) {
    e.preventDefault();
    pushUndo();
    drawing = true;
    last = pos(e);
    // a dot for taps
    ctx.beginPath();
    ctx.fillStyle = eraser ? "#ffffff" : curColor;
    ctx.arc(last.x, last.y, strokeWidth() / 2, 0, Math.PI * 2);
    ctx.fill();
    if (canvas.setPointerCapture) {
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }
  function onMove(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.strokeStyle = eraser ? "#ffffff" : curColor;
    ctx.lineWidth = strokeWidth();
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  }
  function onUp() {
    if (!drawing) return;
    drawing = false;
    last = null;
    save();
  }
  function strokeWidth() {
    return eraser ? curSize * 2.6 : curSize;
  }

  function fillWhite() {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ---- undo (dataURL snapshots, capped) ----
  function pushUndo() {
    try {
      undoStack.push(canvas.toDataURL("image/png"));
      if (undoStack.length > 20) undoStack.shift();
    } catch (_) {}
  }
  function undo() {
    const prev = undoStack.pop();
    if (!prev) { clearAll(); return; }
    const img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, W, H);
      fillWhite();
      ctx.drawImage(img, 0, 0, W, H);
      save();
    };
    img.src = prev;
  }

  function clearAll() {
    pushUndo();
    ctx.clearRect(0, 0, W, H);
    fillWhite();
    save();
  }

  function download() {
    try {
      const a = document.createElement("a");
      a.download = "scratchpad.png";
      a.href = canvas.toDataURL("image/png");
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (_) {}
  }

  // ---- persistence ----
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, canvas.toDataURL("image/png"));
    } catch (_) {
      /* quota or unavailable — drawing still works this session */
    }
  }
  function restore() {
    let data;
    try { data = localStorage.getItem(STORAGE_KEY); } catch (_) { return; }
    if (!data) return;
    const img = new Image();
    img.onload = function () {
      fillWhite();
      ctx.drawImage(img, 0, 0, W, H);
    };
    img.src = data;
  }

  // ---- drag the panel by its header ----
  function enableDrag(handle) {
    let dragging = false, ox = 0, oy = 0;
    handle.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".wb-x")) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      // switch to absolute positioning from current spot
      panel.style.left = r.left + "px";
      panel.style.top = r.top + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      handle.setPointerCapture && handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 40;
      let x = Math.min(Math.max(0, e.clientX - ox), maxX);
      let y = Math.min(Math.max(0, e.clientY - oy), maxY);
      panel.style.left = x + "px";
      panel.style.top = y + "px";
    });
    handle.addEventListener("pointerup", () => { dragging = false; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
