import type { Metadata } from "next";
import { CrewScreen } from "@/components/screens/list-screens";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const metadata: Metadata = { title: "Crew" };

export default async function CrewPage() {
  const session = await getAppSession();
  if (!session?.orgId) return null;
  const data = await loadOrg(session.orgId, !process.env.DATABASE_URL);
  return <CrewScreen data={data} basePath="" />;
}
