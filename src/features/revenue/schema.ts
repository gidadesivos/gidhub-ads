import { z } from "zod";
import { CUSTOMER_TYPES, REVENUE_SOURCES } from "@/types/enums";

export const revenueEntrySchema = z.object({
  attendantId: z.string().min(1, "Selecione um atendente"),
  date: z.string().min(1, "Selecione a data"),
  hour: z.number().int().min(0).max(23),
  amount: z.number().min(0, "Informe um valor válido"),
  leadsCount: z.number().int().min(1),
  salesCount: z.number().int().min(0),
  customerType: z.enum(CUSTOMER_TYPES),
  source: z.enum(REVENUE_SOURCES),
  campaignId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RevenueEntryFormValues = z.infer<typeof revenueEntrySchema>;
