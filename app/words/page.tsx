"use client";
import { useState } from "react";
import Link from "@/components/AppLink";
import { vocabulary } from "@/lib/vocabulary/data";
import { useLearning } from "@/components/LearningProvider";
import { wordState } from "@/lib/fsrs/scheduler";
import type { WordState } from "@/types";
export default function Words() {
  const { data, ready } = useLearning();
  const [filter, setFilter] = useState<WordState | "all">("all");
  if (!ready) return <div className="loading">Opening your collection…</div>;
  const learned = Object.keys(data.words).length;
  return (
    <div className="words-page">
      <p className="eyebrow">YOUR WORD COLLECTION</p>
      <div className="page-title-row">
        <h1>One word at a time.</h1>
        <span className="collection-count">
          <strong>{learned}</strong> / 100
        </span>
      </div>
      <p className="muted">
        Foundation 1 · The beginning of something lasting.
      </p>
      <Link className="text-button bpm-entry-link" href="/bopomofo">
        ㄅㄆㄇㄈ · Learn Bopomofo →
      </Link>
      <div className="filter-tabs" aria-label="Filter words">
        {(["all", "new", "learning", "strong"] as const).map((s) => (
          <button
            key={s}
            aria-pressed={filter === s}
            className={filter === s ? "selected" : ""}
            onClick={() => setFilter(s)}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="word-grid">
        {vocabulary
          .filter(
            (w) => filter === "all" || wordState(data.words[w.id]) === filter,
          )
          .map((w) => {
            const state = wordState(data.words[w.id]);
            return (
              <Link
                key={w.id}
                href={`/words/${w.id}`}
                className={`word-card ${state}`}
                aria-label={`${w.hanzi}, ${w.meaningEn}, ${state}`}
              >
                <div>
                  <span className="word-order">
                    {String(w.order).padStart(3, "0")}
                  </span>
                  <span aria-label={state} className={`state-symbol ${state}`}>
                    {state === "strong"
                      ? "●"
                      : state === "learning"
                        ? "◐"
                        : "○"}
                  </span>
                </div>
                <strong lang="zh-CN" className="hanzi">
                  {w.hanzi}
                </strong>
                <span className="word-pinyin">{w.pinyin}</span>
                <span className="word-meaning">{w.meaningEn}</span>
              </Link>
            );
          })}
      </div>
      {!vocabulary.some(
        (w) => filter === "all" || wordState(data.words[w.id]) === filter,
      ) && (
        <div className="empty-state">
          <p>No {filter} words yet.</p>
          <Link href="/practice" className="primary-button">
            Start Practice
          </Link>
        </div>
      )}
      <div className="legend">
        <span>● Strong</span>
        <span>◐ Learning</span>
        <span>○ New</span>
      </div>
    </div>
  );
}
