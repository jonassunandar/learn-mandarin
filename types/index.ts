export type Vocabulary = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaningEn: string;
  meaningId: string;
  characters: string[];
  exampleHanzi?: string;
  examplePinyin?: string;
  exampleMeaningEn?: string;
  exampleMeaningId?: string;
  level: number;
  order: number;
};
export type SavedCard = {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
};
export type WordProgress = {
  vocabularyId: string;
  card: SavedCard;
  introducedAt: string;
  updatedAt: string;
};
export type Review = {
  id: string;
  vocabularyId: string;
  rating: number;
  at: string;
  log: unknown;
};
export type Writing = {
  id: string;
  vocabularyId: string;
  character: string;
  repetitions: number;
  at: string;
};
export type LearningData = {
  version: 1;
  onboarded: boolean;
  words: Record<string, WordProgress>;
  reviews: Review[];
  writing: Writing[];
  bopomofo: Record<string, string>;
};
export type WordState = "new" | "learning" | "strong";
