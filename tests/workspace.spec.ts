import { expect, test } from "@playwright/test";

test("letter keys are ignored during a drag", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-keys", "1");
  await page.keyboard.press("g");
  await expect(page).toHaveURL(/\/generate\/?/);
  await page.goto("/");
  const canvas = page.getByTestId("hero-canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("canvas has no box");
  await page.mouse.move(box.x + 40, box.y + 40);
  await page.mouse.down();
  await page.keyboard.press("g");
  await expect(page).not.toHaveURL(/\/generate/);
  await page.mouse.up();
});

test("back returns to the previous page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByRole("link", { name: "Examples" }).first().click();
  await expect(page).toHaveURL(/\/examples\/?/);
  await page.goBack();
  await expect(page).toHaveURL(/\/?(\?|$)/);
});

test("home credit stays on the page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const credit = page.getByTestId("abx-credit");
  await expect(credit.first()).toBeVisible();
  await expect(credit.first()).toHaveAttribute("href", "https://www.artblocks.io");
});
