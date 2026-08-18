import { getReportData, getReportFormOptions } from "@/features/reports/queries";
import { PageHeader } from "@/components/shared/page-header";
import { ReportFilters } from "@/features/reports/ReportFilters";
import { MetricCard } from "@/components/shared/metric-card";
import { CategoryBarChart } from "@/components/shared/category-bar-chart";
import { DailyRevenueChart } from "@/components/shared/daily-revenue-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatMultiplier, formatNumber, formatPercent } from "@/lib/format";
import { PLATFORM_LABELS, type Platform } from "@/types/enums";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const filters = {
    period: params.period,
    from: params.from,
    to: params.to,
    attendantId: params.atendente,
    campaignId: params.campanha,
    productId: params.produto,
    platform: params.plataforma,
    source: params.origem,
  };

  const [data, options] = await Promise.all([getReportData(filters), getReportFormOptions()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Relatórios" description="Análise completa de investimento, leads, vendas e ROAS." />
      <ReportFilters options={options} />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <MetricCard label="Investimento" value={formatCurrency(data.summary.investment)} />
        <MetricCard label="Leads" value={formatNumber(data.summary.leads)} />
        <MetricCard label="Vendas" value={formatNumber(data.summary.sales)} />
        <MetricCard label="Conversão" value={formatPercent(data.summary.conversion)} />
        <MetricCard label="Faturamento" value={formatCurrency(data.summary.revenue)} accent="success" />
        <MetricCard label="Ticket médio" value={formatCurrency(data.summary.averageTicket)} />
        <MetricCard label="ROAS" value={formatMultiplier(data.summary.roas)} accent="success" />
      </section>

      <Card className="p-4">
        <p className="mb-2 text-sm font-medium">Faturamento por dia</p>
        {data.byDay.length === 0 ? <EmptyState title="Sem dados no período" /> : <DailyRevenueChart data={data.byDay} />}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <p className="mb-3 text-sm font-medium">Faturamento por atendente</p>
          {data.byAttendant.length === 0 ? <EmptyState title="Sem dados" /> : <CategoryBarChart data={data.byAttendant} />}
        </Card>
        <Card className="p-4">
          <p className="mb-3 text-sm font-medium">Faturamento por produto</p>
          {data.byProduct.length === 0 ? <EmptyState title="Sem dados" /> : <CategoryBarChart data={data.byProduct} color="var(--color-chart-3)" />}
        </Card>
        <Card className="p-4">
          <p className="mb-3 text-sm font-medium">Faturamento por campanha</p>
          {data.byCampaign.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <CategoryBarChart data={data.byCampaign.map((c) => ({ name: c.name, value: c.revenue }))} color="var(--color-chart-4)" />
          )}
        </Card>
        <Card className="p-4">
          <p className="mb-3 text-sm font-medium">ROAS por campanha</p>
          {data.byCampaign.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <CategoryBarChart data={data.byCampaign.map((c) => ({ name: c.name, value: Number(c.roas.toFixed(2)) }))} valueFormat="number" color="var(--color-chart-5)" />
          )}
        </Card>
      </div>

      <Card className="p-4">
        <p className="mb-3 text-sm font-medium">Faturamento e leads por plataforma</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.byPlatform.map((p) => (
            <div key={p.platform} className="rounded-lg border border-border p-4">
              <p className="mb-3 text-sm font-semibold">{PLATFORM_LABELS[p.platform as Platform]}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold">{formatCurrency(p.spend)}</p>
                  <p className="text-[11px] text-muted-foreground">Investimento</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(p.leads)}</p>
                  <p className="text-[11px] text-muted-foreground">Leads</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">{formatCurrency(p.revenue)}</p>
                  <p className="text-[11px] text-muted-foreground">Faturamento</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
