"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEMO_ORG_ID } from "@/lib/brand";
import { isIsoDate, todayIso } from "@/lib/dates";
import { crewFormSchema, firstZodMessage, siteFormSchema, walkPayloadSchema } from "@/lib/schemas";
import { demoCookieAllowed, getAppSession } from "@/lib/session";
import { storePhoto } from "@/lib/storage";
import { getStore } from "@/lib/store";
import type { ActionStatus, CrewRole, FindingStatus } from "@/lib/types";

type ActionResult = { ok: false; error: string };

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return base || "site";
}

async function actor(demo: boolean): Promise<{ orgId: string; memory: boolean } | ActionResult> {
  if (demo) {
    if (!(await demoCookieAllowed())) return { ok: false, error: "Demo saving is unavailable." };
    return { orgId: DEMO_ORG_ID, memory: true };
  }
  const session = await getAppSession();
  if (!session) return { ok: false, error: "Sign in to save changes." };
  if (!session.orgId) return { ok: false, error: "Choose a company in the header first." };
  return { orgId: session.orgId, memory: !process.env.DATABASE_URL };
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveWalk(formData: FormData): Promise<ActionResult | void> {
  const demo = formData.get("demo") === "1";
  const who = await actor(demo);
  if ("error" in who) return who;
  const base = formData.get("basePath") === "/demo" ? "/demo" : "";

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { ok: false, error: "The walk could not be read. Try again." };
  }
  const parsed = walkPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error) };

  const files = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  if (!files.length) return { ok: false, error: "Add at least one photo." };
  if (files.length > 6) return { ok: false, error: "A walk can take up to 6 photos." };

  const store = getStore({ memory: who.memory });
  const site = await store.getSite(who.orgId, parsed.data.siteId);
  if (!site) return { ok: false, error: "That site is not on this company." };
  const crew = await store.listCrew(who.orgId);
  const crewIds = new Set(crew.map((member) => member.id));

  for (const finding of parsed.data.findings) {
    if (finding.photoIndex >= files.length) return { ok: false, error: "A finding points at a photo that was not uploaded." };
    if (finding.action && !crewIds.has(finding.action.assigneeId)) {
      return { ok: false, error: "Assign each action to someone on the crew." };
    }
    if (finding.action && !isIsoDate(finding.action.dueOn)) return { ok: false, error: "Check the due dates." };
  }

  const photos = [];
  for (const file of files) {
    if (file.size > 4_500_000) return { ok: false, error: "Each photo needs to be under 4.5 MB." };
    const mediaType = file.type || "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mediaType)) {
      return { ok: false, error: "Use JPEG, PNG, or WebP photos." };
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const stored = await storePhoto(bytes, mediaType);
    photos.push({
      url: stored.url,
      storage: stored.storage,
      caption: file.name || "Site photo",
      mediaType,
    });
  }

  const walk = await store.createWalkBundle(who.orgId, {
    siteId: site.id,
    walkedOn: parsed.data.walkedOn,
    conductedBy: parsed.data.conductedBy,
    weather: parsed.data.weather,
    crewCount: parsed.data.crewCount,
    notes: parsed.data.notes,
    summary: parsed.data.summary,
    photos,
    findings: parsed.data.findings,
  });
  refresh();
  redirect(`${base}/walks/${walk.id}`);
}

export async function createSite(formData: FormData): Promise<ActionResult | void> {
  const demo = formData.get("demo") === "1";
  const who = await actor(demo);
  if ("error" in who) return who;
  const base = formData.get("basePath") === "/demo" ? "/demo" : "";
  const parsed = siteFormSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    region: formData.get("region"),
    phase: formData.get("phase"),
  });
  if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error) };
  const store = getStore({ memory: who.memory });
  const existing = await store.listSites(who.orgId);
  let slug = slugify(parsed.data.name);
  if (existing.some((site) => site.slug === slug)) slug = `${slug}-${existing.length + 1}`;
  const site = await store.createSite({
    id: crypto.randomUUID(),
    orgId: who.orgId,
    slug,
    ...parsed.data,
    status: "active",
    startedOn: todayIso(),
  });
  refresh();
  redirect(`${base}/sites/${site.slug}`);
}

export async function createCrew(formData: FormData): Promise<ActionResult | void> {
  const demo = formData.get("demo") === "1";
  const who = await actor(demo);
  if ("error" in who) return who;
  const base = formData.get("basePath") === "/demo" ? "/demo" : "";
  const parsed = crewFormSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    trade: formData.get("trade"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    siteId: String(formData.get("siteId") ?? ""),
  });
  if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error) };
  const store = getStore({ memory: who.memory });
  let siteId: string | null = null;
  if (parsed.data.siteId) {
    const site = await store.getSite(who.orgId, parsed.data.siteId);
    if (!site) return { ok: false, error: "Choose a site on this company." };
    siteId = site.id;
  }
  await store.createCrew({
    id: crypto.randomUUID(),
    orgId: who.orgId,
    siteId,
    name: parsed.data.name,
    role: parsed.data.role as CrewRole,
    trade: parsed.data.trade,
    email: parsed.data.email,
    phone: parsed.data.phone,
  });
  refresh();
  redirect(`${base}/crew`);
}

export async function updateActionStatus(actionId: string, status: ActionStatus, demo = false): Promise<ActionResult | { ok: true }> {
  if (!["open", "in_progress", "closed"].includes(status)) return { ok: false, error: "Unknown status." };
  const who = await actor(demo);
  if ("error" in who) return who;
  const store = getStore({ memory: who.memory });
  const updated = await store.updateAction(who.orgId, actionId, { status });
  if (!updated) return { ok: false, error: "That action is not on this company." };
  refresh();
  return { ok: true };
}

export async function updateFindingStatus(findingId: string, status: FindingStatus, demo = false): Promise<ActionResult | { ok: true }> {
  if (status !== "open" && status !== "closed") return { ok: false, error: "Unknown status." };
  const who = await actor(demo);
  if ("error" in who) return who;
  const store = getStore({ memory: who.memory });
  const updated = await store.updateFindingStatus(who.orgId, findingId, status);
  if (!updated) return { ok: false, error: "That finding is not on this company." };
  refresh();
  return { ok: true };
}

export async function importSampleCompany(demo = false): Promise<ActionResult | { ok: true }> {
  const who = await actor(demo);
  if ("error" in who) return who;
  const store = getStore({ memory: who.memory });
  await store.importSample(who.orgId);
  refresh();
  return { ok: true };
}
