# CompTIA Network+ (N10-009) Exam Simulator

A free, fully offline simulator of the **CompTIA Network+ N10-009** exam: realistic
question style and difficulty, performance-based questions with partial credit, and a
Pearson VUE-style interface. Anonymous by default — no account required, no build step.
Used anonymously, your data never leaves your browser.

Optionally, you can sign in with a username and a 6-digit PIN to sync your progress across
devices (the Network+ and GRE apps share one account); when signed in, your progress is also
stored on the sync server. At signup you're shown a recovery code **once** — it is the only
way to reset a forgotten PIN (there is no email recovery), so save it somewhere safe.

**Take it here:** open `index.html`, or use the hosted version on GitHub Pages.

**Install it:** on iOS, open the hosted version in Safari and tap **Share → Add
to Home Screen**. It then launches like a native app, with no browser chrome, and
works with no connection at all. Two things worth knowing: open it once while
online, since that first launch is when it caches itself; and sign in *before*
installing, because iOS gives an installed app its own storage separate from
Safari's, so signing in is what carries your progress across.

## What it does

- **Full mock exam**: 75 questions in 90 minutes, PBQs first, weighted to the official
  N10-009 domain percentages:

  | Domain | Weight |
  |---|---|
  | 1.0 Networking Concepts | 23% |
  | 2.0 Network Implementation | 20% |
  | 3.0 Network Operations | 19% |
  | 4.0 Network Security | 14% |
  | 5.0 Network Troubleshooting | 24% |

- **Performance-based questions** with **partial credit**, scored per item: port/protocol
  matching, troubleshooting-methodology ordering, a subnetting worksheet, topology and
  device selection, command-output diagnosis, wireless configuration, firewall ACL
  ordering, and cable/media selection.
- **Exam interface**: countdown timer, Flag for Review, free navigation, and a Review
  Screen filtered by All / Flagged / Incomplete, with an end-exam warning for
  incomplete items.
- **Scoring on the 100–900 scale with 720 passing**, plus a per-domain breakdown showing
  exactly where you fell short.
- **Tutor mode**: untimed practice by domain, difficulty, and type with instant feedback,
  full explanations, and an exam tip on every question (PBQs give per-item feedback).
- **Study sheets**: common ports and protocols, the OSI model, and the CompTIA seven-step
  troubleshooting methodology.
- **Missed-questions deck** and score history with a pass-line trend chart.
- **Dark mode**: follows your device setting automatically, with a header toggle
  (☀/☾/◐) to override it.


## The study course

The app now includes a **20-module course** that takes you from first principles to exam-ready:

| Unit | Covers |
|---|---|
| 1. Foundations | What a network is, the OSI model and encapsulation, topologies and traffic types, cables and connectors |
| 2. Addressing & Protocols | Binary, IPv4, **subnetting from scratch**, IPv6, ports, DNS, DHCP |
| 3. Building the Network | Switching/VLANs/STP, routing, wireless, appliances and cloud |
| 4. Operations & Security | Monitoring, availability and backups, security fundamentals, attacks and mitigations |
| 5. Troubleshooting | Methodology and tools, the symptom-to-cause map, command output analysis, PBQ tactics |

Each module ends with a quiz you must pass at **75%** to unlock the next one, and each unit ends
with a **cumulative checkpoint** that also re-tests earlier units. The full mock exam unlocks when
the course is complete. Every quiz question has a full explanation; retakes are unlimited and your
best score is kept.

## Running locally

- Easiest: double-click `index.html`. Everything works from the file system.
- Or serve it: `start.bat` (Windows, uses Python), or `python -m http.server 8421`, then
  open http://localhost:8421.

## Extending the question bank

Questions live in `data/*.js` as plain JS objects pushed into a global `NETBANK`:

- `NETBANK.mc`: multiple-choice (single answer = an index; multi-select = an array of
  indices, requiring the complete set).
- `NETBANK.pbqs`: performance-based questions: a scenario `stem` plus `items`, each item
  either a `select` (dropdown) or a `fill` (text, accepting a list of acceptable answers).
  Each item is worth one point, so partial credit falls out naturally.

Every question carries a `domain` (1–5), a `diff` (`easy`/`medium`/`hard`), an `expl`
(explanation), and a `tip`. To add questions, follow the shapes in any existing data file,
give each a globally unique `id`, and add your file with a `<script>` tag in `index.html`.
Run `node --check data/yourfile.js` before loading. A syntax error silently drops the whole
file.

## Disclaimer

CompTIA® and Network+® are registered trademarks of CompTIA, Inc. This project is an
independent study tool and is not affiliated with, endorsed by, or connected to CompTIA.
CompTIA does not publish its scaled-score conversion; the 100–900 score here is an
approximation for study purposes and carries no official meaning.
