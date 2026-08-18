"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { landingPageSchema } from "./schema";

export type ActionResult = { success: boolean; error?: string; id?: string };

function emptyToNull(value: string | null | undefined) {
  return value ? value : null;
}

export async function createLandingPage(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = landingPageSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const { productId, ...rest } = parsed.data;
  const lp = await prisma.landingPage.create({ data: { ...rest, productId: emptyToNull(productId) } });
  revalidatePath("/landing-pages");
  return { success: true, id: lp.id };
}

export async function updateLandingPage(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = landingPageSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const { productId, ...rest } = parsed.data;
  await prisma.landingPage.update({ where: { id }, data: { ...rest, productId: emptyToNull(productId) } });
  revalidatePath("/landing-pages");
  return { success: true, id };
}

export async function deleteLandingPage(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.campaign.count({ where: { landingPageId: id } });
  if (count > 0) return { success: false, error: "Esta landing page possui campanhas vinculadas e não pode ser removida." };
  await prisma.landingPage.delete({ where: { id } });
  revalidatePath("/landing-pages");
  return { success: true };
}
