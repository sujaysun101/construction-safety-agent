import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { analysisOutputSchema, firstZodMessage } from "@/lib/schemas";
import type { Category, Severity } from "@/lib/types";

export type AnalysisFinding = {
  photoIndex: number;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  boundingDescription: string;
  oshaCategory: string;
  suggestedAction: string;
};

export type AnalysisResult = {
  sample: boolean;
  summary: string;
  findings: AnalysisFinding[];
};

const SAMPLE_POOL: AnalysisFinding[] = [
  {
    photoIndex: 0,
    category: "fall",
    severity: "high",
    title: "Leading edge without a guardrail",
    description: "The deck edge in the photo has posts but no top rail along the path the crew would use.",
    boundingDescription: "Upper half of the frame, along the open deck edge.",
    oshaCategory: "29 CFR 1926.502 — Fall protection systems criteria",
    suggestedAction: "Install the top and mid rail before anyone works on that edge.",
  },
  {
    photoIndex: 0,
    category: "ppe",
    severity: "medium",
    title: "Head protection not staged at the work area",
    description: "The work area is active and no hard hat is at the station in the frame.",
    boundingDescription: "Center of the frame, the open work area.",
    oshaCategory: "29 CFR 1926.100 — Head protection",
    suggestedAction: "Put hard hats at the stair and check them before the crew starts.",
  },
  {
    photoIndex: 1,
    category: "electrical",
    severity: "high",
    title: "Cord run along a wet slab",
    description: "A temporary cord crosses the floor where water is standing near the panel.",
    boundingDescription: "Foreground, the cord on the wet slab.",
    oshaCategory: "29 CFR 1926.405 — Wiring methods, components, and equipment",
    suggestedAction: "Lift the cord off the slab and confirm GFCI protection before the panel is used.",
  },
  {
    photoIndex: 2,
    category: "housekeeping",
    severity: "medium",
    title: "Material stored in the walk path",
    description: "Stacked material narrows the path the crew uses to leave the floor.",
    boundingDescription: "Right side of the frame, material in the walk path.",
    oshaCategory: "29 CFR 1926.25 — Housekeeping",
    suggestedAction: "Move the stack off the walk path before the end of the shift.",
  },
];

export function sampleReading(imageCount: number): AnalysisResult {
  const count = Math.min(Math.max(imageCount, 1), 3);
  const findings = SAMPLE_POOL.slice(0, count).map((finding, index) => ({
    ...finding,
    photoIndex: Math.min(index, imageCount - 1),
  }));
  return {
    sample: true,
    summary: "Sample reading. These findings show how a HiVis walk is filed. They are not a vision result for the photos you uploaded.",
    findings,
  };
}

function maxTokens(): number {
  const parsed = Number(process.env.AI_MAX_TOKENS ?? 1200);
  if (!Number.isFinite(parsed)) return 1200;
  return Math.min(Math.max(Math.round(parsed), 256), 2000);
}

function modelName(): string {
  return process.env.AI_MODEL?.trim() || "claude-sonnet-4-6";
}

function normalizeCategory(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const text = value.toLowerCase();
  if (text.includes("ppe") || text.includes("hard hat") || text.includes("protective") || text.includes("eye") || text.includes("hearing")) {
    return "ppe";
  }
  if (text.includes("fall") || text.includes("guard") || text.includes("ladder") || text.includes("opening") || text.includes("stair")) {
    return "fall";
  }
  if (text.includes("house") || text.includes("debris") || text.includes("egress") || text.includes("housekeeping")) {
    return "housekeeping";
  }
  if (text.includes("electr") || text.includes("gfci") || text.includes("cord") || text.includes("power") || text.includes("panel")) {
    return "electrical";
  }
  return text;
}

function normalizeFinding(value: unknown, imageCount: number): unknown {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const photoIndex = Number(record.photoIndex ?? 0);
  return {
    ...record,
    photoIndex: Number.isFinite(photoIndex) ? Math.min(Math.max(photoIndex, 0), Math.max(imageCount - 1, 0)) : 0,
    category: normalizeCategory(record.category),
    severity: typeof record.severity === "string" ? record.severity.toLowerCase() : record.severity,
  };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const source = fenced?.[1] ?? trimmed;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in the model response.");
  return JSON.parse(source.slice(start, end + 1));
}

export async function readPhotos(images: { mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; data: string }[]): Promise<AnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) return sampleReading(images.length);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: modelName(),
    max_tokens: maxTokens(),
    system:
      "You are a construction safety lead writing a daily walk for a small contractor. Report only what is visible. Use four categories: ppe, fall, housekeeping, electrical. Severity is low, medium, high, or critical. boundingDescription is plain language about where in the frame the issue sits, not pixel coordinates. oshaCategory cites a 29 CFR 1926 section. If the image is not a jobsite, return an empty findings array and say so in the summary. Return JSON only.",
    messages: [
      {
        role: "user",
        content: [
          ...images.map((image) => ({
            type: "image" as const,
            source: { type: "base64" as const, media_type: image.mediaType, data: image.data },
          })),
          {
            type: "text" as const,
            text: `Read these ${images.length} site photo(s). Photo indexes start at 0 in the order provided. Return JSON with this shape: {"summary":"one or two sentences","findings":[{"photoIndex":0,"category":"ppe|fall|housekeeping|electrical","severity":"low|medium|high|critical","title":"short","description":"what is wrong","boundingDescription":"where in the frame","oshaCategory":"29 CFR 1926.xxx — name","suggestedAction":"the fix a crew lead can do"}]}. No more than 8 findings. Skip anything you cannot see.`,
          },
        ],
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
  const parsed = extractJson(text);
  const record = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const findings = Array.isArray(record.findings) ? record.findings.map((finding) => normalizeFinding(finding, images.length)) : [];
  const checked = analysisOutputSchema.safeParse({ summary: record.summary, findings });
  if (!checked.success) {
    throw new Error(firstZodMessage(checked.error));
  }
  return { sample: false, summary: checked.data.summary, findings: checked.data.findings };
}

export function analysisErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) return firstZodMessage(error);
  if (error instanceof Error) {
    const message = error.message.replace(/sk-ant-[a-zA-Z0-9_-]+/g, "[key]");
    if (message.length < 180 && !message.toLowerCase().includes("api key")) return message;
  }
  return "Claude could not read these photos. Check the model response and try again.";
}
