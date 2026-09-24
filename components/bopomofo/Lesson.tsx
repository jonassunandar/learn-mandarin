"use client";
import { useState } from "react";
import Link from "@/components/AppLink";
import { useLearning } from "@/components/LearningProvider";
import {
  lessons,
  type Lesson as LessonData,
  type Reading,
} from "@/lib/bopomofo/course";
import { AudioButton } from "@/components/hanzi/AudioButton";
import { SymbolStudy } from "./SymbolStudy";
function ReadingCard({
  reading,
  hidden,
}: {
  reading: Reading;
  hidden: boolean;
}) {
  const [revealed, setRevealed] = useState(!hidden);
  return (
    <article className="bpm-reading">
      <p className="bpm-zhuyin" lang="zh-TW">
        {reading.zhuyin.split(" ").map((syllable, i) => (
          <span className="bpm-syllable" key={i}>
            {syllable}{" "}
          </span>
        ))}
      </p>
      {revealed ? (
        <>
          <div className="bpm-reading-heading">
            <h3 lang="zh-CN">{reading.hanzi}</h3>
            <AudioButton text={reading.hanzi} />
          </div>
          <p className="pinyin">{reading.pinyin}</p>
          <p>{reading.meaning}</p>
          <p className="muted" lang="id">
            {reading.meaningId}
          </p>
          {reading.note && <p className="bpm-note">{reading.note}</p>}
        </>
      ) : (
        <button className="text-button" onClick={() => setRevealed(true)}>
          Reveal reading & meaning
        </button>
      )}
    </article>
  );
}
export function Lesson({ lesson }: { lesson: LessonData }) {
  const { ready, data, completeLesson } = useLearning();
  const [checking, setChecking] = useState(false);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const number = lessons.findIndex((l) => l.id === lesson.id);
  const next = lessons[number + 1];
  if (!ready) return <div className="loading">Opening your lesson…</div>;
  const check = lesson.checks[index];
  function advance() {
    if (choice !== check.answer) return;
    if (index + 1 === lesson.checks.length) {
      completeLesson(lesson.id);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setChoice(null);
    }
  }
  return (
    <div className="bpm-page bpm-lesson">
      <Link className="text-button" href="/bopomofo">
        ← All Bopomofo lessons
      </Link>
      <p className="eyebrow">
        {lesson.level.toUpperCase()} · LESSON {number + 1} OF {lessons.length}
      </p>
      <h1>{lesson.title}</h1>
      <p className="bpm-goal">{lesson.goal}</p>
      {data.bopomofo[lesson.id] && (
        <p className="bpm-done">✓ Completed · revisit whenever you like</p>
      )}
      {!checking ? (
        <>
          <div className="bpm-prose">
            {lesson.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {lesson.symbols.length > 0 && (
            <SymbolStudy characters={lesson.symbols} />
          )}
          <section className="bpm-examples">
            <h2>
              {lesson.level === "Beginner"
                ? "Read & listen"
                : "Try reading first"}
            </h2>
            <p className="muted">
              {lesson.level === "Beginner"
                ? "Blend each group into one syllable and notice the tone."
                : "Say the Zhuyin aloud before revealing the reading."}
            </p>
            <div className="bpm-reading-grid">
              {lesson.examples.map((r, i) => (
                <ReadingCard
                  key={i}
                  reading={r}
                  hidden={lesson.level !== "Beginner"}
                />
              ))}
            </div>
          </section>
          <button
            className="primary-button"
            onClick={() => {
              setChecking(true);
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
          >
            Check understanding
          </button>
          <p className="helper">
            Three short questions, with explanations. No timer.
          </p>
        </>
      ) : finished ? (
        <section className="bpm-finish" aria-live="polite">
          <h2>Lesson complete.</h2>
          <p>
            You’ve worked through {lesson.title.toLowerCase()}. Come back to the
            sounds or writing whenever you need.
          </p>
          {next ? (
            <Link className="primary-button" href={`/bopomofo/${next.id}`}>
              Next lesson: {next.title}
            </Link>
          ) : (
            <Link className="primary-button" href="/bopomofo">
              Back to your course
            </Link>
          )}
          <Link className="text-button" href="/practice">
            Start vocabulary practice
          </Link>
        </section>
      ) : (
        <section className="bpm-check" aria-label="Lesson check">
          <p className="eyebrow">
            CHECK {index + 1} / {lesson.checks.length}
          </p>
          <h2>{check.prompt}</h2>
          <div className="bpm-options">
            {check.options.map((option) => (
              <button
                key={option}
                className={choice === option ? "selected" : ""}
                aria-pressed={choice === option}
                disabled={choice === check.answer}
                onClick={() => setChoice(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {choice && (
            <div className="bpm-feedback" role="status">
              <strong>
                {choice === check.answer ? "That’s right." : "Try once more."}
              </strong>
              <p>{check.explanation}</p>
            </div>
          )}
          <button
            className="primary-button"
            disabled={choice !== check.answer}
            onClick={advance}
          >
            {index + 1 === lesson.checks.length
              ? "Complete lesson"
              : "Next question"}
          </button>
          <button
            className="text-button"
            onClick={() => {
              setChecking(false);
              setChoice(null);
              setIndex(0);
            }}
          >
            Read the material again
          </button>
        </section>
      )}
    </div>
  );
}
