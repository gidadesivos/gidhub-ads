"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { attendantSchema } from "./schema";
import { initialsFromName } from "./schema";

export type ActionResult = { success: boolean; error?: string; id?: string };

export async function createAttendant(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = attendantSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const attendant = await prisma.attendant.create({
    data: { ...parsed.data, initials: initialsFromName(parsed.data.name) },
  });
  revalidatePath("/atendentes");
  revalidatePath("/");
  return { success: true, id: attendant.id };
}

export async function updateAttendant(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = attendantSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  await prisma.attendant.update({
    where: { id },
    data: { ...parsed.data, initials: initialsFromName(parsed.data.name) },
  });
  revalidatePath("/atendentes");
  revalidatePath(`/atendentes/${id}`);
  revalidatePath("/");
  return { success: true, id };
}

export async function deleteAttendant(id: string): Promise<ActionResult> {
  await requireAdmin();
  const campaignCount = await prisma.campaign.count({
    where: { OR: [{ attendantId: id }, { backupAttendantId: id }] },
  });
  if (campaignCount > 0) {
    return { success: false, error: "Este atendente possui campanhas vinculadas e não pode ser removido." };
  }
  await prisma.attendant.delete({ where: { id } });
  revalidatePath("/atendentes");
  return { success: true };
}
