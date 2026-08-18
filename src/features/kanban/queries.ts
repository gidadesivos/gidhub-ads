import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { newLeadRevenue, newLeadSales } from "@/lib/metrics";

export async function getCommercialKanbanData() {
  const from = startOfMonth(new Date());
  const to = endOfMonth(new Date());

  const [runningCampaigns, entries] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: "rodando" },
      include: { product: true, attendant: true },
      orderBy: { startDate: "asc" },
    }),
    prisma.revenueEntry.findMany({
      where: { date: { gte: from, lte: to } },
      include: { attendant: true, campaign: true },
    }),
  ]);

  const newLeadEntries = entries.filter((e) => e.customerType === "new_lead");
  const totalLeads = newLeadEntries.reduce((sum, e) => sum + e.leadsCount, 0);
  const totalSales = newLeadSales(entries);
  const totalRevenue = newLeadRevenue(entries);
  const openOpportunities = Math.max(0, totalLeads - totalSales);

  const leadsByCampaign = new Map<string, { name: string; leads: number }>();
  for (const e of newLeadEntries) {
    if (!e.campaign) continue;
    const current = leadsByCampaign.get(e.campaign.id) ?? { name: e.campaign.name, leads: 0 };
    current.leads += e.leadsCount;
    leadsByCampaign.set(e.campaign.id, current);
  }

  const attendantActivity = new Map<string, { name: string; leads: number; sales: number }>();
  for (const e of newLeadEntries) {
    const current = attendantActivity.get(e.attendantId) ?? { name: e.attendant.name, leads: 0, sales: 0 };
    current.leads += e.leadsCount;
    current.sales += e.salesCount;
    attendantActivity.set(e.attendantId, current);
  }

  const budgetRemaining = runningCampaigns.map((c) => ({
    id: c.id,
    name: c.name,
    remaining: Math.max(0, c.plannedBudget - c.actualSpend),
  }));

  return {
    campanhaAtiva: runningCampaigns.map((c) => ({ id: c.id, name: c.name, product: c.product?.name, attendant: c.attendant?.name })),
    leadsChegando: { total: totalLeads, byCampaign: Array.from(leadsByCampaign.values()).sort((a, b) => b.leads - a.leads).slice(0, 6) },
    atendimento: Array.from(attendantActivity.values()).sort((a, b) => b.leads - a.leads),
    orcamento: budgetRemaining.sort((a, b) => b.remaining - a.remaining),
    negociacao: openOpportunities,
    venda: { totalSales, totalRevenue },
  };
}
