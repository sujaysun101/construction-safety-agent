import { chromium } from "playwright";

async function main() {
  const base = process.env.SCREENSHOT_URL ?? "http://127.0.0.1:3000";
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: "public/portfolio-screenshot-landing.png" });

  await page.goto(`${base}/demo/sites/harborline`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Findings over time");
  await page.screenshot({ path: "public/portfolio-screenshot.png" });

  await browser.close();
  console.log("wrote public/portfolio-screenshot.png and public/portfolio-screenshot-landing.png");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
