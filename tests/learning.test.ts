import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { vocabulary } from "../lib/vocabulary/data";
import { reviewWord, Rating, wordState } from "../lib/fsrs/scheduler";
import {
  buildSession,
  sessionSummary,
  REPETITIONS,
} from "../lib/practice/session";
import { emptyData, mergeData, saveLocal, readLocal } from "../lib/persistence";
test("100 unique, ordered beginner words with valid tones and local stroke data", () => {
  assert.equal(vocabulary.length, 100);
  assert.equal(new Set(vocabulary.map((w) => w.id)).size, 100);
  assert.equal(new Set(vocabulary.map((w) => w.hanzi)).size, 100);
  vocabulary.forEach((w, i) => {
    assert.equal(w.order, i + 1);
    assert.equal(w.characters.join(""), w.hanzi);
    assert.ok(w.meaningEn && w.meaningId && w.pinyin);
    assert.ok(!/\d/.test(w.pinyin));
    w.characters.forEach((c) =>
      assert.ok(fs.existsSync(`public/hanzi/${c}.json`)),
    );
  });
  assert.deepEqual(
    vocabulary.slice(0, 5).map((w) => w.hanzi),
    ["我", "你", "他", "人", "是"],
  );
  assert.equal(vocabulary[0].pinyin, "wǒ");
});
test("new session teaches exactly five words and ten repetitions per character", () => {
  const session = buildSession(emptyData());
  assert.equal(session.filter((e) => e.type === "learn").length, 5);
  assert.equal(session.filter((e) => e.type === "recall").length, 5);
  assert.equal(
    session.filter((e) => e.type === "writing")[0].repetitions,
    REPETITIONS.new,
  );
});
test("FSRS persists complete state, schedules due review, and distinguishes ratings", () => {
  const now = new Date("2026-09-19T08:00:00Z");
  const again = reviewWord(undefined, "f1-001", Rating.Again, now).word;
  const good = reviewWord(undefined, "f1-001", Rating.Good, now).word;
  const easy = reviewWord(undefined, "f1-001", Rating.Easy, now).word;
  assert.equal(good.card.reps, 1);
  assert.ok(Date.parse(good.card.due) > +now);
  assert.ok(Date.parse(again.card.due) < Date.parse(easy.card.due));
  assert.equal(wordState(good), "learning");
  const d = emptyData();
  d.words[good.vocabularyId] = good;
  assert.equal(sessionSummary(d, now).due.length, 0);
  const due = new Date(Date.parse(good.card.due) + 1);
  assert.equal(buildSession(d, due)[0].wordId, "f1-001");
  assert.equal(buildSession(d, due)[0].type, "recognition");
  const reviewed = reviewWord(good, "f1-001", Rating.Good, due).word;
  assert.equal(reviewed.card.reps, 2);
  assert.equal(reviewed.introducedAt, good.introducedAt);
});
test("daily new word limit and review priority", () => {
  const now = new Date();
  const d = emptyData();
  for (const w of vocabulary.slice(0, 5))
    d.words[w.id] = reviewWord(undefined, w.id, Rating.Good, now).word;
  assert.equal(sessionSummary(d, now).fresh.length, 0);
  for (const w of vocabulary.slice(0, 20)) {
    d.words[w.id] = reviewWord(
      undefined,
      w.id,
      Rating.Good,
      new Date(+now - 86400000),
    ).word;
  }
  const s = buildSession(d, now);
  assert.equal(s.filter((e) => e.type === "learn").length, 0);
  assert.equal(
    s.filter((e) => e.type === "recall" || e.type === "recognition").length,
    15,
  );
});
test("merge is idempotent, retains events, and refuses stale scheduling state", () => {
  const d = emptyData();
  const first = reviewWord(
    undefined,
    "f1-001",
    Rating.Good,
    new Date("2026-01-01"),
  ).word;
  d.words[first.vocabularyId] = first;
  const latest = emptyData();
  latest.words[first.vocabularyId] = reviewWord(
    first,
    first.vocabularyId,
    Rating.Easy,
    new Date("2026-01-02"),
  ).word;
  latest.writing.push({
    id: "test",
    vocabularyId: first.vocabularyId,
    character: "我",
    repetitions: 1,
    at: new Date().toISOString(),
  });
  const merged = mergeData(latest, d);
  assert.equal(merged.words[first.vocabularyId].card.reps, 2);
  assert.deepEqual(mergeData(merged, latest), merged);
});
test("progress round trips through local persistence and keeps users isolated", () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
    },
    configurable: true,
  });
  const data = emptyData();
  data.words["f1-001"] = reviewWord(undefined, "f1-001", Rating.Good).word;
  saveLocal(data);
  assert.deepEqual(readLocal(), data);
  assert.equal(Object.keys(readLocal("different-user").words).length, 0);
});
