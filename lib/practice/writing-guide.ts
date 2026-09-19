/** Zero-based repetition; every character gets its own trace → copy → memory cycle. */
export function writingGuide(repetition: number, total: number) {
  const traceEnd = Math.max(1, Math.floor(total * 0.3));
  const memoryStart = Math.max(traceEnd + 1, Math.floor(total * 0.7));
  if (repetition < traceEnd)
    return {
      stage: "trace" as const,
      label: "Trace the faint guide",
      opacity: 0.24 - (repetition / Math.max(1, traceEnd - 1)) * 0.16,
    };
  if (repetition < memoryStart)
    return {
      stage: "copy" as const,
      label: "Copy the character above",
      opacity: 0,
    };
  return { stage: "memory" as const, label: "Write from memory", opacity: 0 };
}
