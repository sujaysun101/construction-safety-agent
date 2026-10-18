import Image from "next/image";
import Link from "next/link";
import { CategoryBadge, SeverityBadge, StatusBadge } from "@/components/badges";
import { ActionStatusSelect, FindingStatusButton } from "@/components/controls";
import { ROLE_LABEL, appHref } from "@/lib/brand";
import { formatDay, formatLong, isOverdue, shiftDate } from "@/lib/dates";
import type { OrgData } from "@/lib/load";

export function SitesScreen({ data, basePath }: { data: OrgData; basePath: string }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl font-semibold">Sites</h1>
          <p className="mt-1 text-muted-foreground">Each site keeps its own walks, findings, and trend.</p>
        </div>
        <Link href={appHref(basePath, "/sites/new")} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Add site
        </Link>
      </div>
      <ul className="mt-6 grid gap-3">
        {data.sites.map((site) => {
          const open = data.findings.filter((finding) => finding.siteId === site.id && finding.status === "open").length;
          return (
            <li key={site.id}>
              <Link href={appHref(basePath, `/sites/${site.slug}`)} className="block rounded-2xl bg-card p-4 ring-1 ring-foreground/10 hover:ring-foreground/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-2xl font-semibold">{site.name}</h2>
                    <p className="text-sm text-muted-foreground">{site.address}, {site.city}, {site.region}</p>
                  </div>
                  <p className="text-sm">{open} open</p>
                </div>
                <p className="mt-2 text-sm">{site.phase}</p>
              </Link>
            </li>
          );
        })}
        {!data.sites.length ? <li className="text-sm text-muted-foreground">No sites yet.</li> : null}
      </ul>
    </div>
  );
}

export function ActionsScreen({
  data,
  basePath,
  demo,
  status,
  siteSlug,
}: {
  data: OrgData;
  basePath: string;
  demo: boolean;
  status?: string;
  siteSlug?: string;
}) {
  const site = data.sites.find((item) => item.slug === siteSlug);
  const crewName = new Map(data.crew.map((member) => [member.id, member.name]));
  const siteName = new Map(data.sites.map((item) => [item.id, item.name]));
  const findingTitle = new Map(data.findings.map((finding) => [finding.id, finding.title]));
  const rows = data.actions.filter((action) => {
    if (site && action.siteId !== site.id) return false;
    if (status === "open") return action.status !== "closed";
    if (status === "closed") return action.status === "closed";
    if (status === "overdue") return isOverdue(action.dueOn, action.status);
    return true;
  });
  const filters = [
    { id: "", label: "All" },
    { id: "open", label: "Open" },
    { id: "overdue", label: "Overdue" },
    { id: "closed", label: "Closed" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-4xl font-semibold">Corrective actions</h1>
      <p className="mt-1 text-muted-foreground">Assigned to crew leads, with a due date and a status.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const href = appHref(basePath, `/actions${filter.id ? `?status=${filter.id}` : ""}`);
          const active = (status ?? "") === filter.id;
          return (
            <Link key={filter.id || "all"} href={href} className={`rounded-full px-3 py-1 text-sm ${active ? "bg-ink text-hivis" : "bg-muted"}`} aria-current={active ? "page" : undefined}>
              {filter.label}
            </Link>
          );
        })}
      </div>
      <ul className="mt-4 grid gap-3">
        {rows.map((action) => (
          <li key={action.id} className="grid gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-[1fr_180px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={action.status} />
                {isOverdue(action.dueOn, action.status) ? <span className="text-xs font-medium text-destructive">Overdue</span> : null}
              </div>
              <p className="mt-2 font-medium">{action.title}</p>
              <p className="text-sm text-muted-foreground">
                {findingTitle.get(action.findingId)} · {siteName.get(action.siteId)} · {crewName.get(action.assigneeId) ?? "Unassigned"} · due {formatDay(action.dueOn)}
              </p>
            </div>
            <ActionStatusSelect id={action.id} status={action.status} demo={demo} />
          </li>
        ))}
        {!rows.length ? <li className="text-sm text-muted-foreground">No actions in this view.</li> : null}
      </ul>
    </div>
  );
}

export function LogScreen({ data, basePath }: { data: OrgData; basePath: string }) {
  const siteName = new Map(data.sites.map((site) => [site.id, site.name]));
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-4xl font-semibold">Daily log</h1>
      <p className="mt-1 text-muted-foreground">One entry for each walk, in the order the days happened.</p>
      <ol className="mt-6 space-y-4">
        {data.logs.map((log) => (
          <li key={log.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">{formatLong(log.logDate)} · {siteName.get(log.siteId)}</p>
            <h2 className="mt-1 font-heading text-2xl font-semibold">{log.summary}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{log.weather} · {log.crewOnSite} on site</p>
            <p className="mt-2 text-sm">{log.narrative}</p>
            {log.walkId ? (
              <Link href={appHref(basePath, `/walks/${log.walkId}`)} className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline">
                Open walk
              </Link>
            ) : null}
          </li>
        ))}
        {!data.logs.length ? <li className="text-sm text-muted-foreground">No log entries yet.</li> : null}
      </ol>
    </div>
  );
}

export function CrewScreen({ data, basePath }: { data: OrgData; basePath: string }) {
  const siteName = new Map(data.sites.map((site) => [site.id, site.name]));
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl font-semibold">Crew</h1>
          <p className="mt-1 text-muted-foreground">Crew leads take the corrective actions.</p>
        </div>
        <Link href={appHref(basePath, "/crew/new")} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Add someone
        </Link>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {data.crew.map((member) => (
          <li key={member.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">{ROLE_LABEL[member.role]} · {member.trade}</p>
            <h2 className="mt-1 font-heading text-2xl font-semibold">{member.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{member.siteId ? siteName.get(member.siteId) : "Company-wide"}</p>
            <p className="text-sm">{member.email}</p>
            <p className="text-sm">{member.phone}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReportsScreen({
  data,
  basePath,
  siteSlug,
  from = shiftDate(-30),
  to = shiftDate(0),
}: {
  data: OrgData;
  basePath: string;
  siteSlug?: string;
  from?: string;
  to?: string;
}) {
  const site = data.sites.find((item) => item.slug === siteSlug) ?? data.sites[0];
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-4xl font-semibold">Safety report</h1>
      <p className="mt-2 text-muted-foreground">
        A branded PDF of the walks, findings, and corrective actions for the GC or the file. OSHA citations are a filing aid, not a certification.
      </p>
      {!site ? <p className="mt-6 text-sm">Add a site before exporting.</p> : null}
      {site ? (
        <form className="mt-6 grid gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10" action={appHref(basePath, "/reports")} method="get">
          <label className="grid gap-1.5 text-sm font-medium">
            Site
            <select name="site" className="field" defaultValue={site.slug}>
              {data.sites.map((item) => (
                <option key={item.id} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              From
              <input className="field" type="date" name="from" defaultValue={from} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              To
              <input className="field" type="date" name="to" defaultValue={to} />
            </label>
          </div>
          <button className="h-10 rounded-lg border text-sm font-medium" type="submit">
            Update preview
          </button>
          <ReportPreview data={data} siteId={site.id} from={from} to={to} slug={site.slug} />
        </form>
      ) : null}
    </div>
  );
}

function ReportPreview({ data, siteId, from, to, slug }: { data: OrgData; siteId: string; from: string; to: string; slug: string }) {
  const walks = data.walks.filter((walk) => walk.siteId === siteId && walk.walkedOn >= from && walk.walkedOn <= to);
  const walkIds = new Set(walks.map((walk) => walk.id));
  const findings = data.findings.filter((finding) => walkIds.has(finding.walkId));
  return (
    <div className="rounded-xl bg-muted/60 p-4">
      <p className="font-medium">{walks.length} walks · {findings.length} findings in the last 30 days</p>
      <ul className="mt-3 space-y-2">
        {findings.slice(0, 4).map((finding) => (
          <li key={finding.id} className="flex flex-wrap items-center gap-2 text-sm">
            <SeverityBadge severity={finding.severity} />
            <CategoryBadge category={finding.category} />
            <span>{finding.title}</span>
          </li>
        ))}
      </ul>
      <a className="mt-4 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-medium text-hivis" href={`/api/reports/${slug}?from=${from}&to=${to}`}>
        Download PDF
      </a>
    </div>
  );
}

export function WalkScreen({
  data,
  walkId,
  basePath,
  demo,
}: {
  data: OrgData;
  walkId: string;
  basePath: string;
  demo: boolean;
}) {
  const walk = data.walks.find((item) => item.id === walkId);
  if (!walk) return <p>That walk is not on this company.</p>;
  const site = data.sites.find((item) => item.id === walk.siteId);
  const photos = data.photos.filter((photo) => photo.walkId === walk.id);
  const findings = data.findings.filter((finding) => finding.walkId === walk.id);
  const crewName = new Map(data.crew.map((member) => [member.id, member.name]));
  const sample = findings.some((finding) => finding.sample);
  const sketched = photos.some((photo) => photo.storage === "demo");

  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <div>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {site ? <Link href={appHref(basePath, `/sites/${site.slug}`)}>{site.name}</Link> : "Site"} · {formatLong(walk.walkedOn)}
        </p>
        <h1 className="mt-1 font-heading text-4xl font-semibold">{walk.summary}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {walk.conductedBy} · {walk.weather} · {walk.crewCount} on site
        </p>
      </div>
      {sample ? <p className="rounded-xl bg-hivis/50 px-4 py-3 text-sm text-ink">Sample reading. These findings were not produced by Claude.</p> : null}
      {sketched ? <p className="text-sm text-muted-foreground">Sample photos are site sketches, not pictures of people.</p> : null}
      {walk.notes ? <p className="text-sm">{walk.notes}</p> : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {photos.map((photo) => (
          <li key={photo.id} className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
            <Image src={photo.url} alt={photo.caption} width={800} height={520} unoptimized className="aspect-[4/3] w-full object-cover" />
            <p className="px-3 py-2 text-sm text-muted-foreground">{photo.caption}</p>
          </li>
        ))}
      </ul>
      <ul className="grid gap-3">
        {findings.map((finding) => {
          const action = data.actions.find((item) => item.findingId === finding.id);
          return (
            <li key={finding.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={finding.severity} />
                <CategoryBadge category={finding.category} />
                <StatusBadge status={finding.status} />
              </div>
              <h2 className="mt-2 font-heading text-2xl font-semibold">{finding.title}</h2>
              <p className="mt-2 text-sm">{finding.description}</p>
              <p className="mt-2 text-sm"><span className="font-medium">In the frame: </span>{finding.boundingDescription}</p>
              <p className="mt-1 text-xs text-muted-foreground">{finding.oshaCategory}</p>
              {action ? (
                <p className="mt-3 text-sm">
                  {action.title} · {crewName.get(action.assigneeId)} · due {formatDay(action.dueOn)} · {action.status.replace("_", " ")}
                </p>
              ) : null}
              <div className="mt-3">
                <FindingStatusButton id={finding.id} status={finding.status} demo={demo} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
