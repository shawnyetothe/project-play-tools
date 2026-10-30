import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const fixtures = JSON.parse(readFileSync(path.join(process.cwd(), "src/lib/traits-fixtures.json"), "utf8")) as {
  seed: number;
  form: string;
  arms: number;
  tight: number;
  gaps: number;
  dominant: string;
  mix: string;
  density: string;
  dot: string;
  construction: string;
  offset: string;
  size: number;
  spread: number;
  rare: string;
}[];

async function ready(page: Page) {
  await expect(page.locator(".gen-app")).toHaveAttribute("data-ready", "1");
}

async function canvasHash(page: Page, seed: string) {
  const canvas = page.locator(`canvas[data-seed="${seed}"][data-ready="1"]`).first();
  await expect(canvas).toHaveCount(1);
  return canvas.evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no context");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (let i = 0; i < data.length; i += 1) {
      hash ^= data[i];
      hash = Math.imul(hash, 16777619);
    }
    return `${canvas.width}x${canvas.height}:${(hash >>> 0).toString(16)}`;
  });
}

test("trait fixtures match the python table", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/generate/?g=91c0&r=0.03&sp=4.5&v=1");
  await ready(page);
  const got = await page.evaluate((seeds: number[]) => {
    const fn = (window as unknown as { __ptTraits?: (seed: number) => Record<string, unknown> }).__ptTraits;
    if (!fn) throw new Error("traits are not on the page");
    return seeds.map((seed) => ({ seed, ...fn(seed) }));
  }, fixtures.map((row) => row.seed));
  expect(got.length).toBeGreaterThanOrEqual(50);
  const sheet = new Set<number>();
  for (let i = 0; i < 48; i++) sheet.add((0x5eed * 7919 + i * 104729) & 0xffff);
  expect(fixtures.filter((row) => sheet.has(row.seed)).length).toBe(48);
  for (let i = 0; i < fixtures.length; i++) {
    const expected = fixtures[i];
    const actual = got[i] as typeof expected & { _q?: number };
    for (const key of ["form", "arms", "tight", "gaps", "dominant", "mix", "density", "dot", "construction", "offset", "size", "spread", "rare"] as const) {
      expect(actual[key], `seed ${expected.seed.toString(16)} ${key}`).toEqual(expected[key]);
    }
  }
});

for (const viewport of [
  { width: 390, height: 844, label: "390" },
  { width: 1440, height: 900, label: "1440" },
] as const) {
  test(`url round-trip keeps the pixel hash at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/generate/?g=91c0&r=0.03&sp=4.5&v=1");
    await ready(page);
    const first = await canvasHash(page, "85c0");
    const gapped = await canvasHash(page, "23f7");
    await page.reload();
    await ready(page);
    expect(await canvasHash(page, "85c0")).toBe(first);
    await page.goto("/generate/?g=91c0&r=0.03&sp=12.0&v=1");
    await ready(page);
    expect(await canvasHash(page, "85c0")).not.toBe(first);
    await page.goto("/generate/?g=91c0&r=0.08&sp=4.5&v=1");
    await ready(page);
    expect(await canvasHash(page, "23f7")).not.toBe(gapped);
    await page.goto("/generate/?s=9cd3&r=0.03&sp=4.5&v=1");
    await ready(page);
    const piece = await canvasHash(page, "9cd3");
    await page.reload();
    await ready(page);
    expect(page.url()).toContain("s=9cd3");
    expect(page.url()).toContain("r=0.03");
    expect(page.url()).toContain("sp=4.5");
    expect(page.url()).toContain("v=1");
    expect(await canvasHash(page, "9cd3")).toBe(piece);
  });

  test(`reroll changes the grid url at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/generate/?g=91c0&r=0.03&sp=4.5&v=1");
    await ready(page);
    const before = new URL(page.url()).searchParams.get("g");
    await page.getByTestId("reroll").click();
    await expect.poll(() => new URL(page.url()).searchParams.get("g")).not.toBe(before);
    expect(page.url()).toContain("v=1");
    expect(page.url()).not.toContain("s=");
  });

  test(`favorite survives reload at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/generate/?g=91c0&r=0.03&sp=4.5&v=1");
    await ready(page);
    const star = page.locator("button.star").first();
    await star.click();
    await expect(star).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("fav-count")).toContainText("1 favorite");
    await expect(page.getByTestId("saved-device")).toBeVisible();
    await expect(page.getByTestId("collection-soon")).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem("pt.fav.v1"));
    expect(stored || "").toContain("85c0");
    expect(page.url()).not.toContain("fav");
    await page.reload();
    await ready(page);
    await expect(page.locator("button.star").first()).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("fav-count")).toContainText("1 favorite");
  });

  test(`orange scrub underlines at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    const home = page.getByRole("slider").first();
    await expect(home).toBeVisible();
    const homeLine = await home.evaluate((node) => {
      const style = getComputedStyle(node);
      return { color: style.borderBottomColor, style: style.borderBottomStyle, width: style.borderBottomWidth };
    });
    expect(homeLine.color).toBe("rgb(228, 87, 46)");
    expect(homeLine.style).toBe("dashed");
    expect(parseFloat(homeLine.width)).toBeGreaterThanOrEqual(2);
    await page.goto("/generate/?g=91c0&r=0.03&sp=4.5&v=1");
    await ready(page);
    const rule = page.getByRole("slider", { name: "Orbit speed in radians per second" });
    const genLine = await rule.evaluate((node) => {
      const style = getComputedStyle(node);
      return { color: style.borderBottomColor, style: style.borderBottomStyle };
    });
    expect(genLine.color).toBe("rgb(228, 87, 46)");
    expect(genLine.style).toBe("dashed");
  });
}

test("phone swipe moves between pieces", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/generate/?g=91c0&r=0.03&sp=4.5&v=1");
  await ready(page);
  await expect(page.locator(".tile")).toHaveCount(9);
  await page.locator(".tile").first().click();
  await expect(page).toHaveURL(/s=85c0/);
  const art = page.getByTestId("picked-art");
  await expect(art).toBeVisible();
  const box = await art.boundingBox();
  if (!box) throw new Error("no art box");
  await page.mouse.move(box.x + box.width * 0.82, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.12, box.y + box.height * 0.5, { steps: 12 });
  await page.mouse.up();
  await expect(page).toHaveURL(/s=23f7/);
  await expect(page.getByTestId("link-field")).toHaveValue(/\/generate\/\?s=23f7/);
});

test("export is 2400 with a stamp and a relative link", async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/generate/?s=9cd3&r=0.03&sp=4.5&v=1");
  await ready(page);
  await expect(page.getByTestId("link-field")).toHaveValue("/generate/?s=9cd3&r=0.03&sp=4.5&v=1");
  await expect(page.getByTestId("traits")).toContainText(/\//);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("export").click(),
  ]);
  expect(download.suggestedFilename()).toBe("playtools-9cd3.png");
  const path = await download.path();
  if (!path) throw new Error("no download");
  const check = spawnSync("python3", ["-c", `
from PIL import Image
im=Image.open(${JSON.stringify(path)}).convert("RGB")
w,h=im.size
print(f"{w}x{h}")
assert w==2400 and h in (2400, 2496)
def dark(box):
    crop=im.crop(box)
    return sum(1 for px in crop.getdata() if px[0]<40 and px[1]<40 and px[2]<40)
tr=dark((w-560, 36, w-24, 150))
br=dark((w-560, max(0,h-180), w-24, h-24))
bl=dark((24, max(0,h-180), 560, h-24))
tl=dark((24, 36, 560, 150))
print("corners", tl, tr, bl, br)
assert max(tl, tr, bl, br) > 80
`], { encoding: "utf8" });
  expect(check.stdout).toContain("2400x");
  expect(check.status, check.stderr).toBe(0);
});
