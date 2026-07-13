/* Results: pass/fail report, domain breakdown, review, trend. */
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};
  const R = {};
  NP.results = R;

  const LAG = 75; // a domain below this is called out as the weak one

  R.show = function (i) { NP.show(root => paint(root, i, true)); };
  R.showSaved = function (i) { NP.show(root => paint(root, i, false)); };

  function paint(root, idx, fresh) {
    const el = NP.el;
    const a = NP.store.data.attempts[idx];

    root.appendChild(NP.crumb(
      [["Dashboard", () => NP.show(NP.screens.home)], "Score Report"],
      `attempt ${idx + 1} · ${new Date(a.date).toLocaleString()}`));
    const { stage, inner } = NP.stage();
    root.appendChild(stage);

    inner.appendChild(el("h1", { class: "screen-title" },
      fresh ? "Exam complete, your results" : `Score report, attempt ${idx + 1}`));
    inner.appendChild(el("p", { class: "screen-sub" },
      "Scaled score is an estimate (CompTIA does not publish its conversion)."));

    /* ---- headline banner ---- */
    const banner = el("div", { class: "banner " + (a.pass ? "pass" : "fail") });
    banner.appendChild(el("div", { class: "left" },
      el("span", { class: "tile" }, NP.icon(a.pass ? "check" : "x", 32, a.pass ? 2.5 : 2.6)),
      el("div", null,
        el("div", { class: "word" }, a.pass ? "PASS" : "FAIL"),
        el("div", { class: "ctx" }, a.pass
          ? "At or above the 720 passing standard."
          : "Below the 720 passing standard."))));
    banner.appendChild(el("div", { class: "right" },
      el("div", { class: "score" }, String(a.scaled)),
      el("div", { class: "scale" }, "scale 100–900 · pass 720")));
    inner.appendChild(banner);

    /* ---- three score cards ---- */
    const cards = el("div", { class: "score-cards" });
    const card = (l, v, p) => cards.appendChild(el("div", { class: "score-card" },
      el("div", { class: "lbl" }, l),
      el("div", { class: "val" }, String(v)),
      el("div", { class: "pct" }, p)));
    card("Points", `${a.points}/${a.maxPoints}`, `${a.pct}% of available points`);
    card("Time used", NP.fmtTime(a.timeUsed), "of 90:00");
    card("Questions", String(a.detail.length), `${a.detail.filter(d => d.all).length} fully correct`);
    inner.appendChild(cards);

    /* ---- recommended next step: weakest domain, computed from this attempt ---- */
    const scored = [1, 2, 3, 4, 5]
      .filter(d => a.domains[d] && a.domains[d].max)
      .map(d => ({ d, pct: Math.round(100 * a.domains[d].pts / a.domains[d].max) }))
      .sort((x, y) => x.pct - y.pct);

    if (scored.length) {
      const weak = scored[0];
      const short = NP.PASS_SCALED - a.scaled;
      const ns = el("div", { class: "nextstep" });
      ns.appendChild(el("span", { class: "tile" }, NP.icon("target", 20)));
      ns.appendChild(el("div", { class: "txt" },
        el("div", { class: "t1" }, a.pass
          ? "Recommended next step"
          : `You were ${short} point${short === 1 ? "" : "s"} short.`),
        el("div", { class: "t2" },
          `${NP.DOMAINS[weak.d]} is your lowest at ${weak.pct}%. ` +
          "Drill it in Tutor mode before your next mock.")));
      ns.appendChild(el("button", {
        class: "btn accent", onclick: () => NP.tutor.practiceDomain(weak.d)
      }, "Practice D" + weak.d));
      inner.appendChild(ns);
    }

    /* ---- domain bars ---- */
    const dom = el("div", { class: "card" });
    dom.appendChild(el("h3", null, "Performance by domain"));
    const bars = el("div", { class: "dbars" });
    for (const d of [1, 2, 3, 4, 5]) {
      const st = a.domains[d];
      if (!st || !st.max) continue;
      const pct = Math.round(100 * st.pts / st.max);
      const lag = pct < LAG;
      const row = el("div", { class: "tbar-row" + (lag ? " lag" : "") });
      row.appendChild(el("span", { class: "nm" },
        NP.DOMAINS[d], " ",
        el("span", { class: "wt" }, NP.DOMAIN_WEIGHTS[d] + "%")));
      const track = el("div", { class: "track" });
      track.appendChild(el("i", { style: `width:${pct}%` }));
      row.appendChild(track);
      row.appendChild(el("span", { class: "dv" }, `${st.pts}/${st.max} · ${pct}%`));
      bars.appendChild(row);
    }
    dom.appendChild(bars);
    inner.appendChild(dom);

    /* ---- pacing ---- */
    const slow = a.detail.filter(d => d.time > 150).length;
    const pace = el("div", { class: "card" });
    pace.appendChild(el("h3", null, "Pacing"));
    pace.appendChild(el("p", null,
      `Average ${Math.round(a.timeUsed / a.detail.length)}s per question.` +
      (slow ? ` ${slow} question${slow > 1 ? "s" : ""} took over 2:30, flagged "slow" in the review below.`
            : " No questions took over 2:30.") +
      " Budget: ~65 seconds per MC leaves ~10 minutes for PBQs and review."));
    inner.appendChild(pace);

    /* ---- trend ---- */
    const at = NP.store.data.attempts;
    if (at.length >= 2) inner.appendChild(R.trendChart(at));

    /* ---- question-by-question ---- */
    inner.appendChild(el("h2", { style: "font-size:19px;margin:26px 0 12px;letter-spacing:-.01em" },
      "Question-by-question review"));
    a.detail.forEach((d, j) => inner.appendChild(reviewItem(d, j)));

    const row = el("div", { class: "btnrow" });
    row.appendChild(el("button", {
      class: "btn", style: "flex:1", onclick: () => NP.show(NP.screens.home)
    }, "Dashboard"));
    row.appendChild(el("button", {
      class: "btn secondary", onclick: () => NP.show(NP.screens.missed)
    }, "Drill missed questions"));
    inner.appendChild(row);
  }

  function reviewItem(d, j) {
    const el = NP.el;
    const q = NP.byId[d.qid];
    const box = el("div", { class: "rev-item" });
    if (!q) { box.textContent = "Question no longer in bank."; return box; }

    const vd = el("span", { class: "vd " + (d.all ? "ok" : d.partial ? "part" : "no") });
    vd.appendChild(NP.icon(d.all ? "check" : d.partial ? "partial" : "x", 14, d.all ? 3 : 2.6));
    vd.appendChild(document.createTextNode(
      d.all ? "Correct" : d.partial ? `Partial ${d.pts}/${d.max}` : "Incorrect"));

    const head = el("div", { class: "rhead" },
      el("span", { class: "qn" }, `Question ${j + 1}`),
      el("span", { class: "pill" },
        NP.isPBQ(q) ? "PBQ" : (Array.isArray(q.answer) ? "Multi-select" : "Multiple choice")),
      el("span", { class: "pill", title: NP.DOMAINS[q.domain] }, "Domain " + q.domain),
      el("span", { class: "pill" }, q.diff),
      vd,
      el("span", { class: "tm" + (d.time > 150 ? " slow" : "") },
        NP.fmtTime(d.time) + (d.time > 150 ? " — slow" : "")));
    box.appendChild(head);

    if (NP.isPBQ(q)) NP.pbq.render(box, q, () => d.ans, () => {}, { review: true });
    else NP.renderMC(box, q, () => d.ans, () => {}, { review: true });

    const ex = el("div", { class: "expl" });
    ex.innerHTML = "<strong>Explanation.</strong> " + q.expl +
      (q.tip ? `<div class="tip"><strong>Exam tip:</strong> ${q.tip}</div>` : "");
    box.appendChild(ex);
    return box;
  }

  /* trend chart across attempts (scaled score vs the 720 pass line) */
  R.trendChart = function (attempts) {
    const el = NP.el;
    const box = el("div", { class: "card trend" });
    box.appendChild(el("h3", null, "Score trend"));

    if (attempts.length < 2) {
      box.appendChild(el("p", { style: "color:var(--muted);font-size:14px;margin:0" },
        attempts.length === 1
          ? `First attempt: ${attempts[0].scaled}/900 (${attempts[0].pass ? "pass" : "fail"}). ` +
            "Take another mock to see a trend."
          : "Take at least two mocks to see a trend."));
      return box;
    }

    const sv = (t, at, tx) => {
      const n = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (const k in at) n.setAttribute(k, at[k]);
      if (tx != null) n.textContent = tx;
      return n;
    };
    const W = 700, H = 240;
    const X0 = 46, X1 = 640, Y900 = 52, Y300 = 211;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Scaled score by attempt, with the 720 pass line");

    const yAt = v => Y900 + (900 - v) * (Y300 - Y900) / (900 - 300);
    const n = attempts.length;
    const xAt = i => n > 1 ? 70 + (630 - 70) * i / (n - 1) : (70 + 630) / 2;

    for (const v of [900, 700, 500, 300]) {
      svg.appendChild(sv("line", { x1: X0, y1: yAt(v), x2: X1, y2: yAt(v), "stroke-width": 1, style: "stroke:var(--chart-trend-grid)" }));
      svg.appendChild(sv("text", {
        x: X0 - 8, y: yAt(v) + 4, "text-anchor": "end",
        "font-size": 11, "font-family": "IBM Plex Mono, monospace", style: "fill:var(--muted)"
      }, String(v)));
    }

    // pass line at 720
    svg.appendChild(sv("line", {
      x1: X0, y1: yAt(720), x2: X1, y2: yAt(720),
      "stroke-width": 1.5, "stroke-dasharray": "6,4", style: "stroke:var(--good)"
    }));
    svg.appendChild(sv("text", {
      x: X1 + 6, y: yAt(720) + 4, "font-size": 11.5,
      "font-family": "IBM Plex Mono, monospace", "font-weight": "700", style: "fill:var(--good)"
    }, "720"));

    const vals = attempts.map(a => a.scaled);
    svg.appendChild(sv("polyline", {
      points: vals.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" "),
      fill: "none", "stroke-width": 2.5, style: "stroke:var(--accent)"
    }));
    vals.forEach((v, i) => {
      svg.appendChild(sv("circle", {
        cx: xAt(i), cy: yAt(v), r: i === n - 1 ? 5.5 : 5,
        "stroke-width": 2, style: `fill:${attempts[i].pass ? "var(--good)" : "var(--bad)"};stroke:var(--paper)`
      }));
      svg.appendChild(sv("text", {
        x: xAt(i), y: H - 8, "text-anchor": "middle", "font-size": 11,
        "font-family": "IBM Plex Mono, monospace", style: "fill:var(--muted)"
      }, String(i + 1)));
    });

    box.appendChild(svg);
    box.appendChild(el("p", { style: "font-size:12px;color:var(--muted);margin:4px 0 0" },
      "Attempt to scaled score. Green dots passed; red dots didn't."));
    return box;
  };
})();
