"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import type { LearningData } from "@/types";
import {
  emptyData,
  readLocal,
  saveLocal,
  syncCloud,
  mergeData,
} from "@/lib/persistence";
import { supabase } from "@/lib/supabase/client";
import { newId } from "@/lib/id";
import { reviewWord, Rating } from "@/lib/fsrs/scheduler";
type LocalIdentity = Pick<User, "id" | "email">;
const IDENTITY_KEY = "hanzi100:last-account";
type ContextValue = {
  data: LearningData;
  ready: boolean;
  user: LocalIdentity | null;
  cloud: boolean;
  syncStatus: string;
  error: string;
  onboard: () => void;
  review: (
    id: string,
    rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy,
  ) => void;
  write: (id: string, character: string) => void;
  sync: () => void;
};
const Context = createContext<ContextValue | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(emptyData);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<LocalIdentity | null>(null);
  const [error, setError] = useState("");
  const [syncStatus, setSyncStatus] = useState("Saved on this device");
  const current = useRef(data);
  const identity = useRef<string | undefined>(undefined);
  const busy = useRef(false);
  const sync = useCallback(async () => {
    const uid = identity.current;
    if (!uid || busy.current || !navigator.onLine) return;
    busy.current = true;
    setSyncStatus("Syncing…");
    try {
      const merged = await syncCloud(current.current, uid);
      if (identity.current !== uid) return;
      const next = mergeData(current.current, merged);
      saveLocal(next, uid);
      current.current = next;
      setData(next);
      setSyncStatus("Synced");
    } catch {
      setSyncStatus("Saved locally · sync pending");
    } finally {
      busy.current = false;
    }
  }, []);
  useEffect(() => {
    let alive = true;
    const load = (u: LocalIdentity | null) => {
      if (!alive) return;
      setReady(false);
      identity.current = u?.id;
      setUser(u);
      try {
        if (supabase) {
          if (u)
            localStorage.setItem(
              IDENTITY_KEY,
              JSON.stringify({ id: u.id, email: u.email }),
            );
          else localStorage.removeItem(IDENTITY_KEY);
        }
        const d = readLocal(u?.id);
        current.current = d;
        setData(d);
        setError("");
      } catch (e) {
        setError((e as Error).message);
      }
      setReady(true);
      if (u) {
        setSyncStatus("Saved locally · sync pending");
        void sync();
      } else setSyncStatus("Saved on this device");
    };
    if (supabase) {
      // Cached identity only chooses device storage. Supabase still authenticates every request.
      // Open the notebook immediately even when an expired token cannot refresh offline.
      let cached: LocalIdentity | null = null;
      try {
        const value = JSON.parse(localStorage.getItem(IDENTITY_KEY) || "null");
        if (typeof value?.id === "string") cached = value;
      } catch {}
      load(cached);
      void supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (data.session) load(data.session.user);
          else if (!cached || (!error && navigator.onLine)) load(null);
        })
        .catch(() => {
          if (!cached) load(null);
        });
      const { data: subscription } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (
            session ||
            event === "SIGNED_OUT" ||
            (!cached && event === "INITIAL_SESSION")
          ) {
            setTimeout(() => load(session?.user ?? null), 0);
          }
        },
      );
      return () => {
        alive = false;
        subscription.subscription.unsubscribe();
      };
    }
    load(null);
    return () => {
      alive = false;
    };
  }, [sync]);
  useEffect(() => {
    const online = () => void sync();
    window.addEventListener("online", online);
    const timer = setInterval(online, 30000);
    return () => {
      window.removeEventListener("online", online);
      clearInterval(timer);
    };
  }, [sync]);
  const update = useCallback((fn: (d: LearningData) => LearningData) => {
    const next = fn(current.current);
    try {
      saveLocal(next, identity.current);
    } catch {
      setError(
        "Storage is full or unavailable. Your latest work is in memory; keep this tab open and enable browser storage.",
      );
    }
    current.current = next;
    setData(next);
    if (identity.current) setSyncStatus("Saved locally · sync pending");
  }, []);
  const onboard = useCallback(
    () => update((d) => ({ ...d, onboarded: true })),
    [update],
  );
  const review = useCallback(
    (
      id: string,
      rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy,
    ) => {
      update((d) => {
        const { word, log } = reviewWord(d.words[id], id, rating);
        return {
          ...d,
          onboarded: true,
          words: { ...d.words, [id]: word },
          reviews: [
            ...d.reviews,
            { id: newId(), vocabularyId: id, rating, at: word.updatedAt, log },
          ],
        };
      });
      void sync();
    },
    [update, sync],
  );
  const write = useCallback(
    (id: string, character: string) => {
      update((d) => ({
        ...d,
        writing: [
          ...d.writing,
          {
            id: newId(),
            vocabularyId: id,
            character,
            repetitions: 1,
            at: new Date().toISOString(),
          },
        ],
      }));
    },
    [update],
  );
  return (
    <Context.Provider
      value={{
        data,
        ready,
        user,
        cloud: !!supabase,
        syncStatus,
        error,
        onboard,
        review,
        write,
        sync,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLearning() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("LearningProvider missing");
  return ctx;
}
