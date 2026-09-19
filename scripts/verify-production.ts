import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { reviewWord, Rating } from "../lib/fsrs/scheduler";

/** Run with node --env-file=.env.local --import tsx scripts/verify-production.ts.
 * Uses temporary accounts; the real learner's progress is never changed.
 */
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.ok(
    url && anon && service,
    "Production Supabase credentials are required",
  );
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(url, service, options);
  const publicClient = createClient(url, anon, options);
  const users: string[] = [];
  try {
    const vocabulary = await publicClient
      .from("vocabulary")
      .select("id", { count: "exact" });
    assert.equal(vocabulary.error, null);
    assert.equal(vocabulary.count, 100);
    const clients: SupabaseClient[] = [];
    for (let i = 0; i < 2; i++) {
      const email = `verification-${randomUUID()}@hanzi100.local`;
      const password = randomUUID() + randomUUID();
      const result = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      assert.equal(result.error, null);
      users.push(result.data.user!.id);
      const client: SupabaseClient = createClient(url, anon, options);
      const login = await client.auth.signInWithPassword({ email, password });
      assert.equal(login.error, null);
      clients.push(client);
    }
    const { word, log } = reviewWord(undefined, "f1-001", Rating.Good);
    const payload = {
      version: 1,
      onboarded: true,
      words: { "f1-001": word },
      reviews: [
        {
          id: randomUUID(),
          vocabularyId: "f1-001",
          rating: 3,
          at: word.updatedAt,
          log,
        },
      ],
      writing: [
        {
          id: randomUUID(),
          vocabularyId: "f1-001",
          character: "我",
          repetitions: 10,
          at: word.updatedAt,
        },
      ],
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      const sync = await clients[0].rpc("sync_learning", { payload });
      assert.equal(sync.error, null);
    }
    for (const table of [
      "user_vocabulary",
      "review_history",
      "handwriting_sessions",
    ]) {
      const own = await clients[0].from(table).select("*", { count: "exact" });
      assert.equal(own.error, null);
      assert.equal(own.count, 1, `${table}: retries must not duplicate data`);
      const other = await clients[1]
        .from(table)
        .select("*", { count: "exact" })
        .eq("user_id", users[0]);
      assert.equal(other.error, null);
      assert.equal(
        other.count,
        0,
        `${table}: another user must not read private rows`,
      );
      const unauthenticated = await publicClient.from(table).select("*");
      assert.ok(unauthenticated.error || unauthenticated.data?.length === 0);
    }
    const forged = await clients[1].from("user_vocabulary").insert({
      user_id: users[0],
      vocabulary_id: "f1-002",
      card: word.card,
      due_at: word.card.due,
      introduced_at: word.introducedAt,
      updated_at: word.updatedAt,
    });
    assert.ok(
      forged.error,
      "RLS must reject writing to another user's account",
    );
    const vocabularyEdit = await clients[0]
      .from("vocabulary")
      .update({ meaning_en: "forbidden" })
      .eq("id", "f1-001")
      .select();
    assert.ok(vocabularyEdit.error || vocabularyEdit.data?.length === 0);
    const unauthenticatedSync = await publicClient.rpc("sync_learning", {
      payload,
    });
    assert.ok(
      unauthenticatedSync.error,
      "Anonymous clients must not call sync",
    );
    console.log(
      "Verified: 100 seeded words, authentication, FSRS sync, idempotency, and user isolation.",
    );
  } finally {
    for (const id of users) {
      const deleted = await admin.auth.admin.deleteUser(id);
      if (deleted.error) throw deleted.error;
    }
    if (users.length)
      console.log("Temporary verification accounts and their data removed.");
  }
}
void main();
