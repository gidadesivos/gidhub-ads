import Link from "next/link";
import { getRevenueByCampaign } from "@/features/revenue/queries";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatMultiplier, formatNumber, formatPercent } from "@/lib/format";

export default async function RevenueByCampaignPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { rows } = await getRevenueByCampaign(params.period, params.from, params.to);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Faturamento por campanha" description="Faturamento e ROAS de leads novos por campanha." actions={<DateRangeFilter />} />

      {rows.length === 0 ? (
        <EmptyState title="Nenhum lançamento vinculado a campanhas no período" />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Campanha</th>
                  <th className="px-4 py-3 font-medium">Plataforma</th>
                  <th className="px-4 py-3 text-right font-medium">Leads</th>
                  <th className="px-4 py-3 text-right font-medium">Vendas</th>
                  <th className="px-4 py-3 text-right font-medium">Conversão</th>
                  <th className="px-4 py-3 text-right font-medium">Gasto</th>
                  <th className="px-4 py-3 text-right font-medium">Faturamento</th>
                  <th className="px-4 py-3 text-right font-medium">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link href={`/campanhas/${r.id}`} className="font-medium hover:underline">
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <PlatformBadge platform={r.platform} />
                    </td>
                    <td className="px-4 py-3 text-right">{formatNumber(r.leads)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(r.sales)}</td>
                    <td className="px-4 py-3 text-right">{formatPercent(r.conversion, 1)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(r.spend)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(r.revenue)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatMultiplier(r.roas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
