# CompTIA Network+ (N10-009) Exam Simulator

A free, fully offline simulator of the **CompTIA Network+ N10-009** exam — realistic
question style and difficulty, performance-based questions with partial credit, and a
Pearson VUE-style interface. No accounts, no tracking, no build step. Your data never
leaves your browser.

**Take it here:** open `index.html`, or use the hosted version on GitHub Pages.

## What it does

- **Full mock exam** — 75 questions in 90 minutes, PBQs first, weighted to the official
  N10-009 domain percentages:

  | Domain | Weight |
  |---|---|
  | 1.0 Networking Concepts | 23% |
  | 2.0 Network Implementation | 20% |
  | 3.0 Network Operations | 19% |
  | 4.0 Network Security | 14% |
  | 5.0 Network Troubleshooting | 24% |

- **Performance-based questions** with **partial credit**, scored per item — port/protocol
  matching, troubleshooting-methodology ordering, a subnetting worksheet, topology and
  device selection, command-output diagnosis, wireless configuration, firewall ACL
  ordering, and cable/media selection.
- **Exam interface**: countdown timer, Flag for Review, free navigation, and a Review
  Screen filtered by All / Flagged / Incomplete — with an end-exam warning for
  incomplete items.
- **Scoring on the 100–900 scale with 720 passing**, plus a per-domain breakdown showing
  exactly where you fell short.
- **Tutor mode** — untimed practice by domain, difficulty, and type with instant feedback,
  full explanations, and an exam tip on every question (PBQs give per-item feedback).
- **Study sheets** — common ports and protocols, the OSI model, and the CompTIA seven-step
  troubleshooting methodology.
- **Missed-questions deck** and score history with a pass-line trend chart.

## Running locally

- Easiest: double-click `index.html` — everything works from the file system.
- Or serve it: `start.bat` (Windows, uses Python), or `python -m http.server 8421`, then
  open http://localhost:8421.

## Extending the question bank

Questions live in `data/*.js` as plain JS objects pushed into a global `NETBANK`:

- `NETBANK.mc` — multiple-choice (single answer = an index; multi-select = an array of
  indices, requiring the complete set).
- `NETBANK.pbqs` — performance-based questions: a scenario `stem` plus `items`, each item
  either a `select` (dropdown) or a `fill` (text, accepting a list of acceptable answers).
  Each item is worth one point, so partial credit falls out naturally.

Every question carries a `domain` (1–5), a `diff` (`easy`/`medium`/`hard`), an `expl`
(explanation), and a `tip`. To add questions, follow the shapes in any existing data file,
give each a globally unique `id`, and add your file with a `<script>` tag in `index.html`.
Run `node --check data/yourfile.js` before loading — a syntax error silently drops the whole
file.

## Disclaimer

CompTIA® and Network+® are registered trademarks of CompTIA, Inc. This project is an
independent study tool and is not affiliated with, endorsed by, or connected to CompTIA.
CompTIA does not publish its scaled-score conversion; the 100–900 score here is an
approximation for study purposes and carries no official meaning.
