import { buildDemo } from "../src/lib/demo-data";
import { buildSafetyReport } from "../src/lib/pdf";
import { sampleReading } from "../src/lib/ai";
import { analysisOutputSchema } from "../src/lib/schemas";
import { memoryStore } from "../src/lib/memory-store";
import { consumeAnalysis, resetAnalysisBuckets } from "../src/lib/rate-limit";
import { DEMO_ORG_ID } from "../src/lib/brand";

const demo = buildDemo();
const siteIds = new Set(demo.sites.map((site) => site.id));
const walkIds = new Set(demo.walks.map((walk) => walk.id));
const findingIds = new Set(demo.findings.map((finding) => finding.id));
const crewIds = new Set(demo.crew.map((member) => member.id));

if (demo.sites.length < 2) throw new Error("Expected two demo sites.");
if (!demo.findings.length || !demo.actions.length) throw new Error("Demo findings missing.");
for (const finding of demo.findings) {
  if (!siteIds.has(finding.siteId) || !walkIds.has(finding.walkId)) throw new Error(`Broken finding ${finding.id}`);
  if (!finding.boundingDescription || !finding.oshaCategory.startsWith("29 CFR")) throw new Error(`Finding ${finding.title} missing OSHA detail`);
}
for (const action of demo.actions) {
  if (!findingIds.has(action.findingId) || !crewIds.has(action.assigneeId)) throw new Error(`Broken action ${action.id}`);
}
const open = demo.actions.filter((action) => action.status !== "closed").length;
const closed = demo.actions.filter((action) => action.status === "closed").length;
if (!open || !closed) throw new Error("Need both open and closed actions.");

const sample = sampleReading(2);
analysisOutputSchema.parse({ summary: sample.summary, findings: sample.findings });
if (!sample.sample) throw new Error("Sample reading must be labeled.");

async function main() {
  const dates = demo.walks.map((walk) => walk.walkedOn).sort();
  const pdf = await buildSafetyReport({
  companyName: "Ridge & Co. Builders",
  site: demo.sites[0],
  from: dates[0],
  to: dates.at(-1) ?? dates[0],
  walks: demo.walks.filter((walk) => walk.siteId === demo.sites[0].id),
  findings: demo.findings.filter((finding) => finding.siteId === demo.sites[0].id),
  actions: demo.actions.filter((action) => action.siteId === demo.sites[0].id),
  crew: demo.crew,
});
if (Buffer.from(pdf.subarray(0, 4)).toString() !== "%PDF") throw new Error("PDF header missing.");

await memoryStore.importSample(DEMO_ORG_ID);
const action = demo.actions.find((item) => item.status === "open");
if (!action) throw new Error("No open action.");
const updated = await memoryStore.updateAction(DEMO_ORG_ID, action.id, { status: "closed" });
if (updated?.status !== "closed" || !updated.closedOn) throw new Error("Close action failed.");
await memoryStore.updateAction(DEMO_ORG_ID, action.id, { status: "open" });

resetAnalysisBuckets();
let blocked = false;
for (let i = 0; i < 12; i += 1) {
  const result = await consumeAnalysis("verify-user");
  if (!result.ok) blocked = true;
}
if (!blocked) throw new Error("Rate limit did not trip.");

console.log(`verified ${demo.findings.length} findings, ${demo.actions.length} actions, pdf ${pdf.byteLength} bytes`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
