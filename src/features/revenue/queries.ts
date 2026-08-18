import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { newLeadRevenue, newLeadSales, conversionRate, averageTicket, roas as calcRoas, goalProgress } from "@/lib/metrics";
import { resolvePeriod } from "@/lib/date-range";

export async function getDailyRevenueBoard(dateISO?: string) {
  const date = dateISO ? new Date(`${dateISO}T00:00:00`) : new Date();
  const range = { from: startOfDay(date), to: endOfDay(date) };

  const [entries, attendants] = await Promise.all([
    prisma.revenueEntry.findMany({
      where: { date: { gte: range.from, lte: range.to } },
      include: { attendant: true, campaign: true, product: true },
    }),
    prisma.attendant.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
      include: { dailyGoals: { where: { date: { gte: range.from, lte: range.to } } } },
    }),
  ]);

  const newLeadEntries = entries.filter((e) => e.customerType === "new_lead");
  const revenue = newLeadRevenue(entries);
  const sales = newLeadSales(entries);
  const leads = newLeadEntries.reduce((sum, e) => sum + e.leadsCount, 0);
  const totalGoal = attendants.reduce((sum, a) => sum + (a.dailyGoals[0]?.amount ?? a.dailyGoal), 0);

  const matrix = attendants.map((a) => {
    const goal = a.dailyGoals[0]?.amount ?? a.dailyGoal;
    const cells = Array.from({ length: 24 }).map((_, hour) => {
      const hourEntries = newLeadEntries.filter((e) => e.attendantId === a.id && e.hour === hour);
      return {
        hour,
        amount: hourEntries.reduce((sum, e) => sum + e.amount, 0),
        entries: hourEntries.map((e) => ({
          id: e.id,
          amount: e.amount,
          campaignName: e.campaign?.name,
          campaignId: e.campaignId,
          productId: e.productId,
          leadsCount: e.leadsCount,
          salesCount: e.salesCount,
          customerType: e.customerType,
          source: e.source,
          notes: e.notes,
        })),
      };
    });
    const total = cells.reduce((sum, c) => sum + c.amount, 0);
    return { attendantId: a.id, attendantName: a.name, initials: a.initials, goal, total, cells };
  });

  return {
    date,
    entries,
    metrics: {
      goal: totalGoal,
      revenue,
      progress: goalProgress(revenue, totalGoal),
      leads,
      sales,
      conversion: conversionRate(sales, leads),
      averageTicket: averageTicket(revenue, sales),
    },
    matrix,
  };
}

export async function getRevenueByAttendant(period?: string, from?: string, to?: string) {
  const range = resolvePeriod(period, from, to);
  const [entries, attendants] = await Promise.all([
    prisma.revenueEntry.findMany({ where: { date: { gte: range.from, lte: range.to } } }),
    prisma.attendant.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows = attendants.map((a) => {
    const attendantEntries = entries.filter((e) => e.attendantId === a.id);
    const revenue = newLeadRevenue(attendantEntries);
    const sales = newLeadSales(attendantEntries);
    const leads = attendantEntries.filter((e) => e.customerType === "new_lead").reduce((sum, e) => sum + e.leadsCount, 0);
    return {
      id: a.id,
      name: a.name,
      initials: a.initials,
      revenue,
      sales,
      leads,
      conversion: conversionRate(sales, leads),
      averageTicket: averageTicket(revenue, sales),
    };
  });

  return { range, rows: rows.sort((a, b) => b.revenue - a.revenue) };
}

export async function getRevenueByCampaign(period?: string, from?: string, to?: string) {
  const range = resolvePeriod(period, from, to);
  const entries = await prisma.revenueEntry.findMany({
    where: { date: { gte: range.from, lte: range.to }, campaignId: { not: null } },
    include: { campaign: true },
  });

  const map = new Map<string, { id: string; name: string; platform: string; spend: number; revenue: number; sales: number; leads: number }>();
  for (const e of entries) {
    if (!e.campaign) continue;
    const current = map.get(e.campaign.id) ?? {
      id: e.campaign.id,
      name: e.campaign.name,
      platform: e.campaign.platform,
      spend: e.campaign.actualSpend,
      revenue: 0,
      sales: 0,
      leads: 0,
    };
    if (e.customerType === "new_lead") {
      current.revenue += e.amount;
      current.sales += e.salesCount;
      current.leads += e.leadsCount;
    }
    map.set(e.campaign.id, current);
  }

  const rows = Array.from(map.values())
    .map((c) => ({ ...c, roas: calcRoas(c.revenue, c.spend), conversion: conversionRate(c.sales, c.leads) }))
    .sort((a, b) => b.revenue - a.revenue);

  return { range, rows };
}

export async function getRevenueByPlatform(period?: string, from?: string, to?: string) {
  const range = resolvePeriod(period, from, to);
  const [entries, campaigns] = await Promise.all([
    prisma.revenueEntry.findMany({
      where: { date: { gte: range.from, lte: range.to }, campaignId: { not: null } },
      include: { campaign: true },
    }),
    prisma.campaign.findMany({ select: { platform: true, actualSpend: true, status: true } }),
  ]);

  const platforms = ["meta", "google"] as const;
  const rows = platforms.map((platform) => {
    const platformEntries = entries.filter((e) => e.campaign?.platform === platform && e.customerType === "new_lead");
    const revenue = platformEntries.reduce((sum, e) => sum + e.amount, 0);
    const sales = platformEntries.reduce((sum, e) => sum + e.salesCount, 0);
    const leads = platformEntries.reduce((sum, e) => sum + e.leadsCount, 0);
    const platformCampaigns = campaigns.filter((c) => c.platform === platform);
    const spend = platformCampaigns.reduce((sum, c) => sum + c.actualSpend, 0);
    const activeCampaigns = platformCampaigns.filter((c) => c.status === "rodando").length;
    return { platform, revenue, sales, leads, spend, activeCampaigns, roas: calcRoas(revenue, spend), conversion: conversionRate(sales, leads) };
  });

  return { range, rows };
}

export async function getMonthlyRevenue(monthISO?: string) {
  const base = monthISO ? new Date(`${monthISO}-01T00:00:00`) : new Date();
  const from = new Date(base.getFullYear(), base.getMonth(), 1);
  const to = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59);

  const [entries, attendants] = await Promise.all([
    prisma.revenueEntry.findMany({ where: { date: { gte: from, lte: to } } }),
    prisma.attendant.findMany({
      orderBy: { name: "asc" },
      include: {
        monthlyGoals: { where: { yearMonth: `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}` } },
      },
    }),
  ]);

  const newLeadEntries = entries.filter((e) => e.customerType === "new_lead");
  const daysInMonth = to.getDate();
  const dailySeries = Array.from({ length: daysInMonth }).map((_, i) => {
    const day = i + 1;
    const dayEntries = newLeadEntries.filter((e) => e.date.getDate() === day);
    return { day, value: dayEntries.reduce((sum, e) => sum + e.amount, 0) };
  });

  const attendantRows = attendants.map((a) => {
    const attendantEntries = newLeadEntries.filter((e) => e.attendantId === a.id);
    const revenue = attendantEntries.reduce((sum, e) => sum + e.amount, 0);
    const goal = a.monthlyGoals[0]?.amount ?? a.monthlyGoal;
    return { id: a.id, name: a.name, initials: a.initials, revenue, goal, progress: goalProgress(revenue, goal) };
  });

  return {
    month: base,
    revenue: newLeadRevenue(entries),
    sales: newLeadSales(entries),
    dailySeries,
    attendantRows: attendantRows.sort((a, b) => b.revenue - a.revenue),
  };
}
