export const CATEGORIES = ["ppe", "fall", "housekeeping", "electrical"] as const;
export type Category = (typeof CATEGORIES)[number];

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const ACTION_STATUSES = ["open", "in_progress", "closed"] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const FINDING_STATUSES = ["open", "closed"] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

export const CREW_ROLES = ["superintendent", "crew_lead", "safety"] as const;
export type CrewRole = (typeof CREW_ROLES)[number];

export type SiteStatus = "active" | "closeout";
export type PhotoStorage = "blob" | "local" | "demo";

export type Site = {
  id: string;
  orgId: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  region: string;
  phase: string;
  status: SiteStatus;
  startedOn: string;
};

export type CrewMember = {
  id: string;
  orgId: string;
  siteId: string | null;
  name: string;
  role: CrewRole;
  trade: string;
  email: string;
  phone: string;
};

export type Walk = {
  id: string;
  orgId: string;
  siteId: string;
  walkedOn: string;
  conductedBy: string;
  weather: string;
  crewCount: number;
  notes: string;
  summary: string;
  createdAt: string;
};

export type Photo = {
  id: string;
  orgId: string;
  walkId: string;
  url: string;
  storage: PhotoStorage;
  caption: string;
  mediaType: string;
};

export type Finding = {
  id: string;
  orgId: string;
  siteId: string;
  walkId: string;
  photoId: string | null;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  boundingDescription: string;
  oshaCategory: string;
  status: FindingStatus;
  sample: boolean;
  createdAt: string;
};

export type CorrectiveAction = {
  id: string;
  orgId: string;
  siteId: string;
  findingId: string;
  title: string;
  assigneeId: string;
  dueOn: string;
  status: ActionStatus;
  closedOn: string | null;
  note: string;
  createdAt: string;
};

export type DailyLog = {
  id: string;
  orgId: string;
  siteId: string;
  walkId: string | null;
  logDate: string;
  summary: string;
  crewOnSite: number;
  weather: string;
  narrative: string;
  createdAt: string;
};

export type Dataset = {
  sites: Site[];
  crew: CrewMember[];
  walks: Walk[];
  photos: Photo[];
  findings: Finding[];
  actions: CorrectiveAction[];
  logs: DailyLog[];
};

export type StoredPhoto = {
  url: string;
  storage: PhotoStorage;
  caption: string;
  mediaType: string;
};

export type NewFindingInput = {
  photoIndex: number;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  boundingDescription: string;
  oshaCategory: string;
  sample: boolean;
  action: {
    title: string;
    assigneeId: string;
    dueOn: string;
  } | null;
};

export type NewWalkInput = {
  siteId: string;
  walkedOn: string;
  conductedBy: string;
  weather: string;
  crewCount: number;
  notes: string;
  summary: string;
  photos: StoredPhoto[];
  findings: NewFindingInput[];
};

export type ActionPatch = {
  status?: ActionStatus;
  note?: string;
  dueOn?: string;
  assigneeId?: string;
  closedOn?: string | null;
};
