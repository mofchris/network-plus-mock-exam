import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../tools/build-sw.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("committed sw.js matches generator output", () => {
  const expected = build(ROOT).source;
  // Normalise the same way build() hashes text: git's core.autocrlf smudges
  // sw.js to CRLF on clone, checkout and restore, so a raw string compare
  // reports "stale" on a tree git itself calls clean. Line endings in a
  // service worker are semantically inert, so normalising loses nothing.
  const actual = readFileSync(join(ROOT, "sw.js"), "utf8").replace(/\r\n/g, "\n");
  assert.equal(actual, expected, "sw.js is stale — run: node tools/build-sw.mjs");
});

test("precache covers every local script and stylesheet in index.html", () => {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !/^(https?:)?\/\//.test(u));
  const { urls } = build(ROOT);
  assert.ok(refs.length > 10, "expected index.html to reference many local files");
  for (const ref of refs) {
    assert.ok(urls.includes(ref), `${ref} is referenced by index.html but not precached`);
  }
});

test("precache includes every bundled font", () => {
  const { urls } = build(ROOT);
  const fonts = urls.filter((u) => u.endsWith(".woff2"));
  assert.equal(fonts.length, 7, "all seven bundled woff2 files must be precached");
});

// Asserted as a positive allowlist, not a blocklist of known-bad prefixes. A
// blocklist that only rejects docs|test|tools passes happily when README.md or
// start.bat is added to the precache, and passes a deploy-specific prefix like
// "gre-mock-exam-simulator/css/..." that would break cache.addAll on any fork.
test("precache contains only allowlisted directories", () => {
  const ALLOWED = /^(css|js|data|fonts|icons)\//;
  for (const u of build(ROOT).urls) {
    if (u === "./" || u === "manifest.webmanifest") continue;
    assert.ok(ALLOWED.test(u), `${u} is outside the allowlisted directories`);
  }
});

test("precache paths are relative and the shell is scope-relative", () => {
  const { urls } = build(ROOT);
  assert.equal(urls[0], "./", "the shell must be './' so it resolves against the worker scope");
  for (const u of urls) {
    assert.ok(!u.startsWith("/"), `${u} must be relative so forks keep working`);
  }
});
