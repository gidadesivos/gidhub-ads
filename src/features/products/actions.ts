"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema, offerSchema } from "./schema";

export type ActionResult = { success: boolean; error?: string; id?: string };

export async function createProduct(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const product = await prisma.product.create({ data: parsed.data });
  revalidatePath("/produtos");
  return { success: true, id: product.id };
}

export async function updateProduct(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  await prisma.product.update({ where: { id }, data: parsed.data });
  revalidatePath("/produtos");
  return { success: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.campaign.count({ where: { productId: id } });
  if (count > 0) return { success: false, error: "Este produto possui campanhas vinculadas e não pode ser removido." };
  await prisma.product.delete({ where: { id } });
  revalidatePath("/produtos");
  return { success: true };
}

export async function createOffer(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = offerSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const offer = await prisma.offer.create({ data: parsed.data });
  revalidatePath("/produtos");
  return { success: true, id: offer.id };
}

export async function updateOffer(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = offerSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  await prisma.offer.update({ where: { id }, data: parsed.data });
  revalidatePath("/produtos");
  return { success: true, id };
}

export async function deleteOffer(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.campaign.count({ where: { offerId: id } });
  if (count > 0) return { success: false, error: "Esta oferta possui campanhas vinculadas e não pode ser removida." };
  await prisma.offer.delete({ where: { id } });
  revalidatePath("/produtos");
  return { success: true };
}
