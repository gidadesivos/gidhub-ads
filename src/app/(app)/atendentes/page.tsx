import Link from "next/link";
import { Trophy } from "lucide-react";
import { listAttendantsWithStats } from "@/features/attendants/queries";
import { AttendantFormModal } from "@/features/attendants/AttendantFormModal";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CapacityBadge } from "@/components/shared/capacity-badge";
import { ProgressMetric } from "@/components/shared/progress-metric";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { ATTENDANT_STATUS_LABELS } from "@/types/enums";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function AttendantsPage() {
  const attendants = await listAttendantsWithStats();
  const ranking = [...attendants].sort((a, b) => b.revenueThisMonth - a.revenueThisMonth).slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Atendentes"
        description="Equipe comercial responsável pelo atendimento dos leads."
        actions={<AttendantFormModal />}
      />

      {ranking.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Ranking de faturamento — mês atual</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {ranking.map((a, i) => (
              <Link
                key={a.id}
                href={`/atendentes/${a.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center">{MEDALS[i] ?? `${i + 1}º`}</span>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px]">{a.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{a.name}</span>
                </div>
                <span className="font-semibold text-primary">{formatCurrency(a.revenueThisMonth)}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {attendants.length === 0 ? (
        <EmptyState title="Nenhum atendente cadastrado" description="Cadastre o primeiro atendente da equipe." action={<AttendantFormModal />} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attendants.map((a) => (
            <Link key={a.id} href={`/atendentes/${a.id}`}>
              <Card className="flex h-full flex-col gap-3.5 p-4 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{a.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-tight">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{ATTENDANT_STATUS_LABELS[a.status as keyof typeof ATTENDANT_STATUS_LABELS] ?? a.status}</p>
                    </div>
                  </div>
                  <CapacityBadge level={a.capacity} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-base font-semibold">{formatNumber(a.leadsThisMonth)}</p>
                    <p className="text-[11px] text-muted-foreground">Leads/mês</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold">{formatNumber(a.salesThisMonth)}</p>
                    <p className="text-[11px] text-muted-foreground">Vendas</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold">{formatPercent(a.conversion, 1)}</p>
                    <p className="text-[11px] text-muted-foreground">Conversão</p>
                  </div>
                </div>

                <ProgressMetric
                  label="Meta mensal"
                  percent={a.monthlyProgress}
                  currentLabel={formatCurrency(a.revenueThisMonth)}
                  goalLabel={formatCurrency(a.monthlyGoal)}
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{a.activeCampaigns} campanhas ativas</span>
                  <Badge variant="outline">{a.leadCapacity} leads/mês cap.</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
