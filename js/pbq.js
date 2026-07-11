/* PBQ engine: renders performance-based questions and grades them with
   partial credit (one point per item, like the real exam).

   PBQ shape:
   { id, domain, diff: "easy"|"medium"|"hard", title,
     stem: HTML (may include .terminal blocks or inline SVG),
     note: optional instruction line,
     items: [
       { kind: "select", label, options: [...], answer: index },
       { kind: "fill",   label, answer: "string" | ["alt1","alt2"], placeholder? }
     ],
     expl, tip }

   Answer state: array, one slot per item — index (select) or string (fill), null/"" = blank.
*/
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};
  const P = {};
  NP.pbq = P;

  P.blankAnswer = q => new Array(q.items.length).fill(null);

  P.isAnswered = function (q, ans) {
    if (!Array.isArray(ans)) return false;
    return q.items.every((it, i) =>
      it.kind === "fill" ? String(ans[i] || "").trim() !== "" : ans[i] != null);
  };

  P.isPartial = function (q, ans) {
    if (!Array.isArray(ans)) return false;
    return q.items.some((it, i) =>
      it.kind === "fill" ? String(ans[i] || "").trim() !== "" : ans[i] != null);
  };

  P.gradeItem = function (it, val) {
    if (it.kind === "fill") {
      const got = String(val == null ? "" : val).trim().toLowerCase().replace(/\s+/g, " ");
      const want = Array.isArray(it.answer) ? it.answer : [it.answer];
      return want.some(w => String(w).trim().toLowerCase().replace(/\s+/g, " ") === got);
    }
    return val === it.answer;
  };

  P.grade = function (q, ans) {
    const per = q.items.map((it, i) => P.gradeItem(it, Array.isArray(ans) ? ans[i] : null));
    const correct = per.filter(Boolean).length;
    return { correct, total: q.items.length, per, allCorrect: correct === q.items.length };
  };

  P.correctText = function (it) {
    if (it.kind === "fill") return Array.isArray(it.answer) ? it.answer[0] : it.answer;
    return it.options[it.answer];
  };

  /* Renders the PBQ body. opts: { review, disabled } — review paints per-item
     verdicts and shows correct values. */
  P.render = function (container, q, getAns, setAns, opts) {
    opts = opts || {};
    const el = NP.el;
    const ro = opts.review || opts.disabled;

    container.appendChild(el("div", { class: "pbq-title" }, q.title));
    container.appendChild(el("div", { class: "pbq-note" },
      q.note || "Performance-based question — complete every field. Partial credit is awarded per item."));
    container.appendChild(el("div", { class: "qtext", html: q.stem }));

    const wrap = el("div", { class: "pbq-items" });
    const graded = opts.review ? P.grade(q, getAns()) : null;

    q.items.forEach((it, i) => {
      const row = el("div", { class: "pbq-item" });
      const left = el("div", { html: it.label });
      row.appendChild(left);
      const right = el("div");

      const current = () => {
        const a = getAns();
        return Array.isArray(a) ? a[i] : null;
      };
      const setItem = v => {
        let a = getAns();
        a = Array.isArray(a) ? a.slice() : P.blankAnswer(q);
        a[i] = v;
        setAns(a);
      };

      if (it.kind === "fill") {
        const inp = el("input", { type: "text", value: current() == null ? "" : current(),
          placeholder: it.placeholder || "", oninput: e => setItem(e.target.value) });
        if (ro) inp.disabled = true;
        right.appendChild(inp);
      } else {
        const sel = el("select", { onchange: e => setItem(e.target.value === "" ? null : parseInt(e.target.value, 10)) });
        sel.appendChild(el("option", { value: "" }, "— choose —"));
        it.options.forEach((o, oi) => {
          const opt = el("option", { value: String(oi) }, o);
          if (current() === oi) opt.selected = true;
          sel.appendChild(opt);
        });
        if (ro) sel.disabled = true;
        right.appendChild(sel);
      }

      if (opts.review) {
        const ok = graded.per[i];
        row.classList.add(ok ? "ok" : "bad");
        const v = el("div", { class: "verdict " + (ok ? "ok" : "bad") },
          ok ? "✔ Correct" : "✘ Correct answer: " + P.correctText(it));
        right.appendChild(v);
      }
      row.appendChild(right);
      wrap.appendChild(row);
    });

    container.appendChild(wrap);
  };
})();
