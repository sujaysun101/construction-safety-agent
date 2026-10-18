import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { clerkConfigured, DEMO_COMPANY, DEMO_ORG_ID } from "@/lib/brand";

export type AppSession = {
  userId: string;
  orgId: string | null;
  demo: boolean;
  clerkReady: boolean;
  name: string;
  companyName: string;
};

export async function demoCookieAllowed(): Promise<boolean> {
  if (process.env.DEMO_SCREENSHOT !== "1") return false;
  const jar = await cookies();
  return jar.get("hivis_demo")?.value === "1";
}

export async function getAppSession(): Promise<AppSession | null> {
  if (!clerkConfigured()) {
    return {
      userId: "user_demo_maya",
      orgId: DEMO_ORG_ID,
      demo: true,
      clerkReady: false,
      name: DEMO_COMPANY.userName,
      companyName: DEMO_COMPANY.name,
    };
  }

  const session = await auth();
  if (!session.userId) return null;

  const demo = !process.env.DATABASE_URL;
  let companyName = "Your company";
  if (session.orgId) {
    try {
      const client = await clerkClient();
      const org = await client.organizations.getOrganization({ organizationId: session.orgId });
      companyName = org.name;
    } catch {
      companyName = session.orgSlug || companyName;
    }
  } else if (demo) {
    companyName = DEMO_COMPANY.name;
  }

  const user = await currentUser();
  const name = user?.fullName || user?.firstName || "there";
  return {
    userId: session.userId,
    orgId: session.orgId ?? (demo ? DEMO_ORG_ID : null),
    demo,
    clerkReady: true,
    name,
    companyName,
  };
}

export function demoSession(): AppSession {
  return {
    userId: "user_demo_maya",
    orgId: DEMO_ORG_ID,
    demo: true,
    clerkReady: false,
    name: DEMO_COMPANY.userName,
    companyName: DEMO_COMPANY.name,
  };
}
