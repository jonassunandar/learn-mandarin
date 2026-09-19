import { vocabulary } from "@/lib/vocabulary/data";
import { wordState } from "@/lib/fsrs/scheduler";
import type { LearningData } from "@/types";
export const NEW_WORDS_PER_DAY = 5;
export const MAX_REVIEWS_PER_SESSION = 15;
export const REPETITIONS = { new: 10, learning: 5, strong: 3 };
export type Exercise = {
  wordId: string;
  type: "learn" | "recognition" | "recall" | "writing";
  repetitions?: number;
  isNew?: boolean;
};
export function localDay(date: Date | string = new Date()) {
  return new Date(date).toLocaleDateString("en-CA");
}
export function sessionSummary(data: LearningData, now = new Date()) {
  const due = vocabulary
    .filter(
      (w) => data.words[w.id] && new Date(data.words[w.id].card.due) <= now,
    )
    .sort(
      (a, b) =>
        Date.parse(data.words[a.id].card.due) -
        Date.parse(data.words[b.id].card.due),
    );
  const introduced = Object.values(data.words).filter(
    (w) => localDay(w.introducedAt) === localDay(now),
  ).length;
  const fresh = vocabulary
    .filter((w) => !data.words[w.id])
    .slice(0, Math.max(0, NEW_WORDS_PER_DAY - introduced));
  return { due, fresh };
}
export function buildSession(data: LearningData, now = new Date()): Exercise[] {
  const { due, fresh } = sessionSummary(data, now);
  const exercises: Exercise[] = [];
  due.slice(0, MAX_REVIEWS_PER_SESSION).forEach((w, i) => {
    exercises.push({
      wordId: w.id,
      type: i % 2 === 0 ? "recognition" : "recall",
    });
    if (i % 3 === 0)
      exercises.push({
        wordId: w.id,
        type: "writing",
        repetitions: REPETITIONS[wordState(data.words[w.id])],
      });
  });
  // A full review queue gets priority; new words wait for a shorter session.
  if (due.length < MAX_REVIEWS_PER_SESSION)
    fresh.forEach((w) =>
      exercises.push(
        { wordId: w.id, type: "learn", isNew: true },
        {
          wordId: w.id,
          type: "writing",
          repetitions: REPETITIONS.new,
          isNew: true,
        },
        { wordId: w.id, type: "recall", isNew: true },
      ),
    );
  return exercises;
}
