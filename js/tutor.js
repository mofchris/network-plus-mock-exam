/* Tutor mode: untimed practice by domain/difficulty/type with instant feedback,
   PBQ partial-credit feedback, missed-deck drilling. */
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};
  NP.screens = NP.screens || {};
  const T = {};
  NP.tutor = T;

  const SIZES = [5, 10, 20];

  NP.screens.tutor = function (root) {
    const el = NP.el;
    root.appendChild(NP.crumb([["Dashboard", () => NP.show(NP.screens.home)], "Tutor Mode"]));
    const { stage, inner } = NP.stage();
    root.appendChild(stage);

    inner.appendChild(el("h1", { class: "screen-title" }, "Build a practice set"));
    inner.appendChild(el("p", { class: "screen-sub" },
      "Untimed, with instant feedback and full explanations. PBQs give per-item feedback."));

    const card = el("div", { class: "card" });
    const grid = el("div", { class: "ctlgrid" });

    const mkSelect = (label, opts) => {
      const wrap = el("div", { class: "ctl" });
      wrap.appendChild(el("div", { class: "lbl" }, label));
      const sel = el("select", { "aria-label": label });
      opts.forEach(([v, t]) => sel.appendChild(el("option", { value: v }, t)));
      const sw = el("div", { class: "selwrap" }, sel);
      sw.appendChild(el("span", { class: "chev" }, NP.icon("chevD", 15)));
      wrap.appendChild(sw);
      grid.appendChild(wrap);
      return sel;
    };

    const selDomain = mkSelect("Domain", [["any", "All domains"],
      ["1", "1.0 Concepts"], ["2", "2.0 Implementation"], ["3", "3.0 Operations"],
      ["4", "4.0 Security"], ["5", "5.0 Troubleshooting"]]);
    const selDiff = mkSelect("Difficulty", [["any", "Mixed"], ["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]]);
    const selType = mkSelect("Type", [["any", "All types"], ["mc", "Multiple choice"], ["pbq", "PBQs only"]]);

    // Question count is a segmented control, not a dropdown: three options, always visible.
    let count = 10;
    const nWrap = el("div", { class: "ctl" });
    nWrap.appendChild(el("div", { class: "lbl" }, "Questions"));
    const seg = el("div", { class: "seg", role: "group", "aria-label": "Questions" });
    SIZES.forEach(n => {
      seg.appendChild(el("button", {
        class: n === count ? "on" : "",
        "aria-pressed": n === count ? "true" : "false",
        onclick: e => {
          count = n;
          seg.querySelectorAll("button").forEach(b => {
            b.classList.remove("on"); b.setAttribute("aria-pressed", "false");
          });
          e.currentTarget.classList.add("on");
          e.currentTarget.setAttribute("aria-pressed", "true");
          startBtn.textContent = "";
          startBtn.appendChild(document.createTextNode(`Start practice, ${count} questions`));
          startBtn.appendChild(NP.icon("arrow", 17));
        }
      }, String(n)));
    });
    nWrap.appendChild(seg);
    grid.appendChild(nWrap);
    card.appendChild(grid);

    const startBtn = el("button", {
      class: "btn big wide", style: "margin-top:20px",
      onclick: () => {
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
        if (!ids.length) {
          NP.modal("No questions", "<p>No questions match those filters.</p>",
            [{ label: "OK" }], { intent: "info" });
          return;
        }
        startSession(NP.shuffle(ids).slice(0, count), { deck: false });
      }
    }, `Start practice, ${count} questions`, NP.icon("arrow", 17));
    card.appendChild(startBtn);
    inner.appendChild(card);
  };

  T.startDeck = ids => startSession(NP.shuffle(ids.slice()), { deck: true });

  /* Jump straight into a domain drill (used by the results "Practice D5" button). */
  T.practiceDomain = function (d) {
    const B = window.NETBANK;
    const ids = []
      .concat((B.mc || []).map(q => q.id), (B.pbqs || []).map(q => q.id))
      .filter(id => NP.byId[id] && NP.byId[id].domain === d);
    if (!ids.length) { NP.show(NP.screens.tutor); return; }
    startSession(NP.shuffle(ids).slice(0, 10), { deck: false, domain: d });
  };

  function startSession(ids, opts) {
    let i = 0, fullCorrect = 0, graduated = 0;
    let ans = null, submitted = false;

    NP.show(root => {
      const el = NP.el;
      const title = opts.deck ? "Missed Questions Drill" : "Tutor Mode, Practice";

      const crumb = NP.crumb([["Tutor", () => NP.show(NP.screens.tutor)], title], "untimed");
      root.appendChild(crumb);

      const hair = NP.hairline(0);
      root.appendChild(hair);
      const fill = hair.firstChild;

      const { stage, inner } = NP.stage();
      root.appendChild(stage);

      function summary() {
        inner.innerHTML = "";
        const answered = i + (submitted ? 1 : 0);
        fill.style.width = "100%";

        inner.appendChild(el("h1", { class: "screen-title" }, "Session complete"));
        const card = el("div", { class: "card" });
        const s = el("div", { class: "summary" });
        s.appendChild(el("div", { class: "big", html:
          `${fullCorrect}<span>/${answered || ids.length}</span>` }));
        s.appendChild(el("div", { class: "cap" }, "fully correct this session"));

        const tiles = el("div", { class: "tiles" });
        if (opts.deck) {
          tiles.appendChild(el("div", { class: "stat good" },
            el("div", { class: "v" }, String(graduated)),
            el("div", { class: "l" }, "left the deck")));
        }
        tiles.appendChild(el("div", { class: "stat" },
          el("div", { class: "v" }, opts.domain ? "Domain " + opts.domain : "Mixed"),
          el("div", { class: "l" }, "practiced")));
        s.appendChild(tiles);

        const row = el("div", { style: "display:flex;gap:10px" });
        row.appendChild(el("button", {
          class: "btn", style: "flex:1", onclick: () => NP.show(NP.screens.tutor)
        }, "Practice more"));
        row.appendChild(el("button", {
          class: "btn secondary", onclick: () => NP.show(NP.screens.home)
        }, "Dashboard"));
        s.appendChild(row);
        card.appendChild(s);
        inner.appendChild(card);
      }

      function paint() {
        if (i >= ids.length) { summary(); return; }
        ans = null; submitted = false;
        inner.innerHTML = "";
        fill.style.width = (100 * (i + 1) / ids.length) + "%";

        const q = NP.byId[ids[i]];
        if (!q) { i++; paint(); return; }

        inner.appendChild(el("div", { class: "pillrow" },
          el("span", { class: "pill" }, `Question ${i + 1} of ${ids.length}`),
          el("span", { class: "pill" },
            NP.isPBQ(q) ? "PBQ" : (Array.isArray(q.answer) ? "Multi-select" : "Multiple choice")),
          el("span", { class: "pill", title: NP.DOMAINS[q.domain] }, "Domain " + q.domain),
          el("span", { class: "pill" }, q.diff)));

        const qbox = el("div");
        inner.appendChild(qbox);
        const paintBody = () => {
          qbox.innerHTML = "";
          const o = submitted ? { review: true } : {};
          if (NP.isPBQ(q)) NP.pbq.render(qbox, q, () => ans, v => { ans = v; }, o);
          else NP.renderMC(qbox, q, () => ans, v => { ans = v; }, o);
        };
        paintBody();

        const fb = el("div");
        const ctl = el("div", { class: "btnrow" });

        const submitBtn = el("button", {
          class: "btn", onclick: () => {
            if (submitted) return;
            if (!NP.isAnsweredAny(q, ans) && !(NP.isPBQ(q) && NP.pbq.isPartial(q, ans))) {
              NP.modal("No answer",
                "<p>Answer the question first, on the real exam you'd never leave one blank.</p>",
                [{ label: "OK" }], { intent: "info" });
              return;
            }
            submitted = true;
            const g = NP.gradePoints(q, ans);
            if (g.all) fullCorrect++;

            const D = NP.store.data;
            if (g.all) {
              if (opts.deck && D.missed.includes(q.id)) {
                D.missed = D.missed.filter(x => x !== q.id);
                graduated++;
                NP.store.save();
              }
            } else if (!D.missed.includes(q.id)) {
              D.missed.push(q.id);
              NP.store.save();
            }

            paintBody();
            fb.innerHTML = "";

            const cls = g.all ? "good" : g.partial ? "part" : "bad";
            const banner = el("div", { class: "fb-banner " + cls });
            banner.appendChild(NP.icon(g.all ? "check" : g.partial ? "partial" : "x", 18,
              g.all ? 2.6 : g.partial ? 2.4 : 2.6));
            banner.appendChild(document.createTextNode(
              g.all ? "Correct"
                : g.partial ? `Partial credit, ${g.pts} of ${g.max} items`
                : "Incorrect"));
            fb.appendChild(banner);

            if (g.partial) {
              const bar = el("div", { class: "itembar" });
              const per = NP.pbq.grade(q, ans).per;
              per.forEach(ok => bar.appendChild(el("i", { class: ok ? "ok" : "" })));
              fb.appendChild(bar);
            }
            if (!g.all && !g.partial) {
              fb.appendChild(el("p", { class: "fb-note" },
                "Added to your missed-questions deck for re-drilling."));
            }
            if (g.all && opts.deck) {
              fb.appendChild(el("p", { class: "fb-note" },
                "Graduated out of the missed deck."));
            }

            const ex = el("div", { class: "expl" });
            ex.innerHTML = "<strong>Explanation.</strong> " + q.expl +
              (q.tip ? `<div class="tip"><strong>Exam tip:</strong> ${q.tip}</div>` : "");
            fb.appendChild(ex);

            submitBtn.classList.add("hidden");
            nextBtn.classList.remove("hidden");
            nextBtn.focus();
          }
        }, "Submit answer");

        const nextBtn = el("button", {
          class: "btn hidden",
          onclick: () => { i++; paint(); window.scrollTo(0, 0); stage.scrollTop = 0; }
        }, i + 1 >= ids.length ? "Finish" : "Next question");

        ctl.appendChild(submitBtn);
        ctl.appendChild(nextBtn);
        ctl.appendChild(el("button", {
          class: "btn secondary", onclick: () => summary()
        }, "End session"));

        inner.appendChild(fb);
        inner.appendChild(ctl);
      }

      paint();
    });
  }
})();
