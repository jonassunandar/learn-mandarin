"use client";
import { useEffect, useRef, useState } from "react";
import type HanziWriter from "hanzi-writer";
import { RotateCcw } from "lucide-react";
export function StrokeOrder({ characters }: { characters: string[] }) {
  const [selected, setSelected] = useState(0);
  const holder = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziWriter | null>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let stopped = false;
    setError(false);
    setLoaded(false);
    const el = holder.current;
    if (!el) return;
    el.replaceChildren();
    void import("hanzi-writer")
      .then(({ default: Writer }) => {
        if (stopped) return;
        writer.current = Writer.create(el, characters[selected], {
          width: 230,
          height: 230,
          padding: 18,
          strokeColor: "#284b40",
          radicalColor: "#284b40",
          outlineColor: "#dcded5",
          drawingWidth: 5,
          strokeAnimationSpeed: 0.7,
          delayBetweenStrokes: 260,
          charDataLoader: async (char) => {
            const response = await fetch(
              `/hanzi/${encodeURIComponent(char)}.json`,
            );
            if (!response.ok) throw new Error("Stroke data unavailable");
            return response.json();
          },
          onLoadCharDataSuccess: () => {
            if (!stopped) setLoaded(true);
          },
          onLoadCharDataError: () => {
            if (!stopped) setError(true);
          },
        });
      })
      .catch(() => setError(true));
    return () => {
      stopped = true;
      writer.current?.pauseAnimation();
      el.replaceChildren();
    };
  }, [characters, selected]);
  return (
    <div className="stroke-order">
      {characters.length > 1 && (
        <div className="character-tabs" aria-label="Choose character">
          {characters.map((c, i) => (
            <button
              key={`${c}-${i}`}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              className={selected === i ? "selected" : ""}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="stroke-display" ref={holder} />
      {error ? (
        <p role="status">
          Stroke order couldn’t load. Reopen this word when online.
        </p>
      ) : (
        <button
          className="text-button replay"
          disabled={!loaded}
          onClick={() => void writer.current?.animateCharacter()}
        >
          <RotateCcw size={16} />
          {loaded ? "Play stroke order" : "Loading strokes…"}
        </button>
      )}
    </div>
  );
}
