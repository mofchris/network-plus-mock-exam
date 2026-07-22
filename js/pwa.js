/* Service-worker registration. Byte-identical in both repos — same portability
   rule as sync.js and theme.js.

   Ported from BARE METAL src/main.tsx: register inside a load listener, and
   log-only on failure. There is deliberately no UI for a failed registration —
   the app works identically without the worker, it just won't be available
   offline, and a console entry keeps it loud enough to notice while debugging.

   Metal guards registration behind import.meta.env.PROD so its dev server runs
   uncached. The equivalent here is the file: guard: service workers are
   unsupported over file://, and both READMEs document opening index.html
   directly as a supported way to run the app. */
(function () {
  "use strict";

  if (location.protocol === "file:") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    // Relative on purpose: resolves against the document, so the worker's scope
    // is whatever directory the app is deployed under.
    navigator.serviceWorker.register("sw.js").catch(function (e) {
      console.error("NP: service worker registration failed", e);
    });
  });
})();
