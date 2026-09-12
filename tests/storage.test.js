import { test } from "node:test";
import assert from "node:assert/strict";
import { createStorage, KEY } from "../src/js/storage.js";

// Minimal stand-in for the browser Storage interface.
function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    keys: () => [...map.keys()],
  };
}

test("returns an empty roster when nothing is stored", () => {
  assert.deepEqual(createStorage(fakeStorage()).load(), { players: [], teamCount: 2 });
});

test("reads back what it saved", () => {
  const st = createStorage(fakeStorage());
  st.save({ players: ["Aziz", "Bekzod"], teamCount: 3 });
  assert.deepEqual(st.load(), { players: ["Aziz", "Bekzod"], teamCount: 3 });
});

test("migrates the old bare-array format", () => {
  const s = fakeStorage({ [KEY]: JSON.stringify(["Aziz", "Bekzod"]) });
  assert.deepEqual(createStorage(s).load(), { players: ["Aziz", "Bekzod"], teamCount: 2 });
});

test("survives corrupt stored data instead of throwing", () => {
  const s = fakeStorage({ [KEY]: "{not json" });
  assert.deepEqual(createStorage(s).load(), { players: [], teamCount: 2 });
});

// Regression guard for the original bug: the clear button called
// localStorage.clear("football_random"), which ignores its argument and wipes
// every key on the origin. Nothing may call Storage.clear() again.
test("no source file calls Storage.clear()", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const dir = new URL("../src/js/", import.meta.url);
  for (const f of await readdir(dir)) {
    if (!f.endsWith(".js")) continue;
    const src = await readFile(new URL(f, dir), "utf8");
    assert.ok(
      !/\.\s*clear\s*\(/.test(src),
      `${f} calls Storage.clear(), which wipes the whole origin`
    );
  }
});
