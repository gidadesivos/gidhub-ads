import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { newLeadRevenue, newLeadSales, conversionRate, capacityLevel, goalProgress } from "@/lib/metrics";

export async function listAttendantsWithStats() {
  const monthRange = { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const todayRange = { from: startOfDay(new Date()), to: endOfDay(new Date()) };

  const attendants = await prisma.attendant.findMany({
    orderBy: { name: "asc" },
    include: {
      campaigns: true,
      backupCampaigns: true,
      revenueEntries: { where: { date: { gte: monthRange.from, lte: monthRange.to } } },
      monthlyGoals: { where: { yearMonth: `${monthRange.from.getFullYear()}-${String(monthRange.from.getMonth() + 1).padStart(2, "0")}` } },
      dailyGoals: { where: { date: { gte: todayRange.from, lte: todayRange.to } } },
    },
  });

  return attendants.map((a) => {
    const monthEntries = a.revenueEntries;
    const newLeadEntries = monthEntries.filter((e) => e.customerType === "new_lead");
    const leadsThisMonth = newLeadEntries.reduce((sum, e) => sum + e.leadsCount, 0);
    const revenueThisMonth = newLeadRevenue(monthEntries);
    const salesThisMonth = newLeadSales(monthEntries);
    const monthlyGoal = a.monthlyGoals[0]?.amount ?? a.monthlyGoal;
    const dailyGoal = a.dailyGoals[0]?.amount ?? a.dailyGoal;
    const activeCampaigns = a.campaigns.filter((c) => c.status === "rodando").length + a.backupCampaigns.filter((c) => c.status === "rodando").length;

    return {
      id: a.id,
      name: a.name,
      initials: a.initials,
      avatarUrl: a.avatarUrl,
      status: a.status,
      dailyGoal,
      monthlyGoal,
      leadCapacity: a.leadCapacity,
      leadsThisMonth,
      revenueThisMonth,
      salesThisMonth,
      conversion: conversionRate(salesThisMonth, leadsThisMonth),
      monthlyProgress: goalProgress(revenueThisMonth, monthlyGoal),
      capacity: capacityLevel(leadsThisMonth, a.leadCapacity),
      activeCampaigns,
    };
  });
}

export async function getAttendantDetail(id: string) {
  const monthRange = { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };

  const attendant = await prisma.attendant.findUnique({
    where: { id },
    include: {
      campaigns: { include: { product: true } },
      backupCampaigns: { include: { product: true } },
      revenueEntries: {
        orderBy: [{ date: "desc" }, { hour: "desc" }],
        include: { campaign: true, product: true },
        take: 500,
      },
    },
  });
  if (!attendant) return null;

  const monthEntries = attendant.revenueEntries.filter((e) => e.date >= monthRange.from && e.date <= monthRange.to);
  const revenueThisMonth = newLeadRevenue(monthEntries);
  const salesThisMonth = newLeadSales(monthEntries);
  const leadsThisMonth = monthEntries.filter((e) => e.customerType === "new_lead").reduce((sum, e) => sum + e.leadsCount, 0);

  const allCampaigns = [...attendant.campaigns, ...attendant.backupCampaigns];
  const spend = allCampaigns.reduce((sum, c) => sum + c.actualSpend, 0);

  const productTotals = new Map<string, { name: string; revenue: number; sales: number }>();
  for (const e of attendant.revenueEntries) {
    if (!e.product || e.customerType !== "new_lead") continue;
    const current = productTotals.get(e.product.id) ?? { name: e.product.name, revenue: 0, sales: 0 };
    current.revenue += e.amount;
    current.sales += e.salesCount;
    productTotals.set(e.product.id, current);
  }
  const topProducts = Array.from(productTotals.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  const dailySeries = new Map<string, number>();
  for (const e of attendant.revenueEntries) {
    if (e.customerType !== "new_lead") continue;
    const key = e.date.toISOString().slice(0, 10);
    dailySeries.set(key, (dailySeries.get(key) ?? 0) + e.amount);
  }
  const dailyChart = Array.from(dailySeries.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, value]) => ({ date, value }));

  const hourlySeries = Array.from({ length: 24 }).map((_, hour) => ({
    hour,
    value: monthEntries.filter((e) => e.hour === hour && e.customerType === "new_lead").reduce((sum, e) => sum + e.amount, 0),
  }));

  return {
    attendant,
    stats: {
      activeCampaigns: allCampaigns.filter((c) => c.status === "rodando").length,
      spend,
      leadsThisMonth,
      salesThisMonth,
      revenueThisMonth,
      conversion: conversionRate(salesThisMonth, leadsThisMonth),
      averageTicket: salesThisMonth ? revenueThisMonth / salesThisMonth : 0,
      roas: spend ? revenueThisMonth / spend : 0,
      dailyGoalProgress: goalProgress(
        attendant.revenueEntries
          .filter((e) => e.customerType === "new_lead" && e.date.toDateString() === new Date().toDateString())
          .reduce((sum, e) => sum + e.amount, 0),
        attendant.dailyGoal
      ),
      monthlyGoalProgress: goalProgress(revenueThisMonth, attendant.monthlyGoal),
    },
    campaigns: allCampaigns,
    topProducts,
    dailyChart,
    hourlySeries,
    recentEntries: attendant.revenueEntries.slice(0, 40),
  };
}
