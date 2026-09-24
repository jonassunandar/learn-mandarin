"use client";
import Link from "@/components/AppLink";
import { ArrowRight } from "lucide-react";
import { lessons } from "@/lib/bopomofo/course";
import { bopomofoSources, symbols } from "@/lib/bopomofo/symbols";
import { useLearning } from "@/components/LearningProvider";
import { SymbolStudy } from "./SymbolStudy";
import { useState } from "react";
export function Course() {
  const { data, ready } = useLearning();
  const [reference, setReference] = useState<string | null>(null);
  if (!ready)
    return <div className="loading">Opening your Bopomofo lessons…</div>;
  const completed = lessons.filter((l) => data.bopomofo[l.id]).length;
  const next = lessons.find((l) => !data.bopomofo[l.id]) ?? lessons[0];
  return (
    <div className="bpm-page">
      <p className="eyebrow">A NEW WAY TO READ MANDARIN</p>
      <h1>Bopomofo, step by step.</h1>
      <p className="bpm-hero-symbols" lang="zh-TW">
        ㄅ ㄆ ㄇ ㄈ
      </p>
      <p className="muted">
        Learn Zhuyin from your first sound to reading short sentences. 37
        symbols. 20 small lessons. Listen, write, and read at your own pace.
      </p>
      <div className="bpm-course-progress">
        <span>
          {completed} / {lessons.length} lessons completed
        </span>
        <progress
          value={completed}
          max={lessons.length}
          aria-label="Bopomofo lesson progress"
        />
      </div>
      <Link className="primary-button" href={`/bopomofo/${next.id}`}>
        {completed === 0
          ? "Start Bopomofo"
          : completed === lessons.length
            ? "Revisit the lessons"
            : "Continue Bopomofo"}
        <ArrowRight size={18} />
      </Link>
      <p className="helper">
        About 5–10 minutes per lesson. Examples use Simplified Chinese, with
        English and Indonesian meanings.
      </p>
      {(["Beginner", "Developing", "Intermediate"] as const).map((level) => (
        <section className="bpm-level" key={level}>
          <h2>{level}</h2>
          <p className="muted">
            {level === "Beginner"
              ? "Meet the symbols and tones."
              : level === "Developing"
                ? "Combine sounds and connect them to Pinyin."
                : "Read contrasts, connected speech, and short texts."}
          </p>
          <div className="bpm-lesson-list">
            {lessons.map(
              (l, i) =>
                l.level === level && (
                  <Link
                    key={l.id}
                    href={`/bopomofo/${l.id}`}
                    className="bpm-lesson-link"
                  >
                    <span className="bpm-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{l.title}</strong>
                      <small>{l.goal}</small>
                    </span>
                    <span className="bpm-completion">
                      {data.bopomofo[l.id] ? "✓ Done" : "Read →"}
                    </span>
                  </Link>
                ),
            )}
          </div>
        </section>
      ))}
      <section className="bpm-reference">
        <h2>All 37 symbols</h2>
        <p className="muted">
          Tap any symbol to hear it and open its notebook.
        </p>
        <div className="bpm-symbol-grid">
          {symbols.map((s) => (
            <button
              key={s.symbol}
              aria-label={`Study ${s.symbol}`}
              aria-pressed={reference === s.symbol}
              onClick={() =>
                setReference(reference === s.symbol ? null : s.symbol)
              }
            >
              <span lang="zh-TW">{s.symbol}</span>
              <small>{s.pinyin.split(" / ")[0]}</small>
            </button>
          ))}
        </div>
        {reference && <SymbolStudy key={reference} characters={[reference]} />}
      </section>
      <details className="bpm-sources">
        <summary>Sources & audio credits</summary>
        <p>
          Original lessons by Hanzi100, informed by the references below. Symbol
          recordings and stroke shapes: Ministry of Education, Taiwan (2017),
          licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0
          </a>
          . Stroke SVG paths were converted to JSON for the notebook. Audio is
          unchanged. No endorsement is implied.
        </p>
        {bopomofoSources.map((s) => (
          <p key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
          </p>
        ))}
        <p>
          Symbol recordings are bundled for offline use. Word and sentence
          playback uses your device’s Mandarin voice; availability and
          pronunciation can vary.
        </p>
      </details>
    </div>
  );
}
