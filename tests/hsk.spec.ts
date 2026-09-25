import { test, expect } from "@playwright/test";
test("guided path persists daily tasks, correction, checkpoints and mobile layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/hsk");
  await page.getByLabel("Daily study time").selectOption("40");
  await page.getByRole("button", { name: "Start my 90-day plan" }).click();
  await expect(
    page.getByRole("region", { name: "Daily study plan" }),
  ).toBeVisible();
  for (const box of await page.locator(".hsk-tasks input").all())
    await box.check();
  await expect(
    page.getByText("1 / 90 study days completed", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hide text for listening" }).click();
  await expect(page.locator(".hsk-hanzi")).toHaveCount(0);
  await page.getByRole("button", { name: "Show example text" }).click();
  await expect(page.locator(".hsk-hanzi")).toHaveCount(3);
  await page.getByRole("button", { name: "我是学生。", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Not yet");
  await page.getByRole("button", { name: "你是学生吗？", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct");
  await page.getByLabel("I completed the practical checkpoint").check();
  await page.reload();
  await expect(
    page.getByText("1 / 90 study days completed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Daily study time")).toHaveValue("40");
  await expect(
    page.getByLabel("I completed the practical checkpoint"),
  ).toBeChecked();
  await page.locator(".hsk-tasks input").first().uncheck();
  await page.reload();
  await expect(page.locator(".hsk-tasks input").first()).not.toBeChecked();
  await page.getByLabel("Study day", { exact: true }).selectOption("90");
  await expect(
    page.getByRole("heading", { name: "Repair gaps at your own pace" }),
  ).toBeVisible();
  for (const width of [360, 412, 768]) {
    await page.setViewportSize({ width, height: 915 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByLabel("Study day", { exact: true }).selectOption("1");
  await page.setViewportSize({ width: 412, height: 915 });
  await page.screenshot({
    path: "test-results/hsk-mobile.png",
    fullPage: true,
  });
  await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
  await page.screenshot({ path: "test-results/hsk-dark.png", fullPage: true });
  expect(errors).toEqual([]);
});
