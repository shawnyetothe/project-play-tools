import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 390, height: 844, label: "390" },
  { width: 1440, height: 900, label: "1440" },
] as const) {
  test(`composed home at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-keys", "1");
    await expect(page.getByRole("heading", { name: "Draw a line. Watch the rule take it." })).toBeVisible();
    await expect(page.getByText("Play it. Then read the rules.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Keep playing" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See the code" })).toBeVisible();
    await expect(page.getByText("Pick a way in")).toBeVisible();
    await expect(page.getByText("FIG. 01 · THE RULE")).toBeVisible();
    await expect(page.getByTestId("hero-readout")).toBeVisible();
    const canvas = page.getByTestId("hero-canvas");
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    if (!box) throw new Error("no sketch");
    if (viewport.width > 800) {
      const title = await page.getByRole("heading", { name: "Draw a line. Watch the rule take it." }).boundingBox();
      if (!title) throw new Error("no title");
      expect(box.x + box.width).toBeLessThanOrEqual(title.x + 8);
      const keep = await page.getByRole("button", { name: "Keep playing" }).boundingBox();
      if (!keep) throw new Error("no keep button");
      const onArt = keep.x < box.x + box.width && keep.x + keep.width > box.x && keep.y < box.y + box.height && keep.y + keep.height > box.y;
      expect(onArt).toBe(false);
    }
    await page.mouse.move(box.x + 20, box.y + box.height * 0.4);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 8 });
    await page.mouse.up();
    await expect(page).toHaveURL(/seed=/);

    const before = new URL(page.url()).searchParams.get("seed");
    await page.getByRole("button", { name: "Shuffle" }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get("seed")).not.toBe(before);
    await page.getByRole("button", { name: "Play sound" }).click();
    await expect(page.getByRole("button", { name: "Stop sound" })).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Maker/ }).click();
    await expect(page.getByRole("region", { name: "maker starting point" })).toBeVisible();
    await expect(page.getByText("Who am I?")).toBeVisible();
    await expect(page).toHaveURL(/start=maker/);
    await page.getByRole("button", { name: "Musician", exact: true }).click();
    await expect(page).toHaveURL(/pick=musician/);

    await page.locator("#lineage").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Reaction" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tiles" })).toBeVisible();
    const walk = page.getByRole("slider", { name: "Step size" });
    const walkBefore = await walk.inputValue();
    await walk.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => walk.inputValue()).not.toBe(walkBefore);
    await expect(page).toHaveURL(/walk=/);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download plotter SVG" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.svg$/);

    await page.getByRole("link", { name: "Make sixteen" }).first().click();
    await expect(page).toHaveURL(/\/generate\/\?g=/);
    await page.locator(".gen-app").waitFor();
    await page.waitForFunction(() => document.querySelector("canvas[data-ready='1']"));
    await expect(page.getByTestId("abx-credit").first()).toBeVisible();
    await expect(page.getByTestId("reroll")).toBeVisible();
  });
}

test("finder and agent files are on the static site", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?start=message");
  await page.locator("#find").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Find your tool" })).toBeVisible();
  const llms = await page.request.get("/llms.txt");
  expect(llms.ok()).toBeTruthy();
  const tools = await page.request.get("/tools.json");
  expect(tools.ok()).toBeTruthy();
  await page.goto("/tools/p5/");
  await expect(page.getByRole("button", { name: "Copy agent prompt" })).toBeVisible();
});
