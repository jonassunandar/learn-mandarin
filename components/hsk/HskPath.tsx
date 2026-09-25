"use client";
import { useState } from "react";
import Link from "@/components/AppLink";
import { useLearning } from "@/components/LearningProvider";
import { speakMandarin } from "@/lib/audio";
import {
  weeks,
  dayModes,
  taskNames,
  planDay,
  dateAfter,
  dayWeek,
  taskKey,
  officialSyllabus,
} from "@/lib/hsk/course";
import { lessons } from "@/lib/bopomofo/course";
import { vocabulary } from "@/lib/vocabulary/data";
import { localDay } from "@/lib/practice/session";

const dailyInstructions = [
  "Read the explanation and all three examples. Say each one aloud. Circle unfamiliar words in your own notebook and check their meaning before practising.",
  "Hide the text. Play each example twice: first for its overall meaning, then for details. Reveal it, compare, and imitate its rhythm and tones three times.",
  "Use each example as a sentence frame. Replace one person, object, time or place with familiar vocabulary. Say three new sentences, then check the word order against the model.",
  "Read the Chinese before revealing Pinyin or translations. Explain each example in your own words. Close the answers and retrieve the meaning again after a short break.",
  "Copy each example once on paper or in your device’s notes, then write it from memory. Compare character by character. Use the in-app notebook for individual Foundation words.",
  "Answer this week’s speaking prompt without a script. Write a short response in your notebook. Read it aloud, then revisit any sentence that you could not produce confidently.",
  "Do the quick check below, then the practical checkpoint. A correct multiple-choice answer alone is not enough: test listening, reading and speaking without the examples visible.",
];
export function HskPath() {
  const { data, ready, setHsk } = useLearning();
  const [selectedDay, selectDay] = useState<number | null>(null);
  const [minutes, setMinutes] = useState("75");
  const [message, setMessage] = useState("");
  const [choice, setChoice] = useState("");
  const [hidden, setHidden] = useState(false);
  if (!ready) return <div className="loading">Opening your study path…</div>;
  const start = data.hsk.start?.value;
  const today = start ? planDay(start) : 1;
  const day = selectedDay ?? today;
  const weekIndex = Math.min(11, Math.floor((day - 1) / 7));
  const week = dayWeek(day);
  const mode = (day - 1) % 7;
  const budget = Number(data.hsk.minutes?.value ?? minutes);
  const done = (d: number, t: number) =>
    data.hsk[taskKey(d, t)]?.value === "true";
  const completedDays = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (d) => taskNames.every((_, t) => done(d, t)),
  ).length;
  const behind = Array.from({ length: today - 1 }, (_, i) => i + 1).find(
    (d) => !taskNames.every((_, t) => done(d, t)),
  );
  const nextBopo = lessons.find((l) => !data.bopomofo[l.id]);
  const focusWords = vocabulary.slice(
    ((day - 1) * 3) % 100,
    (((day - 1) * 3) % 100) + 3,
  );
  const reviewCount = data.reviews.filter(
    (r) => localDay(r.at) === localDay(new Date()),
  ).length;
  const repetitions = data.writing
    .filter((r) => localDay(r.at) === localDay(new Date()))
    .reduce((n, r) => n + r.repetitions, 0);
  const changeDay = (value: number) => {
    selectDay(value);
    setChoice("");
    setHidden(false);
    setMessage("");
  };
  return (
    <div className="bpm-page hsk-page">
      <p className="eyebrow">YOUR NEXT THREE MONTHS</p>
      <h1>A clear path through Mandarin.</h1>
      <p className="muted">
        HSK 1 foundations → HSK 2 skills → HSK 3 preparation. Twelve guided
        weeks, then six days to catch up and consolidate.
      </p>
      {!start ? (
        <section className="hsk-card">
          <h2>Start where you are.</h2>
          <p>
            Begin with pronunciation and your first words. Each day gives you
            four tasks. Study six days, then use the seventh for review and a
            checkpoint.
          </p>
          <label htmlFor="hsk-budget">Daily study time</label>
          <select
            id="hsk-budget"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          >
            <option value="40">30–45 minutes · steady foundation</option>
            <option value="75">60–90 minutes · intensive target</option>
            <option value="105">90–120 minutes · extra practice</option>
          </select>
          <p className="helper">
            From zero, HSK 3 in three months is a stretch target, not a promised
            result. At 30–45 minutes, prioritise a solid HSK 1–2 foundation and
            extend the plan as needed.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              setHsk("minutes", minutes);
              setHsk("start", localDay(new Date()));
            }}
          >
            Start my 90-day plan
          </button>
        </section>
      ) : (
        <section className="hsk-card">
          <div className="section-line">
            <strong>{completedDays} / 90 study days completed</strong>
            <span className="tag">Day {today}</span>
          </div>
          <progress
            value={completedDays}
            max={90}
            aria-label="Study days completed"
          />
          <p className="helper">
            {start} → {dateAfter(start, 89)} ·{" "}
            {budget === 40 ? "30–45" : budget === 105 ? "90–120" : "60–90"}{" "}
            minutes per day. Completion records your work, not an HSK
            qualification.
          </p>
          <label htmlFor="hsk-active-budget">Daily study time</label>
          <select
            id="hsk-active-budget"
            value={budget}
            onChange={(e) => setHsk("minutes", e.target.value)}
          >
            <option value="40">30–45 minutes</option>
            <option value="75">60–90 minutes</option>
            <option value="105">90–120 minutes</option>
          </select>
          {budget === 40 && (
            <p className="helper">
              At this pace, build a solid HSK 1–2 foundation and allow longer
              for HSK 3.
            </p>
          )}
          {behind && (
            <button className="text-button" onClick={() => changeDay(behind)}>
              Resume unfinished day {behind}
            </button>
          )}
          <p className="helper">
            Missed a day? Resume it or use the six buffer days. Do not double
            your new words to catch up.
          </p>
        </section>
      )}
      <details className="hsk-card">
        <summary>What this plan covers—and what you still need</summary>
        <p>
          Hanzi100 includes 100 Foundation words with spaced repetition and
          handwriting, Bopomofo lessons, and the guided lessons below. It does
          not yet contain a complete HSK 1–3 vocabulary deck or a scored mock
          exam.
        </p>
        <p>
          Use the official syllabus’s Vocabulary tab for each level alongside
          the app. Study additional words in a separate notebook or flashcard
          deck, including pronunciation, meaning and an example. Aim for 10–15
          additional words on study days at the intensive pace; reduce that
          number when recall weakens. Review them daily. The five-new-word
          Foundation limit remains separate.
        </p>
        <p>
          Use official listening and reading materials, and get feedback from a
          teacher or language partner on spoken answers. Device speech is useful
          for imitation but does not replace varied human recordings. Bopomofo
          is optional pronunciation support; learn Pinyin too for HSK materials.
        </p>
        <p>
          Reference: the new HSK syllabus published November 2025. HSK 3.0
          launches worldwide on December 13, 2026. Confirm your exam version
          with your test centre.
        </p>
        <a href={officialSyllabus} target="_blank" rel="noreferrer">
          Official syllabus, vocabulary & sample questions ↗
        </a>
      </details>
      {start && (
        <>
          <section className="hsk-day" aria-label="Daily study plan">
            <div className="hsk-day-picker">
              <button
                className="secondary-button"
                disabled={day === 1}
                onClick={() => changeDay(day - 1)}
                aria-label="Previous day"
              >
                ←
              </button>
              <label>
                Study day
                <select
                  aria-label="Study day"
                  value={day}
                  onChange={(e) => changeDay(Number(e.target.value))}
                >
                  {Array.from({ length: 90 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                      {i + 1 === today ? " · Today" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="secondary-button"
                disabled={day === 90}
                onClick={() => changeDay(day + 1)}
                aria-label="Next day"
              >
                →
              </button>
            </div>
            <p className="eyebrow">
              {day > 84
                ? "CONSOLIDATION BUFFER"
                : `WEEK ${weekIndex + 1} · ${week.stage}`}
            </p>
            <h2>
              {day > 84
                ? "Repair gaps at your own pace"
                : week.topics[Math.min(mode, 5)]}
            </h2>
            <p className="muted">
              {day > 84
                ? "Return to your weakest week, repeat missed tasks, and use a fresh official sample to reassess."
                : `${dayModes[mode]} · ${week.goal}`}
            </p>
            <Link href="/practice" className="primary-button">
              Start Practice
            </Link>
            <p className="helper">
              Begin with due Foundation reviews. Today: {reviewCount} reviews
              and {repetitions} handwriting repetitions recorded.
            </p>
            <div className="hsk-tasks">
              {taskNames.map((name, t) => (
                <label key={name} className="hsk-task">
                  <input
                    type="checkbox"
                    checked={done(day, t)}
                    onChange={(e) =>
                      setHsk(taskKey(day, t), String(e.target.checked))
                    }
                  />
                  <span>
                    <strong>{name}</strong>
                    <small>
                      {
                        [
                          `${budget === 40 ? 15 : 25} min · Due reviews first, then Foundation words and your additional HSK vocabulary. On checkpoint days, review only.`,
                          `${budget === 40 ? 8 : 15} min · Read and apply the lesson below.`,
                          `${budget === 40 ? 10 : budget === 105 ? 35 : 20} min · Listen, imitate, then answer aloud. Add official listening tasks.`,
                          `${budget === 40 ? 7 : budget === 105 ? 30 : 15} min · Recall 3–5 words in the notebook and write your own sentences.`,
                        ][t]
                      }
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <p className="helper">
              Tick tasks after doing them. These are self-reported study
              records; vocabulary mastery still comes from recall reviews.
            </p>
          </section>
          <section className="hsk-card">
            <p className="eyebrow">TODAY’S GUIDANCE</p>
            <h2>{week.title}</h2>
            <p>{week.explanation}</p>
            <p className="hsk-instruction">{dailyInstructions[mode]}</p>
            <button
              className="secondary-button"
              aria-pressed={hidden}
              onClick={() => setHidden(!hidden)}
            >
              {hidden ? "Show example text" : "Hide text for listening"}
            </button>
            {week.examples.map(([hanzi, pinyin, en, id], i) => (
              <div className="hsk-example" key={hanzi}>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setMessage(
                      speakMandarin(hanzi)
                        ? ""
                        : "Mandarin speech is unavailable on this device. Use the official listening materials linked below.",
                    );
                  }}
                >
                  Listen to example {i + 1}
                </button>
                {!hidden && (
                  <>
                    <p className="hsk-hanzi" lang="zh-CN">
                      {hanzi}
                    </p>
                    <details>
                      <summary>Pinyin & meaning</summary>
                      <p>{pinyin}</p>
                      <p>
                        {en}
                        <br />
                        <span className="muted">{id}</span>
                      </p>
                    </details>
                  </>
                )}
              </div>
            ))}
            {message && <p role="status">{message}</p>}
            <h3>Make it yours</h3>
            <p>{week.prompt}</p>
            <h3>Handwriting notebook</h3>
            <p className="helper">
              Recall the word before revealing it. Practise these Foundation
              characters, or choose words from your collection.
            </p>
            <div className="hsk-word-links">
              {focusWords.map((w) => (
                <Link
                  key={w.id}
                  href={`/words/${w.id}`}
                  className="secondary-button"
                >
                  <span lang="zh-CN">{w.hanzi}</span>
                  <small>{w.meaningEn}</small>
                </Link>
              ))}
            </div>
            {weekIndex < 3 && nextBopo && (
              <p>
                <Link href={`/bopomofo/${nextBopo.id}`}>
                  Optional sound practice: {nextBopo.title} →
                </Link>
              </p>
            )}
          </section>
          <section className="hsk-card">
            <p className="eyebrow">WEEK {weekIndex + 1} CHECKPOINT</p>
            <h2>Check before moving on.</h2>
            <p>{week.question}</p>
            <div className="hsk-answers">
              {week.options.map((option) => (
                <button
                  key={option}
                  className="secondary-button"
                  aria-pressed={choice === option}
                  onClick={() => setChoice(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {choice && (
              <p role="status">
                {choice === week.answer
                  ? "Correct. Now try the practical task below without the examples."
                  : "Not yet. Revisit the explanation and try again."}
              </p>
            )}
            <p>{week.checkpoint}</p>
            <label className="hsk-task">
              <input
                type="checkbox"
                checked={data.hsk[`check-${weekIndex + 1}`]?.value === "true"}
                onChange={(e) =>
                  setHsk(`check-${weekIndex + 1}`, String(e.target.checked))
                }
              />
              <span>
                I completed the practical checkpoint and reviewed my mistakes.
              </span>
            </label>
            <a href={officialSyllabus} target="_blank" rel="noreferrer">
              Open official practice materials ↗
            </a>
          </section>
        </>
      )}
      <section className="bpm-level">
        <h2>Your twelve-week route</h2>
        <p className="muted">
          Preview any week. Advance when its practical checkpoint feels
          manageable, and revisit weak areas.
        </p>
        <div className="bpm-lesson-list">
          {weeks.map((w, i) => (
            <button
              key={w.title}
              className="bpm-lesson-link hsk-week"
              onClick={() => {
                if (!start) {
                  setMessage("Start your plan above to open daily lessons.");
                  return;
                }
                changeDay(i * 7 + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span className="bpm-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <strong>{w.title}</strong>
                <small>
                  {w.stage} · {w.goal}
                </small>
              </span>
              <span>
                {data.hsk[`check-${i + 1}`]?.value === "true" ? "✓" : "→"}
              </span>
            </button>
          ))}
        </div>
      </section>
      {!start && message && <p role="status">{message}</p>}
      <p className="helper">
        Original Hanzi100 teaching examples. This is a study companion, not an
        official HSK course or a guarantee of passing. Plan dates move with your
        chosen start date; progress is saved offline and syncs with your
        account.
      </p>
    </div>
  );
}
