import { buildDemo, emptyDataset } from "@/lib/demo-data";
import { DEMO_ORG_ID } from "@/lib/brand";
import { todayIso } from "@/lib/dates";
import type {
  ActionPatch,
  CorrectiveAction,
  CrewMember,
  DailyLog,
  Dataset,
  Finding,
  FindingStatus,
  NewWalkInput,
  Photo,
  Site,
  Walk,
} from "@/lib/types";

const globalStore = globalThis as unknown as { __hivis?: Dataset };

function state(): Dataset {
  if (!globalStore.__hivis) {
    globalStore.__hivis = buildDemo(DEMO_ORG_ID);
  }
  return globalStore.__hivis;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export const memoryStore = {
  mode: "memory" as const,

  async listSites(orgId: string): Promise<Site[]> {
    return clone(state().sites.filter((site) => site.orgId === orgId).sort((a, b) => a.name.localeCompare(b.name)));
  },

  async getSite(orgId: string, slugOrId: string): Promise<Site | null> {
    const site = state().sites.find((item) => item.orgId === orgId && (item.slug === slugOrId || item.id === slugOrId));
    return site ? clone(site) : null;
  },

  async createSite(site: Site): Promise<Site> {
    state().sites.push(site);
    return clone(site);
  },

  async listCrew(orgId: string): Promise<CrewMember[]> {
    return clone(state().crew.filter((member) => member.orgId === orgId).sort((a, b) => a.name.localeCompare(b.name)));
  },

  async createCrew(member: CrewMember): Promise<CrewMember> {
    state().crew.push(member);
    return clone(member);
  },

  async listWalks(orgId: string, siteId?: string): Promise<Walk[]> {
    return clone(
      state()
        .walks.filter((walk) => walk.orgId === orgId && (!siteId || walk.siteId === siteId))
        .sort((a, b) => b.walkedOn.localeCompare(a.walkedOn)),
    );
  },

  async getWalk(orgId: string, walkId: string): Promise<Walk | null> {
    const walk = state().walks.find((item) => item.orgId === orgId && item.id === walkId);
    return walk ? clone(walk) : null;
  },

  async listPhotos(orgId: string, walkId?: string): Promise<Photo[]> {
    return clone(state().photos.filter((photo) => photo.orgId === orgId && (!walkId || photo.walkId === walkId)));
  },

  async listFindings(orgId: string, siteId?: string): Promise<Finding[]> {
    return clone(
      state()
        .findings.filter((finding) => finding.orgId === orgId && (!siteId || finding.siteId === siteId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async listActions(orgId: string, siteId?: string): Promise<CorrectiveAction[]> {
    return clone(
      state()
        .actions.filter((action) => action.orgId === orgId && (!siteId || action.siteId === siteId))
        .sort((a, b) => a.dueOn.localeCompare(b.dueOn)),
    );
  },

  async listLogs(orgId: string, siteId?: string): Promise<DailyLog[]> {
    return clone(
      state()
        .logs.filter((log) => log.orgId === orgId && (!siteId || log.siteId === siteId))
        .sort((a, b) => b.logDate.localeCompare(a.logDate)),
    );
  },

  async createWalkBundle(orgId: string, input: NewWalkInput): Promise<Walk> {
    const db = state();
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
    db.walks.push(walk);
    const photoIds = input.photos.map((photo) => {
      const photoId = crypto.randomUUID();
      db.photos.push({
        id: photoId,
        orgId,
        walkId,
        url: photo.url,
        storage: photo.storage,
        caption: photo.caption,
        mediaType: photo.mediaType,
      });
      return photoId;
    });
    const findingTitles: string[] = [];
    for (const finding of input.findings) {
      const findingId = crypto.randomUUID();
      const photoId = photoIds[finding.photoIndex] ?? photoIds[0] ?? null;
      findingTitles.push(finding.title);
      db.findings.push({
        id: findingId,
        orgId,
        siteId: input.siteId,
        walkId,
        photoId,
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
        db.actions.push({
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
    }
    db.logs.push({
      id: crypto.randomUUID(),
      orgId,
      siteId: input.siteId,
      walkId,
      logDate: input.walkedOn,
      summary: input.summary,
      crewOnSite: input.crewCount,
      weather: input.weather,
      narrative: [input.notes, findingTitles.join(". ")].filter(Boolean).join(" "),
      createdAt: now,
    });
    return clone(walk);
  },

  async updateAction(orgId: string, actionId: string, patch: ActionPatch): Promise<CorrectiveAction | null> {
    const action = state().actions.find((item) => item.orgId === orgId && item.id === actionId);
    if (!action) return null;
    if (patch.status) {
      action.status = patch.status;
      action.closedOn = patch.status === "closed" ? (patch.closedOn ?? todayIso()) : null;
    }
    if (patch.note !== undefined) action.note = patch.note;
    if (patch.dueOn) action.dueOn = patch.dueOn;
    if (patch.assigneeId) action.assigneeId = patch.assigneeId;
    return clone(action);
  },

  async updateFindingStatus(orgId: string, findingId: string, status: FindingStatus): Promise<Finding | null> {
    const finding = state().findings.find((item) => item.orgId === orgId && item.id === findingId);
    if (!finding) return null;
    finding.status = status;
    return clone(finding);
  },

  async importSample(orgId: string): Promise<void> {
    const db = state();
    if (db.sites.some((site) => site.orgId === orgId)) return;
    const sample = buildDemo(orgId);
    db.sites.push(...sample.sites);
    db.crew.push(...sample.crew);
    db.walks.push(...sample.walks);
    db.photos.push(...sample.photos);
    db.findings.push(...sample.findings);
    db.actions.push(...sample.actions);
    db.logs.push(...sample.logs);
  },

  async resetOrg(orgId: string): Promise<void> {
    const db = state();
    db.sites = db.sites.filter((item) => item.orgId !== orgId);
    db.crew = db.crew.filter((item) => item.orgId !== orgId);
    db.walks = db.walks.filter((item) => item.orgId !== orgId);
    db.photos = db.photos.filter((item) => item.orgId !== orgId);
    db.findings = db.findings.filter((item) => item.orgId !== orgId);
    db.actions = db.actions.filter((item) => item.orgId !== orgId);
    db.logs = db.logs.filter((item) => item.orgId !== orgId);
  },

  /** Test helper. */
  async replaceAll(dataset: Dataset): Promise<void> {
    globalStore.__hivis = dataset;
  },

  empty: emptyDataset,
};

export type Store = Omit<typeof memoryStore, "replaceAll" | "empty" | "resetOrg" | "mode"> & {
  mode: "memory" | "postgres";
};
