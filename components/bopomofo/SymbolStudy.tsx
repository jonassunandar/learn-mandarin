"use client";
import { useEffect, useRef, useState } from "react";
import {
  symbols,
  symbolAsset,
  type BopomofoSymbol,
} from "@/lib/bopomofo/symbols";
import {
  HandwritingCanvas,
  type CanvasHandle,
} from "@/components/hanzi/HandwritingCanvas";
import { HanziGlyph } from "@/components/hanzi/HanziGlyph";
import { SymbolAudio } from "./SymbolAudio";

function StrokeSteps({ symbol }: { symbol: string }) {
  const [strokes, setStrokes] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(symbolAsset(symbol, "json"), { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Unavailable");
        return r.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) setStrokes(data.strokes);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [symbol]);
  return (
    <div className="bpm-strokes">
      <svg
        viewBox="-100 -100 2248 2248"
        role="img"
        aria-label={`Stroke ${step} of ${strokes.length} for ${symbol}`}
      >
        {strokes.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="currentColor"
            opacity={i < step ? 1 : 0.13}
          />
        ))}
      </svg>
      {failed ? (
        <p role="status">Stroke guide could not load.</p>
      ) : (
        <button
          className="text-button"
          disabled={!strokes.length}
          onClick={() => setStep((s) => (s >= strokes.length ? 0 : s + 1))}
        >
          {step === strokes.length ? "Reset strokes" : "Show next stroke"} ·{" "}
          {step} / {strokes.length}
        </button>
      )}
    </div>
  );
}
function Notebook({
  item,
  onNext,
  hasNext,
}: {
  item: BopomofoSymbol;
  onNext: () => void;
  hasNext: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const [ink, setInk] = useState(false);
  const [hint, setHint] = useState(false);
  const canvas = useRef<CanvasHandle>(null);
  const lock = useRef(false);
  useEffect(() => {
    lock.current = false;
  }, [attempt]);
  const memory = attempt === 2,
    done = attempt === 3;
  function next() {
    if (lock.current || !canvas.current?.hasInk()) return;
    lock.current = true;
    if (attempt < 2) canvas.current.clear();
    setHint(false);
    setAttempt((a) => a + 1);
  }
  return (
    <div className="bpm-notebook">
      <div className="bpm-symbol-heading">
        <span className="bpm-symbol" lang="zh-TW">
          {memory ? "?" : item.symbol}
        </span>
        <div>
          <p className="pinyin">{item.pinyin}</p>
          <SymbolAudio symbol={item.symbol} />
        </div>
      </div>
      <p className="muted">{item.tip}</p>
      <p className="bpm-stage" aria-live="polite">
        {done
          ? "Compare your last attempt"
          : `${attempt + 1} / 3 · ${attempt === 0 ? "Trace the guide" : memory ? "Write from memory" : "Copy the symbol"}`}
      </p>
      <div className={done ? "handwriting-comparison" : ""}>
        <div>
          {done && <p className="comparison-label">Your writing</p>}
          <HandwritingCanvas
            ref={canvas}
            onInkChange={setInk}
            readOnly={done}
            guide={
              attempt === 0
                ? { character: item.symbol, opacity: 0.2 }
                : undefined
            }
          />
        </div>
        {done && (
          <div>
            <p className="comparison-label">Reference</p>
            <div className="writing-paper">
              <HanziGlyph character={item.symbol} />
            </div>
          </div>
        )}
      </div>
      {!done ? (
        <button className="primary-button" disabled={!ink} onClick={next}>
          {memory ? "Compare writing" : "Next repetition"}
        </button>
      ) : (
        <button
          className="primary-button"
          onClick={
            hasNext
              ? onNext
              : () => {
                  canvas.current?.clear();
                  setAttempt(0);
                }
          }
        >
          {hasNext ? "Next symbol" : "Write again"}
        </button>
      )}
      <button
        className="text-button bpm-hint"
        aria-expanded={hint}
        onClick={() => setHint(!hint)}
      >
        {hint ? "Hide" : "View"} stroke order
      </button>
      {hint && <StrokeSteps key={item.symbol} symbol={item.symbol} />}
      <p className="helper">
        These drawings stay on this page. Judge the shape yourself.
      </p>
    </div>
  );
}
export function SymbolStudy({ characters }: { characters: string[] }) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const item = symbols.find((s) => s.symbol === characters[selected])!;
  return (
    <section className="bpm-study" aria-label="Symbol notebook">
      <h2>Listen, then write</h2>
      {!open ? (
        <>
          <div className="bpm-symbol-tabs">
            {characters.map((char, i) => (
              <button
                key={char}
                lang="zh-TW"
                aria-pressed={i === selected}
                onClick={() => setSelected(i)}
              >
                {char}
              </button>
            ))}
          </div>
          <p>
            <strong>{item.symbol}</strong> · Pinyin sound: {item.pinyin}
          </p>
          <p className="muted">{item.tip}</p>
          <SymbolAudio key={item.symbol} symbol={item.symbol} />
          <StrokeSteps key={item.symbol + "-strokes"} symbol={item.symbol} />
          <button className="primary-button" onClick={() => setOpen(true)}>
            Write {item.symbol} three times
          </button>
        </>
      ) : (
        <>
          <Notebook
            key={item.symbol}
            item={item}
            hasNext={selected < characters.length - 1}
            onNext={() => setSelected((s) => s + 1)}
          />
          <button className="text-button" onClick={() => setOpen(false)}>
            Back to symbols
          </button>
        </>
      )}
    </section>
  );
}
