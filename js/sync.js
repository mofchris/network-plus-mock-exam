/* study-sync client: auth + cross-device progress sync.
   BYTE-IDENTICAL between the GRE and Network+ repos. All app-specifics
   enter through StudySync.initSync(ns, { app, load, save }).
   Single global (StudySync), "use strict" IIFE, same style as app.js. */
(function () {
  "use strict";

  /* ---------------- environment (no config files) ---------------- */

  var IS_PROD = typeof location !== "undefined" &&
    location.hostname === "mofchris.github.io";
  var WORKER_URL = IS_PROD
    ? "https://study-sync.mofchris.workers.dev"
    : "http://localhost:8787";
  var TURNSTILE_KEY = IS_PROD
    ? "0x4AAAAAAD0g5yt6l-g7L7_h"
    : "1x00000000000000000000AA"; // Cloudflare always-pass test key

  var AUTH_KEY = "study-sync-auth"; // shared across both apps (same origin)

  /* ---------------- session + meta storage ----------------
     These are the ONLY localStorage keys sync.js ever touches. It never
     reads or writes the progress blob itself — that goes through cfg.load /
     cfg.save so the app keeps its single write path. */

  function readAuth() {
    try {
      var raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (o && o.token) ? o : null;
    } catch (e) { return null; }
  }
  function writeAuth(obj) {
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(obj)); } catch (e) {}
  }
  function clearAuth() {
    try { localStorage.removeItem(AUTH_KEY); } catch (e) {}
  }
  function metaKey(app) { return "study-sync-meta-" + app; }
  function readMeta(app) {
    try {
      var o = JSON.parse(localStorage.getItem(metaKey(app)));
      return (o && typeof o.baseUpdatedAt === "number") ? o : { baseUpdatedAt: 0 };
    } catch (e) { return { baseUpdatedAt: 0 }; }
  }
  function writeMeta(app, obj) {
    try { localStorage.setItem(metaKey(app), JSON.stringify(obj)); } catch (e) {}
  }
  function clearMeta(app) {
    try { localStorage.removeItem(metaKey(app)); } catch (e) {}
  }

  /* ---------------- API client ----------------
     Every wrapper resolves to { status, body }. A network/parse failure
     resolves to { status: 0, body: {} } (never rejects) so callers can
     treat "offline" as just another status without try/catch at each site. */

  function request(method, path, opts) {
    opts = opts || {};
    var init = { method: method, headers: {} };
    if (opts.token) init.headers["authorization"] = "Bearer " + opts.token;
    if (opts.body != null) {
      init.headers["content-type"] = "application/json";
      init.body = JSON.stringify(opts.body);
    }
    return fetch(WORKER_URL + path, init).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        return { status: res.status, body: body };
      });
    }).catch(function () {
      return { status: 0, body: {} };
    });
  }

  function apiSignup(p)   { return request("POST", "/signup", { body: p }); }
  function apiLogin(p)    { return request("POST", "/login", { body: p }); }
  function apiResetPin(p) { return request("POST", "/reset-pin", { body: p }); }
  function apiGetProgress(app, token) {
    return request("GET", "/progress?app=" + app, { token: token });
  }
  function apiPutProgress(app, token, blobString, baseUpdatedAt) {
    return request("PUT", "/progress?app=" + app, {
      token: token,
      body: { blob: blobString, baseUpdatedAt: baseUpdatedAt }
    });
  }

  /* ---------------- merge (pure; parent spec §7) ---------------- */

  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
  function objOf(x) { return isObj(x) ? x : {}; }
  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }

  function mergeAttempts(a, b) {
    var map = {};
    var order = [];
    function add(arr) {
      (Array.isArray(arr) ? arr : []).forEach(function (x) {
        if (!x || x.date == null) return;
        var k = String(x.date);
        if (!(k in map)) { map[k] = x; order.push(x.date); }
      });
    }
    add(a); add(b);
    return order.sort(function (p, q) { return p < q ? -1 : p > q ? 1 : 0; })
      .map(function (d) { return map[String(d)]; });
  }

  function mergeCourse(a, b) {
    a = objOf(a); b = objOf(b);
    var out = { modules: {}, checkpoints: {}, read: {} };
    ["modules", "checkpoints"].forEach(function (bucket) {
      var la = objOf(a[bucket]), lb = objOf(b[bucket]);
      var ids = {};
      Object.keys(la).forEach(function (k) { ids[k] = 1; });
      Object.keys(lb).forEach(function (k) { ids[k] = 1; });
      Object.keys(ids).forEach(function (id) {
        var ra = objOf(la[id]), rb = objOf(lb[id]);
        out[bucket][id] = {
          best: Math.max(Number(ra.best) || 0, Number(rb.best) || 0),
          passed: !!(ra.passed || rb.passed)
        };
      });
    });
    // read: union of {id:true}
    var ra = objOf(a.read), rb = objOf(b.read);
    Object.keys(ra).forEach(function (k) { out.read[k] = ra[k]; });
    Object.keys(rb).forEach(function (k) { out.read[k] = rb[k]; });
    return out;
  }

  function merge(local, server) {
    // migration matrix (parent spec §8)
    if (!isObj(local) && !isObj(server)) return {};
    if (!isObj(server)) return clone(local);
    if (!isObj(local)) return clone(server);

    var ls = Number(local._savedAt) || 0;
    var ss = Number(server._savedAt) || 0;
    var localWins = ls > ss; // tie => server wins (safe default, §7)

    var out = {};
    var keys = {};
    Object.keys(local).forEach(function (k) { keys[k] = 1; });
    Object.keys(server).forEach(function (k) { keys[k] = 1; });

    Object.keys(keys).forEach(function (k) {
      if (k === "_savedAt") return;
      switch (k) {
        case "attempts":
          out.attempts = mergeAttempts(local.attempts, server.attempts); break;
        case "tutorSeen":
          out.tutorSeen = {};
          [objOf(local.tutorSeen), objOf(server.tutorSeen)].forEach(function (o) {
            Object.keys(o).forEach(function (id) { out.tutorSeen[id] = o[id]; });
          });
          break;
        case "course":
          out.course = mergeCourse(local.course, server.course); break;
        case "missed":
          out.missed = clone((localWins ? local.missed : server.missed) || []); break;
        case "recent":
          // recency winner; already app-capped when written, so no extra cap needed
          out.recent = clone((localWins ? local.recent : server.recent) || []); break;
        case "inprogress":
          out.inprogress = clone(localWins
            ? (local.inprogress != null ? local.inprogress : null)
            : (server.inprogress != null ? server.inprogress : null));
          break;
        default:
          // generic tolerance for any unknown field: most-recent-device-wins
          var inL = k in local, inS = k in server;
          out[k] = clone(localWins ? (inL ? local[k] : server[k]) : (inS ? server[k] : local[k]));
      }
    });

    out._savedAt = Math.max(ls, ss);
    return out;
  }

  /* ============ SYNC ENGINE (Task 4) ============ */

  /* ---------------- content equality (ignores _savedAt) ---------------- */

  function stripMeta(o) {
    if (!isObj(o)) return o;
    var c = {};
    Object.keys(o).forEach(function (k) { if (k !== "_savedAt") c[k] = o[k]; });
    return c;
  }
  function stableStr(o) {
    // deterministic stringify so key order never causes a false "changed"
    if (Array.isArray(o)) return "[" + o.map(stableStr).join(",") + "]";
    if (isObj(o)) {
      return "{" + Object.keys(o).sort().map(function (k) {
        return JSON.stringify(k) + ":" + stableStr(o[k]);
      }).join(",") + "}";
    }
    return JSON.stringify(o);
  }
  function sameContent(a, b) { return stableStr(stripMeta(a)) === stableStr(stripMeta(b)); }

  /* ============ HEADER WIDGET + ACCOUNT MODAL (Task 5 fills this) ============ */

  /* ============ AUTH MODAL (Task 6) ============ */

    /* ---------------- Turnstile lazy loader (spec §9.5) ---------------- */

    var tsLoading = null;
    function loadTurnstile() {
      if (typeof window !== "undefined" && window.turnstile) return Promise.resolve();
      if (tsLoading) return tsLoading;
      tsLoading = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true; s.defer = true;
        s.onload = function () { resolve(); };
        s.onerror = function () { tsLoading = null; reject(new Error("turnstile_load_failed")); };
        document.head.appendChild(s);
      });
      return tsLoading;
    }
    // Render a widget into `container`; report the solved token (or null) via onToken.
    function mountTurnstile(container, onToken) {
      loadTurnstile().then(function () {
        window.turnstile.render(container, {
          sitekey: TURNSTILE_KEY,
          callback: function (tok) { onToken(tok); },
          "error-callback": function () { onToken(null); },
          "expired-callback": function () { onToken(null); }
        });
      }).catch(function () { onToken(null); }); // fail closed: no token => submit refused
    }

    /* ---------------- error copy (spec §4.3) ---------------- */

    function authErrorMessage(status, body) {
      if (status === 0) return "Can't reach the sync server. Check your connection.";
      if (status === 401) return "Wrong username or PIN.";
      if (status === 409 && body && body.error === "username_taken") return "That username is taken.";
      if (status === 429) {
        var mins = Math.max(1, Math.ceil((Number(body && body.retryAfter) || 60) / 60));
        return "Too many attempts. Try again in ~" + mins + " minutes.";
      }
      if (status === 400) return (body && body.error) || "Please check your entries.";
      // 403 needsCaptcha is handled inline by the caller (renders Turnstile), not here.
      return "Something went wrong. Please try again.";
    }

  /* ---------------- initSync (grows across tasks) ---------------- */

  function initSync(ns, cfg) {
    var app = cfg.app;                 // "gre" | "netplus"
    var subs = [];
    var state = {
      signedIn: !!readAuth(),
      username: readAuth() ? readAuth().username : null,
      status: "idle",                  // idle | syncing | offline | error
      lastSyncedAt: 0,
      sessionExpired: false
    };
    var saveTimer = null;
    var running = false;
    var pending = false;               // a save landed while a cycle ran

    function notify() { subs.forEach(function (fn) { fn(state); }); }
    function setStatus(s) { state.status = s; notify(); }

    function subscribe(fn) {
      subs.push(fn);
      return function () { subs = subs.filter(function (f) { return f !== fn; }); };
    }
    function getState() { return state; }

    function setSession(auth) {
      writeAuth(auth);
      state.signedIn = true;
      state.username = auth.username;
      state.sessionExpired = false;
      state.status = "idle";
      notify();
      syncNow();
    }

    function signOut() {
      clearAuth();
      clearMeta(app);
      state.signedIn = false;
      state.username = null;
      state.sessionExpired = false;
      state.status = "idle";
      notify();
    }

    function onExpired() {
      clearAuth();
      clearMeta(app);
      state.signedIn = false;
      state.username = null;
      state.sessionExpired = true; // shown once in the account/header note
      state.status = "idle";
      notify();
    }

    // One PUT with bounded 409 re-merge retries. Returns a Promise<boolean pushed-ok>.
    function pushMerged(token, mergedObj, baseUpdatedAt, attempt) {
      var blobStr = JSON.stringify(cfg.load()); // push exactly what is now local
      return apiPutProgress(app, token, blobStr, baseUpdatedAt).then(function (r) {
        if (r.status === 200) {
          writeMeta(app, { baseUpdatedAt: r.body.updatedAt });
          state.lastSyncedAt = Date.now();
          return true;
        }
        if (r.status === 401) { onExpired(); return false; }
        if (r.status === 409 && attempt < 3) {
          var server2 = r.body.blob ? safeParse(r.body.blob) : null;
          var merged2 = merge(cfg.load(), server2);
          if (!sameContent(merged2, cfg.load())) cfg.save(merged2, true);
          return pushMerged(token, merged2, r.body.updatedAt || 0, attempt + 1);
        }
        if (r.status === 0) { setStatus("offline"); return false; }
        setStatus("error"); return false;
      });
    }

    function safeParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }

    function syncNow() {
      var auth = readAuth();
      if (!auth) return Promise.resolve();      // ANONYMOUS INVARIANT: no token => no request
      if (running) { pending = true; return Promise.resolve(); }
      running = true;
      setStatus("syncing");

      return apiGetProgress(app, auth.token).then(function (g) {
        if (g.status === 401) { onExpired(); return false; }
        if (g.status === 0) { setStatus("offline"); return false; }
        if (g.status !== 200) { setStatus("error"); return false; }

        // Corrupt server blob => keep local, treat as server-empty (spec §10).
        var server = g.body.blob ? safeParse(g.body.blob) : null;
        var base = Number(g.body.updatedAt) || 0;
        var local = cfg.load();
        var merged = merge(local, server);

        if (!sameContent(merged, local)) cfg.save(merged, true);
        if (server && sameContent(merged, server)) {
          // nothing to push; we are already in sync with the server
          writeMeta(app, { baseUpdatedAt: base });
          state.lastSyncedAt = Date.now();
          return true;
        }
        return pushMerged(auth.token, merged, base, 1);
      }).then(function (ok) {
        if (state.status === "syncing") setStatus(ok ? "idle" : "error");
        running = false;
        if (pending) { pending = false; syncNow(); }
      }).catch(function () {
        setStatus("offline");
        running = false;
      });
    }

    function onLocalSave() {
      if (!readAuth()) return;                  // anonymous: never schedules a request
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { saveTimer = null; syncNow(); }, 3000);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", function () { if (readAuth()) syncNow(); });
    }

      /* ---------------- header widget ---------------- */

      var headerNode = null;   // the <div> chrome() hands us; re-rendered on notify

      function fmtAgo(ts) {
        if (!ts) return "just now";
        var s = Math.round((Date.now() - ts) / 1000);
        if (s < 60) return "just now";
        var m = Math.round(s / 60);
        if (m < 60) return m + " min ago";
        var h = Math.round(m / 60);
        return h + " h ago";
      }

      function renderHeader() {
        if (!headerNode) return;
        var el = ns.el;
        headerNode.innerHTML = "";

        if (!state.signedIn) {
          headerNode.appendChild(el("button", {
            class: "btn soft syncbtn",
            onclick: function () { openAuthModal("signin"); }
          }, "Sign in to sync"));
          if (state.sessionExpired) {
            headerNode.appendChild(el("span", { class: "syncnote" }, "Session expired — sign in again"));
          }
          return;
        }

        var label = state.status === "syncing" ? "Syncing…"
          : state.status === "offline" ? "Offline"
          : state.status === "error" ? "Error" : "Synced";
        var pill = el("button", {
          class: "syncpill",
          title: label,
          onclick: function () { openAccountModal(); }
        },
          el("span", { class: "dot " + state.status }),
          el("span", { class: "u" }, state.username));
        headerNode.appendChild(pill);
      }

      function openAccountModal() {
        var el = ns.el;
        var body = el("div", {},
          el("p", {}, "Signed in as ", el("strong", {}, state.username), "."),
          el("p", { class: "syncmeta" },
            state.status === "offline" ? "Offline — will retry when reconnected."
            : "Last synced " + fmtAgo(state.lastSyncedAt) + "."));
        var m = ns.modal("Account", "", [
          { label: "Sign out", danger: true, action: function () { signOut(); } },
          { label: "Close", secondary: true }
        ], { intent: "info" });
        // inject the live body above the button row
        var veil = document.body.lastElementChild;
        var mbody = veil.querySelector(".mbody");
        if (mbody) mbody.appendChild(body);
        return m;
      }

      function mountHeader(node) {
        headerNode = node;
        renderHeader();
      }

      // keep the header in sync with engine state
      subscribe(function () { renderHeader(); });

      /* ---------------- auth modal ---------------- */

      var UNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;
      var PIN_RE = /^[0-9]{6}$/;

      function openAuthModal(startTab) {
        var el = ns.el;
        var tab = startTab === "signup" ? "signup" : "signin";
        var mode = tab;                 // "signin" | "signup" | "reset"
        var tsToken = null;             // solved Turnstile token, when required/present
        var showCaptcha = false;        // signin: only after a 403
        var submitting = false;         // in-flight guard: blocks double-submit (click + Enter)

        var modalRef = ns.modal("Sync your progress", "", [], {});
        var veil = document.body.lastElementChild;
        var mbody = veil.querySelector(".mbody");

        // ---- Escape guard used ONLY for the recovery handoff ----
        // Attached only while the un-dismissable handoff state is shown, and
        // torn down however the modal closes. Attaching at open would leak the
        // listener on an ordinary Escape-dismiss, because ns.modal's own Escape
        // handler calls its INTERNAL close, not our wrapped modalRef.close.
        // window-capture fires before ns.modal's document-capture Escape
        // handler, so Escape is swallowed during that one state (and nowhere
        // else, since the listener is only attached then).
        var guardOn = false;
        function escGuard(e) {
          if (guardOn && e.key === "Escape") { e.stopImmediatePropagation(); e.preventDefault(); }
        }
        function addGuard() {
          guardOn = true;
          if (typeof window !== "undefined") window.addEventListener("keydown", escGuard, true);
        }
        function removeGuard() {
          guardOn = false;
          if (typeof window !== "undefined") window.removeEventListener("keydown", escGuard, true);
        }
        // Pending 1s reveal timers, one per pinField, cleared on modal teardown so
        // a late timeout can't fire draw() against detached nodes after close.
        var pinCleanups = [];
        var origClose = modalRef.close;
        modalRef.close = function () {
          removeGuard();
          pinCleanups.forEach(function (fn) { fn(); });
          origClose();
        };

        function field(id, labelText) {
          var input = el("input", {
            id: id, type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false"
          });
          return el("div", { class: "authfield" }, el("label", { for: id }, labelText), input);
        }

        // Segmented six-cell PIN entry. ONE real <input> is the source of truth;
        // the six cells are a purely visual render of its value + focus state.
        // Reused by every PIN field (sign-in, signup, signup-confirm, reset, reset-confirm).
        function pinField(id, labelText) {
          var input = el("input", {
            id: id, type: "text", class: "pin-input",
            inputmode: "numeric", maxlength: "6",
            autocomplete: "off", autocapitalize: "off", spellcheck: "false",
            "aria-label": labelText
          });
          var cells = [];
          var cellRow = el("div", { class: "pin-cells", "aria-hidden": "true" });
          for (var i = 0; i < 6; i++) {
            var c = el("div", { class: "pin-cell" });
            cells.push(c);
            cellRow.appendChild(c);
          }

          var revealIndex = -1;      // digit shown as itself (last typed), else masked
          var revealTimer = null;
          var prevLen = 0;
          pinCleanups.push(function () {
            if (revealTimer) { clearTimeout(revealTimer); revealTimer = null; }
          });

          function draw(focused) {
            var v = input.value;
            var len = v.length;
            // active cell: the next empty cell, or the last cell when full
            var active = focused ? (len >= 6 ? 5 : len) : -1;
            for (var i = 0; i < 6; i++) {
              var masked = (i < len) && (i !== revealIndex); // filled but not the revealed digit
              cells[i].className = "pin-cell" + (i === active ? " active" : "") + (masked ? " masked" : "");
              if (i < len) cells[i].textContent = (i === revealIndex) ? v.charAt(i) : "•";
              else cells[i].textContent = "";
            }
          }

          input.addEventListener("input", function () {
            var cleaned = input.value.replace(/\D/g, "").slice(0, 6);
            if (cleaned !== input.value) input.value = cleaned;
            var len = cleaned.length;
            if (revealTimer) { clearTimeout(revealTimer); revealTimer = null; }
            if (len > prevLen) {
              // a digit was added: briefly reveal it, then mask (bank PIN-pad behavior)
              revealIndex = len - 1;
              revealTimer = setTimeout(function () {
                revealIndex = -1; draw(document.activeElement === input);
              }, 1000);
            } else {
              revealIndex = -1;      // backspace / paste-shrink never re-reveals
            }
            prevLen = len;
            draw(true);
          });
          input.addEventListener("focus", function () { draw(true); });
          input.addEventListener("blur", function () {
            revealIndex = -1;
            if (revealTimer) { clearTimeout(revealTimer); revealTimer = null; }
            draw(false);
          });

          var wrap = el("div", { class: "pin-wrap" }, cellRow, input);
          wrap.addEventListener("click", function () { input.focus(); }); // any cell focuses input
          draw(false);
          return el("div", { class: "authfield pinfield" }, el("label", { for: id }, labelText), wrap);
        }

        function render() {
          mbody.innerHTML = "";
          tsToken = null;

          if (mode === "reset") return renderReset();

          var tabs = el("div", { class: "authtabs" },
            el("button", { class: mode === "signin" ? "on" : "", onclick: function () { mode = "signin"; showCaptcha = false; render(); } }, "Sign in"),
            el("button", { class: mode === "signup" ? "on" : "", onclick: function () { mode = "signup"; render(); } }, "Create account"));
          mbody.appendChild(tabs);

          mbody.appendChild(field("au-user", "Username"));
          mbody.appendChild(pinField("au-pin", "6-digit PIN"));
          if (mode === "signup") mbody.appendChild(pinField("au-pin2", "Confirm PIN"));

          var err = el("p", { class: "autherr" }, "");
          var tsBox = el("div", { class: "ts-container" });
          // signup always shows Turnstile; signin only after a 403
          if (mode === "signup" || showCaptcha) {
            if (mode === "signin") err.textContent = "Quick check — please verify below and try again.";
            mountTurnstile(tsBox, function (tok) { tsToken = tok; });
          }

          var submit = el("button", { class: "btn wide", onclick: function () { onSubmit(err, submit); } },
            mode === "signup" ? "Create account" : "Sign in");

          mbody.appendChild(err);
          mbody.appendChild(tsBox);
          mbody.appendChild(submit);

          if (mode === "signin") {
            mbody.appendChild(el("button", {
              class: "linkish authlink", onclick: function () { mode = "reset"; render(); }
            }, "Forgot PIN?"));
          }
          bindEnter(function () { onSubmit(err, submit); });
          focusFirst();
        }

        function renderReset() {
          mbody.appendChild(el("h4", { style: "margin-top:0" }, "Reset your PIN"));
          mbody.appendChild(field("au-user", "Username"));
          var rc = field("au-rc", "Recovery code");
          rc.querySelector("input").style.fontFamily = "var(--font-mono)";
          rc.querySelector("input").addEventListener("input", function (e) {
            e.target.value = e.target.value.toUpperCase();
          });
          mbody.appendChild(rc);
          mbody.appendChild(pinField("au-pin", "New 6-digit PIN"));
          mbody.appendChild(pinField("au-pin2", "Confirm PIN"));
          var err = el("p", { class: "autherr" }, "");
          var tsBox = el("div", { class: "ts-container" });
          mountTurnstile(tsBox, function (tok) { tsToken = tok; }); // reset always needs Turnstile
          mbody.appendChild(err);
          mbody.appendChild(tsBox);
          var reset = el("button", { class: "btn wide", onclick: function () { onReset(err, reset); } }, "Reset PIN");
          mbody.appendChild(reset);
          mbody.appendChild(el("button", { class: "linkish authlink", onclick: function () { mode = "signin"; render(); } }, "Back to sign in"));
          bindEnter(function () { onReset(err, reset); });
          focusFirst();
        }

        function val(id) { var n = document.getElementById(id); return n ? n.value.trim() : ""; }
        function focusFirst() { var f = mbody.querySelector("input"); if (f) f.focus(); }
        // Enter submits from any field. Inputs are recreated on every render, so
        // handlers never stack. The submitting flag makes the Enter path share the
        // double-submit guard with the disabled button.
        function bindEnter(submitFn) {
          Array.prototype.forEach.call(mbody.querySelectorAll("input"), function (inp) {
            inp.addEventListener("keydown", function (e) {
              if (e.key === "Enter") { e.preventDefault(); submitFn(); }
            });
          });
        }

        // Enter/click both route here; setBusy toggles the in-flight guard so a
        // second submit can't fire while the worker request (400ms+) is settling.
        function setBusy(btn, busy) { submitting = busy; if (btn) btn.disabled = busy; }

        function onSubmit(err, submit) {
          if (submitting) return;
          var u = val("au-user"), pin = val("au-pin");
          if (!UNAME_RE.test(u)) { err.textContent = "Username must be 3-20 letters, numbers, _ or -."; return; }
          if (!PIN_RE.test(pin)) { err.textContent = "PIN must be exactly 6 digits."; return; }
          if (mode === "signup") {
            if (pin !== val("au-pin2")) { err.textContent = "PINs don't match."; return; }
            if (!tsToken) { err.textContent = "Please complete the verification."; return; }
            err.textContent = "";
            setBusy(submit, true);
            apiSignup({ username: u, pin: pin, turnstile: tsToken }).then(function (r) {
              if (r.status === 200) { showRecovery(r.body.token, r.body.username, r.body.recoveryCode); return; }
              setBusy(submit, false);
              handleAuthFail(r, err);
            });
          } else {
            if (showCaptcha && !tsToken) { err.textContent = "Please complete the verification."; return; }
            err.textContent = "";
            setBusy(submit, true);
            var payload = { username: u, pin: pin };
            if (tsToken) payload.turnstile = tsToken;
            apiLogin(payload).then(function (r) {
              if (r.status === 200) { modalRef.close(); setSession({ token: r.body.token, username: r.body.username }); return; }
              setBusy(submit, false);
              handleAuthFail(r, err);
            });
          }
        }

        function onReset(err, submit) {
          if (submitting) return;
          var u = val("au-user"), rc = val("au-rc"), pin = val("au-pin");
          if (!UNAME_RE.test(u)) { err.textContent = "Enter your username."; return; }
          if (!rc) { err.textContent = "Enter your recovery code."; return; }
          if (!PIN_RE.test(pin)) { err.textContent = "New PIN must be exactly 6 digits."; return; }
          if (pin !== val("au-pin2")) { err.textContent = "PINs don't match."; return; }
          if (!tsToken) { err.textContent = "Please complete the verification."; return; }
          err.textContent = "";
          setBusy(submit, true);
          apiResetPin({ username: u, recoveryCode: rc, newPin: pin, turnstile: tsToken }).then(function (r) {
            if (r.status === 200) { showRecovery(r.body.token, r.body.username, r.body.recoveryCode); return; }
            setBusy(submit, false);
            handleAuthFail(r, err);
          });
        }

        function handleAuthFail(r, err) {
          if (r.status === 403 && r.body && r.body.needsCaptcha) {
            // signin: turn the captcha on and re-render so the user can verify + retry
            if (mode === "signin") { showCaptcha = true; render(); return; }
            err.textContent = "Quick check — please verify below and try again.";
            return;
          }
          err.textContent = authErrorMessage(r.status, r.body);
        }

        // ---- recovery-code handoff (signup + reset success) ----
        function showRecovery(token, username, code) {
          addGuard();                         // Escape disabled for this un-dismissable state
          mbody.innerHTML = "";
          mbody.appendChild(el("p", {}, "Your account is ready. Save this recovery code:"));
          mbody.appendChild(el("div", { class: "recovery-code" }, code));
          mbody.appendChild(el("p", { class: "recovery-warn" },
            "This is the only way to recover your account if you forget your PIN. It will never be shown again."));

          var copyBtn = el("button", { class: "btn secondary wide", onclick: function () {
            if (navigator.clipboard) navigator.clipboard.writeText(code).then(function () { copyBtn.textContent = "Copied"; }, function () {});
            else copyBtn.textContent = code;
          } }, "Copy code");
          mbody.appendChild(copyBtn);

          var savedBtn = el("button", { class: "btn wide", style: "margin-top:10px", onclick: function () {
            modalRef.close();                 // wrapped close() tears down the Escape guard
            setSession({ token: token, username: username });
          } }, "I've saved my code");
          mbody.appendChild(savedBtn);
          savedBtn.focus();                   // move focus into the handoff
        }

        render();
      }

    var api = {
      onLocalSave: onLocalSave,
      syncNow: syncNow,
      signOut: signOut,
      setSession: setSession,
      subscribe: subscribe,
      getState: getState,
      mountHeader: mountHeader,
      openAuthModal: openAuthModal,
      _ns: ns, _cfg: cfg
    };

    // Boot trigger (spec §8): if already signed in, run one cycle. Anonymous => nothing.
    if (readAuth()) { syncNow(); }
    return api;
  }

  /* ---------------- exports ---------------- */

  var StudySync = { initSync: initSync, merge: merge };
  if (typeof window !== "undefined") { window.StudySync = StudySync; }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { merge: merge, initSync: initSync };
  }
})();
