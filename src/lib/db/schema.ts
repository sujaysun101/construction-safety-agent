import { boolean, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const sites = pgTable(
  "sites",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    region: text("region").notNull(),
    phase: text("phase").notNull(),
    status: text("status").notNull(),
    startedOn: text("started_on").notNull(),
  },
  (table) => [index("sites_org_idx").on(table.orgId), uniqueIndex("sites_org_slug_idx").on(table.orgId, table.slug)],
);

export const crew = pgTable(
  "crew",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    siteId: text("site_id"),
    name: text("name").notNull(),
    role: text("role").notNull(),
    trade: text("trade").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
  },
  (table) => [index("crew_org_idx").on(table.orgId)],
);

export const walks = pgTable(
  "walks",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    siteId: text("site_id").notNull(),
    walkedOn: text("walked_on").notNull(),
    conductedBy: text("conducted_by").notNull(),
    weather: text("weather").notNull(),
    crewCount: integer("crew_count").notNull(),
    notes: text("notes").notNull(),
    summary: text("summary").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("walks_org_site_idx").on(table.orgId, table.siteId)],
);

export const photos = pgTable(
  "photos",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    walkId: text("walk_id").notNull(),
    url: text("url").notNull(),
    storage: text("storage").notNull(),
    caption: text("caption").notNull(),
    mediaType: text("media_type").notNull(),
  },
  (table) => [index("photos_walk_idx").on(table.walkId)],
);

export const findings = pgTable(
  "findings",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    siteId: text("site_id").notNull(),
    walkId: text("walk_id").notNull(),
    photoId: text("photo_id"),
    category: text("category").notNull(),
    severity: text("severity").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    boundingDescription: text("bounding_description").notNull(),
    oshaCategory: text("osha_category").notNull(),
    status: text("status").notNull(),
    sample: boolean("sample").notNull().default(false),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("findings_org_site_idx").on(table.orgId, table.siteId)],
);

export const actions = pgTable(
  "actions",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    siteId: text("site_id").notNull(),
    findingId: text("finding_id").notNull(),
    title: text("title").notNull(),
    assigneeId: text("assignee_id").notNull(),
    dueOn: text("due_on").notNull(),
    status: text("status").notNull(),
    closedOn: text("closed_on"),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("actions_org_site_idx").on(table.orgId, table.siteId)],
);

export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    siteId: text("site_id").notNull(),
    walkId: text("walk_id"),
    logDate: text("log_date").notNull(),
    summary: text("summary").notNull(),
    crewOnSite: integer("crew_on_site").notNull(),
    weather: text("weather").notNull(),
    narrative: text("narrative").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("logs_org_site_idx").on(table.orgId, table.siteId)],
);
