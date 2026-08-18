import { z } from "zod";
import { PLATFORMS, OBJECTIVES, CAMPAIGN_STATUSES, DESTINATION_CHANNELS } from "@/types/enums";

export const campaignSchema = z
  .object({
    name: z.string().min(2, "Informe o nome da campanha"),
    productId: z.string().optional().nullable(),
    platform: z.enum(PLATFORMS),
    objective: z.enum(OBJECTIVES),
    status: z.enum(CAMPAIGN_STATUSES),
    startDate: z.string().min(1, "Informe a data inicial"),
    endDate: z.string().min(1, "Informe a data final"),
    plannedBudget: z.number().min(0),
    actualSpend: z.number().min(0),
    attendantId: z.string().optional().nullable(),
    backupAttendantId: z.string().optional().nullable(),
    landingPageId: z.string().optional().nullable(),
    offerId: z.string().optional().nullable(),
    destinationChannel: z.enum(DESTINATION_CHANNELS).optional().nullable(),
    notes: z.string().optional().nullable(),
    audienceIds: z.array(z.string()),
    creativeIds: z.array(z.string()),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "A data final deve ser igual ou posterior à inicial",
    path: ["endDate"],
  })
  .refine((data) => data.objective !== "vendas" || !!data.attendantId, {
    message: "Campanhas de vendas exigem um atendente responsável",
    path: ["attendantId"],
  });

export type CampaignFormValues = z.infer<typeof campaignSchema>;
