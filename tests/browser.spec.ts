import { test, expect, type Page } from "@playwright/test";
async function draw(page: Page) {
  const canvas = page.locator("canvas");
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error("No canvas");
  await page.mouse.move(rect.x + rect.width * 0.3, rect.y + rect.height * 0.25);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width * 0.65,
    rect.y + rect.height * 0.7,
    { steps: 12 },
  );
  await page.mouse.up();
}
test("mobile learning, writing controls, review, persistence, collection and dark mode", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Start Learning", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Start Learning", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("我");
  await expect(page.getByText("wǒ", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play stroke order" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Play stroke order" }).click();
  await expect(page.locator(".stroke-display svg")).toBeVisible();
  await page
    .getByRole("button", { name: "Practice writing", exact: true })
    .click();
  await expect(page.locator("canvas")).toHaveCSS("touch-action", "none");
  await expect(
    page.getByRole("button", { name: "Next repetition" }),
  ).toBeDisabled();
  await expect(page.locator(".writing-stage")).toHaveAttribute(
    "data-stage",
    "trace",
  );
  await expect(page.locator(".tracing-guide svg path").first()).toBeAttached();
  await page.screenshot({
    path: "test-results/fading-guide-mobile.png",
    fullPage: true,
  });
  await draw(page);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Next repetition" }),
  ).toBeDisabled();
  await draw(page);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Next repetition" }),
  ).toBeDisabled();
  // Dispatch a real stylus stroke through Chromium's input system, then interrupt it.
  const cdp = await page.context().newCDPSession(page);
  const box = (await page.locator("canvas").boundingBox())!;
  const scrollBefore = await page.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: box.x + 90, y: box.y + 90, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: box.x + 150, y: box.y + 170, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  await expect(
    page.getByRole("button", { name: "Next repetition" }),
  ).toBeEnabled();
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
  await page.getByRole("button", { name: "Clear", exact: true }).click();

  await cdp.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: box.x + 70,
    y: box.y + 70,
    button: "left",
    buttons: 1,
    clickCount: 1,
    pointerType: "pen",
    force: 0.8,
  });
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: box.x + 140,
    y: box.y + 150,
    button: "left",
    buttons: 1,
    pointerType: "pen",
    force: 0.4,
  });
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: box.x + 140,
    y: box.y + 150,
    button: "left",
    buttons: 0,
    clickCount: 1,
    pointerType: "pen",
  });
  await page
    .locator("canvas")
    .dispatchEvent("pointercancel", { pointerType: "pen", pointerId: 2 });
  await expect(
    page.getByRole("button", { name: "Next repetition" }),
  ).toBeEnabled();
  await draw(page);
  await page.screenshot({
    path: "test-results/writing-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Next repetition" }).click();
  await expect(page.locator(".repetition-heading")).toContainText("1 / 10");
  await page.getByRole("button", { name: "Pause practice" }).click();
  await page.getByRole("link", { name: "Save & leave" }).click();
  await page.getByRole("link", { name: "Start Practice", exact: true }).click();
  await expect(page.locator(".repetition-heading")).toContainText("1 / 10");
  for (let i = 1; i < 10; i++) {
    await expect(page.locator(".writing-stage")).toHaveAttribute(
      "data-stage",
      i < 3 ? "trace" : i < 7 ? "copy" : "memory",
    );
    if (i < 3)
      expect(
        Number(
          await page
            .locator(".tracing-guide")
            .evaluate((el) => getComputedStyle(el).opacity),
        ),
      ).toBeLessThan(0.24);
    else await expect(page.locator(".tracing-guide")).toHaveCount(0);
    await expect(page.locator(".writing-target h1")).toHaveText(
      i < 7 ? "我" : "?",
    );
    await draw(page);
    await page
      .getByRole("button", {
        name: i === 9 ? "Done" : "Next repetition",
        exact: true,
      })
      .click();
  }
  await expect(page.getByText("Write the Hanzi from memory")).toBeVisible();
  await draw(page);
  const drawing = await page.locator("canvas").elementHandle();
  await page.getByRole("button", { name: "Reveal answer" }).click();
  await expect(
    page.getByRole("img", { name: "Correct Hanzi: 我" }),
  ).toBeVisible();
  expect(
    await drawing!.evaluate((el) => el === document.querySelector("canvas")),
  ).toBe(true);
  await expect(page.locator("canvas")).toHaveCSS("pointer-events", "none");
  await expect(
    page.getByRole("button", { name: "Clear", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator("canvas")
        .evaluate((el: HTMLCanvasElement) =>
          [
            ...el.getContext("2d")!.getImageData(0, 0, el.width, el.height)
              .data,
          ].some((v, i) => i % 4 === 3 && v > 0),
        ),
    )
    .toBe(true);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({
    path: "test-results/comparison-light-360.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.screenshot({
    path: "test-results/comparison-dark-360.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("h1")).toHaveText("我");
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("你");
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hanzi100:v1:demo")!),
  );
  expect(data.words["f1-001"].card.reps).toBe(1);
  expect(data.writing.length).toBe(11);
  expect(data.words["f1-001"].card.due).toBeTruthy();
  await page.getByRole("button", { name: "Pause practice" }).click();
  await page.getByRole("link", { name: "Save & leave" }).click();
  await expect(page.locator(".learned-number>strong")).toHaveText("1");
  await page.reload();
  await expect(page.locator(".learned-number>strong")).toHaveText("1");
  await page.getByRole("link", { name: "Words", exact: true }).click();
  await expect(page.locator(".word-card")).toHaveCount(100);
  await page.getByRole("button", { name: "Learning", exact: true }).click();
  await expect(page.locator(".word-card")).toHaveCount(1);
  await page.locator(".word-card").click();
  await expect(page.getByText("wǒ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({
    path: "test-results/word-dark-mobile.png",
    fullPage: true,
  });
  await page.goto("/progress");
  await expect(page.locator(".progress-hero>strong")).toHaveText("1");
  await expect(page.locator(".stats-grid")).toContainText("11");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
test("all key layouts fit 360px, S24 Ultra, iPhone, iPad and desktop", async ({
  page,
}) => {
  for (const width of [360, 412, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/words", "/progress", "/words/f1-027"]) {
      await page.goto(path);
      await expect(page.locator(".loading")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}px`,
      ).toBeTruthy();
    }
    if (width === 1440) {
      await page.goto("/");
      await page.screenshot({
        path: "test-results/home-desktop.png",
        fullPage: true,
      });
    }
  }
});

test("complete first five words, reopen, then receive FSRS due reviews", async ({
  page,
}) => {
  await page.clock.install({ time: new Date() });
  await page.goto("/practice");
  for (let word = 0; word < 5; word++) {
    await page
      .getByRole("button", { name: "Practice writing", exact: true })
      .click();
    for (let i = 0; i < 10; i++) {
      await draw(page);
      await page
        .getByRole("button", {
          name: i === 9 ? "Done" : "Next repetition",
          exact: true,
        })
        .click();
    }
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await page.getByRole("button", { name: "Yes", exact: true }).click();
  }
  await expect(
    page.getByRole("heading", { name: "A good place to pause." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to Home" }).click();
  await expect(page.locator(".learned-number>strong")).toHaveText("5");
  await page.clock.fastForward(11 * 60 * 1000);
  await page.reload();
  await expect(page.locator(".session-hint")).toContainText("reviews ready");
  await page.getByRole("link", { name: "Start Practice", exact: true }).click();
  await expect(page.getByText("Do you remember this?")).toBeVisible();
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hanzi100:v1:demo")!),
  );
  expect(Object.keys(data.words)).toHaveLength(5);
  expect(data.words["f1-001"].card.reps).toBe(2);
  expect(data.reviews).toHaveLength(6);
});
test("multi-character words advance each character before whole-word recall", async ({
  page,
}) => {
  await page.goto("/practice?word=f1-027");
  await expect(page.locator(".writing-target h1")).toHaveText("你");
  for (const char of ["你", "好"]) {
    await expect(page.locator(".writing-target h1")).toHaveText(char);
    await expect(page.locator(".writing-stage")).toHaveAttribute(
      "data-stage",
      "trace",
    );
    for (let i = 0; i < 10; i++) {
      await draw(page);
      await page
        .getByRole("button", {
          name:
            i === 9
              ? char === "你"
                ? "Next character"
                : "Done"
              : "Next repetition",
          exact: true,
        })
        .click();
    }
  }
  await page.getByRole("button", { name: "Reveal answer" }).click();
  await expect(page.locator("h1")).toHaveText("你好");
  await expect(
    page.getByText("No handwriting yet. That’s okay."),
  ).toBeVisible();
  await expect(page.locator(".reference-characters svg")).toHaveCount(2);
  await page.getByRole("button", { name: "Almost" }).click();
  await expect(
    page.getByRole("heading", { name: "A good place to pause." }),
  ).toBeVisible();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hanzi100:v1:demo")!),
  );
  expect(
    data.writing.filter((w: { character: string }) => w.character === "你"),
  ).toHaveLength(10);
  expect(
    data.writing.filter((w: { character: string }) => w.character === "好"),
  ).toHaveLength(10);
  expect(data.reviews[0].rating).toBe(2);
});
