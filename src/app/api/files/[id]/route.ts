import { NextResponse, type NextRequest } from "next/server";
import { readLocalPhoto } from "@/lib/storage";
import { demoCookieAllowed, getAppSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const allowed = session || (await demoCookieAllowed());
  if (!allowed) return NextResponse.json({ error: "Sign in to view this photo." }, { status: 401 });
  const { id } = await context.params;
  const file = await readLocalPhoto(id);
  if (!file) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mediaType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
