import { z } from "zod";
import { CREATIVE_TYPES, CREATIVE_STATUSES } from "@/types/enums";

export const creativeSchema = z.object({
  name: z.string().min(2, "Informe o nome do criativo"),
  type: z.enum(CREATIVE_TYPES),
  format: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  status: z.enum(CREATIVE_STATUSES),
  driveUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreativeFormValues = z.infer<typeof creativeSchema>;
