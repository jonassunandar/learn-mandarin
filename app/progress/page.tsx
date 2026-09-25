"use client";
import Link from "@/components/AppLink";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useLearning } from "@/components/LearningProvider";
import { wordState } from "@/lib/fsrs/scheduler";
import { vocabulary, milestones } from "@/lib/vocabulary/data";
import { localDay } from "@/lib/practice/session";
import { lessons } from "@/lib/bopomofo/course";
export default function Progress() {
  const { data, ready } = useLearning();
  if (!ready) return <div className="loading">Opening your progress…</div>;
  const counts = { new: 0, learning: 0, strong: 0 };
  vocabulary.forEach((w) => counts[wordState(data.words[w.id])]++);
  const today = localDay();
  const week = new Date();
  week.setDate(week.getDate() - ((week.getDay() + 6) % 7));
  week.setHours(0, 0, 0, 0);
  const reviewsToday = data.reviews.filter(
    (r) => localDay(r.at) === today,
  ).length;
  const reviewsWeek = data.reviews.filter((r) => new Date(r.at) >= week).length;
  const writingToday = data.writing
    .filter((r) => localDay(r.at) === today)
    .reduce((s, r) => s + r.repetitions, 0);
  const total = data.writing.reduce((s, r) => s + r.repetitions, 0);
  return (
    <div className="progress-page">
      <p className="eyebrow">THE WORDS ARE STAYING WITH YOU</p>
      <h1>Little by little.</h1>
      <p className="muted">A clear view of how far you’ve come.</p>
      <section className="progress-overview">
        <div className="section-line">
          <h2>Foundation 1</h2>
          <span className="tag">100 WORDS</span>
        </div>
        <div className="progress-hero">
          <strong>{100 - counts.new}</strong>
          <span>/ 100 words learned</span>
        </div>
        <div
          className="hundred-grid"
          aria-label={`${counts.strong} strong, ${counts.learning} learning, ${counts.new} new`}
        >
          {vocabulary.map((w) => (
            <Link
              key={w.id}
              href={`/words/${w.id}`}
              className={wordState(data.words[w.id])}
              aria-label={`${w.hanzi}: ${wordState(data.words[w.id])}`}
            />
          ))}
        </div>
        <div className="progress-state-list">
          {(["strong", "learning", "new"] as const).map((s, i) => (
            <div key={s}>
              <span className={`state-symbol ${s}`}>{["●", "◐", "○"][i]}</span>
              <span>{s[0].toUpperCase() + s.slice(1)}</span>
              <strong>{counts[s]}</strong>
            </div>
          ))}
        </div>
        <p className="small muted">
          Strong words have a review stability of at least 7 days.
        </p>
      </section>
      <div className="stats-grid">
        <section>
          <h2>Reviews completed</h2>
          <div>
            <span>Today</span>
            <strong>{reviewsToday}</strong>
          </div>
          <div>
            <span>This week</span>
            <strong>{reviewsWeek}</strong>
          </div>
        </section>
        <section>
          <h2>Writing repetitions</h2>
          <div>
            <span>Today</span>
            <strong>{writingToday}</strong>
          </div>
          <div>
            <span>All time</span>
            <strong>{total.toLocaleString()}</strong>
          </div>
        </section>
      </div>
      <section className="bpm-progress-card">
        <h2>Bopomofo reading</h2>
        <p>
          {lessons.filter((l) => data.bopomofo[l.id]).length} / {lessons.length}{" "}
          lessons completed
        </p>
        <Link href="/bopomofo" className="text-button">
          Continue learning →
        </Link>
      </section>
      <section className="bpm-progress-card">
        <h2>Your HSK study path</h2>
        <p>
          {
            Array.from({ length: 90 }, (_, i) => i + 1).filter((d) =>
              [0, 1, 2, 3].every(
                (t) => data.hsk[`day-${d}-${t}`]?.value === "true",
              ),
            ).length
          }{" "}
          / 90 study days completed
        </p>
        <Link href="/hsk" className="text-button">
          Open daily guidance →
        </Link>
      </section>
      <section className="milestones">
        <h2>Your foundations</h2>
        {milestones.map((m) => (
          <div key={m.name}>
            <span>
              {m.name}
              <small>{m.total.toLocaleString()} total words</small>
            </span>
            {m.available ? (
              <span className="current-tag">Your focus</span>
            ) : (
              <span className="muted small">
                <LockKeyhole size={14} />
                Coming later
              </span>
            )}
          </div>
        ))}
      </section>
      <Link href="/practice" className="primary-button">
        Start Practice
        <ArrowRight size={19} />
      </Link>
    </div>
  );
}
