"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audienceSchema } from "./schema";

export type ActionResult = { success: boolean; error?: string; id?: string };

export async function createAudience(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = audienceSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const audience = await prisma.audience.create({ data: parsed.data });
  revalidatePath("/publicos");
  return { success: true, id: audience.id };
}

export async function updateAudience(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = audienceSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  await prisma.audience.update({ where: { id }, data: parsed.data });
  revalidatePath("/publicos");
  return { success: true, id };
}

export async function deleteAudience(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.campaignAudience.count({ where: { audienceId: id } });
  if (count > 0) return { success: false, error: "Este público está vinculado a campanhas e não pode ser removido." };
  await prisma.audience.delete({ where: { id } });
  revalidatePath("/publicos");
  return { success: true };
}
