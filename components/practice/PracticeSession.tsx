"use client";
import { useState, useEffect, useRef } from "react";
import Link from "@/components/AppLink";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, BookOpen, RotateCcw, X } from "lucide-react";
import { useLearning } from "@/components/LearningProvider";
import { vocabulary } from "@/lib/vocabulary/data";
import {
  buildSession,
  REPETITIONS,
  type Exercise,
} from "@/lib/practice/session";
import { Rating, wordState } from "@/lib/fsrs/scheduler";
import {
  HandwritingCanvas,
  type CanvasHandle,
} from "@/components/hanzi/HandwritingCanvas";
import { StrokeOrder } from "@/components/hanzi/StrokeOrder";
import { AudioButton } from "@/components/hanzi/AudioButton";
import { HanziGlyph } from "@/components/hanzi/HanziGlyph";
import { writingGuide } from "@/lib/practice/writing-guide";
type SessionState = {
  exercises: Exercise[];
  index: number;
  character: number;
  repetition: number;
  completed: number;
  written: number;
};
export function PracticeSession() {
  const { ready, user } = useLearning();
  const params = useSearchParams();
  if (!ready) return <div className="loading">Preparing your practice…</div>;
  return (
    <Session
      key={`${user?.id ?? "demo"}:${params.get("word") ?? "daily"}`}
      wordId={params.get("word")}
    />
  );
}
function Session({ wordId }: { wordId: string | null }) {
  const { data, user, onboard, review, write, sync } = useLearning();
  const key = `hanzi100:session:${user?.id ?? "demo"}:${wordId ?? "daily"}`;
  const [session, setSession] = useState<SessionState>(() => {
    try {
      const previous = JSON.parse(localStorage.getItem(key) || "null");
      if (
        previous?.exercises?.length &&
        previous.index < previous.exercises.length
      )
        return previous;
    } catch {}
    const word = vocabulary.find((w) => w.id === wordId);
    const exercises = word
      ? [
          {
            wordId: word.id,
            type: "writing" as const,
            repetitions: REPETITIONS[wordState(data.words[word.id])],
          },
          { wordId: word.id, type: "recall" as const },
        ]
      : buildSession(data);
    return {
      exercises,
      index: 0,
      character: 0,
      repetition: 0,
      completed: 0,
      written: 0,
    };
  });
  const [revealed, setRevealed] = useState(false);
  const [ink, setInk] = useState(false);
  const [showStrokes, setShowStrokes] = useState(false);
  const [exit, setExit] = useState(false);
  const canvas = useRef<CanvasHandle>(null);
  const actionLock = useRef(false);
  const exercise = session.exercises[session.index];
  const word = vocabulary.find((w) => w.id === exercise?.wordId);
  const finished = session.index >= session.exercises.length;
  const guide = writingGuide(session.repetition, exercise?.repetitions ?? 5);
  useEffect(() => {
    onboard();
  }, [onboard]);
  useEffect(() => {
    try {
      if (finished) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(session));
    } catch {}
  }, [session, key, finished]);
  useEffect(() => {
    const protect = (e: BeforeUnloadEvent) => {
      if (!finished && !exit) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [finished, exit]);
  useEffect(() => {
    actionLock.current = false;
  }, [session.index, session.repetition, session.character]);
  function next(reviewed = false) {
    canvas.current?.clear();
    setInk(false);
    setRevealed(false);
    setShowStrokes(false);
    setSession((s) => ({
      ...s,
      index: s.index + 1,
      character: 0,
      repetition: 0,
      completed: s.completed + (reviewed ? 1 : 0),
    }));
  }
  function rate(
    rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy,
  ) {
    if (!word || actionLock.current) return;
    actionLock.current = true;
    review(word.id, rating);
    next(true);
  }
  function repetition() {
    if (!word || !canvas.current?.hasInk() || actionLock.current) return;
    actionLock.current = true;
    write(word.id, word.characters[session.character]);
    canvas.current.clear();
    setInk(false);
    setShowStrokes(false);
    const count = session.repetition + 1;
    setSession((s) => ({ ...s, written: s.written + 1 }));
    if (count >= (exercise.repetitions ?? 5)) {
      if (session.character < word.characters.length - 1)
        setSession((s) => ({
          ...s,
          character: s.character + 1,
          repetition: 0,
        }));
      else next();
    } else setSession((s) => ({ ...s, repetition: count }));
  }
  if (finished) {
    const dates = Object.values(data.words)
      .map((w) => new Date(w.card.due))
      .sort((a, b) => +a - +b);
    return (
      <section className="session-finished">
        <span className="finish-symbol">
          <Check size={32} />
        </span>
        <p className="eyebrow">
          {session.exercises.length
            ? "A LITTLE MORE FAMILIAR"
            : "YOUR NOTEBOOK IS UP TO DATE"}
        </p>
        <h1>
          {session.exercises.length
            ? "A good place to pause."
            : "All caught up."}
        </h1>
        <p className="muted">
          {session.exercises.length
            ? "Every time you write, a word takes root."
            : "Your words need a little time to settle. Come back for your next review."}
        </p>
        {session.exercises.length > 0 && (
          <div className="session-totals">
            <div>
              <strong>{session.completed}</strong>
              <span>words reviewed</span>
            </div>
            <div>
              <strong>{session.written}</strong>
              <span>times written</span>
            </div>
          </div>
        )}
        {dates[0] && (
          <p className="next-review">
            Next review:{" "}
            {dates[0] <= new Date()
              ? "ready now"
              : dates[0].toLocaleString(undefined, {
                  weekday: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
          </p>
        )}
        <Link href="/" className="primary-button" onClick={() => sync()}>
          Back to Home
          <ArrowRight size={18} />
        </Link>
        <Link href="/words" className="text-button">
          Explore your words
        </Link>
      </section>
    );
  }
  if (!word)
    return (
      <p>
        Word not found. <Link href="/words">Browse vocabulary</Link>
      </p>
    );
  return (
    <section className="practice-page">
      <div className="practice-top">
        <button
          className="icon-button"
          aria-label="Pause practice"
          onClick={() => setExit(true)}
        >
          <X size={22} />
        </button>
        <span>{wordId ? "WRITING PRACTICE" : "TODAY’S PRACTICE"}</span>
        <span>
          {session.index + 1} / {session.exercises.length}
        </span>
      </div>
      <div className="session-track">
        <span
          style={{
            width: `${(session.index / session.exercises.length) * 100}%`,
          }}
        />
      </div>
      {exit && (
        <div
          className="pause-panel"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="pause-title"
        >
          <h2 id="pause-title">Pause here?</h2>
          <p>
            Completed repetitions and reviews are saved. You can pick up here
            later. The current drawing will be cleared.
          </p>
          <button className="primary-button" onClick={() => setExit(false)}>
            Keep practicing
          </button>
          <Link href="/" onClick={() => sync()} className="text-button">
            Save & leave
          </Link>
        </div>
      )}
      <div inert={exit}>
        {exercise.type === "learn" && (
          <>
            <div className="exercise-label">
              <BookOpen size={15} /> NEW WORD ·{" "}
              {String(word.order).padStart(3, "0")}
            </div>
            <div className="word-presentation">
              <h1 className="hanzi large" lang="zh-CN">
                {word.hanzi}
              </h1>
              <p className="pinyin">{word.pinyin}</p>
              <h2>{word.meaningEn}</h2>
              <p className="muted">{word.meaningId}</p>
              <AudioButton text={word.hanzi} />
            </div>
            <div className="learn-stroke">
              <p className="eyebrow">WATCH HOW IT’S WRITTEN</p>
              <StrokeOrder characters={word.characters} />
            </div>
            <button className="primary-button" onClick={() => next()}>
              Practice writing
              <ArrowRight size={19} />
            </button>
            <p className="helper">
              Look closely. Say it aloud. Then make it yours.
            </p>
          </>
        )}
        {exercise.type === "writing" && (
          <>
            <div className="exercise-label">SEE IT. WRITE IT. REMEMBER IT.</div>
            <div className="writing-target">
              <h1
                className="hanzi"
                lang="zh-CN"
                aria-label={
                  guide.stage === "memory"
                    ? "Character hidden for recall"
                    : undefined
                }
              >
                {guide.stage === "memory"
                  ? "?"
                  : word.characters[session.character]}
              </h1>
              <div>
                <p className="pinyin">{word.pinyin}</p>
                <p>{word.meaningEn}</p>
                {word.characters.length > 1 && (
                  <small className="muted">
                    {guide.stage !== "memory" && <>{word.hanzi} · </>}Character{" "}
                    {session.character + 1} of {word.characters.length}
                  </small>
                )}
              </div>
              <AudioButton text={word.hanzi} label="Hear pronunciation" />
            </div>
            <div className="repetition-heading">
              <strong>Write {exercise.repetitions} times</strong>
              <span>
                {session.repetition} / {exercise.repetitions}
              </span>
            </div>
            <div className="repetition-dots">
              {Array.from({ length: exercise.repetitions ?? 5 }, (_, i) => (
                <span
                  key={i}
                  className={i < session.repetition ? "done" : ""}
                />
              ))}
            </div>
            <div
              className="writing-stage"
              data-stage={guide.stage}
              aria-live="polite"
            >
              <span>
                {guide.stage === "trace"
                  ? "1 · TRACE"
                  : guide.stage === "copy"
                    ? "2 · COPY"
                    : "3 · RECALL"}
              </span>
              <p>{guide.label}</p>
            </div>
            <HandwritingCanvas
              ref={canvas}
              onInkChange={setInk}
              guide={
                guide.stage === "trace"
                  ? {
                      character: word.characters[session.character],
                      opacity: guide.opacity,
                    }
                  : undefined
              }
            />
            <button
              className="primary-button"
              disabled={!ink}
              onClick={repetition}
            >
              {session.repetition + 1 === (exercise.repetitions ?? 5)
                ? session.character < word.characters.length - 1
                  ? "Next character"
                  : "Done"
                : "Next repetition"}
              <Check size={19} />
            </button>
            <div className="writing-extras">
              <button
                className="text-button"
                onClick={() => setShowStrokes(!showStrokes)}
              >
                <BookOpen size={16} />
                {showStrokes ? "Hide" : "View"} stroke order
              </button>
              <button
                className="text-button"
                onClick={() => {
                  canvas.current?.clear();
                  setShowStrokes(false);
                  setSession((s) => ({ ...s, repetition: 0 }));
                }}
              >
                <RotateCcw size={16} />
                Reset count
              </button>
            </div>
            {showStrokes && (
              <StrokeOrder
                key={session.character}
                characters={[word.characters[session.character]]}
              />
            )}
            <p className="helper">
              Take your time. You’re your own best judge.
            </p>
          </>
        )}
        {(exercise.type === "recognition" || exercise.type === "recall") && (
          <>
            <div className="exercise-label">
              {exercise.isNew ? "LET’S SEE WHAT STUCK" : "A MOMENT TO REMEMBER"}
            </div>
            <div className="word-presentation">
              {exercise.type === "recognition" ? (
                <>
                  <h1 className="hanzi large" lang="zh-CN">
                    {word.hanzi}
                  </h1>
                  {!revealed && <p className="muted">Do you remember this?</p>}
                </>
              ) : (
                <>
                  <p className="pinyin recall-pinyin">{word.pinyin}</p>
                  <h2>{word.meaningEn}</h2>
                  <p className="muted">{word.meaningId}</p>
                </>
              )}
              {revealed && exercise.type === "recognition" && (
                <div className="revealed-answer">
                  <p className="pinyin">{word.pinyin}</p>
                  <h2>{word.meaningEn}</h2>
                  <p className="muted">{word.meaningId}</p>
                  <AudioButton text={word.hanzi} />
                </div>
              )}
            </div>
            {exercise.type === "recall" && (
              <>
                <p className="recall-instruction">
                  {revealed
                    ? "Compare the shape, spacing, and strokes."
                    : "Write the Hanzi from memory"}
                </p>
                <div
                  className={
                    revealed
                      ? "recall-workspace handwriting-comparison"
                      : "recall-workspace"
                  }
                >
                  <div>
                    {revealed && (
                      <p className="comparison-label">Your writing</p>
                    )}
                    <HandwritingCanvas
                      ref={canvas}
                      onInkChange={setInk}
                      readOnly={revealed}
                      label={
                        revealed
                          ? "Your handwriting for comparison"
                          : "Handwriting practice area"
                      }
                    />
                    {revealed && !ink && (
                      <p className="helper">No handwriting yet. That’s okay.</p>
                    )}
                  </div>
                  {revealed && (
                    <div>
                      <p className="comparison-label">Reference</p>
                      <div
                        className="writing-paper reference-paper"
                        role="img"
                        aria-label={`Correct Hanzi: ${word.hanzi}`}
                        lang="zh-CN"
                      >
                        <span className="grid-diagonal one" />
                        <span className="grid-diagonal two" />
                        <div className="reference-characters">
                          {word.characters.map((character, index) => (
                            <HanziGlyph key={index} character={character} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {revealed && (
                  <div className="comparison-answer">
                    <h1 className="hanzi" lang="zh-CN">
                      {word.hanzi}
                    </h1>
                    <AudioButton text={word.hanzi} />
                  </div>
                )}
              </>
            )}
            {!revealed ? (
              <>
                <button
                  className="primary-button"
                  onClick={() => {
                    if (
                      exercise.type === "recall" &&
                      canvas.current?.hasInk()
                    ) {
                      write(word.id, word.hanzi);
                      setSession((s) => ({ ...s, written: s.written + 1 }));
                    }
                    setRevealed(true);
                  }}
                >
                  {exercise.type === "recall" ? "Reveal answer" : "Show answer"}
                  <ArrowRight size={19} />
                </button>
                {exercise.type === "recall" && (
                  <p className="helper">
                    Can’t remember? Reveal the answer, then choose No.
                  </p>
                )}
              </>
            ) : (
              <div className="rating-area">
                <p>
                  {exercise.type === "recall"
                    ? "Did you get it?"
                    : "How well did you remember?"}
                </p>
                <div
                  className={`ratings ${exercise.type === "recall" ? "three" : ""}`}
                >
                  {(exercise.type === "recall"
                    ? [
                        ["No", Rating.Again],
                        ["Almost", Rating.Hard],
                        ["Yes", Rating.Good],
                      ]
                    : [
                        ["Forgot", Rating.Again],
                        ["Hard", Rating.Hard],
                        ["Good", Rating.Good],
                        ["Easy", Rating.Easy],
                      ]
                  ).map(([label, r]) => (
                    <button
                      key={label}
                      onClick={() =>
                        rate(
                          r as
                            | Rating.Again
                            | Rating.Hard
                            | Rating.Good
                            | Rating.Easy,
                        )
                      }
                      className={`rating rating-${r}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="helper">
                  Honest answers help us choose the right time to review.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
