import Link from "next/link";
import { getCommercialKanbanData } from "@/features/kanban/queries";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatNumber } from "@/lib/format";

export default async function CommercialKanbanPage() {
  const data = await getCommercialKanbanData();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kanban Comercial"
        description="Funil comercial com indicadores agregados do mês atual."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Card className="flex flex-col gap-3 p-4">
          <p className="text-sm font-semibold">Campanha ativa</p>
          <p className="text-2xl font-semibold">{data.campanhaAtiva.length}</p>
          <div className="flex flex-col gap-1.5">
            {data.campanhaAtiva.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma campanha rodando.</p>
            ) : (
              data.campanhaAtiva.slice(0, 5).map((c) => (
                <Link key={c.id} href={`/campanhas/${c.id}`} className="truncate text-xs text-primary hover:underline">
                  {c.name}
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <p className="text-sm font-semibold">Leads chegando</p>
          <p className="text-2xl font-semibold">{formatNumber(data.leadsChegando.total)}</p>
          <div className="flex flex-col gap-1.5">
            {data.leadsChegando.byCampaign.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{c.name}</span>
                <span className="font-medium text-foreground">{c.leads}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <p className="text-sm font-semibold">Atendimento</p>
          <p className="text-2xl font-semibold">{data.atendimento.length}</p>
          <div className="flex flex-col gap-1.5">
            {data.atendimento.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{a.name}</span>
                <span className="font-medium text-foreground">{a.leads} leads</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <p className="text-sm font-semibold">Orçamento</p>
          <p className="text-2xl font-semibold">
            {formatCurrency(data.orcamento.reduce((sum, o) => sum + o.remaining, 0))}
          </p>
          <div className="flex flex-col gap-1.5">
            {data.orcamento.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{o.name}</span>
                <span className="font-medium text-foreground">{formatCurrency(o.remaining)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <p className="text-sm font-semibold">Negociação</p>
          <p className="text-2xl font-semibold">{formatNumber(data.negociacao)}</p>
          <p className="text-xs text-muted-foreground">Leads novos ainda sem venda registrada no mês.</p>
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <p className="text-sm font-semibold">Venda</p>
          <p className="text-2xl font-semibold text-primary">{formatCurrency(data.venda.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">{formatNumber(data.venda.totalSales)} venda(s) no mês.</p>
        </Card>
      </div>

      {data.campanhaAtiva.length === 0 && (
        <EmptyState title="Nenhuma campanha ativa no momento" description="Ative uma campanha para ver o funil comercial se preencher." />
      )}
    </div>
  );
}
