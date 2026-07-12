/* Exam engine: assembly (domain-weighted), timer, flag/review navigation,
   MC rendering, grading, autosave, finalization. */
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};
  NP.screens = NP.screens || {};

  const TOTAL_Q = 75;
  const PBQ_COUNT = 4;
  const DURATION = 90 * 60;
  const LOW_TIME = 300;
  const LETTERS = ["A", "B", "C", "D", "E", "F"];
  const NUMWORD = { 2: "TWO", 3: "THREE", 4: "FOUR" };

  /* ============ shared MC rendering / grading ============ */

  NP.isPBQ = q => Array.isArray(q.items);

  /* Renders question text + choice buttons. State is never color-only: every
     status carries an icon or shape as well. opts: { review, disabled } */
  NP.renderMC = function (container, q, getAns, setAns, opts) {
    opts = opts || {};
    const el = NP.el;
    const ro = opts.review || opts.disabled;
    const multi = Array.isArray(q.answer);
    const maxSel = multi ? q.answer.length : 1;

    if (multi && !opts.review) {
      container.appendChild(el("div", { class: "selectn" },
        NP.icon("alert", 14),
        `Select ${NUMWORD[maxSel] || maxSel} answers`));
    }

    container.appendChild(el("div", { class: "qtext", html: q.text }));

    const box = el("div", { class: "choices" });
    const buttons = [];

    const repaint = () => {
      const a = getAns();
      const sel = i => multi ? (Array.isArray(a) && a.includes(i)) : a === i;
      const atMax = multi && Array.isArray(a) && a.length >= maxSel;
      buttons.forEach((btn, i) => {
        const on = sel(i);
        btn.classList.toggle("selected", on);
        btn.classList.toggle("dim", !opts.review && atMax && !on);
        // marker: letter when unselected, check glyph when a multi-select is on
        const marker = btn.querySelector(".letter");
        marker.innerHTML = "";
        if (multi && on) marker.appendChild(NP.icon("check", 14, 3.4));
        else marker.textContent = LETTERS[i];
        const hint = btn.querySelector(".maxhint");
        if (hint) hint.classList.toggle("hidden", !(atMax && !on));
      });
    };

    q.choices.forEach((c, i) => {
      const btn = el("button", {
        class: "choice" + (multi ? " multi" : "") + (ro ? " ro" : ""),
        type: "button",
        "aria-pressed": "false",
        onclick: () => {
          if (ro) return;
          if (multi) {
            let a = Array.isArray(getAns()) ? getAns().slice() : [];
            if (a.includes(i)) a = a.filter(x => x !== i);
            else { if (a.length >= maxSel) return; a.push(i); }
            setAns(a.length ? a : null);
          } else {
            setAns(getAns() === i ? null : i);
          }
          repaint();
        }
      },
        el("span", { class: "letter" }, LETTERS[i]),
        el("span", { class: "ctext", html: c }));

      if (multi && !opts.review) {
        btn.appendChild(el("span", { class: "maxhint hidden" }, `max ${maxSel} reached`));
      }

      if (opts.review) {
        const corr = multi ? q.answer : [q.answer];
        const ansArr = getAns() == null ? [] : (Array.isArray(getAns()) ? getAns() : [getAns()]);
        if (corr.includes(i)) {
          btn.classList.add("correct");
          btn.appendChild(el("span", { class: "tag" }, NP.icon("check", 13, 3), "Correct answer"));
        }
        if (ansArr.includes(i) && !corr.includes(i)) {
          btn.classList.add("wrongpick");
          btn.appendChild(el("span", { class: "tag" }, NP.icon("x", 12, 2.8), "Your answer"));
        }
      }

      buttons.push(btn);
      box.appendChild(btn);
    });

    container.appendChild(box);
    repaint();
  };

  NP.gradeMC = function (q, ans) {
    if (ans == null) return false;
    if (Array.isArray(q.answer)) {
      return Array.isArray(ans) && ans.length === q.answer.length &&
        ans.slice().sort().join(",") === q.answer.slice().sort().join(",");
    }
    return ans === q.answer;
  };

  NP.isAnsweredMC = function (q, ans) {
    if (ans == null) return false;
    if (Array.isArray(q.answer)) return Array.isArray(ans) && ans.length === q.answer.length;
    return true;
  };

  // Unified helpers across MC and PBQ
  NP.gradePoints = function (q, ans) {
    if (NP.isPBQ(q)) {
      const g = NP.pbq.grade(q, ans);
      return { pts: g.correct, max: g.total, all: g.allCorrect, partial: g.correct > 0 && !g.allCorrect };
    }
    const ok = NP.gradeMC(q, ans);
    return { pts: ok ? 1 : 0, max: 1, all: ok, partial: false };
  };
  NP.isAnsweredAny = function (q, ans) {
    return NP.isPBQ(q) ? NP.pbq.isAnswered(q, ans) : NP.isAnsweredMC(q, ans);
  };

  /* ============ assembly ============ */

  function domainTargets(total) {
    // largest-remainder apportionment of the official weights
    const w = NP.DOMAIN_WEIGHTS, doms = [1, 2, 3, 4, 5];
    const exact = doms.map(d => total * w[d] / 100);
    const base = exact.map(Math.floor);
    let left = total - base.reduce((a, b) => a + b, 0);
    const order = doms.map((d, i) => [exact[i] - base[i], i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; k < left; k++) base[order[k][1]]++;
    const out = {};
    doms.forEach((d, i) => { out[d] = base[i]; });
    return out;
  }

  function draw(pool, n, avoid) {
    const fresh = [], stale = [];
    NP.shuffle(pool).forEach(x => (avoid.has(x.id) ? stale : fresh).push(x));
    return fresh.concat(stale).slice(0, n);
  }

  function buildExamItems() {
    const B = window.NETBANK;
    const avoid = new Set(NP.store.data.recent || []);
    const targets = domainTargets(TOTAL_Q);

    // PBQs first (variety across domains)
    const pbqs = draw(B.pbqs || [], PBQ_COUNT, avoid);
    pbqs.forEach(p => { if (targets[p.domain] > 0) targets[p.domain]--; });

    // MC per domain
    let mc = [];
    for (const d of [1, 2, 3, 4, 5]) {
      const pool = (B.mc || []).filter(q => q.domain === d);
      mc = mc.concat(draw(pool, targets[d], avoid));
    }
    // top up if any domain pool ran short
    if (mc.length + pbqs.length < TOTAL_Q) {
      const have = new Set(mc.map(q => q.id));
      const extra = draw((B.mc || []).filter(q => !have.has(q.id)),
        TOTAL_Q - mc.length - pbqs.length, avoid);
      mc = mc.concat(extra);
    }
    return pbqs.map(q => q.id).concat(NP.shuffle(mc).map(q => q.id)).slice(0, TOTAL_Q);
  }

  /* ============ runtime ============ */

  const E = {};
  NP.exam = E;
  let X = null, ticker = null, stamp = 0;

  function save() { NP.store.data.inprogress = X; NP.store.save(); }
  function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }

  E.startIntro = function (skipGate) {
    if (NP.store.data.inprogress) {
      NP.modal("Exam in progress",
        "<p>You have an unfinished mock. Resume or discard it from the dashboard first.</p>",
        [{ label: "Go to dashboard", action: () => NP.show(NP.screens.home) }],
        { intent: "warning" });
      return;
    }
    // The mock is the finish line of the course. Gate it, but let a determined
    // user through - some people want a cold diagnostic first.
    if (!skipGate && NP.course && !NP.course.courseComplete()) {
      const pct = NP.course.percentComplete();
      NP.modal("The mock exam is the finish line",
        `<p>The study course is <strong>${pct}% complete</strong>. It's built to take you from
         first principles to exam-ready, and the mock is designed as the test you sit
         <em>after</em> finishing it.</p>
         <p>You can still take the mock now as a cold diagnostic, just expect a low score if
         you haven't worked through the material yet.</p>`,
        [
          { label: "Go to the course", action: () => NP.show(NP.screens.course) },
          { label: "Take the mock anyway", secondary: true, action: () => E.startIntro(true) }
        ],
        { intent: "info" });
      return;
    }

    NP.show(root => {
      const el = NP.el;
      root.appendChild(el("div", { class: "examhead" },
        el("div", { class: "etitle" }, "CompTIA Network+ N10-009, Practice Exam"),
        el("span", { class: "enote" }, "not started")));

      const { stage, inner } = NP.stage();
      root.appendChild(stage);

      inner.appendChild(el("h1", { class: "screen-title" }, "Before you begin"));
      inner.appendChild(el("p", { class: "screen-sub" },
        "Read the rules. The exam is a serious, timed simulation, treat it like test day."));

      const rules = el("div", { class: "rules" });
      const rule = (key, html) => rules.appendChild(el("div", { class: "rule" },
        el("span", { class: "key" }, key),
        el("span", { class: "txt", html })));
      rule("75 · 90m", "<strong>75 questions in 90 minutes.</strong> Performance-based questions first, then multiple-choice, weighted by the official domain percentages.");
      rule("NAV", "Move freely with Previous / Next, <strong>flag any question</strong> for review, and use the Review Screen to see what's answered, flagged, or incomplete.");
      rule("PBQ", "PBQs award <strong>partial credit</strong> per completed item, always fill every field. No calculator, like the real exam.");
      rule("720", "Scored on the 100–900 scale; <strong>720 is passing</strong>. No penalty for guessing.");
      rule("CLOCK", "The clock pauses only if you close the app mid-exam; it runs while the exam is open.");
      inner.appendChild(rules);

      const row = el("div", { class: "btnrow" });
      row.appendChild(el("button", {
        class: "btn exam", style: "flex:1", onclick: () => {
          X = {
            startedAt: Date.now(),
            items: buildExamItems(),
            answers: [], flagged: [], seen: [], time: [],
            remaining: DURATION, cur: 0
          };
          X.answers = new Array(X.items.length).fill(null);
          X.flagged = new Array(X.items.length).fill(false);
          X.seen = new Array(X.items.length).fill(false);
          X.time = new Array(X.items.length).fill(0);
          save();
          runExam();
        }
      }, "Begin exam"));
      row.appendChild(el("button", {
        class: "btn secondary", onclick: () => NP.show(NP.screens.home)
      }, "Not yet"));
      inner.appendChild(row);
    });
  };

  E.resume = function () {
    X = NP.store.data.inprogress;
    if (!X) { NP.show(NP.screens.home); return; }
    runExam();
  };

  function runExam() {
    stopTicker();
    const endsAt = Date.now() + X.remaining * 1000;
    let onReview = false;
    let revFilter = "all";

    NP.show(root => {
      const el = NP.el;

      /* ---- header ---- */
      const timerEl = el("div", { class: "val" }, "");
      const timerLbl = el("span", { class: "lbl" }, "Time Remaining");
      const counterEl = el("div", { class: "val" }, "");
      const noteEl = el("div", { class: "enote" }, "Do not close the window");

      root.appendChild(el("div", { class: "examhead" },
        el("div", { class: "brand" },
          el("div", { class: "etitle" }, "Network+ N10-009, Practice Exam"), noteEl),
        el("div", { class: "readouts" },
          el("div", { class: "ro" }, timerLbl, timerEl),
          el("div", { class: "ro q" }, el("span", { class: "lbl" }, "Question"), counterEl))));

      const hair = NP.hairline(0);
      root.appendChild(hair);
      const hairFill = hair.firstChild;

      /* Live region for the 5-minute warning. Announced, not just colored. */
      const low = el("div", { class: "lowtime hidden", role: "status", "aria-live": "polite" });
      const lowText = el("span", null, "");
      low.appendChild(NP.icon("clock", 17));
      low.appendChild(lowText);
      root.appendChild(low);
      let lowShown = false;

      const { stage, inner } = NP.stage();
      root.appendChild(stage);

      /* ---- footer (fixed height, never reflows as questions change) ---- */
      const prevBtn = el("button", { class: "fbtn", onclick: () => move(X.cur - 1) },
        NP.icon("chevL", 15), "Previous");
      const nextBtn = el("button", {
        class: "fbtn primary", onclick: () => {
          if (X.cur < X.items.length - 1) move(X.cur + 1);
          else { commitTime(); onReview = true; paint(); }
        }
      }, "Next", NP.icon("chevR", 15));
      const revBtn = el("button", {
        class: "fbtn", onclick: () => { commitTime(); onReview = true; paint(); }
      }, "Review Screen");
      const endBtn = el("button", { class: "fbtn danger", onclick: confirmEnd }, "End Exam");

      const backBtn = el("button", {
        class: "fbtn hidden", onclick: () => { onReview = false; paint(); }
      }, NP.icon("chevL", 15), "Return to exam");
      const scoreBtn = el("button", {
        class: "fbtn danger-solid hidden", onclick: confirmEnd
      }, "End exam & score");

      const leftGrp = el("div", { class: "grp" }, revBtn, endBtn, backBtn);
      const rightGrp = el("div", { class: "grp" }, prevBtn, nextBtn, scoreBtn);
      root.appendChild(el("div", { class: "examfoot" }, leftGrp, rightGrp));

      function commitTime() {
        const now = Date.now();
        if (stamp && !onReview) X.time[X.cur] += Math.round((now - stamp) / 1000);
        stamp = now;
      }

      function move(j) {
        if (j < 0 || j >= X.items.length) return;
        commitTime();
        X.cur = j;
        onReview = false;
        paint();
        save();
      }

      function incompleteCount() {
        return X.items.filter((id, j) => !NP.isAnsweredAny(NP.byId[id], X.answers[j])).length;
      }

      function setFooter(review) {
        [revBtn, endBtn, prevBtn, nextBtn].forEach(b => b.classList.toggle("hidden", review));
        [backBtn, scoreBtn].forEach(b => b.classList.toggle("hidden", !review));
      }

      function paint() {
        inner.innerHTML = "";
        setFooter(onReview);
        if (onReview) { paintReview(); return; }

        const i = X.cur;
        X.seen[i] = true;
        counterEl.textContent = `${i + 1} / ${X.items.length}`;
        prevBtn.disabled = i === 0;
        nextBtn.textContent = "";
        nextBtn.appendChild(document.createTextNode(i === X.items.length - 1 ? "Review" : "Next"));
        nextBtn.appendChild(NP.icon("chevR", 15));
        hairFill.style.width = (100 * (i + 1) / X.items.length) + "%";

        const q = NP.byId[X.items[i]];
        if (!q) { inner.textContent = "Question unavailable."; return; }
        noteEl.textContent = NP.isPBQ(q) ? "Performance-based question" : "Do not close the window";

        /* flag row */
        const flagBtn = el("button", {
          class: "flagbtn" + (X.flagged[i] ? " on" : ""),
          type: "button",
          "aria-pressed": X.flagged[i] ? "true" : "false",
          onclick: () => {
            X.flagged[i] = !X.flagged[i];
            flagBtn.classList.toggle("on", X.flagged[i]);
            flagBtn.setAttribute("aria-pressed", X.flagged[i] ? "true" : "false");
            flagLabel.textContent = X.flagged[i] ? "Flagged for review" : "Flag for review";
            save();
          }
        });
        const flagBox = el("span", { class: "box" }, NP.icon("check", 12, 3.5));
        const flagLabel = el("span", null, X.flagged[i] ? "Flagged for review" : "Flag for review");
        flagBtn.appendChild(flagBox);
        flagBtn.appendChild(flagLabel);
        inner.appendChild(el("div", { class: "flagrow" }, flagBtn,
          el("span", { class: "qnum" }, `Question ${i + 1} of ${X.items.length}`)));

        const getAns = () => X.answers[i];
        const setAns = v => { X.answers[i] = v; save(); };

        if (NP.isPBQ(q)) NP.pbq.render(inner, q, getAns, setAns, {});
        else NP.renderMC(inner, q, getAns, setAns, {});

        stamp = Date.now();
        stage.scrollTop = 0;
      }

      function paintReview() {
        counterEl.textContent = "Review";
        hairFill.style.width = "100%";

        const answered = X.items.length - incompleteCount();
        const flagged = X.flagged.filter(Boolean).length;
        const incomplete = incompleteCount();

        inner.appendChild(el("h1", { class: "screen-title" }, "Review Screen"));
        inner.appendChild(el("p", { class: "rev-sum", html:
          `<b class="good">${answered} answered</b> · <b class="bad">${incomplete} incomplete</b> · ` +
          `<b class="amber">${flagged} flagged</b>. Click a question to jump to it.` }));

        const filters = el("div", { class: "rev-filters" });
        const mk = (k, label, count, cls, icon) => {
          const b = el("button", {
            class: (revFilter === k ? "on " : "") + (cls || ""),
            onclick: () => { revFilter = k; paint(); }
          });
          if (icon) b.appendChild(NP.icon(icon, 13));
          b.appendChild(document.createTextNode(`${label} · ${count}`));
          filters.appendChild(b);
        };
        mk("all", "All", X.items.length, "");
        mk("flagged", "Flagged", flagged, "flag", "flag");
        mk("incomplete", "Incomplete", incomplete, "inc");
        inner.appendChild(filters);

        const grid = el("div", { class: "rev-grid" });
        let shown = 0;
        X.items.forEach((id, j) => {
          const q = NP.byId[id];
          const ok = NP.isAnsweredAny(q, X.answers[j]);
          const partial = NP.isPBQ(q) && !ok && NP.pbq.isPartial(q, X.answers[j]);
          if (revFilter === "flagged" && !X.flagged[j]) return;
          if (revFilter === "incomplete" && ok) return;
          shown++;

          const state = ok ? "answered" : partial ? "partial" : X.seen[j] ? "incomplete" : "notseen";
          const cell = el("button", {
            class: "rev-cell " + state + (X.flagged[j] ? " flagged" : ""),
            onclick: () => move(j)
          });
          const qn = el("div", { class: "qn" }, "Q" + (j + 1));
          if (X.flagged[j]) qn.appendChild(el("span", { class: "fl" }, NP.icon("flag", 12)));
          cell.appendChild(qn);

          const st = el("div", { class: "st" });
          if (ok) { st.appendChild(NP.icon("check", 11, 3)); st.appendChild(document.createTextNode("Answered")); }
          else if (partial) { st.appendChild(NP.icon("partial", 11)); st.appendChild(document.createTextNode("Partially complete")); }
          else if (X.seen[j]) { st.appendChild(NP.icon("x", 11, 2.6)); st.appendChild(document.createTextNode("Incomplete")); }
          else { st.appendChild(document.createTextNode("Not seen")); }
          cell.appendChild(st);
          grid.appendChild(cell);
        });
        inner.appendChild(grid);
        if (!shown) {
          inner.appendChild(el("p", { class: "sheetnote", style: "text-align:center;padding:20px" },
            "Nothing matches this filter."));
        }
        stage.scrollTop = 0;
      }

      function confirmEnd() {
        const unanswered = incompleteCount();
        NP.modal("End exam?",
          "<p>Once you end the exam it will be scored and you cannot return.</p>" +
          (unanswered
            ? `<p><strong>${unanswered}</strong> question${unanswered === 1 ? " is" : "s are"} incomplete, ` +
              "they score as incorrect (PBQs keep partial credit).</p>"
            : ""),
          [
            { label: "End exam & score", danger: true, action: () => { stopTicker(); commitTime(); finalize(); } },
            { label: "Return", secondary: true }
          ],
          { intent: "danger" });
      }

      function tick() {
        const remain = Math.max(0, (endsAt - Date.now()) / 1000);
        X.remaining = remain;
        timerEl.textContent = NP.fmtTime(remain);

        const isLow = remain <= LOW_TIME && remain > 0;
        timerEl.classList.toggle("timer-low", isLow);
        timerLbl.classList.toggle("timer-low-lbl", isLow);

        if (isLow) {
          const inc = incompleteCount();
          const msg = `5 minutes remaining. ${inc} ${inc === 1 ? "question is" : "questions are"} ` +
            "still incomplete, the exam will auto-submit at 0:00.";
          if (!lowShown) { low.classList.remove("hidden"); lowShown = true; }
          if (lowText.textContent !== msg) lowText.textContent = msg;
        }

        if (remain <= 0) {
          stopTicker();
          commitTime();
          NP.modal("Time expired",
            "<p>Your 90 minutes are up. The exam will now be scored, everything you've answered " +
            "counts, including partial PBQ credit.</p>",
            [{ label: "See results", action: finalize }],
            { intent: "warning" });
        }
      }
      ticker = setInterval(() => { tick(); if (Math.floor(X.remaining) % 10 === 0) save(); }, 500);
      tick();

      paint();
      stamp = Date.now();
    });
  }

  /* ============ finalize ============ */

  function finalize() {
    stopTicker();
    let pts = 0, max = 0;
    const domains = { 1: { pts: 0, max: 0 }, 2: { pts: 0, max: 0 }, 3: { pts: 0, max: 0 }, 4: { pts: 0, max: 0 }, 5: { pts: 0, max: 0 } };
    const detail = X.items.map((id, j) => {
      const q = NP.byId[id];
      const g = NP.gradePoints(q, X.answers[j]);
      pts += g.pts; max += g.max;
      domains[q.domain].pts += g.pts;
      domains[q.domain].max += g.max;
      return { qid: id, ans: X.answers[j], pts: g.pts, max: g.max, all: g.all, partial: g.partial, time: X.time[j] || 0 };
    });

    const s = NP.scoreAttempt(pts, max);
    const attempt = {
      date: Date.now(),
      scaled: s.scaled, pass: s.pass, pct: s.pct,
      points: pts, maxPoints: max,
      timeUsed: DURATION - Math.round(X.remaining),
      domains, detail
    };

    const D = NP.store.data;
    D.attempts.push(attempt);
    detail.forEach(d => { if (!d.all && !D.missed.includes(d.qid)) D.missed.push(d.qid); });
    D.recent = (D.recent || []).concat(X.items).slice(-160);
    D.inprogress = null;
    NP.store.save();
    X = null;
    NP.results.show(D.attempts.length - 1);
  }
})();
