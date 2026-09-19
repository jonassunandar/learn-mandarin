import { createClient } from "@supabase/supabase-js";
// Run: node --env-file=.env.local --import tsx scripts/create-admin.ts
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Set Supabase URL and server-only service role key in .env.local.",
    );
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.admin.createUser({
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@hanzi100.local",
    password: "adminadminadmin",
    email_confirm: true,
    user_metadata: { username: "admin" },
  });
  if (error) throw error;
  console.log(
    "Created admin account. Sign in with username admin and password adminadminadmin.",
  );
}
void main();
