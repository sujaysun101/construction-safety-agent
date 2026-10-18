import type { Metadata } from "next";
import { LogScreen } from "@/components/screens/list-screens";
import { loadOrg } from "@/lib/load";
import { getAppSession } from "@/lib/session";

export const metadata: Metadata = { title: "Daily log" };

export default async function LogPage() {
  const session = await getAppSession();
  if (!session?.orgId) return null;
  const data = await loadOrg(session.orgId, !process.env.DATABASE_URL);
  return <LogScreen data={data} basePath="" />;
}
