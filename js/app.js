/* Network+ Exam Simulator — shell, router, storage. Loads LAST; other modules
   must guard shared sub-objects (NP.screens etc.) at load time. */
(function () {
  "use strict";
  const NP = window.NP = window.NP || {};

  /* ---------------- storage ---------------- */

  const Store = {
    key: "netplus-sim-v1",
    data: null,
    load() {
      try { this.data = JSON.parse(localStorage.getItem(this.key)) || null; }
      catch (e) { this.data = null; }
      if (!this.data) this.data = {};
      this.data.attempts = this.data.attempts || [];
      this.data.missed = this.data.missed || [];
      this.data.recent = this.data.recent || [];
      this.data.inprogress = this.data.inprogress || null;
      return this.data;
    },
    save() {
      try { localStorage.setItem(this.key, JSON.stringify(this.data)); }
      catch (e) { /* keep running in-memory */ }
    }
  };
  NP.store = Store;
  Store.load();

  /* ---------------- DOM helpers ---------------- */

  NP.el = function (tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    for (const kid of kids) {
      if (kid == null) continue;
      n.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    }
    return n;
  };

  NP.esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  NP.modal = function (title, bodyHTML, buttons) {
    const veil = NP.el("div", { class: "modal-veil" });
    const box = NP.el("div", { class: "modal" });
    box.appendChild(NP.el("h3", { html: title }));
    box.appendChild(NP.el("div", { html: bodyHTML }));
    const row = NP.el("div", { class: "btnrow" });
    (buttons || [{ label: "OK" }]).forEach(b => {
      row.appendChild(NP.el("button", {
        class: "bigbtn" + (b.secondary ? " secondary" : ""),
        onclick: () => { document.body.removeChild(veil); if (b.action) b.action(); }
      }, b.label));
    });
    box.appendChild(row);
    veil.appendChild(box);
    document.body.appendChild(veil);
  };

  NP.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  NP.fmtTime = function (sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const mm = String(m).padStart(2, "0"), ss = String(s).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
  };

  NP.DOMAINS = {
    1: "1.0 Networking Concepts",
    2: "2.0 Network Implementation",
    3: "3.0 Network Operations",
    4: "4.0 Network Security",
    5: "5.0 Network Troubleshooting"
  };

  /* ---------------- question index ---------------- */

  NP.buildIndex = function () {
    const B = window.NETBANK;
    const ix = {};
    (B.mc || []).forEach(q => { ix[q.id] = q; });
    (B.pbqs || []).forEach(q => { ix[q.id] = q; });
    NP.byId = ix;
  };

  /* ---------------- router / chrome ---------------- */

  const app = document.getElementById("app");
  NP.show = function (fn) {
    app.innerHTML = "";
    fn(app);
    window.scrollTo(0, 0);
  };

  NP.chrome = function (sub) {
    const bar = NP.el("div", { class: "topbar" },
      NP.el("div", { class: "brand" }, "CompTIA Network+ (N10-009) — Exam Simulator",
        NP.el("small", null, sub || "Practice simulator — not affiliated with CompTIA")),
      NP.el("div", { class: "meta" },
        NP.el("button", { class: "tbtn", onclick: () => NP.show(NP.screens.home) }, "Home")));
    const stage = NP.el("div", { class: "stage" });
    const inner = NP.el("div", { class: "stage-inner" });
    stage.appendChild(inner);
    return { bar, stage, inner };
  };

  /* ---------------- screens ---------------- */

  NP.screens = NP.screens || {};

  NP.screens.home = function (root) {
    const { bar, stage, inner } = NP.chrome();
    root.appendChild(bar); root.appendChild(stage);

    inner.appendChild(NP.el("h1", { class: "screen-title" }, "CompTIA Network+ N10-009 — Exam Simulator"));
    inner.appendChild(NP.el("p", { class: "screen-sub" },
      "Full 75-question timed mocks with performance-based questions, Pearson-style interface, and 100–900 scoring — plus a tutor mode to learn before you test. Runs entirely in your browser."));

    const ip = Store.data.inprogress;
    if (ip) {
      const card = NP.el("div", { class: "card" });
      card.appendChild(NP.el("h3", null, "Exam in progress"));
      card.appendChild(NP.el("p", null,
        `Unfinished mock from ${new Date(ip.startedAt).toLocaleString()} — ` +
        `${NP.fmtTime(ip.remaining)} remaining. The clock only runs while the exam is open.`));
      const row = NP.el("div", { class: "btnrow" });
      row.appendChild(NP.el("button", { class: "bigbtn", onclick: () => NP.exam.resume() }, "Resume exam"));
      row.appendChild(NP.el("button", {
        class: "bigbtn secondary", onclick: () => {
          NP.modal("Discard exam?", "<p>The in-progress attempt will be deleted and not scored.</p>", [
            { label: "Discard", action: () => { Store.data.inprogress = null; Store.save(); NP.show(NP.screens.home); } },
            { label: "Keep it", secondary: true }
          ]);
        }
      }, "Discard"));
      card.appendChild(row);
      inner.appendChild(card);
    }

    const grid = NP.el("div", { class: "home-grid" });
    const tile = (em, h, p, fn) => grid.appendChild(NP.el("button", { class: "home-tile", onclick: fn },
      NP.el("div", { class: "em" }, em), NP.el("h3", null, h), NP.el("p", null, p)));

    tile("🖥️", "Take a Full Mock Exam",
      "75 questions, 90 minutes, PBQs first — domain-weighted like the real N10-009, with flag-for-review and the 720 passing line.",
      () => NP.exam.startIntro());
    tile("🎓", "Tutor Mode",
      "Untimed practice by domain, difficulty, and type with instant feedback and full explanations — including PBQs.",
      () => NP.show(NP.screens.tutor));
    tile("📚", "Study Sheets",
      "The three things every candidate drills: common ports & protocols, the OSI model, and the CompTIA troubleshooting methodology.",
      () => NP.show(NP.screens.sheets));
    tile("📈", "Score History",
      "Past attempts with scaled scores, pass/fail, domain breakdowns, and full question review.",
      () => NP.show(NP.screens.history));
    tile("❌", "Missed Questions Deck",
      "Everything you've gotten wrong, collected for re-drilling until it sticks.",
      () => NP.show(NP.screens.missed));
    inner.appendChild(grid);

    const B = window.NETBANK;
    const pbqItems = (B.pbqs || []).reduce((s, p) => s + p.items.length, 0);
    inner.appendChild(NP.el("p", { class: "footnote" },
      `Question bank: ${(B.mc || []).length} multiple-choice · ${(B.pbqs || []).length} PBQs (${pbqItems} scored items). ` +
      "Exams assemble randomly with domain weighting and repeat-avoidance. " +
      "CompTIA® and Network+® are registered trademarks of CompTIA, Inc. This simulator is an independent study tool, not affiliated with or endorsed by CompTIA. Scores are estimates."));
  };

  NP.screens.history = function (root) {
    const { bar, stage, inner } = NP.chrome("Score History");
    root.appendChild(bar); root.appendChild(stage);
    inner.appendChild(NP.el("h1", { class: "screen-title" }, "Score History"));
    const at = Store.data.attempts;
    if (!at.length) {
      inner.appendChild(NP.el("p", { class: "screen-sub" }, "No completed mocks yet."));
      return;
    }
    inner.appendChild(NP.results.trendChart(at));
    at.slice().reverse().forEach((a, ri) => {
      const i = at.length - 1 - ri;
      const row = NP.el("div", { class: "attempt-row" });
      row.appendChild(NP.el("div", null, NP.el("strong", null, `Attempt ${i + 1}`), ` — ${new Date(a.date).toLocaleString()}`));
      row.appendChild(NP.el("div", null,
        NP.el("strong", { style: "color:" + (a.pass ? "var(--good)" : "var(--bad)") }, a.pass ? "PASS" : "FAIL"),
        ` · ${a.scaled}/900`));
      row.appendChild(NP.el("button", { class: "linkish", onclick: () => NP.results.showSaved(i) }, "View report"));
      inner.appendChild(row);
    });
  };

  NP.screens.missed = function (root) {
    const { bar, stage, inner } = NP.chrome("Missed Questions");
    root.appendChild(bar); root.appendChild(stage);
    inner.appendChild(NP.el("h1", { class: "screen-title" }, "Missed Questions Deck"));
    const ids = Store.data.missed.filter(id => NP.byId[id]);
    if (!ids.length) {
      inner.appendChild(NP.el("p", { class: "screen-sub" }, "Nothing here yet — misses from mocks and tutor mode land here automatically."));
      return;
    }
    inner.appendChild(NP.el("p", { class: "screen-sub" },
      `${ids.length} question${ids.length === 1 ? "" : "s"} to re-drill. Answer one correctly here and it graduates out.`));
    const row = NP.el("div", { class: "btnrow" });
    row.appendChild(NP.el("button", { class: "bigbtn", onclick: () => NP.tutor.startDeck(ids) }, "Drill the deck"));
    row.appendChild(NP.el("button", {
      class: "bigbtn secondary", onclick: () => {
        NP.modal("Clear deck?", "<p>All missed questions will be removed.</p>", [
          { label: "Clear", action: () => { Store.data.missed = []; Store.save(); NP.show(NP.screens.missed); } },
          { label: "Cancel", secondary: true }]);
      }
    }, "Clear deck"));
    inner.appendChild(row);
    const list = NP.el("div", { style: "margin-top:18px" });
    ids.forEach(id => {
      const q = NP.byId[id];
      const d = NP.el("div", { class: "attempt-row" });
      d.appendChild(NP.el("div", null,
        NP.el("span", { class: "pill" }, q.items ? "PBQ" : (Array.isArray(q.answer) ? "Multi-select" : "Multiple choice")),
        NP.el("span", { class: "pill" }, NP.DOMAINS[q.domain] || ""),
        NP.el("span", { class: "pill" }, q.diff)));
      const t = (q.title || q.text || "").replace(/<[^>]+>/g, "");
      d.appendChild(NP.el("div", { style: "flex:1;margin:0 14px;color:#5b6572;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" },
        t.slice(0, 90) + (t.length > 90 ? "…" : "")));
      list.appendChild(d);
    });
    inner.appendChild(list);
  };

  NP.screens.sheets = function (root) {
    const { bar, stage, inner } = NP.chrome("Study Sheets");
    root.appendChild(bar); root.appendChild(stage);
    inner.appendChild(NP.el("h1", { class: "screen-title" }, "Study Sheets"));
    inner.appendChild(NP.el("p", { class: "screen-sub" }, "The reference tables the exam assumes you know cold."));

    const ports = NP.el("div", { class: "card" });
    ports.innerHTML = `<h3>Common ports & protocols</h3>
      <table class="sheet-table">
        <tr><th>Port</th><th>Protocol</th><th>Use</th></tr>
        <tr><td>20/21</td><td>FTP (TCP)</td><td>File transfer (20 data, 21 control)</td></tr>
        <tr><td>22</td><td>SSH / SFTP (TCP)</td><td>Secure remote shell & file transfer</td></tr>
        <tr><td>23</td><td>Telnet (TCP)</td><td>Insecure remote shell — avoid</td></tr>
        <tr><td>25</td><td>SMTP (TCP)</td><td>Mail transfer between servers</td></tr>
        <tr><td>53</td><td>DNS (UDP/TCP)</td><td>Name resolution (TCP for zone transfers)</td></tr>
        <tr><td>67/68</td><td>DHCP (UDP)</td><td>Address assignment (67 server, 68 client)</td></tr>
        <tr><td>69</td><td>TFTP (UDP)</td><td>Trivial file transfer (firmware, configs)</td></tr>
        <tr><td>80</td><td>HTTP (TCP)</td><td>Web, unencrypted</td></tr>
        <tr><td>110</td><td>POP3 (TCP)</td><td>Mail retrieval (download-and-delete)</td></tr>
        <tr><td>123</td><td>NTP (UDP)</td><td>Time synchronization</td></tr>
        <tr><td>143</td><td>IMAP (TCP)</td><td>Mail retrieval (server-side folders)</td></tr>
        <tr><td>161/162</td><td>SNMP (UDP)</td><td>Device monitoring (162 = traps)</td></tr>
        <tr><td>389</td><td>LDAP (TCP)</td><td>Directory services</td></tr>
        <tr><td>443</td><td>HTTPS (TCP)</td><td>Web over TLS</td></tr>
        <tr><td>445</td><td>SMB (TCP)</td><td>Windows file/print sharing</td></tr>
        <tr><td>514</td><td>Syslog (UDP)</td><td>Centralized logging</td></tr>
        <tr><td>587</td><td>SMTP-submission (TCP)</td><td>Authenticated mail submission (TLS)</td></tr>
        <tr><td>636</td><td>LDAPS (TCP)</td><td>LDAP over TLS</td></tr>
        <tr><td>1433</td><td>SQL Server (TCP)</td><td>Microsoft database</td></tr>
        <tr><td>3389</td><td>RDP (TCP)</td><td>Remote Desktop</td></tr>
        <tr><td>5060/5061</td><td>SIP (TCP/UDP)</td><td>VoIP call setup (5061 = TLS)</td></tr>
      </table>`;
    inner.appendChild(ports);

    const osi = NP.el("div", { class: "card" });
    osi.innerHTML = `<h3>OSI model</h3>
      <table class="sheet-table">
        <tr><th>#</th><th>Layer</th><th>Unit</th><th>Examples / devices</th></tr>
        <tr><td>7</td><td>Application</td><td>Data</td><td>HTTP, DNS, SMTP</td></tr>
        <tr><td>6</td><td>Presentation</td><td>Data</td><td>TLS, encoding, compression</td></tr>
        <tr><td>5</td><td>Session</td><td>Data</td><td>Session setup/teardown, API sessions</td></tr>
        <tr><td>4</td><td>Transport</td><td>Segment</td><td>TCP, UDP, port numbers</td></tr>
        <tr><td>3</td><td>Network</td><td>Packet</td><td>IP, ICMP, routers</td></tr>
        <tr><td>2</td><td>Data Link</td><td>Frame</td><td>Ethernet, MAC addresses, switches</td></tr>
        <tr><td>1</td><td>Physical</td><td>Bit</td><td>Cables, radio, hubs, transceivers</td></tr>
      </table>
      <p style="color:var(--muted)">Mnemonic (bottom-up): <em>Please Do Not Throw Sausage Pizza Away</em>.</p>`;
    inner.appendChild(osi);

    const ts = NP.el("div", { class: "card" });
    ts.innerHTML = `<h3>CompTIA troubleshooting methodology (know the order)</h3>
      <ol style="font-size:14.5px;line-height:1.7">
        <li><b>Identify the problem</b> — gather information, question users, determine what changed, duplicate if possible.</li>
        <li><b>Establish a theory of probable cause</b> — question the obvious; consider multiple approaches (top-down/bottom-up OSI).</li>
        <li><b>Test the theory</b> — if confirmed, plan next steps; if not, establish a new theory or escalate.</li>
        <li><b>Establish a plan of action</b> and identify potential effects.</li>
        <li><b>Implement the solution</b> or escalate as necessary.</li>
        <li><b>Verify full system functionality</b> and, if applicable, implement preventive measures.</li>
        <li><b>Document</b> findings, actions, outcomes, and lessons learned.</li>
      </ol>`;
    inner.appendChild(ts);
  };

  /* ---------------- boot ---------------- */

  NP.buildIndex();
  NP.show(NP.screens.home);
})();
