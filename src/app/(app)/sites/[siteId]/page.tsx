import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteScreen } from "@/components/screens/site-screen";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const metadata: Metadata = { title: "Site" };

export default async function SitePage({ params }: { params: Promise<{ siteId: string }> }) {
  const session = await getAppSession();
  if (!session?.orgId) return null;
  const { siteId } = await params;
  const data = await loadOrg(session.orgId, !process.env.DATABASE_URL);
  const site = data.sites.find((item) => item.slug === siteId || item.id === siteId);
  if (!site) notFound();
  return <SiteScreen site={site} data={data} basePath="" />;
}
