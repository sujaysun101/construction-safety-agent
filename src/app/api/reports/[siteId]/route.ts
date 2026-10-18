import { NextResponse, type NextRequest } from "next/server";
import { shiftDate } from "@/lib/dates";
import { buildSafetyReport } from "@/lib/pdf";
import { DEMO_ORG_ID } from "@/lib/brand";
import { demoCookieAllowed, getAppSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ siteId: string }> }) {
  const session = await getAppSession();
  const demo = !session && (await demoCookieAllowed());
  if (!session && !demo) return NextResponse.json({ error: "Sign in to export a report." }, { status: 401 });

  const orgId = session?.orgId ?? DEMO_ORG_ID;
  if (!orgId) return NextResponse.json({ error: "Choose a company first." }, { status: 400 });
  const memory = demo || !process.env.DATABASE_URL;
  const store = getStore({ memory });
  const { siteId } = await context.params;
  const site = await store.getSite(orgId, siteId);
  if (!site) return NextResponse.json({ error: "Site not found." }, { status: 404 });

  const from = request.nextUrl.searchParams.get("from") || shiftDate(-30);
  const to = request.nextUrl.searchParams.get("to") || shiftDate(0);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) {
    return NextResponse.json({ error: "Use a start date and an end date." }, { status: 400 });
  }

  const [walks, findings, actions, crew] = await Promise.all([
    store.listWalks(orgId, site.id),
    store.listFindings(orgId, site.id),
    store.listActions(orgId, site.id),
    store.listCrew(orgId),
  ]);
  const inRange = new Set(walks.filter((walk) => walk.walkedOn >= from && walk.walkedOn <= to).map((walk) => walk.id));
  const rangedWalks = walks.filter((walk) => inRange.has(walk.id));
  const rangedFindings = findings.filter((finding) => inRange.has(finding.walkId));
  const findingIds = new Set(rangedFindings.map((finding) => finding.id));
  const rangedActions = actions.filter((action) => findingIds.has(action.findingId));

  try {
    const bytes = await buildSafetyReport({
      companyName: session?.companyName ?? "Ridge & Co. Builders",
      site,
      from,
      to,
      walks: rangedWalks,
      findings: rangedFindings,
      actions: rangedActions,
      crew,
    });
    const filename = `hivis-${site.slug}-safety-report.pdf`;
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("report", error instanceof Error ? error.message : "failed");
    return NextResponse.json({ error: "The report could not be built." }, { status: 400 });
  }
}
