import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Users, Clapperboard, MessageSquareText } from "lucide-react";
import { getCampaignDetail } from "@/features/campaigns/queries";
import { deleteCampaign } from "@/features/campaigns/actions";
import { CampaignFormModal } from "@/features/campaigns/CampaignFormModal";
import { CampaignStatusSelect } from "@/features/campaigns/CampaignStatusSelect";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { MetricCard } from "@/components/shared/metric-card";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { CreativeStatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate, formatMultiplier, formatNumber, formatPercent } from "@/lib/format";
import { OBJECTIVE_LABELS, DESTINATION_CHANNEL_LABELS, type Objective, type DestinationChannel } from "@/types/enums";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCampaignDetail(id);
  if (!data) notFound();
  const { campaign, stats } = data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={campaign.name}
        description={`${OBJECTIVE_LABELS[campaign.objective as Objective]} · ${formatDate(campaign.startDate)} → ${formatDate(campaign.endDate)}`}
        actions={
          <div className="flex items-center gap-2">
            <CampaignFormModal
              mode="edit"
              initial={{
                id: campaign.id,
                name: campaign.name,
                productId: campaign.productId,
                platform: campaign.platform,
                objective: campaign.objective,
                status: campaign.status,
                startDate: campaign.startDate,
                endDate: campaign.endDate,
                plannedBudget: campaign.plannedBudget,
                actualSpend: campaign.actualSpend,
                attendantId: campaign.attendantId,
                backupAttendantId: campaign.backupAttendantId,
                landingPageId: campaign.landingPageId,
                offerId: campaign.offerId,
                destinationChannel: campaign.destinationChannel,
                notes: campaign.notes,
                audienceIds: campaign.audiences.map((a) => a.audienceId),
                creativeIds: campaign.creatives.map((c) => c.creativeId),
              }}
            />
            <ConfirmDeleteButton
              title="Excluir campanha"
              description="Campanhas com lançamentos de faturamento não podem ser excluídas."
              onConfirm={deleteCampaign.bind(null, id)}
              redirectTo="/campanhas"
            />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <PlatformBadge platform={campaign.platform} />
        <CampaignStatusSelect id={campaign.id} status={campaign.status} />
        {campaign.destinationChannel && (
          <Badge variant="outline">{DESTINATION_CHANNEL_LABELS[campaign.destinationChannel as DestinationChannel]}</Badge>
        )}
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="Orçamento" value={formatCurrency(campaign.plannedBudget)} />
        <MetricCard label="Gasto" value={formatCurrency(campaign.actualSpend)} />
        <MetricCard label="Leads novos" value={formatNumber(stats.leads)} />
        <MetricCard label="Vendas" value={formatNumber(stats.sales)} />
        <MetricCard label="Faturamento leads novos" value={formatCurrency(stats.revenue)} accent="success" />
        <MetricCard label="Ticket médio" value={formatCurrency(stats.averageTicket)} />
        <MetricCard label="Conversão" value={formatPercent(stats.conversion)} />
        <MetricCard label="ROAS" value={formatMultiplier(stats.roas)} accent="success" />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
            <Users className="h-4 w-4" /> Público
          </p>
          {campaign.audiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum público vinculado.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {campaign.audiences.map((a) => (
                <Badge key={a.audienceId} variant="outline">
                  {a.audience.name}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <p className="mb-3 text-sm font-medium">Atendimento</p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">{campaign.attendant?.initials ?? "--"}</AvatarFallback>
              </Avatar>
              {campaign.attendant ? (
                <Link href={`/atendentes/${campaign.attendant.id}`} className="hover:underline">
                  {campaign.attendant.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Sem atendente definido</span>
              )}
            </div>
            {campaign.backupAttendant && (
              <p className="text-xs text-muted-foreground">Reserva: {campaign.backupAttendant.name}</p>
            )}
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
            <Clapperboard className="h-4 w-4" /> Criativos
          </p>
          {campaign.creatives.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum criativo vinculado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {campaign.creatives.map((c) => (
                <div key={c.creativeId} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>{c.creative.name}</span>
                  <div className="flex items-center gap-2">
                    <CreativeStatusBadge status={c.creative.status} />
                    {c.creative.driveUrl && (
                      <a href={c.creative.driveUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {campaign.offer && (
          <Card className="p-4">
            <p className="mb-2 text-sm font-medium">Oferta</p>
            <p className="text-sm">{campaign.offer.name}</p>
            {campaign.offer.description && <p className="mt-1 text-xs text-muted-foreground">{campaign.offer.description}</p>}
          </Card>
        )}

        {campaign.landingPage && (
          <Card className="p-4">
            <p className="mb-2 text-sm font-medium">Landing Page</p>
            <p className="text-sm">{campaign.landingPage.name}</p>
            <a
              href={campaign.landingPage.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Abrir página <ExternalLink className="h-3 w-3" />
            </a>
          </Card>
        )}

        {campaign.notes && (
          <Card className="p-4 lg:col-span-2">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <MessageSquareText className="h-4 w-4" /> Observações
            </p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{campaign.notes}</p>
          </Card>
        )}
      </div>

      <section>
        <p className="mb-3 text-sm font-medium">Lançamentos de faturamento</p>
        {data.revenueEntries.length === 0 ? (
          <EmptyState title="Nenhum lançamento vinculado a esta campanha ainda" />
        ) : (
          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenueEntries.slice(0, 20).map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-4 py-3">{formatDate(e.date)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
