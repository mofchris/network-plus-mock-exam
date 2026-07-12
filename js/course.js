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
  C.isDone = isDone;

  // A step is unlocked when every earlier step is done.
  function unlockedIndex() {
    const s = steps();
    for (let i = 0; i < s.length; i++) if (!isDone(s[i])) return i;
    return s.length; // course complete
  }
  C.unlockedIndex = unlockedIndex;
  C.courseComplete = () => unlockedIndex() >= steps().length;

  C.percentComplete = function () {
    const s = steps();
    if (!s.length) return 0;
    const done = s.filter(isDone).length;
    return Math.round(100 * done / s.length);
  };

  function stepIndexOf(id) {
    return steps().findIndex(s => s.item.id === id);
  }

  /* ---------- syllabus ---------- */

  NP.screens.course = function (root) {
    const el = NP.el;
    const { head, stage, inner } = NP.chrome("Course");
    root.appendChild(head); root.appendChild(stage);

    const pct = C.percentComplete();
    const s = steps();
    const uIdx = unlockedIndex();
    const done = s.filter(isDone).length;

    inner.appendChild(el("h1", { class: "screen-title" }, "Network+ Study Course"));
    inner.appendChild(el("p", { class: "screen-sub" },
      "Read each module, pass its quiz at 75% to unlock the next, and clear the cumulative " +
      "checkpoint at the end of every unit. Finish the course to unlock the full mock exam."));

    /* progress card */
    const pc = el("div", { class: "progcard" });
    pc.appendChild(el("div", { class: "top" },
      el("span", { class: "lbl" }, "Course progress"),
      el("span", { class: "num", html: `${done} / ${s.length} steps · <b>${pct}%</b>` })));
    const track = el("div", { class: "track" });
    track.appendChild(el("i", { style: `width:${pct}%` }));
    pc.appendChild(track);
    inner.appendChild(pc);

    if (C.courseComplete()) {
      inner.appendChild(el("button", {
        class: "btn good big wide", style: "margin-bottom:22px",
        onclick: () => NP.exam.startIntro()
      }, "Course complete, take the mock exam", NP.icon("arrow", 18)));
    }

    /* units */
    let idx = 0;
    (window.NETCOURSE.units || []).forEach((u, ui) => {
      const group = el("div", { class: "unitgroup" });
      const n = u.modules.length + (u.checkpoint ? 1 : 0);
      const start = idx;
      const unitDone = uIdx >= start + n;
      const unitCur = !unitDone && uIdx >= start && uIdx < start + n;

      const hd = el("div", { class: "unithead" });
      hd.appendChild(unitDone
        ? el("span", { class: "pill good" }, `UNIT ${ui + 1}`, NP.icon("check", 12, 3.4))
        : unitCur
          ? el("span", { class: "pill accent" }, `UNIT ${ui + 1} · IN PROGRESS`)
          : el("span", { class: "pill" }, `UNIT ${ui + 1}`, NP.icon("lock", 12)));
      hd.appendChild(el("span", { class: "nm" }, u.title));
      group.appendChild(hd);
      if (u.blurb) group.appendChild(el("p", { class: "unitblurb" }, u.blurb));

      const list = el("div", { class: "mod-list" });
      const addRow = (step, i) => {
        const isCp = step.kind === "checkpoint";
        const d = isDone(step);
        const locked = i > uIdx;
        const isNext = i === uIdx;
        const p = prog();
        const rec = isCp ? p.checkpoints[step.item.id] : p.modules[step.item.id];

        const row = el("button", {
          class: "mod-row" + (d ? " done" : "") + (locked ? " locked" : "") +
                 (isNext ? " next" : "") + (isCp ? " cp" : ""),
          disabled: locked ? "disabled" : null,
          onclick: () => { if (!locked) open(step); }
        });

        row.appendChild(el("span", { class: "mod-ic" },
          d ? NP.icon("check", 14, 3.2)
            : locked ? NP.icon("lock", 13)
            : isCp ? NP.icon("flag", 13)
            : NP.icon("play", 12)));

        const meta = [];
        if (isCp) { meta.push("cumulative"); meta.push(step.item.n + " questions"); }
        else {
          meta.push(step.item.level);
          meta.push(step.item.minutes + " min");
          meta.push(step.item.quiz.length + "-question quiz");
        }
        if (rec && rec.best != null) meta.push("best " + rec.best + "%");
        else if (locked) meta.push("locked");

        row.appendChild(el("span", { class: "mod-mid" },
          el("span", { class: "mod-title" }, (isCp ? "Checkpoint: " : "") + step.item.title),
          el("span", { class: "mod-meta" }, meta.join(" · "))));

        const st = el("span", { class: "mod-st" });
        if (d) st.appendChild(document.createTextNode("PASSED"));
        else if (locked) st.appendChild(document.createTextNode("LOCKED"));
        else if (isNext) {
          st.appendChild(document.createTextNode(rec && rec.best != null ? "RESUME" : "START"));
          st.appendChild(NP.icon("chevR", 15, 2.4));
        }
        row.appendChild(st);
        list.appendChild(row);
      };

      u.modules.forEach(m => addRow({ kind: "module", unit: u, item: m }, idx++));
      if (u.checkpoint) addRow({ kind: "checkpoint", unit: u, item: u.checkpoint }, idx++);
      group.appendChild(list);
      inner.appendChild(group);
    });

    inner.appendChild(el("p", { class: "footnote" },
      "Passing mark is 75%. You can retake any quiz as many times as you like: your best score " +
      "is kept, and completed modules stay open for review."));
  };

  function open(step) {
    if (step.kind === "module") readModule(step.item);
    else runQuiz(step.item, buildCheckpoint(step.item), true);
  }

  /* ---------- module reader ---------- */

  function readModule(m) {
    NP.show(root => {
      const el = NP.el;
      const all = steps();
      const i = stepIndexOf(m.id);
      const unit = i >= 0 ? all[i].unit : null;
      const mods = all.filter(s => s.kind === "module");
      const modNo = mods.findIndex(s => s.item.id === m.id) + 1;

      root.appendChild(NP.crumb(
        [["Course", () => NP.show(NP.screens.course)], unit ? unit.title : "Unit", m.title],
        modNo ? `module ${modNo} of ${mods.length}` : null));

      const hair = NP.hairline(0);
      root.appendChild(hair);
      const fill = hair.firstChild;

      const { stage, inner } = NP.stage("reader");
      root.appendChild(stage);

      // Reading progress tracks how far through the lesson you've scrolled.
      stage.addEventListener("scroll", () => {
        const max = stage.scrollHeight - stage.clientHeight;
        fill.style.width = (max > 0 ? Math.min(100, 100 * stage.scrollTop / max) : 100) + "%";
      });

      inner.appendChild(el("div", { class: "pillrow" },
        el("span", { class: "pill accent" }, m.level),
        el("span", { class: "pill" }, m.minutes + " min read")));
      inner.appendChild(el("h1", { class: "lesson-h1" }, m.title));

      const body = el("div", { class: "lesson" });
      body.innerHTML = m.content;
      inner.appendChild(body);

      prog().read[m.id] = true;
      NP.store.save();

      // Previous is only offered when the earlier step is a module you've unlocked.
      const prevStep = i > 0 ? all[i - 1] : null;
      const canPrev = !!(prevStep && prevStep.kind === "module");
      const foot = el("div", { class: "lessonfoot" });
      const prevBtn = el("button", {
        class: "btn secondary",
        disabled: canPrev ? null : "disabled",
        onclick: () => { if (canPrev) readModule(prevStep.item); }
      }, NP.icon("chevL", 16), "Previous");
      foot.appendChild(prevBtn);
      foot.appendChild(el("button", {
        class: "btn grow", onclick: () => runQuiz(m, m.quiz, false)
      }, `Take the module quiz (${m.quiz.length} questions)`, NP.icon("arrow", 17)));
      inner.appendChild(foot);
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
      const label = (isCheckpoint ? "Checkpoint" : "Quiz") + " · " + owner.title;
      const crumb = NP.crumb([["Course", () => NP.show(NP.screens.course)], label], "");
      const counter = crumb.querySelector(".right");
      root.appendChild(crumb);

      const hair = NP.hairline(0);
      root.appendChild(hair);
      const fill = hair.firstChild;

      const { stage, inner } = NP.stage();
      root.appendChild(stage);
      paint();

      function paint() {
        inner.innerHTML = "";
        if (submitted) { results(); return; }

        const q = qs[i];
        counter.textContent = `Question ${i + 1} of ${qs.length}`;
        fill.style.width = (100 * (i + 1) / qs.length) + "%";

        NP.renderMC(inner, { text: q.text, choices: q.choices, answer: q.answer },
          () => answers[i], v => { answers[i] = v; }, {});

        const row = el("div", { class: "btnrow", style: "justify-content:space-between" });
        const left = el("div", { style: "display:flex;gap:12px" });
        if (i > 0) left.appendChild(el("button", {
          class: "btn secondary", onclick: () => { i--; paint(); }
        }, NP.icon("chevL", 16), "Back"));
        left.appendChild(el("button", {
          class: "btn secondary", onclick: () => NP.show(NP.screens.course)
        }, "Exit"));
        row.appendChild(left);

        row.appendChild(el("button", {
          class: "btn", onclick: () => {
            const need = Array.isArray(q.answer);
            const a = answers[i];
            if (a == null || (need && (!Array.isArray(a) || a.length !== q.answer.length))) {
              NP.modal("Answer required",
                "<p>Choose your answer" + (need ? "s" : "") + " before continuing.</p>",
                [{ label: "OK" }], { intent: "info" });
              return;
            }
            if (i < qs.length - 1) { i++; paint(); }
            else { submitted = true; paint(); }
          }
        }, i < qs.length - 1 ? "Next" : "Submit quiz",
           i < qs.length - 1 ? NP.icon("chevR", 16) : null));
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

        counter.textContent = "Result";
        fill.style.width = "100%";

        inner.appendChild(el("h1", { class: "screen-title", style: "margin-bottom:16px" },
          (isCheckpoint ? "Checkpoint result: " : "Quiz result: ") + owner.title));

        const banner = el("div", { class: "banner sm " + (passed ? "pass" : "fail") });
        banner.appendChild(el("div", { class: "left" },
          el("span", { class: "tile" }, NP.icon(passed ? "check" : "x", 26, 2.6)),
          el("div", null,
            el("div", { class: "word" }, passed ? "Passed" : "Not yet"),
            el("div", { class: "ctx" }, passed
              ? (isCheckpoint ? "Unit cleared. The next unit is unlocked."
                              : "Module complete, the next step is unlocked.")
              : `You need ${PASS}% to pass. Review the explanations below and retake it, there's no limit.`))));
        banner.appendChild(el("div", { class: "right" },
          el("div", { class: "score" }, pct + "%"),
          el("div", { class: "scale" }, `${correct} of ${qs.length} correct`)));
        inner.appendChild(banner);

        qs.forEach((q, j) => {
          const ok = NP.gradeMC(q, answers[j]);
          const box = el("div", { class: "rev-item", style: "margin-top:16px" });
          const vd = el("span", { class: "vd " + (ok ? "ok" : "no") });
          vd.appendChild(NP.icon(ok ? "check" : "x", 14, ok ? 3 : 2.6));
          vd.appendChild(document.createTextNode(ok ? "Correct" : "Incorrect"));
          box.appendChild(el("div", { class: "rhead" },
            el("span", { class: "qn" }, `Question ${j + 1}`), vd));
          NP.renderMC(box, q, () => answers[j], () => {}, { review: true });
          const ex = el("div", { class: "expl" });
          ex.innerHTML = "<strong>Explanation.</strong> " + q.expl;
          box.appendChild(ex);
          inner.appendChild(box);
        });

        const row = el("div", { class: "btnrow" });
        if (passed) {
          row.appendChild(el("button", {
            class: "btn", style: "flex:1", onclick: () => NP.show(NP.screens.course)
          }, "Continue the course", NP.icon("arrow", 17)));
        } else {
          row.appendChild(el("button", {
            class: "btn", onclick: () => {
              answers.fill(null); i = 0; submitted = false;
              if (isCheckpoint) { qs.length = 0; buildCheckpoint(owner).forEach(q => qs.push(q)); }
              paint();
            }
          }, "Retake"));
          if (!isCheckpoint) {
            row.appendChild(el("button", {
              class: "btn secondary", onclick: () => readModule(owner)
            }, "Re-read the module"));
          }
          row.appendChild(el("button", {
            class: "btn secondary", onclick: () => NP.show(NP.screens.course)
          }, "Back to syllabus"));
        }
        inner.appendChild(row);
        stage.scrollTop = 0;
        window.scrollTo(0, 0);
      }
    });
  }
})();
