import { test, expect } from "@playwright/test";
import { lessons } from "../lib/bopomofo/course";
test("beginner lesson has real audio, ordered strokes, writing comparison and persistent completion", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Learn Bopomofo/ }).click();
  await expect(page.locator(".bpm-lesson-link")).toHaveCount(20);
  await expect(page.locator(".bpm-symbol-grid button")).toHaveCount(37);
  await page.getByRole("link", { name: "Start Bopomofo", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Your first four sounds");
  const audio = page.waitForResponse(
    (r) => r.url().endsWith("3105.wav") && r.ok(),
  );
  await page.getByRole("button", { name: "Hear symbol ㄅ" }).click();
  await audio;
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByRole("button", { name: /Show next stroke/ }).click();
  await expect(
    page.getByRole("img", { name: "Stroke 1 of 1 for ㄅ" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Write ㄅ three times" }).click();
  await expect(page.locator(".tracing-guide svg path")).toHaveCount(1);
  for (let i = 0; i < 3; i++) {
    const canvas = page.locator("canvas");
    await canvas.scrollIntoViewIfNeeded();
    const r = (await canvas.boundingBox())!;
    await page.mouse.move(r.x + r.width * 0.3, r.y + r.height * 0.2);
    await page.mouse.down();
    await page.mouse.move(r.x + r.width * 0.6, r.y + r.height * 0.7, {
      steps: 5,
    });
    await page.mouse.up();
    await page
      .getByRole("button", {
        name: i === 2 ? "Compare writing" : "Next repetition",
        exact: true,
      })
      .click();
  }
  await expect(page.locator(".handwriting-comparison")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCSS("pointer-events", "none");
  await page.screenshot({
    path: "test-results/bopomofo-writing.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Check understanding" }).click();
  const first = lessons[0].checks[0];
  await page
    .getByRole("button", {
      name: first.options.find((o) => o !== first.answer)!,
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("Try once more");
  await expect(
    page.getByRole("button", { name: "Next question" }),
  ).toBeDisabled();
  for (let i = 0; i < 3; i++) {
    await page
      .getByRole("button", { name: lessons[0].checks[i].answer, exact: true })
      .click();
    await page
      .getByRole("button", {
        name: i === 2 ? "Complete lesson" : "Next question",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Lesson complete." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("✓ Completed · revisit whenever you like"),
  ).toBeVisible();
  await page.getByRole("link", { name: "← All Bopomofo lessons" }).click();
  await expect(page.locator(".bpm-course-progress")).toContainText("1 / 20");
  await page.getByRole("link", { name: "Continue Bopomofo" }).click();
  await expect(page).toHaveURL(/open-vowels$/);
});
test("every lesson renders and intermediate readings hide answers; mobile layouts and dark mode fit", async ({
  page,
}) => {
  for (const lesson of lessons) {
    await page.goto(`/bopomofo/${lesson.id}`);
    await expect(page.locator("h1")).toHaveText(lesson.title);
    await expect(page.locator(".bpm-reading")).toHaveCount(
      lesson.examples.length,
    );
  }
  await expect(page.getByText("Wǒ hē shuǐ.", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Reveal reading & meaning" })
    .first()
    .click();
  await expect(page.getByText("Wǒ hē shuǐ.", { exact: true })).toBeVisible();
  for (const width of [360, 412, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 360, height: 900 });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.screenshot({
    path: "test-results/bopomofo-reading-dark.png",
    fullPage: true,
  });
  await page.goto("/bopomofo");
  await page.screenshot({
    path: "test-results/bopomofo-course-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
