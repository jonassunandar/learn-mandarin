"use client";
import Link from "@/components/AppLink";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Grid2X2,
  PenLine,
  ChartNoAxesColumnIncreasing,
  Moon,
  Sun,
  Cloud,
  ArrowUpRight,
} from "lucide-react";
import { useLearning } from "./LearningProvider";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const { syncStatus, cloud, user, error, ready } = useLearning();
  const practicing = path === "/practice";
  const needsSignIn = cloud && !user && path !== "/auth";
  useEffect(() => {
    if (ready && needsSignIn) router.replace("/auth");
  }, [ready, needsSignIn, router]);
  useEffect(() => {
    const choice = localStorage.getItem("hanzi100-theme");
    const value = choice
      ? choice === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(value);
    document.documentElement.dataset.theme = value ? "dark" : "light";
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Practice remains available if the browser blocks installation. */
      });
  }, []);
  function toggle() {
    setDark(!dark);
    document.documentElement.dataset.theme = !dark ? "dark" : "light";
    localStorage.setItem("hanzi100-theme", !dark ? "dark" : "light");
  }
  return (
    <div className={`app-shell ${practicing ? "is-practicing" : ""}`}>
      <header className="topbar">
        <Link
          href="/"
          className="brand"
          aria-label="Hanzi100 home"
          onClick={(e) => {
            if (practicing) e.preventDefault();
          }}
          tabIndex={practicing ? -1 : 0}
        >
          <span className="brand-seal">字</span>
          <span>
            Hanzi<span className="brand-number">100</span>
          </span>
        </Link>
        <div className="header-actions">
          <span className="edition">A LITTLE, EVERY DAY.</span>
          <button
            className="icon-button"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </header>
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      <main id="main">
        {needsSignIn ? (
          <div className="loading">Opening your account…</div>
        ) : (
          children
        )}
      </main>
      {!practicing && !needsSignIn && (!cloud || !!user) && (
        <>
          <footer className="save-status">
            <Cloud size={14} />
            {syncStatus}
            {cloud && (
              <Link href="/auth">
                {user ? "Account" : "Sign in to sync"}
                <ArrowUpRight size={13} />
              </Link>
            )}
          </footer>
          <nav className="bottom-nav" aria-label="Main navigation">
            {[
              { href: "/", label: "Home", Icon: Home },
              { href: "/words", label: "Words", Icon: Grid2X2 },
              { href: "/practice", label: "Practice", Icon: PenLine },
              {
                href: "/progress",
                label: "Progress",
                Icon: ChartNoAxesColumnIncreasing,
              },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`${path === href || (href === "/words" && path.startsWith("/words/")) ? "active" : ""} ${href === "/practice" ? "practice-nav" : ""}`}
                aria-current={path === href ? "page" : undefined}
              >
                <Icon size={21} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
