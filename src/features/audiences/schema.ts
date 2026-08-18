import { z } from "zod";
import { PLATFORMS, AUDIENCE_TYPES } from "@/types/enums";

export const audienceSchema = z.object({
  name: z.string().min(2, "Informe o nome do público"),
  platform: z.enum(PLATFORMS),
  type: z.enum(AUDIENCE_TYPES),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  ageRange: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
  segmentation: z.string().optional().nullable(),
  exclusions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type AudienceFormValues = z.infer<typeof audienceSchema>;
