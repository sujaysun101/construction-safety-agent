import Link from "next/link";
import { ChartLegend, FindingsChart } from "@/components/charts";
import { ImportSampleButton } from "@/components/controls";
import { appHref } from "@/lib/brand";
import { formatDay, isOverdue } from "@/lib/dates";
import type { OrgData } from "@/lib/load";
import { findingsSeries } from "@/lib/metrics";

export function DashboardScreen({
  data,
  basePath,
  demo,
  name,
}: {
  data: OrgData;
  basePath: string;
  demo: boolean;
  name: string;
}) {
  if (!data.sites.length) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Company</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold">Add the first site</h1>
        <p className="mt-3 text-muted-foreground">
          Sites, crews, and walks stay inside the company you select. You can start empty or load the Ridge &amp; Co. sample.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={appHref(basePath, "/sites/new")} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Add a site
          </Link>
          <ImportSampleButton demo={demo} />
        </div>
      </div>
    );
  }

  const openActions = data.actions.filter((action) => action.status !== "closed");
  const overdue = openActions.filter((action) => isOverdue(action.dueOn, action.status));
  const openFindings = data.findings.filter((finding) => finding.status === "open");
  const series = findingsSeries(data.findings, data.walks, 14);
  const crewName = new Map(data.crew.map((member) => [member.id, member.name]));
  const siteName = new Map(data.sites.map((site) => [site.id, site]));

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Today</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">Good morning, {name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted-foreground">{openFindings.length} open findings across {data.sites.length} sites.</p>
        </div>
        <Link href={appHref(basePath, "/walks/new")} className="rounded-lg bg-hivis px-4 py-2 text-sm font-medium text-ink">
          Start a walk
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open findings" value={openFindings.length} />
        <Stat label="Open actions" value={openActions.length} />
        <Stat label="Overdue" value={overdue.length} />
        <Stat label="Walks on file" value={data.walks.length} />
      </div>

      <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-2xl font-semibold">Findings, last 14 days</h2>
          <ChartLegend />
        </div>
        <FindingsChart data={series} />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <h2 className="font-heading text-2xl font-semibold">Sites</h2>
          <ul className="mt-3 divide-y">
            {data.sites.map((site) => {
              const siteFindings = data.findings.filter((finding) => finding.siteId === site.id && finding.status === "open");
              const critical = siteFindings.filter((finding) => finding.severity === "critical" || finding.severity === "high").length;
              return (
                <li key={site.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <Link href={appHref(basePath, `/sites/${site.slug}`)} className="font-medium hover:underline">
                      {site.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{site.city}, {site.region} · {site.phase}</p>
                  </div>
                  <p className="text-right text-sm">
                    <span className="block font-medium">{siteFindings.length} open</span>
                    <span className="text-muted-foreground">{critical} high or critical</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <h2 className="font-heading text-2xl font-semibold">Needs a name on it</h2>
          <ul className="mt-3 space-y-3">
            {openActions.slice(0, 5).map((action) => {
              const site = siteName.get(action.siteId);
              return (
                <li key={action.id} className="text-sm">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-muted-foreground">
                    {crewName.get(action.assigneeId) ?? "Unassigned"} · due {formatDay(action.dueOn)}
                    {site ? ` · ${site.name}` : ""}
                    {isOverdue(action.dueOn, action.status) ? " · overdue" : ""}
                  </p>
                </li>
              );
            })}
            {!openActions.length ? <li className="text-sm text-muted-foreground">Nothing open.</li> : null}
          </ul>
          <Link href={appHref(basePath, "/actions")} className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
            All actions
          </Link>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-heading text-4xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
