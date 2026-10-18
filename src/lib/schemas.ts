import { z } from "zod";
import { CATEGORIES, SEVERITIES } from "@/lib/types";

export const mediaTypeSchema = z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const analyzeInputSchema = z.object({
  images: z
    .array(
      z.object({
        mediaType: mediaTypeSchema,
        data: z
          .string()
          .min(32, "A photo was empty.")
          .max(6_000_000, "A photo is too large. Use a smaller JPEG, PNG, or WebP."),
      }),
    )
    .min(1, "Add at least one photo.")
    .max(6, "A walk can take up to 6 photos."),
});

export const findingOutputSchema = z.object({
  photoIndex: z.number().int().min(0).max(5),
  category: z.enum(CATEGORIES),
  severity: z.enum(SEVERITIES),
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(3).max(800),
  boundingDescription: z.string().trim().min(3).max(300),
  oshaCategory: z.string().trim().min(3).max(180),
  suggestedAction: z.string().trim().min(3).max(400),
});

export const analysisOutputSchema = z.object({
  summary: z.string().trim().min(3).max(600),
  findings: z.array(findingOutputSchema).max(8),
});

const actionDraftSchema = z.object({
  title: z.string().trim().min(3).max(240),
  assigneeId: z.string().min(1),
  dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a due date."),
});

export const walkPayloadSchema = z.object({
  siteId: z.string().min(1, "Choose a site."),
  walkedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the walk date."),
  conductedBy: z.string().trim().min(2, "Who walked the site?").max(80),
  weather: z.string().trim().min(2, "Note the weather.").max(80),
  crewCount: z.coerce.number().int().min(1).max(400),
  notes: z.string().trim().max(2000).default(""),
  summary: z.string().trim().min(3).max(600),
  sample: z.boolean().default(false),
  findings: z
    .array(
      z.object({
        photoIndex: z.number().int().min(0).max(5),
        category: z.enum(CATEGORIES),
        severity: z.enum(SEVERITIES),
        title: z.string().trim().min(3).max(140),
        description: z.string().trim().min(3).max(800),
        boundingDescription: z.string().trim().min(3).max(300),
        oshaCategory: z.string().trim().min(3).max(180),
        sample: z.boolean().default(false),
        action: actionDraftSchema.nullable(),
      }),
    )
    .max(8),
});

export const siteFormSchema = z.object({
  name: z.string().trim().min(2, "Name the site.").max(80),
  address: z.string().trim().min(3, "Add a street address.").max(120),
  city: z.string().trim().min(2, "Add a city.").max(60),
  region: z.string().trim().min(2, "Add a state.").max(40),
  phase: z.string().trim().min(2, "What phase is the job in?").max(80),
});

export const crewFormSchema = z.object({
  name: z.string().trim().min(2, "Name the person.").max(80),
  role: z.enum(["superintendent", "crew_lead", "safety"]),
  trade: z.string().trim().min(2, "Add a trade.").max(60),
  email: z.string().trim().email("Use a real email address.").max(120),
  phone: z.string().trim().min(7, "Add a phone number.").max(30),
  siteId: z.string().optional(),
});

export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the form and try again.";
}
