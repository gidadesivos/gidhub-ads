import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { resolvePeriod } from "@/lib/date-range";
import { newLeadRevenue, newLeadSales, conversionRate, averageTicket, roas as calcRoas } from "@/lib/metrics";

export type ReportFilters = {
  period?: string;
  from?: string;
  to?: string;
  attendantId?: string;
  campaignId?: string;
  productId?: string;
  platform?: string;
  source?: string;
};

export async function getReportFormOptions() {
  const [attendants, campaigns, products] = await Promise.all([
    prisma.attendant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.campaign.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { attendants, campaigns, products };
}

export async function getReportData(filters: ReportFilters) {
  const range = resolvePeriod(filters.period, filters.from, filters.to);

  const where: Prisma.RevenueEntryWhereInput = {
    date: { gte: range.from, lte: range.to },
    customerType: "new_lead",
  };
  if (filters.attendantId) where.attendantId = filters.attendantId;
  if (filters.campaignId) where.campaignId = filters.campaignId;
  if (filters.productId) where.productId = filters.productId;
  if (filters.source) where.source = filters.source;
  if (filters.platform) where.campaign = { platform: filters.platform };

  const entries = await prisma.revenueEntry.findMany({
    where,
    include: { attendant: true, campaign: true, product: true },
  });

  const campaignWhere: Prisma.CampaignWhereInput = {};
  if (filters.platform) campaignWhere.platform = filters.platform;
  if (filters.campaignId) campaignWhere.id = filters.campaignId;
  const campaignsInScope = await prisma.campaign.findMany({ where: campaignWhere, select: { id: true, actualSpend: true, platform: true } });
  const investment = campaignsInScope.reduce((sum, c) => sum + c.actualSpend, 0);

  const revenue = newLeadRevenue(entries);
  const sales = newLeadSales(entries);
  const leads = entries.reduce((sum, e) => sum + e.leadsCount, 0);

  const byDay = new Map<string, number>();
  for (const e of entries) {
    const key = e.date.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + e.amount);
  }

  const byAttendant = new Map<string, number>();
  for (const e of entries) byAttendant.set(e.attendant.name, (byAttendant.get(e.attendant.name) ?? 0) + e.amount);

  const byProduct = new Map<string, number>();
  for (const e of entries) {
    if (!e.product) continue;
    byProduct.set(e.product.name, (byProduct.get(e.product.name) ?? 0) + e.amount);
  }

  const platformStats = new Map<string, { revenue: number; leads: number; spend: number }>();
  for (const platform of ["meta", "google"]) {
    const platformEntries = entries.filter((e) => e.campaign?.platform === platform);
    platformStats.set(platform, {
      revenue: platformEntries.reduce((sum, e) => sum + e.amount, 0),
      leads: platformEntries.reduce((sum, e) => sum + e.leadsCount, 0),
      spend: campaignsInScope.filter((c) => c.platform === platform).reduce((sum, c) => sum + c.actualSpend, 0),
    });
  }

  const campaignStats = new Map<string, { name: string; revenue: number; spend: number }>();
  for (const e of entries) {
    if (!e.campaign) continue;
    const current = campaignStats.get(e.campaign.id) ?? { name: e.campaign.name, revenue: 0, spend: e.campaign.actualSpend };
    current.revenue += e.amount;
    campaignStats.set(e.campaign.id, current);
  }

  return {
    range,
    summary: {
      investment,
      leads,
      sales,
      conversion: conversionRate(sales, leads),
      revenue,
      averageTicket: averageTicket(revenue, sales),
      roas: calcRoas(revenue, investment),
    },
    byDay: Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, value]) => ({ date, value })),
    byAttendant: Array.from(byAttendant.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    byProduct: Array.from(byProduct.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    byPlatform: Array.from(platformStats.entries()).map(([platform, s]) => ({ platform, ...s })),
    byCampaign: Array.from(campaignStats.values())
      .map((c) => ({ ...c, roas: calcRoas(c.revenue, c.spend) }))
      .sort((a, b) => b.revenue - a.revenue),
  };
}
