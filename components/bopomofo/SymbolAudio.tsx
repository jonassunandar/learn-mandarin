"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { symbolAsset } from "@/lib/bopomofo/symbols";
export function SymbolAudio({ symbol }: { symbol: string }) {
  const player = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState(false);
  useEffect(
    () => () => {
      player.current?.pause();
    },
    [],
  );
  async function play() {
    setError(false);
    player.current?.pause();
    const audio = new Audio(symbolAsset(symbol, "wav"));
    player.current = audio;
    try {
      await audio.play();
    } catch {
      setError(true);
    }
  }
  return (
    <>
      <button
        className="text-button"
        onClick={play}
        aria-label={`Hear symbol ${symbol}`}
      >
        <Volume2 size={18} /> Hear sound
      </button>
      {error && (
        <p role="status" className="helper">
          Audio could not play. Check your connection or device audio settings.
        </p>
      )}
    </>
  );
}
