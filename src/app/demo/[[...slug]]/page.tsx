import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CrewForm, SiteForm } from "@/components/controls";
import { ActionsScreen, CrewScreen, LogScreen, ReportsScreen, SitesScreen, WalkScreen } from "@/components/screens/list-screens";
import { DashboardScreen } from "@/components/screens/dashboard-screen";
import { SiteScreen } from "@/components/screens/site-screen";
import { WalkComposer } from "@/components/walk-composer";
import { DEMO_ORG_ID } from "@/lib/brand";
import { loadOrg } from "@/lib/load";
import { demoSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DemoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ status?: string; site?: string; from?: string; to?: string }>;
}) {
  if (process.env.DEMO_SCREENSHOT !== "1") notFound();
  const { slug = [] } = await params;
  const query = await searchParams;
  const session = demoSession();
  const data = await loadOrg(DEMO_ORG_ID, true);
  const [head, second] = slug;

  let body: React.ReactNode = <DashboardScreen data={data} basePath="/demo" demo name={session.name} />;
  if (head === "sites" && !second) body = <SitesScreen data={data} basePath="/demo" />;
  else if (head === "sites" && second === "new") {
    body = (
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-4xl font-semibold">New site</h1>
        <div className="mt-6">
          <SiteForm demo basePath="/demo" />
        </div>
      </div>
    );
  } else if (head === "sites" && second) {
    const site = data.sites.find((item) => item.slug === second);
    body = site ? <SiteScreen site={site} data={data} basePath="/demo" /> : notFound();
  } else if (head === "walks" && second === "new") {
    body = (
      <WalkComposer
        sites={data.sites.map((site) => ({ id: site.id, name: site.name }))}
        crew={data.crew.map((member) => ({ id: member.id, name: member.name, role: member.role, siteId: member.siteId, trade: member.trade }))}
        conductedBy={session.name}
        demo
        basePath="/demo"
      />
    );
  } else if (head === "walks" && second) {
    if (!data.walks.some((walk) => walk.id === second)) notFound();
    body = <WalkScreen data={data} walkId={second} basePath="/demo" demo />;
  } else if (head === "actions") body = <ActionsScreen data={data} basePath="/demo" demo status={query.status} siteSlug={query.site} />;
  else if (head === "log") body = <LogScreen data={data} basePath="/demo" />;
  else if (head === "crew" && second === "new") {
    body = (
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-4xl font-semibold">Add crew</h1>
        <div className="mt-6">
          <CrewForm demo basePath="/demo" sites={data.sites.map((site) => ({ id: site.id, name: site.name }))} />
        </div>
      </div>
    );
  } else if (head === "crew") body = <CrewScreen data={data} basePath="/demo" />;
  else if (head === "reports") body = <ReportsScreen data={data} basePath="/demo" siteSlug={query.site} from={query.from || undefined} to={query.to || undefined} />;
  else if (head && head !== "dashboard") notFound();

  return (
    <AppShell
      companyName={session.companyName}
      userName={session.name}
      demo
      clerkReady={false}
      basePath="/demo"
      sites={data.sites.map((site) => ({ slug: site.slug, name: site.name }))}
    >
      {body}
    </AppShell>
  );
}
