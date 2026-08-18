import Link from "next/link";
import { getRevenueByAttendant } from "@/features/revenue/queries";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export default async function RevenueByAttendantPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { rows } = await getRevenueByAttendant(params.period, params.from, params.to);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Faturamento por atendente" description="Ranking de faturamento de leads novos no período." actions={<DateRangeFilter />} />

      {rows.length === 0 ? (
        <EmptyState title="Nenhum atendente cadastrado" />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Atendente</th>
                  <th className="px-4 py-3 text-right font-medium">Leads novos</th>
                  <th className="px-4 py-3 text-right font-medium">Vendas</th>
                  <th className="px-4 py-3 text-right font-medium">Conversão</th>
                  <th className="px-4 py-3 text-right font-medium">Ticket médio</th>
                  <th className="px-4 py-3 text-right font-medium">Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link href={`/atendentes/${r.id}`} className="flex items-center gap-2.5 hover:underline">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">{r.initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{r.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">{formatNumber(r.leads)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(r.sales)}</td>
                    <td className="px-4 py-3 text-right">{formatPercent(r.conversion, 1)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(r.averageTicket)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(r.revenue)}</td>
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
