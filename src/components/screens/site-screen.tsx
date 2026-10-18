import Image from "next/image";
import Link from "next/link";
import { CategoryBadge, SeverityBadge, StatusBadge } from "@/components/badges";
import { ActionsChart, ChartLegend, FindingsChart } from "@/components/charts";
import { appHref } from "@/lib/brand";
import { formatDay, formatLong, isOverdue } from "@/lib/dates";
import type { OrgData } from "@/lib/load";
import { actionSplit, findingsSeries } from "@/lib/metrics";
import type { Site } from "@/lib/types";

export function SiteScreen({ site, data, basePath }: { site: Site; data: OrgData; basePath: string }) {
  const findings = data.findings.filter((finding) => finding.siteId === site.id);
  const actions = data.actions.filter((action) => action.siteId === site.id);
  const walks = data.walks.filter((walk) => walk.siteId === site.id);
  const openFindings = findings.filter((finding) => finding.status === "open");
  const critical = openFindings.filter((finding) => finding.severity === "critical").length;
  const openActions = actions.filter((action) => action.status !== "closed");
  const crewName = new Map(data.crew.map((member) => [member.id, member.name]));
  const latest = walks[0];
  const latestPhoto = latest ? data.photos.find((photo) => photo.walkId === latest.id) : undefined;
  const from = walks.at(-1)?.walkedOn;
  const to = walks[0]?.walkedOn;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">{site.city}, {site.region}</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">{site.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {site.address} · {site.phase}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={appHref(basePath, `/walks/new`)} className="rounded-lg bg-hivis px-4 py-2 text-sm font-medium text-ink">
            Start a walk
          </Link>
          <a
            href={`/api/reports/${site.slug}${from && to ? `?from=${from}&to=${to}` : ""}`}
            className="rounded-lg border bg-card px-4 py-2 text-sm font-medium"
          >
            Export PDF
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open findings" value={String(openFindings.length)} />
        <Stat label="Critical still open" value={String(critical)} />
        <Stat label="Open actions" value={String(openActions.length)} />
        <Stat label="Walks" value={String(walks.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-2xl font-semibold">Findings over time</h2>
            <ChartLegend />
          </div>
          <FindingsChart data={findingsSeries(findings, walks, 14)} height={200} />
        </section>
        <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <h2 className="font-heading text-2xl font-semibold">Open vs closed</h2>
          <p className="mb-2 text-sm text-muted-foreground">Corrective actions on this site</p>
          <ActionsChart data={actionSplit(actions)} height={200} />
        </section>
      </div>

      {latest && latestPhoto ? (
        <section className="grid gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 md:grid-cols-[280px_1fr]">
          <Image src={latestPhoto.url} alt={latestPhoto.caption} width={800} height={520} unoptimized className="h-36 w-full rounded-xl object-cover" />
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Latest walk · {formatLong(latest.walkedOn)}</p>
            <h2 className="mt-1 font-heading text-2xl font-semibold">{latest.summary}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {latest.conductedBy} · {latest.weather} · {latest.crewCount} on site. {latestPhoto.storage === "demo" ? "Sketch, not a photo of a person." : null}
            </p>
            <Link href={appHref(basePath, `/walks/${latest.id}`)} className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline">
              Open the walk
            </Link>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="font-heading text-2xl font-semibold">Open findings</h2>
          <Link href={appHref(basePath, "/actions")} className="text-sm font-medium underline-offset-4 hover:underline">
            Actions
          </Link>
        </div>
        <ul className="divide-y">
          {openFindings.slice(0, 6).map((finding) => {
            const action = actions.find((item) => item.findingId === finding.id);
            return (
              <li key={finding.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={finding.severity} />
                    <CategoryBadge category={finding.category} />
                    {action ? <StatusBadge status={action.status} /> : null}
                  </div>
                  <p className="mt-1 font-medium">{finding.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {finding.oshaCategory}
                    {action ? ` · ${crewName.get(action.assigneeId) ?? "Unassigned"} · due ${formatDay(action.dueOn)}` : ""}
                    {action && isOverdue(action.dueOn, action.status) ? " · overdue" : ""}
                  </p>
                </div>
                <Link href={appHref(basePath, `/walks/${finding.walkId}`)} className="text-sm font-medium underline-offset-4 hover:underline">
                  Walk
                </Link>
              </li>
            );
          })}
          {!openFindings.length ? <li className="px-4 py-6 text-sm text-muted-foreground">Nothing open on this site.</li> : null}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-heading text-4xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
