import { test, expect } from "@playwright/test";
test("production PWA caches the full shell and supports offline navigation, strokes, and reviews", async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.TEST_OFFLINE,
    "Run against npm start with TEST_OFFLINE=1.",
  );
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(
    async () => {
      const keys = await caches.keys();
      const cache = await caches.open(
        keys.find((k) => k.startsWith("hanzi100-"))!,
      );
      const assets = await (await fetch("/offline-assets.json")).json();
      return (
        await Promise.all(assets.map((a: string) => cache.match(a)))
      ).every(Boolean);
    },
    null,
    { timeout: 90000 },
  );
  await page.reload();
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(
    true,
  );
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toHaveLength(3);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Start Learning", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Start Learning", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("我");
  await expect(
    page.getByRole("button", { name: "Play stroke order" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Play stroke order" }).click();
  await page
    .getByRole("button", { name: "Practice writing", exact: true })
    .click();
  await expect(page.locator("canvas")).toBeVisible();
  for(let i=0;i<10;i++){
    const rect=(await page.locator('canvas').boundingBox())!;
    await page.mouse.move(rect.x+80,rect.y+80);await page.mouse.down();await page.mouse.move(rect.x+160,rect.y+170,{steps:3});await page.mouse.up();
    await page.getByRole('button',{name:i===9?'Done':'Next repetition',exact:true}).click();
  }
  await page.getByRole('button',{name:'Reveal answer'}).click();await page.getByRole('button',{name:'Yes',exact:true}).click();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi100:v1:demo')!));
  expect(stored.words['f1-001'].card.reps).toBe(1);expect(stored.writing).toHaveLength(10);

  await page.getByRole("button", { name: "Pause practice" }).click();
  await page.getByRole("link", { name: "Save & leave" }).click();
  await page.getByRole("link", { name: "Words", exact: true }).click();
  await expect(page.locator(".word-card")).toHaveCount(100);
  await page.locator(".word-card").nth(26).click();
  await expect(page.locator("h1")).toHaveText("你好");
  await expect(
    page.getByRole("button", { name: "Play stroke order" }),
  ).toBeEnabled();
});
