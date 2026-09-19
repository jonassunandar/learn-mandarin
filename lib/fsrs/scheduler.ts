import { createEmptyCard, fsrs, Rating, State, type Card } from "ts-fsrs";
import type { SavedCard, WordProgress, WordState } from "@/types";
export { Rating };
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false });
export function restoreCard(card: SavedCard): Card {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  };
}
export function reviewWord(
  previous: WordProgress | undefined,
  vocabularyId: string,
  rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy,
  now = new Date(),
) {
  const result = scheduler.next(
    previous ? restoreCard(previous.card) : createEmptyCard(now),
    now,
    rating,
  );
  const word: WordProgress = {
    vocabularyId,
    introducedAt: previous?.introducedAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
    card: {
      ...result.card,
      due: result.card.due.toISOString(),
      last_review: result.card.last_review?.toISOString(),
    },
  };
  return { word, log: result.log };
}
export function wordState(word?: WordProgress): WordState {
  if (!word) return "new";
  return word.card.state === State.Review && word.card.stability >= 7
    ? "strong"
    : "learning";
}
