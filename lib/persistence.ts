import type { LearningData } from "@/types";
import { supabase } from "@/lib/supabase/client";
export const emptyData = (): LearningData => ({
  version: 1,
  onboarded: false,
  words: {},
  reviews: [],
  writing: [],
});
export function storageKey(userId?: string) {
  return `hanzi100:v1:${userId ?? "demo"}`;
}
export function readLocal(userId?: string): LearningData {
  const value = localStorage.getItem(storageKey(userId));
  if (!value) return emptyData();
  const data = JSON.parse(value) as LearningData;
  if (
    data.version !== 1 ||
    !data.words ||
    !Array.isArray(data.reviews) ||
    !Array.isArray(data.writing)
  )
    throw new Error(
      "Your saved data could not be read. Export browser storage before clearing it.",
    );
  return data;
}
export function saveLocal(data: LearningData, userId?: string) {
  localStorage.setItem(storageKey(userId), JSON.stringify(data));
}
export function mergeData(a: LearningData, b: LearningData): LearningData {
  const words = { ...a.words };
  Object.entries(b.words).forEach(([id, word]) => {
    if (
      !words[id] ||
      Date.parse(word.updatedAt) > Date.parse(words[id].updatedAt)
    )
      words[id] = word;
  });
  return {
    version: 1,
    onboarded: a.onboarded || b.onboarded,
    words,
    reviews: [
      ...new Map([...a.reviews, ...b.reviews].map((r) => [r.id, r])).values(),
    ],
    writing: [
      ...new Map([...a.writing, ...b.writing].map((r) => [r.id, r])).values(),
    ],
  };
}
async function getAll<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const result = await fetchPage(from, from + 999);
    if (result.error) throw new Error(result.error.message);
    rows.push(...(result.data ?? []));
    if ((result.data?.length ?? 0) < 1000) return rows;
  }
}
export async function syncCloud(
  data: LearningData,
  userId: string,
): Promise<LearningData> {
  if (!supabase) return data;
  // One transaction; stable event IDs make retries safe. RPC derives user identity from JWT.
  const { error } = await supabase.rpc("sync_learning", { payload: data });
  if (error) throw error;
  const results = await Promise.all([
    supabase
      .from("user_vocabulary")
      .select("vocabulary_id,card,introduced_at,updated_at")
      .eq("user_id", userId),
    getAll((from, to) =>
      supabase!
        .from("review_history")
        .select("id,vocabulary_id,rating,reviewed_at,log")
        .eq("user_id", userId)
        .order("reviewed_at")
        .order("id")
        .range(from, to),
    ),
    getAll((from, to) =>
      supabase!
        .from("handwriting_sessions")
        .select("id,vocabulary_id,character,repetitions,created_at")
        .eq("user_id", userId)
        .order("created_at")
        .order("id")
        .range(from, to),
    ),
  ]);
  if (results[0].error) throw results[0].error;
  const remote = emptyData();

  for (const w of results[0].data ?? [])
    remote.words[w.vocabulary_id] = {
      vocabularyId: w.vocabulary_id,
      card: w.card,
      introducedAt: w.introduced_at,
      updatedAt: w.updated_at,
    };
  remote.reviews = results[1].map((r) => ({
    id: r.id,
    vocabularyId: r.vocabulary_id,
    rating: r.rating,
    at: r.reviewed_at,
    log: r.log,
  }));
  remote.writing = results[2].map((r) => ({
    id: r.id,
    vocabularyId: r.vocabulary_id,
    character: r.character,
    repetitions: r.repetitions,
    at: r.created_at,
  }));
  remote.onboarded =
    Object.keys(remote.words).length > 0 ||
    remote.reviews.length > 0 ||
    remote.writing.length > 0;
  return mergeData(data, remote);
}
