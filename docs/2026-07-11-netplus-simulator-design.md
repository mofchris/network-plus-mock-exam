# CompTIA Network+ (N10-009) Exam Simulator — Design Spec

Date: 2026-07-11. Status: approved (own repo, full feature parity with the GRE simulator).

## Goal

A fully offline, zero-dependency web simulator of the CompTIA Network+ N10-009 exam —
Pearson VUE-style interface, realistic question style/difficulty, performance-based
questions with partial credit — plus a tutor mode, study sheets, missed-question deck,
and score history.

## Exam structure (one linear session — the real exam is NOT adaptive)

- 75 questions, 90 minutes, free navigation with Flag for Review.
- ~4 PBQs delivered first, then ~71 multiple-choice (single and "Select TWO").
- Domain weights (N10-009): 1 Networking Concepts 23%, 2 Network Implementation 20%,
  3 Network Operations 19%, 4 Network Security 14%, 5 Network Troubleshooting 24%.
- Assembly: per-domain question targets from weights; recency tracking de-prioritizes
  recently used questions.

## PBQs

Generic engine: a PBQ = scenario stem (HTML, may include SVG topology or terminal
output) + list of labeled interactive items (dropdown select, text fill-in, ordering via
per-slot dropdowns, matching via per-row dropdowns). Scored per-item = partial credit,
like the real exam. Launch pool: 8 PBQs (ports matching, troubleshooting-steps ordering,
subnetting worksheet, topology labeling, command-output analysis, wireless config, ACL
ordering/security, cable/connector selection).

## Interface (Pearson VUE style)

- White canvas; dark header bar: exam title left, Time Remaining + Question X of 75 right.
- "Flag for review" checkbox above each question.
- Footer buttons: Previous / Next / Review Screen; End Exam from review.
- Review screen filters: All / Flagged / Incomplete; click to jump; End Exam confirm
  warns about incomplete items. Timer expiry auto-ends the exam.
- No calculator (the real exam has none).

## Scoring & results

- Points: MC = 1; PBQ = one point per sub-item (partial credit).
- Scaled = 100 + round(800 × points/maxPoints); PASS at ≥ 720 (CompTIA scale) — an
  approximation of CompTIA's unpublished equating, labeled as such.
- Report: PASS/FAIL banner, scaled score, per-domain accuracy vs official weights,
  PBQ item detail, pacing, full review with explanations, attempt history + trend.

## Tutor mode

- Filters: domain, difficulty, type (MC/PBQ); instant feedback with explanations + tips.
- Missed-question deck (auto-collected from mocks and tutor; graduates on correct answer).
- Study sheets: common ports/protocols table, OSI model reference, CompTIA 7-step
  troubleshooting methodology.

## Bank (launch)

~180 MC weighted by domain (≈42/36/34/26/42) + 8 PBQs; every item has domain, difficulty
(easy/medium/hard), explanation, and exam tip. Data-as-JS pattern (works over file://),
one file per domain + one for PBQs; append-friendly.

## Tech

Same stack as the GRE simulator: static HTML/CSS/JS, `NP` namespace, `NETBANK` global
bank, localStorage key `netplus-sim-v1`, start.bat (port 8421), GitHub Pages deploy from
main root. Files: index.html, css/style.css, js/{app,exam,pbq,scoring,results,tutor}.js,
data/{d1..d5}.js + data/pbqs.js.
