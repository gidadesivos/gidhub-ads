import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, startOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getRoadmapData } from "@/features/planning/queries";
import { PageHeader } from "@/components/shared/page-header";
import { CampaignFormModal } from "@/features/campaigns/CampaignFormModal";
import { CampaignCard } from "@/components/shared/campaign-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { yearMonthOf } from "@/lib/format";

export default async function RoadmapPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { months } = await getRoadmapData(params.start, 4);

  const currentStart = months[0].month;
  const prevStart = yearMonthOf(addMonths(currentStart, -1));
  const nextStart = yearMonthOf(addMonths(currentStart, 1));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roadmap de campanhas"
        description="Planejamento visual mês a mês."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/planejamento/roadmap?start=${prevStart}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href={`/planejamento/roadmap?start=${nextStart}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <CampaignFormModal />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {months.map(({ month, campaigns }) => (
          <div key={month.toISOString()} className="flex flex-col gap-3">
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {format(month, "MMMM yyyy", { locale: ptBR })}
            </p>
            <div className="flex flex-col gap-3 rounded-xl bg-muted/40 p-2.5 min-h-[200px]">
              {campaigns.length === 0 ? (
                <EmptyState title="Sem campanhas" />
              ) : (
                campaigns.map((c) => (
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
                    attendantName={c.attendant?.name}
                    creativesTotal={c.creatives.length}
                    creativesApproved={c.creatives.filter((cc) => cc.creative.status === "approved").length}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
