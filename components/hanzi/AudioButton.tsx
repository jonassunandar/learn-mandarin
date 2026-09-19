"use client";
import { useState } from "react";
import { Volume2 } from "lucide-react";
import { speakMandarin } from "@/lib/audio";
export function AudioButton({ text, label }: { text: string; label?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <>
      <button
        className="audio-button"
        aria-label={label ?? `Hear ${text}`}
        onClick={() => setFailed(!speakMandarin(text))}
      >
        <Volume2 size={21} />
      </button>
      {failed && (
        <p className="muted small" role="status">
          Pronunciation isn’t supported by this browser.
        </p>
      )}
    </>
  );
}
