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

async function frameBox(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const frame = document.querySelector(".hero-frame");
    if (!frame) throw new Error("no hero frame");
    const box = frame.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    return {
      left: box.left,
      right: box.right,
      rightGap: vw - box.right,
      width: box.width,
      height: box.height,
      scroll: document.documentElement.scrollWidth,
      vw,
    };
  });
}

for (const viewport of [
  { width: 390, height: 844, label: "390px" },
  { width: 1440, height: 900, label: "1440px" },
] as const) {
  test(`hero frame fits at ${viewport.label}, idle and after drag`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    const canvas = page.getByTestId("hero-canvas");
    await expect(canvas).toBeVisible();
    await expect(page.locator("[data-tray='open']")).toHaveCount(0);
    const idle = await frameBox(page);
    expect(idle.scroll).toBeLessThanOrEqual(idle.vw);
    expect(idle.left).toBeGreaterThanOrEqual(12);
    expect(idle.right).toBeLessThanOrEqual(idle.vw - 12);
    expect(idle.height).toBeGreaterThan(240);
    if (viewport.width === 390) {
      expect(Math.abs(idle.left - idle.rightGap)).toBeLessThan(1.5);
      expect(idle.width).toBeGreaterThan(300);
    }
    await drag(page);
    await expect(page.locator("[data-doors='open']")).toBeVisible();
    await expect(page.locator("[data-tray='open']")).toBeVisible();
    await expect(page.getByTestId("hero-readout")).toContainText("settled");
    const drawn = await frameBox(page);
    expect(drawn.scroll).toBeLessThanOrEqual(drawn.vw);
    expect(drawn.left).toBeGreaterThanOrEqual(12);
    expect(drawn.right).toBeLessThanOrEqual(drawn.vw - 12);
    if (viewport.width === 390) expect(Math.abs(drawn.left - drawn.rightGap)).toBeLessThan(1.5);
  });
}

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
