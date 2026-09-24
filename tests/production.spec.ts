import { test, expect, type BrowserContext } from "@playwright/test";
import { createClient, type Session } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { lessons } from "../lib/bopomofo/course";

test.describe("production Supabase", () => {
  test.skip(
    !process.env.TEST_PRODUCTION,
    "Set TEST_PRODUCTION=1 with production credentials.",
  );
  test("admin signs in through the deployed UI and can browse all 100 words", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/auth$/);
    await page.getByLabel("Username", { exact: true }).fill("admin");
    await page.getByLabel("Password", { exact: true }).fill("adminadminadmin");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".save-status")).toContainText("Synced", {
      timeout: 30000,
    });
    await expect(page.locator(".learned-number>strong")).toHaveText("0");
    await page.getByRole("link", { name: "Words", exact: true }).click();
    await expect(page.locator(".word-card")).toHaveCount(100);
    await page.goto("/auth");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
  });

  test("offline practice syncs to production and survives a fresh device", async ({
    page,
    context,
    browser,
  }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    expect(url && anon && service).toBeTruthy();
    const options = {
      auth: { persistSession: false, autoRefreshToken: false },
    };
    const admin = createClient(url, service, options);
    const learner = createClient(url, anon, options);
    const email = `browser-check-${randomUUID()}@hanzi100.local`;
    const password = randomUUID() + randomUUID();
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (created.error) throw created.error;
    let second: BrowserContext | undefined;
    try {
      const login = await learner.auth.signInWithPassword({ email, password });
      if (login.error) throw login.error;
      const session = login.data.session!;
      const seed = {
        key: `sb-${new URL(url).hostname.split(".")[0]}-auth-token`,
        session,
      };
      const restore = ({ key, session }: { key: string; session: Session }) => {
        localStorage.setItem(key, JSON.stringify(session));
        localStorage.setItem(
          "hanzi100:last-account",
          JSON.stringify({ id: session.user.id, email: session.user.email }),
        );
      };
      await context.addInitScript(restore, seed);
      await page.goto("/");
      await expect(page.locator(".save-status")).toContainText("Synced", {
        timeout: 30000,
      });
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await expect
        .poll(
          () =>
            page.evaluate(async () => {
              const assets = await (await fetch("/offline-assets.json")).json();
              const cache = await caches.open(
                (await caches.keys()).find((k) => k.startsWith("hanzi100-"))!,
              );
              return (
                await Promise.all(
                  assets.map((asset: string) => cache.match(asset)),
                )
              ).every(Boolean);
            }),
          { timeout: 90000 },
        )
        .toBe(true);
      await context.setOffline(true);
      await page.reload();
      await page
        .getByRole("link", { name: "Start Learning", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Play stroke order" }),
      ).toBeEnabled();
      await page
        .getByRole("button", { name: "Practice writing", exact: true })
        .click();
      for (let i = 0; i < 10; i++) {
        await expect(page.locator(".writing-stage")).toHaveAttribute(
          "data-stage",
          i < 3 ? "trace" : i < 7 ? "copy" : "memory",
        );
        if (i === 0)
          await expect(
            page.locator(".tracing-guide svg path").first(),
          ).toBeAttached();
        const rect = (await page.locator("canvas").boundingBox())!;
        await page.mouse.move(rect.x + 80, rect.y + 80);
        await page.mouse.down();
        await page.mouse.move(rect.x + 150, rect.y + 170, { steps: 4 });
        await page.mouse.up();
        await page
          .getByRole("button", {
            name: i === 9 ? "Done" : "Next repetition",
            exact: true,
          })
          .click();
      }
      await page.getByRole("button", { name: "Reveal answer" }).click();
      await expect(
        page.getByRole("img", { name: "Correct Hanzi: 我" }),
      ).toBeVisible();
      await expect(
        page.locator(".reference-characters svg path").first(),
      ).toBeAttached();
      await page.getByRole("button", { name: "Yes", exact: true }).click();
      await page.getByRole("button", { name: "Pause practice" }).click();
      await page.getByRole("link", { name: "Save & leave" }).click();
      await expect(page.locator(".learned-number>strong")).toHaveText("1");
      await page.getByRole("link", { name: /Learn Bopomofo/ }).click();
      await page
        .getByRole("link", { name: "Start Bopomofo", exact: true })
        .click();
      await expect(page.locator("h1")).toHaveText("Your first four sounds");
      const range = await page.evaluate(async () => {
        const response = await fetch("/bopomofo/3105.wav", {
          headers: { Range: "bytes=0-3" },
        });
        return { status: response.status, text: await response.text() };
      });
      expect(range).toEqual({ status: 206, text: "RIFF" });
      await page.getByRole("button", { name: "Hear symbol ㄅ" }).click();
      await page.getByRole("button", { name: /Show next stroke/ }).click();
      await expect(
        page.getByRole("img", { name: "Stroke 1 of 1 for ㄅ" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Check understanding" }).click();
      for (let i = 0; i < 3; i++) {
        await page
          .getByRole("button", {
            name: lessons[0].checks[i].answer,
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: i === 2 ? "Complete lesson" : "Next question",
            exact: true,
          })
          .click();
      }
      await page.getByRole("link", { name: "← All Bopomofo lessons" }).click();
      await expect(page.locator(".bpm-course-progress")).toContainText(
        "1 / 20",
      );
      await context.setOffline(false);
      await expect(page.locator(".save-status")).toContainText("Synced", {
        timeout: 45000,
      });
      await expect
        .poll(async () => {
          const r = await learner
            .from("review_history")
            .select("id", { count: "exact" });
          return r.count;
        })
        .toBe(1);
      const writing = await learner
        .from("handwriting_sessions")
        .select("repetitions");
      expect(writing.data?.reduce((sum, row) => sum + row.repetitions, 0)).toBe(
        10,
      );
      second = await browser.newContext();
      await second.addInitScript(restore, seed);
      const otherPage = await second.newPage();
      await otherPage.goto(process.env.TEST_BASE_URL!);
      await expect(otherPage.locator(".learned-number>strong")).toHaveText(
        "1",
        { timeout: 30000 },
      );
      await otherPage
        .getByRole("link", { name: "Progress", exact: true })
        .click();
      await expect(otherPage.locator(".stats-grid")).toContainText("10");
      await expect(otherPage.locator(".bpm-progress-card")).toContainText(
        "1 / 20",
      );
      const completions = await learner
        .from("bopomofo_progress")
        .select("lesson_id");
      expect(completions.error).toBeNull();
      expect(completions.data).toEqual([{ lesson_id: "first-symbols" }]);
    } finally {
      await context.setOffline(false);
      await second?.close();
      const deleted = await admin.auth.admin.deleteUser(created.data.user!.id);
      if (deleted.error) throw deleted.error;
    }
  });
});
