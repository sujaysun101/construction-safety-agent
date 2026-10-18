import type { Metadata } from "next";
import Link from "next/link";
import { WalkComposer } from "@/components/walk-composer";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const metadata: Metadata = { title: "New walk" };

export default async function NewWalkPage() {
  const session = await getAppSession();
  if (!session?.orgId) return null;
  const data = await loadOrg(session.orgId, !process.env.DATABASE_URL);
  if (!data.sites.length) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="font-heading text-4xl font-semibold">Add a site first</h1>
        <p className="mt-2 text-muted-foreground">A walk belongs to a site.</p>
        <Link href="/sites/new" className="mt-4 inline-block text-sm font-medium underline">
          New site
        </Link>
      </div>
    );
  }
  return (
    <div>
      <h1 className="mb-1 font-heading text-4xl font-semibold">Today&apos;s walk</h1>
      <p className="mb-6 text-muted-foreground">Photos in, findings out, actions on a crew lead.</p>
      <WalkComposer
        sites={data.sites.map((site) => ({ id: site.id, name: site.name }))}
        crew={data.crew.map((member) => ({ id: member.id, name: member.name, role: member.role, siteId: member.siteId, trade: member.trade }))}
        conductedBy={session.name}
        demo={false}
        basePath=""
      />
    </div>
  );
}
