/* Scoring: points → CompTIA-style 100–900 scale, pass at 720.
   CompTIA does not publish its equating; this linear approximation is labeled
   as an estimate throughout the UI. */
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};

  NP.PASS_SCALED = 720;

  NP.scale = function (points, maxPoints) {
    if (!maxPoints) return 100;
    const scaled = 100 + Math.round(800 * points / maxPoints);
    return Math.max(100, Math.min(900, scaled));
  };

  NP.scoreAttempt = function (points, maxPoints) {
    const scaled = NP.scale(points, maxPoints);
    return { scaled, pass: scaled >= NP.PASS_SCALED, pct: Math.round(100 * points / maxPoints) };
  };

  // Official N10-009 domain weights (percent of exam)
  NP.DOMAIN_WEIGHTS = { 1: 23, 2: 20, 3: 19, 4: 14, 5: 24 };
})();
