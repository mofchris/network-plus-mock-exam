(function () {
  "use strict";

  var KEY = "study-theme";
  var mql = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var listeners = [];

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === "dark" || v === "light") return v;
    } catch (e) {}
    return "auto";
  }

  function write(mode) {
    try {
      if (mode === "auto") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) {}
  }

  function systemDark() {
    return !!(mql && mql.matches);
  }

  function resolve(mode) {
    if (mode === "dark") return "dark";
    if (mode === "light") return "light";
    return systemDark() ? "dark" : "light";
  }

  function apply(resolved) {
    document.documentElement.setAttribute("data-theme", resolved);
  }

  function current() {
    return resolve(read());
  }

  function emit() {
    var mode = read();
    var res = resolve(mode);
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](mode, res); } catch (e) {}
    }
  }

  // Pre-paint: stamp the attribute the moment this script runs in <head>,
  // before the stylesheet is parsed, so there is no white flash at night.
  apply(current());

  // Auto mode live-follows the OS. In an overridden mode the media change is
  // ignored (we re-read every time and only re-apply while still "auto").
  function onMedia() {
    if (read() === "auto") { apply(current()); emit(); }
  }
  if (mql) {
    if (mql.addEventListener) mql.addEventListener("change", onMedia);
    else if (mql.addListener) mql.addListener(onMedia);
  }

  window.StudyTheme = {
    mode: function () { return read(); },
    resolved: function () { return current(); },
    cycle: function () {
      var order = { auto: "dark", dark: "light", light: "auto" };
      var next = order[read()] || "dark";
      write(next);
      apply(resolve(next));
      emit();
      return next;
    },
    onChange: function (fn) {
      if (typeof fn === "function") {
        listeners.push(fn);
        try { fn(read(), current()); } catch (e) {}
      }
    }
  };
})();
