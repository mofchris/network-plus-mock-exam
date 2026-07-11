/* Tutor mode: untimed practice by domain/difficulty/type with instant feedback,
   PBQ partial-credit feedback, missed-deck drilling. */
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};
  NP.screens = NP.screens || {};
  const T = {};
  NP.tutor = T;

  NP.screens.tutor = function (root) {
    const el = NP.el;
    const { bar, stage, inner } = NP.chrome("Tutor Mode");
    root.appendChild(bar); root.appendChild(stage);
    inner.appendChild(el("h1", { class: "screen-title" }, "Tutor Mode"));
    inner.appendChild(el("p", { class: "screen-sub" },
      "Untimed practice with instant feedback and full explanations. PBQs give per-item feedback."));

    const fWrap = el("div", { class: "card" });
    fWrap.appendChild(el("h3", null, "Practice a set"));
    const filters = el("div", { class: "tutor-filters" });
    const mk = (label, opts) => {
      const s = el("select");
      opts.forEach(([v, t]) => s.appendChild(el("option", { value: v }, t)));
      filters.appendChild(el("label", { style: "font-size:13px;color:#5b6572" }, label + " ", s));
      return s;
    };
    const selDomain = mk("Domain", [["any", "All domains"],
      ["1", "1.0 Concepts"], ["2", "2.0 Implementation"], ["3", "3.0 Operations"],
      ["4", "4.0 Security"], ["5", "5.0 Troubleshooting"]]);
    const selDiff = mk("Difficulty", [["any", "Mixed"], ["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]]);
    const selType = mk("Type", [["any", "All types"], ["mc", "Multiple choice"], ["pbq", "PBQs only"]]);
    const selN = mk("Questions", [["10", "10"], ["5", "5"], ["20", "20"]]);
    fWrap.appendChild(filters);
    const row = el("div", { class: "btnrow" });
    row.appendChild(el("button", { class: "bigbtn", onclick: () => {
      const B = window.NETBANK;
      let ids = [];
      if (selType.value !== "pbq") B.mc.forEach(q => ids.push(q.id));
      if (selType.value !== "mc") B.pbqs.forEach(q => ids.push(q.id));
      ids = ids.filter(id => {
        const q = NP.byId[id];
        if (selDomain.value !== "any" && q.domain !== parseInt(selDomain.value, 10)) return false;
        if (selDiff.value !== "any" && q.diff !== selDiff.value) return false;
        return true;
      });
      if (!ids.length) { NP.modal("No questions", "<p>No questions match those filters.</p>"); return; }
      startSession(NP.shuffle(ids).slice(0, parseInt(selN.value, 10)), { deck: false });
    } }, "Start practice"));
    row.appendChild(el("button", { class: "bigbtn secondary", onclick: () => NP.show(NP.screens.sheets) }, "Study sheets"));
    fWrap.appendChild(row);
    inner.appendChild(fWrap);
  };

  T.startDeck = ids => startSession(NP.shuffle(ids.slice()), { deck: true });

  function startSession(ids, opts) {
    let i = 0, fullCorrect = 0;
    let ans = null, submitted = false;

    NP.show(root => {
      const el = NP.el;
      root.appendChild(el("div", { class: "topbar" },
        el("div", { class: "brand" }, opts.deck ? "Missed Questions Drill" : "Tutor Mode, Practice",
          el("small", null, "Untimed · instant feedback")),
        el("div", { class: "meta" },
          el("button", { class: "tbtn", onclick: () => summary() }, "End session"))));
      const stage = el("div", { class: "stage" });
      const inner = el("div", { class: "stage-inner" });
      stage.appendChild(inner);
      root.appendChild(stage);

      function summary() {
        inner.innerHTML = "";
        inner.appendChild(el("h2", { class: "screen-title" }, "Session summary"));
        inner.appendChild(el("p", { class: "screen-sub" },
          `${fullCorrect} fully correct out of ${i + (submitted ? 1 : 0)} answered` +
          (opts.deck ? ": fully-correct answers left the missed deck." : ".")));
        const row = el("div", { class: "btnrow" });
        row.appendChild(el("button", { class: "bigbtn", onclick: () => NP.show(NP.screens.tutor) }, "Back to Tutor Mode"));
        row.appendChild(el("button", { class: "bigbtn secondary", onclick: () => NP.show(NP.screens.home) }, "Home"));
        inner.appendChild(row);
      }

      function paint() {
        if (i >= ids.length) { summary(); return; }
        ans = null; submitted = false;
        inner.innerHTML = "";
        const q = NP.byId[ids[i]];
        if (!q) { i++; paint(); return; }

        inner.appendChild(el("div", { style: "margin-bottom:10px" },
          el("span", { class: "pill" }, `Question ${i + 1} of ${ids.length}`),
          el("span", { class: "pill" }, NP.isPBQ(q) ? "PBQ" : (Array.isArray(q.answer) ? "Multi-select" : "Multiple choice")),
          el("span", { class: "pill" }, NP.DOMAINS[q.domain]),
          el("span", { class: "pill" }, q.diff)));

        const qbox = el("div");
        inner.appendChild(qbox);
        const paintBody = () => {
          qbox.innerHTML = "";
          if (NP.isPBQ(q)) NP.pbq.render(qbox, q, () => ans, v => { ans = v; }, submitted ? { review: true } : {});
          else {
            if (Array.isArray(q.answer) && !submitted) {
              qbox.appendChild(el("p", { class: "pbq-note" }, `Select ${q.answer.length === 2 ? "TWO" : q.answer.length} answers.`));
            }
            NP.renderMC(qbox, q, () => ans, v => { ans = v; }, submitted ? { review: true } : {});
          }
        };
        paintBody();

        const fb = el("div");
        const ctl = el("div", { class: "btnrow" });
        const submitBtn = el("button", { class: "bigbtn", onclick: () => {
          if (submitted) return;
          if (!NP.isAnsweredAny(q, ans) && !(NP.isPBQ(q) && NP.pbq.isPartial(q, ans))) {
            NP.modal("No answer", "<p>Answer the question first, on the real exam you'd never leave one blank.</p>");
            return;
          }
          submitted = true;
          const g = NP.gradePoints(q, ans);
          if (g.all) fullCorrect++;
          const D = NP.store.data;
          if (g.all) {
            if (opts.deck) { D.missed = D.missed.filter(x => x !== q.id); NP.store.save(); }
          } else if (!D.missed.includes(q.id)) { D.missed.push(q.id); NP.store.save(); }
          paintBody();
          fb.innerHTML = "";
          const cls = g.all ? "good" : g.partial ? "part" : "bad";
          const txt = g.all ? "✔ Correct" : g.partial ? `◐ Partial credit: ${g.pts} of ${g.max} items` : "✘ Incorrect";
          fb.appendChild(el("div", { class: "feedback-banner " + cls }, txt));
          const ex = el("div", { class: "expl" });
          ex.innerHTML = "<strong>Explanation.</strong> " + q.expl +
            (q.tip ? `<div class="tip"><strong>Exam tip:</strong> ${q.tip}</div>` : "");
          fb.appendChild(ex);
          submitBtn.classList.add("hidden");
          nextBtn.classList.remove("hidden");
          nextBtn.focus();
        } }, "Submit answer");
        const nextBtn = el("button", { class: "bigbtn hidden", onclick: () => { i++; paint(); window.scrollTo(0, 0); stage.scrollTop = 0; } },
          i + 1 >= ids.length ? "Finish" : "Next question");
        ctl.appendChild(submitBtn); ctl.appendChild(nextBtn);
        inner.appendChild(ctl);
        inner.appendChild(fb);
      }

      paint();
    });
  }
})();
