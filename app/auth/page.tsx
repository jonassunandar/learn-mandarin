"use client";
import { useState } from "react";
import Link from "@/components/AppLink";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useLearning } from "@/components/LearningProvider";
export default function Auth() {
  const { user, cloud, syncStatus, sync } = useLearning();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!cloud)
    return (
      <section className="auth-page">
        <p className="eyebrow">YOUR PERSONAL NOTEBOOK</p>
        <h1>You’re ready to learn.</h1>
        <p>Demo mode saves all practice on this device. No account needed.</p>
        <Link className="primary-button" href="/practice">
          Start Practice
        </Link>
      </section>
    );
  return (
    <section className="auth-page">
      <p className="eyebrow">YOUR PERSONAL NOTEBOOK</p>
      <h1>{user ? "Your account" : "Pick up anywhere."}</h1>
      <p className="muted">
        {user
          ? syncStatus
          : "Sign in to keep your words in sync across devices."}
      </p>
      {user ? (
        <>
          <button className="primary-button" onClick={sync}>
            Sync now
          </button>
          <button
            className="text-button"
            onClick={async () => {
              await supabase!.auth.signOut({ scope: "local" });
              router.push("/");
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const fields = new FormData(e.currentTarget);
            const username = String(fields.get("username")).trim();
            if (username !== "admin") {
              setError("Please use the username admin.");
              setBusy(false);
              return;
            }
            const { error } = await supabase!.auth.signInWithPassword({
              email:
                process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@hanzi100.local",
              password: String(fields.get("password")),
            });
            setBusy(false);
            if (error)
              setError(
                "Could not sign in. Check your password, connection, and the Supabase admin account setup.",
              );
            else router.push("/");
          }}
        >
          <label>
            Username
            <input
              name="username"
              autoComplete="username"
              defaultValue="admin"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </label>
          {error && (
            <p className="error-banner" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}
      <Link className="text-button" href="/">
        Back to your notebook
      </Link>
      <p className="small muted">
        Your progress is saved on this device and synced to your account.
      </p>
    </section>
  );
}
