/* Results: pass/fail report, domain breakdown, review, trend. */
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};
  const R = {};
  NP.results = R;

  R.show = function (i) { NP.show(root => paint(root, i, true)); };
  R.showSaved = function (i) { NP.show(root => paint(root, i, false)); };

  function paint(root, idx, fresh) {
    const el = NP.el;
    const a = NP.store.data.attempts[idx];
    const { bar, stage, inner } = NP.chrome("Score Report");
    root.appendChild(bar); root.appendChild(stage);

    inner.appendChild(el("h1", { class: "screen-title" },
      fresh ? "Exam complete — your results" : `Score report — attempt ${idx + 1}`));
    inner.appendChild(el("p", { class: "screen-sub" },
      new Date(a.date).toLocaleString() + " · Scaled score is an estimate (CompTIA does not publish its conversion)."));

    const banner = el("div", { class: "passbanner " + (a.pass ? "pass" : "fail") },
      el("div", null,
        el("div", { class: "big" }, a.pass ? "PASS" : "FAIL"),
        el("div", { class: "sub" }, a.pass
          ? "Score at or above the 720 passing standard."
          : "Below the 720 passing standard — the domain breakdown below shows where to focus.")),
      el("div", { style: "text-align:right" },
        el("div", { class: "big" }, String(a.scaled)),
        el("div", { class: "sub" }, "scale 100–900 · pass 720")));
    inner.appendChild(banner);

    const cards = el("div", { class: "score-cards" });
    const card = (l, v, p) => cards.appendChild(el("div", { class: "score-card" },
      el("div", { class: "lbl" }, l), el("div", { class: "val" }, String(v)), el("div", { class: "pct" }, p)));
    card("Points", `${a.points}/${a.maxPoints}`, `${a.pct}% of available points`);
    card("Time used", NP.fmtTime(a.timeUsed), "of 90:00");
    card("Questions", String(a.detail.length), `${a.detail.filter(d => d.all).length} fully correct`);
    inner.appendChild(cards);

    /* domain bars */
    const dom = el("div", { class: "card" });
    dom.appendChild(el("h3", null, "Performance by domain"));
    for (const d of [1, 2, 3, 4, 5]) {
      const st = a.domains[d];
      if (!st || !st.max) continue;
      const pct = Math.round(100 * st.pts / st.max);
      dom.appendChild(el("div", { class: "tbar-row" },
        el("div", null, `${NP.DOMAINS[d]} (${NP.DOMAIN_WEIGHTS[d]}% of exam)`),
        el("div", { class: "tbar-track" }, el("div", { class: "tbar-fill", style: `width:${pct}%` })),
        el("div", null, `${st.pts}/${st.max} (${pct}%)`)));
    }
    inner.appendChild(dom);

    /* pacing */
    const slow = a.detail.filter(d => d.time > 150).length;
    const pace = el("div", { class: "card" });
    pace.appendChild(el("h3", null, "Pacing"));
    pace.appendChild(el("p", null,
      `Average ${Math.round(a.timeUsed / a.detail.length)}s per question.` +
      (slow ? ` ${slow} question${slow > 1 ? "s" : ""} took over 2:30 — flagged “slow” in the review below.` : " No questions took over 2:30.") +
      " Budget: ~65 seconds per MC leaves ~10 minutes for PBQs and review."));
    inner.appendChild(pace);

    /* review */
    inner.appendChild(el("h2", { class: "screen-title", style: "margin-top:28px;font-size:20px" }, "Question-by-question review"));
    a.detail.forEach((d, j) => inner.appendChild(reviewItem(d, j)));

    const row = el("div", { class: "btnrow" });
    row.appendChild(el("button", { class: "bigbtn", onclick: () => NP.show(NP.screens.home) }, "Home"));
    row.appendChild(el("button", { class: "bigbtn secondary", onclick: () => NP.show(NP.screens.missed) }, "Drill missed questions"));
    inner.appendChild(row);
  }

  function reviewItem(d, j) {
    const el = NP.el;
    const q = NP.byId[d.qid];
    const box = el("div", { class: "rev-item" });
    if (!q) { box.textContent = "Question no longer in bank."; return box; }
    const verdict = d.all ? el("span", { class: "ok" }, "✔ Correct")
      : d.partial ? el("span", { class: "part" }, `◐ Partial ${d.pts}/${d.max}`)
      : el("span", { class: "no" }, "✘ Incorrect");
    box.appendChild(el("div", { class: "rhead" },
      el("strong", null, `Question ${j + 1}`),
      el("span", { class: "pill" }, NP.isPBQ(q) ? "PBQ" : (Array.isArray(q.answer) ? "Multi-select" : "Multiple choice")),
      el("span", { class: "pill" }, NP.DOMAINS[q.domain]),
      el("span", { class: "pill" }, q.diff),
      verdict,
      el("span", null, `⏱ ${NP.fmtTime(d.time)}${d.time > 150 ? " — slow" : ""}`)));

    if (NP.isPBQ(q)) NP.pbq.render(box, q, () => d.ans, () => {}, { review: true });
    else NP.renderMC(box, q, () => d.ans, () => {}, { review: true });

    const ex = el("div", { class: "expl" });
    ex.innerHTML = "<strong>Explanation.</strong> " + q.expl +
      (q.tip ? `<div class="tip"><strong>Exam tip:</strong> ${q.tip}</div>` : "");
    box.appendChild(ex);
    return box;
  }

  /* trend chart across attempts (scaled score vs pass line) */
  R.trendChart = function (attempts) {
    const el = NP.el;
    const box = el("div", { class: "card trend" });
    box.appendChild(el("h3", null, "Score trend"));
    if (attempts.length < 2) {
      box.appendChild(el("p", { style: "color:#5b6572;font-size:14px" },
        attempts.length === 1
          ? `First attempt: ${attempts[0].scaled}/900 (${attempts[0].pass ? "pass" : "fail"}). Take another mock to see a trend.`
          : "Take at least two mocks to see a trend."));
      return box;
    }
    const sv = (t, at, tx) => {
      const n = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (const k in at) n.setAttribute(k, at[k]);
      if (tx != null) n.textContent = tx;
      return n;
    };
    const W = 640, H = 240, L = 46, Rm = 60, T = 16, B = 30;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const lo = 100, hi = 900;
    const pw = W - L - Rm, ph = H - T - B;
    const xAt = i => L + pw * i / (attempts.length - 1);
    const yAt = v => T + ph - ph * (v - lo) / (hi - lo);
    for (let v = 100; v <= 900; v += 200) {
      svg.appendChild(sv("line", { x1: L, y1: yAt(v), x2: W - Rm, y2: yAt(v), stroke: "#e3e7ec", "stroke-width": 1 }));
      svg.appendChild(sv("text", { x: L - 8, y: yAt(v) + 4, "text-anchor": "end", "font-size": 11, fill: "#5b6572" }, String(v)));
    }
    // pass line at 720
    svg.appendChild(sv("line", { x1: L, y1: yAt(720), x2: W - Rm, y2: yAt(720), stroke: "#1d7a3e", "stroke-width": 1.5, "stroke-dasharray": "6,4" }));
    svg.appendChild(sv("text", { x: W - Rm + 6, y: yAt(720) + 4, "font-size": 11.5, fill: "#1d7a3e", "font-weight": "bold" }, "pass 720"));
    attempts.forEach((a, i) => {
      svg.appendChild(sv("text", { x: xAt(i), y: H - 8, "text-anchor": "middle", "font-size": 11, fill: "#5b6572" }, String(i + 1)));
    });
    const vals = attempts.map(a => a.scaled);
    svg.appendChild(sv("polyline", { points: vals.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" "), fill: "none", stroke: "#2456a6", "stroke-width": 2 }));
    vals.forEach((v, i) => svg.appendChild(sv("circle", { cx: xAt(i), cy: yAt(v), r: 4, fill: attempts[i].pass ? "#1d7a3e" : "#b02a2a", stroke: "#fff", "stroke-width": 2 })));
    box.appendChild(svg);
    box.appendChild(el("p", { style: "font-size:12px;color:#5b6572;margin:4px 0 0" },
      "Attempt → scaled score. Green dots passed; red dots didn't."));
    return box;
  };
})();
