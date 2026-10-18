import type { Metadata } from "next";
import { CrewForm } from "@/components/controls";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const metadata: Metadata = { title: "New crew" };

export default async function NewCrewPage() {
  const session = await getAppSession();
  if (!session?.orgId) return null;
  const data = await loadOrg(session.orgId, !process.env.DATABASE_URL);
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-heading text-4xl font-semibold">Add crew</h1>
      <p className="mt-2 mb-6 text-muted-foreground">Crew leads are who corrective actions get assigned to.</p>
      <CrewForm demo={false} basePath="" sites={data.sites.map((site) => ({ id: site.id, name: site.name }))} />
    </div>
  );
}
