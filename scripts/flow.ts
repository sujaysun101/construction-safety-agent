import { chromium } from "playwright";

const base = process.env.SCREENSHOT_URL ?? "http://127.0.0.1:3000";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(`${base}/dashboard`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Good morning, Maya" }).waitFor();

  await page.goto(`${base}/actions`, { waitUntil: "networkidle" });
  const select = page.locator("select[aria-label='Action status']").first();
  const before = await select.inputValue();
  const next = before === "open" ? "in_progress" : "open";
  await select.selectOption(next);
  await page.getByText(next === "in_progress" ? "Action updated." : "Action updated.").waitFor({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(400);

  await page.goto(`${base}/walks/new`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add photos" }).click();
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
    "base64",
  );
  await page.setInputFiles("input[type=file]", { name: "edge.png", mimeType: "image/png", buffer: png });
  const analyze = page.waitForResponse((response) => response.url().includes("/api/analyze") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Read photos" }).click();
  const analysis = await analyze;
  const body = await analysis.json();
  if (analysis.status() !== 200) throw new Error(`analyze ${analysis.status()} ${JSON.stringify(body)}`);
  if (!body.sample) throw new Error("Expected a labeled sample reading without an API key.");
  await page.getByRole("button", { name: "Save walk and daily log" }).click();
  await page.waitForURL(/\/walks\//, { timeout: 15000 });
  await page.getByText("Sample reading").waitFor();

  const pdf = await page.request.get(`${base}/api/reports/harborline`);
  const bytes = Buffer.from(await pdf.body());
  if (pdf.status() !== 200 || bytes.subarray(0, 4).toString() !== "%PDF") {
    throw new Error(`pdf ${pdf.status()} ${bytes.subarray(0, 12).toString()}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/sites/harborline`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "Daily log" }).click();
  await page.getByRole("heading", { name: "Daily log" }).waitFor();

  if (errors.length) throw new Error(errors.join("\n"));
  console.log("flow ok", { analyze: body.summary.slice(0, 48), pdf: bytes.length, status: next });
  await browser.close();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
