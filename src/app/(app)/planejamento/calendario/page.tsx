import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCalendarData } from "@/features/planning/queries";
import { CampaignCalendar } from "@/features/planning/CampaignCalendar";
import { PageHeader } from "@/components/shared/page-header";
import { CampaignFormModal } from "@/features/campaigns/CampaignFormModal";
import { Button } from "@/components/ui/button";
import { yearMonthOf } from "@/lib/format";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { month, weeks, campaigns } = await getCalendarData(params.month);

  const prevMonth = yearMonthOf(addMonths(month, -1));
  const nextMonth = yearMonthOf(addMonths(month, 1));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendário de campanhas"
        description="Visualize o período de cada campanha ao longo do mês."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/planejamento/calendario?month=${prevMonth}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span className="min-w-32 text-center text-sm font-medium capitalize">
              {format(month, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" asChild>
              <Link href={`/planejamento/calendario?month=${nextMonth}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <CampaignFormModal />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-meta" /> Meta Ads
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-google" /> Google Ads
        </span>
      </div>

      <CampaignCalendar weeks={weeks} campaigns={campaigns} currentMonth={month.getMonth()} />
    </div>
  );
}
