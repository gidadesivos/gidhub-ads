"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { creativeSchema } from "./schema";

export type ActionResult = { success: boolean; error?: string; id?: string };

function emptyToNull(value: string | null | undefined) {
  return value ? value : null;
}

export async function createCreative(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = creativeSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const { productId, ...rest } = parsed.data;
  const creative = await prisma.creative.create({ data: { ...rest, productId: emptyToNull(productId) } });
  revalidatePath("/criativos");
  revalidatePath("/");
  return { success: true, id: creative.id };
}

export async function updateCreative(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = creativeSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const { productId, ...rest } = parsed.data;
  await prisma.creative.update({ where: { id }, data: { ...rest, productId: emptyToNull(productId) } });
  revalidatePath("/criativos");
  revalidatePath("/");
  return { success: true, id };
}

export async function deleteCreative(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.campaignCreative.count({ where: { creativeId: id } });
  if (count > 0) return { success: false, error: "Este criativo está vinculado a campanhas e não pode ser removido." };
  await prisma.creative.delete({ where: { id } });
  revalidatePath("/criativos");
  return { success: true };
}
