import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { newLeadRevenue, newLeadSales, conversionRate, roas as calcRoas, averageTicket } from "@/lib/metrics";

export type CampaignFilters = {
  platform?: string;
  status?: string;
  attendantId?: string;
  productId?: string;
  q?: string;
};

export async function listCampaigns(filters: CampaignFilters) {
  const where: Prisma.CampaignWhereInput = {};
  if (filters.platform) where.platform = filters.platform;
  if (filters.status) where.status = filters.status;
  if (filters.attendantId) where.attendantId = filters.attendantId;
  if (filters.productId) where.productId = filters.productId;
  if (filters.q) where.name = { contains: filters.q };

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      product: true,
      attendant: true,
      creatives: { include: { creative: true } },
      audiences: { include: { audience: true } },
    },
    orderBy: { startDate: "desc" },
  });
  return campaigns;
}

export async function getCampaignDetail(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      product: true,
      attendant: true,
      backupAttendant: true,
      landingPage: true,
      offer: true,
      audiences: { include: { audience: true } },
      creatives: { include: { creative: true } },
    },
  });
  if (!campaign) return null;

  const revenueEntries = await prisma.revenueEntry.findMany({
    where: { campaignId: id },
    orderBy: [{ date: "desc" }, { hour: "desc" }],
  });

  const revenue = newLeadRevenue(revenueEntries);
  const sales = newLeadSales(revenueEntries);
  const leads = revenueEntries.filter((e) => e.customerType === "new_lead").reduce((sum, e) => sum + e.leadsCount, 0);

  return {
    campaign,
    revenueEntries,
    stats: {
      leads,
      sales,
      revenue,
      conversion: conversionRate(sales, leads),
      averageTicket: averageTicket(revenue, sales),
      roas: calcRoas(revenue, campaign.actualSpend),
    },
  };
}
