import { eq } from "drizzle-orm";
import { DEMO_ORG_ID } from "@/lib/brand";
import { getDb } from "@/lib/db/client";
import { actions, crew, dailyLogs, findings, photos, sites, walks } from "@/lib/db/schema";
import { buildDemo } from "@/lib/demo-data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("DATABASE_URL is not set. HiVis is using the in-memory demo company (Ridge & Co. Builders). Nothing to seed.");
    return;
  }
  const orgId = process.env.SEED_ORG_ID?.trim() || DEMO_ORG_ID;
  const db = getDb();
  if (!db) {
    console.log("Could not open the database.");
    process.exitCode = 1;
    return;
  }
  const sample = buildDemo(orgId);
  await db.transaction(async (tx) => {
    await tx.delete(actions).where(eq(actions.orgId, orgId));
    await tx.delete(findings).where(eq(findings.orgId, orgId));
    await tx.delete(photos).where(eq(photos.orgId, orgId));
    await tx.delete(dailyLogs).where(eq(dailyLogs.orgId, orgId));
    await tx.delete(walks).where(eq(walks.orgId, orgId));
    await tx.delete(crew).where(eq(crew.orgId, orgId));
    await tx.delete(sites).where(eq(sites.orgId, orgId));
    await tx.insert(sites).values(sample.sites);
    await tx.insert(crew).values(sample.crew);
    await tx.insert(walks).values(sample.walks);
    await tx.insert(photos).values(sample.photos);
    await tx.insert(findings).values(sample.findings);
    await tx.insert(actions).values(sample.actions);
    await tx.insert(dailyLogs).values(sample.logs);
  });
  console.log(`Seeded ${sample.sites.length} sites, ${sample.findings.length} findings, and ${sample.actions.length} actions for ${orgId}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
