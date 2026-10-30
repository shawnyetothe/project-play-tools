import { chromium } from "@playwright/test";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.CAPTURE_BASE || "http://127.0.0.1:47251";
const out = "/opt/cursor/artifacts/generate-v1";

async function shot(page, file) {
  await page.screenshot({ path: path.join(out, file), fullPage: true });
  console.log("wrote", file);
}

const browser = await chromium.launch();
await mkdir(out, { recursive: true });

const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

const home = await phone.newPage();
await home.goto(`${base}/`);
await home.locator("button.scrub").first().waitFor();
await shot(home, "home-390-orange-underlines.png");

const gridPhone = await phone.newPage();
await gridPhone.goto(`${base}/generate/?g=91c0&r=0.03&sp=4.5&v=1`);
await gridPhone.locator(".gen-app").getAttribute("data-ready");
await gridPhone.locator("canvas[data-seed='85c0'][data-ready='1']").waitFor();
const fold = await gridPhone.evaluate(() => {
  const btn = document.querySelector("[data-testid='reroll']");
  const nav = document.querySelector(".phone-nav");
  const fav = document.querySelector("[data-testid='fav-count']");
  const b = btn.getBoundingClientRect();
  const n = nav.getBoundingClientRect();
  const f = fav.getBoundingClientRect();
  return { btnBottom: Math.round(b.bottom), favBottom: Math.round(f.bottom), navTop: Math.round(n.top) };
});
console.log("phone fold", fold);
await shot(gridPhone, "grid-390-idle.png");
await gridPhone.locator("button.star").nth(2).click();
await gridPhone.locator("button.star").nth(2).getAttribute("aria-pressed");
await shot(gridPhone, "grid-390-favorited.png");

const pickedPhone = await phone.newPage();
await pickedPhone.goto(`${base}/generate/?s=9cd3&r=0.03&sp=4.5&v=1`);
await pickedPhone.locator("canvas[data-seed='9cd3'][data-ready='1']").waitFor();
await shot(pickedPhone, "picked-390.png");

const gridDesk = await desktop.newPage();
await gridDesk.goto(`${base}/generate/?g=91c0&r=0.03&sp=4.5&v=1`);
await gridDesk.locator("canvas[data-seed='85c0'][data-ready='1']").waitFor();
const tile = await gridDesk.locator(".tile .art").first().boundingBox();
console.log("desktop tile", tile);
await shot(gridDesk, "grid-1440-idle.png");
await gridDesk.locator("button.star").nth(2).click();
await shot(gridDesk, "grid-1440-favorited.png");

const pickedDesk = await desktop.newPage();
await pickedDesk.goto(`${base}/generate/?s=9cd3&r=0.03&sp=4.5&v=1`);
await pickedDesk.locator("canvas[data-seed='9cd3'][data-ready='1']").waitFor();
const big = await pickedDesk.locator(".picked-art").boundingBox();
console.log("picked art", big);
const [download] = await Promise.all([
  pickedDesk.waitForEvent("download"),
  pickedDesk.getByTestId("export").click(),
]);
const file = await download.path();
await copyFile(file, path.join(out, "export-playtools-9cd3.png"));
console.log("export", download.suggestedFilename());
await shot(pickedDesk, "picked-1440.png");

const sheet = await desktop.newPage();
await sheet.setViewportSize({ width: 1760, height: 1400 });
await sheet.goto(`${base}/generate/sheet/`);
await sheet.locator("canvas[data-ready='1']").nth(47).waitFor({ timeout: 60000 });
await shot(sheet, "seeds-sheet-48.png");

await browser.close();
