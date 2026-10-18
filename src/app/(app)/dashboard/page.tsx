import type { Metadata } from "next";
import { DashboardScreen } from "@/components/screens/dashboard-screen";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getAppSession();
  if (!session?.orgId) return null;
  const data = await loadOrg(session.orgId, !process.env.DATABASE_URL);
  return <DashboardScreen data={data} basePath="" demo={false} name={session.name} />;
}
