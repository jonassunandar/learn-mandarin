import test from "node:test";
import assert from "node:assert/strict";
import { weeks, planDay, dateAfter, dayWeek, taskKey } from "../lib/hsk/course";
import { emptyData, mergeData, readLocal } from "../lib/persistence";
test("90-day route handles calendar boundaries, catch-up days and original lesson checks", () => {
  assert.equal(weeks.length, 12);
  assert.equal(planDay("2026-09-25", new Date(2026, 8, 25, 23)), 1);
  assert.equal(planDay("2026-09-25", new Date(2026, 8, 26, 0)), 2);
  assert.equal(planDay("2026-09-25", new Date(2027, 0, 1)), 90);
  assert.equal(dateAfter("2026-09-25", 89), "2026-12-23");
  assert.equal(dayWeek(90), weeks[11]);
  for (const w of weeks) {
    assert.equal(w.topics.length, 6);
    assert.equal(w.examples.length, 3);
    assert.ok(w.options.includes(w.answer));
    for (const e of w.examples) assert.ok(e.every(Boolean));
  }
  assert.equal(taskKey(90, 3), "day-90-3");
});
test("HSK checklist merges independent devices and preserves an offline uncheck", () => {
  const a = emptyData(),
    b = emptyData();
  a.hsk["day-1-0"] = { value: "false", updatedAt: "2026-09-25T11:00:00Z" };
  b.hsk["day-1-0"] = { value: "true", updatedAt: "2026-09-25T10:00:00Z" };
  b.hsk.start = { value: "2026-09-25", updatedAt: "2026-09-25T10:00:00Z" };
  const result = mergeData(a, b);
  assert.equal(result.hsk["day-1-0"].value, "false");
  assert.equal(result.hsk.start.value, "2026-09-25");
  assert.deepEqual(mergeData(b, a), result);
  const { hsk: ignored, ...legacy } = emptyData();
  void ignored;
  Object.defineProperty(globalThis, "localStorage", {
    value: { getItem: () => JSON.stringify(legacy) },
    configurable: true,
  });
  assert.deepEqual(readLocal().hsk, {});
});
