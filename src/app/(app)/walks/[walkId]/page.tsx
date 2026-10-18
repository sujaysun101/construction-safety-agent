import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WalkScreen } from "@/components/screens/list-screens";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const metadata: Metadata = { title: "Walk" };

export default async function WalkPage({ params }: { params: Promise<{ walkId: string }> }) {
  const session = await getAppSession();
  if (!session?.orgId) return null;
  const { walkId } = await params;
  const data = await loadOrg(session.orgId, !process.env.DATABASE_URL);
  if (!data.walks.some((walk) => walk.id === walkId)) notFound();
  return <WalkScreen data={data} walkId={walkId} basePath="" demo={false} />;
}
