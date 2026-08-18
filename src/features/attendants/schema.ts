import { z } from "zod";
import { ATTENDANT_STATUSES } from "@/types/enums";

export const attendantSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  status: z.enum(ATTENDANT_STATUSES),
  dailyGoal: z.number().min(0),
  monthlyGoal: z.number().min(0),
  leadCapacity: z.number().int().min(1),
  avatarUrl: z.string().optional().nullable(),
});

export type AttendantFormValues = z.infer<typeof attendantSchema>;

export function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
