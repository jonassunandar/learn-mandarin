"use client";
import Link from "@/components/AppLink";
import { ArrowLeft, PenLine, ArrowRight } from "lucide-react";
import type { Vocabulary } from "@/types";
import { AudioButton } from "@/components/hanzi/AudioButton";
import { StrokeOrder } from "@/components/hanzi/StrokeOrder";
import { useLearning } from "@/components/LearningProvider";
import { wordState } from "@/lib/fsrs/scheduler";
export function WordDetail({ word }: { word: Vocabulary }) {
  const { data } = useLearning();
  const state = wordState(data.words[word.id]);
  return (
    <div className="word-detail">
      <div className="detail-top">
        <Link className="text-button" href="/words">
          <ArrowLeft size={18} />
          Your words
        </Link>
        <span className={`word-badge ${state}`}>{state}</span>
      </div>
      <div className="word-presentation">
        <p className="eyebrow">
          FOUNDATION 1 · {String(word.order).padStart(3, "0")} / 100
        </p>
        <h1 className="hanzi large" lang="zh-CN">
          {word.hanzi}
        </h1>
        <p className="pinyin">{word.pinyin}</p>
        <h2>{word.meaningEn}</h2>
        <p className="muted">{word.meaningId}</p>
        <AudioButton text={word.hanzi} />
      </div>
      <section className="detail-section">
        <h2>Stroke order</h2>
        <p className="small muted">Follow each stroke, one at a time.</p>
        <StrokeOrder characters={word.characters} />
      </section>
      {word.exampleHanzi && (
        <section className="example-card">
          <span className="eyebrow">IN A FEW WORDS</span>
          <h3 lang="zh-CN">{word.exampleHanzi}</h3>
          <p className="example-pinyin">{word.examplePinyin}</p>
          <p>{word.exampleMeaningEn}</p>
          <p className="muted">{word.exampleMeaningId}</p>
        </section>
      )}
      <Link className="primary-button" href={`/practice?word=${word.id}`}>
        <PenLine size={19} />
        Practice writing
        <ArrowRight size={19} />
      </Link>
    </div>
  );
}
