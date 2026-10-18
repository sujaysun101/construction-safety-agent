import type { Metadata } from "next";
import { ReportsScreen } from "@/components/screens/list-screens";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ site?: string; from?: string; to?: string }> }) {
  const session = await getAppSession();
  if (!session?.orgId) return null;
  const query = await searchParams;
  const data = await loadOrg(session.orgId, !process.env.DATABASE_URL);
  return <ReportsScreen data={data} basePath="" siteSlug={query.site} from={query.from || undefined} to={query.to || undefined} />;
}
