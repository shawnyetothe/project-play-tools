import { expect, test } from "@playwright/test";

async function drag(page: import("@playwright/test").Page) {
  const canvas = page.getByTestId("hero-canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("canvas has no box");
  await page.mouse.move(box.x + 24, box.y + box.height * 0.45);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 24, box.y + box.height * 0.55, { steps: 12 });
  await page.mouse.up();
}

test("hero draws at 390px and takes a drag", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html");
  const canvas = page.getByTestId("hero-canvas");
  const box = await canvas.boundingBox();
  expect(box && box.width).toBeGreaterThan(300);
  expect(box && box.height).toBeGreaterThan(240);
  await expect(page.locator("[data-tray='open']")).toHaveCount(0);
  await drag(page);
  await expect(page.locator("[data-doors='open']")).toBeVisible();
});

test("doors appear after the stroke and the tray follows", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await drag(page);
  await expect(page.getByRole("button", { name: "Message" })).toBeVisible();
  await expect(page.locator("[data-tray='open']")).toBeVisible();
  await page.getByRole("button", { name: "Maker" }).click();
  await expect(page.locator("[data-makers='open']")).toBeVisible();
});

test("share URL round-trips and the tray persists", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await drag(page);
  await expect(page).toHaveURL(/#s=/);
  const shared = page.url();
  await page.getByRole("link", { name: "Examples" }).first().click();
  await expect(page.locator("[data-tray='open']")).toBeVisible();
  await page.goto(shared);
  await expect(page.locator("[data-tray='open']")).toBeVisible();
  await expect(page).toHaveURL(/seed=/);
});

test("back returns to the previous page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByRole("link", { name: "Examples" }).first().click();
  await expect(page).toHaveURL(/\/examples\/?/);
  await page.goBack();
  await expect(page).toHaveURL(/47241\/?(\?|$)/);
});

test("reduced motion keeps a static poster", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-reduced='true']")).toBeAttached();
  await expect(page.locator(".hero-poster")).toBeVisible();
});
