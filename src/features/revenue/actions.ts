"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revenueEntrySchema } from "./schema";

export type ActionResult = { success: boolean; error?: string };

export async function getRevenueFormOptions() {
  await requireSession();
  const [attendants, campaigns, products] = await Promise.all([
    prisma.attendant.findMany({ where: { status: "active" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, platform: true },
      take: 200,
    }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { attendants, campaigns, products };
}

export async function createRevenueEntry(raw: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = revenueEntrySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  if (session.role === "ATTENDANT" && session.attendantId && session.attendantId !== data.attendantId) {
    return { success: false, error: "Você só pode lançar faturamento para si mesmo." };
  }

  await prisma.revenueEntry.create({
    data: {
      attendantId: data.attendantId,
      date: new Date(`${data.date}T00:00:00`),
      hour: data.hour,
      amount: data.amount,
      leadsCount: data.leadsCount,
      salesCount: data.salesCount,
      customerType: data.customerType,
      source: data.source,
      campaignId: data.campaignId || null,
      productId: data.productId || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/faturamento");
  revalidatePath("/faturamento/hoje");
  revalidatePath("/faturamento/por-hora");
  revalidatePath("/faturamento/por-atendente");
  revalidatePath("/faturamento/por-campanha");
  revalidatePath("/faturamento/por-plataforma");
  revalidatePath("/faturamento/mensal");
  revalidatePath("/atendentes");
  revalidatePath("/relatorios");
  return { success: true };
}

export async function updateRevenueEntry(id: string, raw: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = revenueEntrySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  if (session.role === "ATTENDANT" && session.attendantId && session.attendantId !== data.attendantId) {
    return { success: false, error: "Você só pode editar lançamentos próprios." };
  }

  await prisma.revenueEntry.update({
    where: { id },
    data: {
      attendantId: data.attendantId,
      date: new Date(`${data.date}T00:00:00`),
      hour: data.hour,
      amount: data.amount,
      leadsCount: data.leadsCount,
      salesCount: data.salesCount,
      customerType: data.customerType,
      source: data.source,
      campaignId: data.campaignId || null,
      productId: data.productId || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/faturamento");
  revalidatePath("/atendentes");
  revalidatePath("/relatorios");
  return { success: true };
}

export async function deleteRevenueEntry(id: string): Promise<ActionResult> {
  await requireSession();
  await prisma.revenueEntry.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/faturamento");
  revalidatePath("/atendentes");
  return { success: true };
}
