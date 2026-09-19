"use client";
import { useEffect, useState } from "react";

/** Uses the same bundled stroke shapes as stroke-order playback, including offline. */
export function HanziGlyph({ character }: { character: string }) {
  const [data, setData] = useState<{ character: string; strokes: string[] }>();
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/hanzi/${encodeURIComponent(character)}.json`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Stroke data unavailable");
        return response.json();
      })
      .then((value: { strokes: string[] }) => {
        if (!controller.signal.aborted)
          setData({ character, strokes: value.strokes });
      })
      .catch(() => {
        /* A readable character remains available if its guide cannot load. */
      });
    return () => controller.abort();
  }, [character]);
  return data?.character === character ? (
    <svg
      className="hanzi-glyph"
      viewBox="-100 -100 1224 1224"
      aria-hidden="true"
    >
      <g transform="translate(0, 900) scale(1, -1)" fill="currentColor">
        {data.strokes.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  ) : (
    <span className="hanzi-glyph glyph-fallback hanzi" aria-hidden="true">
      {character}
    </span>
  );
}
