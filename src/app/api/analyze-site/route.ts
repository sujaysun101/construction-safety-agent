import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { imageBase64, mediaType } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType || "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `You are a certified construction site safety inspector. Analyze this image and return a JSON object with this exact structure:
{
  "safetyScore": 85,
  "violations": [
    {
      "type": "PPE Missing",
      "severity": "high",
      "description": "specific description of the violation",
      "location": "where in the image",
      "recommendation": "how to fix"
    }
  ],
  "compliantItems": ["list of safety items correctly in place"],
  "immediateActions": ["urgent actions required right now"],
  "incidentLogEntry": "formal incident log text for documentation"
}

safetyScore is 0-100. severity must be: low, medium, high, or critical. type must be one of: PPE Missing, Unsafe Condition, Equipment Hazard, Environmental.
Return ONLY valid JSON. If not a construction/work site, still analyze for any safety concerns.`,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") return NextResponse.json({ error: "Unexpected response" }, { status: 500 });

  try {
    const text = content.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch {
    return NextResponse.json({ error: "Failed to parse analysis" }, { status: 500 });
  }
}
