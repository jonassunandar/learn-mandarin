import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { lessons } from "../lib/bopomofo/course";
import { symbols, symbolAsset } from "../lib/bopomofo/symbols";
import { emptyData, mergeData, readLocal } from "../lib/persistence";
test("Bopomofo curriculum covers every modern symbol with bundled audio and strokes", () => {
  assert.equal(symbols.length, 37);
  assert.equal(new Set(symbols.map((s) => s.symbol)).size, 37);
  assert.equal(lessons.length, 20);
  assert.equal(new Set(lessons.flatMap((l) => l.symbols)).size, 37);
  for (const s of symbols) {
    assert.ok(s.examplePinyin && s.meaningId);
    const audio = fs.readFileSync(`public${symbolAsset(s.symbol, "wav")}`);
    assert.equal(audio.subarray(0, 4).toString(), "RIFF");
    const data = JSON.parse(
      fs.readFileSync(`public${symbolAsset(s.symbol, "json")}`, "utf8"),
    );
    assert.ok(data.strokes.length > 0);
    assert.ok(data.strokes.every((d: string) => d.startsWith("M ")));
  }
  for (const l of lessons) {
    assert.equal(l.checks.length, 3);
    assert.ok(l.paragraphs.length >= 3 && l.examples.length >= 3);
    for (const c of l.checks) {
      assert.ok(c.options.includes(c.answer));
      assert.equal(new Set(c.options).size, c.options.length);
    }
  }
});
test("legacy notebooks load and offline lesson completions merge without altering vocabulary", () => {
  const legacy = emptyData();
  const { bopomofo: ignored, ...oldData } = legacy;
  void ignored;
  Object.defineProperty(globalThis, "localStorage", {
    value: { getItem: () => JSON.stringify(oldData) },
    configurable: true,
  });
  assert.deepEqual(readLocal().bopomofo, {});
  const local = emptyData(),
    remote = emptyData();
  local.bopomofo["first-symbols"] = "2026-09-24T10:00:00Z";
  remote.bopomofo["tones"] = "2026-09-24T11:00:00Z";
  remote.bopomofo["first-symbols"] = "2026-09-23T10:00:00Z";
  const merged = mergeData(local, remote);
  assert.equal(Object.keys(merged.bopomofo).length, 2);
  assert.equal(
    merged.bopomofo["first-symbols"],
    local.bopomofo["first-symbols"],
  );
  assert.deepEqual(merged.words, {});
  assert.deepEqual(mergeData(merged, local), merged);
});
