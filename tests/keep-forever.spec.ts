import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

async function openOffline(page: Page, html: string, width: number, height: number) {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelector("canvas")?.getAttribute("data-ready") === "1");
  const external = requests.filter((url) => !url.startsWith("data:"));
  expect(external).toEqual([]);
  return page.locator("canvas").evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const data = canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height).data;
    if (!data) throw new Error("no pixels");
    let hash = 2166136261;
    let ink = 0;
    for (let i = 0; i < data.length; i += 4) {
      hash ^= data[i];
      hash = Math.imul(hash, 16777619);
      if (data[i] < 240) ink += 1;
    }
    return { seed: canvas.dataset.seed, hash: (hash >>> 0).toString(16), ink, width: canvas.width };
  });
}

for (const viewport of [
  { width: 390, height: 844, label: "390" },
  { width: 1440, height: 900, label: "1440" },
] as const) {
  test(`home one-file is offline at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/?seed=c19a4e&tool=1");
    await expect(page.locator("html")).toHaveAttribute("data-keys", "1");
    const panel = page.getByTestId("keep-forever");
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Put it on chain with ABX FS");
    await expect(panel).toContainText("unaudited");
    await expect(panel).toContainText("public and permanent");
    await expect(panel).toContainText("testnet");
    await expect(panel.getByRole("link", { name: "fs.abx.io", exact: true })).toHaveAttribute("href", "https://fs.abx.io");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("download-one-file").click(),
    ]);
    expect(download.suggestedFilename()).toBe("playtools-c19a4e.html");
    const path = await download.path();
    if (!path) throw new Error("no file");
    const html = readFileSync(path, "utf8");
    expect(html).toContain("c19a4e");
    expect(html).toContain("<svg");
    expect(html).not.toContain("<script src");
    expect(html.replaceAll("http://www.w3.org/2000/svg", "")).not.toMatch(/https?:\/\//);
    const offline = await page.context().newPage();
    const first = await openOffline(offline, html, viewport.width, viewport.height);
    expect(first.seed).toBe("c19a4e");
    expect(first.ink).toBeGreaterThan(20);
    const again = await page.context().newPage();
    const second = await openOffline(again, html, viewport.width, viewport.height);
    expect(second.hash).toBe(first.hash);
    await offline.close();
    await again.close();
  });

  test(`generate one-file is offline at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/generate/?s=9cd3&r=0.03&sp=4.5&v=1");
    await page.locator(".gen-app").waitFor();
    await page.waitForFunction(() => document.querySelector(".gen-app")?.getAttribute("data-ready") === "1");
    const panel = page.getByTestId("keep-forever");
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link", { name: "docs.fs.abx.io" })).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("download-one-file").click(),
    ]);
    expect(download.suggestedFilename()).toBe("playtools-9cd3.html");
    const path = await download.path();
    if (!path) throw new Error("no file");
    const html = readFileSync(path, "utf8");
    expect(html).toContain("9cd3");
    expect(html).toContain("data:image/png");
    expect(html.replaceAll("http://www.w3.org/2000/svg", "")).not.toMatch(/https?:\/\//);
    const offline = await page.context().newPage();
    const drawn = await openOffline(offline, html, viewport.width, viewport.height);
    expect(drawn.seed).toBe("9cd3");
    expect(drawn.ink).toBeGreaterThan(20);
    await offline.close();
  });
}
