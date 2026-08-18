import "server-only";
import { prisma } from "@/lib/prisma";
import { resolvePeriod } from "@/lib/date-range";
import { newLeadRevenue, newLeadSales, roas as calcRoas, conversionRate, goalProgress } from "@/lib/metrics";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export async function getDashboardData(period: string | undefined, from?: string, to?: string) {
  const range = resolvePeriod(period, from, to);
  const today = { from: startOfDay(new Date()), to: endOfDay(new Date()) };
  const monthRange = { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };

  const [
    periodEntries,
    todayEntries,
    plannedCount,
    runningCount,
    creativesNeeded,
    creativesReady,
    monthCampaigns,
    runningCampaigns,
    upcomingCampaigns,
    pendingCreatives,
    attendants,
  ] = await Promise.all([
    prisma.revenueEntry.findMany({ where: { date: { gte: range.from, lte: range.to } } }),
    prisma.revenueEntry.findMany({
      where: { date: { gte: today.from, lte: today.to } },
      include: { attendant: true, campaign: true },
    }),
    prisma.campaign.count({ where: { status: "planejamento" } }),
    prisma.campaign.count({ where: { status: "rodando" } }),
    prisma.creative.count({ where: { status: { in: ["idea", "production", "review"] } } }),
    prisma.creative.count({ where: { status: "approved" } }),
    prisma.campaign.findMany({
      where: { startDate: { lte: monthRange.to }, endDate: { gte: monthRange.from } },
      select: { plannedBudget: true, actualSpend: true },
    }),
    prisma.campaign.findMany({
      where: { status: "rodando" },
      include: {
        product: true,
        attendant: true,
        creatives: { include: { creative: true } },
        audiences: { include: { audience: true } },
      },
      orderBy: { endDate: "asc" },
      take: 6,
    }),
    prisma.campaign.findMany({
      where: { status: { in: ["planejamento", "producao_criativos", "aguardando_aprovacao", "pronta"] }, startDate: { gte: new Date() } },
      include: { product: true, attendant: true },
      orderBy: { startDate: "asc" },
      take: 6,
    }),
    prisma.creative.findMany({
      where: { status: { in: ["idea", "production", "review"] } },
      include: { product: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.attendant.findMany({
      where: { status: "active" },
      include: {
        campaigns: { where: { status: "rodando" } },
        backupCampaigns: { where: { status: "rodando" } },
        dailyGoals: { where: { date: { gte: today.from, lte: today.to } } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const investmentPlanned = monthCampaigns.reduce((sum, c) => sum + c.plannedBudget, 0);
  const totalSpend = monthCampaigns.reduce((sum, c) => sum + c.actualSpend, 0);

  const revenue = newLeadRevenue(periodEntries);
  const sales = newLeadSales(periodEntries);
  const leads = periodEntries.filter((e) => e.customerType === "new_lead").reduce((sum, e) => sum + e.leadsCount, 0);
  const conversion = conversionRate(sales, leads);
  const generalRoas = calcRoas(revenue, totalSpend);

  const attendantCards = attendants.map((a) => {
    const entries = todayEntries.filter((e) => e.attendantId === a.id);
    const newLeadEntries = entries.filter((e) => e.customerType === "new_lead");
    const revenueToday = newLeadEntries.reduce((sum, e) => sum + e.amount, 0);
    const salesToday = newLeadEntries.reduce((sum, e) => sum + e.salesCount, 0);
    const leadsToday = newLeadEntries.reduce((sum, e) => sum + e.leadsCount, 0);
    const goal = a.dailyGoals[0]?.amount ?? a.dailyGoal;
    const metaCount = a.campaigns.filter((c) => c.platform === "meta").length + a.backupCampaigns.filter((c) => c.platform === "meta").length;
    const googleCount = a.campaigns.filter((c) => c.platform === "google").length + a.backupCampaigns.filter((c) => c.platform === "google").length;
    return {
      id: a.id,
      name: a.name,
      initials: a.initials,
      avatarUrl: a.avatarUrl,
      revenueToday,
      salesToday,
      leadsToday,
      conversion: conversionRate(salesToday, leadsToday),
      goal,
      progress: goalProgress(revenueToday, goal),
      activeCampaigns: a.campaigns.length + a.backupCampaigns.length,
      metaCount,
      googleCount,
    };
  });

  const hourlyChart = Array.from({ length: 24 }).map((_, hour) => {
    const value = todayEntries
      .filter((e) => e.hour === hour && e.customerType === "new_lead")
      .reduce((sum, e) => sum + e.amount, 0);
    return { hour, value };
  });

  return {
    range,
    metrics: {
      investmentPlanned,
      plannedCount,
      runningCount,
      creativesNeeded,
      creativesReady,
      leads,
      sales,
      revenue,
      conversion,
      roas: generalRoas,
    },
    attendantCards,
    hourlyChart,
    runningCampaigns,
    upcomingCampaigns,
    pendingCreatives,
  };
}
