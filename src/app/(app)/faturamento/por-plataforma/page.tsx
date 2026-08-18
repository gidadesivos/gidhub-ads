import { getRevenueByPlatform } from "@/features/revenue/queries";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatMultiplier, formatNumber, formatPercent } from "@/lib/format";
import { PLATFORM_LABELS, type Platform } from "@/types/enums";

export default async function RevenueByPlatformPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { rows } = await getRevenueByPlatform(params.period, params.from, params.to);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Faturamento por plataforma" description="Comparativo entre Meta Ads e Google Ads." actions={<DateRangeFilter />} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((r) => (
          <Card key={r.platform} className="p-5">
            <div className="mb-4">
              <PlatformBadge platform={r.platform} className="text-sm" />
              <p className="mt-1 text-xs text-muted-foreground">{PLATFORM_LABELS[r.platform as Platform]}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Investimento" value={formatCurrency(r.spend)} />
              <MetricCard label="Campanhas ativas" value={formatNumber(r.activeCampaigns)} />
              <MetricCard label="Faturamento leads novos" value={formatCurrency(r.revenue)} accent="success" />
              <MetricCard label="Leads novos" value={formatNumber(r.leads)} />
              <MetricCard label="Vendas" value={formatNumber(r.sales)} />
              <MetricCard label="Conversão" value={formatPercent(r.conversion)} />
              <MetricCard label="ROAS" value={formatMultiplier(r.roas)} accent="success" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
