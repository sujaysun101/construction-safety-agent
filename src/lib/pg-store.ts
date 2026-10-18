import { and, asc, desc, eq } from "drizzle-orm";
import { buildDemo } from "@/lib/demo-data";
import { getDb } from "@/lib/db/client";
import { actions, crew, dailyLogs, findings, photos, sites, walks } from "@/lib/db/schema";
import { todayIso } from "@/lib/dates";
import type { Store } from "@/lib/memory-store";
import type {
  ActionPatch,
  CorrectiveAction,
  CrewMember,
  CrewRole,
  DailyLog,
  Finding,
  FindingStatus,
  NewWalkInput,
  Photo,
  PhotoStorage,
  Site,
  SiteStatus,
  Walk,
} from "@/lib/types";

function database() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not set.");
  return db;
}

function asSite(row: typeof sites.$inferSelect): Site {
  return { ...row, status: row.status as SiteStatus };
}

function asCrew(row: typeof crew.$inferSelect): CrewMember {
  return { ...row, role: row.role as CrewRole, siteId: row.siteId ?? null };
}

function asWalk(row: typeof walks.$inferSelect): Walk {
  return row;
}

function asPhoto(row: typeof photos.$inferSelect): Photo {
  return { ...row, storage: row.storage as PhotoStorage };
}

function asFinding(row: typeof findings.$inferSelect): Finding {
  return {
    ...row,
    category: row.category as Finding["category"],
    severity: row.severity as Finding["severity"],
    status: row.status as FindingStatus,
    photoId: row.photoId ?? null,
    sample: row.sample,
  };
}

function asAction(row: typeof actions.$inferSelect): CorrectiveAction {
  return {
    ...row,
    status: row.status as CorrectiveAction["status"],
    closedOn: row.closedOn ?? null,
    note: row.note,
  };
}

function asLog(row: typeof dailyLogs.$inferSelect): DailyLog {
  return { ...row, walkId: row.walkId ?? null };
}

export function createPostgresStore(): Store {
  return {
    mode: "postgres",

    async listSites(orgId) {
      const rows = await database().select().from(sites).where(eq(sites.orgId, orgId)).orderBy(asc(sites.name));
      return rows.map(asSite);
    },

    async getSite(orgId, slugOrId) {
      const rows = await database().select().from(sites).where(eq(sites.orgId, orgId));
      const row = rows.find((item) => item.slug === slugOrId || item.id === slugOrId);
      return row ? asSite(row) : null;
    },

    async createSite(site) {
      await database().insert(sites).values(site);
      return site;
    },

    async listCrew(orgId) {
      const rows = await database().select().from(crew).where(eq(crew.orgId, orgId)).orderBy(asc(crew.name));
      return rows.map(asCrew);
    },

    async createCrew(member) {
      await database().insert(crew).values(member);
      return member;
    },

    async listWalks(orgId, siteId) {
      const where = siteId ? and(eq(walks.orgId, orgId), eq(walks.siteId, siteId)) : eq(walks.orgId, orgId);
      const rows = await database().select().from(walks).where(where).orderBy(desc(walks.walkedOn));
      return rows.map(asWalk);
    },

    async getWalk(orgId, walkId) {
      const rows = await database()
        .select()
        .from(walks)
        .where(and(eq(walks.orgId, orgId), eq(walks.id, walkId)))
        .limit(1);
      return rows[0] ? asWalk(rows[0]) : null;
    },

    async listPhotos(orgId, walkId) {
      const where = walkId ? and(eq(photos.orgId, orgId), eq(photos.walkId, walkId)) : eq(photos.orgId, orgId);
      const rows = await database().select().from(photos).where(where);
      return rows.map(asPhoto);
    },

    async listFindings(orgId, siteId) {
      const where = siteId ? and(eq(findings.orgId, orgId), eq(findings.siteId, siteId)) : eq(findings.orgId, orgId);
      const rows = await database().select().from(findings).where(where).orderBy(desc(findings.createdAt));
      return rows.map(asFinding);
    },

    async listActions(orgId, siteId) {
      const where = siteId ? and(eq(actions.orgId, orgId), eq(actions.siteId, siteId)) : eq(actions.orgId, orgId);
      const rows = await database().select().from(actions).where(where).orderBy(asc(actions.dueOn));
      return rows.map(asAction);
    },

    async listLogs(orgId, siteId) {
      const where = siteId ? and(eq(dailyLogs.orgId, orgId), eq(dailyLogs.siteId, siteId)) : eq(dailyLogs.orgId, orgId);
      const rows = await database().select().from(dailyLogs).where(where).orderBy(desc(dailyLogs.logDate));
      return rows.map(asLog);
    },

    async createWalkBundle(orgId, input: NewWalkInput) {
      const db = database();
      const now = new Date().toISOString();
      const walkId = crypto.randomUUID();
      const walk: Walk = {
        id: walkId,
        orgId,
        siteId: input.siteId,
        walkedOn: input.walkedOn,
        conductedBy: input.conductedBy,
        weather: input.weather,
        crewCount: input.crewCount,
        notes: input.notes,
        summary: input.summary,
        createdAt: now,
      };
      const photoIds = input.photos.map(() => crypto.randomUUID());
      const findingRows: Finding[] = [];
      const actionRows: CorrectiveAction[] = [];
      const titles: string[] = [];
      input.findings.forEach((finding) => {
        const findingId = crypto.randomUUID();
        titles.push(finding.title);
        findingRows.push({
          id: findingId,
          orgId,
          siteId: input.siteId,
          walkId,
          photoId: photoIds[finding.photoIndex] ?? photoIds[0] ?? null,
          category: finding.category,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          boundingDescription: finding.boundingDescription,
          oshaCategory: finding.oshaCategory,
          status: "open",
          sample: finding.sample,
          createdAt: now,
        });
        if (finding.action) {
          actionRows.push({
            id: crypto.randomUUID(),
            orgId,
            siteId: input.siteId,
            findingId,
            title: finding.action.title,
            assigneeId: finding.action.assigneeId,
            dueOn: finding.action.dueOn,
            status: "open",
            closedOn: null,
            note: "",
            createdAt: now,
          });
        }
      });
      await db.transaction(async (tx) => {
        await tx.insert(walks).values(walk);
        if (input.photos.length) {
          await tx.insert(photos).values(
            input.photos.map((photo, index) => ({
              id: photoIds[index],
              orgId,
              walkId,
              url: photo.url,
              storage: photo.storage,
              caption: photo.caption,
              mediaType: photo.mediaType,
            })),
          );
        }
        if (findingRows.length) await tx.insert(findings).values(findingRows);
        if (actionRows.length) await tx.insert(actions).values(actionRows);
        await tx.insert(dailyLogs).values({
          id: crypto.randomUUID(),
          orgId,
          siteId: input.siteId,
          walkId,
          logDate: input.walkedOn,
          summary: input.summary,
          crewOnSite: input.crewCount,
          weather: input.weather,
          narrative: [input.notes, titles.join(". ")].filter(Boolean).join(" "),
          createdAt: now,
        });
      });
      return walk;
    },

    async updateAction(orgId, actionId, patch: ActionPatch) {
      const db = database();
      const existing = await db
        .select()
        .from(actions)
        .where(and(eq(actions.orgId, orgId), eq(actions.id, actionId)))
        .limit(1);
      if (!existing[0]) return null;
      const next = asAction(existing[0]);
      if (patch.status) {
        next.status = patch.status;
        next.closedOn = patch.status === "closed" ? (patch.closedOn ?? todayIso()) : null;
      }
      if (patch.note !== undefined) next.note = patch.note;
      if (patch.dueOn) next.dueOn = patch.dueOn;
      if (patch.assigneeId) next.assigneeId = patch.assigneeId;
      await db
        .update(actions)
        .set({
          status: next.status,
          closedOn: next.closedOn,
          note: next.note,
          dueOn: next.dueOn,
          assigneeId: next.assigneeId,
        })
        .where(eq(actions.id, actionId));
      return next;
    },

    async updateFindingStatus(orgId, findingId, status: FindingStatus) {
      const db = database();
      const existing = await db
        .select()
        .from(findings)
        .where(and(eq(findings.orgId, orgId), eq(findings.id, findingId)))
        .limit(1);
      if (!existing[0]) return null;
      await db.update(findings).set({ status }).where(eq(findings.id, findingId));
      return asFinding({ ...existing[0], status });
    },

    async importSample(orgId) {
      const db = database();
      const existing = await db.select({ id: sites.id }).from(sites).where(eq(sites.orgId, orgId)).limit(1);
      if (existing.length) return;
      const sample = buildDemo(orgId);
      await db.transaction(async (tx) => {
        await tx.insert(sites).values(sample.sites);
        if (sample.crew.length) await tx.insert(crew).values(sample.crew);
        if (sample.walks.length) await tx.insert(walks).values(sample.walks);
        if (sample.photos.length) await tx.insert(photos).values(sample.photos);
        if (sample.findings.length) await tx.insert(findings).values(sample.findings);
        if (sample.actions.length) await tx.insert(actions).values(sample.actions);
        if (sample.logs.length) await tx.insert(dailyLogs).values(sample.logs);
      });
    },
  };
}
