"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/auth";
import { campaignSchema } from "./schema";
import { CAMPAIGN_STATUSES, type CampaignStatus } from "@/types/enums";

export type ActionResult = { success: boolean; error?: string; id?: string };

function emptyToNull(value: string | null | undefined) {
  return value ? value : null;
}

function revalidateCampaignPaths(id?: string) {
  revalidatePath("/campanhas");
  revalidatePath("/");
  revalidatePath("/planejamento/calendario");
  revalidatePath("/planejamento/roadmap");
  revalidatePath("/planejamento/mapa-estrategia");
  revalidatePath("/kanban");
  revalidatePath("/kanban/comercial");
  revalidatePath("/relatorios");
  if (id) revalidatePath(`/campanhas/${id}`);
}

export async function getCampaignFormOptions() {
  await requireSession();
  const [products, attendants, audiences, creatives, landingPages, offers] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.attendant.findMany({ where: { status: "active" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.audience.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, platform: true, type: true } }),
    prisma.creative.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, type: true, status: true } }),
    prisma.landingPage.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.offer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, productId: true } }),
  ]);
  return { products, attendants, audiences, creatives, landingPages, offers };
}

export async function createCampaign(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = campaignSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const { audienceIds, creativeIds, startDate, endDate, productId, attendantId, backupAttendantId, landingPageId, offerId, ...rest } =
    parsed.data;

  const campaign = await prisma.campaign.create({
    data: {
      ...rest,
      productId: emptyToNull(productId),
      attendantId: emptyToNull(attendantId),
      backupAttendantId: emptyToNull(backupAttendantId),
      landingPageId: emptyToNull(landingPageId),
      offerId: emptyToNull(offerId),
      startDate: new Date(`${startDate}T00:00:00`),
      endDate: new Date(`${endDate}T00:00:00`),
      audiences: { create: audienceIds.map((audienceId) => ({ audienceId })) },
      creatives: { create: creativeIds.map((creativeId) => ({ creativeId })) },
    },
  });

  revalidateCampaignPaths(campaign.id);
  return { success: true, id: campaign.id };
}

export async function updateCampaign(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = campaignSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const { audienceIds, creativeIds, startDate, endDate, productId, attendantId, backupAttendantId, landingPageId, offerId, ...rest } =
    parsed.data;

  await prisma.$transaction([
    prisma.campaign.update({
      where: { id },
      data: {
        ...rest,
        productId: emptyToNull(productId),
        attendantId: emptyToNull(attendantId),
        backupAttendantId: emptyToNull(backupAttendantId),
        landingPageId: emptyToNull(landingPageId),
        offerId: emptyToNull(offerId),
        startDate: new Date(`${startDate}T00:00:00`),
        endDate: new Date(`${endDate}T00:00:00`),
      },
    }),
    prisma.campaignAudience.deleteMany({ where: { campaignId: id } }),
    prisma.campaignCreative.deleteMany({ where: { campaignId: id } }),
    ...audienceIds.map((audienceId) => prisma.campaignAudience.create({ data: { campaignId: id, audienceId } })),
    ...creativeIds.map((creativeId) => prisma.campaignCreative.create({ data: { campaignId: id, creativeId } })),
  ]);

  revalidateCampaignPaths(id);
  return { success: true, id };
}

export async function updateCampaignStatus(id: string, status: string): Promise<ActionResult> {
  await requireSession();
  if (!CAMPAIGN_STATUSES.includes(status as CampaignStatus)) {
    return { success: false, error: "Status inválido" };
  }
  await prisma.campaign.update({ where: { id }, data: { status } });
  revalidateCampaignPaths(id);
  return { success: true, id };
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  await requireAdmin();
  const revenueCount = await prisma.revenueEntry.count({ where: { campaignId: id } });
  if (revenueCount > 0) {
    return { success: false, error: "Esta campanha possui lançamentos de faturamento e não pode ser removida." };
  }
  await prisma.campaign.delete({ where: { id } });
  revalidateCampaignPaths();
  return { success: true };
}
