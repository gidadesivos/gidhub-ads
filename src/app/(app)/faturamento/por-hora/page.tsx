import { getDailyRevenueBoard } from "@/features/revenue/queries";
import { PageHeader } from "@/components/shared/page-header";
import { DaySelector } from "@/components/shared/day-selector";
import { RevenueHourlyTable } from "@/components/shared/revenue-hourly-table";
import { RevenueHourlyChart } from "@/components/shared/revenue-hourly-chart";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { todayISODate } from "@/lib/format";

export default async function RevenueByHourPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const date = params.date || todayISODate();
  const data = await getDailyRevenueBoard(date);

  const hourlyTotals = Array.from({ length: 24 }).map((_, hour) => ({
    hour,
    value: data.matrix.reduce((sum, row) => sum + (row.cells.find((c) => c.hour === hour)?.amount ?? 0), 0),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Faturamento por hora"
        description="Distribuição do faturamento ao longo do dia, por atendente."
        actions={<DaySelector />}
      />

      <Card className="p-4">
        {hourlyTotals.every((h) => h.value === 0) ? (
          <EmptyState title="Nenhum lançamento nesta data" />
        ) : (
          <RevenueHourlyChart data={hourlyTotals} />
        )}
      </Card>

      <RevenueHourlyTable rows={data.matrix} date={date} />
    </div>
  );
}
