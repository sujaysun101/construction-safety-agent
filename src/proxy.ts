import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkConfigured } from "@/lib/brand";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/opengraph-image(.*)",
  "/icon(.*)",
  "/apple-icon(.*)",
]);

const isDemoApi = createRouteMatcher(["/api/analyze", "/api/files(.*)", "/api/reports(.*)"]);

const withClerk = clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/demo")) {
    if (process.env.DEMO_SCREENSHOT !== "1") {
      return new NextResponse("Not found", { status: 404 });
    }
    const response = NextResponse.next();
    response.cookies.set("hivis_demo", "1", { httpOnly: true, sameSite: "lax", path: "/" });
    return response;
  }
  if (isDemoApi(request) && process.env.DEMO_SCREENSHOT === "1" && request.cookies.get("hivis_demo")?.value === "1") {
    return NextResponse.next();
  }
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  return NextResponse.next();
});

function withoutClerk(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/demo") && process.env.DEMO_SCREENSHOT !== "1") {
    return new NextResponse("Not found", { status: 404 });
  }
  const response = NextResponse.next();
  if (pathname.startsWith("/demo") && process.env.DEMO_SCREENSHOT === "1") {
    response.cookies.set("hivis_demo", "1", { httpOnly: true, sameSite: "lax", path: "/" });
  }
  return response;
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!clerkConfigured()) return withoutClerk(request);
  return withClerk(request, event);
}

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
