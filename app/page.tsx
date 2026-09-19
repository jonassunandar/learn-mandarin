"use client";
import Link from "@/components/AppLink";
import {
  ArrowRight,
  PenLine,
  BookOpen,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useLearning } from "@/components/LearningProvider";
import { vocabulary } from "@/lib/vocabulary/data";
import { wordState } from "@/lib/fsrs/scheduler";
import {
  sessionSummary,
  MAX_REVIEWS_PER_SESSION,
} from "@/lib/practice/session";
export default function Home() {
  const { data, ready, onboard } = useLearning();
  if (!ready) return <div className="loading">Opening your notebook…</div>;
  const counts = { new: 0, learning: 0, strong: 0 };
  vocabulary.forEach((w) => counts[wordState(data.words[w.id])]++);
  const learned = 100 - counts.new;
  const { due, fresh } = sessionSummary(data);
  const newCount = due.length >= MAX_REVIEWS_PER_SESSION ? 0 : fresh.length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  const greetingEn =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="home-page">
      <section className="greeting">
        <div>
          <p className="eyebrow">YOUR DAILY MOMENT OF MANDARIN</p>
          <h1>
            <span lang="zh-CN">{greeting}</span>
            <span className="greeting-period">。</span>
          </h1>
          <p className="muted">
            {greetingEn}. A little practice goes a long way.
          </p>
        </div>
        <div className="greeting-mark" aria-hidden="true">
          日<span>积</span>月<span>累</span>
        </div>
      </section>
      <div className="home-layout">
        <section className="foundation-card">
          <div className="section-line">
            <span className="eyebrow">FOUNDATION 1</span>
            <span className="tag">THE FIRST 100</span>
          </div>
          <h2>
            {data.onboarded
              ? "Small steps. Lasting words."
              : "Your first words start here."}
          </h2>
          <p className="card-description">
            {data.onboarded
              ? "See, recall, and write. Make a little more familiar."
              : "Learn Mandarin by seeing, recalling, and writing. Five words at a time."}
          </p>
          <div className="learned-number">
            <strong>{learned}</strong>
            <span>
              / 100 <span>words learned</span>
            </span>
            <span className="mini-hanzi" aria-hidden="true">
              学
            </span>
          </div>
          <div
            className="segmented-progress"
            aria-label={`${learned} of 100 words learned`}
          >
            {Array.from({ length: 50 }, (_, i) => (
              <span
                key={i}
                className={
                  i < counts.strong / 2
                    ? "strong"
                    : i < learned / 2
                      ? "learning"
                      : ""
                }
              />
            ))}
          </div>
          <div className="progress-caption">
            <span>A foundation for every word to come.</span>
            <span>{learned}%</span>
          </div>
          <Link
            href="/practice"
            onClick={onboard}
            className="primary-button start-button"
          >
            <PenLine size={20} />
            <span>{data.onboarded ? "Start Practice" : "Start Learning"}</span>
            <ArrowRight size={20} />
          </Link>
          <p className="session-hint">
            {due.length
              ? `${due.length} reviews ready for you`
              : newCount
                ? `${newCount} new words. A fresh page.`
                : "All caught up. Your next review is on its way."}
          </p>
        </section>
        <div className="home-side">
          <section className="today-section">
            <div className="section-heading">
              <h2>Today’s practice</h2>
              <span className="small muted">Made for you</span>
            </div>
            <div className="today-items">
              <div>
                <span className="soft-icon">
                  <BookOpen size={19} />
                </span>
                <span>
                  <strong>{newCount} new words</strong>
                  <small>Build your foundation</small>
                </span>
                <span className="row-number">
                  {String(newCount).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="soft-icon">
                  <PenLine size={19} />
                </span>
                <span>
                  <strong>{Math.min(due.length, 15)} reviews</strong>
                  <small>Keep familiar words close</small>
                </span>
                <span className="row-number">
                  {String(Math.min(due.length, 15)).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="soft-icon">
                  <Clock size={19} />
                </span>
                <span>
                  <strong>
                    {Math.max(
                      1,
                      Math.round(
                        newCount * 2 + Math.min(due.length, 15) * 0.45,
                      ),
                    )}{" "}
                    minutes
                  </strong>
                  <small>A little room in your day</small>
                </span>
              </div>
            </div>
          </section>
          <section className="word-states">
            <div className="section-heading">
              <h2>Your words, taking shape</h2>
              <Link href="/progress" aria-label="View progress">
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="state-columns">
              {(["strong", "learning", "new"] as const).map((state, i) => (
                <div key={state}>
                  <span className={`state-symbol ${state}`}>
                    {["●", "◐", "○"][i]}
                  </span>
                  <strong>{counts[state]}</strong>
                  <span>{state[0].toUpperCase() + state.slice(1)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Link href="/words" className="collection-link">
        <span className="collection-character" lang="zh-CN">
          我
        </span>
        <span>
          <strong>One hundred words. Endless beginnings.</strong>
          <small>Explore your Foundation 1 collection</small>
        </span>
        <ChevronRight size={20} />
      </Link>
      <p className="closing-note">No rush. Just one word, then another.</p>
    </div>
  );
}
