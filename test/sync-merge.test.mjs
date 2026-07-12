import { test } from "node:test";
import assert from "node:assert/strict";
import pkg from "../js/sync.js";
const { merge } = pkg;

const base = () => ({
  attempts: [], missed: [], recent: [], inprogress: null,
  tutorSeen: {}, course: { modules: {}, checkpoints: {}, read: {} }, _savedAt: 0
});

test("server-only: local null returns server clone", () => {
  const s = { ...base(), missed: ["q1"], _savedAt: 5 };
  const m = merge(null, s);
  assert.deepEqual(m.missed, ["q1"]);
  assert.notEqual(m, s); // clone, not same ref
});

test("local-only: server null returns local clone", () => {
  const l = { ...base(), missed: ["q2"], _savedAt: 5 };
  const m = merge(l, null);
  assert.deepEqual(m.missed, ["q2"]);
  assert.notEqual(m, l);
});

test("attempts union dedupe by date, ascending", () => {
  const l = { ...base(), attempts: [{ date: 30 }, { date: 10 }], _savedAt: 2 };
  const s = { ...base(), attempts: [{ date: 20 }, { date: 10 }], _savedAt: 1 };
  assert.deepEqual(merge(l, s).attempts.map(a => a.date), [10, 20, 30]);
});

test("course best = max, passed = OR", () => {
  const l = { ...base(), course: { modules: { m1: { best: 80, passed: false } }, checkpoints: {}, read: {} }, _savedAt: 2 };
  const s = { ...base(), course: { modules: { m1: { best: 60, passed: true } }, checkpoints: {}, read: {} }, _savedAt: 1 };
  const m = merge(l, s).course.modules.m1;
  assert.equal(m.best, 80);
  assert.equal(m.passed, true);
});

test("course.read + tutorSeen union", () => {
  const l = { ...base(), tutorSeen: { a: true }, course: { modules: {}, checkpoints: {}, read: { r1: true } }, _savedAt: 2 };
  const s = { ...base(), tutorSeen: { b: true }, course: { modules: {}, checkpoints: {}, read: { r2: true } }, _savedAt: 1 };
  const m = merge(l, s);
  assert.deepEqual(m.tutorSeen, { a: true, b: true });
  assert.deepEqual(m.course.read, { r1: true, r2: true });
});

test("missed = most-recent-device-wins (local newer)", () => {
  const l = { ...base(), missed: ["keep"], _savedAt: 9 };
  const s = { ...base(), missed: ["old1", "old2"], _savedAt: 1 };
  assert.deepEqual(merge(l, s).missed, ["keep"]);
});

test("missed recency: server wins on tie / missing local _savedAt", () => {
  const l = { ...base(), missed: ["local"] }; delete l._savedAt;
  const s = { ...base(), missed: ["server"], _savedAt: 0 };
  assert.deepEqual(merge(l, s).missed, ["server"]);
});

test("inprogress most-recent-device-wins", () => {
  const l = { ...base(), inprogress: { id: "L" }, _savedAt: 1 };
  const s = { ...base(), inprogress: { id: "S" }, _savedAt: 9 };
  assert.deepEqual(merge(l, s).inprogress, { id: "S" });
});

test("absent-field tolerance: sparse blobs never throw", () => {
  assert.doesNotThrow(() => merge({ missed: ["x"], _savedAt: 3 }, { attempts: [{ date: 1 }], _savedAt: 1 }));
  const m = merge({ missed: ["x"], _savedAt: 3 }, { attempts: [{ date: 1 }], _savedAt: 1 });
  assert.deepEqual(m.missed, ["x"]);
  assert.deepEqual(m.attempts.map(a => a.date), [1]);
});

test("idempotence: merge(a, merge(a,b)) deep-equals merge(a,b)", () => {
  const a = { ...base(), missed: ["a"], attempts: [{ date: 2 }], tutorSeen: { x: true }, _savedAt: 5 };
  const b = { ...base(), missed: ["b"], attempts: [{ date: 1 }], tutorSeen: { y: true }, _savedAt: 3 };
  const ab = merge(a, b);
  assert.deepEqual(merge(a, ab), ab);
});
