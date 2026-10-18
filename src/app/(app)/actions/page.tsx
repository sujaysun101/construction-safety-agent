import type { Metadata } from "next";
import { ActionsScreen } from "@/components/screens/list-screens";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const metadata: Metadata = { title: "Actions" };

export default async function ActionsPage({ searchParams }: { searchParams: Promise<{ status?: string; site?: string }> }) {
  const session = await getAppSession();
  if (!session?.orgId) return null;
  const query = await searchParams;
  const data = await loadOrg(session.orgId, !process.env.DATABASE_URL);
  return <ActionsScreen data={data} basePath="" demo={false} status={query.status} siteSlug={query.site} />;
}
