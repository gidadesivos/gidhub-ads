import { notFound } from "next/navigation";
import Link from "next/link";
import { getAttendantDetail } from "@/features/attendants/queries";
import { deleteAttendant } from "@/features/attendants/actions";
import { PageHeader } from "@/components/shared/page-header";
import { AttendantFormModal } from "@/features/attendants/AttendantFormModal";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { MetricCard } from "@/components/shared/metric-card";
import { ProgressMetric } from "@/components/shared/progress-metric";
import { CampaignCard } from "@/components/shared/campaign-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyRevenueChart } from "@/components/shared/daily-revenue-chart";
import { RevenueHourlyChart } from "@/components/shared/revenue-hourly-chart";
import { CapacityBadge } from "@/components/shared/capacity-badge";
import { formatCurrency, formatDateTime, formatHour, formatMultiplier, formatNumber, formatPercent } from "@/lib/format";
import { capacityLevel } from "@/lib/metrics";
import { CUSTOMER_TYPE_LABELS, REVENUE_SOURCE_LABELS, ATTENDANT_STATUS_LABELS } from "@/types/enums";

export default async function AttendantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAttendantDetail(id);
  if (!data) notFound();

  const { attendant, stats, campaigns, topProducts, dailyChart, hourlySeries, recentEntries } = data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={attendant.name}
        description={`${ATTENDANT_STATUS_LABELS[attendant.status as keyof typeof ATTENDANT_STATUS_LABELS] ?? attendant.status} · Capacidade ${attendant.leadCapacity} leads/mês`}
        actions={
          <div className="flex items-center gap-2">
            <AttendantFormModal mode="edit" attendant={attendant} />
            <ConfirmDeleteButton
              title="Excluir atendente"
              description="Atendentes com campanhas vinculadas não podem ser excluídos."
              onConfirm={deleteAttendant.bind(null, id)}
              redirectTo="/atendentes"
            />
          </div>
        }
      />

      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">{attendant.initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap gap-2">
          <CapacityBadge level={capacityLevel(stats.leadsThisMonth, attendant.leadCapacity)} />
          <Badge variant="outline">{stats.activeCampaigns} campanhas ativas</Badge>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="Leads novos (mês)" value={formatNumber(stats.leadsThisMonth)} />
        <MetricCard label="Vendas (mês)" value={formatNumber(stats.salesThisMonth)} />
        <MetricCard label="Conversão" value={formatPercent(stats.conversion)} />
        <MetricCard label="Faturamento leads novos" value={formatCurrency(stats.revenueThisMonth)} accent="success" />
        <MetricCard label="Ticket médio" value={formatCurrency(stats.averageTicket)} />
        <MetricCard label="ROAS" value={formatMultiplier(stats.roas)} accent="success" />
        <MetricCard label="Investimento sob responsabilidade" value={formatCurrency(stats.spend)} />
        <MetricCard label="Meta diária" value={formatPercent(stats.dailyGoalProgress, 0)} hint="do dia" />
      </section>

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <p className="mb-2 text-sm font-medium">Meta diária</p>
              <ProgressMetric
                label="Progresso hoje"
                percent={stats.dailyGoalProgress}
                goalLabel={formatCurrency(attendant.dailyGoal)}
              />
            </Card>
            <Card className="p-4">
              <p className="mb-2 text-sm font-medium">Meta mensal</p>
              <ProgressMetric
                label="Progresso do mês"
                percent={stats.monthlyGoalProgress}
                currentLabel={formatCurrency(stats.revenueThisMonth)}
                goalLabel={formatCurrency(attendant.monthlyGoal)}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campanhas">
          {campaigns.length === 0 ? (
            <EmptyState title="Nenhuma campanha vinculada" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => (
                <CampaignCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  platform={c.platform}
                  objective={c.objective}
                  status={c.status}
                  startDate={c.startDate}
                  endDate={c.endDate}
                  plannedBudget={c.plannedBudget}
                  productName={c.product?.name}
                  attendantName={attendant.name}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faturamento">
          <div className="flex flex-col gap-4">
            <Card className="p-4">
              <p className="mb-2 text-sm font-medium">Faturamento diário (últimos 30 dias)</p>
              {dailyChart.length === 0 ? <EmptyState title="Sem lançamentos ainda" /> : <DailyRevenueChart data={dailyChart} />}
            </Card>
            <Card className="p-4">
              <p className="mb-2 text-sm font-medium">Faturamento por hora (mês atual)</p>
              <RevenueHourlyChart data={hourlySeries} />
            </Card>
            <Card className="p-0">
              <p className="p-4 pb-2 text-sm font-medium">Histórico de lançamentos</p>
              {recentEntries.length === 0 ? (
                <div className="p-4">
                  <EmptyState title="Nenhum lançamento" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-border text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Data</th>
                        <th className="px-4 py-2 font-medium">Hora</th>
                        <th className="px-4 py-2 font-medium">Campanha</th>
                        <th className="px-4 py-2 font-medium">Tipo</th>
                        <th className="px-4 py-2 font-medium">Origem</th>
                        <th className="px-4 py-2 text-right font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEntries.map((e) => (
                        <tr key={e.id} className="border-t border-border">
                          <td className="px-4 py-2">{formatDateTime(e.date).split(" ")[0]}</td>
                          <td className="px-4 py-2">{formatHour(e.hour)}</td>
                          <td className="px-4 py-2">
                            {e.campaign ? (
                              <Link href={`/campanhas/${e.campaign.id}`} className="text-primary hover:underline">
                                {e.campaign.name}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <Badge variant={e.customerType === "new_lead" ? "success" : "muted"}>
                              {CUSTOMER_TYPE_LABELS[e.customerType as keyof typeof CUSTOMER_TYPE_LABELS]}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {REVENUE_SOURCE_LABELS[e.source as keyof typeof REVENUE_SOURCE_LABELS]}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">{formatCurrency(e.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="produtos">
          {topProducts.length === 0 ? (
            <EmptyState title="Nenhuma venda registrada ainda" />
          ) : (
            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Produto</th>
                      <th className="px-4 py-3 text-right font-medium">Vendas</th>
                      <th className="px-4 py-3 text-right font-medium">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(p.sales)}</td>
                        <td className="px-4 py-3 text-right font-medium text-primary">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
