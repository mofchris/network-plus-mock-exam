/* Course engine: syllabus with gated progression, module reader, module quizzes
   (75% to pass), cumulative unit checkpoints, and the mock-exam unlock gate.

   Course data shape (window.NETCOURSE):
   { units: [ { id, title, blurb,
                modules: [ { id, title, minutes, level, content: HTML,
                             quiz: [ {text, choices, answer(index|array), expl} ] } ],
                checkpoint: { id, title, n, questions: [ same shape ] } } ] }

   Progress (NP.store.data.course):
   { modules: { modId: {best: pct, passed: bool} },
     checkpoints: { cpId: {best: pct, passed: bool} },
     read: { modId: true } }
*/
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};
  NP.screens = NP.screens || {};
  const C = {};
  NP.course = C;

  const PASS = 75; // percent required to clear a quiz or checkpoint

  function prog() {
    const d = NP.store.data;
    d.course = d.course || { modules: {}, checkpoints: {}, read: {} };
    d.course.modules = d.course.modules || {};
    d.course.checkpoints = d.course.checkpoints || {};
    d.course.read = d.course.read || {};
    return d.course;
  }
  C.progress = prog;

  /* ---------- flat ordered list of steps (modules + checkpoints) ---------- */

  function steps() {
    const out = [];
    (window.NETCOURSE.units || []).forEach(u => {
      u.modules.forEach(m => out.push({ kind: "module", unit: u, item: m }));
      if (u.checkpoint) out.push({ kind: "checkpoint", unit: u, item: u.checkpoint });
    });
    return out;
  }
  C.steps = steps;

  function isDone(step) {
    const p = prog();
    return step.kind === "module"
      ? !!(p.modules[step.item.id] && p.modules[step.item.id].passed)
      : !!(p.checkpoints[step.item.id] && p.checkpoints[step.item.id].passed);
  }

  // A step is unlocked when every earlier step is done.
  function unlockedIndex() {
    const s = steps();
    for (let i = 0; i < s.length; i++) if (!isDone(s[i])) return i;
    return s.length; // course complete
  }
  C.courseComplete = () => unlockedIndex() >= steps().length;

  C.percentComplete = function () {
    const s = steps();
    if (!s.length) return 0;
    const done = s.filter(isDone).length;
    return Math.round(100 * done / s.length);
  };

  /* ---------- syllabus ---------- */

  NP.screens.course = function (root) {
    const el = NP.el;
    const { bar, stage, inner } = NP.chrome("Study Course");
    root.appendChild(bar); root.appendChild(stage);

    const pct = C.percentComplete();
    const s = steps();
    const uIdx = unlockedIndex();

    inner.appendChild(el("h1", { class: "screen-title" }, "Network+ Study Course"));
    inner.appendChild(el("p", { class: "screen-sub" },
      "From first principles to exam-ready. Read each module, pass its quiz (75% or better) to unlock the next, " +
      "and clear the cumulative checkpoint at the end of every unit. Finish the course to unlock the full mock exam."));

    /* progress bar */
    const pcard = el("div", { class: "card" });
    pcard.appendChild(el("h3", null, `Course progress: ${pct}%`));
    const track = el("div", { class: "tbar-track", style: "height:22px" });
    track.appendChild(el("div", { class: "tbar-fill", style: `width:${pct}%` }));
    pcard.appendChild(track);
    pcard.appendChild(el("p", { style: "margin:10px 0 0;font-size:14px;color:#5b6572" },
      `${s.filter(isDone).length} of ${s.length} steps complete (${s.filter(x => x.kind === "module").length} modules + ${s.filter(x => x.kind === "checkpoint").length} checkpoints).`));

    if (C.courseComplete()) {
      const row = el("div", { class: "btnrow" });
      row.appendChild(el("button", { class: "bigbtn", onclick: () => NP.exam.startIntro() },
        "🎓 Course complete: take the mock exam"));
      pcard.appendChild(row);
    } else {
      const next = s[uIdx];
      const row = el("div", { class: "btnrow" });
      row.appendChild(el("button", { class: "bigbtn", onclick: () => open(next) },
        (pct === 0 ? "Start the course" : "Continue") + ", " + next.item.title));
      pcard.appendChild(row);
      pcard.appendChild(el("p", { style: "margin:10px 0 0;font-size:13px;color:#5b6572" },
        "The full mock exam unlocks when every module and checkpoint is passed."));
    }
    inner.appendChild(pcard);

    /* units */
    let idx = 0;
    (window.NETCOURSE.units || []).forEach(u => {
      const card = el("div", { class: "card" });
      card.appendChild(el("h3", null, u.title));
      card.appendChild(el("p", { style: "color:#5b6572;margin-top:-4px" }, u.blurb));

      const list = el("div", { class: "mod-list" });
      const addRow = (step, i) => {
        const done = isDone(step);
        const locked = i > uIdx;
        const isNext = i === uIdx;
        const p = prog();
        const rec = step.kind === "module" ? p.modules[step.item.id] : p.checkpoints[step.item.id];
        const row = el("button", {
          class: "mod-row" + (done ? " done" : "") + (locked ? " locked" : "") + (isNext ? " next" : ""),
          onclick: () => { if (!locked) open(step); }
        });
        row.appendChild(el("span", { class: "mod-ic" }, done ? "✓" : locked ? "🔒" : step.kind === "checkpoint" ? "🏁" : "▶"));
        const mid = el("span", { class: "mod-mid" });
        mid.appendChild(el("span", { class: "mod-title" },
          (step.kind === "checkpoint" ? "Checkpoint: " : "") + step.item.title));
        const meta = [];
        if (step.kind === "module") {
          meta.push(step.item.level);
          meta.push(step.item.minutes + " min read");
          meta.push(step.item.quiz.length + "-question quiz");
        } else {
          meta.push("cumulative");
          meta.push(step.item.n + " questions");
        }
        if (rec && rec.best != null) meta.push("best " + rec.best + "%");
        mid.appendChild(el("span", { class: "mod-meta" }, meta.join(" · ")));
        row.appendChild(mid);
        row.appendChild(el("span", { class: "mod-st" },
          done ? "Passed" : locked ? "Locked" : isNext ? "Start" : ""));
        list.appendChild(row);
      };

      u.modules.forEach(m => addRow({ kind: "module", unit: u, item: m }, idx++));
      if (u.checkpoint) addRow({ kind: "checkpoint", unit: u, item: u.checkpoint }, idx++);
      card.appendChild(list);
      inner.appendChild(card);
    });

    inner.appendChild(el("p", { class: "footnote" },
      "Passing mark is 75%. You can retake any quiz as many times as you like: your best score is kept, and completed modules stay open for review."));
  };

  function open(step) {
    if (step.kind === "module") readModule(step.item);
    else runQuiz(step.item, buildCheckpoint(step.item), true);
  }

  /* ---------- module reader ---------- */

  function readModule(m) {
    NP.show(root => {
      const el = NP.el;
      const { bar, stage, inner } = NP.chrome("Module");
      root.appendChild(bar); root.appendChild(stage);

      inner.appendChild(el("div", { style: "margin-bottom:8px" },
        el("span", { class: "pill" }, m.level),
        el("span", { class: "pill" }, m.minutes + " min read")));
      inner.appendChild(el("h1", { class: "screen-title" }, m.title));

      const body = el("div", { class: "lesson" });
      body.innerHTML = m.content;
      inner.appendChild(body);

      prog().read[m.id] = true;
      NP.store.save();

      const row = el("div", { class: "btnrow" });
      row.appendChild(el("button", { class: "bigbtn", onclick: () => runQuiz(m, m.quiz, false) },
        `Take the module quiz (${m.quiz.length} questions)`));
      row.appendChild(el("button", { class: "bigbtn secondary", onclick: () => NP.show(NP.screens.course) }, "Back to syllabus"));
      inner.appendChild(row);
    });
  }

  /* ---------- checkpoint assembly (cumulative) ---------- */

  function buildCheckpoint(cp) {
    const pool = NP.shuffle(cp.questions.slice());
    return pool.slice(0, Math.min(cp.n, pool.length));
  }

  /* ---------- quiz runner (shared by module quizzes and checkpoints) ---------- */

  function runQuiz(owner, questions, isCheckpoint) {
    const el = NP.el;
    const qs = isCheckpoint ? questions : NP.shuffle(questions.slice());
    const answers = new Array(qs.length).fill(null);
    let i = 0, submitted = false;

    NP.show(root => {
      const { bar, stage, inner } = NP.chrome(isCheckpoint ? "Checkpoint" : "Module quiz");
      root.appendChild(bar); root.appendChild(stage);
      paint();

      function paint() {
        inner.innerHTML = "";
        if (submitted) { results(); return; }
        const q = qs[i];
        inner.appendChild(el("div", { style: "margin-bottom:8px" },
          el("span", { class: "pill" }, (isCheckpoint ? "Checkpoint: " : "Quiz: ") + owner.title),
          el("span", { class: "pill" }, `Question ${i + 1} of ${qs.length}`)));

        const multi = Array.isArray(q.answer);
        if (multi) inner.appendChild(el("p", { class: "pbq-note" }, `Select ${q.answer.length} answers.`));

        const fake = { text: q.text, choices: q.choices, answer: q.answer };
        NP.renderMC(inner, fake, () => answers[i], v => { answers[i] = v; }, {});

        const row = el("div", { class: "btnrow" });
        if (i > 0) row.appendChild(el("button", { class: "bigbtn secondary", onclick: () => { i--; paint(); } }, "◀ Back"));
        row.appendChild(el("button", { class: "bigbtn", onclick: () => {
          if (answers[i] == null || (Array.isArray(q.answer) && (!Array.isArray(answers[i]) || answers[i].length !== q.answer.length))) {
            NP.modal("Answer required", "<p>Choose your answer" + (Array.isArray(q.answer) ? "s" : "") + " before continuing.</p>");
            return;
          }
          if (i < qs.length - 1) { i++; paint(); }
          else { submitted = true; paint(); }
        } }, i < qs.length - 1 ? "Next ▶" : "Submit quiz"));
        row.appendChild(el("button", { class: "bigbtn secondary", onclick: () => NP.show(NP.screens.course) }, "Exit"));
        inner.appendChild(row);
        stage.scrollTop = 0;
      }

      function results() {
        const correct = qs.reduce((s, q, j) => s + (NP.gradeMC(q, answers[j]) ? 1 : 0), 0);
        const pct = Math.round(100 * correct / qs.length);
        const passed = pct >= PASS;

        const p = prog();
        const bucket = isCheckpoint ? p.checkpoints : p.modules;
        const rec = bucket[owner.id] || { best: 0, passed: false };
        rec.best = Math.max(rec.best || 0, pct);
        rec.passed = rec.passed || passed;
        bucket[owner.id] = rec;
        NP.store.save();

        inner.appendChild(el("h1", { class: "screen-title" },
          (isCheckpoint ? "Checkpoint result: " : "Quiz result, ") + owner.title));
        const banner = el("div", { class: "passbanner " + (passed ? "pass" : "fail") },
          el("div", null,
            el("div", { class: "big" }, passed ? "PASSED" : "NOT YET"),
            el("div", { class: "sub" }, passed
              ? (isCheckpoint ? "Unit cleared. The next unit is unlocked." : "Module complete. The next step is unlocked.")
              : `You need ${PASS}% to pass. Review the explanations below and retake it: there's no limit.`)),
          el("div", { style: "text-align:right" },
            el("div", { class: "big" }, pct + "%"),
            el("div", { class: "sub" }, `${correct} of ${qs.length} correct`)));
        inner.appendChild(banner);

        qs.forEach((q, j) => {
          const ok = NP.gradeMC(q, answers[j]);
          const box = el("div", { class: "rev-item" });
          box.appendChild(el("div", { class: "rhead" },
            el("strong", null, `Question ${j + 1}`),
            el("span", { class: ok ? "ok" : "no" }, ok ? "✔ Correct" : "✘ Incorrect")));
          NP.renderMC(box, q, () => answers[j], () => {}, { review: true });
          const ex = el("div", { class: "expl" });
          ex.innerHTML = "<strong>Explanation.</strong> " + q.expl;
          box.appendChild(ex);
          inner.appendChild(box);
        });

        const row = el("div", { class: "btnrow" });
        if (passed) {
          row.appendChild(el("button", { class: "bigbtn", onclick: () => NP.show(NP.screens.course) }, "Continue the course"));
        } else {
          row.appendChild(el("button", { class: "bigbtn", onclick: () => {
            answers.fill(null); i = 0; submitted = false;
            if (isCheckpoint) { qs.length = 0; buildCheckpoint(owner).forEach(q => qs.push(q)); }
            paint();
          } }, "Retake"));
          if (!isCheckpoint) {
            row.appendChild(el("button", { class: "bigbtn secondary", onclick: () => readModule(owner) }, "Re-read the module"));
          }
          row.appendChild(el("button", { class: "bigbtn secondary", onclick: () => NP.show(NP.screens.course) }, "Back to syllabus"));
        }
        inner.appendChild(row);
        stage.scrollTop = 0;
        window.scrollTo(0, 0);
      }
    });
  }
})();
