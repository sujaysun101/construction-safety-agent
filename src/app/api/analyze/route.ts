import { NextResponse, type NextRequest } from "next/server";
import { analysisErrorMessage, readPhotos } from "@/lib/ai";
import { consumeAnalysis } from "@/lib/rate-limit";
import { analyzeInputSchema, firstZodMessage } from "@/lib/schemas";
import { demoCookieAllowed, getAppSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stripDataUrl(value: string): string {
  const match = value.match(/^data:[^;]+;base64,(.*)$/);
  return match?.[1] ?? value;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAppSession();
    const demo = !session && (await demoCookieAllowed());
    const userId = session?.userId ?? (demo ? "user_demo_maya" : null);
    if (!userId) {
      return NextResponse.json({ error: "Sign in to read site photos." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Send the photos as JSON." }, { status: 400 });
    }

    if (body && typeof body === "object" && Array.isArray((body as { images?: unknown }).images)) {
      const images = (body as { images: unknown[] }).images.map((image) => {
        if (!image || typeof image !== "object") return image;
        const record = image as { mediaType?: unknown; data?: unknown };
        return {
          mediaType: record.mediaType,
          data: typeof record.data === "string" ? stripDataUrl(record.data) : record.data,
        };
      });
      body = { ...(body as object), images };
    }

    const parsed = analyzeInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
    }

    const limit = await consumeAnalysis(userId);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many readings this hour. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
      );
    }

    const analysis = await readPhotos(parsed.data.images);
    return NextResponse.json(
      { ...analysis, remaining: limit.remaining },
      { headers: { "X-RateLimit-Remaining": String(limit.remaining) } },
    );
  } catch (error) {
    console.error("analyze", error instanceof Error ? error.message.replace(/sk-ant-[a-zA-Z0-9_-]+/g, "[key]") : "failed");
    return NextResponse.json({ error: analysisErrorMessage(error) }, { status: 400 });
  }
}
