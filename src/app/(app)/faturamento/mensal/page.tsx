import { getMonthlyRevenue } from "@/features/revenue/queries";
import { PageHeader } from "@/components/shared/page-header";
import { MonthSelector } from "@/components/shared/month-selector";
import { MonthlyRevenueChart } from "@/components/shared/monthly-revenue-chart";
import { ProgressMetric } from "@/components/shared/progress-metric";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

export default async function MonthlyRevenuePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const data = await getMonthlyRevenue(params.month);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Faturamento mensal"
        description={`Panorama de ${formatDate(data.month, "MMMM yyyy")}`}
        actions={<MonthSelector />}
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <MetricCard label="Faturamento leads novos" value={formatCurrency(data.revenue)} accent="success" />
        <MetricCard label="Vendas" value={formatNumber(data.sales)} />
      </section>

      <Card className="p-4">
        <p className="mb-2 text-sm font-medium">Faturamento diário</p>
        <MonthlyRevenueChart data={data.dailySeries} />
      </Card>

      <section>
        <p className="mb-3 text-sm font-medium">Progresso da meta mensal por atendente</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.attendantRows.map((a) => (
            <Card key={a.id} className="p-4">
              <p className="mb-3 text-sm font-medium">{a.name}</p>
              <ProgressMetric
                label="Meta mensal"
                percent={a.progress}
                currentLabel={formatCurrency(a.revenue)}
                goalLabel={formatCurrency(a.goal)}
              />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
