import { z } from "zod";
import { LANDING_PAGE_STATUSES } from "@/types/enums";

export const landingPageSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  url: z.string().min(3, "Informe a URL"),
  productId: z.string().optional().nullable(),
  status: z.enum(LANDING_PAGE_STATUSES),
  notes: z.string().optional().nullable(),
});

export type LandingPageFormValues = z.infer<typeof landingPageSchema>;
