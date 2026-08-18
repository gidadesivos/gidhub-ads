import { getDailyRevenueBoard } from "@/features/revenue/queries";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { ProgressMetric } from "@/components/shared/progress-metric";
import { RevenueHourlyTable } from "@/components/shared/revenue-hourly-table";
import { DaySelector } from "@/components/shared/day-selector";
import { RevenueEntryModal } from "@/features/revenue/RevenueEntryModal";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent, todayISODate } from "@/lib/format";

export default async function RevenueTodayPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const date = params.date || todayISODate();
  const data = await getDailyRevenueBoard(date);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Faturamento — Hoje"
        description="Acompanhamento diário do faturamento de leads novos."
        actions={
          <div className="flex items-center gap-2">
            <DaySelector />
            <RevenueEntryModal />
          </div>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Meta do dia" value={formatCurrency(data.metrics.goal)} />
        <MetricCard label="Faturamento atual" value={formatCurrency(data.metrics.revenue)} accent="success" />
        <MetricCard label="Leads novos" value={formatNumber(data.metrics.leads)} />
        <MetricCard label="Vendas" value={formatNumber(data.metrics.sales)} />
        <MetricCard label="Ticket médio" value={formatCurrency(data.metrics.averageTicket)} />
        <MetricCard label="Conversão" value={formatPercent(data.metrics.conversion)} />
      </section>

      <Card className="p-4">
        <ProgressMetric
          label="Percentual da meta"
          percent={data.metrics.progress}
          currentLabel={formatCurrency(data.metrics.revenue)}
          goalLabel={formatCurrency(data.metrics.goal)}
        />
      </Card>

      <section>
        <p className="mb-3 text-sm font-medium">Faturamento por hora e atendente</p>
        <RevenueHourlyTable rows={data.matrix} date={date} />
      </section>
    </div>
  );
}
