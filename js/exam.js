/* Exam engine: assembly (domain-weighted), timer, flag/review navigation,
   MC rendering, grading, autosave, finalization. */
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};
  NP.screens = NP.screens || {};

  const TOTAL_Q = 75;
  const PBQ_COUNT = 4;
  const DURATION = 90 * 60;
  const LETTERS = ["A", "B", "C", "D", "E", "F"];

  /* ============ shared MC rendering / grading ============ */

  NP.isPBQ = q => Array.isArray(q.items);

  NP.renderMC = function (container, q, getAns, setAns, opts) {
    opts = opts || {};
    const el = NP.el;
    const ro = opts.review || opts.disabled;
    const multi = Array.isArray(q.answer);
    const maxSel = multi ? q.answer.length : 1;

    container.appendChild(el("div", { class: "qtext", html: q.text }));
    const box = el("div", { class: "choices" });
    q.choices.forEach((c, i) => {
      const btn = el("button", { class: "choice" + (multi ? " multi" : ""), onclick: () => {
        if (ro) return;
        if (multi) {
          let a = Array.isArray(getAns()) ? getAns().slice() : [];
          if (a.includes(i)) a = a.filter(x => x !== i);
          else { if (a.length >= maxSel) return; a.push(i); }
          setAns(a.length ? a : null);
        } else {
          setAns(getAns() === i ? null : i);
        }
        box.querySelectorAll(".choice").forEach((b, j) => {
          const sel = multi ? (Array.isArray(getAns()) && getAns().includes(j)) : getAns() === j;
          b.classList.toggle("selected", sel);
        });
      } },
        el("span", { class: "letter" }, LETTERS[i]),
        el("span", { html: c }));
      const sel = multi ? (Array.isArray(getAns()) && getAns().includes(i)) : getAns() === i;
      btn.classList.toggle("selected", sel);
      if (opts.review) {
        const corr = multi ? q.answer : [q.answer];
        const ansArr = getAns() == null ? [] : (Array.isArray(getAns()) ? getAns() : [getAns()]);
        if (corr.includes(i)) btn.classList.add("correct");
        if (ansArr.includes(i) && !corr.includes(i)) btn.classList.add("wrongpick");
      }
      box.appendChild(btn);
    });
    container.appendChild(box);
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
      NP.modal("Exam in progress", "<p>You have an unfinished mock. Resume or discard it from the home screen first.</p>");
      return;
    }
    // The mock is the finish line of the course. Gate it, but let a determined
    // user through — some people want a cold diagnostic first.
    if (!skipGate && NP.course && !NP.course.courseComplete()) {
      const pct = NP.course.percentComplete();
      NP.modal("The mock exam is the finish line",
        `<p>The study course is <strong>${pct}% complete</strong>. It's built to take you from
         first principles to exam-ready, and the mock is designed as the test you sit
         <em>after</em> finishing it.</p>
         <p>You can still take the mock now as a cold diagnostic — just expect a low score if
         you haven't worked through the material yet.</p>`,
        [
          { label: "Go to the course", action: () => NP.show(NP.screens.course) },
          { label: "Take the mock anyway", secondary: true, action: () => E.startIntro(true) }
        ]);
      return;
    }
    NP.show(root => {
      const { bar, stage, inner } = NP.chrome("Full mock exam");
      root.appendChild(bar); root.appendChild(stage);
      inner.appendChild(NP.el("h1", { class: "screen-title" }, "Before you begin"));
      const card = NP.el("div", { class: "card" });
      card.innerHTML = `
        <h3>CompTIA Network+ N10-009 practice exam</h3>
        <ul>
          <li><strong>75 questions · 90 minutes</strong> — performance-based questions (PBQs) first, then multiple-choice, weighted by the official domain percentages.</li>
          <li>You can move freely: <strong>Previous / Next</strong>, <strong>Flag for review</strong> on any question, and a <strong>Review Screen</strong> showing what's answered, flagged, or incomplete.</li>
          <li>PBQs award <strong>partial credit</strong> per completed item — always fill every field.</li>
          <li>No calculator, like the real exam — keep scratch paper handy for subnetting.</li>
          <li>Scoring is on CompTIA's 100–900 scale; <strong>720 is passing</strong>. There's no penalty for guessing.</li>
          <li>The clock pauses only if you close the app mid-exam; it runs while the exam is open.</li>
        </ul>`;
      inner.appendChild(card);
      const row = NP.el("div", { class: "btnrow" });
      row.appendChild(NP.el("button", { class: "bigbtn", onclick: () => {
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
      } }, "Begin exam"));
      row.appendChild(NP.el("button", { class: "bigbtn secondary", onclick: () => NP.show(NP.screens.home) }, "Not yet"));
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

      /* header */
      const timerEl = el("strong", null, "");
      const counterEl = el("strong", null, "");
      root.appendChild(el("div", { class: "topbar" },
        el("div", { class: "brand" }, "CompTIA Network+ (N10-009) — Practice Exam",
          el("small", null, "Candidate: You · Do not close the window")),
        el("div", { class: "meta" },
          el("span", null, el("span", { class: "lbl" }, "Time Remaining"), timerEl),
          el("span", null, el("span", { class: "lbl" }, "Question"), counterEl))));

      const stage = el("div", { class: "stage" });
      const inner = el("div", { class: "stage-inner" });
      stage.appendChild(inner);
      root.appendChild(stage);

      /* footer */
      const prevBtn = el("button", { class: "fbtn", onclick: () => move(X.cur - 1) }, "◀ Previous");
      const nextBtn = el("button", { class: "fbtn primary", onclick: () => {
        if (X.cur < X.items.length - 1) move(X.cur + 1);
        else { onReview = true; paint(); }
      } }, "Next ▶");
      const revBtn = el("button", { class: "fbtn", onclick: () => { commitTime(); onReview = !onReview; paint(); } }, "Review Screen");
      const endBtn = el("button", { class: "fbtn danger", onclick: confirmEnd }, "End Exam");
      root.appendChild(el("div", { class: "examfoot" },
        el("div", { class: "grp" }, revBtn, endBtn),
        el("div", { class: "grp" }, prevBtn, nextBtn)));

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

      function paint() {
        inner.innerHTML = "";
        if (onReview) { paintReview(); return; }
        const i = X.cur;
        X.seen[i] = true;
        counterEl.textContent = `${i + 1} of ${X.items.length}`;
        prevBtn.disabled = i === 0;
        nextBtn.textContent = i === X.items.length - 1 ? "Review ▶" : "Next ▶";

        const q = NP.byId[X.items[i]];
        if (!q) { inner.textContent = "Question unavailable."; return; }

        const flag = el("div", { class: "flagrow" });
        const cb = el("input", { type: "checkbox", id: "flagcb", onchange: e => {
          X.flagged[i] = e.target.checked; save();
        } });
        cb.checked = !!X.flagged[i];
        flag.appendChild(cb);
        flag.appendChild(el("label", { for: "flagcb" }, "Flag for review"));
        flag.appendChild(el("span", { class: "qnum" }, `Question ${i + 1} of ${X.items.length}`));
        inner.appendChild(flag);

        const getAns = () => X.answers[i];
        const setAns = v => { X.answers[i] = v; save(); };

        if (NP.isPBQ(q)) NP.pbq.render(inner, q, getAns, setAns, {});
        else {
          if (Array.isArray(q.answer)) {
            inner.appendChild(el("p", { class: "pbq-note" }, `Select ${q.answer.length === 2 ? "TWO" : q.answer.length} answers.`));
          }
          NP.renderMC(inner, q, getAns, setAns, {});
        }
        stamp = Date.now();
        stage.scrollTop = 0;
      }

      function paintReview() {
        counterEl.textContent = "Review";
        const box = el("div");
        box.appendChild(el("h2", { class: "screen-title" }, "Review Screen"));
        const unanswered = X.items.filter((id, j) => !NP.isAnsweredAny(NP.byId[id], X.answers[j])).length;
        box.appendChild(el("p", { class: "screen-sub" },
          `${X.items.length - unanswered} answered · ${unanswered} incomplete · ${X.flagged.filter(Boolean).length} flagged. Click a question to jump to it.`));

        const filters = el("div", { class: "rev-filters" });
        [["all", "All"], ["flagged", "Flagged"], ["incomplete", "Incomplete"]].forEach(([k, lbl]) => {
          filters.appendChild(el("button", { class: revFilter === k ? "on" : "", onclick: () => { revFilter = k; paint(); } }, lbl));
        });
        box.appendChild(filters);

        const grid = el("div", { class: "rev-grid" });
        X.items.forEach((id, j) => {
          const q = NP.byId[id];
          const answered = NP.isAnsweredAny(q, X.answers[j]);
          const partial = NP.isPBQ(q) && !answered && NP.pbq.isPartial(q, X.answers[j]);
          if (revFilter === "flagged" && !X.flagged[j]) return;
          if (revFilter === "incomplete" && answered) return;
          const cell = el("button", { class: "rev-cell " + (answered ? "answered" : "incomplete"), onclick: () => move(j) },
            el("span", null, `Question ${j + 1} `, X.flagged[j] ? el("span", { class: "fl" }, "⚑") : null),
            el("span", { class: "st" },
              answered ? "Answered" : partial ? "Partially complete" : (X.seen[j] ? "Incomplete" : "Not seen")));
          grid.appendChild(cell);
        });
        box.appendChild(grid);
        const row = el("div", { class: "btnrow" });
        row.appendChild(el("button", { class: "bigbtn", onclick: () => { onReview = false; paint(); } }, "Return to exam"));
        row.appendChild(el("button", { class: "bigbtn secondary", onclick: confirmEnd }, "End exam & score"));
        box.appendChild(row);
        inner.appendChild(box);
      }

      function confirmEnd() {
        const unanswered = X.items.filter((id, j) => !NP.isAnsweredAny(NP.byId[id], X.answers[j])).length;
        NP.modal("End exam?",
          `<p>Once you end the exam it will be scored and you cannot return.</p>` +
          (unanswered ? `<p><strong>${unanswered}</strong> question${unanswered === 1 ? " is" : "s are"} incomplete — they score as incorrect (PBQs keep partial credit).</p>` : ""),
          [
            { label: "End exam", action: () => { stopTicker(); commitTime(); finalize(); } },
            { label: "Return", secondary: true }
          ]);
      }

      function tick() {
        const remain = Math.max(0, (endsAt - Date.now()) / 1000);
        X.remaining = remain;
        timerEl.textContent = NP.fmtTime(remain);
        timerEl.classList.toggle("timer-low", remain <= 300 && remain > 0);
        if (remain <= 0) {
          stopTicker();
          commitTime();
          NP.modal("Time expired", "<p>Your 90 minutes are up. The exam will now be scored.</p>",
            [{ label: "See results", action: finalize }]);
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
