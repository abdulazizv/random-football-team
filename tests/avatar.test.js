import { test } from "node:test";
import assert from "node:assert/strict";
import { avatarMarkup, VARIANT_COUNT } from "../src/js/avatar.js";

const all = () => Array.from({ length: VARIANT_COUNT }, (_, i) => avatarMarkup(i + 1, "#16A34A"));

test("every variant renders an svg", () => {
  for (const m of all()) {
    assert.match(m, /^<svg\b/, `not an svg: ${m.slice(0, 40)}`);
    assert.match(m, /<\/svg>$/);
    assert.match(m, /viewBox="/);
  }
});

test("the jersey takes the team colour it is given", () => {
  assert.ok(avatarMarkup(1, "#2563EB").includes("#2563EB"));
  assert.ok(avatarMarkup(7, "#CA8A04").includes("#CA8A04"));
});

test("all variants look different from one another", () => {
  const seen = all();
  assert.equal(new Set(seen).size, seen.length, "two variants rendered identically");
});

test("a variant outside the range still renders, rather than breaking the pitch", () => {
  for (const v of [0, -3, 99, null, undefined, NaN]) {
    assert.match(avatarMarkup(v, "#16A34A"), /^<svg\b/, `failed for ${v}`);
  }
});

test("contains no raw user-controllable text", () => {
  // The name is rendered separately with textContent; the avatar must be data-free.
  assert.ok(!avatarMarkup(1, "#16A34A").includes("undefined"));
});
