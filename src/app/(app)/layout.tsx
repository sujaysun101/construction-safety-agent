import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAppSession();
  if (!session) redirect("/sign-in");
  const data = session.orgId ? await loadOrg(session.orgId, !process.env.DATABASE_URL) : null;
  return (
    <AppShell
      companyName={session.companyName}
      userName={session.name}
      demo={session.demo}
      clerkReady={session.clerkReady}
      basePath=""
      sites={(data?.sites ?? []).map((site) => ({ slug: site.slug, name: site.name }))}
    >
      {session.orgId ? children : <NeedCompany />}
    </AppShell>
  );
}

function NeedCompany() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="font-heading text-4xl font-semibold">Choose a company</h1>
      <p className="mt-3 text-muted-foreground">
        HiVis keeps sites, crews, and walks inside a Clerk organization. Create or select the company in the header, then add a site.
      </p>
    </div>
  );
}
