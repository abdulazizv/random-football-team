import { test } from "node:test";
import assert from "node:assert/strict";
import { divideTeams, formation } from "../src/js/split.js";

const roster = (n) => Array.from({ length: n }, (_, i) => `P${i + 1}`);
const names = (teams) => teams.flatMap((t) => t.players.map((p) => p.name));

test("produces exactly the requested number of teams", () => {
  assert.equal(divideTeams(roster(12), 3).length, 3);
  assert.equal(divideTeams(roster(12), 2).length, 2);
});

test("deals every player exactly once", () => {
  const teams = divideTeams(roster(12), 3);
  assert.deepEqual(names(teams).sort(), roster(12).sort());
});

test("splits 12 players over 3 teams evenly", () => {
  const sizes = divideTeams(roster(12), 3).map((t) => t.players.length);
  assert.deepEqual(sizes, [4, 4, 4]);
});

test("rejects a draw with fewer players than teams", () => {
  assert.throws(() => divideTeams(roster(2), 3), /kam/i);
});

test("rejects a team count outside 2..6", () => {
  assert.throws(() => divideTeams(roster(12), 1), /jamoa/i);
  assert.throws(() => divideTeams(roster(12), 7), /jamoa/i);
});

test("spreads an uneven remainder one per team, larger teams first", () => {
  assert.deepEqual(divideTeams(roster(13), 3).map((t) => t.players.length), [5, 4, 4]);
  assert.deepEqual(divideTeams(roster(14), 3).map((t) => t.players.length), [5, 5, 4]);
  assert.deepEqual(divideTeams(roster(12), 2).map((t) => t.players.length), [6, 6]);
});

test("gives every player an avatar in 1..11", () => {
  const avatars = divideTeams(roster(20), 3).flatMap((t) => t.players.map((p) => p.avatar));
  assert.equal(avatars.length, 20);
  assert.ok(avatars.every((a) => Number.isInteger(a) && a >= 1 && a <= 11), `got ${avatars}`);
});

test("never repeats an avatar inside a team of 11 or fewer", () => {
  // 11 avatars exist, so uniqueness is only achievable up to a team size of 11.
  for (const [n, t] of [[12, 3], [20, 2], [22, 2], [33, 3]]) {
    for (const team of divideTeams(roster(n), t)) {
      const seen = team.players.map((p) => p.avatar);
      assert.ok(seen.length <= 11, `setup error: team of ${seen.length}`);
      assert.equal(new Set(seen).size, seen.length, `team of ${seen.length} repeated an avatar`);
    }
  }
});

test("does not mutate the roster it was given", () => {
  const original = roster(12);
  const copy = original.slice();
  divideTeams(original, 3);
  assert.deepEqual(original, copy);
});

test("formation rows always account for every player", () => {
  for (let n = 1; n <= 20; n++) {
    const rows = formation(n);
    assert.equal(rows.reduce((a, b) => a + b, 0), n, `n=${n} gave ${rows}`);
    assert.ok(rows.every((r) => r > 0), `n=${n} has an empty row: ${rows}`);
  }
});

test("formation matches the agreed shapes", () => {
  assert.deepEqual(formation(1), [1]);
  assert.deepEqual(formation(2), [1, 1]);
  assert.deepEqual(formation(3), [1, 2]);
  assert.deepEqual(formation(4), [1, 2, 1]);
  assert.deepEqual(formation(5), [1, 2, 2]);
  assert.deepEqual(formation(6), [1, 2, 3]);
  assert.deepEqual(formation(7), [1, 3, 3]);
  assert.deepEqual(formation(8), [1, 3, 4]);
  assert.deepEqual(formation(9), [1, 2, 3, 3]);
  assert.deepEqual(formation(12), [1, 3, 4, 4]);
});

test("formation keeps one keeper at the back for any squad", () => {
  for (let n = 2; n <= 20; n++) assert.equal(formation(n)[0], 1, `n=${n}`);
});
