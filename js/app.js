/* Network+ Exam Simulator - shell, router, storage, icons, chrome. Loads LAST;
   other modules must guard shared sub-objects (NP.screens etc.) at load time. */
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};

  /* ---------------- storage ---------------- */

  const Store = {
    key: "netplus-sim-v1",
    data: null,
    load() {
      try { this.data = JSON.parse(localStorage.getItem(this.key)) || null; }
      catch (e) { this.data = null; }
      if (!this.data) this.data = {};
      this.data.attempts = this.data.attempts || [];
      this.data.missed = this.data.missed || [];
      this.data.recent = this.data.recent || [];
      this.data.inprogress = this.data.inprogress || null;
      return this.data;
    },
    save(data, fromSync) {
      if (data) this.data = data;
      this.data._savedAt = Date.now();
      try { localStorage.setItem(this.key, JSON.stringify(this.data)); }
      catch (e) { /* keep running in-memory */ }
      if (!fromSync && NP.sync) NP.sync.onLocalSave();
    }
  };
  NP.store = Store;
  Store.load();

  /* ---------------- DOM helpers ---------------- */

  NP.el = function (tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), attrs[k]);
      // null/undefined means "omit". Passing them through would set boolean
      // attributes like disabled to the string "null", which still disables.
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    for (const kid of kids) {
      if (kid == null) continue;
      n.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    }
    return n;
  };

  NP.esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- icon system (replaces all emoji) ---------------- */

  const SVGNS = "http://www.w3.org/2000/svg";
  const ICONS = {
    check:    { d: "M5 12l4 4 10-11", w: 2.6 },
    x:        { d: "M6 6l12 12M18 6L6 18", w: 2.6 },
    lock:     { d: "M8 10.5V8a4 4 0 0 1 8 0v2.5", rect: [5, 10.5, 14, 9.5, 2] },
    flag:     { d: "M5 21V4h11l-2 4 2 4H5" },
    clock:    { d: "M12 7v5l3 2", circle: [12, 12, 9] },
    partial:  { d: "M12 12V7M12 12l4 2", circle: [12, 12, 9], w: 2.4 },
    play:     { d: "M8 5v14l11-7z", fill: true },
    arrow:    { d: "M4 12h14M12 6l6 6-6 6", w: 2.2 },
    chevR:    { d: "M9 6l6 6-6 6", w: 2.2 },
    chevL:    { d: "M15 6l-6 6 6 6", w: 2.2 },
    chevD:    { d: "M6 9l6 6 6-6", w: 2.2 },
    target:   { d: "", circle2: [[12, 12, 8], [12, 12, 3]] },
    chart:    { d: "M5 20V10M12 20V4M19 20v-7" },
    book:     { d: "M4 5v14M8 5h12v14H8M8 9h12M8 13h12" },
    quiz:     { d: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" },
    alert:    { d: "M12 3l9 16H3zM12 9v4M12 17h.01" },
    tutor:    { d: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" },
    logo:     { d: "M6 8.4v3.2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8.4M12 13.6v2",
                circle3: [[6, 6, 2.4], [18, 6, 2.4], [12, 18, 2.4]] }
  };

  NP.icon = function (name, size, strokeWidth) {
    const spec = ICONS[name] || ICONS.check;
    const s = size || 16;
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("width", s);
    svg.setAttribute("height", s);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", spec.fill ? "currentColor" : "none");
    svg.setAttribute("stroke", spec.fill ? "none" : "currentColor");
    svg.setAttribute("stroke-width", strokeWidth || spec.w || 2);
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    const add = (tag, at) => {
      const n = document.createElementNS(SVGNS, tag);
      for (const k in at) n.setAttribute(k, at[k]);
      svg.appendChild(n);
    };
    if (spec.rect) add("rect", { x: spec.rect[0], y: spec.rect[1], width: spec.rect[2], height: spec.rect[3], rx: spec.rect[4] });
    if (spec.circle) add("circle", { cx: spec.circle[0], cy: spec.circle[1], r: spec.circle[2] });
    (spec.circle2 || spec.circle3 || []).forEach(c => add("circle", { cx: c[0], cy: c[1], r: c[2] }));
    if (spec.d) add("path", { d: spec.d });
    return svg;
  };

  /* ---------------- modal (focus trap, Escape, focus return) ---------------- */

  NP.modal = function (title, bodyHTML, buttons, opts) {
    opts = opts || {};
    const el = NP.el;
    const opener = document.activeElement;

    const veil = el("div", { class: "modal-veil" });
    const box = el("div", {
      class: "modal", role: "dialog", "aria-modal": "true", "aria-label": title
    });

    const intent = opts.intent || (opts.danger ? "danger" : null);
    if (intent) {
      const ic = intent === "danger" ? "alert" : intent === "warning" ? "clock" : "book";
      box.appendChild(el("div", { class: "tile " + intent }, NP.icon(ic, 24)));
    }
    box.appendChild(el("h3", { html: title }));
    box.appendChild(el("div", { class: "mbody", html: bodyHTML || "" }));

    const close = () => {
      document.removeEventListener("keydown", onKey, true);
      if (veil.parentNode) document.body.removeChild(veil);
      if (opener && opener.focus) opener.focus();
    };

    const row = el("div", { class: "btnrow" });
    (buttons || [{ label: "OK" }]).forEach(b => {
      const cls = b.secondary ? "btn secondary" : b.danger ? "btn danger" : "btn";
      row.appendChild(el("button", {
        class: cls,
        onclick: () => { close(); if (b.action) b.action(); }
      }, b.label));
    });
    box.appendChild(row);
    veil.appendChild(box);
    document.body.appendChild(veil);

    const focusable = () => box.querySelectorAll("button, [href], input, select, textarea");

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const f = focusable();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey, true);

    const f = focusable();
    if (f.length) f[0].focus();
    return { close };
  };

  /* ---------------- utils ---------------- */

  NP.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  NP.fmtTime = function (sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const mm = String(m).padStart(2, "0"), ss = String(s).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
  };

  NP.DOMAINS = {
    1: "1.0 Networking Concepts",
    2: "2.0 Network Implementation",
    3: "3.0 Network Operations",
    4: "4.0 Network Security",
    5: "5.0 Network Troubleshooting"
  };

  NP.buildIndex = function () {
    const B = window.NETBANK;
    const ix = {};
    (B.mc || []).forEach(q => { ix[q.id] = q; });
    (B.pbqs || []).forEach(q => { ix[q.id] = q; });
    NP.byId = ix;
  };

  /* ---------------- router ---------------- */

  const app = document.getElementById("app");

  NP.show = function (fn) {
    app.innerHTML = "";
    fn(app);
    window.scrollTo(0, 0);
    // Move focus to the new screen's heading so keyboard/SR users land in the right place.
    const h = app.querySelector(".screen-title, .lesson-h1");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  };

  /* ---------------- chrome builders ---------------- */

  const NAV = [
    ["Dashboard", () => NP.show(NP.screens.home)],
    ["Course", () => NP.show(NP.screens.course)],
    ["Tutor", () => NP.show(NP.screens.tutor)],
    ["Reference", () => NP.show(NP.screens.sheets)],
    ["History", () => NP.show(NP.screens.history)]
  ];

  /* Theme-toggle icons: inline SVG, 18px, viewBox 0 0 24 24, currentColor ink
     so they follow the button's color in both light and dark themes. */
  const THEME_SVG_HEAD = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">';
  const THEME_ICONS = {
    // sun: solid disc + 8 rays at 45deg steps
    light: THEME_SVG_HEAD +
      '<circle cx="12" cy="12" r="4.4"/>' +
      '<line x1="12" y1="2.5" x2="12" y2="5"/>' +
      '<line x1="12" y1="2.5" x2="12" y2="5" transform="rotate(45 12 12)"/>' +
      '<line x1="12" y1="2.5" x2="12" y2="5" transform="rotate(90 12 12)"/>' +
      '<line x1="12" y1="2.5" x2="12" y2="5" transform="rotate(135 12 12)"/>' +
      '<line x1="12" y1="2.5" x2="12" y2="5" transform="rotate(180 12 12)"/>' +
      '<line x1="12" y1="2.5" x2="12" y2="5" transform="rotate(225 12 12)"/>' +
      '<line x1="12" y1="2.5" x2="12" y2="5" transform="rotate(270 12 12)"/>' +
      '<line x1="12" y1="2.5" x2="12" y2="5" transform="rotate(315 12 12)"/>' +
      '</svg>',
    // moon: single-path crescent
    dark: THEME_SVG_HEAD +
      '<path d="M20.4 14.2A8.2 8.2 0 1 1 9.8 3.6a6.6 6.6 0 0 0 10.6 10.6z"/>' +
      '</svg>',
    // auto: stroked circle with the left half filled (the ◐ semantic)
    auto: THEME_SVG_HEAD +
      '<circle cx="12" cy="12" r="8.2"/>' +
      '<path d="M12 3.8a8.2 8.2 0 0 0 0 16.4z" fill="currentColor" stroke="none"/>' +
      '</svg>'
  };

  /* Study header with product identity + nav. `active` is the nav label to mark. */
  NP.chrome = function (active) {
    const el = NP.el;
    const syncMount = el("div", { class: "syncwrap" });

    const themeBtn = el("button", {
      class: "themebtn", type: "button",
      onclick: function () { StudyTheme.cycle(); }
    });
    const paintTheme = function (mode, res) {
      const label = mode === "auto" ? "Theme: auto (" + res + ")" : "Theme: " + mode;
      themeBtn.innerHTML = THEME_ICONS[mode] || THEME_ICONS.light;
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
    };
    StudyTheme.onChange(paintTheme); // fires once immediately to set the initial glyph

    const head = el("div", { class: "tophead" },
      el("div", { class: "brandwrap" },
        el("span", { class: "logo" }, NP.icon("logo", 20)),
        el("div", { class: "names" },
          el("div", { class: "pname" }, "Network+ Simulator"),
          el("div", { class: "psub" }, "N10-009 · independent study tool"))),
      el("div", { class: "topright" },
        el("nav", { class: "topnav", "aria-label": "Main" },
          ...NAV.map(([label, go]) => el("button", {
            class: active === label ? "on" : "",
            "aria-current": active === label ? "page" : null,
            onclick: go
          }, label))),
        syncMount,
        themeBtn));

    if (NP.sync) NP.sync.mountHeader(syncMount);

    const stage = el("div", { class: "stage" });
    const inner = el("div", { class: "stage-inner screen-in" });
    stage.appendChild(inner);
    return { head, bar: head, stage, inner };
  };

  /* Breadcrumb bar for inner study screens: NP.crumb([["Course", fn], "Unit 1"], "right text") */
  NP.crumb = function (parts, right) {
    const el = NP.el;
    const bar = el("div", { class: "crumb" });
    parts.forEach((p, i) => {
      if (i) bar.appendChild(el("span", { class: "sep" }, "/"));
      if (Array.isArray(p)) {
        bar.appendChild(el("button", { onclick: p[1] }, NP.icon("chevL", 16), p[0]));
      } else {
        bar.appendChild(el("span", { class: "cur" }, p));
      }
    });
    // Always present so callers can fill it in later (quiz counters do this).
    bar.appendChild(el("span", { class: "right" }, right || ""));
    return bar;
  };

  /* 3px progress hairline. Returns the element; set width via .style on the child. */
  NP.hairline = function (pct) {
    const bar = NP.el("div", { class: "hairline" });
    bar.appendChild(NP.el("i", { style: `width:${Math.max(0, Math.min(100, pct))}%` }));
    return bar;
  };

  /* Stage + inner for screens that build their own header. */
  NP.stage = function (wide) {
    const stage = NP.el("div", { class: "stage" });
    const inner = NP.el("div", { class: "stage-inner screen-in" + (wide ? " " + wide : "") });
    stage.appendChild(inner);
    return { stage, inner };
  };

  /* ---------------- screens ---------------- */

  NP.screens = NP.screens || {};

  const DISCLAIMER =
    "CompTIA® and Network+® are registered trademarks of CompTIA, Inc. This simulator is an " +
    "independent study tool, not affiliated with or endorsed by CompTIA. Scores are estimates.";

  /* ============ dashboard ============ */

  NP.screens.home = function (root) {
    const el = NP.el;
    const { head, stage, inner } = NP.chrome("Dashboard");
    inner.classList.add("wide");
    root.appendChild(head); root.appendChild(stage);

    const C = NP.course;
    const steps = C ? C.steps() : [];
    const uIdx = C ? C.unlockedIndex() : 0;
    const pct = C ? C.percentComplete() : 0;
    const complete = C ? C.courseComplete() : false;
    const ip = Store.data.inprogress;

    inner.appendChild(el("h1", { class: "screen-title" }, "Dashboard"));
    inner.appendChild(el("p", { class: "screen-sub" },
      "Everything runs in your browser. Nothing is uploaded."));

    // First use: nothing started, no exam in progress.
    if (!ip && pct === 0 && !Store.data.attempts.length) {
      inner.appendChild(firstUse());
      inner.appendChild(el("p", { class: "footnote" }, DISCLAIMER));
      return;
    }

    const dash = el("div", { class: "dash" });
    const main = el("div", { class: "dash-main" });
    const rail = el("div", { class: "dash-rail" });

    if (ip) main.appendChild(examPaused(ip));
    else if (complete) main.appendChild(courseDone());
    else main.appendChild(heroContinue(steps, uIdx));

    main.appendChild(readiness(steps, uIdx, pct, complete));
    const chart = quizChart(steps);
    if (chart) main.appendChild(chart);

    rail.appendChild(struggling());
    rail.appendChild(courseMap(steps, uIdx));
    rail.appendChild(quickTools());

    dash.appendChild(main); dash.appendChild(rail);
    inner.appendChild(dash);
    inner.appendChild(el("p", { class: "footnote" }, bankLine() + " " + DISCLAIMER));

    /* ---- pieces ---- */

    function bankLine() {
      const B = window.NETBANK;
      const items = (B.pbqs || []).reduce((s, p) => s + p.items.length, 0);
      return `Question bank: ${(B.mc || []).length} multiple-choice · ${(B.pbqs || []).length} PBQs ` +
        `(${items} scored items). Exams assemble randomly with domain weighting and repeat-avoidance.`;
    }

    function firstUse() {
      const B = window.NETBANK;
      const card = el("div", { class: "card", style: "max-width:620px" });
      card.appendChild(el("div", { class: "eyebrow" }, "Welcome"));
      card.appendChild(el("h2", { style: "font-size:24px;margin:8px 0;letter-spacing:-.01em" },
        "Start with the course."));
      card.appendChild(el("p", { style: "color:var(--muted);margin:0 0 22px" },
        `${steps.filter(s => s.kind === "module").length} modules take you from first principles to ` +
        "exam-ready. Pass each module quiz at 75% to unlock the next; finish the course to unlock the " +
        "full timed mock."));
      const first = steps[0];
      card.appendChild(el("button", {
        class: "btn big wide",
        onclick: () => NP.show(NP.screens.course)
      }, first ? "Begin " + first.unit.title : "Begin the course", NP.icon("arrow", 18)));

      const stats = el("div", { class: "statgrid" });
      const stat = (v, l) => stats.appendChild(el("div", { class: "stat" },
        el("div", { class: "v" }, v), el("div", { class: "l" }, l)));
      stat(String((B.mc || []).length), "questions");
      stat(String((B.pbqs || []).length), "PBQ scenarios");
      stat("720", "to pass");
      card.appendChild(stats);
      return card;
    }

    function heroContinue(steps, uIdx) {
      const next = steps[uIdx];
      const hero = el("div", { class: "hero" });
      const box = el("div", { class: "inner" });
      box.appendChild(el("div", { class: "eyebrow" }, "Pick up where you left off"));

      const modules = steps.filter(s => s.kind === "module");
      const modNo = next && next.kind === "module" ? modules.indexOf(next) + 1 : 0;
      const meta = el("div", { class: "meta" });
      if (next.kind === "module") {
        meta.appendChild(el("span", null, NP.icon("clock", 15), next.item.minutes + " min read"));
        meta.appendChild(el("span", null, NP.icon("quiz", 15),
          `${next.item.quiz.length}-question quiz · 75% to pass`));
      } else {
        meta.appendChild(el("span", null, NP.icon("flag", 15), "cumulative checkpoint"));
        meta.appendChild(el("span", null, NP.icon("quiz", 15),
          `${next.item.n} questions · 75% to pass`));
      }

      const left = el("div", { style: "min-width:0" },
        el("div", { class: "unit" },
          next.unit.title + (modNo ? ` · Module ${modNo} of ${modules.length}` : "")),
        el("h2", null, (next.kind === "checkpoint" ? "Checkpoint: " : "") + next.item.title),
        meta);

      box.appendChild(el("div", { class: "split" }, left,
        el("button", {
          class: "btn white",
          onclick: () => NP.show(NP.screens.course)
        }, next.kind === "checkpoint" ? "Take the checkpoint" : "Continue module", NP.icon("arrow", 18))));
      hero.appendChild(box);
      return hero;
    }

    function examPaused(ip) {
      const done = ip.answers ? ip.answers.filter(a => a != null).length : 0;
      const total = ip.items ? ip.items.length : 0;
      const p = el("div", { class: "panel amber" });
      p.appendChild(el("div", { class: "flag" }, NP.icon("clock", 16), "Exam paused"));
      p.appendChild(el("h3", null, "You have an unfinished mock"));
      const when = new Date(ip.startedAt).toLocaleString();
      p.appendChild(el("p", { html:
        `Started ${NP.esc(when)} · <span class="mono" style="font-weight:600">${NP.fmtTime(ip.remaining)}</span>` +
        " remaining. The clock only runs while the exam is open." }));
      const track = el("div", { class: "track" });
      track.appendChild(el("i", { style: `width:${total ? Math.round(100 * done / total) : 0}%` }));
      p.appendChild(track);
      p.appendChild(el("div", { style: "display:flex;gap:12px" },
        el("button", { class: "btn", style: "flex:1", onclick: () => NP.exam.resume() }, "Resume exam"),
        el("button", {
          class: "btn danger-outline",
          onclick: () => NP.modal("Discard exam?",
            "<p>The in-progress attempt will be deleted and not scored.</p>",
            [{ label: "Discard", danger: true, action: () => { Store.data.inprogress = null; Store.save(); NP.show(NP.screens.home); } },
             { label: "Keep it", secondary: true }],
            { intent: "danger" })
        }, "Discard")));
      return p;
    }

    function courseDone() {
      const p = el("div", { class: "panel good" });
      p.appendChild(el("span", { class: "bigtile" }, NP.icon("check", 28, 2.6)));
      p.appendChild(el("div", { class: "ctitle" }, "Course complete"));
      p.appendChild(el("p", null,
        "Every module and checkpoint passed. The full mock exam is unlocked, you've earned the finish line."));
      p.appendChild(el("button", {
        class: "btn good big wide", onclick: () => NP.exam.startIntro()
      }, "Take the full mock exam", NP.icon("arrow", 18)));
      p.appendChild(el("div", { class: "cmeta" }, "75 questions · 90:00 · pass at 720"));
      return p;
    }

    function readiness(steps, uIdx, pct, complete) {
      const card = el("div", { class: "card", style: "margin:0" });
      const headRow = el("div", { class: "cardhead" },
        el("h3", null, "Mock-exam readiness"));
      headRow.appendChild(complete
        ? el("span", { class: "lockpill good" }, NP.icon("check", 13, 3), "Unlocked")
        : el("span", { class: "lockpill" }, NP.icon("lock", 13), "Locked · unlocks at 100%"));
      card.appendChild(headRow);

      // One segment per unit, filled by that unit's own completion.
      const units = window.NETCOURSE.units || [];
      const rail = el("div", { class: "units" });
      let idx = 0;
      units.forEach((u, i) => {
        const n = u.modules.length + (u.checkpoint ? 1 : 0);
        const mine = steps.slice(idx, idx + n);
        const doneN = mine.filter((s, k) => idx + k < uIdx).length;
        idx += n;
        const upct = n ? Math.round(100 * doneN / n) : 0;
        const isDone = doneN === n;
        const isCur = !isDone && doneN > 0 || (!isDone && uIdx >= idx - n && uIdx < idx);
        const cell = el("div", { class: "u" + (isDone ? " done" : isCur ? " cur" : "") });
        const seg = el("div", { class: "useg" });
        if (isCur && upct > 0) {
          seg.style.background =
            `linear-gradient(90deg, var(--accent) ${upct}%, var(--sub2) ${upct}%)`;
        }
        cell.appendChild(seg);
        cell.appendChild(el("span", { class: "ulbl" },
          "U" + (i + 1) + (isDone ? " ✓" : isCur ? " ···" : "")));
        rail.appendChild(cell);
      });
      card.appendChild(rail);

      const doneSteps = steps.filter((s, i) => i < uIdx).length;
      const foot = el("div", { class: "readyfoot" });
      foot.appendChild(el("div", { class: "msg" }, complete
        ? "The mock is unlocked. 75 questions, 90 minutes."
        : "Complete the course to unlock the full 75-question mock."));
      foot.appendChild(el("div", { class: "num" },
        el("b", null, pct + "%"),
        el("span", null, ` · ${doneSteps} / ${steps.length} steps`)));
      card.appendChild(foot);
      return card;
    }

    /* Bars come only from module quizzes that actually have a recorded best score. */
    function quizChart(steps) {
      const prog = C ? C.progress() : null;
      if (!prog) return null;
      const scores = [];
      steps.forEach(s => {
        const rec = s.kind === "module" ? prog.modules[s.item.id] : prog.checkpoints[s.item.id];
        if (rec && rec.best != null) scores.push({ title: s.item.title, best: rec.best });
      });
      if (!scores.length) return null;

      const recent = scores.slice(-6);
      const card = el("div", { class: "card", style: "margin:0" });
      card.appendChild(el("div", { class: "cardhead" },
        el("h3", null, "Recent quiz performance"),
        el("span", { class: "note" }, `last ${recent.length} ${recent.length === 1 ? "quiz" : "quizzes"}`)));

      const chart = el("div", { class: "qchart" });
      const plot = el("div", { class: "qplot" });
      const labels = el("div", { class: "qlabels" });
      recent.forEach((s, i) => {
        const bar = el("div", { class: "bar", style: `height:${Math.max(4, s.best)}%` });
        plot.appendChild(el("div", {
          class: "qb" + (s.best < 75 ? " fail" : "") + (i === recent.length - 1 ? " latest" : ""),
          title: s.title + ": best " + s.best + "%"
        }, bar));
        labels.appendChild(el("span", null, s.best + "%"));
      });
      plot.appendChild(el("div", { class: "passline" })); // sits at 75% of the plot box
      chart.appendChild(plot);
      chart.appendChild(labels);
      card.appendChild(chart);

      const above = recent.filter(s => s.best >= 75).length;
      card.appendChild(el("p", { class: "takeaway" },
        `Dashed line marks the 75% pass mark. ${above} of ${recent.length} at or above it.`));
      return card;
    }

    function struggling() {
      const ids = Store.data.missed.filter(id => NP.byId[id]);
      const card = el("div", { class: "card", style: "margin:0" });
      if (!ids.length) {
        card.appendChild(el("div", { class: "railhead" },
          el("span", { class: "tile good" }, NP.icon("check", 19, 2.6)),
          el("div", null,
            el("div", { class: "lbl" }, "What you're struggling with"),
            el("div", { class: "val" }, "Nothing to re-drill"))));
        card.appendChild(el("p", { style: "font-size:13px;color:var(--muted);margin:14px 0 0" },
          "Misses from mocks and tutor mode land here automatically."));
        return card;
      }
      card.appendChild(el("div", { class: "railhead" },
        el("span", { class: "tile bad" }, NP.icon("x", 19, 2.4)),
        el("div", null,
          el("div", { class: "lbl" }, "What you're struggling with"),
          el("div", { class: "val" }, `${ids.length} missed question${ids.length === 1 ? "" : "s"}`))));

      const byDom = {};
      ids.forEach(id => { const d = NP.byId[id].domain; byDom[d] = (byDom[d] || 0) + 1; });
      const tags = el("div", { style: "display:flex;gap:6px;margin:15px 0;flex-wrap:wrap" });
      Object.keys(byDom).sort((a, b) => byDom[b] - byDom[a]).forEach(d => {
        tags.appendChild(el("span", { class: "pill", title: NP.DOMAINS[d] }, `D${d} · ${byDom[d]}`));
      });
      card.appendChild(tags);
      card.appendChild(el("button", {
        class: "btn soft wide", onclick: () => NP.tutor.startDeck(ids)
      }, "Drill the deck"));
      card.appendChild(el("button", {
        class: "linkish", style: "margin-top:8px", onclick: () => NP.show(NP.screens.missed)
      }, "View the deck"));
      return card;
    }

    function courseMap(steps, uIdx) {
      const card = el("div", { class: "card", style: "margin:0" });
      card.appendChild(el("h3", null, "Course map"));
      const list = el("div", { class: "cmap" });
      let idx = 0;
      (window.NETCOURSE.units || []).forEach(u => {
        const n = u.modules.length + (u.checkpoint ? 1 : 0);
        const start = idx, end = idx + n;
        idx = end;
        const doneN = Math.max(0, Math.min(n, uIdx - start));
        const isDone = doneN === n;
        const isCur = !isDone && uIdx >= start && uIdx < end;
        const row = el("div", {
          class: "row " + (isDone ? "done" : isCur ? "cur" : "locked")
        });
        row.appendChild(el("span", { class: "dot" },
          isDone ? NP.icon("check", 13, 3.4) : isCur ? NP.icon("play", 11) : NP.icon("lock", 12)));
        row.appendChild(el("span", { class: "nm" }, u.title));
        if (isDone) row.appendChild(el("span", { class: "st" }, "done"));
        else if (isCur) row.appendChild(el("span", { class: "st" }, `${doneN}/${n}`));
        list.appendChild(row);
      });
      card.appendChild(list);
      return card;
    }

    function quickTools() {
      const tools = el("div", { class: "tools" });
      const tool = (icon, t1, t2, fn) => tools.appendChild(el("button", { class: "tool", onclick: fn },
        el("span", { class: "tile" }, NP.icon(icon, 18)),
        el("span", { class: "txt" },
          el("span", { class: "t1" }, t1),
          el("span", { class: "t2" }, t2)),
        el("span", { class: "chev" }, NP.icon("chevR", 17))));
      tool("tutor", "Tutor mode", "Untimed practice by domain", () => NP.show(NP.screens.tutor));
      tool("book", "Reference sheets", "Ports · OSI · methodology", () => NP.show(NP.screens.sheets));
      tool("chart", "Score history", "Past attempts and trend", () => NP.show(NP.screens.history));
      return tools;
    }
  };

  /* ============ score history ============ */

  NP.screens.history = function (root) {
    const el = NP.el;
    const { head, stage, inner } = NP.chrome("History");
    root.appendChild(head); root.appendChild(stage);

    inner.appendChild(el("h1", { class: "screen-title" }, "Score History"));
    const at = Store.data.attempts;

    if (!at.length) {
      inner.appendChild(el("p", { class: "screen-sub" }, "Every completed mock lands here."));
      const card = el("div", { class: "card" });
      const e = el("div", { class: "empty" });
      e.appendChild(el("div", { class: "tile muted" }, NP.icon("chart", 24)));
      e.appendChild(el("h3", null, "No completed mocks yet"));
      e.appendChild(el("p", null,
        "Finish the course to unlock the mock, then your score trend appears here."));
      e.appendChild(el("button", {
        class: "btn", onclick: () => NP.show(NP.screens.course)
      }, "Go to the course"));
      card.appendChild(e);
      inner.appendChild(card);
      return;
    }

    inner.appendChild(el("p", { class: "screen-sub" },
      `${at.length} completed ${at.length === 1 ? "attempt" : "attempts"}. ` +
      "Scaled scores are estimates."));
    inner.appendChild(NP.results.trendChart(at));

    at.slice().reverse().forEach((a, ri) => {
      const i = at.length - 1 - ri;
      const row = el("div", { class: "attempt-row" + (a.pass ? " pass" : "") });
      row.appendChild(el("div", null,
        el("strong", null, `Attempt ${i + 1}`),
        el("span", { class: "date" }, " · " + new Date(a.date).toLocaleString())));
      row.appendChild(el("div", { class: "right" },
        el("span", { class: "vd " + (a.pass ? "ok" : "no") },
          NP.icon(a.pass ? "check" : "x", 14, 2.6), a.pass ? "PASS" : "FAIL"),
        el("span", { class: "sc" }, String(a.scaled)),
        el("button", { class: "linkish", onclick: () => NP.results.showSaved(i) }, "View report")));
      inner.appendChild(row);
    });
  };

  /* ============ missed deck ============ */

  NP.screens.missed = function (root) {
    const el = NP.el;
    const { head, stage, inner } = NP.chrome();
    root.appendChild(head); root.appendChild(stage);

    inner.appendChild(el("h1", { class: "screen-title" }, "Missed Questions Deck"));
    const ids = Store.data.missed.filter(id => NP.byId[id]);

    if (!ids.length) {
      inner.appendChild(el("p", { class: "screen-sub" },
        "Everything you get wrong lands here for re-drilling."));
      const card = el("div", { class: "card" });
      const e = el("div", { class: "empty" });
      e.appendChild(el("div", { class: "tile good" }, NP.icon("check", 26, 2.2)));
      e.appendChild(el("h3", null, "Nothing to re-drill"));
      e.appendChild(el("p", null,
        "Misses from mocks and tutor mode land here automatically. A clean deck is a good sign."));
      card.appendChild(e);
      inner.appendChild(card);
      return;
    }

    const card = el("div", { class: "card" });
    const hd = el("div", { class: "misshead" });
    hd.appendChild(el("div", null,
      el("div", { class: "n" }, String(ids.length)),
      el("div", { class: "l" },
        `question${ids.length === 1 ? "" : "s"} to re-drill · answer one correctly and it graduates out`)));
    hd.appendChild(el("button", {
      class: "btn accent", onclick: () => NP.tutor.startDeck(ids)
    }, "Drill the deck"));
    card.appendChild(hd);

    ids.forEach(id => {
      const q = NP.byId[id];
      const row = el("div", { class: "missrow" });
      row.appendChild(el("span", { class: "pill" },
        NP.isPBQ(q) ? "PBQ" : (Array.isArray(q.answer) ? "Multi" : "MC")));
      row.appendChild(el("span", { class: "pill", title: NP.DOMAINS[q.domain] }, "D" + q.domain));
      const t = (q.title || q.text || "").replace(/<[^>]+>/g, "").trim();
      row.appendChild(el("span", { class: "stem" }, t));
      card.appendChild(row);
    });

    card.appendChild(el("button", {
      class: "btn secondary", style: "margin-top:14px",
      onclick: () => NP.modal("Clear deck?",
        `<p>All ${ids.length} missed questions will be removed.</p>`,
        [{ label: "Clear", danger: true, action: () => { Store.data.missed = []; Store.save(); NP.show(NP.screens.missed); } },
         { label: "Cancel", secondary: true }],
        { intent: "danger" })
    }, "Clear deck"));
    inner.appendChild(card);
  };

  /* ============ study sheets ============ */

  const SHEETS = {
    ports: {
      label: "Ports & protocols",
      head: ["Port", "Protocol", "Use"],
      rows: [
        ["20/21", "FTP (TCP)", "File transfer (20 data, 21 control)"],
        ["22", "SSH / SFTP (TCP)", "Secure remote shell & file transfer"],
        ["23", "Telnet (TCP)", "Insecure remote shell: avoid"],
        ["25", "SMTP (TCP)", "Mail transfer between servers"],
        ["53", "DNS (UDP/TCP)", "Name resolution (TCP for zone transfers)"],
        ["67/68", "DHCP (UDP)", "Address assignment (67 server, 68 client)"],
        ["69", "TFTP (UDP)", "Trivial file transfer (firmware, configs)"],
        ["80", "HTTP (TCP)", "Web, unencrypted"],
        ["110", "POP3 (TCP)", "Mail retrieval (download-and-delete)"],
        ["123", "NTP (UDP)", "Time synchronization"],
        ["143", "IMAP (TCP)", "Mail retrieval (server-side folders)"],
        ["161/162", "SNMP (UDP)", "Device monitoring (162 = traps)"],
        ["389", "LDAP (TCP)", "Directory services"],
        ["443", "HTTPS (TCP)", "Web over TLS"],
        ["445", "SMB (TCP)", "Windows file/print sharing"],
        ["514", "Syslog (UDP)", "Centralized logging"],
        ["587", "SMTP-submission (TCP)", "Authenticated mail submission (TLS)"],
        ["636", "LDAPS (TCP)", "LDAP over TLS"],
        ["1433", "SQL Server (TCP)", "Microsoft database"],
        ["3389", "RDP (TCP)", "Remote Desktop"],
        ["5060/5061", "SIP (TCP/UDP)", "VoIP call setup (5061 = TLS)"]
      ],
      note: "Header stays pinned while you scroll · 21 ports total"
    },
    osi: {
      label: "OSI model",
      head: ["#", "Layer", "Unit", "Examples / devices"],
      rows: [
        ["7", "Application", "Data", "HTTP, DNS, SMTP"],
        ["6", "Presentation", "Data", "TLS, encoding, compression"],
        ["5", "Session", "Data", "Session setup/teardown, API sessions"],
        ["4", "Transport", "Segment", "TCP, UDP, port numbers"],
        ["3", "Network", "Packet", "IP, ICMP, routers"],
        ["2", "Data Link", "Frame", "Ethernet, MAC addresses, switches"],
        ["1", "Physical", "Bit", "Cables, radio, hubs, transceivers"]
      ],
      note: "Mnemonic (bottom-up): Please Do Not Throw Sausage Pizza Away"
    },
    ts: {
      label: "Troubleshooting",
      head: ["Step", "What you do"],
      wide: true,
      rows: [
        ["1. Identify the problem", "Gather information, question users, determine what changed, duplicate if possible."],
        ["2. Establish a theory", "Question the obvious; consider multiple approaches (top-down / bottom-up OSI)."],
        ["3. Test the theory", "If confirmed, plan next steps; if not, establish a new theory or escalate."],
        ["4. Establish a plan of action", "Identify potential effects before you touch anything."],
        ["5. Implement the solution", "Or escalate as necessary."],
        ["6. Verify full functionality", "And, if applicable, implement preventive measures."],
        ["7. Document", "Findings, actions, outcomes, and lessons learned."]
      ],
      note: "The order is examinable. Know it verbatim."
    }
  };

  NP.screens.sheets = function (root) {
    const el = NP.el;
    const { head, stage, inner } = NP.chrome("Reference");
    root.appendChild(head); root.appendChild(stage);

    inner.appendChild(el("h1", { class: "screen-title" }, "Study Sheets"));
    inner.appendChild(el("p", { class: "screen-sub" },
      "The reference tables the exam assumes you know cold."));

    let cur = "ports";
    const tabs = el("div", { class: "tabs" });
    const body = el("div");

    Object.keys(SHEETS).forEach(k => {
      tabs.appendChild(el("button", {
        class: cur === k ? "on" : "",
        onclick: e => {
          cur = k;
          tabs.querySelectorAll("button").forEach(b => b.classList.remove("on"));
          e.currentTarget.classList.add("on");
          paint();
        }
      }, SHEETS[k].label));
    });
    inner.appendChild(tabs);
    inner.appendChild(body);

    paint();

    function paint() {
      const s = SHEETS[cur];
      body.innerHTML = "";
      const wrap = el("div", { class: "tablewrap" });
      const table = el("table", { class: "sheet-table" });
      const thead = el("thead");
      const hr = el("tr");
      s.head.forEach(h => hr.appendChild(el("th", null, h)));
      thead.appendChild(hr);
      table.appendChild(thead);
      const tb = el("tbody");
      s.rows.forEach(r => {
        const tr = el("tr");
        r.forEach((c, i) => tr.appendChild(el("td", { class: i === 0 && s.wide ? "wide" : "" }, c)));
        tb.appendChild(tr);
      });
      table.appendChild(tb);
      wrap.appendChild(table);
      body.appendChild(wrap);
      body.appendChild(el("div", { class: "sheetnote" }, s.note));
    }
  };

  /* ---------------- boot ---------------- */

  NP.buildIndex();
  NP.sync = StudySync.initSync(NP, {
    app: "netplus",
    load: () => Store.load(),
    save: (data, fromSync) => Store.save(data, fromSync)
  });
  NP.show(NP.screens.home);
})();
